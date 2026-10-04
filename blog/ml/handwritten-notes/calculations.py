"""Reproduce the handwritten-note examples and their explanatory figures.

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
from scipy.linalg import eigh
from scipy.optimize import minimize_scalar
from scipy.spatial.distance import cdist, pdist
from scipy.stats import beta, multivariate_normal
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


def save(fig, name, *, crop=True):
    target = OUT / name
    fig.savefig(target, format="svg", metadata={"Date": None},
                bbox_inches="tight" if crop else None)
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
eigenvalues, directions = np.linalg.eigh(cov)
pc1, pc2 = directions[:,1], directions[:,0]
# Fix eigenvector signs to match the worked scores.
if pc1[0] < 0:
    pc1 = -pc1
if pc2[0] < 0:
    pc2 = -pc2
pca_scores = centered@pc1
near(np.column_stack([pc1,pc2]).T@np.column_stack([pc1,pc2]), np.eye(2))
near(cov@pc1, eigenvalues[1]*pc1)
near(cov@pc2, eigenvalues[0]*pc2)
near(np.var(pca_scores, ddof=1), eigenvalues[1])
near(mean+np.outer(pca_scores,pc1), reconstructed)
near((X-reconstructed)@pc1, np.zeros(len(X)))
results["pca"] = {
    "data": X.tolist(), "covariance": cov.tolist(),
    "variance_ratio": .9, "reconstructed": reconstructed.tolist(), "total_error": 1,
}
fig, (ax, score_ax) = plt.subplots(
    2, 1, figsize=(7.2,8.4), layout="constrained",
    gridspec_kw={"height_ratios": [3.3,1]},
)
pc1_line = mean+np.outer([-2.7,2.7],pc1)
pc2_line = mean+np.outer([-2.7,2.7],pc2)
ax.plot(pc1_line[:,0], pc1_line[:,1], color=GREEN, lw=2,
        label="PC1: keep 90%", gid="pca-pc1-axis")
ax.plot(pc2_line[:,0], pc2_line[:,1], color="#244e78", ls=":", lw=1.5,
        label="PC2: discard 10%", gid="pca-pc2-axis")
ax.scatter(X[:,0], X[:,1], s=70, color=GOLD, zorder=3,
           label="Original points", gid="pca-original-points")
ax.scatter(reconstructed[:,0], reconstructed[:,1], s=160, facecolors="none",
           edgecolors=GREEN, linewidths=1.8, zorder=4,
           label="Projection onto PC1", gid="pca-projected-points")
for point, restored, label in zip(X, reconstructed, "ABCD"):
    ax.plot([point[0],restored[0]], [point[1],restored[1]],
            ls="--", color=GRAY, lw=1.5, gid=f"pca-projection-{label}")
ax.annotate("B and C project to\n(2.5, 2.5)", (2.5,2.5), xytext=(3.25,1.3),
            arrowprops={"arrowstyle": "->", "color": GREEN},
            color=GREEN, fontsize=10, ha="center")
for point, label in zip(X, "ABCD"):
    ax.annotate(label, point, xytext=(7,7), textcoords="offset points")
ax.set(xlim=(.5,4.5), ylim=(.5,4.5), xlabel="Measurement 1", ylabel="Measurement 2",
       title="1. Project perpendicularly onto PC1")
ax.set_aspect("equal", adjustable="box")
ax.legend(loc="lower center", bbox_to_anchor=(.5,1.12),
          ncol=2, frameon=False, fontsize=9)
score_rows = np.array([0,.16,-.16,0])
score_points = score_ax.scatter(pca_scores, score_rows, s=65, color=GOLD,
                               zorder=3, gid="pca-score-points")
near(score_points.get_offsets()[:,0], pca_scores)
score_ax.axvline(0, color=GREEN, ls=":", lw=1)
for score, row, label in zip(pca_scores, score_rows, "ABCD"):
    score_ax.annotate(f"{label}: {score:.2f}", (score,row),
                      xytext=(0,10 if row >= 0 else -16),
                      textcoords="offset points", ha="center", fontsize=9)
score_ax.set(xlim=(-2.8,2.8), ylim=(-.65,.65), yticks=[],
             xlabel="PC1 score z = v₁ᵀ(x - mean)",
             title="2. Keep just the one-dimensional scores")
score_ax.spines["left"].set_visible(False)
save(fig, "pca-projection.svg", crop=False)

# Transcription of the ten-point LDA dataset on handwritten page 4.
A = np.array([[4,1],[2,4],[2,3],[3,6],[4,4]], dtype=float)
B = np.array([[9,10],[6,8],[9,5],[8,7],[10,8]], dtype=float)
ma, mb = A.mean(0), B.mean(0)
Ac, Bc = A-ma, B-mb
scatter_a, scatter_b = Ac.T@Ac, Bc.T@Bc
within = scatter_a + scatter_b
w = np.linalg.solve(within, mb-ma)
v = w/np.linalg.norm(w)
near(ma, [3,3.6])
near(mb, [8.4,7.6])
near(scatter_a, [[4,-2],[-2,13.2]])
near(scatter_b, [[9.2,-.2],[-.2,13.2]])
near(within, [[13.2,-2.2],[-2.2,26.4]])
residual_matrix = np.vstack([Ac,Bc])
near(residual_matrix.T@residual_matrix, within)
near(within.T, within)
assert np.linalg.matrix_rank(Ac[:2]) == 2
assert np.linalg.matrix_rank(residual_matrix) == 2
assert np.all(np.linalg.eigvalsh(within) > 0)
duplicate_residuals = np.array([[-1.,-1.],[1.,1.]])
duplicate_scatter = duplicate_residuals.T@duplicate_residuals
zero_spread_direction = np.array([1.,-1.])
near(duplicate_scatter@zero_spread_direction, [0,0])
near(zero_spread_direction@duplicate_scatter@zero_spread_direction, 0)
near(np.array([1.,1.])@duplicate_scatter@np.array([1.,1.]), 8)
near(2*duplicate_scatter@zero_spread_direction, [0,0])
near(np.linalg.eigvalsh(duplicate_scatter), [0,4])
assert np.linalg.matrix_rank(duplicate_scatter) == 1
assert np.all(np.linalg.eigvalsh(duplicate_scatter) >= 0)
regularized_scatter = duplicate_scatter+.1*np.eye(2)
near(np.linalg.eigvalsh(regularized_scatter), [.1,4.1])
near(zero_spread_direction@regularized_scatter@zero_spread_direction, .2)
quadratic_probe = np.array([.7,-.3])
quadratic_step = 1e-6
for matrix in (within,np.array([[2.,3.],[1.,4.]]),duplicate_scatter,regularized_scatter):
    analytic = (matrix+matrix.T)@quadratic_probe
    for index in range(2):
        offset = np.eye(2)[index]*quadratic_step
        plus, minus = quadratic_probe+offset, quadratic_probe-offset
        numeric = (plus@matrix@plus-minus@matrix@minus)/(2*quadratic_step)
        near(numeric, analytic[index])
near(2*residual_matrix.T@(residual_matrix@quadratic_probe), 2*within@quadratic_probe)
gap = mb-ma
maximum_fisher = float(gap@w)
constraint_direction = w/np.sqrt(maximum_fisher)
near(constraint_direction@within@constraint_direction, 1)
near(np.outer(gap,gap)@constraint_direction,
     maximum_fisher*(within@constraint_direction))
gradient = (2*gap*(gap@constraint_direction)
            -2*maximum_fisher*(within@constraint_direction))
near(gradient, [0,0])
step = 1e-6
for index in range(2):
    offset = np.eye(2)[index]*step
    plus, minus = constraint_direction+offset, constraint_direction-offset
    value_plus = (plus@gap)**2-maximum_fisher*(plus@within@plus-1)
    value_minus = (minus@gap)**2-maximum_fisher*(minus@within@minus-1)
    near((value_plus-value_minus)/(2*step), gradient[index])
candidates = [np.array([1.,0.]), np.array([0.,1.]), gap, v]
fisher_scores = [(candidate@gap)**2/(candidate@within@candidate)
                for candidate in candidates]
near(fisher_scores, [2.2090909091,.6060606061,2.8632679650,3.1313700384])
angles = np.linspace(0,np.pi,2001)
for angle in angles:
    candidate = np.array([np.cos(angle),np.sin(angle)])
    assert (candidate@gap)**2/(candidate@within@candidate) <= maximum_fisher+1e-10
probe = np.array([1.,-.25])
coefficient = (probe@gap)/maximum_fisher
residual = probe-coefficient*w
near(residual@within@residual,
     probe@within@probe-(probe@gap)**2/maximum_fisher)
overall_mean = (len(A)*ma+len(B)*mb)/(len(A)+len(B))
between = (len(A)*np.outer(ma-overall_mean,ma-overall_mean)
           +len(B)*np.outer(mb-overall_mean,mb-overall_mean))
near(between, [[72.9,54],[54,40]])
near(between, len(A)*len(B)/(len(A)+len(B))*np.outer(gap,gap))
generalized_values, generalized_vectors = eigh(between,within)
near(generalized_values, [0,2.5*maximum_fisher])
near(generalized_vectors.T@within@generalized_vectors, np.eye(2))
generalized_direction = generalized_vectors[:,-1]
generalized_direction /= np.linalg.norm(generalized_direction)
near(np.outer(generalized_direction,generalized_direction), np.outer(v,v))
lda = LinearDiscriminantAnalysis().fit(np.vstack([A,B]), [0]*5+[1]*5)
near(lda.coef_[0]/np.linalg.norm(lda.coef_[0]), v)
results["lda"] = {
    "class_a": A.tolist(), "class_b": B.tolist(), "means": [ma.tolist(),mb.tolist()],
    "scatter_a": scatter_a.tolist(), "scatter_b": scatter_b.tolist(),
    "between_scatter": between.tolist(), "fisher_scores": fisher_scores,
    "maximum_fisher": maximum_fisher,
    "within_scatter": within.tolist(), "direction": v.tolist(),
    "projected_means": [float(ma@v),float(mb@v)],
    "equal_prior_boundary": float((ma+mb)@v/2),
}
lda_points = np.vstack([A,B])
lda_origin = lda_points.mean(0)
lda_scores = lda_points@v
lda_projected = lda_origin+np.outer((lda_points-lda_origin)@v,v)
near(lda_projected@v, lda_scores)
near((lda_points-lda_projected)@v, np.zeros(len(lda_points)))
fig, ax = plt.subplots(figsize=(7.2,6.8), layout="constrained")
fisher_line = lda_origin+np.outer([-5.5,5.5],v)
ax.plot(fisher_line[:,0], fisher_line[:,1], color="#244e78", lw=1.8,
        label="Fisher projection axis", gid="lda-fisher-axis")
for point, projected, label in zip(lda_points, lda_projected,
                                  ["A1","A2","A3","A4","A5","B1","B2","B3","B4","B5"]):
    ax.plot([point[0],projected[0]], [point[1],projected[1]],
            ls="--", color=GRAY, alpha=.65, lw=1, gid=f"lda-projection-{label}")
    ax.annotate(label, point, xytext=(6,6), textcoords="offset points", fontsize=9)
ax.scatter(A[:,0], A[:,1], color=GREEN, s=75, zorder=3,
           label="Class A points", gid="lda-original-a")
ax.scatter(B[:,0], B[:,1], color=GOLD, marker="s", s=75, zorder=3,
           label="Class B points", gid="lda-original-b")
ax.scatter(lda_projected[:,0], lda_projected[:,1], facecolors="none",
           edgecolors="#244e78", s=90, zorder=4,
           label="Projected points", gid="lda-projected-points")
ax.scatter(*lda_origin, color="#244e78", marker="+", s=90, zorder=5,
           label="Overall mean", gid="lda-projection-origin")
ax.set(xlim=(0,11), ylim=(0,11), xlabel="Measurement 1",
       ylabel="Measurement 2",
       title="Project each labeled point onto the Fisher axis")
ax.set_aspect("equal", adjustable="box")
ax.legend(frameon=False, loc="upper left", fontsize=9)
save(fig, "lda-classes.svg", crop=False)
score_a, score_b = A@v, B@v
mean_score_a, mean_score_b = float(ma@v), float(mb@v)
near(score_a.mean(), mean_score_a)
near(score_b.mean(), mean_score_b)
fig, ax = plt.subplots(figsize=(7.2,3.6), layout="constrained")
row_a, row_b = 1, 0
mean_row_a, mean_row_b = 1.38, .38
for scores, row, color, marker, class_name in [
    (score_a, row_a, GREEN, "o", "A"), (score_b, row_b, GOLD, "s", "B"),
]:
    offsets = .09*(2*(np.argsort(np.argsort(scores))%2)-1)
    points = ax.scatter(scores, row+offsets, color=color, marker=marker, s=65,
                        label=f"Class {class_name} points", gid=f"lda-scores-{class_name}")
    near(points.get_offsets()[:,0], scores)
    for index, (score, offset) in enumerate(zip(scores,offsets), 1):
        ax.annotate(f"{class_name}{index}", (score,row+offset),
                    xytext=(0,10 if offset > 0 else -15), textcoords="offset points",
                    ha="center", fontsize=8)
ax.vlines(mean_score_a, row_a, mean_row_a, color="#244e78", linestyles=":")
ax.vlines(mean_score_b, row_b, mean_row_b, color="#244e78", linestyles=":")
ax.scatter([mean_score_a, mean_score_b], [mean_row_a, mean_row_b], color="#244e78",
           marker="D", s=85, zorder=4, label="Class means", gid="lda-score-means")
ax.annotate(f"mean {mean_score_a:.2f}", (mean_score_a,mean_row_a),
            xytext=(0,18), textcoords="offset points", ha="center",
            color="#244e78", fontsize=9)
ax.annotate(f"mean {mean_score_b:.2f}", (mean_score_b,mean_row_b),
            xytext=(0,18), textcoords="offset points", ha="center",
            color="#244e78", fontsize=9)
ax.set(xlim=(0,14), ylim=(-.55,1.9), yticks=[row_b,row_a],
       yticklabels=["Class B","Class A"],
       xlabel="LDA score z = 0.9196 x₁ + 0.3930 x₂",
       title="Fisher projection separates the class scores")
ax.grid(axis="x", alpha=.18)
ax.legend(frameon=False, loc="lower center", ncol=3, fontsize=9)
save(fig, "lda-projection.svg", crop=False)

# A separate, simple classification example: compare Gaussian densities, class
# scores, and sklearn's least-squares LDA using the same MLE covariance.
classifier_A = np.array([[1,2],[3,2],[2,1],[2,3]], dtype=float)
classifier_B = np.array([[5,4],[7,4],[6,3],[6,5]], dtype=float)
training = np.vstack([classifier_A, classifier_B])
class_labels = np.array(["A"]*4 + ["B"]*4)
class_means = np.array([classifier_A.mean(0), classifier_B.mean(0)])
priors = np.array([.5, .5])
residuals = np.vstack([classifier_A-class_means[0],
                       classifier_B-class_means[1]])
shared_covariance = residuals.T @ residuals / len(training)
near(class_means, [[2,2],[6,4]])
near(shared_covariance, [[.5,0],[0,.5]])
class_weights = np.linalg.solve(shared_covariance, class_means.T).T
class_offsets = -.5*np.sum(class_means*class_weights, axis=1)+np.log(priors)
new_point = np.array([4.,4.])
scores = class_weights @ new_point + class_offsets
posterior = np.exp(scores-scores.max())
posterior /= posterior.sum()
density_weights = np.array([
    multivariate_normal.pdf(new_point, mean=mean, cov=shared_covariance)*prior
    for mean,prior in zip(class_means,priors)
])
near(posterior, density_weights/density_weights.sum())
gaussian_log_weights = np.array([
    multivariate_normal.logpdf(new_point, mean=mean, cov=shared_covariance)+np.log(prior)
    for mean,prior in zip(class_means,priors)
])
shared_log_term = (-np.log(2*np.pi)-.5*np.log(np.linalg.det(shared_covariance))
                  -.5*new_point@np.linalg.solve(shared_covariance,new_point))
near(gaussian_log_weights, scores+shared_log_term)
classifier_direction = np.linalg.solve(shared_covariance,class_means[1]-class_means[0])
midpoint = class_means.mean(0)
near(scores[1]-scores[0],
     classifier_direction@(new_point-midpoint)+np.log(priors[1]/priors[0]))
near(classifier_direction, [8,4])
classifier_fisher = np.linalg.solve(residuals.T@residuals,class_means[1]-class_means[0])
near(classifier_fisher, [1,.5])
near(classifier_direction, len(training)*classifier_fisher)
near((np.array([[4,3],[5,1],[3,5]])-midpoint)@classifier_direction, [0,0,0])
correlated_covariance = np.array([[2.,.6],[.6,1.]])
correlated_weights = np.linalg.solve(correlated_covariance,class_means.T).T
correlated_priors = np.array([.35,.65])
correlated_scores = (correlated_weights@new_point
                     -.5*np.sum(class_means*correlated_weights,axis=1)
                     +np.log(correlated_priors))
correlated_direction = correlated_weights[1]-correlated_weights[0]
near(correlated_scores[1]-correlated_scores[0],
     correlated_direction@(new_point-midpoint)+np.log(correlated_priors[1]/correlated_priors[0]))
correlated_logs = np.array([
    multivariate_normal.logpdf(new_point,mean=mean,cov=correlated_covariance)+np.log(prior)
    for mean,prior in zip(class_means,correlated_priors)
])
near(correlated_logs[1]-correlated_logs[0], correlated_scores[1]-correlated_scores[0])
near(scores, [24+np.log(.5),28+np.log(.5)])
near(posterior, [1/(1+np.exp(4)),1/(1+np.exp(-4))])
classifier = LinearDiscriminantAnalysis(solver="lsqr").fit(training,class_labels)
near(classifier.covariance_, shared_covariance)
near(classifier.coef_, [[8,4]])
near(classifier.intercept_, [-44])
near(classifier.predict_proba([new_point])[0], posterior)
assert classifier.predict([new_point])[0] == "B"
results["lda_classification"] = {
    "class_a": classifier_A.tolist(), "class_b": classifier_B.tolist(),
    "means": class_means.tolist(), "priors": priors.tolist(),
    "covariance_mle": shared_covariance.tolist(),
    "class_weights": class_weights.tolist(), "class_offsets": class_offsets.tolist(),
    "new_point": new_point.tolist(), "scores": scores.tolist(),
    "posterior": posterior.tolist(), "prediction": "B",
    "boundary_weights": [8,4], "boundary_intercept": -44,
}
fig, ax = plt.subplots(figsize=(8.4,5.4), layout="constrained")
xx = np.linspace(.5,7.5,300)
ax.plot(xx,11-2*xx,color=GRAY,lw=1.8,label="Equal scores: 2x₁ + x₂ = 11")
ax.scatter(classifier_A[:,0],classifier_A[:,1],s=75,color=GREEN,
           zorder=3,label="Class A training points")
ax.scatter(classifier_B[:,0],classifier_B[:,1],s=75,color=GOLD,
           zorder=3,label="Class B training points")
ax.scatter(*new_point,s=220,marker="*",color="#244e78",zorder=4,
           label="New point (4, 4): predict B")
ax.annotate("(4, 4)",new_point,xytext=(-7,15),textcoords="offset points",
            ha="right",color="#244e78")
ax.text(1.1,4.5,"Predict A",color=GREEN,fontweight="bold")
ax.text(5.6,1.15,"Predict B",color=GOLD,fontweight="bold")
ax.set(xlim=(.5,7.5),ylim=(.5,6.5),xlabel="Measurement 1 (x₁)",
       ylabel="Measurement 2 (x₂)",title="LDA compares two linear class scores")
ax.set_aspect("equal",adjustable="box")
ax.legend(loc="upper right",frameon=False,fontsize=9)
save(fig,"lda-classification.svg")
(OUT/"results.json").write_text(json.dumps(results, indent=2)+"\n")
print("Verified MLE/MAP, regression, NB, logistic gradients, clustering, PCA, Fisher LDA and LDA classification.")
print("Wrote verified figures and assets/results.json.")
