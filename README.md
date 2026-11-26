# Mindanao Basin TDS Potential Model (TDSPM)

Testing land cover and population as drivers of river total dissolved solids (TDS) in the Mindanao River Basin, Philippines, with a routed mass-balance model and independent validation.

**Authors:** Peter Dominic C. Montero and Jay M. Navaluna (corresponding), Department of Civil Engineering, University of Southern Mindanao.

## What is here

| Folder | Contents |
|---|---|
| `matlab_model/` | Routed land-cover + population TDS model in MATLAB / GNU Octave (`run_tds_model.m`, `scenario_by_structure.m`), its inputs, and the Python scripts that build them from the DEM, OSM rivers, ESA WorldCover and WorldPop |
| `matlab_model/outputs/` | Model comparison, independent-test predictions, fitted terms, Monte Carlo draws, apportionment and scenario tables |
| `data/` | `observed_TDS_points.csv` (22 published TDS sites used + 1 excluded, with sources, coordinates and calibration/test set) and `proposed_sampling_sites.csv` (30 proposed validation sites) |
| `geotiff/` | Simulated TDS, population part of TDS, scenario changes S1–S5, population density, terrain index, basin mask, flow accumulation and tree cover (EPSG:32651, 90 m) |
| `figures/` | Figures, including the 3D terrain view (`fig8_3d_terrain_TDS.png`); `fig3_terrain_index_baseline.png` is the v1 baseline index |
| `paper/ieee_v2/` | Current manuscript in IEEE conference format (LaTeX source, PDF and figures) |
| `paper/v1_mdpi_draft/` | Earlier 16-site draft (superseded) |

## Main results (v2, 22 sites on 7 rivers)

- Basin delineated from ALOS AW3D30: 20,583 km²; 5.16 million people (WorldPop 2020).
- No model structure predicted held-out sites better than the training mean: leave-one-river-out RMSE 54.1 mg/L for the best structure (uniform land background + population) vs. 52.5 mg/L for the null model.
- All structures under-predicted the 6 independent sites by 45–68 mg/L, most strongly on Mt Apo (observed 300 mg/L, predicted 107–116 mg/L): between-river differences, probably geological, dominate.
- Population +50 % raises simulated outlet TDS by 7.3 mg/L (95 % interval 0.0–29.6); the population term is positive in 3 of the 4 structures that include it.
- The simulated effect of converting 20 % of forest to cropland depends on model structure (−1.0 to −23.5 mg/L), so the data cannot resolve land-cover effects.
- The v1 tree/non-tree result (16 sites) did not hold once the independent sites were added.

## Run the model

```matlab
cd matlab_model
run_tds_model
scenario_by_structure
```

Works in MATLAB R2016b+ (no toolboxes) and GNU Octave 6+. See `matlab_model/README.md`.

## Data sources

ALOS AW3D30 (JAXA, via OpenTopography); ESA WorldCover 2021 v200; WorldPop 2020 (1 km, UN-unadjusted); OpenStreetMap waterways; published TDS/EC data from Brillantes et al. (2026), Dimalen et al. (2025), Dumago et al. (2018), Galarpe et al. (2017), Villabeto & Simpol (2014), Quimpang et al. (2019) and Alombro et al. (2023).
