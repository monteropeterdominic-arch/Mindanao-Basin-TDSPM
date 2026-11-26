% RUN_TDS_MODEL  Routed land-cover + population TDS model, Mindanao River Basin (v2)
%
%   1. Routes runoff, land-cover solute loads and population down the 90 m
%      D8 network (tds_route.m); TDS is treated as conservative.
%   2. Compares model structures (land-cover groups, with and without a
%      population load term) by non-negative least squares and three tests:
%        a) independent test: fit on the 16 calibration sites, predict the
%           6 independent literature sites;
%        b) leave-one-site-out (LOO) on all 22 sites;
%        c) leave-one-river-out (LORO, 7 river systems) on all 22 sites.
%   3. Selected model: bootstrap CIs, Monte Carlo over runoff coefficients,
%      source apportionment, basin TDS map and land-use/population scenarios.
% Runs in MATLAB (R2016b+) or GNU Octave (>= 6) from this folder.

clear; clc;
if exist('OCTAVE_VERSION', 'builtin'), rand('twister', 42); else, rng(42); end
in = 'inputs'; out = 'outputs';
if ~exist(out, 'dir'), mkdir(out); end
fz = {'down_index_int32.bin', 'landcover_frac_float32.bin', 'population_float32.bin'};
for k = 1:numel(fz)
    if ~exist(fullfile(in, fz{k}), 'file'), gunzip(fullfile(in, [fz{k} '.gz']), in); end
end

% ---------------- inputs ----------------
fid = fopen(fullfile(in, 'down_index_int32.bin'));   down = double(fread(fid, inf, 'int32')); fclose(fid);
fid = fopen(fullfile(in, 'level_starts_int32.bin')); starts = double(fread(fid, inf, 'int32')); fclose(fid);
n = numel(down); K = 5;
fid = fopen(fullfile(in, 'landcover_frac_float32.bin')); F = double(fread(fid, [n K], 'float32')); fclose(fid);
fid = fopen(fullfile(in, 'population_float32.bin'));     P = double(fread(fid, n, 'float32'));     fclose(fid);
classes = {'Tree cover', 'Cropland', 'Built-up', 'Grass/shrub/bare', 'Water/wetland'};
fid = fopen(fullfile(in, 'observations.csv'));
C = textscan(fid, '%q %q %f %f %q', 'Delimiter', ',', 'HeaderLines', 1); fclose(fid);
site = C{1}; river = C{2}; y = C{3}; cidx = C{4}; set_ = C{5}; nobs = numel(y);
[ur, ~, grp] = unique(river);
cal = strcmp(set_, 'calibration'); tst = ~cal;
loo = (1:nobs)';

r0 = [0.20 0.35 0.80 0.30 0.50];          % runoff coefficients (my picks, rational-method mid-range)
outlet = find(down == 0, 1);

% ---------------- routing at nominal runoff ----------------
[Q, Lk, Pacc] = tds_route(down, starts, F, r0, 0, P);
X5 = Lk(cidx, :) ./ repmat(Q(cidx), 1, K);           % per-class concentration factors
Xp = Pacc(cidx) ./ Q(cidx) / 1000;                     % thousand persons per unit runoff

% ---------------- model structures ----------------
names = {'Tree / non-tree', 'Tree / non-tree + population', 'Tree / cropland / other + population', ...
         '5 classes + population', 'Uniform background + population'};
G = {[1 0; 0 1; 0 1; 0 1; 0 1], [1 0; 0 1; 0 1; 0 1; 0 1], [1 0 0; 0 1 0; 0 0 1; 0 0 1; 0 0 1], eye(5), ones(5, 1)};
usep = [false true true true true];
design = @(s, X5_, Xp_) [X5_ * G{s}, repmat(Xp_, 1, usep(s))];

null_loo = zeros(nobs, 1); null_loro = zeros(nobs, 1);
for i = 1:nobs, m = loo ~= i; null_loo(i) = mean(y(m)); end
for g = 1:max(grp), m = grp ~= g; null_loro(~m) = mean(y(m)); end
null_test = mean(y(cal)) * ones(sum(tst), 1);

