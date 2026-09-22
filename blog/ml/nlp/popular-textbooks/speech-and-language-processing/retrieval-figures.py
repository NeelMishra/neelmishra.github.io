"""Generate the three original vector figures. Run with Python 3."""
from pathlib import Path
from html import escape
import importlib.util

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("example", ROOT / "retrieval-example.py")
example = importlib.util.module_from_spec(spec)
spec.loader.exec_module(example)
GREEN = "#33795f"
PURPLE = "#796091"
INK = "#263d33"


def text(x, y, value, size=20, weight=400, color=INK, anchor="start"):
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{color}" text-anchor="{anchor}">{escape(value)}</text>'


def lines(x, y, values, size=18, leading=27, **kwargs):
    return "".join(text(x, y+i*leading, v, size, **kwargs) for i, v in enumerate(values))


def box(x, y, w, h, fill="#edf3ed", stroke="#c6d5c9"):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{fill}" stroke="{stroke}"/>'


def arrow(path):
    return f'<path d="{path}" fill="none" stroke="{GREEN}" stroke-width="2.5" marker-end="url(#arrow)"/>'


def save(name, title, description, width, height, body):
    (ROOT / name).write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">
<title id="title">{escape(title)}</title><desc id="desc">{escape(description)}</desc>
<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9" fill="{GREEN}"/></marker></defs>
<rect width="{width}" height="{height}" fill="#fffdf9"/>
<g font-family="Arial, sans-serif">{body}</g></svg>''')


body = text(32, 43, "A lexical score adds evidence from matching terms", 27, 700)
body += text(32, 76, "Query: solar battery · k₁ = 1.2 · b = 0.75 · ln(N/df) variant", 18)
body += '<rect x="190" y="99" width="19" height="19" rx="3" fill="#33795f"/>' + text(219, 115, "solar", 18)
body += '<rect x="330" y="99" width="19" height="19" rx="3" fill="#796091"/>' + text(359, 115, "battery", 18)
for i, row in enumerate(example.bm25()):
    y = 150 + i*78
    body += text(32, y+23, row["document"], 23, 700)
    body += text(32, y+48, "relevant" if row["document"] in example.RELEVANT else "not relevant", 16)
    left = 190
    for term, color in [("solar", GREEN), ("battery", PURPLE)]:
        score = row["parts"][term]
        width = score*510
        if width:
            body += f'<rect x="{left:.3f}" y="{y}" width="{width:.3f}" height="39" fill="{color}"/>'
            body += text(left+width/2, y+26, f"{score:.4f}", 18, 700, "#ffffff", "middle")
            left += width
    body += text(732, y+26, f'{row["score"]:.4f}', 22, 700)
for tick in [0, .25, .5, .75, 1]:
    x = 190+510*tick
    body += f'<path d="M{x} 455 v7" stroke="#6b7a70"/>' + text(x, 486, str(tick), 16, anchor="middle")
body += '<path d="M190 455 H700" stroke="#6b7a70"/>'
body += box(28, 510, 804, 95, "#f4efe5", "#d9cfba")
body += text(48, 542, "D4: relevant, but neither query term occurs", 22, 700)
body += text(48, 574, "Score 0. No positive-weight reordering can repair a missing match.", 19)
save("retrieval-bm25.svg", "BM25 contributions for four lexical candidates",
     "D1 scores 0.9177 from solar 0.6356 and battery 0.2821. D2 scores 0.5304, D5 0.4876, D3 0.3346. D1 and D3 are relevant; relevant D4 is absent because it matches neither query term.", 860, 626, body)

body = text(28, 43, "Where does the query meet the passage?", 28, 700)
body += text(28, 75, "Three ways to trade stored representations for query-time interaction", 19)
for y in [96, 284, 472]:
    body += box(24, y, 912, 170)
body += text(43, 133, "Bi-encoder", 24, 700)
body += lines(43, 166, ["Encode separately.", "Meet at one", "dot product."], 19)
body += text(245, 142, "query", 18) + text(235, 221, "passage", 18)
body += box(330, 116, 110, 46, "#dbeadf") + text(385, 146, "Q encoder", 18, 700, anchor="middle")
body += box(330, 195, 110, 46, "#e9e0ed") + text(385, 225, "D encoder", 18, 700, anchor="middle")
body += arrow("M299 137 H326") + arrow("M314 216 H326")
body += arrow("M440 139 H480") + text(495, 146, "q", 22, 700)
body += arrow("M440 218 H480") + text(495, 225, "d", 22, 700)
body += arrow("M518 140 L561 173") + arrow("M518 215 L561 188")
body += box(566, 155, 112, 49, "#fffdf9") + text(622, 187, "q · d", 23, 700, anchor="middle")
body += lines(703, 136, ["Store one vector", "per passage.", "Encode the new", "query once."], 18)
body += text(43, 321, "Cross-encoder", 24, 700)
body += lines(43, 354, ["Encode together.", "Every token can", "interact early."], 19)
body += lines(245, 344, ["query", "+ passage"], 18)
body += arrow("M338 351 H360")
body += box(366, 323, 158, 68, "#dbeadf") + lines(445, 348, ["Joint", "encoder"], 19, 25, weight=700, anchor="middle")
body += arrow("M524 357 H560") + box(566, 323, 112, 68, "#fffdf9")
body += lines(622, 348, ["Relevance", "head"], 18, 25, weight=700, anchor="middle")
body += lines(703, 324, ["Recompute for", "each query–", "passage pair.", "Useful to rerank."], 18)
body += text(43, 509, "Late interaction", 23, 700)
body += lines(43, 542, ["Encode separately.", "Meet as sets of", "token vectors."], 19)
body += text(245, 523, "query", 18) + text(235, 603, "passage", 18)
for y, color in [(500, "#dbeadf"), (579, "#e9e0ed")]:
    for i in range(4):
        body += box(335+i*38, y, 28, 35, color)
body += arrow("M298 515 H328") + arrow("M314 594 H328")
body += arrow("M489 517 L534 548") + arrow("M489 596 L534 567")
body += box(540, 525, 138, 65, "#fffdf9") + lines(609, 551, ["MaxSim", "then sum"], 19, 25, weight=700, anchor="middle")
body += lines(703, 512, ["Store token", "vectors. Match", "each query token", "at scoring time."], 18)
body += text(28, 677, "The encoders may share weights. Separate encoding is the key distinction.", 19)
save("retrieval-encoders.svg", "Bi-encoder, cross-encoder, and late-interaction retrieval",
     "A bi-encoder forms independent query and passage vectors and takes their dot product. A cross-encoder jointly encodes the query and passage before scoring. Late interaction stores token vectors and aggregates their similarities with MaxSim.", 960, 704, body)

body = text(30, 43, "RAG carries source evidence into the answer", 27, 700)
body += text(30, 76, "The retriever selects passages; the generator writes from the selected context.", 19)
body += box(30, 105, 860, 114, "#f4efe5", "#d9cfba")
body += text(50, 134, "PREPARE THE COLLECTION", 16, 700)
body += lines(50, 169, ["Source documents", "with IDs and dates"], 20, 27)
body += arrow("M259 177 H296")
body += lines(320, 169, ["Passages / chunks", "retain source pointers"], 20, 27)
body += arrow("M550 177 H586")
body += lines(614, 169, ["Searchable index", "counts or embeddings"], 20, 27)
body += arrow("M740 222 V248 H431 V275")
body += box(30, 280, 225, 106) + lines(50, 312, ["USER QUESTION", "What stores solar", "energy at home?"], 20, 28)
body += arrow("M258 334 H306")
body += box(312, 280, 238, 106, "#dbeadf") + text(332, 313, "1. Retrieve", 23, 700)
body += lines(332, 344, ["Find candidates", "from the index"], 19, 27)
body += arrow("M553 334 H601")
body += box(607, 280, 283, 106, "#e9e0ed") + text(627, 313, "2. Rerank (optional)", 22, 700)
body += lines(627, 344, ["Spend more computation", "on this shortlist"], 19, 27)
body += arrow("M750 390 V423")
body += box(30, 430, 860, 111, "#edf3ed")
body += text(50, 462, "3. Build the prompt", 23, 700)
body += text(50, 494, "Question + selected passages + instructions + stable source IDs", 20)
body += text(50, 523, "Example evidence: [D1] home solar battery stores solar energy", 19)
body += arrow("M170 545 V579")
body += box(30, 586, 265, 103, "#dbeadf") + text(50, 620, "4. Generate", 23, 700)
body += lines(50, 651, ["Condition on the prompt", "and earlier output tokens"], 18, 25)
body += arrow("M299 638 H346")
body += box(353, 586, 537, 103, "#fffdf9") + text(373, 620, "A home solar battery [D1].", 23, 700)
body += lines(373, 651, ["Illustrative supported answer, written by the author.", "Check that each citation supports its attached claim."], 18, 25)
body += text(30, 731, "Missing needed evidence is a retrieval failure. An unsupported claim is an answer failure.", 19)
save("retrieval-rag.svg", "A RAG pipeline with source provenance",
     "Offline, source documents become passages with identifiers, then an index. Online, a question drives retrieval, optional reranking, prompt construction, and generation. The prompt preserves D1's text and identifier so the answer can cite its evidence.", 920, 758, body)
