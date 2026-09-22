"""Reproduce the GLM article's fitted means and discrete outcome probabilities.

Requires Python 3, NumPy, SciPy, and Matplotlib.
Run: python render_glm_figures.py [--preview-dir /tmp/glm-preview]
These are two separate constructed datasets: binary items and alarm counts.
"""
from pathlib import Path
import argparse
import numpy as np
from scipy.special import expit, xlogy
from scipy.optimize import minimize
from scipy.stats import poisson
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--preview-dir', type=Path)
args = parser.parse_args()
HERE = Path(__file__).resolve().parent
x = np.array([-1., 0., 1.])
X = np.column_stack([np.ones(3), x])
trials = np.full(3, 10.)
successes = np.array([2., 5., 8.])
xp = np.repeat(x, 2)
Xp = np.column_stack([np.ones(6), xp])
exposure = np.tile([1., 3.], 3)
y = np.array([0., 2., 1., 3., 3., 5.])
offset = np.log(exposure)


def irls(design, response, family, trials=None, offset=None):
    offset = np.zeros(len(response)) if offset is None else offset
    beta = np.zeros(design.shape[1])
    history = [beta.copy()]
    for _ in range(50):
        eta = design @ beta + offset
        if family == 'binomial':
            mean = expit(eta)
            variance = mean * (1-mean)
            w = trials * variance
            z = eta + (response/trials-mean)/variance
        else:
            mean = np.exp(eta)
            w = mean
            z = eta + (response-mean)/mean
        root_w = np.sqrt(w)
        new = np.linalg.lstsq(design*root_w[:, None], (z-offset)*root_w, rcond=None)[0]
        history.append(new.copy())
        if np.max(np.abs(new-beta)) < 1e-12:
            return new, np.array(history)
        beta = new
    raise RuntimeError('IRLS did not converge')


beta, binary_history = irls(X, successes, 'binomial', trials=trials)
alpha, count_history = irls(Xp, y, 'poisson', offset=offset)
np.testing.assert_allclose(beta, [0, np.log(4)], atol=1e-12)
np.testing.assert_allclose(alpha, [0, np.log(2)], atol=1e-12)
np.testing.assert_allclose(binary_history[1], [0, 1.2], atol=1e-12)
p = expit(X @ beta)
mu = exposure * np.exp(Xp @ alpha)
np.testing.assert_allclose(p, [.2, .5, .8], atol=1e-12)
np.testing.assert_allclose(mu, [.5, 1.5, 1, 3, 2, 6], atol=1e-12)
np.testing.assert_allclose(X.T @ (successes-trials*p), 0, atol=1e-12)
np.testing.assert_allclose(Xp.T @ (y-mu), 0, atol=1e-12)
# BFGS optimizes the exact likelihoods, independently of the IRLS implementation.
binary_objective = lambda b: np.sum(trials*np.logaddexp(0, X@b)-successes*(X@b))
binary_gradient = lambda b: X.T @ (trials*expit(X@b)-successes)
count_objective = lambda b: np.sum(np.exp(offset+Xp@b)-y*(offset+Xp@b))
count_gradient = lambda b: Xp.T @ (np.exp(offset+Xp@b)-y)
for label, objective, gradient, expected in [
    ('binomial', binary_objective, binary_gradient, beta),
    ('Poisson', count_objective, count_gradient, alpha),
]:
    result = minimize(objective, [.3, .4], jac=gradient, method='BFGS', options={'gtol': 1e-11})
    np.testing.assert_allclose(result.x, expected, atol=1e-8)
    print(f'{label}: IRLS coefficients={expected}; independent optimizer={result.x}')
# Expanding the grouped binary data into thirty individual rows preserves coefficients.
xi = np.repeat(x, trials.astype(int))
yi = np.concatenate([np.r_[np.ones(int(k)), np.zeros(int(n-k))] for n, k in zip(trials, successes)])
Xi = np.column_stack([np.ones(30), xi])
individual, _ = irls(Xi, yi, 'binomial', trials=np.ones(30))
np.testing.assert_allclose(individual, beta, atol=1e-12)
# Groupwise Poisson rate maxima are total count / total exposure.
np.testing.assert_allclose(y.reshape(3, 2).sum(axis=1)/exposure.reshape(3, 2).sum(axis=1), [.5, 1, 2])
np.testing.assert_allclose(np.exp(beta[1]), 4.)
np.testing.assert_allclose(np.exp(alpha[1]), 2.)
np.testing.assert_allclose(np.log(3)+alpha.sum(), np.log(6))
np.testing.assert_allclose(mu[1::2]/mu[::2], 3.)
# The zero-count convention is checked against the full Poisson likelihood gap.
deviance = 2*(xlogy(y, y/mu)-(y-mu))
loglik_gap = 2*(poisson.logpmf(y, y)-poisson.logpmf(y, mu))
np.testing.assert_allclose(deviance, loglik_gap, atol=1e-12)
np.testing.assert_allclose(deviance[0], 1.)
np.testing.assert_allclose(deviance[-1], 0.1767844320604537, atol=1e-12)
np.testing.assert_allclose(deviance.sum(), 1.7603033705165638, atol=1e-12)
counts = np.arange(9)
pmf = poisson.pmf(counts, 2)
tail = poisson.sf(8, 2)
np.testing.assert_allclose(pmf.sum()+tail, 1., atol=1e-14)
np.testing.assert_allclose(pmf[0], np.exp(-2))
np.testing.assert_allclose(pmf[2], 2*np.exp(-2))
np.testing.assert_allclose(poisson.pmf(0, 6), np.exp(-6))
full_counts = np.arange(40)
full_pmf = poisson.pmf(full_counts, 2)
np.testing.assert_allclose(full_counts @ full_pmf, 2.)
np.testing.assert_allclose((full_counts-2)**2 @ full_pmf, 2.)
print(f'Binary probabilities={p}; Poisson means={mu}; deviance contributions={deviance}; total={deviance.sum():.12f}')
print(f'P_Poisson(2)(Y>=9)={tail:.12f}; grouped/individual, offset, ratio, score, PMF and moment checks passed.')

