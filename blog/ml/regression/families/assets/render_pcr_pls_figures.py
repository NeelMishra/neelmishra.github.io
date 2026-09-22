"""Reproduce the PCR/PLS article's geometry and held-out projection figures.

Requires Python 3, NumPy, Matplotlib, and scikit-learn.
Run: python render_pcr_pls_figures.py [--preview-dir /tmp/pcr-pls-preview]
Manual SVD/covariance fits are checked against scikit-learn estimators.
"""
from pathlib import Path
import argparse
import numpy as np
from sklearn.cross_decomposition import PLSRegression
from sklearn.decomposition import PCA
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--preview-dir', type=Path)
args = parser.parse_args()
HERE = Path(__file__).resolve().parent
X = np.array([[-6,1],[-4,-1],[-2,0],[2,0],[4,-1],[6,1.]], dtype=float)
y = 2*X[:,1]
X_test = np.array([[-5,-.5],[-1,1],[1,-1],[5,.5]])
y_test = 2*X_test[:,1]
center, response_center = X.mean(axis=0), y.mean()
Xc, yc = X-center, y-response_center
np.testing.assert_allclose(Xc.T@Xc, [[112,0],[0,4]])
np.testing.assert_allclose(Xc.T@yc, [0,8])
_, singular_values, Vt = np.linalg.svd(Xc, full_matrices=False)
pc1 = Vt[0].copy()
if pc1[np.argmax(abs(pc1))]<0: pc1 *= -1
pls1 = Xc.T@yc
pls1 /= np.linalg.norm(pls1)
manual = {}
for name, direction in [('PCR 1',pc1),('PLS 1',pls1)]:
    score = Xc@direction
    coefficient = (score@yc)/(score@score)
    prediction = (X_test-center)@direction*coefficient+response_center
    manual[name] = prediction
    print(f'{name}: direction={direction}, coefficient={coefficient}, predictions={prediction}')
models = {
    'PCR 1': make_pipeline(PCA(n_components=1), LinearRegression()),
    'PLS 1': PLSRegression(n_components=1, scale=False),
    'PCR 2': make_pipeline(PCA(n_components=2), LinearRegression()),
}
for name, model in models.items():
    model.fit(X,y)
    prediction = np.asarray(model.predict(X_test)).ravel()
    expected = manual[name] if name in manual else y_test
    np.testing.assert_allclose(prediction, expected, atol=1e-12)
    mse = np.mean((prediction-y_test)**2)
    np.testing.assert_allclose(mse, 2.5 if name=='PCR 1' else 0, atol=1e-12)
    print(f'{name}: held-out MSE={mse:.12f}')
# Response-blind variance selection is no longer unique after unit-variance scaling.
scaled = Xc/Xc.std(axis=0)
np.testing.assert_allclose(scaled.T@scaled, 6*np.eye(2), atol=1e-12)
# Both one-component methods recover a signal entirely in x1.
for model in [make_pipeline(PCA(n_components=1), LinearRegression()), PLSRegression(n_components=1,scale=False)]:
    model.fit(X, X[:,0])
    np.testing.assert_allclose(np.asarray(model.predict(X_test)).ravel(), X_test[:,0], atol=1e-12)
explained = singular_values[0]**2 / np.sum(singular_values**2)
np.testing.assert_allclose(explained, 112/116, atol=1e-14)
print(f'PC1 predictor variation={explained*100:.9f}%; scaling and alternative-response checks passed.')

INK, MUTED, BLUE, ORANGE, PURPLE = '#182536', '#536475', '#176b93', '#b44a24', '#7853a6'
plt.rcParams.update({
    'font.family': ['DejaVu Sans','Arial','sans-serif'], 'font.size':17,
    'text.color':INK, 'axes.labelcolor':INK, 'xtick.color':MUTED,
    'ytick.color':MUTED, 'axes.edgecolor':'#b7c3cd',
    'axes.spines.top':False, 'axes.spines.right':False,
    'svg.fonttype':'none', 'svg.hashsalt':'pcr-pls-geometry-v1',
    'figure.facecolor':'white', 'axes.facecolor':'white',
})


