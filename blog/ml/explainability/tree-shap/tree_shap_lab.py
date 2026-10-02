"""Exact, standard-library TreeSHAP teaching lab (Python 3.9+).

Two independent calculations: enumerate all feature subsets, or decompose the
same path-cover game into leaves and use polynomial coefficients. The latter
uses O(L D^2) arithmetic operations, with exact rational arithmetic here.
This is an educational implementation for finite numeric inputs and positive
node covers, not a replacement for the compiled SHAP package.
"""
from dataclasses import dataclass
from fractions import Fraction as Q
from itertools import combinations
from math import comb
from pathlib import Path
import json


@dataclass(frozen=True)
class Node:
    cover: int
    value: int = 0
    feature: int = -1
    threshold: float = 0.5
    left: 'Node' = None
    right: 'Node' = None


def split(feature, threshold, left, right):
    return Node(left.cover + right.cover, feature=feature,
                threshold=threshold, left=left, right=right)


TREE = split(0, .5, split(1, .5, Node(30, 10), Node(10, 30)),
             split(2, .5, Node(20, 50), Node(40, 90)))
X = (1, 1, 1)
REPEATED = split(0, 1, split(1, .5,
                 split(0, 0, Node(10, 10), Node(30, 40)), Node(30, 70)),
                 Node(30, 100))
CORRELATED = split(0, .5, Node(5, 10),
                   split(1, .5, Node(1, 20), Node(4, 50)))
REORDERED = split(1, .5, split(0, .5, Node(4, 10), Node(1, 20)),
                  split(0, .5, Node(1, 10), Node(4, 50)))
BACKGROUND = [(0, 0)] * 4 + [(0, 1), (1, 0)] + [(1, 1)] * 4


def predict(node, x):
    while node.feature >= 0:
        node = node.left if x[node.feature] <= node.threshold else node.right
    return Q(node.value)


def coalition_value(node, x, known):
    """Follow a known split; average both children at an unknown split."""
    if node.feature < 0:
        return Q(node.value)
    if node.feature in known:
        child = node.left if x[node.feature] <= node.threshold else node.right
        return coalition_value(child, x, known)
    return sum(Q(child.cover, node.cover) * coalition_value(child, x, known)
               for child in (node.left, node.right))


def subsets(m):
    for k in range(m + 1):
        for s in combinations(range(m), k):
            yield frozenset(s)


def enumerate_shap(value, m):
    values = {s: value(s) for s in subsets(m)}
    phi = [Q(0)] * m
    for j in range(m):
        for s, v in values.items():
            if j not in s:
                phi[j] += (values[s | {j}] - v) / (m * comb(m - 1, len(s)))
    return values[frozenset()], phi, values


def leaf_paths(node, x, factors=None):
    """Map each distinct feature to its (hidden, revealed) path fractions."""
    factors = {} if factors is None else factors
    if node.feature < 0:
        yield Q(node.value), factors
        return
    hot = node.left if x[node.feature] <= node.threshold else node.right
    for child in (node.left, node.right):
        updated = factors.copy()
        z, o = factors.get(node.feature, (Q(1), Q(1)))
        updated[node.feature] = (z * Q(child.cover, node.cover),
                                 o * int(child is hot))
        yield from leaf_paths(child, x, updated)


def polynomial(factors):
    """Coefficients of product_j (z_j + o_j t), indexed by power of t."""
    coeff = [Q(1)]
    for z, o in factors:
        new = [Q(0)] * (len(coeff) + 1)
        for k, c in enumerate(coeff):
            new[k] += z * c
            new[k + 1] += o * c
        coeff = new
    return coeff


def remove_factor(coeff, z, o):
    """Divide by z + o t in linear time; positive covers imply z > 0."""
    if z <= 0:
        raise ValueError('The teaching lab requires strictly positive covers.')
    reduced = []
    for k in range(len(coeff) - 1):
        previous = reduced[k - 1] if k else Q(0)
        reduced.append((coeff[k] - o * previous) / z)
    assert coeff[-1] == o * reduced[-1]
    return reduced


