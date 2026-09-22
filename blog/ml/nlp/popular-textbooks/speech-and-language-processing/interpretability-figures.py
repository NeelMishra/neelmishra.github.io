"""Render the original, synthetic word-sense plot. Requires Matplotlib."""
from pathlib import Path
import re
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

OUT = Path(__file__).resolve().parent
plt.rcParams.update({'font.family': 'DejaVu Sans', 'svg.fonttype': 'none',
                     'svg.hashsalt': 'slp3-interpretability', 'font.size': 11,
                     'figure.facecolor': '#fffdf9', 'axes.facecolor': '#fffdf9',
                     'text.color': '#13201a', 'axes.labelcolor': '#4a5a53',
                     'xtick.color': '#4a5a53', 'ytick.color': '#4a5a53'})
fig, ax = plt.subplots(figsize=(10, 7))
fig.subplots_adjust(left=.095, right=.67, bottom=.15, top=.78)
ax.set_aspect('equal', adjustable='box')
ax.set_xlim(-2, 5); ax.set_ylim(-2, 4)
ax.set_xticks(range(-2, 6)); ax.set_yticks(range(-2, 5))
ax.set_axisbelow(True); ax.grid(color='#e2e6dd', linewidth=.8)
for spine in ax.spines.values(): spine.set_visible(False)
ax.axhline(0, color='#9ba99f', linewidth=1)
ax.axvline(0, color='#9ba99f', linewidth=1)
ax.set_xlabel('Coordinate 1'); ax.set_ylabel('Coordinate 2')
green, blue = '#087354', '#496d9c'
ax.scatter([3, 3], [1, -1], color=green, s=95, zorder=4)
ax.scatter([1, -1], [3, 3], color=blue, s=95, zorder=4)
ax.scatter([3], [0], color=green, marker='D', s=130, edgecolor='white', linewidth=1, zorder=6)
ax.scatter([0], [3], color=blue, marker='D', s=130, edgecolor='white', linewidth=1, zorder=6)
ax.scatter([4], [1], color='#ad5728', marker='*', s=220, zorder=6)
ax.plot([3, 3], [-1, 1], '--', color=green, alpha=.6, zorder=2)
ax.plot([-1, 1], [3, 3], '--', color=blue, alpha=.6, zorder=2)
for target,color in [((3,0),green),((0,3),blue),((4,1),'#ad5728')]:
 ax.annotate('', xy=target, xytext=(0,0), arrowprops={'arrowstyle':'->','color':color,'lw':1.8}, zorder=3)
ax.annotate('query (4, 1)', xy=(4,1), xytext=(3.1,1.72), color='#ad5728', fontsize=10,
            arrowprops={'arrowstyle':'-','color':'#ad5728'})
ax.text(3.16, -.30, '(3, 0)', color=green, fontsize=10)
ax.text(.15, 3.30, '(0, 3)', color=blue, fontsize=10)
fig.text(.06,.94,'Classify the occurrence, not the spelling',fontsize=20,weight='bold')
fig.text(.06,.886,'Two senses of “crane” in an invented two-dimensional representation',fontsize=12,color='#4a5a53')
fig.text(.72,.73,'EQUIPMENT',color=green,fontsize=12,weight='bold')
fig.text(.72,.685,'References: (3, 1), (3, −1)',fontsize=10)
fig.text(.72,.645,'Centroid: (3, 0)',fontsize=11)
fig.text(.72,.595,'Query cosine: 0.9701',fontsize=11,weight='bold',color=green)
fig.text(.72,.49,'BIRD',color=blue,fontsize=12,weight='bold')
fig.text(.72,.445,'References: (1, 3), (−1, 3)',fontsize=10)
fig.text(.72,.405,'Centroid: (0, 3)',fontsize=11)
fig.text(.72,.355,'Query cosine: 0.2425',fontsize=11,weight='bold',color=blue)
fig.text(.72,.235,'Circles: reference occurrences\nDiamonds: sense centroids\nStar: held-out query',fontsize=10,linespacing=1.7)
fig.text(.06,.045,'All values are synthetic. The plot uses actual coordinates, without a projection.',fontsize=11,color='#4a5a53')
path = OUT / 'interpretability-sense-centroids.svg'
fig.savefig(path,metadata={'Date':None,'Title':'Synthetic sense centroids for crane'})
plt.close(fig)
svg=path.read_text().replace("font-family: 'DejaVu Sans'",'font-family: Arial, sans-serif')
svg=re.sub(r'(<svg\b[^>]*)(>)',r'\1 role="img" aria-labelledby="sense-title sense-desc"\2',svg,count=1,flags=re.S)
svg=re.sub(r'(<svg\b[^>]*>)',r'\1\n<title id="sense-title">Synthetic word-sense centroids</title>\n<desc id="sense-desc">Reference occurrences form equipment centroid 3,0 and bird centroid 0,3. Query 4,1 has respective cosines 0.9701 and 0.2425.</desc>',svg,count=1,flags=re.S)
path.write_text('\n'.join(line.rstrip() for line in svg.splitlines())+'\n')
