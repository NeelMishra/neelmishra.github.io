"""Reproduce the Linear Model Explainability series.

Python 3.12; install requirements.txt, then run this file.
All data are invented for teaching. Plots and results are written beside this file.
"""
from pathlib import Path
import itertools
import json
import platform

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import scipy
from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
import sklearn
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import statsmodels.api as sm
import statsmodels
import shap

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
NAMES = ["Asha", "Ben", "Cara", "Dev"]
X = np.array([[1, 0], [1, 1], [3, 0], [3, 1]], dtype=float)
Y = np.array([27, 33, 33, 47], dtype=float)
MAYA = np.array([4, 1], dtype=float)
FEATURES = ["Visits", "Premium"]
HOLDOUT_X = np.array(
    [[0, 0], [1, 1], [2, 0], [2, 1], [3, 0], [4, 0], [4, 1], [5, 1]],
    dtype=float,
)
HOLDOUT_Y = np.array([21, 34, 32, 38, 36, 39, 52, 53], dtype=float)
BLUE, ORANGE, GREEN = "#245ba8", "#b3501d", "#147a63"


def curve(visits, premium):
    """A separate, stipulated model for Part 3, not a refit of the four rows."""
    return 20 + 2 * np.asarray(visits) + np.asarray(visits) ** 2 + 10 * premium


def interaction(visits, premium):
    """A separate model for Part 4."""
    return 20 + 5 * np.asarray(visits) + 10 * premium + 2 * np.asarray(visits) * premium


def expanded(x):
    """Two deliberately redundant pairs for the clustering lesson."""
    return np.column_stack([x[:, 0], 10 * x[:, 0], x[:, 1], x[:, 1]])


def coalition_value(model, row, background, known):
    replaced = background.copy()
    for j in known:
        replaced[:, j] = row[j]
    return float(model.predict(replaced).mean())


def enumerate_shap(model, row, background):
    """Independent check: average marginal changes over every reveal order."""
    total = np.zeros(len(row))
    orders = list(itertools.permutations(range(len(row))))
    for order in orders:
        known = []
        before = coalition_value(model, row, background, known)
        for j in order:
            known.append(j)
            after = coalition_value(model, row, background, known)
            total[j] += after - before
            before = after
    return total / len(orders)


def save(fig, name):
    fig.savefig(ASSETS / (name + ".svg"), bbox_inches="tight", facecolor="white")
    plt.close(fig)


