"""Build the MATLAB model inputs for the Mindanao River Basin TDS model.

Steps (as used in the paper):
 1. Reproject the ALOS AW3D30 DEM (OpenTopography) to 90 m UTM 51N by averaging.
 2. Mask sea cells (<= 0 m, connected to the tile edge); burn OSM major rivers 20 m.
 3. Fill pits and depressions, resolve flats, D8 flow directions (pysheds).
 4. Delineate the basin at the Cotabato City outlet; link interior marsh sinks
    within 15 km to the nearest basin cell.
 5. Order basin cells by flow level; export down-index, level starts,
    ESA WorldCover 2021 class fractions and the observation cell indices.

Usage:
  python preprocess_inputs.py DEM.tif OSM_waterways.shp WORLDCOVER.tif observed_TDS_points.csv OUTDIR
Requires: numpy, scipy, rasterio, pysheds, pyproj, geopandas, numba, pandas.
"""
import sys, os
import numpy as np, pandas as pd, rasterio, geopandas as gpd, numba
from rasterio.warp import calculate_default_transform, reproject, Resampling
from rasterio.features import rasterize
from rasterio.windows import from_bounds, Window
from affine import Affine
from scipy import ndimage
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import breadth_first_order
from scipy.spatial import cKDTree
from pyproj import Transformer

if not hasattr(np, "in1d"):  # pysheds 0.5 with numpy 2
    np.in1d = lambda a, b, **k: np.isin(a, b, **k).ravel()
from pysheds.grid import Grid

DEM, OSM, WC, OBS, OUT = sys.argv[1:6]
os.makedirs(OUT, exist_ok=True)
tmp = os.path.join(OUT, "_tmp"); os.makedirs(tmp, exist_ok=True)
DIRS = {64: (-1, 0), 128: (-1, 1), 1: (0, 1), 2: (1, 1), 4: (1, 0), 8: (1, -1), 16: (0, -1), 32: (-1, -1)}

# 1. reproject
with rasterio.open(DEM) as s:
    tr, W, H = calculate_default_transform(s.crs, "EPSG:32651", s.width, s.height, *s.bounds, resolution=90)
    dem = np.full((H, W), -32768, np.float32)
    reproject(rasterio.band(s, 1), dem, src_transform=s.transform, src_crs=s.crs, dst_transform=tr,
              dst_crs="EPSG:32651", resampling=Resampling.average, dst_nodata=-32768)
prof = dict(driver="GTiff", height=H, width=W, count=1, dtype="float32", crs="EPSG:32651", transform=tr, nodata=-32768)

# 2. sea mask and river burning
sea = (dem <= 0) | (dem == -32768)
lab, _ = ndimage.label(sea)
edge = np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]]); edge = edge[edge > 0]
seamask = np.isin(lab, edge)
dem[seamask] = -32768
riv = gpd.read_file(OSM).set_crs(4326, allow_override=True).to_crs(32651)
riv = riv[riv.waterway == "river"]
rv = rasterize(((g, 1) for g in riv.geometry), out_shape=(H, W), transform=tr, fill=0, all_touched=True, dtype="uint8")
burn = dem.copy(); burn[(rv == 1) & (dem > -32768)] -= 20.0
p = os.path.join(tmp, "dem_burn.tif")
with rasterio.open(p, "w", **prof) as d: d.write(burn, 1)

# 3. conditioning and D8
grid = Grid.from_raster(p); g = grid.read_raster(p)
infl = grid.resolve_flats(grid.fill_depressions(grid.fill_pits(g)))
F = np.asarray(grid.flowdir(infl)); A = np.asarray(grid.accumulation(grid.flowdir(infl)))
N = H * W; idx = np.arange(N).reshape(H, W)
down = np.full(N, -1, np.int64)
for d_, (dr, dc) in DIRS.items():
    rr, cc = np.nonzero(F == d_); r2, c2 = rr + dr, cc + dc
    ok = (r2 >= 0) & (r2 < H) & (c2 >= 0) & (c2 < W)
    down[idx[rr[ok], cc[ok]]] = idx[r2[ok], c2[ok]]

# 4. outlet: last land cell on the path from Datu Piang to the sea
T = Transformer.from_crs(4326, 32651, always_xy=True)
def rc(lon, lat):
    x, y = T.transform(lon, lat); c, r = ~tr * (x, y); return int(r), int(c)
