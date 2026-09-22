#!/usr/bin/env python3
"""Generate the two static, no-JavaScript gradient-descent figures.

Run with Python 3 and NumPy. The browser computes gradients directly from rows
and contours by completing the square; this generator independently uses an
orthonormal eigendecomposition and verifies every contour vertex.
"""
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring
import numpy as np

OUT = Path(__file__).resolve().parent
X = np.array([[-2., -1.], [-1., -1.], [0., 0.], [1., 1.], [2., 1.]])
y = np.array([-3., -1., 0., 1., 3.])
star = np.linalg.lstsq(X, y, rcond=None)[0]
A = X.T @ X / len(y)
eigenvalues, eigenvectors = np.linalg.eigh(A)
ETA, STEPS = .6, 20
LEVELS = [.05, .2, .5, 1.]
COLORS = dict(ink='#18332b', grid='#d7e2dc', contour='#8bb9a7', path='#087e62', current='#d64b1f')


def objective(beta):
    residual = X @ beta - y
    return residual @ residual / (2 * len(y))


def trajectory(eta, steps=STEPS):
    beta = np.array([-1., 3.])
    points = [beta.copy()]
    for _ in range(steps):
        beta -= eta * (X.T @ (X @ beta - y) / len(y))
        points.append(beta.copy())
    return np.array(points)


history = trajectory(ETA)
losses = np.array([objective(beta) for beta in history])
assert np.allclose(star, [2., -1.])
assert np.allclose(history[1], [-.28, 3.24])
assert np.allclose(losses[[0, 1, 2, 9, 20]], [1., .7888, .6752896, .3810535832395725, .17390643477409634])
assert np.all(np.diff(losses) < 0)
assert np.allclose(trajectory(.6, 1500)[-1], star)
# Independent spectral recurrence agrees with every per-row gradient update.
for t, beta in enumerate(history):
    spectral = star + eigenvectors @ ((1 - ETA * eigenvalues) ** t * (eigenvectors.T @ (history[0] - star)))
    assert np.allclose(beta, spectral)
# Central finite differences check the objective/gradient relationship.
for beta in [history[0], history[2], history[-1]]:
    fd = np.array([(objective(beta + 1e-5 * row) - objective(beta - 1e-5 * row)) / 2e-5 for row in np.eye(2)])
    assert np.allclose(fd, X.T @ (X @ beta - y) / len(y), atol=1e-9)


def node(parent, name, text=None, **attrs):
    element = SubElement(parent, name, {key.replace('_', '-'): str(value) for key, value in attrs.items()})
    if text is not None:
        element.text = str(text)
    return element


def root(title, description):
    svg = Element('svg', {'xmlns': 'http://www.w3.org/2000/svg', 'viewBox': '0 0 320 320', 'role': 'img', 'aria-labelledby': 'title desc'})
    node(svg, 'title', title, id='title')
    node(svg, 'desc', description, id='desc')
    node(svg, 'rect', x=0, y=0, width=320, height=320, fill='#ffffff')
    return svg


def text(svg, value, x, y, anchor='middle', **attrs):
    return node(svg, 'text', value, x=x, y=y, text_anchor=anchor, font_family='Arial, Helvetica, sans-serif', font_size=18, fill=COLORS['ink'], **attrs)


def axes(svg, x_ticks, y_ticks, sx, sy, x_label, y_label):
    for value in x_ticks:
        node(svg, 'line', x1=sx(value), x2=sx(value), y1=20, y2=260, stroke=COLORS['grid'])
        text(svg, value, sx(value), 282)
    for value in y_ticks:
        node(svg, 'line', x1=64, x2=304, y1=sy(value), y2=sy(value), stroke=COLORS['grid'])
        text(svg, value, 56, sy(value) + 6, anchor='end')
    node(svg, 'rect', x=64, y=20, width=240, height=240, fill='none', stroke=COLORS['ink'])
    text(svg, x_label, 184, 310)
    text(svg, y_label, 17, 140, transform='rotate(-90 17 140)')


