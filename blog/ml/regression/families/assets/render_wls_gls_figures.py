"""Reproduce the WLS/GLS article's fits and residual-cost geometry.

Requires Python 3, NumPy, SciPy, and Matplotlib.
Run: python render_wls_gls_figures.py [--preview-dir /tmp/wls-gls-preview]
The covariance matrices are specified inputs, not estimated from the four rows.
"""
from pathlib import Path
import argparse
import numpy as np
from scipy.optimize import minimize
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--preview-dir', type=Path)
args = parser.parse_args()
HERE = Path(__file__).resolve().parent
x = np.arange(4.)
X = np.column_stack([np.ones(4), x])
y = np.array([1., 2., 2., 6.])
D = np.diag([1., 1., 4., 4.])
Sigma = D.copy()
Sigma[2, 3] = Sigma[3, 2] = 3.
covariances = {'OLS': np.eye(4), 'WLS': D, 'GLS': Sigma}
expected_beta = {'OLS': [.5, 1.5], 'WLS': [70/89, 120/89], 'GLS': [13/32, 15/8]}
expected_costs = {'OLS': [7/2, 17/16, 95/28],
                  'WLS': [28745/7921, 85/89, 28409/7921],
                  'GLS': [1301/256, 3265/2048, 97/32]}
expected_mean_variance = {'OLS': 1., 'WLS': 12899/15842, 'GLS': 23/32}
betas, coefficient_covariances = {}, {}
new_row = np.array([1., 1.5])


def fit(covariance):
    L = np.linalg.cholesky(covariance)
    X_white, y_white = np.linalg.solve(L, X), np.linalg.solve(L, y)
    beta = np.linalg.lstsq(X_white, y_white, rcond=None)[0]
    return beta


np.testing.assert_allclose(np.linalg.eigvalsh(Sigma), [1, 1, 1, 7])
np.testing.assert_allclose(X.T @ np.linalg.solve(D, X), [[2.5, 2.25], [2.25, 4.25]])
np.testing.assert_allclose(X.T @ np.linalg.solve(D, y), [5, 7.5])
for name, covariance in covariances.items():
    beta = fit(covariance)
    betas[name] = beta
    np.testing.assert_allclose(beta, expected_beta[name], atol=1e-12)
    residual = y - X @ beta
    np.testing.assert_allclose(X.T @ np.linalg.solve(covariance, residual), 0, atol=1e-12)
    costs = [residual @ np.linalg.solve(C, residual) for C in covariances.values()]
    np.testing.assert_allclose(costs, expected_costs[name], atol=1e-12)
    # An independent optimizer recovers the same minimum from a distant start.
    objective = lambda b: (y-X@b) @ np.linalg.solve(covariance, y-X@b)
    gradient = lambda b: -2*X.T @ np.linalg.solve(covariance, y-X@b)
    optimized = minimize(objective, [3., -1.], jac=gradient, method='BFGS', options={'gtol': 1e-10})
    np.testing.assert_allclose(optimized.x, beta, atol=1e-8)
    # A linear estimator's true covariance is A Sigma A', even when fitting with D or I.
    A = np.linalg.solve(X.T @ np.linalg.solve(covariance, X), np.linalg.solve(covariance, X).T)
    np.testing.assert_allclose(A @ X, np.eye(2), atol=1e-12)
    coefficient_covariances[name] = A @ Sigma @ A.T
    mean_variance = new_row @ coefficient_covariances[name] @ new_row
    np.testing.assert_allclose(mean_variance, expected_mean_variance[name], atol=1e-12)
    np.testing.assert_allclose(fit(7*covariance), beta, atol=1e-12)
    L = np.linalg.cholesky(covariance)
    C = np.linalg.solve(L, np.eye(4))
    np.testing.assert_allclose(C @ covariance @ C.T, np.eye(4), atol=1e-12)
    print(f'{name}: beta={beta}; costs={np.round(costs, 8)}; mean(1.5)={new_row@beta:.8f}; true mean-estimate variance={mean_variance:.8f}')
# GLS is no less efficient for any linear coefficient contrast under this known Sigma.
for name in ['OLS', 'WLS']:
    assert np.linalg.eigvalsh(coefficient_covariances[name]-coefficient_covariances['GLS']).min() > -1e-12
np.testing.assert_allclose(coefficient_covariances['GLS'], [[23/32, -3/8], [-3/8, 1/2]])
np.testing.assert_allclose(4 + expected_mean_variance['GLS'], 151/32)
for e, expected in [(np.array([2., 2.]), 8/7), (np.array([2., -2.]), 8.)]:
    q = e @ np.linalg.solve(Sigma[2:, 2:], e)
    decomposed = (e[0]+e[1])**2/14 + (e[0]-e[1])**2/2
    np.testing.assert_allclose([q, decomposed], expected)
    np.testing.assert_allclose(e @ np.linalg.solve(D[2:, 2:], e), 2.)
