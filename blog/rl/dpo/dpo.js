/* Interactive calculations, math rendering, and mobile chapter navigation. */
(function () {
  'use strict';
  function all(q, root) { return Array.prototype.slice.call((root || document).querySelectorAll(q)); }
  function n(root, key) { return Number(root.querySelector('[data-' + key + ']').value); }
  function selected(root, key) { return root.querySelector('[data-' + key + ']').value; }
  function f(x) { return x.toFixed(4); }
  function graph(root, fn, other, xmin, xmax, ymin, ymax, marker) {
    var svg = root.querySelector('svg'), x = function (v) { return 48 + (v - xmin) / (xmax - xmin) * 460; }, y = function (v) { return 206 - (v - ymin) / (ymax - ymin) * 172; };
    function path(fun) { var d = ''; for (var i = 0; i <= 160; i++) { var v = xmin + (xmax - xmin) * i / 160; d += (i ? ' L ' : 'M ') + x(v).toFixed(2) + ' ' + y(fun(v)).toFixed(2); } return d; }
    var html = '<line x1="48" x2="508" y1="206" y2="206" stroke="#b9c2b9"/><line x1="48" x2="48" y1="34" y2="206" stroke="#b9c2b9"/>';
    for (var t = 0; t < 3; t++) { var xx = xmin + (xmax - xmin) * t / 2, yy = ymin + (ymax - ymin) * t / 2; html += '<text x="' + x(xx) + '" y="226" text-anchor="middle">' + xx.toFixed(1) + '</text><text x="40" y="' + (y(yy) + 4) + '" text-anchor="end">' + yy.toFixed(1) + '</text>'; }
    if (other) html += '<path class="comparison" d="' + path(other) + '"/>';
    html += '<path class="curve" d="' + path(fn) + '"/>';
    if (marker !== undefined) html += '<circle cx="' + x(marker) + '" cy="' + y(fn(marker)) + '" r="5" fill="#b45a29"/>';
    svg.innerHTML = html;
  }
  function run() {
    if (window.renderMathInElement) window.renderMathInElement(document.querySelector('article'), {delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}], throwOnError: false});
    all('[data-demo]').forEach(function (root) {
      var kind = root.getAttribute('data-demo'), out = root.querySelector('output'), records = null;
      function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
      function softplus(x) { return Math.max(x,0) + Math.log1p(Math.exp(-Math.abs(x))); }
      function bars(values) {
        all('[data-policy-bar]',root).forEach(function(el,i) { el.style.width = (100*values[i]) + '%'; });
        all('[data-policy-value]',root).forEach(function(el,i) { el.textContent = (100*values[i]).toFixed(1) + '%'; });
      }
      function paint() {
        if (kind === 'preference') {
          var gap = n(root,'gap'), prob = sigmoid(gap);
          graph(root,sigmoid,null,-4,4,0,1,gap);
          out.textContent = 'Reward difference = ' + gap.toFixed(1) + '. P(A preferred to B) = ' + f(prob) + '. A single “A wins” label has negative log likelihood ' + f(softplus(-gap)) + '. Equal rewards give probability 0.5, not certainty.';
        } else if (kind === 'boltzmann') {
          var beta = n(root,'beta'), reward = n(root,'reward'), weights = [.5,.3*Math.exp(reward/beta),.2*Math.exp(-.5/beta)], z = weights.reduce(function(a,b) { return a+b; },0), probs = weights.map(function(w) { return w/z; });
          bars(probs);
          var kl = probs.reduce(function(sum,p,i) { return sum+p*Math.log(p/[.5,.3,.2][i]); },0);
          out.textContent = 'β = ' + beta.toFixed(1) + '; reward(B) = ' + reward.toFixed(1) + '; Z = ' + f(z) + '. Optimal policy = (' + probs.map(f).join(', ') + '). KL(policy ∥ reference) = ' + f(kl) + ' nats. This is the exact optimum for fixed known rewards, not a neural training prediction.';
        } else if (kind === 'margin') {
          var gainC = n(root,'chosen'), gainR = n(root,'rejected'), betaM = n(root,'beta'), m = betaM*(gainC-gainR), weight = betaM*sigmoid(-m);
          graph(root,function(x) { return softplus(-x); },null,-6,6,0,6.1,m);
          out.textContent = 'Chosen gain = ' + gainC.toFixed(1) + '; rejected gain = ' + gainR.toFixed(1) + '; β = ' + betaM.toFixed(2) + '. Margin = ' + f(m) + '; preference probability = ' + f(sigmoid(m)) + '; loss = ' + f(softplus(-m)) + '. Gradient coefficients on chosen / rejected log p: −' + f(weight) + ' / +' + f(weight) + '.';
        } else if (kind === 'tokens') {
          var reduction = selected(root,'reduction'), eos = selected(root,'eos') === 'include', c=[-.8,-.5,-.2], cr=[-1.1,-.7,-.4], r=[-.3,-.4,-.6,-.5,-.2], rr=[-.3,-.4,-.4,-.2,-.2];
          if (!eos) { c.pop();cr.pop();r.pop();rr.pop(); }
          function score(xs) { return xs.reduce(function(a,b) { return a+b; },0)/(reduction === 'mean' ? xs.length:1); }
          var cg=score(c)-score(cr), rg=score(r)-score(rr), margin=.5*(cg-rg);
          all('[data-eos-token]',root).forEach(function(el) { el.classList.toggle('is-muted',!eos); });
          out.textContent = 'Scored lengths: chosen ' + c.length + ', rejected ' + r.length + '. Policy scores = ' + f(score(c)) + ', ' + f(score(r)) + '; reference scores = ' + f(score(cr)) + ', ' + f(score(rr)) + '. At β = 0.5: margin = ' + f(margin) + ', loss = ' + f(softplus(-margin)) + '. ' + (reduction==='sum' ? 'Sum preserves the whole-response log-likelihood definition.' : 'Mean changes the response-length weighting and therefore the objective.');
        } else if (kind === 'coverage') {
          var mass=n(root,'mass'), p=[.6*(1-mass),.4*(1-mass),mass], klC=p.reduce(function(sum,q) { return sum+q*Math.log(3*q); },0);
          bars(p);
          out.textContent = 'Policy = (' + p.map(f).join(', ') + '). A:B odds remain 1.5; with a uniform reference and β = 1, margin = ' + f(Math.log(1.5)) + ' and loss = ' + f(-Math.log(.6)) + ' for every setting. KL(policy ∥ reference) = ' + f(klC) + '. No observed comparison involves response C.';
        } else if (kind === 'lab' && records) {
          var seed=n(root,'seed'), index=n(root,'checkpoint')/20, point=records.runs[seed].curve[index];
          out.textContent = 'Recorded seed ' + seed + ', optimizer step ' + point.step + ': empirical loss = ' + f(point.training_loss) + '; exact population loss = ' + f(point.population_loss) + '; KL to population optimum = ' + f(point.kl_to_population_optimum) + ' nats; expected reward = ' + f(point.expected_reward) + '; reward − β KL = ' + f(point.regularized_objective) + '. Synthetic finite-response experiment; no language model was trained.';
        }
      }
      all('.dpo-interactive',root).forEach(function(el) { el.hidden=false; });
      all('input,select',root).forEach(function(input) { input.addEventListener('input',paint);input.addEventListener('change',paint); });
      if (kind === 'lab') {
        fetch('lab/results.json').then(function(response) { if (!response.ok) throw new Error('Results unavailable');return response.json(); }).then(function(data) { records=data;paint(); }).catch(function() { out.textContent='The recorded data could not load. The results table and downloadable JSON below remain available.'; });
      }
      paint();
    });
    var body = document.querySelector('.blog-sidebar-body');
    if (body) {
      var details = document.createElement('details'), summary = document.createElement('summary'), mq = window.matchMedia('(max-width: 1000px)'), mobileOpen = false;
      details.className = 'dpo-mobile-nav'; summary.textContent = 'Browse chapters and contents'; body.parentNode.insertBefore(details, body); details.appendChild(summary); details.appendChild(body); details.open = !mq.matches;
      details.addEventListener('toggle', function () { if (mq.matches) mobileOpen = details.open; });
      mq.addEventListener('change', function () { details.open = !mq.matches || mobileOpen; });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',run); else run();
})();
