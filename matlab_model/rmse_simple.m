function v = rmse_simple(p, y)
% RMSE_SIMPLE  Root-mean-square error (no toolbox).
v = sqrt(mean((p(:) - y(:)).^2));
end
