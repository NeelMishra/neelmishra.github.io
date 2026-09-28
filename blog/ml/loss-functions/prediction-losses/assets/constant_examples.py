"""Compute and validate the constant-prediction examples, then export SVGs.

Run with Python 3.9+ and matplotlib 3.9.4:
    python -m pip install matplotlib==3.9.4
    python constant_examples.py
The loss and optimum checks use only the standard library.
"""
from pathlib import Path
import json
import math

CASES = {
    'squared-error': dict(title='Half squared error', y=[1, 2, 3, 10], domain=[0, 11], optimum=[4, 4]),
    'absolute-error': dict(title='Absolute error', y=[1, 2, 3, 10], domain=[0, 11], optimum=[2, 3]),
    'binary-log-loss': dict(title='Binary log loss', y=[0, 0, 0, 0, 1], domain=[-5, 3], optimum=[math.log(.25), math.log(.25)]),
    'poisson-loss': dict(title='Poisson negative log likelihood', y=[0, 1, 2, 5], domain=[-2, 2.5], optimum=[math.log(2), math.log(2)]),
    'huber-loss': dict(title='Huber loss (threshold 2)', y=[1, 2, 3, 10, 10], delta=2, domain=[0, 11], optimum=[3.5, 3.5]),
}

def huber(e, delta):
    return .5*e*e if abs(e) <= delta else delta*abs(e)-.5*delta*delta

def total(key, c, y=None, delta=2):
    rows = CASES[key]['y'] if y is None else y
    if key == 'squared-error': return sum(.5*(v-c)**2 for v in rows)
    if key == 'absolute-error': return sum(abs(v-c) for v in rows)
    if key == 'binary-log-loss': return sum(max(c, 0)+math.log1p(math.exp(-abs(c)))-v*c for v in rows)
    if key == 'poisson-loss': return sum(math.exp(c)-v*c+math.lgamma(v+1) for v in rows)
    if key == 'huber-loss': return sum(huber(v-c, delta) for v in rows)
    raise ValueError(key)

def slope(key, c, y=None, delta=2):
    rows = CASES[key]['y'] if y is None else y
    if key == 'squared-error': return sum(c-v for v in rows)
    if key == 'absolute-error': return sum(1 if c>v else -1 if c<v else 0 for v in rows)
    if key == 'binary-log-loss': return len(rows)/(1+math.exp(-c))-sum(rows)
    if key == 'poisson-loss': return len(rows)*math.exp(c)-sum(rows)
    if key == 'huber-loss': return sum(max(-delta, min(c-v, delta)) for v in rows)
    raise ValueError(key)

def huber_constant(y, delta):
    lo, hi = min(y), max(y)
    for _ in range(100):
        c=(lo+hi)/2
        value=slope('huber-loss',c,y,delta)
        if abs(value)<1e-12: return c
        if value<0: lo=c
        else: hi=c
    return (lo+hi)/2

def verify():
    expected = {'squared-error':25., 'absolute-error':10., 'binary-log-loss':-(math.log(.2)+4*math.log(.8)), 'huber-loss':26.25,
                'poisson-loss':8-8*math.log(2)+math.log(2)+math.log(120)}
    for key, d in CASES.items():
        best=sum(d['optimum'])/2
        value=total(key,best)
        assert math.isclose(value,expected[key],abs_tol=1e-10)
        assert abs(slope(key,best))<1e-10
        for j in range(301):
            c=d['domain'][0]+j*(d['domain'][1]-d['domain'][0])/300
            assert total(key,c)>=value-1e-10,(key,c)
            if key=='absolute-error' and min(abs(c-y) for y in d['y'])<1e-4: continue
            h=1e-5
            numeric=(total(key,c+h)-total(key,c-h))/(2*h)
            assert math.isclose(numeric,slope(key,c),rel_tol=1e-6,abs_tol=1e-5),(key,c,numeric)
    assert abs(huber_constant([1,2,3,10,10],2)-3.5)<1e-10
    assert all(total('huber-loss',c,[0,10],1)==9 for c in [1,2,5,8,9])
    assert all(total('absolute-error',c)==10 for c in [2,2.3,2.5,2.8,3])
    assert total('binary-log-loss',-20,[0,0])<total('binary-log-loss',-10,[0,0])
    assert total('binary-log-loss',20,[1,1])<total('binary-log-loss',10,[1,1])
    assert total('poisson-loss',-20,[0,0])<total('poisson-loss',-10,[0,0])
    assert all(math.isclose(sum((r-sum(group)/len(group))**2 for group in groups for r in group),want)
               for groups,want in [([[-3],[-2,2,3]],14),([[-3,-2],[2,3]],1),([[-3,-2,2],[3]],14)])
    print('Verified minima, finite-difference slopes, flat minima, limiting cases, and tree split costs.')

def export():
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'svg.fonttype':'none','svg.hashsalt':'prediction-loss-constants'})
    out=Path(__file__).resolve().parent
    for key,d in CASES.items():
        lo,hi=d['domain'];xs=[lo+(hi-lo)*j/400 for j in range(401)];ys=[total(key,x) for x in xs]
        d['minimum']=total(key,sum(d['optimum'])/2)
        fig,ax=plt.subplots(figsize=(7.2,3.6),layout='constrained')
        fig.patch.set_facecolor('#fffaf2');ax.set_facecolor('#fffaf2')
        ax.plot(xs,ys,color='#0a8f6a',linewidth=2.5,label='Total training loss')
        a,b=d['optimum'];best=(a+b)/2
        if a!=b:
            ax.axvspan(a,b,color='#da7925',alpha=.16)
            ax.plot([a,b],[d['minimum']]*2,color='#da7925',linewidth=4,label='Every c from 2 to 3 minimizes loss')
        else:
            ax.axvline(best,color='#da7925',linestyle='--',linewidth=1.4)
            ax.scatter([best],[d['minimum']],color='#da7925',zorder=4,label=f'Best c = {best:.4g}')
        ax.set(xlim=(lo,hi),ylim=(0,max(ys)*1.08),xlabel='Constant raw score c',ylabel='Total loss J(c)')
        ax.set_title(d['title']+'\nTargets: '+', '.join(map(str,d['y'])),loc='left',fontsize=12)
        ax.spines[['top','right']].set_visible(False);ax.grid(alpha=.15)
        ax.legend(loc='upper center',fontsize=8,frameon=False)
        target=out/(key+'-constant.svg')
        fig.savefig(target,metadata={'Date':None});plt.close(fig)
        target.write_text('\n'.join(line.rstrip() for line in target.read_text().splitlines())+'\n')
    (out/'constant-cases.json').write_text(json.dumps(CASES,indent=2)+'\n')
    (out/'constant-cases.js').write_text('window.PREDICTION_LOSS_CASES = '+json.dumps(CASES,separators=(',',':'))+';\n')

if __name__=='__main__':
    verify()
    export()
