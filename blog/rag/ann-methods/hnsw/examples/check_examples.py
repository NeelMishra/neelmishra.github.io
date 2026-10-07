"""Run with Python 3; no third-party dependencies are needed."""

import json
import math
from pathlib import Path
import random
import unittest

from reference import (GRAPH, QUERY, VECTORS, exact_topk, level_from_uniform,
                       overlap_recall, search_layer, select_diverse, squared_l2)


class HNSWExamples(unittest.TestCase):
    def test_barrier_requires_three_retained_candidates(self):
        self.assertEqual(exact_topk(QUERY, VECTORS, 1), ["D"])
        for ef in (1, 2):
            result = search_layer(QUERY, VECTORS, GRAPH, "A", ef)
            self.assertEqual(result["nearest"][0], "B")
            self.assertEqual(result["distance_evaluations"], 3)
            self.assertNotIn("C", result["traces"][-1]["expanded"])
        result = search_layer(QUERY, VECTORS, GRAPH, "A", 3)
        self.assertEqual(result["nearest"], ["D", "B", "A"])
        self.assertEqual(result["distance_evaluations"], 4)
        self.assertEqual(result["traces"][-1]["expanded"], ["A", "B", "C", "D"])
        for trace in result["traces"]:
            self.assertLessEqual(len(trace["retained"]), 3)
            self.assertLessEqual(set(trace["expanded"]), set(trace["visited"]))

    def test_complete_graph_recovers_exact_neighbors(self):
        rng = random.Random(72)
        vectors = {str(i): tuple(rng.uniform(-2, 2) for _ in range(3))
                   for i in range(20)}
        graph = {node: tuple(other for other in vectors if other != node)
                 for node in vectors}
        for _ in range(10):
            query = tuple(rng.uniform(-2, 2) for _ in range(3))
            result = search_layer(query, vectors, graph, "0", 5)
            self.assertEqual(result["nearest"], exact_topk(query, vectors, 5))

    def test_diversity_and_optional_refill(self):
        vectors = {"a": (1., 0.), "b": (1.1, .1), "c": (0., 1.2)}
        self.assertEqual(exact_topk(QUERY, vectors, 2), ["a", "b"])
        self.assertEqual(select_diverse(QUERY, vectors, list(vectors), 2), ["a", "c"])
        self.assertAlmostEqual(squared_l2(QUERY, vectors["b"]), 1.22)
        self.assertAlmostEqual(squared_l2(vectors["a"], vectors["b"]), .02)
        self.assertAlmostEqual(squared_l2(vectors["a"], vectors["c"]), 2.44)
        clustered = {"a": (1., 0.), "b": (1.1, 0.), "c": (1.2, 0.)}
        self.assertEqual(select_diverse(QUERY, clustered, list(clustered), 3), ["a"])
        self.assertEqual(select_diverse(QUERY, clustered, list(clustered), 3, True),
                         ["a", "b", "c"])

    def test_level_distribution_and_memory_arithmetic(self):
        self.assertEqual(level_from_uniform(1., 16), 0)
        self.assertEqual(level_from_uniform(.01, 16), 1)
        self.assertEqual(level_from_uniform(.001, 16), 2)
        self.assertAlmostEqual(math.exp(-2 * math.log(16)), 1 / 256)
        self.assertEqual(1_000_000 * 768 * 4, 3_072_000_000)
        self.assertEqual(1_000_000 * 2 * 16 * 4, 128_000_000)

    def test_normalized_metrics(self):
        q, x = (1., 0.), (.6, .8)
        self.assertAlmostEqual(squared_l2(q, x), 2 - 2 * sum(a*b for a, b in zip(q, x)))
        self.assertEqual(overlap_recall(["A", "B", "C"], ["B", "D", "A"]), 2/3)

    def test_filtered_ground_truth(self):
        vectors = {"X": (.1, 0.), "Y": (.2, 0.), "A": (.3, 0.),
                   "B": (.4, 0.), "C": (.5, 0.)}
        eligible = {"A", "B", "C"}
        global_top = exact_topk(QUERY, vectors, 2)
        self.assertEqual(global_top, ["X", "Y"])
        self.assertEqual([node for node in global_top if node in eligible], [])
        self.assertEqual(exact_topk(QUERY, vectors, 2, eligible), ["A", "B"])

    def test_invalid_inputs_raise(self):
        for ef in (0, -1, True, 1.5):
            with self.assertRaises(ValueError):
                search_layer(QUERY, VECTORS, GRAPH, "A", ef)
        with self.assertRaises(ValueError):
            squared_l2((math.nan,), (0.,))
        with self.assertRaises(ValueError):
            squared_l2((1.,), (0., 2.))
        with self.assertRaises(ValueError):
            exact_topk(QUERY, VECTORS, 1, {"missing"})
        with self.assertRaises(ValueError):
            overlap_recall([], [])
        with self.assertRaises(ValueError):
            overlap_recall(["A"], ["A", "A"])
        with self.assertRaises(ValueError):
            level_from_uniform(0., 16)


def export_traces():
    output = Path(__file__).resolve().parents[1] / "assets/search-traces.json"
    output.parent.mkdir(exist_ok=True)
    data = {
        "metric": "squared_l2", "query": list(QUERY),
        "vectors": {node: list(vector) for node, vector in VECTORS.items()},
        "graph": {node: list(neighbors) for node, neighbors in GRAPH.items()},
        "runs": {str(ef): search_layer(QUERY, VECTORS, GRAPH, "A", ef)
                 for ef in (1, 2, 3)},
    }
    output.write_text(json.dumps(data, indent=2) + "\n")


if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(HNSWExamples)
    result = unittest.TextTestRunner(verbosity=1).run(suite)
    if not result.wasSuccessful():
        raise SystemExit(1)
    export_traces()
