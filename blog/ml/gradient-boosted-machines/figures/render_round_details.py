"""Extra worked-round figures for the StatQuest GBM and XGBoost notes.

Run with numpy and matplotlib installed. Outputs two SVGs here and one in
../../xgboost/figures. Numeric checks cover the examples illustrated.
"""
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

OUT = Path(__file__).parent
XGB_OUT = OUT.parent.parent / 'xgboost' / 'figures'
INK, GREEN, BLUE, ORANGE, MUTED = '#203c35', '#087f67', '#386da8', '#bf572a', '#65746e'
plt.rcParams.update({
    'font.family': 'DejaVu Sans', 'font.size': 12, 'text.color': INK,
    'axes.labelcolor': INK, 'xtick.color': MUTED, 'ytick.color': MUTED,
    'axes.spines.top': False, 'axes.spines.right': False,
    'axes.edgecolor': '#bbc9c1', 'figure.facecolor': '#fffdf8',
    'axes.facecolor': '#fffdf8', 'svg.fonttype': 'none',
    'svg.hashsalt': 'statquest-boosting-details',
})

def save(fig, name, folder=OUT):
    path = folder / (name + '.svg')
    fig.savefig(path, bbox_inches='tight', pad_inches=.2, metadata={'Date': None})
    svg = path.read_text().replace("'DejaVu Sans'", "'DejaVu Sans', Arial, sans-serif")
    path.write_text('\n'.join(line.rstrip() for line in svg.splitlines()) + '\n')
    plt.close(fig)

y = np.array([88,76,56,73,77,57])
residual = y - 71.2
leaf = np.array([16.8,4.8,-14.7,3.8,3.8,-14.7])
prediction = 71.2 + .1 * leaf
np.testing.assert_allclose(prediction, [72.88,71.68,69.73,71.58,71.58,69.73])
fig,ax = plt.subplots(figsize=(9.4,4.7),layout='constrained')
x = np.arange(1,7)
ax.bar(x-.25, residual, width=.24, color=BLUE, label='Requested: residual')
ax.bar(x, leaf, width=.24, color=ORANGE, label='Fitted: leaf output')
ax.bar(x+.25, .1*leaf, width=.24, color=GREEN, label='Added: 0.1 × output')
ax.axhline(0,color=MUTED,lw=1)
ax.set(xticks=x,xlabel='Training row',ylabel='Correction (kg)',ylim=(-19,24))
ax.legend(loc='upper center',ncol=3,fontsize=10,frameon=False)
ax.grid(axis='y',alpha=.15);ax.set_axisbelow(True)
save(fig,'statquest-1-request-fit-add')

rounds=np.arange(31);initial=220/3
shared=82+(initial-82)*.9**rounds
single=56+(initial-56)*.9**rounds
np.testing.assert_allclose(shared[:3],[initial,74.2,74.98])
np.testing.assert_allclose(single[:3],[initial,71.6,70.04])
fig,ax=plt.subplots(figsize=(9,4.8),layout='constrained')
ax.plot(rounds,shared,color=GREEN,lw=2.5,label='Rows 1 and 2: shared prediction')
ax.plot(rounds,single,color=BLUE,lw=2.5,label='Row 3: separate prediction')
for target,label in [(88,'Row 1 target: 88'),(76,'Row 2 target: 76'),(56,'Row 3 target: 56')]:
    ax.hlines(target,0,30,color=MUTED,ls=':',lw=1)
    ax.text(30.6,target,label,va='center',fontsize=10,color=MUTED)
ax.hlines(82,0,30,color=GREEN,ls='--',lw=1)
ax.text(30.6,82,'Shared limit: 82',va='center',fontsize=10,color=GREEN)
ax.set(xlim=(0,43),ylim=(53,94),xticks=[0,5,10,20,30],
       xlabel='Number of correction trees with the same height split',
       ylabel='Predicted weight (kg)')
ax.legend(loc='upper left',fontsize=10,frameon=False)
save(fig,'statquest-2-fixed-regions')

# XGBoost: check the two exact-greedy rounds from the regression note.
y=np.array([-10,7,8,-7],dtype=float);pred=np.full(4,.5)
expected=[[-2.65,2.6,2.6,-1.75],[-4.855,4.07,4.07,-3.325]]
for goal in expected:
    r=y-pred
    def S(v):return v.sum()**2/len(v)
    gains=[S(r[:k])+S(r[k:])-S(r) for k in (1,2,3)]
    assert np.argmax(gains)==0
    right=r[1:];g=[S(right[:k])+S(right[k:])-S(right) for k in (1,2)]
    assert np.argmax(g)==1
    output=np.array([r[0],r[1:3].mean(),r[1:3].mean(),r[3]])
    pred+=.3*output
    np.testing.assert_allclose(pred,goal)
fig,axs=plt.subplots(2,1,figsize=(9,7.6),layout='constrained')
xx=[0,15,30,40];w1=np.array([-10.5,7,-7.5,-7.5]);w2=np.array([-7.35,4.9,-5.25,-5.25])
axs[0].step(xx,w1,where='post',color=BLUE,lw=2,label='Tree 1 output')
axs[0].step(xx,w2,where='post',color=ORANGE,lw=2,label='Tree 2 output')
axs[0].set(ylabel='Unscaled correction',title='What each tree outputs',ylim=(-13,12))
axs[1].axhline(.5,color=MUTED,ls=':',label='Initial prediction')
axs[1].step(xx,.5+.3*w1,where='post',color=BLUE,lw=2,label='After tree 1')
axs[1].step(xx,.5+.3*(w1+w2),where='post',color=GREEN,lw=2,label='After tree 2')
axs[1].scatter([10,20,25,35],y,color=INK,s=45,zorder=4,label='Observed target')
axs[1].set(ylabel='Predicted effectiveness',title='What the ensemble predicts',ylim=(-13,12))
for ax in axs:
    ax.set(xlabel='Drug dosage',xticks=[0,10,15,20,25,30,35,40])
    ax.legend(fontsize=10,loc='upper center',ncol=2,frameon=False)
    ax.grid(alpha=.12);ax.set_axisbelow(True)
axs[1].legend(fontsize=10,loc='upper left',ncol=1,frameon=False)
save(fig,'regression-two-rounds',XGB_OUT)
print('Three figures generated; worked-round arithmetic checked.')
