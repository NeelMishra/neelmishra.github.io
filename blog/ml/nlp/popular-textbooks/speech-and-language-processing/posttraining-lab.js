(function () {
  'use strict';
  const policy = document.getElementById('posttraining-policy');
  if (!policy) return;
  const reference = document.getElementById('posttraining-reference');
  const betaControl = document.getElementById('posttraining-beta');
  const reset = document.getElementById('posttraining-reset');
  function logit(p) { return Math.log(p) - Math.log1p(-p); }
  function draw() {
    const p = Number(policy.value), ref = Number(reference.value), beta = Number(betaControl.value);
    const margin = logit(p) - logit(ref);
    const score = beta * margin;
    const preference = 1 / (1 + Math.exp(-score));
    const loss = Math.max(-score, 0) + Math.log1p(Math.exp(-Math.abs(score)));
    const derivative = -beta * (1 - preference);
    const kl = p * Math.log(p/ref) + (1-p) * Math.log((1-p)/(1-ref));
    document.getElementById('posttraining-policy-value').textContent = p.toFixed(2);
    document.getElementById('posttraining-reference-value').textContent = ref.toFixed(2);
    document.getElementById('posttraining-policy-bar').style.width = (100*p) + '%';
    document.getElementById('posttraining-reference-bar').style.width = (100*ref) + '%';
    document.getElementById('posttraining-lab-result').textContent =
      'Policy chosen probability ' + (100*p).toFixed(1) + '%; reference chosen probability ' + (100*ref).toFixed(1) +
      '%. Relative log-odds margin ' + margin.toFixed(4) + '; beta-scaled score ' + score.toFixed(4) +
      '. DPO preference probability ' + (100*preference).toFixed(2) + '%; loss ' + loss.toFixed(4) +
      ' nats. Loss derivative with respect to policy log odds ' + derivative.toFixed(4) +
      '. Full two-completion KL ' + Math.max(0,kl).toFixed(4) + ' nats.';
  }
  [policy, reference, betaControl, reset].forEach(control => { control.disabled = false; });
  policy.addEventListener('input', draw);
  reference.addEventListener('input', draw);
  betaControl.addEventListener('change', draw);
  reset.addEventListener('click', function () {
    policy.value = '.70'; reference.value = '.60'; betaControl.value = '.5'; draw();
  });
  draw();
}());
