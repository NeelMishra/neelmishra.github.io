(function () {
  'use strict';
  const control = document.getElementById('intro-temp');
  if (!control) return;
  const names = ['tea', 'water', 'juice'];
  const base = [0.6, 0.3, 0.1];
  function draw() {
    const temperature = Number(control.value);
    const weights = base.map(p => Math.pow(p, 1 / temperature));
    const total = weights.reduce((a, b) => a + b, 0);
    const probabilities = weights.map(p => p / total);
    document.getElementById('intro-temp-value').textContent = temperature.toFixed(2);
    names.forEach((name, i) => {
      document.getElementById('intro-' + name + '-bar').style.width = (100 * probabilities[i]) + '%';
      document.getElementById('intro-' + name + '-value').textContent = (100 * probabilities[i]).toFixed(2) + '%';
    });
    const effect = temperature < 1 ? 'probability is more concentrated on tea' : temperature > 1 ? 'probability is spread more evenly' : 'probabilities are unchanged';
    document.getElementById('intro-temperature-result').textContent = 'At T = ' + temperature.toFixed(2) + ', ' + effect + '. Tea: ' + (100 * probabilities[0]).toFixed(2) + ' percent; water: ' + (100 * probabilities[1]).toFixed(2) + ' percent; juice: ' + (100 * probabilities[2]).toFixed(2) + ' percent. Greedy decoding chooses tea at every temperature shown.';
  }
  control.addEventListener('input', draw);
  document.getElementById('intro-temp-reset').addEventListener('click', () => { control.value = '1'; draw(); });
  draw();
}());
