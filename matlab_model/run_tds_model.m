% RUN_TDS_MODEL  Land-cover-based TDS routing model for the Mindanao River Basin
%
% What it does
%   1. Routes water and land-cover solute loads down the 90 m D8 network
%      (tds_route.m), assuming TDS behaves conservatively in the channel.
%   2. Fits source concentrations (mg/L) for groups of land-cover classes to
%      observed TDS by non-negative least squares, for several model
%      structures, and compares them by leave-one-out (LOO) and
%      leave-one-river-out (LORO) cross-validation against a null model.
%   3. For the selected model: bootstrap confidence intervals, source
%      apportionment, a basin TDS map and land-cover scenarios.
% Runs in MATLAB (R2016b+) or GNU Octave (>= 6) from this folder.
%
% Inputs (folder inputs/), exported from the AW3D30-based flow network:
%   down_index_int32.bin        downstream cell of each model cell (0 = outlet)
%   level_starts_int32.bin      first cell of each flow level
%   landcover_frac_float32.bin  class fractions, n x 5 (ESA WorldCover 2021)
%   observations.csv            site, river, TDS (mg/L), model cell index
% Outputs (folder outputs/): CSV tables and float32 grids in model-cell order.

clear; clc;
if exist('OCTAVE_VERSION', 'builtin'), rand('twister', 42); else, rng(42); end
in  = 'inputs';  out = 'outputs';
if ~exist(out, 'dir'), mkdir(out); end
% unpack the compressed inputs on first run
fz = {'down_index_int32.bin', 'landcover_frac_float32.bin'};
for k = 1:numel(fz)
    if ~exist(fullfile(in, fz{k}), 'file'), gunzip(fullfile(in, [fz{k} '.gz']), in); end
end

% ---------------- inputs ----------------
fid = fopen(fullfile(in, 'down_index_int32.bin'));   down = double(fread(fid, inf, 'int32')); fclose(fid);
fid = fopen(fullfile(in, 'level_starts_int32.bin')); starts = double(fread(fid, inf, 'int32')); fclose(fid);
n = numel(down); K = 5;
fid = fopen(fullfile(in, 'landcover_frac_float32.bin')); F = double(fread(fid, [n K], 'float32')); fclose(fid);
classes = {'Tree cover', 'Cropland', 'Built-up', 'Grass/shrub/bare', 'Water/wetland'};
fid = fopen(fullfile(in, 'observations.csv'));
C = textscan(fid, '%q %q %f %f', 'Delimiter', ',', 'HeaderLines', 1); fclose(fid);
site = C{1}; river = C{2}; y = C{3}; cidx = C{4}; nobs = numel(y);
[ur, ~, grp] = unique(river);

% runoff coefficients (mid-range rational-method values; my picks)
r = [0.20 0.35 0.80 0.30 0.50];

% ---------------- model structures (class -> group maps) ----------------
names  = {'5 classes', '3 groups: natural / human / water', ...
          '2 groups: natural / human+water', '2 groups: tree / non-tree'};
Gs = {eye(5), [1 0 0; 0 1 0; 0 1 0; 1 0 0; 0 0 1], [1 0; 0 1; 0 1; 1 0; 0 1], [1 0; 0 1; 0 1; 0 1; 0 1]};
sel = 4; G = Gs{sel};

