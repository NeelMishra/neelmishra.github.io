#!/usr/bin/env python3
"""
tools/scaffold_contests.py

Reads tools/contests.json and materializes the LeetCode Past Contests blog
tree under blog/dsa/leetcode-contests/. Idempotent: existing files are
*not* overwritten unless --force is passed (so the fleet's editorial
content is never clobbered by a re-scaffold).

Layout produced
---------------
  blog/dsa/leetcode-contests/
    index.html                                # series landing page
    weekly/NNN/index.html                     # contest landing page
    weekly/NNN/qK-<slug>.html                 # one per problem (1..4)
    biweekly/NNN/index.html
    biweekly/NNN/qK-<slug>.html

Every problem stub is a publishable, self-contained HTML page that:
  * matches the repo's blog post template (header, sidebar, .blog-post-content),
  * loads the standard styles.css/blog.css with the correct relative depth,
  * embeds the LeetCode link and the doocs README link (so a fleet agent
    has the data it needs to write the editorial without re-querying),
  * contains placeholder section markers the fleet writer replaces:
        <!-- LCBLOG:STATEMENT --> ... <!-- /LCBLOG:STATEMENT -->
        ... INTUITION / BRUTE / OPTIMAL / DRY-RUN / COMPLEXITY / EDGE-CASES / CODE
  * shows a "Editorial in progress" callout so the page is useful even
    before the fleet has filled it in.

Usage
-----
  python3 tools/scaffold_contests.py            # write only missing files
  python3 tools/scaffold_contests.py --force    # rewrite every stub
  python3 tools/scaffold_contests.py --only weekly:495  # one contest
"""
from __future__ import annotations

import argparse
import json
import sys
from html import escape
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SERIES_DIR = REPO / "blog" / "dsa" / "leetcode-contests"
MANIFEST = Path(__file__).resolve().parent / "contests.json"

# Path depths (relative path back to the repo root):
#   blog/dsa/leetcode-contests/index.html              -> ../../../
#   blog/dsa/leetcode-contests/<kind>/<NNN>/...html    -> ../../../../../
DEPTH_SERIES = "../../../"
DEPTH_CONTEST = "../../../../../"


# ---------------------------------------------------------------------------
# HTML templates
# ---------------------------------------------------------------------------

HEAD_COMMON = """<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{description}">
  <title>{title} | Neel Mishra</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Playfair+Display:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{depth}styles.css">
  <link rel="stylesheet" href="{depth}blog.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body,{{delimiters:[{{left:'$$',right:'$$',display:true}},{{left:'$',right:'$',display:false}}]}})"></script>
  <style>
    .pseudo-code{{white-space:pre;font-family:Consolas,monospace;font-size:0.85rem;background:#1a1a2e;color:#e0e0e0;padding:1.4rem 1.6rem;border-radius:10px;overflow-x:auto;line-height:1.8;margin:1.2rem 0}}
    .pseudo-code .kw{{color:#ff6b35;font-weight:700}}
    .pseudo-code .fn{{color:#0a8f6a}}
    .pseudo-code .cm{{color:#666;font-style:italic}}
    .pseudo-code .tp{{color:#3498db}}
    .pseudo-code .str{{color:#e6db74}}
    .pseudo-code .num{{color:#ae81ff}}
    .callout{{border-left:4px solid var(--brand);padding:0.8rem 1rem;margin:1rem 0;background:rgba(10,143,106,0.05);border-radius:0 8px 8px 0}}
    .callout.warn{{border-left-color:#ff6b35;background:rgba(255,107,53,0.05)}}
    .lc-meta{{display:flex;gap:0.7rem;flex-wrap:wrap;font-size:0.85rem;color:var(--ink-muted);margin:0.4rem 0 1.2rem}}
    .lc-meta span{{padding:0.18rem 0.6rem;border:1px solid var(--line);border-radius:999px;background:var(--card)}}
    .lc-meta .diff-easy{{color:#0a8f6a;border-color:#0a8f6a}}
    .lc-meta .diff-medium{{color:#d97706;border-color:#d97706}}
    .lc-meta .diff-hard{{color:#dc2626;border-color:#dc2626}}
    .problem-grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem;margin:1.5rem 0}}
    .problem-card{{border:1px solid var(--line);border-radius:12px;padding:1rem 1.1rem;background:var(--card);transition:transform 0.15s, border-color 0.15s}}
    .problem-card:hover{{transform:translateY(-2px);border-color:var(--brand)}}
    .problem-card a{{text-decoration:none;color:inherit}}
    .problem-card h4{{margin:0 0 0.4rem;font-size:1rem}}
    .problem-card .pid{{font-family:Consolas,monospace;font-size:0.78rem;color:var(--ink-muted)}}
  </style>
</head>"""


