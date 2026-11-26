function rho = spearman_simple(a, b)
% SPEARMAN_SIMPLE  Spearman rank correlation with average ranks for ties
% (no toolbox needed).
ra = avg_rank(a(:)); rb = avg_rank(b(:));
ra = ra - mean(ra); rb = rb - mean(rb);
rho = sum(ra .* rb) / sqrt(sum(ra.^2) * sum(rb.^2));
end

function r = avg_rank(x)
[xs, o] = sort(x); n = numel(x); r = zeros(n, 1); i = 1;
while i <= n
    j = i;
    while j < n && xs(j + 1) == xs(i), j = j + 1; end
    r(o(i:j)) = (i + j) / 2; i = j + 1;
end
end
