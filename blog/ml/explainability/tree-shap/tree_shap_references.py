"""Reference choices for fitted trees; run beside tree_shap_examples.py.

Run: python tree_shap_references.py > assets/tree-shap-references.json
Direct enumeration is practical only for these two-feature examples.
The conditional calculation is our explicit empirical reference, not a
TreeExplainer mode. Every path/interventional allocation is library-checked.
"""
from itertools import product
import json
import numpy as np
import shap
import sklearn
from sklearn.tree import DecisionTreeRegressor
from tree_shap_examples import fitted_tree, nodes, path_value, allocation


def row_average(model, query, background, mask, conditional=False):
    inputs = np.asarray(background, dtype=float).copy()
    if conditional:
        keep = np.ones(len(inputs), dtype=bool)
        for j, known in enumerate(mask):
            if known:
                keep &= inputs[:, j] == query[j]
        inputs = inputs[keep]
        if not len(inputs):
            raise ValueError('No matching rows: this empirical conditional is undefined.')
    else:
        for j, known in enumerate(mask):
            if known:
                inputs[:, j] = query[j]
    predictions = model.predict(inputs)
    mass = np.asarray(model.decision_path(inputs).mean(axis=0)).ravel()
    leaves = {str(i): float(mass[i]) for i, n in enumerate(nodes(model))
              if n['left'] == n['right']}
    return dict(value=float(predictions.mean()), inputs=inputs.tolist(),
                outputs=predictions.tolist(), mass={str(i): float(w) for i, w in enumerate(mass)},
                leaves=leaves)


def explain(model, background, modes):
    queries = np.asarray(list(product((0., 1.), repeat=2)))
    results = {}
    for mode in modes:
        library = None
        if mode != 'conditional':
            explainer = shap.TreeExplainer(
                model, data=background if mode == 'interventional' else None,
                feature_perturbation=mode, model_output='raw')
            library = explainer(queries)
        rows = []
        for index, query in enumerate(queries):
            game = {}
            for mask in product((0, 1), repeat=2):
                key = ''.join(map(str, mask))
                game[key] = (path_value(model, query, mask) if mode == 'tree_path_dependent'
                             else row_average(model, query, background, mask, mode == 'conditional'))
            result = dict(query=query.tolist(), game=game, **allocation(game))
            assert np.isclose(result['prediction'], model.predict([query])[0])
            assert np.isclose(result['baseline']+sum(result['phi']), result['prediction'])
            if library is not None:
                assert np.allclose(result['phi'], library.values[index], atol=1e-7)
                assert np.isclose(result['baseline'], library.base_values[index])
                result['library_phi'] = library.values[index].tolist()
            rows.append(result)
        results[mode] = rows
    return results


def examples():
    model, binary = fitted_tree()
    correlated = np.repeat(binary, [3, 1, 1, 3], axis=0)
    targets = np.repeat([0., 2., 4., 8.], [3, 1, 1, 3])
    backgrounds = []
    for name, background in [('balanced', binary), ('a_one', binary[2:]),
                             ('correlated', correlated)]:
        backgrounds.append(dict(name=name, rows=background.tolist(),
            counts=[int(np.all(background == row, axis=1).sum()) for row in binary],
            explanations=explain(model, background, ['interventional'])['interventional']))
    trees = []
    for root_feature, max_features in [('A', None), ('B', 1)]:
        fitted = DecisionTreeRegressor(max_depth=2, max_features=max_features,
                                       random_state=0).fit(correlated, targets)
        assert fitted.tree_.feature[0] == ['A', 'B'].index(root_feature)
        assert np.array_equal(fitted.predict(binary), [0., 2., 4., 8.])
        trees.append(dict(root=root_feature, nodes=nodes(fitted),
            predictions=fitted.predict(binary).tolist(),
            explanations=explain(fitted, correlated,
                ['tree_path_dependent', 'interventional', 'conditional'])))
    expected = [[3.125, 1.125], [2.625, 1.625], [2.375, 1.875]]
    for mode, values in zip(['tree_path_dependent', 'interventional', 'conditional'], expected):
        assert np.allclose(trees[0]['explanations'][mode][3]['phi'], values)
    assert np.allclose(trees[1]['explanations']['tree_path_dependent'][3]['phi'], [1.875, 2.375])
    return dict(versions=dict(numpy=np.__version__, sklearn=sklearn.__version__, shap=shap.__version__),
                query=[1, 1], binary=binary.tolist(), balanced_nodes=nodes(model),
                backgrounds=backgrounds, correlated_rows=correlated.tolist(), trees=trees)


if __name__ == '__main__':
    print(json.dumps(examples(), indent=2))
