/* ===== Obsidian-style Blog Graph View ===== */
/* Pure JS force-directed graph — no dependencies */

(function () {
  'use strict';

  /* ---- Flatten BLOG_TREE into nodes & edges ---- */
  function buildGraphData() {
    var nodes = [];
    var nodeMap = {};
    var edges = [];
    var edgeSet = {};

    BLOG_TREE.forEach(function (series) {
      series.posts.forEach(function (post) {
        var id = post.file;
        if (!nodeMap[id]) {
          var node = { id: id, title: post.title, series: series.name, x: 0, y: 0, vx: 0, vy: 0 };
          nodes.push(node);
          nodeMap[id] = node;
        }
      });
    });

    BLOG_TREE.forEach(function (series) {
      series.posts.forEach(function (post) {
        (post.links || []).forEach(function (target) {
          var key = [post.file, target].sort().join('|');
          if (!edgeSet[key] && nodeMap[target]) {
            edgeSet[key] = true;
            edges.push({ source: post.file, target: target });
          }
        });
      });
    });

    return { nodes: nodes, edges: edges, nodeMap: nodeMap };
  }

  /* ---- Series → colour mapping ---- */
  var SERIES_COLORS = {
    'C++ STL Series': '#0a8f6a',
    'C++ Deep Dives': '#ff6b35',
    'DSA Series': '#5b7fff'
  };
  function seriesColor(name) { return SERIES_COLORS[name] || '#0a8f6a'; }

  /* ---- Force simulation ---- */
  function ForceGraph(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var data = buildGraphData();
    var nodes = data.nodes;
    var edges = data.edges;
    var nodeMap = data.nodeMap;

    var width, height, dpr;
    var currentFile = opts.currentFile || '';
    var onNavigate = opts.onNavigate || function () {};
    var isFullPage = opts.fullPage || false;

    /* Layout parameters */
    var REPULSION = isFullPage ? 8000 : 3000;
    var ATTRACTION = 0.005;
    var DAMPING = 0.85;
    var CENTER_PULL = 0.01;
    var NODE_RADIUS = isFullPage ? 8 : 6;
    var LABEL_SIZE = isFullPage ? 13 : 11;

    /* Interaction state */
    var dragging = null;
    var hovering = null;
    var panX = 0, panY = 0;
    var scale = 1;
    var isPanning = false;
    var panStartX, panStartY, panStartPanX, panStartPanY;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initPositions() {
      var cx = width / 2, cy = height / 2;
      var r = Math.min(width, height) * 0.3;
      nodes.forEach(function (n, i) {
        var angle = (2 * Math.PI * i) / nodes.length;
        n.x = cx + r * Math.cos(angle);
        n.y = cy + r * Math.sin(angle);
        n.vx = 0;
        n.vy = 0;
      });
    }

    /* Physics step */
    function tick() {
      var cx = width / 2, cy = height / 2;
      var i, j, dx, dy, dist, force, n1, n2;

      /* Repulsion between all nodes */
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          n1 = nodes[i]; n2 = nodes[j];
          dx = n1.x - n2.x; dy = n1.y - n2.y;
          dist = Math.sqrt(dx * dx + dy * dy) || 1;
          force = REPULSION / (dist * dist);
          n1.vx += (dx / dist) * force;
          n1.vy += (dy / dist) * force;
          n2.vx -= (dx / dist) * force;
          n2.vy -= (dy / dist) * force;
        }
      }

      /* Attraction along edges */
      edges.forEach(function (e) {
        n1 = nodeMap[e.source]; n2 = nodeMap[e.target];
        if (!n1 || !n2) return;
        dx = n2.x - n1.x; dy = n2.y - n1.y;
        dist = Math.sqrt(dx * dx + dy * dy) || 1;
        force = dist * ATTRACTION;
        n1.vx += (dx / dist) * force;
        n1.vy += (dy / dist) * force;
        n2.vx -= (dx / dist) * force;
        n2.vy -= (dy / dist) * force;
      });

      /* Center gravity */
      nodes.forEach(function (n) {
        n.vx += (cx - n.x) * CENTER_PULL;
        n.vy += (cy - n.y) * CENTER_PULL;
      });

      /* Integrate and damp */
      nodes.forEach(function (n) {
        if (n === dragging) return;
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x += n.vx;
        n.y += n.vy;
      });
    }

    /* Draw */
    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(panX, panY);
      ctx.scale(scale, scale);

      /* Edges */
      edges.forEach(function (e) {
        var n1 = nodeMap[e.source], n2 = nodeMap[e.target];
        if (!n1 || !n2) return;
        var isHighlighted = hovering && (hovering.id === e.source || hovering.id === e.target);
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = isHighlighted ? 'rgba(10,143,106,0.6)' : 'rgba(74,90,83,0.15)';
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();
      });

      /* Nodes */
      nodes.forEach(function (n) {
        var isCurrent = n.id === currentFile;
        var isHover = hovering === n;
        var isConnected = hovering && isNeighbor(hovering.id, n.id);
        var dim = hovering && !isHover && !isConnected;

        var r = NODE_RADIUS;
        if (isHover || isCurrent) r += 2;

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);

        if (isCurrent) {
          ctx.fillStyle = '#ff6b35';
          ctx.shadowColor = 'rgba(255,107,53,0.4)';
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = dim ? 'rgba(10,143,106,0.2)' : seriesColor(n.series);
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }
        ctx.fill();

        /* Outer ring on hover */
        if (isHover) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 3, 0, Math.PI * 2);
          ctx.strokeStyle = seriesColor(n.series);
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      });

      /* Labels */
      ctx.font = LABEL_SIZE + 'px Manrope, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      nodes.forEach(function (n) {
        var isHover = hovering === n;
        var isCurrent = n.id === currentFile;
        var isConnected = hovering && isNeighbor(hovering.id, n.id);
        var dim = hovering && !isHover && !isConnected;

        ctx.fillStyle = dim ? 'rgba(74,90,83,0.25)' : (isCurrent ? '#ff6b35' : 'var(--ink, #13201a)');
        ctx.font = (isHover || isCurrent ? 'bold ' : '') + LABEL_SIZE + 'px Manrope, sans-serif';
        ctx.fillText(n.title, n.x, n.y + NODE_RADIUS + 5);
      });

      ctx.restore();
    }

    function isNeighbor(id, otherId) {
      return edges.some(function (e) {
        return (e.source === id && e.target === otherId) || (e.target === id && e.source === otherId);
      });
    }

    /* Mouse → canvas coordinates accounting for pan & zoom */
    function canvasCoords(e) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left - panX) / scale,
        y: (e.clientY - rect.top - panY) / scale
      };
    }

    function hitTest(mx, my) {
      for (var i = nodes.length - 1; i >= 0; i--) {
        var n = nodes[i];
        var dx = n.x - mx, dy = n.y - my;
        if (dx * dx + dy * dy < (NODE_RADIUS + 8) * (NODE_RADIUS + 8)) return n;
      }
      return null;
    }

    /* Event handlers */
    canvas.addEventListener('mousedown', function (e) {
      var p = canvasCoords(e);
      var hit = hitTest(p.x, p.y);
      if (hit) {
        dragging = hit;
        canvas.style.cursor = 'grabbing';
      } else {
        isPanning = true;
        panStartX = e.clientX;
        panStartY = e.clientY;
        panStartPanX = panX;
        panStartPanY = panY;
        canvas.style.cursor = 'grabbing';
      }
    });

    canvas.addEventListener('mousemove', function (e) {
      if (dragging) {
        var p = canvasCoords(e);
        dragging.x = p.x;
        dragging.y = p.y;
        dragging.vx = 0;
        dragging.vy = 0;
      } else if (isPanning) {
        panX = panStartPanX + (e.clientX - panStartX);
        panY = panStartPanY + (e.clientY - panStartY);
      } else {
        var p2 = canvasCoords(e);
        var hit = hitTest(p2.x, p2.y);
        hovering = hit;
        canvas.style.cursor = hit ? 'pointer' : 'grab';
      }
    });

    canvas.addEventListener('mouseup', function (e) {
      if (dragging) {
        canvas.style.cursor = 'grab';
        dragging = null;
      }
      isPanning = false;
    });

    canvas.addEventListener('mouseleave', function () {
      dragging = null;
      hovering = null;
      isPanning = false;
      canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('dblclick', function (e) {
      var p = canvasCoords(e);
      var hit = hitTest(p.x, p.y);
      if (hit) onNavigate(hit.id);
    });

    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var delta = e.deltaY > 0 ? 0.9 : 1.1;
      var newScale = Math.min(Math.max(scale * delta, 0.3), 4);
      panX = mx - (mx - panX) * (newScale / scale);
      panY = my - (my - panY) * (newScale / scale);
      scale = newScale;
    }, { passive: false });

    /* Animation loop */
    var running = true;
    function loop() {
      if (!running) return;
      tick();
      draw();
      requestAnimationFrame(loop);
    }

    /* Public API */
    this.start = function () {
      resize();
      initPositions();
      running = true;
      loop();

      var self = this;
      this._resizeHandler = function () { resize(); };
      window.addEventListener('resize', this._resizeHandler);
    };

    this.stop = function () {
      running = false;
      if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
    };

    this.setCurrentFile = function (file) { currentFile = file; };
  }

  /* ---- Mini graph preview (on blog pages) ---- */
  function initMiniGraph() {
    var container = document.querySelector('.graph-preview');
    if (!container) return;

    var canvas = container.querySelector('canvas');
    if (!canvas) return;

    var path = window.location.pathname;
    var currentFile = path.split('/').pop();
    var inBlogDir = path.indexOf('/blog/') !== -1;

    var graph = new ForceGraph(canvas, {
      currentFile: inBlogDir ? currentFile : '',
      fullPage: false,
      onNavigate: function (file) {
        window.location.href = (inBlogDir ? '' : 'blog/') + file;
      }
    });
    graph.start();
  }

  /* ---- Full-page graph ---- */
  function initFullGraph() {
    var canvas = document.getElementById('graph-canvas-full');
    if (!canvas) return;

    var path = window.location.pathname;
    var currentFile = path.split('/').pop();

    var graph = new ForceGraph(canvas, {
      currentFile: '',
      fullPage: true,
      onNavigate: function (file) {
        window.location.href = 'blog/' + file;
      }
    });
    graph.start();
  }

  /* Boot */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initMiniGraph(); initFullGraph(); });
  } else {
    initMiniGraph();
    initFullGraph();
  }
})();
