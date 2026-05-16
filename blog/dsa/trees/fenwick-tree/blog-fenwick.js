/* ============================================================
 * blog-fenwick.js — shared helpers for the Fenwick Tree blog
 * series.  Tiny vanilla ES5 IIFE.  Loaded after anim-speed.js.
 *
 *   FenwickAnim.attachSVG(wrapEl)
 *     Ensure wrapEl contains a sibling <svg class="bit-anim-svg">
 *     immediately after its .bit-array, sized to overlay it.
 *     Returns the SVG element.
 *
 *   FenwickAnim.cellRect(arrayEl, oneBasedIdx)
 *     Coordinates of the idx-th .bit-cell (1-indexed) inside
 *     arrayEl, expressed in the same pixel space as the overlay
 *     SVG returned by attachSVG.  Returns {x, y, w, h, cx, cy}.
 *
 *   FenwickAnim.clearSVG(svg)
 *     Remove all arrows / paths but keep the <defs> markers.
 *
 *   FenwickAnim.arrowBetweenCells(svg, arrayEl, fromIdx, toIdx, opts)
 *     Draw an animated arrow between two cells.  opts: { color,
 *     curve: 'over' | 'under', id }.  'over' arcs above the cells
 *     (used for query: i -> i - lowbit), 'under' arcs below (used
 *     for update: i -> i + lowbit).  Returns the arrow element.
 *
 *   FenwickAnim.runner(steps, baseDelay, onDone)
 *     Thin wrapper over window.animRunner with a default delay
 *     of 700 ms.  Returns { cancel }.
 *
 *   FenwickAnim.bindControls({ play, prev, next, reset, onPlay,
 *                              onPrev, onNext, onReset, getState })
 *     Wire up the standard Play / Prev / Next / Reset button set.
 *     getState() returns { stepIdx, total } so the helper can
 *     disable Prev / Next at boundaries.
 * ============================================================ */
(function () {
  var NS = 'http://www.w3.org/2000/svg';

  function attachSVG(wrap) {
    var svg = wrap.querySelector('svg.bit-anim-svg');
    if (svg) return svg;
    svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'bit-anim-svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('xmlns', NS);
    // Insert at end so it overlays the .bit-array (positioned absolute via CSS).
    wrap.appendChild(svg);
    if (window.addArrowMarker) {
      window.addArrowMarker(svg, 'anim-arrow', '#0a8f6a');
      window.addArrowMarker(svg, 'anim-arrow-warn', '#f59e0b');
      window.addArrowMarker(svg, 'anim-arrow-brand', 'var(--brand, #0a8f6a)');
    }
    return svg;
  }

  function cellRect(arrayEl, oneBasedIdx) {
    var cells = arrayEl.querySelectorAll('.bit-cell');
    if (oneBasedIdx < 1 || oneBasedIdx > cells.length) return null;
    var cell = cells[oneBasedIdx - 1];
    var aRect = arrayEl.getBoundingClientRect();
    var cRect = cell.getBoundingClientRect();
    var x = cRect.left - aRect.left;
    var y = cRect.top - aRect.top;
    return {
      x: x, y: y,
      w: cRect.width, h: cRect.height,
      cx: x + cRect.width / 2,
      cy: y + cRect.height / 2
    };
  }

  function clearSVG(svg) {
    // Keep <defs> (markers); remove everything else.
    var children = Array.prototype.slice.call(svg.childNodes);
    for (var i = 0; i < children.length; i++) {
      var n = children[i];
      if (n.tagName && n.tagName.toLowerCase() === 'defs') continue;
      svg.removeChild(n);
    }
  }

  function arrowBetweenCells(svg, arrayEl, fromIdx, toIdx, opts) {
    opts = opts || {};
    var color = opts.color || '#0a8f6a';
    var markerId = color === '#f59e0b' ? 'anim-arrow-warn' : 'anim-arrow';
    var f = cellRect(arrayEl, fromIdx);
    var t = cellRect(arrayEl, toIdx);
    if (!f && !t) return null;
    // Choose anchor points on top edge (curve over) or bottom edge (curve under).
    var curve = opts.curve === 'under' ? 'under' : 'over';
    var anchorY = curve === 'over' ? -2 : 2;
    var x1, y1, x2, y2;
    if (f) { x1 = f.cx; y1 = curve === 'over' ? f.y : f.y + f.h; }
    else   { x1 = (t.cx > 0 ? -10 : t.cx + 20); y1 = curve === 'over' ? t.y : t.y + t.h; }
    if (t) { x2 = t.cx; y2 = curve === 'over' ? t.y : t.y + t.h; }
    else   { x2 = (arrayEl.getBoundingClientRect().width + 10); y2 = curve === 'over' ? f.y : f.y + f.h; }
    // Curve apex: midpoint, vertically offset.
    var midX = (x1 + x2) / 2;
    var dist = Math.abs(x2 - x1);
    var lift = Math.min(28, 10 + dist * 0.18);
    var apexY = (curve === 'over' ? Math.min(y1, y2) - lift : Math.max(y1, y2) + lift);
    var path = document.createElementNS(NS, 'path');
    var d = 'M ' + x1 + ' ' + y1 + ' Q ' + midX + ' ' + apexY + ' ' + x2 + ' ' + y2;
    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', 'url(#' + markerId + ')');
    path.setAttribute('opacity', '0');
    path.style.transition = 'opacity 0.3s';
    if (opts.id) path.id = opts.id;
    svg.appendChild(path);
    requestAnimationFrame(function () { path.setAttribute('opacity', '1'); });
    return path;
  }

  function runner(steps, baseDelay, onDone) {
    baseDelay = baseDelay == null ? 700 : baseDelay;
    if (window.animRunner) return window.animRunner(steps, baseDelay, onDone);
    // Fallback: synchronous run if anim-speed.js is missing.
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i];
      if (typeof s === 'function') s(); else if (s && s.fn) s.fn();
    }
    if (onDone) onDone();
    return { cancel: function () {} };
  }

  function bindControls(cfg) {
    function refresh() {
      if (!cfg.getState) return;
      var st = cfg.getState();
      if (cfg.prev) cfg.prev.disabled = st.stepIdx <= 0;
      if (cfg.next) cfg.next.disabled = st.stepIdx >= st.total;
    }
    if (cfg.play && cfg.onPlay)   cfg.play.addEventListener('click',   function () { cfg.onPlay();   refresh(); });
    if (cfg.prev && cfg.onPrev)   cfg.prev.addEventListener('click',   function () { cfg.onPrev();   refresh(); });
    if (cfg.next && cfg.onNext)   cfg.next.addEventListener('click',   function () { cfg.onNext();   refresh(); });
    if (cfg.reset && cfg.onReset) cfg.reset.addEventListener('click',  function () { cfg.onReset(); refresh(); });
    refresh();
    return { refresh: refresh };
  }

  window.FenwickAnim = {
    attachSVG: attachSVG,
    cellRect: cellRect,
    clearSVG: clearSVG,
    arrowBetweenCells: arrowBetweenCells,
    runner: runner,
    bindControls: bindControls
  };
})();
