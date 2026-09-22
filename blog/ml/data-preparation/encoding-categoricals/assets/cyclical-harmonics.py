"""Render the hourly harmonic example with labels readable on narrow screens.

The 24 equally spaced phases make the intercept and harmonic columns
orthogonal. Their individual projections therefore give the least-squares
coefficients, without an external numerical or plotting dependency.
"""

from math import cos, isclose, pi, sin
from pathlib import Path


def features(hour):
    angle = 2 * pi * hour / 24
    return (1, sin(angle), cos(angle), sin(2 * angle), cos(2 * angle))


hours = list(range(24))
outcomes = [10 - 5 * cos(4 * pi * hour / 24) for hour in hours]
columns = list(zip(*(features(hour) for hour in hours)))
coefficients = [
    sum(value * outcome for value, outcome in zip(column, outcomes))
    / sum(value * value for value in column)
    for column in columns
]


def predict(hour, width):
    return sum(value * coefficient for value, coefficient
               in zip(features(hour)[:width], coefficients[:width]))


assert all(isclose(predict(hour, 3), 10) for hour in hours)
assert all(isclose(predict(hour, 5), outcome)
           for hour, outcome in zip(hours, outcomes))


def x(hour):
    return 44 + hour / 24 * 252


def y(outcome):
    return 338 - (outcome - 4) / 12 * 192


parts = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="410" '
    'viewBox="0 0 320 410" role="img" aria-labelledby="title description">',
    '<title id="title">A second harmonic can fit two daily peaks</title>',
    '<desc id="description">The 24 constructed observations at hours 0 through '
    '23 follow 10 minus 5 times cosine of twice the daily angle. They peak at '
    'hours 6 and 18. Least squares with an intercept and one sine/cosine pair '
    'gives the dashed horizontal line at 10. Adding the second pair gives the '
    'solid curve through every observation. Curves extend to hour 24 to show '
    'the repeating cycle; hour 24 is not an additional observation.</desc>',
    '<style>text{font:18px Arial,sans-serif;fill:#172c24} '
    '.grid{stroke:#dce3dc;stroke-width:1} '
    '.axis{stroke:#53675b;stroke-width:1.2}</style>',
    '<rect width="320" height="410" rx="10" fill="#fffaf2"/>',
    '<circle cx="28" cy="23" r="3.4" fill="#173d34"/>',
    '<text x="52" y="29">24 hourly observations</text>',
    '<path d="M14 51H42" stroke="#078c6c" stroke-width="3"/>',
    '<text x="52" y="57">Two pairs: both peaks</text>',
    '<path d="M14 79H42" stroke="#b35e24" stroke-width="2.5" '
    'stroke-dasharray="7 4"/>',
    '<text x="52" y="85">One pair: flat at 10</text>',
    '<text x="44" y="127">Constructed outcome</text>',
]

for outcome in [5, 10, 15]:
    py = y(outcome)
    parts += [
        f'<path d="M44 {py:.3f}H296" class="grid"/>',
        f'<text x="35" y="{py + 6:.3f}" text-anchor="end">{outcome}</text>',
    ]

for hour in [0, 6, 12, 18, 24]:
    px = x(hour)
    parts += [
        f'<path d="M{px:.3f} 146V338" class="grid"/>',
        f'<path d="M{px:.3f} 338v5" class="axis"/>',
        f'<text x="{px:.3f}" y="363" text-anchor="middle">{hour}</text>',
    ]

parts.append('<path d="M44 146V338H296" class="axis" fill="none"/>')
for width, color, dash in [(5, '#078c6c', ''), (3, '#b35e24', ' stroke-dasharray="7 4"')]:
    points = ' '.join(f'{x(step / 10):.3f},{y(predict(step / 10, width)):.3f}'
                      for step in range(241))
    parts.append(f'<polyline data-pairs="{(width - 1) // 2}" points="{points}" '
                 f'fill="none" stroke="{color}" stroke-width="2.5"{dash}/>')

for hour, outcome in zip(hours, outcomes):
    parts.append(f'<circle data-hour="{hour}" data-outcome="{outcome:.12f}" '
                 f'cx="{x(hour):.3f}" cy="{y(outcome):.3f}" '
                 'r="3.4" fill="#173d34"/>')

parts += [
    '<text x="170" y="395" text-anchor="middle">Hour in a repeating day</text>',
    '</svg>',
]
Path(__file__).with_suffix('.svg').write_text('\n'.join(parts) + '\n')
