"""Reproduce polynomial fits, validation, conditioning, and extrapolation.

Requires Python 3, NumPy, and Matplotlib.
Run: python render_basis_figures.py [--preview-dir /tmp/basis-preview]
All observations are constructed explicitly; they are not a random benchmark.
"""
from pathlib import Path
import argparse
import numpy as np
from numpy.polynomial import Polynomial, Chebyshev
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--preview-dir', type=Path)
args = parser.parse_args()
HERE = Path(__file__).resolve().parent
x = np.arange(-3., 4.)
y = np.array([1.8, .7, 1.5, 0., 2.5, 2.7, 4.8])
x_valid = np.array([-2.5, -1.5, -.5, .5, 1.5, 2.5])
y_valid = np.array([1.7125, .5125, 1.0125, .8125, 2.6125, 3.6125])
x_test = np.array([-2.75, -1.25, .25, 1.75, 2.75])
y_test = np.array([1.815625, .565625, 1.640625, 2.240625, 4.365625])
f = lambda values: 1+.5*values+.25*values**2
mse = lambda observed, predicted: np.mean((observed-predicted)**2)
np.testing.assert_allclose(y-f(x), np.array([1, -6, 15, -20, 15, -6, 1])/20, atol=1e-14)
np.testing.assert_allclose(y_valid-f(x_valid), [.4, -.3, .2, -.5, .3, -.2], atol=1e-14)
np.testing.assert_allclose(y_test-f(x_test), [.3, -.2, .5, -.4, .1], atol=1e-14)
models = {d: Polynomial.fit(x, y, d) for d in [1, 2, 6]}
expected_beta = {1: [2, .5], 2: [1, .5, .25],
                 6: [0, .5, 1669/600, 0, -203/240, 0, 77/1200]}
expected_train = {1: 1.08, 2: .33, 6: 0.}
expected_valid = {1: .70515625, 2: .1116666666666667, 6: 2.9059814834594727}
check_grid = np.linspace(-4, 4, 201)
for degree, model in models.items():
    beta = model.convert().coef
    np.testing.assert_allclose(beta, expected_beta[degree], atol=1e-11)
    design = np.vander(x, degree+1, increasing=True)
    svd_beta = np.linalg.lstsq(design, y, rcond=None)[0]
    Q, R = np.linalg.qr(design, mode='reduced')
    qr_beta = np.linalg.solve(R, Q.T @ y)
    np.testing.assert_allclose(svd_beta, beta, atol=1e-10)
    np.testing.assert_allclose(qr_beta, beta, atol=1e-10)
    chebyshev = Chebyshev.fit(x, y, degree)
    np.testing.assert_allclose(chebyshev(check_grid), model(check_grid), atol=1e-9)
    np.testing.assert_allclose(model(check_grid), Polynomial(expected_beta[degree])(check_grid), atol=1e-9)
    np.testing.assert_allclose(design.T @ (y-model(x)), 0, atol=1e-9)
    np.testing.assert_allclose(mse(y, model(x)), expected_train[degree], atol=1e-12)
    np.testing.assert_allclose(mse(y_valid, model(x_valid)), expected_valid[degree], atol=1e-12)
    print(f'Degree {degree}: coefficients={beta}; training MSE={mse(y,model(x)):.12f}; validation MSE={mse(y_valid,model(x_valid)):.12f}')
chosen = min(models, key=lambda degree: mse(y_valid, models[degree](x_valid)))
assert chosen == 2
# Only the model selected by validation is scored against the test labels.
test_mse = mse(y_test, models[chosen](x_test))
np.testing.assert_allclose(test_mse, .11, atol=1e-14)
Phi = np.vander(x, 3, increasing=True)
np.testing.assert_allclose(Phi.T @ Phi, [[7, 0, 28], [0, 28, 0], [28, 0, 196]])
np.testing.assert_allclose(Phi.T @ y, [14, 14, 77], atol=1e-13)
np.testing.assert_allclose(np.sum((y-models[2](x))**2), 2.31, atol=1e-12)
np.testing.assert_allclose(models[2].deriv()([0, 2]), [.5, 1.5], atol=1e-12)
# Basis changes preserve the entire unpenalized function when transformed consistently.
ortho = np.column_stack([np.ones(7), x, x*x-4])
np.testing.assert_allclose(ortho.T @ ortho, np.diag([7, 28, 84]))
ortho_beta = np.linalg.lstsq(ortho, y, rcond=None)[0]
np.testing.assert_allclose(ortho_beta, [2, .5, .25], atol=1e-12)
new_ortho = np.column_stack([np.ones(len(check_grid)), check_grid, check_grid**2-4])
np.testing.assert_allclose(new_ortho @ ortho_beta, models[2](check_grid), atol=1e-12)
shifted = Polynomial.fit(x+100, y, 2).convert()
np.testing.assert_allclose(shifted.coef, [2451, -49.5, .25], atol=1e-9)
np.testing.assert_allclose(shifted(check_grid+100), models[2](check_grid), atol=1e-9)
Q, R = np.linalg.qr(Phi, mode='reduced')
new_Q = np.linalg.solve(R.T, np.vander(check_grid, 3, increasing=True).T).T
np.testing.assert_allclose(new_Q @ (Q.T @ y), models[2](check_grid), atol=1e-12)
condition_numbers = [np.linalg.cond(np.vander(x+100, 3, increasing=True)),
                     np.linalg.cond(Phi), np.linalg.cond(np.vander(x/3, 3, increasing=True)),
                     np.linalg.cond(Q)]
