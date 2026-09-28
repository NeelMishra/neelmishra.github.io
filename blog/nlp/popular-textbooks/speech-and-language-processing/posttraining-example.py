"""Original post-training arithmetic and independent checks; standard library only."""
from math import exp, isclose, log, log1p


def sigmoid(x):
    return 1 / (1 + exp(-x)) if x >= 0 else exp(x) / (1 + exp(x))


def softplus(x):
    return max(x, 0) + log1p(exp(-abs(x)))


def logit(p):
    return log(p) - log1p(-p)


def dpo(policy_chosen, reference_chosen, beta):
    """Two-completion toy distribution: rejected probability is 1 - chosen."""
    margin = logit(policy_chosen) - logit(reference_chosen)
    score = beta * margin
    preference = sigmoid(score)
    loss = softplus(-score)
    gradient = -beta * sigmoid(-score)  # derivative w.r.t. policy log odds
    kl = (policy_chosen * log(policy_chosen / reference_chosen)
          + (1-policy_chosen) * log((1-policy_chosen)/(1-reference_chosen)))
    return margin, score, preference, loss, gradient, kl


def main():
    nll = [-log(p) for p in (.5, .25, .8)]
    assert isclose(sum(nll), log(10))
    assert isclose(sum(nll)/3, .7675283643313485)
    assert isclose(sigmoid(.8), .6899744811276125)
    result = dpo(.7, .6, .5)
    assert isclose(result[2], .5550055679356352)
    assert isclose(result[3], .5887771329695661)
    assert isclose(result[5], .021600854143546594)
    h = 1e-5
    checks = 0
    for beta in (.1, .5, 1, 2):
        for i in range(1, 20):
            p = i/20
            for j in range(1, 20):
                ref = j/20
                margin, score, preference, loss, gradient, kl = dpo(p, ref, beta)
                assert 0 < preference < 1 and loss >= 0 and kl > -1e-12
                z = logit(p)
                numerical = (dpo(sigmoid(z+h), ref, beta)[3]
                             - dpo(sigmoid(z-h), ref, beta)[3]) / (2*h)
                assert isclose(numerical, gradient, rel_tol=1e-7, abs_tol=1e-9)
                if i == j:
                    assert isclose(preference, .5) and isclose(loss, log(2))
                    assert abs(kl) < 1e-12
                checks += 1
    # A DPO margin can improve even when chosen sequence likelihood decreases.
    before = softplus(-.5*((-3.0)-(-4.0)-.4))
    after = softplus(-.5*((-3.1)-(-4.3)-.4))
    assert after < before and exp(-3.1) < exp(-3.0)
    print('Response token NLLs:', nll, 'mean:', sum(nll)/3)
    print('DPO margin, score, preference, loss, gradient, KL:', result)
    print('Counterexample loss:', before, '->', after)
    print(f'{checks} DPO settings and finite-difference derivatives pass.')


if __name__ == '__main__':
    main()
