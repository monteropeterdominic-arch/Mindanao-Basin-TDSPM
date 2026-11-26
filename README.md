# Mindanao Basin TDS Potential Model (TDSPM)

Testing GIS-based screening of total dissolved solids (TDS) in the Mindanao River Basin, Philippines.

**Authors:** Peter Dominic C. Montero and Jay M. Navaluna (corresponding), Department of Civil Engineering, University of Southern Mindanao.

## What is here

| Folder | Contents |
|---|---|
| `matlab_model/` | Routed land-cover TDS model in MATLAB / GNU Octave (`run_tds_model.m`), its inputs, and the Python script that builds the inputs from the DEM, OSM rivers and ESA WorldCover |
| `matlab_model/outputs/` | Model comparison, fitted concentrations, site predictions, apportionment and scenario tables |
| `data/` | `observed_TDS_points.csv` (16 published TDS sites, sources, coordinates) and `proposed_sampling_sites.csv` (30 proposed validation sites) |
| `geotiff/` | Simulated TDS, scenario changes, terrain index, basin mask, flow accumulation and tree-cover rasters (EPSG:32651, 90 m) |
| `figures/` | Figures 1–7 of the paper |
| `paper/` | Manuscript (Word and PDF) |

## Main results

- Basin delineated from ALOS AW3D30: 20,583 km².
- The equal-weight terrain index (slope, flow accumulation, drainage density) does not rank observed TDS (Spearman ρ = 0.34, p = 0.20, n = 16).
- A routed tree/non-tree land-cover model is the only structure tested that matches or beats a null model in cross-validation (leave-one-river-out RMSE 31.5 vs. 36.3 mg/L).
- Fitted source concentrations: tree cover 99 mg/L, non-tree land 219 mg/L (non-tree higher in 90% of bootstrap refits).
- Converting 20% of tree cover to cropland raises simulated outlet TDS by 15.8 mg/L (95% interval −7.5 to 27.7).

## Run the model

```matlab
cd matlab_model
run_tds_model
```

Works in MATLAB R2016b+ (no toolboxes) and GNU Octave 6+. See `matlab_model/README.md`.

## Data sources

ALOS AW3D30 (JAXA, via OpenTopography); ESA WorldCover 2021 v200; OpenStreetMap waterways (HOT export); published TDS/EC data from Brillantes et al. (2026), Dimalen et al. (2025), Dumago et al. (2018) and Galarpe et al. (2017).
