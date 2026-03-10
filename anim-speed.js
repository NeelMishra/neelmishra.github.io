/* === Global Animation Speed Controller === */
(function(){
  var speed = 1;
  window.animDelay = function(ms){ return Math.round(ms * speed); };

  /* Step runner — reads current speed before EACH step, so mid-animation changes work */
  window.animRunner = function(steps, baseDelay, onDone) {
    var i = 0, timer = null, cancelled = false;
    function next() {
      if (cancelled) return;
      if (i >= steps.length) { if (onDone) onDone(); return; }
      var step = steps[i];
      if (typeof step === 'function') step();
      else if (step && step.fn) step.fn();
      i++;
      var d = (step && step.delay != null) ? step.delay : baseDelay;
      if (i < steps.length) timer = setTimeout(next, animDelay(d));
      else if (onDone) onDone();
    }
    next();
    return { cancel: function() { cancelled = true; if (timer) clearTimeout(timer); } };
  };

  /* SVG arrow marker */
  window.addArrowMarker = function(svg, id, color) {
    id = id || 'anim-arrow'; color = color || '#0a8f6a';
    if (svg.querySelector('#' + id)) return;
    var NS = 'http://www.w3.org/2000/svg';
    var defs = svg.querySelector('defs');
    if (!defs) { defs = document.createElementNS(NS, 'defs'); svg.insertBefore(defs, svg.firstChild); }
    var m = document.createElementNS(NS, 'marker');
    m.id = id;
    ['markerWidth:10','markerHeight:7','refX:10','refY:3.5','orient:auto'].forEach(function(a){ var p=a.split(':'); m.setAttribute(p[0],p[1]); });
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('d', 'M0,0 L10,3.5 L0,7 L2.5,3.5 Z');
    path.setAttribute('fill', color);
    m.appendChild(path); defs.appendChild(m);
  };

  /* Data structure panel renderer */
  window.renderDSPanel = function(el, title, items, opts) {
    opts = opts || {};
    var h = '<div style="border:1px solid var(--line,#d9cfba);border-radius:8px;padding:0.5rem;background:var(--card,#fffdf9);min-width:150px">';
    h += '<div style="font-weight:700;font-size:0.76rem;color:var(--ink-muted);margin-bottom:0.3rem">' + title + '</div>';
    if (!items.length) h += '<div style="color:var(--ink-muted);font-style:italic;font-size:0.76rem">(empty)</div>';
    var order = opts.reverse ? items.slice().reverse() : items;
    order.forEach(function(item, idx) {
      var isHl = opts.reverse ? (idx === 0) : (idx === items.length - 1);
      var bg = isHl ? (opts.hlColor || '#0a8f6a') : '#e8f5ee';
      var fg = isHl ? '#fff' : '#13201a';
      h += '<div style="background:' + bg + ';color:' + fg + ';padding:0.2rem 0.5rem;border-radius:4px;margin-bottom:2px;font-size:0.76rem;transition:all 0.2s">' + item + '</div>';
    });
    h += '</div>'; el.innerHTML = h;
  };

  // Inject speed bar
  var bar = document.createElement('div');
  bar.className = 'speed-bar';
  bar.innerHTML =
    '<label class="speed-label">\u23F1 Speed</label>' +
    '<button class="speed-btn" data-speed="0.25">4\u00D7</button>' +
    '<button class="speed-btn" data-speed="0.5">2\u00D7</button>' +
    '<button class="speed-btn active" data-speed="1">1\u00D7</button>' +
    '<button class="speed-btn" data-speed="2">0.5\u00D7</button>' +
    '<button class="speed-btn" data-speed="3">0.3\u00D7</button>';
  var first = document.querySelector('.anim-container');
  if (first) first.parentNode.insertBefore(bar, first);
  bar.addEventListener('click', function(e){
    var btn = e.target.closest('.speed-btn');
    if (!btn) return;
    speed = parseFloat(btn.dataset.speed);
    bar.querySelectorAll('.speed-btn').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
  });
})();
