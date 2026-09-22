(() => {
  'use strict';
  const controls = document.getElementById('retrieval-controls');
  if (!controls) return;
  const documents = [
    {id: 'D1', text: 'home solar battery stores solar energy', relevant: true},
    {id: 'D2', text: 'solar panel makes electricity', relevant: false},
    {id: 'D3', text: 'home battery stores energy', relevant: true},
    {id: 'D4', text: 'household accumulator stores rooftop power', relevant: true},
    {id: 'D5', text: 'battery battery battery recycling guide', relevant: false},
    {id: 'D6', text: 'wind turbine makes electricity', relevant: false}
  ].map(doc => ({...doc, tokens: doc.text.split(' ')}));
  const meanLength = documents.reduce((total, doc) => total + doc.tokens.length, 0) / documents.length;
  const $ = id => document.getElementById(id);
  const k1Input = $('retrieval-k1');
  const bInput = $('retrieval-b');
  const cutoffInput = $('retrieval-cutoff');
  const expansionInput = $('retrieval-expansion');
  const number = value => value.toFixed(4);
  const percent = value => `${(100 * value).toFixed(1)}%`;

  function update() {
    const k1 = Number(k1Input.value);
    const b = Number(bInput.value);
    const cutoff = Number(cutoffInput.value);
    const terms = expansionInput.checked ? ['solar', 'battery', 'accumulator'] : ['solar', 'battery'];
    $('retrieval-k1-value').textContent = k1.toFixed(1);
    $('retrieval-b-value').textContent = b.toFixed(2);
    $('retrieval-cutoff-value').textContent = String(cutoff);
    const ranked = documents.filter(doc => terms.some(term => doc.tokens.includes(term))).map(doc => {
      const parts = terms.map(term => {
        const count = doc.tokens.filter(token => token === term).length;
        if (!count) return 0;
        const df = documents.filter(item => item.tokens.includes(term)).length;
        const lengthFactor = 1 - b + b * doc.tokens.length / meanLength;
        return Math.log(documents.length / df) * count / (count + k1 * lengthFactor);
      });
      return {...doc, parts, score: parts.reduce((total, value) => total + value, 0)};
    }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    const selected = ranked.slice(0, cutoff);
    const relevantCount = selected.filter(doc => doc.relevant).length;
    let found = 0;
    let precisionSum = 0;
    selected.forEach((doc, index) => {
      if (doc.relevant) {
        found += 1;
        precisionSum += found / (index + 1);
      }
    });
    const tbody = $('retrieval-ranking');
    tbody.replaceChildren();
    ranked.forEach((doc, index) => {
      const row = document.createElement('tr');
      const values = [`${index + 1}. ${doc.id}`, number(doc.score),
        doc.parts.map((value, i) => `${terms[i]}: ${number(value)}`).join('; '),
        doc.relevant ? 'Yes' : 'No', index < cutoff ? 'Returned' : 'Below cutoff'];
      values.forEach((value, column) => {
        const cell = document.createElement(column === 0 ? 'th' : 'td');
        if (column === 0) cell.scope = 'row';
        cell.textContent = value;
        row.appendChild(cell);
      });
      tbody.appendChild(row);
    });
    const missing = documents.filter(doc => doc.relevant && !selected.some(item => item.id === doc.id)).map(doc => doc.id);
    $('retrieval-query').textContent = `Query terms: ${terms.join(' + ')}. Lexical candidates: ${ranked.length} of 6. Average passage length stays 4.6667 tokens.`;
    $('retrieval-result').textContent = `Returned ${selected.length} of up to ${cutoff} requested passages: ${selected.map(doc => doc.id).join(', ')}. ` +
      `${relevantCount} are relevant. Precision among returned = ${relevantCount}/${selected.length} = ${percent(relevantCount / selected.length)}; ` +
      `recall = ${relevantCount}/3 = ${percent(relevantCount / 3)}; AP through cutoff ${cutoff} = ${number(precisionSum / 3)}. ` +
      (missing.length ? `Relevant passages still missing: ${missing.join(', ')}.` : 'All three relevant passages are returned.');
    $('retrieval-explanation').textContent = expansionInput.checked
      ? 'The added term makes D4 a candidate. Its relevance label has not changed. A short cutoff can still omit another relevant passage.'
      : 'D4 contains neither solar nor battery. No setting of k₁ or b can make it a lexical candidate for this query.';
  }
  controls.addEventListener('input', update);
  $('retrieval-reset').addEventListener('click', () => {
    k1Input.value = '1.2'; bInput.value = '0.75'; cutoffInput.value = '4'; expansionInput.checked = false; update();
  });
  update();
  controls.hidden = false;
})();