land = dem > -32768
r, c = rc(124.507, 7.029); i = idx[r, c]
while land.ravel()[i] and down[i] >= 0: last = i; i = down[i]
outlet = last
def basin(dn):
    s = np.nonzero(dn >= 0)[0]
    Gm = csr_matrix((np.ones(len(s), np.int8), (dn[s], s)), shape=(N, N))
    m = np.zeros(N, bool); m[breadth_first_order(Gm, outlet, directed=True, return_predecessors=False)] = True
    return m
catch = basin(down)
term = np.nonzero((down < 0) & land.ravel() & (A.ravel() * 0.0081 > 20))[0]
ci = np.nonzero(catch)[0]; tree = cKDTree(np.c_[np.divmod(ci, W)])
for t in term:
    tr_, tc_ = divmod(t, W)
    if catch[t] or seamask[max(tr_ - 2, 0):tr_ + 3, max(tc_ - 2, 0):tc_ + 3].any(): continue
    dist, j = tree.query([tr_, tc_])
    if dist * 0.09 < 15: down[t] = ci[j]
catch = basin(down)
print("basin km2", catch.sum() * 0.0081)

# 5. flow levels (Kahn generations) and exports
ib = np.nonzero(catch)[0]; indeg = np.zeros(N, np.int32)
d_in = down[ib]; np.add.at(indeg, d_in[d_in >= 0], 1)
level = ib[indeg[ib] == 0]; topo = []; starts = []; k = 0
while len(level):
    starts.append(k + 1); topo.append(level); k += len(level)
    dn = down[level]; dn = dn[dn >= 0]; dn = dn[catch[dn]]
    np.subtract.at(indeg, dn, 1); u = np.unique(dn); level = u[indeg[u] == 0]
topo = np.concatenate(topo); pos = np.zeros(N, np.int64); pos[topo] = np.arange(1, len(topo) + 1)
dn = down[topo]; dn_pos = np.where(dn >= 0, pos[np.maximum(dn, 0)], 0).astype(np.int32)

groups = {"tree": [10, 95], "crop": [40], "built": [50], "grass": [20, 30, 60, 100], "water": [80, 90]}
B = 9; fr = {}
with rasterio.open(WC) as s:
    win = from_bounds(124.10, 6.00, 125.50, 8.62, s.transform).round_offsets().round_lengths()
    r0, c0 = int(win.row_off), int(win.col_off); nr, nc = int(win.height) // B * B, int(win.width) // B * B
    fr = {k_: np.zeros((nr // B, nc // B), np.float32) for k_ in groups}
    for rs in range(0, nr, B * 250):
        h = min(B * 250, nr - rs); a = s.read(1, window=Window(c0, r0 + rs, nc, h))
        for k_, v in groups.items():
            fr[k_][rs // B:(rs + h) // B] = np.isin(a, v).astype(np.float32).reshape(h // B, B, nc // B, B).mean(axis=(1, 3))
    gtr = s.transform * Affine.translation(c0, r0) * Affine.scale(B)
Fm = np.zeros((H, W, 5), np.float32)
for j, k_ in enumerate(groups):
    reproject(fr[k_], Fm[:, :, j], src_transform=gtr, src_crs="EPSG:4326", dst_transform=tr,
              dst_crs="EPSG:32651", resampling=Resampling.bilinear)
s_ = Fm.sum(-1, keepdims=True); Fm = np.where(s_ > 0, Fm / np.maximum(s_, 1e-9), 0)

dn_pos.tofile(os.path.join(OUT, "down_index_int32.bin"))
np.array(starts, np.int32).tofile(os.path.join(OUT, "level_starts_int32.bin"))
Fm.reshape(-1, 5)[topo].T.copy().tofile(os.path.join(OUT, "landcover_frac_float32.bin"))
obs = pd.read_csv(OBS); obs = obs[obs["use"]]
obs["cell_index"] = pos[obs["row"].values * W + obs["col"].values]
obs[["site", "river", "TDS_used", "cell_index"]].to_csv(os.path.join(OUT, "observations.csv"), index=False)
np.save(os.path.join(OUT, "model_cells_rowmajor.npy"), topo)
print("done:", len(topo), "cells,", len(starts), "levels")
