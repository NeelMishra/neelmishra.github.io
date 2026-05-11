/* === Shared self-assessment quiz component for blog posts ===
 * Usage:
 *   <div class="blog-quiz" id="my-quiz"></div>
 *   <script>
 *     BlogQuiz.create('my-quiz', {
 *       title: '\u{1F4DD} Quiz Title',
 *       intro: 'One sentence telling the reader what to do.',
 *       bank: [
 *         { meaning: 'prompt shown to user',
 *           answer: 'correct expression',
 *           distractors: ['wrong1', 'wrong2', 'wrong3'],
 *           explain: 'one-line explanation shown after answering' },
 *         ...
 *       ]
 *     });
 *   </script>
 *
 * The container element receives the .anim-container styling automatically.
 * Pure vanilla ES5-style JS, no dependencies.
 */
(function() {
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(c){
      return c === '&' ? '&amp;'
           : c === '<' ? '&lt;'
           : c === '>' ? '&gt;'
           : c === '"' ? '&quot;'
           : '&#39;';
    });
  }

  function create(containerId, config) {
    var root = document.getElementById(containerId);
    if (!root) return;

    var title = config.title || 'Quiz';
    var intro = config.intro || 'Click <strong>Start</strong> to begin.';
    var bank  = (config.bank || []).slice();
    var promptLabel = config.promptLabel || 'What is the identity for:';

    if (!bank.length) {
      root.innerHTML = '<em>(empty question bank)</em>';
      return;
    }

    root.classList.add('anim-container', 'blog-quiz');
    root.innerHTML =
      '<h4>' + title + '</h4>' +
      '<p class="bq-intro">' + intro + '</p>' +
      '<div class="bq-prompt">Press <strong>Start</strong> to begin.</div>' +
      '<div class="bq-choices"></div>' +
      '<div class="bq-feedback"></div>' +
      '<div class="anim-controls">' +
        '<button class="anim-btn bq-start" type="button">Start</button>' +
        '<button class="anim-btn bq-next"  type="button" style="display:none">Next &rarr;</button>' +
        '<button class="anim-btn bq-reset" type="button">Reset</button>' +
        '<span class="anim-output bq-score"></span>' +
      '</div>';

    var promptEl   = root.querySelector('.bq-prompt');
    var choicesEl  = root.querySelector('.bq-choices');
    var feedbackEl = root.querySelector('.bq-feedback');
    var scoreEl    = root.querySelector('.bq-score');
    var startBtn   = root.querySelector('.bq-start');
    var nextBtn    = root.querySelector('.bq-next');
    var resetBtn   = root.querySelector('.bq-reset');

    var order = [], idx = 0, correct = 0, total = 0, locked = false;

    function updateScore() {
      scoreEl.textContent = total === 0 ? '' : 'Score: ' + correct + ' / ' + total;
    }

    function renderQuestion() {
      locked = false;
      var q = bank[order[idx]];
      promptEl.innerHTML =
        '<span class="bq-qnum">Q' + (idx + 1) + ' of ' + order.length + '.</span> ' +
        promptLabel + ' <span class="bq-qmeaning">' + escapeHtml(q.meaning) + '</span>';
      feedbackEl.innerHTML = '';
      nextBtn.style.display = 'none';
      var opts = [q.answer].concat(q.distractors);
      shuffle(opts);
      choicesEl.innerHTML = '';
      opts.forEach(function(opt){
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bq-choice';
        btn.textContent = opt;
        btn.addEventListener('click', function(){ onChoice(btn, opt, q); });
        choicesEl.appendChild(btn);
      });
    }

    function onChoice(btn, picked, q) {
      if (locked) return;
      locked = true;
      total++;
      var isCorrect = picked === q.answer;
      if (isCorrect) correct++;
      var kids = choicesEl.children;
      for (var i = 0; i < kids.length; i++) {
        var c = kids[i];
        c.disabled = true;
        if (c.textContent === q.answer) c.classList.add('correct');
        else if (c === btn) c.classList.add('wrong');
      }
      var head = isCorrect
        ? '<strong class="bq-ok">&check; Correct.</strong> '
        : '<strong class="bq-no">&times; Not quite.</strong> The answer is <code>' + escapeHtml(q.answer) + '</code>. ';
      feedbackEl.innerHTML = head + escapeHtml(q.explain);
      updateScore();
      if (idx + 1 < order.length) {
        nextBtn.style.display = '';
      } else {
        nextBtn.style.display = 'none';
        feedbackEl.innerHTML += ' <strong>Bank complete &mdash; final score ' + correct + ' / ' + total + '. Hit Reset to reshuffle.</strong>';
      }
    }

    function start() {
      order = shuffle(bank.map(function(_, i){ return i; }));
      idx = 0; correct = 0; total = 0;
      updateScore();
      startBtn.style.display = 'none';
      renderQuestion();
    }

    function next() {
      if (idx + 1 >= order.length) return;
      idx++;
      renderQuestion();
    }

    function reset() {
      order = []; idx = 0; correct = 0; total = 0; locked = false;
      promptEl.innerHTML = 'Press <strong>Start</strong> to begin.';
      choicesEl.innerHTML = '';
      feedbackEl.innerHTML = '';
      nextBtn.style.display = 'none';
      startBtn.style.display = '';
      updateScore();
    }

    startBtn.addEventListener('click', start);
    nextBtn .addEventListener('click', next);
    resetBtn.addEventListener('click', reset);
  }

  window.BlogQuiz = { create: create };
})();
