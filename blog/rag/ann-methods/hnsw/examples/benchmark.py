"""A small CPU index benchmark; this is not a production RAG evaluation.

Install requirements.txt, then run:
python benchmark.py --output ../assets/benchmark-results.json
"""

import argparse
from datetime import datetime, timezone
import importlib.metadata
import json
from pathlib import Path
import platform
import tempfile
from time import perf_counter, perf_counter_ns

import faiss
import hnswlib
import numpy as np


SEED = 72
N, DIMENSION, QUERY_COUNT, K = 4000, 32, 128, 10
CONFIGURATIONS = ((8, 40), (16, 100))
SEARCH_EFS = (10, 40, 128)


def exact_neighbors(items, queries):
    items64 = items.astype(np.float64)
    ids = np.arange(len(items))
    return np.stack([
        np.lexsort((ids, np.sum((items64 - query.astype(np.float64))**2, axis=1)))[:K]
        for query in queries
    ])


def measure(library, items, queries, truth, maximum, construction_ef, directory):
    started = perf_counter()
    if library == "faiss":
        index = faiss.IndexHNSWFlat(DIMENSION, maximum, faiss.METRIC_L2)
        index.hnsw.rng = faiss.RandomGenerator(SEED)
        index.hnsw.efConstruction = construction_ef
        index.add(items)
    elif library == "hnswlib":
        index = hnswlib.Index(space="l2", dim=DIMENSION)
        index.init_index(max_elements=N, M=maximum,
                         ef_construction=construction_ef, random_seed=SEED)
        index.set_num_threads(1)
        index.add_items(items, np.arange(N), num_threads=1)
    else:
        raise ValueError("unsupported benchmark library")
    build_seconds = perf_counter() - started
    path = directory / f"{library}-{maximum}.bin"
    if library == "faiss":
        faiss.write_index(index, str(path))
    else:
        index.save_index(str(path))
    serialized_bytes = path.stat().st_size
    rows = []
    for search_ef in SEARCH_EFS:
        if library == "faiss":
            index.hnsw.efSearch = search_ef
            index.search(queries[:8], K)
        else:
            index.set_ef(search_ef)
            index.knn_query(queries[:8], k=K, num_threads=1)
        latencies, recalls = [], []
        for query, expected in zip(queries, truth):
            started_ns = perf_counter_ns()
            if library == "faiss":
                distances, labels = index.search(query[None, :], K)
            else:
                labels, distances = index.knn_query(query[None, :], k=K, num_threads=1)
            latencies.append((perf_counter_ns() - started_ns) / 1_000_000)
            result = labels[0].astype(np.int64)
            if result.shape != (K,) or len(set(result)) != K:
                raise AssertionError("native search returned an invalid result shape")
            if not np.all((result >= 0) & (result < N)):
                raise AssertionError("native search returned an out-of-corpus ID")
            expected_scores = np.sum(
                (items[result].astype(np.float64) - query.astype(np.float64))**2,
                axis=1,
            )
            np.testing.assert_allclose(distances[0], expected_scores, rtol=2e-6, atol=2e-5)
            recalls.append(len(set(result) & set(expected)) / K)
        rows.append({
            "library": library, "M": maximum, "efConstruction": construction_ef,
            "efSearch": search_ef, "recall_at_10": float(np.mean(recalls)),
            "p50_ms": float(np.quantile(latencies, .5, method="inverted_cdf")),
            "p95_ms": float(np.quantile(latencies, .95, method="inverted_cdf")),
            "build_seconds": build_seconds, "serialized_bytes": serialized_bytes,
            "per_query_recall": recalls, "per_query_ms": latencies,
        })
    return rows


def run(output):
    faiss.omp_set_num_threads(1)
    rng = np.random.default_rng(SEED)
    items = rng.normal(size=(N, DIMENSION)).astype(np.float32)
    queries = rng.normal(size=(QUERY_COUNT, DIMENSION)).astype(np.float32)
    truth = exact_neighbors(items, queries)
    rows = []
    with tempfile.TemporaryDirectory(prefix="hnsw-benchmark-") as temporary:
        for library in ("faiss", "hnswlib"):
            for maximum, construction_ef in CONFIGURATIONS:
                rows.extend(measure(library, items, queries, truth, maximum,
                                    construction_ef, Path(temporary)))
    for library in ("faiss", "hnswlib"):
        high_effort = next(row for row in rows if row["library"] == library
                           and row["M"] == 16 and row["efSearch"] == 128)
        if high_effort["recall_at_10"] < .95:
            raise AssertionError(f"{library} did not pass the declared synthetic recall check")
    record = {
        "recorded_at": datetime.now(timezone.utc).isoformat(),
        "system": platform.system(), "machine": platform.machine(),
        "python": platform.python_version(), "numpy": np.__version__,
        "faiss": importlib.metadata.version("faiss-cpu"),
        "hnswlib": importlib.metadata.version("hnswlib"),
        "seed": SEED, "corpus_count": N, "dimension": DIMENSION,
        "query_count": QUERY_COUNT, "k": K, "threads": 1, "batch_size": 1,
        "distribution": "independent standard-normal corpus and held-out queries",
        "metric": "squared L2; stored/query vectors float32, exact reference float64",
        "timer": "native Python API call returning IDs/distances; no embedding, filter, network, or reranker",
        "warmup": "eight-query batch for each operating point",
        "quantile": "nearest rank (NumPy inverted_cdf)",
        "memory_measure": "serialized index file bytes, not resident or peak build memory",
        "rows": rows,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(record, indent=2, allow_nan=False) + "\n")
    for row in rows:
        print(f"{row['library']:7s} M={row['M']:2d} efC={row['efConstruction']:3d} "
              f"ef={row['efSearch']:3d} recall={row['recall_at_10']:.4f} "
              f"p95={row['p95_ms']:.4f} ms file={row['serialized_bytes']} bytes")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path,
                        default=Path(__file__).resolve().parents[1] / "assets/benchmark-results.json")
    run(parser.parse_args().output)
