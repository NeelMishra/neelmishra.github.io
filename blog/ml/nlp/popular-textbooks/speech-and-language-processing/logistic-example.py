"""Reproduce the chapter's invented example; Python standard library only."""
from math import exp, isclose, log, log1p

VOCABULARY = ("broken", "late", "refund", "thanks")
WEIGHTS = (0.8, 0.3, 0.5, -0.4)
BIAS = -1.2


def sigmoid(z):
    if z >= 0:
        return 1 / (1 + exp(-z))
    ez = exp(z)
    return ez / (1 + ez)


def loss_from_logit(z, y):
    # Stable binary cross-entropy; avoids log(0) at large logits.
    return max(z, 0) - y * z + log1p(exp(-abs(z)))


def score(x, w, b):
    return sum(a * value for a, value in zip(w, x)) + b


def confusion(scores, labels, threshold):
    tp = fp = fn = tn = 0
    for p, y in zip(scores, labels):
        predicted = p >= threshold
        tp += predicted and y == 1
        fp += predicted and y == 0
        fn += not predicted and y == 1
        tn += not predicted and y == 0
    return tp, fp, fn, tn


def main():
    # The chapter explicitly uses lowercase whitespace tokens without punctuation.
    tokens = "broken parcel broken please refund".lower().split()
    x = [tokens.count(word) for word in VOCABULARY]
    y, eta = 1, 0.2
    z = score(x, WEIGHTS, BIAS)
    p = sigmoid(z)
    error = p - y
    gradient = [error * count for count in x]
    new_weights = [w - eta * g for w, g in zip(WEIGHTS, gradient)]
    new_bias = BIAS - eta * error
    new_z = score(x, new_weights, new_bias)
    assert x == [2, 0, 1, 0] and isclose(z, 0.9)
    assert isclose(p, 0.7109495026250039)
    assert isclose(new_z, 1.2468605968499957)
    assert loss_from_logit(new_z, y) < loss_from_logit(z, y)

    # Check the analytic gradient against independent central differences.
    delta = 1e-6
    for j, expected in enumerate(gradient):
        plus, minus = list(WEIGHTS), list(WEIGHTS)
        plus[j] += delta
        minus[j] -= delta
        numerical = (loss_from_logit(score(x, plus, BIAS), y)
                     - loss_from_logit(score(x, minus, BIAS), y)) / (2 * delta)
        assert isclose(numerical, expected, abs_tol=1e-9)
    numerical_bias = (loss_from_logit(z + delta, y)
                      - loss_from_logit(z - delta, y)) / (2 * delta)
    assert isclose(numerical_bias, error, abs_tol=1e-9)

    logits = [1.2, 0.4, -0.6]
    shifted = [exp(a - max(logits)) for a in logits]
    softmax = [a / sum(shifted) for a in shifted]
    assert isclose(sum(softmax), 1)
    scores = [.92, .81, .73, .61, .48, .35, .22, .08]
    labels = [1, 0, 1, 1, 0, 1, 0, 0]
    assert confusion(scores, labels, .5) == (3, 1, 1, 3)
    assert confusion(scores, labels, .75) == (1, 1, 3, 3)
    assert confusion(scores, labels, .3) == (4, 2, 0, 2)
    print(f"x={x}; z={z:.4f}; p={p:.6f}; BCE={loss_from_logit(z, y):.6f}")
    print(f"gradient={gradient}; bias gradient={error:.6f}")
    print(f"updated weights={new_weights}; updated bias={new_bias:.6f}")
    print(f"updated z={new_z:.6f}; p={sigmoid(new_z):.6f}; BCE={loss_from_logit(new_z, y):.6f}")
    print(f"softmax={softmax}; billing-label loss={-log(softmax[1]):.6f}")
    print("Finite-difference gradients and three threshold examples pass.")


if __name__ == "__main__":
    main()
