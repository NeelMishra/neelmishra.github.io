#!/usr/bin/env python3
"""Reproduce the original teaching corpus used by the BPE paper companion.

This is a small character BPE implementation, not the subword-nmt package.
Uses the 2016 separate </w> convention and lexicographically smallest tie break.
Run from any directory; the generated data stay beside the article.
"""
from collections import Counter
from pathlib import Path
import json

END = '</w>'
CORPUS = {'rain': 6, 'rains': 3, 'train': 4, 'trains': 2, 'brain': 1}


def merge(tokens, pair):
    """Replace left-to-right nonoverlapping occurrences of one adjacent pair."""
    output, i = [], 0
    while i < len(tokens):
        if i + 1 < len(tokens) and tuple(tokens[i:i + 2]) == tuple(pair):
            output.append(''.join(pair))
            i += 2
        else:
            output.append(tokens[i])
            i += 1
    return output


def pair_counts(words):
    counts = Counter()
    for word, tokens in words.items():
        for pair in zip(tokens, tokens[1:]):
            counts[pair] += CORPUS[word]
    return counts


def train(num_merges=6):
    words = {word: list(word) + [END] for word in CORPUS}
    rules, states = [], []
    for step in range(num_merges + 1):
        counts = pair_counts(words)
        ordered = sorted(counts, key=lambda pair: (-counts[pair], pair))
        states.append({
            'step': step,
            'words': {word: tokens[:] for word, tokens in words.items()},
            'symbol_count': sum(CORPUS[w] * len(tokens) for w, tokens in words.items()),
            'top_pairs': [{'pair': list(p), 'count': counts[p]} for p in ordered[:5]],
        })
        if step == num_merges or not ordered:
            break
        chosen = ordered[0]
        rules.append({'rank': step + 1, 'pair': list(chosen), 'count': counts[chosen]})
        words = {word: merge(tokens, chosen) for word, tokens in words.items()}
    return rules, states


def encode(word, rules):
    alphabet = set(''.join(CORPUS))
    if not word or not set(word).issubset(alphabet):
        raise ValueError('nonempty word using the training alphabet required')
    tokens = list(word) + [END]
    trace = [{'rank': 0, 'tokens': tokens[:], 'changed': False}]
    for rule in rules:
        updated = merge(tokens, rule['pair'])
        trace.append({'rank': rule['rank'], 'tokens': updated[:], 'changed': updated != tokens})
        tokens = updated
    return trace


def main():
    rules, states = train()
    expected = [['a', 'i'], ['ai', 'n'], ['r', 'ain'],
                ['rain', END], ['rain', 's'], ['rains', END]]
    assert [r['pair'] for r in rules] == expected
    assert [s['symbol_count'] for s in states] == [92, 76, 60, 44, 33, 28, 23]
    traces = {w: encode(w, rules) for w in ['brains', 'rains', 'train', 'strain']}
    assert traces['brains'][-1]['tokens'] == ['b', 'rains</w>']
    assert not traces['brains'][4]['changed']  # No end marker immediately after rain.
    assert merge(['a', 'a', 'a'], ('a', 'a')) == ['aa', 'a']
    for word in CORPUS:
        assert encode(word, rules)[-1]['tokens'] == states[-1]['words'][word]
    for word, trace in traces.items():
        assert ''.join(trace[-1]['tokens']) == word + END
    try:
        encode('rainy', rules)
    except ValueError:
        pass
    else:
        raise AssertionError('unseen character y should not silently get an ID')
    data = {'corpus': CORPUS, 'rules': rules, 'states': states, 'traces': traces}
    assets = Path(__file__).resolve().parent / 'assets'
    assets.mkdir(exist_ok=True)
    (assets / 'sennrich-bpe-demo.json').write_text(json.dumps(data, indent=2) + '\n')
    print('All checks passed: six merges, weighted counts, replay, overlap, round-trip, OOV.')
    print('Merged-symbol counts:', [s['symbol_count'] for s in states])
    print('Unseen brains:', traces['brains'][-1]['tokens'])


if __name__ == '__main__':
    main()
