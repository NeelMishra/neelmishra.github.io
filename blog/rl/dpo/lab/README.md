# DPO: an inspectable preference-learning lab

This CPU-only PyTorch lab checks the DPO equations and trains a finite policy on synthetic preference judgments. It downloads no model or dataset. Read the [accompanying chapter](../dpo-math-and-training-lab.html) for the derivation and interpretation.

The three prompts each have three possible whole responses. All three unordered response pairs receive 500 independent Bradley–Terry judgments per prompt: 4,500 labels per seed. The policy has three trainable logits per prompt. Recorded runs start at the fixed reference, use β = 0.7, and take 400 full-batch Adam steps with learning rate 0.05.

## Reproduce

Download the files into one directory, or enter `blog/rl/dpo/lab` in a site checkout. Python 3.10+ is required.

```sh
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
python -m pip install torch matplotlib
python dpo_lab.py --check
python dpo_lab.py --train --seeds 0 1 2 --output results.json
python plot_results.py
```

The recorded environment was Python 3.12.14, PyTorch 2.14.0, and Matplotlib 3.11.1; training uses float64 and one CPU thread. `results.json` records the Python and PyTorch versions. Small numerical differences across versions or platforms are possible. The deterministic mathematical assertions test the intended identities independently of a particular training trace.

## Files and checks

- `dpo_lab.py`: stable pair loss, causal response-score reduction, deterministic assertions, and training experiment.
- `results.json`: configuration, sampled left-win counts, all saved checkpoints, final policies, and the analytic population optimum.
- `plot_results.py`: derives the population preference-loss minimum from the known utilities and plots the recorded checkpoints.
- `learning-curve.svg`: standalone figure used in the notes. Lines connect measurements saved every 20 steps.

Run `--check` before training. It tests gradient signs and β scaling, the log-2 initialization, detached reference scores, stability at extreme margins, invariance to prompt-only reward shifts, the reward–KL optimality identity, probability counterexamples, causal token alignment, ignored-position gradients, padding invariance, empty-response rejection, and exact compression of binary judgments into counts.

## What the measurements mean

Training loss uses sampled judgment counts. A fractional target such as 0.7 represents 350 left wins out of 500 actual simulated binary labels; it is an exact compression, not label smoothing. Population loss instead averages over the known Bradley–Terry label probabilities. Since every pair and response can be enumerated, population evaluation needs no random holdout sample.

The population-optimal policy is `softmax(log(reference) + true_reward / beta)`. The lab reports KL to that optimum as well as expected utility, KL to the reference, and utility minus β times reference KL. Averaged over prompts, the gap from the optimal regularized objective equals β times KL to the optimal policy.

These results establish behavior in a specified synthetic world. They do not measure language-model quality, chat-template correctness, real annotation reliability, or distributed training performance.

For exercises, change one setting in `train`, record that configuration, and save a separate output: reduce label counts, remove comparisons involving one response, or fit exact population probabilities. The article explains predictions to test for each change. The plotting script expects the provided three-seed, 400-step experiment.
