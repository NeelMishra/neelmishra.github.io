/* Matrix-square perturbation lab. No network or library dependencies. */
(function () {
  'use strict';
  var root = document.getElementById('matrix-lab');
  if (!root) return;
  var step = document.getElementById('matrix-step');
  var direction = document.getElementById('matrix-direction');
  var reset = document.getElementById('matrix-reset');
  var X = [[1, 2], [0, 3]];
  function add(A, B) { return A.map(function (row, i) { return row.map(function (x, j) { return x + B[i][j]; }); }); }
  function scale(A, s) { return A.map(function (row) { return row.map(function (x) { return x * s; }); }); }
  function multiply(A, B) {
    return A.map(function (row) {
      return B[0].map(function (_, j) { return row.reduce(function (sum, x, k) { return sum + x * B[k][j]; }, 0); });
    });
  }
  function norm(A) { return Math.sqrt(A.reduce(function (sum, row) { return sum + row.reduce(function (s, x) { return s + x * x; }, 0); }, 0)); }
  function display(id, value) { document.getElementById(id).textContent = value; }
  function matrixText(A) { return A.map(function (row) { return '[ ' + row.map(function (x) { return x.toFixed(8); }).join('  ') + ' ]'; }).join('\n'); }
  function draw() {
    var epsilon = Math.pow(10, Number(step.value));
    var commuting = direction.value === 'identity';
    var E = commuting ? [[1, 0], [0, 1]] : [[0, 1], [1, 0]];
    var H = scale(E, epsilon);
    var linear = add(multiply(X, H), multiply(H, X));
    var remainder = multiply(H, H);
    // The exact expansion avoids cancellation from subtracting nearby squares.
    var actual = add(linear, remainder);
    var shortcut = scale(multiply(X, H), 2);
    var shortcutResidual = add(add(linear, scale(shortcut, -1)), remainder);
    var error = norm(remainder);
    display('matrix-step-value', String(epsilon));
    step.setAttribute('aria-valuetext', 'Step size ' + epsilon);
    display('matrix-actual', matrixText(actual));
    display('matrix-linear', matrixText(linear));
    display('matrix-shortcut', matrixText(shortcut));
    display('matrix-error', error.toFixed(8));
    display('matrix-scaled-error', (error / epsilon).toFixed(8));
    display('matrix-shortcut-error', (norm(shortcutResidual) / epsilon).toFixed(8));
    display('matrix-status', 'At step ' + epsilon + ', the linearization error is ' + error.toFixed(8) +
      '. Reducing the step tenfold reduces this error 100-fold. ' +
      (commuting ? 'Here XE = EX, so 2XH equals the correct linear prediction; the quadratic remainder still exists.' :
        'Here XE ≠ EX. The shortcut misses a first-order term: its error divided by the step approaches 4, while the correct rule’s approaches 0.'));
  }
  step.disabled = false; direction.disabled = false; reset.disabled = false;
  step.addEventListener('input', draw);
  direction.addEventListener('change', draw);
  reset.addEventListener('click', function () { step.value = '-1'; direction.value = 'swap'; draw(); });
  draw();
}());
