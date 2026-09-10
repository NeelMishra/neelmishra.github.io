"""Regenerate the article's SVG from recorded results, without rerunning training."""
import json
import math
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

HERE = Path(__file__).resolve().parent


def main():
    data = json.loads((HERE / 'results.json').read_text())
    entropies = []
    for rewards in data['true_reward']:
        for left, right in [(0, 1), (0, 2), (1, 2)]:
            p = 1 / (1 + math.exp(-(rewards[left] - rewards[right])))
            entropies.append(-p * math.log(p) - (1 - p) * math.log1p(-p))
    minimum = sum(entropies) / len(entropies)
    plt.rcParams.update({
        'font.family': 'sans-serif', 'font.sans-serif': ['DejaVu Sans', 'Arial', 'Liberation Sans'],
        'font.size': 10,
        'svg.fonttype': 'none', 'svg.hashsalt': 'dpo-finite-response-lab',
        'axes.spines.top': False, 'axes.spines.right': False,
        'axes.labelcolor': '#314438', 'text.color': '#314438',
        'xtick.color': '#53625a', 'ytick.color': '#53625a',
    })
    fig, axes = plt.subplots(1, 2, figsize=(8, 4.7), facecolor='#faf9f3')
    colors = ['#27764a', '#b45a29', '#506bb1']
    for run, color in zip(data['runs'], colors):
        curve = run['curve']
        steps = [point['step'] for point in curve]
        for ax, metric in zip(axes, ['population_loss', 'kl_to_population_optimum']):
            ax.plot(steps, [point[metric] for point in curve], color=color,
                    marker='o', markersize=3, linewidth=1.6, label=f"Seed {run['seed']}")
    axes[0].axhline(minimum, color='#68766b', linewidth=1.2, linestyle='--',
                    label=f'Exact minimum: {minimum:.6f}')
    axes[0].set_title('Predict preferences', loc='left', fontweight='bold', pad=14)
    axes[0].set_ylabel('Population pair loss (nats)')
    axes[0].set_ylim(minimum - .009, .7)
    axes[1].set_title('Recover the policy', loc='left', fontweight='bold', pad=14)
    axes[1].set_ylabel('KL(policy ∥ population optimum), nats')
    axes[1].set_ylim(-.005, .29)
    for ax in axes:
        ax.set_facecolor('#faf9f3')
        ax.set_xlabel('Optimizer steps')
        ax.set_xlim(0, data['steps'])
        ax.set_xticks([0, 100, 200, 300, 400])
        ax.grid(axis='y', color='#d8ded5', linewidth=.6)
        ax.set_axisbelow(True)
    handles, labels = axes[0].get_legend_handles_labels()
    fig.legend(handles, labels, loc='lower center', ncol=2, frameon=False,
               bbox_to_anchor=(.5, .02), fontsize=9)
    fig.suptitle('DPO in a world with a known optimum', x=.08, y=.98,
                 ha='left', fontsize=15, fontweight='bold')
    fig.text(.08, .9, '3 prompts · 3 responses each · 4,500 synthetic judgments per seed · β = 0.7', fontsize=9)
    fig.subplots_adjust(left=.09, right=.97, bottom=.26, top=.78, wspace=.36)
    output = HERE / 'learning-curve.svg'
    fig.savefig(output, metadata={'Date': None, 'Description':
                'Recorded checkpoints every 20 steps; lines connect observations. ' +
                'Synthetic finite-response training, not language-model performance.'})
    plt.close(fig)
    output.write_text('\n'.join(line.rstrip() for line in output.read_text().splitlines()) + '\n')
    print(f'Population minimum: {minimum:.9f}; saved {output.name}')


if __name__ == '__main__':
    main()
