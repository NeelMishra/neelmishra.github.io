/* Enhance the complete static explanation with a keyboard-accessible zoom sequence. */
(function () {
  'use strict';
  document.querySelectorAll('.tf-map[data-map-start]').forEach(function (map) {
    var panels = Array.prototype.slice.call(map.querySelectorAll('.tf-map-panel'));
    var buttons = Array.prototype.slice.call(map.querySelectorAll('[data-map-step]'));
    var container = map.querySelector('.tf-map-panels');
    var previous = map.querySelector('[data-map-back]');
    var next = map.querySelector('[data-map-next]');
    var progress = map.querySelector('.tf-map-progress');
    var current = Number(map.getAttribute('data-map-start')) || 0;
    var labels = ['Open the stack →', 'Open one block →', 'Open attention →', 'Back to the block ↑'];
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var animationTimer;

    function selectStep(index, animate) {
      if (index < 0 || index >= panels.length) return;
      clearTimeout(animationTimer);
      var oldHeight = container.getBoundingClientRect().height;
      current = index;
      panels.forEach(function (panel, i) {
        panel.hidden = i !== current;
        panel.classList.remove('is-entering');
      });
      buttons.forEach(function (button, i) { button.setAttribute('aria-pressed', String(i === current)); });
      previous.disabled = current === 0;
      next.textContent = labels[current];
      progress.textContent = 'View ' + (current + 1) + ' of ' + panels.length;
      if (animate && !reduceMotion.matches) {
        container.style.height = oldHeight + 'px';
        void container.offsetHeight;
        container.style.height = panels[current].getBoundingClientRect().height + 'px';
        panels[current].classList.add('is-entering');
        animationTimer = setTimeout(function () {
          container.style.height = '';
          panels[current].classList.remove('is-entering');
        }, 300);
      } else {
        container.style.height = '';
      }
    }

    buttons.forEach(function (button, i) {
      button.addEventListener('click', function () { selectStep(i, true); });
      button.addEventListener('keydown', function (event) {
        var destination;
        if (event.key === 'ArrowRight') destination = (i + 1) % buttons.length;
        if (event.key === 'ArrowLeft') destination = (i + buttons.length - 1) % buttons.length;
        if (event.key === 'Home') destination = 0;
        if (event.key === 'End') destination = buttons.length - 1;
        if (destination === undefined) return;
        event.preventDefault();
        buttons[destination].focus();
        selectStep(destination, true);
      });
    });
    function moveFromFooter(index) {
      selectStep(index, true);
      /* Keep the start of a newly opened diagram visible, including on phones. */
      map.querySelector('.tf-map-controls').scrollIntoView({block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth'});
      buttons[index].focus({preventScroll: true});
    }
    previous.addEventListener('click', function () { moveFromFooter(current - 1); });
    next.addEventListener('click', function () { moveFromFooter(current === panels.length - 1 ? 2 : current + 1); });
    window.addEventListener('resize', function () { clearTimeout(animationTimer); container.style.height = ''; });
    map.classList.add('is-enhanced');
    map.querySelector('.tf-map-controls').hidden = false;
    map.querySelector('.tf-map-footer').hidden = false;
    selectStep(current, false);
  });
})();
