"""Generate the original d=8 figures used in Positional Encoding Deep Dive.

Requires NumPy and Matplotlib. Run from a repository checkout:
python positional_deep_dive_figures.py
The shared positional_dimension_figures.py module must be alongside this file.
"""
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from positional_dimension_figures import frequencies, positions


OUT = Path(__file__).resolve().parent.parent / "figures"


def main():
    OUT.mkdir(exist_ok=True)
    table = positions(81, 8)
    offsets = np.arange(81)
    kernel = table @ table[0]
    expected = np.cos(offsets[:, None]*frequencies(8)[None, :]).sum(axis=1)
    np.testing.assert_allclose(kernel, expected, atol=1e-12)
    distance_squared = np.sum((table-table[0])**2, axis=1)
    np.testing.assert_allclose(distance_squared, 8-2*kernel, atol=1e-12)
    np.testing.assert_allclose(kernel[[0, 1, 3, 4]],
                               [4, 3.535255971562872, 1.964889526277523, 2.266609479810918],
                               atol=1e-9)
    assert kernel[4] > kernel[3]

    plt.rcParams.update({
        "font.family": ["DejaVu Sans", "sans-serif"],
        "font.size": 12, "svg.fonttype": "none",
        "svg.hashsalt": "positional-deep-dive-20261005",
        "axes.spines.top": False, "axes.spines.right": False,
        "savefig.facecolor": "#fffaf2",
    })
    fig, ax = plt.subplots(figsize=(7.2, 5.6), layout="constrained")
    mesh = ax.pcolormesh(np.arange(9), np.arange(9), table[:8], cmap="RdBu_r",
                         vmin=-1, vmax=1, shading="flat",
                         edgecolors="none", antialiased=False)
    for row in range(8):
        for column in range(8):
            value = table[row, column]
            ax.text(column+.5, row+.5, f"{value:.2f}", ha="center", va="center",
                    fontsize=9, color="white" if abs(value) > .65 else "#283a32")
    ax.set(xlim=(0, 8), ylim=(8, 0), xlabel="Channel j", ylabel="Position t",
           title="Eight position vectors, each with width d = 8")
    ax.set_xticks(np.arange(8)+.5, np.arange(8))
    ax.set_yticks(np.arange(8)+.5, np.arange(8))
    fig.colorbar(mesh, ax=ax, ticks=[-1, 0, 1], label="Position feature value", pad=.025)
    save(fig, "positional-deep-dive-table.svg")

    fig, axes = plt.subplots(2, 1, figsize=(7.2, 6.4), layout="constrained", sharex=True)
    axes[0].plot(offsets, kernel, color="#126650", lw=1.6, marker=".", ms=3)
    axes[0].set(ylabel="Raw dot product K(delta)", title="Relative does not mean monotonic")
    axes[1].plot(offsets, distance_squared, color="#315e9a", lw=1.6, marker=".", ms=3)
    axes[1].set(xlabel="Integer token offset delta",
                ylabel="Squared vector distance", title="Distance squared = 8 - 2 K(delta)")
    for ax in axes:
        ax.set_xlim(0, 80)
        ax.grid(alpha=.15)
    save(fig, "positional-deep-dive-kernel.svg")
    print("Verified d=8 features, relative kernel, non-monotonic example, and vector distances.")


def save(fig, name):
    target = OUT / name
    fig.savefig(target, format="svg", metadata={"Date": None})
    target.write_text("\n".join(line.rstrip() for line in target.read_text().splitlines())+"\n")
    plt.close(fig)


if __name__ == "__main__":
    main()
