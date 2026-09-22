(() => {
  'use strict';
  const root = document.getElementById('attention-lab');
  if (!root) return;
  const softmax = values => {
    const exps = values.map(value => Math.exp(value - Math.max(...values)));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(value => value / sum);
  };
  const fixed = value => value.toFixed(4);
  const vector = values => `[${values.map(fixed).join(', ')}]`;
  function render() {
    const step = Number(root.querySelector('#att-step').value);
    const padding = root.querySelector('#att-pad').checked;
    const state = step === 0 ? [1, -1] : [-1, 1];
    const memory = [{name: 'red', h: [1, 0]}, {name: 'square', h: [0, 1]}];
    if (padding) memory.push({name: 'PAD · erroneous unmasked row', h: [1, 1]});
    const scores = memory.map(({h}) => 2 * (Math.tanh(state[0] + h[0]) + Math.tanh(state[1] + h[1])));
    const weights = softmax(scores);
    const context = [0, 1].map(k => memory.reduce((sum, {h}, j) => sum + weights[j] * h[k], 0));
    const logits = [3 * context[1], 3 * context[0]];
    const probabilities = softmax(logits);
    root.querySelector('[data-att-rows]').innerHTML = memory.map(({name, h}, j) => `<div class="att-row" data-position="${j}"><strong>${name} · h = [${h.join(', ')}]</strong><small>score ${fixed(scores[j])} · weight ${fixed(weights[j])}</small><div class="att-track" aria-hidden="true"><div class="att-fill" style="width:${100 * weights[j]}%"></div></div><small>Contribution to c: ${vector(h.map(value => value * weights[j]))}</small></div>`).join('');
    root.querySelector('[data-att-trace]').innerHTML = `<p><strong>Context:</strong> ${vector(context)}</p><p><strong>Output logits:</strong> ${vector(logits)}</p><p><strong>Output probabilities:</strong> carré ${fixed(probabilities[0])} · rouge ${fixed(probabilities[1])}</p>`;
    root.querySelector('output').textContent = padding
      ? `Padding consumes ${fixed(weights[2])} of the attention mass. The probability of ${step === 0 ? 'carré' : 'rouge'} is ${fixed(probabilities[step])}.`
      : `The source weight on ${step === 0 ? 'square' : 'red'} is ${fixed(weights[1-step])}; the output probability of ${step === 0 ? 'carré' : 'rouge'} is ${fixed(probabilities[step])}.`;
  }
  root.querySelector('#att-step').addEventListener('change', render);
  root.querySelector('#att-pad').addEventListener('change', render);
  render();
  root.querySelector('.note-controls').hidden = false;
})();
