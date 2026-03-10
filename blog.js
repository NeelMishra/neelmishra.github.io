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
      { title: 'RAII', file: 'cpp-deep-dives/raii.html', links: ['cpp-stl/smart-pointers.html', 'cpp-deep-dives/operator-overloading.html'] },
      { title: 'Operator Overloading', file: 'cpp-deep-dives/operator-overloading.html', links: ['cpp-deep-dives/raii.html'] }
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
          { title: 'Introduction', file: 'dsa/trees/intro.html', links: ['dsa/trees/traversals/index.html'] },
          {
            name: 'traversals',
            label: 'Traversals',
            children: [
              { title: 'Tree Traversals', file: 'dsa/trees/traversals/index.html', links: ['dsa/trees/intro.html', 'dsa/trees/bst/index.html'] }
            ]
          },
          {
            name: 'bst',
            label: 'Binary Search Trees',
            children: [
              { title: 'BST', file: 'dsa/trees/bst/index.html', links: ['dsa/trees/traversals/index.html', 'dsa/trees/avl/index.html'] }
            ]
          },
          {
            name: 'avl',
            label: 'AVL Trees',
            children: [
              { title: 'AVL Trees', file: 'dsa/trees/avl/index.html', links: ['dsa/trees/bst/index.html', 'dsa/trees/heap/index.html'] }
            ]
          },
          {
            name: 'heap',
            label: 'Binary Heaps',
            children: [
              { title: 'Binary Heaps & Priority Queues', file: 'dsa/trees/heap/index.html', links: ['dsa/trees/avl/index.html', 'dsa/trees/segment-tree/index.html'] }
            ]
          },
          {
            name: 'segment-tree',
            label: 'Segment Trees',
            children: [
              { title: 'Segment Trees', file: 'dsa/trees/segment-tree/index.html', links: ['dsa/trees/heap/index.html', 'dsa/trees/algorithms/index.html'] }
            ]
          },
          {
            name: 'algorithms',
            label: 'Algorithms & Patterns',
            children: [
              { title: 'Overview', file: 'dsa/trees/algorithms/index.html', links: ['dsa/trees/avl/index.html', 'dsa/trees/algorithms/height.html'] },
              { title: 'Height', file: 'dsa/trees/algorithms/height.html', links: ['dsa/trees/algorithms/index.html', 'dsa/trees/algorithms/lca.html'] },
              { title: 'LCA', file: 'dsa/trees/algorithms/lca.html', links: ['dsa/trees/algorithms/height.html', 'dsa/trees/algorithms/diameter.html'] },
              { title: 'Diameter', file: 'dsa/trees/algorithms/diameter.html', links: ['dsa/trees/algorithms/lca.html', 'dsa/trees/algorithms/serialize.html'] },
              { title: 'Serialization', file: 'dsa/trees/algorithms/serialize.html', links: ['dsa/trees/algorithms/diameter.html', 'dsa/trees/algorithms/morris.html'] },
              { title: 'Morris Traversal', file: 'dsa/trees/algorithms/morris.html', links: ['dsa/trees/algorithms/serialize.html', 'dsa/trees/algorithms/patterns.html'] },
              { title: 'Interview Patterns', file: 'dsa/trees/algorithms/patterns.html', links: ['dsa/trees/algorithms/morris.html', 'dsa/trees/threaded/intro.html'] }
            ]
          },
          {
            name: 'threaded',
            label: 'Threaded Trees',
            children: [
              { title: 'Introduction', file: 'dsa/trees/threaded/intro.html', links: ['dsa/trees/algorithms/index.html', 'dsa/trees/threaded/construction.html'] },
              { title: 'Construction', file: 'dsa/trees/threaded/construction.html', links: ['dsa/trees/threaded/intro.html', 'dsa/trees/threaded/traversal.html'] },
              { title: 'Traversal', file: 'dsa/trees/threaded/traversal.html', links: ['dsa/trees/threaded/construction.html', 'dsa/trees/threaded/patterns.html'] },
              { title: 'Patterns & Practice', file: 'dsa/trees/threaded/patterns.html', links: ['dsa/trees/threaded/traversal.html'] }
            ]
          }
        ]
      },
      {
        name: 'arrays',
        label: 'Arrays',
        children: [
          {
            name: 'prefix-sum',
            label: 'Prefix Sum',
            children: [
              { title: 'Fundamentals', file: 'dsa/arrays/prefix-sum/index.html', links: ['dsa/arrays/prefix-sum/patterns.html'] },
              { title: 'Patterns', file: 'dsa/arrays/prefix-sum/patterns.html', links: ['dsa/arrays/prefix-sum/index.html', 'dsa/arrays/prefix-sum/advanced.html'] },
              { title: '2D & Advanced', file: 'dsa/arrays/prefix-sum/advanced.html', links: ['dsa/arrays/prefix-sum/patterns.html', 'dsa/trees/segment-tree/index.html'] }
            ]
          }
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
