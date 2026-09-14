"""Exact small constrained regressions, not a call to the SHAP package.
Requires NumPy. Run: python kernel_shap_demo.py > assets/kernel-shap-demo.json
Keep explanation_games.py in the same directory.
"""
import json
from math import comb
import numpy as np
from explanation_games import coalition_game, describe


def fit(game, keys, weighting='shap'):
    m = len(next(iter(game)))
    base = game['0'*m]['value']
    delta = game['1'*m]['value'] - base
    masks = np.asarray([list(map(int,key)) for key in keys], dtype=float)
    target = np.asarray([game[key]['value']-base for key in keys])
    size = masks.sum(axis=1).astype(int)
    assert np.all((size > 0) & (size < m)), 'Use interior masks only'
    weights = np.asarray([(m-1)/(comb(m,int(s))*s*(m-s)) for s in size])
    if weighting == 'uniform':
        weights = np.ones(len(keys))
    # phi_last = delta - sum(phi_others) enforces the full-mask constraint.
    design = masks[:,:-1] - masks[:,-1,None]
    rhs = target - masks[:,-1]*delta
    scale = np.sqrt(weights)
    free, _, rank, _ = np.linalg.lstsq(design*scale[:,None], rhs*scale, rcond=None)
    result = dict(keys=keys, weights=weights.tolist(), rank=int(rank),
                  required_rank=m-1, baseline=base, prediction=base+delta)
    if rank < m-1:
        return dict(result, phi=None, fitted=None, residuals=None)
    phi = np.r_[free, delta-free.sum()]
    phi[np.abs(phi) < 1e-12] = 0
    fitted = base + masks@phi
    residuals = fitted - (target+base)
    assert abs(base+sum(phi)-(base+delta)) < 1e-12
    return dict(result, phi=phi.tolist(), fitted=fitted.tolist(), residuals=residuals.tolist())


def examples():
    two = describe(coalition_game([1,1], [[0,0]]))
    four = describe(coalition_game([1,1,1,1], [[0,0,0,0]]))
    keys = [key for key in four['game'] if 0 < key.count('1') < 4]
    singles = [key for key in keys if key.count('1') == 1]
    coupled = [key for key in keys if key[0] == key[1]]
    fits = {
        'shap': fit(four['game'], keys),
        'uniform': fit(four['game'], keys, 'uniform'),
        'singles': fit(four['game'], singles),
        'coupled': fit(four['game'], coupled)}
    assert np.allclose(fits['shap']['phi'],four['phi'])
    assert fits['coupled']['phi'] is None
    return dict(two=two, four=four, fits=fits,
                two_fit=fit(two['game'],['10','01']))


if __name__ == '__main__':
    print(json.dumps(examples(), indent=2))
