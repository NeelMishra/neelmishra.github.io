"""Reproduce the TreeSHAP series figures and compare independent calculations.
Run: python -m pip install -r requirements.txt
     python tree_shap_lab.py
     python verify_treeexplainer.py
No network datasets, downloaded videos, or model artifacts are retained.
"""
from pathlib import Path
import json
import platform
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import sklearn
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import shap
from tree_shap_lab import (TREE, X, REPEATED, CORRELATED, REORDERED, BACKGROUND,
                           coalition_value, enumerate_shap, fixture)

ASSETS = Path(__file__).with_name('assets')
ASSETS.mkdir(exist_ok=True)


def shap_tree(root):
    """Adapt the hand-built tree to SHAP's documented custom-tree dictionary."""
    nodes, left, right = [], [], []
    def visit(node):
        i = len(nodes)
        nodes.append(node)
        left.append(-1)
        right.append(-1)
        if node.feature >= 0:
            left[i] = visit(node.left)
            right[i] = visit(node.right)
        return i
    visit(root)
    return {'children_left': np.array(left), 'children_right': np.array(right),
            'children_default': np.array(left),
            'features': np.array([n.feature for n in nodes]),
            'thresholds': np.array([n.threshold for n in nodes]),
            'values': np.array([[float(coalition_value(n, X, set()))] for n in nodes]),
            'node_sample_weight': np.array([n.cover for n in nodes], dtype=float)}


def savefig(name):
    plt.gcf().set_facecolor('white')
    plt.savefig(ASSETS / name, dpi=170, bbox_inches='tight', facecolor='white')
    plt.close()


