#!/usr/bin/env python3
"""Rebuild interaction-shipping-slopes.svg using only the standard library.

Run from any directory. Preserve the original 100 weights from 1 to 4 kg,
the illustrative coefficients [5, 2, 3, 2], and the original axis limits.
The rules are specified by the example; this generator does not fit a model.
"""

from html import escape
from pathlib import Path


COEFFICIENTS = (5, 2, 3, 2)
WEIGHTS = tuple(1 + 3 * i / 99 for i in range(100))
LEFT, RIGHT, TOP, BOTTOM = 58, 304, 94, 322
X_MIN, X_MAX, Y_MIN, Y_MAX = .8, 4.2, 5, 26


def price(weight, express):
    intercept, weight_coef, service_coef, product_coef = COEFFICIENTS
    return intercept + weight_coef * weight + service_coef * express + product_coef * weight * express


def point(weight, cost):
    return (LEFT + (weight - X_MIN) / (X_MAX - X_MIN) * (RIGHT - LEFT),
            BOTTOM - (cost - Y_MIN) / (Y_MAX - Y_MIN) * (BOTTOM - TOP))


def make_svg():
    labels = []

    def text(x, y, value, extra=""):
        labels.append(f'<text x="{x}" y="{y}" {extra}>{escape(str(value))}</text>')

    text(60, 26, "Economy: +2 per kg")
    text(60, 54, "Express: +4 per kg")
    grid = []
    for x in range(1, 5):
        px, _ = point(x, Y_MIN)
        grid.append(f'<path d="M {px:.6f} {TOP} V {BOTTOM}"/>')
        text(f"{px:.6f}", 348, x, 'text-anchor="middle"')
    for y in (5, 10, 15, 20, 25):
        _, py = point(X_MIN, y)
        grid.append(f'<path d="M {LEFT} {py:.6f} H {RIGHT}"/>')
        text(49, f"{py + 6:.6f}", y, 'text-anchor="end"')
    text(181, 377, "Parcel weight (kg)", 'text-anchor="middle"')
    text(18, 208, "Price (credits)", 'text-anchor="middle" transform="rotate(-90 18 208)"')

    curves = []
    for express, name, color in ((0, "economy", "#23775d"), (1, "express", "#b45a29")):
        coords = (point(x, price(x, express)) for x in WEIGHTS)
        path = " ".join(f'{"M" if i == 0 else "L"} {px:.6f} {py:.6f}'
                        for i, (px, py) in enumerate(coords))
        curves.append(f'<path id="{name}-curve" d="{path}" fill="none" stroke="{color}" stroke-width="2.7"/>')

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="320" height="392" viewBox="0 0 320 392" role="img" aria-labelledby="title description">
<title id="title">Shipping slopes with a weight–service interaction</title>
<desc id="description">Between 1 and 4 kg, economy follows 5 + 2x credits and express follows 8 + 4x credits. The express surcharge is 3 + 2x, so it grows with weight. Axis limits are 0.8 to 4.2 kg and 5 to 26 credits.</desc>
<!-- Reproduce with interaction-shipping-slopes.py. All labels use 18 SVG units. -->
<rect width="320" height="392" fill="#fffdf8"/>
<path d="M 20 20 H 48" fill="none" stroke="#23775d" stroke-width="2.7"/>
<path d="M 20 48 H 48" fill="none" stroke="#b45a29" stroke-width="2.7"/>
<g stroke="#dde3dd" stroke-width="1">{"".join(grid)}</g>
<path d="M {LEFT} {TOP} V {BOTTOM} H {RIGHT}" fill="none" stroke="#718077" stroke-width="1.3"/>
{"".join(curves)}
<g fill="#20392f" font-family="Arial, sans-serif" font-size="18">{"".join(labels)}</g>
</svg>
'''


if __name__ == "__main__":
    Path(__file__).with_suffix(".svg").write_text(make_svg(), encoding="utf-8")