def leaf_shap(node, x, m, collect_details=True):
    baseline, phi, details = Q(0), [Q(0)] * m, []
    for value, factors in leaf_paths(node, x):
        coeff = polynomial(factors.values())
        baseline += value * coeff[0]
        d = len(factors)
        contribution = {}
        for j, (z, o) in factors.items():
            reduced = remove_factor(coeff, z, o)
            weight = sum(c / (d * comb(d - 1, k))
                         for k, c in enumerate(reduced))
            contribution[j] = value * (o - z) * weight
            phi[j] += contribution[j]
        if collect_details:
            details.append({'value': value, 'factors': factors,
                            'baseline': value * coeff[0], 'phi': contribution})
    assert baseline + sum(phi) == predict(node, x)
    return baseline, phi, details


def replacement_value(tree, x, known, background):
    return sum(predict(tree, tuple(x[j] if j in known else row[j]
                                  for j in range(len(x))))
               for row in background) / len(background)


def conditional_value(tree, x, known, background):
    matching = [row for row in background if all(row[j] == x[j] for j in known)]
    if not matching:
        raise ValueError('No matching reference rows for this coalition.')
    return sum(predict(tree, row) for row in matching) / len(matching)


def fixture(tree, x, m):
    base, phi, values = enumerate_shap(lambda s: coalition_value(tree, x, s), m)
    fast_base, fast_phi, leaves = leaf_shap(tree, x, m)
    assert (base, phi) == (fast_base, fast_phi)
    assert base + sum(phi) == predict(tree, x)
    return {'baseline': base, 'phi': phi, 'prediction': predict(tree, x),
            'coalitions': {','.join('ABCDEF'[j] for j in sorted(s)) or 'none': v
                           for s, v in values.items()}, 'leaves': leaves}


def to_json(obj):
    if isinstance(obj, Q):
        return {'exact': str(obj), 'value': float(obj)}
    raise TypeError(type(obj).__name__)


def run():
    main = fixture(TREE, X, 3)
    assert main['phi'] == [Q(73, 3), Q(3), Q(32, 3)]
    repeated = fixture(REPEATED, (.5, 0), 2)
    assert repeated['phi'] == [Q(-669, 56), Q(-675, 56)]
    # All corners, an unused input, constant trees, and several repeated splits.
    from itertools import product
    for row in product((0, 1), repeat=3):
        fixture(TREE, row + (17,), 4)
    for row in product((-1, .5, 2), (0, 1)):
        fixture(REPEATED, row, 2)
    fixture(Node(10, 7), (0, 0), 2)
    # Deterministic random trees compare independent formulations over many cases.
    import random
    rng = random.Random(41)
    def random_tree(depth):
        if depth == 0 or rng.random() < .2:
            return Node(rng.randint(1, 20), rng.randint(-10, 30))
        return split(rng.randrange(4), rng.choice([-.5, .5]),
                     random_tree(depth - 1), random_tree(depth - 1))
    for _ in range(100):
        tree = random_tree(4)
        fixture(tree, tuple(rng.choice([-1, 0, 1]) for _ in range(4)), 4)
    games = {}
    for name, value in [
        ('path', lambda s: coalition_value(CORRELATED, (1, 1), s)),
        ('replacement', lambda s: replacement_value(CORRELATED, (1, 1), s, BACKGROUND)),
        ('conditional', lambda s: conditional_value(CORRELATED, (1, 1), s, BACKGROUND)),
        ('reordered_path', lambda s: coalition_value(REORDERED, (1, 1), s))]:
        base, phi, values = enumerate_shap(value, 2)
        games[name] = {'baseline': base, 'phi': phi,
                       'coalitions': {','.join('AB'[j] for j in sorted(s)) or 'none': v
                                      for s, v in values.items()}}
    assert games['path']['phi'] == [Q(37, 2), Q(9, 2)]
    assert games['replacement']['phi'] == [Q(14), Q(9)]
    assert games['conditional']['phi'] == [Q(25, 2), Q(21, 2)]
    assert games['reordered_path']['phi'] == [Q(8), Q(15)]
    out = Path(__file__).with_name('assets')
    out.mkdir(exist_ok=True)
    (out / 'exact-results.json').write_text(json.dumps(
        {'main': main, 'repeated': repeated, 'background_games': games,
         'independent_random_tree_checks': 100}, default=to_json, indent=2) + '\n')
    print('Exact coalition and polynomial calculations agree: 100 random trees and all worked examples.')
    print('Main tree:', main['baseline'], main['phi'], main['prediction'])
    print('Repeated feature:', repeated['baseline'], repeated['phi'], repeated['prediction'])


if __name__ == '__main__':
    run()
