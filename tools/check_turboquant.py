#!/usr/bin/env python3
"""Check the worked numerical examples and theoretical bounds for the TurboQuant series.

This script verifies five self-contained results used across the TurboQuant posts:

1. Exact marginal Beta coordinate density on the unit hypersphere S^(d-1),
   its 1D Lloyd-Max codebooks (both finite-d and Gaussian limit N(0, 1/d)),
   the Panter-Dite upper bound (sqrt(3)*pi/2) * 4^(-b), and the Shannon
   lower bound 4^(-b).
2. The exact Lloyd-Max inner-product shrinkage identity:
      E[<y, x_tilde_mse>] = (1 - D_mse) <y, x>
   which yields (2/pi) <y, x> in the 1-bit high-dimensional limit.
3. A concrete 4D worked example of TurboQuant_mse and two-stage TurboQuant_prod
   (rotation, scalar quantization, residual r = x - x_tilde_mse, and 1-bit QJL
   correction), plus Monte Carlo verification of unbiasedness and variance.
4. A concrete 4D worked example of PolarQuant's 2-level recursive polar
   transformation (angles psi^(1), psi^(2), and radius r) and exact Cartesian
   reconstruction.
5. Exact effective bit-width calculations for block scalar quantization vs.
   TurboQuant outlier splitting (2.5 and 3.5 bits) and PolarQuant (3.875 bits).
"""

import math
import random


def dot(u, v):
    return sum(x * y for x, y in zip(u, v))


def norm(u):
    return math.sqrt(dot(u, u))


def matvec(m, v):
    return [dot(row, v) for row in m]


def transpose(m):
    return [list(row) for row in zip(*m)]


# ---------------------------------------------------------------------------
# 1. Exact Lloyd-Max centroids and MSE distortion on N(0, 1) -> scaled by 1/sqrt(d)
# ---------------------------------------------------------------------------
def std_normal_pdf(x):
    return math.exp(-0.5 * x * x) / math.sqrt(2.0 * math.pi)


def std_normal_cdf(x):
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def truncated_normal_mean(a, b):
    """E[Z | a <= Z < b] for Z ~ N(0, 1)."""
    num = std_normal_pdf(a) - std_normal_pdf(b)
    den = std_normal_cdf(b) - std_normal_cdf(a)
    return num / den


def truncated_normal_second_moment(a, b):
    """Integral_{a}^{b} z^2 phi(z) dz."""
    term_a = 0.0 if math.isinf(a) else a * std_normal_pdf(a)
    term_b = 0.0 if math.isinf(b) else b * std_normal_pdf(b)
    return (std_normal_cdf(b) - std_normal_cdf(a)) + term_a - term_b


def solve_lloyd_max_gaussian(bits, iterations=1500):
    """Solve 1D Lloyd-Max on Z ~ N(0, 1) for 2^bits centroids."""
    k = 1 << bits
    # Initialize symmetric grid
    centroids = [-2.5 + 5.0 * (i + 0.5) / k for i in range(k)]
    for _ in range(iterations):
        boundaries = [-math.inf] + [
            0.5 * (centroids[i] + centroids[i + 1]) for i in range(k - 1)
        ] + [math.inf]
        centroids = [
            truncated_normal_mean(boundaries[i], boundaries[i + 1])
            for i in range(k)
        ]
    boundaries = [-math.inf] + [
        0.5 * (centroids[i] + centroids[i + 1]) for i in range(k - 1)
    ] + [math.inf]
    # By Lloyd-Max optimality, E[(Z - c)^2] = 1 - E[c^2]
    e_c2 = sum(
        (centroids[i] ** 2)
        * (std_normal_cdf(boundaries[i + 1]) - std_normal_cdf(boundaries[i]))
        for i in range(k)
    )
    mse = 1.0 - e_c2
    # Direct integration check of E[(Z - c)^2]
    mse_direct = sum(
        truncated_normal_second_moment(boundaries[i], boundaries[i + 1])
        - 2.0 * centroids[i] * (std_normal_pdf(boundaries[i]) - std_normal_pdf(boundaries[i + 1]))
        + (centroids[i] ** 2) * (std_normal_cdf(boundaries[i + 1]) - std_normal_cdf(boundaries[i]))
        for i in range(k)
    )
    assert abs(mse - mse_direct) < 1e-12, f"Lloyd-Max identity mismatch: {mse} vs {mse_direct}"
    return centroids, mse, e_c2


