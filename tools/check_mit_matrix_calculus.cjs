/* Serve the repository with python3 -m http.server 8774, then run with Node.
 * Requires Playwright + Chrome; NODE_PATH may point to an existing installation.
 * MATRIX_BASE_URL and BROWSER_PATH can override the server and browser.
 * Checks the numerical lab, navigation, math rendering, and responsive layout.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const base = process.env.MATRIX_BASE_URL || 'http://127.0.0.1:8774';
const prefix = 'math/popular-courses/';
const lecture = prefix + 'mit-matrix-calculus/lecture-01/introduction-and-motivation.html';
const context = {};
const source = fs.readFileSync(path.join(root, 'blog.js'), 'utf8');
vm.runInNewContext(source.slice(0, source.indexOf('\n];') + 3), context);
vm.runInNewContext(fs.readFileSync(path.join(root, 'blog-posts.js'), 'utf8'), context);
const math = context.BLOG_TREE.find(n => n.name === 'math');
const courses = math.children.find(n => n.name === 'popular-courses');
const flatten = node => node.file ? [node.file] : node.children.flatMap(flatten);
const files = Array.from(flatten(courses));
assert.deepEqual(files, [prefix + 'index.html', prefix + 'mit-matrix-calculus/index.html', lecture]);
for (const file of files) {
  assert(fs.existsSync(path.join(root, 'blog', file)), file);
  assert.equal(context.BLOG_POSTS[file].category, 'math');
  assert(!context.BLOG_POSTS[file].draft);
}
const near = (a, b, tolerance = 6e-8) => assert(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const url = file => `${base}/blog/${file}`;
(async () => {
  const browser = await chromium.launch(process.env.BROWSER_PATH
    ? { headless: true, executablePath: process.env.BROWSER_PATH }
    : { headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const file of files) {
        assert.equal((await page.goto(url(file), { waitUntil: 'networkidle' })).status(), 200);
        assert.equal(await page.locator('article h1').count(), 1);
        assert.equal(await page.locator('.file-tree-file.active').count(), 1);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${file}: overflow at ${width}`);
        assert.equal(await page.locator('.katex-error').count(), 0);
        assert(await page.locator('.toc-section a').count() > 0);
        if (width < 900) assert.equal(await page.locator('.sidebar-toggle').getAttribute('aria-expanded'), 'false');
        const links = await page.locator('article [href], article [src], article source').evaluateAll(nodes => nodes.map(n => n.getAttribute('href') || n.getAttribute('src') || n.getAttribute('srcset')));
        for (const link of links) {
          const resolved = new URL(link, url(file));
          if (resolved.origin !== new URL(base).origin) continue;
          assert(fs.existsSync(path.join(root, decodeURIComponent(resolved.pathname))), `${file} → ${link}`);
          if (resolved.pathname === new URL(url(file)).pathname && resolved.hash) {
            assert.equal(await page.locator(resolved.hash).count(), 1, link);
          }
        }
        if (file === lecture) {
          assert(await page.locator('.katex').count() > 150, 'Math renderer did not load');
          assert.equal(await page.locator('.course-figure').count(), 6);
          for (const img of await page.locator('article img').all()) {
            await img.scrollIntoViewIfNeeded();
            await img.evaluate(image => image.decode());
            assert(await img.evaluate(image => image.naturalWidth > 0));
          }
          const diagramSources = await page.locator('picture img').evaluateAll(nodes => nodes.map(n => n.currentSrc));
          assert(diagramSources.every(src => src.includes('-mobile.svg') === (width <= 700)));
        }
      }
    }
    await page.goto(url(lecture));
    for (const direction of ['swap', 'identity']) {
      await page.locator('#matrix-direction').selectOption(direction);
      for (const exponent of [-4, -3, -2, -1, 0]) {
        const e = 10 ** exponent;
        await page.locator('#matrix-step').fill(String(exponent));
        const readMatrix = async id => (await page.locator(id).innerText()).match(/-?\d+\.\d+/g).map(Number);
        // Closed-form expected results independently checked against the article.
        const linear = direction === 'swap' ? [2*e, 4*e, 4*e, 2*e] : [2*e, 4*e, 0, 6*e];
        const actual = linear.map((v,i) => v + (i === 0 || i === 3 ? e*e : 0));
        (await readMatrix('#matrix-actual')).forEach((v,i) => near(v, actual[i]));
        (await readMatrix('#matrix-linear')).forEach((v,i) => near(v, linear[i]));
        near(Number(await page.locator('#matrix-error').innerText()), Math.SQRT2*e*e);
        near(Number(await page.locator('#matrix-scaled-error').innerText()), Math.SQRT2*e);
        near(Number(await page.locator('#matrix-shortcut-error').innerText()), direction === 'swap' ? Math.sqrt(16+2*e*e) : Math.SQRT2*e);
      }
    }
    await page.locator('#matrix-reset').click();
    assert.equal(await page.locator('#matrix-step').inputValue(), '-1');
    assert.equal(await page.locator('#matrix-direction').inputValue(), 'swap');
    await page.locator('#matrix-step').focus();
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('#matrix-step-value').innerText(), '0.01');
    await page.locator('.note-check summary').first().click();
    assert(await page.locator('.note-check').first().getAttribute('open') !== null);
    await page.goto(`${base}/blog.html`, { waitUntil: 'networkidle' });
    assert(await page.locator(`a[href="blog/${lecture}"]`).count() > 0, 'Missing blog index link');
    assert.deepEqual(errors, []);
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
    const fallback = await nojs.newPage();
    await fallback.goto(url(lecture));
    assert(await fallback.locator('#matrix-step').isDisabled());
    assert.match(await fallback.locator('#matrix-actual').innerText(), /0\.21/);
    assert(await fallback.locator('noscript').isVisible());
    assert(await fallback.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No-JS overflow');
    await nojs.close();
    console.log('MIT matrix calculus passed: 3 registered pages; desktop/390/320px layouts; math rendering; 6 figures; all 10 lab states; keyboard/reset; no-JS fallback; index and local links.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
