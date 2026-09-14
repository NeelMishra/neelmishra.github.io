"""Reproduce the small Shapley games in this series (Python standard library).
Run: python explanation_games.py > assets/shapley-games.json
Scores are constructed model-output units, not fitted probabilities.
"""
from itertools import permutations, product
import json


def model(row, interaction=0.3):
    a, b = row[:2]
    c = row[2] if len(row) > 2 else 0
    return 0.1 + 0.3*a + 0.1*b + interaction*a*b + 0.2*c + 0.6*a*b*c


def coalition_game(query, background, interaction=0.3):
    """Keep revealed query values; take all hidden values from one background row."""
    game = {}
    for mask in product((0, 1), repeat=len(query)):
        inputs = [[x if keep else b for x, keep, b in zip(query, mask, row)]
                  for row in background]
        outputs = [model(row, interaction) for row in inputs]
        game[''.join(map(str, mask))] = dict(inputs=inputs, outputs=outputs,
                                            value=sum(outputs)/len(outputs))
    return game


def reveal_orders(game):
    m = len(next(iter(game)))
    result = []
    for order in permutations(range(m)):
        mask = [0]*m
        values = [game[''.join(map(str, mask))]['value']]
        gains = [0.0]*m
        for j in order:
            mask[j] = 1
            value = game[''.join(map(str, mask))]['value']
            gains[j] = value - values[-1]
            values.append(value)
        result.append(dict(order=list(order), values=values, gains=gains))
    return result


def describe(game):
    orders = reveal_orders(game)
    m = len(next(iter(game)))
    phi = [sum(row['gains'][j] for row in orders)/len(orders) for j in range(m)]
    baseline = game['0'*m]['value']
    prediction = game['1'*m]['value']
    assert abs(baseline + sum(phi) - prediction) < 1e-12
    return dict(game=game, orders=orders, phi=phi, baseline=baseline, prediction=prediction)


def examples():
    return dict(
        interaction={str(i): describe(coalition_game([1,1], [[0,0]], i))
                     for i in (0.0, 0.3, -0.2)},
        backgrounds={
            'zero': describe(coalition_game([1,1], [[0,0]])),
            'balanced': describe(coalition_game([1,1], list(product((0,1), repeat=2))))},
        three=describe(coalition_game([1,1,1], [[0,0,0]])))


if __name__ == '__main__':
    print(json.dumps(examples(), indent=2))
