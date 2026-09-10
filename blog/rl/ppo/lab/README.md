# PPO LineWalk lab

Read [the implementation chapter](../implement-and-test-ppo.html) for the task,
algorithm, interpretation of results, and suggested experiments.

Use Python 3.10+ with NumPy and PyTorch installed in your own virtual environment:

```sh
python ppo_linewalk.py --check
python ppo_linewalk.py --seeds 0 1 2 --updates 80 --output results.json
```

The script runs on CPU with one PyTorch thread. It does not require Gymnasium.
`--check` runs independent numerical and gradient checks; it does not train.

`results.json` contains actual runs, including all sampled evaluation checkpoints,
the uniform-random baseline, package versions, and configuration. Each training
seed receives 40,960 environment transitions. Evaluation samples the policy for
512 episodes per checkpoint using a separate RNG with seed 12345. The fixed
evaluation stream makes comparisons repeatable without consuming training RNG.

The collector's 12-action limit is an external truncation of an underlying
reaching-goal task, so it bootstraps the final pre-reset state. Evaluation reports
undiscounted reward and success within a 12-action window; this measurement is
different from the discounted value-estimation objective. The maximum measured
return is 0.96. Finite sampled success of 100% is not a proof that a stochastic
policy can never fail.

To regenerate the standalone chart, install Matplotlib and run:

```sh
python -m pip install matplotlib
python plot_results.py
```

The chart reads `results.json` next to the plotting script and writes
`learning-curve.svg`. Lines connect recorded checkpoints, rather than measuring
what happened between them. This small task is a correctness and teaching lab;
it is not a reproduction of a published PPO control benchmark.
