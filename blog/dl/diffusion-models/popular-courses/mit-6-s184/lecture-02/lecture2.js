(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var COLORS = {
    green: '#0a8f6a',
    blue: '#3a7bd5',
    gold: '#c98a2b',
    gray: '#9eaaa4',
    line: '#d8dedb',
    ink: '#2d3a34',
    muted: '#6b7a72',
    paleGreen: 'rgba(10,143,106,0.12)',
    paleBlue: 'rgba(58,123,213,0.10)'
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var el = byId(id);
    if (el) el.textContent = value;
  }

  function setWidth(id, percent) {
    var el = byId(id);
    if (el) el.style.width = Math.max(0, Math.min(100, percent)) + '%';
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
    svg.appendChild(svgEl('line', attrs));
    return svg.lastChild;
  }

  function label(svg, x, y, value, color, size, anchor, weight) {
    var text = svgEl('text', {
      x: x,
      y: y,
      fill: color || COLORS.muted,
      'font-family': 'Manrope, sans-serif',
      'font-size': size || 12,
      'font-weight': weight || 500,
      'text-anchor': anchor || 'middle'
    });
    text.textContent = value;
    svg.appendChild(text);
    return text;
  }

  function gaussian(x, mean, std) {
    var safeStd = Math.max(std, 0.055);
    var z = (x - mean) / safeStd;
    return Math.exp(-0.5 * z * z) / (safeStd * Math.sqrt(2 * Math.PI));
  }

  function pathFromValues(values, mapX, mapY) {
    return values.map(function (point, index) {
      return (index ? 'L' : 'M') + mapX(point[0]).toFixed(1) + ',' + mapY(point[1]).toFixed(1);
    }).join(' ');
  }

  function addArrowMarker(svg, id, color) {
    var defs = svg.querySelector('defs');
    if (!defs) {
      defs = svgEl('defs');
      svg.appendChild(defs);
    }
    var marker = svgEl('marker', {
      id: id,
      markerWidth: 9,
      markerHeight: 9,
      refX: 7,
      refY: 3.5,
      orient: 'auto',
      markerUnits: 'strokeWidth'
    });
    marker.appendChild(svgEl('path', { d: 'M0,0 L8,3.5 L0,7 Z', fill: color }));
    defs.appendChild(marker);
  }

  function arrow(svg, x1, y1, x2, y2, color, width, markerId) {
    var el = line(svg, x1, y1, x2, y2, color, width || 2.5);
    el.setAttribute('marker-end', 'url(#' + markerId + ')');
    return el;
  }

  function drawAxis(svg, left, right, y, min, max) {
    line(svg, left, y, right, y, COLORS.gray, 1.2);
    for (var value = Math.ceil(min); value <= Math.floor(max); value++) {
      var x = left + (value - min) / (max - min) * (right - left);
      line(svg, x, y - 4, x, y + 4, COLORS.gray, 1);
      label(svg, x, y + 18, String(value), COLORS.muted, 10);
    }
  }

  (function initProbabilityPaths() {
    var slider = byId('path-time');
    var svg = byId('path-svg');
    if (!slider || !svg) return;

    function render() {
      var t = Number(slider.value);
      var alpha = t;
      var beta = 1 - t;
      var drawStd = Math.max(beta, 0.055);
      var min = -4;
      var max = 4;
      var left = 50;
      var right = 650;
      var width = right - left;
      var panels = [
        { top: 38, bottom: 142, title: 'conditional path for z = +2', mode: 'conditional' },
        { top: 190, bottom: 294, title: 'marginal path: average over z = -2 and z = +2', mode: 'marginal' }
      ];

      function mapX(x) {
        return left + (x - min) / (max - min) * width;
      }

      clear(svg);
      panels.forEach(function (panel, panelIndex) {
        var samples = [];
        var peak = 0;
        for (var i = 0; i <= 180; i++) {
          var x = min + (max - min) * i / 180;
          var density = panel.mode === 'conditional'
            ? gaussian(x, alpha * 2, drawStd)
            : 0.5 * gaussian(x, -2 * alpha, drawStd) + 0.5 * gaussian(x, 2 * alpha, drawStd);
          samples.push([x, density]);
          peak = Math.max(peak, density);
        }
        var mapY = function (density) {
          return panel.bottom - density / peak * (panel.bottom - panel.top - 24);
        };
        var areaValues = [[min, 0]].concat(samples).concat([[max, 0]]);
        svg.appendChild(svgEl('path', {
          d: pathFromValues(areaValues, mapX, mapY) + ' Z',
          fill: panelIndex === 0 ? COLORS.paleGreen : COLORS.paleBlue,
          stroke: 'none'
        }));
        svg.appendChild(svgEl('path', {
          d: pathFromValues(samples, mapX, mapY),
          fill: 'none',
          stroke: panelIndex === 0 ? COLORS.green : COLORS.blue,
          'stroke-width': 2.6
        }));
        drawAxis(svg, left, right, panel.bottom, min, max);
        label(svg, left, panel.top - 9, panel.title, COLORS.ink, 12, 'start', 700);
        if (panel.mode === 'conditional') {
          line(svg, mapX(2), panel.top + 2, mapX(2), panel.bottom, COLORS.gold, 1.3, '4 4');
          label(svg, mapX(2), panel.top + 12, 'z', COLORS.gold, 11, 'middle', 700);
        } else {
          [-2, 2].forEach(function (z) {
            line(svg, mapX(z), panel.top + 2, mapX(z), panel.bottom, COLORS.gold, 1.1, '4 4');
          });
        }
      });

      setText('path-time-value', t.toFixed(2));
      setText('path-alpha-value', alpha.toFixed(2));
      setText('path-beta-value', beta.toFixed(2));
      setText('path-status', t < 0.01
        ? 'At t = 0, every conditional is the same standard Gaussian, so their average is also p_init.'
        : t > 0.99
          ? 'At t = 1, each conditional collapses onto its data point; averaging the endpoints recovers p_data.'
          : 'One conditional heads toward z = +2. The marginal averages the paths for both possible data points.');
    }

    slider.addEventListener('input', render);
    render();
  })();

  (function initConditionalVelocity() {
    var timeSlider = byId('velocity-time');
    var noiseSlider = byId('velocity-noise');
    var dataSlider = byId('velocity-data');
    var svg = byId('velocity-svg');
    if (!timeSlider || !noiseSlider || !dataSlider || !svg) return;

    function render() {
      var t = Number(timeSlider.value);
      var epsilon = Number(noiseSlider.value);
      var z = Number(dataSlider.value);
      var x = (1 - t) * epsilon + t * z;
      var target = z - epsilon;
      var targetFromX = (z - x) / (1 - t);
      var min = -4;
      var max = 4;
      var left = 55;
      var right = 625;
      var axisY = 128;
      var mapX = function (value) {
        return left + (value - min) / (max - min) * (right - left);
      };

      clear(svg);
      addArrowMarker(svg, 'velocity-target-arrow', COLORS.green);
      drawAxis(svg, left, right, axisY, min, max);
      line(svg, mapX(epsilon), 62, mapX(z), 62, COLORS.gray, 2);
      svg.appendChild(svgEl('circle', { cx: mapX(epsilon), cy: 62, r: 7, fill: COLORS.blue }));
      svg.appendChild(svgEl('circle', { cx: mapX(z), cy: 62, r: 7, fill: COLORS.gold }));
      svg.appendChild(svgEl('circle', { cx: mapX(x), cy: axisY, r: 8, fill: COLORS.green }));
      label(svg, mapX(epsilon), 43, 'noise epsilon', COLORS.blue, 11, 'middle', 700);
      label(svg, mapX(z), 43, 'data z', COLORS.gold, 11, 'middle', 700);
      label(svg, mapX(x), axisY - 14, 'x_t', COLORS.green, 11, 'middle', 700);

      var arrowScale = 36;
      var endX = Math.max(left + 4, Math.min(right - 4, mapX(x) + target * arrowScale));
      arrow(svg, mapX(x), 176, endX, 176, COLORS.green, 3, 'velocity-target-arrow');
      label(svg, mapX(x), 202, 'target velocity z - epsilon = ' + target.toFixed(2), COLORS.green, 11);

      setText('velocity-time-value', t.toFixed(2));
      setText('velocity-noise-value', epsilon.toFixed(2));
      setText('velocity-data-value', z.toFixed(2));
      setText('velocity-x-value', x.toFixed(3));
      setText('velocity-target-value', target.toFixed(3));
      setText('velocity-alt-value', targetFromX.toFixed(3));
      setText('velocity-status', 'Moving t changes the point x_t, but this straight path keeps the target velocity z - epsilon constant.');
    }

    timeSlider.addEventListener('input', render);
    noiseSlider.addEventListener('input', render);
    dataSlider.addEventListener('input', render);
    render();
  })();

  function twoPointPosterior(x, t) {
    var beta = Math.max(1 - t, 0.055);
    var leftLikelihood = gaussian(x, -2 * t, beta);
    var rightLikelihood = gaussian(x, 2 * t, beta);
    var total = leftLikelihood + rightLikelihood;
    return {
      beta: beta,
      left: leftLikelihood / total,
      right: rightLikelihood / total
    };
  }

  (function initMarginalization() {
    var timeSlider = byId('marginal-time');
    var xSlider = byId('marginal-x');
    var svg = byId('marginal-svg');
    if (!timeSlider || !xSlider || !svg) return;

    function render() {
      var t = Number(timeSlider.value);
      var x = Number(xSlider.value);
      var posterior = twoPointPosterior(x, t);
      var leftVelocity = (-2 - x) / posterior.beta;
      var rightVelocity = (2 - x) / posterior.beta;
      var marginalVelocity = posterior.left * leftVelocity + posterior.right * rightVelocity;
      var min = -4;
      var max = 4;
      var left = 50;
      var right = 650;
      var top = 34;
      var bottom = 175;
      var mapX = function (value) {
        return left + (value - min) / (max - min) * (right - left);
      };
      var valuesLeft = [];
      var valuesRight = [];
      var peak = 0;
      for (var i = 0; i <= 180; i++) {
        var location = min + (max - min) * i / 180;
        var dLeft = 0.5 * gaussian(location, -2 * t, posterior.beta);
        var dRight = 0.5 * gaussian(location, 2 * t, posterior.beta);
        valuesLeft.push([location, dLeft]);
        valuesRight.push([location, dRight]);
        peak = Math.max(peak, dLeft + dRight);
      }
      var mapY = function (density) {
        return bottom - density / peak * (bottom - top - 20);
      };

      clear(svg);
      addArrowMarker(svg, 'marginal-left-arrow', COLORS.blue);
      addArrowMarker(svg, 'marginal-right-arrow', COLORS.gold);
      addArrowMarker(svg, 'marginal-result-arrow', COLORS.green);
      svg.appendChild(svgEl('path', {
        d: pathFromValues(valuesLeft, mapX, mapY),
        fill: 'none',
        stroke: COLORS.blue,
        'stroke-width': 2.2
      }));
      svg.appendChild(svgEl('path', {
        d: pathFromValues(valuesRight, mapX, mapY),
        fill: 'none',
        stroke: COLORS.gold,
        'stroke-width': 2.2
      }));
      drawAxis(svg, left, right, bottom, min, max);
      line(svg, mapX(x), top, mapX(x), 280, COLORS.ink, 1.4, '5 4');
      label(svg, mapX(x), top - 7, 'observed x', COLORS.ink, 11, 'middle', 700);

      var center = mapX(x);
      var velocityScale = 22;
      var clamp = function (value) {
        return Math.max(left + 3, Math.min(right - 3, value));
      };
      arrow(svg, center, 210, clamp(center + leftVelocity * velocityScale), 210, COLORS.blue, 2.4, 'marginal-left-arrow');
      arrow(svg, center, 240, clamp(center + rightVelocity * velocityScale), 240, COLORS.gold, 2.4, 'marginal-right-arrow');
      arrow(svg, center, 275, clamp(center + marginalVelocity * velocityScale), 275, COLORS.green, 3.4, 'marginal-result-arrow');
      label(svg, left, 214, 'z = -2', COLORS.blue, 10, 'start', 700);
      label(svg, left, 244, 'z = +2', COLORS.gold, 10, 'start', 700);
      label(svg, left, 279, 'weighted result', COLORS.green, 10, 'start', 700);

      setText('marginal-time-value', t.toFixed(2));
      setText('marginal-x-value', x.toFixed(2));
      setText('marginal-left-weight', (100 * posterior.left).toFixed(1) + '%');
      setText('marginal-right-weight', (100 * posterior.right).toFixed(1) + '%');
      setWidth('marginal-left-bar', 100 * posterior.left);
      setWidth('marginal-right-bar', 100 * posterior.right);
      setText('marginal-left-velocity', leftVelocity.toFixed(2));
      setText('marginal-right-velocity', rightVelocity.toFixed(2));
      setText('marginal-velocity-value', marginalVelocity.toFixed(2));
      setText('marginal-status', posterior.left > 0.8
        ? 'This x is much more likely to have come from z = -2, so that conditional field dominates.'
        : posterior.right > 0.8
          ? 'This x is much more likely to have come from z = +2, so that conditional field dominates.'
          : 'Both data points plausibly explain x, so the marginal field blends their conditional velocities.');
    }

    timeSlider.addEventListener('input', render);
    xSlider.addEventListener('input', render);
    render();
  })();

  (function initContinuity() {
    var slider = byId('continuity-x');
    var svg = byId('continuity-svg');
    if (!slider || !svg) return;

    function render() {
      var x = Number(slider.value);
      var density = gaussian(x, 0, 1);
      var velocity = -0.6 * x;
      var flux = density * velocity;
      var rate = 0.6 * density * (1 - x * x);
      var min = -3.5;
      var max = 3.5;
      var left = 45;
      var right = 650;
      var top = 30;
      var bottom = 205;
      var values = [];
      var peak = gaussian(0, 0, 1);
      var mapX = function (value) {
        return left + (value - min) / (max - min) * (right - left);
      };
      var mapY = function (value) {
        return bottom - value / peak * (bottom - top - 22);
      };
      for (var i = 0; i <= 180; i++) {
        var location = min + (max - min) * i / 180;
        values.push([location, gaussian(location, 0, 1)]);
      }

      clear(svg);
      addArrowMarker(svg, 'continuity-flow-arrow', COLORS.green);
      svg.appendChild(svgEl('path', {
        d: pathFromValues([[min, 0]].concat(values).concat([[max, 0]]), mapX, mapY) + ' Z',
        fill: COLORS.paleGreen,
        stroke: 'none'
      }));
      svg.appendChild(svgEl('path', {
        d: pathFromValues(values, mapX, mapY),
        fill: 'none',
        stroke: COLORS.green,
        'stroke-width': 2.5
      }));
      drawAxis(svg, left, right, bottom, min, max);
      line(svg, mapX(x), top, mapX(x), bottom + 42, COLORS.ink, 1.3, '5 4');
      svg.appendChild(svgEl('circle', { cx: mapX(x), cy: mapY(density), r: 6, fill: COLORS.gold }));
      var flowEnd = Math.max(left, Math.min(right, mapX(x) + velocity * 65));
      arrow(svg, mapX(x), bottom + 30, flowEnd, bottom + 30, COLORS.green, 3, 'continuity-flow-arrow');
      label(svg, mapX(x), top - 7, 'x = ' + x.toFixed(2), COLORS.ink, 11, 'middle', 700);
      label(svg, left, 270, 'velocity u(x) = -0.6x points toward the center', COLORS.muted, 11, 'start');

      setText('continuity-x-value', x.toFixed(2));
      setText('continuity-density-value', density.toFixed(3));
      setText('continuity-flux-value', flux.toFixed(3));
      setText('continuity-rate-value', rate.toFixed(3));
      setText('continuity-status', rate > 0.005
        ? 'More probability flows into this neighborhood than out, so the density increases here.'
        : rate < -0.005
          ? 'More probability flows out of this neighborhood than in, so the density decreases here.'
          : 'Inflow and outflow are nearly balanced at this location.');
    }

    slider.addEventListener('input', render);
    render();
  })();

  (function initFlowMatching() {
    var timeSlider = byId('cfm-time');
    var noiseSlider = byId('cfm-noise');
    var dataSlider = byId('cfm-data');
    var predictionSlider = byId('cfm-prediction');
    var svg = byId('cfm-svg');
    if (!timeSlider || !noiseSlider || !dataSlider || !predictionSlider || !svg) return;

    function render() {
      var t = Number(timeSlider.value);
      var epsilon = Number(noiseSlider.value);
      var z = Number(dataSlider.value);
      var prediction = Number(predictionSlider.value);
      var x = (1 - t) * epsilon + t * z;
      var target = z - epsilon;
      var error = prediction - target;
      var loss = error * error;
      var min = -4;
      var max = 4;
      var left = 50;
      var right = 650;
      var mapX = function (value) {
        return left + (value - min) / (max - min) * (right - left);
      };
      var clamp = function (value) {
        return Math.max(left + 3, Math.min(right - 3, value));
      };

      clear(svg);
      addArrowMarker(svg, 'cfm-target-arrow', COLORS.green);
      addArrowMarker(svg, 'cfm-pred-arrow', COLORS.gold);
      drawAxis(svg, left, right, 112, min, max);
      line(svg, mapX(epsilon), 55, mapX(z), 55, COLORS.gray, 2);
      svg.appendChild(svgEl('circle', { cx: mapX(epsilon), cy: 55, r: 7, fill: COLORS.blue }));
      svg.appendChild(svgEl('circle', { cx: mapX(z), cy: 55, r: 7, fill: COLORS.gold }));
      svg.appendChild(svgEl('circle', { cx: mapX(x), cy: 112, r: 8, fill: COLORS.green }));
      label(svg, mapX(epsilon), 35, 'epsilon', COLORS.blue, 11, 'middle', 700);
      label(svg, mapX(z), 35, 'z', COLORS.gold, 11, 'middle', 700);
      label(svg, mapX(x), 96, 'network input x_t', COLORS.green, 11, 'middle', 700);
      arrow(svg, mapX(x), 165, clamp(mapX(x) + target * 32), 165, COLORS.green, 3, 'cfm-target-arrow');
      arrow(svg, mapX(x), 205, clamp(mapX(x) + prediction * 32), 205, COLORS.gold, 3, 'cfm-pred-arrow');
      label(svg, left, 169, 'target', COLORS.green, 10, 'start', 700);
      label(svg, left, 209, 'prediction', COLORS.gold, 10, 'start', 700);

      setText('cfm-time-value', t.toFixed(2));
      setText('cfm-noise-value', epsilon.toFixed(2));
      setText('cfm-data-value', z.toFixed(2));
      setText('cfm-prediction-value', prediction.toFixed(2));
      setText('cfm-x-value', x.toFixed(3));
      setText('cfm-target-value', target.toFixed(3));
      setText('cfm-error-value', error.toFixed(3));
      setText('cfm-loss-value', loss.toFixed(3));
      setText('cfm-status', Math.abs(error) < 0.08
        ? 'The prediction matches this sample target, so its squared-error contribution is almost zero.'
        : 'Training changes theta so the gold prediction arrow approaches the green conditional target arrow.');
    }

    timeSlider.addEventListener('input', render);
    noiseSlider.addEventListener('input', render);
    dataSlider.addEventListener('input', render);
    predictionSlider.addEventListener('input', render);
    render();
  })();

  (function initScoreSDE() {
    var timeSlider = byId('score-time');
    var xSlider = byId('score-x');
    var sigmaSlider = byId('score-sigma');
    var svg = byId('score-svg');
    if (!timeSlider || !xSlider || !sigmaSlider || !svg) return;

    function render() {
      var t = Number(timeSlider.value);
      var x = Number(xSlider.value);
      var sigma = Number(sigmaSlider.value);
      var posterior = twoPointPosterior(x, t);
      var variance = posterior.beta * posterior.beta;
      var leftScore = -(x + 2 * t) / variance;
      var rightScore = -(x - 2 * t) / variance;
      var score = posterior.left * leftScore + posterior.right * rightScore;
      var leftVelocity = (-2 - x) / posterior.beta;
      var rightVelocity = (2 - x) / posterior.beta;
      var velocity = posterior.left * leftVelocity + posterior.right * rightVelocity;
      var correction = 0.5 * sigma * sigma * score;
      var drift = velocity + correction;
      var min = -4;
      var max = 4;
      var left = 50;
      var right = 650;
      var top = 30;
      var bottom = 175;
      var values = [];
      var peak = 0;
      var mapX = function (value) {
        return left + (value - min) / (max - min) * (right - left);
      };
      for (var i = 0; i <= 180; i++) {
        var location = min + (max - min) * i / 180;
        var density = 0.5 * gaussian(location, -2 * t, posterior.beta) +
          0.5 * gaussian(location, 2 * t, posterior.beta);
        values.push([location, density]);
        peak = Math.max(peak, density);
      }
      var mapY = function (density) {
        return bottom - density / peak * (bottom - top - 20);
      };
      var clamp = function (value) {
        return Math.max(left + 3, Math.min(right - 3, value));
      };
      var arrowScale = 24;

      clear(svg);
      addArrowMarker(svg, 'score-velocity-arrow', COLORS.green);
      addArrowMarker(svg, 'score-correction-arrow', COLORS.blue);
      addArrowMarker(svg, 'score-drift-arrow', COLORS.gold);
      svg.appendChild(svgEl('path', {
        d: pathFromValues([[min, 0]].concat(values).concat([[max, 0]]), mapX, mapY) + ' Z',
        fill: COLORS.paleBlue,
        stroke: 'none'
      }));
      svg.appendChild(svgEl('path', {
        d: pathFromValues(values, mapX, mapY),
        fill: 'none',
        stroke: COLORS.blue,
        'stroke-width': 2.5
      }));
      drawAxis(svg, left, right, bottom, min, max);
      line(svg, mapX(x), top, mapX(x), 288, COLORS.ink, 1.3, '5 4');
      svg.appendChild(svgEl('circle', { cx: mapX(x), cy: mapY(0.5 * gaussian(x, -2 * t, posterior.beta) + 0.5 * gaussian(x, 2 * t, posterior.beta)), r: 6, fill: COLORS.gold }));
      arrow(svg, mapX(x), 215, clamp(mapX(x) + velocity * arrowScale), 215, COLORS.green, 2.8, 'score-velocity-arrow');
      arrow(svg, mapX(x), 250, clamp(mapX(x) + correction * arrowScale), 250, COLORS.blue, 2.8, 'score-correction-arrow');
      arrow(svg, mapX(x), 285, clamp(mapX(x) + drift * arrowScale), 285, COLORS.gold, 3.3, 'score-drift-arrow');
      label(svg, left, 219, 'ODE velocity u', COLORS.green, 10, 'start', 700);
      label(svg, left, 254, 'score correction', COLORS.blue, 10, 'start', 700);
      label(svg, left, 289, 'SDE drift b', COLORS.gold, 10, 'start', 700);

      setText('score-time-value', t.toFixed(2));
      setText('score-x-value', x.toFixed(2));
      setText('score-sigma-value', sigma.toFixed(2));
      setText('score-value', score.toFixed(3));
      setText('score-velocity-value', velocity.toFixed(3));
      setText('score-correction-value', correction.toFixed(3));
      setText('score-drift-value', drift.toFixed(3));
      setText('score-status', sigma < 0.01
        ? 'With sigma = 0 there is no diffusion or score correction: the SDE reduces to the original ODE.'
        : 'Noise spreads probability. The score correction changes the drift so that this extra spreading leaves the prescribed p_t unchanged.');
    }

    timeSlider.addEventListener('input', render);
    xSlider.addEventListener('input', render);
    sigmaSlider.addEventListener('input', render);
    render();
  })();
})();