def figures(model, fit, scaled_model, linked, phi, baseline):
    plt.rcParams.update({
        "font.family": "DejaVu Sans", "font.size": 11,
        "axes.spines.top": False, "axes.spines.right": False,
        "axes.labelcolor": "#243444", "text.color": "#243444",
        "svg.fonttype": "none", "svg.hashsalt": "linear-model-explainability",
        "savefig.transparent": False,
    })
    pred = model.predict(X)
    fig, ax = plt.subplots(figsize=(8, 3.5), layout="constrained")
    labels = ["Starting amount", "4 visits × 5", "Premium × 10", "Prediction"]
    for i, (bottom, height) in enumerate([(0, 20), (20, 20), (40, 10), (0, 50)]):
        ax.bar(i, height, bottom=bottom, color=[GREEN, BLUE, ORANGE, GREEN][i], width=.62)
        ax.text(i, bottom + height + 1, str(height), ha="center", weight="bold")
    ax.set(xticks=range(4), xticklabels=labels, ylabel="Predicted spending ($)", ylim=(0, 60))
    ax.set_title("Maya: 20 + 20 + 10 = 50", loc="left", weight="bold")
    save(fig, "maya-prediction")

    fig, axes = plt.subplots(1, 2, figsize=(9, 3.7), layout="constrained")
    for ax, coefs, title, unit in [
        (axes[0], model.coef_, "Original inputs", "Dollars per one-unit change"),
        (axes[1], scaled_model.coef_, "Standardized inputs", "Dollars per one standard deviation"),
    ]:
        ax.barh(FEATURES, coefs, color=[BLUE, ORANGE])
        for i, c in enumerate(coefs):
            ax.text(c + .15, i, f"{c:.0f}", va="center")
        ax.set(xlim=(0, 12), xlabel=unit)
        ax.set_title(title, loc="left", weight="bold")
    save(fig, "coefficient-units")

    visits = np.arange(6)
    fig, ax = plt.subplots(figsize=(8, 4), layout="constrained")
    ax.plot(visits, 20 + 5 * visits, "o--", color=BLUE, label="Original Basic: 20 + 5 × visits")
    ax.plot(visits, curve(visits, 0), "s-", color=ORANGE, label="Curved Basic: 20 + 2 × visits + visits²")
    ax.set(xlabel="Monthly visits", ylabel="Predicted spending ($)", xticks=visits)
    ax.legend(loc="upper left", fontsize=10)
    save(fig, "curved-model")

    fig, ax = plt.subplots(figsize=(8, 4), layout="constrained")
    for premium, color in [(0, BLUE), (1, ORANGE)]:
        ax.plot(visits, interaction(visits, premium), "o-", color=color,
                label=["Basic: +5 per visit", "Premium: +7 per visit"][premium])
    ax.set(xlabel="Monthly visits", ylabel="Predicted spending ($)", xticks=visits)
    ax.legend()
    save(fig, "interaction")

    fig, ax = plt.subplots(figsize=(8, 4), layout="constrained")
    dendrogram(linked, labels=["Visits", "Visit minutes", "Premium", "Plan code"], ax=ax,
               color_threshold=1, above_threshold_color="#999999")
    ax.axhline(1, color=ORANGE, linestyle="--", label="Cut at distance 1")
    ax.set(ylabel="Ward linkage distance", ylim=(-.3, 4.8))
    ax.legend(loc="upper right")
    save(fig, "feature-clusters")

    fig, axes = plt.subplots(1, 2, figsize=(9, 4), layout="constrained")
    axes[0].scatter(pred, Y, color=BLUE)
    axes[0].plot([20, 50], [20, 50], "--", color="#777777")
    axes[0].set(xlabel="Predicted spending ($)", ylabel="Observed spending ($)",
                title="Actual versus predicted")
    axes[1].scatter(pred, Y - pred, color=ORANGE)
    axes[1].axhline(0, color="#777777", linestyle="--")
    axes[1].set(xlabel="Predicted spending ($)", ylabel="Observed − predicted ($)",
                ylim=(-4, 4), title="Residuals")
    for i, name in enumerate(NAMES):
        axes[0].annotate(name, (pred[i], Y[i]), xytext=(5, 4), textcoords="offset points")
        axes[1].annotate(name, (pred[i], Y[i] - pred[i]), xytext=(5, 4), textcoords="offset points")
    save(fig, "prediction-errors")

    fig, ax = plt.subplots(figsize=(7, 3.8), layout="constrained")
    corr = np.corrcoef(expanded(X), rowvar=False)
    im = ax.imshow(corr, vmin=-1, vmax=1, cmap="coolwarm")
    labs = ["Visits", "Minutes", "Premium", "Plan code"]
    ax.set(xticks=range(4), yticks=range(4), xticklabels=labs, yticklabels=labs)
    for i in range(4):
        for j in range(4):
            ax.text(j, i, f"{corr[i, j]:.0f}", ha="center", va="center", color="black")
    fig.colorbar(im, ax=ax, label="Correlation")
    save(fig, "feature-correlation")

    fig, ax = plt.subplots(figsize=(8, 3.5), layout="constrained")
    ax.errorbar(model.coef_, [0, 1], xerr=fit.conf_int()[1:, 1] - model.coef_,
                fmt="o", color=BLUE, capsize=5, label="95% t intervals")
    ax.axvline(0, linestyle="--", color="#777777")
    ax.set(yticks=[0, 1], yticklabels=["Visits: $ per visit", "Premium: $ per switch"],
           xlabel="Coefficient and interval", ylim=(-.6, 1.6))
    ax.set_title("Four rows leave just one residual degree of freedom", fontsize=12, loc="left")
    ax.legend()
    save(fig, "coefficient-uncertainty")

    effects = X * model.coef_
    fig, axes = plt.subplots(1, 2, figsize=(9, 3.8), layout="constrained")
    offsets = [-.09, -.03, .03, .09]
    for j in range(2):
        axes[0].scatter(effects[:, j], j + np.array(offsets), color=[BLUE, ORANGE][j])
        axes[0].scatter([MAYA[j] * model.coef_[j]], [j], marker="x", s=110, color="black")
    axes[0].set(yticks=[0, 1], yticklabels=FEATURES, xlabel="Raw contribution ($)",
                ylim=(-.5, 1.5), xlim=(-1, 23), title="Four customers; × marks Maya")
    axes[1].barh(FEATURES, np.abs(effects).mean(axis=0), color=[BLUE, ORANGE])
    axes[1].set(xlabel="Mean absolute raw contribution ($)", xlim=(0, 13), title="Average magnitude")
    save(fig, "effect-plots")

    fig, ax = plt.subplots(figsize=(8, 3.6), layout="constrained")
    ax.plot(visits, 5 * visits, "o-", color=BLUE, label="Visits contribution: 5 × visits")
    ax.plot(visits, 2 * visits + visits ** 2, "s-", color=ORANGE,
            label="Part 3 grouped contribution: 2 × visits + visits²")
    ax.set(xlabel="Monthly visits", ylabel="Contribution, excluding intercept ($)", xticks=visits)
    ax.legend()
    save(fig, "effect-trends")

    fig, ax = plt.subplots(figsize=(8, 3.6), layout="constrained")
    for i, (bottom, height, color) in enumerate(
            [(0, baseline, GREEN), (baseline, phi[0], BLUE),
             (baseline + phi[0], phi[1], ORANGE), (0, 50, GREEN)]):
        ax.bar(i, height, bottom=bottom, color=color, width=.6)
        ax.text(i, bottom + height + 1, f"{height:.0f}", ha="center", weight="bold")
    ax.set(xticks=range(4), xticklabels=["Reference mean", "Extra visits", "Premium", "Maya"],
           ylabel="Predicted spending ($)", ylim=(0, 60))
    ax.set_title("The same prediction, explained from the reference mean", loc="left", fontsize=12)
    save(fig, "linear-shap")


