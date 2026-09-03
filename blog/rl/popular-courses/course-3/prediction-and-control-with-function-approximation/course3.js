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

  (function initFixedPoint() {
    var gammaInput = byId('fixed-gamma');
    var svg = byId('fixed-svg');
    if (!gammaInput || !svg) return;

    function render() {
      var gamma = Number(gammaInput.value);
      var p00 = 0.8;
      var p01 = 0.2;
      var p10 = 0.1;
      var p11 = 0.9;
      var mu = [1 / 3, 2 / 3];
      var phi = [1, 0.3];
      var a = 1 - gamma * p00;
      var b = -gamma * p01;
      var c = -gamma * p10;
      var d = 1 - gamma * p11;
      var det = a * d - b * c;
      var trueA = -b / det;
      var trueB = a / det;
      var denom = mu[0] * phi[0] * phi[0] + mu[1] * phi[1] * phi[1];
      var wMC = (mu[0] * phi[0] * trueA + mu[1] * phi[1] * trueB) / denom;
      var pPhi = [
        p00 * phi[0] + p01 * phi[1],
        p10 * phi[0] + p11 * phi[1]
      ];
      var matrixA = mu[0] * phi[0] * (phi[0] - gamma * pPhi[0]) +
        mu[1] * phi[1] * (phi[1] - gamma * pPhi[1]);
      var vectorB = mu[1] * phi[1];
      var wTD = vectorB / matrixA;
      var mcValues = [wMC * phi[0], wMC * phi[1]];
      var tdValues = [wTD * phi[0], wTD * phi[1]];
      var trueValues = [trueA, trueB];
      var msveMC = mu[0] * Math.pow(trueA - mcValues[0], 2) +
        mu[1] * Math.pow(trueB - mcValues[1], 2);
      var msveTD = mu[0] * Math.pow(trueA - tdValues[0], 2) +
        mu[1] * Math.pow(trueB - tdValues[1], 2);
      var maxValue = Math.max.apply(null, trueValues.concat(mcValues, tdValues).concat([1])) * 1.12;
      var baseY = 245;
      var top = 30;
      var barWidth = 34;
      var groupX = [205, 485];
      var colors = [COLOR.red, COLOR.green, COLOR.blue];
      var sets = [trueValues, mcValues, tdValues];
      var names = ['true value', 'MC minimum', 'TD fixed point'];
      var state;
      var j;

      clear(svg);
      line(svg, 75, baseY, 625, baseY, COLOR.gray, 1.2);
      for (state = 0; state < 2; state++) {
        for (j = 0; j < 3; j++) {
          var value = sets[j][state];
          var height = value / maxValue * (baseY - top);
          var x = groupX[state] + (j - 1) * 48 - barWidth / 2;
          svg.appendChild(svgEl('rect', {
            x: x,
            y: baseY - height,
            width: barWidth,
            height: Math.max(height, 1),
            rx: 4,
            fill: colors[j],
            opacity: 0.84
          }));
          label(svg, x + barWidth / 2, baseY - height - 7, value.toFixed(2), colors[j], 10, 'middle', 700);
        }
        label(svg, groupX[state], 272, state ? 'state B, x(B)=0.3' : 'state A, x(A)=1', COLOR.ink, 11, 'middle', 700);
      }
      for (j = 0; j < 3; j++) {
        svg.appendChild(svgEl('rect', {
          x: 145 + j * 150,
          y: 295,
          width: 16,
          height: 5,
          rx: 3,
          fill: colors[j]
        }));
        label(svg, 168 + j * 150, 302, names[j], COLOR.muted, 10, 'start');
      }

      setText('fixed-gamma-value', gamma.toFixed(2));
      setText('fixed-w-mc', wMC.toFixed(3));
      setText('fixed-w-td', wTD.toFixed(3));
      setText('fixed-msve-mc', msveMC.toFixed(3));
      setText('fixed-msve-td', msveTD.toFixed(3));
      setText('fixed-status', gamma > 0.85
        ? 'With weak features and a large discount, the TD fixed point can differ substantially from the best MSVE fit.'
        : 'Both methods use the same one-parameter representation, but they generally select different weights.');
    }

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
})();
