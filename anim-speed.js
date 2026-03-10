/* === Global Animation Speed Controller === */
(function(){
  var speed = 1;          // multiplier: 0.25 = 4× fast, 1 = normal, 2 = slow
  window.animDelay = function(ms){ return Math.round(ms * speed); };

  // Inject floating speed bar
  var bar = document.createElement('div');
  bar.className = 'speed-bar';
  bar.innerHTML =
    '<label class="speed-label">\u23F1 Speed</label>' +
    '<button class="speed-btn" data-speed="0.25">4\u00D7</button>' +
    '<button class="speed-btn" data-speed="0.5">2\u00D7</button>' +
    '<button class="speed-btn active" data-speed="1">1\u00D7</button>' +
    '<button class="speed-btn" data-speed="2">0.5\u00D7</button>' +
    '<button class="speed-btn" data-speed="3">0.3\u00D7</button>';

  var first = document.querySelector('.anim-container');
  if (first) first.parentNode.insertBefore(bar, first);

  bar.addEventListener('click', function(e){
    var btn = e.target.closest('.speed-btn');
    if (!btn) return;
    speed = parseFloat(btn.dataset.speed);
    bar.querySelectorAll('.speed-btn').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
  });
})();
