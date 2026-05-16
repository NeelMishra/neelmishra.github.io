# Copilot Instructions — neelmishra.github.io

Personal site + technical blog served by **GitHub Pages**. Pure static HTML/CSS/JS — no bundler, no framework, no build step. The `.nojekyll` file disables Jekyll. `node_modules/` exists only for ad-hoc tooling (e.g. `jsdom`); there is no `package.json`.

## Project shape

- Top-level HTML pages: `index.html`, `experience.html`, `projects.html`, `blog.html`.
- Shared globals: `styles.css` (site), `blog.css` (blog), `tree-diagrams.css` (post diagrams), `script.js` (IntersectionObserver `reveal` animations), `anim-speed.js` (animation helpers), `blog-quiz.js` (shared self-assessment quiz widget — see below).
- Blog posts live under `blog/<category>/<series>/<slug>.html` (e.g. `blog/cpp/stl/vectors.html`, `blog/mlops/llm-training/...`). Categories: `cp`, `cpp`, `dsa`, `hld`, `lld`, `ml`, `mlops`.
- `assets/logos/` for image assets. `capture_collage.py` is a one-off Playwright script that snapshots `threaded_trees_collage.html` into a GIF/PNG.
- `tools/` contains the LeetCode contest automation pipeline (Python) — see "Tooling pipeline" below.

## Blog post registry — both files must be updated

A new post is **not visible** until it is registered in two places:

1. **`blog.js` → `BLOG_TREE`** — the nested directory/series structure that drives the sidebar nav. Each leaf is `{ title, file, links: [...] }` where `links` is the cross-link list shown in the post footer (use 1–2 sibling/related post paths).
2. **`blog-posts.js` → `BLOG_POSTS`** — a flat object keyed by the same `file` path, containing `{ category, series, title, description, meta }`. This drives the blog index cards and search.

Keep the keys in `BLOG_POSTS` exactly equal to the `file` values in `BLOG_TREE`. Mismatches silently break the index.

**Auto-managed regions — do not hand-edit.** Inside both files, the LeetCode-contests subtree lives between marker comments and is rewritten by `tools/update_registries.py`:

- `blog.js`: `// LCBLOG-START …  // LCBLOG-END` (inside `dsa.children`)
- `blog-posts.js`: `/* LCBLOG-START */ … /* LCBLOG-END */` (inside `BLOG_POSTS`)

To add/modify LeetCode-contest entries, edit `tools/contests.json` and re-run `python3 tools/update_registries.py`. Hand edits inside the markers will be clobbered on the next run.

## Blog post HTML conventions

Use an existing post (e.g. `blog/cpp/stl/vectors.html`) as a template. Every post:

- Includes the standard `<header class="site-header">` nav with `../../..` (or correct depth) prefixes back to root pages, and marks Blog as `class="active"`.
- Loads `styles.css`, `blog.css`, and `tree-diagrams.css` (if it uses tree diagrams) with the matching relative path.
- Wraps content in `<div class="blog-post-layout"> <aside class="blog-sidebar"><nav class="blog-nav"></nav><div class="toc-section">…</div></aside> <article class="blog-post-content reveal">…</article> </div>`. The empty `.blog-nav` and `.toc-section ul` are populated by `blog.js` at runtime — do not hand-fill them.
- Uses `<h2 id="…">` for sections so the auto-generated TOC links resolve.
- Loads `script.js`, `blog-posts.js`, `blog.js` at the bottom (and `anim-speed.js` if the post has animations), plus the GoatCounter snippet present in existing posts.

Section/element classes that trigger behaviour:

