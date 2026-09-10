"""DPO math checks and an exactly inspectable finite-response experiment.

Python 3.10+ and PyTorch. CPU only; no downloaded model or dataset.
    python dpo_lab.py --check
    python dpo_lab.py --train --seeds 0 1 2 --output results.json

Training uses three prompts, three possible whole responses per prompt, and
500 independent synthetic judgments for each unordered response pair. Counts
compress those binary labels exactly; they are not label smoothing. The known
reward defines the label-generating Bradley-Terry probabilities and provides
an exact population evaluation, separate from empirical training loss.
"""
import argparse
import json
import math
import platform
from pathlib import Path

import torch
from torch.nn import functional as F


def dpo_loss(chosen_logp, rejected_logp, ref_chosen_logp, ref_rejected_logp, beta):
    """One loss per preference pair; every input is [batch], in natural logs."""
    if beta <= 0:
        raise ValueError('beta must be positive')
    if chosen_logp.ndim != 1 or not (chosen_logp.shape == rejected_logp.shape == ref_chosen_logp.shape == ref_rejected_logp.shape):
        raise ValueError('log probabilities must all have the same [batch] shape')
    gain_chosen = chosen_logp - ref_chosen_logp.detach()
    gain_rejected = rejected_logp - ref_rejected_logp.detach()
    margin = beta * (gain_chosen - gain_rejected)
    return F.softplus(-margin)


def response_logps(logits, input_ids, response_mask, attention_mask):
    """Reduce causal model outputs to whole-response log probabilities.

    logits: [batch, length, vocabulary]; the output at j predicts token j+1.
    IDs and masks: [batch, length]. response_mask selects actual response
    tokens (including EOS when intended), not prediction positions. It must
    exclude the first token, and every row must retain at least one response
    token. Pass attention_mask to the MODEL forward as well as this reducer.
    The caller supplies a causal model; this function cannot make logits causal.
    """
    if logits.shape[:2] != input_ids.shape or not (input_ids.shape == response_mask.shape == attention_mask.shape):
        raise ValueError('incompatible batch/length shapes')
    if response_mask[:, 0].any():
        raise ValueError('a response needs a preceding conditioning token')
    if (response_mask.bool() & ~attention_mask.bool()).any():
        raise ValueError('response positions cannot be padding')
    keep = response_mask[:, 1:].bool() & attention_mask[:, 1:].bool()
    if not keep.any(dim=1).all():
        raise ValueError('each example must contain a scored response token')
    # Preserve float64 math tests, and upcast low-precision model logits.
    scores = logits[:, :-1]
    if scores.dtype in (torch.float16, torch.bfloat16):
        scores = scores.float()
    token_logp = scores.log_softmax(-1).gather(-1, input_ids[:, 1:, None]).squeeze(-1)
    return token_logp.masked_fill(~keep, 0).sum(-1)


def optimal_policy(reference, reward, beta):
    return (reference.log() + reward / beta).softmax(-1)


def objective(policy, reference, reward, beta):
    return (policy * reward).sum(-1) - beta * (policy * (policy.log() - reference.log())).sum(-1)


