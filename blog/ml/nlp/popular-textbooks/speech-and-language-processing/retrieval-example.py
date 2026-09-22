"""Reproduce the companion's arithmetic. Python 3; no external packages.

Run: python3 retrieval-example.py
The passages, relevance labels, and dense vectors are teaching examples.
No fitted embedding model or generator is called.
"""
from collections import Counter
import json
import math

PASSAGES = {
    "D1": "home solar battery stores solar energy",
    "D2": "solar panel makes electricity",
    "D3": "home battery stores energy",
    "D4": "household accumulator stores rooftop power",
    "D5": "battery battery battery recycling guide",
    "D6": "wind turbine makes electricity",
}
RELEVANT = {"D1", "D3", "D4"}
COUNTS = {key: Counter(text.split()) for key, text in PASSAGES.items()}
LENGTHS = {key: sum(counts.values()) for key, counts in COUNTS.items()}
MEAN_LENGTH = sum(LENGTHS.values()) / len(PASSAGES)


def bm25(query=("solar", "battery"), k1=1.2, b=0.75):
    """Chapter-shaped variant: ln(N/df) * raw_count/(raw_count + k1*A).

    Query terms are deduplicated. Omit the optional constant (k1+1).
    Return lexical candidates only, including any candidate with score zero.
    """
    rows = []
    for doc, counts in COUNTS.items():
        if not any(counts[t] for t in query):
            continue
        parts = {}
        for term in dict.fromkeys(query):
            df = sum(c[term] > 0 for c in COUNTS.values())
            frequency = counts[term]
            a = 1 - b + b * LENGTHS[doc] / MEAN_LENGTH
            parts[term] = (math.log(len(PASSAGES) / df) * frequency /
                           (frequency + k1 * a)) if frequency and df else 0.0
        rows.append({"document": doc, "parts": parts, "score": sum(parts.values())})
    return sorted(rows, key=lambda row: (-row["score"], row["document"]))


def metrics(ranking, cutoff=None):
    ranking = ranking if cutoff is None else ranking[:cutoff]
    found = 0
    precision_sum = 0.0
    for rank, doc in enumerate(ranking, 1):
        if doc in RELEVANT:
            found += 1
            precision_sum += found / rank
    return {
        "returned": len(ranking), "relevant_returned": found,
        "precision_among_returned": found / len(ranking) if ranking else None,
        "recall": found / len(RELEVANT),
        "average_precision_with_unreturned_as_zero": precision_sum / len(RELEVANT),
    }


def tfidf_vector(tokens):
    counts = Counter(tokens)
    return {term: (1 + math.log10(count)) * math.log10(
        len(PASSAGES) / sum(c[term] > 0 for c in COUNTS.values()))
        for term, count in counts.items() if any(c[term] for c in COUNTS.values())}


def cosine(a, b):
    dot = sum(value * b.get(term, 0) for term, value in a.items())
    norm_a = math.sqrt(sum(value * value for value in a.values()))
    norm_b = math.sqrt(sum(value * value for value in b.values()))
    return dot / (norm_a * norm_b) if norm_a and norm_b else 0.0


def main():
    base = bm25()
    expanded = bm25(("solar", "battery", "accumulator"))
    dense_q = [0.8, 0.6]
    dense_docs = {"D1": [.9, .7], "D2": [.8, -.2], "D3": [.7, .6],
                  "D4": [1.0, .4], "D5": [.1, .2], "D6": [.2, -.4]}
    dense = {doc: sum(q * d for q, d in zip(dense_q, vector))
             for doc, vector in dense_docs.items()}
    positive_and_negatives = [dense["D1"], dense["D2"], dense["D5"]]
    positive_probability = math.exp(positive_and_negatives[0]) / sum(
        math.exp(score) for score in positive_and_negatives)
    q_vec = tfidf_vector(["solar", "battery"])
    out = {
        "lengths": LENGTHS, "average_length": MEAN_LENGTH,
        "bm25": base, "expanded_bm25": expanded,
        "base_metrics": metrics([row["document"] for row in base]),
        "expanded_metrics": metrics([row["document"] for row in expanded]),
        "tfidf_query": q_vec,
        "tfidf_cosines": {doc: cosine(q_vec, tfidf_vector(text.split()))
                           for doc, text in PASSAGES.items()},
        "dense_dot_products": dense,
        "contrastive_positive_probability": positive_probability,
        "contrastive_loss": -math.log(positive_probability),
        "maxsim_example": sum(max(row) for row in [[.9, .2, .1], [.3, .8, .4]]),
        "answer_token_f1": 2 * 1 * (2 / 3) / (1 + 2 / 3),
    }
    assert [r["document"] for r in base] == ["D1", "D2", "D5", "D3"]
    assert math.isclose(out["base_metrics"]["average_precision_with_unreturned_as_zero"], .5)
    assert math.isclose(out["expanded_metrics"]["average_precision_with_unreturned_as_zero"], 13 / 15)
    assert all(row["score"] >= 0 for row in bm25(k1=0))
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
