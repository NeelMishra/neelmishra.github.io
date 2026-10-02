(function () {
  'use strict';
  var root = document.querySelector('[data-tree-mask]');
  if (!root) return;
  var inputs = root.querySelectorAll('[data-feature]');
  function render() {
    var known = [false, false, false];
    var names = [];
    inputs.forEach(function (input) {
      var feature = Number(input.getAttribute('data-feature'));
      known[feature] = input.checked;
      if (input.checked) names.push('ABC'[feature]);
    });
    var leftA = known[0] ? 0 : 0.4;
    var rightA = known[0] ? 1 : 0.6;
    var weights = [
      leftA * (known[1] ? 0 : 0.75),
      leftA * (known[1] ? 1 : 0.25),
      rightA * (known[2] ? 0 : 1 / 3),
      rightA * (known[2] ? 1 : 2 / 3)
    ];
    var prediction = 0;
    var values = [10, 30, 50, 90];
    weights.forEach(function (weight, i) {
      prediction += weight * values[i];
      root.querySelector('[data-leaf-weight="' + i + '"]').textContent =
        (weight * 100).toLocaleString('en', {maximumFractionDigits: 3}) + '%';
    });
    root.querySelector('[data-mask-output]').textContent =
      (names.length ? names.join(', ') + ' known' : 'No inputs known') +
      ': average prediction = ' + prediction.toLocaleString('en', {maximumFractionDigits: 6}) + '.';
  }
  inputs.forEach(function (input) { input.addEventListener('change', render); });
  render();
})();
