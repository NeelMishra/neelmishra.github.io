/* === Animation Utilities (step-only, no speed/pause controls) === */
(function(){
  /* Backward-compatible stubs — speed is always 1x, no pause */
  window.animPaused = function(){ return false; };
  window.animDelay = function(ms){ return ms; };
  window.animTimeout = function(fn, ms) {
    var entry = { fn: fn, timer: setTimeout(fn, ms) };
    return entry;
  };
  window.animPause = function(){};
  window.animResume = function(){};

  /* Step runner */
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
      if (i < steps.length) timer = animTimeout(next, d);
      else if (onDone) onDone();
    }
    next();
    return { cancel: function() { cancelled = true; if (timer && timer.timer) clearTimeout(timer.timer); } };
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
    ['markerWidth:8','markerHeight:6','refX:8','refY:3','orient:auto','markerUnits:userSpaceOnUse'].forEach(function(a){ var p=a.split(':'); m.setAttribute(p[0],p[1]); });
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('d', 'M0,0 L8,3 L0,6');
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

  /* Auto-inject arrow markers into all animation SVGs */
  document.querySelectorAll('.anim-container svg, .tree-diagram svg').forEach(function(svg){
    addArrowMarker(svg, 'anim-arrow', '#0a8f6a');
    addArrowMarker(svg, 'anim-arrow-warn', '#f59e0b');
    addArrowMarker(svg, 'anim-arrow-brand', 'var(--brand, #6366f1)');
  });

  /* Helper: draw an animated directional arrow between two SVG points */
  window.drawAnimArrow = function(svg, x1, y1, x2, y2, color, id) {
    var NS = 'http://www.w3.org/2000/svg';
    color = color || '#0a8f6a';
    var markerId = color === '#f59e0b' ? 'anim-arrow-warn' : 'anim-arrow';
    addArrowMarker(svg, markerId, color);
    var line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '2.5');
    line.setAttribute('marker-end', 'url(#' + markerId + ')');
    line.setAttribute('opacity', '0');
    if (id) line.id = id;
    line.style.transition = 'opacity 0.3s';
    svg.appendChild(line);
    requestAnimationFrame(function(){ line.setAttribute('opacity', '1'); });
    return line;
  };
})();