def header(depth: str, active: str = "blog.html") -> str:
    return f"""<body>
  <header class="site-header">
    <a class="brand" href="{depth}index.html">Neel Mishra</a>
    <nav class="nav-links" aria-label="Primary">
      <a href="{depth}index.html">Home</a>
      <a href="{depth}experience.html">Experience</a>
      <a href="{depth}projects.html">Projects</a>
      <a href="{depth}{active}" class="active">Blog</a>
      <a href="{depth}index.html#contact">Contact</a>
    </nav>
  </header>"""


FOOTER = """  <footer class="site-footer">
    <p>Copyright 2026 Neel Mishra</p>
    <p>Built for GitHub Pages</p>
  </footer>
  <script src="{depth}script.js"></script>
  <script src="{depth}blog-posts.js"></script>
  <script src="{depth}blog.js"></script>
  <script data-goatcounter="https://neelmishra.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def contest_label(c: dict) -> str:
    return f"{c['kind'].capitalize()} Contest {c['number']}"


def contest_dir(c: dict) -> Path:
    return SERIES_DIR / c["kind"] / f"{c['number']:03d}"


def problem_filename(p: dict) -> str:
    return f"q{p['order']}-{p['slug']}.html"


def diff_class(difficulty: str | None) -> str:
    if not difficulty:
        return ""
    return f"diff-{difficulty.lower()}"


# ---------------------------------------------------------------------------
# Renderers
# ---------------------------------------------------------------------------


def render_problem_post(c: dict, p: dict) -> str:
    title = f"{p['title']} — {contest_label(c)} Q{p['order']}"
    description = (
        f"Editorial for {p['title']} (LeetCode {contest_label(c)} Q{p['order']}): "
        "intuition, brute force, optimal C++ solution, dry-run, complexity, edge cases."
    )
    head = HEAD_COMMON.format(
        title=escape(title),
        description=escape(description),
        depth=DEPTH_CONTEST,
    )
    hdr = header(DEPTH_CONTEST)

    leetcode_url = p["leetcode_url"]
    doocs_url = p.get("doocs_readme_url") or ""
    fid = p.get("frontend_id") or "?"

    # Problem card meta block.
    meta_html = f"""
      <div class="lc-meta">
        <span>{escape(contest_label(c))} · Q{p['order']}</span>
        <span>LeetCode #{escape(fid)}</span>
        <span><a href="{escape(leetcode_url)}" target="_blank" rel="noopener">View on LeetCode ↗</a></span>"""
    if doocs_url:
        meta_html += f"""
        <span><a href="{escape(doocs_url)}" target="_blank" rel="noopener">Reference (doocs) ↗</a></span>"""
    meta_html += "\n      </div>"

    # Editorial placeholder. The fleet writer fills these in.
    editorial = f"""
      <div class="callout warn">
        <strong>Editorial in progress.</strong> This page is part of an
        ongoing series covering every LeetCode weekly and biweekly contest.
        The full editorial — intuition, brute force, optimal approach, dry
        run, complexity, and C++ code — is being written. Until then, the
        official problem statement is on LeetCode (link above), and a
        community solution is available on doocs/leetcode.
      </div>

      <!-- LCBLOG:STATEMENT -->
      <h2 id="statement">Problem Statement</h2>
      <p><em>The official LeetCode statement and constraints will appear here.
      In the meantime, please read the problem on
      <a href="{escape(leetcode_url)}" target="_blank" rel="noopener">LeetCode</a>.</em></p>
      <!-- /LCBLOG:STATEMENT -->

      <!-- LCBLOG:INTUITION -->
      <h2 id="intuition">Intuition</h2>
      <p><em>Coming soon.</em></p>
      <!-- /LCBLOG:INTUITION -->

      <!-- LCBLOG:BRUTE -->
      <h2 id="brute">Brute Force</h2>
      <p><em>Coming soon.</em></p>
      <!-- /LCBLOG:BRUTE -->

      <!-- LCBLOG:OPTIMAL -->
      <h2 id="optimal">Optimal Approach</h2>
      <p><em>Coming soon.</em></p>
      <!-- /LCBLOG:OPTIMAL -->

      <!-- LCBLOG:DRY-RUN -->
      <h2 id="dry-run">Dry Run</h2>
      <p><em>Coming soon.</em></p>
      <!-- /LCBLOG:DRY-RUN -->

      <!-- LCBLOG:COMPLEXITY -->
      <h2 id="complexity">Complexity Recap</h2>
      <p><em>Coming soon.</em></p>
      <!-- /LCBLOG:COMPLEXITY -->

      <!-- LCBLOG:EDGE-CASES -->
      <h2 id="edge-cases">Edge Cases &amp; Pitfalls</h2>
      <p><em>Coming soon.</em></p>
      <!-- /LCBLOG:EDGE-CASES -->

      <!-- LCBLOG:CODE -->
      <h2 id="code">C++ Code</h2>
      <p><em>Coming soon.</em></p>
      <!-- /LCBLOG:CODE -->
