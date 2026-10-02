"""Reproduce Part 9 with the UCI mushroom data and native CatBoost categories."""
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import shap
from catboost import CatBoostClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from example_data import SEED, uci_member, save_json, save_plot, versions


def run():
    data, source = uci_member('73/mushroom', 'agaricus-lepiota.data')
    names = ['class','cap-shape','cap-surface','cap-color','bruises','odor',
             'gill-attachment','gill-spacing','gill-size','gill-color','stalk-shape',
             'stalk-root','stalk-surface-above-ring','stalk-surface-below-ring',
             'stalk-color-above-ring','stalk-color-below-ring','veil-type','veil-color',
             'ring-number','ring-type','spore-print-color','population','habitat']
    frame = pd.read_csv(data, names=names, dtype=str)
    X = frame.drop(columns='class').fillna('missing')
    # '?' is an explicit unknown category for stalk-root; keep it as a string.
    y = (frame['class'] == 'p').astype(int)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2,
                                                     random_state=SEED, stratify=y)
    model = CatBoostClassifier(iterations=160, depth=4, learning_rate=0.05,
                                loss_function='Logloss', random_seed=SEED,
                                thread_count=2, verbose=False, allow_writing_files=False)
    model.fit(X_train, y_train, cat_features=list(X.columns))
    rows = X_test.iloc[:200]
    explanation = shap.TreeExplainer(model, feature_perturbation='tree_path_dependent',
                                     model_output='raw')(rows)
    rebuilt = explanation.base_values + explanation.values.sum(axis=1)
    np.testing.assert_allclose(rebuilt, model.predict(rows, prediction_type='RawFormulaVal'), atol=1e-6)
    assert explanation.values.shape == (len(rows), 22)
    shap.plots.waterfall(explanation[0], max_display=10, show=False); save_plot('categorical-waterfall')
    odor = rows.columns.get_loc('odor')
    labels = {'a':'almond','l':'anise','c':'creosote','y':'fishy','f':'foul',
              'm':'musty','n':'none','p':'pungent','s':'spicy'}
    categories = sorted(rows['odor'].unique())
    groups = [explanation.values[rows['odor'].to_numpy() == c, odor] for c in categories]
    fig, ax = plt.subplots(figsize=(9,4.5))
    ax.boxplot(groups, orientation='horizontal', tick_labels=[f'{labels[c]} (n={len(g)})' for c,g in zip(categories,groups)])
    ax.axvline(0, color='#888', linewidth=1)
    ax.set_xlabel('Odor SHAP value · raw log-odds of poisonous class')
    fig.tight_layout(); save_plot('categorical-odor')
    result = {'source':source, 'versions': versions(), 'train_rows':len(X_train), 'test_rows':len(X_test),
              'features':list(X.columns), 'shape':list(explanation.values.shape),
              'test_accuracy':accuracy_score(y_test, model.predict(X_test).ravel()),
              'first_row_index':int(rows.index[0]), 'first_odor':rows.iloc[0]['odor'],
              'first_odor_phi':explanation.values[0,odor], 'first_margin':rebuilt[0],
              'max_reconstruction_error':np.abs(rebuilt-model.predict(rows,prediction_type='RawFormulaVal')).max()}
    save_json('categorical-results',result);print(result['test_accuracy'],result['shape'])


if __name__ == '__main__': run()
