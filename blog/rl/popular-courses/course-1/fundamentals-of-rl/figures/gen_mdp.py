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

    Two states (high, low). Solid dots are (state, action) pairs; a thin grey
    stub connects each state to its action dots, and a coloured arrow leaves
    every dot for the resulting next state, labelled with the transition
    probability and the reward earned on that transition.

    Layout: each state keeps its own action dots on its own side (high's on the
    left, low's on the right), and the two long cross-state arrows are routed on
    opposite sides -- the rescue over the top, the alpha-split under the bottom
    -- so they never cross. Concrete course values are r_search = +10,
    r_wait = +1, and -20 on the rescue.
    """
    import numpy as np
    from matplotlib.patches import Circle, FancyArrowPatch
    import matplotlib.lines as mlines

    fig, ax = plt.subplots(figsize=(11.0, 5.9))
    ax.set_xlim(-3.4, 13.4)
    ax.set_ylim(-4.9, 4.0)
    ax.axis("off")
    ax.set_aspect("equal")

    SEARCH = BRAND
    WAIT = BRAND2
    RECHARGE = "#3a7bd5"
    RESCUE = "#c0392b"
    STUB = "#b8c2bd"
    R = 0.95

    states = {"high": (0.0, 0.0), "low": (10.0, 0.0)}
    actions = {
        "h_search":   (0.0, -2.9),
        "h_wait":     (0.0, 2.9),
        "l_search":   (10.0, 2.9),
        "l_wait":     (10.0, -2.9),
        "l_recharge": (5.0, 0.0),
    }

    def edge_pt(state, toward, gap=0.0):
        """Point on the rim of a state circle in the direction of `toward`."""
        sx, sy = states[state]
        tx, ty = toward
        dx, dy = tx - sx, ty - sy
        d = (dx * dx + dy * dy) ** 0.5
        return sx + dx / d * (R + gap), sy + dy / d * (R + gap)

    def stub(state, akey):
        sx, sy = edge_pt(state, actions[akey])
        ax_, ay_ = actions[akey]
        ax.add_line(mlines.Line2D([sx, ax_], [sy, ay_], color=STUB, lw=1.4,
                                  zorder=1, solid_capstyle="round"))

    def arrow(akey, target_state, col, rad=0.0):
        ax_, ay_ = actions[akey]
        tx, ty = edge_pt(target_state, actions[akey], gap=0.02)
        ax.add_patch(FancyArrowPatch(
            (ax_, ay_), (tx, ty), connectionstyle=f"arc3,rad={rad}",
            arrowstyle="-|>", mutation_scale=16, lw=1.7, color=col,
            shrinkA=6, shrinkB=2, zorder=2))

    def loop(akey, state, col, side=+1):
        """Self-return arrow from an action dot back to its own state,
        bowed out to one side so it reads as a clear loop."""
        ax_, ay_ = actions[akey]
        tx, ty = edge_pt(state, (actions[akey][0] + side * 1.6, actions[akey][1]))
        ax.add_patch(FancyArrowPatch(
            (ax_, ay_), (tx, ty), connectionstyle=f"arc3,rad={0.55*side}",
            arrowstyle="-|>", mutation_scale=16, lw=1.7, color=col,
            shrinkA=6, shrinkB=2, zorder=2))

    def lbl(x, y, txt, col, fs=11):
        ax.text(x, y, txt, ha="center", va="center", fontsize=fs, color=col,
                zorder=6, bbox=dict(boxstyle="round,pad=0.2", fc="white",
                                    ec="none", alpha=0.92))

    # stubs (state -> its action dots)
    for st, ak in [("high", "h_search"), ("high", "h_wait"),
                   ("low", "l_search"), ("low", "l_wait"), ("low", "l_recharge")]:
        stub(st, ak)

    # action dots
    for (x, y) in actions.values():
        ax.scatter([x], [y], s=80, color=INK, zorder=5)

    # state circles (drawn on top of stubs/dots)
    for name, (x, y) in states.items():
        ax.add_patch(Circle((x, y), R, facecolor="#eef5f2",
                             edgecolor=INK, lw=2.0, zorder=4))
        ax.text(x, y, name, ha="center", va="center",
                fontsize=15, fontweight="bold", color=INK, zorder=5)

    # action-name tags next to each dot
    lbl(0.95, 3.28, "wait", WAIT, fs=10.5)
    lbl(0.95, -3.3, "search", SEARCH, fs=10.5)
    lbl(9.05, 3.28, "search", SEARCH, fs=10.5)
    lbl(9.05, -3.3, "wait", WAIT, fs=10.5)
    lbl(5.0, 0.52, "recharge", RECHARGE, fs=10.5)

    # high / wait -> high (deterministic self-return), top-left
    loop("h_wait", "high", WAIT, side=-1)
    lbl(-2.45, 1.62, r"$1,\ r_{\mathrm{wait}}$", WAIT)

    # high / search -> high (alpha) bottom-left loop, and -> low (1-alpha)
    # routed along the bottom so it never meets the rescue arrow up top
    loop("h_search", "high", SEARCH, side=-1)
    lbl(-2.45, -1.62, r"$\alpha,\ r_{\mathrm{search}}$", SEARCH)
    arrow("h_search", "low", SEARCH, rad=0.22)
    lbl(5.0, -3.42, r"$1-\alpha,\ r_{\mathrm{search}}\ (+10)$", SEARCH)

    # low / search -> low (beta) top-right loop, and -> high (1-beta, rescued)
    # routed over the top
    loop("l_search", "low", SEARCH, side=+1)
    lbl(12.45, 1.62, r"$\beta,\ r_{\mathrm{search}}$", SEARCH)
    arrow("l_search", "high", RESCUE, rad=0.22)
    lbl(5.0, 3.36, r"$1-\beta,\ r_{\mathrm{rescued}}\ (-20)$", RESCUE)

    # low / wait -> low (deterministic self-return), bottom-right
    loop("l_wait", "low", WAIT, side=+1)
    lbl(12.45, -1.62, r"$1,\ r_{\mathrm{wait}}\ (+1)$", WAIT)

    # recharge -> high (deterministic, reward 0)
    arrow("l_recharge", "high", RECHARGE, rad=0.0)
    lbl(2.6, 0.32, r"$1,\ 0$", RECHARGE)

    # notation reminder, as in the source sketch
    ax.text(5.0, -4.5, r"notation:   $p,\ \mathrm{reward}$", ha="center",
            va="center", fontsize=11.5, color=MUTED, style="italic", zorder=6)

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
