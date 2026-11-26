"""Test extra layers (elevation, slope, Mt Apo volcanic proximity) added to the selected
structure (uniform background + population), with the same three tests as run_tds_model.m:
independent test (fit on 16, predict 6), leave-one-site-out, leave-one-river-out.

Each layer v enters as a flow-weighted upstream mean, sum(runoff * v) / sum(runoff), with an
unconstrained coefficient; background and population coefficients are non-negative.
Mt Apo summit: 6.98750 N, 125.27083 E.  Output: outputs/layer_screening_rerun.csv (the committed layer_screening.csv also lists the null model and coefficients)

Inputs (from preprocess_inputs.py / prepare_population.py, in model-cell order):
inputs/down_index_int32.bin, inputs/landcover_frac_float32.bin, inputs/population_float32.bin,
inputs/observations.csv, plus per-cell elevation (m), slope (deg) and x, y (UTM 51N, m)
in inputs/cell_terrain.npz (arrays elev, slope, x, y, lith).
"""
import gzip, os
import numpy as np, pandas as pd
from scipy.optimize import lsq_linear
from pyproj import Transformer

def load(name, dt):
    if not os.path.exists(name):
        with gzip.open(name + '.gz', 'rb') as f: return np.frombuffer(f.read(), dt)
    return np.fromfile(name, dt)
down = load('inputs/down_index_int32.bin', np.int32).astype(np.int64)   # 1-based, 0 = outlet
n = down.size
F = load('inputs/landcover_frac_float32.bin', np.float32).reshape(5, n).T
P = load('inputs/population_float32.bin', np.float32).astype(float)
t = np.load('inputs/cell_terrain.npz')
obs = pd.read_csv('inputs/observations.csv')
r0 = np.array([0.20, 0.35, 0.80, 0.30, 0.50])

def route(w):                       # cells are ordered upstream -> downstream
    a = w.astype(float).copy()
    for i in range(n):
        j = down[i]
        if j > 0: a[j - 1] += a[i]
    return a

q = F @ r0; Q = route(q); Pr = route(P)
ax, ay = Transformer.from_crs(4326, 32651, always_xy=True).transform(125.27083, 6.98750)
dkm = np.hypot(t['x'] - ax, t['y'] - ay) / 1000
layers = {'Mt Apo within 15 km': (dkm <= 15) * 1.0, 'Mt Apo within 25 km': (dkm <= 25) * 1.0,
          'Mt Apo proximity exp(-d/20 km)': np.exp(-dkm / 20), 'Elevation (km)': t['elev'] / 1000,
          'Slope (deg/10)': t['slope'] / 10}
# lithology groups rasterized from USGS geo3bl (OFR 97-470-F): 1 young volcanic (Q/NQ volcanic),
# 2 older volcanic/intrusive, 3 Quaternary sediments, 4 Tertiary sedimentary, 5 pre-Tertiary basement
LN = {1: 'Young volcanic', 2: 'Older volcanic/intrusive', 3: 'Quaternary sediments', 4: 'Tertiary sedimentary', 5: 'Pre-Tertiary basement'}
for k, v in LN.items(): layers['Lithology: ' + v] = (t['lith'] == k) * 1.0
cid = obs.cell_index.values.astype(int) - 1
y = obs.TDS_used.values.astype(float); grp = obs.river.values; tst = (obs.set == 'independent test').values
Xp = Pr[cid] / Q[cid] / 1000

def evaluate(extra):
    X = np.column_stack([np.ones(len(y)), Xp] + [route(q * layers[e])[cid] / Q[cid] for e in extra])
    k = len(extra); bnd = ([0, 0] + [-np.inf] * k, [np.inf] * (2 + k))
    fit = lambda m: lsq_linear(X[m], y[m], bounds=bnd).x
    res = {'test_rmse': np.sqrt(((X[tst] @ fit(~tst) - y[tst]) ** 2).mean())}
    for name, g in [('loo_rmse', np.arange(len(y))), ('loro_rmse', grp)]:
        pr = np.zeros(len(y))
        for gg in np.unique(g):
            m = g == gg; pr[m] = X[m] @ fit(~m)
        res[name] = np.sqrt(((pr - y) ** 2).mean())
    return res

rows = [dict(model='Uniform + population', **evaluate([]))]
rows += [dict(model='Uniform + population + ' + k, **evaluate([k])) for k in layers]
pd.DataFrame(rows).round(1).to_csv('outputs/layer_screening_rerun.csv', index=False)
print(pd.DataFrame(rows).round(1).to_string(index=False))
