"""Redraw the XGBoost lecture examples. Requires numpy and matplotlib."""
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
 'svg.hashsalt':'xgboost-statquest','figure.facecolor':'#fffdf8','axes.facecolor':'#fffdf8','svg.fonttype':'none'})

def save(fig, name):
    dest = OUT / (name+'.svg')
    fig.savefig(dest, bbox_inches='tight', pad_inches=.2, metadata={'Date': None})
    svg = dest.read_text().replace("'DejaVu Sans'", "'DejaVu Sans', Arial, sans-serif")
    dest.write_text('\n'.join(line.rstrip() for line in svg.splitlines()) + '\n')
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

# Regression: the observed gap becomes the requested correction.
fig,axs=plt.subplots(1,2,figsize=(11,4.5),layout='constrained')
x=np.array([10,20,25,35]);y=np.array([-10,7,8,-7]);r=y-.5
for ax in axs:ax.grid(alpha=.15);ax.set_axisbelow(True);ax.set_xticks(x);ax.set_xlabel('Drug dosage')
axs[0].scatter(x,y,color=INK,s=70,zorder=3,label='Observed')
axs[0].axhline(.5,color=BLUE,ls='--',label='Initial prediction: 0.5')
axs[0].vlines(x,.5,y,color=ORANGE,lw=2)
axs[0].set(ylabel='Drug effectiveness',ylim=(-13,13),title='1. Measure the gaps')
axs[0].legend(fontsize=10,loc='upper left')
axs[1].axhline(0,color=MUTED,lw=1);axs[1].scatter(x,r,color=ORANGE,s=70,zorder=3)
for xx,rr in zip(x,r):axs[1].text(xx,rr+(1 if rr>0 else -2),f'{rr:+g}',ha='center',color=ORANGE,weight='bold')
axs[1].set(ylabel='Requested correction (residual)',ylim=(-14,12),title='2. Group similar correction requests')
save(fig,'regression-corrections')
nodes={'root':(.35,.9,'Dosage < 15?',False),
 'a':(.16,.5,'Dosage < 15\nResidual: −10.5\nOutput: −10.5',True),
 'split':(.68,.58,'Dosage < 30?',False),
 'b':(.48,.14,'15 ≤ dosage < 30\nResiduals: 6.5, 7.5\nOutput: +7',True),
 'c':(.86,.14,'Dosage ≥ 30\nResidual: −7.5\nOutput: −7.5',True)}
save(tree('Regression tree · λ = 0 · outputs are corrections',nodes,[('root','a','yes'),('root','split','no'),('split','b','yes'),('split','c','no')],6.2),'regression-tree')
nodes={'root':(.65,.9,'Dosage < 15?',False),
 'split':(.32,.58,'Dosage < 5?',False),
 'a':(.13,.13,'Dosage < 5\nr = −0.5, H = 0.25\nOutput: −2',True),
 'b':(.52,.13,'5 ≤ dosage < 15\nΣr = 1, H = 0.5\nOutput: +2',True),
 'c':(.85,.5,'Dosage ≥ 15\nr = −0.5, H = 0.25\nOutput: −2',True)}
save(tree('Classification tree · λ = 0 · outputs change log-odds',nodes,[('root','split','yes'),('root','c','no'),('split','a','yes'),('split','b','no')],6.2),'classification-tree')
fig,ax=plot();z=np.linspace(-3.5,3.5,400);ax.plot(z,1/(1+np.exp(-z)),color=GREEN,lw=2.5)
for zz,label,xy in [(-.6,'Negative leaf',(-3,.38)),(0,'Initial',(0.4,.18)),(.6,'Positive leaf',(1,.79))]:
 p=1/(1+np.exp(-zz));ax.scatter(zz,p,color=ORANGE,s=65,zorder=3)
 ax.annotate(f'{label}\nF = {zz:g}, p = {p:.3f}',(zz,p),xytext=xy,fontsize=11,arrowprops={'arrowstyle':'->','color':MUTED},bbox={'facecolor':'#fffdf8','edgecolor':'none','pad':2})
