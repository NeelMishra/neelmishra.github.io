"""Serve the repository and run with Python Playwright.

RAG_BASE_URL defaults to http://127.0.0.1:8879.
Optional RAG_SCREENSHOTS writes screenshots to an existing artifact directory.
"""

import argparse
import json
import os
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get("RAG_BASE_URL", "http://127.0.0.1:8879")


def main(selected):
    chapters = json.loads((ROOT / "blog/rag/series.json").read_text())["chapters"]
    if selected:
        known = {chapter["file"] for chapter in chapters}
        if not set(selected) <= known:
            raise ValueError("Every selected page must be published in the RAG manifest")
        chapters = [chapter for chapter in chapters if chapter["file"] in selected]
    screenshots = os.environ.get("RAG_SCREENSHOTS")
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1000},
                                reduced_motion="reduce")
        errors, bad_responses = [], []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("response", lambda response: bad_responses.append((response.status, response.url))
                if response.url.startswith(BASE) and response.status >= 400 else None)
        page.route("**/*", lambda route: route.abort()
                   if "goatcounter.com" in route.request.url or "gc.zgo.at" in route.request.url
                   else route.continue_())
        try:
            for chapter in chapters:
                source = "/blog/" + chapter["file"]
                response = page.goto(BASE + source, wait_until="networkidle")
                assert response.status == 200, source
                assert page.locator("article h1").inner_text() == chapter["title"], source
                assert page.locator(".file-tree-file.active").count() == 1, source
                assert page.locator(".toc-section a").count() > 0, source
                assert page.locator(".katex-error").count() == 0, source
                assert page.locator("article .katex").count() > 0, source
                assert page.locator('link[rel="canonical"]').get_attribute("href") == (
                    "https://neelmishra.github.io" + source
                )
                for image in page.locator("article img").all():
                    image.scroll_into_view_if_needed()
                    page.wait_for_function("image => image.complete && image.naturalWidth > 0",
                                           arg=image.element_handle())
                    image.evaluate("image => image.decode()")
                    assert image.get_attribute("alt"), source
                lab = page.locator("[data-hnsw-lab]")
                if lab.count():
                    page.wait_for_function(
                        "document.querySelector('[data-hnsw-lab]').dataset.ready === 'true'"
                    )
                    for ef, nearest, evaluations in [("1", "B", 3), ("2", "B", 3), ("3", "D", 4)]:
                        lab.locator("select").select_option(ef)
                        lab.locator("[data-finish]").click()
                        result = json.loads(lab.get_attribute("data-result"))
                        assert result["nearest"][0] == nearest
                        assert result["distance_evaluations"] == evaluations
                    lab.locator("[data-reset]").click()
                    lab.locator("[data-next]").focus()
                    page.keyboard.press("Enter")
                    assert json.loads(lab.get_attribute("data-result"))["step"] == 1
                for width in [320, 375, 768]:
                    page.set_viewport_size({"width": width, "height": 950})
                    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), (
                        source, width
                    )
                if screenshots:
                    page.set_viewport_size({"width": 1440, "height": 1000})
                    page.evaluate("scrollTo(0, 0)")
                    page.screenshot(path=str(Path(screenshots) / (Path(chapter["file"]).stem + "-rag.png")))
            page.goto(BASE + "/blog.html#retrieval-augmented-generation", wait_until="networkidle")
            all_chapters = json.loads((ROOT / "blog/rag/series.json").read_text())["chapters"]
            assert page.locator('#retrieval-augmented-generation .blog-card').count() == len(all_chapters)
            assert page.locator('.blog-chip[data-cat="rag"]').get_attribute("aria-pressed") == "true"
            assert page.locator('.blog-chip[data-cat="rag"]').inner_text().startswith("RAG")
            if any(chapter["file"].startswith("rag/ann-methods/hnsw/") for chapter in all_chapters):
                page.goto(BASE + "/blog.html#folder-rag--ann-methods--hnsw", wait_until="networkidle")
                assert page.locator("#folder-rag--ann-methods--hnsw").evaluate("node => node.open")
                assert page.locator("#folder-rag--ann-methods").evaluate("node => node.open")
            assert not errors, errors
            assert not bad_responses, bad_responses
            if not selected and any(chapter["file"].endswith("/search-layer.html")
                                    for chapter in all_chapters):
                failure = browser.new_page()
                failure.route("**/search-traces.json", lambda route: route.fulfill(
                    status=503, body="Unavailable", content_type="text/plain"
                ))
                failure.goto(BASE + "/blog/rag/ann-methods/hnsw/search-layer.html",
                             wait_until="networkidle")
                assert "could not load" in failure.locator("[data-hnsw-lab] [role=alert]").inner_text()
                failure.close()
        finally:
            browser.close()
    print(f"RAG browser checks passed for {len(chapters)} pages: math, assets, navigation, controls, and mobile layouts.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("pages", nargs="*")
    main(parser.parse_args().pages)
