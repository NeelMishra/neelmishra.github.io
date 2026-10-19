"""Synchronize the published RAG manifest with the Explorer and card metadata.

Run from any directory: python3 tools/sync_rag_series.py
Only the RAG-SERIES marker blocks are managed.
"""

import html
import json
import os
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "blog/rag/series.json"

ANN_FOLDER_LABELS = {
    "hnsw": "HNSW",
    "hierarchical-k-means": "Hierarchical K-Means",
    "kd-trees": "KD-Trees",
    "annoy": "Annoy (Random Projection Trees)",
    "ivf": "IVF (Inverted File Index)",
    "lsh": "LSH (Locality-Sensitive Hashing)",
}

CHUNKING_FOLDER_LABELS = {
    "fixed-size-sliding-window": "Fixed-Size & Sliding Window",
    "recursive-structure-aware": "Recursive & Structure-Aware",
    "semantic-chunking": "Semantic Chunking",
    "parent-child-hierarchical": "Parent-Child & Hierarchical",
    "contextual-and-late-chunking": "Contextual & Late Chunking",
    "proposition-and-agentic": "Proposition & Agentic",
}

RETRIEVAL_FOLDER_LABELS = {
    "lexical-bm25-and-splade": "BM25 & Learned Sparse (SPLADE)",
    "dense-bi-encoders": "Dense Bi-Encoders",
    "hybrid-search-and-fusion": "Hybrid Search & Fusion",
    "colbert-late-interaction": "Late Interaction (ColBERT)",
    "query-rewriting-and-hyde": "Query Rewriting & HyDE",
    "reranking-and-mmr-diversity": "Cross-Encoders & MMR Diversity",
}


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
    sections = {
        "ann-methods": ("ANN Methods", ANN_FOLDER_LABELS),
        "chunking": ("Chunking", CHUNKING_FOLDER_LABELS),
        "retrieval": ("Retrieval", RETRIEVAL_FOLDER_LABELS),
    }
    section_nodes = {}
    subfolders = {}
    for chapter in chapters:
        leaf = {"title": chapter["title"], "file": chapter["file"]}
        matched_section = None
        for sec_key in sections:
            if chapter["file"].startswith(f"rag/{sec_key}/"):
                matched_section = sec_key
                break
        if matched_section:
            sec_label, label_map = sections[matched_section]
            if matched_section not in section_nodes:
                section_nodes[matched_section] = {"name": matched_section, "label": sec_label, "children": []}
                root["children"].append(section_nodes[matched_section])
            sec_node = section_nodes[matched_section]
            rest = chapter["file"].removeprefix(f"rag/{matched_section}/")
            if "/" in rest:
                folder_name = rest.split("/", 1)[0]
                sub_key = (matched_section, folder_name)
                if sub_key not in subfolders:
                    label = label_map.get(folder_name, folder_name.replace("-", " ").title())
                    subfolders[sub_key] = {"name": folder_name, "label": label, "children": []}
                    sec_node["children"].append(subfolders[sub_key])
                subfolders[sub_key]["children"].append(leaf)
            else:
                sec_node["children"].append(leaf)
        else:
            root["children"].append(leaf)
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


def relative_href(from_file, to_file):
    from_dir = (ROOT / "blog" / from_file).parent
    target = ROOT / "blog" / to_file
    return Path(os.path.relpath(target, from_dir)).as_posix()


def sync_section_nav(chapters, prefix, hub_file, hub_title, default_marker):
    sec_chapters = [chapter for chapter in chapters
                    if chapter["file"].startswith(prefix)
                    and chapter["file"] != hub_file]
    for position, chapter in enumerate(sec_chapters):
        previous = sec_chapters[position - 1] if position else {
            "file": hub_file,
            "title": hub_title,
        }
        prev_href = relative_href(chapter["file"], previous["file"])
        marker = "HNSW-NAV" if chapter["file"].startswith("rag/ann-methods/hnsw/") else default_marker
        navigation = (f'<!-- {marker}:START -->\n'
                      '<nav class="post-nav" aria-label="Reading navigation">'
                      f'<a class="prev" href="{prev_href}"><span>Previous</span>'
                      f'<span>{html.escape(previous["title"])}</span></a>')
        if position + 1 < len(sec_chapters):
            following = sec_chapters[position + 1]
            next_href = relative_href(chapter["file"], following["file"])
            navigation += (f'<a class="next" href="{next_href}">'
                           '<span>Next</span>'
                           f'<span>{html.escape(following["title"])}</span></a>')
        navigation += f'</nav>\n<!-- {marker}:END -->'
        replace_block(ROOT / "blog" / chapter["file"],
                      rf"<!-- {marker}:START -->.*?<!-- {marker}:END -->",
                      navigation)


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
            '<div>' + (f'<span class="rag-chapter-question">{html.escape(chapter["learning_question"])}</span>'
                       if chapter.get("learning_question") else "")
            + f'<strong>{html.escape(chapter["title"])}</strong>'
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

    sync_section_nav(
        chapters,
        prefix="rag/ann-methods/",
        hub_file="rag/ann-methods/index.html",
        hub_title="ANN methods: define the target before choosing the index",
        default_marker="ANN-NAV",
    )
    sync_section_nav(
        chapters,
        prefix="rag/chunking/",
        hub_file="rag/chunking/index.html",
        hub_title="Chunking methods: preserve evidence boundaries before embedding",
        default_marker="CHUNK-NAV",
    )
    sync_section_nav(
        chapters,
        prefix="rag/retrieval/",
        hub_file="rag/retrieval/index.html",
        hub_title="Retrieval methods: match, fuse, and rerank evidence across representations",
        default_marker="RETRIEVAL-NAV",
    )
    print(f"Synchronized {len(chapters)} published RAG articles.")


if __name__ == "__main__":
    main()
