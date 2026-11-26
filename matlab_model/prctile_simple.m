function q = prctile_simple(X, p)
% PRCTILE_SIMPLE  Column percentiles by linear interpolation (no toolbox).
n = size(X, 1); Xs = sort(X, 1); q = zeros(numel(p), size(X, 2));
for k = 1:numel(p)
    h = (n - 1) * p(k) / 100 + 1; lo = floor(h); hi = min(lo + 1, n); w = h - lo;
    q(k, :) = (1 - w) * Xs(lo, :) + w * Xs(hi, :);
end
end
