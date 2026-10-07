(function () {
  'use strict';
  var positions = {A: [110, 170], B: [280, 65], C: [280, 280], D: [500, 280]};
  function element(tag, attributes, text) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attributes).forEach(function (key) { node.setAttribute(key, attributes[key]); });
    if (text !== undefined) node.textContent = text;
    return node;
  }
  document.querySelectorAll('[data-hnsw-lab]').forEach(function (root) {
    var fallback = Array.prototype.slice.call(root.childNodes);
    var challenge = root.hasAttribute('data-challenge');
    fetch(new URL(root.dataset.traceSrc, location.href)).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    }).then(function (data) {
      ['1', '2', '3'].forEach(function (key) {
        var run = data.runs && data.runs[key];
        if (!run || !Array.isArray(run.traces) || !run.traces.length ||
            !Array.isArray(run.nearest) || !run.nearest.length) {
          throw new Error('Invalid search-trace schema');
        }
      });
      var prediction = challenge ? '<div class="rag-lab-prediction"><p>Which node will this search return?</p><div class="note-controls"><button type="button" data-guess="B" aria-pressed="false">B: the nearer branch</button><button type="button" data-guess="D" aria-pressed="false">D: the nearest point</button></div><output data-prediction aria-live="polite">Make a prediction, then reveal the route one step at a time.</output></div>' : '';
      var heaps = '<div class="rag-heaps"><div><span>Candidate frontier C (closest first)</span><strong data-frontier></strong></div><div><span>Retained W (displayed closest first)</span><strong data-retained></strong></div></div>';
      root.innerHTML = prediction + '<div class="note-controls"><label>How many alternatives should the search keep? <select aria-label="Retained capacity ef"><option value="1">Keep 1 (ef = 1)</option><option value="2">Keep 2 (ef = 2)</option><option value="3">Keep 3 (ef = 3)</option></select></label><button type="button" data-back>Previous step</button><button type="button" data-next>Next step</button><button type="button" data-reset>Reset</button><button type="button" data-finish>Reveal result</button></div><svg class="rag-graph" viewBox="0 0 620 350" role="img" aria-label="Four-node routing graph showing retained, visited, and pending nodes"></svg><dl class="rag-lab-metrics"><div><dt>Best retained</dt><dd data-best></dd></div><div><dt>Vectors scored</dt><dd data-scored></dd></div><div><dt>Returned K = 1</dt><dd data-returned></dd></div></dl>' + (challenge ? '<details class="rag-lab-state"><summary>Inspect the two heaps</summary>' + heaps + '</details>' : heaps) + '<output class="note-status rag-readout" data-status aria-live="polite"></output>';
      var ef = '1', step = 0, guess = null;
      function ids(queue) { return queue.map(function (item) { return item.id; }); }
      function format(queue) {
        return queue.map(function (item) { return item.id + ':' + item.distance; }).join(', ') || 'Empty';
      }
      function draw() {
        var run = data.runs[ef], state = run.traces[step], pending = ids(state.frontier);
        var retained = ids(state.retained), svg = root.querySelector('svg');
        svg.replaceChildren();
        [['A', 'B'], ['A', 'C'], ['C', 'D']].forEach(function (edge) {
          var a = positions[edge[0]], b = positions[edge[1]];
          svg.appendChild(element('line', {x1: a[0], y1: a[1], x2: b[0], y2: b[1],
            stroke: '#b3c0b4', 'stroke-width': 3}));
        });
        Object.keys(positions).forEach(function (id) {
          var point = positions[id], kept = retained.indexOf(id) !== -1;
          var returned = state.event === 'finish' && id === run.nearest[0];
          if (pending.indexOf(id) !== -1) {
            svg.appendChild(element('circle', {cx: point[0], cy: point[1], r: 30,
              fill: 'none', stroke: '#ba873c', 'stroke-width': 3, 'stroke-dasharray': '5 4'}));
          }
          svg.appendChild(element('circle', {cx: point[0], cy: point[1], r: 23,
            fill: returned ? '#125a70' : kept ? '#23654d' : state.visited.indexOf(id) !== -1 ? '#e1e7df' : '#fffaf2',
            stroke: '#315845', 'stroke-width': state.current === id ? 4 : 1.5}));
          svg.appendChild(element('text', {x: point[0], y: point[1] + 7,
            'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700,
            fill: kept || returned ? '#fff' : '#263c30'}, id));
          var vector = data.vectors[id], distance = vector[0]*vector[0] + vector[1]*vector[1];
          svg.appendChild(element('text', {x: point[0], y: point[1] + 47,
            'text-anchor': 'middle', 'font-size': 14, fill: '#263c30'}, 'd\u00b2 = ' + distance));
        });
        root.querySelector('[data-frontier]').textContent = format(state.frontier);
        root.querySelector('[data-retained]').textContent = format(state.retained);
        var message = state.event === 'start' ? 'Start at A. D is nearest, but there is no direct link from A to D.' :
          state.event === 'finish' ? (run.nearest[0] === 'D' ?
            'Return D. Keeping the farther C made the route to D visible.' :
            'Return B. C was rejected, so D was never discovered. Keep three alternatives and try again.') :
          state.event === 'stop' ? 'Stop at the retained cutoff; pending neighborhoods remain unexplored.' :
          'Expand ' + state.current + '. Admit: ' + (state.admitted.join(', ') || 'none') +
          '. Reject: ' + (state.rejected.join(', ') || 'none') +
          '. Evict from W: ' + (state.evicted.join(', ') || 'none') + '.';
        root.querySelector('[data-best]').textContent = state.retained[0].id + ' (' + state.retained[0].distance + ')';
        root.querySelector('[data-scored]').textContent = String(state.visited.length);
        root.querySelector('[data-returned]').textContent = state.event === 'finish' ? run.nearest[0] : 'Not finished';
        if (challenge) {
          root.querySelectorAll('[data-guess]').forEach(function (button) {
            button.setAttribute('aria-pressed', String(button.dataset.guess === guess));
          });
          root.querySelector('[data-prediction]').textContent = !guess ?
            'Make a prediction, then reveal the route one step at a time.' :
            state.event !== 'finish' ? 'Prediction: ' + guess + '. Step through the search to check it.' :
            guess === run.nearest[0] ? 'Correct: this search returns ' + guess + '.' :
            'This search returns ' + run.nearest[0] + ', not ' + guess + '. Follow the admitted and rejected routes to see why.';
        }
        root.querySelector('[data-status]').textContent = 'Step ' + step + ' of ' + (run.traces.length - 1) +
          ' | ef = ' + ef + ' | K = 1\n' + message +
          '\nSeen: ' + state.visited.join(', ') + ' | Expanded: ' + (state.expanded.join(', ') || 'none') +
          '\nDistance evaluations so far: ' + state.visited.length +
          '\nGreen = retained; gold ring = pending; blue = returned result. Queue displays are sorted views, not heap-array layouts.';
        root.querySelector('[data-back]').disabled = step === 0;
        root.querySelector('[data-next]').disabled = step === run.traces.length - 1;
        root.dataset.result = JSON.stringify({ef: Number(ef), step: step,
          nearest: run.nearest, distance_evaluations: run.distance_evaluations, prediction: guess});
      }
      root.querySelector('select').addEventListener('change', function (event) {
        ef = event.target.value; step = 0; guess = null; draw();
      });
      root.querySelectorAll('[data-guess]').forEach(function (button) {
        button.addEventListener('click', function () { guess = button.dataset.guess; draw(); });
      });
      root.querySelector('[data-back]').addEventListener('click', function () { step--; draw(); });
      root.querySelector('[data-next]').addEventListener('click', function () { step++; draw(); });
      root.querySelector('[data-reset]').addEventListener('click', function () { step = 0; guess = null; draw(); });
      root.querySelector('[data-finish]').addEventListener('click', function () {
        step = data.runs[ef].traces.length - 1; draw();
      });
      root.dataset.ready = 'true';
      draw();
    }).catch(function (error) {
      root.dataset.ready = 'false';
      var notice = document.createElement('p');
      notice.className = 'rag-error'; notice.setAttribute('role', 'alert');
      notice.textContent = 'The interactive search trace could not load: ' + error.message +
        '. The worked trace below remains available.';
      root.replaceChildren.apply(root, fallback.concat([notice]));
      console.error('HNSW trace initialization failed', error);
    });
  });
}());
