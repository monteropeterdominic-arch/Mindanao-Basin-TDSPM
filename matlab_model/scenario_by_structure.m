% SCENARIO_BY_STRUCTURE  Outlet TDS change for scenarios S1-S5 under every
% model structure (each fitted by NNLS on all 22 sites), plus fitted
% coefficients. Shows how much the land-cover conclusion depends on the
% structure chosen. Run after run_tds_model.m (uses the same inputs).
% Runs in MATLAB (R2016b+) or GNU Octave (>= 6).

clear; clc;
in = 'inputs'; out = 'outputs';
fid = fopen(fullfile(in, 'down_index_int32.bin'));   down = double(fread(fid, inf, 'int32')); fclose(fid);
fid = fopen(fullfile(in, 'level_starts_int32.bin')); starts = double(fread(fid, inf, 'int32')); fclose(fid);
n = numel(down); K = 5;
fid = fopen(fullfile(in, 'landcover_frac_float32.bin')); F = double(fread(fid, [n K], 'float32')); fclose(fid);
fid = fopen(fullfile(in, 'population_float32.bin'));     P = double(fread(fid, n, 'float32'));     fclose(fid);
fid = fopen(fullfile(in, 'observations.csv'));
C = textscan(fid, '%q %q %f %f %q', 'Delimiter', ',', 'HeaderLines', 1); fclose(fid);
y = C{3}; cidx = C{4};
r0 = [0.20 0.35 0.80 0.30 0.50]; outlet = find(down == 0, 1);

names = {'Tree / non-tree', 'Tree / non-tree + population', 'Tree / cropland / other + population', ...
         '5 classes + population', 'Uniform background + population'};
G = {[1 0; 0 1; 0 1; 0 1; 0 1], [1 0; 0 1; 0 1; 0 1; 0 1], [1 0 0; 0 1 0; 0 0 1; 0 0 1; 0 0 1], eye(5), ones(5, 1)};
usep = [false true true true true];
design = @(s, X5_, Xp_) [X5_ * G{s}, repmat(Xp_, 1, usep(s))];

[Q, Lk, Pacc] = tds_route(down, starts, F, r0, 0, P);
X5 = Lk(cidx, :) ./ repmat(Q(cidx), 1, K); Xp = Pacc(cidx) ./ Q(cidx) / 1000;
X5o = Lk(outlet, :) / Q(outlet); Xpo = Pacc(outlet) / Q(outlet) / 1000;

F1 = F; mv = 0.2 * F(:, 1); F1(:, 1) = F(:, 1) - mv; F1(:, 2) = F(:, 2) + mv;
F2 = F; add = F(:, 3); take = min(add, F(:, 2)); F2(:, 2) = F(:, 2) - take;
rest = add - take; take2 = min(rest, F(:, 1)); F2(:, 1) = F(:, 1) - take2; F2(:, 3) = F(:, 3) + take + take2;
F3 = F; mv = 0.2 * F(:, 2); F3(:, 2) = F(:, 2) - mv; F3(:, 1) = F(:, 1) + mv;
sc = {{F1, P}, {F2, P}, {F3, P}, {F, 1.5 * P}, {F1, 1.5 * P}};
so = zeros(numel(sc), K + 1);
for k = 1:numel(sc)
    [Qs, Lks, Ps] = tds_route(down, starts, sc{k}{1}, r0, 0, sc{k}{2});
    so(k, :) = [Lks(outlet, :) / Qs(outlet), Ps(outlet) / Qs(outlet) / 1000];
end

fid = fopen(fullfile(out, 'scenario_by_structure.csv'), 'w');
fprintf(fid, 'model,coefficients,outlet_S0,dS1_tree_to_crop,dS2_builtup_x2,dS3_crop_to_tree,dS4_pop_x1.5,dS5_S1_and_S4\n');
for s = 1:numel(names)
    c = lsqnonneg(design(s, X5, Xp), y);
    t0 = design(s, X5o, Xpo) * c;
    d = zeros(1, numel(sc));
    for k = 1:numel(sc), d(k) = design(s, so(k, 1:K), so(k, end)) * c - t0; end
    fprintf(fid, '"%s","%s",%.2f', names{s}, strjoin(arrayfun(@(v) sprintf('%.1f', v), c', 'UniformOutput', false), ' | '), t0);
    fprintf(fid, ',%.2f', d); fprintf(fid, '\n');
end
fclose(fid);
type(fullfile(out, 'scenario_by_structure.csv'));
