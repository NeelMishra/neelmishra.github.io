/* ===== Blog Navigation Tree ===== */
/* Directory-based hierarchy with nested folders */
var BLOG_TREE = [
  {
    name: 'cpp-stl',
    label: 'C++ STL Series',
    children: [
      { title: 'Vectors', file: 'cpp-stl/vectors.html', links: ['cpp-stl/maps-sets.html'] },
      { title: 'Maps & Sets', file: 'cpp-stl/maps-sets.html', links: ['cpp-stl/vectors.html', 'cpp-stl/iterators.html'] },
      { title: 'Iterators', file: 'cpp-stl/iterators.html', links: ['cpp-stl/maps-sets.html', 'cpp-stl/algorithms.html'] },
      { title: 'Algorithms', file: 'cpp-stl/algorithms.html', links: ['cpp-stl/iterators.html', 'cpp-stl/smart-pointers.html'] },
      { title: 'Smart Pointers', file: 'cpp-stl/smart-pointers.html', links: ['cpp-stl/algorithms.html', 'cpp-deep-dives/raii.html'] }
    ]
  },
  {
    name: 'cpp-deep-dives',
    label: 'C++ Deep Dives',
    children: [
      { title: 'RAII', file: 'cpp-deep-dives/raii.html', links: ['cpp-stl/smart-pointers.html'] }
    ]
  },
  {
    name: 'dsa',
    label: 'DSA Series',
    children: [
      {
        name: 'trees',
        label: 'Trees',
        children: [
          { title: 'Introduction', file: 'dsa/trees/intro.html', links: ['dsa/trees/traversals.html'] },
          { title: 'Traversals', file: 'dsa/trees/traversals.html', links: ['dsa/trees/intro.html', 'dsa/trees/bst.html'] },
          { title: 'BST', file: 'dsa/trees/bst.html', links: ['dsa/trees/traversals.html', 'dsa/trees/avl.html'] },
          { title: 'AVL Trees', file: 'dsa/trees/avl.html', links: ['dsa/trees/bst.html', 'dsa/trees/algorithms.html'] },
          { title: 'Algorithms & Patterns', file: 'dsa/trees/algorithms.html', links: ['dsa/trees/avl.html', 'dsa/trees/bst.html'] }
        ]
      }
    ]
  }
];

/* ===== Helper: flatten tree for graph ===== */
function flattenBlogTree(nodes, result) {
  nodes.forEach(function(node) {
    if (node.file) {
      result.push(node);
    }
    if (node.children) {
      flattenBlogTree(node.children, result);
    }
  });
  return result;
}

/* ===== Code-editor style file tree navigation ===== */
(function buildBlogNav() {
  var nav = document.querySelector('.blog-nav');
  if (!nav) return;

  var path = window.location.pathname;
  var inBlogDir = path.indexOf('/blog/') !== -1;
  /* Compute the file path relative to /blog/ */
  var blogIdx = path.indexOf('/blog/');
  var currentRelative = blogIdx !== -1 ? path.substring(blogIdx + 6) : '';

  /* prefix for links: from blog index page use 'blog/', from within blog dirs compute relative */
  function getHref(file) {
    if (!inBlogDir) return 'blog/' + file;
    /* Compute relative path from current page to target file */
    var curParts = currentRelative.split('/');
    curParts.pop(); /* remove filename */
    var tgtParts = file.split('/');
    /* Find common prefix */
    var common = 0;
    while (common < curParts.length && common < tgtParts.length - 1 && curParts[common] === tgtParts[common]) {
      common++;
    }
    var up = curParts.length - common;
    var rel = '';
    for (var i = 0; i < up; i++) rel += '../';
    rel += tgtParts.slice(common).join('/');
    return rel || tgtParts[tgtParts.length - 1];
  }

  var heading = document.createElement('h4');
  heading.textContent = 'Explorer';
  nav.appendChild(heading);

  function buildLevel(items, container, depth) {
    items.forEach(function(item) {
      if (item.children) {
        /* Folder node */
        var folder = document.createElement('div');
        folder.className = 'file-tree-folder';
        folder.style.paddingLeft = (depth * 12) + 'px';

        var btn = document.createElement('button');
        btn.className = 'file-tree-toggle';
        btn.innerHTML = '<span class="ft-chevron">&#9654;</span>' +
          '<span class="ft-icon ft-folder">&#128193;</span>' +
          '<span class="ft-label">' + item.label + '</span>';

        var childContainer = document.createElement('div');
        childContainer.className = 'file-tree-children';

        /* Check if any child is active to auto-expand */
        var hasActive = false;
        (function checkActive(nodes) {
          nodes.forEach(function(n) {
            if (n.file && currentRelative === n.file) hasActive = true;
            if (n.children) checkActive(n.children);
          });
        })(item.children);

        if (hasActive) {
          btn.classList.add('open');
          childContainer.classList.add('open');
        }

        btn.addEventListener('click', function() {
          btn.classList.toggle('open');
          childContainer.classList.toggle('open');
        });

        folder.appendChild(btn);
        container.appendChild(folder);
        container.appendChild(childContainer);
        buildLevel(item.children, childContainer, depth + 1);
      } else {
        /* File (leaf) node */
        var fileEl = document.createElement('a');
        fileEl.className = 'file-tree-file';
        fileEl.style.paddingLeft = (depth * 12 + 8) + 'px';
        fileEl.href = getHref(item.file);
        var ext = item.file.split('.').pop();
        var icon = ext === 'html' ? '&#128196;' : '&#128196;';
        fileEl.innerHTML = '<span class="ft-icon ft-file">' + icon + '</span>' +
          '<span class="ft-label">' + item.title + '</span>';

        if (currentRelative === item.file) {
          fileEl.classList.add('active');
        }
        container.appendChild(fileEl);
      }
    });
  }

  buildLevel(BLOG_TREE, nav, 0);
})();

/* Blog post: auto-generate TOC from headings */
(function buildTOC() {
  const sidebar = document.querySelector('.toc-section ul');
  const content = document.querySelector('.blog-post-content');
  if (!sidebar || !content) return;

  const headings = content.querySelectorAll('h2, h3');
  headings.forEach((h, i) => {
    if (!h.id) h.id = 'section-' + i;
    const li = document.createElement('li');
    if (h.tagName === 'H3') li.classList.add('depth-3');
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    sidebar.appendChild(li);
  });

  /* Scroll spy */
  const tocLinks = sidebar.querySelectorAll('a');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(l => l.classList.remove('active'));
        const active = sidebar.querySelector('a[href="#' + entry.target.id + '"]');
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });

  headings.forEach(h => obs.observe(h));
})();
