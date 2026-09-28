"""A hand-set two-head attention example, not a trained translation model.

Python standard library only. Export: python transformer_attention_demo.py
All 24 states vary query row, masking, scale, and a changed final input row.
"""
import json
import math
from pathlib import Path

BASE = [[1., 0., 1., 0.], [0., 1., 0., 1.], [1., 1., 0., 0.]]
CHANGED_LAST = [3., -2., 1., 2.]


def softmax(logits):
    """None means a forbidden key; reject a row with no allowed key."""
    valid = [z for z in logits if z is not None]
    if not valid:
        raise ValueError('Attention row has no allowed key')
    peak = max(valid)
    weights = [0. if z is None else math.exp(z - peak) for z in logits]
    total = sum(weights)
    return [w / total for w in weights]


def layer_norm(row, epsilon=1e-6):
    """One position, across four coordinates; gamma=1 and beta=0."""
    mean = sum(row) / len(row)
    variance = sum((x - mean)**2 for x in row) / len(row)
    return [(x - mean) / math.sqrt(variance + epsilon) for x in row]


def compute(query=2, causal=True, scaled=True, changed=False):
    x = [row[:] for row in BASE]
    if changed:
        x[-1] = CHANGED_LAST[:]
    heads = []
    # Head 1: Q/K use coordinates 1–2, V uses 3–4.
    # Head 2: Q/K use coordinates 3–4, V uses 1–2.
    for qcols, vcols in [((0, 1), (2, 3)), ((2, 3), (0, 1))]:
        q = [[row[i] for i in qcols] for row in x]
        k = [row[:] for row in q]
        v = [[row[i] for i in vcols] for row in x]
        scores, weights, outputs = [], [], []
        for i in range(3):
            logits = [sum(a*b for a, b in zip(q[i], key)) / (math.sqrt(2) if scaled else 1) for key in k]
            allowed = [z if not causal or j <= i else None for j, z in enumerate(logits)]
            w = softmax(allowed)
            scores.append(allowed)
            weights.append(w)
            outputs.append([sum(w[j] * v[j][c] for j in range(3)) for c in range(2)])
        heads.append(dict(q=q, k=k, v=v, scores=scores, weights=weights, outputs=outputs))
    # Concatenation, then W_O = identity; no dropout in this teaching example.
    attention = heads[0]['outputs'][query] + heads[1]['outputs'][query]
    residual = [a+b for a, b in zip(x[query], attention)]
    normalized = layer_norm(residual)
    return dict(query=query, causal=causal, scaled=scaled, changed=changed, x=x,
                heads=heads, attention=attention, residual=residual, normalized=normalized)


def export():
    states = [compute(q, causal, scaled, changed)
              for q in range(3) for causal in [False, True]
              for scaled in [False, True] for changed in [False, True]]
    # 3 × 2 × 2 × 2 = 24 combinations.
    for state in states:
        for head in state['heads']:
            for i, row in enumerate(head['weights']):
                assert math.isclose(sum(row), 1.)
                if state['causal']:
                    assert all(row[j] == 0 for j in range(i+1, 3))
    for q in [0, 1]:
        assert compute(q, True, True, False)['attention'] == compute(q, True, True, True)['attention']
        assert compute(q, False, True, False)['attention'] != compute(q, False, True, True)['attention']
    target = Path(__file__).parent / 'assets/transformer-attention-demo.json'
    target.write_text(json.dumps(states, indent=2) + '\n')
    print('Wrote', len(states), 'verified hand-set attention states')
    print('Default row 3:', compute()['attention'])


if __name__ == '__main__':
    export()