def main():
    ASSETS.mkdir(exist_ok=True)
    model = LinearRegression().fit(X, Y)
    fit = sm.OLS(Y, sm.add_constant(X)).fit()
    np.testing.assert_allclose(np.r_[model.intercept_, model.coef_], [20, 5, 10])
    np.testing.assert_allclose(fit.params, [20, 5, 10])
    pred = model.predict(X)
    residual = Y - pred
    np.testing.assert_allclose(residual, [2, -2, -2, 2])
    np.testing.assert_allclose(sm.add_constant(X).T @ residual, 0, atol=1e-12)
    scaler = StandardScaler().fit(X)
    scaled_model = LinearRegression().fit(scaler.transform(X), Y)
    np.testing.assert_allclose(scaled_model.coef_, [5, 5])
    np.testing.assert_allclose(scaled_model.predict(scaler.transform(X)), pred)
    z = StandardScaler().fit_transform(expanded(X))
    linked = linkage(z.T, method="ward", metric="euclidean")
    groups = fcluster(linked, t=1, criterion="distance")
    assert groups[0] == groups[1] and groups[2] == groups[3] and groups[0] != groups[2]
    redundant_model = LinearRegression().fit(expanded(X), Y)
    np.testing.assert_allclose(redundant_model.predict(expanded(HOLDOUT_X)),
                               model.predict(HOLDOUT_X), atol=1e-10)
    background = X
    baseline = float(model.predict(background).mean())
    phi = model.coef_ * (MAYA - background.mean(axis=0))
    brute = enumerate_shap(model, MAYA, background)
    explainer = shap.LinearExplainer(model, shap.maskers.Independent(background))
    explanation = explainer(MAYA.reshape(1, -1))
    np.testing.assert_allclose(phi, [10, 5])
    np.testing.assert_allclose(brute, phi)
    np.testing.assert_allclose(explanation.values[0], phi)
    np.testing.assert_allclose(explanation.base_values[0], baseline)
    np.testing.assert_allclose(baseline + sum(phi), model.predict([MAYA])[0])
    # Verify the same identity on correlated backgrounds and negative coefficients.
    rng = np.random.default_rng(42)
    for _ in range(50):
        bg = rng.normal(size=(12, 3))
        bg[:, 2] = 2 * bg[:, 0] + .1 * rng.normal(size=12)
        coef = rng.normal(size=3)
        lm = LinearRegression().fit(bg, 3 + bg @ coef)
        row = rng.normal(size=3)
        np.testing.assert_allclose(enumerate_shap(lm, row, bg),
                                   lm.coef_ * (row - bg.mean(0)), atol=1e-10)
    test_pred = model.predict(HOLDOUT_X)
    results = {
        "versions": {"python": platform.python_version(), "numpy": np.__version__,
                     "scipy": scipy.__version__, "sklearn": sklearn.__version__,
                     "statsmodels": statsmodels.__version__, "shap": shap.__version__,
                     "matplotlib": matplotlib.__version__},
        "customers": [dict(name=n, visits=int(x[0]), premium=int(x[1]),
                           observed=float(y), prediction=float(p), residual=float(r))
                      for n, x, y, p, r in zip(NAMES, X, Y, pred, residual)],
        "fit": {"intercept": float(model.intercept_), "coefficients": model.coef_.tolist(),
                "standard_errors": fit.bse.tolist(), "ci95": fit.conf_int().tolist(),
                "residual_df": int(fit.df_resid), "training_mae": float(np.abs(residual).mean()),
                "training_rmse": float(np.sqrt(np.mean(residual ** 2)))},
        "scaling": {"mean": scaler.mean_.tolist(), "scale": scaler.scale_.tolist(),
                    "intercept": float(scaled_model.intercept_),
                    "coefficients": scaled_model.coef_.tolist()},
        "clustering": {"groups": groups.tolist(), "linkage": linked.tolist(),
                       "redundant_coefficients": redundant_model.coef_.tolist()},
        "holdout": {"x": HOLDOUT_X.tolist(), "observed": HOLDOUT_Y.tolist(),
                    "predicted": test_pred.tolist(), "mae": float(abs(HOLDOUT_Y - test_pred).mean()),
                    "rmse": float(np.sqrt(np.mean((HOLDOUT_Y - test_pred) ** 2)))},
        "curves": [{"visits": v, "basic": int(curve(v, 0)), "premium": int(curve(v, 1))}
                   for v in range(6)],
        "interactions": [{"visits": v, "basic": int(interaction(v, 0)),
                           "premium": int(interaction(v, 1))} for v in range(6)],
        "shap": {"baseline": baseline, "maya": MAYA.tolist(), "values": phi.tolist(),
                 "brute_values": brute.tolist(), "library_values": explanation.values[0].tolist(),
                 "coalitions": {name: coalition_value(model, MAYA, X, known)
                                for name, known in [("none", []), ("visits", [0]),
                                                    ("premium", [1]), ("both", [0, 1])]},
                 "random_checks": 50},
    }
    (ASSETS / "results.json").write_text(json.dumps(results, indent=2) + "\n")
    figures(model, fit, scaled_model, linked, phi, baseline)
    print(json.dumps(results, indent=2))
    print("All checks passed; regenerated 11 figures and assets/results.json.")


if __name__ == "__main__":
    main()
