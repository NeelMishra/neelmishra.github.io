(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

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
    var attrs = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: color, 'stroke-width': width || 1.5 };
    if (dash) attrs['stroke-dasharray'] = dash;
    svg.appendChild(svgEl('line', attrs));
  }

  function label(svg, x, y, value, color, size, anchor) {
    var t = svgEl('text', {
      x: x,
      y: y,
      fill: color || '#6b7a72',
      'font-family': 'Manrope, sans-serif',
      'font-size': size || 12,
      'text-anchor': anchor || 'middle'
    });
    t.textContent = value;
    svg.appendChild(t);
    return t;
  }

  var sourcePoints = [
    [-1.8, -0.5], [-1.5, 0.6], [-1.3, -1.2], [-1.1, 1.3], [-0.9, 0.1],
    [-0.7, -0.8], [-0.5, 0.9], [-0.3, -0.2], [-0.1, 1.5], [0.1, -1.4],
    [0.3, 0.4], [0.5, -0.6], [0.7, 1.1], [0.9, -0.1], [1.1, -1.0],
    [1.3, 0.7], [1.5, -0.4], [1.7, 1.2], [-0.4, -1.6], [0.4, 1.7]
  ];
  var targetPoints = [
    [-2.8, -0.4], [-2.7, 0.3], [-2.5, -1.0], [-2.4, 1.0], [-2.2, 0.0],
    [-2.0, -0.7], [-1.9, 0.8], [-1.7, -0.2], [-1.5, 1.1], [-1.4, -1.1],
    [1.4, -0.9], [1.5, 0.9], [1.7, 0.1], [1.9, -0.6], [2.0, 0.7],
    [2.2, -0.1], [2.4, 1.0], [2.5, -0.8], [2.7, 0.3], [2.9, -0.2]
  ];

  (function initTransport() {
    var slider = byId('transport-time');
    var svg = byId('transport-svg');
    if (!slider || !svg) return;

    function render() {
      var t = Number(slider.value);
      clear(svg);
      line(svg, 45, 165, 635, 165, '#d8dedb', 1);
      line(svg, 340, 35, 340, 285, '#d8dedb', 1);
      label(svg, 54, 28, 'particle space', '#6b7a72', 11, 'start');
      sourcePoints.forEach(function (p, i) {
        var q = targetPoints[i];
        var smooth = t * t * (3 - 2 * t);
        var x = (1 - smooth) * p[0] + smooth * q[0];
        var y = (1 - smooth) * p[1] + smooth * q[1];
        svg.appendChild(svgEl('circle', {
          cx: 340 + x * 82,
          cy: 165 - y * 68,
          r: 6,
          fill: i < 10 ? '#0a8f6a' : '#c98a2b',
          opacity: 0.82
        }));
      });
      label(svg, 340, 308, t < 0.02 ? 'p_init: one simple cloud' : (t > 0.98 ? 'p_data: two modes' : 'intermediate distribution p_t'), '#2d3a34', 13);
      setText('transport-time-value', t.toFixed(2));
      setText('transport-status', t < 0.02
        ? 'Samples begin in a simple reference distribution.'
        : t > 0.98
          ? 'At t = 1, transported samples follow the two-mode target geometry.'
          : 'The same particles move continuously; their distribution changes with time.');
    }
    slider.addEventListener('input', render);
    render();
  })();

  (function initLinearFlow() {
    var thetaSlider = byId('linear-theta');
    var timeSlider = byId('linear-time');
    var svg = byId('linear-flow-svg');
    if (!thetaSlider || !timeSlider || !svg) return;

    function render() {
      var theta = Number(thetaSlider.value);
      var selected = Number(timeSlider.value);
      var starts = [-3, -2, -1, 1, 2, 3];
      clear(svg);
      line(svg, 55, 255, 625, 255, '#6b7a72', 1.4);
      line(svg, 55, 30, 55, 275, '#6b7a72', 1.4);
      label(svg, 630, 273, 'time', '#6b7a72', 11, 'end');
      label(svg, 38, 35, 'x(t)', '#6b7a72', 11);

      starts.forEach(function (x0, index) {
        var points = [];
        for (var k = 0; k <= 60; k++) {
          var t = k / 60;
          var x = Math.exp(-theta * t) * x0;
          points.push((55 + t * 550).toFixed(1) + ',' + (150 - x * 34).toFixed(1));
        }
        svg.appendChild(svgEl('polyline', {
          points: points.join(' '),
          fill: 'none',
          stroke: index < 3 ? '#0a8f6a' : '#c98a2b',
          'stroke-width': 2,
          opacity: 0.72
        }));
        var currentX = Math.exp(-theta * selected) * x0;
        svg.appendChild(svgEl('circle', {
          cx: 55 + selected * 550,
          cy: 150 - currentX * 34,
          r: 5,
          fill: index < 3 ? '#0a8f6a' : '#c98a2b'
        }));
      });
      line(svg, 55 + selected * 550, 30, 55 + selected * 550, 275, '#3a7bd5', 1.5, '5 4');
      setText('linear-theta-value', theta.toFixed(1));
      setText('linear-time-value', selected.toFixed(2));
      setText('linear-factor-value', Math.exp(-theta * selected).toFixed(4));
      setText('linear-status', 'Every starting point is multiplied by exp(-theta t). Larger theta contracts the distribution faster.');
    }
    thetaSlider.addEventListener('input', render);
    timeSlider.addEventListener('input', render);
    render();
  })();

  (function initVectorField() {
    var svg = byId('vector-field-svg');
    if (!svg) return;

    function field(x, y) {
      return [-0.7 * x - y, x - 0.7 * y];
    }

    function mapX(x) {
      return 325 + x * 88;
    }

    function mapY(y) {
      return 150 - y * 68;
    }

    clear(svg);
    var defs = svgEl('defs');
    var marker = svgEl('marker', {
      id: 'vf-generated-arrow',
      markerWidth: 8,
      markerHeight: 8,
      refX: 6,
      refY: 3,
      orient: 'auto'
    });
    marker.appendChild(svgEl('path', { d: 'M0,0 L7,3 L0,6 Z', fill: '#9eaaa4' }));
    defs.appendChild(marker);
    svg.appendChild(defs);
    line(svg, 35, 150, 615, 150, '#d8dedb', 1);
    line(svg, 325, 18, 325, 282, '#d8dedb', 1);

    for (var gx = -3; gx <= 3; gx++) {
      for (var gy = -1.5; gy <= 1.5; gy += 0.75) {
        var velocity = field(gx, gy);
        var norm = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]) || 1;
        var dx = (velocity[0] / norm) * 17;
        var dy = -(velocity[1] / norm) * 17;
        line(svg, mapX(gx), mapY(gy), mapX(gx) + dx, mapY(gy) + dy, '#9eaaa4', 1.4);
        svg.lastChild.setAttribute('marker-end', 'url(#vf-generated-arrow)');
      }
    }

    var starts = [[-2.6, -1.2], [2.6, 1.25], [-2.4, 1.45]];
    var colors = ['#0a8f6a', '#c98a2b', '#3a7bd5'];
    starts.forEach(function (start, index) {
      var x = start[0];
      var y = start[1];
      var points = [mapX(x).toFixed(1) + ',' + mapY(y).toFixed(1)];
      var dt = 0.025;
      for (var k = 0; k < 120; k++) {
        var velocity = field(x, y);
        x += dt * velocity[0];
        y += dt * velocity[1];
        points.push(mapX(x).toFixed(1) + ',' + mapY(y).toFixed(1));
      }
      svg.appendChild(svgEl('polyline', {
        points: points.join(' '),
        fill: 'none',
        stroke: colors[index],
        'stroke-width': 3
      }));
      svg.appendChild(svgEl('circle', {
        cx: mapX(start[0]),
        cy: mapY(start[1]),
        r: 6,
        fill: colors[index]
      }));
    });
    label(svg, 325, 292, 'curves are numerical solutions of the displayed field', '#6b7a72', 11);
  })();

  (function initEuler() {
    var stepsSlider = byId('euler-steps');
    var thetaSlider = byId('euler-theta');
    var svg = byId('euler-svg');
    if (!stepsSlider || !thetaSlider || !svg) return;

    function render() {
      var n = Number(stepsSlider.value);
      var theta = Number(thetaSlider.value);
      var h = 1 / n;
      var x0 = 3;
      var exact = x0 * Math.exp(-theta);
      var approx = x0;
      var values = [x0];
      for (var i = 0; i < n; i++) {
        approx = approx + h * (-theta * approx);
        values.push(approx);
      }

      var exactValues = [];
      for (var j = 0; j <= 100; j++) {
        exactValues.push(x0 * Math.exp(-theta * (j / 100)));
      }
      var allValues = values.concat(exactValues).concat([0]);
      var minY = Math.min.apply(null, allValues);
      var maxY = Math.max.apply(null, allValues);
      var span = Math.max(0.5, maxY - minY);
      minY -= span * 0.12;
      maxY += span * 0.12;

      function mapEulerY(x) {
        return 245 - ((x - minY) / (maxY - minY)) * 200;
      }

      clear(svg);
      line(svg, 55, mapEulerY(0), 625, mapEulerY(0), '#6b7a72', 1.3);
      line(svg, 55, 30, 55, 260, '#6b7a72', 1.3);
      var exactPoints = [];
      for (var k = 0; k <= 100; k++) {
        var t = k / 100;
        var x = x0 * Math.exp(-theta * t);
        exactPoints.push((55 + t * 550).toFixed(1) + ',' + mapEulerY(x).toFixed(1));
      }
      svg.appendChild(svgEl('polyline', { points: exactPoints.join(' '), fill: 'none', stroke: '#0a8f6a', 'stroke-width': 3 }));
      var eulerPoints = values.map(function (x, i) {
        return (55 + (i / n) * 550).toFixed(1) + ',' + mapEulerY(x).toFixed(1);
      });
      svg.appendChild(svgEl('polyline', { points: eulerPoints.join(' '), fill: 'none', stroke: '#c98a2b', 'stroke-width': 2.5 }));
      values.forEach(function (x, i) {
        svg.appendChild(svgEl('circle', { cx: 55 + (i / n) * 550, cy: mapEulerY(x), r: 4, fill: '#c98a2b' }));
      });
      label(svg, 500, 55, 'exact solution', '#0a8f6a', 12);
      label(svg, 500, 78, 'Euler steps', '#c98a2b', 12);

      setText('euler-steps-value', String(n));
      setText('euler-theta-value', theta.toFixed(1));
      setText('euler-h-value', h.toFixed(4));
      setText('euler-exact-value', exact.toFixed(5));
      setText('euler-approx-value', approx.toFixed(5));
      setText('euler-error-value', Math.abs(approx - exact).toFixed(5));
    }
    stepsSlider.addEventListener('input', render);
    thetaSlider.addEventListener('input', render);
    render();
  })();

  function seededNormals(count, seed) {
    var state = seed >>> 0;
    var values = [];
    function random() {
      state = (1664525 * state + 1013904223) >>> 0;
      return (state + 1) / 4294967297;
    }
    while (values.length < count) {
      var u1 = random();
      var u2 = random();
      var radius = Math.sqrt(-2 * Math.log(u1));
      values.push(radius * Math.cos(2 * Math.PI * u2));
      if (values.length < count) values.push(radius * Math.sin(2 * Math.PI * u2));
    }
    return values;
  }

  (function initSde() {
    var sigmaSlider = byId('sde-sigma');
    var thetaSlider = byId('sde-theta');
    var svg = byId('sde-svg');
    if (!sigmaSlider || !thetaSlider || !svg) return;

    var pathCount = 5;
    var steps = 100;
    var h = 1 / steps;
    var normals = seededNormals(pathCount * steps, 1842026);
    var colors = ['#0a8f6a', '#c98a2b', '#3a7bd5', '#c0392b', '#7257a8'];

    function render() {
      var sigma = Number(sigmaSlider.value);
      var theta = Number(thetaSlider.value);
      clear(svg);
      line(svg, 55, 150, 625, 150, '#6b7a72', 1.2);
      line(svg, 55, 25, 55, 275, '#6b7a72', 1.2);

      for (var p = 0; p < pathCount; p++) {
        var x = 2.5;
        var points = ['55,' + (150 - x * 34).toFixed(1)];
        for (var i = 0; i < steps; i++) {
          x = x + (-theta * x) * h + sigma * Math.sqrt(h) * normals[p * steps + i];
          points.push((55 + ((i + 1) / steps) * 550).toFixed(1) + ',' + (150 - x * 34).toFixed(1));
        }
        svg.appendChild(svgEl('polyline', {
          points: points.join(' '),
          fill: 'none',
          stroke: colors[p],
          'stroke-width': 2,
          opacity: 0.8
        }));
      }

      var meanPoints = [];
      for (var k = 0; k <= 100; k++) {
        var t = k / 100;
        var mean = 2.5 * Math.exp(-theta * t);
        meanPoints.push((55 + t * 550).toFixed(1) + ',' + (150 - mean * 34).toFixed(1));
      }
      svg.appendChild(svgEl('polyline', {
        points: meanPoints.join(' '),
        fill: 'none',
        stroke: '#1a2b22',
        'stroke-width': 2.5,
        'stroke-dasharray': '7 5'
      }));
      label(svg, 525, 35, 'dashed: deterministic mean', '#1a2b22', 11);

      setText('sde-sigma-value', sigma.toFixed(2));
      setText('sde-theta-value', theta.toFixed(1));
      setText('sde-step-noise-value', (sigma * Math.sqrt(h)).toFixed(4));
      setText('sde-stationary-var-value', theta > 0 ? (sigma * sigma / (2 * theta)).toFixed(4) : 'unbounded');
      setText('sde-status', sigma === 0
        ? 'With sigma = 0, all paths collapse to the deterministic ODE.'
        : 'The drift pulls paths toward zero while Brownian increments continually spread them apart.');
    }
    sigmaSlider.addEventListener('input', render);
    thetaSlider.addEventListener('input', render);
    render();
  })();
})();
