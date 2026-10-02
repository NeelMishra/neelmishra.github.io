"""Small shared helpers for the runnable A Data Odyssey companion examples."""
import hashlib
import io
import json
from pathlib import Path
import zipfile

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import requests

ASSETS = Path(__file__).resolve().parent / 'assets'
ASSETS.mkdir(exist_ok=True)
SEED = 42


def uci_member(dataset, member):
    """Download a UCI archive to memory; never leave raw datasets in the repo."""
    url = f'https://archive.ics.uci.edu/static/public/{dataset}.zip'
    response = requests.get(url, timeout=120)
    response.raise_for_status()
    content = response.content
    with zipfile.ZipFile(io.BytesIO(content)) as archive:
        return io.BytesIO(archive.read(member)), {
            'url': url, 'sha256': hashlib.sha256(content).hexdigest(), 'member': member
        }


def abalone():
    data, source = uci_member('1/abalone', 'abalone.data')
    columns = ['Sex', 'Length', 'Diameter', 'Height', 'Whole weight',
               'Shucked weight', 'Viscera weight', 'Shell weight', 'Rings']
    frame = pd.read_csv(data, names=columns)
    X = pd.get_dummies(frame.drop(columns=['Rings', 'Diameter', 'Whole weight']),
                       columns=['Sex'], dtype=float)
    return X.astype(float), frame['Rings'], source


def save_plot(name):
    fig = plt.gcf()
    fig.savefig(ASSETS / f'{name}.png', dpi=155, bbox_inches='tight', facecolor='white')
    plt.close('all')


def save_json(name, data):
    def convert(value):
        if isinstance(value, np.ndarray): return value.tolist()
        if isinstance(value, np.generic): return value.item()
        raise TypeError(type(value).__name__)
    (ASSETS / f'{name}.json').write_text(json.dumps(data, indent=2, default=convert) + '\n')


def versions():
    from importlib.metadata import version
    return {name: version(name) for name in
            ['numpy', 'pandas', 'scikit-learn', 'shap', 'xgboost', 'catboost', 'matplotlib']}
