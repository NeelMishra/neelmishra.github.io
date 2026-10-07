/* Run against a local repository server, e.g. python3 -m http.server 8768.
 * Requires Playwright and Chrome. NODE_PATH may point to a shared installation.
 * SLP3_BASE_URL overrides http://127.0.0.1:8768; BROWSER_PATH overrides Chrome.
 * These checks confirm each published outline has its chapter link, topic list,
 * and FAQ, and that the pages do not overflow. They do not review the textbook.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools/slp3-series.json')));
const base = process.env.SLP3_BASE_URL || 'http://127.0.0.1:8768';
const series = `${base}/${manifest.base_path}/`;
const published = manifest.chapters.filter(ch => ch.status === 'published');

(async () => {
  assert.equal(new Set(manifest.chapters.map(ch => ch.id)).size, 37);
  assert.equal(manifest.chapters.filter(ch => !ch.source).length, 1);
  const browser = await chromium.launch(process.env.BROWSER_PATH
    ? { headless: true, executablePath: process.env.BROWSER_PATH }
    : { headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const files = ['blog/nlp/index.html', 'blog/nlp/popular-textbooks/index.html', `${manifest.base_path}/index.html`, ...published.map(ch => `${manifest.base_path}/${ch.article}`)];
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const file of files) {
        const response = await page.goto(`${base}/${file}`, { waitUntil: 'networkidle' });
        assert.equal(response.status(), 200, file);
        assert.equal(await page.locator('article h1').count(), 1, file);
        assert.equal(await page.locator('.file-tree-file.active').count(), 1, file);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow: ${file} at ${width}`);
        if (width < 900) assert.equal(await page.locator('.sidebar-toggle').getAttribute('aria-expanded'), 'false');
        const links = await page.locator('article [href], article [src]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href') || n.getAttribute('src')));
        for (const link of links) {
          const url = new URL(link, `${base}/${file}`);
          if (url.origin !== new URL(base).origin) continue;
          assert(fs.existsSync(path.join(root, decodeURIComponent(url.pathname))), `Missing local target: ${file} -> ${link}`);
        }
      }
    }
    await page.goto(series + 'index.html');
    assert.equal(await page.locator('table a.textbook-status').count(), published.length);
    assert(await page.locator('#topics').isVisible());
    assert(await page.locator('#faq details').count() >= 2);
    for (const chapter of published) {
      await page.goto(series + chapter.article);
      const chapterLink = page.locator(`#chapter a[href="${chapter.source}"]`);
      assert.equal(await chapterLink.count(), 1, chapter.article);
      assert(await page.locator('#topics li').count() >= 3, chapter.article);
      assert(await page.locator('#faq details').count() >= 3, chapter.article);
      const scripts = await page.locator('script[src]').evaluateAll(nodes => nodes.map(n => n.getAttribute('src')));
      assert(scripts.every(src => !/lab\.js$/.test(src)), `Lab script still loaded: ${chapter.article}`);
      assert.equal(await page.locator('svg, .textbook-lab').count(), 0, chapter.article);
    }
    const noJS = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    for (const chapter of published) {
      await noJS.goto(series + chapter.article);
      assert(await noJS.locator('#topics li').count() >= 3, chapter.article);
      assert(await noJS.locator('#faq details').count() >= 3, chapter.article);
      assert(await noJS.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No-JS overflow: ${chapter.article}`);
    }
    await noJS.close();
    assert.deepEqual(errors, [], 'Uncaught browser errors');
    console.log(`SLP outline checks passed: ${published.length} published chapters, ${files.length} pages at three viewport widths.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
