(function () {
  'use strict';
  var prefixFigure = document.getElementById('seq-prefix');
  var beamFigure = document.getElementById('seq-beam');
  if (!prefixFigure || !beamFigure) return;
  function node(tag, text, className) {
    var result = document.createElement(tag);
    if (text !== undefined) result.textContent = text;
    if (className) result.className = className;
    return result;
  }
  function field(label, value) {
    var p = node('p'); p.append(node('small', label), document.createTextNode(value)); return p;
  }
  fetch(new URL('assets/sutskever-seq2seq-demo.json', window.location.href))
    .then(function (response) { if (!response.ok) throw new Error('Data unavailable'); return response.json(); })
    .then(function (data) {
      var modeInput = prefixFigure.querySelector('select'), widthInput = beamFigure.querySelector('select');
      function showPrefix() {
        var mode = modeInput.value, example = data[mode], container = prefixFigure.querySelector('[data-prefix-steps]');
        container.replaceChildren();
        example.trace.forEach(function (step) {
          var card = node('div'); card.append(node('strong', 'Step ' + step.step),
            field('Prefix', step.prefix.join(' ') || 'Empty'), field('Input now', step.input),
            field('Highest-probability token', step.top),
            field(mode === 'teacher' ? 'Reference token scored' : 'Token chosen', step.chosen + ' · ' + step.chosen_probability.toFixed(2)));
          container.appendChild(card);
        });
        prefixFigure.querySelector('output.note-status').textContent = mode === 'teacher'
          ? 'Teacher forcing scores carré rouge <EOS> with probability 0.36. It does not choose the most probable first token.'
          : 'Greedy generation produces cercle rouge <EOS> with probability 0.30. Its second step receives cercle, not the reference carré.';
        prefixFigure.dataset.result = JSON.stringify({mode: mode, tokens: example.tokens, probability: example.probability, secondInput: example.trace[1].input});
      }
      function candidates(container, rows) {
        container.replaceChildren();
        rows.forEach(function (candidate) {
          var row = node('div', undefined, 'seq-candidate ' + (candidate.retained ? 'kept' : 'pruned'));
          row.append(node('span', candidate.tokens.join(' ')), node('span', candidate.probability.toFixed(2) + ' · ' + (candidate.retained ? 'kept' : 'pruned')));
          container.appendChild(row);
        });
      }
      function showBeam() {
        var width = widthInput.value, example = data.beams[width];
        candidates(beamFigure.querySelector('[data-first-candidates]'), example.history[0].candidates);
        candidates(beamFigure.querySelector('[data-second-candidates]'), example.history[1].candidates);
        beamFigure.querySelector('output.note-status').textContent = 'Width ' + width + ' returns ' + example.tokens.join(' ') + ' with probability ' + example.probability.toFixed(2) + '. Every surviving path then adds EOS with probability 1.';
        beamFigure.dataset.result = JSON.stringify({width: Number(width), tokens: example.tokens, probability: example.probability});
      }
      modeInput.addEventListener('change', showPrefix); widthInput.addEventListener('change', showBeam);
      showPrefix(); showBeam();
      prefixFigure.querySelector('.note-controls').hidden = false;
      beamFigure.querySelector('.note-controls').hidden = false;
    }).catch(function () { /* The complete default figures remain readable without enhancement. */ });
}());
