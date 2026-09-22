"""Regenerate the small, hand-set language model used in the Bengio companion.

Run with Python 3; no dependencies. These weights are teaching inputs, not a
reproduction of the paper's trained models. Checks cover normalization, an
analytic gradient against finite differences, and one full SGD update.
"""
from copy import deepcopy
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent / "assets"
WORDS = ["the", "cat", "dog", "sat", "ran"]
PARAMS = {
    "C": [[.2, -.1], [.8, .4], [.7, .5], [-.3, .9], [-.4, 1.]],
    "H": [[.5, -.2, .8, .1], [-.4, .6, .1, .9]],
    "d": [0., 0.],
    "U": [[-.4, .2], [-.2, -.1], [-.1, -.2], [1., .6], [.6, .9]],
    "b": [0., 0., 0., .3, .1],
}


def forward(params, context):
    x = sum((params["C"][WORDS.index(w)] for w in context), [])
    a = [math.tanh(sum(w*v for w, v in zip(row, x)) + bias)
         for row, bias in zip(params["H"], params["d"])]
    scores = [sum(w*v for w, v in zip(row, a)) + bias
              for row, bias in zip(params["U"], params["b"])]
    exps = [math.exp(s-max(scores)) for s in scores]
    probs = [v/sum(exps) for v in exps]
    assert abs(sum(probs)-1) < 1e-12
    return {"x": x, "hidden": a, "scores": scores, "probabilities": probs}


def gradients(params, context, target):
    f = forward(params, context)
    dz = [p - (i == WORDS.index(target)) for i, p in enumerate(f["probabilities"])]
    da = [sum(params["U"][i][j]*dz[i] for i in range(len(WORDS)))
          * (1-f["hidden"][j]**2) for j in range(2)]
    dx = [sum(params["H"][j][k]*da[j] for j in range(2)) for k in range(4)]
    dc = [[0., 0.] for _ in WORDS]
    for pos, word in enumerate(context):
        for j in range(2):
            dc[WORDS.index(word)][j] += dx[2*pos+j]
    return {"C": dc, "H": [[g*x for x in f["x"]] for g in da],
            "d": da, "U": [[g*a for a in f["hidden"]] for g in dz], "b": dz}


def update(params, grad, rate):
    return {key: [[v-rate*g for v, g in zip(row, grow)]
                  for row, grow in zip(values, grad[key])]
            if isinstance(values[0], list)
            else [v-rate*g for v, g in zip(values, grad[key])]
            for key, values in params.items()}


def checks():
    context, target = ["the", "cat"], "sat"
    grad = gradients(PARAMS, context, target)
    eps = 1e-5
    worst = 0.
    for key, values in PARAMS.items():
        for i, value in enumerate(values):
            for j in range(len(value) if isinstance(value, list) else 1):
                plus, minus = deepcopy(PARAMS), deepcopy(PARAMS)
                if isinstance(value, list):
                    plus[key][i][j] += eps
                    minus[key][i][j] -= eps
                    analytic = grad[key][i][j]
                else:
                    plus[key][i] += eps
                    minus[key][i] -= eps
                    analytic = grad[key][i]
                loss = lambda p: -math.log(forward(p, context)["probabilities"][3])
                numeric = (loss(plus)-loss(minus))/(2*eps)
                worst = max(worst, abs(analytic-numeric))
    assert worst < 1e-8, worst
    after = update(PARAMS, grad, .2)
    before_f, after_f = forward(PARAMS, context), forward(after, context)
    assert after_f["probabilities"][3] > before_f["probabilities"][3]
    assert after["C"][2:] == PARAMS["C"][2:]
    return grad, after, worst


def chart(cases):
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 775" role="img" aria-labelledby="title desc">',
             '<title id="title">One network, three contexts</title>',
             '<desc id="desc">Hand-set cat and dog embeddings give similar output distributions. Swapping word order changes the probabilities. Exact probabilities are recorded in the accompanying JSON.</desc>',
             '<rect width="480" height="775" rx="16" fill="#fafaf7"/>',
             '<g font-family="Arial, sans-serif" fill="#213d35">',
             '<text x="24" y="35" font-size="23" font-weight="bold">One network, three contexts</text>',
             '<text x="24" y="64" font-size="17">Hand-set weights; the same network in every row</text>']
    colors = ['#087f6d', '#526eb6', '#b15a25']
    for k, (name, vals) in enumerate(cases.items()):
        y = 103+k*209
        parts.append(f'<text x="24" y="{y}" font-size="21" font-weight="bold">{name} → ?</text>')
        for i, p in enumerate(vals["probabilities"]):
            row_y = y+19+i*29
            parts.append(f'<text x="24" y="{row_y+17}" font-size="19">{WORDS[i]}</text>')
            parts.append(f'<rect x="104" y="{row_y}" width="{p*600:.2f}" height="22" fill="{colors[k]}" rx="3"/>')
            parts.append(f'<text x="443" y="{row_y+17}" font-size="19" text-anchor="end">{p:.3f}</text>')
        parts.append(f'<path d="M104 {y+168} H404" stroke="#9caeaa"/>')
        for p in [0, .25, .5]:
            x = 104+p*600
            parts.append(f'<text x="{x}" y="{y+189}" font-size="16" text-anchor="middle">{p:g}</text>')
    parts.append('<text x="24" y="733" font-size="17">Horizontal axis: next-word probability.</text>')
    parts.append('<text x="24" y="758" font-size="17">Each five-word distribution sums to 1.</text></g></svg>')
    return '\n'.join(parts)+'\n'


if __name__ == "__main__":
    grad, after, worst = checks()
    cases = {" ".join(c): forward(PARAMS, c) for c in [["the", "cat"], ["the", "dog"], ["cat", "the"]]}
    data = {"note": "Hand-set teaching example, not an empirical paper reproduction.",
            "vocabulary": WORDS, "parameters": PARAMS, "contexts": cases,
            "update": {"context": ["the", "cat"], "target": "sat", "learning_rate": .2,
                       "gradients": grad, "parameters_after": after,
                       "forward_after": forward(after, ["the", "cat"])}}
    ROOT.mkdir(exist_ok=True)
    (ROOT / "bengio-toy-model.json").write_text(json.dumps(data, indent=2)+'\n')
    (ROOT / "bengio-context-probabilities.svg").write_text(chart(cases))
    print(json.dumps({"contexts": cases, "after": data["update"]["forward_after"], "max_gradient_error": worst}, indent=2))
