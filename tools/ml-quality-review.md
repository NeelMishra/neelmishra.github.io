# ML blog quality review — in progress

Updated 2026-09-22; inventory snapshot `1d5c1c3`. The objective covers every published ML blog except loss-function articles. This is a working review record, not a claim that the collection is complete. Reconcile it with the current repository before resuming: other workstreams are adding NLP textbook chapters.

At this snapshot: **234 non-loss articles**, **20 excluded loss-function pages**, and **1 legacy redirect**. New articles need their own review. 59 articles below have passed individual review, including 29 improved articles and 30 already sound articles; a successful navigation check or the presence of a figure does not establish editorial quality.

## Acceptance evidence

- Explain the purpose and prerequisites, define notation before using it, and connect formulas to a consistent worked example. Provide enough detail to reproduce the key reasoning, including assumptions, intermediate calculations, and failure cases where useful; do not add length without teaching value.
- Use a figure that explains the actual mechanism or evidence. Check labels, units, captions, accessible descriptions, and mobile legibility; avoid arbitrary bars masquerading as fitted results.
- Verify calculations and substantive claims. Prefer primary references, and distinguish original teaching data from reported experiments.
- Check local links/assets and meaningful interactive states. Inspect desktop and mobile renders, math errors, overflow, and fallback behavior where controls require JavaScript.
- Commit and push each finished improvement separately. Stage only the intended paths/hunks when other work is active.

## What remains

- Expand the remaining recommended-paper stubs, then revise both paper-reading indexes and their broad historical claims.
- Replace weak regression-family visuals; verify remaining linear/logistic examples and technical sources.
- Finish the remaining decision-tree visual and explanation gaps; the six bagging/boosting articles and four non-loss GBM chapters now have individual acceptance evidence.
- Complete individual reviews of the existing data-preparation, decision-tree, explainability, retrieval, graph, anomaly, and representation-learning articles. Previous sampling found strong recent work, but sampling is not exhaustive verification.
- Review newly added NLP textbook pages once each addition is complete. Do not accidentally commit an in-progress registry independently of its pages.

## Per-article status

“Reviewed” means an individual content and visual review passed. Some articles already met the standard and required no changes. “Pending” means the full article has not been accepted in this pass, even if its structure or figures were sampled.

