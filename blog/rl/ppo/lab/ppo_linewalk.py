"""An inspectable PPO-Clip experiment for the accompanying notes.

Python 3.10+; install numpy and torch. CPU only; no Gym dependency.
  python ppo_linewalk.py --check
  python ppo_linewalk.py --seeds 0 1 2 --updates 80 --output results.json

LineWalk: six positions, start at 0, left/right actions. Reaching 5 ends
the task (+1); other transitions pay -0.01. A collector resets unfinished
episodes after 12 steps (external truncation, with value bootstrapping).
Evaluation reports reward earned within the same 12-step observation window.
"""
import argparse
import json
import platform
from pathlib import Path

import numpy as np
import torch
from torch import nn
from torch.distributions import Categorical


class LineWalk:
    def __init__(self, count):
        self.pos = np.zeros(count, dtype=np.int64)
        self.age = np.zeros(count, dtype=np.int64)

    def obs(self):
        return torch.from_numpy(np.eye(6, dtype=np.float32)[self.pos])

    def step(self, actions):
        self.pos = np.clip(self.pos + 2 * actions - 1, 0, 5)
        self.age += 1
        terminated = self.pos == 5
        truncated = (self.age >= 12) & ~terminated
        reward = np.where(terminated, 1.0, -0.01).astype(np.float32)
        # Capture the actual successor BEFORE resetting any environment.
        successor = self.obs()
        ended = terminated | truncated
        self.pos[ended] = 0
        self.age[ended] = 0
        return (torch.from_numpy(reward), successor,
                torch.from_numpy(terminated), torch.from_numpy(truncated))


class ActorCritic(nn.Module):
    def __init__(self):
        super().__init__()
        self.body = nn.Sequential(nn.Linear(6, 32), nn.Tanh())
        self.actor = nn.Linear(32, 2)
        self.critic = nn.Linear(32, 1)
        nn.init.orthogonal_(self.actor.weight, gain=0.01)
        nn.init.zeros_(self.actor.bias)

    def forward(self, obs):
        features = self.body(obs)
        return Categorical(logits=self.actor(features)), self.critic(features).squeeze(-1)


@torch.no_grad()
def gae(rewards, values, next_values, terminated, truncated, gamma=0.99, lam=0.95):
    """All arrays are [time, environment]; no trace across a reset/segment end."""
    deltas = rewards + gamma * (~terminated).float() * next_values - values
    advantages = torch.zeros_like(rewards)
    carry = torch.zeros_like(rewards[0])
    for t in reversed(range(len(rewards))):
        carry = deltas[t] + gamma * lam * (~(terminated[t] | truncated[t])).float() * carry
        advantages[t] = carry
    return advantages, advantages + values


def clipped_objective(log_ratio, advantage, epsilon=0.2):
    ratio = log_ratio.exp()
    return torch.minimum(ratio * advantage, ratio.clamp(1 - epsilon, 1 + epsilon) * advantage)


@torch.no_grad()
def evaluate(model, episodes=512, seed=12345):
    """Stochastic-policy evaluation with its own RNG, isolated from training."""
    rng = np.random.default_rng(seed)
    env = LineWalk(episodes)
    total = np.zeros(episodes)
    alive = np.ones(episodes, dtype=bool)
    success = np.zeros(episodes, dtype=bool)
    for _ in range(12):
        probs = (np.full(episodes, 0.5) if model is None
                 else model(env.obs())[0].probs[:, 1].numpy())
        actions = (rng.random(episodes) < probs).astype(np.int64)
        reward, _, terminal, timeout = env.step(actions)
        total += alive * reward.numpy()
        success |= alive & terminal.numpy()
        alive &= ~(terminal.numpy() | timeout.numpy())
    return {'success_rate': float(success.mean()), 'mean_return': float(total.mean())}


def train(seed, updates):
    torch.manual_seed(seed)
    model = ActorCritic()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.003, eps=1e-5)
    env = LineWalk(32)
    curve = [{'update': 0, 'transitions': 0, **evaluate(model)}]
    for update in range(1, updates + 1):
        buffer = {k: [] for k in ('obs', 'action', 'logp', 'value', 'reward', 'next_value', 'terminal', 'timeout')}
        with torch.no_grad():
            for _ in range(16):
                obs = env.obs()
                dist, value = model(obs)
                action = dist.sample()
                reward, successor, terminal, timeout = env.step(action.numpy())
                _, next_value = model(successor)
                row = (obs, action, dist.log_prob(action), value, reward, next_value, terminal, timeout)
                for key, item in zip(buffer, row):
                    buffer[key].append(item)
        buffer = {k: torch.stack(v) for k, v in buffer.items()}
        advantage, target = gae(buffer['reward'], buffer['value'], buffer['next_value'],
                                buffer['terminal'], buffer['timeout'])
        # Freeze BOTH the value targets and raw advantages before any optimization.
        target = target.flatten()
        advantage = advantage.flatten()
        advantage = (advantage - advantage.mean()) / (advantage.std(unbiased=False) + 1e-8)
        obs = buffer['obs'].flatten(0, 1)
        action = buffer['action'].flatten()
        old_logp = buffer['logp'].flatten()
        stopped = False
        for _ in range(4):
            for ids in torch.randperm(512).split(128):
                dist, value = model(obs[ids])
                log_ratio = dist.log_prob(action[ids]) - old_logp[ids]
                actor_loss = -clipped_objective(log_ratio, advantage[ids]).mean()
                value_loss = 0.5 * (value - target[ids]).square().mean()
                loss = actor_loss + 0.5 * value_loss - 0.01 * dist.entropy().mean()
                optimizer.zero_grad(set_to_none=True)
                loss.backward()
                nn.utils.clip_grad_norm_(model.parameters(), 0.5)
                optimizer.step()
                # Check the entire fixed rollout AFTER the step; an overshoot can occur.
                with torch.no_grad():
                    whole_ratio = model(obs)[0].log_prob(action) - old_logp
                    approx_kl = (whole_ratio.exp() - 1 - whole_ratio).mean().item()
                if approx_kl > 0.03:
                    stopped = True
                    break
            if stopped:
                break
        if update % 10 == 0 or update == updates:
            point = {'update': update, 'transitions': update * 512, **evaluate(model),
                     'approx_kl': approx_kl, 'early_stop': stopped}
            curve.append(point)
    return {'seed': seed, 'curve': curve}


