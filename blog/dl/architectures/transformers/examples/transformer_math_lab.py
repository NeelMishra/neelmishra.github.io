"""Small float64 reference experiments for the Transformer learning track.

Requires Python 3 and NumPy. Run: python transformer_math_lab.py
No model weights, network requests, training, or performance measurements.
"""

import json
import platform

import numpy as np


def softmax(scores):
    scores = np.asarray(scores, dtype=np.float64)
    weights = np.exp(scores - np.max(scores, axis=-1, keepdims=True))
    return weights / weights.sum(axis=-1, keepdims=True)


def attention(q, k, v, allowed):
    """Every evaluated query must have at least one allowed key."""
    assert np.all(allowed.any(axis=-1))
    scores = q @ k.T / np.sqrt(q.shape[-1])
    return softmax(np.where(allowed, scores, -np.inf)) @ v


def online_read(score_chunks, value_chunks):
    """Merge unnormalized summaries, skipping chunks without finite scores."""
    maximum, mass = -np.inf, 0.0
    weighted = np.zeros(value_chunks[0].shape[-1], dtype=np.float64)
    for scores, values in zip(score_chunks, value_chunks):
        valid = np.isfinite(scores)
        if not valid.any():
            continue
        scores, values = scores[valid], values[valid]
        new_maximum = max(maximum, np.max(scores))
        old_scale = np.exp(maximum - new_maximum)
        weights = np.exp(scores - new_maximum)
        weighted = old_scale * weighted + weights @ values
        mass = old_scale * mass + weights.sum()
        maximum = new_maximum
    if mass == 0:
        raise ValueError("The complete row has no allowed key")
    return weighted / mass


def delta_write(state, key, value, beta):
    return state + beta * np.outer(key, value - state.T @ key)


def gated_write(state, key, value, beta, retention):
    """retention is scalar or a vector of length d_k; decay precedes read."""
    decayed = state * np.asarray(retention).reshape(-1, 1)
    return delta_write(decayed, key, value, beta)


def rotation(angle):
    c, s = np.cos(angle), np.sin(angle)
    return np.array([[c, -s], [s, c]])


def main():
    rng = np.random.default_rng(184)
    results = {}

    def same(name, actual, expected, tolerance=1e-11):
        error = float(np.max(np.abs(np.asarray(actual) - np.asarray(expected))))
        assert np.isfinite(error) and error < tolerance, (name, error)
        results[name] = {"max_absolute_error": error, "tolerance": tolerance}

    q, k, v = rng.normal(size=(3, 7, 3))
    allowed = np.tril(np.ones((7, 7), dtype=bool))
    full = attention(q, k, v, allowed)
    cached = np.concatenate([
        attention(q[t:t + 1], k[:t + 1], v[:t + 1],
                  np.ones((1, t + 1), dtype=bool))
        for t in range(7)
    ])
    same("causal_prefix_reads", cached, full)
    changed_k, changed_v = k.copy(), v.copy()
    changed_k[4:] += 100
    changed_v[4:] -= 200
    same("future_perturbation", attention(q, changed_k, changed_v, allowed)[:4], full[:4])
    prefix, chunk = 3, 2
    chunk_allowed = np.arange(prefix + chunk)[None, :] <= (
        prefix + np.arange(chunk)[:, None])
    same("chunk_mask_offset", attention(q[3:5], k[:5], v[:5], chunk_allowed), full[3:5])

    scores = np.array([1000., 1001., -np.inf, 999., 1003., 998.])
    values = rng.normal(size=(6, 4))
    pieces = [slice(0, 2), slice(2, 3), slice(3, 3), slice(3, 6)]
    same("online_softmax", online_read([scores[s] for s in pieces],
                                       [values[s] for s in pieces]), softmax(scores) @ values)
    # The hand-worked FlashAttention example uses a distinct three-item row.
    results["online_worked_output"] = float(softmax([1000, 1001, 999]) @ [2, 4, 8])

    # Positive features ensure the normalization denominator is well-defined.
    fq, fk = rng.uniform(0.1, 1.5, size=(2, 9, 4))
    values = rng.normal(size=(9, 3))
    pairwise = np.tril(fq @ fk.T)
    direct = (pairwise @ values) / pairwise.sum(axis=1, keepdims=True)
    state, normalizer = np.zeros((4, 3)), np.zeros(4)
    recurrent = []
    for query, key, value in zip(fq, fk, values):
        state += np.outer(key, value)
        normalizer += key
        recurrent.append(state.T @ query / (normalizer @ query))
    same("normalized_kernel_recurrence", recurrent, direct)

    state = rng.normal(size=(2, 3))
    key, orthogonal = np.array([1., 0.]), np.array([0., 1.])
    target = np.array([2., -1., 4.])
    updated = delta_write(state, key, target, 1.)
    same("delta_unit_key_overwrite", updated.T @ key, target)
    same("delta_orthogonal_read", updated.T @ orthogonal, state.T @ orthogonal)
    same("gated_decay_then_correct", gated_write(np.array([[4.]]), np.array([1.]),
         np.array([10.]), .25, .5), [[4.]])
    same("gated_no_decay_limit", gated_write(state, key, target, .3, 1.),
         delta_write(state, key, target, .3))
    same("gated_no_write_limit", gated_write(state, key, target, 0., .6), .6 * state)

    key = np.array([1., 1.]) / np.sqrt(2)
    decay = np.diag([1., .5])
    projection = np.eye(2) - np.outer(key, key)
    same("kda_affine_form", gated_write(state, key, target, 1., np.diag(decay)),
         projection @ decay @ state + np.outer(key, target))
    gap = float(np.max(np.abs(projection @ decay - decay @ projection)))
    assert gap > .2
    results["kda_noncommuting_counterexample"] = {"max_difference": gap}

    query, key = rng.normal(size=(2, 2))
    i, j, shift, frequency = 2, 7, 11, .37
    rotated = (rotation(i * frequency) @ query) @ (rotation(j * frequency) @ key)
    same("rope_relative_identity", rotated, query @ rotation((j - i) * frequency) @ key)
    same("rope_joint_shift", rotated, (rotation((i + shift) * frequency) @ query)
         @ (rotation((j + shift) * frequency) @ key))

    latent = rng.normal(size=(8, 3))
    up_k, up_v = rng.normal(size=(4, 3)), rng.normal(size=(5, 3))
    query = rng.normal(size=4)
    qr, kr = rng.normal(size=2), rng.normal(size=(8, 2))
    scale = np.sqrt(4 + 2)
    explicit_scores = ((latent @ up_k.T) @ query + kr @ qr) / scale
    explicit = softmax(explicit_scores) @ (latent @ up_v.T)
    absorbed_scores = (latent @ (up_k.T @ query) + kr @ qr) / scale
    absorbed = (softmax(absorbed_scores) @ latent) @ up_v.T
    same("mla_joint_score_and_projection", absorbed, explicit)

    p, draft = np.array([.6, .3, .1]), np.array([.2, .5, .3])
    accepted = draft * np.minimum(1, p / draft)
    rejection = 1 - accepted.sum()
    residual = np.maximum(p - draft, 0)
    residual /= residual.sum()
    same("speculative_distribution", accepted + rejection * residual, p)

    print(json.dumps({"python": platform.python_version(), "numpy": np.__version__,
                      "seed": 184, "dtype": "float64", "checks": results}, indent=2))


if __name__ == "__main__":
    main()
