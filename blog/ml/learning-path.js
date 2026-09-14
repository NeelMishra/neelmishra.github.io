/* The topic order, prerequisites and entry pages come from the same tree as
   the Explorer and ML index. Related-post links are not prerequisite edges. */
(function () {
  'use strict';
  var host = document.getElementById('ml-learning-map');
  if (!host || typeof BLOG_TREE === 'undefined') return;
  var topics = BLOG_TREE.find(function (n) { return n.name === 'ml'; }).children.filter(function (n) { return n.learning; });
  var byName = {}, levels = {}, cards = {}, rows = [];
  var panel = document.querySelector('.ml-route');
  var routeList = document.getElementById('ml-route-list');
  var description = document.getElementById('ml-route-description');
  var next = document.getElementById('ml-route-next');
  topics.forEach(function (topic) { byName[topic.name] = topic; });
  function href(topic) { return topic.learning.start.replace(/^ml\//, ''); }
  function link(topic) {
    var a = document.createElement('a');
    a.href = href(topic);
    a.textContent = topic.learning.title;
    return a;
  }
  function select(name) {
    var ancestors = new Set();
    function visit(id) {
      if (ancestors.has(id)) return;
      ancestors.add(id);
      byName[id].learning.requires.forEach(visit);
    }
    visit(name);
    topics.forEach(function (topic) {
      var card = cards[topic.name];
      card.classList.toggle('is-required', ancestors.has(topic.name));
      card.classList.toggle('is-selected', topic.name === name);
      card.classList.toggle('is-other', !ancestors.has(topic.name));
      card.querySelector('button').setAttribute('aria-pressed', String(topic.name === name));
    });
    routeList.replaceChildren();
    topics.filter(function (topic) { return ancestors.has(topic.name); }).forEach(function (topic) {
      var li = document.createElement('li');
      li.dataset.topic = topic.name;
      li.appendChild(link(topic));
      var p = document.createElement('p');
      p.textContent = topic.learning.note;
      li.appendChild(p);
      routeList.appendChild(li);
    });
    panel.hidden = false;
    description.textContent = 'Route to ' + byName[name].learning.title + ': ' + ancestors.size + (ancestors.size === 1 ? ' topic. ' : ' topics. ') + 'Read the highlighted topics in the order below.';
    var continuations = topics.filter(function (topic) { return topic.learning.requires.includes(name); });
    next.replaceChildren();
    if (continuations.length) {
      next.append('Build on this topic: ');
      continuations.forEach(function (topic, i) {
        if (i) next.append(' · ');
        next.appendChild(link(topic));
      });
    } else next.textContent = 'Continue with the chapters in this series, or choose another branch above.';
  }
  topics.forEach(function (topic) {
    var requirements = topic.learning.requires;
    var level = requirements.length ? 1 + Math.max.apply(null, requirements.map(function (id) { return levels[id]; })) : 0;
    levels[topic.name] = level;
    if (!rows[level]) {
      var layer = document.createElement('div');
      layer.className = 'ml-map-layer';
      var label = document.createElement('span');
      label.className = 'ml-map-layer-label';
      label.textContent = level === 0 ? 'Start · shared foundations' : 'Level ' + level + ' · build on the earlier rows';
      layer.appendChild(label);
      rows[level] = document.createElement('div');
      rows[level].className = 'ml-map-nodes';
      layer.appendChild(rows[level]);
      host.appendChild(layer);
    }
    var card = document.createElement('div');
    card.className = 'ml-map-node';
    card.dataset.topic = topic.name;
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = topic.learning.title;
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-controls', 'ml-route-list');
    button.addEventListener('click', function () { select(topic.name); });
    card.appendChild(button);
    var before = document.createElement('p');
    before.textContent = requirements.length ? requirements.map(function (id) { return byName[id].learning.title; }).join(' + ') + ' → ' + topic.learning.title : 'Entry point · no earlier ML topic';
    card.appendChild(before);
    var start = link(topic);
    start.textContent = 'Open the reading guide →';
    card.appendChild(start);
    cards[topic.name] = card;
    rows[level].appendChild(card);
  });
  document.getElementById('ml-map-reset').addEventListener('click', function () {
    var selected = host.querySelector('[aria-pressed="true"]');
    topics.forEach(function (topic) {
      cards[topic.name].classList.remove('is-required', 'is-selected', 'is-other');
      cards[topic.name].querySelector('button').setAttribute('aria-pressed', 'false');
    });
    panel.hidden = true;
    if (selected) selected.focus();
  });
})();