def save(fig, name, description):
    path = HERE/f'{name}.svg'
    fig.savefig(path, metadata={'Title':name.replace('-',' ').title(),
        'Description':description,'Creator':'render_pcr_pls_figures.py','Date':None})
    path.write_text('\n'.join(line.rstrip() for line in path.read_text().splitlines())+'\n')
    if args.preview_dir:
        args.preview_dir.mkdir(parents=True,exist_ok=True)
        fig.savefig(args.preview_dir/f'{name}.png',dpi=150)
    plt.close(fig)


fig, ax = plt.subplots(figsize=(4.4,3.8),layout='constrained')
for value, marker, color in [(-2,'v',PURPLE),(0,'s',MUTED),(2,'o',ORANGE)]:
    sel = y==value
    ax.scatter(X[sel,0],X[sel,1],marker=marker,color=color,s=80,label=f'y = {value:g}',zorder=5)
ax.axhline(0,color='#bdc7ce',lw=1)
ax.axvline(0,color='#bdc7ce',lw=1)
ax.annotate('',xy=(5.3,0),xytext=(0,0),arrowprops={'arrowstyle':'->','lw':2.5,'color':BLUE})
ax.annotate('',xy=(0,1.95),xytext=(0,0),arrowprops={'arrowstyle':'->','lw':2.5,'color':'#087f6d'})
ax.text(.6,-1.7,'PC1',fontsize=17,color=BLUE)
ax.text(.35,1.45,'PLS1',fontsize=17,color='#087f6d')
ax.set(xlim=(-7,7),ylim=(-2.2,2.3),xlabel='Predictor x₁',ylabel='Predictor x₂',
       xticks=[-6,-3,0,3,6],yticks=[-2,0,2])
ax.set_aspect('equal',adjustable='box')
ax.set_title('Wide in x₁,\npredictive in x₂',loc='left',fontsize=18,fontweight='bold',pad=49)
ax.legend(loc='lower left',bbox_to_anchor=(0,1.02),ncol=3,frameon=False,
          fontsize=15,columnspacing=.5,handletextpad=.2,borderaxespad=0,handlelength=.8)
ax.grid(alpha=.15)
save(fig,'pcr-pls-predictor-geometry','Six centered training points with response 2*x2. PC1 is x1 and contains 96.55 percent of predictor variation; PLS1 is x2. Axes use equal units.')

fig, axes = plt.subplots(2,1,figsize=(4.4,7.5),layout='constrained',sharey=True)
for ax,name,direction,limits,label in [
    (axes[0],'PCR',pc1,(-6,6),'PC1 score (x₁)'),
    (axes[1],'PLS',pls1,(-1.2,1.2),'PLS1 score (x₂)'),
]:
    train_score = Xc@direction
    coefficient = (train_score@yc)/(train_score@train_score)
    test_score = (X_test-center)@direction
    predicted = manual[name+' 1']
    grid = np.linspace(*limits,101)
    ax.plot(grid,grid*coefficient+response_center,color=BLUE,lw=2.8,label='Fitted line')
    ax.scatter(test_score,y_test,s=65,color=ORANGE,edgecolors='white',linewidths=.6,zorder=4,label='New outcome')
    for score,truth,pred in zip(test_score,y_test,predicted):
        ax.plot([score,score],[truth,pred],color=MUTED,ls=':',lw=1.5,zorder=1)
    ax.set(xlim=limits,ylim=(-2.6,4.6),xlabel=label,ylabel='Response y',yticks=[-2,0,2,4])
    ax.set_title(f'{name}: one component\nMSE = {np.mean((y_test-predicted)**2):.2f}',loc='left',fontsize=18,fontweight='bold',pad=12)
    ax.legend(loc='upper left',fontsize=16,frameon=False)
    ax.set_xticks([-6,0,6] if name=='PCR' else [-1,0,1])
    ax.grid(axis='y',alpha=.2)
save(fig,'pcr-pls-held-out-projections','Four unused rows projected with fitted PCR and PLS directions. PCR predicts zero and has MSE 2.5; PLS predicts 2*x2 and has MSE zero.')
