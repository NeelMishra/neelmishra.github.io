"""Render the row-normalization example with equal coordinate scales."""

from math import hypot
from pathlib import Path

rows = {"A": (3, 4), "B": (6, 8), "C": (-3, 0), "D": (0, 0)}
normalized = {
    name: tuple(value / (hypot(*row) or 1) for value in row)
    for name, row in rows.items()
}
origin_x, origin_y, radius = 158, 154, 94


def point(row):
    return origin_x + radius * row[0], origin_y - radius * row[1]


parts = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="396" '
    'viewBox="0 0 320 396" role="img" aria-labelledby="title description">',
    '<title id="title">L2 normalization keeps direction and removes length</title>',
    '<desc id="description">The horizontal axis is the first normalized coordinate; '
    'the vertical axis is the second. Both axes use the same scale. A and B '
    'coincide at (0.6, 0.8) on the dashed unit circle. C reaches (−1, 0). '
    'The zero row D remains at the origin and has no direction.</desc>',
    '<style>text{font:18px Arial,sans-serif;fill:#172c24} '
    '.heading{font-weight:700}.axis{stroke:#a1ada2;stroke-width:1.2}</style>',
    '<defs><marker id="arrow" viewBox="0 0 6 6" refX="5" refY="3" '
    'markerWidth="5" markerHeight="5" orient="auto-start-reverse">'
    '<path d="M0 0L6 3L0 6" fill="none" stroke="context-stroke"/>'
    '</marker></defs>',
    '<rect width="320" height="396" rx="10" fill="#fffaf2"/>',
    '<text x="16" y="26" class="heading">L2-normalized rows</text>',
    f'<circle cx="{origin_x}" cy="{origin_y}" r="{radius}" fill="none" '
    'stroke="#9cac9e" stroke-width="1.5" stroke-dasharray="5 4"/>',
    f'<path d="M35 {origin_y}H286M{origin_x} 40V270" class="axis"/>',
    '<text x="286" y="180" text-anchor="middle">x₁</text>',
    '<text x="169" y="45">x₂</text>',
]

for value in [-1, 1]:
    px, _ = point((value, 0))
    _, py = point((0, value))
    label = str(value).replace('-', '−')
    parts += [
        f'<path d="M{px} {origin_y - 4}v8M{origin_x - 4} {py}h8" class="axis"/>',
        f'<text x="{px}" y="{origin_y + 26}" text-anchor="middle">{label}</text>',
        f'<text x="{origin_x - 11}" y="{py + 6}" text-anchor="end">{label}</text>',
    ]

for name, color in [('A', '#078d6b'), ('C', '#a55b26')]:
    px, py = point(normalized[name])
    parts += [
        f'<path d="M{origin_x} {origin_y}L{px:.3f} {py:.3f}" fill="none" '
        f'stroke="{color}" stroke-width="2.3" marker-end="url(#arrow)"/>',
        f'<circle cx="{px:.3f}" cy="{py:.3f}" r="4" fill="{color}"/>',
    ]

parts += [
    f'<circle cx="{origin_x}" cy="{origin_y}" r="3.5" fill="#172c24"/>',
    '<text x="230" y="83">A, B</text>',
    '<text x="64" y="141" text-anchor="middle">C</text>',
    '<text x="169" y="178">D</text>',
    '<text x="16" y="297">Dashed circle: length 1</text>',
    f'<text x="16" y="325">A and B → ({normalized["A"][0]:g}, '
    f'{normalized["A"][1]:g})</text>',
    f'<text x="16" y="353">C → (−{abs(normalized["C"][0]):g}, '
    f'{normalized["C"][1]:g})</text>',
    '<text x="16" y="381">D → (0, 0); no direction</text>',
    '</svg>',
]
Path(__file__).with_suffix('.svg').write_text('\n'.join(parts) + '\n')
