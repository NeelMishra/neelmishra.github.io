"""Fitted ensemble examples with exact two-feature reference calculations.
Run: python tree_shap_ensembles.py
Exports the JSON and six SVGs beside this file under assets/.
"""
from pathlib import Path
from itertools import product
import json
import numpy as np
import shap
import sklearn
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from tree_shap_examples import allocation, nodes


def exact_rows(predict, background):
    rows = []
    for query in background:
        game = {}
        for mask in product((0, 1), repeat=2):
            completed = background.copy()
            for j, known in enumerate(mask):
                if known:
                    completed[:, j] = query[j]
            game[''.join(map(str, mask))] = dict(value=float(predict(completed).mean()))
        rows.append(dict(query=query.tolist(), game=game, **allocation(game)))
    return rows


def library_check(model, background, rows):
    explanation = shap.TreeExplainer(model, data=background,
        feature_perturbation='interventional', model_output='raw')(background)
    for i, row in enumerate(rows):
        assert np.allclose(row['phi'], explanation.values[i], atol=1e-6)
        assert np.isclose(row['baseline'], explanation.base_values[i])
        row['library_phi'] = explanation.values[i].tolist()
    return rows


def examples():
    x = np.asarray(list(product((0., 1.), repeat=2)))
    y = np.asarray([0., 2., 4., 8.])
    forest = RandomForestRegressor(n_estimators=3, max_depth=2,
                                   max_features=1, random_state=7).fit(x, y)
    trees = [dict(nodes=nodes(t), rows=library_check(t, x, exact_rows(t.predict, x)))
             for t in forest.estimators_]
    rows = library_check(forest, x, exact_rows(forest.predict, x))
    for i, row in enumerate(rows):
        assert np.allclose(row['phi'], np.mean([t['rows'][i]['phi'] for t in trees], axis=0))
        assert np.isclose(row['baseline'], np.mean([t['rows'][i]['baseline'] for t in trees]))
        assert np.isclose(row['prediction'], np.mean([t['rows'][i]['prediction'] for t in trees]))
    cohorts = []
    for name, indices in [('all', [0, 1, 2, 3]), ('a_zero', [0, 1]), ('a_one', [2, 3])]:
        phi = np.asarray([rows[i]['phi'] for i in indices])
        cohorts.append(dict(name=name, indices=indices, signed_mean=phi.mean(0).tolist(),
                            mean_absolute=np.abs(phi).mean(0).tolist(),
                            scatter='assets/tree-shap-cohort-'+name+'-rows.svg',
                            bars='assets/tree-shap-cohort-'+name+'-means.svg'))
    # Four observations at each binary input; class-1 counts are 1, 2, 3, 4.
    cx = np.repeat(x, 4, axis=0)
    cy = np.asarray([0,0,0,1, 0,0,1,1, 0,1,1,1, 1,1,1,1])
    classifier = GradientBoostingClassifier(n_estimators=4, max_depth=2,
                        learning_rate=.5, random_state=0).fit(cx, cy)
    classifier_rows = library_check(classifier, x, exact_rows(classifier.decision_function, x))
    probabilities = classifier.predict_proba(x)[:, 1]
    for i, row in enumerate(classifier_rows):
        row['probability'] = float(probabilities[i])
        assert np.isclose(1/(1+np.exp(-row['prediction'])), row['probability'])
    return dict(versions=dict(numpy=np.__version__, sklearn=sklearn.__version__, shap=shap.__version__),
                background=x.tolist(), training_targets=y.tolist(), trees=trees, rows=rows,
                cohorts=cohorts, classifier=dict(rows=classifier_rows,
                    mean_probability=float(probabilities.mean()),
                    sigmoid_baseline=float(1/(1+np.exp(-classifier_rows[0]['baseline'])))))


def plots(data, folder):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    plt.rcParams.update({'font.size': 13, 'svg.fonttype': 'none', 'svg.hashsalt': 'tree-ensemble-notes',
                         'axes.spines.top': False, 'axes.spines.right': False,
                         'figure.facecolor': '#fffdf8', 'axes.facecolor': '#fffdf8'})
    labels = {'all': 'All four rows', 'a_zero': 'Only A = 0 rows', 'a_one': 'Only A = 1 rows'}
    for cohort in data['cohorts']:
        fig, ax = plt.subplots(figsize=(5, 3.2), layout='constrained')
        for j in range(2):
            for i in cohort['indices']:
                value = data['background'][i][j]
                ax.scatter(data['rows'][i]['phi'][j], j+(-.07 if i%2==0 else .07),
                           color='#276a9b' if value==0 else '#b95127', s=65, zorder=3)
        ax.axvline(0, color='#74867a', linewidth=1)
        ax.set(yticks=[0, 1], yticklabels=['A', 'B'], xlim=(-3.3, 3.3), ylim=(1.45, -.5),
               xlabel='Signed contribution (score units)', title=labels[cohort['name']])
        ax.set_xticks([-3, 0, 3]);ax.grid(axis='x', alpha=.16)
        for value, color in [(0, '#276a9b'), (1, '#b95127')]:
            ax.scatter([], [], c=color, s=55, label='Feature value '+str(value))
        ax.legend(loc='upper center', bbox_to_anchor=(.5, -.28), ncol=1, frameon=False, fontsize=11)
        fig.savefig(folder/cohort['scatter'], metadata={'Date': None});plt.close(fig)
        fig, ax = plt.subplots(figsize=(5, 3.2), layout='constrained')
        y = np.arange(2)
        ax.barh(y-.18, cohort['signed_mean'], height=.32, color='#276a9b', label='Signed mean')
        ax.barh(y+.18, cohort['mean_absolute'], height=.32, color='#276b4c', label='Mean absolute')
        for values, offset in [(cohort['signed_mean'], -.18), (cohort['mean_absolute'], .18)]:
            for j, value in enumerate(values):
                label = format(0. if abs(value) < 1e-12 else value, '.3g')
                ax.text(value+(.09 if value>=0 else -.09), j+offset, label,
                        va='center', ha='left' if value>=0 else 'right', fontsize=12)
        ax.axvline(0, color='#74867a', linewidth=1)
        ax.set(yticks=[0, 1], yticklabels=['A', 'B'], xlim=(-3.5, 3.5), ylim=(1.55, -.55),
               xlabel='Average contribution (score units)', title=labels[cohort['name']])
        ax.set_xticks([-3, 0, 3]);ax.grid(axis='x', alpha=.16)
        ax.legend(loc='upper center', bbox_to_anchor=(.5, -.28), frameon=False, fontsize=11)
        fig.savefig(folder/cohort['bars'], metadata={'Date': None});plt.close(fig)


if __name__ == '__main__':
    folder = Path(__file__).resolve().parent
    data = examples()
    (folder/'assets/tree-shap-ensembles.json').write_text(json.dumps(data, indent=2)+'\n')
    plots(data, folder)
    print('Verified three trees, their mean, and classifier raw explanations on all four rows; wrote JSON and six SVGs.')
