# Mindanao River Basin TDS model, v2 (MATLAB / GNU Octave)

Routed mass-balance model of total dissolved solids (TDS) for the Mindanao River
Basin, Philippines. It routes runoff, land-cover solute loads and population loads
down a 90 m D8 flow network built from the ALOS AW3D30 DEM, fits source terms to
22 published TDS observations, and tests five model structures against a null model.

## What changed from v1

- 6 independent literature sites added (Kulaman–Tinanan, Mt Apo rivers, Cotabato City 2022): 22 sites on 7 river systems.
- Population load term from WorldPop 2020 (5.164 million people in the basin).
- Three tests: independent test (fit on 16, predict 6), leave-one-site-out, leave-one-river-out.
- Bootstrap (2000 refits) and Monte Carlo on runoff coefficients (±50 %, 200 draws).
- Scenarios S1–S5 (forest→crop, built-up ×2, crop→forest, population +50 %, S1+S4), also run under every structure.

**Main result:** no structure predicts held-out sites better than the training mean
(LORO RMSE 54.1 mg/L for the best structure vs. 52.5 mg/L for the null). The data
cannot resolve land-cover effects; population is the only consistently positive term,
but its 95 % interval includes zero.

## Run

In MATLAB (R2016b or later, no toolboxes) or GNU Octave (6 or later), from this folder:

```matlab
run_tds_model          % about 8-9 min in Octave (most of it the Monte Carlo)
scenario_by_structure  % about 15 s
```

Compressed inputs (`*.bin.gz`) are unpacked automatically on the first run.
(GNU Octave from conda may need `OCTAVE_HOME` set to the environment prefix.)

## Files

| File | What it does |
|---|---|
| `run_tds_model.m` | Model comparison, selected model, bootstrap, Monte Carlo, apportionment, scenarios, outputs |
| `scenario_by_structure.m` | Scenarios S1–S5 under all five structures |
| `tds_route.m` | Routes water, class loads and any extra load (population) down the network, level by level |
| `cv_predict.m` | Cross-validated NNLS predictions for any grouping (site or river) |
| `spearman_simple.m`, `prctile_simple.m`, `rmse_simple.m` | Toolbox-free helpers |
| `inputs/down_index_int32.bin` | Downstream cell of each model cell (0 = outlet), cells ordered upstream to downstream |
| `inputs/level_starts_int32.bin` | First cell of each flow level |
| `inputs/landcover_frac_float32.bin` | n × 5 land-cover fractions (tree, cropland, built-up, grass/shrub/bare, water/wetland), ESA WorldCover 2021 |
| `inputs/population_float32.bin` | People per 90 m cell, WorldPop 2020 |
| `inputs/observations.csv` | 22 sites: TDS (mg/L), model cell index, set (calibration / independent test) |
| `preprocess_inputs.py` | Builds the flow network and land-cover inputs from the DEM, OSM rivers and WorldCover |
| `prepare_population.py` | Builds the population input from WorldPop 2020 |

## Model

For each cell, runoff = Σ_k f_k r_k, land load = Σ_k f_k r_k c_k and population load = β P.
Runoff coefficients r = [0.20 0.35 0.80 0.30 0.50]. Water and loads are summed down the
network and TDS = routed load / routed water. c_k and β are fitted by non-negative least squares.

## Outputs

`model_comparison.csv`, `independent_test_predictions.csv`, `selected_model.csv`,
`site_predictions.csv`, `outlet_apportionment.csv`, `scenario_summary.csv`,
`scenario_by_structure.csv`, `monte_carlo_runoff.csv`, and float32 grids in model-cell
order (`TDS_current`, `TDS_population_part`, `TDS_scenarios`; not committed, rebuilt by the run).
GeoTIFF versions are in `../geotiff/`.

Authors: Peter Dominic C. Montero and Jay M. Navaluna, University of Southern Mindanao.
