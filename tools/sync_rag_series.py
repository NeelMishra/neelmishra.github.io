"""Synchronize the published RAG manifest with the Explorer and card metadata.

Run from any directory: python3 tools/sync_rag_series.py
Only the RAG-SERIES marker blocks are managed.
"""

import html
import json
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "blog/rag/series.json"


def load_chapters():
    chapters = json.loads(MANIFEST.read_text())["chapters"]
    files = [chapter["file"] for chapter in chapters]
    if len(files) != len(set(files)):
        raise ValueError("RAG manifest contains duplicate files")
    for chapter in chapters:
        if not chapter["file"].startswith("rag/") or not (ROOT / "blog" / chapter["file"]).is_file():
            raise ValueError(f"Missing or out-of-scope RAG article: {chapter['file']}")
        if not isinstance(chapter["minutes"], int) or chapter["minutes"] < 1:
            raise ValueError("Each chapter needs a positive reading time")
    return chapters


def tree(chapters):
    root = {"name": "rag", "label": "RAG", "children": []}
    ann = {"name": "ann-methods", "label": "ANN Methods", "children": []}
    hnsw = {"name": "hnsw", "label": "HNSW", "children": []}
    for chapter in chapters:
        leaf = {"title": chapter["title"], "file": chapter["file"]}
        parent = (hnsw if chapter["file"].startswith("rag/ann-methods/hnsw/")
                  else ann if chapter["file"].startswith("rag/ann-methods/")
                  else root)
        parent["children"].append(leaf)
    ann["children"].append(hnsw)
    root["children"].append(ann)
    return "  // RAG-SERIES:START\n" + "\n".join(
        "  " + line for line in json.dumps(root, indent=2).splitlines()
    ) + ",\n  // RAG-SERIES:END"


def metadata(chapters):
    lines = ["  /* RAG-SERIES:START */"]
    for chapter in chapters:
        entry = {
            "category": "rag", "series": chapter["series"],
            "title": chapter["title"], "description": chapter["description"],
            "meta": f"October 2026 &middot; {chapter['minutes']} min read",
        }
        lines.append(f"  {json.dumps(chapter['file'])}: {json.dumps(entry)},")
    return "\n".join(lines + ["  /* RAG-SERIES:END */"])


def replace_block(path, pattern, replacement):
    original = path.read_text()
    updated, matches = re.subn(pattern, lambda _: replacement, original, flags=re.S)
    if matches != 1:
        raise ValueError(f"Expected one RAG marker block in {path.name}; found {matches}")
    if updated != original:
        path.write_text(updated)


def main():
    chapters = load_chapters()
    replace_block(ROOT / "blog.js", r"  // RAG-SERIES:START.*?  // RAG-SERIES:END",
                  tree(chapters))
    replace_block(ROOT / "blog-posts.js",
                  r"  /\* RAG-SERIES:START \*/.*?  /\* RAG-SERIES:END \*/",
                  metadata(chapters))
    hnsw = [chapter for chapter in chapters
            if chapter["file"].startswith("rag/ann-methods/hnsw/")]
    if hnsw:
        notes = [chapter for chapter in hnsw
                 if chapter["file"] != "rag/ann-methods/hnsw/index.html"]
        cards = "".join(
            f'<a href="{Path(chapter["file"]).name}"><span>{number:02d}</span>'
            f'<div><strong>{html.escape(chapter["title"])}</strong>'
            f'<p>{html.escape(chapter["description"])}</p></div></a>\n'
            for number, chapter in enumerate(notes, 1)
        )
        listing = '<!-- HNSW-CHAPTERS:START -->\n'
        if cards:
            listing += '<div class="note-chapters">\n' + cards + '</div>\n'
        listing += '<!-- HNSW-CHAPTERS:END -->'
        replace_block(ROOT / "blog/rag/ann-methods/hnsw/index.html",
                      r"<!-- HNSW-CHAPTERS:START -->.*?<!-- HNSW-CHAPTERS:END -->",
                      listing)
        for position, chapter in enumerate(hnsw):
            previous = hnsw[position - 1] if position else {
                "file": "../index.html",
                "title": "ANN methods: define the target before choosing the index",
            }
            previous_file = (Path(previous["file"]).name if position else "../index.html")
            navigation = ('<!-- HNSW-NAV:START -->\n'
                          '<nav class="post-nav" aria-label="Reading navigation">'
                          f'<a class="prev" href="{previous_file}"><span>Previous</span>'
                          f'<span>{html.escape(previous["title"])}</span></a>')
            if position + 1 < len(hnsw):
                following = hnsw[position + 1]
                navigation += (f'<a class="next" href="{Path(following["file"]).name}">'
                               '<span>Next</span>'
                               f'<span>{html.escape(following["title"])}</span></a>')
            navigation += '</nav>\n<!-- HNSW-NAV:END -->'
            replace_block(ROOT / "blog" / chapter["file"],
                          r"<!-- HNSW-NAV:START -->.*?<!-- HNSW-NAV:END -->",
                          navigation)
    print(f"Synchronized {len(chapters)} published RAG articles.")


if __name__ == "__main__":
    main()
