"""Reproduce the position guide's dimension-comparison figures.

Requires NumPy and Matplotlib. Run: python positional_dimension_figures.py
No training, model weights, network access, or benchmark results.
"""
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np


OUT = Path(__file__).resolve().parent.parent / "figures"


def frequencies(width):
    if width <= 0 or width % 2:
        raise ValueError("Embedding width must be a positive even integer")
    return 10000.0 ** (-np.arange(0, width, 2) / width)


def positions(length, width):
    phase = np.arange(length)[:, None] * frequencies(width)[None, :]
    values = np.empty((length, width))
    values[:, 0::2] = np.sin(phase)
    values[:, 1::2] = np.cos(phase)
    return values


def save(fig, name):
    target = OUT / name
    fig.savefig(target, format="svg", metadata={"Date": None})
    target.write_text("\n".join(line.rstrip() for line in target.read_text().splitlines()) + "\n")
    plt.close(fig)


def main():
    OUT.mkdir(exist_ok=True)
    widths = (20, 50)
    tables = [positions(40, width) for width in widths]
    np.testing.assert_allclose(tables[0][:, :2], tables[1][:, :2])
    np.testing.assert_allclose(
        [frequencies(width)[1] for width in widths],
        [.3981071705534972, .6918309709189365],
    )
    np.testing.assert_allclose(
        [2*np.pi/frequencies(width)[1] for width in widths],
        [15.782647919764756, 9.081965929963841],
    )
    np.testing.assert_allclose(tables[0][5, 2:4], [.9131951203434904, -.4075226032759879])
    np.testing.assert_allclose(tables[1][5, 2:4], [-.3122515830471297, -.9499994467811871])
    np.testing.assert_allclose(frequencies(20)[4], frequencies(50)[10])
    for width, table in zip(widths, tables):
        np.testing.assert_allclose(table[0], np.tile([0., 1.], width//2))
        np.testing.assert_allclose(np.sum(table**2, axis=1), width/2)
        np.testing.assert_allclose(np.diff(np.log(frequencies(width))),
                                   -2*np.log(10000)/width)

    plt.rcParams.update({
        "font.family": ["DejaVu Sans", "sans-serif"],
        "font.size": 12, "svg.fonttype": "none",
        "svg.hashsalt": "positional-dimensions-20261005",
        "axes.spines.top": False, "axes.spines.right": False,
        "savefig.facecolor": "#fffaf2",
    })
    x = np.linspace(0, 40, 1601)
    fig, axes = plt.subplots(2, 1, figsize=(7.2, 6.6), layout="constrained")
    axes[0].plot(x, np.sin(x), color="#315e9a", lw=1.8,
                 label="d = 20 and d = 50: the same curve")
    axes[0].set_title("Channel 0: frequency 1 at both widths", fontsize=13)
    for width, color, style in zip(widths, ["#126650", "#a45113"], ["-", "--"]):
        frequency = frequencies(width)[1]
        axes[1].plot(x, np.sin(x*frequency), color=color, ls=style, lw=1.8,
                     label=f"d = {width}: period {2*np.pi/frequency:.2f} steps")
    axes[1].set_title("Channel 2: larger d gives a faster wave", fontsize=13)
    for ax in axes:
        ax.set(xlim=(0, 40), ylim=(-1.1, 1.1), yticks=[-1, 0, 1],
               xlabel="Position i (token steps)", ylabel="Sine value")
        ax.axhline(0, color="#657369", lw=.7)
        ax.grid(alpha=.15)
        ax.legend(loc="upper right", fontsize=9, framealpha=.95)
    save(fig, "positional-width-waves.svg")

    fig, axes = plt.subplots(2, 1, figsize=(7.2, 6.8), layout="constrained")
    for ax, width, table in zip(axes, widths, tables):
        mesh = ax.pcolormesh(np.arange(width+1), np.arange(41), table,
                             cmap="RdBu_r", vmin=-1, vmax=1,
                             shading="flat", edgecolors="none", antialiased=False)
        tick_columns = [0, 4, 8, 12, 16, 19] if width == 20 else [0, 10, 20, 30, 40, 49]
        ax.set(xlim=(0, width), ylim=(40, 0),
               xlabel="Channel j in the position vector", ylabel="Position i")
        ax.set_xticks(np.array(tick_columns)+.5, tick_columns)
        ax.set_yticks(np.array([0, 10, 20, 30, 39])+.5, [0, 10, 20, 30, 39])
        ax.set_title(f"d = {width}: {width//2} sine/cosine pairs, the same 40 positions",
                     fontsize=12)
    colorbar = fig.colorbar(mesh, ax=axes, ticks=[-1, 0, 1], shrink=.85, pad=.025)
    colorbar.set_label("PE value")
    save(fig, "positional-width-heatmaps.svg")
    print("Verified width dependence and generated two original positional-encoding figures.")


if __name__ == "__main__":
    main()
