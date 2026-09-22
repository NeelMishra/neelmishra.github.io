"""Reproduce the Bayesian regression article's normal update and predictive figures.

Requires Python 3, NumPy, SciPy, and Matplotlib.
Run: python render_bayesian_figures.py [--preview-dir /tmp/bayesian-preview]
Independent quadrature checks verify the posterior and predictive formulas.
"""
from pathlib import Path
import argparse
import numpy as np
from scipy.integrate import quad
from scipy.stats import norm
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--preview-dir', type=Path)
args = parser.parse_args()
HERE = Path(__file__).resolve().parent
DATA = np.array([0., 1., 3., 4.])
PRIOR_MEAN, PRIOR_VAR, NOISE_VAR = 0., 4., 4.
post_var = 1 / (1 / PRIOR_VAR + len(DATA) / NOISE_VAR)
post_mean = post_var * (PRIOR_MEAN / PRIOR_VAR + DATA.sum() / NOISE_VAR)
predictive_var = post_var + NOISE_VAR


def joint(beta):
    return norm.pdf(beta, PRIOR_MEAN, np.sqrt(PRIOR_VAR)) * np.prod(
        norm.pdf(DATA, beta, np.sqrt(NOISE_VAR)))


def integrate(function):
    return quad(function, -np.inf, np.inf, epsabs=1e-13, epsrel=1e-11)[0]


normalizer = integrate(joint)
numeric_mean = integrate(lambda beta: beta * joint(beta)) / normalizer
numeric_var = integrate(lambda beta: (beta-numeric_mean)**2 * joint(beta)) / normalizer
np.testing.assert_allclose([numeric_mean, numeric_var], [post_mean, post_var], atol=1e-10)
for value in [-2., 0., 2., 5.]:
    density = integrate(lambda beta: norm.pdf(value, beta, np.sqrt(NOISE_VAR)) * joint(beta) / normalizer)
    np.testing.assert_allclose(density, norm.pdf(value, post_mean, np.sqrt(predictive_var)), atol=1e-10)
print('Prior × full-data likelihood normalization and predictive convolution checks passed.')
intervals = {}
for name, variance in [('offset', post_var), ('new reading', predictive_var)]:
    interval = norm.ppf([.025,.975], loc=post_mean, scale=np.sqrt(variance))
    coverage = np.diff(norm.cdf(interval, loc=post_mean, scale=np.sqrt(variance)))[0]
    np.testing.assert_allclose(coverage, .95, atol=1e-13)
    intervals[name] = interval
    print(f'{name}: mean={post_mean:.9f}, variance={variance:.9f}, interval={interval}')
for sd in [1., 2., 4.]:
    variance = 1 / (1/sd**2 + len(DATA)/NOISE_VAR)
    mean = variance * DATA.sum() / NOISE_VAR
    weight = len(DATA) * sd**2 / (NOISE_VAR + len(DATA) * sd**2)
    print(f'Prior SD={sd:g}: data weight={weight:.9f}, posterior mean={mean:.9f}, posterior SD={np.sqrt(variance):.9f}')

INK, MUTED, BLUE, ORANGE = '#182536', '#536475', '#176b93', '#b44a24'
plt.rcParams.update({
    'font.family': ['DejaVu Sans', 'Arial', 'sans-serif'], 'font.size': 15,
    'text.color': INK, 'axes.labelcolor': INK, 'xtick.color': MUTED,
    'ytick.color': MUTED, 'axes.edgecolor': '#b7c3cd',
    'axes.spines.top': False, 'axes.spines.right': False,
    'svg.fonttype': 'none', 'svg.hashsalt': 'bayesian-regression-v1',
    'figure.facecolor': 'white', 'axes.facecolor': 'white',
})


def save(fig, name, description):
    fig.savefig(HERE/f'{name}.svg', metadata={
        'Title': name.replace('-', ' ').title(), 'Description': description,
        'Creator': 'render_bayesian_figures.py', 'Date': None,
    })
    svg = HERE / f'{name}.svg'
    svg.write_text('\n'.join(line.rstrip() for line in svg.read_text().splitlines()) + '\n')
    if args.preview_dir:
        args.preview_dir.mkdir(parents=True, exist_ok=True)
        fig.savefig(args.preview_dir/f'{name}.png', dpi=150)
    plt.close(fig)


xs = np.linspace(-6, 6, 901)
fig, ax = plt.subplots(figsize=(6,4.5), layout='constrained')
ax.plot(xs, norm.pdf(xs, PRIOR_MEAN, np.sqrt(PRIOR_VAR)), color=MUTED, ls='--', lw=2.5, label='Prior')
ax.plot(xs, norm.pdf(xs, DATA.mean(), np.sqrt(NOISE_VAR/len(DATA))), color=ORANGE, ls=':', lw=3, label='Likelihood (scaled)')
ax.plot(xs, norm.pdf(xs, post_mean, np.sqrt(post_var)), color=BLUE, lw=3, label='Posterior')
ax.set(xlim=(-6,6), ylim=(0,.51), xlabel='Shared offset β (mm)', ylabel='Density / scaled likelihood')
ax.set_title('Prior × likelihood → posterior', loc='left', fontsize=15, fontweight='bold', pad=14)
ax.legend(loc='upper left', fontsize=13, frameon=False)
ax.grid(axis='y', alpha=.2)
save(fig, 'bayesian-normal-update', 'Prior N(0,4), rescaled likelihood N(2,1), and posterior N(1.6,0.8); normal second parameters are variances.')

xs = np.linspace(-6, 8, 1001)
fig, (ax, ci) = plt.subplots(2,1, figsize=(6,5), layout='constrained', sharex=True,
                              gridspec_kw={'height_ratios':[3,1.35]})
ax.plot(xs, norm.pdf(xs, post_mean, np.sqrt(post_var)), color=BLUE, lw=3, label='Offset β')
ax.plot(xs, norm.pdf(xs, post_mean, np.sqrt(predictive_var)), color=ORANGE, ls='--', lw=2.8, label='New reading Y*')
ax.set(xlim=(-6,8), ylim=(0,.51), ylabel='Density')
ax.set_title('Same center, different uncertainty', loc='left', fontsize=14, fontweight='bold', pad=14)
ax.legend(loc='upper left', fontsize=13, frameon=False)
ax.grid(axis='y', alpha=.2)
for y, name, color in [(1,'offset',BLUE),(0,'new reading',ORANGE)]:
    low, high = intervals[name]
    ci.plot([low,high], [y,y], color=color, lw=3)
    ci.plot([low,high], [y,y], '|', color=color, markersize=10, markeredgewidth=2)
    ci.plot(post_mean, y, 'o', color=color, markersize=6)
ci.set(ylim=(-.65,1.65), yticks=[0,1], yticklabels=['Reading','Offset'],
       xlabel='Value (mm)', xticks=[-6,-4,-2,0,2,4,6,8])
ci.tick_params(axis='y', labelsize=13)
ci.set_title('Central 95% intervals', loc='left', fontsize=13, pad=8)
ci.spines['left'].set_visible(False)
save(fig, 'bayesian-predictive-uncertainty', 'Posterior uncertainty of offset N(1.6,0.8) and future reading N(1.6,4.8), with respective 95 percent intervals.')
