"""Reproduce the six handwritten-note examples and their explanatory figures.

Run from any directory after installing this folder's requirements.txt.
Outputs live beside this script in assets/. Source PDFs and scans are untouched.
"""
from itertools import combinations
from pathlib import Path
import json
import math

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from scipy.integrate import quad
from scipy.optimize import minimize_scalar
from scipy.spatial.distance import cdist, pdist
from scipy.stats import beta
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import silhouette_samples, silhouette_score
from sklearn.naive_bayes import GaussianNB, MultinomialNB

OUT = Path(__file__).resolve().parent / "assets"
OUT.mkdir(exist_ok=True)
plt.rcParams.update({
    "font.family": "DejaVu Sans", "font.size": 12,
    "svg.fonttype": "none", "svg.hashsalt": "handwritten-notes",
    "axes.spines.top": False, "axes.spines.right": False,
    "axes.titleweight": "bold", "savefig.facecolor": "white",
})
GREEN, GOLD, GRAY = "#176753", "#a66016", "#56666e"
results = {}


def near(actual, expected, atol=1e-8):
    np.testing.assert_allclose(actual, expected, atol=atol, rtol=1e-7)


def save(fig, name):
    target = OUT / name
    fig.savefig(target, format="svg", metadata={"Date": None},
                bbox_inches="tight")
    target.write_text("\n".join(line.rstrip() for line in target.read_text().splitlines())+"\n")
    plt.close(fig)


# MLE, MAP and posterior predictive are independently found by optimization/integration.
h, t, a, b = 4, 1, 2, 2
mle = minimize_scalar(lambda p: -h*np.log(p)-t*np.log1p(-p),
                      bounds=(1e-8, 1-1e-8), method="bounded").x
mode = minimize_scalar(lambda p: -beta.logpdf(p, a+h, b+t),
                       bounds=(1e-8, 1-1e-8), method="bounded").x
predictive = quad(lambda p: p*beta.pdf(p, a+h, b+t), 0, 1)[0]
near(mle, .8, 2e-6)
near(mode, 5/7, 2e-6)
near(predictive, 2/3)
results["coin"] = {
    "outcomes": ["H", "H", "T", "H", "H"],
    "likelihoods": {str(p): p**4*(1-p) for p in [.5, .8, .9]},
    "mle": .8, "map": 5/7, "predictive": predictive,
    "posterior": [a+h, b+t],
}
p = np.linspace(.001, .999, 700)
fig, ax = plt.subplots(figsize=(8.4, 4.6), layout="constrained")
ax.plot(p, beta.pdf(p, 2, 2), color=GRAY, label="Prior: Beta(2, 2)")
ax.plot(p, beta.pdf(p, 6, 3), color=GREEN, lw=2.5, label="Posterior: Beta(6, 3)")
likelihood = p**4*(1-p)
ax.plot(p, likelihood/likelihood.max()*2, color=GOLD, ls="--",
        label="Likelihood (scaled)")
ax.axvline(5/7, color=GREEN, alpha=.45, lw=1)
ax.set(xlim=(0, 1), ylim=(0, 3), xlabel="Candidate probability of heads",
       ylabel="Density / scaled likelihood", title="Five tosses update our belief")
ax.legend(frameon=False, loc="upper left", fontsize=10)
save(fig, "coin-posterior.svg")

# Least squares, ridge and the first gradient update.
hours = np.array([1., 2., 3.])
u = hours-hours.mean()
y = np.array([1., 1., 4.])
X = np.column_stack([np.ones(3), u])
ols = LinearRegression().fit(u[:, None], y)
ridge = Ridge(alpha=2).fit(u[:, None], y)
near([ols.intercept_, ols.coef_[0]], [2, 1.5])
near([ridge.intercept_, ridge.coef_[0]], [2, .75])
sse = np.sum((y-ols.predict(u[:, None]))**2)
ridge_sse = np.sum((y-ridge.predict(u[:, None]))**2)
near([sse, ridge_sse], [1.5, 2.625])
gradient = X.T @ -y
step = -.1*gradient
near(gradient, [-6, -3])
near(.5*np.sum((X@step-y)**2), 5.13)
results["linear"] = {
    "hours": hours.tolist(), "y": y.tolist(), "ols": [2, 1.5],
    "predictions": ols.predict(u[:, None]).tolist(),
    "sse": float(sse), "ridge": [2, .75], "ridge_sse": float(ridge_sse),
    "ridge_objective": float(ridge_sse+2*.75**2),
    "first_gradient": gradient.tolist(), "first_step": step.tolist(),
}