np.testing.assert_allclose(condition_numbers, [28902138.483752694, 8.250372251043855, 3.1818988873332525, 1.], rtol=1e-9)
np.testing.assert_allclose(models[2](4), 7.)
np.testing.assert_allclose(models[6]([4, 5]), [92.8, 546.], atol=1e-9)
print(f'Selected degree={chosen}; final test MSE={test_mse:.12f}; condition numbers={condition_numbers}')
print('Exact coefficients, SVD/QR/Chebyshev agreement, residual geometry, preprocessing transformations, and extrapolation checks passed.')

INK, MUTED, BLUE, ORANGE, GREEN, PURPLE = '#182536', '#536475', '#176b93', '#b44a24', '#087f6d', '#7853a6'
plt.rcParams.update({
    'font.family': ['DejaVu Sans', 'Arial', 'sans-serif'], 'font.size': 17,
    'text.color': INK, 'axes.labelcolor': INK, 'xtick.color': MUTED,
    'ytick.color': MUTED, 'axes.edgecolor': '#b7c3cd',
    'axes.spines.top': False, 'axes.spines.right': False,
    'svg.fonttype': 'none', 'svg.hashsalt': 'basis-regression-v1',
    'figure.facecolor': 'white', 'axes.facecolor': 'white',
})


def save(fig, name, description):
    path = HERE / f'{name}.svg'
    fig.savefig(path, metadata={'Title': name.replace('-', ' ').title(),
        'Description': description, 'Creator': 'render_basis_figures.py', 'Date': None})
    path.write_text('\n'.join(line.rstrip() for line in path.read_text().splitlines())+'\n')
    if args.preview_dir:
        args.preview_dir.mkdir(parents=True, exist_ok=True)
        fig.savefig(args.preview_dir / f'{name}.png', dpi=150)
    plt.close(fig)


fig, axes = plt.subplots(3, 1, figsize=(4.4, 10), layout='constrained')
grid = np.linspace(-3, 3, 601)
for index, (ax, degree) in enumerate(zip(axes, [1, 2, 6])):
    ax.plot(grid, models[degree](grid), color=BLUE, lw=2.6)
    ax.scatter(x, y, color=INK, s=35, zorder=4, label='Train')
    ax.scatter(x_valid, y_valid, color=ORANGE, marker='x', linewidths=1.8, s=50, zorder=5, label='Validate')
    ax.set(xlim=(-3.25, 3.25), ylim=(-2, 7), xticks=[-3, 0, 3], yticks=[-2, 0, 2, 4, 6],
           xlabel='Input x' if index==2 else '', ylabel='Response y')
    ax.set_title(f'Degree {degree}\nValidation MSE {expected_valid[degree]:.6f}', loc='left', fontsize=17, fontweight='bold', pad=12)
    if index==0:
        ax.legend(loc='upper left', frameon=False, fontsize=15, ncol=2, columnspacing=.6, handletextpad=.25)
    ax.grid(axis='y', alpha=.18)
save(fig, 'basis-degree-validation', 'Actual degree one, two and six fits to seven constructed training points, with six unused validation points. Matched axes and displayed validation mean squared errors.')

fig, ax = plt.subplots(figsize=(4.4, 5), layout='constrained')
ax.axvspan(3, 4.08, color='#fbf0dd', zorder=0)
ax.axvline(3, color=MUTED, ls=':', lw=1.5)
grid = np.linspace(2.45, 4, 301)
for degree, color, style in [(2, GREEN, '-'), (6, PURPLE, '--')]:
    ax.plot(grid, models[degree](grid), color=color, lw=2.7, ls=style, label=f'Degree {degree}')
    ax.scatter(4, models[degree](4), color=color, s=50, zorder=4)
ax.scatter([3], [y[-1]], color=INK, s=40, zorder=5)
ax.annotate('Training\nedge', xy=(3, y[-1]), xytext=(2.54, 33), fontsize=15,
            arrowprops={'arrowstyle':'->', 'color':MUTED, 'lw':1.2}, color=MUTED)
ax.text(3.95, 97, '92.8', color=PURPLE, fontsize=17, ha='right')
ax.text(3.96, 13, '7.0', color=GREEN, fontsize=17, ha='right')
ax.set(xlim=(2.45, 4.08), ylim=(-5, 110), xticks=[2.5, 3, 3.5, 4], yticks=[0, 25, 50, 75, 100],
       xlabel='Input x', ylabel='Predicted response')
ax.set_title('Past the training edge\nPredictions at x = 4', loc='left', fontsize=17, fontweight='bold', pad=12)
ax.legend(loc='upper left', frameon=True, facecolor='white', edgecolor='none', framealpha=.95, fontsize=16)
ax.grid(axis='y', alpha=.18)
save(fig, 'basis-extrapolation', 'Predictions from the same quadratic and degree six training fits just beyond the right boundary x=3. At x=4 their predictions are 7 and 92.8. Shading marks the unobserved region.')
