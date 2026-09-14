"""Contrast output attribution with one specified permutation evaluation.
Standard library only; keep explanation_games.py beside this script.
Run: python explanation_checks.py > assets/explanation-checks.json
"""
import json
from itertools import product
from explanation_games import model, coalition_game, describe


def examples():
    rows = list(product((0,1), repeat=2))
    predictions = [model(row) for row in rows]
    attributions = [describe(coalition_game(row,rows))['phi'] for row in rows]
    magnitudes = [sum(abs(phi[j]) for phi in attributions)/len(rows) for j in range(2)]
    cases = {}
    for label_mode in ('matching','reversed','unknown'):
        labels = predictions if label_mode == 'matching' else (
            [1-p for p in predictions] if label_mode == 'reversed' else None)
        mse = lambda values: None if labels is None else sum((p-y)**2 for p,y in zip(values,labels))/len(rows)
        baseline = mse(predictions)
        for feature in range(2):
            # A valid, deliberately fixed permutation: flip the selected balanced binary column.
            # This is one shuffle, not the mean over random permutations.
            permuted = [[1-v if j==feature else v for j,v in enumerate(row)] for row in rows]
            changed = [model(row) for row in permuted]
            error = mse(changed)
            cases[f'{label_mode}-{feature}'] = dict(
                label_mode=label_mode, feature=feature, rows=rows, predictions=predictions,
                permuted=permuted, changed=changed, labels=labels,
                baseline_mse=baseline, permuted_mse=error,
                increase=None if labels is None else error-baseline,
                mean_abs_shap=magnitudes[feature])
    return dict(attributions=attributions, magnitudes=magnitudes, cases=cases)


if __name__ == '__main__':
    print(json.dumps(examples(),indent=2))
