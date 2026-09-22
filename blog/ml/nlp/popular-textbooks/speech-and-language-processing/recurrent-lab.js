/* Controlled scalar recurrences: blank RNN inputs, fixed LSTM gates and no writes. */
(() => {
  'use strict';
  const steps = document.getElementById('recurrent-steps');
  if (!steps) return;
  const recurrent = document.getElementById('recurrent-weight');
  const forget = document.getElementById('recurrent-forget');
  const reset = document.getElementById('recurrent-reset');
  const format = value => value !== 0 && Math.abs(value) < .0001 ? value.toExponential(4) : value.toFixed(6);
  function render() {
    const n = Number(steps.value), u = Number(recurrent.value), f = Number(forget.value);
    document.getElementById('recurrent-steps-value').textContent = n;
    document.getElementById('recurrent-weight-value').textContent = u.toFixed(2);
    document.getElementById('recurrent-forget-value').textContent = f.toFixed(2);
    let h = .5, dh = 1, c = .5, dc = 1;
    const rows = [];
    for (let t = 0; t <= n; t++) {
      if (t) {
        h = Math.tanh(u * h);
        dh *= u * (1 - h * h);
        c *= f;
        dc *= f;
      }
      const exposed = .8 * Math.tanh(c);
      const exposedDerivative = .8 * (1 - Math.tanh(c) ** 2) * dc;
      rows.push([t, h, dh, c, dc, exposed, exposedDerivative]);
    }
    const last = rows[rows.length - 1];
    ['rnn-state', 'rnn-gradient', 'cell-state', 'cell-gradient', 'hidden-state', 'hidden-gradient'].forEach((id, i) => {
      document.getElementById('recurrent-' + id).textContent = format(last[i + 1]);
    });
    const tbody = document.getElementById('recurrent-trajectory');
    const fragment = document.createDocumentFragment();
    rows.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach((value, i) => {
        const td = document.createElement(i ? 'td' : 'th');
        if (!i) td.scope = 'row';
        td.textContent = i ? format(value) : String(value);
        tr.appendChild(td);
      });
      fragment.appendChild(tr);
    });
    tbody.replaceChildren(fragment);
    document.getElementById('recurrent-result').textContent = `After ${n} blank steps, RNN sensitivity to its initial hidden state is ${format(last[2])}. LSTM cell sensitivity is ${format(last[4])}; exposed hidden-state sensitivity to the initial cell is ${format(last[6])}. These are derivatives, not accuracy scores.`;
    document.getElementById('recurrent-limit').hidden = f !== 1;
  }
  [steps, recurrent, forget].forEach(control => {
    control.disabled = false;
    control.addEventListener('input', render);
  });
  reset.disabled = false;
  reset.addEventListener('click', () => {
    steps.value = '10'; recurrent.value = '0.8'; forget.value = '0.95'; render();
  });
  document.getElementById('recurrent-trajectory-details').hidden = false;
  render();
})();
