"""Generate the Mountain Car learning-curve figure for Course 3, Week 4.

Runs episodic semi-gradient Sarsa with tile-coded, action-stacked features on
the classic Mountain Car task (Sutton & Barto, Example 10.1) and writes an SVG
of steps-per-episode on a log scale for three step sizes.

Usage:  python3 gen_mountain_car.py [--runs N] [--episodes N]

Pure standard library so it runs anywhere; no numpy/matplotlib needed.
"""

import argparse
import math
import os
import random

P_MIN, P_MAX = -1.2, 0.6
V_MIN, V_MAX = -0.07, 0.07
GOAL = 0.5
ACTIONS = (-1, 0, 1)

NUM_TILINGS = 8
TILES_PER_DIM = 8
TILES_PER_TILING = (TILES_PER_DIM + 1) ** 2
FEATURES_PER_ACTION = NUM_TILINGS * TILES_PER_TILING
NUM_WEIGHTS = FEATURES_PER_ACTION * len(ACTIONS)

P_WIDTH = (P_MAX - P_MIN) / TILES_PER_DIM
V_WIDTH = (V_MAX - V_MIN) / TILES_PER_DIM

MAX_STEPS = 5000


def active_tiles(position, velocity, action_index):
    """Indices of the NUM_TILINGS active features for one state-action pair.

    Tilings use the standard asymmetric offsets (1, 3) / NUM_TILINGS so that
    the grids are displaced differently along each input dimension.
    """
    base = action_index * FEATURES_PER_ACTION
    indices = []
    for tiling in range(NUM_TILINGS):
        p_off = tiling * 1.0 / NUM_TILINGS * P_WIDTH
        v_off = tiling * 3.0 / NUM_TILINGS * V_WIDTH
        i = int((position - P_MIN + p_off) / P_WIDTH)
        j = int((velocity - V_MIN + v_off) / V_WIDTH)
        i = min(max(i, 0), TILES_PER_DIM)
        j = min(max(j, 0), TILES_PER_DIM)
        indices.append(base + tiling * TILES_PER_TILING + i * (TILES_PER_DIM + 1) + j)
    return indices


def q_value(weights, position, velocity, action_index):
    return sum(weights[i] for i in active_tiles(position, velocity, action_index))


def step(position, velocity, action):
    velocity += 0.001 * action - 0.0025 * math.cos(3 * position)
    velocity = max(V_MIN, min(V_MAX, velocity))
    position += velocity
    if position < P_MIN:
        position, velocity = P_MIN, 0.0
    return position, velocity


def greedy_action(weights, position, velocity, rng):
    best_value, best = None, []
    for a in range(len(ACTIONS)):
        value = q_value(weights, position, velocity, a)
        if best_value is None or value > best_value + 1e-12:
            best_value, best = value, [a]
        elif abs(value - best_value) <= 1e-12:
            best.append(a)
    return rng.choice(best)


def run_once(alpha, episodes, seed):
    """One independent run. Returns the step count of every episode."""
    rng = random.Random(seed)
    weights = [0.0] * NUM_WEIGHTS  # zero init is optimistic: every return is negative
    counts = []
    for _ in range(episodes):
        position = rng.uniform(-0.6, -0.4)
        velocity = 0.0
        action = greedy_action(weights, position, velocity, rng)
        steps = 0
        while steps < MAX_STEPS:
            active = active_tiles(position, velocity, action)
            estimate = sum(weights[i] for i in active)
            next_position, next_velocity = step(position, velocity, ACTIONS[action])
            steps += 1
            if next_position >= GOAL:
                delta = -1.0 - estimate  # terminal: no bootstrap, gamma = 1
                for i in active:
                    weights[i] += alpha * delta
                break
            next_action = greedy_action(weights, next_position, next_velocity, rng)
            delta = -1.0 + q_value(weights, next_position, next_velocity, next_action) - estimate
            for i in active:
                weights[i] += alpha * delta
            position, velocity, action = next_position, next_velocity, next_action
        counts.append(steps)
    return counts


def average_runs(alpha, episodes, runs):
    totals = [0.0] * episodes
    for run in range(runs):
        counts = run_once(alpha, episodes, seed=1000 * run + int(alpha * 1e6))
        for i, value in enumerate(counts):
            totals[i] += value
    return [total / runs for total in totals]


def smooth(series, window):
    out = []
    for i in range(len(series)):
        lo = max(0, i - window + 1)
        chunk = series[lo:i + 1]
        out.append(sum(chunk) / len(chunk))
    return out


