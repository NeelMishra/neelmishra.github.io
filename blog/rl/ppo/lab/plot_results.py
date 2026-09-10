"""Rebuild learning-curve.svg from recorded data; requires matplotlib.
Run: python plot_results.py
"""
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter

folder = Path(__file__).resolve().parent
result = json.loads((folder / 'results.json').read_text())
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 11,
                     'svg.fonttype': 'none', 'svg.hashsalt': 'ppo-linewalk'})
fig, ax = plt.subplots(figsize=(8, 4.3), layout='constrained')
fig.set_facecolor('#fffdf9'); ax.set_facecolor('#fffdf9')
for run, color, marker, linestyle in zip(result['runs'], ['#0a8f6a', '#4b64a0', '#b45a29'], ['o', 's', '^'], ['-', '--', ':']):
    ax.plot([p['transitions'] for p in run['curve']], [p['mean_return'] for p in run['curve']],
            label=f"PPO seed {run['seed']}", color=color, marker=marker, markersize=5,
            markerfacecolor='none', linewidth=1.7, linestyle=linestyle)
ax.axhline(result['random_baseline']['mean_return'], color='#77786c', linestyle='--', linewidth=1.2, label='Uniform random')
ax.set(xlabel='Environment transitions', ylabel='Mean undiscounted return', ylim=(0, 1.05), xlim=(-500, 42000))
ax.xaxis.set_major_formatter(FuncFormatter(lambda x, _: f'{x/1000:g}k'))
ax.grid(axis='y', color='#dedbcf', linewidth=.7)
ax.spines[['top', 'right']].set_visible(False)
ax.spines[['bottom', 'left']].set_color('#b0b6a9')
ax.legend(loc='lower right', frameon=True, facecolor='#fffdf9', fontsize=9)
ax.set_title('LineWalk · three training seeds', loc='left', fontweight='bold', pad=14)
fig.savefig(folder / 'learning-curve.svg', metadata={'Date': None, 'Description': 'Actual PPO LineWalk evaluations from results.json; 512 episodes per checkpoint.'})
svg_path = folder / 'learning-curve.svg'
svg_path.write_text('\n'.join(line.rstrip() for line in svg_path.read_text().splitlines()) + '\n')