% ---------------- evaporation search (wetland concentration) ----------------
egrid = [0 0.0005 0.001 0.002];
ecv = zeros(size(egrid));
for ie = 1:numel(egrid)
    [Q, Lk] = tds_route(down, starts, F, r, egrid(ie));
    X = (Lk(cidx, :) ./ repmat(Q(cidx), 1, K)) * G;
    ecv(ie) = rmse_simple(cv_predict(X, y, (1:nobs)'), y);
end
[~, ib] = min(ecv); e = egrid(ib);
[Q, Lk] = tds_route(down, starts, F, r, e);
X5 = Lk(cidx, :) ./ repmat(Q(cidx), 1, K);

% ---------------- cross-validated comparison ----------------
loo = (1:nobs)';
p0 = zeros(nobs, 1); p0r = zeros(nobs, 1);
for i = 1:nobs, m = loo ~= i; p0(i) = mean(y(m)); end
for g = 1:max(grp), m = grp ~= g; p0r(~m) = mean(y(m)); end
fid = fopen(fullfile(out, 'model_comparison.csv'), 'w');
fprintf(fid, 'model,n_parameters,rmse_fit,rmse_loo,rho_loo,rmse_loro,rho_loro\n');
fprintf(fid, 'Null (mean of training sites),1,%.2f,%.2f,NaN,%.2f,NaN\n', rmse_simple(mean(y) * ones(nobs, 1), y), rmse_simple(p0, y), rmse_simple(p0r, y));
for s = 1:numel(Gs)
    X = X5 * Gs{s};
    cs = lsqnonneg(X, y);
    pl = cv_predict(X, y, loo); pr = cv_predict(X, y, grp);
    fprintf(fid, '%s,%d,%.2f,%.2f,%.3f,%.2f,%.3f\n', names{s}, size(Gs{s}, 2), rmse_simple(X * cs, y), ...
        rmse_simple(pl, y), spearman_simple(pl, y), rmse_simple(pr, y), spearman_simple(pr, y));
end
fclose(fid);

% ---------------- selected model: tree / non-tree ----------------
X = X5 * G; c = lsqnonneg(X, y); fit = X * c;
pl = cv_predict(X, y, loo); pr = cv_predict(X, y, grp);
B = 2000; cb = zeros(B, size(G, 2));
for b = 1:B
    s = randi(nobs, nobs, 1); cb(b, :) = lsqnonneg(X(s, :), y(s))';
end
ci = prctile_simple(cb, [2.5 97.5]);
p_order = mean(cb(:, 2) > cb(:, 1));
cdrop = zeros(max(grp), 2);
for g = 1:max(grp), m = grp ~= g; cdrop(g, :) = lsqnonneg(X(m, :), y(m))'; end
ck = G * c;                               % class concentrations implied

% uniform-runoff sensitivity
[Qu, Lku] = tds_route(down, starts, F, ones(1, K), e);
Xu = (Lku(cidx, :) ./ repmat(Qu(cidx), 1, K)) * G; cu = lsqnonneg(Xu, y);
rmse_loo_u = rmse_simple(cv_predict(Xu, y, loo), y);

% apportionment (class shares of the TDS load)
share_obs = (X5 .* repmat(ck', nobs, 1)) ./ repmat(X5 * ck, 1, K);
outlet = find(down == 0, 1);
share_outlet = (Lk(outlet, :) .* ck') / (Lk(outlet, :) * ck);

% basin TDS and scenarios
TDS0 = (Lk * ck) ./ Q;
F1 = F; mv = 0.2 * F(:, 1); F1(:, 1) = F(:, 1) - mv; F1(:, 2) = F(:, 2) + mv;   % 20 % tree -> crop
F2 = F; add = F(:, 3); take = min(add, F(:, 2)); F2(:, 2) = F(:, 2) - take;      % built-up x2
rest = add - take; take2 = min(rest, F(:, 1)); F2(:, 1) = F(:, 1) - take2; F2(:, 3) = F(:, 3) + take + take2;
F3 = F; mv = 0.2 * F(:, 2); F3(:, 2) = F(:, 2) - mv; F3(:, 1) = F(:, 1) + mv;   % 20 % crop -> tree
scen = {F1, F2, F3};
sname = {'S1 20% of tree cover to cropland', 'S2 built-up doubled', 'S3 20% of cropland to tree cover'};
TDSs = zeros(n, 3); outlet_ci = zeros(3, 2);
for k = 1:3
    [Qs, Lks] = tds_route(down, starts, scen{k}, r, e);
    TDSs(:, k) = (Lks * ck) ./ Qs;
    d = zeros(B, 1);
    for b = 1:B
        cc = G * cb(b, :)';
        d(b) = (Lks(outlet, :) * cc) / Qs(outlet) - (Lk(outlet, :) * cc) / Q(outlet);
    end
    outlet_ci(k, :) = prctile_simple(d, [2.5 97.5]);
end

% ---------------- write outputs ----------------
fid = fopen(fullfile(out, 'evaporation_search.csv'), 'w');
fprintf(fid, 'e,loocv_rmse\n'); fprintf(fid, '%.4f,%.4f\n', [egrid; ecv]); fclose(fid);
fid = fopen(fullfile(out, 'selected_model.csv'), 'w');
fprintf(fid, 'item,value,ci_low,ci_high\n');
fprintf(fid, 'c_tree_mgL,%.2f,%.2f,%.2f\n', c(1), ci(1, 1), ci(2, 1));
fprintf(fid, 'c_nontree_mgL,%.2f,%.2f,%.2f\n', c(2), ci(1, 2), ci(2, 2));
fprintf(fid, 'P_nontree_gt_tree,%.4f,,\n', p_order);
fprintf(fid, 'evaporation_e,%.4f,,\n', e);
fprintf(fid, 'rmse_fit,%.2f,,\n', rmse_simple(fit, y));
fprintf(fid, 'rmse_loo,%.2f,,\n', rmse_simple(pl, y));
fprintf(fid, 'rmse_loro,%.2f,,\n', rmse_simple(pr, y));
fprintf(fid, 'c_tree_uniform_runoff,%.2f,,\n', cu(1));
fprintf(fid, 'c_nontree_uniform_runoff,%.2f,,\n', cu(2));
fprintf(fid, 'rmse_loo_uniform_runoff,%.2f,,\n', rmse_loo_u);
fclose(fid);
fid = fopen(fullfile(out, 'leave_one_river_out_coefficients.csv'), 'w');
fprintf(fid, 'river_left_out,c_tree,c_nontree\n');
for g = 1:max(grp), fprintf(fid, '"%s",%.2f,%.2f\n', ur{g}, cdrop(g, 1), cdrop(g, 2)); end
fclose(fid);
fid = fopen(fullfile(out, 'site_predictions.csv'), 'w');
fprintf(fid, 'site,river,observed,fitted,loo,loro,share_tree,share_crop,share_built,share_grass,share_water\n');
for i = 1:nobs
    fprintf(fid, '"%s","%s",%.2f,%.2f,%.2f,%.2f,%.4f,%.4f,%.4f,%.4f,%.4f\n', site{i}, river{i}, y(i), fit(i), pl(i), pr(i), share_obs(i, :));
end
fclose(fid);
fid = fopen(fullfile(out, 'outlet_apportionment.csv'), 'w');
fprintf(fid, 'class,share_of_TDS_load_pct\n');
for k = 1:K, fprintf(fid, '%s,%.2f\n', classes{k}, 100 * share_outlet(k)); end
fclose(fid);
fid = fopen(fullfile(out, 'scenario_summary.csv'), 'w');
fprintf(fid, 'scenario,outlet_TDS_mgL,change_mgL,change_ci_low,change_ci_high\n');
fprintf(fid, 'S0 current,%.2f,0,,\n', TDS0(outlet));
for k = 1:3
    fprintf(fid, '%s,%.2f,%.2f,%.2f,%.2f\n', sname{k}, TDSs(outlet, k), TDSs(outlet, k) - TDS0(outlet), outlet_ci(k, 1), outlet_ci(k, 2));
end
fclose(fid);
fid = fopen(fullfile(out, 'TDS_current_float32.bin'), 'w'); fwrite(fid, TDS0, 'float32'); fclose(fid);
fid = fopen(fullfile(out, 'TDS_scenarios_float32.bin'), 'w'); fwrite(fid, TDSs, 'float32'); fclose(fid);
fid = fopen(fullfile(out, 'Q_relative_float32.bin'), 'w'); fwrite(fid, Q, 'float32'); fclose(fid);
fprintf('selected model: c_tree = %.1f, c_nontree = %.1f mg/L; LOO RMSE %.2f, LORO RMSE %.2f; outlet %.1f mg/L\n', ...
    c(1), c(2), rmse_simple(pl, y), rmse_simple(pr, y), TDS0(outlet));
