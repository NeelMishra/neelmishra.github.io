"""Reproduce the event timeline and Kaplan-Meier curve in the survival article.

Requires Python 3, NumPy, SciPy >= 1.11, and Matplotlib.
Run: python render_survival_figure.py [--preview-dir /tmp/survival-preview]
The data, exact-fraction risk-set calculations, and independent SciPy check are below.
"""
from pathlib import Path
from fractions import Fraction
import argparse
import numpy as np
from scipy import stats
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--preview-dir', type=Path)
args = parser.parse_args()
HERE = Path(__file__).resolve().parent
# (subject, observed month, event indicator, baseline covariate)
DATA = [('A', 2, 1, 0), ('B', 3, 0, 1), ('C', 4, 1, 1),
        ('D', 6, 1, 0), ('E', 7, 0, -1)]
rows = []
survival = Fraction(1)
for time in sorted({row[1] for row in DATA}):
    risk = [row[0] for row in DATA if row[1] >= time]
    events = sum(row[1] == time and row[2] == 1 for row in DATA)
    censored = sum(row[1] == time and row[2] == 0 for row in DATA)
    survival *= Fraction(len(risk) - events, len(risk))
    rows.append((time, risk, events, censored, survival))
    print(f'month={time}, risk={risk}, events={events}, censored={censored}, S={survival}')

reference = stats.ecdf(stats.CensoredData(
    uncensored=[row[1] for row in DATA if row[2]],
    right=[row[1] for row in DATA if not row[2]],
)).sf
np.testing.assert_array_equal(reference.quantiles, [r[0] for r in rows])
np.testing.assert_allclose(reference.probabilities, [float(r[4]) for r in rows], atol=1e-14)
assert rows[2][1] == ['C', 'D', 'E'] and rows[2][4] == Fraction(8, 15)
assert rows[-1][4] == Fraction(4, 15)
# Cox contribution at month 4, beta=log(2), event C.
relative_hazards = [Fraction(2) ** row[3] for row in DATA if row[1] >= 4]
assert Fraction(2) / sum(relative_hazards) == Fraction(4, 7)
print('Independent SciPy KM comparison and Cox risk-set calculation passed.')

INK, MUTED, BLUE, ORANGE = '#182536', '#536475', '#176b93', '#b44a24'
plt.rcParams.update({
    'font.family': ['DejaVu Sans', 'Arial', 'sans-serif'], 'font.size': 15,
    'text.color': INK, 'axes.labelcolor': INK, 'xtick.color': MUTED,
    'ytick.color': MUTED, 'axes.edgecolor': '#b7c3cd',
    'axes.spines.top': False, 'axes.spines.right': False,
    'svg.fonttype': 'none', 'svg.hashsalt': 'survival-timeline-km-v1',
    'figure.facecolor': 'white', 'axes.facecolor': 'white',
})
fig, (timeline, km) = plt.subplots(2, 1, figsize=(6, 9), layout='constrained',
                                 gridspec_kw={'height_ratios': [1, 1.1]})
for index, (name, time, event, _) in enumerate(DATA):
    y = 4-index
    timeline.plot([0, time], [y, y], lw=3, color=BLUE)
    timeline.plot(time, y, marker='o' if event else 'x', color=ORANGE,
                  markersize=10, markeredgewidth=2, linestyle='none')
timeline.axvline(4, ls=':', color=MUTED, alpha=.65)
timeline.set(yticks=range(5), yticklabels=list('EDCBA'), ylim=(-.6, 4.6),
             xlim=(-.15, 7.35), xticks=range(8), xlabel='Months since installation')
timeline.set_title('1. Observed follow-up', loc='left', fontsize=16, fontweight='bold', pad=45)
timeline.legend(handles=[
    Line2D([], [], marker='o', linestyle='none', color=ORANGE, markersize=9, label='Failure'),
    Line2D([], [], marker='x', linestyle='none', color=ORANGE, markersize=9, markeredgewidth=2, label='Censored'),
], loc='lower left', bbox_to_anchor=(0, 1), ncol=2, frameon=False, fontsize=13, borderaxespad=0)
timeline.grid(axis='x', alpha=.15)

times = [0] + [r[0] for r in rows]
values = [1.] + [float(r[4]) for r in rows]
km.step(times, values, where='post', color=BLUE, lw=3)
for time, _, events, censored, surv in rows:
    if events:
        km.plot(time, float(surv), 'o', color=ORANGE, markersize=7)
    if censored:
        km.plot(time, float(surv), 'x', color=ORANGE, markersize=10, markeredgewidth=2)
km.set(xlim=(-.15, 7.35), ylim=(-.02, 1.15), xticks=range(8), yticks=[0,.25,.5,.75,1],
       xlabel='Months since installation', ylabel='Estimated survival S(t)')
km.set_title('2. Kaplan–Meier survival', loc='left', fontsize=16, fontweight='bold', pad=15)
km.grid(axis='y', alpha=.2)
for x,y,label in [(0.45,1.035,'1.000'),(2.5,.835,'0.800'),(4.4,.57,'0.533'),(6.0,.30,'0.267')]:
    km.text(x,y,label,fontsize=13,color=BLUE)
km.annotate('Censoring: no drop', xy=(3,.8), xytext=(3.05,1.03), fontsize=12,
            arrowprops={'arrowstyle':'->','color':ORANGE}, color=ORANGE)
fig.savefig(HERE/'survival-timeline-km.svg', metadata={
    'Title':'Observed timelines and Kaplan-Meier survival',
    'Description':'Five machines with failures at months 2, 4, 6 and censoring at months 3, 7. Survival drops only at failures, reaching 4/15.',
    'Creator':'render_survival_figure.py', 'Date':None,
})
svg = HERE / 'survival-timeline-km.svg'
svg.write_text('\n'.join(line.rstrip() for line in svg.read_text().splitlines()) + '\n')
if args.preview_dir:
    args.preview_dir.mkdir(parents=True, exist_ok=True)
    fig.savefig(args.preview_dir/'survival-timeline-km.png', dpi=150)
plt.close(fig)
