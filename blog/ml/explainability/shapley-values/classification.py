"""Reproduce Part 8: raw margins, probabilities, and per-class explanations."""
import numpy as np
import shap
from scipy.special import expit, softmax
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from example_data import SEED, abalone, save_json, save_plot, versions


def run():
    X, rings, source = abalone()
    train, test = train_test_split(np.arange(len(X)), test_size=0.2, random_state=SEED)
    X_train, X_test = X.iloc[train], X.iloc[test]
    background = X_train.sample(n=100, random_state=SEED)
    rows = X_test.iloc[:100]
    # Learn a data-derived binary threshold from the training partition only.
    threshold = float(rings.iloc[train].mean())
    binary_y = (rings > threshold).astype(int)
    params = dict(n_estimators=160, max_depth=3, learning_rate=0.05, random_state=SEED, n_jobs=2)
    binary = XGBClassifier(objective='binary:logistic', **params)
    binary.fit(X_train, binary_y.iloc[train])
    raw = shap.TreeExplainer(binary, data=background, feature_perturbation='interventional',
                             model_output='raw')(rows)
    margins = raw.base_values + raw.values.sum(axis=1)
    np.testing.assert_allclose(margins, binary.predict(rows, output_margin=True), atol=1e-5)
    np.testing.assert_allclose(expit(margins), binary.predict_proba(rows)[:, 1], atol=1e-6)
    prob = shap.TreeExplainer(binary, data=background, feature_perturbation='interventional',
                              model_output='probability')(rows)
    np.testing.assert_allclose(prob.base_values + prob.values.sum(axis=1),
                               binary.predict_proba(rows)[:, 1], atol=1e-6)
    shap.plots.waterfall(raw[0], max_display=8, show=False); save_plot('binary-waterfall')
    # Fixed teaching bands, not biologically validated age categories.
    multi_y = np.where(rings <= 8, 0, np.where(rings <= 11, 1, 2))
    multi = XGBClassifier(objective='multi:softprob', num_class=3, **params)
    multi.fit(X_train, multi_y[train])
    values = shap.TreeExplainer(multi, feature_perturbation='tree_path_dependent',
                               model_output='raw')(rows)
    assert values.values.shape == (len(rows), X.shape[1], 3)
    logits = values.base_values + values.values.sum(axis=1)
    np.testing.assert_allclose(logits, multi.predict(rows, output_margin=True), atol=1e-5)
    np.testing.assert_allclose(softmax(logits, axis=1), multi.predict_proba(rows), atol=1e-6)
    shap.plots.waterfall(values[0, :, 2], max_display=8, show=False); save_plot('multiclass-waterfall')
    winner = multi.predict_proba(rows).argmax(axis=1)
    selected = np.take_along_axis(values.values, winner[:, None, None], axis=2)[:, :, 0]
    selected_base = np.take_along_axis(values.base_values, winner[:, None], axis=1)[:, 0]
    np.testing.assert_allclose(selected_base + selected.sum(axis=1),
                               logits[np.arange(len(rows)), winner], atol=1e-5)
    result = {'source': source, 'versions': versions(), 'binary_threshold': threshold,
              'binary_test_accuracy': accuracy_score(binary_y.iloc[test], binary.predict(X_test)),
              'binary_base_margin': raw.base_values[0], 'binary_margin': margins[0],
              'binary_probability': expit(margins[0]), 'binary_base_probability': prob.base_values[0],
              'binary_phi': raw.values[0], 'multi_shape': list(values.values.shape),
              'multi_test_accuracy': accuracy_score(multi_y[test], multi.predict(X_test)),
              'multi_logits': logits[0], 'multi_probabilities': softmax(logits[0]),
              'mean_abs_by_class': np.abs(values.values).mean(axis=0),
              'winner_mean_abs': np.abs(selected).mean(axis=0)}
    save_json('classification-results', result)
    print({k: result[k] for k in ['binary_test_accuracy','binary_margin','binary_probability','multi_shape','multi_test_accuracy']})


if __name__ == '__main__': run()