def main():
    plt.rcParams.update({'font.size': 11, 'axes.spines.top': False,
                         'axes.spines.right': False})
    for tree, row in [(TREE, X), (REPEATED, (.5, 0)),
                      (CORRELATED, (1, 1)), (REORDERED, (1, 1))]:
        result = fixture(tree, row, len(row))
        model_dict = {'trees': [shap_tree(tree)]}
        ex = shap.TreeExplainer(model_dict, feature_perturbation='tree_path_dependent')
        got = ex(np.array([row], dtype=float))
        np.testing.assert_allclose(got.values[0], [float(v) for v in result['phi']], atol=1e-12)
        np.testing.assert_allclose(got.base_values[0], float(result['baseline']))
    toy = shap.TreeExplainer({'trees': [shap_tree(TREE)]},
                            feature_perturbation='tree_path_dependent')
    toy_result = toy(np.array([X], dtype=float))
    interactions = toy.shap_interaction_values(np.array([X], dtype=float))[0]
    expected_interactions = [[74/3, -3, 8/3], [-3, 6, 0], [8/3, 0, 8]]
    np.testing.assert_allclose(interactions, expected_interactions, atol=1e-12)
    np.testing.assert_allclose(interactions.sum(axis=1), toy_result.values[0])
    np.testing.assert_allclose(interactions.sum(), 38)
    toy_result.feature_names = ['A: customer group', 'B: service plan', 'C: usage band']
    shap.plots.waterfall(toy_result[0], show=False)
    savefig('toy-waterfall.png')

    # Verify the empirical replacement game against TreeExplainer independently.
    background = np.array(BACKGROUND, dtype=float)
    custom = {'trees': [shap_tree(CORRELATED)]}
    replacement = shap.TreeExplainer(custom, data=background,
                    feature_perturbation='interventional')(np.array([[1., 1.]]))
    np.testing.assert_allclose(replacement.values[0], [14, 9], atol=1e-12)

    rng = np.random.default_rng(23)
    data = rng.normal(size=(1200, 6))
    data[:, 1] = .8 * data[:, 0] + .2 * rng.normal(size=1200)
    target = (20 + 8 * data[:, 0] + 12 * (data[:, 2] > .3)
              + 6 * data[:, 3] * data[:, 4] + rng.normal(size=1200))
    train, test, y_train, y_test = train_test_split(data, target, test_size=.25, random_state=23)
    model = RandomForestRegressor(n_estimators=80, max_depth=5,
                                   min_samples_leaf=5, random_state=23, n_jobs=1)
    model.fit(train, y_train)
    reference = train[np.random.default_rng(7).choice(len(train), 64, replace=False)]
    explained = test[:32]
    names = ['signal', 'correlated signal', 'threshold', 'interaction A', 'interaction B', 'noise']
    path_explainer = shap.TreeExplainer(model, feature_perturbation='tree_path_dependent',
                                      model_output='raw', feature_names=names)
    path_values = path_explainer(explained, approximate=False)
    reference_explainer = shap.TreeExplainer(model, data=reference,
                feature_perturbation='interventional', model_output='raw', feature_names=names)
    reference_values = reference_explainer(explained, approximate=False)
    predictions = model.predict(explained)
    for result in (path_values, reference_values):
        np.testing.assert_allclose(result.base_values + result.values.sum(axis=1),
                                   predictions, atol=2e-6, rtol=0)
    # Brute-force masking for one held-out row: all 64 coalitions, 64 reference rows.
    def value(known):
        masked = reference.copy()
        for j in known:
            masked[:, j] = explained[0, j]
        return float(model.predict(masked).mean())
    brute_base, brute_phi, _ = enumerate_shap(value, 6)
    np.testing.assert_allclose(reference_values.values[0], np.array(brute_phi, dtype=float),
                               atol=2e-6, rtol=0)
    np.testing.assert_allclose(reference_values.base_values[0], brute_base, atol=1e-12)
    # Forest = average of trees, including each tree's own stored path covers.
    tree_results = [shap.TreeExplainer(t, feature_perturbation='tree_path_dependent')
                    (explained[:1]) for t in model.estimators_]
    np.testing.assert_allclose(path_values.values[0],
                np.mean([r.values[0] for r in tree_results], axis=0), atol=1e-12)
    np.testing.assert_allclose(path_values.base_values[0],
                np.mean([r.base_values[0] for r in tree_results]), atol=1e-12)

    shap.plots.waterfall(reference_values[0], show=False)
    savefig('forest-waterfall.png')
    shap.plots.bar(reference_values, show=False)
    savefig('forest-global.png')
    fig, ax = plt.subplots(figsize=(8, 4.6))
    positions = np.arange(6)
    ax.barh(positions - .18, path_values.values[0], .35, label='Stored path covers', color='#15766b')
    ax.barh(positions + .18, reference_values.values[0], .35, label='64 reference rows', color='#cf6428')
    ax.set_yticks(positions, names)
    ax.invert_yaxis()
    ax.axvline(0, color='#555555', linewidth=.8)
    ax.set_xlabel('Contribution to the same predicted numeric output')
    ax.legend(loc='lower right', fontsize=9)
    fig.tight_layout()
    savefig('forest-reference-comparison.png')

    # For this sklearn classifier, raw tree output is a class probability.
    classifier = RandomForestClassifier(n_estimators=40, max_depth=4, random_state=23)
    classifier.fit(train, y_train > np.median(y_train))
    class_values = shap.TreeExplainer(classifier,
        feature_perturbation='tree_path_dependent', model_output='raw')(explained)
    probabilities = classifier.predict_proba(explained)
    np.testing.assert_allclose(class_values.base_values + class_values.values.sum(axis=1),
                               probabilities, atol=1e-12)
    results = {
        'versions': {'python': platform.python_version(), 'numpy': np.__version__,
                     'scikit-learn': sklearn.__version__, 'shap': shap.__version__,
                     'matplotlib': matplotlib.__version__},
        'train_rows': len(train), 'test_rows': len(test), 'background_rows': len(reference),
        'explained_rows': len(explained), 'feature_names': names,
        'test_mae': mean_absolute_error(y_test, model.predict(test)),
        'mean_predictor_mae': mean_absolute_error(y_test, np.full(len(test), y_train.mean())),
        'first_prediction': float(predictions[0]), 'first_target': float(y_test[0]),
        'path_baseline': float(path_values.base_values[0]),
        'reference_baseline': float(reference_values.base_values[0]),
        'first_path_phi': path_values.values[0].tolist(),
        'first_reference_phi': reference_values.values[0].tolist(),
        'brute_reference_phi': [float(p) for p in brute_phi],
        'brute_max_error': float(np.max(np.abs(reference_values.values[0] - np.array(brute_phi, dtype=float)))),
        'reference_global_mean_abs': np.abs(reference_values.values).mean(axis=0).tolist(),
        'toy_interactions': interactions.tolist(),
        'classifier_shape': list(class_values.values.shape),
        'classifier_classes': classifier.classes_.tolist(),
        'classifier_first_probability': probabilities[0].tolist(),
        'classifier_base': class_values.base_values[0].tolist(),
        'classifier_first_phi': class_values.values[0].tolist(),
    }
    (ASSETS / 'library-results.json').write_text(json.dumps(results, indent=2) + '\n')
    print(json.dumps(results, indent=2))
    print('PASS: toy trees, repeated features, reference masking, ensemble linearity, interactions, and class probabilities.')


if __name__ == '__main__':
    main()
