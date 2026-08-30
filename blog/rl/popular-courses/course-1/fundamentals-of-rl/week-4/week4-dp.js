(function () {
  'use strict';

  var SIZE = 4;
  var TERMINAL = { 0: true, 15: true };
  var ACTIONS = [
    { dr: -1, dc: 0, symbol: '\u2191' },
    { dr: 0, dc: 1, symbol: '\u2192' },
    { dr: 1, dc: 0, symbol: '\u2193' },
    { dr: 0, dc: -1, symbol: '\u2190' }
  ];

  function zeroValues() {
    var values = [];
    for (var i = 0; i < SIZE * SIZE; i++) values.push(0);
    return values;
  }

  function nextState(index, action) {
    var row = Math.floor(index / SIZE);
    var col = index % SIZE;
    var nr = Math.max(0, Math.min(SIZE - 1, row + action.dr));
    var nc = Math.max(0, Math.min(SIZE - 1, col + action.dc));
    return nr * SIZE + nc;
  }

  function maxAbs(values) {
    var best = 1;
    for (var i = 0; i < values.length; i++) {
      best = Math.max(best, Math.abs(values[i]));
    }
    return best;
  }

  function renderValueGrid(container, values, previous) {
    if (!container) return;
    var scale = maxAbs(values);
    container.innerHTML = '';
    for (var i = 0; i < values.length; i++) {
      var cell = document.createElement('div');
      var changed = previous && Math.abs(values[i] - previous[i]) > 0.0005;
      cell.className = 'dp-cell' + (TERMINAL[i] ? ' terminal' : '') + (changed ? ' changed' : '');
      cell.style.setProperty('--heat', TERMINAL[i] ? 0 : (0.04 + 0.22 * Math.abs(values[i]) / scale).toFixed(3));

      var value = document.createElement('span');
      value.className = 'dp-cell-value';
      value.textContent = TERMINAL[i] ? '0' : values[i].toFixed(2);

      var label = document.createElement('span');
      label.className = 'dp-cell-label';
      label.textContent = TERMINAL[i] ? 'terminal' : 's' + i;

      cell.appendChild(value);
      cell.appendChild(label);
      container.appendChild(cell);
    }
  }

  function policyEvaluationSweep(values) {
    var next = values.slice();
    var delta = 0;
    for (var s = 0; s < values.length; s++) {
      if (TERMINAL[s]) {
        next[s] = 0;
        continue;
      }
      var total = 0;
      for (var a = 0; a < ACTIONS.length; a++) {
        total += 0.25 * (-1 + values[nextState(s, ACTIONS[a])]);
      }
      next[s] = total;
      delta = Math.max(delta, Math.abs(next[s] - values[s]));
    }
    return { values: next, delta: delta };
  }

  function valueIterationSweep(values) {
    var next = values.slice();
    var delta = 0;
    for (var s = 0; s < values.length; s++) {
      if (TERMINAL[s]) {
        next[s] = 0;
        continue;
      }
      var best = -Infinity;
      for (var a = 0; a < ACTIONS.length; a++) {
        best = Math.max(best, -1 + values[nextState(s, ACTIONS[a])]);
      }
      next[s] = best;
      delta = Math.max(delta, Math.abs(next[s] - values[s]));
    }
    return { values: next, delta: delta };
  }

  function initSweepWidget(prefix, backup) {
    var grid = document.getElementById(prefix + '-grid');
    var nextButton = document.getElementById(prefix + '-next');
    var runButton = document.getElementById(prefix + '-run');
    var resetButton = document.getElementById(prefix + '-reset');
    var status = document.getElementById(prefix + '-status');
    if (!grid || !nextButton || !runButton || !resetButton || !status) return;

    var values = zeroValues();
    var sweep = 0;
    var delta = 0;

    function render(previous) {
      renderValueGrid(grid, values, previous);
      status.textContent = 'Sweep ' + sweep + ' \u00b7 \u0394 = ' + delta.toFixed(6);
    }

    function step() {
      var previous = values.slice();
      var result = backup(values);
      values = result.values;
      delta = result.delta;
      sweep += 1;
      render(previous);
    }

    nextButton.addEventListener('click', step);
    runButton.addEventListener('click', function () {
      var previous = values.slice();
      var guard = 0;
      do {
        var result = backup(values);
        values = result.values;
        delta = result.delta;
        sweep += 1;
        guard += 1;
      } while (delta >= 0.0001 && guard < 10000);
      render(previous);
    });
    resetButton.addEventListener('click', function () {
      values = zeroValues();
      sweep = 0;
      delta = 0;
      render();
    });

    render();
  }

  function greedyActions(values, state) {
    var best = -Infinity;
    var chosen = [];
    for (var a = 0; a < ACTIONS.length; a++) {
      var score = -1 + values[nextState(state, ACTIONS[a])];
      if (score > best + 0.0001) {
        best = score;
        chosen = [ACTIONS[a].symbol];
      } else if (Math.abs(score - best) <= 0.0001) {
        chosen.push(ACTIONS[a].symbol);
      }
    }
    return chosen.join(' ');
  }

  function renderPolicyGrid(container, values, greedy) {
    container.innerHTML = '';
    var scale = maxAbs(values);
    for (var i = 0; i < values.length; i++) {
      var cell = document.createElement('div');
      cell.className = 'dp-cell' + (TERMINAL[i] ? ' terminal' : '');
      cell.style.setProperty('--heat', TERMINAL[i] ? 0 : (0.04 + 0.22 * Math.abs(values[i]) / scale).toFixed(3));

      var value = document.createElement('span');
      value.className = 'dp-cell-value';
      value.textContent = TERMINAL[i] ? '0' : values[i].toFixed(0);

      var arrows = document.createElement('span');
      arrows.className = 'dp-arrows';
      arrows.textContent = TERMINAL[i] ? 'T' : (greedy ? greedyActions(values, i) : '\u2191 \u2192 \u2193 \u2190');

      cell.appendChild(value);
      cell.appendChild(arrows);
      container.appendChild(cell);
    }
  }

  function initPolicyWidget() {
    var grid = document.getElementById('improve-grid');
    var randomButton = document.getElementById('improve-random');
    var greedyButton = document.getElementById('improve-greedy');
    var status = document.getElementById('improve-status');
    if (!grid || !randomButton || !greedyButton || !status) return;

    var values = [
      0, -14, -20, -22,
      -14, -18, -20, -20,
      -20, -20, -18, -14,
      -22, -20, -14, 0
    ];

    function show(greedy) {
      renderPolicyGrid(grid, values, greedy);
      randomButton.classList.toggle('active', !greedy);
      greedyButton.classList.toggle('active', greedy);
      status.textContent = greedy
        ? 'Greedy improvement: retain every action tied for the best one-step lookahead'
        : 'Original policy: each arrow has probability 1/4';
    }

    randomButton.addEventListener('click', function () { show(false); });
    greedyButton.addEventListener('click', function () { show(true); });
    show(false);
  }

  initSweepWidget('eval', policyEvaluationSweep);
  initSweepWidget('value', valueIterationSweep);
  initPolicyWidget();
})();
