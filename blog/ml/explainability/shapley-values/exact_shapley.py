"""Reproduce the hand calculations using exact fractions; no packages required.
Run: python exact_shapley.py
"""
from fractions import Fraction
from itertools import permutations
import json
from pathlib import Path


def explain(players, values):
    totals = dict.fromkeys(players, Fraction(0))
    orders = []
    for order in permutations(players):
        known = frozenset()
        gains = {}
        for player in order:
            after = known | {player}
            gains[player] = Fraction(values[after]) - Fraction(values[known])
            totals[player] += gains[player]
            known = after
        orders.append({'order': list(order), 'gains': {k: float(v) for k, v in gains.items()}})
    result = {p: totals[p] / len(orders) for p in players}
    assert sum(result.values()) == values[frozenset(players)] - values[frozenset()]
    return {'values': {','.join(sorted(k)) or 'none': float(v) for k, v in values.items()},
            'phi': {k: float(v) for k, v in result.items()}, 'orders': orders}


def game(entries):
    return {frozenset(key): Fraction(value) for key, value in entries.items()}


def main():
    two = explain('AB', game({'': 0, 'A': 7500, 'B': 5000, 'AB': 10000}))
    # The three-player table is a separate contest, as in the lecture.
    three = explain('ABC', game({'': 0, 'A': 5000, 'B': 5000, 'C': 0,
                                'AB': 7500, 'AC': 7500, 'BC': 5000, 'ABC': 10000}))
    # f(age, degree) = 200*age + 1000*degree. Reference means: 39 and 1/2.
    income = explain(['age', 'degree'], {
        frozenset(): Fraction(8300), frozenset(['age']): Fraction(4500),
        frozenset(['degree']): Fraction(8800), frozenset(['age', 'degree']): Fraction(5000)
    })
    assert two['phi'] == {'A': 6250.0, 'B': 3750.0}
    assert three['phi'] == {'A': 5000.0, 'B': 3750.0, 'C': 1250.0}
    assert income['phi'] == {'age': -3800.0, 'degree': 500.0}
    out = Path(__file__).resolve().parent / 'assets' / 'exact-examples.json'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({'two_players': two, 'three_players': three, 'income': income}, indent=2) + '\n')
    print('Exact examples verified:', two['phi'], three['phi'], income['phi'])


if __name__ == '__main__': main()
