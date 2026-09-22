#!/usr/bin/env python3
"""Rebuild binning-same-values.svg with the Python standard library.

The cuts are the saved outputs of the article's twelve-row training experiment.
Their precision matches the interactive example. Counts are recomputed with
bisect_right, so values exactly on a cut enter the bin on its right. The original
horizontal limits and the observations' relative vertical staggering are kept.
Run this file from any directory; it writes only the SVG beside it.
"""

from bisect import bisect_right
from html import escape
from pathlib import Path


VALUES = (0, 1, 2, 3, 4, 5, 6, 7, 8, 40, 50, 60)
PARTITIONS = (
    ("uniform", "Equal width", (20.0, 40.0)),
    ("quantile", "Quantiles", (3.666666666666667, 7.333333333333334)),
    ("kmeans", "1D k-means", (22.0, 47.5)),
)
COLORS = ("#23775d", "#b45a29", "#375d8c")
LEFT, RIGHT, X_MIN, X_MAX = 16, 304, -2, 62
PANEL_STEP, PLOT_TOP, PLOT_HEIGHT = 194, 64, 90


def x_position(value):
    return LEFT + (value - X_MIN) / (X_MAX - X_MIN) * (RIGHT - LEFT)


def counts(cuts):
    result = [0, 0, 0]
    for value in VALUES:
        result[bisect_right(cuts, value)] += 1
    return result


def make_svg():
    panels = []
    for panel, (name, title, cuts) in enumerate(PARTITIONS):
        offset = panel * PANEL_STEP
        top, bottom = offset + PLOT_TOP, offset + PLOT_TOP + PLOT_HEIGHT
        elements = [f'<g id="{name}-panel">',
                    f'<text x="16" y="{offset + 24}" font-weight="700">{escape(title)}</text>',
                    f'<text x="16" y="{offset + 50}">Counts: {", ".join(map(str, counts(cuts)))}</text>']
        edges = (0,) + cuts + (60,)
        for j, color in enumerate(COLORS):
            left, right = x_position(edges[j]), x_position(edges[j + 1])
            elements.append(f'<rect data-bin="{j}" x="{left:.6f}" y="{top}" width="{right - left:.6f}" height="{PLOT_HEIGHT}" fill="{color}" fill-opacity="0.12"/>')
        for cut in cuts:
            x = x_position(cut)
            elements.append(f'<path data-cut="{cut}" d="M {x:.6f} {top} V {bottom}" fill="none" stroke="#6b746f" stroke-width="1.2" stroke-dasharray="3 3"/>')
        elements.append(f'<path d="M {LEFT} {bottom} H {RIGHT}" fill="none" stroke="#718077" stroke-width="1.2"/>')
        for tick in (0, 20, 40, 60):
            x = x_position(tick)
            elements.append(f'<path d="M {x:.6f} {bottom} v 4" stroke="#718077"/>')
            elements.append(f'<text x="{x:.6f}" y="{bottom + 23}" text-anchor="middle">{tick}</text>')
        for i, value in enumerate(VALUES):
            y = bottom - (.33 + .1 * (i % 3)) * PLOT_HEIGHT
            elements.append(f'<circle data-value="{value}" cx="{x_position(value):.6f}" cy="{y:.6f}" r="3.2" fill="#20392f"/>')
        elements.append('</g>')
        panels.append("\n".join(elements))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="320" height="606" viewBox="0 0 320 606" role="img" aria-labelledby="title description">
<title id="title">Three partitions of the same twelve values</title>
<desc id="description">Equal-width cuts 20 and 40 give counts 9, 0, 3. Linear-quantile cuts 3⅔ and 7⅓ give counts 4, 4, 4. K-means cuts 22 and 47.5 give counts 9, 1, 2. Counts run left to right. All panels show the same observations and horizontal scale; vertical staggering only separates nearby dots. Colored area is not probability or density.</desc>
<!-- Reproduce with binning-same-values.py. All labels use 18 SVG units. -->
<rect width="320" height="606" fill="#fffdf8"/>
<g fill="#20392f" font-family="Arial, sans-serif" font-size="18">
{"".join(panels)}
<text x="160" y="594" text-anchor="middle">Original feature value</text>
</g>
</svg>
'''


if __name__ == "__main__":
    Path(__file__).with_suffix(".svg").write_text(make_svg(), encoding="utf-8")
