(() => {
  'use strict';
  const controls = document.getElementById('masked-controls');
  if (!controls) return;
  const words = ['red', 'crossed', 'quiet'];
  const replacements = ['blue', 'slept', 'wide'];
  const positions = [1, 3, 5];
  const selectors = words.map(word => document.getElementById('masked-' + word));
  const confidence = document.getElementById('masked-confidence');
  const result = document.getElementById('masked-result');
  const input = document.getElementById('masked-input');

  function render() {
    const sequence = ['the', 'red', 'boat', 'crossed', 'the', 'quiet', 'lake'];
    const probabilities = [Number(confidence.value) / 100, 0.25, 0.8];
    const targets = [];
    let sumLoss = 0;
    selectors.forEach((selector, index) => {
      const treatment = selector.value;
      if (treatment === 'ignore') return;
      targets.push(words[index]);
      sumLoss -= Math.log(probabilities[index]);
      if (treatment === 'mask') sequence[positions[index]] = '[MASK]';
      if (treatment === 'random') sequence[positions[index]] = replacements[index];
    });
    document.getElementById('masked-confidence-value').textContent = probabilities[0].toFixed(2);
    confidence.setAttribute('aria-valuetext', probabilities[0].toFixed(2) + ' probability for the original token red');
    input.textContent = 'Input: ' + sequence.join(' ');
    if (targets.length === 0) {
      result.textContent = 'No selected targets. The mean MLM loss is undefined because its denominator would be zero. Select at least one target. A training pipeline must handle an empty selection explicitly, for example by skipping or resampling.';
      return;
    }
    result.textContent = 'Targets: ' + targets.join(', ') + '. Sum loss = ' + sumLoss.toFixed(6) +
      '; selected positions = ' + targets.length + '; mean loss = ' + (sumLoss / targets.length).toFixed(6) + ' nats.';
  }
  selectors.forEach(selector => selector.addEventListener('change', render));
  confidence.addEventListener('input', render);
  document.getElementById('masked-reset').addEventListener('click', () => {
    ['mask', 'random', 'keep'].forEach((value, i) => { selectors[i].value = value; });
    confidence.value = '50';
    render();
  });
  controls.hidden = false;
  render();
})();
