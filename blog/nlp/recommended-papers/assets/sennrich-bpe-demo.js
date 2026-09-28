(function () {
  'use strict';
  var training = document.getElementById('bpe-training');
  var replay = document.getElementById('bpe-replay');
  if (!training || !replay) return;
  function node(tag, text, className) {
    var element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function pieces(tokens) {
    var row = node('div', undefined, 'bpe-pieces');
    tokens.forEach(function (token) { row.appendChild(node('code', token)); });
    return row;
  }
  fetch(new URL('assets/sennrich-bpe-demo.json', window.location.href))
    .then(function (response) {
      if (!response.ok) throw new Error('BPE teaching data unavailable');
      return response.json();
    }).then(function (data) {
      var stepInput = training.querySelector('select');
      var wordInput = replay.querySelector('select');
      function showTraining() {
        var step = Number(stepInput.value), state = data.states[step];
        var rows = training.querySelector('[data-training-words]');
        rows.replaceChildren();
        Object.keys(data.corpus).forEach(function (word) {
          var row = node('div', undefined, 'bpe-row');
          var label = node('span', word);
          label.appendChild(node('small', data.corpus[word] + ' occurrence' + (data.corpus[word] === 1 ? '' : 's')));
          row.append(label, pieces(state.words[word])); rows.appendChild(row);
        });
        training.querySelector('[data-symbol-bar]').setAttribute('width', 240 * state.symbol_count / 92);
        training.querySelector('[data-symbol-count]').textContent = state.symbol_count;
        training.querySelector('#bpe-count-desc').textContent = 'Before merging, the corpus has 92 symbols including end markers. After ' + step + ' merges it has ' + state.symbol_count + '.';
        var counts = training.querySelector('[data-pair-counts]'); counts.replaceChildren();
        state.top_pairs.forEach(function (entry) {
          var row = node('tr'); row.append(node('td', entry.pair.join(' + ')), node('td', entry.count)); counts.appendChild(row);
        });
        training.querySelector('output.note-status').textContent = step < data.rules.length
          ? 'Next merge: ' + data.rules[step].pair.join(' + ') + ', with weighted count ' + data.rules[step].count + '.'
          : 'Stop at the six-merge budget: 23 symbols remain. Further pairs exist, but no seventh rule is learned.';
        training.dataset.result = JSON.stringify({step: step, symbols: state.symbol_count, words: state.words});
      }
      function showReplay() {
        var word = wordInput.value, trace = data.traces[word];
        var rows = replay.querySelector('[data-trace]'); rows.replaceChildren();
        trace.forEach(function (state) {
          var title = state.rank ? state.rank + ' · ' + data.rules[state.rank - 1].pair.join(' + ') : 'Start · characters and boundary';
          var skip = state.rank > 0 && !state.changed;
          if (skip) title += ' · absent, so skip';
          var row = node('div', undefined, skip ? 'skipped' : undefined);
          row.append(node('strong', title), pieces(state.tokens)); rows.appendChild(row);
        });
        var final = trace[trace.length - 1].tokens;
        replay.querySelector('output.note-status').textContent = word + ' becomes ' + final.length + ' symbols: ' + final.join(' | ') + '. Joining and removing the final marker recovers ' + word + '.';
        replay.dataset.result = JSON.stringify({word: word, tokens: final});
      }
      stepInput.addEventListener('change', showTraining);
      wordInput.addEventListener('change', showReplay);
      showTraining(); showReplay();
      training.querySelector('.note-controls').hidden = false;
      replay.querySelector('.note-controls').hidden = false;
    }).catch(function () {
      // The fully worked default figures remain readable if enhancement fails.
    });
}());
