/* Fixed fitted stumps from the exact-fraction example. No training runs here. */
(() => {
  const select = document.getElementById('oob-row');
  if (!select) return;
  const models = [
    {sample:[1,1,3,5,5], cut:2, left:1, right:6},
    {sample:[2,2,3,4,4], cut:2.5, left:2, right:4},
    {sample:[1,2,2,4,5], cut:4.5, left:2.25, right:7}
  ];
  const targets = [1,2,4,4,7];
  const number = n => String(Number(n.toFixed(4)));
  function render() {
    const row = Number(select.value);
    const predictions = models.map(m => row < m.cut ? m.left : m.right);
    const eligible = models.map(m => !m.sample.includes(row));
    const cards = document.getElementById('oob-cards');
    cards.replaceChildren(...models.map((m,i) => {
      const card = document.createElement('div');
      if (eligible[i]) card.className = 'eligible';
      const title = document.createElement('strong');
      title.textContent = `T${i+1} → ${number(predictions[i])}`;
      const status = document.createElement('span');
      status.textContent = `${eligible[i] ? 'Omitted' : 'Saw'} row ${row}: ${eligible[i] ? 'eligible' : 'excluded'}`;
      const sample = document.createElement('span');
      sample.textContent = `Sample: ${m.sample.join(', ')}`;
      card.append(title,status,sample); return card;
    }));
    const allowed = predictions.filter((_,i) => eligible[i]);
    const mean = allowed.reduce((a,b)=>a+b,0)/allowed.length;
    const all = predictions.reduce((a,b)=>a+b,0)/models.length;
    document.getElementById('oob-result').textContent = `Row ${row}: target ${targets[row-1]}. OOB prediction ${number(mean)}; squared error ${number((targets[row-1]-mean)**2)}. Full-forest prediction ${number(all)}.`;
  }
  select.disabled = false;
  select.addEventListener('change',render);
  render();
})();
