"""Build inputs/population_float32.bin and update inputs/observations.csv.

WorldPop 2020 1 km (unconstrained, UN-unadjusted; phl_ppp_2020_1km_Aggregated_UNadj.tif)
is converted to people per m2, averaged onto the 90 m UTM 51N model grid and multiplied
by the 8100 m2 cell area, so totals are conserved (5.164 million people in the basin).
Run after preprocess_inputs.py, which writes the grid metadata and cell order used here.

usage: python prepare_population.py <worldpop.tif> <gridmeta.pkl> <model_cells_rowmajor.npy>
"""
import sys, pickle
import numpy as np, rasterio
from rasterio.warp import reproject, Resampling

src_tif, gridmeta, cells_npy = sys.argv[1:4]
meta = pickle.load(open(gridmeta, "rb")); tr = meta["transform"]; H, W = meta["shape"]
cells = np.load(cells_npy)                      # row-major grid index of each model cell, in model order
with rasterio.open(src_tif) as s:
    pop1 = s.read(1).astype(np.float64); pop1[(pop1 == s.nodata) | (pop1 < 0)] = 0
    a_src = abs(s.res[0] * s.res[1]) * 111320.0 ** 2 * np.cos(np.radians(7.2))   # m2 of a 30" cell at 7.2 N
    dens = np.zeros((H, W))
    reproject(pop1 / a_src, dens, src_transform=s.transform, src_crs=s.crs,
              dst_transform=tr, dst_crs="EPSG:32651", resampling=Resampling.average)
pop90 = dens * 8100.0
pop90.ravel()[cells].astype(np.float32).tofile("inputs/population_float32.bin")
print("basin population (millions):", round(float(pop90.ravel()[cells].sum()) / 1e6, 3))