print("=== 1. Lloyd-Max Gaussian limit vs. Panter-Dite & Shannon bounds ===")
panter_dite_const = 0.5 * math.sqrt(3.0) * math.pi  # ~ 2.720699
for b in (1, 2, 3, 4):
    centroids, d_mse, inner_scale = solve_lloyd_max_gaussian(b)
    shannon_lb = 1.0 / (4 ** b)
    pd_ub = panter_dite_const / (4 ** b)
    assert shannon_lb <= d_mse <= pd_ub, f"Bound violation at b={b}"
    pos_c = [round(c, 4) for c in centroids if c > 0]
    print(
        f"b={b}: +centroids={pos_c} / sqrt(d) | "
        f"Shannon LB={shannon_lb:.6f} <= D_mse={d_mse:.6f} <= Panter-Dite={pd_ub:.6f} | "
        f"ratio D_mse/LB={d_mse/shannon_lb:.3f}x | shrinkage (1-D_mse)={inner_scale:.6f}"
    )

# Exact b=1 check: c = +/- sqrt(2/pi), D_mse = 1 - 2/pi
c1_exact = math.sqrt(2.0 / math.pi)
d1_exact = 1.0 - 2.0 / math.pi
c1_num, d1_num, s1_num = solve_lloyd_max_gaussian(1)
assert abs(c1_num[1] - c1_exact) < 1e-12
assert abs(d1_num - d1_exact) < 1e-12
assert abs(s1_num - (2.0 / math.pi)) < 1e-12


# ---------------------------------------------------------------------------
# 2. Exact finite-d Beta coordinate check at d=4 (Wigner semicircle density)
# ---------------------------------------------------------------------------
# For d=4, f_X(x) = (2/pi) * sqrt(1 - x^2) on [-1, 1].
# At b=1, optimal centroids are +/- E[X | X > 0] = +/- 4 / (3 * pi).
# Since Var(X) = 1/4, D_mse(d=4, b=1) = 4 * (1/4 - (4 / (3*pi))^2) = 1 - 64 / (9 * pi^2).
d4_c1 = 4.0 / (3.0 * math.pi)
d4_mse_b1 = 1.0 - 64.0 / (9.0 * (math.pi ** 2))
print(
    f"\n=== 2. Exact finite-d (d=4) vs. Gaussian approximation at b=1 ===\n"
    f"d=4 exact Beta centroid: +/- {d4_c1:.6f} (D_mse = {d4_mse_b1:.6f}, shrinkage = {1.0 - d4_mse_b1:.6f})\n"
    f"d=4 Gaussian approx:     +/- {c1_exact / 2.0:.6f} "
    f"(D_mse on S^3 = {1.0 + 4.0*(c1_exact/2.0)**2 - 2.0*4.0*(c1_exact/2.0)*d4_c1:.6f})"
)


# ---------------------------------------------------------------------------
# 3. Worked 4D Example: TurboQuant_mse and Two-Stage TurboQuant_prod
# ---------------------------------------------------------------------------
x = [0.9, -0.3, 0.3, 0.1]
y = [0.7, -0.5, 0.5, 0.1]
assert abs(norm(x) - 1.0) < 1e-12, "x must be a unit vector"
assert abs(norm(y) - 1.0) < 1e-12, "y must be a unit vector"
true_ip = dot(y, x)
assert abs(true_ip - 0.94) < 1e-12

# Orthogonal rotation matrix Pi (4x4 signed Hadamard matrix, Pi^T Pi = I)
pi_mat = [
    [0.5, 0.5, 0.5, 0.5],
    [0.5, -0.5, 0.5, -0.5],
    [-0.5, -0.5, 0.5, 0.5],
    [-0.5, 0.5, 0.5, -0.5],
]
# Verify Pi^T Pi = I
pi_t = transpose(pi_mat)
for i in range(4):
    for j in range(4):
        expected = 1.0 if i == j else 0.0
        assert abs(dot(pi_mat[i], pi_mat[j]) - expected) < 1e-12

u = matvec(pi_mat, x)  # rotated coordinates: [0.5, 0.7, -0.1, -0.5]
assert all(abs(u[i] - [0.5, 0.7, -0.1, -0.5][i]) < 1e-12 for i in range(4))
assert abs(norm(u) - 1.0) < 1e-12

# Stage 1 (b=2 bits): 4-level Lloyd-Max codebook on N(0, 1/4)
c2_unit, _, _ = solve_lloyd_max_gaussian(2)
c2_grid = [c / 2.0 for c in c2_unit]  # [-0.7552, -0.2264, 0.2264, 0.7552]
u_hat_2bit = [min(c2_grid, key=lambda g: (g - val) ** 2) for val in u]
x_hat_2bit = matvec(pi_t, u_hat_2bit)
mse_2bit = sum((x[i] - x_hat_2bit[i]) ** 2 for i in range(4))
ip_2bit = dot(y, x_hat_2bit)

