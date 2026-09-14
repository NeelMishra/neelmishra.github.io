"""Reproduce the chapter's synthetic forest; verified with scikit-learn 1.9.1.

Run: python isolation_forest_demo.py > assets/isolation-forest-demo.json
The six query values include 100, which is not a training observation.
"""
import json
import math

import numpy as np
import sklearn
from sklearn.ensemble import IsolationForest


def reference_length(n):
    """The harmonic approximation used by the verified sklearn version."""
    if n <= 1:
        return 0.0
    if n == 2:
        return 1.0
    return 2 * (math.log(n - 1) + np.euler_gamma) - 2 * (n - 1) / n


def build_demo():
    training = np.array([1, 2, 3, 4, 20], dtype=np.float32).reshape(-1, 1)
    queries = np.array([1, 2, 3, 4, 20, 100], dtype=np.float32).reshape(-1, 1)
    params = dict(n_estimators=3, max_samples=5, random_state=1)
    models = {
        "auto": IsolationForest(**params, contamination="auto").fit(training),
        "0.2": IsolationForest(**params, contamination=0.2).fit(training),
    }
    model = models["auto"]
    trees = []
    for estimator, other in zip(model.estimators_, models["0.2"].estimators_):
        tree = estimator.tree_
        np.testing.assert_array_equal(tree.threshold, other.tree_.threshold)
        nodes = []

        def visit(node_id, values):
            left, right = int(tree.children_left[node_id]), int(tree.children_right[node_id])
            threshold = float(tree.threshold[node_id])
            nodes.append(dict(id=node_id, left=left, right=right, threshold=threshold,
                              count=int(tree.n_node_samples[node_id]), values=values))
            if left != -1:
                visit(left, [x for x in values if x <= threshold])
                visit(right, [x for x in values if x > threshold])

        visit(0, training[:, 0].astype(int).tolist())
        trees.append(nodes)
    rows = []
    for value in queries[:, 0]:
        paths = []
        for nodes in trees:
            lookup = {n["id"]: n for n in nodes}
            node = lookup[0]
            route = [0]
            while node["left"] != -1:
                node = lookup[node["left"] if value <= node["threshold"] else node["right"]]
                route.append(node["id"])
            depth = len(route) - 1
            correction = reference_length(node["count"])
            paths.append(dict(route=route, depth=depth, leaf_values=node["values"],
                              correction=correction, corrected=depth + correction))
        query = np.array([[value]], dtype=np.float32)
        mean_path = sum(p["corrected"] for p in paths) / len(paths)
        anomaly = 2 ** (-mean_path / reference_length(model.max_samples_))
        np.testing.assert_allclose(anomaly, -model.score_samples(query)[0])
        decisions = {key: float(m.decision_function(query)[0]) for key, m in models.items()}
        rows.append(dict(value=int(value), paths=paths, mean_path=mean_path,
                         anomaly=anomaly, score_samples=float(model.score_samples(query)[0]),
                         decisions=decisions))
    return dict(sklearn_version=sklearn.__version__, training=training[:, 0].astype(int).tolist(),
                params=params, reference=reference_length(model.max_samples_), trees=trees,
                offsets={key: float(m.offset_) for key, m in models.items()}, queries=rows)


if __name__ == "__main__":
    print(json.dumps(build_demo(), indent=2))
