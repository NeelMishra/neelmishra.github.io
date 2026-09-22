"""Reproduce the figures and numerical example in splines-and-gams.html.

Requires Python 3, NumPy, SciPy >= 1.10, and Matplotlib.
Run: python render_spline_figures.py
SVGs are written beside this script; PNG previews are optional via --preview-dir.
"""
from pathlib import Path
import argparse
import numpy as np
from scipy.interpolate import make_smoothing_spline
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--preview-dir', type=Path)
args = parser.parse_args()
HERE = Path(__file__).resolve().parent
INK, MUTED, BLUE, ORANGE = '#182536', '#536475', '#176b93', '#b44a24'
plt.rcParams.update({
    'font.family': 'DejaVu Sans', 'font.size': 15,
    'text.color': INK, 'axes.labelcolor': INK, 'xtick.color': MUTED,
    'ytick.color': MUTED, 'axes.edgecolor': '#b7c3cd',
    'axes.spines.top': False, 'axes.spines.right': False,
    'svg.fonttype': 'none', 'svg.hashsalt': 'splines-and-gams-v1',
    'figure.facecolor': 'white', 'axes.facecolor': 'white',
})


def save(fig, name, description):
    fig.savefig(HERE / f'{name}.svg', metadata={
        'Title': name.replace('-', ' ').title(), 'Description': description,
        'Date': None, 'Creator': 'render_spline_figures.py',
    })
    if args.preview_dir:
        args.preview_dir.mkdir(parents=True, exist_ok=True)
        fig.savefig(args.preview_dir / f'{name}.png', dpi=150)
    plt.close(fig)


xgrid = np.linspace(0, 4, 401)
curve = 1 + xgrid - .25 * np.maximum(xgrid - 2, 0) ** 3
fig, ax = plt.subplots(figsize=(6, 4.5), layout='constrained')
ax.plot(xgrid, 1 + xgrid, color=MUTED, ls='--', lw=2, label='Line: 1 + x')
ax.plot(xgrid, curve, color=BLUE, lw=3, label='Spline f(x)')
ax.axvline(2, color=ORANGE, ls=':', lw=2)
ax.scatter([2], [3], color=ORANGE, s=55, zorder=4)
ax.annotate('Knot at x = 2\nSmooth join', xy=(2, 3), xytext=(.3, 4.5),
            fontsize=14, arrowprops={'arrowstyle': '->', 'color': ORANGE}, color=INK)
ax.set(xlim=(0, 4), ylim=(.7, 5.2), xlabel='Input x', ylabel='Function value f(x)')
ax.set_xticks(range(5))
ax.grid(axis='y', alpha=.2)
ax.legend(loc='lower right', frameon=True, framealpha=.95, fontsize=13)
save(fig, 'spline-knot', 'A constructed cubic spline matches a line until a knot at 2, then bends smoothly downward.')

x = np.arange(9, dtype=float)
y = np.array([.2, 1.4, .6, 2.7, 1.6, 3.2, 1.4, 1.9, .5])
grid = np.linspace(0, 8, 601)
settings = [(0., 'Interpolation'), (.5, 'Moderate smoothing'), (100., 'Nearly a line')]
fig, axes = plt.subplots(3, 1, figsize=(6, 9.75), layout='constrained', sharex=True, sharey=True)
for ax, (lam, label) in zip(axes, settings):
    fit = make_smoothing_spline(x, y, lam=lam)
    S = np.column_stack([make_smoothing_spline(x, e, lam=lam)(x) for e in np.eye(len(x))])
    # Confirm this is the same linear fit whose EDF we report.
    np.testing.assert_allclose(S @ y, fit(x), atol=1e-12)
    edf, sse = np.trace(S), np.sum((y-fit(x))**2)
    print(f'lambda={lam:g}, EDF={edf:.8f}, SSE={sse:.8f}')
    ax.plot(grid, fit(grid), color=BLUE, lw=2.8)
    ax.scatter(x, y, s=48, color=ORANGE, edgecolors='white', linewidths=.7, zorder=4)
    ax.set_title(f'λ = {lam:g}   ·   {label}', loc='left', fontsize=14, fontweight='bold', pad=12)
    ax.text(.98, .95, f'EDF = {edf:.2f}    SSE = {sse:.2f}', transform=ax.transAxes,
            ha='right', va='top', fontsize=13, color=MUTED)
    ax.set(xlim=(-.15, 8.15), ylim=(-.1, 3.8), ylabel='Response y')
    ax.set_yticks([0, 1, 2, 3])
    ax.set_xticks(range(9))
    ax.grid(axis='y', alpha=.2)
axes[-1].set_xlabel('Input x')
save(fig, 'spline-smoothing', 'Three smoothing splines fitted to the same nine observations at lambda 0, 0.5 and 100 on matching axes.')
