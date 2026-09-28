"""Reproduce the original companion examples; Python standard library only."""
from math import exp, isclose, log, sqrt

VALUES = ((2, 0), (0, 2), (1, 3), (4, -1))
QUERIES = ((sqrt(2), 0), (0, sqrt(2)), (sqrt(2), 0), (sqrt(2), sqrt(2)))


def attention(position=2, fourth_key=3, causal=True):
    """Position is zero-indexed; return row weights and its weighted value."""
    keys = ((1, 0), (0, 1), (1, 1), (fourth_key, 0))
    query = QUERIES[position]
    scores = [sum(q * k for q, k in zip(query, key)) / sqrt(2) for key in keys]
    allowed = [not causal or j <= position for j in range(len(keys))]
    largest = max(score for score, use in zip(scores, allowed) if use)
    numerators = [exp(score - largest) if use else 0 for score, use in zip(scores, allowed)]
    weights = [value / sum(numerators) for value in numerators]
    output = [sum(weight * value[j] for weight, value in zip(weights, VALUES)) for j in range(2)]
    return weights, output


def normalize(values):
    total = sum(values)
    return [value / total for value in values]


def top_k(probabilities, k):
    # Stable index tie-breaking, retaining exactly k candidates.
    kept = sorted(range(len(probabilities)), key=lambda j: (-probabilities[j], j))[:k]
    return normalize([value if j in kept else 0 for j, value in enumerate(probabilities)])


def top_p(probabilities, cutoff):
    # Include the candidate that reaches or crosses the probability cutoff.
    kept, cumulative = [], 0
    for j in sorted(range(len(probabilities)), key=lambda j: (-probabilities[j], j)):
        kept.append(j)
        cumulative += probabilities[j]
        if cumulative >= cutoff:
            break
    return normalize([value if j in kept else 0 for j, value in enumerate(probabilities)])


def main():
    masked, output = attention()
    assert all(isclose(a, b) for a, b in zip(masked, [exp(1)/(2*exp(1)+1), 1/(2*exp(1)+1), exp(1)/(2*exp(1)+1), 0]))
    assert all(isclose(a, b) for a, b in zip(output, [1.2669563947545546, 1.5776812017484818]))
    assert attention(fourth_key=-2) == attention(fourth_key=5)
    assert attention(causal=False, fourth_key=-2) != attention(causal=False, fourth_key=5)
    for position in range(4):
        weights, _ = attention(position)
        assert isclose(sum(weights), 1)
        assert all(weight == 0 for weight in weights[position + 1:])
    assert attention(0)[1] == [2, 0]
    assert attention(3) == attention(3, causal=False)
    base = [.5, .25, .15, .1]
    temperature = .5
    cooled = normalize([value ** (1 / temperature) for value in base])
    nucleus = top_p(base, .8)
    assert all(isclose(a, b) for a, b in zip(nucleus, [5/9, 5/18, 1/6, 0]))
    assert isclose(sum(cooled), 1)
    target_probs = [.6, .5, .25, .8]
    loss = -sum(log(value) for value in target_probs) / len(target_probs)
    assert isclose(loss, .7033526791900091)
    print('Causal row3 weights:', masked)
    print('Causal row3 output:', output)
    print('Unmasked row3 weights/output:', attention(causal=False))
    print('Temperature .5:', cooled)
    print('Top-k2:', top_k(base, 2))
    print('Top-p.8:', nucleus)
    print(f'Target mean loss: {loss:.9f}; perplexity: {exp(loss):.9f}')
    print('Normalization, causal zeros, future-key invariance, and decoding checks pass.')


if __name__ == '__main__':
    main()
