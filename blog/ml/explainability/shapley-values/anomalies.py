"""Reproduce Part 10: explain daily household electricity anomalies on two scales.
Downloads the UCI household archive (~20 MB); no raw data is retained on disk.
Kernel SHAP explains six selected days. Tree SHAP explains all held-out days.
"""
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import shap
from sklearn.ensemble import IsolationForest
from example_data import SEED, uci_member, save_json, save_plot, versions


def run():
    data, source = uci_member('235/individual+household+electric+power+consumption',
                              'household_power_consumption.txt')
    frame = pd.read_csv(data, sep=';', na_values=['?'], low_memory=False)
    measurements = list(frame.columns[2:])
    frame['Date'] = pd.to_datetime(frame['Date'], format='%d/%m/%Y')
    frame[measurements] = frame[measurements].apply(pd.to_numeric, errors='coerce')
    clean = frame.dropna(subset=measurements)
    daily = clean.groupby('Date')[measurements].agg(['mean','std']).dropna()
    daily.columns = [f'{name} {stat}' for name,stat in daily.columns]
    cutoff = int(len(daily)*0.7)
    train, test = daily.iloc[:cutoff], daily.iloc[cutoff:]
    model = IsolationForest(n_estimators=100, max_samples=256, contamination=0.02,
                             random_state=SEED, n_jobs=2)
    model.fit(train)
    decision = model.decision_function(test)
    flagged = decision < 0
    # Explain the three lowest scores and three central normal scores.
    abnormal_positions = np.argsort(decision)[:3]
    normal_positions = np.flatnonzero(~flagged)
    normal_positions = normal_positions[np.argsort(decision[normal_positions])]
    middle = len(normal_positions)//2
    positions = np.concatenate([abnormal_positions, normal_positions[middle:middle+3]])
    rows = test.iloc[positions]
    background = train.sample(n=40, random_state=SEED)

    def decision_output(values):
        return model.decision_function(pd.DataFrame(values, columns=train.columns))

    np.random.seed(SEED)
    kernel = shap.KernelExplainer(decision_output, background, link='identity')
    phi = kernel.shap_values(rows, nsamples=512, l1_reg=0, silent=True)
    np.testing.assert_allclose(kernel.expected_value + phi.sum(axis=1),
                               model.decision_function(rows), atol=1e-6)
    explained = shap.Explanation(values=phi, base_values=np.full(len(rows),kernel.expected_value),
                                 data=rows.to_numpy(), feature_names=list(rows.columns))
    shap.plots.waterfall(explained[0], max_display=8, show=False); save_plot('anomaly-decision')

    tree = shap.TreeExplainer(model, feature_perturbation='tree_path_dependent')
    tree_values = tree(test)
    reconstructed_path = tree_values.base_values + tree_values.values.sum(axis=1)
    # Independently recover the corrected path length from score_samples.
    # For n>2, sklearn uses c(n)=2*(log(n-1)+Euler gamma)-2*(n-1)/n.
    n = model.max_samples_
    c_n = 2*(np.log(n-1)+np.euler_gamma)-2*(n-1)/n
    path_from_scores = -c_n*np.log2(-model.score_samples(test))
    np.testing.assert_allclose(reconstructed_path, path_from_scores, atol=1e-6)
    np.testing.assert_allclose(-np.exp2(-reconstructed_path/c_n)-model.offset_, decision, atol=1e-8)
    shap.plots.waterfall(tree_values[positions[0]], max_display=8, show=False); save_plot('anomaly-path')
    # A small subset keeps the interaction example bounded.
    interactions = tree.shap_interaction_values(rows)
    np.testing.assert_allclose(interactions.sum(axis=2), tree(rows).values, atol=1e-6)
    importance = np.abs(interactions).mean(axis=0)
    fig, ax = plt.subplots(figsize=(9,8))
    im = ax.imshow(importance, cmap='magma')
    ax.set_xticks(range(len(train.columns)), train.columns, rotation=90, fontsize=7)
    ax.set_yticks(range(len(train.columns)), train.columns, fontsize=7)
    fig.colorbar(im, ax=ax, label='Mean absolute interaction entry · corrected path length')
    fig.tight_layout();save_plot('anomaly-interactions')
    result = {'source':source, 'versions':versions(), 'raw_rows':len(frame), 'complete_rows':len(clean),
              'days':len(daily), 'train_days':len(train), 'test_days':len(test),
              'first_test_date':str(test.index[0].date()), 'test_flags':int(flagged.sum()),
              'features':list(train.columns), 'kernel_background_rows':len(background),
              'kernel_explained_dates':[str(x.date()) for x in rows.index], 'kernel_nsamples':512,
              'kernel_baseline':kernel.expected_value, 'first_decision_score':decision[positions[0]],
              'first_kernel_phi':phi[0], 'tree_baseline':tree_values.base_values[0],
              'first_path_length':reconstructed_path[positions[0]], 'offset':model.offset_,
              'max_path_error':np.abs(reconstructed_path-path_from_scores).max()}
    save_json('anomaly-results',result)
    print({k:result[k] for k in ['days','train_days','test_days','test_flags','first_decision_score','first_path_length','max_path_error']})


if __name__ == '__main__': run()
