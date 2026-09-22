#!/usr/bin/env python3
"""Original two-position additive-attention lab; not a fitted translation model.

Run from any directory. Uses only Python's standard library. Checks all ten
attention-parameter gradients, one SGD step, and masking invariants; writes
JSON and an SVG from the same forward calculation used in the article.
"""
from pathlib import Path
import json
import math

HERE = Path(__file__).resolve().parent
H = [[1., 0.], [0., 1.]]
STATES = [[1., -1.], [-1., 1.]]  # independently supplied, not RNN outputs
PARAMS = [1., 0., 0., 1., 1., 0., 0., 1., 2., 2.]  # W, U, v


def softmax(xs):
    maximum = max(xs)
    exps = [math.exp(x - maximum) for x in xs]
    return [x / sum(exps) for x in exps]


def forward(params, step, padding=False):
    s = STATES[step]
    annotations = H + ([[1., 1.]] if padding else [])
    z = [[sum(params[2*r+k]*s[k] + params[4+2*r+k]*h[k]
              for k in range(2)) for r in range(2)] for h in annotations]
    activations = [[math.tanh(x) for x in row] for row in z]
    scores = [sum(params[8+r]*row[r] for r in range(2)) for row in activations]
    weights = softmax(scores)
    context = [sum(a*h[k] for a, h in zip(weights, annotations)) for k in range(2)]
    # This chosen two-word output head makes every number easy to inspect.
    logits = [3*context[1], 3*context[0]]  # carré, rouge
    probabilities = softmax(logits)
    return dict(state=s, scores=scores, weights=weights, context=context,
                logits=logits, probabilities=probabilities,
                loss=-math.log(probabilities[step]), activations=activations)


def gradient(params, step):
    out = forward(params, step)
    dlogits = [p - (i == step) for i, p in enumerate(out['probabilities'])]
    dcontext = [3*dlogits[1], 3*dlogits[0]]
    dscores = [a*sum(dcontext[k]*(h[k]-out['context'][k]) for k in range(2))
               for a, h in zip(out['weights'], H)]
    grad = [0.]*10
    for h, activation, de in zip(H, out['activations'], dscores):
        for r in range(2):
            grad[8+r] += de*activation[r]
            dz = de*params[8+r]*(1-activation[r]**2)
            for k in range(2):
                grad[2*r+k] += dz*out['state'][k]
                grad[4+2*r+k] += dz*h[k]
    return grad, dscores


def objective(params):
    return sum(forward(params, step)['loss'] for step in range(2))


def main():
    grad = [sum(gradient(PARAMS, step)[0][j] for step in range(2)) for j in range(10)]
    errors = []
    for j in range(10):
        plus, minus = PARAMS.copy(), PARAMS.copy()
        plus[j] += 1e-6
        minus[j] -= 1e-6
        errors.append(abs(grad[j]-(objective(plus)-objective(minus))/2e-6))
    updated = [p-.1*g for p, g in zip(PARAMS, grad)]
    assert max(errors) < 1e-8
    assert objective(updated) < objective(PARAMS)
    rows = [forward(PARAMS, step) for step in range(2)]
    for row in rows:
        assert math.isclose(sum(row['weights']), 1.)
        assert math.isclose(sum(row['context']), 1.)
        assert math.isclose(sum(softmax([e+100 for e in row['scores']])), 1.)
        assert all(math.isclose(a,b) for a,b in zip(row['weights'], softmax([e+100 for e in row['scores']])))
        # Mask a padded logit before softmax; -infinity contributes zero mass.
        assert softmax(row['scores'] + [-math.inf]) == row['weights'] + [0.]
    payload = dict(parameters=PARAMS, steps=rows,
                   unmasked_padding=[forward(PARAMS,i,True) for i in range(2)],
                   score_gradient=gradient(PARAMS,0)[1], parameter_gradient=grad,
                   updated_parameters=updated, loss_before=objective(PARAMS),
                   loss_after=objective(updated), max_gradient_error=max(errors))
    assets = HERE/'assets'
    assets.mkdir(exist_ok=True)
    (assets/'bahdanau-attention-demo.json').write_text(json.dumps(payload, indent=2)+'\n')
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 290" role="img" aria-labelledby="title desc">',
           '<title id="title">Original additive attention weights</title>',
           '<desc id="desc">Source columns red and square. Target row carré assigns 0.2463 and 0.7537; row rouge assigns 0.7537 and 0.2463. Every row sums to one.</desc>',
           '<rect width="320" height="290" rx="12" fill="#f8faf8"/>',
           '<g font-family="Arial,sans-serif" font-size="16" fill="#243f35">',
           '<text x="160" y="28" text-anchor="middle" font-weight="bold">Same source, two queries</text>',
           '<text x="153" y="62" text-anchor="middle">red</text><text x="247" y="62" text-anchor="middle">square</text>']
    for i,row in enumerate(rows):
        y=78+80*i
        svg.append(f'<text x="16" y="{y+37}">{["carré","rouge"][i]}</text>')
        for j,a in enumerate(row['weights']):
            x=110+94*j
            color='#9cd9c5' if a>.5 else '#e3f1eb'
            svg += [f'<rect x="{x}" y="{y}" width="86" height="66" rx="6" fill="{color}" stroke="#709788"/>',
                    f'<text x="{x+43}" y="{y+39}" text-anchor="middle" font-weight="bold">{a:.4f}</text>']
    svg += ['<text x="160" y="254" text-anchor="middle">Each target row sums to 1.</text>',
            '<text x="160" y="278" text-anchor="middle">Hand-set states and weights</text></g></svg>']
    (assets/'bahdanau-attention-weights.svg').write_text('\n'.join(svg)+'\n')
    print(json.dumps(payload, indent=2))


if __name__ == '__main__':
    main()