def check():
    dtype = torch.float64
    chosen = torch.tensor([-4.], dtype=dtype, requires_grad=True)
    rejected = torch.tensor([-7.], dtype=dtype, requires_grad=True)
    rc = torch.tensor([-6.], dtype=dtype, requires_grad=True)
    rr = torch.tensor([-6.], dtype=dtype, requires_grad=True)
    loss = dpo_loss(chosen, rejected, rc, rr, .2).sum()
    assert abs(loss.item() - math.log1p(math.exp(-.6))) < 1e-12
    loss.backward()
    weight = .2 / (1 + math.exp(.6))
    assert abs(chosen.grad.item() + weight) < 1e-12
    assert abs(rejected.grad.item() - weight) < 1e-12
    assert rc.grad is None and rr.grad is None
    base = torch.tensor([-3., -7.], dtype=dtype)
    torch.testing.assert_close(dpo_loss(base, base-1, base, base-1, .2), torch.full((2,), math.log(2), dtype=dtype))
    # Stable even for a badly misclassified example.
    assert torch.isfinite(dpo_loss(torch.tensor([-1000.]), torch.tensor([0.]), torch.tensor([0.]), torch.tensor([0.]), 1.)).all()
    ref = torch.tensor([[.5, .3, .2]], dtype=dtype)
    reward = torch.tensor([[0., 1., -.5]], dtype=dtype)
    beta = .7; optimum = optimal_policy(ref, reward, beta)
    shifted = optimal_policy(ref, reward + 17, beta)
    torch.testing.assert_close(optimum, shifted)
    candidate = torch.tensor([[.2, .4, .4]], dtype=dtype)
    log_z = (ref.log() + reward/beta).logsumexp(-1)
    kl = (candidate * (candidate.log() - optimum.log())).sum(-1)
    torch.testing.assert_close(objective(candidate, ref, reward, beta), beta*log_z-beta*kl)
    assert (objective(optimum, ref, reward, beta) >= objective(candidate, ref, reward, beta)).all()
    # Two distributions have identical observed A:B odds but different C mass.
    p1 = torch.tensor([.3, .2, .5], dtype=dtype)
    p2 = torch.tensor([.12, .08, .8], dtype=dtype)
    zero = torch.zeros(1, dtype=dtype)
    l1 = dpo_loss(p1[0:1].log(), p1[1:2].log(), zero, zero, 1.)
    l2 = dpo_loss(p2[0:1].log(), p2[1:2].log(), zero, zero, 1.)
    torch.testing.assert_close(l1, l2)
    # A different policy improves A:B odds even as absolute P(A) falls.
    p3 = torch.tensor([.15, .05, .8], dtype=dtype)
    assert dpo_loss(p3[0:1].log(), p3[1:2].log(), zero, zero, 1.) < l1
    # An autoregressive log-probability reducer: score only the response + EOS.
    logits = torch.tensor([[[0.,1.,2.], [1.,0.,2.], [2.,1.,0.], [0.,2.,1.], [1.,2.,0.]]], dtype=dtype, requires_grad=True)
    ids = torch.tensor([[0,1,2,1,0]])
    mask = torch.tensor([[0,0,1,1,0]], dtype=torch.bool)
    attention = torch.tensor([[1,1,1,1,0]], dtype=torch.bool)
    got = response_logps(logits, ids, mask, attention)
    expected = logits[0,1].log_softmax(-1)[2] + logits[0,2].log_softmax(-1)[1]
    torch.testing.assert_close(got[0], expected)
    got.sum().backward()
    assert logits.grad[0,0].abs().sum() == 0
    assert logits.grad[0,3:].abs().sum() == 0
    assert logits.grad[0,1:3].abs().sum() > 0
    changed = logits.detach().clone(); changed[0,0] *= 10; changed[0,3:] *= -7
    torch.testing.assert_close(response_logps(changed, ids, mask, attention), got.detach())
    padded_logits = torch.cat([logits.detach(), torch.zeros(1,2,3,dtype=dtype)],dim=1)
    torch.testing.assert_close(response_logps(padded_logits, F.pad(ids,(0,2)), F.pad(mask,(0,2)), F.pad(attention,(0,2))), got.detach())
    try:
        response_logps(logits, ids, torch.zeros_like(mask), attention)
    except ValueError:
        pass
    else:
        raise AssertionError('empty responses must be rejected')
    # Count-compressed binary preference rows equal the expanded pair loss.
    m = torch.tensor(.6, dtype=dtype)
    expanded = (7*F.softplus(-m)+3*F.softplus(m))/10
    torch.testing.assert_close(expanded,F.binary_cross_entropy_with_logits(m,torch.tensor(.7,dtype=dtype)))
    print('PASS: numerical loss and gradients, fixed reference, initialization, stable extreme margin, KL identity, reward-shift invariance, coverage ambiguity, chosen-probability counterexample, causal shift, response masking, padding invariance, empty-response rejection, and compressed labels.')


