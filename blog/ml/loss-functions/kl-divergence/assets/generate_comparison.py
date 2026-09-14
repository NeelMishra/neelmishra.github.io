"""Regenerate the two original KL comparison plots (requires NumPy, Matplotlib)."""
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

DEST = Path(__file__).resolve().parent
GREEN, ORANGE, INK = '#0a8f6a', '#d96828', '#18382d'


def log_normal(x, mean, variance):
    return -0.5 * (np.log(2 * np.pi * variance) + (x - mean) ** 2 / variance)


def log_target(x):
    return np.logaddexp(log_normal(x, -3, 0.25), log_normal(x, 3, 0.25)) - np.log(2)


def make_plot(name, mean, variance):
    x = np.linspace(-10, 10, 2401)
    p, q = np.exp(log_target(x)), np.exp(log_normal(x, mean, variance))
    fig, ax = plt.subplots(figsize=(5.4, 3.8), dpi=100)
    fig.patch.set_facecolor('#fffdf9')
    ax.set_facecolor('#fffdf9')
    ax.plot(x, p, color=GREEN, lw=2.5, label='P: two groups')
    ax.fill_between(x, p, color=GREEN, alpha=0.08)
    ax.plot(x, q, color=ORANGE, lw=2.5, linestyle=(0, (5, 3)), label='Q: one Gaussian')
    ax.set(xlim=(-10, 10), ylim=(0, 0.92), xticks=[-9, -6, -3, 0, 3, 6, 9], yticks=[0, 0.3, 0.6, 0.9])
    ax.set_xlabel('Example value x', color=INK)
    ax.set_ylabel('Probability density', color=INK)
    ax.grid(axis='y', color='#d9ded6', lw=0.7, alpha=0.8)
    ax.set_axisbelow(True)
    ax.spines[['top', 'right']].set_visible(False)
    for side in ['left', 'bottom']:
        ax.spines[side].set_color('#bcc8be')
    ax.tick_params(colors=INK, labelsize=11, length=3)
    ax.legend(loc='upper right', frameon=False, fontsize=11, labelcolor=INK)
    if mean == 0:
        ax.text(0, 0.58, 'Q reaches both groups', ha='center', color=INK, fontsize=12.5)
        for destination in [-3, 3]:
            ax.annotate('', xy=(destination, np.exp(log_normal(destination, mean, variance)) + 0.012),
                        xytext=(0, 0.54), arrowprops={'arrowstyle':'->', 'color':ORANGE, 'lw':1.3})
    else:
        ax.annotate('Q fits one group', xy=(-3, 0.59), xytext=(-8.8, 0.87),
                    color=INK, fontsize=12.5, arrowprops={'arrowstyle':'->', 'color':ORANGE, 'lw':1.3})
    fig.subplots_adjust(left=0.14, right=0.97, bottom=0.15, top=0.96)
    fig.savefig(DEST / name, format='svg', metadata={'Date':None, 'Creator':'Original illustration generated with Matplotlib'})
    plt.close(fig)


def main():
    plt.rcParams.update({'font.family':['DejaVu Sans','sans-serif'], 'font.size':12.5, 'svg.fonttype':'none', 'svg.hashsalt':'kl-comparison'})
    # Forward KL over all Gaussian Q is minimized by matching P's moments.
    # The reverse illustration uses one mixture component; its reflected fit is equivalent.
    make_plot('forward-kl-fit.svg', 0, 9.25)
    make_plot('reverse-kl-fit.svg', -3, 0.25)
    # Verify the depicted tradeoff by integrating over a range covering all relevant tails.
    x = np.linspace(-30, 30, 60001)
    lp = log_target(x)
    scores = []
    for mean, variance in [(0, 9.25), (-3, 0.25)]:
        lq = log_normal(x, mean, variance)
        forward = np.trapezoid(np.exp(lp) * (lp - lq), x) / np.log(2)
        reverse = np.trapezoid(np.exp(lq) * (lq - lp), x) / np.log(2)
        scores.append((forward, reverse))
    assert scores[0][0] < scores[1][0] and scores[1][1] < scores[0][1]
    print('Forward/reverse KL in bits for the wide and narrow fits:', scores)


if __name__ == '__main__':
    main()
