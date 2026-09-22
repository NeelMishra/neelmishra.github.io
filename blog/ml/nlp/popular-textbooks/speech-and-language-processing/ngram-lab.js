(() => {
  'use strict';
  const sentenceInput = document.getElementById('ngram-sentence');
  if (!sentenceInput) return;
  const corpus = ['i drink tea', 'i drink coffee', 'you drink tea', 'i like tea'];
  const vocabulary = ['i', 'you', 'drink', 'like', 'tea', 'coffee', '</s>'];
  const counts = new Map();
  corpus.forEach(sentence => {
    const tokens = ['<s>', ...sentence.split(' '), '</s>'];
    for (let i = 1; i < tokens.length; i++) {
      const row = counts.get(tokens[i - 1]) || new Map();
      row.set(tokens[i], (row.get(tokens[i]) || 0) + 1);
      counts.set(tokens[i - 1], row);
    }
  });
  const kInput = document.getElementById('ngram-k');
  const historyInput = document.getElementById('ngram-history');
  const label = token => token === '<s>' ? 'start' : token === '</s>' ? 'end' : token;
  const total = row => [...row.values()].reduce((sum, n) => sum + n, 0);
  const compact = n => Number(n.toFixed(3)).toString();
  function estimate(history, token, k) {
    const row = counts.get(history) || new Map();
    const numerator = (row.get(token) || 0) + k;
    const denominator = total(row) + k * vocabulary.length;
    return {numerator, denominator, probability: numerator / denominator};
  }
  function cell(row, value, header = false) {
    const element = document.createElement(header ? 'th' : 'td');
    if (header) element.scope = 'row';
    element.textContent = value;
    row.appendChild(element);
    return element;
  }
  function render() {
    const k = Number(kInput.value);
    document.getElementById('ngram-k-value').textContent = k.toFixed(1);
    const tokens = ['<s>', ...sentenceInput.value.split(' '), '</s>'];
    const factors = document.getElementById('ngram-factors');
    factors.replaceChildren();
    let logProbability = 0;
    for (let i = 1; i < tokens.length; i++) {
      const {numerator, denominator, probability} = estimate(tokens[i - 1], tokens[i], k);
      logProbability += Math.log2(probability);
      const row = document.createElement('tr');
      cell(row, `${label(tokens[i])} | ${label(tokens[i - 1])}`, true);
      cell(row, `${compact(numerator)} / ${compact(denominator)}`);
      cell(row, probability.toFixed(6)).className = 'ngram-value';
      factors.appendChild(row);
    }
    const targetCount = tokens.length - 1;
    const entropy = -logProbability / targetCount;
    const perplexity = 2 ** entropy;
    const probability = 2 ** logProbability;
    document.getElementById('ngram-summary').textContent = `For “${sentenceInput.value}” with k = ${k.toFixed(1)}: sequence probability = ${probability.toFixed(8)}; cross-entropy = ${Number.isFinite(entropy) ? entropy.toFixed(4) : '∞'} bits per token; perplexity = ${Number.isFinite(perplexity) ? perplexity.toFixed(4) : '∞'}. ${targetCount} targets include the end marker.${probability === 0 ? ' One zero-probability transition makes the whole sentence impossible under this model.' : ''}`;
    const distribution = document.getElementById('ngram-distribution');
    distribution.replaceChildren();
    let sum = 0;
    const history = historyInput.value;
    document.getElementById('ngram-distribution-caption').textContent = `Full next-token distribution after ${label(history)}`;
    vocabulary.forEach(token => {
      const {probability} = estimate(history, token, k);
      sum += probability;
      const row = document.createElement('tr');
      cell(row, label(token), true);
      cell(row, probability.toFixed(6)).className = 'ngram-value';
      const barCell = cell(row, '');
      const bar = document.createElement('meter');
      bar.min = 0;
      bar.max = 1;
      bar.value = probability;
      bar.setAttribute('aria-label', `Probability of ${label(token)} after ${label(history)}`);
      bar.textContent = probability.toFixed(6);
      barCell.appendChild(bar);
      distribution.appendChild(row);
    });
    document.getElementById('ngram-sum').textContent = `${sum.toFixed(6)} (before display rounding)`;
  }
  sentenceInput.addEventListener('change', render);
  historyInput.addEventListener('change', render);
  kInput.addEventListener('input', render);
  render();
  document.getElementById('ngram-controls').hidden = false;
  document.getElementById('ngram-live-tables').hidden = false;
})();
