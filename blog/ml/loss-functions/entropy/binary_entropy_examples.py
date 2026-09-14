"""Binary entropy, mixtures, and equal-error multiclass examples.
Run beside entropy_examples.py: python binary_entropy_examples.py
"""
from pathlib import Path
import json
import math
from entropy_examples import entropy


def examples():
    curve=[]
    for count in [0,2,5,10,15,18,20]:
        p=count/20
        curve.append(dict(count=count,p=p,entropy=entropy([p,1-p]),majority_error=min(p,1-p),
                          image=f'assets/binary-entropy-{count}.svg'))
    mixtures=[]
    for w in [0.,.25,.5,.75,1.]:
        p=w*.1+(1-w)*.9
        conditional=w*entropy([.1,.9])+(1-w)*entropy([.9,.1])
        marginal=entropy([p,1-p])
        assert marginal+1e-12>=conditional
        mixtures.append(dict(weight=w,p=p,marginal=marginal,conditional=conditional,gain=max(0.,marginal-conditional)))
    tails=[]
    for i,p in enumerate([[.8,.2,0.,0.],[.8,.1,.1,0.],[.8,.2/3,.2/3,.2/3]]):
        tails.append(dict(key=i,p=p,entropy=entropy(p),majority_error=1-max(p),image=f'assets/entropy-tail-{i}.svg'))
    return dict(curve=curve,mixtures=mixtures,tails=tails)


def plots(data,folder):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import numpy as np
    plt.rcParams.update({'font.size':13,'svg.fonttype':'none','svg.hashsalt':'binary-entropy',
        'axes.spines.top':False,'axes.spines.right':False,'figure.facecolor':'#fffdf8','axes.facecolor':'#fffdf8'})
    x=np.linspace(0,1,601);y=[entropy([float(p),float(1-p)]) for p in x]
    for row in data['curve']:
        fig,ax=plt.subplots(figsize=(5,3.4),layout='constrained')
        ax.plot(x,y,color='#276b4c',linewidth=2.5)
        ax.scatter([row['p']],[row['entropy']],color='#b95127',s=65,zorder=3)
        ax.set(xlim=(-.025,1.025),ylim=(-.03,1.08),xticks=[0,.5,1],yticks=[0,.5,1],
               xlabel='Class-1 probability p',ylabel='Entropy (bits)',title=f"{row['count']} of 20 labels are class 1")
        ax.grid(alpha=.16);fig.savefig(folder/row['image'],metadata={'Date':None});plt.close(fig)
    for row in data['tails']:
        fig,ax=plt.subplots(figsize=(5,3),layout='constrained')
        ax.bar(['A','B','C','D'],row['p'],color=['#276b4c','#276a9b','#276a9b','#276a9b'])
        for i,p in enumerate(row['p']):ax.text(i,p+.025,format(p,'.3g'),ha='center',fontsize=12)
        ax.set(ylim=(0,1),yticks=[0,.5,1],ylabel='Label probability',title='Same 80% majority, different minority')
        ax.grid(axis='y',alpha=.16);fig.savefig(folder/row['image'],metadata={'Date':None});plt.close(fig)


if __name__=='__main__':
    folder=Path(__file__).resolve().parent;data=examples()
    (folder/'assets/binary-entropy.json').write_text(json.dumps(data,indent=2,allow_nan=False)+'\n')
    plots(data,folder)
    print('Exported 7 binary compositions, 5 mixtures, 3 multiclass tails, and 10 SVG plots.')
