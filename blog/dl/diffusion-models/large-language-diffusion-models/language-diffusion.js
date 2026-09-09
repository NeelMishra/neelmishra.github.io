/* Small, local illustrations. No model inference or external data is used. */
(function () {
  'use strict';
  var article = document.querySelector('.ld-article');
  if (!article) return;
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(article, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  }

  var maskSlider = document.getElementById('mask-time');
  if (maskSlider) {
    var words = ['The', 'small', 'robot', 'carries', 'a', 'blue', 'cup', 'home'];
    var thresholds = [0.04, 0.68, 0.37, 0.92, 0.21, 0.54, 0.81, 0.46];
    var container = document.getElementById('mask-tokens');
    var tokens = words.map(function () {
      var token = document.createElement('span');
      token.className = 'ld-token';
      return token;
    });
    container.replaceChildren.apply(container, tokens);
    function drawMasks() {
      var t = Number(maskSlider.value);
      var count = 0;
      tokens.forEach(function (token, i) {
        var masked = t === 1 || (t > 0 && thresholds[i] <= t);
        count += masked ? 1 : 0;
        token.textContent = masked ? '[MASK]' : words[i];
        token.classList.toggle('is-mask', masked);
      });
      document.getElementById('mask-time-value').value = t.toFixed(2);
      document.getElementById('mask-status').textContent =
        count + ' of 8 positions masked on this trajectory. Expected count across trajectories: ' + (8 * t).toFixed(1) + '.';
    }
    maskSlider.addEventListener('input', drawMasks);
    document.getElementById('mask-resample').addEventListener('click', function () {
      thresholds = words.map(function () { return Math.random(); });
      drawMasks();
    });
    drawMasks();
  }

  var stepsSlider = document.getElementById('coupling-steps');
  if (stepsSlider) {
    var bars = document.getElementById('coupling-bars');
    var names = ['red red', 'blue blue', 'red blue', 'blue red'];
    var rows = names.map(function (name, i) {
      var row = document.createElement('div');
      row.className = 'ld-prob-row' + (i > 1 ? ' is-invalid' : '');
      var label = document.createElement('span');
      label.textContent = name;
      var track = document.createElement('div');
      track.className = 'ld-prob-track';
      track.setAttribute('aria-hidden', 'true');
      var fill = document.createElement('div');
      fill.className = 'ld-prob-fill';
      track.appendChild(fill);
      var value = document.createElement('span');
      value.className = 'ld-prob-value';
      row.append(label, track, value);
      bars.appendChild(row);
      return { fill: fill, value: value };
    });
    function drawProbabilities() {
      var steps = Number(stepsSlider.value);
      var invalid = 1 / (2 * steps);
      var probs = [(1 - invalid) / 2, (1 - invalid) / 2, invalid / 2, invalid / 2];
      rows.forEach(function (row, i) {
        row.fill.style.width = (100 * probs[i]) + '%';
        row.value.textContent = (100 * probs[i]).toFixed(2) + '%';
      });
      document.getElementById('coupling-value').value = steps;
      document.getElementById('coupling-status').textContent =
        'Invalid mixed-color outputs: ' + (100 * invalid).toFixed(3) + '%. Exact calculation for ' + steps + ' uniform intervals; total probability is 100%.';
    }
    stepsSlider.addEventListener('input', drawProbabilities);
    drawProbabilities();
  }
})();
