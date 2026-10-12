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
import json
from pathlib import Path
import threading
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright
import torch
from torch.utils.data import DataLoader, TensorDataset


ROOT = Path(__file__).resolve().parents[1]
POST = "dl/popular_videos/umar_jamil/quantization/index.html"
RESULTS = ROOT / "blog" / POST.replace("index.html", "experiment.json")


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


def result(page, selector):
    return json.loads(page.locator(selector).get_attribute("data-result"))


def set_slider(page, selector, value):
    slider = page.locator(selector)
    slider.fill(str(value))
    slider.dispatch_event("input")


def check_labs(page, measured, screenshots):
    toy = measured["examples"]["toy"]
    grid = result(page, "#q-grid-lab")
    assert grid["codes"] == toy["codes"]
    assert abs(grid["mse"] - toy["mse"]) < 1e-12
    assert float(page.locator("#q-grid-scale").inner_text()) == toy["scale"]
    page.locator("#q-grid-scheme").select_option("symmetric")
    symmetric = result(page, "#q-grid-lab")
    assert symmetric["codes"] == toy["symmetric_codes"]
    assert abs(symmetric["mse"] - toy["symmetric_mse"]) < 1e-12
    set_slider(page, "#q-grid-bits", 8)
    finer = result(page, "#q-grid-lab")
    assert finer["mse"] < symmetric["mse"]
    for original, reconstructed in zip(finer["values"], finer["restored"]):
        assert abs(original - reconstructed) <= finer["scale"] / 2 + 1e-12

    page.locator("#q-grid-scheme").select_option("asymmetric")
    page.locator("#q-grid-dataset").select_option("positive")
    positive = result(page, "#q-grid-lab")
    reference = torch.quantize_per_tensor(
        torch.tensor(positive["values"]), 2 / 255, 0, torch.quint8)
    assert positive["codes"] == reference.int_repr().tolist()
    assert positive["zero"] == 0
    page.locator("#q-grid-dataset").select_option("clipped")
    set_slider(page, "#q-grid-bits", 2)
    clipped = result(page, "#q-grid-lab")
    assert clipped["saturated"] > 0
    assert abs(clipped["values"][-1] - clipped["restored"][-1]) > clipped["scale"] / 2
    page.locator("#q-grid-dataset").select_option("skewed")
    set_slider(page, "#q-grid-bits", 4)
    page.locator("#q-grid-bits").focus()
    page.keyboard.press("ArrowRight")
    assert result(page, "#q-grid-lab")["bits"] == 5
    set_slider(page, "#q-grid-bits", 4)

    outliers = result(page, "#q-outlier-lab")
    for key, fixture_key in [("minmax", "minmax"), ("percentile", "percentile_range")]:
        expected = measured["examples"]["outliers"][fixture_key]
        for metric in ["scale", "bulk_mse", "all_mse"]:
            assert abs(outliers[key][metric] - expected[metric]) < 1e-8, (key, metric)
    assert outliers["percentile"]["bulk_mse"] < outliers["minmax"]["bulk_mse"]
    assert outliers["percentile"]["all_mse"] > outliers["minmax"]["all_mse"]
    for row, key in zip(page.locator("#q-outlier-lab tbody tr").all(), ["minmax", "percentile"]):
        cells = row.locator("td").all_inner_texts()
        for cell, metric in zip(cells[2:], ["scale", "bulk_mse", "all_mse"]):
            assert abs(float(cell) - outliers[key][metric]) <= 0.00000051
    set_slider(page, "#q-outlier-value", 150)
    assert abs(result(page, "#q-outlier-lab")["minmax"]["scale"] - 200 / 255) < 1e-12
    set_slider(page, "#q-outlier-value", 1000)

    mac = page.locator("#q-mac-lab")
    mac.scroll_into_view_if_needed()
    page.wait_for_function(
        "JSON.parse(document.getElementById('q-mac-lab').getAttribute('data-result')).step > 0")
    page.locator("#q-mac-reset").click()
    assert result(page, "#q-mac-lab")["accumulator"] == 5
    for step, accumulator in [(1, 5), (2, -5), (3, 55), (4, 55), (5, 55)]:
        page.locator("#q-mac-next").click()
        assert result(page, "#q-mac-lab")["step"] == step
        assert result(page, "#q-mac-lab")["accumulator"] == accumulator
    final = result(page, "#q-mac-lab")
    assert final["output_code"] == measured["examples"]["mac"]["output_code"]
    assert abs(final["restored"] - 1.1) < 1e-12
    assert page.locator("#q-mac-next").is_disabled()
    page.locator("#q-mac-reset").click()
    page.locator("#q-mac-play").click()
    page.wait_for_function(
        "JSON.parse(document.getElementById('q-mac-lab').getAttribute('data-result')).step >= 2")
    page.locator("#q-mac-reset").click()
    page.wait_for_timeout(900)
    assert result(page, "#q-mac-lab")["step"] == 0, "Reset must cancel pending animation steps."

    for value, expected_forward, expected_gradient in [
            (0.8, 0.75, 1), (1.2, 1, 0), (-1.2, -1, 0),
            (0.125, 0, 1), (0.375, 0.5, 1), (-0.125, 0, 1)]:
        set_slider(page, "#q-ste-value", value)
        ste = result(page, "#q-ste-lab")
        assert ste["restored"] == expected_forward
        assert ste["ste_gradient"] == expected_gradient
        assert float(page.locator("#q-ste-forward").inner_text()) == expected_forward
        assert float(page.locator("#q-ste-value-label").inner_text()) == value
    set_slider(page, "#q-ste-value", 0.8)

    for model, data in measured["models"].items():
        cells = page.locator('#q-measured-results tr[data-model="' + model + '"] td').all_inner_texts()
        assert cells[1] == f'{data["accuracy"] * 100:.2f}%'
        assert cells[2] == f'{data["state_dict_bytes"]:,}'
        assert int(cells[3]) == (measured["additional_qat_epochs"] if model == "qat_int8" else 0)

    quiz = page.locator("#q-lesson-quiz")
    quiz.get_by_role("button", name="Start", exact=True).click()
    questions = set()
    for index in range(8):
        questions.add(quiz.locator(".bq-qmeaning").inner_text())
        assert quiz.locator(".bq-choice").count() == 4
        quiz.locator(".bq-choice").first.click()
        assert quiz.locator(".bq-feedback").inner_text()
        assert all(choice.is_disabled() for choice in quiz.locator(".bq-choice").all())
        if index < 7:
            quiz.get_by_role("button", name="Next", exact=False).click()
    assert len(questions) == 8
    assert "Bank complete" in quiz.locator(".bq-feedback").inner_text()
    quiz.get_by_role("button", name="Reset", exact=True).click()
    assert quiz.locator(".bq-choice").count() == 0
    assert quiz.get_by_role("button", name="Start", exact=True).is_visible()
    if screenshots:
        for name in ["grid", "outlier", "mac", "ste"]:
            page.locator("#q-" + name + "-lab").screenshot(path=str(screenshots / (name + "-lab.png")))
    print("Labs: PyTorch-oracle grids, clipping, outliers, auto-play/reset, STE ties, and quiz passed.")


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
            measured = json.loads(RESULTS.read_text(encoding="utf-8"))
            if screenshots:
                screenshots.mkdir(parents=True, exist_ok=True)
            check_labs(page, measured, screenshots)
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
            page.locator("#q-grid-lab").scroll_into_view_if_needed()
            diagram = page.locator("#q-grid-lab .q-scroll").first
            diagram.focus()
            page.keyboard.press("ArrowRight")
            page.wait_for_timeout(150)
            assert diagram.evaluate("el => el.scrollLeft") > 0
            page.emulate_media(reduced_motion="reduce")
            page.reload(wait_until="domcontentloaded")
            page.locator("#q-mac-lab").scroll_into_view_if_needed()
            page.wait_for_timeout(900)
            assert result(page, "#q-mac-lab")["step"] == 0
            page.locator("#q-mac-play").click()
            assert result(page, "#q-mac-lab")["step"] == 5
            page.locator("#q-mac-reset").click()
            assert result(page, "#q-mac-lab")["step"] == 0
            page.locator(".q-details summary").first.click()
            page.locator(".q-chapters").get_by_role(
                "link", name="Asymmetric quantization", exact=True).click()
            page.wait_for_function("""() => {
                var heading = document.getElementById('asymmetric').getBoundingClientRect();
                var header = document.querySelector('.site-header').getBoundingClientRect();
                return heading.top >= header.bottom - 1 && heading.top < innerHeight / 2;
            }""")
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