def path(points):
    return 'M ' + ' L '.join(f'{x:.6f} {y:.6f}' for x, y in points)


def save(svg, filename):
    content = tostring(svg, encoding='unicode')
    (OUT / filename).write_text('\n'.join(line.rstrip() for line in content.splitlines()) + '\n', encoding='utf-8')


svg = root('Twenty gradient-descent updates in coefficient space', 'The path zigzags along correctly oriented contours of the least-squares objective from beta=(-1,3) toward the minimizer (2,-1). The orange endpoint is beta=(0.7165,1.0766), still short of the optimum.')
sx = lambda value: 64 + (value + 2) / 6 * 240
sy = lambda value: 260 - (value + 2) / 6 * 240
axes(svg, [-2, 0, 2, 4], [-2, 0, 2, 4], sx, sy, 'β₁', 'β₂')
defs = node(svg, 'defs')
clip = node(defs, 'clipPath', id='plot-window')
node(clip, 'rect', x=64, y=20, width=240, height=240)
plot = node(svg, 'g', clip_path='url(#plot-window)')
theta = np.linspace(0, 2 * np.pi, 241)
for level in LEVELS:
    circle = np.array([np.cos(theta), np.sin(theta)])
    points = star[:, None] + eigenvectors @ (np.sqrt(2 * level / eigenvalues)[:, None] * circle)
    values = np.array([objective(beta) for beta in points.T])
    assert np.allclose(values, level, atol=1e-12)
    node(plot, 'path', d=path([(sx(a), sy(b)) for a, b in points.T]), fill='none', stroke=COLORS['contour'], stroke_width=1.5, data_level=level)
node(plot, 'path', d=path([(sx(a), sy(b)) for a, b in history]), fill='none', stroke=COLORS['path'], stroke_width=2.5)
for a, b in history:
    node(plot, 'circle', cx=sx(a), cy=sy(b), r=2, fill=COLORS['path'])
node(plot, 'circle', cx=sx(history[0, 0]), cy=sy(history[0, 1]), r=5, fill='white', stroke=COLORS['ink'], stroke_width=2)
node(plot, 'circle', cx=sx(history[-1, 0]), cy=sy(history[-1, 1]), r=5.5, fill=COLORS['current'], stroke='white', stroke_width=1.5)
a, b = sx(star[0]), sy(star[1])
node(plot, 'path', d=f'M {a-5} {b-5} L {a+5} {b+5} M {a-5} {b+5} L {a+5} {b-5}', stroke=COLORS['ink'], stroke_width=2.5)
save(svg, 'gradient-descent-contours.svg')

svg = root('Training objective across twenty updates', 'For learning rate 0.6 the objective decreases from 1 to 0.173906 after twenty updates. A smaller objective does not mean the coefficient vector has reached its minimizer.')
sx = lambda value: 64 + value / 20 * 240
sy = lambda value: 260 - value / 1.05 * 240
axes(svg, [0, 10, 20], [0, .5, 1], sx, sy, 'Update t', 'J(β)')
node(svg, 'path', d=path([(sx(t), sy(value)) for t, value in enumerate(losses)]), fill='none', stroke=COLORS['path'], stroke_width=2.5)
for t, value in enumerate(losses):
    node(svg, 'circle', cx=sx(t), cy=sy(value), r=2, fill=COLORS['path'])
node(svg, 'circle', cx=sx(0), cy=sy(losses[0]), r=5, fill='white', stroke=COLORS['ink'], stroke_width=2)
node(svg, 'circle', cx=sx(20), cy=sy(losses[-1]), r=5.5, fill=COLORS['current'], stroke='white', stroke_width=1.5)
save(svg, 'gradient-descent-objective.svg')
print('Verified gradients, spectral recurrence, all contour vertices and 20-step objective values.')
print('beta_20 =', history[-1], 'J_20 =', losses[-1], 'eigenvalues =', eigenvalues)
for eta in [.2, .6, .8]:
    values = trajectory(eta)
    print('eta', eta, 'J1', objective(values[1]), 'J9', objective(values[9]), 'J20', objective(values[20]))
