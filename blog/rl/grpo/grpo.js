/* Small calculations for the GRPO reading path. */
(function () {
  'use strict';
  function all(q, root) { return Array.prototype.slice.call((root || document).querySelectorAll(q)); }
  function format(value) { return value.toFixed(3); }
  function run() {
    var article = document.querySelector('article');
    if (window.renderMathInElement && article) {
      window.renderMathInElement(article, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false });
    }
    all('[data-demo]').forEach(function (root) {
      var kind = root.getAttribute('data-demo');
      if (kind !== 'group') return;
      var output = root.querySelector('output'), picker = root.querySelector('[data-group]');
      var patterns = {
        mixed: [1.0, 0.7, 0.2, 0.0],
        easy: [1.0, 1.0, 1.0, 1.0],
        hard: [0.2, 0.1, 0.0, 0.0],
        spread: [1.0, 0.4, -0.2, -0.8]
      };
      function paint() {
        var rewards = patterns[picker.value] || patterns.mixed, mean = rewards.reduce(function (sum, value) { return sum + value; }, 0) / rewards.length;
        var variance = rewards.reduce(function (sum, value) { return sum + Math.pow(value - mean, 2); }, 0) / rewards.length;
        var std = Math.sqrt(variance), denominator = std + 1e-8;
        var advantages = rewards.map(function (value) { return (value - mean) / denominator; });
        all('[data-reward-bar]', root).forEach(function (bar, index) {
          var value = rewards[index], min = Math.min.apply(null, rewards), max = Math.max.apply(null, rewards), width = max === min ? 0 : (value - min) / (max - min) * 100;
          bar.style.width = Math.max(0, width) + '%';
        });
        all('[data-reward-value]', root).forEach(function (value, index) { value.textContent = rewards[index].toFixed(1); });
        if (std < 1e-7) {
          output.textContent = 'Mean = ' + format(mean) + '; standard deviation = 0.000; all four normalized advantages are 0.000. This group has no relative signal.';
        } else {
          output.textContent = 'Mean = ' + format(mean) + '; standard deviation = ' + format(std) + '; advantages = ' + advantages.map(function (value) { return (value >= 0 ? '+' : '') + format(value); }).join(', ') + '.';
        }
      }
      all('.grpo-interactive', root).forEach(function (interactive) { interactive.hidden = false; });
      picker.addEventListener('input', paint); picker.addEventListener('change', paint); paint();
    });
    var body = document.querySelector('.blog-sidebar-body');
    if (body && !body.parentNode.classList.contains('grpo-mobile-nav')) {
      var details = document.createElement('details'), summary = document.createElement('summary'), mq = window.matchMedia('(max-width: 1000px)'), mobileOpen = false;
      details.className = 'grpo-mobile-nav'; summary.textContent = 'Browse chapters and contents'; var parent = body.parentNode; parent.insertBefore(details, body); details.appendChild(summary); details.appendChild(body); details.open = !mq.matches;
      details.addEventListener('toggle', function () { if (mq.matches) mobileOpen = details.open; });
      if (mq.addEventListener) mq.addEventListener('change', function () { details.open = !mq.matches || mobileOpen; });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
}());