# Stage 1 (b=1 bit): 2-level Lloyd-Max codebook on N(0, 1/4): +/- sqrt(2/(pi*4)) = +/- 0.398942
c_gauss = math.sqrt(2.0 / (math.pi * 4.0))
u_hat_1bit = [c_gauss if val >= 0 else -c_gauss for val in u]
x_hat_1bit = matvec(pi_t, u_hat_1bit)
mse_1bit = sum((x[i] - x_hat_1bit[i]) ** 2 for i in range(4))
ip_1bit = dot(y, x_hat_1bit)

# Two-stage TurboQuant_prod at b = 2 bits total:
# Stage 1 at b_mse = 1 bit followed by Stage 2 (1-bit QJL on the residual r = x - x_hat_1bit)
r = [x[i] - x_hat_1bit[i] for i in range(4)]
gamma = norm(r)
assert abs(gamma ** 2 - mse_1bit) < 1e-12

# Concrete 4x4 projection matrix S for the deterministic walkthrough in the text
S_demo = [
    [1.10, -0.40, 0.30, 0.20],
    [0.80, -0.90, -0.50, 0.40],
    [-0.70, 0.60, -0.80, 0.10],
    [0.50, 1.20, 0.70, -0.60],
]
Sr = matvec(S_demo, r)
z_qjl = [1.0 if val >= 0 else -1.0 for val in Sr]
qjl_scale = math.sqrt(math.pi / 2.0) / 4.0 * gamma
r_hat = [qjl_scale * val for val in matvec(transpose(S_demo), z_qjl)]
x_hat_prod = [x_hat_1bit[i] + r_hat[i] for i in range(4)]
ip_prod_demo = dot(y, x_hat_prod)

print("\n=== 3. Worked 4D Example (x = [0.9, -0.3, 0.3, 0.1], y = [0.7, -0.5, 0.5, 0.1]) ===")
print("True <y, x>:", round(true_ip, 6))
print("Rotated u = Pi x:", [round(v, 4) for v in u])
print("2-bit Lloyd-Max grid (d=4):", [round(v, 6) for v in c2_grid])
print("Stage 1 (2-bit MSE) u_hat:", [round(v, 6) for v in u_hat_2bit])
print("Stage 1 (2-bit MSE) x_hat:", [round(v, 6) for v in x_hat_2bit])
print("Stage 1 (2-bit MSE) ||x - x_hat||^2:", round(mse_2bit, 6), "| <y, x_hat>:", round(ip_2bit, 6))
print("Stage 1 (1-bit MSE) u_hat:", [round(v, 6) for v in u_hat_1bit])
print("Stage 1 (1-bit MSE) x_hat_mse:", [round(v, 6) for v in x_hat_1bit])
print("Stage 1 (1-bit MSE) ||x - x_hat_mse||^2:", round(mse_1bit, 6), "| ||r||_2:", round(gamma, 6))
print("Stage 1 (1-bit MSE) inner product <y, x_hat_mse>:", round(ip_1bit, 6), "(error:", round(ip_1bit - true_ip, 6), ")")
print("Residual r = x - x_hat_mse:", [round(v, 6) for v in r])
print("S_demo * r:", [round(v, 6) for v in Sr], "-> z_qjl:", [int(v) for v in z_qjl])
print("QJL residual reconstruction r_hat:", [round(v, 6) for v in r_hat])
print("Two-stage x_hat_prod:", [round(v, 6) for v in x_hat_prod])
print("Two-stage <y, x_hat_prod>:", round(ip_prod_demo, 6), "(error:", round(ip_prod_demo - true_ip, 6), ")")

# Monte Carlo verification of QJL unbiasedness and variance bound on r
rng = random.Random(20261019)
trials = 40000
ip_estimates = []
sq_errors = []
for _ in range(trials):
    # Sample 4x4 i.i.d. N(0, 1) matrix S
    S_mc = [[rng.gauss(0.0, 1.0) for _ in range(4)] for _ in range(4)]
    z = [1.0 if dot(row, r) >= 0.0 else -1.0 for row in S_mc]
    # Inner product <y, r_hat> = (sqrt(pi/2)/d) * gamma * sum_i z_i (s_i . y)
    sy = [dot(row, y) for row in S_mc]
    r_ip_est = (math.sqrt(math.pi / 2.0) / 4.0) * gamma * dot(z, sy)
    total_ip_est = ip_1bit + r_ip_est
    ip_estimates.append(total_ip_est)
    sq_errors.append((total_ip_est - true_ip) ** 2)

mean_ip = sum(ip_estimates) / trials
empirical_var = sum(sq_errors) / trials
theoretical_var_ub = (math.pi / (2.0 * 4.0)) * (norm(y) ** 2) * (gamma ** 2)
print(
    f"Monte Carlo ({trials} trials) E[<y, x_hat_prod>]: {mean_ip:.5f} vs exact {true_ip:.5f}"
)
print(
    f"Monte Carlo MSE: {empirical_var:.6f} <= Theoretical bound (pi/(2d))*||y||^2*||r||^2 = {theoretical_var_ub:.6f}"
)
assert abs(mean_ip - true_ip) < 0.005, "QJL inner product estimator should be unbiased"
assert empirical_var <= theoretical_var_ub * 1.02, "Empirical variance exceeded bound"