- `.reveal` — fades in via `IntersectionObserver` in `script.js`.
- `.anim-container` with an inner `<svg>` — animation widgets. Use the helpers `window.animRunner(steps, baseDelay, onDone)`, `window.animTimeout`, `window.addArrowMarker(svg, id, color)`, `window.drawAnimArrow(svg, x1,y1,x2,y2,color,id)`, and `window.renderDSPanel(el, title, items, opts)` from `anim-speed.js`. Speed/pause are stubbed — keep animations step-driven.
- `.blog-quiz` (with a unique `id`) — self-assessment quiz. Load `blog-quiz.js` and instantiate with `BlogQuiz.create('quiz-id', { title, intro, bank: [{ meaning, answer, explain, distractors: [...] }, ...] })`. Distractors may be plain strings or `{ text, why }` objects. See `blog/dsa/bit-manipulation/bit-identities.html` for a working example.

For posts that need math, follow the LeetCode-contest scaffold (`blog/dsa/leetcode-contests/**`): it loads KaTeX from a CDN and auto-renders `$...$` (inline) and `$$...$$` (display) on load. Don't introduce a different math renderer.

## Style conventions

- Vanilla ES5-ish JS (`var`, IIFEs, no modules, no transpiling). Match the existing style — do not introduce TypeScript, JSX, imports, or build tooling.
- CSS uses CSS variables defined in `styles.css` (`--ink-muted`, `--line`, `--card`, `--brand`, …). Reuse them rather than hardcoding colours.
- Fonts are loaded from Google Fonts (Manrope, Playfair Display, Syne) in each HTML head.

## Running / testing

There is no test suite, lint, or build. To preview, serve the directory statically (e.g. `python3 -m http.server` from the repo root) and open `index.html` / `blog.html`. Verify any new post by:

1. Confirming it appears in the sidebar tree and on `blog.html`.
2. Clicking it loads correctly and the TOC + cross-links populate.
3. Any animations run when scrolled into view.

`capture_collage.py` requires `playwright` and `Pillow`; it is not part of normal site changes.

## Tooling pipeline (`tools/`)

LeetCode-contests is the one part of the blog generated by scripts rather than authored by hand. The flow is:

1. `python3 tools/leetcode_manifest.py` — fetches contest + problem metadata from `doocs/leetcode` (no auth) and writes `tools/contests.json`. Re-run when new contests appear.
2. `python3 tools/scaffold_contests.py` — materializes per-problem HTML stubs under `blog/dsa/leetcode-contests/<weekly|biweekly>/<NNN>/`. **Idempotent**: existing files are kept unless `--force` is passed, so previously written editorials aren't clobbered. Use `--only weekly:495` to scaffold one contest.
3. `python3 tools/update_registries.py` — rewrites the `LCBLOG-START…LCBLOG-END` regions in `blog.js` and `blog-posts.js` so the new pages show up in the sidebar/index.

Scaffolded problem pages contain placeholder section markers that editorial writers fill in (intuition, brute force, optimal, dry run, complexity, edge cases, C++ code):

```
<!-- LCBLOG:STATEMENT --> … <!-- /LCBLOG:STATEMENT -->
<!-- LCBLOG:INTUITION --> … <!-- /LCBLOG:INTUITION -->
<!-- LCBLOG:BRUTE -->     … <!-- /LCBLOG:BRUTE -->
<!-- LCBLOG:OPTIMAL -->   … <!-- /LCBLOG:OPTIMAL -->
<!-- LCBLOG:DRY-RUN -->   … <!-- /LCBLOG:DRY-RUN -->
<!-- LCBLOG:COMPLEXITY --> … <!-- /LCBLOG:COMPLEXITY -->
<!-- LCBLOG:EDGE-CASES --> … <!-- /LCBLOG:EDGE-CASES -->
<!-- LCBLOG:CODE -->      … <!-- /LCBLOG:CODE -->
```

Keep the markers in place when writing an editorial — they delimit the auto-generated structure and may be re-targeted by future tooling. The `.callout.warn` "Editorial in progress" block at the top should be removed once a page is complete.

A custom agent definition for this exact workflow lives at `.github/agents/Site Document Expander.agent.md`.
