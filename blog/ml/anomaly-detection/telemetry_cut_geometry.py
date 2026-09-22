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
                         "font.size": 16, "axes.labelsize": 17})
    u = np.linspace(0, 1, 401)
    raw, logged = cuts(u)
    rows = []
    for draw in [.25, .5, .75]:
        a, b = cuts(draw)
        rows.append(dict(draw=draw, raw_cut=float(a), log1p_cut=float(b)))
        fig, ax = plt.subplots(figsize=(3.6, 4.8), layout="constrained")
        fig.patch.set_facecolor("#fffdf7"); ax.set_facecolor("#fffdf7")
        ax.plot(u, raw, color="#286348", lw=2.7, label="Raw")
        ax.plot(u, logged, color="#b6791d", lw=2.7, label="log1p", ls="--")
        ax.axvline(draw, color="#718479", lw=1, ls="--")
        ax.scatter([draw, draw], [a, b], s=75, c=["#286348", "#b6791d"], zorder=4)
        ax.set(xlim=(0, 1.03), ylim=(0, 22), xlabel="Uniform draw u",
               ylabel="Cut in original units", xticks=[0, .5, 1],
               yticks=[0, 10, 20])
        ax.grid(alpha=.18)
        ax.legend(loc="upper left", frameon=False, fontsize=16)
        target = assets / f"cut-geometry-{int(draw*100)}.svg"
        fig.savefig(target, metadata={"Date": None})
        target.write_text("\n".join(line.rstrip() for line in target.read_text().splitlines()) + "\n")
        plt.close(fig)
    with (assets / "cut-geometry.csv").open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["draw", "raw_cut", "log1p_cut"])
        writer.writeheader(); writer.writerows(rows)


if __name__ == "__main__":
    export()
