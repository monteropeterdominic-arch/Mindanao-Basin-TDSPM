function [Q, Lk] = tds_route(down, starts, F, r, e)
% TDS_ROUTE  Steady-state routing of water and land-cover solute loads
% through a D8 river network (cells ordered upstream -> downstream).
%
%   down   : n x 1 int, index of the downstream cell (0 = basin outlet)
%   starts : m x 1 int, first cell index of each flow level
%   F      : n x K land-cover fractions (columns sum to 1 per cell)
%   r      : 1 x K runoff coefficients per land-cover class (-)
%   e      : evaporative water-loss fraction per unit open-water/wetland
%            cover per cell (-); applied to water only, so TDS concentrates
%
%   Q      : n x 1 routed water flux (relative units, uniform rainfall)
%   Lk     : n x K routed solute load from each class per unit source
%            concentration, so  TDS = (Lk * c) ./ Q  for class
%            concentrations c (K x 1, mg/L).
%
% Works in MATLAB (R2016b+) and GNU Octave (>= 6).

n = numel(down);
K = size(F, 2);
q  = F * r(:);                 % local runoff of each cell
Q  = q;
Lk = F .* repmat(r(:)', n, 1); % local load per unit concentration
fw = F(:, K);                  % last class = open water / wetland
m  = numel(starts);
ends = [starts(2:end) - 1; n];
for l = 1:m
    idx = (starts(l):ends(l))';
    % all inflow to this level has arrived: apply evaporative water loss
    Q(idx) = Q(idx) .* (1 - e .* fw(idx));
    d = down(idx);
    ok = d > 0;
    if any(ok)
        di = d(ok); src = idx(ok);
        [ud, ~, g] = unique(di);
        Q(ud) = Q(ud) + accumarray(g, Q(src));
        for k = 1:K
            Lk(ud, k) = Lk(ud, k) + accumarray(g, Lk(src, k));
        end
    end
end
end
