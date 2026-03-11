/* ===== Blog Navigation Tree ===== */
/* Directory-based hierarchy with nested folders */
var BLOG_TREE = [
  {
    name: 'cpp',
    label: 'C++',
    children: [
      {
        name: 'stl',
        label: 'STL Series',
        children: [
          { title: 'Vectors', file: 'cpp/stl/vectors.html', links: ['cpp/stl/maps-sets.html'] },
          { title: 'Maps & Sets', file: 'cpp/stl/maps-sets.html', links: ['cpp/stl/vectors.html', 'cpp/stl/iterators.html'] },
          { title: 'Iterators', file: 'cpp/stl/iterators.html', links: ['cpp/stl/maps-sets.html', 'cpp/stl/algorithms.html'] },
          { title: 'Algorithms', file: 'cpp/stl/algorithms.html', links: ['cpp/stl/iterators.html', 'cpp/stl/smart-pointers.html'] },
          { title: 'Smart Pointers', file: 'cpp/stl/smart-pointers.html', links: ['cpp/stl/algorithms.html', 'cpp/deep-dives/raii.html'] }
        ]
      },
      {
        name: 'deep-dives',
        label: 'Deep Dives',
        children: [
          { title: 'RAII', file: 'cpp/deep-dives/raii.html', links: ['cpp/stl/smart-pointers.html', 'cpp/deep-dives/operator-overloading.html'] },
          { title: 'Operator Overloading', file: 'cpp/deep-dives/operator-overloading.html', links: ['cpp/deep-dives/raii.html'] }
        ]
      }
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
              { title: 'AVL Overview', file: 'dsa/trees/avl/index.html', links: ['dsa/trees/bst/index.html', 'dsa/trees/avl/rotations.html'] },
              { title: 'Rotations', file: 'dsa/trees/avl/rotations.html', links: ['dsa/trees/avl/index.html', 'dsa/trees/avl/insertdelete.html'] },
              { title: 'Insert & Delete', file: 'dsa/trees/avl/insertdelete.html', links: ['dsa/trees/avl/rotations.html', 'dsa/trees/avl/patterns.html'] },
              { title: 'Analysis & Patterns', file: 'dsa/trees/avl/patterns.html', links: ['dsa/trees/avl/insertdelete.html', 'dsa/trees/heap/index.html'] }
            ]
          },
          {
            name: 'heap',
            label: 'Binary Heaps',
            children: [
              { title: 'Binary Heaps & Priority Queues', file: 'dsa/trees/heap/index.html', links: ['dsa/trees/avl/patterns.html', 'dsa/trees/segment-tree/intro.html'] }
            ]
          },
          {
            name: 'segment-tree',
            label: 'Segment Trees',
            children: [
              { title: 'Introduction', file: 'dsa/trees/segment-tree/intro.html', links: ['dsa/trees/heap/index.html', 'dsa/trees/segment-tree/build-query.html'] },
              { title: 'Building & Querying', file: 'dsa/trees/segment-tree/build-query.html', links: ['dsa/trees/segment-tree/intro.html', 'dsa/trees/segment-tree/updates.html'] },
              { title: 'Updates', file: 'dsa/trees/segment-tree/updates.html', links: ['dsa/trees/segment-tree/build-query.html', 'dsa/trees/segment-tree/lazy.html'] },
              { title: 'Lazy Propagation', file: 'dsa/trees/segment-tree/lazy.html', links: ['dsa/trees/segment-tree/updates.html', 'dsa/trees/segment-tree/patterns.html'] },
              { title: 'Patterns & Practice', file: 'dsa/trees/segment-tree/patterns.html', links: ['dsa/trees/segment-tree/lazy.html', 'dsa/trees/fenwick-tree/intro.html'] }
            ]
          },
          {
            name: 'fenwick-tree',
            label: 'Fenwick Trees',
            children: [
              { title: 'Introduction', file: 'dsa/trees/fenwick-tree/intro.html', links: ['dsa/trees/segment-tree/patterns.html', 'dsa/trees/fenwick-tree/structure.html'] },
              { title: 'Structure & lowbit', file: 'dsa/trees/fenwick-tree/structure.html', links: ['dsa/trees/fenwick-tree/intro.html', 'dsa/trees/fenwick-tree/point-query.html'] },
              { title: 'Point Updates & Queries', file: 'dsa/trees/fenwick-tree/point-query.html', links: ['dsa/trees/fenwick-tree/structure.html', 'dsa/trees/fenwick-tree/range-operations.html'] },
              { title: 'Range Operations', file: 'dsa/trees/fenwick-tree/range-operations.html', links: ['dsa/trees/fenwick-tree/point-query.html', 'dsa/trees/fenwick-tree/patterns.html'] },
              { title: 'Patterns & Practice', file: 'dsa/trees/fenwick-tree/patterns.html', links: ['dsa/trees/fenwick-tree/range-operations.html', 'dsa/trees/algorithms/index.html'] }
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
              { title: 'Serialization', file: 'dsa/trees/algorithms/serialize.html', links: ['dsa/trees/algorithms/diameter.html', 'dsa/trees/algorithms/patterns.html'] },
              { title: 'Interview Patterns', file: 'dsa/trees/algorithms/patterns.html', links: ['dsa/trees/algorithms/serialize.html', 'dsa/trees/threaded/intro.html'] }
            ]
          },
          {
            name: 'threaded',
            label: 'Threaded Trees',
            children: [
              { title: 'Introduction', file: 'dsa/trees/threaded/intro.html', links: ['dsa/trees/algorithms/index.html', 'dsa/trees/threaded/construction.html'] },
              { title: 'Construction', file: 'dsa/trees/threaded/construction.html', links: ['dsa/trees/threaded/intro.html', 'dsa/trees/threaded/traversal.html'] },
              { title: 'Traversal', file: 'dsa/trees/threaded/traversal.html', links: ['dsa/trees/threaded/construction.html', 'dsa/trees/threaded/morris.html'] },
              { title: 'Morris Traversal', file: 'dsa/trees/threaded/morris.html', links: ['dsa/trees/threaded/traversal.html', 'dsa/trees/threaded/patterns.html'] },
              { title: 'Patterns & Practice', file: 'dsa/trees/threaded/patterns.html', links: ['dsa/trees/threaded/morris.html', 'dsa/trees/veb-tree/index.html'] }
            ]
          },
          {
            name: 'veb-tree',
            label: 'Van Emde Boas Trees',
            children: [
              { title: 'Overview', file: 'dsa/trees/veb-tree/index.html', links: ['dsa/trees/threaded/patterns.html', 'dsa/trees/veb-tree/intro.html'] },
              { title: 'The Predecessor Problem', file: 'dsa/trees/veb-tree/intro.html', links: ['dsa/trees/veb-tree/index.html', 'dsa/trees/veb-tree/structure.html'] },
              { title: 'The Recursive Structure', file: 'dsa/trees/veb-tree/structure.html', links: ['dsa/trees/veb-tree/intro.html', 'dsa/trees/veb-tree/operations.html'] },
              { title: 'Operations', file: 'dsa/trees/veb-tree/operations.html', links: ['dsa/trees/veb-tree/structure.html', 'dsa/trees/veb-tree/patterns.html'] },
              { title: 'Analysis & Patterns', file: 'dsa/trees/veb-tree/patterns.html', links: ['dsa/trees/veb-tree/operations.html', 'dsa/trees/b-tree/index.html'] }
            ]
          },
          {
            name: 'b-tree',
            label: 'B-Trees',
            children: [
              { title: 'B-Trees Overview', file: 'dsa/trees/b-tree/index.html', links: ['dsa/trees/veb-tree/patterns.html', 'dsa/trees/b-tree/operations.html'] },
              { title: 'Operations', file: 'dsa/trees/b-tree/operations.html', links: ['dsa/trees/b-tree/index.html', 'dsa/trees/b-tree/patterns.html'] },
              { title: 'Patterns & Analysis', file: 'dsa/trees/b-tree/patterns.html', links: ['dsa/trees/b-tree/operations.html', 'dsa/trees/b-plus-tree/index.html'] }
            ]
          },
          {
            name: 'b-plus-tree',
            label: 'B+ Trees',
            children: [
              { title: 'B+ Trees Overview', file: 'dsa/trees/b-plus-tree/index.html', links: ['dsa/trees/b-tree/patterns.html', 'dsa/trees/b-plus-tree/operations.html'] },
              { title: 'Operations', file: 'dsa/trees/b-plus-tree/operations.html', links: ['dsa/trees/b-plus-tree/index.html', 'dsa/trees/b-plus-tree/patterns.html'] },
              { title: 'Patterns & Real-World', file: 'dsa/trees/b-plus-tree/patterns.html', links: ['dsa/trees/b-plus-tree/operations.html', 'dsa/trees/trie/index.html'] }
            ]
          },
          {
            name: 'trie',
            label: 'Tries',
            children: [
              { title: 'Tries Overview', file: 'dsa/trees/trie/index.html', links: ['dsa/trees/b-plus-tree/patterns.html', 'dsa/trees/trie/operations.html'] },
              { title: 'Operations', file: 'dsa/trees/trie/operations.html', links: ['dsa/trees/trie/index.html', 'dsa/trees/trie/variants.html'] },
              { title: 'Variants', file: 'dsa/trees/trie/variants.html', links: ['dsa/trees/trie/operations.html', 'dsa/trees/trie/patterns.html'] },
              { title: 'Patterns & Interview', file: 'dsa/trees/trie/patterns.html', links: ['dsa/trees/trie/variants.html'] }
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
              { title: '2D & Advanced', file: 'dsa/arrays/prefix-sum/advanced.html', links: ['dsa/arrays/prefix-sum/patterns.html', 'dsa/trees/segment-tree/intro.html'] }
            ]
          }
        ]
      },
      {
        name: 'complexity',
        label: 'Time & Space Complexity',
        children: [
          { title: 'Overview', file: 'dsa/complexity/index.html', links: ['dsa/complexity/intro.html'] },
          { title: 'Introduction to Big-O', file: 'dsa/complexity/intro.html', links: ['dsa/complexity/index.html', 'dsa/complexity/asymptotic.html'] },
          { title: 'Asymptotic Notation', file: 'dsa/complexity/asymptotic.html', links: ['dsa/complexity/intro.html', 'dsa/complexity/common.html'] },
          { title: 'Common Complexities', file: 'dsa/complexity/common.html', links: ['dsa/complexity/asymptotic.html', 'dsa/complexity/recursion.html'] },
          { title: 'Recurrence Relations', file: 'dsa/complexity/recursion.html', links: ['dsa/complexity/common.html', 'dsa/complexity/amortized.html'] },
          { title: 'Amortized Analysis', file: 'dsa/complexity/amortized.html', links: ['dsa/complexity/recursion.html', 'dsa/complexity/space.html'] },
          { title: 'Space Complexity', file: 'dsa/complexity/space.html', links: ['dsa/complexity/amortized.html', 'dsa/complexity/logarithmic.html'] },
          { title: 'Why Logarithms Appear', file: 'dsa/complexity/logarithmic.html', links: ['dsa/complexity/space.html', 'dsa/complexity/sorting.html'] },
          { title: 'Sorting Lower Bounds', file: 'dsa/complexity/sorting.html', links: ['dsa/complexity/logarithmic.html', 'dsa/complexity/patterns.html'] },
          { title: 'Complexity Patterns', file: 'dsa/complexity/patterns.html', links: ['dsa/complexity/sorting.html'] }
        ]
      }
    ]
  },
  {
    name: 'lld',
    label: 'Low Level Design',
    children: [
      { title: 'Introduction', file: 'lld/intro.html', links: ['lld/design-patterns.html'] },
      { title: 'Design Patterns', file: 'lld/design-patterns.html', links: ['lld/intro.html', 'lld/parking-lot.html'] },
      { title: 'Design: Parking Lot', file: 'lld/parking-lot.html', links: ['lld/design-patterns.html', 'lld/elevator.html'] },
      { title: 'Design: Elevator System', file: 'lld/elevator.html', links: ['lld/parking-lot.html', 'lld/splitwise.html'] },
      { title: 'Design: Splitwise', file: 'lld/splitwise.html', links: ['lld/elevator.html', 'lld/patterns.html'] },
      { title: 'Interview Patterns', file: 'lld/patterns.html', links: ['lld/splitwise.html'] }
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
