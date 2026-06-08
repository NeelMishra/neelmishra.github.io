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


def fig_recycling_robot():
    """Transition graph for the recycling-robot MDP (Sutton & Barto, Ex. 3.3).

    Two states (high, low). Solid dots are (state, action) pairs; arrows leave
    them to next states, each labelled with its transition probability and the
    reward earned on that transition.
    """
    from matplotlib.patches import Circle, FancyArrowPatch

    fig, ax = plt.subplots(figsize=(9.6, 5.4))
    ax.set_xlim(-1.4, 11.4)
    ax.set_ylim(-3.6, 3.6)
    ax.axis("off")
    ax.set_aspect("equal")

    SEARCH = BRAND
    WAIT = BRAND2
    RECHARGE = "#3a7bd5"
    RESCUE = "#c0392b"

    # State nodes
    states = {"high": (0.0, 0.0), "low": (10.0, 0.0)}
    for name, (x, y) in states.items():
        ax.add_patch(Circle((x, y), 0.95, facecolor="#eef5f2",
                             edgecolor=INK, lw=2.0, zorder=3))
        ax.text(x, y, name, ha="center", va="center",
                fontsize=15, fontweight="bold", color=INK, zorder=4)

    # Action nodes (solid dots)
    actions = {
        "h_search": (3.1, 2.0),
        "h_wait":   (2.0, -2.5),
        "l_search": (6.9, 2.0),
        "l_wait":   (8.0, -2.5),
        "l_recharge": (5.0, -1.2),
    }
    for (x, y) in actions.values():
        ax.scatter([x], [y], s=70, color=INK, zorder=5)

    def stub(s, a, col):
        """Short line from a state circle edge to its action dot."""
        sx, sy = states[s]
        ax, ay = actions[a]
        dx, dy = ax - sx, ay - sy
        d = (dx * dx + dy * dy) ** 0.5
        sx2, sy2 = sx + dx / d * 0.95, sy + dy / d * 0.95
        return sx2, sy2, ax, ay, col

    import matplotlib.lines as mlines

    def line(x1, y1, x2, y2, col):
        ax.add_line(mlines.Line2D([x1, x2], [y1, y2], color=col, lw=1.6, zorder=2))

    def arrow(x1, y1, x2, y2, col, rad=0.0, shrinkB=24):
        ax.add_patch(FancyArrowPatch(
            (x1, y1), (x2, y2), connectionstyle=f"arc3,rad={rad}",
            arrowstyle="-|>", mutation_scale=15, lw=1.6, color=col,
            shrinkA=0, shrinkB=shrinkB, zorder=2))

    def alabel(x, y, txt, col, dy=0.0):
        ax.text(x, y + dy, txt, ha="center", va="center", fontsize=10.5,
                color=col, zorder=6,
                bbox=dict(boxstyle="round,pad=0.18", fc="white", ec="none", alpha=0.9))

    # state -> action stubs + action labels
    for s, a, col, lab, lpos in [
        ("high", "h_search", SEARCH, "search", (1.55, 1.35)),
        ("high", "h_wait", WAIT, "wait", (0.7, -1.45)),
        ("low", "l_search", SEARCH, "search", (8.45, 1.35)),
        ("low", "l_wait", WAIT, "wait", (9.3, -1.45)),
        ("low", "l_recharge", RECHARGE, "recharge", (7.55, -0.7)),
    ]:
        x1, y1, x2, y2, c = stub(s, a, col)
        line(x1, y1, x2, y2, c)
        alabel(lpos[0], lpos[1], lab, col)

    hx, hy = states["high"]
    lx, ly = states["low"]

    # high, search -> high (alpha) and -> low (1-alpha)
    ax_, ay_ = actions["h_search"]
    arrow(ax_, ay_, hx + 0.2, hy + 0.9, SEARCH, rad=0.35)
    alabel(1.2, 2.55, r"$\alpha,\ r_{\mathrm{search}}$", SEARCH)
    arrow(ax_, ay_, lx - 0.4, ly + 0.85, SEARCH, rad=-0.12)
    alabel(6.0, 2.7, r"$1-\alpha,\ r_{\mathrm{search}}$", SEARCH)

    # high, wait -> high (1)
    ax_, ay_ = actions["h_wait"]
    arrow(ax_, ay_, hx - 0.1, hy - 0.9, WAIT, rad=0.35)
    alabel(0.05, -2.0, r"$1,\ r_{\mathrm{wait}}$", WAIT)

    # low, search -> low (beta) and -> high (1-beta), rescued, reward -3
    ax_, ay_ = actions["l_search"]
    arrow(ax_, ay_, lx - 0.2, ly + 0.9, SEARCH, rad=-0.35)
    alabel(8.8, 2.55, r"$\beta,\ r_{\mathrm{search}}$", SEARCH)
    arrow(ax_, ay_, hx + 0.4, hy + 0.9, RESCUE, rad=0.12)
    alabel(4.0, 3.05, r"$1-\beta,\ -20$ (rescued)", RESCUE)

    # low, wait -> low (1)
    ax_, ay_ = actions["l_wait"]
    arrow(ax_, ay_, lx + 0.1, ly - 0.9, WAIT, rad=-0.35)
    alabel(9.95, -2.0, r"$1,\ r_{\mathrm{wait}}$", WAIT)

    # low, recharge -> high (1, reward 0)
    ax_, ay_ = actions["l_recharge"]
    arrow(ax_, ay_, hx + 0.5, hy - 0.75, RECHARGE, rad=0.12)
    alabel(2.9, -1.65, r"$1,\ 0$", RECHARGE)

    fig.tight_layout()
    fig.savefig(os.path.join(HERE, "recycling-robot-mdp.png"))
    plt.close(fig)


if __name__ == "__main__":
    fig_discounting()
    print("[1/3] discounting-horizon.png")
    g0 = fig_return_example()
    print("[2/3] discounted-return-example.png  (G_0 ->", round(g0, 3), ")")
    fig_recycling_robot()
    print("[3/3] recycling-robot-mdp.png")
    print("done")
