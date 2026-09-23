#!/usr/bin/env python3
"""Original teaching calculations; Python standard library only.

Run from any directory. Checks actual stump fitting, AdaBoost normalization,
log-loss derivatives, Newton gains, and early stopping. Writes replay traces
and the early-stopping figure next to this file. This is a small educational
implementation, not a replacement for a general-purpose tree library.
"""
from fractions import Fraction as Q
from pathlib import Path
import json
import math

HERE = Path(__file__).resolve().parent
X = [Q(1), Q(2), Q(3), Q(4)]
Y = [Q(2), Q(4), Q(8), Q(10)]


def mean(values):
    return sum(values) / len(values)


def fit_stump(x, target):
    """Squared-loss stump; constant first on ties, then smallest threshold."""
    value = mean(target)
    candidates = [(sum((y-value)**2 for y in target), 0, Q(0), value, value)]
    unique = sorted(set(x))
    for a, b in zip(unique, unique[1:]):
        cut = (a+b)/2
        left = mean([y for xi, y in zip(x, target) if xi < cut])
        right = mean([y for xi, y in zip(x, target) if xi >= cut])
        error = sum((y-(left if xi < cut else right))**2 for xi, y in zip(x, target))
        candidates.append((error, 1, cut, left, right))
    _, split, cut, left, right = min(candidates)
    return {'cut': cut if split else None, 'left': left, 'right': right}


def predict(stump, x):
    return stump['left'] if stump['cut'] is None or x < stump['cut'] else stump['right']


def train(rate, rounds=6):
    base = mean(Y)
    current = [base]*len(Y)
    trace = [{'round': 0, 'prediction': current[:], 'mse': mean([(y-f)**2 for y,f in zip(Y,current)])}]
    models = []
    for t in range(1, rounds+1):
        residual = [y-f for y,f in zip(Y,current)]
        model = fit_stump(X, residual)
        correction = [predict(model, x) for x in X]
        before = current[:]
        current = [f+rate*h for f,h in zip(current,correction)]
        models.append(model)
        # Inference must reproduce the incremental training predictions.
        assert current == [base+rate*sum(predict(tree,x) for tree in models) for x in X]
        trace.append({'round': t, 'before': before, 'residual': residual, 'tree': model,
                      'correction': correction, 'prediction': current[:],
                      'mse': mean([(y-f)**2 for y,f in zip(Y,current)])})
    return trace


def adaboost():
    x, y = list(range(1,6)), [1,-1,-1,1,1]
    weights = [0.2]*5
    rounds = []
    def majority(ids):
        return 1 if sum(weights[i]*y[i] for i in ids) >= -1e-14 else -1
    for _ in range(2):
        candidates = []
        for label in [1,-1]:
            guesses = [label]*5
            candidates.append((sum(w for w,a,b in zip(weights,y,guesses) if a!=b),0,0,guesses))
        for cut in [1.5,2.5,3.5,4.5]:
            left = majority([i for i,v in enumerate(x) if v < cut])
            right = majority([i for i,v in enumerate(x) if v >= cut])
            guesses = [left if v < cut else right for v in x]
            candidates.append((sum(w for w,a,b in zip(weights,y,guesses) if a!=b),1,cut,guesses))
        # Round floating errors before applying deterministic tie rules.
        error,split,cut,guesses = min(candidates,key=lambda c:(round(c[0],12),c[1],c[2]))
        vote = 0.5*math.log((1-error)/error)
        updated = [w*math.exp(-vote*a*b) for w,a,b in zip(weights,y,guesses)]
        weights = [w/sum(updated) for w in updated]
        rounds.append({'error':error,'vote':vote,'cut':cut if split else None,'prediction':guesses,'weights':weights[:]})
    assert rounds[0]['prediction'] == [-1,-1,-1,1,1]
    assert rounds[1]['prediction'] == [1,1,1,1,1]
    for actual, expected in zip(rounds[0]['weights'],[.5,.125,.125,.125,.125]):
        assert math.isclose(actual,expected)
    for actual, expected in zip(rounds[1]['weights'],[1/3,1/4,1/4,1/12,1/12]):
        assert math.isclose(actual,expected)
    return rounds


def logloss(y, score):
    # Stable softplus(score) - y*score.
    return max(score,0)+math.log1p(math.exp(-abs(score)))-y*score


