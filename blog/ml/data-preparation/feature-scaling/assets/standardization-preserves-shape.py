"""Render matched frequency plots with labels readable on a narrow screen."""

from collections import Counter
from pathlib import Path
from statistics import mean, pstdev

sample = [0, 0, 0, 0, 1, 2, 4, 8]
center, scale = mean(sample), pstdev(sample)
counts = Counter(sample)


def z(value):
    return (value - center) / scale


def position(value, lower, upper):
    return 48 + (value - lower) / (upper - lower) * 248


parts = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="440" '
    'viewBox="0 0 320 440" role="img" aria-labelledby="title description">',
    '<title id="title">Standardization preserves the observed frequency pattern</title>',
    '<desc id="description">The sample contains four zeros and one each of 1, 2, 4, '
    'and 8. Both panels use the same count scale. The top panel shows original '
    f'values; the bottom uses z = (x − {center:g}) / {scale:.6f}. '
    'Standardization changes the horizontal units, while the counts and relative '
    'spacing of the observations stay the same.</desc>',
    '<style>text{font:18px Arial,sans-serif;fill:#172c24} '
    '.heading{font-weight:700}.grid{stroke:#dce3dc;stroke-width:1} '
    '.axis{stroke:#53675b;stroke-width:1.2}</style>',
    '<rect width="320" height="440" rx="10" fill="#fffaf2"/>',
]

for offset, heading, transform in [
    (0, "Original values", lambda value: value),
    (218, "Standardized values", z),
]:
    baseline = 174 + offset
    lower, upper = transform(-0.6), transform(8.6)
    parts += [
        f'<text x="16" y="{28 + offset}" class="heading">{heading}</text>',
        f'<text x="48" y="{58 + offset}">Count</text>',
    ]
    for count in range(5):
        py = baseline - count * 24
        parts += [
            f'<path d="M48 {py}H296" class="grid"/>',
            f'<text x="38" y="{py + 6}" text-anchor="end">{count}</text>',
        ]
    for value, count in sorted(counts.items()):
        left = position(transform(value - 0.22), lower, upper)
        right = position(transform(value + 0.22), lower, upper)
        parts.append(
            f'<rect x="{left:.3f}" y="{baseline - count * 24}" '
            f'width="{right - left:.3f}" height="{count * 24}" fill="#098d6c"/>'
        )
    parts.append(f'<path d="M48 {baseline - 100}V{baseline}H296" '
                 'class="axis" fill="none"/>')
    for value in [0, 2, 4, 8]:
        px = position(transform(value), lower, upper)
        label = str(value) if offset == 0 else f"{transform(value):.2f}".replace("-", "−")
        parts += [
            f'<path d="M{px:.3f} {baseline}v5" class="axis"/>',
            f'<text x="{px:.3f}" y="{baseline + 27}" '
            f'text-anchor="middle">{label}</text>',
        ]

parts.append('</svg>')
Path(__file__).with_suffix('.svg').write_text('\n'.join(parts) + '\n')
