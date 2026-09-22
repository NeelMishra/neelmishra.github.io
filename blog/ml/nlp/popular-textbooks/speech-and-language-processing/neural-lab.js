(() => {
  'use strict';
  const biasInput = document.getElementById('neural-bias');
  if (!biasInput) return;
  const targetInput = document.getElementById('neural-target');
  const rateInput = document.getElementById('neural-rate');
  const names = ['W₁₁', 'W₁₂', 'b₁', 'W₂₁', 'W₂₂', 'b₂', 'v₁', 'v₂', 'c'];
  function forward(parameters, target) {
    const [w11, w12, b1, w21, w22, b2, v1, v2, c] = parameters;
    const a1 = w11 + 2 * w12 + b1;
    const a2 = w21 + 2 * w22 + b2;
    const h1 = Math.max(0, a1);
    const h2 = Math.max(0, a2);
    const z = v1 * h1 + v2 * h2 + c;
    const probability = 1 / (1 + Math.exp(-z));
    const loss = Math.max(z, 0) - target * z + Math.log1p(Math.exp(-Math.abs(z)));
    return {a1, a2, h1, h2, z, probability, loss};
  }
  function render() {
    const bias = Number(biasInput.value);
    const target = Number(targetInput.value);
    const rate = Number(rateInput.value);
    const parameters = [0.4, 0.3, 0.1, -0.5, 0.1, bias, 0.6, -0.4, -0.1];
    const before = forward(parameters, target);
    const delta = before.probability - target;
    const da1 = delta * parameters[6] * (before.a1 > 0 ? 1 : 0);
    const da2 = delta * parameters[7] * (before.a2 > 0 ? 1 : 0);
    const gradients = [da1, 2 * da1, da1, da2, 2 * da2, da2, delta * before.h1, delta * before.h2, delta];
    const updated = parameters.map((parameter, i) => parameter - rate * gradients[i]);
    const after = forward(updated, target);
    document.getElementById('neural-bias-value').textContent = bias.toFixed(1);
    document.getElementById('neural-rate-value').textContent = rate.toFixed(2);
    document.getElementById('neural-result').textContent = `Before: p = ${before.probability.toFixed(6)}, loss = ${before.loss.toFixed(6)}. After one update with η = ${rate.toFixed(2)}: p = ${after.probability.toFixed(6)}, loss = ${after.loss.toFixed(6)}. These losses use target y = ${target}.`;
    document.getElementById('neural-gates').textContent = `Hidden unit 1: a₁ = ${before.a1.toFixed(3)}, h₁ = ${before.h1.toFixed(3)} (active). Hidden unit 2: a₂ = ${before.a2.toFixed(3)}, h₂ = ${before.h2.toFixed(3)} (${before.a2 > 0 ? 'active; gradients pass through' : 'inactive; local ReLU derivative is zero'}). Output error p − y = ${delta.toFixed(6)}.`;
    const body = document.getElementById('neural-gradients');
    body.replaceChildren();
    names.forEach((name, i) => {
      const row = document.createElement('tr');
      const heading = document.createElement('th');
      heading.scope = 'row';
      heading.textContent = name;
      row.appendChild(heading);
      [parameters[i], gradients[i], updated[i]].forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = (Math.abs(value) < 0.0000005 ? 0 : value).toFixed(6);
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
  }
  biasInput.addEventListener('input', render);
  targetInput.addEventListener('change', render);
  rateInput.addEventListener('input', render);
  document.getElementById('neural-reset').addEventListener('click', () => {
    biasInput.value = '0.1';
    targetInput.value = '1';
    rateInput.value = '0.1';
    render();
  });
  render();
  document.getElementById('neural-controls').hidden = false;
  document.getElementById('neural-live').hidden = false;
})();
