#!/usr/bin/env python3
"""Check the worked GPTQ column update used in the quantization series.

The example is constructed. It checks three identities from the GPTQ / OBQ
formulas, in the PyTorch linear layout Y = X W:

1. H = 2 X^T X matches the paper's 2 X_paper X_paper^T after X_paper = X^T.
2. The inverse-Hessian update matches a constrained least-squares solve.
3. One Gaussian-elimination step on H^{-1} matches the inverse Hessian of the
   remaining columns.
"""

def matmul(a, b):
    return [[sum(a[i][t] * b[t][j] for t in range(len(a[0]))) for j in range(len(b[0]))] for i in range(len(a))]

def transpose(a):
    return [list(row) for row in zip(*a)]

def scale(a, s):
    return [[s * x for x in row] for row in a]

def invert(m):
    n = len(m)
    a = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(m)]
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(a[r][col]))
        a[col], a[pivot] = a[pivot], a[col]
        p = a[col][col]
        if abs(p) < 1e-12:
            raise SystemExit("singular Hessian")
        a[col] = [v / p for v in a[col]]
        for row in range(n):
            if row == col:
                continue
            factor = a[row][col]
            a[row] = [a[row][j] - factor * a[col][j] for j in range(2 * n)]
    return [row[n:] for row in a]

def dot(u, v):
    return sum(x * y for x, y in zip(u, v))

def squared_error(x, original, candidate):
    return sum((dot(row, original) - dot(row, candidate)) ** 2 for row in x)

X = [
    [1.0, 0.8, 0.1],
    [1.1, 0.7, -0.2],
    [0.9, 0.9, 0.0],
    [1.2, 0.6, 0.3],
    [0.4, 0.2, 1.0],
]
w = [1.20, -0.85, 0.40]
grid = [-1.0, -0.5, 0.0, 0.5, 1.0]

def quantize(value):
    return min(grid, key=lambda g: (g - value) ** 2)

H = scale(matmul(transpose(X), X), 2.0)
paper_x = transpose(X)
paper_h = scale(matmul(paper_x, transpose(paper_x)), 2.0)
assert paper_h == H, "paper layout and linear layout disagree"

Hinv = invert(H)
scores = []
for q in range(3):
    target = quantize(w[q])
    score = (w[q] - target) ** 2 / Hinv[q][q]
    scores.append((score, q, target))
scores.sort()
score, q, target = scores[0]
assert q == 1 and target == -1.0

delta = [-(w[q] - target) / Hinv[q][q] * Hinv[i][q] for i in range(3)]
updated = [w[i] + delta[i] for i in range(3)]
naive = w[:]
naive[q] = target

# Constrained least squares on the two free weights.
free = [i for i in range(3) if i != q]
Xf = [[row[j] for j in free] for row in X]
residual = [dot(row, w) - row[q] * target for row in X]
normal = matmul(transpose(Xf), Xf)
rhs = matmul(transpose(Xf), [[v] for v in residual])
beta = matmul(invert(normal), rhs)
assert all(abs(updated[j] - beta[k][0]) < 1e-9 for k, j in enumerate(free))

sse_naive = squared_error(X, w, naive)
sse_updated = squared_error(X, w, updated)
assert abs(sse_updated - 0.5 * score) < 1e-9
assert sse_updated < sse_naive

# Drop column q from the inverse with one elimination step.
column = [Hinv[i][q] for i in range(3)]
eliminated = [[Hinv[i][j] - column[i] * Hinv[q][j] / Hinv[q][q] for j in range(3)] for i in range(3)]
reduced = [[eliminated[i][j] for j in free] for i in free]
remaining = [[row[j] for j in free] for row in X]
remaining_h = scale(matmul(transpose(remaining), remaining), 2.0)
assert all(abs(reduced[i][j] - invert(remaining_h)[i][j]) < 1e-8 for i in range(2) for j in range(2))

print("chosen column", q, "target", target)
print("score", round(score, 6), "sse", round(sse_updated, 6), "naive", round(sse_naive, 6))
print("updated", [round(v, 6) for v in updated])
print("gptq update check passed")
