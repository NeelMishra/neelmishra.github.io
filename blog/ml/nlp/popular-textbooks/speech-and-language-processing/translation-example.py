#!/usr/bin/env python3
"""Reproduce the constructed examples in Machine Translation: Meaning, Search, and Evaluation.

Python standard library only. This is a finite probability model, not a trained
translator. Beam search uses the chapter's shrinking-beam EOS convention.
"""
from collections import Counter
from math import exp, isclose, log, sqrt

TOKEN_ORDER = {token: i for i, token in enumerate(('the', 'a', 'cat', 'dog', 'EOS'))}


def transitions(prefix, p_a):
    if not prefix:
        return (('the', 0.95 - p_a), ('a', p_a), ('EOS', 0.05))
    if len(prefix) == 2:
        return (('EOS', 1.0),)
    if prefix[0] == 'the':
        return (('cat', 0.45), ('dog', 0.35), ('EOS', 0.20))
    return (('cat', 0.80), ('dog', 0.15), ('EOS', 0.05))


def rank(item):
    prefix, probability = item
    return (-probability, tuple(TOKEN_ORDER[token] for token in prefix))


def enumerate_paths(p_a=0.4):
    """Depth-first enumeration, independent of beam pruning."""
    completed = []

    def visit(prefix, probability):
        if prefix and prefix[-1] == 'EOS':
            completed.append((prefix, probability))
            return
        choices = transitions(prefix, p_a)
        assert isclose(sum(p for _, p in choices), 1.0)
        for token, conditional in choices:
            visit(prefix + (token,), probability * conditional)

    visit((), 1.0)
    return sorted(completed, key=rank)


def beam_search(width=2, p_a=0.4):
    assert width >= 1 and 0 < p_a < 0.95
    active, completed = [((), 1.0)], []
    slots = width
    while active and slots:
        expanded = [(prefix + (token,), p * conditional)
                    for prefix, p in active
                    for token, conditional in transitions(prefix, p_a)]
        selected = sorted(expanded, key=rank)[:slots]
        finished = [item for item in selected if item[0][-1] == 'EOS']
        completed.extend(finished)
        slots -= len(finished)
        active = [item for item in selected if item[0][-1] != 'EOS']
    return sorted(completed, key=rank)


def chrf(candidate, reference, beta=2, max_order=2):
    """Single-pair character F score, NFC, case-sensitive, whitespace removed.

    Both strings must contain at least max_order Unicode code points after
    preprocessing. This teaching function does not implement corpus aggregation,
    multiple references, smoothing, or production metric signatures.
    """
    from unicodedata import normalize
    candidate = ''.join(normalize('NFC', candidate).split())
    reference = ''.join(normalize('NFC', reference).split())
    assert beta > 0 and max_order >= 1
    assert min(len(candidate), len(reference)) >= max_order
    rows = []
    for n in range(1, max_order + 1):
        hyp = Counter(candidate[i:i+n] for i in range(len(candidate)-n+1))
        ref = Counter(reference[i:i+n] for i in range(len(reference)-n+1))
        matches = sum((hyp & ref).values())
        h_total, r_total = sum(hyp.values()), sum(ref.values())
        rows.append((n, matches, h_total, r_total))
    precision = sum(matches/h for _, matches, h, _ in rows) / max_order
    recall = sum(matches/r for _, matches, _, r in rows) / max_order
    score = ((1 + beta**2) * precision * recall / (beta**2 * precision + recall)
             if precision or recall else 0.0)
    return score, precision, recall, rows


def main():
    query = (sqrt(2), 0)
    keys = ((log(2), 0), (log(6), 1), (log(2), -1))
    values = ((1, 0), (0, 2), (2, 1))
    scores = [sum(q*k for q, k in zip(query, key))/sqrt(2) for key in keys]
    exponentials = [exp(score - max(scores)) for score in scores]
    weights = [e/sum(exponentials) for e in exponentials]
    output = [sum(a*v[j] for a, v in zip(weights, values)) for j in range(2)]
    assert all(isclose(a, b) for a, b in zip(weights, (.2, .6, .2)))
    assert all(isclose(a, b) for a, b in zip(output, (.6, 1.4)))
    print('Cross-attention weights:', weights, 'output:', output)

    loss = -sum(log(p) for p in (.8, .5, .6, .9))/4
    assert isclose(loss, -log(.216)/4)
    print(f'Mean target loss: {loss:.6f} nats')

    exhaustive = enumerate_paths()
    assert len(exhaustive) == 7
    assert isclose(sum(p for _, p in exhaustive), 1.0)
    print('All complete paths:', exhaustive)
    for width in (1, 2, 3):
        print(f'Beam width {width}:', beam_search(width)[0])
    assert isclose(beam_search(1)[0][1], .2475)
    assert isclose(beam_search(2)[0][1], .32)
    # Exhaustive correctness for every slider setting in the browser lab.
    for percent in range(10, 81, 5):
        p_a = percent / 100
        exact = enumerate_paths(p_a)
        assert isclose(sum(p for _, p in exact), 1.0)
        assert isclose(exact[0][1], max(.45*(.95-p_a), .8*p_a))
        for width in (2, 3):
            assert isclose(beam_search(width, p_a)[0][1], exact[0][1])
    print('All 15 slider settings checked against exhaustive enumeration.')

    score, precision, recall, counts = chrf('red boat', 'red boats')
    assert counts == [(1, 7, 7, 8), (2, 6, 6, 7)]
    assert isclose(score, 97/109)
    assert isclose(chrf('boatboat', 'boat')[0], .8125)
    assert chrf('boat', 'boat')[0] == 1
    assert chrf('xxxx', 'yyyy')[0] == 0
    print('chrF rows (order, matches, candidate count, reference count):', counts)
    print(f'P={precision:.6f}; R={recall:.6f}; chrF={score:.6f}')
    utility = ((1, .9, .5), (.9, 1, .7), (.5, .7, 1))
    means = [sum(row)/3 for row in utility]
    assert max(range(3), key=means.__getitem__) == 1
    print('Illustrative utility means:', means)


if __name__ == '__main__':
    main()
