"""Reproduce the RNN, BPTT, LSTM, attention and memory-lab examples.

Run with Python 3; no third-party dependencies are required. Every value is
constructed for teaching, not measured from a trained language model.
"""
from math import exp, isclose, log, log1p, tanh


def recurrence(u=.8, w=.6, b=0., v=2.):
    inputs = [1., -.5, .25]
    states = [0.]
    for x in inputs:
        states.append(tanh(u * states[-1] + w * x + b))
    p = 1 / (1 + exp(-v * states[-1]))
    loss = log1p(exp(-v * states[-1]))  # binary target y = 1
    delta = [0.] * len(inputs)
    upstream = v * (p - 1)
    for t in range(len(inputs) - 1, -1, -1):
        delta[t] = upstream * (1 - states[t + 1] ** 2)
        upstream = u * delta[t]
    gradients = {
        'u': sum(delta[t] * states[t] for t in range(len(inputs))),
        'w': sum(delta[t] * inputs[t] for t in range(len(inputs))),
        'b': sum(delta),
        'v': (p - 1) * states[-1],
    }
    return states, p, loss, delta, gradients


def memory(steps=10, u=.8, forget=.95, initial=.5):
    """No new inputs/writes; constant LSTM gates, output gate = .8."""
    h, derivative = initial, 1.
    for _ in range(steps):
        h = tanh(u * h)
        derivative *= u * (1 - h * h)
    cell_derivative = forget ** steps
    cell = initial * cell_derivative
    exposed = .8 * tanh(cell)
    exposed_derivative = .8 * (1 - tanh(cell) ** 2) * cell_derivative
    return h, derivative, cell, cell_derivative, exposed, exposed_derivative


def main():
    states, p, loss, delta, gradients = recurrence()
    print('RNN states:', states)
    print('P(y=1), BCE:', p, loss)
    print('BPTT preactivation derivatives:', delta)
    print('Shared-parameter gradients:', gradients)
    epsilon = 1e-5
    defaults = {'u': .8, 'w': .6, 'b': 0., 'v': 2.}
    for name, value in defaults.items():
        plus = {**defaults, name: value + epsilon}
        minus = {**defaults, name: value - epsilon}
        numerical = (recurrence(**plus)[2] - recurrence(**minus)[2]) / (2 * epsilon)
        assert isclose(gradients[name], numerical, rel_tol=1e-8, abs_tol=1e-9)
    updated_u = .8 - .1 * gradients['u']
    updated_loss = recurrence(u=updated_u)[2]
    assert updated_loss < loss
    print('Update only u:', updated_u, 'new BCE:', updated_loss)

    c = .9 * .8 + .2 * -.5
    h = .75 * tanh(c)
    assert isclose(c, .62)
    print('LSTM cell and exposed state:', c, h)
    print('Memory lab default:', memory())
    target_likelihood = .6 * .5 * .8
    print('Encoder-decoder target likelihood and mean loss:', target_likelihood, -log(target_likelihood)/3)

    # Every range combination (40 x 31 x 51) has a finite-difference check.
    # Relative tolerance accommodates derivatives near zero and saturation.
    settings = 0
    for steps in range(1, 41):
        for u_tick in range(31):
            u = u_tick / 20
            for f_tick in range(50, 101):
                forget = f_tick / 100
                values = memory(steps, u, forget)
                plus = memory(steps, u, forget, .5 + epsilon)
                minus = memory(steps, u, forget, .5 - epsilon)
                for state_index, derivative_index in [(0, 1), (2, 3), (4, 5)]:
                    numerical = (plus[state_index] - minus[state_index]) / (2 * epsilon)
                    assert isclose(values[derivative_index], numerical, rel_tol=2e-6, abs_tol=2e-10)
                settings += 1
    assert memory(40, 0., 1.)[:2] == (0., 0.)
    assert memory(40, .8, 1.)[2:4] == (.5, 1.)

    encoder = [(1., 0.), (0., 1.), (1., 1.)]
    for query in [(1., 0.), (0., 1.)]:
        scores = [sum(a*b for a, b in zip(query, vector)) for vector in encoder]
        denom = sum(exp(score) for score in scores)
        weights = [exp(score)/denom for score in scores]
        context = [sum(weight*vector[d] for weight, vector in zip(weights, encoder)) for d in range(2)]
        assert isclose(sum(weights), 1.)
        print('Attention query, weights, context:', query, weights, context)
    print('All four BPTT gradients and', settings, 'memory settings verified.')


if __name__ == '__main__':
    main()
