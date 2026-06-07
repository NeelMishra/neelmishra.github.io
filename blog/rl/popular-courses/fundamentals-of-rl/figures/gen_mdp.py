"""Generate figures for the Week 2 Markov Decision Processes blog post.

  1. discounting-horizon.png  -- how gamma shapes the weight gamma^k of a
     reward k steps away, plus the effective horizon 1/(1-gamma).
  2. discounted-return-example.png -- the worked example from my notes:
     reward +5 at t=1 then an infinite tail of +10, gamma = 0.8, so the
     cumulative discounted return converges to G_0 = 45.

Run:  python3 gen_mdp.py
Outputs PNGs next to this script.
"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))

BRAND = "#0a8f6a"
BRAND2 = "#c98a2b"
INK = "#2d3a34"
MUTED = "#6b7a72"
LINE = "#d8dedb"

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 11,
    "axes.edgecolor": LINE,
    "axes.labelcolor": INK,
    "text.color": INK,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
    "axes.grid": True,
    "grid.color": LINE,
    "grid.linewidth": 0.8,
    "figure.dpi": 130,
})


def fig_discounting():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.4, 3.9))
    ks = np.arange(0, 51)
    gammas = [(0.5, BRAND2), (0.9, BRAND), (0.95, "#3a7bd5"), (0.99, MUTED)]
    for g, col in gammas:
        ax1.plot(ks, g ** ks, color=col, lw=1.7, label=f"$\\gamma = {g}$")
    ax1.set_xlabel("steps into the future $k$")
    ax1.set_ylabel("weight on reward $\\gamma^k$")
    ax1.set_title("A reward $k$ steps away is worth $\\gamma^k$ now", fontsize=10.5, color=INK)
    ax1.legend(frameon=False, fontsize=9)

    g = np.linspace(0, 0.99, 400)
    ax2.plot(g, 1.0 / (1.0 - g), color=BRAND, lw=2)
    ax2.set_xlabel("discount factor $\\gamma$")
    ax2.set_ylabel("effective horizon $\\frac{1}{1-\\gamma}$")
    ax2.set_ylim(0, 110)
    ax2.set_title("Larger $\\gamma$ means a longer planning horizon", fontsize=10.5, color=INK)
    for gv in (0.5, 0.9, 0.99):
        ax2.scatter([gv], [1 / (1 - gv)], color=BRAND2, zorder=5, s=28)
        ax2.annotate(f"$\\gamma={gv}\\to{1/(1-gv):.0f}$", (gv, 1 / (1 - gv)),
                     textcoords="offset points", xytext=(-6, 8),
                     ha="right", fontsize=8.5, color=MUTED)
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, "discounting-horizon.png"))
    plt.close(fig)


def fig_return_example():
    gamma = 0.8
    n = 40
    rewards = np.array([5.0] + [10.0] * n)          # R_1, R_2, ...
    weights = gamma ** np.arange(len(rewards))       # gamma^0 R_1 + gamma^1 R_2 + ...
    contrib = rewards * weights
    cum = np.cumsum(contrib)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.4, 3.9))
    steps = np.arange(1, len(rewards) + 1)
    ax1.bar(steps, contrib, color=BRAND, width=0.8)
    ax1.set_xlabel("future step")
    ax1.set_ylabel("discounted contribution $\\gamma^{k}R_{1+k}$")
    ax1.set_title("Each future reward, discounted ($\\gamma = 0.8$)", fontsize=10.5, color=INK)
    ax1.set_xlim(0, 22)

    ax2.plot(steps, cum, color=BRAND, lw=2, marker="o", ms=3)
    ax2.axhline(45, color=BRAND2, ls="--", lw=1.4, label="limit $G_0 = 45$")
    ax2.set_xlabel("rewards summed")
    ax2.set_ylabel("cumulative return $G_0$")
    ax2.set_title("The infinite sum converges to a finite value", fontsize=10.5, color=INK)
    ax2.set_xlim(0, 22)
    ax2.legend(frameon=False, fontsize=9, loc="lower right")
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, "discounted-return-example.png"))
    plt.close(fig)
    return cum[-1]


if __name__ == "__main__":
    fig_discounting()
    print("[1/2] discounting-horizon.png")
    g0 = fig_return_example()
    print("[2/2] discounted-return-example.png  (G_0 ->", round(g0, 3), ")")
    print("done")