def train(seed, steps=400, judgments=500, beta=.7):
    reference = torch.tensor([[.5, .3, .2], [.2, .5, .3], [.4, .4, .2]], dtype=torch.float64)
    reward = torch.tensor([[0., 1., -.5], [1., 0., .5], [-.5, .25, 1.]], dtype=torch.float64)
    target = optimal_policy(reference, reward, beta)

    # Enumerate A:B, A:C, B:C for each prompt. Each type gets equal weight.
    prompt = torch.arange(3).repeat_interleave(3)
    left = torch.tensor([0, 0, 1] * 3)
    right = torch.tensor([1, 2, 2] * 3)
    true_preference = torch.sigmoid(reward[prompt, left] - reward[prompt, right])
    rng = torch.Generator().manual_seed(seed)
    draws = torch.rand(9, judgments, generator=rng, dtype=torch.float64)
    wins = (draws < true_preference[:, None]).sum(-1)
    empirical = wins.double() / judgments

    # Parameters are whole-response logits, initialized to the reference policy.
    logits = torch.nn.Parameter(reference.log().clone())
    optimizer = torch.optim.Adam([logits], lr=.05)
    curve = []
    for step in range(steps + 1):
        logp = logits.log_softmax(-1)
        gain = logp - reference.log()
        margin = beta * (gain[prompt, left] - gain[prompt, right])
        loss = F.binary_cross_entropy_with_logits(margin, empirical)

        # Record before updating: checkpoint k describes exactly k Adam steps.
        if step % 20 == 0 or step == steps:
            with torch.no_grad():
                probs = logp.exp()
                curve.append({
                    'step': step,
                    'training_loss': loss.item(),
                    'population_loss': F.binary_cross_entropy_with_logits(margin, true_preference).item(),
                    'kl_to_population_optimum': (probs * (logp - target.log())).sum(-1).mean().item(),
                    'kl_to_reference': (probs * (logp - reference.log())).sum(-1).mean().item(),
                    'expected_reward': (probs * reward).sum(-1).mean().item(),
                    'regularized_objective': objective(probs, reference, reward, beta).mean().item(),
                })
        if step == steps:
            break
        optimizer.zero_grad(set_to_none=True)
        loss.backward()
        optimizer.step()

    run = {
        'seed': seed,
        'left_win_counts': wins.tolist(),
        'policy': logits.softmax(-1).detach().tolist(),
        'curve': curve,
    }
    return run, reference, reward, target


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--train', action='store_true')
    parser.add_argument('--seeds', type=int, nargs='+', default=[0, 1, 2])
    parser.add_argument('--output', type=Path, default=Path('results.json'))
    args = parser.parse_args()
    torch.set_num_threads(1)
    if not args.check and not args.train:
        parser.error('choose --check or --train')
    if args.check:
        check()
    if args.train:
        result = {
            'experiment': 'Finite-response DPO with synthetic Bradley-Terry judgments',
            'python': platform.python_version(), 'torch': torch.__version__,
            'device': 'cpu', 'dtype': 'float64', 'beta': .7,
            'optimizer': 'Adam, learning rate 0.05', 'steps': 400,
            'prompts': 3, 'responses_per_prompt': 3,
            'judgments_per_unordered_pair': 500, 'judgments_per_seed': 4500,
            'runs': [],
        }
        for seed in args.seeds:
            run, ref, reward, target = train(seed)
            result['runs'].append(run)
            print(seed, run['curve'][-1], flush=True)
        result.update({
            'reference': ref.tolist(), 'true_reward': reward.tolist(),
            'population_optimum': target.tolist(),
            'optimal_regularized_objective': objective(target, ref, reward, .7).mean().item(),
        })
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2) + '\n')


if __name__ == '__main__':
    main()
