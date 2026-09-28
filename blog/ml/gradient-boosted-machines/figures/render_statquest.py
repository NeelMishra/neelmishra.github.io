"""Original diagrams for the four StatQuest companion notes.

Run: python3 render_statquest.py (requires numpy and matplotlib).
Examples follow the linked lectures; classification keeps p=2/3 exactly.
"""
from pathlib import Path
import math
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

OUT = Path(__file__).parent
INK, GREEN, BLUE, ORANGE, MUTED = '#203c35', '#087f67', '#386da8', '#bf572a', '#65746e'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':12,'text.color':INK,
 'axes.labelcolor':INK,'xtick.color':MUTED,'ytick.color':MUTED,
 'axes.spines.top':False,'axes.spines.right':False,'axes.edgecolor':'#bbc9c1',
 'figure.facecolor':'#fffdf8','axes.facecolor':'#fffdf8','svg.fonttype':'none'})

def save(fig, name):
    dest = OUT / (name+'.svg')
    fig.savefig(dest, bbox_inches='tight', pad_inches=.2)
    dest.write_text(dest.read_text().replace("'DejaVu Sans'", "'DejaVu Sans', Arial, sans-serif"))
    plt.close(fig)

def plot():
    fig,ax=plt.subplots(figsize=(8.2,4.4),layout='constrained')
    ax.grid(alpha=.15);ax.set_axisbelow(True)
    return fig,ax

def tree(title, nodes, edges, height=4.8):
    fig,ax=plt.subplots(figsize=(10,height));ax.set(xlim=(0,1),ylim=(0,1));ax.axis('off')
    ax.set_title(title,loc='left',fontweight='bold',pad=20)
    for parent,child,label in edges:
        x,y,_,_=nodes[parent];xx,yy,_,_=nodes[child]
        ax.annotate('',(xx,yy+.07),(x,y-.06),arrowprops={'arrowstyle':'->','color':MUTED,'lw':1.8})
        ax.text((x+xx)/2,(y+yy)/2+.025,label,ha='center',fontsize=11,color=MUTED,
                bbox={'facecolor':'#fffdf8','edgecolor':'none','pad':1})
    for x,y,label,leaf in nodes.values():
        ax.text(x,y,label,ha='center',va='center',fontsize=14,linespacing=1.6,
            color=GREEN if leaf else INK,
            bbox={'boxstyle':'round,pad=.6','facecolor':'#eaf5ee' if leaf else '#edf1f6',
                  'edgecolor':'#bad3c4' if leaf else '#bdcbdc'})
    return fig

# Lecture 1: the vertical distances become the next tree's targets.
fig,ax=plot();y=np.array([88,76,56,73,77,57]);x=np.arange(1,7)
ax.axhline(71.2,color=BLUE,ls='--',label='Initial prediction: 71.2 kg')
ax.vlines(x,71.2,y,color=ORANGE,lw=2)
ax.scatter(x,y,s=65,color=INK,zorder=3,label='Observed weight')
for xx,yy in zip(x,y):
    ax.text(xx,yy+(1.5 if yy>71.2 else -2.8),f'{yy-71.2:+.1f}',ha='center',color=ORANGE,fontweight='bold')
ax.set(xlabel='Training row',ylabel='Weight (kg)',xticks=x,ylim=(49,94))
ax.legend(loc='upper center',ncol=2,fontsize=10)
save(fig,'statquest-1-residuals')
nodes={'r':(.5,.9,'Gender = female?',False),'l':(.25,.61,'Height < 1.6 m?',False),
 'r2':(.75,.61,'Color is not blue?',False),
 'a':(.115,.22,'Rows 3, 6\n−15.2, −14.2\nMean: −14.7',True),
 'b':(.365,.22,'Row 2\n+4.8\nOutput: +4.8',True),
 'c':(.635,.22,'Rows 4, 5\n+1.8, +5.8\nMean: +3.8',True),
 'd':(.885,.22,'Row 1\n+16.8\nOutput: +16.8',True)}
save(tree('First tree: features choose a leaf; the leaf supplies a correction',nodes,
 [('r','l','yes'),('r','r2','no'),('l','a','yes'),('l','b','no'),('r2','c','yes'),('r2','d','no')]),'statquest-1-tree')

# Lecture 2: exact data and squared-error objective.
fig,ax=plot();c=np.linspace(48,98,400);weights=np.array([88,76,56]);loss=((weights[:,None]-c)**2).sum(axis=0)/2
ax.plot(c,loss,color=GREEN,lw=2.5);mean=weights.mean();best=((weights-mean)**2).sum()/2
ax.scatter([mean],[best],s=75,color=ORANGE,zorder=3);ax.axvline(mean,color=MUTED,ls=':',alpha=.6)
ax.annotate('Best constant = mean\n(88 + 76 + 56) / 3 = 73.33…',(mean,best),xytext=(mean+2,best+350),arrowprops={'arrowstyle':'->','color':MUTED},bbox={'facecolor':'#fffdf8','edgecolor':'none','alpha':.9,'pad':2})
ax.set(xlabel='Same prediction c for every row (kg)',ylabel='½ × sum of squared errors')
save(fig,'statquest-2-constant')
nodes={'r':(.5,.84,'Height < 1.55 m?',False),'a':(.24,.3,'Region 1: row 3\nResidual: −17.33\nLeaf output: −17.33',True),
 'b':(.76,.3,'Region 2: rows 1, 2\nResiduals: 14.67, 2.67\nLeaf output: 8.67',True)}