print('Exact coefficients/costs, optimization, whitening, scale invariance, covariance, and contour checks passed.')

INK, MUTED, BLUE, ORANGE, GREEN = '#182536', '#536475', '#176b93', '#b44a24', '#087f6d'
plt.rcParams.update({
    'font.family': ['DejaVu Sans', 'Arial', 'sans-serif'], 'font.size': 17,
    'text.color': INK, 'axes.labelcolor': INK, 'xtick.color': MUTED,
    'ytick.color': MUTED, 'axes.edgecolor': '#b7c3cd',
    'axes.spines.top': False, 'axes.spines.right': False,
    'svg.fonttype': 'none', 'svg.hashsalt': 'wls-gls-geometry-v1',
    'figure.facecolor': 'white', 'axes.facecolor': 'white',
})


def save(fig, name, description):
    path = HERE / f'{name}.svg'
    fig.savefig(path, metadata={'Title': name.replace('-', ' ').title(),
        'Description': description, 'Creator': 'render_wls_gls_figures.py', 'Date': None})
    path.write_text('\n'.join(line.rstrip() for line in path.read_text().splitlines())+'\n')
    if args.preview_dir:
        args.preview_dir.mkdir(parents=True, exist_ok=True)
        fig.savefig(args.preview_dir / f'{name}.png', dpi=150)
    plt.close(fig)


fig, ax = plt.subplots(figsize=(4.4, 5), layout='constrained')
grid = np.linspace(-.3, 3.3, 201)
for name, color, style in [('OLS', BLUE, ':'), ('WLS', ORANGE, '--'), ('GLS', GREEN, '-')]:
    beta = betas[name]
    ax.plot(grid, beta[0]+beta[1]*grid, color=color, ls=style, lw=2.6, label=name)
ax.errorbar(x, y, yerr=np.sqrt(np.diag(D)), fmt='o', color=INK, ecolor='#a6b2be',
            elinewidth=1.7, capsize=5, markersize=6, zorder=5)
ax.set(xlim=(-.3, 3.3), ylim=(-.5, 9.5), xticks=[0, 1, 2, 3], yticks=[0, 2, 4, 6, 8],
       xlabel='Predictor x', ylabel='Response y')
ax.set_title('Same rows,\nthree fitted lines', loc='left', fontsize=18, fontweight='bold', pad=12)
ax.legend(loc='upper left', frameon=False, fontsize=17)
ax.grid(axis='y', alpha=.18)
save(fig, 'wls-gls-fitted-lines', 'Four observed responses with plus/minus one specified error SD. OLS, diagonal WLS, and full GLS fitted lines use the identical dataset.')

fig, ax = plt.subplots(figsize=(4.4, 5.6), layout='constrained')
theta = np.linspace(0, 2*np.pi, 401)
unit = np.vstack([np.cos(theta), np.sin(theta)])
for C, color, style, label in [(D[2:, 2:], ORANGE, '--', 'Diagonal WLS'),
                              (Sigma[2:, 2:], GREEN, '-', 'Correlated GLS')]:
    boundary = np.sqrt(2)*np.linalg.cholesky(C) @ unit
    q = np.einsum('ij,ij->j', boundary, np.linalg.solve(C, boundary))
    np.testing.assert_allclose(q, 2., atol=1e-12)
    ax.plot(*boundary, color=color, ls=style, lw=2.6, label=label)
ax.axhline(0, color='#bdc7ce', lw=1)
ax.axvline(0, color='#bdc7ce', lw=1)
for label, point, offset in [('A', (2, 2), (8, 8)), ('B', (2, -2), (8, -18))]:
    ax.scatter(*point, color=INK, s=50, zorder=5)
    ax.annotate(label, point, xytext=offset, textcoords='offset points', fontsize=17, fontweight='bold')
ax.set(xlim=(-3.4, 3.4), ylim=(-3.4, 4.9), xticks=[-2, 0, 2], yticks=[-2, 0, 2],
       xlabel='Row 3 residual e₃', ylabel='Row 4 residual e₄')
ax.set_aspect('equal', adjustable='box')
ax.set_title('Residual geometry\nEqual pair cost = 2', loc='left', fontsize=18, fontweight='bold', pad=12)
ax.legend(loc='upper left', frameon=False, fontsize=15, handlelength=1.4)
ax.grid(alpha=.15)
save(fig, 'wls-gls-residual-geometry', 'Cost-2 contours for the final two residuals: a circle for variances 4 and no correlation, an ellipse for covariance 3. Point A=(2,2) has GLS cost 8/7; B=(2,-2) has cost 8.')
