"""Small, deterministic HNSW layer-search experiments, not a production index."""

import heapq
import math


VECTORS = {"A": (8.0, 0.0), "B": (7.0, 0.0),
           "C": (9.0, 0.0), "D": (0.5, 0.0)}
GRAPH = {"A": ("B", "C"), "B": ("A",),
         "C": ("A", "D"), "D": ("C",)}
QUERY = (0.0, 0.0)


def positive_integer(value, name):
    if isinstance(value, bool) or not isinstance(value, int) or value < 1:
        raise ValueError(f"{name} must be a positive integer")


def squared_l2(left, right):
    if not left or len(left) != len(right):
        raise ValueError("vectors must have the same positive dimension")
    if not all(math.isfinite(value) for value in (*left, *right)):
        raise ValueError("vectors must be finite")
    return sum((a - b)**2 for a, b in zip(left, right))


def exact_topk(query, vectors, k, eligible=None):
    positive_integer(k, "k")
    allowed = set(vectors) if eligible is None else set(eligible)
    if not allowed <= set(vectors):
        raise ValueError("eligible IDs must belong to the corpus")
    scored = [(squared_l2(query, vectors[node]), node) for node in allowed]
    return [node for _, node in sorted(scored)[:k]]


def overlap_recall(reference, approximate):
    if len(set(reference)) != len(reference) or len(set(approximate)) != len(approximate):
        raise ValueError("result IDs must be unique")
    if len(approximate) > len(reference):
        raise ValueError("approximate results must not exceed the reference cutoff")
    if not reference:
        raise ValueError("recall is undefined for an empty reference")
    return len(set(reference) & set(approximate)) / len(reference)


def search_layer(query, vectors, graph, entry, ef):
    """Unfiltered Algorithm-2-style search with stable lexical tie breaking."""
    positive_integer(ef, "ef")
    if set(graph) != set(vectors) or entry not in vectors:
        raise ValueError("graph keys and entry must match the vector IDs")
    if any(neighbor not in vectors for neighbors in graph.values() for neighbor in neighbors):
        raise ValueError("graph links must reference existing vectors")
    distances = {}

    def distance_to(node):
        if node not in distances:
            distances[node] = squared_l2(query, vectors[node])
        return distances[node]

    candidates = [(distance_to(entry), entry)]
    retained = [(-distance_to(entry), entry)]
    visited, expanded, traces = {entry}, [], []

    def snapshot(event, current=None, admitted=(), rejected=(), evicted=()):
        traces.append({
            "event": event, "current": current,
            "frontier": [{"id": node, "distance": score}
                         for score, node in sorted(candidates)],
            "retained": [{"id": node, "distance": -negative}
                         for negative, node in sorted(retained, key=lambda item: (-item[0], item[1]))],
            "visited": sorted(visited), "expanded": list(expanded),
            "admitted": list(admitted), "rejected": list(rejected),
            "evicted": list(evicted),
        })

    snapshot("start")
    while candidates:
        distance, current = heapq.heappop(candidates)
        if distance > -retained[0][0]:
            snapshot("stop", current)
            break
        expanded.append(current)
        admitted, rejected, evicted = [], [], []
        for neighbor in graph[current]:
            if neighbor in visited:
                continue
            visited.add(neighbor)
            score = distance_to(neighbor)
            if len(retained) < ef or score < -retained[0][0]:
                heapq.heappush(candidates, (score, neighbor))
                heapq.heappush(retained, (-score, neighbor))
                admitted.append(neighbor)
                if len(retained) > ef:
                    evicted.append(heapq.heappop(retained)[1])
            else:
                rejected.append(neighbor)
        snapshot("expand", current, admitted, rejected, evicted)
    snapshot("finish")
    ranked = sorted((-negative, node) for negative, node in retained)
    return {
        "ef": ef, "nearest": [node for _, node in ranked],
        "distance_evaluations": len(distances), "traces": traces,
    }


def select_diverse(query, vectors, candidates, maximum, keep_pruned=False):
    """A strict paper-style diversity rule without candidate extension."""
    positive_integer(maximum, "maximum")
    if len(set(candidates)) != len(candidates):
        raise ValueError("candidate IDs must be unique")
    if any(node not in vectors for node in candidates):
        raise ValueError("candidate IDs must belong to the corpus")
    ordered = sorted(candidates, key=lambda node: (squared_l2(query, vectors[node]), node))
    selected, discarded = [], []
    for node in ordered:
        if len(selected) == maximum:
            break
        query_distance = squared_l2(query, vectors[node])
        if all(query_distance < squared_l2(vectors[node], vectors[other])
               for other in selected):
            selected.append(node)
        else:
            discarded.append(node)
    if keep_pruned:
        selected.extend(discarded[:maximum - len(selected)])
    return selected


def level_from_uniform(uniform, m):
    if isinstance(m, bool) or not isinstance(m, int) or m <= 1:
        raise ValueError("M must be an integer greater than one")
    if not math.isfinite(uniform) or not 0 < uniform <= 1:
        raise ValueError("the uniform sample must be in (0, 1]")
    return math.floor(-math.log(uniform) / math.log(m))
