"""Auditable ranking metrics for the Search & Retrieval Evaluation notes.

Run python retrieval_metrics.py for a worked example.
Run python retrieval_metrics.py --self-test for numerical and edge-case checks.

Conventions: unique document IDs; relevance means grade > 0; precision divides
by requested K even for short runs; AP defaults to all known relevant documents;
nDCG uses gain 2**grade - 1; empty relevance sets yield None for recall/AP/nDCG.
Unknown documents raise unless explicitly scored as zero. That policy does not
turn an unknown label into a judgment.
"""
import argparse
import json
import math
import random
import unittest


def ranking_metrics(ranking, qrels, k, *, ap_denominator="all", unjudged="error"):
    if isinstance(k, bool) or not isinstance(k, int) or k < 1:
        raise ValueError("k must be a positive integer")
    if len(set(ranking)) != len(ranking):
        raise ValueError("rankings must contain unique document IDs")
    if ap_denominator not in ("all", "min"):
        raise ValueError("ap_denominator must be 'all' or 'min'")
    if unjudged not in ("error", "zero"):
        raise ValueError("unjudged must be 'error' or 'zero'")
    if any(not isinstance(g, (int, float)) or not math.isfinite(g)
           or g < 0 or g > 100 for g in qrels.values()):
        raise ValueError("grades must be finite numbers in [0, 100]")
    returned = ranking[:k]
    unknown = [doc for doc in returned if doc not in qrels]
    if unknown and unjudged == "error":
        raise ValueError("unjudged returned documents: " + repr(unknown))
    relevant = sum(grade > 0 for grade in qrels.values())
    hits, ap_sum, rr, dcg = 0, 0.0, 0.0, 0.0
    for rank, doc in enumerate(returned, 1):
        grade = qrels.get(doc, 0)
        if grade > 0:
            hits += 1
            ap_sum += hits / rank
            if rr == 0:
                rr = 1 / rank
        dcg += (2 ** grade - 1) / math.log2(rank + 1)
    ideal_grades = sorted(qrels.values(), reverse=True)[:k]
    idcg = sum((2 ** g - 1) / math.log2(i + 2)
               for i, g in enumerate(ideal_grades))
    denominator = relevant if ap_denominator == "all" else min(relevant, k)
    return {
        "precision": hits / k, "recall": hits / relevant if relevant else None,
        "ap": ap_sum / denominator if denominator else None, "rr": rr,
        "ndcg": dcg / idcg if idcg else None, "dcg": dcg, "idcg": idcg,
        "relevant_total": relevant, "retrieved_relevant": hits,
        "returned_count": len(returned), "unjudged_count": len(unknown),
        "judged_fraction_of_returned": (
            (len(returned)-len(unknown))/len(returned) if returned else None),
    }


def evaluate(runs, qrels_by_query, k, **kwargs):
    """Macro means over the declared query set with per-metric counts.

    A missing run is empty. An extra unknown query is an error. No-answer
    queries remain in the report even when a metric is undefined.
    """
    extra = set(runs) - set(qrels_by_query)
    if extra:
        raise ValueError("runs contain unknown queries: " + repr(extra))
    per_query = {
        query: ranking_metrics(runs.get(query, []), qrels, k, **kwargs)
        for query, qrels in qrels_by_query.items()
    }
    aggregate = {}
    for metric in ("precision", "recall", "ap", "rr", "ndcg"):
        values = [r[metric] for r in per_query.values() if r[metric] is not None]
        aggregate[metric] = {
            "mean": sum(values)/len(values) if values else None,
            "included": len(values), "excluded": len(per_query)-len(values),
        }
    return {"per_query": per_query, "macro": aggregate}


def paired_bootstrap(a, b, *, repeats=10000, seed=7):
    """Percentile interval over independent paired units.

    Repeated users/sessions need a cluster resampler matching the estimand.
    """
    if len(a) != len(b) or not a:
        raise ValueError("use equal nonempty paired lists")
    if repeats < 100:
        raise ValueError("use at least 100 bootstrap repeats")
    if not all(math.isfinite(x) for x in list(a) + list(b)):
        raise ValueError("scores must be finite")
    differences = [y-x for x, y in zip(a, b)]
    rng, n = random.Random(seed), len(a)
    means = sorted(sum(differences[rng.randrange(n)] for _ in range(n))/n
                   for _ in range(repeats))
    return {
        "mean_difference": sum(differences)/n,
        "percentile_95_interval": [means[int(.025*repeats)],
                                  means[min(repeats-1, int(.975*repeats))]],
        "units": n, "seed": seed,
    }


