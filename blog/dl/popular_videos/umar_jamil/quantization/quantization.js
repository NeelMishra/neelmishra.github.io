(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  function roundEven(value) {
    var lower = Math.floor(value);
    var fraction = value - lower;
    if (fraction < 0.5) return lower;
    if (fraction > 0.5) return lower + 1;
    return lower % 2 === 0 ? lower : lower + 1;
  }

  function clip(value, lower, upper) {
    return Math.max(lower, Math.min(upper, value));
  }

  function format(value, digits) {
    digits = digits == null ? 6 : digits;
    if (!isFinite(value)) throw new Error('The quantization example produced a non-finite value.');
    var text = value.toFixed(digits);
    if (Number(text) === 0) return '0';
    return text.replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
  }

  function quantize(values, bits, symmetric, lower, upper) {
    if (bits < 2 || bits > 8 || bits !== Math.floor(bits)) {
      throw new Error('The grid example requires a bit width between 2 and 8.');
    }
    var qmax = symmetric ? Math.pow(2, bits - 1) - 1 : Math.pow(2, bits) - 1;
    var qmin = symmetric ? -qmax : 0;
    var magnitude = Math.max(Math.abs(lower), Math.abs(upper));
    var scale = symmetric ? magnitude / qmax : (upper - lower) / qmax;
    if (!(scale > 0) || !isFinite(scale)) throw new Error('The grid needs a positive, finite scale.');
    var zero = symmetric ? 0 : clip(roundEven(-lower / scale), qmin, qmax);
    var codes = [], restored = [], squaredError = 0, saturated = 0;
    values.forEach(function (value) {
      var raw = roundEven(value / scale) + zero;
      var code = clip(raw, qmin, qmax);
      var reconstructed = scale * (code - zero);
      if (raw !== code) saturated++;
      codes.push(code);
      restored.push(reconstructed);
      squaredError += Math.pow(value - reconstructed, 2);
    });
    return {
      scale: scale, zero: zero, qmin: qmin, qmax: qmax,
      codes: codes, restored: restored, mse: squaredError / values.length,
      saturated: saturated
    };
  }

  function node(svg, tag, attrs, text) {
    var element = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (key) { element.setAttribute(key, attrs[key]); });
    if (text != null) element.textContent = text;
    svg.appendChild(element);
    return element;
  }

  function prepareSvg(svg, title, description) {
    svg.textContent = '';
    node(svg, 'title', { id: svg.id + '-title' }, title);
    node(svg, 'desc', { id: svg.id + '-desc' }, description);
  }

  function label(svg, x, y, text, color, anchor) {
    return node(svg, 'text', {
      x: x, y: y, fill: color || 'var(--ink)', 'font-size': 14,
      'text-anchor': anchor || 'middle'
    }, text);
  }

  function rows(tbody, values) {
    tbody.textContent = '';
    values.forEach(function (items) {
      var row = document.createElement('tr');
      items.forEach(function (item) {
        var cell = document.createElement('td');
        cell.textContent = item;
        row.appendChild(cell);
      });
      tbody.appendChild(row);
    });
  }

  function setResult(root, result) {
    root.setAttribute('data-result', JSON.stringify(result));
  }

  (function gridLab() {
    var root = document.getElementById('q-grid-lab');
    var bitsInput = document.getElementById('q-grid-bits');
    var scheme = document.getElementById('q-grid-scheme');
    var dataset = document.getElementById('q-grid-dataset');
    var svg = document.getElementById('q-grid-svg');
    var presets = {
      skewed: { lower: -1, upper: 2, values: [-1, -0.73, 0, 0.86, 1.72, 2] },
      positive: { lower: 0, upper: 2, values: [0, 0.17, 0.42, 0.86, 1.72, 2] },
      clipped: { lower: -1, upper: 1, values: [-2, -0.73, 0, 0.86, 1.72, 2] }
    };

    function draw(preset, result) {
      prepareSvg(svg, 'Original values and the reconstruction grid',
        'Circles are original values. Squares are reconstructed values. Lines connect each pair.');
      var gridLower = result.scale * (result.qmin - result.zero);
      var gridUpper = result.scale * (result.qmax - result.zero);
      var lower = Math.min(gridLower, Math.min.apply(null, preset.values));
      var upper = Math.max(gridUpper, Math.max.apply(null, preset.values));
      var padding = (upper - lower) * 0.08;
      lower -= padding;
      upper += padding;
      function x(value) { return 38 + 564 * (value - lower) / (upper - lower); }
      label(svg, 38, 25, 'Original circles', 'var(--brand-2)', 'start');
      label(svg, 38, 185, 'Reconstructed squares on the grid', 'var(--brand)', 'start');
      node(svg, 'line', { x1: 38, y1: 128, x2: 602, y2: 128, stroke: 'var(--line)' });
      for (var code = result.qmin; code <= result.qmax; code++) {
        var position = x(result.scale * (code - result.zero));
        node(svg, 'line', {
          x1: position, y1: 112, x2: position, y2: 144,
          stroke: code === result.zero ? 'var(--brand)' : 'var(--line)',
          'stroke-width': code === result.zero ? 2 : 1
        });
      }
      label(svg, x(gridLower), 162, format(gridLower, 3));
      label(svg, x(gridUpper), 162, format(gridUpper, 3));
      if (result.zero > result.qmin && result.zero < result.qmax) {
        label(svg, x(0), 162, '0', 'var(--brand)');
      }
      preset.values.forEach(function (value, index) {
        var originalX = x(value), restoredX = x(result.restored[index]);
        node(svg, 'line', {
          x1: originalX, y1: 60, x2: restoredX, y2: 128,
          stroke: 'var(--ink-muted)', 'stroke-dasharray': '3 3'
        });
        node(svg, 'circle', { cx: originalX, cy: 60, r: 5, fill: 'var(--brand-2)' });
        node(svg, 'rect', { x: restoredX - 4, y: 124, width: 8, height: 8, fill: 'var(--brand)' });
      });
    }

    function render() {
      var preset = presets[dataset.value];
      var bits = Number(bitsInput.value);
      var result = quantize(preset.values, bits, scheme.value === 'symmetric', preset.lower, preset.upper);
      document.getElementById('q-grid-bits-value').textContent = bits;
      document.getElementById('q-grid-scale').textContent = format(result.scale);
      document.getElementById('q-grid-zero').textContent = result.zero;
      document.getElementById('q-grid-codes').textContent = result.qmin + ' to ' + result.qmax;
      document.getElementById('q-grid-mse').textContent = format(result.mse);
      rows(root.querySelector('tbody'), preset.values.map(function (value, index) {
        return [format(value), result.codes[index], format(result.restored[index]),
          format(Math.abs(result.restored[index] - value))];
      }));
      root.querySelector('.q-status').textContent =
        (result.qmax - result.qmin + 1) + ' codes; ' + result.saturated +
        ' sample codes saturated. ' + (scheme.value === 'symmetric' ?
          'The real grid is centered on zero; one signed storage code is reserved.' :
          'Real zero is represented by code ' + result.zero + ', not necessarily code 0.');
      result.values = preset.values;
      result.bits = bits;
      setResult(root, result);
      draw(preset, result);
    }
    bitsInput.addEventListener('input', render);
    scheme.addEventListener('change', render);
    dataset.addEventListener('change', render);
    render();
  })();

  (function outlierLab() {
    var root = document.getElementById('q-outlier-lab');
    var input = document.getElementById('q-outlier-value');
    var bulk = [];
    for (var index = 0; index < 9999; index++) bulk.push(-50 + 200 * index / 9998);

    function percentile(sorted, fraction) {
      var position = (sorted.length - 1) * fraction;
      var lower = Math.floor(position), upper = Math.ceil(position);
      return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
    }

    function render() {
      var outlier = Number(input.value);
      var population = bulk.concat([outlier]);
      var lower = percentile(population, 0.0001);
      var upper = percentile(population, 0.9999);
      var minmax = quantize(population, 8, false, -50, outlier);
      var clipped = quantize(population, 8, false, lower, upper);
      function bulkMse(result) {
        var sum = 0;
        for (var i = 0; i < bulk.length; i++) sum += Math.pow(bulk[i] - result.restored[i], 2);
        return sum / bulk.length;
      }
      minmax.bulk_mse = bulkMse(minmax);
      clipped.bulk_mse = bulkMse(clipped);
      document.getElementById('q-outlier-value-label').textContent = format(outlier, 0);
      rows(root.querySelector('tbody'), [
        ['Min-max', '-50 to ' + format(outlier), format(minmax.scale),
          format(minmax.bulk_mse), format(minmax.mse)],
        ['0.01 / 99.99 percentiles', format(lower) + ' to ' + format(upper),
          format(clipped.scale), format(clipped.bulk_mse), format(clipped.mse)]
      ]);
      var minmaxFraction = 200 / (outlier + 50);
      var percentileFraction = Math.min(1, 200 / (upper - lower));
      document.getElementById('q-minmax-coverage').style.width = 100 * minmaxFraction + '%';
      document.getElementById('q-percentile-coverage').style.width = 100 * percentileFraction + '%';
      document.getElementById('q-minmax-coverage-label').textContent = format(100 * minmaxFraction, 2) + '%';
      document.getElementById('q-percentile-coverage-label').textContent =
        format(100 * percentileFraction, 2) + '%';
      root.querySelector('.q-status').textContent =
        'Bulk MSE excludes only the last, injected value. Whole-tensor MSE includes all 10,000 values. ' +
        (clipped.bulk_mse < minmax.bulk_mse ?
          'Percentile bulk MSE is lower. ' : 'Percentile bulk MSE is not lower. ') +
        (clipped.mse > minmax.mse ?
          'Its whole-tensor MSE is higher.' : 'Its whole-tensor MSE is not higher.');
      setResult(root, {
        outlier: outlier, count: population.length,
        minmax: { scale: minmax.scale, bulk_mse: minmax.bulk_mse, all_mse: minmax.mse },
        percentile: { scale: clipped.scale, lower: lower, upper: upper,
          bulk_mse: clipped.bulk_mse, all_mse: clipped.mse }
      });
    }
    input.addEventListener('input', render);
    render();
  })();

  (function macLab() {
    var root = document.getElementById('q-mac-lab');
    var svg = document.getElementById('q-mac-svg');
    var slider = document.getElementById('q-mac-step');
    var play = document.getElementById('q-mac-play');
    var next = document.getElementById('q-mac-next');
    var runner = null, playing = false, current = 0, interacted = false, observer = null;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var products = [(5 - 3) * (-5 - 0), (9 - 3) * (10 - 0)];
    var bias = roundEven(0.1 / (0.2 * 0.1));
    var descriptions = [
      'Load activation codes [5, 9] and weight codes [-5, 10]. Initialize the accumulator with bias code 5.',
      'Subtract zero points: activation codes become [2, 6]; weight codes stay [-5, 10].',
      'First MAC: 5 + 2 times -5 = -5. The accumulator is signed and wider than the inputs.',
      'Second MAC: -5 + 6 times 10 = 55. Its real-number scale is 0.2 times 0.1 = 0.02.',
      'Requantize: round((0.02 / 0.1) times 55) + 7 = 18. This example does not saturate.',
      'Dequantize the output: 0.1 times (18 - 7) = 1.1, matching the floating-point layer output.'
    ];

    function box(x, y, width, title, value, active) {
      node(svg, 'rect', {
        x: x, y: y, width: width, height: 66, rx: 8,
        fill: 'var(--card)', stroke: active ? 'var(--brand)' : 'var(--line)',
        'stroke-width': active ? 2.5 : 1
      });
      label(svg, x + width / 2, y + 23, title, 'var(--ink-muted)');
      label(svg, x + width / 2, y + 47, value, active ? 'var(--brand)' : 'var(--ink)');
    }

    function render(step) {
      current = step;
      slider.value = step;
      next.disabled = step === 5;
      document.getElementById('q-mac-step-label').textContent = step + ' / 5';
      var accumulator = bias;
      if (step >= 2) accumulator += products[0];
      if (step >= 3) accumulator += products[1];
      var output = step >= 4 ? roundEven((0.2 * 0.1 / 0.1) * accumulator) + 7 : null;
      var restored = step === 5 ? 0.1 * (output - 7) : null;
      root.querySelector('.q-status').textContent = descriptions[step];
      setResult(root, { step: step, accumulator: accumulator, output_code: output, restored: restored });
      prepareSvg(svg, 'A two-term integer multiply-accumulate',
        descriptions[step] + ' Operands are centered, products accumulate in INT32, and the result is rescaled.');
      box(16, 38, 176, 'Stored codes', 'x: [5, 9]; w: [-5, 10]', step === 0);
      box(232, 38, 160, 'Centered operands', step > 0 ? '[2, 6] and [-5, 10]' : 'Subtract z first', step === 1);
      box(432, 38, 184, 'INT32 accumulator', String(accumulator), step === 2 || step === 3);
      box(340, 151, 276, 'Output grid: s = 0.1, z = 7',
        output == null ? 'Not yet requantized' : 'q = ' + output +
          (restored == null ? '' : '; real value = ' + format(restored)), step >= 4);
      label(svg, 20, 172, 'Bias code: ' + bias, 'var(--ink-muted)', 'start');
      label(svg, 20, 199, 'Accumulator scale: 0.02', 'var(--ink-muted)', 'start');
      window.addArrowMarker(svg, 'anim-arrow', 'var(--brand)');
      window.drawAnimArrow(svg, 192, 71, 232, 71, 'var(--brand)');
      window.drawAnimArrow(svg, 392, 71, 432, 71, 'var(--brand)');
      window.drawAnimArrow(svg, 524, 104, 524, 151, 'var(--brand)');
    }

    function stop() {
      if (runner) runner.cancel();
      runner = null;
      playing = false;
      play.disabled = false;
    }

    function manual() {
      interacted = true;
      if (observer) observer.disconnect();
      stop();
    }

    function start() {
      stop();
      if (reducedMotion) {
        render(5);
        return;
      }
      var steps = [], first = current === 5 ? 1 : current + 1;
      for (var step = first; step <= 5; step++) {
        (function (index) { steps.push(function () { render(index); }); })(step);
      }
      playing = true;
      play.disabled = true;
      var playback = window.animRunner(steps, 800, function () {
        playing = false;
        runner = null;
        play.disabled = false;
      });
      runner = playing ? playback : null;
    }
    slider.addEventListener('input', function () { manual(); render(Number(slider.value)); });
    next.addEventListener('click', function () { manual(); render(Math.min(5, current + 1)); });
    play.addEventListener('click', function () { manual(); start(); });
    document.getElementById('q-mac-reset').addEventListener('click', function () { manual(); render(0); });
    render(0);
    if (!reducedMotion && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !interacted) {
          observer.disconnect();
          start();
        }
      }, { threshold: 0.35 });
      observer.observe(root);
    }
  })();

  (function steLab() {
    var root = document.getElementById('q-ste-lab');
    var input = document.getElementById('q-ste-value');
    var svg = document.getElementById('q-ste-svg');
    function x(value) { return 44 + (value + 1.5) / 3 * 552; }
    function y(value) { return 216 - (value + 1.5) / 3 * 184; }

    function render() {
      var value = Number(input.value);
      var code = clip(roundEven(value / 0.25), -4, 4);
      var restored = code * 0.25;
      var gradient = value >= -1 && value <= 1 ? 1 : 0;
      document.getElementById('q-ste-value-label').textContent = format(value, 3);
      document.getElementById('q-ste-forward').textContent = format(restored, 2);
      document.getElementById('q-ste-gradient').textContent = gradient;
      root.querySelector('.q-status').textContent = gradient ?
        'Inside the clipping interval: this illustrative STE passes an incoming gradient of 1 through. The forward value still rounds.' :
        'Outside the clipping interval: the forward value saturates, and this illustrative clipped STE passes gradient 0.';
      setResult(root, { x: value, code: code, restored: restored, ste_gradient: gradient });
      prepareSvg(svg, 'Fake quantization forward values and the clipped STE',
        'The staircase is the forward function. The shaded interval from minus one to one passes gradients in this illustrative clipped estimator.');
      node(svg, 'rect', { x: x(-1), y: 24, width: x(1) - x(-1), height: 198,
        fill: 'var(--brand)', opacity: 0.07 });
      node(svg, 'line', { x1: 44, y1: y(0), x2: 596, y2: y(0), stroke: 'var(--line)' });
      node(svg, 'line', { x1: x(0), y1: 24, x2: x(0), y2: 222, stroke: 'var(--line)' });
      node(svg, 'line', { x1: x(-1.5), y1: y(-1.5), x2: x(1.5), y2: y(1.5),
        stroke: 'var(--ink-muted)', 'stroke-dasharray': '4 4' });
      var points = [x(-1.5) + ',' + y(-1)];
      for (var level = -4; level < 4; level++) {
        var boundary = (level + 0.5) * 0.25;
        points.push(x(boundary) + ',' + y(level * 0.25));
        points.push(x(boundary) + ',' + y((level + 1) * 0.25));
      }
      points.push(x(1.5) + ',' + y(1));
      node(svg, 'polyline', { points: points.join(' '), fill: 'none', stroke: 'var(--brand)', 'stroke-width': 2.5 });
      node(svg, 'line', { x1: x(value), y1: y(value), x2: x(value), y2: y(restored),
        stroke: 'var(--brand-2)', 'stroke-width': 2 });
      node(svg, 'circle', { cx: x(value), cy: y(value), r: 5, fill: 'var(--brand-2)' });
      node(svg, 'rect', { x: x(value) - 4, y: y(restored) - 4, width: 8, height: 8, fill: 'var(--brand)' });
      [-1, 0, 1].forEach(function (tick) { label(svg, x(tick), 245, String(tick)); });
      label(svg, 44, 16, 'Forward F(x)', 'var(--brand)', 'start');
      label(svg, 596, 245, 'Master x', 'var(--ink-muted)', 'end');
    }
    input.addEventListener('input', render);
    render();
  })();

  window.BlogQuiz.create('q-lesson-quiz', {
    title: 'Check the lesson',
    intro: 'Eight questions about the calculations and workflows above. Each answer includes an explanation.',
    promptLabel: '',
    bank: [
      {
        meaning: 'With scale 0.2 and zero point 5, which integer code represents real zero?',
        answer: '5',
        explain: 'Dequantization gives 0.2 times (5 - 5) = 0. Literal code 0 would represent -1.',
        distractors: [
          { text: '0', why: 'Code zero is not necessarily real zero in an asymmetric quantizer.' },
          { text: '0.2', why: 'That is the scale, not an integer zero point.' },
          { text: '-5', why: 'The reconstruction subtracts the zero point; it does not negate the stored code.' }
        ]
      },
      {
        meaning: 'For the unsigned four-bit range [-1, 2], why is the scale 3 / 15 rather than 3 / 16?',
        answer: 'Sixteen codes have fifteen gaps between their endpoints.',
        explain: 'Codes 0 through 15 contain sixteen values, but the endpoint distance spans fifteen steps.',
        distractors: [
          { text: 'One code is always reserved for padding.', why: 'Asymmetric quantization does not reserve a code this way.' },
          { text: 'Four bits store only fifteen patterns.', why: 'Four bits store sixteen patterns.' },
          { text: 'The zero point uses one of the bits.', why: 'The zero point is separate metadata, not a bit taken from each code.' }
        ]
      },
      {
        meaning: 'Why do INT8 multiply-accumulate operations commonly use an INT32 accumulator?',
        answer: 'A sum of many products needs a wider numerical range.',
        explain: 'Eight-bit operand storage does not provide enough range for the running sum.',
        distractors: [
          { text: 'All activations must be stored in INT32.', why: 'Operand storage and accumulator width are different choices.' },
          { text: 'INT32 removes all quantization error.', why: 'A wider accumulator does not restore information lost when quantizing inputs.' },
          { text: 'The output zero point is always 32.', why: 'A zero point is chosen from a grid, not from the accumulator bit width.' }
        ]
      },
      {
        meaning: 'A percentile range lowers bulk MSE but raises whole-tensor MSE. What explains the difference?',
        answer: 'The excluded outlier has a large clipping error when included.',
        explain: 'Better resolution for ordinary values can trade against a much larger error on the tail.',
        distractors: [
          { text: 'MSE ignores clipped values by definition.', why: 'MSE includes every value in the population being measured.' },
          { text: 'Percentile quantization is always lossless.', why: 'It still rounds and can also clip values.' },
          { text: 'The tensor automatically changes dtype during evaluation.', why: 'The discrepancy comes from which values the MSE includes.' }
        ]
      },
      {
        meaning: 'Does static PTQ calibration need target labels?',
        answer: 'No; it collects activation statistics with forward passes.',
        explain: 'Calibration does not calculate a supervised training loss or update model weights.',
        distractors: [
          { text: 'Yes; observers backpropagate classification loss.', why: 'Observers collect statistics, not loss gradients.' },
          { text: 'Yes; calibration retrains every weight.', why: 'That is not the PTQ calibration stage.' },
          { text: 'No; it never runs the model.', why: 'Activation calibration must run representative inputs through the model.' }
        ]
      },
      {
        meaning: 'Which values does the optimizer update during QAT in this lesson?',
        answer: 'Floating-point master weights, using quantized forward values.',
        explain: 'Fake quantization simulates the grid while keeping trainable parameters floating point.',
        distractors: [
          { text: 'Only the deployed INT8 codes.', why: 'The training graph retains floating-point master parameters.' },
          { text: 'Only target labels.', why: 'Labels provide supervision; they are not trainable model parameters.' },
          { text: 'Nothing; QAT has no backward pass.', why: 'QAT is training and uses loss gradients.' }
        ]
      },
      {
        meaning: 'Is the STE the exact mathematical derivative of rounding?',
        answer: 'No; it is a surrogate gradient used for training.',
        explain: 'Rounding is flat within bins and discontinuous at their boundaries.',
        distractors: [
          { text: 'Yes; rounding has derivative one everywhere.', why: 'Its true derivative is zero inside bins and undefined at jumps.' },
          { text: 'Yes; clipping makes rounding smooth.', why: 'Clipping does not remove the staircase discontinuities.' },
          { text: 'No; it is a method for choosing the activation percentile.', why: 'The STE concerns backward gradients, not range selection.' }
        ]
      },
      {
        meaning: 'For Linear weights shaped [out_features, in_features], which axis identifies output channels?',
        answer: 'Axis 0: one weight scale per output row.',
        explain: 'Each row supplies the weights for one output dot product.',
        distractors: [
          { text: 'Axis 1: one output channel per input column.', why: 'Columns identify input features in this weight layout.' },
          { text: 'The batch axis of the input images.', why: 'That axis belongs to activations, not the weight tensor.' },
          { text: 'No axis; per-channel quantization always shares one scale.', why: 'Sharing one scale for the entire tensor is per-tensor quantization.' }
        ]
      }
    ]
  });
})();
