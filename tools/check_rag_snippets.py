"""Execute the RAG series' authored Python blocks, not arbitrary documents.

Install the HNSW example requirements first. Run with the same Python environment.
"""

from contextlib import redirect_stdout
from html.parser import HTMLParser
import io
import json
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "blog/rag/ann-methods/hnsw/examples"))


class PythonBlocks(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.active = False
        self.blocks = []
        self.parts = []
        self.feed(source)

    def handle_starttag(self, tag, attributes):
        if tag == "code" and "language-python" in dict(attributes).get("class", "").split():
            self.active = True
            self.parts = []

    def handle_endtag(self, tag):
        if tag == "code" and self.active:
            self.blocks.append("".join(self.parts))
            self.active = False

    def handle_data(self, text):
        if self.active:
            self.parts.append(text)


count = 0
for chapter in json.loads((ROOT / "blog/rag/series.json").read_text())["chapters"]:
    path = ROOT / "blog" / chapter["file"]
    for number, block in enumerate(PythonBlocks(path.read_text()).blocks, 1):
        namespace = {"__name__": "__rag_documentation_example__"}
        with redirect_stdout(io.StringIO()):
            exec(compile(block, f"{chapter['file']}:block-{number}", "exec"), namespace)
        count += 1
print(f"Executed {count} authored RAG Python snippets successfully.")