"""

    series_link = "../../index.html"
    contest_link = "index.html"

    body = f"""
  <div class="blog-post-layout">
    <aside class="blog-sidebar">
      <nav class="blog-nav"></nav>
      <div class="toc-section">
        <h4>Table of Contents</h4>
        <ul></ul>
      </div>
    </aside>

    <article class="blog-post-content reveal">
      <a class="back-to-blog" href="{contest_link}">&#8592; {escape(contest_label(c))}</a>
      <div class="post-series-nav">
        <a href="{series_link}">DSA &middot; LeetCode Past Contests</a>
        <span>&middot; {escape(contest_label(c))} &middot; Q{p['order']}</span>
      </div>

      <h1>{escape(p['title'])}</h1>{meta_html}
{editorial}
    </article>
  </div>

{FOOTER.format(depth=DEPTH_CONTEST)}"""
    return head + "\n" + hdr + body


def render_contest_index(c: dict) -> str:
    title = f"{contest_label(c)} — LeetCode Editorial"
    description = (
        f"Editorial walkthrough for all problems of LeetCode {contest_label(c)} in C++."
    )
    head = HEAD_COMMON.format(
        title=escape(title), description=escape(description), depth=DEPTH_CONTEST
    )
    hdr = header(DEPTH_CONTEST)
    series_link = "../../index.html"

    cards = []
    for p in c["problems"]:
        href = problem_filename(p)
        fid = p.get("frontend_id") or "?"
        cards.append(
            f"""        <div class="problem-card">
          <a href="{escape(href)}">
            <div class="pid">Q{p['order']} · LeetCode #{escape(fid)}</div>
            <h4>{escape(p['title'])}</h4>
            <p style="margin:0;font-size:0.85rem;color:var(--ink-muted)">Editorial &middot; C++</p>
          </a>
        </div>"""
        )
    cards_html = "\n".join(cards)

    body = f"""
  <div class="blog-post-layout">
    <aside class="blog-sidebar">
      <nav class="blog-nav"></nav>
    </aside>

    <article class="blog-post-content reveal">
      <a class="back-to-blog" href="{series_link}">&#8592; All Contests</a>
      <div class="post-series-nav">
        <a href="{series_link}">DSA &middot; LeetCode Past Contests</a>
      </div>

      <h1>{escape(contest_label(c))}</h1>
      <p class="post-meta">{c['kind'].capitalize()} contest &middot; {len(c['problems'])} problems</p>
      <p>Full C++ editorial walkthroughs for each problem in this contest.</p>

      <div class="problem-grid">
{cards_html}
      </div>
    </article>
  </div>

