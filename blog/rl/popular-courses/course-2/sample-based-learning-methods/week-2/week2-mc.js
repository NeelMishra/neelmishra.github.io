(function () {
  'use strict';

  function text(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function initReturnExplorer() {
    var slider = document.getElementById('mc-return-gamma');
    var list = document.getElementById('mc-return-list');
    if (!slider || !list) return;

    var rewards = [3, 4, 7, 1, 2];

    function render() {
      var gamma = Number(slider.value);
      var returns = [];
      var g = 0;
      for (var t = rewards.length - 1; t >= 0; t--) {
        g = rewards[t] + gamma * g;
        returns[t] = g;
      }
      text('mc-return-gamma-value', gamma.toFixed(2));
      list.innerHTML = '';
      for (var i = rewards.length - 1; i >= 0; i--) {
        var order = rewards.length - i;
        var step = document.createElement('div');
        step.className = 'mc-return-step';
        step.innerHTML = '<strong>G<sub>' + i + '</sub> = ' + returns[i].toFixed(3) + '</strong>' +
          '<span class="mc-compute-order">Step ' + order + ' of ' + rewards.length + '</span>' +
          '<span>R<sub>' + (i + 1) + '</sub> = ' + rewards[i] + ' &middot; target for S<sub>' + i + '</sub></span>' +
          '<code>' + rewards[i] + ' + ' + gamma.toFixed(2) + 'G<sub>' + (i + 1) + '</sub></code>';
        list.appendChild(step);
      }
      text('mc-return-summary', 'Start with G5 = 0, then compute G4 \u2192 G3 \u2192 G2 \u2192 G1 \u2192 G0. ' +
        'The start-state target is G0 = ' + returns[0].toFixed(3) + '.');
    }

    slider.addEventListener('input', render);
    render();
  }

  function initEpsilonExplorer() {
    var slider = document.getElementById('mc-epsilon');
    var chart = document.getElementById('mc-epsilon-chart');
    var sampleButton = document.getElementById('mc-epsilon-sample');
    var resetButton = document.getElementById('mc-epsilon-reset');
    if (!slider || !chart || !sampleButton || !resetButton) return;

    var base = [0.7, 0.2, 0.1];
    var counts = [0, 0, 0];
    var labels = ['a1', 'a2', 'a3'];

    function probabilities() {
      var epsilon = Number(slider.value);
      var result = [];
      for (var i = 0; i < base.length; i++) {
        result[i] = (1 - epsilon) * base[i] + epsilon / base.length;
      }
      return result;
    }

    function render() {
      var epsilon = Number(slider.value);
      var mixed = probabilities();
      text('mc-epsilon-value', epsilon.toFixed(2));
      text('mc-epsilon-floor', (epsilon / base.length).toFixed(4));
      chart.innerHTML = '';
      for (var i = 0; i < base.length; i++) {
        var row = document.createElement('div');
        row.className = 'mc-bar-row';
        row.innerHTML = '<span class="mc-bar-label">' + labels[i] + '</span>' +
          '<span class="mc-bar-track"><span class="mc-bar mixed" style="display:block;width:' +
          (100 * mixed[i]).toFixed(2) + '%"></span></span>' +
          '<span class="mc-bar-value">' + mixed[i].toFixed(4) + '</span>';
        chart.appendChild(row);
      }
      text('mc-epsilon-counts', 'Samples: a1=' + counts[0] + ', a2=' + counts[1] + ', a3=' + counts[2]);
    }

    sampleButton.addEventListener('click', function () {
      var mixed = probabilities();
      var u = Math.random();
      var cumulative = 0;
      var chosen = mixed.length - 1;
      for (var i = 0; i < mixed.length; i++) {
        cumulative += mixed[i];
        if (u < cumulative) {
          chosen = i;
          break;
        }
      }
      counts[chosen] += 1;
      text('mc-epsilon-result', 'u = ' + u.toFixed(4) + ' lands in the interval for ' +
        labels[chosen] + '. Exploration is already baked into the distribution.');
      render();
    });

    resetButton.addEventListener('click', function () {
      counts = [0, 0, 0];
      text('mc-epsilon-result', 'Draw from the mixed policy to see inverse-CDF sampling.');
      render();
    });

    slider.addEventListener('input', function () {
      counts = [0, 0, 0];
      text('mc-epsilon-result', 'Policy changed; sample counts reset.');
      render();
    });
    render();
  }

  function initImportanceExplorer() {
    var drawButton = document.getElementById('mc-is-draw');
    var manyButton = document.getElementById('mc-is-many');
    var resetButton = document.getElementById('mc-is-reset');
    var body = document.getElementById('mc-is-body');
    if (!drawButton || !manyButton || !resetButton || !body) return;

    var values = [1, 2, 3, 4];
    var behavior = [0.85, 0.05, 0.05, 0.05];
    var target = [0.30, 0.40, 0.10, 0.20];
    var samples = [];
    var seed = 123456789;

    function random() {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 4294967296;
    }

    function draw() {
      var u = random();
      var cumulative = 0;
      var index = behavior.length - 1;
      for (var i = 0; i < behavior.length; i++) {
        cumulative += behavior[i];
        if (u < cumulative) {
          index = i;
          break;
        }
      }
      samples.push(index);
    }

    function render() {
      body.innerHTML = '';
      var weightedSum = 0;
      var weightSum = 0;
      var start = Math.max(0, samples.length - 12);
      for (var i = 0; i < samples.length; i++) {
        var index = samples[i];
        var rho = target[index] / behavior[index];
        weightedSum += rho * values[index];
        weightSum += rho;
        if (i >= start) {
          var row = document.createElement('tr');
          row.innerHTML = '<td>' + (i + 1) + '</td><td>' + values[index] + '</td><td>' +
            behavior[index].toFixed(2) + '</td><td>' + target[index].toFixed(2) +
            '</td><td>' + rho.toFixed(3) + '</td><td>' + (rho * values[index]).toFixed(3) + '</td>';
          body.appendChild(row);
        }
      }

      var ordinary = samples.length ? weightedSum / samples.length : 0;
      var normalized = weightSum ? weightedSum / weightSum : 0;
      text('mc-is-count', String(samples.length));
      text('mc-is-ordinary', samples.length ? ordinary.toFixed(3) : '\u2014');
      text('mc-is-weighted', samples.length ? normalized.toFixed(3) : '\u2014');
      text('mc-is-note', samples.length > 12
        ? 'Showing the latest 12 draws. A rare x=2 or x=4 carries a large ratio because b almost never selects it.'
        : 'The target mean is 2.200. Draw from b and watch the correction trade bias for variance.');
    }

    drawButton.addEventListener('click', function () {
      draw();
      render();
    });
    manyButton.addEventListener('click', function () {
      for (var i = 0; i < 20; i++) draw();
      render();
    });
    resetButton.addEventListener('click', function () {
      samples = [];
      seed = 123456789;
      render();
    });
    render();
  }

  initReturnExplorer();
  initEpsilonExplorer();
  initImportanceExplorer();
})();
