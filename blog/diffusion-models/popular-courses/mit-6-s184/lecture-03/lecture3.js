(function () {
  'use strict';
  var timeInput = document.getElementById('l3-time');
  var noiseInput = document.getElementById('l3-noise');
  var dataInput = document.getElementById('l3-data');
  var svg = document.getElementById('l3-svg');
  if (!timeInput || !noiseInput || !dataInput || !svg) return;

  function element(tag, attributes, content) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attributes).forEach(function (key) {
      node.setAttribute(key, attributes[key]);
    });
    if (content !== undefined) node.textContent = content;
    svg.appendChild(node);
    return node;
  }

  function label(x, y, content, color, anchor) {
    element('text', {
      x: x, y: y, fill: color || '#53665a',
      'font-family': 'Manrope, sans-serif', 'font-size': 13,
      'text-anchor': anchor || 'middle'
    }, content);
  }

  function render() {
    var t = Number(timeInput.value);
    var epsilon = Number(noiseInput.value);
    var z = Number(dataInput.value);
    var x = (1 - t) * epsilon + t * z;
    var velocity = z - epsilon;
    var mapTime = function (v) { return 65 + 350 * v; };
    var mapPosition = function (v) { return 120 - 26 * v; };

    svg.replaceChildren();
    element('title', {}, 'A training point moving along a straight line');
    element('desc', {}, 'Horizontal axis: time from zero to one. Vertical axis: position from minus three to three. The current input is ' + x.toFixed(2) + ' and the velocity label is ' + velocity.toFixed(2) + '.');
    label(12, 18, 'position', '#53665a', 'start');
    [-3, -2, -1, 0, 1, 2, 3].forEach(function (value) {
      var y = mapPosition(value);
      element('line', { x1: 65, y1: y, x2: 415, y2: y, stroke: '#dce2dc', 'stroke-width': 1 });
      label(48, y + 4, String(value), '#53665a', 'end');
    });
    element('line', { x1: 65, y1: 210, x2: 415, y2: 210, stroke: '#88988c' });
    [0, 0.5, 1].forEach(function (value) { label(mapTime(value), 229, String(value)); });
    label(457, 229, 'time t');
    element('line', {
      id: 'l3-pair-path', x1: mapTime(0), y1: mapPosition(epsilon),
      x2: mapTime(1), y2: mapPosition(z), stroke: '#899a8b', 'stroke-width': 3
    });
    element('line', {
      x1: mapTime(t), y1: mapPosition(x), x2: mapTime(t), y2: 210,
      stroke: '#0a8f6a', 'stroke-width': 1.5, 'stroke-dasharray': '4 4'
    });
    element('circle', { cx: mapTime(0), cy: mapPosition(epsilon), r: 7, fill: '#3a7bd5' });
    element('circle', { cx: mapTime(1), cy: mapPosition(z), r: 7, fill: '#c98a2b' });
    element('circle', { id: 'l3-current-point', cx: mapTime(t), cy: mapPosition(x), r: 5, fill: '#0a8f6a', stroke: '#fff', 'stroke-width': 1.5 });

    document.getElementById('l3-time-value').textContent = t.toFixed(2);
    document.getElementById('l3-noise-value').textContent = epsilon.toFixed(1);
    document.getElementById('l3-data-value').textContent = z.toFixed(1);
    document.getElementById('l3-x').textContent = 'Current input: ' + x.toFixed(2);
    document.getElementById('l3-u').textContent = 'Target velocity: ' + velocity.toFixed(2);
    document.getElementById('l3-status').textContent =
      (t === 0 ? 'At time 0, the input is the starting noise. ' :
        t === 1 ? 'At time 1, the input is the data endpoint. ' :
          'Changing time moves the green point along this fixed line. ') +
      'The label stays ' + velocity.toFixed(2) + ' while noise and data stay fixed.';
  }

  [timeInput, noiseInput, dataInput].forEach(function (input) {
    input.addEventListener('input', render);
  });
  render();
})();
