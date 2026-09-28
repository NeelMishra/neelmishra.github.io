#!/usr/bin/env python3
"""Original probability-table example, not a trained LSTM or paper reproduction."""
from pathlib import Path
import json
import math

EOS = '<EOS>'
REFERENCE = ('carré', 'rouge', EOS)


def next_probabilities(prefix):
    # These are deliberately hand-set distributions for source 'red square'.
    if not prefix:
        return {'carré': 0.4, 'cercle': 0.6}
    if len(prefix) == 1 and prefix[0] in ('carré', 'cercle'):
        return {'rouge': 0.9, 'bleu': 0.1} if prefix[0] == 'carré' else {'rouge': 0.5, 'bleu': 0.5}
    if len(prefix) == 2 and prefix[0] in ('carré', 'cercle') and prefix[1] in ('rouge', 'bleu'):
        return {EOS: 1.0}
    raise ValueError('prefix is outside the specified toy distribution')


def rollout(teacher_forcing):
    prefix, trace, probability = (), [], 1.0
    for step in range(3):
        distribution = next_probabilities(prefix)
        assert math.isclose(sum(distribution.values()), 1)
        # Dict insertion order resolves equal probabilities: rouge before bleu.
        top = max(distribution, key=distribution.get)
        chosen = REFERENCE[step] if teacher_forcing else top
        probability *= distribution[chosen]
        trace.append({'step': step + 1, 'prefix': list(prefix), 'input': prefix[-1] if prefix else '<BOS>',
                      'distribution': distribution, 'top': top, 'chosen': chosen,
                      'chosen_probability': distribution[chosen], 'sequence_probability': probability})
        prefix += (chosen,)
    return {'trace': trace, 'tokens': list(prefix), 'probability': probability}


def beam(width):
    current, history = [((), 1.0)], []
    for step in range(3):
        expanded = [(prefix + (word,), p * conditional)
                    for prefix, p in current
                    for word, conditional in next_probabilities(prefix).items()]
        # Stable sorting resolves ties in expansion order; rouge precedes bleu.
        ranked = sorted(expanded, key=lambda candidate: -candidate[1])
        current = ranked[:width]
        history.append({'step': step + 1,
                        'candidates': [{'tokens': list(tokens), 'probability': p,
                                        'retained': i < width} for i, (tokens, p) in enumerate(ranked)]})
    return {'width': width, 'history': history, 'tokens': list(current[0][0]), 'probability': current[0][1]}


def reversal_lags(reverse):
    source = list(range(1, 5))
    if reverse:
        source.reverse()
    return [4 + j - source.index(j + 1) for j in range(4)]


def make_reversal_svg():
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 330" role="img" aria-labelledby="title desc">',
             '<title id="title">Source reversal changes individual alignment gaps, not their mean in this toy timeline</title>',
             '<desc id="desc">Forward gaps are 4, 4, 4, 4. Reversed gaps are 1, 3, 5, 7. Both average 4. The highlighted first pair becomes closer.</desc>',
             '<rect width="320" height="330" rx="12" fill="#fffdf8"/>',
             '<style>text{font-family:Arial,sans-serif;fill:#172820;font-size:14px}.token{font-size:16px;font-weight:bold}.label{font-size:13px}</style>']
    for reverse, offset in [(False, 0), (True, 168)]:
        source = [4, 3, 2, 1] if reverse else [1, 2, 3, 4]
        title = 'Reversed source: gaps 1, 3, 5, 7' if reverse else 'Forward source: gaps 4, 4, 4, 4'
        parts.append(f'<text x="8" y="{20+offset}" font-weight="bold">{title}</text>')
        for i in range(8):
            x = 20 + i * 40
            symbol = ('x' + str(source[i])) if i < 4 else ('y' + str(i - 3))
            color = '#e1f3eb' if i < 4 else '#e5eaf5'
            parts += [f'<rect x="{x-17}" y="{76+offset}" width="34" height="32" rx="5" fill="{color}"/>',
                      f'<text class="token" x="{x}" y="{97+offset}" text-anchor="middle">{symbol}</text>']
        start = 140 if reverse else 20
        parts.append(f'<path d="M {start} {74+offset} C {start} {35+offset}, 180 {35+offset}, 180 {74+offset}" fill="none" stroke="#ba562d" stroke-width="2.5"/>')
        labelx = 160 if reverse else 100
        parts.append(f'<text x="{labelx}" y="{42+offset}" text-anchor="middle">{1 if reverse else 4} step{ "" if reverse else "s"}</text>')
        parts.append(f'<text class="label" x="80" y="{126+offset}" text-anchor="middle">source positions</text>')
        parts.append(f'<text class="label" x="240" y="{126+offset}" text-anchor="middle">target positions</text>')
        parts.append(f'<text x="8" y="{151+offset}">Minimum: {1 if reverse else 4} · Mean: 4</text>')
    parts.append('</svg>')
    return '\n'.join(parts) + '\n'


def main():
    teacher, greedy = rollout(True), rollout(False)
    beams = {str(width): beam(width) for width in (1, 2)}
    assert teacher['tokens'] == list(REFERENCE)
    assert teacher['trace'][0]['top'] == 'cercle'
    assert teacher['trace'][1]['input'] == 'carré'
    assert greedy['trace'][1]['input'] == 'cercle'
    assert math.isclose(teacher['probability'], .36)
    assert math.isclose(greedy['probability'], .30)
    assert beams['1']['tokens'] == greedy['tokens']
    assert beams['2']['tokens'] == list(REFERENCE)
    assert reversal_lags(False) == [4, 4, 4, 4]
    assert reversal_lags(True) == [1, 3, 5, 7]
    paths = [(first, second, EOS) for first in ('carré', 'cercle') for second in ('rouge', 'bleu')]
    probabilities = [math.prod(next_probabilities(path[:i])[token] for i, token in enumerate(path)) for path in paths]
    assert math.isclose(sum(probabilities), 1)
    assert math.isclose(max(probabilities), beams['2']['probability'])
    data = {'source': ['red', 'square'], 'reference': list(REFERENCE),
            'teacher': teacher, 'greedy': greedy, 'beams': beams,
            'reference_nll': -math.log(teacher['probability']),
            'lags': {'forward': reversal_lags(False), 'reversed': reversal_lags(True)}}
    assets = Path(__file__).resolve().parent / 'assets'
    assets.mkdir(exist_ok=True)
    (assets / 'sutskever-seq2seq-demo.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    (assets / 'sutskever-source-reversal.svg').write_text(make_reversal_svg())
    print('Checked teacher forcing, greedy, beam widths 1/2, all four sequence probabilities and reversal gaps.')
    print('Reference probability:', teacher['probability'], 'NLL:', data['reference_nll'])
    print('Greedy:', greedy['tokens'], greedy['probability'])
    print('Beam 2:', beams['2']['tokens'], beams['2']['probability'])


if __name__ == '__main__':
    main()
