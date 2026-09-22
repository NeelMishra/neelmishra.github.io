#!/usr/bin/env python3
"""Original 2D scalar-mixture teaching example; not pretrained ELMo outputs.

Run with Python 3.9+ (standard library only). Prints the default calculation,
checks analytic derivatives using central differences, and writes all eight
states to assets/elmo-scalar-mix-demo.json beside this script.
"""
import json
import math
from pathlib import Path

FEATURES = {
    'river': [[1., 0.], [0., 2.], [3., 1.]],
    'loan': [[1., 0.], [2., 0.], [-1., 2.]],
}
PRESETS = {'balanced': [.2, .3, .5], 'uniform': [1/3]*3,
           'lower': [.2, .6, .2], 'upper': [.1, .2, .7]}
HEAD = [1., -1.]
LABELS = {'river': 1., 'loan': 0.}


def softmax(logits):
    offset = max(logits)
    terms = [math.exp(a-offset) for a in logits]
    return [v / sum(terms) for v in terms]


def evaluate(logits, gamma):
    weights = softmax(logits)
    contexts = {}
    grad_logits = [0., 0., 0.]
    grad_gamma = 0.
    for name, layers in FEATURES.items():
        contributions = [[s*x for x in h] for s, h in zip(weights, layers)]
        mixture = [sum(row[c] for row in contributions) for c in range(2)]
        output = [gamma*x for x in mixture]
        score = sum(w*x for w, x in zip(HEAD, output))
        probability = 1 / (1 + math.exp(-score))
        y = LABELS[name]
        loss = max(score, 0.) - y*score + math.log1p(math.exp(-abs(score)))
        error = (probability - y) / len(FEATURES)
        component = []
        for j, h in enumerate(layers):
            derivative = gamma*weights[j]*sum(HEAD[c]*(h[c]-mixture[c]) for c in range(2))
            component.append(error*derivative)
            grad_logits[j] += component[-1]
        gamma_component = error*sum(w*x for w, x in zip(HEAD, mixture))
        grad_gamma += gamma_component
        contexts[name] = {'layers': layers, 'contributions': contributions,
                          'mixture': mixture, 'output': output, 'score': score,
                          'probability': probability, 'label': y, 'loss': loss,
                          'grad_logits': component, 'grad_gamma': gamma_component}
    return {'weights': weights, 'gamma': gamma, 'contexts': contexts,
            'mean_loss': sum(c['loss'] for c in contexts.values())/len(contexts),
            'grad_logits': grad_logits, 'grad_gamma': grad_gamma}


def state(preset, gamma):
    logits = [math.log(s) for s in PRESETS[preset]]
    result = evaluate(logits, gamma)
    step = .1
    new_logits = [a-step*g for a, g in zip(logits, result['grad_logits'])]
    new_gamma = gamma-step*result['grad_gamma']
    after = evaluate(new_logits, new_gamma)
    return {'preset': preset, **result, 'step_size': step,
            'after': {'weights': after['weights'], 'gamma': new_gamma,
                      'mean_loss': after['mean_loss']}}


def verify():
    max_error = 0.
    for name, weights in PRESETS.items():
        for gamma in [1., 2.]:
            logits = [math.log(s) for s in weights]
            result = state(name, gamma)
            parameters = logits+[gamma]
            for j, exact in enumerate(result['grad_logits']+[result['grad_gamma']]):
                hi, lo = parameters.copy(), parameters.copy()
                hi[j] += 1e-5
                lo[j] -= 1e-5
                numerical = (evaluate(hi[:3], hi[3])['mean_loss']-
                             evaluate(lo[:3], lo[3])['mean_loss'])/(2e-5)
                max_error = max(max_error, abs(exact-numerical))
                assert abs(exact-numerical) < 1e-9
            assert abs(sum(result['grad_logits'])) < 1e-12
            assert result['after']['mean_loss'] < result['mean_loss']
    default = state('balanced', 1.)
    for got, want in zip(default['contexts']['river']['output'], [1.7, 1.1]):
        assert abs(got-want)<1e-12
    for got, want in zip(default['contexts']['loan']['output'], [.3, 1.]):
        assert abs(got-want)<1e-12
    print('Maximum finite-difference error:', max_error)


if __name__ == '__main__':
    verify()
    states = [state(preset, gamma) for preset in PRESETS for gamma in [1., 2.]]
    target = Path(__file__).resolve().parent/'assets'/'elmo-scalar-mix-demo.json'
    target.parent.mkdir(exist_ok=True)
    target.write_text(json.dumps(states, indent=2)+'\n')
    print(json.dumps(states[0], indent=2))