ax.set(xlabel='Score F (log-odds)',ylabel='Probability p',ylim=(0,1))
save(fig,'classification-sigmoid')
fig,ax=plot();w=np.linspace(-1,2.5,500)
for lam,col in [(0,GREEN),(4,BLUE),(40,ORANGE)]:
 loss=104.375-3.5*w+.5*(3+lam)*w*w
 best=3.5/(3+lam);v=104.375-3.5*best+.5*(3+lam)*best*best
 ax.plot(w,loss,color=col,lw=2,label=f'λ = {lam}; best w = {best:.3f}');ax.scatter(best,v,s=55,color=col,zorder=3)
ax.set(ylim=(101,116),xlabel='Shared leaf correction w',ylabel='Loss + regularization');ax.legend(fontsize=10)
save(fig,'leaf-objective')
nodes={'root':(.5,.86,'[−3, −3, +3, +3]\nΣr = 0, H = 4\nScore = 0',False),
 'a':(.22,.3,'[−3, −3]\nOutput = −3\nScore = 36 / 2 = 18',True),
 'b':(.78,.3,'[+3, +3]\nOutput = +3\nScore = 36 / 2 = 18',True)}
fig=tree('Separate opposite requests · gain = 18 + 18 − 0 = 36',nodes,[('root','a','left'),('root','b','right')],4.7)
save(fig,'score-gain')
# Illustrative candidate positions, not extra lecture observations.
fig,axs=plt.subplots(2,1,figsize=(9,3.7),layout='constrained')
xx=np.array([1,2,3,4,6,9,10,11,12,15,16,20]);exact=(xx[:-1]+xx[1:])/2
for ax,cuts,title in zip(axs,[exact,[3.5,9.5,13.5]],['Exact: 11 candidate boundaries','Approximate: 3 proposed boundaries']):
 ax.scatter(xx,np.zeros_like(xx),color=INK,s=40,zorder=3)
 for cut in cuts:ax.axvline(cut,color=ORANGE,lw=1.5,ls='--')
 ax.set(xlim=(0,21),ylim=(-.5,.5),yticks=[],title=title,xticks=xx);ax.spines['left'].set_visible(False)
axs[1].set_xlabel('One ordered feature')
save(fig,'candidate-cuts')
fig,ax=plt.subplots(figsize=(10,3.3));ax.axis('off');ax.set(xlim=(0,7),ylim=(0,2.7))
for left,right,total in [(.55,2.45,.18),(2.55,4.45,.18),(4.55,5.45,.24),(5.55,6.45,.24)]:
 ax.add_patch(FancyBboxPatch((left,.35),right-left,1.6,boxstyle='round,pad=.02',facecolor='#eaf5ee',edgecolor='#bad3c4'))
 ax.text((left+right)/2,2.12,f'Bin weight\n{total:.2f}',ha='center',fontsize=12,color=GREEN)
for i,(p,h) in enumerate(zip([.1,.1,.9,.9,.6,.4],[.09,.09,.09,.09,.24,.24]),1):
 ax.text(i,1.6,f'Row {i}',ha='center',weight='bold')
 ax.text(i,1.05,f'p = {p}',ha='center',fontsize=11);ax.text(i,.6,f'h = {h}',ha='center',fontsize=11)
ax.set_title('Similar curvature totals · different numbers of rows',loc='left',fontweight='bold')
save(fig,'weighted-quantiles')
nodes={'root':(.5,.87,'Dosage < 15.5?\nMissing → left',False),
 'a':(.24,.27,'Known: −5.5, −7.5\nMissing: −3.5, −2.5\nOutput: −19 / 4 = −4.75',True),
 'b':(.78,.27,'Known: +6.5, +7.5\nOutput: +14 / 2 = +7',True)}
save(tree('Choose the threshold AND the missing-value direction',nodes,[('root','a','yes / missing'),('root','b','no')],4.5),'missing-direction')
# Independent arithmetic checks for numbers reproduced in the notes.
score=lambda vals,lam=0:sum(vals)**2/(len(vals)+lam)
gains=[score(r[:k])+score(r[k:])-score(r) for k in range(1,4)]
assert np.allclose(gains,[120.3333333333,4,56.3333333333])
assert np.isclose(score(r[:1],1)+score(r[1:],1)-score(r,1),62.4875)
known=np.array([-5.5,-7.5,6.5,7.5]);missing=np.array([-3.5,-2.5])
vals=[]
for k in range(1,4):
 vals.append([score(np.r_[known[:k],missing])+score(known[k:])-score(np.r_[known,missing]),
              score(known[:k])+score(np.r_[known[k:],missing])-score(np.r_[known,missing])])
