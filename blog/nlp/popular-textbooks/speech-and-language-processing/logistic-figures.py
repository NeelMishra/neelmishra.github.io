"""Generate original chapter figures. Requires matplotlib; run from any directory."""
from pathlib import Path
import math
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

OUT = Path(__file__).resolve().parent
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 12,
                     "svg.fonttype": "none", "svg.hashsalt": "slp3-chapter4", "axes.spines.top": False,
                     "axes.spines.right": False, "axes.spines.left": False,
                     "axes.spines.bottom": False, "text.color": "#13201a",
                     "axes.labelcolor": "#13201a", "xtick.color": "#4a5a53",
                     "ytick.color": "#13201a", "figure.facecolor": "#fffdf9",
                     "axes.facecolor": "#fffdf9"})

fig, ax = plt.subplots(figsize=(10, 5.7))
fig.subplots_adjust(left=.33, right=.94, bottom=.23, top=.76)
labels = ["broken: 2 × 0.8", "late: 0 × 0.3", "refund: 1 × 0.5",
          "thanks: 0 × (−0.4)", "bias: always added"]
values = [1.6, 0, .5, 0, -1.2]
colors = ["#087354", "#9cb7a9", "#087354", "#9cb7a9", "#ad5728"]
ax.barh(range(5), values, color=colors, height=.55)
ax.set_yticks(range(5), labels)
ax.invert_yaxis()
ax.set_xlim(-1.7, 1.95)
ax.set_xticks([-1.5, -1, -.5, 0, .5, 1, 1.5])
ax.axvline(0, color="#68796d", lw=1)
ax.grid(axis="x", color="#d9e0d9", zorder=0)
ax.set_axisbelow(True)
ax.tick_params(axis="both", length=0, pad=9)
ax.set_xlabel("Contribution to the damage-class logit", labelpad=12)
for i, value in enumerate(values):
    if value == 0:
        ax.plot(0, i, "o", color="#789789", markersize=6)
    ax.text(value + (.08 if value >= 0 else -.08), i,
            f"{value:+.1f}" if value else "0.0", ha="left" if value >= 0 else "right",
            va="center", weight="bold", fontsize=12)
fig.text(.045, .94, "Which words moved the score?", fontsize=21, weight="bold")
fig.text(.045, .874, 'Message: “broken parcel broken please refund”', fontsize=13)
fig.text(.045, .83, "Each bar is a count × weight. Zero counts contribute nothing.", fontsize=12, color="#4a5a53")
fig.text(.045, .065, "1.6 + 0 + 0.5 + 0 − 1.2 = 0.90   →   sigmoid(0.90) = 71.09%",
         fontsize=14, weight="bold", bbox={"facecolor":"#edf2ec","edgecolor":"none","pad":12})
fig.savefig(OUT / "logistic-contributions.svg", metadata={"Date": None, "Title":"Feature contributions to one logistic-regression score", "Description":"Original invented example. Broken contributes 1.6; refund 0.5; bias minus 1.2; late and thanks zero. Sum 0.9 gives probability 0.7109."})
plt.close(fig)

fig, ax = plt.subplots(figsize=(10, 5.7))
fig.subplots_adjust(left=.11, right=.94, bottom=.19, top=.77)
xs = [i / 50 for i in range(-250, 251)]
ys = [1 / (1 + math.exp(-x)) for x in xs]
ax.plot(xs, ys, color="#087354", lw=3)
ax.set_xlim(-5, 5)
ax.set_ylim(-.025, 1.075)
ax.set_yticks([0, .25, .5, .75, 1], ["0%", "25%", "50%", "75%", "100%"])
ax.set_xticks([-4, -2, 0, 2, 4])
ax.grid(color="#dde3dc", lw=.8)
ax.axhline(.5, color="#ad5728", linestyle="--", lw=1.5)
ax.axvline(0, color="#ad5728", linestyle="--", lw=1)
p = 1 / (1 + math.exp(-.9))
ax.plot(.9, p, "o", color="#133e32", markersize=9)
ax.annotate("Our ticket\nz = 0.90 → p = 71.09%", xy=(.9,p), xytext=(-3.9,.86),
            fontsize=13, weight="bold", arrowprops={"arrowstyle":"->","color":"#133e32","lw":1.4},
            bbox={"boxstyle":"round,pad=.45","fc":"#edf2ec","ec":"none"})
ax.text(1.35,.42,"Threshold 0.50 crosses at logit 0",fontsize=11,color="#8d421b")
ax.set_xlabel("Logit z = weighted features + bias", labelpad=12)
ax.set_ylabel("Estimated probability of damage", labelpad=13)
ax.tick_params(length=0, pad=9)
fig.text(.045, .94, "A score becomes a probability", fontsize=21, weight="bold")
fig.text(.045, .874, "The sigmoid is smooth; the final routing decision uses a chosen threshold.", fontsize=12,color="#4a5a53")
fig.text(.11, .045, "A one-unit logit increase has a different probability effect near 0 than near either tail.", fontsize=11,color="#4a5a53")
fig.savefig(OUT / "logistic-sigmoid.svg", metadata={"Date": None, "Title":"Sigmoid curve and the example ticket", "Description":"Sigmoid maps logits to probabilities. Zero maps to 0.5, and the example logit 0.9 maps to 0.7109. The curve flattens toward zero and one."})
plt.close(fig)

# Keep labels as selectable SVG text with a portable browser font stack.
# DejaVu Sans determines the Matplotlib layout; Arial is close on web browsers.
for name in ("logistic-contributions.svg", "logistic-sigmoid.svg"):
    path = OUT / name
    svg = path.read_text().replace("font-family: 'DejaVu Sans'", "font-family: Arial, sans-serif")
    path.write_text("\n".join(line.rstrip() for line in svg.splitlines()) + "\n")
