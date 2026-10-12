"""Check the Umar Jamil quantization post with PyTorch and headless Playwright.

Run: python3 tools/check_umar_quantization.py
Requires torch==2.6.0, playwright, and the Playwright Chromium browser.
"""

import argparse
from contextlib import contextmanager, redirect_stdout
from functools import partial
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import io
from pathlib import Path
import threading
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright
import torch
from torch.utils.data import DataLoader, TensorDataset


ROOT = Path(__file__).resolve().parents[1]
POST = "dl/popular_videos/umar_jamil/quantization/index.html"


class ExampleParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.examples = {}
        self.example = None

    def handle_starttag(self, tag, attrs):
        if tag == "code":
            self.example = dict(attrs).get("data-example")
            if self.example:
                self.examples[self.example] = ""

    def handle_endtag(self, tag):
        if tag == "code":
            self.example = None

    def handle_data(self, text):
        if self.example:
            self.examples[self.example] += text


def check_published_code():
    parser = ExampleParser()
    parser.feed((ROOT / "blog" / POST).read_text(encoding="utf-8"))
    namespace = {"__name__": "__main__"}
    with redirect_stdout(io.StringIO()):
        exec(parser.examples["affine"], namespace)
        assert namespace["q"].tolist() == [0, 1, 5, 9, 14, 15]
        assert abs(float(namespace["mse"]) - 0.002483333333333333) < 1e-12
        exec(parser.examples["model"], namespace)
        torch.manual_seed(11)
        loader = DataLoader(
            TensorDataset(torch.randn(8, 1, 28, 28), torch.arange(8)),
            batch_size=4)
        namespace["float_model"] = namespace["DigitMLP"]().eval()
        namespace["calibration_loader"] = loader
        namespace["training_loader"] = loader
        exec(parser.examples["ptq"], namespace)
        assert namespace["int8_model"].fc1.weight().dtype == torch.qint8
        exec(parser.examples["qat"], namespace)
        assert torch.count_nonzero(namespace["qat_model"].fc1.weight.grad) > 0
        assert namespace["qat_int8"].fc1.weight().dtype == torch.qint8
        with torch.no_grad():
            for images, _ in loader:
                assert namespace["int8_model"](images).shape == (4, 10)
                assert namespace["qat_int8"](images).shape == (4, 10)
    print("Published Python snippets: exact grids, PTQ, QAT, and gradients passed.")


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


@contextmanager
def static_server():
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
    thread = threading.Thread(target=server.serve_forever)
    thread.start()
    try:
        yield "http://127.0.0.1:" + str(server.server_port)
    finally:
        server.shutdown()
        server.server_close()
        thread.join()


def check_browser(base, screenshots):
    errors = []
    failed_local = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            context = browser.new_context(viewport={"width": 1440, "height": 1000})
            context.route("**/gc.zgo.at/**", lambda route: route.abort())
            context.route("**/neelmishra.goatcounter.com/**", lambda route: route.abort())
            page = context.new_page()
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.on("response", lambda response: failed_local.append(
                (response.url, response.status)) if response.url.startswith(base)
                and response.status >= 400 else None)
            response = page.goto(base + "/blog/" + POST, wait_until="domcontentloaded")
            assert response.status == 200
            page.wait_for_function("document.querySelector('.q-equation .katex') !== null")
            assert page.locator("h1").count() == 1
            assert page.locator(".katex-error").count() == 0
            for equation in page.locator(".q-equation").all():
                assert equation.locator(".katex").count() > 0, equation.inner_text()
            registration = page.evaluate("""file => {
                var leaves = flattenBlogTree(BLOG_TREE, []).filter(function(p) {
                    return p.file === file;
                });
                return { count: leaves.length, post: BLOG_POSTS[file],
                         links: leaves[0] && leaves[0].links };
            }""", POST)
            assert registration["count"] == 1
            assert registration["post"]["category"] == "dl"
            assert not registration["post"].get("draft")
            assert len(registration["links"]) == 2
            active_leaf = page.locator(".blog-nav a.file-tree-file.active")
            assert active_leaf.count() == 1
            assert active_leaf.evaluate("el => el.href") == page.url
            assert page.locator(".wip-banner, .wip-tag").count() == 0
            for heading in page.locator("article h2").all():
                anchor = heading.get_attribute("id")
                assert anchor
                assert page.locator('.toc-section a[href="#' + anchor + '"]').count() == 1
            local_links = page.evaluate("""() => Array.from(document.querySelectorAll(
                'article a[href], header a[href], script[src], link[rel="stylesheet"]'
            )).map(function(el) { return el.href || el.src; }).filter(function(url) {
                return url.indexOf(location.origin + '/') === 0;
            })""")
            for url in set(local_links):
                path = urlsplit(url)
                assert context.request.get(url.split("#")[0]).status == 200, url
                if path.fragment and path.path.endswith("/" + POST):
                    assert page.locator('[id="' + path.fragment + '"]').count() == 1, url
            for width in [1440, 768, 390, 320]:
                page.set_viewport_size({"width": width, "height": 900})
                assert page.evaluate(
                    "document.documentElement.scrollWidth <= innerWidth + 1"
                ), "Page overflow at " + str(width)
                for region in page.locator(".q-scroll").all():
                    assert region.get_attribute("tabindex") == "0"
                if screenshots:
                    screenshots.mkdir(parents=True, exist_ok=True)
                    page.locator("#asymmetric").scroll_into_view_if_needed()
                    page.screenshot(path=str(screenshots / ("post-" + str(width) + ".png")))
            page.goto(base + "/blog.html", wait_until="domcontentloaded")
            card = page.locator('a.blog-card[href="blog/' + POST + '"]')
            assert card.count() == 1
            page.locator('.blog-chip[data-cat="dl"]').click()
            card.evaluate("""el => {
                var parent = el.parentElement;
                while (parent) {
                    if (parent.tagName === 'DETAILS') parent.open = true;
                    parent = parent.parentElement;
                }
            }""")
            card.click()
            assert page.url.endswith("/blog/" + POST)
            assert page.locator("h1").inner_text().startswith("Quantization explained")
            assert not errors, errors
            assert not failed_local, failed_local
            print("Browser: tree, index card, navigation, math, links, and 320-1440px layout passed.")
        finally:
            browser.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", help="Check a running or published site instead of a local server.")
    parser.add_argument("--screenshots", type=Path)
    args = parser.parse_args()
    torch.set_num_threads(2)
    check_published_code()
    if args.base_url:
        check_browser(args.base_url.rstrip("/"), args.screenshots)
    else:
        with static_server() as base:
            check_browser(base, args.screenshots)


if __name__ == "__main__":
    main()
