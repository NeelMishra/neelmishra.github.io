"""Leafwise attribution and subset-size bookkeeping for the TreeSHAP lesson.
Run beside tree_shap_examples.py: python tree_shap_leaf_work.py
Requires the pinned TreeSHAP packages plus Matplotlib. Generates JSON and SVGs.
The coefficient example illustrates a balanced path, not the full library algorithm.
"""
from pathlib import Path
from itertools import product
from math import comb
import json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from tree_shap_examples import examples, allocation


def extend(coefficients, absent, present):
    updated = [0.]*(len(coefficients)+1)
    for size, coefficient in enumerate(coefficients):
        updated[size] += absent*coefficient
        updated[size+1] += present*coefficient
    return updated


def calculate():
    source = examples()['balanced']; row = source['rows'][3]
    leaves = []
    for node in source['nodes']:
        if node['left'] != node['right']: continue
        game = {key:dict(value=g['leaves'].get(str(node['id']),0)*node['value'])
                for key,g in row['game'].items()}
        result = allocation(game)
        leaves.append(dict(node=node['id'],score=node['value'],game=game,**result))
    assert np.allclose(np.sum([leaf['phi'] for leaf in leaves],axis=0),row['phi'])
    prefixes = []; coefficients = [1.]
    for others in range(4):
        direct = [0.]*(others+1)
        for bits in product((0,1),repeat=others):
            direct[sum(bits)] += float(np.prod([1 if bit else .5 for bit in bits]))
        assert np.allclose(coefficients,direct)
        weights = [1/((others+1)*comb(others,k)) for k in range(others+1)]
        weighted = [c*w for c,w in zip(coefficients,weights)]
        prefixes.append(dict(others=others,subset_count=2**others,coefficients=coefficients.copy(),
                             shapley_weights=weights,weighted=weighted,
                             leaf_contribution=8*.5*sum(weighted)))
        coefficients = extend(coefficients,.5,1.)
    return dict(nodes=source['nodes'],query=row['query'],baseline_mass=row['game']['00']['mass'],leaves=leaves,prefixes=prefixes,
                baseline=row['baseline'],phi=row['phi'],prediction=row['prediction'],
                scaling=[dict(features=m,trees=100,leaves=64,depth=6,
                              enumeration=100*64*2**m,classic_tree_shap=100*64*6**2,
                              image=f'assets/tree-shap-scaling-{m}.svg') for m in (8,12,20)])


def plots(data,folder):
    plt.rcParams.update({'font.family':'sans-serif','font.sans-serif':['Arial','DejaVu Sans'],
                         'font.size':13.5,'svg.fonttype':'none'})
    x = np.arange(4,21)
    for row in data['scaling']:
        fig, ax = plt.subplots(figsize=(5.1,4.5),layout='constrained')
        ax.semilogy(x,100*64*2.**x,color='#b7771a',lw=2.2,label='Enumerate feature sets')
        ax.semilogy(x,np.full(len(x),100*64*6**2),color='#2b7050',lw=2.2,label='Classic TreeSHAP term')
        ax.axvline(row['features'],color='#82917f',ls=':',lw=1)
        ax.scatter([row['features']]*2,[row['enumeration'],row['classic_tree_shap']],color=['#b7771a','#2b7050'],s=55,zorder=4)
        ax.set(xlabel='Total features M',ylabel='Leading-term scale (not seconds)',xticks=[4,8,12,16,20],xlim=(4,20))
        ax.set_title('100 trees; 64 leaves; depth 6',fontsize=14)
        ax.grid(alpha=.18);ax.legend(loc='upper left',fontsize=10.5)
        fig.savefig(folder/Path(row['image']).name,metadata={'Date':None});plt.close(fig)


if __name__ == '__main__':
    folder = Path(__file__).resolve().parent/'assets';folder.mkdir(exist_ok=True)
    data = calculate();(folder/'tree-shap-leaf-work.json').write_text(json.dumps(data,indent=2)+'\n')
    plots(data,folder)
