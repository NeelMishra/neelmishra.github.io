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
      var kind = root.getAttribute('data-demo'), out = root.querySelector('output');
      all('.ppo-interactive', root).forEach(function (el) { el.hidden = false; });
      function paint() {
        if (kind === 'bandit') {
          var p = n(root, 'probability') / 100;
          all('.ppo-bar', root).forEach(function (bar, i) { bar.style.width = ((i ? p : 1-p) * 100) + '%'; });
          all('[data-bar-value]', root).forEach(function (el, i) { el.textContent = ((i ? p : 1-p) * 100).toFixed(0) + '%'; });
          out.textContent = 'At p = ' + p.toFixed(2) + ', J(p) = ' + (1-p).toFixed(2) + ' × 1 + ' + p.toFixed(2) + ' × 3 = ' + (1-p).toFixed(2) + ' + ' + (3*p).toFixed(2) + ' = ' + (1+2*p).toFixed(2) + '. Gradient with respect to the right-action logit: 2p(1−p) = ' + f(2*p*(1-p)) + '.';
        } else if (kind === 'baseline') {
          var b = n(root, 'baseline'), p1 = .3, g0 = -p1 * (1-b), g1 = (1-p1) * (3-b), mean = .7*g0+.3*g1, variance = .7*Math.pow(g0-mean,2)+.3*Math.pow(g1-mean,2);
          graph(root, function (x) { return .21*Math.pow(2.4-x,2); }, null, -1, 5, 0, 2.5, b);
          out.textContent = 'Baseline b = ' + b.toFixed(1) + '. Left sample gradient = ' + f(g0) + '; right = ' + f(g1) + '. Expected gradient = ' + f(mean) + ' for every b. Variance = ' + f(variance) + '. Minimum at b = 2.4; the value baseline is 1.6.';
        } else if (kind === 'gae') {
          var lam = n(root, 'lambda')/100, boundary = selected(root, 'boundary'), delta = [1.04, 2.03, boundary === 'terminal' ? 2.3 : 5.9], a = [0,0,0], carry = 0;
          for (var i = 2; i >= 0; i--) { carry = delta[i] + .9*lam*carry; a[i] = carry; }
          all('[data-adv]', root).forEach(function (el, i) { el.textContent = f(a[i]); });
          out.textContent = 'λ = ' + lam.toFixed(2) + '. Last residual = ' + delta[2].toFixed(2) + '. A₂ = ' + f(a[2]) + ' → A₁ = ' + f(a[1]) + ' → A₀ = ' + f(a[0]) + '. ' + (boundary === 'terminal' ? 'Goal reached: successor value is excluded.' : 'External timeout: bootstrap V(final observation) = 4, then reset the trace.');
        } else if (kind === 'clip') {
          var epsilon = n(root, 'epsilon')/100, adv = Number(selected(root, 'advantage')), ratio = n(root, 'ratio')/100;
          var clip = function (r) { return Math.min(r*adv, Math.max(1-epsilon,Math.min(1+epsilon,r))*adv); };
          graph(root, clip, function(r) { return r*adv; }, 0, 2, -4, 4, ratio);
          var plateau = adv > 0 ? ratio > 1+epsilon : ratio < 1-epsilon;
          out.textContent = 'ρ = ' + ratio.toFixed(2) + ', A = ' + adv + ', ε = ' + epsilon.toFixed(2) + '. Unclipped = ' + f(ratio*adv) + '; clipped surrogate = ' + f(clip(ratio)) + '. ' + (plateau ? 'This sample is on its flat, incentive-removed side.' : 'This sample still supplies a slope (the exact clipping boundary is a kink).') + ' The policy ratio itself has not been clamped.';
        } else if (kind === 'batch') {
          var step = n(root, 'epoch'), probs = [.25,.29,.33,.35], probability = probs[step];
          all('[data-batch-ratio]', root).forEach(function(el) { el.textContent = f(probability/.25); });
          root.querySelector('[data-new-prob]').textContent = probability.toFixed(2);
          out.textContent = 'Illustrated optimizer stage ' + step + ': old probability stays 0.25; new probability = ' + probability.toFixed(2) + '; ratio = ' + f(probability/.25) + '. Advantage +2.0 and target 3.1 stay fixed. ' + (step === 3 ? 'Discard this batch and collect with the updated policy before another outer iteration.' : 'Only the trainable actor and critic move.');
        } else if (kind === 'gaussian') {
          var mu = n(root, 'mean')/10, sigma = n(root, 'sigma')/10, u = n(root, 'latent')/10, action = Math.tanh(u), logp = -.5*Math.pow((u-mu)/sigma,2)-Math.log(sigma)-.5*Math.log(2*Math.PI), jac = Math.log(1-action*action);
          graph(root, function(x) { return Math.exp(-.5*Math.pow((x-mu)/sigma,2))/(sigma*Math.sqrt(2*Math.PI)); }, null, -4, 4, 0, 2.1, u);
          out.textContent = 'Latent Normal: μ = ' + mu.toFixed(1) + ', σ = ' + sigma.toFixed(1) + '. u = ' + u.toFixed(1) + ' → action tanh(u) = ' + f(action) + '. log p(u) = ' + f(logp) + '; log |da/du| = ' + f(jac) + '; squashed log density = ' + f(logp-jac) + '.';
        } else if (kind === 'diagnostics') {
          var pp = n(root, 'newprob')/100, rr = [2*pp,2*(1-pp)], kl = -.5*Math.log(rr[0])-.5*Math.log(rr[1]), cf = ((Math.abs(rr[0]-1)>.2+1e-10 ? 1:0)+(Math.abs(rr[1]-1)>.2+1e-10 ? 1:0))/2, ent = -pp*Math.log(pp)-(1-pp)*Math.log(1-pp);
          out.textContent = 'New P(right) = ' + pp.toFixed(2) + '. Exact KL(old ∥ new) = ' + f(kl) + ' nats; clip fraction (ε = 0.2) = ' + cf.toFixed(2) + '; entropy = ' + f(ent) + ' nats. ' + (kl > .03 ? 'A 0.03 KL threshold would stop further steps, after this move has already happened.' : 'This move is below an illustrative 0.03 KL threshold. Reward improvement still needs evaluation.');
          graph(root, function(x) { return -.5*Math.log(2*x)-.5*Math.log(2*(1-x)); }, null, .05,.95,0,1,pp);
        } else if (kind === 'tokens') {
          var pos = n(root, 'position'), tokens = all('.ppo-token',root);
          tokens.forEach(function (token,i) { token.classList.toggle('is-active',i===pos+2); });
          var names = ['2','+','2','=','4','EOS'];
          out.textContent = 'Response position ' + pos + ': predict “' + names[pos] + '” from the prompt plus ' + pos + ' earlier response token' + (pos === 1 ? '' : 's') + '. Score the selected action under old, current, and reference policies using that SAME prefix. Prompt and PAD positions have loss mask 0; all six response actions, including EOS, have mask 1.';
        }
      }
      all('input, select', root).forEach(function (input) { input.addEventListener('input', paint); input.addEventListener('change', paint); }); paint();
    });
    var body = document.querySelector('.blog-sidebar-body');
    if (body) {
      var details = document.createElement('details'), summary = document.createElement('summary'), mq = window.matchMedia('(max-width: 1000px)'), mobileOpen = false;
      details.className = 'ppo-mobile-nav'; summary.textContent = 'Browse chapters and contents'; body.parentNode.insertBefore(details, body); details.appendChild(summary); details.appendChild(body); details.open = !mq.matches;
      details.addEventListener('toggle', function () { if (mq.matches) mobileOpen = details.open; });
      mq.addEventListener('change', function () { details.open = !mq.matches || mobileOpen; });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',run); else run();
})();
