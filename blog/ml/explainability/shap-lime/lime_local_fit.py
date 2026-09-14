"""A reproducible illustration of LIME's local weighted-regression idea.
Requires NumPy and Matplotlib. It does not call the LIME package or mimic all defaults.
Run: python lime_local_fit.py
Writes assets/lime-local-fit.json, CSV, and 27 standalone SVG plots.
"""
from pathlib import Path
import csv
import json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt


def model(x):
    """Constructed score; x is measured in hours. Sine's argument is dimensionless."""
    return 2.2 + 0.55*x + 0.55*np.sin(1.1*x)


def fit(x0, width, sample):
    if sample == 'grid':
        other = np.linspace(0, 10, 21)
    else:
        other = np.random.default_rng(int(sample)).uniform(0, 10, 24)
    x = np.r_[x0, other[~np.isclose(other,x0)]]
    y = model(x)
    weights = np.exp(-0.5*((x-x0)/width)**2)
    design = np.c_[np.ones(len(x)), x-x0]
    scale = np.sqrt(weights)
    coefficients, _, rank, _ = np.linalg.lstsq(design*scale[:,None], y*scale, rcond=None)
    assert rank == 2
    at_row, slope = coefficients
    fitted = design@coefficients
    error = np.sqrt(np.average((fitted-y)**2, weights=weights))
    # Same independent probe interval for every width and sample design.
    probe = np.linspace(max(0,x0-0.5), min(10,x0+0.5), 101)
    probe_error = np.sqrt(np.mean((at_row+slope*(probe-x0)-model(probe))**2))
    key = f'x{int(x0*10)}-w{int(width*100)}-{sample}'
    return dict(key=key, x0=x0, width=width, sample=sample,
                x=x.tolist(), y=y.tolist(), weights=weights.tolist(), fitted=fitted.tolist(),
                at_row=float(at_row), slope=float(slope), prediction=float(model(x0)),
                row_error=float(at_row-model(x0)), train_rmse=float(error),
                probe_rmse=float(probe_error), probe=probe.tolist(),
                image=f'assets/lime-{key}.svg')


def examples():
    return [fit(x0,width,sample) for x0 in (2.8,5.3,7.5)
            for width in (0.35,1.0,2.5) for sample in ('grid','7','29')]


def plot(row, folder):
    plt.rcParams.update({'font.family':'sans-serif','font.sans-serif':['Arial','DejaVu Sans'],'font.size':14.5,'svg.fonttype':'none'})
    fig, ax = plt.subplots(figsize=(4.8,4.4), layout='constrained')
    xs = np.linspace(0,10,401)
    ax.plot(xs,model(xs),color='#256b50',lw=2.2,label='Fixed model')
    # Marker area is proportional to the regression weight.
    ax.scatter(row['x'],row['y'],s=120*np.array(row['weights']),color='#386fa4',alpha=.75,label='Weighted samples',zorder=3)
    local = np.linspace(max(0,row['x0']-2*row['width']),min(10,row['x0']+2*row['width']),101)
    ax.plot(local,row['at_row']+row['slope']*(local-row['x0']),color='#b7771a',ls='--',lw=2.3,label='Fitted line')
    ax.axvline(row['x0'],color='#839386',lw=1,ls=':')
    ax.scatter([row['x0']],[row['prediction']],marker='*',s=130,color='#8b4c2c',label='Explained row',zorder=5)
    ax.set(xlim=(0,10),ylim=(1.7,8.2),xlabel='Input x (hours)',ylabel='Model score')
    ax.set_title(f"x = {row['x0']:.1f} h; width = {row['width']:g} h",fontsize=14)
    ax.grid(alpha=.16);ax.legend(loc='upper left',fontsize=12,framealpha=.95)
    fig.savefig(folder/Path(row['image']).name,metadata={'Date':None})
    plt.close(fig)


if __name__ == '__main__':
    folder = Path(__file__).resolve().parent/'assets'
    folder.mkdir(exist_ok=True)
    rows = examples()
    (folder/'lime-local-fit.json').write_text(json.dumps(rows,indent=2)+'\n')
    with (folder/'lime-local-fit.csv').open('w',newline='') as handle:
        fields = ['x0','width','sample','prediction','at_row','slope','row_error','train_rmse','probe_rmse']
        writer = csv.DictWriter(handle,fieldnames=fields)
        writer.writeheader();writer.writerows({k:row[k] for k in fields} for row in rows)
    for row in rows:
        plot(row,folder)
