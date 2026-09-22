/* Run against a local repository server, e.g. python3 -m http.server 8768.
 * Requires Playwright and Chrome. NODE_PATH may point to a shared installation.
 * SLP3_BASE_URL overrides http://127.0.0.1:8768; BROWSER_PATH overrides Chrome.
 * These checks exercise the published articles and actual browser calculators.
 * They do not substitute for editorial review or visual inspection of figures.
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
const near = (actual, expected, tolerance = 0.000001) => assert(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

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
    const files = ['blog/ml/nlp/index.html', 'blog/ml/nlp/popular-textbooks/index.html', `${manifest.base_path}/index.html`, ...published.map(ch => `${manifest.base_path}/${ch.article}`)];
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
          assert(fs.existsSync(path.join(root, decodeURIComponent(url.pathname))), `Missing local target: ${file} → ${link}`);
        }
      }
    }
    await page.goto(series + 'index.html');
    assert.equal(await page.locator('table a.textbook-status').count(), published.length);
    await page.goto(series + 'introduction.html');
    for (let step = 5; step <= 40; step++) {
      const temperature = step / 20;
      await page.locator('#intro-temp').fill(String(temperature));
      const actual = await Promise.all(['tea', 'water', 'juice'].map(n => page.locator(`#intro-${n}-value`).innerText()));
      const values = actual.map(parseFloat);
      near(values.reduce((a, b) => a + b, 0), 100, 0.011);
      assert(values[0] > values[1] && values[1] > values[2]);
    }
    await page.locator('#intro-temp').fill('0.5');
    assert.equal(await page.locator('#intro-tea-value').innerText(), '78.26%');
    await page.locator('#intro-temp-reset').click();
    assert.equal(await page.locator('#intro-tea-value').innerText(), '60.00%');
    assert.match(await page.locator('#intro-temperature-result').innerText(), /Tea: 60.00 percent; water: 30.00 percent; juice: 10.00 percent/);
    // Explicit user preference survives a reload; the initial default does not write one.
    await page.locator('.sidebar-toggle').click();
    await page.reload();
    assert.equal(await page.locator('.sidebar-toggle').getAttribute('aria-expanded'), 'true');
    await page.evaluate(() => localStorage.removeItem('blog-sidebar-collapsed'));
    await page.goto(series + 'ngram-language-models.html');
    assert.match(await page.locator('#ngram-summary').innerText(), /perplexity = 1.8612/);
    await page.locator('#ngram-sentence').selectOption('i like coffee');
    assert.match(await page.locator('#ngram-summary').innerText(), /perplexity = ∞/);
    await page.locator('#ngram-k').fill('0.5');
    assert.match(await page.locator('#ngram-summary').innerText(), /perplexity = 3.9792/);
    await page.locator('#ngram-sentence').selectOption('you drink coffee');
    assert.match(await page.locator('#ngram-summary').innerText(), /perplexity = 3.7369/);
    for (const k of ['0', '0.1', '0.5', '1', '2']) {
      await page.locator('#ngram-k').fill(k);
      for (const history of ['<s>', 'i', 'you', 'drink', 'like', 'tea', 'coffee']) {
        await page.locator('#ngram-history').selectOption(history);
        near(await page.locator('#ngram-distribution meter').evaluateAll(nodes => nodes.reduce((sum, n) => sum + n.value, 0)), 1);
      }
    }
    if (published.some(ch => ch.id === '4')) {
      await page.goto(series + 'logistic-regression.html');
      assert.match(await page.locator('#logistic-lab-result').innerText(), /TP 3, FP 1, FN 1, TN 3/);
      for (const [threshold, expected] of [['0.75', /TP 1, FP 1, FN 3, TN 3/], ['0.3', /TP 4, FP 2, FN 0, TN 2/], ['1', /Precision undefined/]]) {
        await page.locator('#logistic-threshold').fill(threshold);
        assert.match(await page.locator('#logistic-lab-result').innerText(), expected);
      }
      await page.locator('#logistic-threshold-reset').click();
      assert.match(await page.locator('#logistic-lab-result').innerText(), /F1 75.0%/);
    }
    if (published.some(ch => ch.id === '5')) {
      await page.goto(series + 'embeddings.html');
      await page.locator('#embeddings-scale').fill('2');
      assert.match(await page.locator('#embeddings-result').innerText(), /Dot product = 48;.*cosine = 0.960/);
      await page.locator('#embeddings-candidate').selectOption('engine');
      assert.match(await page.locator('#embeddings-result').innerText(), /Dot product = 8;.*cosine = 0.194/);
      await page.locator('#embeddings-scale').fill('0.25');
      assert.match(await page.locator('#embeddings-result').innerText(), /Dot product = 1;.*cosine = 0.194/);
    }
    if (published.some(ch => ch.id === '6')) {
      await page.goto(series + 'neural-networks.html');
      assert.match(await page.locator('#neural-result').innerText(), /p = 0.673510, loss = 0.395252/);
      // Independently differentiate the scalar loss with central differences.
      function loss(p, target) {
        const h = [Math.max(0, p[0] + 2 * p[1] + p[2]), Math.max(0, p[3] + 2 * p[4] + p[5])];
        const logit = p[6] * h[0] + p[7] * h[1] + p[8];
        return Math.max(logit, 0) - target * logit + Math.log1p(Math.exp(-Math.abs(logit)));
      }
      for (const bias of ['0.1', '1']) for (const target of ['0', '1']) {
        await page.locator('#neural-bias').fill(bias);
        await page.locator('#neural-target').selectOption(target);
        const rows = await page.locator('#neural-gradients tr').evaluateAll(nodes => nodes.map(row => [...row.querySelectorAll('td')].map(cell => Number(cell.textContent))));
        assert.equal(rows.length, 9);
        const parameters = rows.map(row => row[0]);
        rows.forEach((row, i) => {
          const plus = parameters.slice(), minus = parameters.slice(), epsilon = 0.000001;
          plus[i] += epsilon; minus[i] -= epsilon;
          near(row[1], (loss(plus, +target) - loss(minus, +target)) / (2 * epsilon), 0.000001);
        });
      }
      await page.locator('#neural-rate').fill('0');
      const rows = await page.locator('#neural-gradients tr').evaluateAll(nodes => nodes.map(row => [...row.querySelectorAll('td')].map(cell => Number(cell.textContent))));
      rows.forEach(row => near(row[0], row[2]));
      await page.locator('#neural-reset').click();
      assert.match(await page.locator('#neural-result').innerText(), /p = 0.673510, loss = 0.395252/);
    }
    const noJS = await browser.newPage({javaScriptEnabled: false, viewport: {width: 390, height: 844}});
    await noJS.goto(series + 'introduction.html');
    assert(await noJS.locator('#intro-temp').isDisabled());
    assert(await noJS.locator('#intro-temp-reset').isDisabled());
    if (published.some(ch => ch.id === '4')) {
      await noJS.goto(series + 'logistic-regression.html');
      assert(await noJS.locator('#logistic-threshold').isDisabled());
      assert(await noJS.locator('#logistic-threshold-reset').isDisabled());
    }
    await noJS.close();
    assert.deepEqual(errors, [], 'Uncaught browser errors');
    console.log(`SLP checks passed: ${published.length} published chapters, ${files.length} pages at three viewport widths, local links, navigation, mobile preferences, all published interactive calculations.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
