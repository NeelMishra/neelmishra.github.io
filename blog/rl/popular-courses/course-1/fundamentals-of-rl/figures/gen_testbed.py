"""Generate 10-armed testbed figures for the Week 1 bandits blog post.

Reproduces the classic Sutton & Barto experiments:
  1. The testbed reward distributions (violin plot).
  2. epsilon-greedy: average reward and % optimal action for eps = 0, 0.01, 0.1.
  3. Optimistic initial values vs realistic eps-greedy (% optimal action).
  4. UCB vs eps-greedy (average reward).

Run:  python3 gen_testbed.py
Outputs PNGs next to this script.
"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

RNG = np.random.default_rng(42)
HERE = os.path.dirname(os.path.abspath(__file__))

K = 10
STEPS = 1000
RUNS = 2000

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


def run_bandit(eps=0.0, alpha=None, q_init=0.0, ucb_c=None):
    """Vectorised over RUNS. Returns (avg_reward[STEPS], pct_optimal[STEPS])."""
    q_true = RNG.normal(0.0, 1.0, size=(RUNS, K))
    best = np.argmax(q_true, axis=1)

    Q = np.full((RUNS, K), float(q_init))
    N = np.zeros((RUNS, K))
    rewards = np.zeros((RUNS, STEPS))
    optimal = np.zeros((RUNS, STEPS))
    rows = np.arange(RUNS)

    for t in range(STEPS):
        if ucb_c is not None:
            bonus = ucb_c * np.sqrt(np.log(t + 1) / (N + 1e-6))
            A = np.argmax(Q + bonus, axis=1)
        else:
            A = np.argmax(Q, axis=1)
            if eps > 0:
                explore = RNG.random(RUNS) < eps
                A[explore] = RNG.integers(0, K, size=explore.sum())

        R = RNG.normal(q_true[rows, A], 1.0)
        N[rows, A] += 1
        step = alpha if alpha is not None else 1.0 / N[rows, A]
        Q[rows, A] += step * (R - Q[rows, A])

        rewards[:, t] = R
        optimal[:, t] = (A == best)

    return rewards.mean(axis=0), optimal.mean(axis=0) * 100.0


def fig_violin():
    qs = RNG.normal(0.0, 1.0, size=K)
    data = [RNG.normal(qs[a], 1.0, size=2000) for a in range(K)]
    fig, ax = plt.subplots(figsize=(7.2, 4.0))
    parts = ax.violinplot(data, showmeans=False, showextrema=False, widths=0.8)
    for b in parts["bodies"]:
        b.set_facecolor(BRAND)
        b.set_edgecolor(BRAND)
        b.set_alpha(0.28)
    for a in range(K):
        ax.hlines(qs[a], a + 1 - 0.4, a + 1 + 0.4, color=BRAND, lw=2)
        ax.text(a + 1, qs[a] + 0.12, f"$q_*({a+1})$", ha="center",
                va="bottom", fontsize=7.5, color=MUTED)
    ax.axhline(0, color=MUTED, lw=0.9, ls="--")
    ax.set_xlabel("Action")
    ax.set_ylabel("Reward distribution")
    ax.set_xticks(range(1, K + 1))
    ax.set_title("One 10-armed testbed: each arm's true value and reward spread",
                 fontsize=11, color=INK)
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, "testbed-distributions.png"))
    plt.close(fig)


def fig_epsilon():
    configs = [(0.0, "$\\varepsilon = 0$ (greedy)", MUTED),
               (0.01, "$\\varepsilon = 0.01$", BRAND2),
               (0.1, "$\\varepsilon = 0.1$", BRAND)]
    results = {eps: run_bandit(eps=eps) for eps, _, _ in configs}
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.2, 3.8))
    x = np.arange(1, STEPS + 1)
    for eps, label, col in configs:
        avg, opt = results[eps]
        ax1.plot(x, avg, color=col, lw=1.6, label=label)
        ax2.plot(x, opt, color=col, lw=1.6, label=label)
    ax1.set_xlabel("Steps"); ax1.set_ylabel("Average reward")
    ax2.set_xlabel("Steps"); ax2.set_ylabel("% optimal action")
    ax2.set_ylim(0, 100)
    ax1.legend(frameon=False, fontsize=9)
    ax2.legend(frameon=False, fontsize=9, loc="lower right")
    fig.suptitle("$\\varepsilon$-greedy on the 10-armed testbed (averaged over 2000 runs)",
                 fontsize=11, color=INK)
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, "epsilon-greedy.png"))
    plt.close(fig)


def fig_optimistic():
    _, opt_optimistic = run_bandit(eps=0.0, alpha=0.1, q_init=5.0)
    _, opt_realistic = run_bandit(eps=0.1, alpha=0.1, q_init=0.0)
    fig, ax = plt.subplots(figsize=(7.2, 3.9))
    x = np.arange(1, STEPS + 1)
    ax.plot(x, opt_optimistic, color=BRAND, lw=1.7,
            label="optimistic greedy  $Q_1=5,\\ \\varepsilon=0$")
    ax.plot(x, opt_realistic, color=MUTED, lw=1.7,
            label="realistic $\\varepsilon$-greedy  $Q_1=0,\\ \\varepsilon=0.1$")
    ax.set_xlabel("Steps"); ax.set_ylabel("% optimal action"); ax.set_ylim(0, 100)
    ax.legend(frameon=False, fontsize=9, loc="lower right")
    ax.set_title("Optimistic initial values drive early exploration ($\\alpha=0.1$)",
                 fontsize=11, color=INK)
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, "optimistic-values.png"))
    plt.close(fig)


def fig_ucb():
    avg_ucb, _ = run_bandit(ucb_c=2.0)
    avg_eps, _ = run_bandit(eps=0.1)
    fig, ax = plt.subplots(figsize=(7.2, 3.9))
    x = np.arange(1, STEPS + 1)
    ax.plot(x, avg_ucb, color=BRAND, lw=1.7, label="UCB  $c = 2$")
    ax.plot(x, avg_eps, color=MUTED, lw=1.7, label="$\\varepsilon$-greedy  $\\varepsilon = 0.1$")
    ax.set_xlabel("Steps"); ax.set_ylabel("Average reward")
    ax.legend(frameon=False, fontsize=9, loc="lower right")
    ax.set_title("UCB explores by uncertainty, not at random (2000 runs)",
                 fontsize=11, color=INK)
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, "ucb-vs-epsilon.png"))
    plt.close(fig)


if __name__ == "__main__":
    fig_violin()
    print("[1/4] testbed-distributions.png")
    fig_epsilon()
    print("[2/4] epsilon-greedy.png")
    fig_optimistic()
    print("[3/4] optimistic-values.png")
    fig_ucb()
    print("[4/4] ucb-vs-epsilon.png")
    print("done")
