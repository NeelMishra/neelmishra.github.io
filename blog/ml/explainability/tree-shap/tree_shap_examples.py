"""Fitted, inspectable TreeSHAP examples. See tree-shap-requirements.txt.
Run: python tree_shap_examples.py > assets/tree-shap-examples.json
The direct coalition enumeration is a small reference calculation, not the
polynomial-time TreeSHAP algorithm. Its answers are checked against SHAP.
"""
from itertools import product, permutations
import json
import numpy as np
import sklearn
from sklearn.tree import DecisionTreeRegressor
import shap


def fitted_tree():
    x = np.asarray(list(product((0.,1.),repeat=2)))
    y = np.asarray([0.,2.,4.,8.])
    return DecisionTreeRegressor(max_depth=2,random_state=0).fit(x,y), x


def nodes(model):
    tree = model.tree_
    return [dict(id=i,left=int(tree.children_left[i]),right=int(tree.children_right[i]),
                 feature=int(tree.feature[i]),threshold=float(tree.threshold[i]),
                 value=float(tree.value[i,0,0]),cover=float(tree.weighted_n_node_samples[i]))
            for i in range(tree.node_count)]


def path_value(model, query, mask):
    tree = model.tree_; mass = {}; leaves = {}
    def visit(i, weight):
        mass[str(i)] = weight
        left, right = tree.children_left[i], tree.children_right[i]
        if left == right:
            leaves[str(i)] = weight
            return weight*float(tree.value[i,0,0])
        j = tree.feature[i]
        if mask[j]:
            return visit(left if query[j] <= tree.threshold[i] else right, weight)
        total = tree.weighted_n_node_samples[i]
        return (visit(left, weight*tree.weighted_n_node_samples[left]/total)
                + visit(right, weight*tree.weighted_n_node_samples[right]/total))
    value = visit(0,1.)
    assert abs(sum(leaves.values())-1) < 1e-12
    return dict(value=value,mass=mass,leaves=leaves)


def replacement_value(model, query, background, mask):
    completed = np.asarray(background,dtype=float).copy()
    for j,known in enumerate(mask):
        if known: completed[:,j] = query[j]
    output = model.predict(completed)
    return dict(value=float(output.mean()),inputs=completed.tolist(),outputs=output.tolist())


def allocation(game):
    m = len(next(iter(game))); orders = []
    for order in permutations(range(m)):
        mask = [0]*m; values = [game['0'*m]['value']]; gains = [0.]*m
        for j in order:
            mask[j] = 1
            value = game[''.join(map(str,mask))]['value']
            gains[j] = value-values[-1]; values.append(value)
        orders.append(dict(order=list(order),values=values,gains=gains))
    phi = [sum(o['gains'][j] for o in orders)/len(orders) for j in range(m)]
    return dict(phi=phi,orders=orders,baseline=game['0'*m]['value'],prediction=game['1'*m]['value'])


def describe(model, queries, background):
    tree_explainer = shap.TreeExplainer(model,feature_perturbation='tree_path_dependent',model_output='raw')
    replacement_explainer = shap.TreeExplainer(model,data=background,feature_perturbation='interventional',model_output='raw')
    exact = tree_explainer(queries); independent = replacement_explainer(queries)
    approximate = tree_explainer.shap_values(queries,approximate=True)
    rows = []
    for index,query in enumerate(queries):
        game = {}
        for mask in product((0,1),repeat=len(query)):
            key = ''.join(map(str,mask)); game[key] = path_value(model,query,mask)
            replacement = replacement_value(model,query,background,mask)
            assert np.isclose(game[key]['value'],replacement['value'])
            game[key]['replacement'] = replacement
        result = allocation(game)
        assert np.allclose(result['phi'],exact.values[index])
        assert np.allclose(result['phi'],independent.values[index])
        assert np.isclose(result['baseline'],exact.base_values[index])
        assert np.isclose(result['prediction'],model.predict([query])[0])
        rows.append(dict(query=query.tolist(),game=game,**result,
                         library_phi=exact.values[index].tolist(),
                         library_interventional=independent.values[index].tolist(),
                         approximate=approximate[index].tolist()))
    return dict(nodes=nodes(model),rows=rows,background=background.tolist())


def examples():
    model, background = fitted_tree()
    repeated_x = np.asarray([[0.],[1.],[2.]])
    repeated = DecisionTreeRegressor(random_state=0).fit(repeated_x,[0.,2.,8.])
    return dict(versions=dict(numpy=np.__version__,sklearn=sklearn.__version__,shap=shap.__version__),
                balanced=describe(model,background,background),
                repeated=describe(repeated,repeated_x,repeated_x))


if __name__ == '__main__':
    print(json.dumps(examples(),indent=2))