def check():
    # Positive/negative advantages plateau only on their beneficial side.
    for ratio, adv, expected, slope in [(1.5, 2., 2.4, 0.), (.5, 2., 1., 2.),
                                        (.5, -2., -1.6, 0.), (1.5, -2., -3., -2.)]:
        x = torch.tensor(ratio, requires_grad=True)
        y = clipped_objective(x.log(), torch.tensor(adv))
        y.backward()
        assert abs(y.item() - expected) < 1e-6
        assert abs(x.grad.item() - slope) < 1e-6
    # The bootstrap value survives an external timeout but NOT a true terminal.
    r = torch.tensor([[1.], [2.], [3.]])
    v = torch.tensor([[.5], [.6], [.7]], requires_grad=True)
    nv = torch.tensor([[.6], [.7], [4.]])
    no = torch.zeros(3, 1, dtype=torch.bool)
    term = no.clone(); term[-1] = True
    timeout = no.clone(); timeout[-1] = True
    a, ret = gae(r, v, nv, term, no, .9, .8)
    torch.testing.assert_close(a.flatten(), torch.tensor([3.69392, 3.686, 2.3]))
    assert not a.requires_grad and not ret.requires_grad
    at, _ = gae(r, v, nv, no, timeout, .9, .8)
    assert abs(at[-1].item() - 5.9) < 1e-6
    # A reset in the middle must not carry a later episode's residual backward.
    timeout[0] = True
    broken, _ = gae(r, v, nv, no, timeout, .9, .8)
    assert abs(broken[0].item() - 1.04) < 1e-6
    # Compare the backward recurrence to a direct residual expansion.
    delta = r + .9 * (~term).float() * nv - v.detach()
    direct = torch.stack([sum((.9 * .8) ** (j - t) * delta[j] for j in range(t, 3)) for t in range(3)])
    torch.testing.assert_close(a, direct)
    model = ActorCritic(); obs = torch.eye(6)
    dist, _ = model(obs); actions = torch.tensor([0, 1, 0, 1, 0, 1])
    old_logp = dist.log_prob(actions).detach()
    torch.testing.assert_close((model(obs)[0].log_prob(actions) - old_logp).exp(), torch.ones(6))
    env = LineWalk(1); env.pos[0] = 3; env.age[0] = 11
    _, final, terminal, timeout = env.step(np.array([1]))
    assert final.argmax().item() == 4 and env.obs().argmax().item() == 0
    assert timeout.item() and not terminal.item()
    # An action-independent baseline leaves the expected bandit gradient unchanged.
    p = .3; rewards = [1., 3.]; scores = [-p, 1-p]
    for b in (0., 1.6, 10.):
        g = sum(prob * (reward - b) * score for prob, reward, score in zip([1-p, p], rewards, scores))
        assert abs(g - .42) < 1e-12
    print('PASS: clipping values/gradients, GAE expansion, two boundary masks, frozen targets, initial ratios, final observations, baseline invariance.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--seeds', type=int, nargs='+', default=[0, 1, 2])
    parser.add_argument('--updates', type=int, default=80)
    parser.add_argument('--output', type=Path, default=Path('results.json'))
    args = parser.parse_args()
    if args.updates < 1:
        parser.error('--updates must be positive')
    torch.set_num_threads(1)
    if args.check:
        check()
        return
    result = {'experiment': 'LineWalk PPO-Clip; stochastic 512-episode evaluation, seed 12345',
              'python': platform.python_version(), 'torch': torch.__version__, 'numpy': np.__version__,
              'device': 'cpu', 'config': {'environments': 32, 'rollout_steps': 16, 'epochs': 4,
              'minibatch': 128, 'learning_rate': .003, 'gamma': .99, 'lambda': .95, 'clip': .2,
              'value_coefficient': .5, 'entropy_coefficient': .01, 'max_grad_norm': .5, 'target_kl': .03},
              'random_baseline': evaluate(None), 'runs': []}
    for seed in args.seeds:
        run = train(seed, args.updates)
        result['runs'].append(run)
        print(seed, run['curve'][-1], flush=True)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2) + '\n')


if __name__ == '__main__':
    main()
