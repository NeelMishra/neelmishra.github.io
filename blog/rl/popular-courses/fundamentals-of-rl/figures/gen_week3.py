"""Figures for the Week 3 posts (policies, value functions, Bellman, optimality).

  1. gridworld-policy.png        -- a deterministic policy drawn as grid arrows.
  2. stochastic-policy.png       -- pi(a|s) bar chart for two states.
  3. gridworld-values.png        -- Sutton 5x5 gridworld state-value heatmap
     under the uniform random policy (gamma=0.9), solved as a linear system.
  4. gamma-crossover.png         -- how the optimal policy flips with gamma in
     the two-action example (reward +1 each 2 steps vs +2 each 2 steps).

Run:  python3 gen_week3.py
"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = "#0a8f6a"
BRAND2 = "#c98a2b"
INK = "#2d3a34"
MUTED = "#6b7a72"
LINE = "#d8dedb"

plt.rcParams.update({
    "font.family": "DejaVu Sans", "font.size": 11,
    "axes.edgecolor": LINE, "axes.labelcolor": INK, "text.color": INK,
    "xtick.color": MUTED, "ytick.color": MUTED, "figure.dpi": 130,
})


def fig_gridworld_policy():
    # 4x4 grid, goal (home) at top-right; deterministic policy points toward it.
    n = 4
    goal = (0, 3)
    fig, ax = plt.subplots(figsize=(4.6, 4.6))
    for i in range(n + 1):
        ax.plot([0, n], [i, i], color=LINE, lw=1)
        ax.plot([i, i], [0, n], color=LINE, lw=1)
    for r in range(n):
        for c in range(n):
            y = n - 1 - r
            if (r, c) == goal:
                ax.add_patch(plt.Rectangle((c, y), 1, 1, color=BRAND, alpha=0.18))
                ax.text(c + 0.5, y + 0.5, "\u2302", ha="center", va="center",
                        fontsize=24, color=INK)
                continue
            # greedy direction: reduce Manhattan distance to goal (up, then right)
            dr, dc = goal[0] - r, goal[1] - c
            if abs(dr) >= abs(dc):
                vx, vy = 0, (1 if dr < 0 else -1)   # move up toward row 0
            else:
                vx, vy = (1 if dc > 0 else -1), 0
            ax.annotate("", xy=(c + 0.5 + 0.28 * vx, y + 0.5 + 0.28 * vy),
                        xytext=(c + 0.5 - 0.28 * vx, y + 0.5 - 0.28 * vy),
                        arrowprops=dict(arrowstyle="-|>", color=BRAND, lw=2.2))
    ax.set_xlim(0, n); ax.set_ylim(0, n); ax.set_aspect("equal")
    ax.set_xticks([]); ax.set_yticks([])
    ax.set_title("A deterministic policy $\\pi(s)=a$", fontsize=11, color=INK)
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, "gridworld-policy.png"))
    plt.close(fig)


def fig_stochastic_policy():
    actions = ["Up", "Down", "Left", "Right"]
    s0 = [0.60, 0.07, 0.09, 0.24]
    s1 = [0.35, 0.14, 0.44, 0.07]
    x = np.arange(len(actions)); w = 0.38
    fig, ax = plt.subplots(figsize=(6.2, 3.8))
    ax.bar(x - w / 2, s0, w, color=BRAND, label="state $s_0$")
    ax.bar(x + w / 2, s1, w, color=BRAND2, label="state $s_1$")
    ax.set_xticks(x); ax.set_xticklabels(actions)
    ax.set_ylabel("$\\pi(a \\mid s)$"); ax.set_ylim(0, 0.7)
    ax.set_title("A stochastic policy: a probability distribution over actions",
                 fontsize=10.5, color=INK)
    ax.grid(axis="y", color=LINE, lw=0.8)
    ax.legend(frameon=False, fontsize=9)
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, "stochastic-policy.png"))
    plt.close(fig)


def solve_gridworld():
    n = 5; gamma = 0.9
    def idx(r, c): return r * n + c
    A, Ap, B, Bp = (0, 1), (4, 1), (0, 3), (2, 3)
    P = np.zeros((25, 25)); R = np.zeros(25)
    for r in range(n):
        for c in range(n):
            s = idx(r, c)
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                if (r, c) == A: nr, nc, rew = Ap[0], Ap[1], 10
                elif (r, c) == B: nr, nc, rew = Bp[0], Bp[1], 5
                else:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < n and 0 <= nc < n: rew = 0
                    else: nr, nc, rew = r, c, -1
                P[s, idx(nr, nc)] += 0.25
                R[s] += 0.25 * rew
    v = np.linalg.solve(np.eye(25) - gamma * P, R)
    return v.reshape(n, n)


def fig_gridworld_values():
    V = solve_gridworld()
    cmap = LinearSegmentedColormap.from_list("gw", ["#c0392b", "#ffffff", BRAND])
    fig, ax = plt.subplots(figsize=(5.2, 5.0))
    m = np.abs(V).max()
    ax.imshow(V, cmap=cmap, vmin=-m, vmax=m)
    for r in range(5):
        for c in range(5):
            ax.text(c, r, f"{V[r, c]:.1f}", ha="center", va="center",
                    fontsize=12, color=INK, fontweight="bold")
    for (r, c, t) in [(0, 1, "A"), (0, 3, "B"), (4, 1, "A'"), (2, 3, "B'")]:
        ax.text(c, r - 0.34, t, ha="center", va="center", fontsize=9, color=MUTED)
    ax.set_xticks([]); ax.set_yticks([])
    ax.set_title("5$\\times$5 gridworld $v_\\pi$ under the uniform random policy ($\\gamma=0.9$)",
                 fontsize=9.5, color=INK)
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, "gridworld-values.png"))
    plt.close(fig)


def fig_gamma_crossover():
    g = np.linspace(0, 0.98, 400)
    v1 = 1.0 / (1.0 - g ** 2)          # +1 every two steps:  sum gamma^{2k}
    v2 = 2.0 * g / (1.0 - g ** 2)      # +2 every two steps starting at step 2
    fig, ax = plt.subplots(figsize=(6.6, 3.9))
    ax.plot(g, v1, color=BRAND, lw=2, label="$v_{\\pi_1}(X)$  (take $A_1$: $+1$ now)")
    ax.plot(g, v2, color=BRAND2, lw=2, label="$v_{\\pi_2}(X)$  (take $A_2$: $+2$ in two steps)")
    ax.axvline(0.5, color=MUTED, ls="--", lw=1.2)
    ax.scatter([0.5], [1 / (1 - 0.25)], color=INK, zorder=5, s=26)
    ax.annotate("crossover at $\\gamma = 0.5$", (0.5, 1 / (1 - 0.25)),
                textcoords="offset points", xytext=(10, -4), fontsize=9, color=MUTED)
    ax.set_xlabel("discount factor $\\gamma$"); ax.set_ylabel("state value of $X$")
    ax.set_ylim(0, 12)
    ax.set_title("The optimal policy depends on $\\gamma$", fontsize=10.5, color=INK)
    ax.grid(color=LINE, lw=0.8)
    ax.legend(frameon=False, fontsize=9, loc="upper left")
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, "gamma-crossover.png"))
    plt.close(fig)


if __name__ == "__main__":
    fig_gridworld_policy(); print("[1/4] gridworld-policy.png")
    fig_stochastic_policy(); print("[2/4] stochastic-policy.png")
    fig_gridworld_values(); print("[3/4] gridworld-values.png")
    fig_gamma_crossover(); print("[4/4] gamma-crossover.png")
    print("done")
