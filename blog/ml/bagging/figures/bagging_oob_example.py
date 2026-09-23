#!/usr/bin/env python3
"""Exact original fitted-stump/OOB example and theoretical variance figure.

Standard library only. Fixed bootstrap draws are illustrative, not random
benchmark data. Tied stump costs select the lower threshold.
"""
from fractions import Fraction as F
from pathlib import Path
import json
import math

HERE = Path(__file__).resolve().parent
X = [F(i) for i in range(1,6)]
Y = list(map(F,[1,2,4,4,7]))
SAMPLES = [[1,1,3,5,5],[2,2,3,4,4],[1,2,2,4,5]]


def fit(ids):
    rows = [(X[i-1], Y[i-1]) for i in ids]
    values = sorted({x for x,y in rows})
    candidates = []
    for low, high in zip(values,values[1:]):
        cut=(low+high)/2
        left=[y for x,y in rows if x<cut]
        right=[y for x,y in rows if x>=cut]
        means=[sum(left)/len(left),sum(right)/len(right)]
        sse=sum((y-means[int(x>=cut)])**2 for x,y in rows)
        candidates.append((sse,cut,*means))
    sse,cut,left,right=min(candidates)
    return dict(sample=ids,threshold=cut,left=left,right=right,sse=sse,
                candidates=candidates,oob=[i for i in range(1,6) if i not in ids])


def predict(model,x):
    return model['left'] if x<model['threshold'] else model['right']


def make_figure():
    def sx(b): return 40+math.log10(b)*124
    def sy(v): return 255-v*22
    out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 435" role="img" aria-labelledby="title desc">',
         '<title id="title">Correlation limits variance reduction</title>',
         '<desc id="desc">Theoretical variance equals 9 times rho plus (1 minus rho) divided by tree count. With 100 trees it is 0.09 for rho zero, 1.872 for rho 0.2, and 7.218 for rho 0.8. Tree count uses a logarithmic axis.</desc>',
         '<rect width="320" height="435" rx="10" fill="#f9fbf8"/>',
         '<g font-family="Arial,sans-serif" font-size="17" fill="#243e33">',
         '<text x="160" y="27" text-anchor="middle" font-weight="bold">Correlation sets a floor</text>',
         '<text x="40" y="49">Prediction variance</text>']
    for v in [0,3,6,9]:
        out += [f'<path d="M40 {sy(v)}H288" stroke="#d4dfd8"/>', f'<text x="29" y="{sy(v)+6}" text-anchor="end">{v}</text>']
    for b in [1,10,100]:
        out.append(f'<text x="{sx(b)}" y="280" text-anchor="middle">{b}</text>')
    out.append('<text x="164" y="306" text-anchor="middle">Trees B · logarithmic axis</text>')
    for rho,color,dash in [(0,'#176b93',''),(.2,'#087f64','8 4'),(.8,'#af4e2a','3 3')]:
        points=' '.join(f'{sx(b):.3f},{sy(9*(rho+(1-rho)/b)):.3f}' for b in range(1,101))
        out.append(f'<polyline points="{points}" fill="none" stroke="{color}" stroke-width="2.5" stroke-dasharray="{dash}"/>')
    for i,(rho,color,dash) in enumerate([(0,'#176b93',''),(.2,'#087f64','8 4'),(.8,'#af4e2a','3 3')]):
        y=339+34*i
        out += [f'<path d="M22 {y}H56" stroke="{color}" stroke-width="2.5" stroke-dasharray="{dash}"/>',f'<text x="66" y="{y+6}">ρ = {rho:g} · limit = {9*rho:g}</text>']
    out+=['</g></svg>']
    (HERE/'variance.svg').write_text('\n'.join(out)+'\n')


def main():
    models=[fit(ids) for ids in SAMPLES]
    assert [(m['threshold'],m['left'],m['right']) for m in models]==[(F(2),F(1),F(6)),(F(5,2),F(2),F(4)),(F(9,2),F(9,4),F(7))]
    rows=[]
    for i,(x,y) in enumerate(zip(X,Y),1):
        eligible=[j for j,m in enumerate(models,1) if i not in m['sample']]
        predictions=[predict(models[j-1],x) for j in eligible]
        oob=sum(predictions)/len(predictions)
        rows.append(dict(row=i,eligible=eligible,predictions=predictions,oob=oob,squared_error=(y-oob)**2))
    mse=sum(row['squared_error'] for row in rows)/len(rows)
    assert mse==F(529,80)
    assert sum(predict(m,F(3)) for m in models)/3==F(49,12)
    # Independent covariance sum equals the displayed compact formula.
    for rho in [F(0),F(1,5),F(4,5)]:
        for b in [1,2,10,100]:
            assert (b*9+b*(b-1)*rho*9)/b**2==9*(rho+(1-rho)/b)
    payload=dict(models=models,rows=rows,oob_mse=mse)
    def exact(value):
        if isinstance(value,F): return dict(fraction=str(value),value=float(value))
        raise TypeError(type(value))
    encoded=json.dumps(payload,default=exact,indent=2)
    (HERE/'bagging-oob-example.json').write_text(encoded+'\n')
    make_figure()
    print(encoded)


if __name__=='__main__':
    main()