fid = fopen(fullfile(out, 'model_comparison.csv'), 'w');
fprintf(fid, 'model,n_parameters,test_rmse,test_bias,test_rho,loo_rmse,loo_rho,loro_rmse,loro_rho\n');
fprintf(fid, 'Null (training mean),1,%.2f,%.2f,NaN,%.2f,NaN,%.2f,NaN\n', rmse_simple(null_test, y(tst)), mean(null_test - y(tst)), rmse_simple(null_loo, y), rmse_simple(null_loro, y));
best = 1; bestv = inf; PT = zeros(sum(tst), numel(G));
for s = 1:numel(G)
    X = design(s, X5, Xp);
    cc = lsqnonneg(X(cal, :), y(cal)); pt = X(tst, :) * cc; PT(:, s) = pt;
    pl = cv_predict(X, y, loo); pr = cv_predict(X, y, grp);
    fprintf(fid, '%s,%d,%.2f,%.2f,%.3f,%.2f,%.3f,%.2f,%.3f\n', names{s}, size(X, 2), rmse_simple(pt, y(tst)), mean(pt - y(tst)), ...
        spearman_simple(pt, y(tst)), rmse_simple(pl, y), spearman_simple(pl, y), rmse_simple(pr, y), spearman_simple(pr, y));
    if rmse_simple(pr, y) < bestv, bestv = rmse_simple(pr, y); best = s; end
end
fclose(fid);
fid = fopen(fullfile(out, 'independent_test_predictions.csv'), 'w');
fprintf(fid, 'site,river,observed,%s\n', strjoin(strrep(names, ',', ''), ','));
it = find(tst);
for i = 1:numel(it)
    fprintf(fid, '"%s","%s",%.1f', site{it(i)}, river{it(i)}, y(it(i))); fprintf(fid, ',%.1f', PT(i, :)); fprintf(fid, '\n');
end
fclose(fid);

% ---------------- selected model, all 22 sites ----------------
sel = best; X = design(sel, X5, Xp); c = lsqnonneg(X, y); fit = X * c;
pl = cv_predict(X, y, loo); pr = cv_predict(X, y, grp);
B = 2000; cb = zeros(B, numel(c));
for b = 1:B, s = randi(nobs, nobs, 1); cb(b, :) = lsqnonneg(X(s, :), y(s))'; end
ci = prctile_simple(cb, [2.5 97.5]);

% Monte Carlo over runoff coefficients (+/-50 %, uniform), refit each draw
NMC = 200; mc_c = zeros(NMC, numel(c)); mc_out = zeros(NMC, 1); mc_loro = zeros(NMC, 1);
for k = 1:NMC
    rk = r0 .* (0.5 + rand(1, K));
    [Qk, Lkk, Pk] = tds_route(down, starts, F, rk, 0, P);
    X5k = Lkk(cidx, :) ./ repmat(Qk(cidx), 1, K); Xpk = Pk(cidx) ./ Qk(cidx) / 1000;
    Xk = design(sel, X5k, Xpk); ck = lsqnonneg(Xk, y); mc_c(k, :) = ck';
    mc_loro(k) = rmse_simple(cv_predict(Xk, y, grp), y);
    Xo = design(sel, Lkk(outlet, :) / Qk(outlet), Pk(outlet) / Qk(outlet) / 1000);
    mc_out(k) = Xo * ck;
end

