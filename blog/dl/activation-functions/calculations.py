"""Reproduce activation curves and check the mathematics used in the series.

Run: python -m pip install -r requirements.txt
     python calculations.py
No training benchmarks are produced by this script.
"""
from pathlib import Path
import json
import math
import numpy as np
from scipy.special import expit, ndtr
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

OUT = Path(__file__).resolve().parent / "assets"
OUT.mkdir(exist_ok=True)
ALPHA, SCALE = 1.6732632423543772, 1.0507009873554805

def relu(x):
    return np.maximum(x, 0)

def leaky(x, a=.1):
    return np.where(x >= 0, x, a*x)

def softplus(x):
    return np.logaddexp(0, x)

def elu(x):
    return np.where(x >= 0, x, np.expm1(np.minimum(x, 0)))

def selu(x):
    return SCALE*np.where(x >= 0, x, ALPHA*np.expm1(np.minimum(x, 0)))

def gelu(x):
    return x*ndtr(x)

def dgelu(x):
    return ndtr(x)+x*np.exp(-x*x/2)/np.sqrt(2*np.pi)

def swish(x, beta=1):
    return x*expit(beta*x)

def dswish(x, beta=1):
    s = expit(beta*x)
    return s+beta*x*s*(1-s)

def mish(x):
    return x*np.tanh(softplus(x))

def dmish(x):
    t = np.tanh(softplus(x))
    return t+x*expit(x)*(1-t*t)

def designed(x, a=.1, tau=1):
    """Centered smooth leaky activation; a and tau are fixed settings."""
    if not (0 < a < 1 and tau > 0):
        raise ValueError("Require 0 < a < 1 and tau > 0")
    return a*x+(1-a)*tau*(np.logaddexp(0, x/tau)-np.log(2))

def ddesigned(x, a=.1, tau=1):
    return a+(1-a)*expit(x/tau)

FUNCTIONS = {
    "Sigmoid": (expit, lambda x: expit(x)*(1-expit(x))),
    "Tanh": (np.tanh, lambda x: 1-np.tanh(x)**2),
    "ReLU": (relu, lambda x: (x>0).astype(float)),
    "Leaky ReLU (a=0.1)": (leaky, lambda x: np.where(x>0, 1, .1)),
    "Softplus": (softplus, expit),
    "ELU (alpha=1)": (elu, lambda x: np.exp(np.minimum(x, 0))),
    "SELU": (selu, lambda x: SCALE*np.where(x>0, 1, ALPHA*np.exp(np.minimum(x, 0)))),
    "GELU": (gelu, dgelu),
    "SiLU / Swish-1": (swish, dswish),
    "Swish (beta=2)": (lambda x: swish(x, 2), lambda x: dswish(x, 2)),
    "Mish": (mish, dmish),
}
plt.rcParams.update({
    "font.family":"sans-serif", "font.sans-serif":["DejaVu Sans","Arial","sans-serif"],
    "font.size":12, "svg.fonttype":"none",
    "svg.hashsalt":"activation-functions-20261003", "axes.spines.top":False,
    "axes.spines.right":False, "savefig.facecolor":"#fffaf2",
})
COLORS = ["#126650","#a45113","#315e9a","#8e397b"]
STYLES = ["-","--","-.",":"]
results = {}

def figure(name, entries):
    x = np.linspace(-4, 4, 801)
    fig, axes = plt.subplots(2, 1, figsize=(5.4, 6.8), layout="constrained")
    handles = []
    for k, (label, f, df) in enumerate(entries):
        h, = axes[0].plot(x, f(x), color=COLORS[k], ls=STYLES[k], lw=2.1, label=label)
        handles.append(h)
        slope = df(x).copy()
        if label in ("ReLU","Leaky ReLU (a=0.1)","SELU"):
            slope[x==0] = np.nan
        axes[1].plot(x, slope, color=COLORS[k], ls=STYLES[k], lw=2.1)
    axes[0].legend(handles=handles, loc="upper left", fontsize=10, frameon=False)
    for ax in axes:
        ax.axhline(0, color="#7b877f", lw=.7)
        ax.axvline(0, color="#7b877f", lw=.7)
        ax.set_xlim(-4,4)
        ax.grid(alpha=.15)
        ax.set_xlabel("Input z")
    axes[0].set(ylabel="Output f(z)", title="What moves forward")
    axes[1].set(ylabel="Slope f′(z)", title="What scales the gradient")
    file=OUT/(name+".svg")
    fig.savefig(file, metadata={"Date":None})
    plt.close(fig)
    file.write_text("\n".join(line.rstrip() for line in file.read_text().splitlines())+"\n")