assert np.allclose(vals,[[54,26.1333333333],[184.0833333333,96.3333333333],[83.3333333333,10.6666666667]])
print('Generated nine figures; regression and missing-direction arithmetic checked.')
# Reproducible Python figures use the recorded executable experiment.
import json
result=json.loads((OUT.parent/'code/results.json').read_text())
fig,ax=plt.subplots(figsize=(10,3.3));ax.axis('off');ax.set(xlim=(0,1),ylim=(0,1))
ax.text(.5,.95,'7,043 customer rows',ha='center',weight='bold',fontsize=16)
for x,color,title,detail in [(.17,GREEN,'Train · 4,225','Fit encoders + trees\n3-fold CV stays here'),
                            (.5,BLUE,'Validate · 1,409','Choose the stopping round'),
                            (.83,ORANGE,'Test · 1,409','Evaluate after choices\nare fixed')]:
 ax.annotate('',(x,.72),(.5,.87),arrowprops={'arrowstyle':'->','color':MUTED})
 ax.text(x,.6,title,ha='center',color=color,weight='bold',fontsize=14,
         bbox={'boxstyle':'round,pad=.6','facecolor':'#fffdf8','edgecolor':color})
 ax.text(x,.28,detail,ha='center',fontsize=12,linespacing=1.6)
save(fig,'data-split')
fig,ax=plot();auc=result['validation_auc'];rounds=np.arange(1,len(auc)+1);best=result['tuned']['trees_used']
ax.plot(rounds,auc,lw=2,color=GREEN);ax.axvline(best,color=ORANGE,ls='--')
ax.scatter(best,auc[best-1],color=ORANGE,s=65,zorder=3)
ax.annotate(f'Best: {best} trees\nAUC = {auc[best-1]:.4f}',(best,auc[best-1]),xytext=(best-47,auc[best-1]-.017),
            arrowprops={'arrowstyle':'->','color':MUTED},fontsize=11,
            bbox={'facecolor':'#fffdf8','edgecolor':'none','pad':2})
ax.set(xlabel='Number of trees trained',ylabel='Validation AUC',title=f'Training stops at {len(auc)} trees; predictions use {best}')
save(fig,'validation-auc')
fig,ax=plt.subplots(figsize=(7,5.2),layout='constrained');cm=np.array(result['tuned']['confusion_matrix'])
ax.imshow(cm,cmap='Greens',vmin=0,vmax=1100)
names=[['Correct non-churn','False alarm'],['Missed churn','Detected churn']]
for i in range(2):
 for j in range(2):
  ax.text(j,i,f'{cm[i,j]}\n{names[i][j]}',ha='center',va='center',color='white' if cm[i,j]>650 else INK,fontsize=14,linespacing=1.8)
ax.set(xticks=[0,1],xticklabels=['No churn','Churn'],yticks=[0,1],yticklabels=['No churn','Churn'],xlabel='Predicted label',ylabel='Actual label')
save(fig,'test-confusion')
nodes={};edges=[]
def visit(node,x,y,spread,depth):
 key=node['nodeid']
 if 'leaf' in node:
  label=f"Score contribution\n{node['leaf']:+.4f}\nCover: {node['cover']:.1f}"
  nodes[key]=(x,y,label,True);return
 feature=result['feature_names'][int(node['split'][1:])]
 # One-hot names can be long; put the category on its own line.
 label=feature.replace('_','\n',1)
 label+=f" < {node['split_condition']:.3g}?\nGain: {node['gain']:.1f} · Cover: {node['cover']:.1f}"
 nodes[key]=(x,y,label,False)
 children={c['nodeid']:c for c in node['children']}
 for side,dx in [('yes',-spread),('no',spread)]:
  child=children[node[side]];edge=side
  if node['missing']==child['nodeid']:edge+=' / missing'
  edges.append((key,child['nodeid'],edge))
  visit(child,x+dx,y-.36,spread/2,depth+1)
visit(result['teaching_tree'],.5,.92,.255,0)
fig=tree('A separate fitted teaching model · one tree · depth 2',nodes,edges,7)
# Dense diagnostic labels need slightly smaller text than the lecture trees.
for txt in fig.axes[0].texts:
 if '\n' in txt.get_text():txt.set_fontsize(11)
save(fig,'python-tree')
print('Generated four Python figures from the measured run (13 figures total).')
