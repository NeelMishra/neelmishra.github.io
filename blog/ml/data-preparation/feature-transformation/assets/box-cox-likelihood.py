"""Render the worked Box–Cox likelihood with mobile-readable labels.

Run this standard-library script to regenerate the adjacent SVG. The six
training values and profile likelihood are the example in box-cox.html.
Golden-section search maximizes this example's unimodal profile on the
displayed interval; it is not a general-purpose Box–Cox fitting routine.
"""

from math import expm1, fsum, log, sqrt
from pathlib import Path


TRAINING_VALUES = (1, 2, 3, 5, 12, 40)
LAMBDA_MIN, LAMBDA_MAX = -1.5, 1.5


def log_likelihood(parameter):
    transformed = [
        log(value) if parameter == 0 else expm1(parameter * log(value)) / parameter
        for value in TRAINING_VALUES
    ]
    n = len(transformed)
    mean = fsum(transformed) / n
    variance = fsum((value - mean) ** 2 for value in transformed) / n
    return -n / 2 * log(variance) + (parameter - 1) * fsum(
        log(value) for value in TRAINING_VALUES
    )


def fitted_parameter():
    left, right = LAMBDA_MIN, LAMBDA_MAX
    ratio = (sqrt(5) - 1) / 2
    lower = right - ratio * (right - left)
    upper = left + ratio * (right - left)
    lower_score, upper_score = log_likelihood(lower), log_likelihood(upper)
    for _ in range(80):
        if lower_score < upper_score:
            left, lower, lower_score = lower, upper, upper_score
            upper = left + ratio * (right - left)
            upper_score = log_likelihood(upper)
        else:
            right, upper, upper_score = upper, lower, lower_score
            lower = right - ratio * (right - left)
            lower_score = log_likelihood(lower)
    return (left + right) / 2


def plot_x(parameter):
    return 52 + (parameter - LAMBDA_MIN) / (LAMBDA_MAX - LAMBDA_MIN) * 244


def plot_y(relative_score):
    return 132 - relative_score * 20


def render():
    optimum = fitted_parameter()
    best_score = log_likelihood(optimum)
    # Include the fitted maximum itself, as well as a uniform plotting grid.
    parameters = sorted({LAMBDA_MIN + step / 80 for step in range(241)} | {optimum})
    coordinates = ' '.join(
        f'{plot_x(parameter):.6f},{plot_y(log_likelihood(parameter) - best_score):.6f}'
        for parameter in parameters
    )
    peak_x = plot_x(optimum)
    optimum_label = f'Best λ ≈ {optimum:.3f}'.replace('-', '−')
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="416" '
        'viewBox="0 0 320 416" role="img" aria-labelledby="title description">',
        '<title id="title">The fitted Box–Cox parameter maximizes the training likelihood</title>',
        '<desc id="description">For training values 1, 2, 3, 5, 12 and 40, '
        'the Gaussian profile log-likelihood peaks at lambda approximately '
        'minus 0.223. Scores are shown relative to that maximum, which is zero. '
        'The orange point marks the maximum and the dashed line locates its '
        'parameter on the horizontal axis.</desc>',
        '<style>text{font:18px Arial,sans-serif;fill:#172c24} '
        '.grid{stroke:#dce3dc;stroke-width:1} '
        '.axis{stroke:#53675b;stroke-width:1.2}</style>',
        '<rect width="320" height="416" rx="10" fill="#fffaf2"/>',
        '<text x="16" y="27">Log-likelihood</text>',
        '<text x="16" y="51">relative to best fit</text>',
        '<text id="optimum-label" x="160" y="88" text-anchor="middle">'
        f'{optimum_label}</text>',
        f'<path d="M{peak_x:.6f} 99V122m-4 -6 4 6 4 -6" fill="none" '
        'stroke="#b45309" stroke-width="1.5"/>',
    ]
    for score in (0, -2, -4, -6, -8, -10):
        y = plot_y(score)
        label = str(score).replace('-', '−')
        parts += [
            f'<path d="M52 {y}H296" class="grid"/>',
            f'<text x="43" y="{y + 6}" text-anchor="end">{label}</text>',
        ]
    for parameter in (-1.5, -1, -0.5, 0, 0.5, 1, 1.5):
        x = plot_x(parameter)
        label = f'{parameter:g}'.replace('-', '−')
        parts += [
            f'<path d="M{x:.6f} 132V332" class="grid"/>',
            f'<path d="M{x:.6f} 332v5" class="axis"/>',
            f'<text x="{x:.6f}" y="360" text-anchor="middle">{label}</text>',
        ]
    parts += [
        '<path d="M52 132V332H296" class="axis" fill="none"/>',
        f'<path d="M{peak_x:.6f} 132V332" fill="none" stroke="#b45309" '
        'stroke-width="1.5" stroke-dasharray="4 4"/>',
        f'<polyline id="likelihood-curve" points="{coordinates}" fill="none" '
        'stroke="#087f68" stroke-width="2.5" stroke-linejoin="round"/>',
        f'<circle id="fitted-maximum" data-lambda="{optimum:.12f}" '
        f'cx="{peak_x:.6f}" cy="132" r="4" fill="#b45309"/>',
        '<text x="174" y="396" text-anchor="middle">Box–Cox parameter λ</text>',
        '</svg>',
    ]
    return '\n'.join(parts) + '\n'


if __name__ == '__main__':
    Path(__file__).with_suffix('.svg').write_text(render(), encoding='utf-8')
