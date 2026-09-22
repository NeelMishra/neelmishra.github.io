(() => {
  'use strict';
  const positionInput = document.getElementById('transformer-position');
  if (!positionInput) return;
  const strengthInput = document.getElementById('transformer-strength');
  const maskInput = document.getElementById('transformer-mask');
  const tokens = ['a', 'small', 'bird', 'sings'];
  const queries = [[Math.SQRT2, 0], [0, Math.SQRT2], [Math.SQRT2, 0], [Math.SQRT2, Math.SQRT2]];
  const queryLabels = ['[√2, 0]', '[0, √2]', '[√2, 0]', '[√2, √2]'];
  const values = [[2, 0], [0, 2], [1, 3], [4, -1]];
  function cell(row, value, header = false) {
    const element = document.createElement(header ? 'th' : 'td');
    if (header) element.scope = 'row';
    element.textContent = value;
    row.appendChild(element);
    return element;
  }
  function render() {
    const position = Number(positionInput.value);
    const strength = Number(strengthInput.value);
    const masked = maskInput.checked;
    const keys = [[1, 0], [0, 1], [1, 1], [strength, 0]];
    const query = queries[position];
    const scores = keys.map(key => (query[0] * key[0] + query[1] * key[1]) / Math.SQRT2);
    const permitted = scores.map((_, i) => !masked || i <= position);
    const allowedScores = scores.filter((_, i) => permitted[i]);
    const maximum = Math.max(...allowedScores);
    const numerators = scores.map((score, i) => permitted[i] ? Math.exp(score - maximum) : 0);
    const denominator = numerators.reduce((sum, value) => sum + value, 0);
    const weights = numerators.map(value => value / denominator);
    const output = [0, 1].map(dimension => weights.reduce((sum, weight, i) => sum + weight * values[i][dimension], 0));
    document.getElementById('transformer-strength-value').textContent = strength.toFixed(1);
    document.getElementById('transformer-query').textContent = `Selected query q${position + 1} = ${queryLabels[position]}. Key 4 = [${strength.toFixed(1)}, 0]. All scores are divided by √2 before masking.`;
    const explanation = !masked && position < tokens.length - 1 ? ' Future positions are visible: this row no longer obeys the causal next-token task.' : masked && position < tokens.length - 1 ? ' Later keys cannot influence this row.' : ' All four positions are available at the last position.';
    document.getElementById('transformer-result').textContent = `At position ${position + 1} / ${tokens[position]}, with the causal mask ${masked ? 'enabled' : 'disabled'}, the attention weights are [${weights.map(value => value.toFixed(6)).join(', ')}]. The head output is [${output.map(value => value.toFixed(6)).join(', ')}].${explanation}`;
    const body = document.getElementById('transformer-rows');
    body.replaceChildren();
    tokens.forEach((token, i) => {
      const row = document.createElement('tr');
      cell(row, `${i + 1} / ${token}`, true);
      cell(row, scores[i].toFixed(3));
      cell(row, permitted[i] ? scores[i].toFixed(3) : '−∞ (blocked)');
      cell(row, weights[i].toFixed(6));
      const meterCell = cell(row, '');
      const meter = document.createElement('meter');
      meter.min = 0;
      meter.max = 1;
      meter.value = weights[i];
      meter.setAttribute('aria-label', `Attention weight on position ${i + 1}, ${token}`);
      meter.textContent = weights[i].toFixed(6);
      meterCell.appendChild(meter);
      body.appendChild(row);
    });
    document.getElementById('transformer-sum').textContent = `${weights.reduce((sum, value) => sum + value, 0).toFixed(6)} (before display rounding)`;
  }
  positionInput.addEventListener('change', render);
  strengthInput.addEventListener('input', render);
  maskInput.addEventListener('change', render);
  document.getElementById('transformer-reset').addEventListener('click', () => {
    positionInput.value = '2';
    strengthInput.value = '3';
    maskInput.checked = true;
    render();
  });
  render();
  document.getElementById('transformer-controls').hidden = false;
  document.getElementById('transformer-live').hidden = false;
})();