class MetricChecks(unittest.TestCase):
    def setUp(self):
        self.qrels = {"A": 3, "B": 0, "C": 2, "D": 1, "E": 0, "F": 1}
        self.run = ["B", "A", "C", "E", "D", "F"]

    def test_worked_ranking(self):
        m = ranking_metrics(self.run, self.qrels, 5)
        self.assertAlmostEqual(m["precision"], .6)
        self.assertAlmostEqual(m["recall"], .75)
        self.assertAlmostEqual(m["ap"], 53/120)
        self.assertAlmostEqual(m["rr"], .5)
        self.assertAlmostEqual(ranking_metrics(self.run, self.qrels, 6)["ap"],
                               73/120)

    def test_ap_cutoff_conventions(self):
        self.assertEqual(ranking_metrics(self.run, self.qrels, 2)["ap"], .125)
        self.assertEqual(ranking_metrics(self.run, self.qrels, 2,
                                        ap_denominator="min")["ap"], .25)

    def test_ndcg_uses_full_collection_ideal(self):
        q = {"A": 3, "B": 2, "C": 1, "D": 0}
        m = ranking_metrics(["B", "D", "A"], q, 3)
        self.assertAlmostEqual(m["dcg"], 6.5)
        self.assertAlmostEqual(m["idcg"], 7+3/math.log2(3)+.5)
        self.assertLess(ranking_metrics(["B", "C", "D"], q, 3)["ndcg"], .4)

    def test_perfect_ranking(self):
        m = ranking_metrics(["A", "C", "D", "F", "B", "E"], self.qrels, 6)
        self.assertAlmostEqual(m["ap"], 1)
        self.assertAlmostEqual(m["ndcg"], 1)

    def test_short_run(self):
        m = ranking_metrics(["A"], self.qrels, 5)
        self.assertEqual(m["precision"], .2)
        self.assertEqual(m["recall"], .25)

    def test_duplicates_rejected(self):
        with self.assertRaises(ValueError):
            ranking_metrics(["A", "A"], self.qrels, 2)

    def test_unknown_policy(self):
        with self.assertRaises(ValueError):
            ranking_metrics(["Z", "A"], self.qrels, 2)
        m = ranking_metrics(["Z", "A"], self.qrels, 2, unjudged="zero")
        self.assertEqual(m["unjudged_count"], 1)
        self.assertEqual(m["judged_fraction_of_returned"], .5)
        self.assertEqual(m["precision"], .5)

    def test_no_relevant_documents(self):
        m = ranking_metrics(["B"], {"B": 0}, 5)
        for key in ("recall", "ap", "ndcg"):
            self.assertIsNone(m[key])
        self.assertEqual(m["rr"], 0)

    def test_empty_run_and_macro_exclusions(self):
        r = evaluate({"q1": ["A"]}, {"q1": {"A": 1}, "q2": {"B": 0}}, 1)
        self.assertEqual(r["macro"]["ap"]["included"], 1)
        self.assertEqual(r["macro"]["ap"]["excluded"], 1)
        self.assertEqual(r["macro"]["precision"]["mean"], .5)

    def test_invalid_inputs(self):
        for k in (0, -1, 1.5, True):
            with self.assertRaises(ValueError):
                ranking_metrics([], {}, k)
        for grade in (-1, float("nan"), float("inf")):
            with self.assertRaises(ValueError):
                ranking_metrics([], {"A": grade}, 1)

    def test_bootstrap_pairing(self):
        r = paired_bootstrap([.1, .4, .7], [.2, .5, .8], repeats=1000)
        self.assertAlmostEqual(r["mean_difference"], .1)
        for endpoint in r["percentile_95_interval"]:
            self.assertAlmostEqual(endpoint, .1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        unittest.main(argv=["retrieval_metrics.py"])
    else:
        qrels = {"A": 3, "B": 0, "C": 2, "D": 1, "E": 0, "F": 1}
        print(json.dumps(ranking_metrics(["B", "A", "C", "E", "D", "F"],
                                         qrels, 5), indent=2))
