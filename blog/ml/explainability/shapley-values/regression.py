"""Train the Abalone regressor and reproduce Parts 4, 5 and 7.
Run: python regression.py (downloads the UCI Abalone archive).
"""
import numpy as np
import shap
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from example_data import ASSETS, SEED, abalone, save_json, save_plot, versions


def run():
    X, y, source = abalone()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=SEED)
    model = XGBRegressor(n_estimators=200, max_depth=3, learning_rate=0.05,
                         objective='reg:squarederror', random_state=SEED, n_jobs=2)
    model.fit(X_train, y_train)
    background = X_train.sample(n=100, random_state=SEED)
    rows = X_test.iloc[:200]
    explainer = shap.TreeExplainer(model, data=background,
                                  feature_perturbation='interventional', model_output='raw')
    explanation = explainer(rows)
    prediction = model.predict(rows)
    rebuilt = explanation.base_values + explanation.values.sum(axis=1)
    np.testing.assert_allclose(rebuilt, prediction, rtol=0, atol=2e-5)
    baseline = float(explanation.base_values[0])
    np.testing.assert_allclose(baseline, model.predict(background).mean(), atol=1e-5)
    shap.plots.waterfall(explanation[0], max_display=8, show=False)
    save_plot('regression-waterfall')
    shap.plots.bar(explanation, max_display=8, show=False)
    save_plot('regression-bar')
    np.random.seed(SEED)
    shap.plots.beeswarm(explanation, max_display=8, show=False)
    save_plot('regression-beeswarm')
    shap.plots.scatter(explanation[:, 'Shell weight'], color=explanation[:, 'Shucked weight'], show=False)
    save_plot('regression-dependence')
    shap.plots.violin(explanation.values, features=rows, feature_names=rows.columns,
                      plot_type='layered_violin', show=False)
    save_plot('regression-violin')
    shap.plots.heatmap(explanation, instance_order=np.argsort(prediction), max_display=8, show=False)
    save_plot('regression-heatmap')
    shap.save_html(str(ASSETS / 'regression-force.html'),
                   shap.plots.force(baseline, explanation.values[:30], rows.iloc[:30]))
    result = {'source': source, 'versions': versions(), 'seed': SEED, 'train_rows': len(X_train),
              'test_rows': len(X_test), 'explained_rows': len(rows), 'background_rows': len(background),
              'features': list(X.columns), 'test_mae': mean_absolute_error(y_test, model.predict(X_test)),
              'mean_predictor_mae': mean_absolute_error(y_test, np.full(len(y_test), y_train.mean())),
              'baseline': baseline, 'first_row_index': int(rows.index[0]),
              'first_row': rows.iloc[0].to_dict(), 'first_prediction': prediction[0],
              'first_observed_rings': int(y_test.iloc[0]), 'first_phi': explanation.values[0],
              'mean_abs_phi': np.abs(explanation.values).mean(axis=0),
              'max_reconstruction_error': float(np.abs(rebuilt - prediction).max())}
    save_json('regression-results', result)
    print({k: result[k] for k in ['test_mae','baseline','first_prediction','max_reconstruction_error']})
    return model, rows, explanation


if __name__ == '__main__': run()
