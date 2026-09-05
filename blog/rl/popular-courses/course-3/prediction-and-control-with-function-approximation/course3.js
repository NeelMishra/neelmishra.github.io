(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var COLOR = {
    green: '#0a8f6a',
    blue: '#3a7bd5',
    gold: '#c98a2b',
    red: '#b83a3a',
    gray: '#9eaaa4',
    line: '#d8dedb',
    ink: '#2d3a34',
    muted: '#6b7a72',
    paleGreen: 'rgba(10,143,106,0.13)',
    paleBlue: 'rgba(58,123,213,0.12)',
    paleGold: 'rgba(201,138,43,0.13)'
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var el = byId(id);
    if (el) el.textContent = value;
  }

  function svgEl(name, attrs) {
    var el = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (key) {
      el.setAttribute(key, attrs[key]);
    });
    return el;
  }

  function clear(svg) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
  }

  function line(svg, x1, y1, x2, y2, color, width, dash) {
    var attrs = {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      stroke: color,
      'stroke-width': width || 1.5,
      'stroke-linecap': 'round'
    };
    if (dash) attrs['stroke-dasharray'] = dash;
    var el = svgEl('line', attrs);
    svg.appendChild(el);
    return el;
  }

  function label(svg, x, y, value, color, size, anchor, weight) {
    var el = svgEl('text', {
      x: x,
      y: y,
      fill: color || COLOR.muted,
      'font-family': 'Manrope, sans-serif',
      'font-size': size || 12,
      'font-weight': weight || 500,
      'text-anchor': anchor || 'middle'
    });
    el.textContent = value;
    svg.appendChild(el);
    return el;
  }

  function drawAxis(svg, left, right, y, min, max, ticks) {
    line(svg, left, y, right, y, COLOR.gray, 1.2);
    for (var i = 0; i <= ticks; i++) {
      var value = min + (max - min) * i / ticks;
      var x = left + (right - left) * i / ticks;
      line(svg, x, y - 4, x, y + 4, COLOR.gray, 1);
      label(svg, x, y + 18, value.toFixed(value % 1 ? 1 : 0), COLOR.muted, 10);
    }
  }

  (function initParameterizedGrid() {
    var w1Input = byId('param-w1');
    var w2Input = byId('param-w2');
    var grid = byId('param-grid');
    if (!w1Input || !w2Input || !grid) return;

    function render() {
      var w1 = Number(w1Input.value);
      var w2 = Number(w2Input.value);
      var values = [];
      var min = Infinity;
      var max = -Infinity;
      var maxAbs = 0;
      var x;
      var y;

      for (y = 3; y >= 0; y--) {
        for (x = 0; x < 4; x++) {
          var value = w1 * x + w2 * y;
          values.push({ x: x, y: y, value: value });
          min = Math.min(min, value);
          max = Math.max(max, value);
          maxAbs = Math.max(maxAbs, Math.abs(value));
        }
      }

      grid.innerHTML = '';
      values.forEach(function (item) {
        var cell = document.createElement('div');
        var strength = maxAbs ? Math.abs(item.value) / maxAbs : 0;
        cell.className = 'fa-grid-cell';
        cell.style.background = item.value >= 0
          ? 'rgba(10,143,106,' + (0.04 + 0.20 * strength).toFixed(3) + ')'
          : 'rgba(184,58,58,' + (0.04 + 0.17 * strength).toFixed(3) + ')';
        cell.innerHTML = '<span>(x=' + item.x + ', y=' + item.y + ')</span><strong>' +
          item.value.toFixed(1) + '</strong>';
        grid.appendChild(cell);
      });

      setText('param-w1-value', w1.toFixed(1));
      setText('param-w2-value', w2.toFixed(1));
      setText('param-min-value', min.toFixed(1));
      setText('param-max-value', max.toFixed(1));
      setText('param-status', 'Two weights determine all 16 estimates. Moving either slider changes an entire pattern of states at once.');
    }

    w1Input.addEventListener('input', render);
    w2Input.addEventListener('input', render);
    render();
  })();

  (function initMSVE() {
    var muInput = byId('msve-mu');
    var weightInput = byId('msve-weight');
    var svg = byId('msve-svg');
    if (!muInput || !weightInput || !svg) return;

    function objective(w, muB) {
      return (1 - muB) * w * w + muB * (4 - w) * (4 - w);
    }

    function render() {
      var muB = Number(muInput.value);
      var w = Number(weightInput.value);
      var optimum = 4 * muB;
      var loss = objective(w, muB);
      var left = 55;
      var right = 640;
      var top = 28;
      var bottom = 225;
      var minW = -1;
      var maxW = 5;
      var maxLoss = 26;
      var mapX = function (value) {
        return left + (value - minW) / (maxW - minW) * (right - left);
      };
      var mapY = function (value) {
        return bottom - value / maxLoss * (bottom - top);
      };
      var points = [];
      var i;

      clear(svg);
      for (i = 0; i <= 150; i++) {
        var sampleW = minW + (maxW - minW) * i / 150;
        points.push((i ? 'L' : 'M') + mapX(sampleW).toFixed(1) + ',' +
          mapY(objective(sampleW, muB)).toFixed(1));
      }
      svg.appendChild(svgEl('path', {
        d: points.join(' '),
        fill: 'none',
        stroke: COLOR.blue,
        'stroke-width': 3
      }));
      drawAxis(svg, left, right, bottom, minW, maxW, 6);
      line(svg, left, top, left, bottom, COLOR.gray, 1.2);
      label(svg, left, 17, 'MSVE', COLOR.muted, 11, 'start', 700);

      line(svg, mapX(optimum), top, mapX(optimum), bottom, COLOR.green, 2, '5 4');
      svg.appendChild(svgEl('circle', {
        cx: mapX(optimum),
        cy: mapY(objective(optimum, muB)),
        r: 6,
        fill: COLOR.green
      }));
      line(svg, mapX(w), top, mapX(w), bottom, COLOR.gold, 2, '5 4');
      svg.appendChild(svgEl('circle', {
        cx: mapX(w),
        cy: mapY(loss),
        r: 7,
        fill: COLOR.gold
      }));
      label(svg, mapX(optimum), top + 13, 'best w', COLOR.green, 10, 'middle', 700);
      label(svg, mapX(w), top + 27, 'current w', COLOR.gold, 10, 'middle', 700);

      setText('msve-mu-value', muB.toFixed(2));
      setText('msve-weight-value', w.toFixed(2));
      setText('msve-mu-a', (1 - muB).toFixed(2));
      setText('msve-mu-b', muB.toFixed(2));
      setText('msve-optimum', optimum.toFixed(2));
      setText('msve-loss', loss.toFixed(3));
      setText('msve-status', 'With one constant prediction for both states, the best value is their visitation-weighted average: w* = 4 mu(B).');
    }

    muInput.addEventListener('input', render);
    weightInput.addEventListener('input', render);
    render();
  })();

  (function initAggregation() {
    var binsInput = byId('aggregation-bins');
    var biasInput = byId('aggregation-bias');
    var svg = byId('aggregation-svg');
    if (!binsInput || !biasInput || !svg) return;

    function render() {
      var bins = Number(binsInput.value);
      var bias = Number(biasInput.value);
      var left = 55;
      var right = 645;
      var top = 25;
      var bottom = 245;
      var mapX = function (x) { return left + x * (right - left); };
      var mapY = function (value) { return bottom - (value + 1.1) / 2.2 * (bottom - top); };
      var truePoints = [];
      var stepParts = [];
      var totalShift = 0;
      var i;

      clear(svg);
      for (i = 0; i <= 120; i++) {
        var x = i / 120;
        truePoints.push((i ? 'L' : 'M') + mapX(x).toFixed(1) + ',' + mapY(2 * x - 1).toFixed(1));
      }
      svg.appendChild(svgEl('path', {
        d: truePoints.join(' '),
        fill: 'none',
        stroke: COLOR.red,
        'stroke-width': 2.5
      }));

      for (i = 0; i < bins; i++) {
        var start = i / bins;
        var end = (i + 1) / bins;
        var weightedValue = 0;
        var totalWeight = 0;
        var k;
        for (k = 0; k < 100; k++) {
          var sample = start + (end - start) * (k + 0.5) / 100;
          var mu = (1 - bias) + bias * 2 * (1 - Math.abs(2 * sample - 1));
          weightedValue += mu * (2 * sample - 1);
          totalWeight += mu;
        }
        weightedValue /= totalWeight;
        var midpointValue = 2 * ((start + end) / 2) - 1;
        totalShift += Math.abs(weightedValue - midpointValue);
        stepParts.push('M' + mapX(start).toFixed(1) + ',' + mapY(weightedValue).toFixed(1) +
          ' H' + mapX(end).toFixed(1));
        if (i < bins - 1) {
          line(svg, mapX(end), mapY(weightedValue), mapX(end), mapY(weightedValue), COLOR.blue, 1);
        }
      }
      svg.appendChild(svgEl('path', {
        d: stepParts.join(' '),
        fill: 'none',
        stroke: COLOR.blue,
        'stroke-width': 4,
        'stroke-linecap': 'butt'
      }));
      line(svg, left, mapY(0), right, mapY(0), COLOR.line, 1);
      drawAxis(svg, left, right, bottom, 0, 1, 5);
      line(svg, left, top, left, bottom, COLOR.gray, 1.2);
      label(svg, left, 16, 'value', COLOR.muted, 11, 'start', 700);

      setText('aggregation-bins-value', String(bins));
      setText('aggregation-bias-value', bias.toFixed(2));
      setText('aggregation-parameters', String(bins));
      setText('aggregation-shift', (totalShift / bins).toFixed(3));
      setText('aggregation-status', bias < 0.05
        ? 'Uniform visitation makes each step equal the true value at its bin midpoint.'
        : 'Central states count more, so each group weight is pulled toward the part of its bin closer to the center.');
    }

    binsInput.addEventListener('input', render);
    biasInput.addEventListener('input', render);
    render();
  })();

  (function initMovingTarget() {
    var weightInput = byId('semi-weight');
    var gammaInput = byId('semi-gamma');
    var svg = byId('semi-target-svg');
    if (!weightInput || !gammaInput || !svg) return;

    function render() {
      var w = Number(weightInput.value);
      var gamma = Number(gammaInput.value);
      var reward = 0.5;
      var nextFeature = 0.7;
      var prediction = w;
      var tdTarget = reward + gamma * nextFeature * w;
      var mcTarget = 2.5;
      var left = 55;
      var right = 635;
      var min = -3;
      var max = 5;
      var mapX = function (value) {
        return left + (value - min) / (max - min) * (right - left);
      };

      clear(svg);
      drawAxis(svg, left, right, 175, min, max, 8);
      [
        { y: 55, value: prediction, color: COLOR.gold, name: 'prediction v-hat(S,w)' },
        { y: 100, value: tdTarget, color: COLOR.blue, name: 'TD target R + gamma v-hat(S_next,w)' },
        { y: 145, value: mcTarget, color: COLOR.green, name: 'MC target G (fixed)' }
      ].forEach(function (item) {
        line(svg, left, item.y, right, item.y, COLOR.line, 1);
        svg.appendChild(svgEl('circle', {
          cx: mapX(item.value),
          cy: item.y,
          r: 7,
          fill: item.color
        }));
        label(svg, left, item.y - 11, item.name, item.color, 11, 'start', 700);
        label(svg, mapX(item.value), item.y + 22, item.value.toFixed(2), item.color, 10, 'middle', 700);
      });

      setText('semi-weight-value', w.toFixed(2));
      setText('semi-gamma-value', gamma.toFixed(2));
      setText('semi-prediction', prediction.toFixed(3));
      setText('semi-td-target', tdTarget.toFixed(3));
      setText('semi-mc-target', mcTarget.toFixed(3));
      setText('semi-td-error', (tdTarget - prediction).toFixed(3));
      setText('semi-status', 'Changing w moves both the prediction and the TD target. The sampled Monte Carlo return stays fixed.');
    }

    weightInput.addEventListener('input', render);
    gammaInput.addEventListener('input', render);
    render();
  })();

  (function initCoarseCoding() {
    var xInput = byId('coarse-x');
    var yInput = byId('coarse-y');
    var svg = byId('coarse-svg');
    var vector = byId('coarse-vector');
    if (!xInput || !yInput || !svg || !vector) return;

    var centers = [
      [310, 82],
      [238, 150],
      [382, 150],
      [268, 232],
      [352, 232]
    ];
    var radius = 88;

    function render() {
      var stateX = Number(xInput.value);
      var stateY = Number(yInput.value);
      var px = 80 + stateX / 100 * 460;
      var py = 35 + stateY / 100 * 255;
      var active = [];

      clear(svg);
      centers.forEach(function (center, index) {
        var dx = px - center[0];
        var dy = py - center[1];
        var isActive = dx * dx + dy * dy <= radius * radius;
        active.push(isActive ? 1 : 0);
        svg.appendChild(svgEl('circle', {
          cx: center[0],
          cy: center[1],
          r: radius,
          fill: isActive ? COLOR.paleGreen : 'rgba(158,170,164,0.06)',
          stroke: isActive ? COLOR.green : COLOR.gray,
          'stroke-width': isActive ? 3 : 1.5
        }));
        label(svg, center[0], center[1] + 4, 'feature ' + (index + 1), isActive ? COLOR.green : COLOR.muted, 10, 'middle', 700);
      });
      svg.appendChild(svgEl('circle', {
        cx: px,
        cy: py,
        r: 8,
        fill: COLOR.gold,
        stroke: '#fff',
        'stroke-width': 2
      }));
      label(svg, px, Math.max(16, py - 14), 'state s', COLOR.gold, 11, 'middle', 800);
      label(svg, 310, 319, 'a feature is active when its receptive field contains the state', COLOR.muted, 11);

      vector.innerHTML = '<span>x(s) =</span>';
      active.forEach(function (bit) {
        var el = document.createElement('span');
        el.className = 'fa-feature-bit' + (bit ? ' active' : '');
        el.textContent = String(bit);
        vector.appendChild(el);
      });
      setText('coarse-x-value', stateX.toFixed(0));
      setText('coarse-y-value', stateY.toFixed(0));
      setText('coarse-active-count', String(active.reduce(function (sum, bit) { return sum + bit; }, 0)));
      setText('coarse-pattern', active.join(''));
      setText('coarse-status', active.some(function (bit) { return bit; })
        ? 'Overlaps create a multi-hot feature vector: one state can activate several features at once.'
        : 'This point lies outside every receptive field, showing why a practical design must cover the full state space.');
    }

    xInput.addEventListener('input', render);
    yInput.addEventListener('input', render);
    render();
  })();

  (function initGeneralizationShape() {
    var radiusInput = byId('receptive-radius');
    var aspectInput = byId('receptive-aspect');
    var svg = byId('receptive-svg');
    if (!radiusInput || !aspectInput || !svg) return;

    function render() {
      var radius = Number(radiusInput.value);
      var aspect = Number(aspectInput.value);
      var rx = radius * aspect;
      var ry = radius / aspect;
      var cx = 340;
      var cy = 160;
      var affected = 0;
      var total = 0;
      var x;
      var y;

      clear(svg);
      for (x = 100; x <= 580; x += 30) {
        for (y = 25; y <= 295; y += 30) {
          var inside = Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2) <= 1;
          total++;
          if (inside) affected++;
          svg.appendChild(svgEl('circle', {
            cx: x,
            cy: y,
            r: 3,
            fill: inside ? COLOR.green : COLOR.line
          }));
        }
      }
      svg.appendChild(svgEl('ellipse', {
        cx: cx,
        cy: cy,
        rx: rx,
        ry: ry,
        fill: COLOR.paleGreen,
        stroke: COLOR.green,
        'stroke-width': 3
      }));
      svg.appendChild(svgEl('circle', {
        cx: cx,
        cy: cy,
        r: 7,
        fill: COLOR.gold
      }));
      line(svg, cx - rx, cy, cx + rx, cy, COLOR.blue, 2, '5 4');
      line(svg, cx, cy - ry, cx, cy + ry, COLOR.gold, 2, '5 4');
      label(svg, cx + rx, cy - 8, 'horizontal reach', COLOR.blue, 10, 'end', 700);
      label(svg, cx + 8, cy - ry + 13, 'vertical reach', COLOR.gold, 10, 'start', 700);
      label(svg, cx, 315, 'states inside the same receptive field share this feature update', COLOR.muted, 11);

      setText('receptive-radius-value', radius.toFixed(0));
      setText('receptive-aspect-value', aspect.toFixed(2));
      setText('receptive-horizontal', rx.toFixed(0));
      setText('receptive-vertical', ry.toFixed(0));
      setText('receptive-affected', String(affected) + ' / ' + String(total));
      setText('receptive-status', aspect > 1.15
        ? 'The wide field generalizes mainly left and right.'
        : aspect < 0.85
          ? 'The tall field generalizes mainly up and down.'
          : 'A nearly round field generalizes similarly in every direction.');
    }

    radiusInput.addEventListener('input', render);
    aspectInput.addEventListener('input', render);
    render();
  })();

  (function initTileCoding() {
    var xInput = byId('tile-x');
    var yInput = byId('tile-y');
    var deltaInput = byId('tile-delta');
    var svg = byId('tile-svg');
    if (!xInput || !yInput || !deltaInput || !svg) return;

    var panelSize = 180;
    var cell = 70;
    var panelY = 45;
    var panelX = [20, 250, 480];
    var offsets = [[0, 0], [17, 11], [31, 27]];

    function render() {
      var stateX = Math.min(0.999, Number(xInput.value) / 100) * panelSize;
      var stateY = Math.min(0.999, Number(yInput.value) / 100) * panelSize;
      var delta = Number(deltaInput.value);
      var activeIds = [];
      var activeWeights = [];
      var defs = svgEl('defs');
      var k;

      clear(svg);
      svg.appendChild(defs);
      for (k = 0; k < 3; k++) {
        var clip = svgEl('clipPath', { id: 'tile-clip-' + k });
        clip.appendChild(svgEl('rect', {
          x: panelX[k],
          y: panelY,
          width: panelSize,
          height: panelSize,
          rx: 4
        }));
        defs.appendChild(clip);
      }

      for (k = 0; k < 3; k++) {
        var baseX = panelX[k];
        var offsetX = offsets[k][0];
        var offsetY = offsets[k][1];
        var col = Math.floor((stateX - offsetX) / cell);
        var row = Math.floor((stateY - offsetY) / cell);
        var tileLeft = baseX + offsetX + col * cell;
        var tileTop = panelY + offsetY + row * cell;
        var id = 'T' + (k + 1) + ':(' + col + ',' + row + ')';
        var weight = ((((col + 3) * 13 + (row + 3) * 7 + (k + 1) * 5) % 17) - 8) / 5;
        var group = svgEl('g', { 'clip-path': 'url(#tile-clip-' + k + ')' });
        var i;

        activeIds.push(id);
        activeWeights.push(weight);
        group.appendChild(svgEl('rect', {
          x: tileLeft,
          y: tileTop,
          width: cell,
          height: cell,
          fill: COLOR.paleGreen,
          stroke: COLOR.green,
          'stroke-width': 3
        }));
        for (i = -3; i <= 5; i++) {
          group.appendChild(svgEl('line', {
            x1: baseX + offsetX + i * cell,
            y1: panelY,
            x2: baseX + offsetX + i * cell,
            y2: panelY + panelSize,
            stroke: COLOR.gray,
            'stroke-width': 1
          }));
          group.appendChild(svgEl('line', {
            x1: baseX,
            y1: panelY + offsetY + i * cell,
            x2: baseX + panelSize,
            y2: panelY + offsetY + i * cell,
            stroke: COLOR.gray,
            'stroke-width': 1
          }));
        }
        svg.appendChild(group);
        svg.appendChild(svgEl('rect', {
          x: baseX,
          y: panelY,
          width: panelSize,
          height: panelSize,
          rx: 4,
          fill: 'none',
          stroke: COLOR.ink,
          'stroke-width': 1.5
        }));
        svg.appendChild(svgEl('circle', {
          cx: baseX + stateX,
          cy: panelY + stateY,
          r: 6,
          fill: COLOR.gold,
          stroke: '#fff',
          'stroke-width': 2
        }));
        label(svg, baseX + panelSize / 2, 28, 'tiling ' + (k + 1), COLOR.ink, 12, 'middle', 800);
        label(svg, baseX + panelSize / 2, 246, id, COLOR.green, 10, 'middle', 700);
      }

      var estimate = activeWeights.reduce(function (sum, value) { return sum + value; }, 0);
      var perFeatureUpdate = 0.3 / 3 * delta;
      setText('tile-x-value', Number(xInput.value).toFixed(0));
      setText('tile-y-value', Number(yInput.value).toFixed(0));
      setText('tile-delta-value', delta.toFixed(2));
      setText('tile-active-ids', activeIds.join('  +  '));
      setText('tile-active-count', '3');
      setText('tile-estimate', estimate.toFixed(2));
      setText('tile-update', perFeatureUpdate.toFixed(3));
      setText('tile-status', 'Exactly one tile per tiling is active. Value lookup and TD update touch only these three weights.');
    }

    xInput.addEventListener('input', render);
    yInput.addEventListener('input', render);
    deltaInput.addEventListener('input', render);
    render();
  })();

  (function initStackedActions() {
    var stateInput = byId('stack-state');
    var actionInput = byId('stack-action');
    var svg = byId('stack-svg');
    var vectorEl = byId('stack-vector');
    if (!stateInput || !actionInput || !svg || !vectorEl) return;

    var STATES = [
      { name: 's0', bits: [1, 0, 0, 1] },
      { name: 's1', bits: [0, 1, 1, 0] },
      { name: 's2', bits: [1, 1, 0, 0] },
      { name: 's3', bits: [0, 0, 1, 1] }
    ];
    var WEIGHTS = [
      [0.7, 0.1, 0.4, 0.3],
      [2.2, 1.0, 0.6, 1.8],
      [1.3, 1.1, 0.9, 1.7]
    ];
    var BLOCK_COLORS = [COLOR.red, COLOR.green, COLOR.blue];

    function actionValue(bits, action) {
      var total = 0;
      for (var i = 0; i < bits.length; i++) {
        if (bits[i]) total += WEIGHTS[action][i];
      }
      return total;
    }

    function render() {
      var state = STATES[Number(stateInput.value)];
      var action = Number(actionInput.value);
      var values = [0, 1, 2].map(function (a) { return actionValue(state.bits, a); });
      var best = values.indexOf(Math.max(values[0], values[1], values[2]));

      clear(svg);
      label(svg, 60, 24, 'x(s)', COLOR.ink, 13, 'middle', 800);
      label(svg, 250, 24, 'x(s, a)', COLOR.ink, 13, 'middle', 800);
      label(svg, 400, 24, 'w', COLOR.ink, 13, 'middle', 800);
      label(svg, 560, 24, 'q(s, a, w)', COLOR.ink, 13, 'middle', 800);

      var cell = 20;
      var top = 40;
      for (var i = 0; i < 4; i++) {
        var on = state.bits[i] === 1;
        svg.appendChild(svgEl('rect', {
          x: 40, y: top + i * cell, width: 40, height: cell - 2, rx: 4,
          fill: on ? COLOR.paleGreen : '#fff',
          stroke: on ? COLOR.green : COLOR.line,
          'stroke-width': 1.2
        }));
        label(svg, 60, top + i * cell + 14, String(state.bits[i]), on ? COLOR.green : COLOR.muted, 11, 'middle', 700);
      }
      label(svg, 60, top + 4 * cell + 18, state.name, COLOR.muted, 11);

      for (var a = 0; a < 3; a++) {
        var blockTop = top + a * (4 * cell + 16);
        var live = a === action;
        for (var j = 0; j < 4; j++) {
          var bit = live ? state.bits[j] : 0;
          svg.appendChild(svgEl('rect', {
            x: 210, y: blockTop + j * cell, width: 80, height: cell - 2, rx: 4,
            fill: bit ? 'rgba(10,143,106,0.16)' : '#fff',
            stroke: live ? BLOCK_COLORS[a] : COLOR.line,
            'stroke-width': live ? 1.4 : 1
          }));
          label(svg, 250, blockTop + j * cell + 14, String(bit), bit ? COLOR.green : COLOR.muted, 11, 'middle', 700);

          svg.appendChild(svgEl('rect', {
            x: 360, y: blockTop + j * cell, width: 80, height: cell - 2, rx: 4,
            fill: live && bit ? 'rgba(201,138,43,0.16)' : '#fff',
            stroke: BLOCK_COLORS[a],
            'stroke-width': 1.1
          }));
          label(svg, 400, blockTop + j * cell + 14, WEIGHTS[a][j].toFixed(1), COLOR.ink, 11, 'middle', live && bit ? 800 : 500);
        }
        label(svg, 172, blockTop + 2 * cell + 4, 'a' + a, BLOCK_COLORS[a], 13, 'middle', 800);

        var barWidth = Math.max(6, values[a] * 26);
        svg.appendChild(svgEl('rect', {
          x: 480, y: blockTop + 2 * cell - 16, width: barWidth, height: 22, rx: 5,
          fill: a === best ? COLOR.green : COLOR.gray,
          opacity: a === best ? 0.9 : 0.45
        }));
        label(svg, 480 + barWidth + 8, blockTop + 2 * cell, values[a].toFixed(1), COLOR.ink, 12, 'start', 800);
        if (a === best) label(svg, 480, blockTop + 2 * cell + 18, 'greedy', COLOR.green, 10, 'start', 700);
      }

      vectorEl.innerHTML = '';
      for (var b = 0; b < 3; b++) {
        var tag = document.createElement('span');
        tag.textContent = 'a' + b;
        tag.style.opacity = b === action ? '1' : '0.45';
        vectorEl.appendChild(tag);
        for (var k = 0; k < 4; k++) {
          var bitValue = b === action ? state.bits[k] : 0;
          var chip = document.createElement('span');
          chip.className = 'fa-feature-bit' + (bitValue ? ' active' : '');
          chip.textContent = String(bitValue);
          vectorEl.appendChild(chip);
        }
      }

      var activeCount = state.bits.reduce(function (sum, v) { return sum + v; }, 0);
      setText('stack-state-value', state.name);
      setText('stack-action-value', 'a' + action);
      setText('stack-q0', values[0].toFixed(1));
      setText('stack-q1', values[1].toFixed(1));
      setText('stack-q2', values[2].toFixed(1));
      setText('stack-status', 'x(' + state.name + ', a' + action + ') has ' + activeCount +
        ' non-zero entries out of 12, all inside block a' + action +
        '. A Sarsa update on a' + action + ' would change only those ' + activeCount +
        ' weights. The greedy action here is a' + best + '.');
    }

    stateInput.addEventListener('input', render);
    actionInput.addEventListener('input', render);
    render();
  })();

  (function initMountainCar() {
    var policyInput = byId('mcar-policy');
    var stepInput = byId('mcar-step');
    var svg = byId('mcar-svg');
    if (!policyInput || !stepInput || !svg) return;

    var P_MIN = -1.2, P_MAX = 0.6, V_MIN = -0.07, V_MAX = 0.07, GOAL = 0.5;
    var NP = 60, NV = 60, HOLD = 4;

    function physics(p, v, a) {
      var nv = v + 0.001 * a - 0.0025 * Math.cos(3 * p);
      if (nv < V_MIN) nv = V_MIN;
      if (nv > V_MAX) nv = V_MAX;
      var np = p + nv;
      if (np < P_MIN) { np = P_MIN; nv = 0; }
      return [np, nv];
    }

    function cellIndex(p, v) {
      var i = Math.floor((p - P_MIN) / (P_MAX - P_MIN) * NP);
      var j = Math.floor((v - V_MIN) / (V_MAX - V_MIN) * NV);
      if (i < 0) i = 0; if (i > NP - 1) i = NP - 1;
      if (j < 0) j = 0; if (j > NV - 1) j = NV - 1;
      return i * NV + j;
    }

    // Optimal steps-to-goal on a discretised grid, by value iteration.
    // Each action is held for HOLD environment steps so that a transition
    // always leaves its own cell, which the raw one-step dynamics do not.
    var cost = (function solve() {
      var INF = Infinity;
      var next = new Int32Array(NP * NV * 3);
      for (var i = 0; i < NP; i++) {
        var p0 = P_MIN + (i + 0.5) * (P_MAX - P_MIN) / NP;
        for (var j = 0; j < NV; j++) {
          var v0 = V_MIN + (j + 0.5) * (V_MAX - V_MIN) / NV;
          for (var k = 0; k < 3; k++) {
            var p = p0, v = v0, done = false;
            for (var h = 0; h < HOLD; h++) {
              var s = physics(p, v, k - 1);
              p = s[0]; v = s[1];
              if (p >= GOAL) { done = true; break; }
            }
            next[(i * NV + j) * 3 + k] = done ? -1 : cellIndex(p, v);
          }
        }
      }
      var J = new Float64Array(NP * NV);
      for (var c = 0; c < J.length; c++) J[c] = INF;
      for (var sweep = 0; sweep < 400; sweep++) {
        var changed = false;
        for (var cell = 0; cell < NP * NV; cell++) {
          var best = INF;
          for (var a = 0; a < 3; a++) {
            var n = next[cell * 3 + a];
            var value = n === -1 ? HOLD : HOLD + J[n];
            if (value < best) best = value;
          }
          if (best < J[cell] - 1e-9) { J[cell] = best; changed = true; }
        }
        if (!changed) break;
      }
      return J;
    })();

    var maxCost = 0;
    for (var c = 0; c < cost.length; c++) {
      if (isFinite(cost[c]) && cost[c] > maxCost) maxCost = cost[c];
    }

    var POLICIES = [
      { name: 'full throttle right', act: function () { return 1; } },
      { name: 'accelerate along the velocity', act: function (p, v) { return v >= 0 ? 1 : -1; } }
    ];

    var trajectories = POLICIES.map(function (policy) {
      var p = -0.5, v = 0, path = [[p, v]], reached = null;
      for (var t = 0; t < 400; t++) {
        var s = physics(p, v, policy.act(p, v));
        p = s[0]; v = s[1];
        path.push([p, v]);
        if (p >= GOAL) { reached = t + 1; break; }
      }
      return { path: path, reached: reached };
    });

    var HILL_X = 24, HILL_W = 268, HILL_Y = 46, HILL_H = 176;
    var MAP_X = 372, MAP_W = 248, MAP_Y = 46, MAP_H = 176;

    function hillPoint(p) {
      var x = HILL_X + HILL_W * (p - P_MIN) / (P_MAX - P_MIN);
      var y = HILL_Y + HILL_H * (1 - (Math.sin(3 * p) + 1) / 2);
      return [x, y];
    }

    function mapPoint(p, v) {
      return [
        MAP_X + MAP_W * (p - P_MIN) / (P_MAX - P_MIN),
        MAP_Y + MAP_H * (1 - (v - V_MIN) / (V_MAX - V_MIN))
      ];
    }

    function heatColor(value) {
      if (!isFinite(value)) return '#eef1f0';
      var t = value / maxCost;
      var r = Math.round(58 + (184 - 58) * t);
      var g = Math.round(123 + (58 - 123) * t);
      var b = Math.round(213 + (58 - 213) * t);
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    var staticLayer = null;
    var dynamicLayer = null;

    function buildStatic(layer) {
      label(layer, HILL_X + HILL_W / 2, 24, 'the hill', COLOR.ink, 12.5, 'middle', 800);
      label(layer, MAP_X + MAP_W / 2, 24, 'optimal steps to the flag', COLOR.ink, 12.5, 'middle', 800);

      var cellW = MAP_W / NP, cellH = MAP_H / NV;
      for (var i = 0; i < NP; i++) {
        for (var j = 0; j < NV; j++) {
          layer.appendChild(svgEl('rect', {
            x: MAP_X + i * cellW,
            y: MAP_Y + MAP_H - (j + 1) * cellH,
            width: cellW + 0.4,
            height: cellH + 0.4,
            fill: heatColor(cost[i * NV + j]),
            opacity: 0.78
          }));
        }
      }
      layer.appendChild(svgEl('rect', {
        x: MAP_X, y: MAP_Y, width: MAP_W, height: MAP_H,
        fill: 'none', stroke: COLOR.line, 'stroke-width': 1
      }));
      label(layer, MAP_X + MAP_W / 2, MAP_Y + MAP_H + 16, 'position', COLOR.muted, 10.5);
      label(layer, MAP_X - 8, MAP_Y + MAP_H / 2, 'velocity', COLOR.muted, 10.5, 'end');
      label(layer, MAP_X + MAP_W / 2, MAP_Y + MAP_H + 32,
        'blue = few steps left, red = many', COLOR.muted, 10);

      var hillPath = '';
      for (var t = 0; t <= 120; t++) {
        var pp = P_MIN + (P_MAX - P_MIN) * t / 120;
        var point = hillPoint(pp);
        hillPath += (t === 0 ? 'M' : 'L') + point[0].toFixed(1) + ' ' + point[1].toFixed(1);
      }
      layer.appendChild(svgEl('path', {
        d: hillPath, fill: 'none', stroke: COLOR.gray, 'stroke-width': 2, 'stroke-linecap': 'round'
      }));

      var flag = hillPoint(GOAL);
      line(layer, flag[0], flag[1], flag[0], flag[1] - 26, COLOR.green, 2);
      layer.appendChild(svgEl('polygon', {
        points: flag[0] + ',' + (flag[1] - 26) + ' ' + (flag[0] + 16) + ',' + (flag[1] - 21) + ' ' + flag[0] + ',' + (flag[1] - 16),
        fill: COLOR.green
      }));
      label(layer, HILL_X + HILL_W / 2, MAP_Y + MAP_H + 32, 'the flag sits at position 0.5', COLOR.muted, 10);
    }

    function render() {
      var which = Number(policyInput.value);
      var traj = trajectories[which];
      var cursor = Math.min(Number(stepInput.value), traj.path.length - 1);
      var state = traj.path[cursor];

      if (!staticLayer) {
        staticLayer = svgEl('g', {});
        svg.appendChild(staticLayer);
        buildStatic(staticLayer);
        dynamicLayer = svgEl('g', {});
        svg.appendChild(dynamicLayer);
      }
      clear(dynamicLayer);

      var trace = '';
      for (var s = 0; s <= cursor; s++) {
        var hp = hillPoint(traj.path[s][0]);
        trace += (s === 0 ? 'M' : 'L') + hp[0].toFixed(1) + ' ' + hp[1].toFixed(1);
      }
      dynamicLayer.appendChild(svgEl('path', {
        d: trace, fill: 'none', stroke: COLOR.gold, 'stroke-width': 1.6, opacity: 0.75
      }));

      var car = hillPoint(state[0]);
      dynamicLayer.appendChild(svgEl('circle', {
        cx: car[0], cy: car[1] - 6, r: 6.5, fill: COLOR.red, stroke: '#fff', 'stroke-width': 1.8
      }));

      var mapTrace = '';
      for (var m = 0; m <= cursor; m++) {
        var mp = mapPoint(traj.path[m][0], traj.path[m][1]);
        mapTrace += (m === 0 ? 'M' : 'L') + mp[0].toFixed(1) + ' ' + mp[1].toFixed(1);
      }
      dynamicLayer.appendChild(svgEl('path', {
        d: mapTrace, fill: 'none', stroke: '#1a2b22', 'stroke-width': 1.8
      }));
      var head = mapPoint(state[0], state[1]);
      dynamicLayer.appendChild(svgEl('circle', {
        cx: head[0], cy: head[1], r: 5, fill: COLOR.gold, stroke: '#fff', 'stroke-width': 1.6
      }));

      var startCost = cost[cellIndex(-0.5, 0)];
      var here = cost[cellIndex(state[0], state[1])];
      setText('mcar-policy-value', POLICIES[which].name);
      setText('mcar-step-value', String(cursor));
      setText('mcar-position', state[0].toFixed(3));
      setText('mcar-velocity', state[1].toFixed(4));
      setText('mcar-togo', isFinite(here) ? String(Math.round(here)) : 'unreachable');
      setText('mcar-status', traj.reached
        ? 'Accelerating along the current velocity pumps energy into the car and reaches the flag in ' +
          traj.reached + ' steps. The optimal policy on this grid needs about ' + Math.round(startCost) +
          ' steps from the start state.'
        : 'Full throttle right never reaches the flag: gravity beats the engine, so the car stalls partway up ' +
          'and oscillates in a small basin. Every episode under this policy runs forever.');
    }

    policyInput.addEventListener('input', render);
    stepInput.addEventListener('input', render);
    render();
  })();

  (function initOptimismLocality() {
    var xInput = byId('opt-x');
    var yInput = byId('opt-y');
    var sigmaInput = byId('opt-sigma');
    var svg = byId('opt-svg');
    if (!xInput || !yInput || !sigmaInput || !svg) return;

    var GRID = 26;
    var PANEL = 178;
    var PANEL_Y = 48;
    var PANEL_X = [22, 236, 450];
    var TITLES = ['single always-on feature', 'tile coding', 'neural network'];
    var TILINGS = 4;
    var TILES_PER_DIM = 5;
    var TILE_W = 100 / TILES_PER_DIM;

    function tileId(value, tiling) {
      return Math.floor((value + tiling / TILINGS * TILE_W) / TILE_W);
    }

    function shareFraction(ax, ay, bx, by) {
      var shared = 0;
      for (var t = 0; t < TILINGS; t++) {
        if (tileId(ax, t) === tileId(bx, t) && tileId(ay, t) === tileId(by, t)) shared++;
      }
      return shared / TILINGS;
    }

    function influence(mode, sx, sy, ux, uy, sigma) {
      if (mode === 0) return 1;
      if (mode === 1) return shareFraction(sx, sy, ux, uy);
      var dx = sx - ux, dy = sy - uy;
      return Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
    }

    function shade(value) {
      var t = Math.max(0, Math.min(1, value));
      var r = Math.round(244 + (184 - 244) * t);
      var g = Math.round(247 + (58 - 247) * t);
      var b = Math.round(245 + (58 - 245) * t);
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    function render() {
      var ux = Number(xInput.value);
      var uy = Number(yInput.value);
      var sigma = Number(sigmaInput.value);

      clear(svg);
      var cell = PANEL / GRID;
      var moved = [0, 0, 0];

      for (var mode = 0; mode < 3; mode++) {
        var originX = PANEL_X[mode];
        label(svg, originX + PANEL / 2, 26, TITLES[mode], COLOR.ink, 12, 'middle', 800);
        for (var i = 0; i < GRID; i++) {
          var sx = (i + 0.5) / GRID * 100;
          for (var j = 0; j < GRID; j++) {
            var sy = (j + 0.5) / GRID * 100;
            var weight = influence(mode, sx, sy, ux, uy, sigma);
            if (weight >= 0.1) moved[mode]++;
            svg.appendChild(svgEl('rect', {
              x: originX + i * cell,
              y: PANEL_Y + PANEL - (j + 1) * cell,
              width: cell + 0.3,
              height: cell + 0.3,
              fill: shade(weight)
            }));
          }
        }
        svg.appendChild(svgEl('rect', {
          x: originX, y: PANEL_Y, width: PANEL, height: PANEL,
          fill: 'none', stroke: COLOR.line, 'stroke-width': 1
        }));
        var markerX = originX + ux / 100 * PANEL;
        var markerY = PANEL_Y + PANEL - uy / 100 * PANEL;
        svg.appendChild(svgEl('circle', {
          cx: markerX, cy: markerY, r: 5, fill: 'none', stroke: '#1a2b22', 'stroke-width': 2
        }));
        svg.appendChild(svgEl('circle', {
          cx: markerX, cy: markerY, r: 1.8, fill: '#1a2b22'
        }));
      }
      label(svg, PANEL_X[1] + PANEL / 2, PANEL_Y + PANEL + 20,
        'the ringed dot is the state that was updated', COLOR.muted, 10.5);

      var total = GRID * GRID;
      var percent = function (count) { return (100 * count / total).toFixed(0) + '%'; };
      setText('opt-x-value', String(ux));
      setText('opt-y-value', String(uy));
      setText('opt-sigma-value', String(sigma));
      setText('opt-single', percent(moved[0]));
      setText('opt-tile', percent(moved[1]));
      setText('opt-nn', percent(moved[2]));
      setText('opt-status', 'One update moves ' + percent(moved[0]) +
        ' of the state space with a single always-on feature, ' + percent(moved[1]) +
        ' with tile coding, and ' + percent(moved[2]) +
        ' with this network reach. Only the tile-coded case leaves most of the space untouched, ' +
        'which is what lets unvisited states stay optimistic long enough to attract the agent.');
    }

    xInput.addEventListener('input', render);
    yInput.addEventListener('input', render);
    sigmaInput.addEventListener('input', render);
    render();
  })();

  (function initAverageReward() {
    var gammaInput = byId('avg-gamma');
    var nInput = byId('avg-n');
    var svg = byId('avg-svg');
    if (!gammaInput || !nInput || !svg) return;

    var LEFT = 68, RIGHT = 596, TOP = 40, BOTTOM = 208;
    var Y_MAX = 2.3;

    function toX(gamma) { return LEFT + (RIGHT - LEFT) * gamma; }
    function toY(ratio) { return BOTTOM - (BOTTOM - TOP) * Math.min(ratio, Y_MAX) / Y_MAX; }

    function format(value) {
      if (!isFinite(value)) return 'infinite';
      if (value >= 10000) return value.toExponential(1);
      if (value >= 100) return value.toFixed(0);
      return value.toFixed(2);
    }

    function render() {
      var gamma = Number(gammaInput.value);
      var n = Number(nInput.value);
      var denominator = 1 - Math.pow(gamma, n);
      var vL = denominator <= 1e-12 ? Infinity : 1 / denominator;
      var vR = denominator <= 1e-12 ? Infinity : 2 * Math.pow(gamma, n - 1) / denominator;
      var ratio = 2 * Math.pow(gamma, n - 1);
      var threshold = Math.pow(2, -1 / (n - 1));

      clear(svg);
      label(svg, (LEFT + RIGHT) / 2, 24, 'how much better the right ring looks', COLOR.ink, 12.5, 'middle', 800);

      for (var tick = 0; tick <= 2; tick += 0.5) {
        var y = toY(tick);
        line(svg, LEFT, y, RIGHT, y, COLOR.line, 1);
        label(svg, LEFT - 10, y + 4, tick.toFixed(1), COLOR.muted, 10, 'end');
      }
      line(svg, LEFT, TOP - 6, LEFT, BOTTOM, COLOR.gray, 1.2);
      line(svg, LEFT, BOTTOM, RIGHT, BOTTOM, COLOR.gray, 1.2);
      for (var g = 0; g <= 1.0001; g += 0.25) {
        label(svg, toX(g), BOTTOM + 18, g.toFixed(2), COLOR.muted, 10);
        line(svg, toX(g), BOTTOM, toX(g), BOTTOM + 5, COLOR.gray, 1);
      }
      label(svg, (LEFT + RIGHT) / 2, BOTTOM + 38, 'discount factor', COLOR.muted, 11);

      line(svg, LEFT, toY(2), RIGHT, toY(2), COLOR.green, 2.2);
      label(svg, RIGHT + 6, toY(2) + 4, 'average reward: 2.0', COLOR.green, 10.5, 'start', 800);
      line(svg, LEFT, toY(1), RIGHT, toY(1), COLOR.gray, 1.6, '5 4');
      label(svg, RIGHT + 6, toY(1) + 4, 'tie', COLOR.muted, 10.5, 'start', 700);

      var path = '';
      for (var i = 0; i <= 240; i++) {
        var gx = i / 240;
        var value = 2 * Math.pow(gx, n - 1);
        path += (i === 0 ? 'M' : 'L') + toX(gx).toFixed(1) + ' ' + toY(value).toFixed(1);
      }
      svg.appendChild(svgEl('path', {
        d: path, fill: 'none', stroke: COLOR.blue, 'stroke-width': 2.2
      }));
      label(svg, toX(0.42), toY(2 * Math.pow(0.42, n - 1)) - 10, 'discounted ratio', COLOR.blue, 10.5, 'start', 800);

      line(svg, toX(threshold), TOP - 6, toX(threshold), BOTTOM, COLOR.gold, 1.6, '4 3');
      label(svg, toX(threshold), TOP - 12, 'tipping point', COLOR.gold, 10.5, 'middle', 800);

      line(svg, toX(gamma), TOP - 6, toX(gamma), BOTTOM, COLOR.red, 1.4);
      svg.appendChild(svgEl('circle', {
        cx: toX(gamma), cy: toY(ratio), r: 5, fill: COLOR.red, stroke: '#fff', 'stroke-width': 1.6
      }));

      setText('avg-gamma-value', gamma.toFixed(3));
      setText('avg-n-value', String(n));
      setText('avg-vl', format(vL));
      setText('avg-vr', format(vR));
      setText('avg-threshold', threshold.toFixed(4));
      setText('avg-status', (ratio > 1
        ? 'At this discount factor the right ring wins: its value is ' + ratio.toFixed(2) + ' times the left ring\u2019s.'
        : 'At this discount factor the left ring wins: the right ring is worth only ' + ratio.toFixed(2) +
          ' times as much, because its reward arrives ' + (n - 1) + ' steps later.') +
        ' The tipping point for ' + n + '-step rings is gamma = ' + threshold.toFixed(4) +
        '. The average-reward objective always rates the right ring twice as good, at every gamma and every ring length.');
    }

    gammaInput.addEventListener('input', render);
    nInput.addEventListener('input', render);
    render();
  })();

  (function initPreferenceSoftmax() {
    var inputs = ['pref-h0', 'pref-h1', 'pref-h2'].map(byId);
    var shiftInput = byId('pref-shift');
    var svg = byId('pref-svg');
    if (!svg || !shiftInput || inputs.some(function (el) { return !el; })) return;

    var NAMES = ['a0', 'a1', 'a2'];
    var LEFT_X = [100, 180, 260];
    var RIGHT_X = [420, 500, 580];
    var BAR_W = 46;
    var ZERO_Y = 150;
    var BASE_Y = 230;

    function bar(x, y, w, h, fill, stroke) {
      svg.appendChild(svgEl('rect', {
        x: x, y: y, width: w, height: Math.max(h, 0.6), rx: 3,
        fill: fill, stroke: stroke, 'stroke-width': 1.2
      }));
    }

    function render() {
      var shift = Number(shiftInput.value);
      var prefs = inputs.map(function (el) { return Number(el.value) + shift; });
      var top = Math.max.apply(null, prefs);
      var weights = prefs.map(function (h) { return Math.exp(h - top); });
      var total = weights.reduce(function (a, b) { return a + b; }, 0);
      var probs = weights.map(function (w) { return w / total; });
      var best = probs.indexOf(Math.max.apply(null, probs));
      var sorted = prefs.slice().sort(function (a, b) { return b - a; });
      var gap = sorted[0] - sorted[sorted.length - 1];

      clear(svg);
      label(svg, 180, 22, 'action preferences  h(s, a, theta)', COLOR.ink, 12.5, 'middle', 800);
      label(svg, 500, 22, 'policy  pi(a | s, theta)', COLOR.ink, 12.5, 'middle', 800);

      line(svg, 60, ZERO_Y, 310, ZERO_Y, COLOR.gray, 1.2);
      label(svg, 52, ZERO_Y + 4, '0', COLOR.muted, 10, 'end');
      prefs.forEach(function (h, i) {
        var height = Math.min(Math.abs(h) * 10, 78);
        var y = h >= 0 ? ZERO_Y - height : ZERO_Y;
        var fill = i === best ? COLOR.paleGreen : COLOR.paleBlue;
        var stroke = i === best ? COLOR.green : COLOR.blue;
        bar(LEFT_X[i] - BAR_W / 2, y, BAR_W, height, fill, stroke);
        label(svg, LEFT_X[i], h >= 0 ? y - 6 : y + height + 14, h.toFixed(1), stroke, 11, 'middle', 800);
        label(svg, LEFT_X[i], 248, NAMES[i], COLOR.muted, 11);
      });

      line(svg, 326, ZERO_Y, 366, ZERO_Y, COLOR.gold, 1.6);
      svg.appendChild(svgEl('path', {
        d: 'M366 ' + ZERO_Y + ' L358 ' + (ZERO_Y - 5) + ' L358 ' + (ZERO_Y + 5) + ' Z', fill: COLOR.gold
      }));
      label(svg, 346, ZERO_Y - 12, 'softmax', COLOR.gold, 11, 'middle', 800);

      line(svg, 380, BASE_Y, 630, BASE_Y, COLOR.gray, 1.2);
      label(svg, 372, BASE_Y + 4, '0', COLOR.muted, 10, 'end');
      label(svg, 372, BASE_Y - 146, '1', COLOR.muted, 10, 'end');
      line(svg, 380, BASE_Y - 150, 630, BASE_Y - 150, COLOR.line, 1, '4 4');
      probs.forEach(function (p, i) {
        var height = p * 150;
        var fill = i === best ? COLOR.paleGreen : COLOR.paleBlue;
        var stroke = i === best ? COLOR.green : COLOR.blue;
        bar(RIGHT_X[i] - BAR_W / 2, BASE_Y - height, BAR_W, height, fill, stroke);
        label(svg, RIGHT_X[i], BASE_Y - height - 6, (p * 100).toFixed(1) + '%', stroke, 11, 'middle', 800);
        label(svg, RIGHT_X[i], 248, NAMES[i], COLOR.muted, 11);
      });

      setText('pref-h0-value', Number(inputs[0].value).toFixed(1));
      setText('pref-h1-value', Number(inputs[1].value).toFixed(1));
      setText('pref-h2-value', Number(inputs[2].value).toFixed(1));
      setText('pref-shift-value', shift.toFixed(1));
      setText('pref-p0', (probs[0] * 100).toFixed(1) + '%');
      setText('pref-p1', (probs[1] * 100).toFixed(1) + '%');
      setText('pref-p2', (probs[2] * 100).toFixed(1) + '%');
      setText('pref-gap', gap.toFixed(1));
      setText('pref-status', 'The shift c = ' + shift.toFixed(1) + ' moves every preference to ' +
        prefs.map(function (h) { return h.toFixed(1); }).join(', ') +
        ', yet the policy stays at ' + probs.map(function (p) { return (p * 100).toFixed(1) + '%'; }).join(', ') +
        '. Only the differences matter, and the widest gap here is ' + gap.toFixed(1) +
        ', which is what decides how peaked the policy is.');
    }

    inputs.concat([shiftInput]).forEach(function (el) {
      el.addEventListener('input', render);
    });
    render();
  })();

  (function initSoftmaxVsEpsilon() {
    var epsInput = byId('cmp-eps');
    var tempInput = byId('cmp-temp');
    var svg = byId('cmp-svg');
    if (!epsInput || !tempInput || !svg) return;

    var SCORES = [2.0, 1.9, 0.4, -2.6];
    var NAMES = ['a0', 'a1', 'a2', 'a3'];
    var TOP_X = [130, 260, 390, 520];
    var EPS_X = [90, 150, 210, 270];
    var SOFT_X = [410, 470, 530, 590];
    var SCORE_ZERO = 105;
    var DIST_BASE = 285;
    var best = 0;
    var worst = 3;

    function bar(x, w, y, h, fill, stroke) {
      svg.appendChild(svgEl('rect', {
        x: x - w / 2, y: y, width: w, height: Math.max(h, 0.6), rx: 3,
        fill: fill, stroke: stroke, 'stroke-width': 1.2
      }));
    }

    function render() {
      var eps = Number(epsInput.value);
      var spread = Number(tempInput.value);
      var n = SCORES.length;
      var greedy = SCORES.map(function (q, i) {
        return (i === best ? 1 - eps : 0) + eps / n;
      });
      var scaled = SCORES.map(function (q) { return q * spread; });
      var top = Math.max.apply(null, scaled);
      var weights = scaled.map(function (h) { return Math.exp(h - top); });
      var total = weights.reduce(function (a, b) { return a + b; }, 0);
      var soft = weights.map(function (w) { return w / total; });

      clear(svg);
      label(svg, 340, 20, 'the same four scores', COLOR.ink, 12.5, 'middle', 800);
      line(svg, 60, SCORE_ZERO, 620, SCORE_ZERO, COLOR.gray, 1.2);
      label(svg, 52, SCORE_ZERO + 4, '0', COLOR.muted, 10, 'end');
      SCORES.forEach(function (q, i) {
        var height = Math.abs(q) * 15;
        var y = q >= 0 ? SCORE_ZERO - height : SCORE_ZERO;
        var stroke = i === best ? COLOR.green : (i === worst ? COLOR.red : COLOR.blue);
        var fill = i === best ? COLOR.paleGreen : (i === worst ? 'rgba(184,58,58,0.12)' : COLOR.paleBlue);
        bar(TOP_X[i], 52, y, height, fill, stroke);
        label(svg, TOP_X[i], q >= 0 ? y - 6 : y + height + 14, q.toFixed(1), stroke, 11, 'middle', 800);
      });

      label(svg, 180, 182, 'epsilon-greedy over values', COLOR.gold, 12, 'middle', 800);
      label(svg, 500, 182, 'softmax over preferences', COLOR.green, 12, 'middle', 800);
      [[EPS_X, greedy, COLOR.gold, 'rgba(201,138,43,0.13)'], [SOFT_X, soft, COLOR.green, COLOR.paleGreen]]
        .forEach(function (panel) {
          var xs = panel[0], dist = panel[1], stroke = panel[2], fill = panel[3];
          line(svg, xs[0] - 40, DIST_BASE, xs[3] + 40, DIST_BASE, COLOR.gray, 1.2);
          line(svg, xs[0] - 40, DIST_BASE - 95, xs[3] + 40, DIST_BASE - 95, COLOR.line, 1, '4 4');
          dist.forEach(function (p, i) {
            var height = p * 95;
            bar(xs[i], 38, DIST_BASE - height, height, fill, stroke);
            label(svg, xs[i], DIST_BASE - height - 6, (p * 100).toFixed(0) + '%', stroke, 10.5, 'middle', 800);
            label(svg, xs[i], DIST_BASE + 14, NAMES[i], COLOR.muted, 10.5);
          });
        });

      setText('cmp-eps-value', eps.toFixed(2));
      setText('cmp-temp-value', spread.toFixed(1));
      setText('cmp-runner', (greedy[1] * 100).toFixed(1) + '%');
      setText('cmp-runner-soft', (soft[1] * 100).toFixed(1) + '%');
      setText('cmp-worst', (greedy[worst] * 100).toFixed(1) + '%');
      setText('cmp-worst-soft', (soft[worst] * 100).toFixed(2) + '%');
      setText('cmp-status', 'Epsilon-greedy gives the runner-up ' + (greedy[1] * 100).toFixed(1) +
        '% and the worst action the identical ' + (greedy[worst] * 100).toFixed(1) +
        '%, even though one is almost as good as the best action and the other is far worse. Softmax gives them ' +
        (soft[1] * 100).toFixed(1) + '% and ' + (soft[worst] * 100).toFixed(2) +
        '%. Increasing the spread makes the softmax policy more deterministic without any schedule on epsilon.');
    }

    epsInput.addEventListener('input', render);
    tempInput.addEventListener('input', render);
    render();
  })();

  (function initShortCorridor() {
    var pInput = byId('corr-p');
    var svg = byId('corr-svg');
    if (!pInput || !svg) return;

    var LEFT = 70, RIGHT = 620, TOP = 50, BOTTOM = 270, Y_MAX = 60;
    var P_STAR = 2 - Math.SQRT2;

    function steps(p) {
      return 2 * (2 - p) / (p * (1 - p));
    }
    function toX(p) { return LEFT + p * (RIGHT - LEFT); }
    function toY(v) { return BOTTOM - Math.min(v, Y_MAX) / Y_MAX * (BOTTOM - TOP); }

    function render() {
      var p = Number(pInput.value);
      var j = steps(p);
      var jStar = steps(P_STAR);
      var jEps = steps(0.95);

      clear(svg);
      label(svg, (LEFT + RIGHT) / 2, 26, 'expected steps to the goal, as a function of p', COLOR.ink, 12.5, 'middle', 800);

      for (var v = 0; v <= Y_MAX; v += 20) {
        var y = toY(v);
        line(svg, LEFT, y, RIGHT, y, COLOR.line, 1);
        label(svg, LEFT - 10, y + 4, String(v), COLOR.muted, 10, 'end');
      }
      line(svg, LEFT, TOP - 8, LEFT, BOTTOM, COLOR.gray, 1.2);
      line(svg, LEFT, BOTTOM, RIGHT, BOTTOM, COLOR.gray, 1.2);
      for (var g = 0; g <= 1.0001; g += 0.25) {
        line(svg, toX(g), BOTTOM, toX(g), BOTTOM + 5, COLOR.gray, 1);
        label(svg, toX(g), BOTTOM + 20, g.toFixed(2), COLOR.muted, 10);
      }
      label(svg, (LEFT + RIGHT) / 2, BOTTOM + 40, 'p = probability of choosing right in every state', COLOR.muted, 11);
      label(svg, 24, (TOP + BOTTOM) / 2, 'steps', COLOR.muted, 11, 'middle');

      var path = '';
      var pen = 'M';
      for (var i = 0; i <= 480; i++) {
        var px = 0.01 + (0.99 - 0.01) * i / 480;
        var value = steps(px);
        if (value > Y_MAX) { pen = 'M'; continue; }
        path += pen + toX(px).toFixed(1) + ' ' + toY(value).toFixed(1);
        pen = 'L';
      }
      svg.appendChild(svgEl('path', {
        d: path, fill: 'none', stroke: COLOR.blue, 'stroke-width': 2.2
      }));
      label(svg, toX(0.2), toY(steps(0.2)) - 12, 'J0(p)', COLOR.blue, 11, 'middle', 800);

      line(svg, LEFT, toY(jStar), RIGHT, toY(jStar), COLOR.green, 1.4, '5 4');
      label(svg, RIGHT - 4, toY(jStar) - 8, 'best possible: ' + jStar.toFixed(2) + ' steps', COLOR.green, 10.5, 'end', 800);

      line(svg, toX(P_STAR), TOP - 8, toX(P_STAR), BOTTOM, COLOR.green, 1.3, '4 3');
      label(svg, toX(P_STAR), TOP - 16, 'p* = 0.586', COLOR.green, 10.5, 'middle', 800);
      line(svg, toX(0.95), TOP - 8, toX(0.95), BOTTOM, COLOR.gold, 1.3, '4 3');
      label(svg, toX(0.95), TOP - 16, 'eps-greedy', COLOR.gold, 10.5, 'middle', 800);

      line(svg, toX(p), TOP - 8, toX(p), BOTTOM, COLOR.red, 1.3);
      svg.appendChild(svgEl('circle', {
        cx: toX(p), cy: toY(j), r: 5.5, fill: COLOR.red, stroke: '#fff', 'stroke-width': 1.6
      }));

      setText('corr-p-value', p.toFixed(2));
      setText('corr-value', '-' + j.toFixed(2));
      setText('corr-steps', j.toFixed(2));
      setText('corr-best', '-' + jStar.toFixed(2));
      setText('corr-eps', '-' + jEps.toFixed(1));
      setText('corr-status', 'Choosing right with probability ' + p.toFixed(2) + ' takes ' + j.toFixed(2) +
        ' steps on average, so the start state is worth ' + (-j).toFixed(2) + '. The best stochastic policy sits at p* = ' +
        P_STAR.toFixed(3) + ' with ' + jStar.toFixed(2) + ' steps, epsilon-greedy with epsilon = 0.1 lands at p = 0.95 and ' +
        jEps.toFixed(1) + ' steps, and both deterministic policies at the ends of the slider never terminate at all.');
    }

    pInput.addEventListener('input', render);
    render();
  })();

  (function initAverageRewardObjective() {
    var thetaInput = byId('obj-theta');
    var svg = byId('obj-svg');
    if (!thetaInput || !svg) return;

    var AX = 120, BX = 280, CY = 130, R = 34;
    var LEFT = 420, RIGHT = 670, TOP = 60, BOTTOM = 250, Y_MAX = 0.85;

    function toX(p) { return LEFT + p * (RIGHT - LEFT); }
    function toY(v) { return BOTTOM - v / Y_MAX * (BOTTOM - TOP); }

    function curve(d, color, width) {
      svg.appendChild(svgEl('path', {
        d: d, fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round'
      }));
    }

    function render() {
      var theta = Number(thetaInput.value);
      var p = 1 / (1 + Math.exp(-theta));
      var muA = 1 - p, muB = p;
      var reward = 3 * p * (1 - p);
      var dp = 3 * (1 - 2 * p);
      var grad = dp * p * (1 - p);

      clear(svg);
      label(svg, 200, 26, 'the chain the policy induces', COLOR.ink, 12.5, 'middle', 800);
      label(svg, (LEFT + RIGHT) / 2, 26, 'the objective r(pi)', COLOR.ink, 12.5, 'middle', 800);

      svg.appendChild(svgEl('circle', { cx: AX, cy: CY, r: R, fill: COLOR.paleGreen, stroke: COLOR.green, 'stroke-width': 1.6 }));
      svg.appendChild(svgEl('circle', { cx: BX, cy: CY, r: R, fill: COLOR.paleBlue, stroke: COLOR.blue, 'stroke-width': 1.6 }));
      label(svg, AX, CY + 6, 'A', COLOR.ink, 17, 'middle', 800);
      label(svg, BX, CY + 6, 'B', COLOR.ink, 17, 'middle', 800);

      curve('M148 112 Q200 58 252 112', COLOR.gold, 1 + 5 * p);
      svg.appendChild(svgEl('path', { d: 'M252 112 L241 105 L243 117 Z', fill: COLOR.gold }));
      label(svg, 200, 50, 'go, +1   p = ' + p.toFixed(2), COLOR.gold, 11, 'middle', 800);

      curve('M252 148 Q200 202 148 148', COLOR.green, 1 + 5 * (1 - p));
      svg.appendChild(svgEl('path', { d: 'M148 148 L159 155 L157 143 Z', fill: COLOR.green }));
      label(svg, 200, 216, 'wait, +2   1 - p = ' + (1 - p).toFixed(2), COLOR.green, 11, 'middle', 800);

      curve('M94 108 C56 78, 56 152, 94 152', COLOR.gray, 1 + 4 * (1 - p));
      label(svg, 46, 132, 'wait, 0', COLOR.muted, 10.5, 'middle', 700);
      curve('M306 108 C344 78, 344 152, 306 152', COLOR.gray, 1 + 4 * p);
      label(svg, 356, 132, 'go, 0', COLOR.muted, 10.5, 'middle', 700);

      var barX = 60, barW = 280, barY = 262;
      svg.appendChild(svgEl('rect', {
        x: barX, y: barY, width: barW * muA, height: 22, rx: 4,
        fill: COLOR.paleGreen, stroke: COLOR.green, 'stroke-width': 1.2
      }));
      svg.appendChild(svgEl('rect', {
        x: barX + barW * muA, y: barY, width: barW * muB, height: 22, rx: 4,
        fill: COLOR.paleBlue, stroke: COLOR.blue, 'stroke-width': 1.2
      }));
      label(svg, barX + barW * muA / 2, barY + 16, (muA * 100).toFixed(0) + '% in A', COLOR.green, 10.5, 'middle', 800);
      label(svg, barX + barW * muA + barW * muB / 2, barY + 16, (muB * 100).toFixed(0) + '% in B', COLOR.blue, 10.5, 'middle', 800);
      label(svg, 200, barY + 38, 'steady-state distribution mu', COLOR.muted, 11);

      for (var v = 0; v <= 0.8001; v += 0.2) {
        var y = toY(v);
        line(svg, LEFT, y, RIGHT, y, COLOR.line, 1);
        label(svg, LEFT - 8, y + 4, v.toFixed(1), COLOR.muted, 10, 'end');
      }
      line(svg, LEFT, TOP - 6, LEFT, BOTTOM, COLOR.gray, 1.2);
      line(svg, LEFT, BOTTOM, RIGHT, BOTTOM, COLOR.gray, 1.2);
      for (var g = 0; g <= 1.0001; g += 0.25) {
        line(svg, toX(g), BOTTOM, toX(g), BOTTOM + 5, COLOR.gray, 1);
        label(svg, toX(g), BOTTOM + 20, g.toFixed(2), COLOR.muted, 10);
      }
      label(svg, (LEFT + RIGHT) / 2, BOTTOM + 40, 'p = probability of go', COLOR.muted, 11);

      var path = '';
      for (var i = 0; i <= 200; i++) {
        var px = i / 200;
        path += (i === 0 ? 'M' : 'L') + toX(px).toFixed(1) + ' ' + toY(3 * px * (1 - px)).toFixed(1);
      }
      curve(path, COLOR.blue, 2.2);

      var span = 0.14;
      var p1 = Math.max(0, p - span), p2 = Math.min(1, p + span);
      line(svg, toX(p1), toY(reward + dp * (p1 - p)), toX(p2), toY(reward + dp * (p2 - p)), COLOR.red, 1.8, '5 3');
      svg.appendChild(svgEl('circle', {
        cx: toX(p), cy: toY(reward), r: 5.5, fill: COLOR.red, stroke: '#fff', 'stroke-width': 1.6
      }));
      line(svg, toX(0.5), TOP - 6, toX(0.5), BOTTOM, COLOR.green, 1.2, '4 3');
      label(svg, toX(0.5), TOP - 12, 'best: 0.75 per step', COLOR.green, 10.5, 'middle', 800);

      setText('obj-theta-value', theta.toFixed(2));
      setText('obj-p', p.toFixed(3));
      setText('obj-mua', muA.toFixed(3));
      setText('obj-mub', muB.toFixed(3));
      setText('obj-rpi', reward.toFixed(3));
      setText('obj-grad', (grad >= 0 ? '+' : '') + grad.toFixed(3));
      setText('obj-status', 'With theta = ' + theta.toFixed(2) + ' the policy picks go with probability ' + p.toFixed(2) +
        ', which puts ' + (muB * 100).toFixed(0) + '% of the agent\u2019s time in B and earns ' + reward.toFixed(3) +
        ' reward per step. The slope of the objective is ' + (grad >= 0 ? '+' : '') + grad.toFixed(3) +
        ', so gradient ascent would push theta ' + (grad >= 0 ? 'up' : 'down') +
        ' towards p = 0.5. Notice that the time bar moves whenever the arrows do: the distribution being averaged over is itself a function of theta.');
    }

    thetaInput.addEventListener('input', render);
    render();
  })();

  (function initPolicyGradientTerm() {
    var t1Input = byId('pgt-t1');
    var t2Input = byId('pgt-t2');
    var bInput = byId('pgt-b');
    var svg = byId('pgt-svg');
    if (!t1Input || !t2Input || !bInput || !svg) return;

    // action order: up, down, left, right
    var Q = [-1.3, 0.7, -0.9, 1.5];
    var NAMES = ['up', 'down', 'left', 'right'];
    var CX = 170, CY = 165, CELL = 60;
    var OX = 500, OY = 185, SCALE = 46;

    function arrow(x1, y1, x2, y2, color, width) {
      line(svg, x1, y1, x2, y2, color, width);
      var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / len, uy = dy / len, hx = -uy, hy = ux, h = 6;
      svg.appendChild(svgEl('path', {
        d: 'M' + x2 + ' ' + y2 +
           ' L' + (x2 - ux * 11 + hx * h) + ' ' + (y2 - uy * 11 + hy * h) +
           ' L' + (x2 - ux * 11 - hx * h) + ' ' + (y2 - uy * 11 - hy * h) + ' Z',
        fill: color
      }));
    }

    function render() {
      var t1 = Number(t1Input.value);
      var t2 = Number(t2Input.value);
      var b = Number(bInput.value);
      var h = [t1, -t1, t2, -t2];
      var top = Math.max.apply(null, h);
      var w = h.map(function (v) { return Math.exp(v - top); });
      var total = w.reduce(function (a, c) { return a + c; }, 0);
      var pi = w.map(function (v) { return v / total; });

      var dUD = pi[0] - pi[1];
      var dLR = pi[2] - pi[3];
      var g1 = [], g2 = [];
      pi.forEach(function (p, i) {
        var e1 = (i === 0 ? 1 : 0) - (i === 1 ? 1 : 0);
        var e2 = (i === 2 ? 1 : 0) - (i === 3 ? 1 : 0);
        g1.push(p * (e1 - dUD));
        g2.push(p * (e2 - dLR));
      });
      var d1 = 0, d2 = 0, sum1 = 0, sum2 = 0, vs = 0;
      pi.forEach(function (p, i) {
        d1 += g1[i] * (Q[i] + b);
        d2 += g2[i] * (Q[i] + b);
        sum1 += g1[i];
        sum2 += g2[i];
        vs += p * Q[i];
      });

      clear(svg);
      label(svg, 170, 26, 'one state of a gridworld', COLOR.ink, 12.5, 'middle', 800);
      label(svg, 520, 26, 'parameter space', COLOR.ink, 12.5, 'middle', 800);

      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
          var isGoal = (r === 2 && c === 2);
          svg.appendChild(svgEl('rect', {
            x: CX - 1.5 * CELL + c * CELL, y: CY - 1.5 * CELL + r * CELL,
            width: CELL, height: CELL,
            fill: isGoal ? 'rgba(201,138,43,0.20)' : '#fff',
            stroke: COLOR.line, 'stroke-width': 1.2
          }));
        }
      }
      label(svg, CX + CELL, CY + CELL + 5, 'reward', COLOR.gold, 10.5, 'middle', 800);

      var dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      pi.forEach(function (p, i) {
        var len = 18 + 62 * p;
        var color = Q[i] >= 0 ? COLOR.green : COLOR.red;
        arrow(CX, CY, CX + dirs[i][0] * len, CY + dirs[i][1] * len, color, 1.4 + 4 * p);
        var lx = CX + dirs[i][0] * 108, ly = CY + dirs[i][1] * 100 + 4;
        label(svg, lx, ly, NAMES[i] + ': q = ' + Q[i].toFixed(1) + ', ' + (p * 100).toFixed(0) + '%',
          color, 10.5, 'middle', 700);
      });
      svg.appendChild(svgEl('circle', { cx: CX, cy: CY, r: 7, fill: COLOR.ink }));

      line(svg, OX - 110, OY, OX + 130, OY, COLOR.gray, 1.2);
      line(svg, OX, OY - 110, OX, OY + 110, COLOR.gray, 1.2);
      label(svg, OX + 138, OY + 4, 'theta2', COLOR.muted, 11, 'middle');
      label(svg, OX, OY - 120, 'theta1', COLOR.muted, 11, 'middle');

      var px = OX + t2 * SCALE, py = OY - t1 * SCALE;
      var mag = Math.sqrt(d1 * d1 + d2 * d2);
      var scale = mag > 1e-9 ? 90 / Math.max(mag, 0.05) : 0;
      if (mag > 1e-9) {
        arrow(px, py, px + d2 * scale, py - d1 * scale, COLOR.red, 2.2);
        label(svg, px + d2 * scale, py - d1 * scale - 12, 'd(s)', COLOR.red, 11, 'middle', 800);
      }
      svg.appendChild(svgEl('circle', { cx: px, cy: py, r: 5.5, fill: COLOR.blue, stroke: '#fff', 'stroke-width': 1.5 }));
      label(svg, 520, 310, 'the red arrow is the ascent direction for this state', COLOR.muted, 11);

      setText('pgt-t1-value', t1.toFixed(2));
      setText('pgt-t2-value', t2.toFixed(2));
      setText('pgt-b-value', b.toFixed(2));
      setText('pgt-pup', (pi[0] * 100).toFixed(1) + '%');
      setText('pgt-pdown', (pi[1] * 100).toFixed(1) + '%');
      setText('pgt-pleft', (pi[2] * 100).toFixed(1) + '%');
      setText('pgt-pright', (pi[3] * 100).toFixed(1) + '%');
      setText('pgt-d1', (d1 >= 0 ? '+' : '') + d1.toFixed(3));
      setText('pgt-d2', (d2 >= 0 ? '+' : '') + d2.toFixed(3));
      function tidy(x) { return (Math.abs(x) < 5e-4 ? 0 : x).toFixed(3); }
      setText('pgt-sumgrad', '(' + tidy(sum1) + ', ' + tidy(sum2) + ')');
      setText('pgt-vs', vs.toFixed(3));
      setText('pgt-status', 'Ascent would raise ' + (d1 > 0 ? 'up over down' : 'down over up') + ' and ' +
        (d2 > 0 ? 'left over right' : 'right over left') + ', giving d(s) = (' + d1.toFixed(3) + ', ' + d2.toFixed(3) +
        '). The four policy gradients sum to (' + tidy(sum1) + ', ' + tidy(sum2) +
        '), so the baseline b = ' + b.toFixed(2) + ' multiplies zero and leaves the arrow exactly where it was.');
    }

    [t1Input, t2Input, bInput].forEach(function (el) { el.addEventListener('input', render); });
    render();
  })();

  (function initGradientSampling() {
    var nInput = byId('est-n');
    var seedInput = byId('est-seed');
    var svg = byId('est-svg');
    if (!nInput || !seedInput || !svg) return;

    var Q = [-1.3, 0.7, -0.9, 1.5];
    var NAMES = ['up', 'down', 'left', 'right'];
    var THETA1 = 0.4, THETA2 = 0.3;
    var H = [THETA1, -THETA1, THETA2, -THETA2];

    var top = Math.max.apply(null, H);
    var w = H.map(function (v) { return Math.exp(v - top); });
    var total = w.reduce(function (a, c) { return a + c; }, 0);
    var PI = w.map(function (v) { return v / total; });
    var dUD = PI[0] - PI[1];
    // theta1 component of grad log pi for each action
    var SCORE = [1 - dUD, -1 - dUD, -dUD, -dUD];
    var SAMPLE = SCORE.map(function (g, i) { return g * Q[i]; });
    var EXACT = 0, SECOND = 0;
    PI.forEach(function (p, i) { EXACT += p * SAMPLE[i]; SECOND += p * SAMPLE[i] * SAMPLE[i]; });
    var SD = Math.sqrt(Math.max(SECOND - EXACT * EXACT, 0));

    var BX = [95, 160, 225, 290], BW = 46, ZERO = 180;
    var LEFT = 400, RIGHT = 675, TOP = 70, BOTTOM = 265;

    function render() {
      var n = Number(nInput.value);
      var seed = Number(seedInput.value);

      var state = ((seed + 1) * 8121 + 28411) % 2147483647;
      function rand() {
        state = (state * 16807) % 2147483647;
        return state / 2147483647;
      }
      var running = [], sum = 0;
      for (var t = 0; t < n; t++) {
        var u = rand(), acc = 0, pick = PI.length - 1;
        for (var a = 0; a < PI.length; a++) {
          acc += PI[a];
          if (u <= acc) { pick = a; break; }
        }
        sum += SAMPLE[pick];
        running.push(sum / (t + 1));
      }
      var mean = running.length ? running[running.length - 1] : 0;

      var lo = Math.min.apply(null, SAMPLE.concat([EXACT])) - 0.4;
      var hi = Math.max.apply(null, SAMPLE.concat([EXACT])) + 0.4;
      function toY(v) { return BOTTOM - (v - lo) / (hi - lo) * (BOTTOM - TOP); }
      function toX(i) { return LEFT + (n <= 1 ? 0 : i / (n - 1) * (RIGHT - LEFT)); }

      clear(svg);
      label(svg, 195, 26, 'the four possible one-sample estimates', COLOR.ink, 12.5, 'middle', 800);
      label(svg, (LEFT + RIGHT) / 2, 26, 'running average of the samples', COLOR.ink, 12.5, 'middle', 800);

      line(svg, 60, ZERO, 330, ZERO, COLOR.gray, 1.2);
      label(svg, 52, ZERO + 4, '0', COLOR.muted, 10, 'end');
      var scale = 46;
      SAMPLE.forEach(function (value, i) {
        var height = Math.abs(value) * scale;
        var y = value >= 0 ? ZERO - height : ZERO;
        var color = value >= 0 ? COLOR.green : COLOR.red;
        svg.appendChild(svgEl('rect', {
          x: BX[i] - BW / 2, y: y, width: BW, height: Math.max(height, 0.8), rx: 3,
          fill: value >= 0 ? COLOR.paleGreen : 'rgba(184,58,58,0.12)',
          stroke: color, 'stroke-width': 1.2
        }));
        label(svg, BX[i], value >= 0 ? y - 6 : y + height + 14, value.toFixed(2), color, 10.5, 'middle', 800);
        label(svg, BX[i], 252, NAMES[i], COLOR.muted, 10.5);
        label(svg, BX[i], 268, 'p = ' + PI[i].toFixed(2), COLOR.muted, 10);
      });
      line(svg, 60, ZERO - EXACT * scale, 330, ZERO - EXACT * scale, COLOR.blue, 1.6, '5 4');
      label(svg, 336, ZERO - EXACT * scale + 4, 'mean = ' + EXACT.toFixed(3), COLOR.blue, 10.5, 'start', 800);

      line(svg, LEFT, TOP - 8, LEFT, BOTTOM, COLOR.gray, 1.2);
      line(svg, LEFT, BOTTOM, RIGHT, BOTTOM, COLOR.gray, 1.2);
      label(svg, (LEFT + RIGHT) / 2, BOTTOM + 34, 'samples drawn', COLOR.muted, 11);
      for (var g = 0; g <= 1.0001; g += 0.5) {
        label(svg, LEFT + g * (RIGHT - LEFT), BOTTOM + 16, String(Math.round(g * n)), COLOR.muted, 10);
      }
      line(svg, LEFT, toY(EXACT), RIGHT, toY(EXACT), COLOR.blue, 1.6, '5 4');
      label(svg, RIGHT, toY(EXACT) - 8, 'exact', COLOR.blue, 10.5, 'end', 800);

      var path = '';
      running.forEach(function (v, i) {
        path += (i === 0 ? 'M' : 'L') + toX(i).toFixed(1) + ' ' + toY(v).toFixed(1);
      });
      if (path) {
        svg.appendChild(svgEl('path', { d: path, fill: 'none', stroke: COLOR.gold, 'stroke-width': 1.8 }));
      }
      svg.appendChild(svgEl('circle', {
        cx: toX(running.length - 1), cy: toY(mean), r: 5, fill: COLOR.gold, stroke: '#fff', 'stroke-width': 1.5
      }));

      setText('est-n-value', String(n));
      setText('est-seed-value', String(seed));
      setText('est-exact', EXACT.toFixed(3));
      setText('est-mean', mean.toFixed(3));
      setText('est-sd', SD.toFixed(3));
      setText('est-err', Math.abs(mean - EXACT).toFixed(3));
      setText('est-status', 'A single step is one of four numbers, ' +
        SAMPLE.map(function (v) { return v.toFixed(2); }).join(', ') +
        ', with standard deviation ' + SD.toFixed(2) + ' around an exact value of ' + EXACT.toFixed(3) +
        '. After ' + n + ' samples this run averages ' + mean.toFixed(3) + ', off by ' +
        Math.abs(mean - EXACT).toFixed(3) + '. The error shrinks like one over the square root of the sample count, ' +
        'which is why a single-step policy gradient update needs a small step size.');
    }

    nInput.addEventListener('input', render);
    seedInput.addEventListener('input', render);
    render();
  })();

  (function initActorCriticUpdate() {
    var actionInput = byId('acu-action');
    var rInput = byId('acu-r');
    var rbarInput = byId('acu-rbar');
    var vsInput = byId('acu-vs');
    var vspInput = byId('acu-vsp');
    var alphaInput = byId('acu-alpha');
    var svg = byId('acu-svg');
    if (!actionInput || !rInput || !rbarInput || !vsInput || !vspInput || !alphaInput || !svg) return;

    var H0 = [0.4, 0.1, -0.2];
    var NAMES = ['a0', 'a1', 'a2'];
    var ZERO = 175, SCALE = 26;
    var TERM_X = [70, 140, 210, 280];
    var RESULT_X = 350;
    var PX = [455, 535, 615], PW = 52, PBASE = 275;

    function softmax(h) {
      var top = Math.max.apply(null, h);
      var w = h.map(function (v) { return Math.exp(v - top); });
      var total = w.reduce(function (a, c) { return a + c; }, 0);
      return w.map(function (v) { return v / total; });
    }

    function bar(cx, width, value, stroke, fill, dash) {
      var height = Math.abs(value) * SCALE;
      var y = value >= 0 ? ZERO - height : ZERO;
      var attrs = {
        x: cx - width / 2, y: y, width: width, height: Math.max(height, 0.8), rx: 3,
        fill: fill, stroke: stroke, 'stroke-width': 1.3
      };
      if (dash) attrs['stroke-dasharray'] = dash;
      svg.appendChild(svgEl('rect', attrs));
      return y;
    }

    function render() {
      var idx = Number(actionInput.value);
      var r = Number(rInput.value);
      var rbar = Number(rbarInput.value);
      var vs = Number(vsInput.value);
      var vsp = Number(vspInput.value);
      var alpha = Number(alphaInput.value);

      var delta = r - rbar + vsp - vs;
      var before = softmax(H0);
      var after = softmax(H0.map(function (h, i) {
        return h + alpha * delta * ((i === idx ? 1 : 0) - before[i]);
      }));

      clear(svg);
      label(svg, 210, 26, 'assembling the TD error', COLOR.ink, 12.5, 'middle', 800);
      label(svg, 535, 26, 'one actor update', COLOR.ink, 12.5, 'middle', 800);

      line(svg, 40, ZERO, 385, ZERO, COLOR.gray, 1.2);
      var terms = [r, -rbar, vsp, -vs];
      var texts = ['R', '- Rbar', "+ v(S')", '- v(S)'];
      terms.forEach(function (value, i) {
        var color = value >= 0 ? COLOR.green : COLOR.red;
        var y = bar(TERM_X[i], 42, value, color, value >= 0 ? COLOR.paleGreen : 'rgba(184,58,58,0.12)');
        label(svg, TERM_X[i], value >= 0 ? y - 6 : y + Math.abs(value) * SCALE + 14, value.toFixed(1), color, 10.5, 'middle', 800);
        label(svg, TERM_X[i], 250, texts[i], COLOR.muted, 11, 'middle', 700);
      });
      line(svg, 315, ZERO - 70, 315, ZERO + 70, COLOR.line, 1.2, '4 4');
      var dColor = delta >= 0 ? COLOR.green : COLOR.red;
      var dy = bar(RESULT_X, 52, delta, dColor, delta >= 0 ? COLOR.paleGreen : 'rgba(184,58,58,0.12)');
      label(svg, RESULT_X, delta >= 0 ? dy - 6 : dy + Math.abs(delta) * SCALE + 14, delta.toFixed(2), dColor, 12, 'middle', 800);
      label(svg, RESULT_X, 250, 'delta', dColor, 12, 'middle', 800);
      label(svg, 210, 276, delta >= 0
        ? 'better than the critic expected, so raise this action'
        : 'worse than the critic expected, so lower this action', dColor, 11, 'middle', 700);

      line(svg, 415, PBASE, 675, PBASE, COLOR.gray, 1.2);
      line(svg, 415, PBASE - 150, 675, PBASE - 150, COLOR.line, 1, '4 4');
      label(svg, 408, PBASE - 146, '1', COLOR.muted, 10, 'end');
      label(svg, 408, PBASE + 4, '0', COLOR.muted, 10, 'end');
      before.forEach(function (p0, i) {
        var p1 = after[i];
        var taken = i === idx;
        svg.appendChild(svgEl('rect', {
          x: PX[i] - PW / 2 - 5, y: PBASE - p0 * 150, width: PW, height: Math.max(p0 * 150, 0.8), rx: 3,
          fill: 'rgba(158,170,164,0.18)', stroke: COLOR.gray, 'stroke-width': 1, 'stroke-dasharray': '4 3'
        }));
        svg.appendChild(svgEl('rect', {
          x: PX[i] - PW / 2 + 5, y: PBASE - p1 * 150, width: PW, height: Math.max(p1 * 150, 0.8), rx: 3,
          fill: taken ? COLOR.paleGold : COLOR.paleBlue,
          stroke: taken ? COLOR.gold : COLOR.blue, 'stroke-width': 1.4
        }));
        label(svg, PX[i] + 5, PBASE - p1 * 150 - 6, (p1 * 100).toFixed(1) + '%',
          taken ? COLOR.gold : COLOR.blue, 10.5, 'middle', 800);
        label(svg, PX[i], PBASE + 16, NAMES[i] + (taken ? '  (taken)' : ''), COLOR.muted, 10.5);
      });
      label(svg, 535, PBASE + 36, 'faded = before the update, solid = after', COLOR.muted, 11);

      setText('acu-action-value', NAMES[idx]);
      setText('acu-r-value', r.toFixed(1));
      setText('acu-rbar-value', rbar.toFixed(1));
      setText('acu-vs-value', vs.toFixed(1));
      setText('acu-vsp-value', vsp.toFixed(1));
      setText('acu-alpha-value', alpha.toFixed(2));
      setText('acu-delta', (delta >= 0 ? '+' : '') + delta.toFixed(2));
      setText('acu-before', (before[idx] * 100).toFixed(1) + '%');
      setText('acu-after', (after[idx] * 100).toFixed(1) + '%');
      var shift = (after[idx] - before[idx]) * 100;
      setText('acu-shift', (shift >= 0 ? '+' : '') + shift.toFixed(1) + ' pts');
      setText('acu-status', 'delta = ' + r.toFixed(1) + ' - ' + rbar.toFixed(1) + ' + ' + vsp.toFixed(1) +
        ' - ' + vs.toFixed(1) + ' = ' + delta.toFixed(2) + ', so one update with step size ' + alpha.toFixed(2) +
        ' moves pi(' + NAMES[idx] + ') from ' + (before[idx] * 100).toFixed(1) + '% to ' +
        (after[idx] * 100).toFixed(1) + '%. The other two actions absorb exactly the opposite change, ' +
        'because the policy gradients in a state sum to zero.');
    }

    [actionInput, rInput, rbarInput, vsInput, vspInput, alphaInput].forEach(function (el) {
      el.addEventListener('input', render);
    });
    render();
  })();

  (function initSoftmaxActorFeatures() {
    var actionInput = byId('sac-action');
    var spreadInput = byId('sac-spread');
    var deltaInput = byId('sac-delta');
    var svg = byId('sac-svg');
    if (!actionInput || !spreadInput || !deltaInput || !svg) return;

    var X = [1, 0, 1, 0];
    var BASE_H = [0.5, 0.9, -0.2];
    var NAMES = ['a0', 'a1', 'a2'];
    var CELL = 54, GAP = 8;
    var GRID_X = 150, ROW_Y = [120, 190, 260];

    function cell(x, y, value, stroke, fill) {
      svg.appendChild(svgEl('rect', {
        x: x, y: y, width: CELL, height: 34, rx: 5,
        fill: fill, stroke: stroke, 'stroke-width': 1.3
      }));
      label(svg, x + CELL / 2, y + 22, value, stroke, 11.5, 'middle', 800);
    }

    function render() {
      var taken = Number(actionInput.value);
      var spread = Number(spreadInput.value);
      var delta = Number(deltaInput.value);

      var h = BASE_H.map(function (v) { return v * spread; });
      var top = Math.max.apply(null, h);
      var w = h.map(function (v) { return Math.exp(v - top); });
      var total = w.reduce(function (a, c) { return a + c; }, 0);
      var pi = w.map(function (v) { return v / total; });
      var coef = pi.map(function (p, i) { return (i === taken ? 1 : 0) - p; });
      var coefSum = coef.reduce(function (a, c) { return a + c; }, 0);

      clear(svg);
      label(svg, 350, 26, 'the eligibility vector, block by block', COLOR.ink, 12.5, 'middle', 800);

      label(svg, 100, 68, 'x(s)', COLOR.ink, 12, 'end', 800);
      X.forEach(function (v, j) {
        var x = GRID_X + j * (CELL + GAP);
        cell(x, 50, v.toFixed(0), v ? COLOR.green : COLOR.gray,
          v ? COLOR.paleGreen : 'rgba(158,170,164,0.12)');
      });
      label(svg, GRID_X + 4 * (CELL + GAP) + 60, 72, 'two active features', COLOR.muted, 11, 'middle');

      pi.forEach(function (p, i) {
        var y = ROW_Y[i];
        var isTaken = i === taken;
        var stroke = isTaken ? COLOR.gold : COLOR.blue;
        label(svg, 100, y + 22, NAMES[i] + (isTaken ? ' (taken)' : ''), stroke, 11.5, 'end', 800);
        X.forEach(function (v, j) {
          var value = coef[i] * v;
          var x = GRID_X + j * (CELL + GAP);
          var color = Math.abs(value) < 1e-9 ? COLOR.gray : (value > 0 ? COLOR.green : COLOR.red);
          var fill = Math.abs(value) < 1e-9 ? 'rgba(158,170,164,0.10)'
            : (value > 0 ? COLOR.paleGreen : 'rgba(184,58,58,0.12)');
          cell(x, y, value.toFixed(2), color, fill);
        });
        var bx = GRID_X + 4 * (CELL + GAP) + 20;
        label(svg, bx, y + 22, 'coefficient ' + coef[i].toFixed(2) + '   pi = ' + (p * 100).toFixed(1) + '%',
          stroke, 11, 'start', 700);
      });

      label(svg, 350, 320, 'theta update = alpha * delta * (this vector), with delta = ' + delta.toFixed(1) +
        ' so the taken block moves ' + (coef[taken] * delta >= 0 ? 'up' : 'down'), COLOR.muted, 11.5, 'middle', 700);

      setText('sac-action-value', NAMES[taken]);
      setText('sac-spread-value', spread.toFixed(1));
      setText('sac-delta-value', delta.toFixed(1));
      setText('sac-p0', (pi[0] * 100).toFixed(1) + '%');
      setText('sac-p1', (pi[1] * 100).toFixed(1) + '%');
      setText('sac-p2', (pi[2] * 100).toFixed(1) + '%');
      setText('sac-coef', coef[taken].toFixed(3));
      setText('sac-sum', (Math.abs(coefSum) < 5e-4 ? 0 : coefSum).toFixed(3));
      setText('sac-status', 'The taken block is scaled by 1 - pi(' + NAMES[taken] + ') = ' + coef[taken].toFixed(3) +
        ' and the other two by minus their own probabilities, ' +
        coef.filter(function (c, i) { return i !== taken; }).map(function (c) { return c.toFixed(3); }).join(' and ') +
        '. They sum to zero, so probability is only moved around. Inactive state features stay at zero in every block, ' +
        'so the update is still sparse in the features even though it touches all three actions.');
    }

    [actionInput, spreadInput, deltaInput].forEach(function (el) { el.addEventListener('input', render); });
    render();
  })();

  (function initPendulumActorCritic() {
    var stageInput = byId('pen-stage');
    var stepInput = byId('pen-step');
    var svg = byId('pen-svg');
    if (!stageInput || !stepInput || !svg) return;

    var DT = 0.05, G = 4.0, TORQUE = 0.8, VMAX = 2 * Math.PI;
    var TILINGS = 32, BINS = 8, TILE_COUNT = TILINGS * BINS * BINS;
    var TRAIN_STEPS = 30000, ROLL_STEPS = 520, KICK_STEP = 200;
    var A_W = 1.0 / TILINGS, A_TH = 0.1 / TILINGS, A_RBAR = 0.01;

    var seed = 20260906 % 2147483647;
    function rand() {
      // Park-Miller: stays inside double precision, unlike a 32-bit LCG.
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    }
    function wrap(b) {
      var x = (b + Math.PI) % (2 * Math.PI);
      if (x < 0) x += 2 * Math.PI;
      return x - Math.PI;
    }
    function stepEnv(b, v, torque) {
      var acc = 1.5 * G * Math.sin(b) + 3 * TORQUE * torque;
      var nv = v + DT * acc;
      if (Math.abs(nv) > VMAX) return { b: Math.PI, v: 0, r: -Math.PI, reset: true };
      var nb = wrap(b + DT * nv);
      return { b: nb, v: nv, r: -Math.abs(nb), reset: false };
    }
    var tiles = new Int32Array(TILINGS);
    function features(b, v) {
      var bn = (b + Math.PI) / (2 * Math.PI) * BINS;
      var vn = (v + VMAX) / (2 * VMAX) * BINS;
      for (var t = 0; t < TILINGS; t++) {
        var i = Math.floor(bn + (t * 0.3) / TILINGS) % BINS;
        if (i < 0) i += BINS;
        var j = Math.floor(vn + (t * 0.7) / TILINGS);
        if (j < 0) j = 0; if (j > BINS - 1) j = BINS - 1;
        tiles[t] = t * BINS * BINS + i * BINS + j;
      }
      return tiles;
    }

    var w = new Float64Array(TILE_COUNT);
    var theta = [new Float64Array(TILE_COUNT), new Float64Array(TILE_COUNT), new Float64Array(TILE_COUNT)];
    var probs = [0, 0, 0];

    function policy(idx, params) {
      var h = [0, 0, 0], a, t;
      for (a = 0; a < 3; a++) {
        var sum = 0;
        if (params) for (t = 0; t < TILINGS; t++) sum += params[a][idx[t]];
        h[a] = sum;
      }
      var max = Math.max(h[0], h[1], h[2]);
      var total = 0;
      for (a = 0; a < 3; a++) { probs[a] = Math.exp(h[a] - max); total += probs[a]; }
      for (a = 0; a < 3; a++) probs[a] /= total;
      return probs;
    }
    function sample(p) {
      var u = rand(), acc = 0;
      for (var a = 0; a < 3; a++) { acc += p[a]; if (u <= acc) return a; }
      return 2;
    }

    var curve = [];
    var endState = { b: Math.PI, v: 0 };
    (function train() {
      var b = Math.PI, v = 0, rbar = 0, ewa = -Math.PI;
      var idx = features(b, v).slice();
      for (var t = 0; t < TRAIN_STEPS; t++) {
        var p = policy(idx, theta);
        var a = sample(p);
        var out = stepEnv(b, v, a - 1);
        var next = features(out.b, out.v).slice();
        var vS = 0, vS2 = 0, k;
        for (k = 0; k < TILINGS; k++) { vS += w[idx[k]]; vS2 += w[next[k]]; }
        var delta = out.r - rbar + vS2 - vS;
        rbar += A_RBAR * delta;
        for (k = 0; k < TILINGS; k++) w[idx[k]] += A_W * delta;
        for (var act = 0; act < 3; act++) {
          var coef = A_TH * delta * ((act === a ? 1 : 0) - p[act]);
          if (coef !== 0) {
            var block = theta[act];
            for (k = 0; k < TILINGS; k++) block[idx[k]] += coef;
          }
        }
        ewa = 0.999 * ewa + 0.001 * out.r;
        if (t % 100 === 0) curve.push(ewa);
        b = out.b; v = out.v; idx = next;
      }
      endState.b = b; endState.v = v;
    })();

    function rollout(params, kick, rollSeed, start) {
      seed = rollSeed % 2147483647;
      var b = start ? start.b : Math.PI, v = start ? start.v : 0, frames = [], total = 0;
      for (var t = 0; t < ROLL_STEPS; t++) {
        if (kick && t === KICK_STEP) v += 3.0;
        var idx = features(b, v);
        var p = policy(idx, params);
        var a = sample(p);
        var out = stepEnv(b, v, a - 1);
        frames.push({ b: out.b, v: out.v, a: a - 1, r: out.r, kick: kick && t === KICK_STEP });
        total += out.r;
        b = out.b; v = out.v;
      }
      return { frames: frames, mean: total / ROLL_STEPS };
    }

    var untrained = rollout(null, false, 4242, null);
    var trained = rollout(theta, true, 5150, endState);
    function tailMean(roll, from, to) {
      var sum = 0;
      for (var i = from; i < to; i++) sum += roll.frames[i].r;
      return sum / (to - from);
    }
    var balanced = tailMean(trained, KICK_STEP - 60, KICK_STEP);
    var recovered = tailMean(trained, ROLL_STEPS - 60, ROLL_STEPS);
    var ROLLS = [untrained, trained];
    var STAGE_NAMES = ['untrained', 'after training'];

    var PIV_X = 170, PIV_Y = 150, ROD = 92;
    var CL = 385, CR = 675, CT = 60, CB = 165;
    var TL = 385, TR = 675, TT = 225, TB = 330;

    function render() {
      var stage = Math.min(1, Math.max(0, Number(stageInput.value)));
      var t = Math.min(ROLL_STEPS - 1, Math.max(0, Number(stepInput.value)));
      var roll = ROLLS[stage];
      var frame = roll.frames[Math.min(t, roll.frames.length - 1)];

      clear(svg);
      label(svg, PIV_X, 26, 'the pendulum at step ' + t, COLOR.ink, 12.5, 'middle', 800);
      label(svg, (CL + CR) / 2, 26, 'learning curve of the training run', COLOR.ink, 12.5, 'middle', 800);
      label(svg, (TL + TR) / 2, 200, 'angle during this rollout', COLOR.ink, 12.5, 'middle', 800);

      line(svg, PIV_X, PIV_Y - ROD - 18, PIV_X, PIV_Y + 20, COLOR.line, 1.2, '4 4');
      var tipX = PIV_X + ROD * Math.sin(frame.b);
      var tipY = PIV_Y - ROD * Math.cos(frame.b);
      var upright = Math.abs(frame.b) < 0.35;
      line(svg, PIV_X, PIV_Y, tipX, tipY, upright ? COLOR.green : COLOR.red, 7);
      svg.appendChild(svgEl('circle', { cx: tipX, cy: tipY, r: 9, fill: upright ? COLOR.green : COLOR.red }));
      svg.appendChild(svgEl('circle', { cx: PIV_X, cy: PIV_Y, r: 5, fill: COLOR.ink }));
      label(svg, PIV_X, PIV_Y - ROD - 26, 'upright', COLOR.muted, 10.5);
      var torqueText = frame.a === 0 ? 'no torque' : (frame.a > 0 ? 'torque +1' : 'torque -1');
      label(svg, PIV_X, PIV_Y + 62, torqueText, frame.a === 0 ? COLOR.muted : COLOR.gold, 12, 'middle', 800);
      label(svg, PIV_X, PIV_Y + 82, 'angle ' + (frame.b * 180 / Math.PI).toFixed(0) + ' deg, reward ' + frame.r.toFixed(2),
        COLOR.muted, 11);
      if (frame.kick) label(svg, PIV_X, PIV_Y + 102, 'random shove applied here', COLOR.red, 11.5, 'middle', 800);

      line(svg, CL, CT, CL, CB, COLOR.gray, 1.2);
      line(svg, CL, CB, CR, CB, COLOR.gray, 1.2);
      [0, -1, -2, -3].forEach(function (value) {
        var y = CB + value / -3.3 * (CT - CB) * -1;
        y = CB - (value + 3.3) / 3.3 * (CB - CT);
        line(svg, CL, y, CR, y, COLOR.line, 1);
        label(svg, CL - 8, y + 4, String(value), COLOR.muted, 10, 'end');
      });
      var path = '';
      curve.forEach(function (value, i) {
        var x = CL + i / (curve.length - 1) * (CR - CL);
        var y = CB - (Math.max(value, -3.3) + 3.3) / 3.3 * (CB - CT);
        path += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
      });
      svg.appendChild(svgEl('path', { d: path, fill: 'none', stroke: COLOR.blue, 'stroke-width': 2 }));
      label(svg, (CL + CR) / 2, CB + 18, '0 to ' + TRAIN_STEPS + ' training steps', COLOR.muted, 10.5);
      label(svg, CL + 6, CT + 12, 'average reward per step', COLOR.blue, 10.5, 'start', 700);

      line(svg, TL, TT, TL, TB, COLOR.gray, 1.2);
      line(svg, TL, (TT + TB) / 2, TR, (TT + TB) / 2, COLOR.line, 1.2, '4 4');
      label(svg, TL - 8, (TT + TB) / 2 + 4, '0', COLOR.muted, 10, 'end');
      label(svg, TL - 8, TT + 6, '+pi', COLOR.muted, 10, 'end');
      label(svg, TL - 8, TB + 4, '-pi', COLOR.muted, 10, 'end');
      var tracePath = '';
      roll.frames.forEach(function (f, i) {
        var x = TL + i / (ROLL_STEPS - 1) * (TR - TL);
        var y = (TT + TB) / 2 - f.b / Math.PI * (TB - TT) / 2;
        tracePath += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
      });
      svg.appendChild(svgEl('path', { d: tracePath, fill: 'none', stroke: COLOR.gold, 'stroke-width': 1.6 }));
      if (stage === 1) {
        var kx = TL + KICK_STEP / (ROLL_STEPS - 1) * (TR - TL);
        line(svg, kx, TT, kx, TB, COLOR.red, 1.2, '4 3');
        label(svg, kx, TT - 6, 'shove', COLOR.red, 10, 'middle', 800);
      }
      var mx = TL + t / (ROLL_STEPS - 1) * (TR - TL);
      line(svg, mx, TT, mx, TB, COLOR.ink, 1.2);
      svg.appendChild(svgEl('circle', {
        cx: mx, cy: (TT + TB) / 2 - frame.b / Math.PI * (TB - TT) / 2, r: 4.5,
        fill: COLOR.ink, stroke: '#fff', 'stroke-width': 1.4
      }));

      setText('pen-stage-value', STAGE_NAMES[stage]);
      setText('pen-step-value', String(t));
      setText('pen-angle', (frame.b * 180 / Math.PI).toFixed(0) + ' deg');
      setText('pen-action', frame.a === 0 ? '0' : (frame.a > 0 ? '+1' : '-1'));
      setText('pen-reward', frame.r.toFixed(2));
      setText('pen-before', untrained.mean.toFixed(2));
      setText('pen-after', trained.mean.toFixed(2));
      setText('pen-balanced', balanced.toFixed(2));
      setText('pen-final', curve[curve.length - 1].toFixed(2));
      setText('pen-status', 'This page trained the agent for ' + TRAIN_STEPS + ' steps when it loaded. ' +
        'Averaged over a ' + ROLL_STEPS + '-step rollout, the untrained policy earns ' + untrained.mean.toFixed(2) +
        ' per step and the trained policy earns ' + trained.mean.toFixed(2) +
        ', where 0 would be perfectly upright at every step and about -3.14 is hanging straight down. ' +
        'Averaged over the 60 steps before the shove at step ' + KICK_STEP + ' it earns ' + balanced.toFixed(2) +
        ', and over the last 60 steps after it ' + recovered.toFixed(2) + ': it swings back up on its own.');
    }

    stageInput.addEventListener('input', render);
    stepInput.addEventListener('input', render);
    render();
  })();
})();