SERIES = [
    ("0.1/8", 0.1 / NUM_TILINGS, "#3a7bd5"),
    ("0.2/8", 0.2 / NUM_TILINGS, "#0a8f6a"),
    ("0.5/8", 0.5 / NUM_TILINGS, "#b83a3a"),
]

WIDTH, HEIGHT = 640, 330
LEFT, RIGHT, TOP, BOTTOM = 78, 610, 30, 268
Y_MIN, Y_MAX = 100.0, 1000.0


def to_x(episode, episodes):
    return LEFT + (RIGHT - LEFT) * episode / max(1, episodes - 1)


def to_y(value):
    value = max(Y_MIN, min(Y_MAX, value))
    span = math.log10(Y_MAX) - math.log10(Y_MIN)
    return BOTTOM - (BOTTOM - TOP) * (math.log10(value) - math.log10(Y_MIN)) / span


def build_svg(curves, episodes, runs):
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" role="img" '
        'aria-label="Steps per episode on Mountain Car for three step sizes, log scale.">' % (WIDTH, HEIGHT),
        '<rect width="%d" height="%d" fill="none"/>' % (WIDTH, HEIGHT),
    ]
    for tick in (100, 200, 400, 1000):
        y = to_y(tick)
        parts.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="#e4e9e7" stroke-width="1"/>'
                     % (LEFT, y, RIGHT, y))
        parts.append('<text x="%d" y="%.1f" text-anchor="end" font-family="Manrope, sans-serif" '
                     'font-size="11" fill="#6b7a72">%d</text>' % (LEFT - 8, y + 4, tick))
    parts.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#9eaaa4" stroke-width="1.2"/>'
                 % (LEFT, BOTTOM, RIGHT, BOTTOM))
    for tick in (0, episodes // 2, episodes):
        x = to_x(min(tick, episodes - 1), episodes)
        parts.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="#9eaaa4" stroke-width="1"/>'
                     % (x, BOTTOM, x, BOTTOM + 5))
        parts.append('<text x="%.1f" y="%d" text-anchor="middle" font-family="Manrope, sans-serif" '
                     'font-size="11" fill="#6b7a72">%d</text>' % (x, BOTTOM + 20, tick))
    parts.append('<text x="%d" y="%d" text-anchor="middle" font-family="Manrope, sans-serif" '
                 'font-size="12" fill="#2d3a34">Episode</text>' % ((LEFT + RIGHT) // 2, BOTTOM + 42))
    parts.append('<text transform="translate(20 %d) rotate(-90)" text-anchor="middle" '
                 'font-family="Manrope, sans-serif" font-size="12" fill="#2d3a34">'
                 'Steps per episode (log scale)</text>' % ((TOP + BOTTOM) // 2))
    parts.append('<text x="%d" y="%d" font-family="Syne, sans-serif" font-size="13" '
                 'font-weight="800" fill="#2d3a34">Mountain Car, averaged over %d runs</text>'
                 % (LEFT, TOP - 8, runs))

    for (name, _alpha, color), series in zip(SERIES, curves):
        points = ' '.join('%.1f,%.1f' % (to_x(i, episodes), to_y(v)) for i, v in enumerate(series))
        parts.append('<polyline points="%s" fill="none" stroke="%s" stroke-width="1.6" '
                     'stroke-linejoin="round"/>' % (points, color))

    legend_x = 340
    for name, _alpha, color in SERIES:
        parts.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2.4" '
                     'stroke-linecap="round"/>' % (legend_x, TOP + 22, legend_x + 20, TOP + 22, color))
        parts.append('<text x="%d" y="%d" font-family="Manrope, sans-serif" font-size="11.5" '
                     'font-weight="700" fill="%s">alpha = %s</text>' % (legend_x + 26, TOP + 26, color, name))
        legend_x += 92
    parts.append('</svg>')
    return '\n'.join(parts)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--runs', type=int, default=20)
    parser.add_argument('--episodes', type=int, default=500)
    args = parser.parse_args()

    curves = []
    for name, alpha, _color in SERIES:
        series = average_runs(alpha, args.episodes, args.runs)
        curves.append(smooth(series, 10))
        print('alpha=%s  first=%.0f  last=%.0f' % (name, series[0], series[-1]))

    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mountain-car-learning-curves.svg')
    with open(out, 'w') as handle:
        handle.write(build_svg(curves, args.episodes, args.runs))
    print('wrote', out)


if __name__ == '__main__':
    main()
