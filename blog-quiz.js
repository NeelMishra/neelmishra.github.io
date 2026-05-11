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
 *           explain: 'shown after correct or below correct answer when wrong',
 *           distractors: [
 *             { text: 'wrong option', why: 'why THIS option is wrong' },
 *             'wrong option as plain string (no per-option why)',
 *             ...
 *           ]
 *         }, ...
 *       ]
 *     });
 *   </scr' + 'ipt>
 *
 * Each distractor may be a plain string (no specific why-wrong note) or
 * an object { text, why }. On a wrong pick the widget shows that
 * distractor's `why` (if present) followed by the correct answer and
 * the general `explain`. On a correct pick it shows only `explain`.
 *
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

  function normalizeDistractor(d) {
    if (typeof d === 'string') return { text: d, why: null };
    return { text: String(d.text), why: d.why || null };
  }

  function create(containerId, config) {
    var root = document.getElementById(containerId);
    if (!root) return;

    var title = config.title || 'Quiz';
    var intro = config.intro || 'Click <strong>Start</strong> to begin.';
    var bank  = (config.bank || []).slice();
    var promptLabel = typeof config.promptLabel === 'string'
      ? config.promptLabel
      : 'What is the identity for:';

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
    var whyByText = {};

    function updateScore() {
      scoreEl.textContent = total === 0 ? '' : 'Score: ' + correct + ' / ' + total;
    }

    function renderQuestion() {
      locked = false;
      var q = bank[order[idx]];
      var distractors = (q.distractors || []).map(normalizeDistractor);
      whyByText = {};
      distractors.forEach(function(d){ whyByText[d.text] = d.why; });

      promptEl.innerHTML =
        '<span class="bq-qnum">Q' + (idx + 1) + ' of ' + order.length + '.</span> ' +
        promptLabel + ' <span class="bq-qmeaning">' + escapeHtml(q.meaning) + '</span>';
      feedbackEl.innerHTML = '';
      nextBtn.style.display = 'none';

      var opts = [q.answer].concat(distractors.map(function(d){ return d.text; }));
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

      var html;
      if (isCorrect) {
        html = '<strong class="bq-ok">&check; Correct.</strong> ' + escapeHtml(q.explain || '');
      } else {
        var pickedWhy = whyByText[picked];
        html  = '<strong class="bq-no">&times; Not quite.</strong> ';
        html += '<code>' + escapeHtml(picked) + '</code>';
        html += pickedWhy
          ? ' &mdash; ' + escapeHtml(pickedWhy)
          : ' is not the right form here.';
        html += '<br><strong class="bq-answer">Answer:</strong> <code>' + escapeHtml(q.answer) + '</code>';
        if (q.explain) html += ' &mdash; ' + escapeHtml(q.explain);
      }
      feedbackEl.innerHTML = html;
      updateScore();

      if (idx + 1 < order.length) {
        nextBtn.style.display = '';
      } else {
        nextBtn.style.display = 'none';
        feedbackEl.innerHTML += '<br><strong>Bank complete &mdash; final score ' + correct + ' / ' + total + '. Hit Reset to reshuffle.</strong>';
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

