(() => {
  'use strict';
  const byId = id => document.getElementById('speech-' + id);
  const frequency = byId('frequency'), rate = byId('rate');
  if (!frequency || !rate) return;
  const ns = 'http://www.w3.org/2000/svg';
  const make = (tag, attributes) => {
    const node = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  };
  function render() {
    const f = Number(frequency.value), fs = Number(rate.value);
    const remainder = f % fs, alias = Math.min(remainder, fs - remainder);
    byId('frequency-value').textContent = f.toLocaleString('en-US') + ' Hz';
    byId('plot-original-label').textContent = `Original continuous cosine: ${f.toLocaleString('en-US')} Hz`;
    byId('plot-alias-label').textContent = `Cosine inside the Nyquist band: ${alias.toLocaleString('en-US')} Hz`;
    byId('plot-desc').textContent = `The top curve is a ${f} Hz cosine and the bottom is a ${alias} Hz cosine. At ${fs} samples per second, the dots have identical values in the two rows. Both rows show one millisecond.`;
    for (const [name, tone, center, color] of [['original', f, 116, '#ae5728'], ['alias', alias, 286, '#087354']]) {
      let path = '';
      for (let i = 0; i <= 600; i++) {
        const t = i / 600 / 1000;
        path += `${i ? 'L' : 'M'}${70 + 590 * i / 600},${center - 43 * Math.cos(2 * Math.PI * tone * t)} `;
      }
      byId('plot-' + name).setAttribute('d', path);
      const dots = byId('dots-' + name);
      dots.replaceChildren();
      for (let n = 0; n <= fs / 1000; n++) {
        const x = 70 + 590 * (n / fs) * 1000;
        const y = center - 43 * Math.cos(2 * Math.PI * f * n / fs);
        dots.append(make('line', {x1: x, x2: x, y1: center, y2: y, stroke: color, 'stroke-opacity': .35}));
        dots.append(make('circle', {cx: x, cy: y, r: 4, fill: color, stroke: '#fffdf9', 'stroke-width': 1}));
      }
    }
    const state = f > fs / 2 ? 'Aliasing: two different continuous frequencies produce the same samples.' :
      f === fs / 2 ? 'Exactly at the Nyquist boundary: this cosine alternates, but arbitrary phase cannot be recovered reliably at the boundary.' :
      'This tone lies below the Nyquist limit. Recovery still assumes the input has no unfiltered frequencies above that limit.';
    byId('result').textContent = `Tone ${f.toLocaleString('en-US')} Hz; sampling ${fs.toLocaleString('en-US')} samples/s; Nyquist limit ${(fs / 2).toLocaleString('en-US')} Hz; folded frequency ${alias.toLocaleString('en-US')} Hz. ${state}`;
  }
  frequency.addEventListener('input', render);
  rate.addEventListener('change', render);
  byId('reset').addEventListener('click', () => { frequency.value = '6000'; rate.value = '8000'; render(); });
  render();
  byId('controls').hidden = false;
  byId('plot-region').hidden = false;
})();
