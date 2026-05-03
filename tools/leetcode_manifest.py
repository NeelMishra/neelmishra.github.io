#!/usr/bin/env python3
"""
Build tools/contests.json — the canonical manifest of every LeetCode
weekly + biweekly contest, the problems it contains, and the metadata
needed to (a) generate a post stub, (b) link to LeetCode, and
(c) fetch the official problem statement from doocs/leetcode.

Sources (no auth required):
  * https://raw.githubusercontent.com/doocs/leetcode/main/solution/contest.json
        Contest -> ordered list of problem slugs.
  * https://raw.githubusercontent.com/doocs/leetcode/main/solution/README.md
        Master problem table that maps problem ID -> path. We derive the
        English-title slug from each path so we can join against the
        contest data.

Output schema (tools/contests.json):
  [
    {
      "kind": "weekly" | "biweekly",
      "number": 83,
      "slug": "weekly-contest-83",
      "title_en": "Weekly Contest 83",
      "start_time": 1525570200,
      "duration": 5400,
      "problems": [
        {
          "order": 1,
          "slug": "positions-of-large-groups",
          "title": "Positions of Large Groups",
          "frontend_id": "830",
          "doocs_path": "solution/0800-0899/0830.Positions of Large Groups",
          "leetcode_url": "https://leetcode.com/problems/positions-of-large-groups/",
          "doocs_readme_url": "https://raw.githubusercontent.com/doocs/leetcode/main/solution/0800-0899/0830.Positions%20of%20Large%20Groups/README_EN.md"
        },
        ...
      ]
    },
    ...
  ]
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

DOOCS_RAW = "https://raw.githubusercontent.com/doocs/leetcode/main"
CONTEST_JSON_URL = f"{DOOCS_RAW}/solution/contest.json"
README_URL = f"{DOOCS_RAW}/solution/README.md"

UA = {"User-Agent": "Mozilla/5.0 leetcode-contests-manifest"}


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def slugify(title: str) -> str:
    """Mimic LeetCode's slugification of problem titles."""
    s = title.lower()
    # Strip HTML entities / odd punctuation, keep letters/digits/spaces/hyphens.
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s).strip("-")
    return s


def parse_doocs_readme(md: str) -> dict[str, dict]:
    """
    Walk the doocs solution/README.md table and return a map from
    English-title slug -> {frontend_id, title, doocs_path}.

    Each row looks like:
      | 0830 | [Positions of Large Groups](/solution/0800-0899/0830.Positions%20of%20Large%20Groups/README.md) | ... |

    The Chinese title is in the link text; we derive the English title from
    the path component instead so the slug aligns with LeetCode.
    """
    out: dict[str, dict] = {}
    pattern = re.compile(
        r"\|\s*(\d{4,})\s*\|\s*\[[^\]]+\]\((/solution/[^)]+/(\d{4,})\.([^/]+)/README\.md)\)"
    )
    for m in pattern.finditer(md):
        frontend_id = m.group(1).lstrip("0") or "0"
        path_url = m.group(2)
        title_url = m.group(4)
        title = urllib.parse.unquote(title_url)
        slug = slugify(title)
        # Strip leading "/" and trailing "/README.md", then URL-decode so
        # the stored path reads cleanly ("solution/.../0830.Positions of Large Groups").
        doocs_path = path_url.lstrip("/")[: -len("/README.md")]
        doocs_path = urllib.parse.unquote(doocs_path)
        out[slug] = {
            "frontend_id": frontend_id,
            "title": title,
            "doocs_path": doocs_path,
        }
    return out


def build_doocs_readme_url(doocs_path: str) -> str:
    # path is "solution/0800-0899/0830.Positions of Large Groups"
    # need to URL-encode the title segment.
    parts = doocs_path.split("/")
    parts = [urllib.parse.quote(p) for p in parts]
    return f"{DOOCS_RAW}/{'/'.join(parts)}/README_EN.md"


def classify(slug: str) -> tuple[str, int] | None:
    """Return (kind, number) for weekly-contest-NN / biweekly-contest-NN.
    Returns None for the legacy 'warm-up-contest' or 'leetcode-weekly-contest-N'
    style entries we don't render."""
    m = re.match(r"^weekly-contest-(\d+)$", slug)
    if m:
        return "weekly", int(m.group(1))
    m = re.match(r"^biweekly-contest-(\d+)$", slug)
    if m:
        return "biweekly", int(m.group(1))
    return None


def main(out_path: Path) -> None:
    print(f"Fetching {CONTEST_JSON_URL} ...", file=sys.stderr)
    contest_records = json.loads(fetch(CONTEST_JSON_URL))
    print(f"  -> {len(contest_records)} contests", file=sys.stderr)

    print(f"Fetching {README_URL} ...", file=sys.stderr)
    readme_md = fetch(README_URL).decode("utf-8")
    slug_index = parse_doocs_readme(readme_md)
    print(f"  -> {len(slug_index)} problems indexed", file=sys.stderr)

    manifest: list[dict] = []
    missing_problems: list[str] = []

    for c in contest_records:
        contest_slug = c["contest_title_slug"]
        kind_num = classify(contest_slug)
        if kind_num is None:
            continue
        kind, number = kind_num

        problems = []
        for i, qslug in enumerate(c.get("question_slugs") or [], start=1):
            meta = slug_index.get(qslug)
            if meta is None:
                missing_problems.append(f"{contest_slug}::{qslug}")
                problems.append({
                    "order": i,
                    "slug": qslug,
                    "title": qslug.replace("-", " ").title(),
                    "frontend_id": None,
                    "doocs_path": None,
                    "leetcode_url": f"https://leetcode.com/problems/{qslug}/",
                    "doocs_readme_url": None,
                })
                continue
            problems.append({
                "order": i,
                "slug": qslug,
                "title": meta["title"],
                "frontend_id": meta["frontend_id"],
                "doocs_path": meta["doocs_path"],
                "leetcode_url": f"https://leetcode.com/problems/{qslug}/",
                "doocs_readme_url": build_doocs_readme_url(meta["doocs_path"]),
            })

        manifest.append({
            "kind": kind,
            "number": number,
            "slug": contest_slug,
            "title_en": c.get("contest_title_en") or contest_slug,
            "start_time": c.get("contest_start_time"),
            "duration": c.get("contest_duration"),
            "problems": problems,
        })

    manifest.sort(key=lambda c: (c["kind"], c["number"]))

    out_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))

    weekly = sum(1 for c in manifest if c["kind"] == "weekly")
    biweekly = sum(1 for c in manifest if c["kind"] == "biweekly")
    total_problems = sum(len(c["problems"]) for c in manifest)
    print(
        f"Wrote {out_path} | weekly={weekly} biweekly={biweekly} "
        f"total_problems={total_problems} unresolved_problems={len(missing_problems)}",
        file=sys.stderr,
    )
    if missing_problems:
        print(
            "First 10 unresolved problems (will still be scaffolded but without doocs README):",
            file=sys.stderr,
        )
        for p in missing_problems[:10]:
            print(" ", p, file=sys.stderr)


if __name__ == "__main__":
    target = Path(__file__).parent / "contests.json"
    main(target)
