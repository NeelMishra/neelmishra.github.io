(function () {
  'use strict';
  var cases = window.PREDICTION_LOSS_CASES;
  if (!cases) return;
  function factorialLog(y) { var sum = 0; for (var k = 2; k <= y; k++) sum += Math.log(k); return sum; }
  function total(key, c, data) {
    return data.y.reduce(function (sum, y) {
      var e = y - c, value;
      if (key === 'squared-error') value = 0.5 * e * e;
      if (key === 'absolute-error') value = Math.abs(e);
      if (key === 'binary-log-loss') value = Math.max(c, 0) + Math.log1p(Math.exp(-Math.abs(c))) - y * c;
      if (key === 'poisson-loss') value = Math.exp(c) - y * c + factorialLog(y);
      if (key === 'huber-loss') value = Math.abs(e) <= data.delta ? 0.5 * e * e : data.delta * Math.abs(e) - 0.5 * data.delta * data.delta;
      return sum + value;
    }, 0);
  }
  function fmt(x) { return Number(x.toFixed(4)).toString(); }
  document.querySelectorAll('.loss-lab').forEach(function (lab) {
    var key = lab.dataset.loss, input = lab.querySelector('[data-constant]'), select = lab.querySelector('[data-loss-select]');
    var svg = lab.querySelector('svg'), output = lab.querySelector('.loss-result');
    function render() {
      var data = cases[key], c = Number(input.value), lo = data.domain[0], hi = data.domain[1];
      var samples = [], max = 0;
      for (var i = 0; i <= 160; i++) {
        var x = lo + (hi - lo) * i / 160, y = total(key, x, data);
        samples.push([x, y]); max = Math.max(max, y);
      }
      max *= 1.08;
      var left = 64, right = 617, top = 38, bottom = 266;
      function px(x) { return left + (x - lo) / (hi - lo) * (right - left); }
      function py(y) { return bottom - y / max * (bottom - top); }
      var a = data.optimum[0], b = data.optimum[1], curve = samples.map(function (v, j) { return (j ? 'L' : 'M') + px(v[0]).toFixed(2) + ',' + py(v[1]).toFixed(2); }).join(' ');
      var value = total(key, c, data), prediction = key === 'binary-log-loss' ? 1 / (1 + Math.exp(-c)) : key === 'poisson-loss' ? Math.exp(c) : c;
      var markup = '<title>' + data.title + ': total loss versus constant score</title><desc>The orange mark locates a minimum. The blue point shows the loss for the chosen score.</desc>';
      markup += '<g font-family="Arial,sans-serif" font-size="17" fill="currentColor"><text x="64" y="22">Total training loss J(c)</text>';
      for (var tick = 0; tick <= 4; tick++) {
        var ty = max * tick / 4, tx = lo + (hi - lo) * tick / 4;
        markup += '<path d="M64 ' + py(ty) + 'H617" stroke="currentColor" opacity=".12"/><text x="56" y="' + (py(ty) + 5) + '" text-anchor="end">' + fmt(Math.round(ty * 10) / 10) + '</text>';
        markup += '<text x="' + px(tx) + '" y="289" text-anchor="middle">' + fmt(tx) + '</text>';
      }
      if (a !== b) markup += '<rect x="' + px(a) + '" y="38" width="' + (px(b) - px(a)) + '" height="228" fill="#da7925" opacity=".16"/>';
      markup += '<path d="' + curve + '" fill="none" stroke="#0a8f6a" stroke-width="3"/>';
      markup += '<path d="M' + px(a) + ' 38V266" stroke="#da7925" stroke-width="1.5" stroke-dasharray="5 4"/>';
      if (a !== b) markup += '<path d="M' + px(a) + ' ' + py(data.minimum) + 'H' + px(b) + '" stroke="#da7925" stroke-width="4"/>';
      else markup += '<circle cx="' + px(a) + '" cy="' + py(data.minimum) + '" r="5" fill="#da7925"/>';
      markup += '<path d="M' + px(c) + ' 266V' + py(value) + '" stroke="#356eaa" stroke-width="1.5"/>';
      markup += '<circle cx="' + px(c) + '" cy="' + py(value) + '" r="5" fill="#356eaa"/><text x="340" y="318" text-anchor="middle">Constant raw score c</text></g>';
      svg.innerHTML = markup;
      lab.querySelector('figcaption a').href = 'assets/' + key + '-constant.svg';
      lab.querySelector('.loss-data').textContent = 'Targets: [' + data.y.join(', ') + ']. ' + (key === 'huber-loss' ? 'Fixed Huber threshold: 2. ' : '') + (a === b ? 'Best score: ' + fmt(a) + '.' : 'Every score from ' + fmt(a) + ' to ' + fmt(b) + ' is optimal.');
      output.textContent = 'Score: ' + fmt(c) + ' · Reported prediction: ' + fmt(prediction) + ' · Total loss: ' + fmt(value) + ' · Excess above minimum: ' + fmt(Math.max(0, value - data.minimum));
      lab.dataset.state = JSON.stringify({ loss: key, c: c, prediction: prediction, total: value, minimum: data.minimum });
    }
    function choose() {
      var data = cases[key]; input.min = data.domain[0]; input.max = data.domain[1]; input.value = 0;
      if (select) select.value = key;
      render();
    }
    input.addEventListener('input', render);
    if (select) select.addEventListener('change', function () { key = select.value; choose(); });
    lab.querySelector('[data-optimum]').addEventListener('click', function () { var d = cases[key]; input.value = (d.optimum[0] + d.optimum[1]) / 2; render(); });
    choose();
    lab.querySelector('.loss-live').hidden = false;
    lab.querySelector('.loss-static').hidden = true;
  });
})();
