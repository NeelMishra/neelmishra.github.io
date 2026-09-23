#!/usr/bin/env python3
"""Reproduce the four-row squared-error example and its first two updates.

Uses exact rational arithmetic and Python's standard library only.
"""
from fractions import Fraction as F
from pathlib import Path
import json

HERE=Path(__file__).resolve().parent
X=list(map(F,[1,2,3,4]))
Y=list(map(F,[2,4,8,10]))
RATE=F(1,2)


def fit_stump(targets):
    candidates=[]
    for k in [1,2,3]:
        left=sum(targets[:k])/k
        right=sum(targets[k:])/(4-k)
        fitted=[left]*k+[right]*(4-k)
        sse=sum((y-f)**2 for y,f in zip(targets,fitted))
        candidates.append(dict(cut=(X[k-1]+X[k])/2,left=left,right=right,sse=sse,fitted=fitted))
    return min(candidates,key=lambda c:(c['sse'],c['cut'])),candidates


def figure(name,title,subtitle,limits,ticks,targets,lines,description):
    low,high=limits
    def sx(x):return 48+(float(x)-1)*76
    def sy(y):return 252-(float(y)-low)/(high-low)*172
    out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 415" role="img" aria-labelledby="title desc">',
        f'<title id="title">{title}</title><desc id="desc">{description}</desc>',
        '<rect width="320" height="415" rx="10" fill="#f9fbf8"/>',
        '<g font-family="Arial,sans-serif" font-size="17" fill="#243e33">',
        f'<text x="160" y="28" text-anchor="middle" font-weight="bold">{title}</text>',
        f'<text x="160" y="54" text-anchor="middle">{subtitle}</text>']
    for tick in ticks:
        out.extend([f'<path d="M48 {sy(tick):.3f}H284" stroke="#d5dfd8"/>',f'<text x="36" y="{sy(tick)+6:.3f}" text-anchor="end">{tick:g}</text>'])
    for x in X:out.append(f'<text x="{sx(x)}" y="276" text-anchor="middle">{x}</text>')
    out.append('<text x="166" y="301" text-anchor="middle">Input x</text>')
    for label,color,dash,values in lines:
        if len(set(values))==1:
            d=f'M42 {sy(values[0]):.3f}H284'
        else:
            d=f'M42 {sy(values[0]):.3f}H{sx(F(5,2)):.3f}V{sy(values[-1]):.3f}H284'
        out.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="2.5" stroke-dasharray="{dash}"/>')
    # Gaps measured from the selected fitted line to the four targets.
    fitted=lines[-1][3]
    for x,target,pred in zip(X,targets,fitted):
        out.extend([f'<path d="M{sx(x)} {sy(target):.3f}V{sy(pred):.3f}" stroke="#8d7d68" stroke-dasharray="2 3"/>',f'<circle cx="{sx(x)}" cy="{sy(target):.3f}" r="4.5" fill="#b04f29"/>'])
    labels=[('Target points','#b04f29','dots')]+[(label,color,dash) for label,color,dash,_ in lines]
    for i,(label,color,dash) in enumerate(labels):
        y=331+28*i
        if dash=='dots':out.append(f'<circle cx="35" cy="{y}" r="4.5" fill="{color}"/>')
        else:out.append(f'<path d="M20 {y}H50" stroke="{color}" stroke-width="2.5" stroke-dasharray="{dash}"/>')
        out.append(f'<text x="62" y="{y+6}">{label}</text>')
    out.append('</g></svg>')
    (HERE/name).write_text('\n'.join(out)+'\n')


def main():
    prediction=[sum(Y)/len(Y)]*4
    records=[]
    for step in [1,2]:
        residual=[y-p for y,p in zip(Y,prediction)]
        fit,candidates=fit_stump(residual)
        updated=[p+RATE*h for p,h in zip(prediction,fit['fitted'])]
        mse=sum((y-p)**2 for y,p in zip(Y,updated))/4
        records.append(dict(step=step,before=prediction,residual=residual,fit=fit,candidates=candidates,after=updated,mse=mse))
        prediction=updated
    assert records[0]['after']==[F(9,2)]*2+[F(15,2)]*2
    assert records[0]['mse']==F(13,4)
    assert records[1]['fit']['fitted']==[-F(3,2)]*2+[F(3,2)]*2
    assert [c['sse'] for c in records[1]['candidates']]==[F(14,3),F(4),F(14,3)]
    assert records[1]['after']==[F(15,4)]*2+[F(33,4)]*2
    assert records[1]['mse']==F(25,16)
    # Half-squared-error negative gradient is y-F, checked by finite differences.
    for y,p in zip(Y,records[0]['before']):
        eps=F(1,1000000)
        derivative=(((y-p-eps)**2)/2-((y-p+eps)**2)/2)/(2*eps)
        assert -derivative==y-p
    figure('residual-step.svg','First round: prediction','Response / predicted response',(0,12),[0,4,8,12],Y,
           [('Baseline = 6','#7c8995','6 4',[F(6)]*4),('Updated = 4.5 or 7.5','#087f64','',records[0]['after'])],
           'Targets 2,4,8,10; baseline six; first updated predictions 4.5,4.5,7.5,7.5. Dotted vertical gaps are remaining residuals.')
    figure('second-round-targets.svg','Second round: correction','Residual / fitted correction',(-3,3),[-3,0,3],records[1]['residual'],
           [('New stump = −1.5 or +1.5','#176b93','',records[1]['fit']['fitted'])],
           'New targets are minus2.5, minus0.5, plus0.5, plus2.5. Their fitted stump has leaf means minus1.5 and plus1.5. These corrections are then multiplied by learning rate0.5.')
    encoded=json.dumps(records,default=lambda value:{'fraction':str(value),'value':float(value)},indent=2)
    (HERE/'boosting-two-rounds.json').write_text(encoded+'\n')
    print('Round1 MSE=3.25; round2 MSE=1.5625; every candidate, leaf mean, and gradient check passed.')


if __name__=='__main__': main()
