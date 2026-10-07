"""Verify the native API snippets, filtering, deletion, and persistence behavior."""

from pathlib import Path
import tempfile
import unittest

import faiss
import hnswlib
import numpy as np


class NativeExamples(unittest.TestCase):
    def setUp(self):
        self.items = np.array([[.1, 0.], [.2, 0.], [.3, 0.],
                               [.4, 0.], [.5, 0.]], dtype=np.float32)
        self.query = np.zeros((1, 2), dtype=np.float32)
        faiss.omp_set_num_threads(1)

    def build_hnswlib(self):
        index = hnswlib.Index(space="l2", dim=2)
        index.init_index(max_elements=5, M=2, ef_construction=20, random_seed=72)
        index.add_items(self.items, np.arange(5), num_threads=1)
        index.set_ef(64)
        return index

    def test_both_native_apis_return_squared_l2(self):
        index = faiss.IndexHNSWFlat(2, 2, faiss.METRIC_L2)
        index.hnsw.efConstruction = 20
        index.add(self.items)
        index.hnsw.efSearch = 64
        distances, labels = index.search(self.query, 2)
        np.testing.assert_array_equal(labels, [[0, 1]])
        np.testing.assert_allclose(distances, [[.01, .04]], rtol=1e-6)
        labels, distances = self.build_hnswlib().knn_query(self.query, k=2, num_threads=1)
        np.testing.assert_array_equal(labels, [[0, 1]])
        np.testing.assert_allclose(distances, [[.01, .04]], rtol=1e-6)

    def test_faiss_counts_occupied_levels(self):
        index = faiss.IndexHNSWFlat(2, 2, faiss.METRIC_L2)
        index.add(self.items)
        levels = faiss.vector_to_array(index.hnsw.levels)
        self.assertEqual(len(levels), len(self.items))
        self.assertTrue(np.all(levels >= 1))
        self.assertEqual(int(levels.max()) - 1, index.hnsw.max_level)

    def test_filtered_results_and_deleted_labels(self):
        index = self.build_hnswlib()
        allowed = lambda label: label >= 2
        labels, _ = index.knn_query(self.query, k=2, num_threads=1, filter=allowed)
        np.testing.assert_array_equal(labels, [[2, 3]])
        index.mark_deleted(2)
        labels, _ = index.knn_query(self.query, k=2, num_threads=1, filter=allowed)
        np.testing.assert_array_equal(labels, [[3, 4]])
        index.unmark_deleted(2)
        labels, _ = index.knn_query(self.query, k=2, num_threads=1, filter=allowed)
        np.testing.assert_array_equal(labels, [[2, 3]])

    def test_search_effort_is_restored_explicitly_after_load(self):
        index = self.build_hnswlib()
        with tempfile.TemporaryDirectory(prefix="hnsw-roundtrip-") as temporary:
            path = Path(temporary) / "index.bin"
            index.save_index(str(path))
            loaded = hnswlib.Index(space="l2", dim=2)
            loaded.load_index(str(path))
            self.assertNotEqual(loaded.ef, 64)
            loaded.set_ef(64)
            self.assertEqual(loaded.ef, 64)
            labels, _ = loaded.knn_query(self.query, k=2, num_threads=1)
            np.testing.assert_array_equal(labels, [[0, 1]])

    def test_impossible_filtered_k_raises(self):
        with self.assertRaises(RuntimeError):
            self.build_hnswlib().knn_query(
                self.query, k=2, num_threads=1, filter=lambda label: label == 4
            )


if __name__ == "__main__":
    unittest.main()
