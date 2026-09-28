(function () {
  'use strict';
  const controls = document.querySelector('[data-embeddings-controls]');
  if (!controls) return;
  const candidate = document.getElementById('embeddings-candidate');
  const slider = document.getElementById('embeddings-scale');
  const scaleLabel = document.getElementById('embeddings-scale-value');
  const result = document.getElementById('embeddings-result');
  const vectors = { cello: [3, 4, 0], engine: [1, 0, 4] };
  const violin = [4, 3, 0];
  const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
  const norm = (a) => Math.sqrt(dot(a, a));
  const short = (value) => Number(value.toFixed(2)).toString();
  function update() {
    const scale = Number(slider.value);
    const scaled = vectors[candidate.value].map((value) => value * scale);
    const product = dot(violin, scaled);
    const cosine = product / (norm(violin) * norm(scaled));
    scaleLabel.textContent = scale.toFixed(2) + '×';
    slider.setAttribute('aria-valuetext', scale.toFixed(2) + ' times the original vector');
    result.textContent = 'At scale ' + short(scale) + ', ' + candidate.value + ' is (' +
      scaled.map(short).join(', ') + '). Dot product = ' + short(product) +
      '; candidate norm = ' + norm(scaled).toFixed(3) + '; cosine = ' + cosine.toFixed(3) + '.';
  }
  candidate.addEventListener('change', update);
  slider.addEventListener('input', update);
  controls.hidden = false;
  update();
}());