{FOOTER.format(depth=DEPTH_CONTEST)}"""
    return head + "\n" + hdr + body


def render_series_index(weekly: list[dict], biweekly: list[dict]) -> str:
    title = "LeetCode Past Contests — Editorials"
    description = (
        "C++ editorial walkthroughs for every LeetCode weekly and biweekly contest: "
        "intuition, brute force, optimal approach, dry run, complexity, edge cases."
    )
    head = HEAD_COMMON.format(
        title=escape(title), description=escape(description), depth=DEPTH_SERIES
    )
    hdr = header(DEPTH_SERIES)

    def section(label: str, contests: list[dict]) -> str:
        items = []
        for c in sorted(contests, key=lambda x: -x["number"]):
            href = f"{c['kind']}/{c['number']:03d}/index.html"
            items.append(
                f"""        <div class="problem-card">
          <a href="{escape(href)}">
            <div class="pid">{c['kind'].capitalize()} #{c['number']}</div>
            <h4>{escape(contest_label(c))}</h4>
            <p style="margin:0;font-size:0.85rem;color:var(--ink-muted)">{len(c['problems'])} problems</p>
          </a>
        </div>"""
            )
        return f"""
      <h2 id="{label.lower()}">{label} Contests <span style="color:var(--ink-muted);font-weight:400;font-size:0.9rem">({len(contests)} total)</span></h2>
      <div class="problem-grid">
{chr(10).join(items)}
      </div>"""

    body = f"""
  <div class="blog-post-layout">
    <aside class="blog-sidebar">
      <nav class="blog-nav"></nav>
    </aside>

    <article class="blog-post-content reveal">
      <a class="back-to-blog" href="{DEPTH_SERIES}blog.html">&#8592; All Posts</a>

      <h1>LeetCode Past Contests</h1>
      <p class="post-meta">DSA &middot; C++ Editorials</p>
      <p>
        A growing collection of editorial walkthroughs for every LeetCode weekly and
        biweekly contest, written in C++. Each post walks through intuition, brute
        force, optimal approach, a dry run, complexity, and edge cases.
      </p>
      <p style="font-size:0.9rem;color:var(--ink-muted)">
        {len(weekly) + len(biweekly)} contests indexed &middot; {sum(len(c['problems']) for c in weekly + biweekly)} problems.
      </p>
{section('Weekly', weekly)}
{section('Biweekly', biweekly)}
    </article>
  </div>

{FOOTER.format(depth=DEPTH_SERIES)}"""
    return head + "\n" + hdr + body


# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------


def maybe_write(path: Path, content: str, force: bool) -> bool:
    if path.exists() and not force:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return True


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="overwrite existing files")
    ap.add_argument("--only", help="filter, e.g. weekly:495 or biweekly:182")
    args = ap.parse_args()

    contests = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if args.only:
        kind, num = args.only.split(":")
        contests = [c for c in contests if c["kind"] == kind and c["number"] == int(num)]

    weekly_all = [c for c in contests if c["kind"] == "weekly"]
    biweekly_all = [c for c in contests if c["kind"] == "biweekly"]

    written = 0
    skipped = 0

    # Series landing — always rewrite when --force or whenever new contests
    # appeared (cheap to regenerate).
    full = json.loads(MANIFEST.read_text(encoding="utf-8"))
    series_html = render_series_index(
        [c for c in full if c["kind"] == "weekly"],
        [c for c in full if c["kind"] == "biweekly"],
    )
    if maybe_write(SERIES_DIR / "index.html", series_html, force=True):
        written += 1

    for c in contests:
        cdir = contest_dir(c)
        ci = cdir / "index.html"
        if maybe_write(ci, render_contest_index(c), args.force):
            written += 1
        else:
            skipped += 1

        for p in c["problems"]:
            ph = cdir / problem_filename(p)
            if maybe_write(ph, render_problem_post(c, p), args.force):
                written += 1
            else:
                skipped += 1

    print(
        f"scaffold: weekly={len(weekly_all)} biweekly={len(biweekly_all)} "
        f"written={written} skipped_existing={skipped}",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
