/* Original, deterministic teaching widgets. No model inference or external data. */
(function () {
  'use strict';
  var article = document.querySelector('.tr-article');
  if (!article) return;
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(article, {
      delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
      throwOnError: false
    });
  }
  function softmax(scores) {
    var maximum = Math.max.apply(null, scores);
    var weights = scores.map(function (s) { return Math.exp(s - maximum); });
    var sum = weights.reduce(function (a, b) { return a + b; }, 0);
    return weights.map(function (w) { return w / sum; });
  }
  function fmt(x) { return Math.abs(x) < .00005 ? '0.0000' : x.toFixed(4); }
  function vector(xs) { return '(' + xs.map(fmt).join(', ') + ')'; }
  function bars(container, names) {
    return names.map(function (name) {
      var row = document.createElement('div'); row.className = 'tr-bar';
      var label = document.createElement('span'); label.textContent = name;
      var track = document.createElement('div'); track.className = 'tr-track'; track.setAttribute('aria-hidden', 'true');
      var fill = document.createElement('div'); fill.className = 'tr-fill'; track.appendChild(fill);
      var value = document.createElement('span'); value.className = 'tr-bar-value';
      row.append(label, track, value); container.appendChild(row);
      return { fill: fill, value: value };
    });
  }
  function setBars(rows, values) {
    rows.forEach(function (row, i) {
      row.fill.style.width = (100 * values[i]) + '%';
      row.value.textContent = fmt(values[i]);
    });
  }
  var demos = {
    attention: function (body) {
      // Keep the worked calculation readable before JavaScript loads. The
      // only interaction changes the allowed positions, not the input vectors.
      var mask = body.querySelector('[data-mask]');
      var rows = Array.prototype.map.call(body.querySelectorAll('.tr-bar'), function (row) {
        return { fill: row.querySelector('.tr-fill'), value: row.querySelector('.tr-bar-value') };
      });
      function draw() {
        var scores = [1 / Math.SQRT2, 0, mask.checked ? -Infinity : 1 / Math.SQRT2];
        var probs = softmax(scores);
        var result = [2 * (probs[0] + probs[2]), 2 * (probs[1] + probs[2])];
        body.querySelector('[data-scores]').textContent = 'Scores = (' + scores.map(function (s) {
          return s === -Infinity ? '−∞ (blocked)' : fmt(s);
        }).join(', ') + ')';
        setBars(rows, probs);
        body.querySelector('output').textContent = 'Output = ' + vector(result) + '\n' +
          (mask.checked ? 'Position 3 contributes zero. Positions 1 and 2 now share all the weight.' : 'All three positions contribute.');
      }
      mask.addEventListener('change', draw);
      body.querySelector('.tr-controls').hidden = false;
      draw();
    },
    normalization: function (body) {
      var offset = body.querySelector('[data-offset]');
      function setRow(selector, values, digits) {
        body.querySelectorAll(selector + ' td').forEach(function (cell, i) {
          cell.textContent = values[i].toFixed(digits).replace('-', '−');
        });
      }
      function draw() {
        var xs = [1, 2, 3, 4].map(function (x) { return x + (offset.checked ? 10 : 0); });
        var mean = xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
        var centered = xs.map(function (x) { return x - mean; });
        var variance = centered.reduce(function (sum, x) { return sum + x * x; }, 0) / xs.length;
        var meanSquare = xs.reduce(function (sum, x) { return sum + x * x; }, 0) / xs.length;
        setRow('[data-norm-input]', xs, 0);
        setRow('[data-norm-ln]', centered.map(function (x) { return x / Math.sqrt(variance + 1e-5); }), 3);
        setRow('[data-norm-rms]', xs.map(function (x) { return x / Math.sqrt(meanSquare + 1e-5); }), 3);
        body.querySelector('[data-norm-stats]').textContent = 'Input mean = ' + mean + ' · centered variance = ' + variance + ' · mean square = ' + meanSquare;
        body.querySelector('output').textContent = offset.checked ?
          'Added 10 to every input. LayerNorm’s result stays the same; RMSNorm’s result changes.' :
          'LayerNorm centers the features around zero. RMSNorm keeps all four features positive.';
      }
      offset.addEventListener('change', draw);
      body.querySelector('.tr-controls').hidden = false;
      draw();
    },
    masks: function (body) {
      body.innerHTML = '<div class="tr-controls"><label>Pattern <select data-pattern><option value="causal">Full causal</option><option value="local" selected>Causal window</option><option value="global">Window + global position 4</option></select></label><label>Window (includes self) <input data-window type="range" min="1" max="8" value="3"></label></div><p class="tr-demo-note">Rows are queries 1–8; columns are keys 1–8. Green 1 = allowed, gray 0 = blocked. Global edges still obey causality.</p><div class="tr-matrix-wrap"><div class="tr-matrix" role="img" aria-label="Attention connectivity matrix"></div></div><output class="tr-status" aria-live="polite"></output>';
      var grid = body.querySelector('.tr-matrix'), cells = [];
      for (var i=0;i<64;i++) { var cell=document.createElement('span'); cell.className='tr-cell'; grid.appendChild(cell); cells.push(cell); }
      function draw() {
        var pattern=body.querySelector('select').value, window=Number(body.querySelector('input').value), count=0;
        cells.forEach(function (cell,index) {
          var i=Math.floor(index/8), j=index%8;
          var allowed=j<=i && (pattern==='causal' || i-j<window || (pattern==='global' && (i===3 || j===3)));
          cell.classList.toggle('is-allowed',allowed); cell.textContent=allowed?'1':'0'; count+=allowed?1:0;
          cell.title='Query '+(i+1)+', key '+(j+1)+': '+(allowed?'allowed':'blocked');
        });
        grid.setAttribute('aria-label', count+' allowed pairs of 64. '+pattern+' pattern, window '+window+'. Matrix rows and columns run from position 1 to 8.');
        body.querySelector('output').textContent='Window = '+window+' · Allowed pairs = '+count+' / 64\nFull causal: 36 pairs. At fixed window size, a sparse kernel can skip excluded pairs; a dense mask alone does not do that.';
      }
      body.addEventListener('input',draw); draw();
    },
    delta: function (body) {
      body.innerHTML='<div class="tr-controls"><label>Delta rate β <input data-beta type="range" min="0" max="1" step=".05" value=".5"></label><button type="button" data-write>Write value 5</button><button type="button" data-reset>Reset</button></div><p class="tr-demo-note">One unit scalar key k = 1. Both memories start at 3. Additive memory adds 5 per write; delta memory writes β times its current error.</p><output class="tr-status" aria-live="polite"></output>';
      var state=3, additive=3, steps=0, last='No write yet.';
      function draw() { body.querySelector('output').textContent='β = '+fmt(Number(body.querySelector('input').value))+' · Writes = '+steps+'\nAdditive read = '+fmt(additive)+' · Delta read = '+fmt(state)+'\n'+last; }
      body.querySelector('[data-write]').onclick=function () { var error=5-state, beta=Number(body.querySelector('input').value); last='Before write: '+fmt(state)+'; error = 5 − '+fmt(state)+' = '+fmt(error)+'.'; state+=beta*error; additive+=5; steps++; draw(); };
      body.querySelector('[data-reset]').onclick=function () { state=additive=3; steps=0; last='No write yet.'; draw(); };
      body.querySelector('input').oninput=draw; draw();
    },
    forget: function (body) {
      body.innerHTML='<div class="tr-controls"><label>Retention α <input data-alpha type="range" min="0" max="1" step=".05" value=".5"></label><label>Write rate β <input data-beta type="range" min="0" max="1" step=".05" value=".25"></label></div><p class="tr-demo-note">Fixed previous scalar state = 4; key = 1; requested value = 10. Move either gate to recompute one update from that same starting state.</p><div class="tr-bars"></div><output class="tr-status" aria-live="polite"></output>';
      var rows=bars(body.querySelector('.tr-bars'),['Old / 10','Decay / 10','New / 10']);
      function draw() { var a=Number(body.querySelector('[data-alpha]').value), b=Number(body.querySelector('[data-beta]').value), decayed=4*a, error=10-decayed, updated=decayed+b*error;
        setBars(rows,[.4,decayed/10,updated/10]);
        body.querySelector('output').textContent='α = '+fmt(a)+' · β = '+fmt(b)+'\nDecay: 4 × α = '+fmt(decayed)+'\nRead error: 10 − '+fmt(decayed)+' = '+fmt(error)+'\nNew state: '+fmt(decayed)+' + β × '+fmt(error)+' = '+fmt(updated)+'\nBars show state divided by 10. Decay and write rate control different operations.';
      } body.addEventListener('input',draw); draw();
    },
    rope: function (body) {
      body.innerHTML='<div class="tr-controls"><label>Relative offset j − i <input data-offset type="range" min="-8" max="8" step="1" value="2"></label><label>Joint position shift <input data-shift type="range" min="0" max="8" step="1" value="0"></label></div><svg class="tr-rotation" viewBox="0 0 280 280" role="img" aria-label="Rotated query and key in one plane"><circle cx="140" cy="140" r="100" fill="none" stroke="#d7ded8"/><path d="M20 140H260M140 20V260" stroke="#d7ded8"/><line data-q x1="140" y1="140" stroke="#0a8f6a"/><line data-k x1="140" y1="140" stroke="#c77136"/><circle cx="140" cy="140" r="4" fill="#333"/></svg><output class="tr-status" aria-live="polite"></output>';
      function draw() { var offset=Number(body.querySelector('[data-offset]').value), shift=Number(body.querySelector('[data-shift]').value), i=1+shift, j=i+offset, theta=Math.PI/4;
        [['[data-q]',i],['[data-k]',j]].forEach(function (pair) { var line=body.querySelector(pair[0]); line.setAttribute('x2',140+100*Math.cos(pair[1]*theta)); line.setAttribute('y2',140-100*Math.sin(pair[1]*theta)); });
        body.querySelector('output').textContent='Base q = k = (1, 0); frequency = π/4. Green = query; orange = key.\ni = '+i+', j = '+j+'; relative angle = '+offset+'π/4\nDot product = cos((j − i)π/4) = '+fmt(Math.cos(offset*theta))+'\nA joint shift rotates both vectors but leaves this dot product unchanged.';
      } body.addEventListener('input',draw); draw();
    },
    'online-softmax': function (body) {
      body.innerHTML='<div class="tr-controls"><button type="button" data-step>Merge next tile</button><button type="button" data-reset>Reset</button></div><p class="tr-demo-note">Tile A: scores (1000, 1001), values (2, 4). Tile B: score (999), value (8). The state stores a maximum m, scaled mass ℓ, and scaled weighted sum u.</p><output class="tr-status" aria-live="polite"></output>';
      var stage=0,m=-Infinity,l=0,u=0;
      function draw() { body.querySelector('[data-step]').disabled=stage===2; body.querySelector('output').textContent=stage===0?'No tiles processed. m = −∞, ℓ = 0, u = 0. The output is not defined until at least one key contributes.':'Tiles processed: '+stage+' / 2\nm = '+m+' · ℓ = '+fmt(l)+' · u = '+fmt(u)+'\nOutput u / ℓ = '+fmt(u/l)+(stage===2?'\nDirect stable softmax gives the same 3.8707.':'\nThis is the result for tile A only; tile B still contributes.'); }
      body.querySelector('[data-step]').onclick=function () { var scores=stage===0?[1000,1001]:[999], values=stage===0?[2,4]:[8], next=Math.max(m,Math.max.apply(null,scores)), scale=Math.exp(m-next); l*=scale;u*=scale; scores.forEach(function (s,i) { var weight=Math.exp(s-next); l+=weight;u+=weight*values[i]; });m=next;stage++;draw(); };
      body.querySelector('[data-reset]').onclick=function () { stage=0;m=-Infinity;l=u=0;draw(); }; draw();
    },
    moe: function (body) {
      body.innerHTML='<div class="tr-controls"><label>Selected experts k <input type="range" min="1" max="4" value="2"></label></div><p class="tr-demo-note">Scores: (2, 1, 0, −1). Expert outputs: (2,0), (0,4), (−2,2), (1,−1). Normalize scores over the selected top-k experts.</p><div class="tr-bars"></div><output class="tr-status" aria-live="polite"></output>';
      var rows=bars(body.querySelector('.tr-bars'),['Expert 1','Expert 2','Expert 3','Expert 4']), scores=[2,1,0,-1], values=[[2,0],[0,4],[-2,2],[1,-1]];
      function draw() { var k=Number(body.querySelector('input').value), probs=softmax(scores.map(function (s,i) { return i<k?s:-Infinity; })), result=[0,0]; probs.forEach(function (w,i) { result[0]+=w*values[i][0];result[1]+=w*values[i][1]; });setBars(rows,probs);body.querySelector('output').textContent='k = '+k+' · Selected weight sum = 1\nMixture output = '+vector(result)+'\nUnselected experts contribute zero in this reference rule.'; }
      body.querySelector('input').oninput=draw;draw();
    },
    depth: function (body) {
      body.innerHTML='<div class="tr-controls"><label>Source 1 score (× ln 2) <input type="range" min="-4" max="4" step=".25" value="1"></label></div><p class="tr-demo-note">Depth values: v₀ = (1,0), v₁ = (0,2), v₂ = (1,1). Source 0 and source 2 have score zero. This widget isolates softmax aggregation after key scoring.</p><div class="tr-bars"></div><output class="tr-status" aria-live="polite"></output>';
      var rows=bars(body.querySelector('.tr-bars'),['Source 0','Source 1','Source 2']);
      function draw() { var score=Number(body.querySelector('input').value)*Math.log(2), probs=softmax([0,score,0]);setBars(rows,probs);body.querySelector('output').textContent='Source 1 score = '+fmt(score)+'\nDepth mixture = '+vector([probs[0]+probs[2],2*probs[1]+probs[2]])+'\nOrdinary unweighted sum of these fixed values = (2, 3). The actual source vectors would also change when training a different residual architecture.'; }
      body.querySelector('input').oninput=draw;draw();
    },
    cost: function (body) {
      body.innerHTML='<div class="tr-controls"><label>Sequence length <select data-length><option>1024</option><option>2048</option><option>4096</option><option selected>8192</option><option>16384</option><option>32768</option></select></label><label>Layers <select data-layers><option>8</option><option selected>32</option><option>64</option></select></label><label>KV heads <select data-heads><option>1</option><option>4</option><option selected>8</option><option>32</option></select></label></div><p class="tr-demo-note">Fixed query width d = 4096, 32 query heads, head width 128, batch one, 2 bytes per cached scalar. Rectangular contraction counts exclude projections, MLPs, and softmax.</p><div class="tr-readout-grid"></div><output class="tr-status" aria-live="polite"></output>';
      var grid=body.querySelector('.tr-readout-grid'), labels=['Prefill attention / layer','Decode attention / layer','Explicit score tensor / layer','KV cache / whole stack'], outputs=[];
      labels.forEach(function (label) { var cell=document.createElement('div');cell.className='tr-readout';cell.textContent=label;var value=document.createElement('strong');cell.appendChild(value);grid.appendChild(cell);outputs.push(value); });
      function draw() { var n=Number(body.querySelector('[data-length]').value), layers=Number(body.querySelector('[data-layers]').value), heads=Number(body.querySelector('[data-heads]').value), prefill=2*n*n*4096, decode=2*(n+1)*4096, scores=32*n*n*2, cache=2*layers*n*heads*128*2;
        outputs[0].textContent=(prefill/1e9).toFixed(2)+' billion MACs';outputs[1].textContent=(decode/1e6).toFixed(2)+' million MACs';outputs[2].textContent=(scores/Math.pow(2,30)).toFixed(3)+' GiB';outputs[3].textContent=(cache/Math.pow(2,30)).toFixed(3)+' GiB';
        body.querySelector('output').textContent='n = '+n+' · L = '+layers+' · Hkv = '+heads+'\nPrefill: 2n²d MACs. One new decode token: 2(n+1)d MACs. Multiply MACs by 2 for FLOPs.\nScores: Hn²b bytes. Cache: 2LnHkv dₕb bytes. Changing KV heads reduces this cache estimate, while the query-head pairwise contractions retain their stated width. These numbers do not predict elapsed time.';
      } body.addEventListener('input',draw);draw();
    }
  };
  article.querySelectorAll('[data-demo]').forEach(function (figure) {
    var init=demos[figure.dataset.demo];
    if (init) init(figure.querySelector('.tr-demo-body'));
  });
})();
