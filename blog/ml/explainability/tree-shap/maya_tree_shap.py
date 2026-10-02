"""Verify TreeExplainer on the same tree and ten customers as the articles.

Run: python maya_tree_shap.py
Optional: python maya_tree_shap.py --output assets/maya-results.json
Requires tree_shap_lab.py in the same directory and the pinned requirements.
"""
import argparse
import json
from itertools import product
from pathlib import Path

import numpy as np
import shap

from tree_shap_lab import (
    CUSTOMERS, TREE, X, coalition_value, enumerate_shap,
    predict as exact_predict, replacement_value,
)


# Node order: root A, left B, leaves 10/30, right C, leaves 50/90.
# The custom-tree arrays describe the existing tree; no model is refitted.
left = np.array([1, 2, -1, -1, 5, -1, -1])
model = {"trees": [{
    "children_left": left,
    "children_right": np.array([4, 3, -1, -1, 6, -1, -1]),
    "children_default": left.copy(),
    "features": np.array([0, 1, -1, -1, 2, -1, -1]),
    "thresholds": np.array([.5, .5, 0., 0., .5, 0., 0.]),
    "values": np.array([[52.], [15.], [10.], [30.],
                        [230/3], [50.], [90.]]),
    "node_sample_weight": np.array([10., 4., 3., 1., 6., 2., 4.]),
}]}
names = ["A: customer group", "B: plan", "C: usage"]
maya = np.array([X], dtype=float)
reference = np.array([r[1:4] for r in CUSTOMERS], dtype=float)


def predict(rows):
    """Evaluate the article's tree independently of the SHAP adapter."""
    return np.array([float(exact_predict(TREE, row)) for row in rows])


def exact_values(row, rule):
    if rule == "path":
        value = lambda known: coalition_value(TREE, row, known)
    elif rule == "replacement":
        value = lambda known: replacement_value(TREE, row, known, reference)
    else:
        raise ValueError(rule)
    return enumerate_shap(value, 3)


def verify():
    configurations = {
        "path": dict(feature_perturbation="tree_path_dependent"),
        "replacement": dict(feature_perturbation="interventional", data=reference),
    }
    rows = np.array(list(product((0, 1), repeat=3)), dtype=float)
    record = {
        "versions": {"numpy": np.__version__, "shap": shap.__version__},
        "feature_names": names,
        "reference_rows": reference.astype(int).tolist(),
        "maya": maya[0].astype(int).tolist(),
        "prediction": float(predict(maya)[0]),
        "checked_inputs": len(rows),
        "modes": {},
    }
    for rule, options in configurations.items():
        explainer = shap.TreeExplainer(
            model, model_output="raw", feature_names=names, **options
        )
        # Check that SHAP received the very same prediction function.
        np.testing.assert_allclose(explainer.model.predict(rows), predict(rows))
        result = explainer(rows, approximate=False)
        np.testing.assert_allclose(
            result.base_values + result.values.sum(axis=1),
            predict(rows), atol=2e-6, rtol=0,
        )
        max_error = 0.
        for i, row in enumerate(rows):
            base, phi, _ = exact_values(row, rule)
            expected = np.array(phi, dtype=float)
            np.testing.assert_allclose(result.base_values[i], float(base), atol=1e-12)
            np.testing.assert_allclose(result.values[i], expected, atol=2e-6, rtol=0)
            max_error = max(max_error, float(np.max(np.abs(result.values[i] - expected))))
        baseline, phi, groups = exact_values(X, rule)
        maya_result = explainer(maya, approximate=False)
        record["modes"][rule] = {
            "baseline": float(baseline),
            "exact_phi": [str(v) for v in phi],
            "phi": maya_result.values[0].tolist(),
            "groups": {
                "".join("ABC"[j] for j in sorted(s)) or "none": float(v)
                for s, v in groups.items()
            },
            "max_error_all_inputs": max_error,
        }
    return record


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    result = verify()
    output = json.dumps(result, indent=2) + "\n"
    if args.output:
        args.output.write_text(output)
    print(output)
    print("PASS: same tree, both reference rules, all eight inputs, every feature.")
