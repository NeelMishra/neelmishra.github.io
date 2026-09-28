(() => {
  'use strict';
  const slider = document.getElementById('lambda-control');
  if (!slider) return;
  const output = document.getElementById('lambda-result');
  const score = (sum, count, lambda) => sum * sum / (count + lambda);
  function render() {
    const lambda = Number(slider.value);
    const left = score(-10.5, 1, lambda);
    const right = score(6.5, 3, lambda);
    const parent = score(-4, 4, lambda);
    output.textContent = 'λ = ' + lambda.toFixed(2) + '. Left score ' + left.toFixed(2) +
      ' + right score ' + right.toFixed(2) + ' − parent score ' + parent.toFixed(2) +
      ' = gain ' + (left + right - parent).toFixed(2) + '. Leaf outputs: left ' +
      (-10.5 / (1 + lambda)).toFixed(4) + ', right ' + (6.5 / (3 + lambda)).toFixed(4) + '.';
  }
  slider.addEventListener('input', render);
  document.getElementById('lambda-reset').addEventListener('click', () => {
    slider.value = '0';
    render();
  });
  render();
})();