# Multinomial NB: class 1 is spam. sklearn estimates the same class/word counts.
word_rows = np.array([[2,1,0], [1,1,0], [0,0,2], [1,0,1]])
labels = np.array([1,1,0,0])
nb = MultinomialNB(alpha=1).fit(word_rows, labels)
spam = nb.predict_proba([[1,1,0]])[0, 1]
near(spam, 147/179)
near(np.exp(nb.feature_log_prob_), [[2/7,1/7,4/7], [4/8,3/8,1/8]])
gnb = GaussianNB(var_smoothing=0).fit([[10],[14],[4],[8]], labels)
gaussian_spam = gnb.predict_proba([[10]])[0,1]
near(gaussian_spam, 1/(1+math.exp(-1.5)))
results["naive_bayes"] = {
    "counts": word_rows.tolist(), "labels": labels.tolist(),
    "spam_probability": float(spam),
    "gaussian_spam_probability": float(gaussian_spam),
}

# Logistic gradients checked by central differences, plus an actual loss reduction.
x = np.array([0.,1.,2.,3.])
y = np.array([0.,0.,1.,1.])
design = np.column_stack([np.ones(4), x])
theta = np.array([-1.5, 1.])


def logistic_loss(coef):
    z = design @ coef
    return np.mean(np.logaddexp(0, z)-y*z)


z = design @ theta
prob = 1/(1+np.exp(-z))
gradient = design.T @ (prob-y)/len(y)
numerical = []
for j in range(2):
    d = np.zeros(2)
    d[j] = 1e-5
    numerical.append((logistic_loss(theta+d)-logistic_loss(theta-d))/2e-5)
near(gradient, numerical)
updated = theta-.5*gradient
near(updated, [-1.5, 1.1156021550271518])
near(logistic_loss(updated), .3150321760477117)
assert logistic_loss(updated) < logistic_loss(theta)
results["logistic"] = {
    "probabilities": prob.tolist(), "gradient": gradient.tolist(),
    "start_loss": float(logistic_loss(theta)),
    "updated": updated.tolist(), "updated_loss": float(logistic_loss(updated)),
}

# Trace K-means and compare the result to a separate implementation.
points = np.array([1.,2.,3.,8.,9.,10.])
centers = np.array([1.,3.])
trace = []
for _ in range(3):
    assignments = np.argmin((points[:,None]-centers[None,:])**2, axis=1)
    centers = np.array([points[assignments==k].mean() for k in range(2)])
    inertia = np.sum((points-centers[assignments])**2)
    trace.append({"centers": centers.tolist(), "labels": assignments.tolist(),
                  "wcss": float(inertia)})
near([r["wcss"] for r in trace], [29.5, 4, 4])
km = KMeans(n_clusters=2, init=np.array([[1.],[3.]]), n_init=1).fit(points[:,None])
near(np.sort(km.cluster_centers_.ravel()), [2, 9])
near(km.inertia_, 4)
sil = silhouette_score(points[:,None], assignments)
near(silhouette_samples(points[:,None], assignments)[1], 6/7)
near(sil, .8065476190476191)
between = cdist(points[:3,None], points[3:,None]).min()
diameter = max(pdist(points[:3,None]).max(), pdist(points[3:,None]).max())
near(between/diameter, 2.5)
# Exhaust all contiguous 1D partitions to verify the optimal WCSS table.
optima = []
for k in range(1, 7):
    best = min(
        sum(float(np.sum((g-g.mean())**2)) for g in np.split(points, cuts))
        for cuts in combinations(range(1, len(points)), k-1)
    )
    optima.append(best)