INK, MUTED, BLUE, ORANGE = '#182536', '#536475', '#176b93', '#b44a24'
plt.rcParams.update({
    'font.family': ['DejaVu Sans', 'Arial', 'sans-serif'], 'font.size': 17,
    'text.color': INK, 'axes.labelcolor': INK, 'xtick.color': MUTED,
    'ytick.color': MUTED, 'axes.edgecolor': '#b7c3cd',
    'axes.spines.top': False, 'axes.spines.right': False,
    'svg.fonttype': 'none', 'svg.hashsalt': 'glm-worked-models-v1',
    'figure.facecolor': 'white', 'axes.facecolor': 'white',
})


def save(fig, name, description):
    path = HERE / f'{name}.svg'
    fig.savefig(path, metadata={'Title': name.replace('-', ' ').title(),
        'Description': description, 'Creator': 'render_glm_figures.py', 'Date': None})
    path.write_text('\n'.join(line.rstrip() for line in path.read_text().splitlines())+'\n')
    if args.preview_dir:
        args.preview_dir.mkdir(parents=True, exist_ok=True)
        fig.savefig(args.preview_dir / f'{name}.png', dpi=150)
    plt.close(fig)


fig, axes = plt.subplots(2, 1, figsize=(4.4, 8), layout='constrained')
grid = np.linspace(-1, 1, 201)
ax = axes[0]
ax.plot(grid, expit(beta[0]+beta[1]*grid), color=BLUE, lw=2.8, label='Fitted probability')
ax.scatter(x, successes/trials, color=INK, s=45, zorder=4, label='Observed fraction')
ax.set(xlim=(-1.12, 1.12), ylim=(-.04, 1.35), xticks=[-1, 0, 1], yticks=[0, .5, 1],
       xlabel='Score x', ylabel='Probability p')
ax.set_title('Binary items\nProbability of a defect', loc='left', fontsize=17, fontweight='bold', pad=12)
ax.legend(loc='upper left', frameon=False, fontsize=15, handlelength=1.4)
ax.grid(axis='y', alpha=.18)
ax = axes[1]
for t, color, style, marker in [(1., BLUE, '-', 'o'), (3., ORANGE, '--', 's')]:
    selected = exposure == t
    ax.plot(grid, t*np.exp(alpha[0]+alpha[1]*grid), color=color, ls=style, lw=2.8)
    ax.scatter(xp[selected], y[selected], color=color, marker=marker, s=50, zorder=4)
legend = [Line2D([0], [0], color=BLUE, marker='o', lw=2.5, label='1 hour'),
          Line2D([0], [0], color=ORANGE, marker='s', ls='--', lw=2.5, label='3 hours')]
ax.legend(handles=legend, loc='upper left', frameon=False, fontsize=16)
ax.set(xlim=(-1.12, 1.12), ylim=(-.3, 8.2), xticks=[-1, 0, 1], yticks=[0, 2, 4, 6, 8],
       xlabel='Score x', ylabel='Alarm count')
ax.set_title('Alarm counts\nOne hour versus three', loc='left', fontsize=17, fontweight='bold', pad=12)
ax.grid(axis='y', alpha=.18)
save(fig, 'glm-fitted-means', 'Exact logistic fit p=expit(log(4)*x) to thirty binary items; Poisson fitted means t*2**x and six observed counts at exposures one and three hours.')

fig, axes = plt.subplots(2, 1, figsize=(4.4, 7.5), layout='constrained')
ax = axes[0]
ax.vlines([0, 1], 0, [.2, .8], color=BLUE, lw=3)
ax.scatter([0, 1], [.2, .8], color=BLUE, s=50, zorder=4)
for outcome, probability in [(0, .2), (1, .8)]:
    ax.text(outcome, probability+.055, f'{probability:.2f}', ha='center', fontsize=16, color=BLUE)
ax.set(xlim=(-.35, 1.35), ylim=(0, 1), xticks=[0, 1], yticks=[0, .5, 1],
       xlabel='Outcome y', ylabel='Probability')
ax.set_title('Binary item at x = 1\np = 0.8', loc='left', fontsize=17, fontweight='bold', pad=12)
ax.grid(axis='y', alpha=.18)
ax = axes[1]
ax.vlines(counts, 0, pmf, color=ORANGE, lw=2.4)
ax.scatter(counts, pmf, color=ORANGE, s=28, zorder=4)
ax.set(xlim=(-.5, 8.5), ylim=(0, .35), xticks=[0, 2, 4, 6, 8], yticks=[0, .1, .2, .3],
       xlabel='Count y', ylabel='Probability')
ax.set_title('One-hour count at x = 1\nPoisson mean = 2', loc='left', fontsize=17, fontweight='bold', pad=12)
ax.grid(axis='y', alpha=.18)
save(fig, 'glm-discrete-outcomes', 'Bernoulli masses at zero and one for p=.8, and integer Poisson masses for mean two. Displayed Poisson counts zero through eight omit tail probability .000237447328.')