save(tree('One shared correction per region',nodes,[('r','a','yes'),('r','b','no')],3.8),'statquest-2-regions')

# Lecture 3: raw log-odds and probabilities are different scales.
fig,ax=plot();z=np.linspace(-4,4,300);ax.plot(z,1/(1+np.exp(-z)),color=GREEN,lw=2.5)
start=math.log(2);zs=[start-.8*3,start,start+.8*1.5];ps=[1/(1+math.exp(-v)) for v in zs]
for zz,pp,label,offset in zip(zs,ps,['Negative leaf','Initial','Positive leaf'],[(-.5,.17),(-1.5,-.23),(-.2,.08)]):
 ax.scatter(zz,pp,s=65,color=ORANGE,zorder=3);ax.annotate(f'{label}\nF = {zz:.3f}, p = {pp:.3f}',(zz,pp),xytext=(zz+offset[0],pp+offset[1]),fontsize=11,arrowprops={'arrowstyle':'->','color':MUTED},bbox={'facecolor':'#fffdf8','edgecolor':'none','alpha':.9,'pad':2})
ax.axhline(.5,color=MUTED,ls=':',alpha=.5);ax.set(xlabel='Raw score F (log-odds)',ylabel='Probability p = sigmoid(F)',ylim=(-.04,1.07))
save(fig,'statquest-3-sigmoid')
nodes={'r':(.35,.89,'Color = red?',False),'a':(.15,.54,'Row 4: y = 0\nResidual: −2/3\nLeaf output: −3',True),
 'b':(.65,.59,'Age > 37?',False),'c':(.48,.2,'Rows 2, 3: y = 1, 0\nResiduals: 1/3, −2/3\nLeaf output: −0.75',True),
 'd':(.84,.2,'Rows 1, 5, 6: y = 1\nResiduals: 1/3 each\nLeaf output: +1.5',True)}
save(tree('First classification tree: numeric corrections to log-odds',nodes,
 [('r','a','yes'),('r','b','no'),('b','c','yes'),('b','d','no')],5.2),'statquest-3-tree')

# Lecture 4: loss versus score, then a local quadratic for a shared leaf.
fig,ax=plot();z=np.linspace(-4,4,300)
ax.plot(z,np.logaddexp(0,z)-z,color=GREEN,lw=2.5,label='Observed y = 1')
ax.plot(z,np.logaddexp(0,z),color=ORANGE,lw=2.5,label='Observed y = 0')
ax.set(xlabel='Raw score F (log-odds)',ylabel='Binary log loss');ax.legend()
save(fig,'statquest-4-log-loss')
fig,ax=plot();gamma=np.linspace(-2.5,1.2,350);F=math.log(2);p=2/3
actual=2*np.logaddexp(0,F+gamma)-(F+gamma)
q0=2*np.logaddexp(0,F)-F;G=2*p-1;H=2*p*(1-p);quad=q0+G*gamma+.5*H*gamma**2
ax.plot(gamma,actual,color=GREEN,lw=2.5,label='Actual loss: one yes + one no')
ax.plot(gamma,quad,color=BLUE,lw=2,ls='--',label='Quadratic around γ = 0')
ax.scatter([0,-.75],[q0,q0+G*(-.75)+.5*H*.75**2],color=ORANGE,zorder=3,s=60)
ax.annotate('Newton leaf output: −0.75',(-.75,q0+G*(-.75)+.5*H*.75**2),xytext=(-2.3,1.77),arrowprops={'arrowstyle':'->','color':MUTED},bbox={'facecolor':'#fffdf8','edgecolor':'none','alpha':.9,'pad':2})
ax.set(xlabel='Shared log-odds correction γ',ylabel='Total loss in this leaf',ylim=(1.25,2.5));ax.legend(loc='upper left',fontsize=10)
save(fig,'statquest-4-newton')
nodes={'r':(.5,.83,'Likes popcorn?',False),'a':(.23,.3,'Region 1: row 1 (yes)\nSum of residuals: 1/3\nCurvature sum: 2/9\nLeaf output: +1.5',True),
 'b':(.77,.3,'Region 2: rows 2, 3 (yes, no)\nSum of residuals: −1/3\nCurvature sum: 4/9\nLeaf output: −0.75',True)}
save(tree('The two leaf values from Lecture 4',nodes,[('r','a','yes'),('r','b','no')],4.2),'statquest-4-regions')
print('Wrote 9 StatQuest companion figures.')