near(optima, [77.5,4,2.5,1,.5,0])
results["clustering"] = {
    "points": points.tolist(), "trace": trace, "optimal_wcss": optima,
    "silhouette": float(sil), "dunn": float(between/diameter),
    "kmeans_plus_plus_probabilities": ((points-1)**2/199).tolist(),
}
fig, axes = plt.subplots(3, 1, figsize=(8.4, 4.8), layout="constrained")
for ax, center_pair, title in zip(axes, [[1,3], [1.5,7.5], [2,9]],
                                ["Starting centers", "After update 1", "After update 2"]):
    ax.scatter(points, np.zeros(6), color=GRAY, s=55, zorder=3, label="Data")
    ax.scatter(center_pair, [.28,.28], color=[GREEN,GOLD], marker="v",
               s=110, zorder=4, label="Centers")
    for center in center_pair:
        ax.text(center, .46, str(center), ha="center", fontsize=11)
    ax.set(xlim=(.2,10.8), ylim=(-.25,.75), yticks=[], xticks=range(1,11))
    ax.set_title(title, loc="left", fontsize=12)
    ax.spines["left"].set_visible(False)
    ax.grid(axis="x", alpha=.15)
axes[-1].set_xlabel("Activity score")
save(fig, "kmeans-steps.svg")

# PCA covariance, variance ratio and reconstruction checked against sklearn.
X = np.array([[1.,1.], [2.,3.], [3.,2.], [4.,4.]])
mean = X.mean(0)
centered = X-mean
cov = centered.T @ centered/3
pca = PCA(n_components=1).fit(X)
near(cov, [[5/3,4/3], [4/3,5/3]])
near(pca.explained_variance_ratio_, [.9])
reconstructed = pca.inverse_transform(pca.transform(X))
near(reconstructed, [[1,1], [2.5,2.5], [2.5,2.5], [4,4]])
near(np.sum((X-reconstructed)**2), 1)
results["pca"] = {
    "data": X.tolist(), "covariance": cov.tolist(),
    "variance_ratio": .9, "reconstructed": reconstructed.tolist(), "total_error": 1,
}
fig, ax = plt.subplots(figsize=(8.4,5.4), layout="constrained")
ax.plot([.6,4.4], [.6,4.4], color=GREEN, label="First principal direction")
ax.scatter(X[:,0], X[:,1], s=75, color=GOLD, zorder=3, label="Original points")
ax.scatter([2.5], [2.5], s=85, marker="x", color=GREEN, zorder=4,
           label="Reconstruction of B and C")
for point, restored, label in zip(X, reconstructed, "ABCD"):
    ax.plot([point[0],restored[0]], [point[1],restored[1]],
            ls="--", color=GRAY, alpha=.7)
    ax.annotate(label, point, xytext=(7,7), textcoords="offset points")
ax.set(xlim=(.5,4.6), ylim=(.5,4.6), xlabel="Measurement 1", ylabel="Measurement 2",
       title="One PCA coordinate keeps the shared movement")
ax.set_aspect("equal", adjustable="box")
ax.legend(loc="upper left", frameon=False, fontsize=10)
save(fig, "pca-projection.svg")

# Transcription of the ten-point LDA dataset on handwritten page 4.
A = np.array([[4,1],[2,4],[2,3],[3,6],[4,4]], dtype=float)
B = np.array([[9,10],[6,8],[9,5],[8,7],[10,8]], dtype=float)
ma, mb = A.mean(0), B.mean(0)
Ac, Bc = A-ma, B-mb
within = Ac.T@Ac + Bc.T@Bc
w = np.linalg.solve(within, mb-ma)
v = w/np.linalg.norm(w)
near(ma, [3,3.6])
near(mb, [8.4,7.6])
near(within, [[13.2,-2.2],[-2.2,26.4]])
lda = LinearDiscriminantAnalysis().fit(np.vstack([A,B]), [0]*5+[1]*5)
near(lda.coef_[0]/np.linalg.norm(lda.coef_[0]), v)
results["lda"] = {
    "class_a": A.tolist(), "class_b": B.tolist(), "means": [ma.tolist(),mb.tolist()],
    "within_scatter": within.tolist(), "direction": v.tolist(),
    "projected_means": [float(ma@v),float(mb@v)],
    "equal_prior_boundary": float((ma+mb)@v/2),
}
(OUT/"results.json").write_text(json.dumps(results, indent=2)+"\n")
print("Verified MLE/MAP, regression, NB, logistic gradients, clustering, PCA and LDA.")
print("Wrote three figures and assets/results.json.")