| Article | Status | Evidence or next action |
|---|---|---|
| [anomaly-detection/anomaly-queues-thresholds-and-explanations.html](../blog/ml/anomaly-detection/anomaly-queues-thresholds-and-explanations.html) | Pending | Individual content, example and visual review outstanding. |
| [anomaly-detection/index.html](../blog/ml/anomaly-detection/index.html) | Pending | Individual content, example and visual review outstanding. |
| [anomaly-detection/isolation-forest-from-partitions.html](../blog/ml/anomaly-detection/isolation-forest-from-partitions.html) | Pending | Individual content, example and visual review outstanding. |
| [anomaly-detection/sparse-heavy-tailed-telemetry.html](../blog/ml/anomaly-detection/sparse-heavy-tailed-telemetry.html) | Pending | Individual content, example and visual review outstanding. |
| [bagging-and-boosting/adaboost.html](../blog/ml/bagging-and-boosting/adaboost.html) | Reviewed | Two weight updates; vote arithmetic; common-scale figure at 1440/390. |
| [bagging-and-boosting/bagging-random-forests.html](../blog/ml/bagging-and-boosting/bagging-random-forests.html) | Reviewed | Exact fitted stumps and all row-specific OOB errors reproduced; MSE6.6125; covariance sums and readable log-axis figure; noJS. |
| [bagging-and-boosting/gradient-boosting.html](../blog/ml/bagging-and-boosting/gradient-boosting.html) | Reviewed | Two exact stump updates, all candidate SSEs and gradient checks; MSE10→3.25→1.5625; both figures at1440/390/320 and noJS. |
| [bagging-and-boosting/index.html](../blog/ml/bagging-and-boosting/index.html) | Reviewed | Training dependencies; separate combination rules; diagrams at 1440/390/320. |
| [bagging-and-boosting/interview-guide.html](../blog/ml/bagging-and-boosting/interview-guide.html) | Reviewed | Visible resample and hidden answer; all 3,125 resamples checked; correct negative gradients; 320px. |
| [bagging-and-boosting/modern-boosting.html](../blog/ml/bagging-and-boosting/modern-boosting.html) | Reviewed | Four-row split; exact vs histogram gain; SVG at 1440/390. |
| [data-preparation/cross-validation/choosing-k.html](../blog/ml/data-preparation/cross-validation/choosing-k.html) | Reviewed | Every count for k = 2, 5, 10, 20 reproduced; row support, recall resolution and fit budget connected. |
| [data-preparation/cross-validation/cv-for-tuning.html](../blog/ml/data-preparation/cross-validation/cv-for-tuning.html) | Reviewed | All six search results reproduced; best CV MAE 0.22286748, test MAE 0.18048907; complete fit boundaries. |
| [data-preparation/cross-validation/group-k-fold.html](../blog/ml/data-preparation/cross-validation/group-k-fold.html) | Reviewed | Executed AF/BE/CD grouping: 11 rows each, no group overlap; group/row weighting explained. |
| [data-preparation/cross-validation/index.html](../blog/ml/data-preparation/cross-validation/index.html) | Reviewed | All five states and controls checked; pooled accuracy 880/1,000 = 88%; desktop/mobile readable. |
| [data-preparation/cross-validation/k-fold.html](../blog/ml/data-preparation/cross-validation/k-fold.html) | Reviewed | Executed six-row example: training means 3.5, 3, 2.5; CV MSE 2.5; all fold states checked. |
| [data-preparation/cross-validation/leave-one-out.html](../blog/ml/data-preparation/cross-validation/leave-one-out.html) | Reviewed | All five refits/predictions reproduced; OOF MSE 4.28698980 vs training 1.12; extrapolation visible. |
| [data-preparation/cross-validation/nested-cv.html](../blog/ml/data-preparation/cross-validation/nested-cv.html) | Reviewed | Executed outer accuracies 0.79, 0.753333, 0.72; mean 0.754444; search/refit accounting checked. |
| [data-preparation/cross-validation/repeated-k-fold.html](../blog/ml/data-preparation/cross-validation/repeated-k-fold.html) | Reviewed | All partitions reproduced; per-repeat MAEs 0.71840463, 0.87378663, 0.81080772; uncertainty caveats sound. |
| [data-preparation/cross-validation/shuffle-split.html](../blog/ml/data-preparation/cross-validation/shuffle-split.html) | Reviewed | All five draws and coverage counts reproduced; expected covered rows 6.7232; weighting and omissions clear. |
| [data-preparation/cross-validation/stratified-k-fold.html](../blog/ml/data-preparation/cross-validation/stratified-k-fold.html) | Reviewed | Executed allocation: (2,4), (1,5), (1,5), (1,4); label counts and limits explained correctly. |
| [data-preparation/cross-validation/time-series-cv.html](../blog/ml/data-preparation/cross-validation/time-series-cv.html) | Reviewed | Executed all origins: horizon MAEs 1.3333, 1.6667, 3.6667; availability and gaps verified. |
| [data-preparation/data-cleaning/data-types-and-parsing.html](../blog/ml/data-preparation/data-cleaning/data-types-and-parsing.html) | Reviewed | All Python/C++ parser examples and edge cases checked; date snippet repaired and executed in a fresh namespace. |
| [data-preparation/data-cleaning/duplicate-records.html](../blog/ml/data-preparation/data-cleaning/duplicate-records.html) | Reviewed | Python/C++ eight-row decisions agree; reorder invariance, 6/5/4 interactive retained counts and blocking 28 to 7 verified. |
| [data-preparation/data-cleaning/errors-vs-outliers.html](../blog/ml/data-preparation/data-cleaning/errors-vs-outliers.html) | Reviewed | All five decisions and quantiles reproduced; SVG labels now 14.9px at320; generator preserves reference and case coordinates. |
| [data-preparation/data-cleaning/index.html](../blog/ml/data-preparation/data-cleaning/index.html) | Reviewed | E17 identity, canonical units and 960/1000 coverage checked; both workflow figures clear at all three widths. |
| [data-preparation/data-cleaning/text-normalization.html](../blog/ml/data-preparation/data-cleaning/text-normalization.html) | Reviewed | Python and C++ helpers reproduced; NFC/NFKC/casefold/mark-removal collisions 0/3/2/1; every control and figure checked. |
| [data-preparation/data-cleaning/units-and-consistency.html](../blog/ml/data-preparation/data-cleaning/units-and-consistency.html) | Reviewed | Python/C++ conversions and idempotence reproduced; all interactive square states; physical and squared units correct. |
| [data-preparation/dimensionality-reduction/autoencoders.html](../blog/ml/data-preparation/dimensionality-reduction/autoencoders.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/dimensionality-reduction/curse-of-dimensionality.html](../blog/ml/data-preparation/dimensionality-reduction/curse-of-dimensionality.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/dimensionality-reduction/index.html](../blog/ml/data-preparation/dimensionality-reduction/index.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/dimensionality-reduction/kernel-pca.html](../blog/ml/data-preparation/dimensionality-reduction/kernel-pca.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/dimensionality-reduction/lda.html](../blog/ml/data-preparation/dimensionality-reduction/lda.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/dimensionality-reduction/pca.html](../blog/ml/data-preparation/dimensionality-reduction/pca.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/dimensionality-reduction/t-sne.html](../blog/ml/data-preparation/dimensionality-reduction/t-sne.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/dimensionality-reduction/umap.html](../blog/ml/data-preparation/dimensionality-reduction/umap.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/encoding-categoricals/binary-encoding.html](../blog/ml/data-preparation/encoding-categoricals/binary-encoding.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/encoding-categoricals/cyclical-encoding.html](../blog/ml/data-preparation/encoding-categoricals/cyclical-encoding.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/encoding-categoricals/frequency-encoding.html](../blog/ml/data-preparation/encoding-categoricals/frequency-encoding.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/encoding-categoricals/hashing-high-cardinality.html](../blog/ml/data-preparation/encoding-categoricals/hashing-high-cardinality.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/encoding-categoricals/index.html](../blog/ml/data-preparation/encoding-categoricals/index.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/encoding-categoricals/label-encoding.html](../blog/ml/data-preparation/encoding-categoricals/label-encoding.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/encoding-categoricals/one-hot-encoding.html](../blog/ml/data-preparation/encoding-categoricals/one-hot-encoding.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/encoding-categoricals/ordinal-encoding.html](../blog/ml/data-preparation/encoding-categoricals/ordinal-encoding.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/encoding-categoricals/rare-category-grouping.html](../blog/ml/data-preparation/encoding-categoricals/rare-category-grouping.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/encoding-categoricals/target-encoding.html](../blog/ml/data-preparation/encoding-categoricals/target-encoding.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/encoding-categoricals/weight-of-evidence.html](../blog/ml/data-preparation/encoding-categoricals/weight-of-evidence.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-engineering/aggregation-features.html](../blog/ml/data-preparation/feature-engineering/aggregation-features.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-engineering/binning-discretization.html](../blog/ml/data-preparation/feature-engineering/binning-discretization.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-engineering/datetime-features.html](../blog/ml/data-preparation/feature-engineering/datetime-features.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-engineering/index.html](../blog/ml/data-preparation/feature-engineering/index.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-engineering/interaction-features.html](../blog/ml/data-preparation/feature-engineering/interaction-features.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-engineering/polynomial-features.html](../blog/ml/data-preparation/feature-engineering/polynomial-features.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-engineering/text-features.html](../blog/ml/data-preparation/feature-engineering/text-features.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-scaling/index.html](../blog/ml/data-preparation/feature-scaling/index.html) | Reviewed | Future50 maps2.2361; four stages and play/pause/reset verified; pipeline fitting boundaries clear. |
| [data-preparation/feature-scaling/max-abs-and-unit-norm.html](../blog/ml/data-preparation/feature-scaling/max-abs-and-unit-norm.html) | Reviewed | All column/row modes checked; exact unit-circle geometry and A/B/C/D key; labels14.9px at320 and noJS. |
| [data-preparation/feature-scaling/min-max-normalization.html](../blog/ml/data-preparation/feature-scaling/min-max-normalization.html) | Reviewed | Extrapolation40→1.5, clipping/inverse and constant-column behavior reproduced; all controls and figures verified. |
| [data-preparation/feature-scaling/normalization-vs-standardization.html](../blog/ml/data-preparation/feature-scaling/normalization-vs-standardization.html) | Reviewed | Python and all three modes match; column/row transformations and training boundaries clear; figures checked. |
| [data-preparation/feature-scaling/robust-scaling.html](../blog/ml/data-preparation/feature-scaling/robust-scaling.html) | Reviewed | Python/C++ center4 IQR4;100→24; all slider extremes and zero-IQR caveats checked; figures readable. |
| [data-preparation/feature-scaling/scaling-sparse-data.html](../blog/ml/data-preparation/feature-scaling/scaling-sparse-data.html) | Reviewed | Implicit-zero variance and stored2.1213/future1.0607 reproduced; all matrix states and storage distinctions correct. |
| [data-preparation/feature-scaling/standardization.html](../blog/ml/data-preparation/feature-scaling/standardization.html) | Reviewed | All examples and controls checked; matched frequencies and added sample statistics verified; figure labels14.9px at320 and noJS. |
| [data-preparation/feature-scaling/when-to-scale.html](../blog/ml/data-preparation/feature-scaling/when-to-scale.html) | Reviewed | Python/C++ neighbor switch and nonlinear-tree counterexample reproduced; threshold2 vs5 and future2.1 predictions correct. |
| [data-preparation/feature-selection/chi-square.html](../blog/ml/data-preparation/feature-selection/chi-square.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-selection/correlation-filter.html](../blog/ml/data-preparation/feature-selection/correlation-filter.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-selection/feature-importance.html](../blog/ml/data-preparation/feature-selection/feature-importance.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-selection/index.html](../blog/ml/data-preparation/feature-selection/index.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-selection/l1-regularization.html](../blog/ml/data-preparation/feature-selection/l1-regularization.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-selection/mutual-information.html](../blog/ml/data-preparation/feature-selection/mutual-information.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-selection/recursive-feature-elimination.html](../blog/ml/data-preparation/feature-selection/recursive-feature-elimination.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-selection/variance-threshold.html](../blog/ml/data-preparation/feature-selection/variance-threshold.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-selection/why-feature-selection.html](../blog/ml/data-preparation/feature-selection/why-feature-selection.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-transformation/box-cox.html](../blog/ml/data-preparation/feature-transformation/box-cox.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-transformation/index.html](../blog/ml/data-preparation/feature-transformation/index.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-transformation/log-transform.html](../blog/ml/data-preparation/feature-transformation/log-transform.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-transformation/power-transforms.html](../blog/ml/data-preparation/feature-transformation/power-transforms.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-transformation/quantile-transform.html](../blog/ml/data-preparation/feature-transformation/quantile-transform.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-transformation/skewness.html](../blog/ml/data-preparation/feature-transformation/skewness.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/feature-transformation/yeo-johnson.html](../blog/ml/data-preparation/feature-transformation/yeo-johnson.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/imbalance/adasyn.html](../blog/ml/data-preparation/imbalance/adasyn.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/imbalance/class-weights.html](../blog/ml/data-preparation/imbalance/class-weights.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/imbalance/evaluating-imbalance.html](../blog/ml/data-preparation/imbalance/evaluating-imbalance.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/imbalance/index.html](../blog/ml/data-preparation/imbalance/index.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/imbalance/random-oversampling.html](../blog/ml/data-preparation/imbalance/random-oversampling.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/imbalance/random-undersampling.html](../blog/ml/data-preparation/imbalance/random-undersampling.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/imbalance/smote.html](../blog/ml/data-preparation/imbalance/smote.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/imbalance/the-imbalance-problem.html](../blog/ml/data-preparation/imbalance/the-imbalance-problem.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/imbalance/threshold-moving.html](../blog/ml/data-preparation/imbalance/threshold-moving.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/index.html](../blog/ml/data-preparation/index.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/missing-values/backward-fill.html](../blog/ml/data-preparation/missing-values/backward-fill.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/missing-values/constant-imputation.html](../blog/ml/data-preparation/missing-values/constant-imputation.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/missing-values/deletion.html](../blog/ml/data-preparation/missing-values/deletion.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/missing-values/forward-backward-fill.html](../blog/ml/data-preparation/missing-values/forward-backward-fill.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/missing-values/forward-fill.html](../blog/ml/data-preparation/missing-values/forward-fill.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/missing-values/index.html](../blog/ml/data-preparation/missing-values/index.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/missing-values/iterative-imputation.html](../blog/ml/data-preparation/missing-values/iterative-imputation.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/missing-values/knn-imputation.html](../blog/ml/data-preparation/missing-values/knn-imputation.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/missing-values/missingness-indicators.html](../blog/ml/data-preparation/missing-values/missingness-indicators.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/missing-values/missingness-mechanisms.html](../blog/ml/data-preparation/missing-values/missingness-mechanisms.html) | Reviewed | Identical observed distributions; interactive sensitivity arithmetic; mobile and no-JS. |
| [data-preparation/missing-values/multiple-imputation.html](../blog/ml/data-preparation/missing-values/multiple-imputation.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/missing-values/simple-imputation.html](../blog/ml/data-preparation/missing-values/simple-imputation.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/outliers/index.html](../blog/ml/data-preparation/outliers/index.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/outliers/iqr-method.html](../blog/ml/data-preparation/outliers/iqr-method.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/outliers/isolation-forest.html](../blog/ml/data-preparation/outliers/isolation-forest.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/outliers/local-outlier-factor.html](../blog/ml/data-preparation/outliers/local-outlier-factor.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/outliers/remove-vs-keep.html](../blog/ml/data-preparation/outliers/remove-vs-keep.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/outliers/what-is-an-outlier.html](../blog/ml/data-preparation/outliers/what-is-an-outlier.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/outliers/winsorizing-and-capping.html](../blog/ml/data-preparation/outliers/winsorizing-and-capping.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/outliers/z-score-method.html](../blog/ml/data-preparation/outliers/z-score-method.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/pipelines/avoiding-leakage.html](../blog/ml/data-preparation/pipelines/avoiding-leakage.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/pipelines/column-transformer.html](../blog/ml/data-preparation/pipelines/column-transformer.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/pipelines/index.html](../blog/ml/data-preparation/pipelines/index.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/pipelines/preprocessing-pipelines.html](../blog/ml/data-preparation/pipelines/preprocessing-pipelines.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/pipelines/reproducibility.html](../blog/ml/data-preparation/pipelines/reproducibility.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/pipelines/saving-transformers.html](../blog/ml/data-preparation/pipelines/saving-transformers.html) | Pending | Individual content, example and visual review outstanding. |
| [data-preparation/train-test-split/data-leakage-in-splitting.html](../blog/ml/data-preparation/train-test-split/data-leakage-in-splitting.html) | Reviewed | Full noise experiment gives 146 versus 101 correct; 73% leaked versus 50.5% proper; figures match. |
| [data-preparation/train-test-split/group-splitting.html](../blog/ml/data-preparation/train-test-split/group-splitting.html) | Reviewed | Identity example independently gives 100% row-split versus 50% group-split; five of 30 held-out rows reproduced. |
| [data-preparation/train-test-split/hold-out-split.html](../blog/ml/data-preparation/train-test-split/hold-out-split.html) | Reviewed | Executed disjoint 600/200/200 partitions; fractional rounding and 2.121-point binomial SE verified; figures readable. |
| [data-preparation/train-test-split/holdout-vs-cross-validation.html](../blog/ml/data-preparation/train-test-split/holdout-vs-cross-validation.html) | Reviewed | Nine search fits plus refit reproduced; C=1 and test accuracy 0.80; illustrative ranking distinguished from computed output. |
| [data-preparation/train-test-split/index.html](../blog/ml/data-preparation/train-test-split/index.html) | Reviewed | All allocation states preserve 296 positives; rate arithmetic, play/reset and responsive bars verified at 1440/390/320. |
| [data-preparation/train-test-split/reproducibility-and-seeds.html](../blog/ml/data-preparation/train-test-split/reproducibility-and-seeds.html) | Reviewed | Executed hash allocation passes reorder and append invariance; randomness/replay and group/time caveats checked. |
| [data-preparation/train-test-split/stratified-splitting.html](../blog/ml/data-preparation/train-test-split/stratified-splitting.html) | Reviewed | All 30 random/stratified draws checked; missing-positive probability 4368/15504; classes and reset preserved. |
| [data-preparation/train-test-split/time-series-splitting.html](../blog/ml/data-preparation/train-test-split/time-series-splitting.html) | Reviewed | All rolling schedules and delayed-label boundaries reproduced; day-14 fitting cutoff/day-23 complete scoring correct. |
| [data-preparation/train-test-split/train-validation-test.html](../blog/ml/data-preparation/train-test-split/train-validation-test.html) | Reviewed | Selection example and final recall 70% / precision 82.35% reproduced; adaptive validation and threshold transfer explained. |
| [decision-trees/deep-dive/bagging-random-forests.html](../blog/ml/decision-trees/deep-dive/bagging-random-forests.html) | Reviewed | All five samples, OOB sets, multiplicities and tallyA4/B1 verified; probability mean0.41; native14–16px panels and noJS. |
| [decision-trees/deep-dive/boosting-adaboost.html](../blog/ml/decision-trees/deep-dive/boosting-adaboost.html) | Needs improvement | All five rounds independently reproduced; essential mobile metrics and plot labels about 4.19px. Stack and enlarge. |
| [decision-trees/deep-dive/cart-complexity-pruning.html](../blog/ml/decision-trees/deep-dive/cart-complexity-pruning.html) | Reviewed | All six trees, 12 error coordinates and penalized costs checked; best4leaves; responsive14px labels and selected-tree fallback. |
| [decision-trees/deep-dive/entropy-from-kl.html](../blog/ml/decision-trees/deep-dive/entropy-from-kl.html) | Pending | Individual content, example and visual review outstanding. |
| [decision-trees/deep-dive/impurity-and-information-gain.html](../blog/ml/decision-trees/deep-dive/impurity-and-information-gain.html) | Pending | Individual content, example and visual review outstanding. |
| [decision-trees/deep-dive/index.html](../blog/ml/decision-trees/deep-dive/index.html) | Reviewed | All four partitions preserve 12 rows and query (7,2) to B; labels at least 14px; reset/play/resize and no-JS checked. |
| [decision-trees/deep-dive/threshold-search-edge-cases.html](../blog/ml/decision-trees/deep-dive/threshold-search-edge-cases.html) | Reviewed | All three partitions, midpoint/endpoint rules and duplicate counts verified; native14/16px labels, play/reset/resize and no-JS. |
| [decision-trees/handwritten-notes/bagging-random-forests.html](../blog/ml/decision-trees/handwritten-notes/bagging-random-forests.html) | Pending | Individual content, example and visual review outstanding. |
| [decision-trees/handwritten-notes/boosting-adaboost.html](../blog/ml/decision-trees/handwritten-notes/boosting-adaboost.html) | Pending | Individual content, example and visual review outstanding. |
| [decision-trees/handwritten-notes/cart-and-complexity.html](../blog/ml/decision-trees/handwritten-notes/cart-and-complexity.html) | Pending | Individual content, example and visual review outstanding. |
| [decision-trees/handwritten-notes/entropy-from-kl.html](../blog/ml/decision-trees/handwritten-notes/entropy-from-kl.html) | Pending | Individual content, example and visual review outstanding. |
| [decision-trees/handwritten-notes/entropy-information-gain.html](../blog/ml/decision-trees/handwritten-notes/entropy-information-gain.html) | Pending | Individual content, example and visual review outstanding. |
| [decision-trees/handwritten-notes/index.html](../blog/ml/decision-trees/handwritten-notes/index.html) | Pending | Individual content, example and visual review outstanding. |
| [explainability/index.html](../blog/ml/explainability/index.html) | Pending | Individual content, example and visual review outstanding. |
| [explainability/shap-lime/choosing-explainers.html](../blog/ml/explainability/shap-lime/choosing-explainers.html) | Pending | Individual content, example and visual review outstanding. |
| [explainability/shap-lime/index.html](../blog/ml/explainability/shap-lime/index.html) | Pending | Individual content, example and visual review outstanding. |
| [explainability/shap-lime/kernel-shap.html](../blog/ml/explainability/shap-lime/kernel-shap.html) | Pending | Individual content, example and visual review outstanding. |
| [explainability/shap-lime/lime-local-surrogates.html](../blog/ml/explainability/shap-lime/lime-local-surrogates.html) | Pending | Individual content, example and visual review outstanding. |
| [explainability/shap-lime/shapley-values.html](../blog/ml/explainability/shap-lime/shapley-values.html) | Pending | Individual content, example and visual review outstanding. |
| [explainability/tree-shap/ensembles-and-global.html](../blog/ml/explainability/tree-shap/ensembles-and-global.html) | Pending | Individual content, example and visual review outstanding. |
| [explainability/tree-shap/index.html](../blog/ml/explainability/tree-shap/index.html) | Pending | Individual content, example and visual review outstanding. |
| [explainability/tree-shap/limitations.html](../blog/ml/explainability/tree-shap/limitations.html) | Pending | Individual content, example and visual review outstanding. |
| [explainability/tree-shap/path-contributions.html](../blog/ml/explainability/tree-shap/path-contributions.html) | Pending | Individual content, example and visual review outstanding. |
| [explainability/tree-shap/why-tree-shap.html](../blog/ml/explainability/tree-shap/why-tree-shap.html) | Pending | Individual content, example and visual review outstanding. |
| [gradient-boosted-machines/index.html](../blog/ml/gradient-boosted-machines/index.html) | Reviewed | Four actual boosting rounds; independent numerical check; responsive axes at 320px. |
| [gradient-boosted-machines/modern-gbm.html](../blog/ml/gradient-boosted-machines/modern-gbm.html) | Reviewed | Row-to-bin figure readable at 320px; prefix sums and missed-split counterexample independently computed; disclosure and links checked. |
| [gradient-boosted-machines/regularization.html](../blog/ml/gradient-boosted-machines/regularization.html) | Reviewed | All14 curve values and best round 5 / stopping round 7 patience; readable static figure at320px and no-JS. |
| [gradient-boosted-machines/tree-base-learners.html](../blog/ml/gradient-boosted-machines/tree-base-learners.html) | Reviewed | Three threshold fits; means/SSE; all selections and no-JS at 1440/390. |
| [graph-ml/build-an-application-graph.html](../blog/ml/graph-ml/build-an-application-graph.html) | Pending | Individual content, example and visual review outstanding. |
| [graph-ml/evaluate-graph-risk.html](../blog/ml/graph-ml/evaluate-graph-risk.html) | Pending | Individual content, example and visual review outstanding. |
| [graph-ml/index.html](../blog/ml/graph-ml/index.html) | Pending | Individual content, example and visual review outstanding. |
| [graph-ml/neighborhood-evidence-and-propagation.html](../blog/ml/graph-ml/neighborhood-evidence-and-propagation.html) | Pending | Individual content, example and visual review outstanding. |
| [index.html](../blog/ml/index.html) | Pending | Individual content, example and visual review outstanding. |
| [nlp/index.html](../blog/ml/nlp/index.html) | Pending | Individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/index.html](../blog/ml/nlp/popular-textbooks/index.html) | Pending | Individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/speech-and-language-processing/embeddings.html](../blog/ml/nlp/popular-textbooks/speech-and-language-processing/embeddings.html) | Pending | Individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/speech-and-language-processing/index.html](../blog/ml/nlp/popular-textbooks/speech-and-language-processing/index.html) | Pending | Individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/speech-and-language-processing/information-retrieval-and-rag.html](../blog/ml/nlp/popular-textbooks/speech-and-language-processing/information-retrieval-and-rag.html) | Pending | Newly published; individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/speech-and-language-processing/interpretability.html](../blog/ml/nlp/popular-textbooks/speech-and-language-processing/interpretability.html) | Pending | Newly published; individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/speech-and-language-processing/introduction.html](../blog/ml/nlp/popular-textbooks/speech-and-language-processing/introduction.html) | Pending | Individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/speech-and-language-processing/logistic-regression.html](../blog/ml/nlp/popular-textbooks/speech-and-language-processing/logistic-regression.html) | Pending | Individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/speech-and-language-processing/machine-translation.html](../blog/ml/nlp/popular-textbooks/speech-and-language-processing/machine-translation.html) | Pending | Newly published; individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/speech-and-language-processing/masked-language-models.html](../blog/ml/nlp/popular-textbooks/speech-and-language-processing/masked-language-models.html) | Pending | Newly published; individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/speech-and-language-processing/neural-networks.html](../blog/ml/nlp/popular-textbooks/speech-and-language-processing/neural-networks.html) | Pending | Individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/speech-and-language-processing/ngram-language-models.html](../blog/ml/nlp/popular-textbooks/speech-and-language-processing/ngram-language-models.html) | Pending | Individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/speech-and-language-processing/phonetics-and-speech-features.html](../blog/ml/nlp/popular-textbooks/speech-and-language-processing/phonetics-and-speech-features.html) | Pending | Newly published; individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/speech-and-language-processing/post-training.html](../blog/ml/nlp/popular-textbooks/speech-and-language-processing/post-training.html) | Pending | Newly published; individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/speech-and-language-processing/rnns-and-lstms.html](../blog/ml/nlp/popular-textbooks/speech-and-language-processing/rnns-and-lstms.html) | Pending | Newly published; individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/speech-and-language-processing/transformers-and-pretraining.html](../blog/ml/nlp/popular-textbooks/speech-and-language-processing/transformers-and-pretraining.html) | Pending | Newly published; individual content, example and visual review outstanding. |
| [nlp/popular-textbooks/speech-and-language-processing/words-and-tokens.html](../blog/ml/nlp/popular-textbooks/speech-and-language-processing/words-and-tokens.html) | Pending | Individual content, example and visual review outstanding. |
| [recommended-papers/index.html](../blog/ml/recommended-papers/index.html) | Pending | Individual content, example and visual review outstanding. |
| [recommended-papers/nlp/bahdanau-2015-attention.html](../blog/ml/recommended-papers/nlp/bahdanau-2015-attention.html) | Reviewed | Original additive attention, all four masking/query states,10 parameter gradients within1.3e-10; source Table1 caveats; figures and noJS checked. |
| [recommended-papers/nlp/bengio-2003-neural-lm.html](../blog/ml/recommended-papers/nlp/bengio-2003-neural-lm.html) | Reviewed | Complete toy network; finite-difference gradient checks; sourced results; desktop/mobile. |
| [recommended-papers/nlp/brown-2020-gpt3.html](../blog/ml/recommended-papers/nlp/brown-2020-gpt3.html) | Needs expansion | Published scaffold; replace placeholders with a complete explanation, evidence and useful figures. |
| [recommended-papers/nlp/devlin-2019-bert.html](../blog/ml/recommended-papers/nlp/devlin-2019-bert.html) | Needs expansion | Published scaffold; replace placeholders with a complete explanation, evidence and useful figures. |
| [recommended-papers/nlp/hoffmann-2022-chinchilla.html](../blog/ml/recommended-papers/nlp/hoffmann-2022-chinchilla.html) | Needs expansion | Published scaffold; replace placeholders with a complete explanation, evidence and useful figures. |
| [recommended-papers/nlp/index.html](../blog/ml/recommended-papers/nlp/index.html) | Pending | Individual content, example and visual review outstanding. |
| [recommended-papers/nlp/kaplan-2020-scaling-laws.html](../blog/ml/recommended-papers/nlp/kaplan-2020-scaling-laws.html) | Needs expansion | Published scaffold; replace placeholders with a complete explanation, evidence and useful figures. |
| [recommended-papers/nlp/peters-2018-elmo.html](../blog/ml/recommended-papers/nlp/peters-2018-elmo.html) | Needs expansion | Published scaffold; replace placeholders with a complete explanation, evidence and useful figures. |
| [recommended-papers/nlp/radford-2019-gpt2.html](../blog/ml/recommended-papers/nlp/radford-2019-gpt2.html) | Needs expansion | Published scaffold; replace placeholders with a complete explanation, evidence and useful figures. |
| [recommended-papers/nlp/sennrich-2016-bpe.html](../blog/ml/recommended-papers/nlp/sennrich-2016-bpe.html) | Reviewed | Weighted merge counts; four saved-rule traces; seven states; no-JS and 320px. |
| [recommended-papers/nlp/shannon-1950-entropy.html](../blog/ml/recommended-papers/nlp/shannon-1950-entropy.html) | Needs expansion | Published scaffold; replace placeholders with a complete explanation, evidence and useful figures. |
| [recommended-papers/nlp/sutskever-2014-seq2seq.html](../blog/ml/recommended-papers/nlp/sutskever-2014-seq2seq.html) | Reviewed | Original conditional table; teacher inputs, beam widths 1/2 and reversal gaps; all controls and 320px. |
| [recommended-papers/nlp/vaswani-2017-transformer.html](../blog/ml/recommended-papers/nlp/vaswani-2017-transformer.html) | Needs expansion | Published scaffold; replace placeholders with a complete explanation, evidence and useful figures. |
| [regression/assumptions-linear-and-logistic.html](../blog/ml/regression/assumptions-linear-and-logistic.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/families/bayesian-regression.html](../blog/ml/regression/families/bayesian-regression.html) | Reviewed | Normal posterior and predictive integration; sensitivity and intervals; decoded mobile figures. |
| [regression/families/censored-and-survival-regression.html](../blog/ml/regression/families/censored-and-survival-regression.html) | Reviewed | Event timelines; exact KM and Cox example checked with SciPy; desktop/mobile. |
| [regression/families/generalized-linear-models.html](../blog/ml/regression/families/generalized-linear-models.html) | Reviewed | Exact binomial/Poisson fits, IRLS vs optimizer and expanded trials, offsets, probabilities and deviance verified; all figures at1440/390/320. |
| [regression/families/index.html](../blog/ml/regression/families/index.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/families/pcr-and-pls.html](../blog/ml/regression/families/pcr-and-pls.html) | Reviewed | Manual SVD/covariance agrees with sklearn; PCR1 MSE 2.5, PLS1/PCR2 zero; scaling/alternate response and all figure widths checked. |
| [regression/families/polynomial-and-basis-regression.html](../blog/ml/regression/families/polynomial-and-basis-regression.html) | Needs improvement | Replace generic paired bars with topic-specific geometry/distributions; verify worked examples and add primary references. |
| [regression/families/splines-and-gams.html](../blog/ml/regression/families/splines-and-gams.html) | Reviewed | Actual spline fits; EDF/SSE checks; meaningful curves and portable fonts. |
| [regression/families/weighted-and-generalized-least-squares.html](../blog/ml/regression/families/weighted-and-generalized-least-squares.html) | Reviewed | Three exact fits, covariance contours, whitening and prediction variance verified; actual figures readable at1440/390/320. |
| [regression/index.html](../blog/ml/regression/index.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/linear/diagnostics-and-evaluation.html](../blog/ml/regression/linear/diagnostics-and-evaluation.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/linear/gauss-markov-and-inference.html](../blog/ml/regression/linear/gauss-markov-and-inference.html) | Needs improvement | Supply the actual six-point dataset behind the stated 5.400 mean and interval. |
| [regression/linear/gradient-descent.html](../blog/ml/regression/linear/gradient-descent.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/linear/index.html](../blog/ml/regression/linear/index.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/linear/interview-derivations.html](../blog/ml/regression/linear/interview-derivations.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/linear/model-specification.html](../blog/ml/regression/linear/model-specification.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/linear/multicollinearity-and-fwl.html](../blog/ml/regression/linear/multicollinearity-and-fwl.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/linear/numerical-solvers.html](../blog/ml/regression/linear/numerical-solvers.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/linear/ols-and-projection.html](../blog/ml/regression/linear/ols-and-projection.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/linear/production-failure-modes.html](../blog/ml/regression/linear/production-failure-modes.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/linear/regularization.html](../blog/ml/regression/linear/regularization.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/linear/robust-and-quantile.html](../blog/ml/regression/linear/robust-and-quantile.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/linear/what-linear-regression-estimates.html](../blog/ml/regression/linear/what-linear-regression-estimates.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/logistic/calibration.html](../blog/ml/regression/logistic/calibration.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/logistic/classification-metrics.html](../blog/ml/regression/logistic/classification-metrics.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/logistic/diagnostics-and-production-failures.html](../blog/ml/regression/logistic/diagnostics-and-production-failures.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/logistic/index.html](../blog/ml/regression/logistic/index.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/logistic/interview-derivations.html](../blog/ml/regression/logistic/interview-derivations.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/logistic/mle-and-log-loss.html](../blog/ml/regression/logistic/mle-and-log-loss.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/logistic/multiclass-softmax.html](../blog/ml/regression/logistic/multiclass-softmax.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/logistic/optimization-gradient-newton-irls.html](../blog/ml/regression/logistic/optimization-gradient-newton-irls.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/logistic/probability-odds-and-interpretation.html](../blog/ml/regression/logistic/probability-odds-and-interpretation.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/logistic/regularization-and-separation.html](../blog/ml/regression/logistic/regularization-and-separation.html) | Pending | Individual content, example and visual review outstanding. |
| [regression/logistic/thresholds-imbalance-and-costs.html](../blog/ml/regression/logistic/thresholds-imbalance-and-costs.html) | Pending | Individual content, example and visual review outstanding. |
| [representation-learning/evaluate-embeddings-and-dimensions.html](../blog/ml/representation-learning/evaluate-embeddings-and-dimensions.html) | Pending | Individual content, example and visual review outstanding. |
| [representation-learning/index.html](../blog/ml/representation-learning/index.html) | Pending | Individual content, example and visual review outstanding. |
| [representation-learning/word2vec-from-activity-sequences.html](../blog/ml/representation-learning/word2vec-from-activity-sequences.html) | Pending | Individual content, example and visual review outstanding. |
| [search-and-retrieval/benchmark-ann-search.html](../blog/ml/search-and-retrieval/benchmark-ann-search.html) | Pending | Individual content, example and visual review outstanding. |
| [search-and-retrieval/evaluation/index.html](../blog/ml/search-and-retrieval/evaluation/index.html) | Pending | Individual content, example and visual review outstanding. |
| [search-and-retrieval/evaluation/ndcg-and-ranking-utility.html](../blog/ml/search-and-retrieval/evaluation/ndcg-and-ranking-utility.html) | Pending | Individual content, example and visual review outstanding. |
| [search-and-retrieval/evaluation/online-experiments-and-click-bias.html](../blog/ml/search-and-retrieval/evaluation/online-experiments-and-click-bias.html) | Pending | Individual content, example and visual review outstanding. |
| [search-and-retrieval/evaluation/precision-recall-map-mrr.html](../blog/ml/search-and-retrieval/evaluation/precision-recall-map-mrr.html) | Pending | Individual content, example and visual review outstanding. |
| [search-and-retrieval/evaluation/rag-evaluation-from-evidence-to-answer.html](../blog/ml/search-and-retrieval/evaluation/rag-evaluation-from-evidence-to-answer.html) | Pending | Individual content, example and visual review outstanding. |
| [search-and-retrieval/evaluation/relevance-judgments-and-test-collections.html](../blog/ml/search-and-retrieval/evaluation/relevance-judgments-and-test-collections.html) | Pending | Individual content, example and visual review outstanding. |
| [search-and-retrieval/evaluation/retrieval-reranking-and-ann-diagnostics.html](../blog/ml/search-and-retrieval/evaluation/retrieval-reranking-and-ann-diagnostics.html) | Pending | Individual content, example and visual review outstanding. |
| [search-and-retrieval/evaluation/uncertainty-and-model-comparison.html](../blog/ml/search-and-retrieval/evaluation/uncertainty-and-model-comparison.html) | Pending | Individual content, example and visual review outstanding. |
| [search-and-retrieval/hnsw-and-annoy-internals.html](../blog/ml/search-and-retrieval/hnsw-and-annoy-internals.html) | Pending | Individual content, example and visual review outstanding. |
| [search-and-retrieval/index.html](../blog/ml/search-and-retrieval/index.html) | Pending | Individual content, example and visual review outstanding. |

## Exclusions

- Leave `blog/ml/loss-functions/**` and `blog/ml/gradient-boosted-machines/loss-functions.html` unchanged.
- The legacy CS336 URL is a redirect to Deep Learning, not a separate ML lesson.

## Reproducible checks already available

- `node tools/check_ml_navigation.mjs` verifies registry, prerequisites, files, and selected reading sequences. It does not verify pedagogy or mathematics.
- The Bengio, BPE, seq2seq, and additive-attention companion scripts reproduce their original examples with the Python standard library. Attention checks ten parameter gradients with finite differences.
- Regression generators reproduce smoothing, survival, Bayesian updating, PCR/PLS, WLS/GLS, and GLM examples using independent calculations or numerical/library cross-checks. Standard-library scripts reproduce exact fitted bootstrap stumps, OOB errors, and two squared-error boosting updates.
- When unrelated incomplete pages make the working-tree navigation check fail, also run it against an isolated `git archive HEAD` snapshot to assess the published version. Never remove someone else’s unfinished work merely to make the check pass.
