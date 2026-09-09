#!/usr/bin/env python3
"""Teaching lab: exact two-token oracle and a tiny masked diffusion transformer.

python tiny_diffusion.py --oracle-only          # standard library only
python -m pip install torch numpy              # neural lab dependencies
python tiny_diffusion.py --steps 800 --seed 7   # CPU experiment, no downloads

This is a fixed-length synthetic language, not a pretrained natural-language LLM.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
import itertools
import json
from pathlib import Path


def oracle_distribution(intervals):
    """Exact propagation of independent-coordinate reverse kernels on RR / BB."""
    if intervals < 1:
        raise ValueError("intervals must be positive")
    mask = -1
    dist = {(mask, mask): 1.0}
    for k in range(intervals, 0, -1):
        reveal = 1.0 / k  # (t - s) / t on a uniform grid
        new = defaultdict(float)
        for state, mass in dist.items():
            visible = [v for v in state if v != mask]
            posterior = {visible[0]: 1.0} if visible else {0: 0.5, 1: 0.5}
            choices = []
            for token in state:
                if token != mask:
                    choices.append({token: 1.0})
                else:
                    choices.append({mask: 1.0 - reveal,
                                    **{v: reveal * p for v, p in posterior.items()}})
            for pair in itertools.product(*(c.items() for c in choices)):
                dest = tuple(v for v, _ in pair)
                prob = mass * pair[0][1] * pair[1][1]
                if prob:
                    new[dest] += prob
        dist = dict(new)
        assert abs(sum(dist.values()) - 1.0) < 1e-10
    assert all(mask not in state for state in dist)
    return dist


def run_oracle():
    rows = []
    for intervals in (1, 2, 4, 8, 16, 32):
        dist = oracle_distribution(intervals)
        invalid = sum(p for (a, b), p in dist.items() if a != b)
        expected = 1.0 / (2 * intervals)
        assert abs(invalid - expected) < 1e-10
        rows.append({"intervals": intervals, "invalid_probability": invalid})
    return rows


def neural_lab(steps, samples, seed):
    import torch
    from torch import nn
    from torch.nn import functional as F

    torch.manual_seed(seed)
    torch.set_num_threads(2)
    vocab = ["red", "blue", "cat", "dog", "runs", "rests"]
    mask_id, length = len(vocab), 6

    def data(batch):
        first = torch.randint(2, (batch, 3)) + torch.tensor([0, 2, 4])
        return torch.cat([first, first], dim=1)

    class Denoiser(nn.Module):
        def __init__(self):
            super().__init__()
            self.token = nn.Embedding(mask_id + 1, 64)
            self.position = nn.Embedding(length, 64)
            # Independent layers, fully bidirectional attention, no dropout.
            self.layers = nn.ModuleList([
                nn.TransformerEncoderLayer(64, 4, 128, dropout=0.0,
                                           batch_first=True, norm_first=True)
                for _ in range(2)
            ])
            self.norm = nn.LayerNorm(64)
            self.head = nn.Linear(64, mask_id)  # mask is not a clean output

        def forward(self, x):
            h = self.token(x) + self.position(torch.arange(length))
            for layer in self.layers:
                h = layer(h)
            return self.head(self.norm(h))

    model = Denoiser()
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)
    history = []
    model.train()
    for step in range(steps):
        x0 = data(64)
        t = torch.rand(64, 1)
        target = torch.randint(length, (64,))
        rows = torch.arange(64)
        masked = torch.rand(64, length) < t
        masked[rows, target] = True
        xt = x0.masked_fill(masked, mask_id)
        loss = F.cross_entropy(model(xt)[rows, target], x0[rows, target])
        assert torch.isfinite(loss)
        optimizer.zero_grad(set_to_none=True)
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        if step == 0 or (step + 1) % 100 == 0 or step == steps - 1:
            history.append({"step": step + 1, "loss": round(loss.item(), 6)})

    @torch.no_grad()
    def sample(batch, intervals, fixed=None):
        x = torch.full((batch, length), mask_id, dtype=torch.long)
        if fixed is not None:
            x[:, 0] = fixed
        for k in range(intervals, 0, -1):
            masked = x == mask_id
            probs = model(x).softmax(-1)
            proposal = torch.multinomial(probs.reshape(-1, mask_id), 1)
            proposal = proposal.reshape(batch, length)
            reveal = masked & (torch.rand(batch, length) < 1.0 / k)
            x = torch.where(reveal, proposal, x)
        assert not (x == mask_id).any()
        if fixed is not None:
            assert (x[:, 0] == fixed).all()
        return x

    def metrics(x):
        in_category = ((x[:, :3] // 2) == torch.tensor([0, 1, 2])).all(1)
        duplicated = (x[:, :3] == x[:, 3:]).all(1)
        valid = in_category & duplicated
        unique_valid = len({tuple(row) for row in x[valid].tolist()})
        return {"valid_fraction": round(valid.float().mean().item(), 6),
                "valid_sequences_seen_of_8": unique_valid}

    model.eval()
    sampling = []
    for intervals in (1, 2, 4, 8, 16, 32):
        torch.manual_seed(seed + 1000 + intervals)
        x = sample(samples, intervals)
        sampling.append({"intervals": intervals, **metrics(x)})
    # A fixed visible token is never edited by the sampler.
    sample(32, 8, fixed=0)
    # Denoiser quality at fixed masking levels, using the forced target estimator.
    denoising = []
    with torch.no_grad():
        for t in (0.1, 0.5, 0.9):
            x0 = data(samples)
            rows = torch.arange(samples)
            target = torch.randint(length, (samples,))
            masked = torch.rand(samples, length) < t
            masked[rows, target] = True
            logits = model(x0.masked_fill(masked, mask_id))[rows, target]
            ce = F.cross_entropy(logits, x0[rows, target]).item()
            denoising.append({"mask_rate": t, "forced_target_ce": round(ce, 6),
                              "oracle_ce": round(t * 0.6931471805599453, 6)})
    return {"torch_version": torch.__version__, "device": "cpu", "seed": seed,
            "training_steps": steps, "samples_per_setting": samples,
            "parameters": sum(p.numel() for p in model.parameters()),
            "history": history, "sampling": sampling, "denoising": denoising}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--oracle-only", action="store_true")
    parser.add_argument("--steps", type=int, default=800)
    parser.add_argument("--samples", type=int, default=512)
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    if args.steps < 1 or args.samples < 1:
        parser.error("steps and samples must be positive")
    result = {"oracle": run_oracle()}
    if not args.oracle_only:
        result["neural"] = neural_lab(args.steps, args.samples, args.seed)
    output = json.dumps(result, indent=2) + "\n"
    if args.output:
        args.output.write_text(output, encoding="utf-8")
    print(output, end="")


if __name__ == "__main__":
    main()
