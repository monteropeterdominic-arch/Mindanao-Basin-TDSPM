function pred = cv_predict(X, y, groups)
% CV_PREDICT  Cross-validated predictions of a non-negative least-squares
% fit. Each unique value in GROUPS is held out in turn (use 1:n for
% leave-one-out, a river index for leave-one-river-out).
pred = zeros(numel(y), 1);
g = unique(groups);
for k = 1:numel(g)
    te = groups == g(k);
    c = lsqnonneg(X(~te, :), y(~te));
    pred(te) = X(te, :) * c;
end
end
