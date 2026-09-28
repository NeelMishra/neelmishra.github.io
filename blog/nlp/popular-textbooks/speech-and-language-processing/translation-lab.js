(() => {
  'use strict';
  const controls = document.getElementById('translation-controls');
  if (!controls) return;
  const widthInput = document.getElementById('translation-width');
  const probabilityInput = document.getElementById('translation-probability');
  const probabilityLabel = document.getElementById('translation-probability-value');
  const result = document.getElementById('translation-result');
  const traceNode = document.getElementById('translation-trace');
  const order = new Map(['the', 'a', 'cat', 'dog', 'EOS'].map((token, i) => [token, i]));

  function transitions(path, pA) {
    if (path.length === 0) return [['the', 0.95 - pA], ['a', pA], ['EOS', 0.05]];
    if (path.length === 2) return [['EOS', 1]];
    return path[0] === 'the'
      ? [['cat', 0.45], ['dog', 0.35], ['EOS', 0.20]]
      : [['cat', 0.80], ['dog', 0.15], ['EOS', 0.05]];
  }

  function compare(a, b) {
    const difference = b.probability - a.probability;
    if (Math.abs(difference) > 1e-12) return difference;
    for (let i = 0; i < Math.min(a.path.length, b.path.length); i += 1) {
      const tokenDifference = order.get(a.path[i]) - order.get(b.path[i]);
      if (tokenDifference) return tokenDifference;
    }
    return a.path.length - b.path.length;
  }

  function extend(item, pA) {
    return transitions(item.path, pA).map(([token, conditional]) => ({
      path: [...item.path, token],
      conditional,
      probability: item.probability * conditional,
      complete: token === 'EOS'
    }));
  }

  function enumerate(pA) {
    const completed = [];
    function visit(item) {
      if (item.complete) completed.push(item);
      else extend(item, pA).forEach(visit);
    }
    visit({ path: [], probability: 1, complete: false });
    return completed.sort(compare);
  }

  function beamSearch(width, pA) {
    let active = [{ path: [], probability: 1, complete: false }];
    let capacity = width;
    const completed = [];
    const steps = [];
    while (active.length && capacity > 0) {
      const expanded = active.flatMap(item => extend(item, pA)).sort(compare);
      const chosen = expanded.slice(0, capacity);
      const chosenSet = new Set(chosen);
      steps.push({ capacity, rows: expanded.map(item => ({
        ...item, status: chosenSet.has(item) ? (item.complete ? 'Saved complete' : 'Kept active') : 'Pruned'
      })) });
      const newlyComplete = chosen.filter(item => item.complete);
      completed.push(...newlyComplete);
      capacity -= newlyComplete.length;
      active = chosen.filter(item => !item.complete);
    }
    return { completed: completed.sort(compare), steps };
  }

  function el(tag, content, className) {
    const node = document.createElement(tag);
    if (content !== undefined) node.textContent = content;
    if (className) node.className = className;
    return node;
  }

  function renderTrace(steps) {
    const fragment = document.createDocumentFragment();
    steps.forEach((step, index) => {
      const section = el('section', undefined, 'translation-step');
      const heading = el('h4', `Step ${index + 1}: ${step.capacity} available beam ${step.capacity === 1 ? 'slot' : 'slots'}`);
      section.append(heading);
      const wrap = el('div', undefined, 'textbook-table-wrap');
      wrap.tabIndex = 0;
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-label', `Step ${index + 1} search candidates, scroll horizontally if needed`);
      const table = el('table');
      const caption = el('caption', 'All extensions, ranked by complete prefix probability');
      const head = el('thead');
      const headRow = el('tr');
      ['Path', 'Last-token P', 'Path P', 'Decision'].forEach(label => {
        const th = el('th', label); th.scope = 'col'; headRow.append(th);
      });
      head.append(headRow);
      const body = el('tbody');
      step.rows.forEach(item => {
        const row = el('tr', undefined, item.status === 'Pruned' ? 'translation-pruned' : 'translation-kept');
        const pathCell = el('th', item.path.join(' ')); pathCell.scope = 'row';
        row.append(pathCell, el('td', item.conditional.toFixed(2)), el('td', item.probability.toFixed(6)), el('td', item.status));
        body.append(row);
      });
      table.append(caption, head, body); wrap.append(table); section.append(wrap); fragment.append(section);
    });
    traceNode.replaceChildren(fragment);
  }

  function update() {
    const width = Number(widthInput.value);
    const pA = Number(probabilityInput.value) / 100;
    probabilityLabel.textContent = pA.toFixed(2);
    const search = beamSearch(width, pA);
    const best = search.completed[0];
    const exact = enumerate(pA)[0];
    const greedy = beamSearch(1, pA).completed[0];
    const gap = Math.max(0, exact.probability - best.probability);
    result.textContent = `P(the) = ${(0.95 - pA).toFixed(2)}, P(a) = ${pA.toFixed(2)}, P(EOS) = 0.05. ` +
      `Beam width ${width} returns ${best.path.join(' ')} with probability ${best.probability.toFixed(6)} ` +
      `(log probability ${Math.log(best.probability).toFixed(6)}). ` +
      `Exhaustive best: ${exact.path.join(' ')}, probability ${exact.probability.toFixed(6)}. ` +
      `Probability gap: ${gap.toFixed(6)}. Greedy returns ${greedy.path.join(' ')}, probability ${greedy.probability.toFixed(6)}.`;
    renderTrace(search.steps);
  }

  widthInput.addEventListener('change', update);
  probabilityInput.addEventListener('input', update);
  document.getElementById('translation-reset').addEventListener('click', () => {
    widthInput.value = '2'; probabilityInput.value = '40'; update();
  });
  update();
  controls.hidden = false;
  traceNode.hidden = false;
})();
