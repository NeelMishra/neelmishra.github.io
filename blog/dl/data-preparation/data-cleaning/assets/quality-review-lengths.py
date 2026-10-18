"""Render the Errors vs Outliers teaching figure using only the standard library."""

from pathlib import Path
from statistics import quantiles

reference = list(range(48, 56))
q1, _, q3 = quantiles(reference, n=4, method="inclusive")
lower = q1 - 1.5 * (q3 - q1)
upper = q3 + 1.5 * (q3 - q1)
cases = [("A", 150), ("B", 150), ("C", 51), ("D", -5), ("E", 150)]


def x(value):
    return 45 + (value + 15) / 190 * 251


parts = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="420" '
    'viewBox="0 0 320 420" role="img" aria-labelledby="title description">',
    '<title id="title">Recorded parcel lengths and a review interval</title>',
    '<desc id="description">The eight reference lengths run from 48 to 55 cm. '
    'The green review interval spans 44.5 to 58.5 cm. A, B and E record 150 cm; '
    'C records 51 cm; D records an invalid negative 5 cm. These are recorded '
    'values, before investigating source evidence.</desc>',
    '<style>text{font:18px Arial,sans-serif;fill:#172c24} '
    '.unusual{fill:#91491f}.invalid{fill:#a12f35}</style>',
    '<rect width="320" height="420" rx="10" fill="#fffaf2"/>',
    '<rect x="14" y="14" width="18" height="18" fill="#dcece4" stroke="#6e9d85"/>',
    '<text x="42" y="29">IQR review interval</text>',
    f'<text x="42" y="53">{lower:g}–{upper:g} cm</text>',
    f'<rect x="{x(lower):.3f}" y="70" width="{x(upper)-x(lower):.3f}" '
    'height="280" fill="#dcece4"/>',
]

for value in [0, 50, 100, 150]:
    px = x(value)
    parts += [
        f'<path d="M{px:.3f} 70V355" stroke="#c9d1ca" stroke-width="1"/>',
        f'<text x="{px:.3f}" y="376" text-anchor="middle">{value}</text>',
    ]

parts += [
    '<path d="M45 70V350H296" fill="none" stroke="#50665b" stroke-width="1.2"/>',
    '<text x="38" y="91" text-anchor="end">Ref.</text>',
    '<text x="157" y="91">48–55</text>',
]
for value in reference:
    parts.append(f'<circle cx="{x(value):.3f}" cy="85" r="2.3" fill="#596e62"/>')

for i, (name, value) in enumerate(cases):
    py = 130 + 45 * i
    px = x(value)
    parts.append(f'<text x="38" y="{py+6}" text-anchor="end">{name}</text>')
    if value <= 0:
        parts.append(f'<path d="M{px-4:.3f} {py-4}l8 8m-8 0l8-8" '
                     'stroke="#a12f35" stroke-width="2" fill="none"/>')
    else:
        color = "#91491f" if value < lower or value > upper else "#235d80"
        parts.append(f'<circle cx="{px:.3f}" cy="{py}" r="4" fill="{color}"/>')
    label_x, anchor = (px - 11, "end") if value == 150 else (px + 11, "start")
    css = "invalid" if value <= 0 else "unusual" if value > upper else ""
    label = "−5" if value == -5 else str(value)
    parts.append(f'<text x="{label_x:.3f}" y="{py+6}" text-anchor="{anchor}" '
                 f'class="{css}">{label}</text>')

parts += ['<text x="170" y="407" text-anchor="middle">Recorded length (cm)</text>', '</svg>']
Path(__file__).with_suffix(".svg").write_text("\n".join(parts) + "\n")