% full-basin maps for the selected model
Xall = design(sel, Lk ./ repmat(Q, 1, K), Pacc ./ Q / 1000);
TDS0 = Xall * c;
if usep(sel), TDSpop = Xall(:, end) * c(end); else, TDSpop = zeros(n, 1); end
share_out = (Xall(outlet, :) .* c') / TDS0(outlet);

% scenarios
sc = {}; sname = {};
F1 = F; mv = 0.2 * F(:, 1); F1(:, 1) = F(:, 1) - mv; F1(:, 2) = F(:, 2) + mv;   sc{end+1} = {F1, P};       sname{end+1} = 'S1 20% of tree cover to cropland';
F2 = F; add = F(:, 3); take = min(add, F(:, 2)); F2(:, 2) = F(:, 2) - take;
rest = add - take; take2 = min(rest, F(:, 1)); F2(:, 1) = F(:, 1) - take2; F2(:, 3) = F(:, 3) + take + take2;
sc{end+1} = {F2, P};       sname{end+1} = 'S2 built-up doubled';
F3 = F; mv = 0.2 * F(:, 2); F3(:, 2) = F(:, 2) - mv; F3(:, 1) = F(:, 1) + mv;   sc{end+1} = {F3, P};       sname{end+1} = 'S3 20% of cropland to tree cover';
sc{end+1} = {F, 1.5 * P};  sname{end+1} = 'S4 population +50%';
sc{end+1} = {F1, 1.5 * P}; sname{end+1} = 'S5 S1 and S4 together';
TDSs = zeros(n, numel(sc)); dci = zeros(numel(sc), 2);
for k = 1:numel(sc)
    [Qs, Lks, Ps] = tds_route(down, starts, sc{k}{1}, r0, 0, sc{k}{2});
    Xs = design(sel, Lks ./ repmat(Qs, 1, K), Ps ./ Qs / 1000);
    TDSs(:, k) = Xs * c;
    d = (Xs(outlet, :) - Xall(outlet, :)) * cb';
    dci(k, :) = prctile_simple(d', [2.5 97.5]);
end

% ---------------- outputs ----------------
lab = {};
if sel == 5, lab{end+1} = 'Background (all land)'; else
    gl = {{'Tree cover', 'Non-tree'}, {'Tree cover', 'Non-tree'}, {'Tree cover', 'Cropland', 'Other land'}, classes};
    lab = gl{sel};
end
if usep(sel), lab{end+1} = 'Population (mg/L per 1000 persons per runoff unit)'; end
fid = fopen(fullfile(out, 'selected_model.csv'), 'w');
fprintf(fid, 'term,value,ci_low,ci_high,mc_p05,mc_p95\n');
mcq = prctile_simple(mc_c, [5 95]);
for k = 1:numel(c), fprintf(fid, '"%s",%.3f,%.3f,%.3f,%.3f,%.3f\n', lab{k}, c(k), ci(1, k), ci(2, k), mcq(1, k), mcq(2, k)); end
fprintf(fid, '"model",%d,,,,\n', sel);
fprintf(fid, '"rmse_fit",%.2f,,,,\n', rmse_simple(fit, y));
fprintf(fid, '"rmse_loo",%.2f,,,,\n', rmse_simple(pl, y));
fprintf(fid, '"rmse_loro",%.2f,,,,\n', rmse_simple(pr, y));
fprintf(fid, '"nse_loro",%.3f,,,,\n', 1 - sum((pr - y).^2) / sum((y - mean(y)).^2));
fprintf(fid, '"outlet_TDS",%.2f,,,%.2f,%.2f\n', TDS0(outlet), prctile_simple(mc_out, 5), prctile_simple(mc_out, 95));
fprintf(fid, '"outlet_TDS_from_population",%.2f,,,,\n', TDSpop(outlet));
mcl = prctile_simple(mc_loro, [5 95]);
fprintf(fid, '"mc_loro_rmse",%.2f,,,%.2f,%.2f\n', median(mc_loro), mcl(1), mcl(2));
fclose(fid);
fid = fopen(fullfile(out, 'site_predictions.csv'), 'w');
fprintf(fid, 'site,river,set,observed,fitted,loo,loro\n');
for i = 1:nobs, fprintf(fid, '"%s","%s","%s",%.2f,%.2f,%.2f,%.2f\n', site{i}, river{i}, set_{i}, y(i), fit(i), pl(i), pr(i)); end
fclose(fid);
fid = fopen(fullfile(out, 'outlet_apportionment.csv'), 'w');
fprintf(fid, 'term,share_of_outlet_TDS_pct\n');
for k = 1:numel(c), fprintf(fid, '"%s",%.2f\n', lab{k}, 100 * share_out(k)); end
fclose(fid);
fid = fopen(fullfile(out, 'scenario_summary.csv'), 'w');
fprintf(fid, 'scenario,outlet_TDS_mgL,change_mgL,change_ci_low,change_ci_high\n');
fprintf(fid, 'S0 current,%.2f,0,,\n', TDS0(outlet));
for k = 1:numel(sc), fprintf(fid, '%s,%.2f,%.2f,%.2f,%.2f\n', sname{k}, TDSs(outlet, k), TDSs(outlet, k) - TDS0(outlet), dci(k, 1), dci(k, 2)); end
fclose(fid);
fid = fopen(fullfile(out, 'monte_carlo_runoff.csv'), 'w');
fprintf(fid, 'draw,%s,outlet_TDS,loro_rmse\n', strjoin(arrayfun(@(k) sprintf('c%d', k), 1:numel(c), 'UniformOutput', false), ','));
for k = 1:NMC, fprintf(fid, '%d', k); fprintf(fid, ',%.3f', mc_c(k, :)); fprintf(fid, ',%.2f,%.2f\n', mc_out(k), mc_loro(k)); end
fclose(fid);
fid = fopen(fullfile(out, 'TDS_current_float32.bin'), 'w');   fwrite(fid, TDS0, 'float32'); fclose(fid);
fid = fopen(fullfile(out, 'TDS_population_part_float32.bin'), 'w'); fwrite(fid, TDSpop, 'float32'); fclose(fid);
fid = fopen(fullfile(out, 'TDS_scenarios_float32.bin'), 'w'); fwrite(fid, TDSs, 'float32'); fclose(fid);
fprintf('selected: %s | LORO RMSE %.2f (null %.2f) | outlet %.1f mg/L\n', names{sel}, rmse_simple(pr, y), rmse_simple(null_loro, y), TDS0(outlet));