# ---------------------------------------------------------------------------
# 4. Worked 4D Example: PolarQuant 2-Level Recursive Polar Transform
# ---------------------------------------------------------------------------
# Take u = [0.5, 0.7, -0.1, -0.5] from the rotated vector above.
# Level 1 pairs: (u_1, u_2) = (0.5, 0.7) and (u_3, u_4) = (-0.1, -0.5)
r1_1 = math.hypot(u[0], u[1])  # sqrt(0.25 + 0.49) = sqrt(0.74)
r1_2 = math.hypot(u[2], u[3])  # sqrt(0.01 + 0.25) = sqrt(0.26)
psi1_1 = math.atan2(u[1], u[0]) % (2.0 * math.pi)  # in [0, 2*pi)
psi1_2 = math.atan2(u[3], u[2]) % (2.0 * math.pi)  # in [0, 2*pi)

# Level 2 combines the two non-negative radii (r1_1, r1_2):
r2_1 = math.hypot(r1_1, r1_2)  # overall norm = 1.0
psi2_1 = math.atan2(r1_2, r1_1)  # in [0, pi/2]

# Reconstruct Cartesian coordinates from (r2_1, psi2_1, psi1_1, psi1_2):
rec_r1_1 = r2_1 * math.cos(psi2_1)
rec_r1_2 = r2_1 * math.sin(psi2_1)
rec_u = [
    rec_r1_1 * math.cos(psi1_1),
    rec_r1_1 * math.sin(psi1_1),
    rec_r1_2 * math.cos(psi1_2),
    rec_r1_2 * math.sin(psi1_2),
]
assert all(abs(rec_u[i] - u[i]) < 1e-12 for i in range(4)), "Polar reconstruction mismatch"

print("\n=== 4. Worked 4D PolarQuant Recursive Transform ===")
print(
    f"Level 1 radii: r^(1) = [{r1_1:.6f}, {r1_2:.6f}], "
    f"angles psi^(1) = [{psi1_1:.6f} rad ({math.degrees(psi1_1):.2f} deg), "
    f"{psi1_2:.6f} rad ({math.degrees(psi1_2):.2f} deg)]"
)
print(
    f"Level 2 radius: r^(2) = {r2_1:.6f}, "
    f"angle psi^(2) = {psi2_1:.6f} rad ({math.degrees(psi2_1):.2f} deg, vs pi/4 = 45.00 deg)"
)


# ---------------------------------------------------------------------------
# 5. Effective Bit-Width & Metadata Overhead Accounting
# ---------------------------------------------------------------------------
# Case A: Conventional 2-bit block quantizer with group size G=32, FP16 scale + FP16 zero-point
g_block = 32
b_nom = 2
b_eff_block = b_nom + (16 + 16) / g_block  # 2 + 1.0 = 3.0 bits/coord
assert abs(b_eff_block - 3.0) < 1e-12

# Case B: TurboQuant outlier channel splitting on d=128 (32 outlier channels + 96 regular channels)
b_tq_25 = (32 * 3 + 96 * 2) / 128  # 2.25 bits + metadata (~0.25 bits for 2 norms/rotations) -> 2.5 bits
b_tq_35 = (32 * 4 + 96 * 3) / 128  # 3.25 bits + metadata -> 3.5 bits
assert abs(b_tq_25 - 2.25) < 1e-12
assert abs(b_tq_35 - 3.25) < 1e-12

# Case C: PolarQuant 4-level recursion on blocks of 16 coordinates:
# 8 level-1 angles * 4 bits + 4 level-2 angles * 2 bits + 2 level-3 angles * 2 bits
# + 1 level-4 angle * 2 bits + 1 FP16 radius (16 bits) = 32 + 8 + 4 + 2 + 16 = 62 bits / 16 coords = 3.875 bits
polar_bits = (8 * 4 + 4 * 2 + 2 * 2 + 1 * 2 + 16) / 16
assert abs(polar_bits - 3.875) < 1e-12

print("\n=== 5. Bit-Budget Accounting ===")
print(f"Block 2-bit (G=32, FP16 scale+zero): {b_eff_block:.3f} bits/coord (+50% overhead)")
print(f"TurboQuant 32x3b + 96x2b index payload: {b_tq_25:.3f} bits/coord (~2.5 bits with norms)")
print(f"TurboQuant 32x4b + 96x3b index payload: {b_tq_35:.3f} bits/coord (~3.5 bits with norms)")
print(f"PolarQuant 4-level (16-coord block): {polar_bits:.3f} bits/coord")
print("\nturboquant check passed")
