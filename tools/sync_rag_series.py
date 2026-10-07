"""Synchronize the published RAG manifest with the Explorer and card metadata.

Run from any directory: python3 tools/sync_rag_series.py
Only the RAG-SERIES marker blocks are managed.
"""

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
    print(f"Synchronized {len(chapters)} published RAG articles.")


if __name__ == "__main__":
    main()
