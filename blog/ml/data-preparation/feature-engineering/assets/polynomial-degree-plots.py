#!/usr/bin/env python3
"""Rebuild polynomial-degree-{1,2,8}.svg using only the Python standard library.

Run this file from any working directory. The nine observations, unregularized
least-squares fits, 401-point reference grid and common axis limits match the
article. Exact rational elimination avoids numerical conditioning errors in
this tiny experiment; it is not a recommended solver for large datasets.
"""

from fractions import Fraction as F
from html import escape
from math import sqrt
from pathlib import Path


X = tuple(F(i, 2) for i in range(-4, 5))
NOISE = tuple(map(F, (".15", "-.2", ".1", "0", "-.15", ".25", "-.1", ".1", "-.05")))
DEGREES = (1, 2, 8)
GRID = tuple(F(-2) + F(i, 100) for i in range(401))
LEFT, RIGHT, TOP, BOTTOM = 58, 304, 114, 354
X_MIN, X_MAX, Y_MIN, Y_MAX = -2.1, 2.1, .3, 6.3


def reference(x):
    return 1 + F(1, 2) * x + F(3, 4) * x * x


Y = tuple(reference(x) + noise for x, noise in zip(X, NOISE))


def coefficients(degree):
    """Solve the exact least-squares normal equations, including an intercept."""
    n = degree + 1
    matrix = [[sum(x ** (j + k) for x in X) for k in range(n)]
              + [sum(y * x ** j for x, y in zip(X, Y))] for j in range(n)]
    for j in range(n):
        pivot = next(k for k in range(j, n) if matrix[k][j])
        matrix[j], matrix[pivot] = matrix[pivot], matrix[j]
        divisor = matrix[j][j]
        matrix[j] = [v / divisor for v in matrix[j]]
        for k in range(n):
            if k != j:
                factor = matrix[k][j]
                matrix[k] = [a - factor * b for a, b in zip(matrix[k], matrix[j])]
    return tuple(row[-1] for row in matrix)


def predict(x, weights):
    value = F(0)
    for weight in reversed(weights):
        value = value * x + weight
    return value


def metrics(weights):
    return {
        "train": sqrt(sum(float(predict(x, weights) - y) ** 2 for x, y in zip(X, Y)) / len(X)),
        "reference": sqrt(sum(float(predict(x, weights) - reference(x)) ** 2 for x in GRID) / len(GRID)),
        "at3": float(predict(F(3), weights)),
    }


def point(x, y):
    return (LEFT + (float(x) - X_MIN) / (X_MAX - X_MIN) * (RIGHT - LEFT),
            BOTTOM - (float(y) - Y_MIN) / (Y_MAX - Y_MIN) * (BOTTOM - TOP))


def path(values):
    return " ".join(f'{"M" if i == 0 else "L"} {px:.6f} {py:.6f}'
                    for i, (px, py) in enumerate(point(x, y) for x, y in values))


def make_svg(degree):
    weights = coefficients(degree)
    labels = []

    def text(x, y, value, extra=""):
        labels.append(f'<text x="{x}" y="{y}" {extra}>{escape(str(value))}</text>')

    for y, label in ((24, "Known toy curve"), (50, f"Degree {degree} fit"),
                     (76, "9 training observations")):
        text(60, y, label)
    grid = []
    for x in range(-2, 3):
        px, _ = point(x, Y_MIN)
        grid.append(f'<path d="M {px:.6f} {TOP} V {BOTTOM}"/>')
        text(f"{px:.6f}", 380, str(x).replace("-", "−"), 'text-anchor="middle"')
    for y in range(1, 7):
        _, py = point(X_MIN, y)
        grid.append(f'<path d="M {LEFT} {py:.6f} H {RIGHT}"/>')
        text(49, f"{py + 6:.6f}", y, 'text-anchor="end"')
    text(181, 409, "Original feature x", 'text-anchor="middle"')
    text(18, 234, "Predicted or observed y", 'text-anchor="middle" transform="rotate(-90 18 234)"')
    dots = "\n".join(f'<circle cx="{px:.6f}" cy="{py:.6f}" r="3.7"/>'
                     for px, py in (point(x, y) for x, y in zip(X, Y)))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="320" height="424" viewBox="0 0 320 424" role="img" aria-labelledby="title description">
<title id="title">Degree {degree} polynomial fit</title>
<desc id="description">Nine fixed noisy observations compared with the known curve 1 + 0.5x + 0.75x² and an unregularized degree {degree} least-squares fit. Every degree uses x limits −2.1 to 2.1 and y limits 0.3 to 6.3.</desc>
<!-- Reproduce with polynomial-degree-plots.py. All labels use 18 SVG units. -->
<rect width="320" height="424" fill="#fffdf8"/>
<g stroke="#dde3dd" stroke-width="1">{"".join(grid)}</g>
<path d="M {LEFT} {TOP} V {BOTTOM} H {RIGHT}" fill="none" stroke="#718077" stroke-width="1.3"/>
<path d="M 20 18 H 48" fill="none" stroke="#23775d" stroke-width="2" stroke-dasharray="6 4"/>
<path d="M 20 44 H 48" fill="none" stroke="#b45a29" stroke-width="2.5"/>
<circle cx="34" cy="70" r="3.7" fill="#375d8c"/>
<path id="reference-curve" d="{path((x, reference(x)) for x in GRID)}" fill="none" stroke="#23775d" stroke-width="2" stroke-dasharray="6 4"/>
<path id="fitted-curve" d="{path((x, predict(x, weights)) for x in GRID)}" fill="none" stroke="#b45a29" stroke-width="2.5" stroke-linejoin="round"/>
<g id="training-observations" fill="#375d8c">{dots}</g>
<g fill="#20392f" font-family="Arial, sans-serif" font-size="18">{"".join(labels)}</g>
</svg>
'''


if __name__ == "__main__":
    directory = Path(__file__).resolve().parent
    for degree in DEGREES:
        (directory / f"polynomial-degree-{degree}.svg").write_text(make_svg(degree), encoding="utf-8")
        print(f"Degree {degree}: {metrics(coefficients(degree))}")
