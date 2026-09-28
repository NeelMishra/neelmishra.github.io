(function () {
  'use strict';
  const controls = document.getElementById('interpretability-controls');
  if (!controls) return;
  const gInput = document.getElementById('interpretability-g');
  const cInput = document.getElementById('interpretability-c');
  const actionInput = document.getElementById('interpretability-action');
  const sigmoid = x => 1 / (1 + Math.exp(-x));
  const percentage = x => (100 * x).toFixed(2) + '%';
  function draw() {
    const g = Number(gInput.value), c = Number(cInput.value);
    const action = actionInput.value;
    const changedG = action === 'g' ? 0 : g;
    const changedC = action === 'c' ? 0 : c;
    const probeBefore = sigmoid(2 * g), modelBefore = sigmoid(c);
    const probeAfter = sigmoid(2 * changedG), modelAfter = sigmoid(changedC);
    document.getElementById('interpretability-g-value').textContent = g.toFixed(2);
    document.getElementById('interpretability-c-value').textContent = c.toFixed(2);
    for (const [id, value] of [['probe-before', probeBefore], ['probe-after', probeAfter], ['model-before', modelBefore], ['model-after', modelAfter]]) {
      document.getElementById('interpretability-' + id).textContent = percentage(value);
    }
    const effect = action === 'g' ? 'Setting g to zero can change the probe. The toy model ignores g, so its prediction is unchanged.' : action === 'c' ? 'Setting c to zero can change the toy model. The probe ignores c, so its prediction is unchanged.' : 'No intervention. Both readouts equal their original values.';
    document.getElementById('interpretability-result').textContent = effect + ' After intervention: probe P(noun) ' + percentage(probeAfter) + '; model P(runs) ' + percentage(modelAfter) + '.';
  }
  [gInput, cInput].forEach(control => control.addEventListener('input', draw));
  actionInput.addEventListener('change', draw);
  document.getElementById('interpretability-reset').addEventListener('click', () => {
    gInput.value = '1'; cInput.value = '0.5'; actionInput.value = 'none'; draw();
  });
  draw();
  controls.hidden = false;
}());
