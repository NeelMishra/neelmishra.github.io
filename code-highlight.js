/* Client-side syntax highlighting for blog code blocks.
   Loads highlight.js from a CDN (like KaTeX) and colors block code only:
   .blog-post-content pre > code. Inline code, .pseudo pseudocode blocks
   (no inner <code>), and .result output blocks (<div>) are left untouched.
   The existing dark code background is preserved; only tokens get colored. */
(function () {
  if (window.__codeHL) return;
  window.__codeHL = true;

  var VER = '11.9.0';
  var CDN = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/' + VER;

  function blocks() {
    return document.querySelectorAll('.blog-post-content pre > code');
  }

  function highlightAll() {
    if (!window.hljs) return;
    var list = blocks();
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      if (b.classList.contains('hljs')) continue;
      var t = b.textContent || '';
      // bias clearly-C++ blocks to cpp; let everything else auto-detect
      if (!/\blanguage-/.test(b.className) &&
          /#include|using namespace std|std::|int\s+main\s*\(|template\s*<|vector\s*<|cout\s*<<|cin\s*>>/.test(t)) {
        b.classList.add('language-cpp');
      }
      try { window.hljs.highlightElement(b); } catch (e) {}
    }
  }

  function boot() {
    if (!blocks().length) return; // nothing to highlight on this page

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CDN + '/styles/atom-one-dark.min.css';
    document.head.appendChild(link);

    // keep the site's dark code background; theme only colors the tokens
    var style = document.createElement('style');
    style.textContent =
      '.blog-post-content pre code.hljs{background:transparent;padding:0;color:#d4e8dc}' +
      '.blog-post-content pre code.hljs .hljs-comment{font-style:italic}';
    document.head.appendChild(style);

    if (window.hljs) { highlightAll(); return; }
    var s = document.createElement('script');
    s.src = CDN + '/highlight.min.js';
    s.onload = highlightAll;
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
