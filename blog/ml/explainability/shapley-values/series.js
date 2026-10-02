(function () {
  'use strict';
  var root = document.getElementById('order-demo');
  if (!root) return;
  var views = {
    ab: {steps: [['Start: 0', 'Nobody has joined.'], ['A adds 7,500', 'Team value becomes 7,500.'], ['B adds 2,500', 'Team value becomes 10,000.']], status: 'This order gives A 7,500 and B 2,500. Each order distributes the same 10,000.'},
    ba: {steps: [['Start: 0', 'Nobody has joined.'], ['B adds 5,000', 'Team value becomes 5,000.'], ['A adds 5,000', 'Team value becomes 10,000.']], status: 'This order gives A 5,000 and B 5,000. Averaging both orders gives A 6,250 and B 3,750.'}
  };
  root.querySelectorAll('[data-order]').forEach(function (button) {
    button.addEventListener('click', function () {
      var view = views[button.dataset.order];
      var steps = root.querySelector('[data-order-steps]');
      steps.textContent = '';
      view.steps.forEach(function (step) {
        var box = document.createElement('div');
        var strong = document.createElement('strong');
        var span = document.createElement('span');
        strong.textContent = step[0]; span.textContent = step[1];
        box.appendChild(strong); box.appendChild(span); steps.appendChild(box);
      });
      root.querySelector('[data-order-status]').textContent = view.status;
      root.querySelectorAll('[data-order]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === button));
      });
    });
  });
})();
