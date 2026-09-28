/* Hand-set attention example; independently reproducible in the linked Python. */
(() => {
  const root = document.getElementById('tf-demo');
  if (!root) return;
  const base = [[1,0,1,0], [0,1,0,1], [1,1,0,0]];
  const query = document.getElementById('tf-query');
  const causal = document.getElementById('tf-causal');
  const scaled = document.getElementById('tf-scaled');
  const changed = document.getElementById('tf-changed');
  const vector = row => '[' + row.map(x => x.toFixed(6)).join(', ') + ']';
  function compute() {
    const index = Number(query.value), mask = causal.value === 'true';
    const scale = scaled.value === 'true', change = changed.value === 'true';
    const x = base.map(row => row.slice());
    if (change) x[2] = [3,-2,1,2];
    const heads = [[[0,1],[2,3]], [[2,3],[0,1]]].map(([qcols,vcols]) => {
      const q = x.map(row => qcols.map(i => row[i]));
      const k = q.map(row => row.slice()), v = x.map(row => vcols.map(i => row[i]));
      const scores = q.map((row,i) => k.map((key,j) => mask && j > i ? null : row.reduce((sum,a,c) => sum+a*key[c],0)/(scale?Math.sqrt(2):1)));
      const weights = scores.map(row => {
        const allowed = row.filter(z => z !== null);
        if (!allowed.length) throw new Error('No permitted attention key');
        const peak = Math.max(...allowed), numerator = row.map(z => z === null ? 0 : Math.exp(z-peak));
        const denominator = numerator.reduce((a,b) => a+b,0);
        return numerator.map(z => z/denominator);
      });
      const outputs = weights.map(row => [0,1].map(c => row.reduce((sum,w,j) => sum+w*v[j][c],0)));
      return {q,k,v,scores,weights,outputs};
    });
    const attention = heads.flatMap(h => h.outputs[index]);
    const residual = attention.map((v,c) => v+x[index][c]);
    const mean = residual.reduce((a,b) => a+b,0)/4;
    const variance = residual.reduce((sum,v) => sum+(v-mean)**2,0)/4;
    const normalized = residual.map(v => (v-mean)/Math.sqrt(variance+1e-6));
    return {query:index,causal:mask,scaled:scale,changed:change,x,heads,attention,residual,normalized};
  }
  function render() {
    const d = compute(), i = d.query;
    document.getElementById('tf-state').textContent = `Position ${i+1} · ${d.causal?'causal mask':'all positions'} · ${d.scaled?'divided by √2':'unscaled scores'} · ${d.changed?'changed':'original'} final row.`;
    document.getElementById('tf-heads').innerHTML = d.heads.map((h,head) => {
      const rows = h.weights.map((weights,r) => `<tr data-selected="${r===i}"><th scope="row">Q${r+1}</th>${weights.map((w,c) => `<td data-weight="${w}" data-forbidden="${h.scores[r][c]===null}" style="--weight:${.05+.35*w}">${w.toFixed(3)}</td>`).join('')}</tr>`).join('');
      const values = h.weights[i].map((w,j) => `<div class="tf-value"><strong>Key ${j+1} · weight ${w.toFixed(6)}</strong>Value ${vector(h.v[j])}<br>Weighted value ${vector(h.v[j].map(v=>w*v))}</div>`).join('');
      const scores = '['+h.scores[i].map(v=>v===null?'blocked':v.toFixed(6)).join(', ')+']';
      return `<section class="tf-box" data-head="${head+1}"><h3>Head ${head+1}</h3><p class="tf-number">Selected query: ${vector(h.q[i])}</p><table class="tf-matrix"><caption>Attention weights: Q rows → K columns</caption><thead><tr><th scope="col">Query</th><th scope="col">K1</th><th scope="col">K2</th><th scope="col">K3</th></tr></thead><tbody>${rows}</tbody></table><p class="tf-number">Allowed scores: ${scores}</p><div class="tf-values">${values}</div><p class="tf-number"><strong>Head output:</strong> ${vector(h.outputs[i])}</p></section>`;
    }).join('');
    document.getElementById('tf-result').innerHTML = `<strong>Concatenate → identity output projection</strong><br>${vector(d.attention)}<br><strong>Add input row</strong><br>${vector(d.residual)}<br><strong>Normalize its four coordinates</strong><br>${vector(d.normalized)}`;
    root.dataset.result = JSON.stringify(d);
  }
  [query,causal,scaled,changed].forEach(control => control.addEventListener('change',render));
  render();
  document.getElementById('tf-controls').hidden = false;
})();
