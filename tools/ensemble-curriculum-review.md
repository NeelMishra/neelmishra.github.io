# Bagging and boosting curriculum review

Reviewed 24 September 2026. The canonical learning paths are `blog/ml/bagging/`
(five chapters) and `blog/ml/boosting/` (eight chapters). The former combined
index remains the shared roadmap; its five old article URLs redirect and retain
query strings and section fragments. Sections split into a later chapter have
explicit onward links at their former fragment IDs.

## Requirements and evidence

| Requirement | Current implementation and verification |
| --- | --- |
| Separate folders | Two physical chapter/asset folders, separate Explorer nodes, separate metadata series, and ordered prerequisites in `blog.js`. |
| More depth | Bagging covers bootstrap multiplicities, expectations, bias/variance, correlation, feature sampling, variants, tuning, OOB arithmetic/coverage, leakage, importance, and calibration. Boosting covers fitted AdaBoost rounds and proof, gradients, inference, binary/multiclass/loss variants, Newton/L1/L2 objectives, gains, constraints, library systems, tuning, and deployment. |
| Smooth progression | Shared roadmap and two path introductions; prerequisite recaps, defined notation, numeric examples before generalizations, optional derivations/checkpoints, chapter handoffs, and previous/next navigation throughout. Bootstrap details precede aggregation; classification is the final handoff from regression boosting. |
| Digestible figures and restrained interaction | Existing reproducible SVGs plus responsive HTML flow diagrams and a new early-stopping chart. Two user-controlled labs: five OOB committees and seven boosting states at each of three rates. No autoplay. |
| Interview preparation | Separate 45- and 60-minute workshops with explanations, numerical answers, derivations, coding contracts/edge cases, diagnostic scenarios, and self-assessment criteria. |
| Reproducible calculations | Exact-fraction bagging and two-round boosting scripts; `boosting/worked_examples.py` verifies fitted AdaBoost weights, 21 boosting states, loss derivatives, regularized gains, tie/constant cases, and early stopping. |
| Reading and interaction quality | Browser checks on all 14 pages at 1440, 390, and 320 pixels with optional proofs open; image decoding, math rendering, local links/anchors, unique IDs, active navigation, metadata order, and blog-index discovery. All pages also checked at 320 pixels without JavaScript. |
| Accessibility of labs | Native labelled controls, live status text, keyboard/reset/boundary checks, reduced-motion CSS, and complete static initial results. Mobile screenshots of both labs and all new diagrams inspected. |
| Publish each improvement | Folder migration, bagging expansion, and boosting expansion are separate commits, each pushed to `origin/main`. |

## Repeat the verification

Use a Python standard-library server from the repository root:

```sh
python3 -m http.server 8788 --bind 127.0.0.1
```

In another terminal, with Node and Playwright available:

```sh
python3 blog/ml/bagging/figures/bagging_oob_example.py
python3 blog/ml/boosting/figures/boosting_two_rounds.py
python3 blog/ml/boosting/worked_examples.py
node tools/check_ml_navigation.mjs
node tools/check_ensemble_curriculum.cjs
```

`NODE_PATH` may point to an existing Playwright installation. The browser check
uses installed Chrome by default; `BROWSER_PATH` overrides it. Set
`ENSEMBLE_SCREENSHOTS` to an output directory to capture the figures.

Numerical examples are teaching data, not benchmark claims. Early-stopping
losses are explicitly illustrative. Library-specific material cites primary
papers and documentation; mechanisms are distinguished from optional settings.
These workshops support preparation but do not promise an interview outcome.
