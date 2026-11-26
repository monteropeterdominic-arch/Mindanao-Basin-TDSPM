# Mindanao River Basin TDS model (MATLAB / GNU Octave)

Routed land-cover mass-balance model of total dissolved solids (TDS) for the
Mindanao River Basin, Philippines. It routes runoff and land-cover solute loads
down a 90 m D8 flow network built from the ALOS AW3D30 DEM, fits source
concentrations to published TDS observations, cross-validates against a null
model, and runs land-cover scenarios.

## Run

In MATLAB (R2016b or later, no toolboxes) or GNU Octave (6 or later), from this folder:

```matlab
run_tds_model
```

A full run takes about 20–30 s. Results are written to `outputs/`.
(GNU Octave from conda may need `OCTAVE_HOME` set to the environment prefix.)

## Files

| File | What it does |
|---|---|
| `run_tds_model.m` | Main script: model comparison, fitting, bootstrap, apportionment, scenarios, outputs |
| `tds_route.m` | Routes water and class loads down the network, level by level |
| `cv_predict.m` | Cross-validated NNLS predictions (leave-one-site-out or leave-one-river-out) |
| `spearman_simple.m`, `prctile_simple.m`, `rmse_simple.m` | Toolbox-free helpers |
| `inputs/down_index_int32.bin` | Downstream cell of each model cell (0 = outlet), cells ordered upstream to downstream |
| `inputs/level_starts_int32.bin` | First cell of each flow level |
| `inputs/landcover_frac_float32.bin` | n x 5 land-cover fractions (tree, cropland, built-up, grass/shrub/bare, water/wetland) from ESA WorldCover 2021 |
| `inputs/observations.csv` | 16 observed sites: TDS (mg/L) and model cell index |
| `preprocess_inputs.py` | Python script that builds the inputs from the DEM, OSM rivers and WorldCover |

## Model

For each cell, runoff = sum_k f_k r_k and load = sum_k f_k r_k c_k, with runoff
coefficients r = [0.20 0.35 0.80 0.30 0.50]. Water and loads are summed down
the network and TDS = routed load / routed water. Source concentrations c_k are
fitted by non-negative least squares. The selected model groups classes into
tree cover vs. non-tree.

## Outputs

`model_comparison.csv`, `selected_model.csv`, `site_predictions.csv`,
`leave_one_river_out_coefficients.csv`, `outlet_apportionment.csv`,
`scenario_summary.csv`, `evaporation_search.csv`, and float32 grids
(`TDS_current`, `TDS_scenarios`, `Q_relative`) in model-cell order.
GeoTIFF versions are in `../geotiff/`.

Authors: Peter Dominic C. Montero and Jay M. Navaluna, University of Southern Mindanao.