def bundle(names):
    return [(name,*FUNCTIONS[name]) for name in names]

figure("sigmoid-tanh",bundle(["Sigmoid","Tanh"]))
figure("relu-family",bundle(["ReLU","Leaky ReLU (a=0.1)"]))
figure("softplus-elu-selu",bundle(["Softplus","ELU (alpha=1)","SELU"]))
figure("gelu",bundle(["ReLU","GELU"]))
figure("silu-swish-mish",bundle(["SiLU / Swish-1","Swish (beta=2)","Mish"]))
figure("design",[(f"a=0.1, tau={tau}",lambda x,t=tau:designed(x,tau=t),lambda x,t=tau:ddesigned(x,tau=t)) for tau in [.25,1,2]])

# Compare analytic derivatives with independent centered finite differences.
points = np.concatenate([np.linspace(-5,-.05,151),np.linspace(.05,5,151)])
eps=1e-5
for name,(f,df) in FUNCTIONS.items():
    numeric=(f(points+eps)-f(points-eps))/(2*eps)
    np.testing.assert_allclose(df(points), numeric, atol=2e-8, rtol=1e-6, err_msg=name)
    assert np.isfinite(f(np.array([-1000.,0.,1000.]))).all(), name
    results[name] = {"inputs":[-1,0,1],"outputs":f(np.array([-1.,0.,1.])).tolist()}
for a in [.01,.1,.8]:
    for tau in [.05,.25,1,2]:
        numeric=(designed(points+eps,a,tau)-designed(points-eps,a,tau))/(2*eps)
        np.testing.assert_allclose(ddesigned(points,a,tau),numeric,atol=2e-8)
        assert abs(designed(0.,a,tau)) < 1e-12
        assert np.all(ddesigned(points,a,tau)>=a)
        assert np.all(ddesigned(points,a,tau)<=1)
assert np.max(np.abs(designed(points,tau=1e-6)-leaky(points)))<1e-6
z=np.array([-1.,0.,1.])
approx=.5*z*(1+np.tanh(np.sqrt(2/np.pi)*(z+.044715*z**3)))
results["gelu_tanh_approx"]=approx.tolist()

# Softmax shift invariance and the full Jacobian, including off-diagonal terms.
def softmax(z):
    q=np.exp(z-np.max(z))
    return q/q.sum()
logits=np.array([2.,1.,0.])
p=softmax(logits)
np.testing.assert_allclose(p,softmax(logits+1000))
jac=np.diag(p)-np.outer(p,p)
numerical=np.column_stack([(softmax(logits+eps*np.eye(3)[j])-softmax(logits-eps*np.eye(3)[j]))/(2*eps) for j in range(3)])
np.testing.assert_allclose(jac,numerical,atol=1e-10)
results["softmax"]={"logits":logits.tolist(),"probabilities":p.tolist(),"loss_class_1":float(-np.log(p[0]))}

# The SwiGLU coordinate example and derivatives through BOTH branches.
g=np.array([-1.,0.,2.]); v=np.array([2.,-3.,.5])
h=swish(g)*v
np.testing.assert_allclose((swish(g+eps)*v-swish(g-eps)*v)/(2*eps),dswish(g)*v,atol=1e-9)
np.testing.assert_allclose((swish(g)*(v+eps)-swish(g)*(v-eps))/(2*eps),swish(g),atol=1e-9)
results["swiglu"]={"g":g.tolist(),"v":v.tolist(),"silu_g":swish(g).tolist(),"h":h.tolist()}
assert 2*768*3072==3*768*2048==4718592
rng=np.random.default_rng(7)
x=rng.normal(size=(2,3,4)); wg=rng.normal(size=(4,6)); wu=rng.normal(size=(4,6)); wd=rng.normal(size=(6,4))
vectorized=(swish(x@wg)*(x@wu))@wd
coordinate=np.empty_like(x)
for b in range(2):
    for t in range(3):
        coordinate[b,t]=swish(x[b,t]@wg)*(x[b,t]@wu) @ wd
np.testing.assert_allclose(vectorized,coordinate)
results["design"]={"inputs":[-1,0,1],"outputs":designed(z).tolist(),"slopes":ddesigned(z).tolist()}
(OUT/"values.json").write_text(json.dumps(results,indent=2)+"\n")
print("Verified 11 activation derivatives, 12 design settings, softmax Jacobian, and SwiGLU shapes/gradients/budget.")
print("Generated six original curve figures and assets/values.json; no training results are claimed.")
