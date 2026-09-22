/* Progressive enhancement for the five-row gradient-descent example. */
(function () {
  'use strict';
  var live = document.getElementById('gd-live');
  if (!live) return;
  var NS = 'http://www.w3.org/2000/svg';
  var X = [[-2, -1], [-1, -1], [0, 0], [1, 1], [2, 1]];
  var y = [-3, -1, 0, 1, 3];
  var star = [2, -1], eta = 0.6, maxSteps = 20;
  var history = [[-1, 3]], index = 0, timer = null, playing = false;
  var plane = document.getElementById('gd-svg');
  var lossPlot = document.getElementById('gd-loss-svg');
  var stepButton = document.getElementById('gd-step');
  var playButton = document.getElementById('gd-play');
  var seek = document.getElementById('gd-seek');
  var status = document.getElementById('gd-status');

  function evaluate(beta) {
    var loss = 0, gradient = [0, 0];
    X.forEach(function (row, i) {
      var residual = row[0] * beta[0] + row[1] * beta[1] - y[i];
      loss += residual * residual / (2 * X.length);
      gradient[0] += row[0] * residual / X.length;
      gradient[1] += row[1] * residual / X.length;
    });
    return { loss: loss, gradient: gradient };
  }
  for (var t = 0; t < maxSteps; t++) {
    var beta = history[t], g = evaluate(beta).gradient;
    history.push([beta[0] - eta * g[0], beta[1] - eta * g[1]]);
  }
  var A = [[0, 0], [0, 0]];
  X.forEach(function (row) {
    for (var j = 0; j < 2; j++) {
      for (var k = 0; k < 2; k++) A[j][k] += row[j] * row[k] / X.length;
    }
  });

  function node(parent, tag, attrs, text) {
    var element = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (key) { element.setAttribute(key, attrs[key]); });
    if (text !== undefined) element.textContent = text;
    parent.appendChild(element);
    return element;
  }
  function label(svg, text, x, y, attrs) {
    var properties = { x: x, y: y, 'text-anchor': 'middle', 'font-size': 16,
      'font-family': 'Arial, Helvetica, sans-serif', fill: '#18332b' };
    Object.keys(attrs || {}).forEach(function (key) { properties[key] = attrs[key]; });
    return node(svg, 'text', properties, text);
  }
  function path(points) {
    return points.map(function (point, i) {
      return (i ? 'L ' : 'M ') + point[0].toFixed(5) + ' ' + point[1].toFixed(5);
    }).join(' ');
  }
  function setup(svg, kind) {
    var width = Math.round(svg.parentElement.clientWidth), size = width - 80;
    svg.replaceChildren();
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + width);
    var sx = kind === 'plane' ? function (x) { return 64 + (x + 2) * size / 6; } : function (x) { return 64 + x * size / 20; };
    var sy = kind === 'plane' ? function (y) { return width - 60 - (y + 2) * size / 6; } : function (y) { return width - 60 - y * size / 1.05; };
    node(svg, 'title', {}, (kind === 'plane' ? 'Coefficient trajectory' : 'Training objective') + ', update ' + index + ' of 20');
    node(svg, 'rect', { width: width, height: width, fill: '#fff' });
    (kind === 'plane' ? [-2, 0, 2, 4] : [0, 10, 20]).forEach(function (value) {
      node(svg, 'line', { x1: sx(value), x2: sx(value), y1: 20, y2: width - 60, stroke: '#d7e2dc' });
      label(svg, value, sx(value), width - 39);
    });
    (kind === 'plane' ? [-2, 0, 2, 4] : [0, 0.5, 1]).forEach(function (value) {
      node(svg, 'line', { x1: 64, x2: width - 16, y1: sy(value), y2: sy(value), stroke: '#d7e2dc' });
      label(svg, value, 56, sy(value) + 5, { 'text-anchor': 'end' });
    });
    node(svg, 'rect', { x: 64, y: 20, width: size, height: size, fill: 'none', stroke: '#18332b' });
    label(svg, kind === 'plane' ? 'β₁' : 'Update t', 64 + size / 2, width - 10);
    label(svg, kind === 'plane' ? 'β₂' : 'J(β)', 17, 20 + size / 2,
      { transform: 'rotate(-90 17 ' + (20 + size / 2) + ')' });
    var clipId = svg.id + '-clip';
    var clip = node(node(svg, 'defs', {}), 'clipPath', { id: clipId });
    node(clip, 'rect', { x: 64, y: 20, width: size, height: size });
    return { sx: sx, sy: sy, plot: node(svg, 'g', { 'clip-path': 'url(#' + clipId + ')' }), overlay: node(svg, 'g', {}) };
  }
  function draw() {
    var axes = setup(plane, 'plane');
    [0.05, 0.2, 0.5, 1].forEach(function (level) {
      var points = [];
      // Completing the square parameterizes the actual quadratic level set.
      // Both contours and iterates use the same sx/sy, including screen-y reversal.
      var a = A[0][0], b = A[0][1], c = A[1][1];
      for (var m = 0; m <= 240; m++) {
        var theta = m * 2 * Math.PI / 240;
        var d2 = Math.sqrt(2 * level / (c - b * b / a)) * Math.sin(theta);
        var d1 = Math.sqrt(2 * level / a) * Math.cos(theta) - b * d2 / a;
        points.push([axes.sx(star[0] + d1), axes.sy(star[1] + d2)]);
      }
      node(axes.plot, 'path', { d: path(points), fill: 'none', stroke: '#8bb9a7', 'stroke-width': 1.5, 'data-level': level });
    });
    var points = history.slice(0, index + 1).map(function (beta) { return [axes.sx(beta[0]), axes.sy(beta[1])]; });
    drawHistory(axes.overlay, points);
    var x = axes.sx(star[0]), y0 = axes.sy(star[1]);
    node(axes.overlay, 'path', { d: 'M ' + (x - 5) + ' ' + (y0 - 5) + ' L ' + (x + 5) + ' ' + (y0 + 5) + ' M ' + (x - 5) + ' ' + (y0 + 5) + ' L ' + (x + 5) + ' ' + (y0 - 5), stroke: '#18332b', 'stroke-width': 2.5 });
    var lossAxes = setup(lossPlot, 'loss');
    drawHistory(lossAxes.overlay, history.slice(0, index + 1).map(function (beta, t) {
      return [lossAxes.sx(t), lossAxes.sy(evaluate(beta).loss)];
    }));
  }
  function drawHistory(plot, points) {
    node(plot, 'path', { d: path(points), fill: 'none', stroke: '#087e62', 'stroke-width': 2.5, 'data-trajectory': '' });
    points.forEach(function (point) { node(plot, 'circle', { cx: point[0], cy: point[1], r: 2, fill: '#087e62' }); });
    node(plot, 'circle', { cx: points[0][0], cy: points[0][1], r: 5, fill: '#fff', stroke: '#18332b', 'stroke-width': 2 });
    var current = points[points.length - 1];
    node(plot, 'circle', { cx: current[0], cy: current[1], r: 5.5, fill: '#d64b1f', stroke: '#fff', 'stroke-width': 1.5 });
  }
  function syncButtons() {
    stepButton.disabled = index === maxSteps;
    playButton.textContent = playing ? 'Pause' : (index === maxSteps ? 'Replay' : 'Play');
    playButton.setAttribute('aria-pressed', String(playing));
  }
  function stop() {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
    playing = false;
    syncButtons();
  }
  function render() {
    var beta = history[index], result = evaluate(beta), g = result.gradient;
    document.getElementById('gd-beta1').textContent = beta[0].toFixed(4);
    document.getElementById('gd-beta2').textContent = beta[1].toFixed(4);
    document.getElementById('gd-objective').textContent = result.loss.toFixed(6);
    document.getElementById('gd-grad1').textContent = g[0].toFixed(4);
    document.getElementById('gd-grad2').textContent = g[1].toFixed(4);
    document.getElementById('gd-distance').textContent = Math.hypot(beta[0] - star[0], beta[1] - star[1]).toFixed(4);
    seek.value = index;
    seek.setAttribute('aria-valuetext', 'Update ' + index + ' of 20');
    document.getElementById('gd-frame').textContent = index + ' / 20';
    status.textContent = 'Update ' + index + ' of 20. ' + (index === 0 ? 'Starting objective is 1.' : 'Objective is ' + result.loss.toFixed(6) + '. The current point is orange.');
    syncButtons();
    draw();
  }
  function tick() {
    timer = null;
    if (!playing) return;
    index++;
    if (index === maxSteps) playing = false;
    render();
    if (playing) timer = window.setTimeout(tick, 650);
  }
  stepButton.addEventListener('click', function () { stop(); if (index < maxSteps) index++; render(); });
  document.getElementById('gd-reset').addEventListener('click', function () { stop(); index = 0; render(); });
  playButton.addEventListener('click', function () {
    if (playing) { stop(); return; }
    if (index === maxSteps) { index = 0; render(); }
    playing = true;
    syncButtons();
    timer = window.setTimeout(tick, 650);
  });
  seek.addEventListener('input', function () { stop(); index = Number(seek.value); render(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
  document.getElementById('gd-fallback').hidden = true;
  document.getElementById('gd-controls').hidden = false;
  live.hidden = false;
  render();
  if (window.ResizeObserver) new ResizeObserver(draw).observe(live);
  else window.addEventListener('resize', draw);
})();
