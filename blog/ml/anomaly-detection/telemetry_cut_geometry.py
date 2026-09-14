"""Export the synthetic raw/log1p cut comparison used in the telemetry note.

Requires NumPy and Matplotlib. Writes SVG figures and a three-row CSV beside
this script in assets/. All cuts are expressed in the original feature units.
"""
import csv
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np


def cuts(u):
    return 1 + 19 * u, np.expm1(np.log(2) + u * np.log(21 / 2))


def export():
    assets = Path(__file__).resolve().parent / "assets"
    assets.mkdir(exist_ok=True)
    plt.rcParams.update({"font.family": "sans-serif", "font.sans-serif": ["DejaVu Sans"],
                         "svg.fonttype": "none", "svg.hashsalt": "telemetry-cut-geometry",
                         "axes.spines.top": False, "axes.spines.right": False,
                         "font.size": 14, "axes.labelsize": 15})
    u = np.linspace(0, 1, 401)
    raw, logged = cuts(u)
    rows = []
    for draw in [.25, .5, .75]:
        a, b = cuts(draw)
        rows.append(dict(draw=draw, raw_cut=float(a), log1p_cut=float(b)))
        fig, ax = plt.subplots(figsize=(5.4, 4.7), layout="constrained")
        fig.patch.set_facecolor("#fffdf7"); ax.set_facecolor("#fffdf7")
        ax.plot(u, raw, color="#286348", lw=2.7, label="Raw feature")
        ax.plot(u, logged, color="#b6791d", lw=2.7, label="log1p feature")
        ax.axvline(draw, color="#718479", lw=1, ls="--")
        ax.scatter([draw, draw], [a, b], s=75, c=["#286348", "#b6791d"], zorder=4)
        for value, color, label in [(a, "#286348", "raw"), (b, "#9c6412", "log")]:
            ax.annotate(f"{label} {value:.2f}", (draw, value), xytext=(6, 7),
                        textcoords="offset points", fontsize=12.5, color=color)
        ax.set(xlim=(0, 1.03), ylim=(0, 22), xlabel="Uniform draw u",
               ylabel="Cut in original units", xticks=[0, .25, .5, .75, 1],
               yticks=[0, 5, 10, 15, 20])
        ax.grid(alpha=.18)
        ax.legend(loc="upper left", frameon=False, fontsize=13)
        fig.savefig(assets / f"cut-geometry-{int(draw*100)}.svg", metadata={"Date": None})
        plt.close(fig)
    with (assets / "cut-geometry.csv").open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["draw", "raw_cut", "log1p_cut"])
        writer.writeheader(); writer.writerows(rows)


if __name__ == "__main__":
    export()
