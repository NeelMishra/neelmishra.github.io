/* ===== Blog Navigation Tree ===== */
var BLOG_TREE = [
  {
    name: 'C++ STL Series',
    posts: [
      { title: 'Vectors', file: 'cpp-stl-vectors.html', links: ['cpp-stl-maps-sets.html'] },
      { title: 'Maps & Sets', file: 'cpp-stl-maps-sets.html', links: ['cpp-stl-vectors.html', 'cpp-stl-iterators.html'] },
      { title: 'Iterators', file: 'cpp-stl-iterators.html', links: ['cpp-stl-maps-sets.html', 'cpp-stl-algorithms.html'] },
      { title: 'Algorithms', file: 'cpp-stl-algorithms.html', links: ['cpp-stl-iterators.html', 'cpp-stl-smart-pointers.html'] },
      { title: 'Smart Pointers', file: 'cpp-stl-smart-pointers.html', links: ['cpp-stl-algorithms.html', 'cpp-raii.html'] }
    ]
  },
  {
    name: 'C++ Deep Dives',
    posts: [
      { title: 'RAII', file: 'cpp-raii.html', links: ['cpp-stl-smart-pointers.html'] }
    ]
  },
  {
    name: 'DSA Series',
    posts: [
      { title: 'Intro to Trees', file: 'dsa-trees-intro.html', links: ['dsa-trees-traversals.html'] },
      { title: 'Tree Traversals', file: 'dsa-trees-traversals.html', links: ['dsa-trees-intro.html', 'dsa-trees-bst.html'] },
      { title: 'Binary Search Trees', file: 'dsa-trees-bst.html', links: ['dsa-trees-traversals.html', 'dsa-trees-avl.html'] },
      { title: 'AVL Trees', file: 'dsa-trees-avl.html', links: ['dsa-trees-bst.html', 'dsa-trees-algorithms.html'] },
      { title: 'Tree Algorithms', file: 'dsa-trees-algorithms.html', links: ['dsa-trees-avl.html', 'dsa-trees-bst.html'] }
    ]
  }
];

(function buildBlogNav() {
  var nav = document.querySelector('.blog-nav');
  if (!nav) return;

  var path = window.location.pathname;
  var inBlogDir = path.indexOf('/blog/') !== -1;
  var prefix = inBlogDir ? '' : 'blog/';
  var currentFile = path.split('/').pop();

  var heading = document.createElement('h4');
  heading.textContent = 'All Blogs';
  nav.appendChild(heading);

  BLOG_TREE.forEach(function(series) {
    var btn = document.createElement('button');
    btn.className = 'blog-nav-series';
    btn.innerHTML = '<span class="chevron">&#9654;</span> ' + series.name;

    var ul = document.createElement('ul');
    ul.className = 'blog-nav-posts';

    var hasActive = false;
    series.posts.forEach(function(post) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = prefix + post.file;
      a.textContent = post.title;
      if (inBlogDir && currentFile === post.file) {
        a.classList.add('active');
        hasActive = true;
      }
      li.appendChild(a);
      ul.appendChild(li);
    });

    if (hasActive) btn.classList.add('open');

    btn.addEventListener('click', function() { btn.classList.toggle('open'); });

    nav.appendChild(btn);
    nav.appendChild(ul);
  });
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
