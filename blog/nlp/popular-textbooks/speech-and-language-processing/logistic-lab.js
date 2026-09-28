(function () {
  'use strict';
  const slider = document.getElementById('logistic-threshold');
  if (!slider) return;
  const examples = [
    {id: 'A', p: .92, y: 1}, {id: 'B', p: .81, y: 0},
    {id: 'C', p: .73, y: 1}, {id: 'D', p: .61, y: 1},
    {id: 'E', p: .48, y: 0}, {id: 'F', p: .35, y: 1},
    {id: 'G', p: .22, y: 0}, {id: 'H', p: .08, y: 0}
  ];
  const percent = n => (100 * n).toFixed(1) + '%';
  function draw() {
    const threshold = Number(slider.value);
    const counts = {TP: 0, FP: 0, FN: 0, TN: 0};
    document.getElementById('logistic-threshold-value').textContent = threshold.toFixed(2);
    examples.forEach(example => {
      const predicted = example.p >= threshold;
      const kind = predicted ? (example.y ? 'TP' : 'FP') : (example.y ? 'FN' : 'TN');
      counts[kind]++;
      const cell = document.getElementById('logistic-decision-' + example.id);
      cell.textContent = (predicted ? 'Route to damage team' : 'Other route') + ' · ' + kind;
      cell.dataset.predicted = String(predicted);
    });
    const selected = counts.TP + counts.FP;
    const precision = selected ? percent(counts.TP / selected) : 'undefined (no positive predictions)';
    const recall = percent(counts.TP / (counts.TP + counts.FN));
    const f1 = percent(2 * counts.TP / (2 * counts.TP + counts.FP + counts.FN));
    document.getElementById('logistic-lab-result').textContent =
      'At threshold ' + threshold.toFixed(2) + ': TP ' + counts.TP + ', FP ' + counts.FP +
      ', FN ' + counts.FN + ', TN ' + counts.TN + '. Precision ' + precision +
      '; recall ' + recall + '; F1 ' + f1 + '. All eight model probabilities stay fixed.';
  }
  slider.addEventListener('input', draw);
  document.getElementById('logistic-threshold-reset').addEventListener('click', function () {
    slider.value = '0.50';
    draw();
  });
  slider.disabled = false;
  document.getElementById('logistic-threshold-reset').disabled = false;
  draw();
}());