def verify():
    traces = {str(float(rate)):train(rate) for rate in [Q(1,10),Q(1,2),Q(1)]}
    half = traces['0.5']
    assert [r['mse'] for r in half[:3]] == [Q(10),Q(13,4),Q(25,16)]
    assert half[2]['prediction'] == [Q(15,4),Q(15,4),Q(33,4),Q(33,4)]
    assert traces['1.0'][1]['prediction'] == [Q(3),Q(3),Q(9),Q(9)]
    assert fit_stump([Q(1)]*3,[Q(2),Q(4),Q(6)])['cut'] is None
    duplicate = fit_stump([Q(1),Q(1),Q(2),Q(2)],[Q(1),Q(3),Q(7),Q(9)])
    assert duplicate == {'cut':Q(3,2),'left':Q(2),'right':Q(8)}
    assert fit_stump(list(reversed(X)),list(reversed(Y))) == fit_stump(X,Y)
    for y in [0,1]:
        for score in [-3,-.5,0,2]:
            p = 1/(1+math.exp(-score))
            e = 1e-4
            slope = (logloss(y,score+e)-logloss(y,score-e))/(2*e)
            curvature = (logloss(y,score+e)-2*logloss(y,score)+logloss(y,score-e))/(e*e)
            assert abs(slope-(p-y)) < 1e-8
            assert abs(curvature-p*(1-p)) < 1e-7
    assert math.isclose(logloss(1,.25),.5759394198788436)
    assert math.isclose(logloss(1,1),.31326168751822286)
    gain = .5*(36/3+36/3)-.5
    assert gain == 11.5
    assert .5*(9/4+9/2)-.5 == 2.875
    validation = [.69,.56,.44,.39,.40,.41]
    best_round, best, stale = 0, validation[0], 0
    for t,loss in enumerate(validation[1:],1):
        if loss < best:
            best_round,best,stale=t,loss,0
        else:
            stale+=1
        if stale == 2:
            break
    assert best_round == 3 and t == 5
    return {'regression':traces,'adaboost':adaboost(),
            'early_stopping':{'training':[.69,.54,.42,.33,.27,.22],
                              'validation':validation,'best_round':3,'stop_round':5}}


def render_stopping(trace):
    train=trace['training']; valid=trace['validation']
    sx=lambda i:45+i*47
    sy=lambda loss:250-(loss-.2)*360
    pts=lambda ys:' '.join(f'{sx(i)},{sy(y):.2f}' for i,y in enumerate(ys))
    elements=['<svg xmlns="http://www.w3.org/2000/svg" width="320" height="350" viewBox="0 0 320 350" role="img" aria-labelledby="title desc">',
              '<title id="title">Select the best round before patience stops</title><desc id="desc">Validation reaches its minimum at round 3; training continues until round 5.</desc>',
              '<rect width="320" height="350" fill="#fffdf8"/>',
              '<g font-family="Arial,sans-serif" font-size="13" fill="#183d32">',
              '<text x="18" y="25" font-size="16" font-weight="bold">Best round ≠ stopping round</text>']
    for value in [.2,.3,.4,.5,.6,.7]:
        y=sy(value)
        elements += [f'<path d="M45 {y} H280" stroke="#ddd7c9"/>',f'<text x="14" y="{y+4}">{value}</text>']
    for i in range(6): elements.append(f'<text x="{sx(i)-3}" y="272">{i}</text>')
    elements += ['<text x="120" y="291">Boosting round</text>',
                 f'<polyline points="{pts(train)}" fill="none" stroke="#14755b" stroke-width="3"/>',
                 f'<polyline points="{pts(valid)}" fill="none" stroke="#ad5c19" stroke-width="3"/>']
    for i,y in enumerate(valid): elements.append(f'<circle cx="{sx(i)}" cy="{sy(y)}" r="4" fill="#ad5c19"/>')
    elements += [f'<path d="M{sx(3)} {sy(valid[3])+9} v30" stroke="#ad5c19"/>',
                 '<text x="136" y="226" fill="#8d4410">Keep round 3</text>',
                 '<text x="18" y="319" fill="#14755b">● Training</text>',
                 '<text x="154" y="319" fill="#ad5c19">● Validation</text>',
                 '<text x="18" y="341">Patience 2 stops after round 5.</text></g></svg>']
    (HERE/'figures/early-stopping.svg').write_text('\n'.join(elements)+'\n')


if __name__ == '__main__':
    result=verify()
    (HERE/'figures/worked-examples.json').write_text(json.dumps(result,default=float,indent=2)+'\n')
    render_stopping(result['early_stopping'])
    print('Verified 21 regression states, fitted AdaBoost rounds, derivatives, gains, edge cases, and early stopping.')
