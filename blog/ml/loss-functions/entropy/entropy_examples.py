"""Entropy foundations: explicit distributions, codewords, and reproducible figures.
Run: python entropy_examples.py
All logarithms here use base 2 unless a base is explicitly supplied.
"""
from pathlib import Path
import json
import math
import html


def entropy(probabilities, base=2):
    if any(p < 0 or not math.isfinite(p) for p in probabilities):
        raise ValueError('Probabilities must be finite and nonnegative.')
    if not math.isclose(sum(probabilities), 1., abs_tol=1e-12):
        raise ValueError('Probabilities must sum to one; inputs are not normalized silently.')
    return sum(-p*math.log(p, base) for p in probabilities if p > 0)


def cross_entropy(p, q, base=2):
    entropy(p, base);entropy(q, base)
    if len(p) != len(q):
        raise ValueError('Distributions must have the same support labels.')
    if any(a > 0 and b == 0 for a, b in zip(p, q)):
        return math.inf
    return sum(-a*math.log(b, base) for a, b in zip(p, q) if a > 0)


def foundations():
    distributions=[]
    for key, p in [('skewed', [.5,.25,.125,.125]), ('uniform', [.25]*4), ('certain', [1.,0.,0.,0.])]:
        surprise=[-math.log2(v) if v else None for v in p]
        terms=[v*s if v else 0. for v,s in zip(p,surprise)]
        distributions.append(dict(key=key,p=p,surprise=surprise,terms=terms,entropy=entropy(p)))
    sequence=list('AAAABBCD');codes=[]
    for key, words in [('fixed', ['00','01','10','11']), ('prefix', ['0','10','110','111'])]:
        assert all(not b.startswith(a) for i,a in enumerate(words) for j,b in enumerate(words) if i!=j)
        lengths=list(map(len,words));lookup=dict(zip('ABCD',words));encoded=[lookup[s] for s in sequence]
        total=sum(map(len,encoded));average=sum(p*l for p,l in zip(distributions[0]['p'],lengths))
        assert math.isclose(total/len(sequence),average)
        codes.append(dict(key=key,words=words,lengths=lengths,encoded=encoded,total=total,
                          average=average,image='assets/entropy-code-'+key+'.svg'))
    return dict(events=[dict(p=p,surprise=-math.log2(p) if p < 1 else 0.,image='assets/entropy-surprise-'+str(i)+'.svg')
                        for i,p in enumerate([1.,.5,.25,.125,.01])],
                distributions=distributions,sequence=sequence,codes=codes)


def code_diagram(words, destination):
    # Build a real prefix trie. Edges are transmitted bits; leaves are decoded symbols.
    labels=dict(zip(words,'ABCD'));prefixes={''}
    for word in words:
        prefixes.update(word[:i] for i in range(1,len(word)+1))
    positions={};slot=0;w=520;level=105
    def place(prefix):
        nonlocal slot
        children=[prefix+b for b in '01' if prefix+b in prefixes]
        if not children:
            x=65+slot*130;slot+=1
        else:
            x=sum(place(c) for c in children)/len(children)
        positions[prefix]=(x,40+len(prefix)*level)
        return x
    place('');height=85+max(map(len,words))*level
    out=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {height}" role="img" aria-labelledby="title"><title id="title">Binary prefix-code tree: edges give bits and leaves identify symbols</title><g font-family="system-ui,sans-serif" fill="#234c40">']
    for prefix in sorted(prefixes,key=len):
        if not prefix:continue
        x,y=positions[prefix];px,py=positions[prefix[:-1]]
        out.append(f'<line x1="{px}" y1="{py+16}" x2="{x}" y2="{y-22}" stroke="#708e7c" stroke-width="2"/><text x="{(px+x)/2+8}" y="{(py+y)/2}" font-size="22">{prefix[-1]}</text>')
    for prefix,(x,y) in positions.items():
        label=labels.get(prefix,'read bit' if not prefix else 'continue')
        out.append(f'<rect x="{x-52}" y="{y-22}" width="104" height="44" rx="8" fill="{ "#e4efdf" if prefix in labels else "#fffdf8"}" stroke="#8fa68e"/><text x="{x}" y="{y+7}" text-anchor="middle" font-size="{22 if prefix in labels else 17}">{html.escape(label)}</text>')
    out.append('</g></svg>');destination.write_text(''.join(out)+'\n')


def plots(data, folder):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import numpy as np
    plt.rcParams.update({'font.size':13,'svg.fonttype':'none','svg.hashsalt':'entropy-foundations',
        'axes.spines.top':False,'axes.spines.right':False,'figure.facecolor':'#fffdf8','axes.facecolor':'#fffdf8'})
    x=np.linspace(.005,1,600)
    for e in data['events']:
        fig,ax=plt.subplots(figsize=(5,3.4),layout='constrained')
        ax.plot(x,-np.log2(x),color='#276b4c',linewidth=2.5)
        ax.scatter([e['p']],[e['surprise']],s=65,color='#b95127',zorder=4)
        ax.set(xlim=(-.025,1.025),ylim=(-.15,8),xlabel='Probability of the observed event',ylabel='Surprise (bits)',title=f"p = {e['p']:g}: {e['surprise']:.3g} bits")
        ax.set_xticks([0,.5,1]);ax.set_yticks([0,2,4,6,8]);ax.grid(alpha=.16)
        fig.savefig(folder/e['image'],metadata={'Date':None});plt.close(fig)
    for code in data['codes']:
        code_diagram(code['words'],folder/code['image'])


if __name__=='__main__':
    folder=Path(__file__).resolve().parent;data=foundations()
    (folder/'assets/entropy-foundations.json').write_text(json.dumps(data,indent=2,allow_nan=False)+'\n')
    plots(data,folder)
    print('Exported 3 distributions, 5 surprise plots, and 2 prefix-free codes; verified the 8-symbol example.')
