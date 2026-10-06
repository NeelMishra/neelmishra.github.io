"""Check the expanded RoPE guide's mathematics and generate its original figure.

Requires NumPy and Matplotlib. Run from a repository checkout:
python rope_math_examples.py
The shared transformer_math_lab.py must be alongside this file.
"""
from pathlib import Path

import numpy as np

from transformer_math_lab import rotation


OUT = Path(__file__).resolve().parent.parent / "figures"


def rotate_pairs(x, position, frequencies):
    # x: [..., 2*r], with adjacent coordinates forming pairs
    pairs = x.reshape(*x.shape[:-1], -1, 2)
    angle = position * frequencies
    a, b = pairs[..., 0], pairs[..., 1]
    out = np.stack([a*np.cos(angle) - b*np.sin(angle),
                    a*np.sin(angle) + b*np.cos(angle)], axis=-1)
    return out.reshape(x.shape)


def rotate_split_half(x, position, frequencies):
    half = x.shape[-1]//2
    angle = position*frequencies
    a, b = x[..., :half], x[..., half:]
    return np.concatenate([a*np.cos(angle)-b*np.sin(angle),
                           a*np.sin(angle)+b*np.cos(angle)],axis=-1)


def main():
    q, k = np.array([2.,1.]), np.array([1.,3.])
    frequency = np.pi/4
    q1, k3 = rotation(frequency)@q, rotation(3*frequency)@k
    q6, k8 = rotation(6*frequency)@q, rotation(8*frequency)@k
    np.testing.assert_allclose(q1,[np.sqrt(2)/2,3*np.sqrt(2)/2])
    np.testing.assert_allclose(k3,[-2*np.sqrt(2),-np.sqrt(2)])
    np.testing.assert_allclose(q6,[1,-2],atol=1e-12)
    np.testing.assert_allclose(k8,[1,3],atol=1e-12)
    np.testing.assert_allclose([q1@k3,q6@k8],[-5,-5])
    np.testing.assert_allclose([np.linalg.norm(q1),np.linalg.norm(k3)],
                               [np.linalg.norm(q),np.linalg.norm(k)])

    omega = 10000.0**(-np.arange(0,4,2)/4)
    x = np.array([1.,2.,3.,4.])
    np.testing.assert_allclose(rotate_pairs(x,2,omega),
        [-2.234741690198506,.0770037537313969,2.919405353226401,4.05919602674631])
    permutation = [0,2,1,3]
    np.testing.assert_allclose(
        rotate_split_half(x[permutation],2,omega)[permutation],
        rotate_pairs(x,2,omega),
    )
    rng = np.random.default_rng(81)
    queries, keys = rng.normal(size=(2,2,3,5,8))
    position_ids = np.array([[0,1,2,3,4],[7,8,9,10,11]])
    frequencies = 10000.0**(-np.arange(0,8,2)/8)
    position_view = position_ids[:,None,:,None]
    rotated_q = rotate_pairs(queries,position_view,frequencies)
    rotated_k = rotate_pairs(keys,position_view,frequencies)
    for batch in range(2):
        for head in range(3):
            for token in range(5):
                expected_q, expected_k = [], []
                for pair, f in enumerate(frequencies):
                    matrix = rotation(position_ids[batch,token]*f)
                    expected_q.extend(matrix@queries[batch,head,token,2*pair:2*pair+2])
                    expected_k.extend(matrix@keys[batch,head,token,2*pair:2*pair+2])
                np.testing.assert_allclose(rotated_q[batch,head,token],expected_q)
                np.testing.assert_allclose(rotated_k[batch,head,token],expected_k)
    np.testing.assert_allclose(np.sum(rotated_q**2,axis=-1),np.sum(queries**2,axis=-1))
    np.testing.assert_allclose(rotated_q@rotated_k.swapaxes(-1,-2),
        rotate_pairs(queries,position_view+23,frequencies)@
        rotate_pairs(keys,position_view+23,frequencies).swapaxes(-1,-2))

    partial = np.concatenate([
        rotate_pairs(queries[...,:4],position_view,omega),queries[...,4:]
    ],axis=-1)
    np.testing.assert_array_equal(partial[...,4:],queries[...,4:])
    np.testing.assert_allclose(np.sum(partial**2,axis=-1),np.sum(queries**2,axis=-1))
    np.testing.assert_allclose(
        rotation(.7).T@rotation(2.3),rotation(1.6),atol=1e-12
    )
    np.testing.assert_allclose(rotation(1.2).T@rotation(1.2),np.eye(2),atol=1e-12)

    next_position = position_ids[:,-1:][:,None,:,None]
    cached_keys = rotate_pairs(keys[:,:,:4],position_view[:,:,:4],frequencies)
    next_query = rotate_pairs(queries[:,:,4:],next_position,frequencies)
    cached_scores = next_query@cached_keys.swapaxes(-1,-2)
    full_scores = rotated_q[:,:,4:]@rotated_k[:,:,:4].swapaxes(-1,-2)
    np.testing.assert_allclose(cached_scores,full_scores)
    for shift in (-2,1,7):
        shifted_q = rotation((1+shift)*frequency)@q
        shifted_k = rotation((3+shift)*frequency)@k
        np.testing.assert_allclose(shifted_q@shifted_k,-5,atol=1e-12)
    for scale in (2,4):
        np.testing.assert_allclose(
            rotate_pairs(x,2/scale,omega),rotate_pairs(x,2,omega/scale)
        )
    assert 10000.0**0 == 1000000.0**0 == 1
    assert np.float16(2048) == np.float16(2049)
    assert np.float32(2**24) == np.float32(2**24+1)
    print("Verified rotations, relative scores, tensor broadcasting, pair layouts, partial RoPE, caching, and interpolation.")
    draw_figure(q1,k3,q6,k8)


def draw_figure(q1,k3,q6,k8):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    plt.rcParams.update({
        "font.family":["DejaVu Sans","sans-serif"],"font.size":12,
        "svg.fonttype":"none","svg.hashsalt":"rope-worked-20261006",
        "axes.spines.top":False,"axes.spines.right":False,
        "savefig.facecolor":"#fffaf2",
    })
    fig, axes = plt.subplots(2,1,figsize=(7.2,7.0),layout="constrained")
    for ax,query,key,title in [
        (axes[0],q1,k3,"Positions i = 1, j = 3: dot product = -5"),
        (axes[1],q6,k8,"Joint shift +5: i = 6, j = 8, dot product still -5"),
    ]:
        for vector,color,label in [(query,"#126650","rotated q"),(key,"#a45113","rotated k")]:
            ax.annotate("",xy=vector,xytext=(0,0),
                        arrowprops={"arrowstyle":"-|>","color":color,"lw":2})
            ax.text(vector[0]*1.08,vector[1]*1.08,label,color=color,
                    ha="center",va="center",fontsize=10)
        ax.axhline(0,color="#657369",lw=.7)
        ax.axvline(0,color="#657369",lw=.7)
        ax.set(xlim=(-3.8,3.8),ylim=(-3.8,3.8),xlabel="Coordinate 1",
               ylabel="Coordinate 2",title=title,aspect="equal")
        ax.grid(alpha=.15)
    OUT.mkdir(exist_ok=True)
    target=OUT/"rope-worked-rotation.svg"
    fig.savefig(target,format="svg",metadata={"Date":None})
    target.write_text("\n".join(line.rstrip() for line in target.read_text().splitlines())+"\n")
    plt.close(fig)


if __name__ == "__main__":
    main()
