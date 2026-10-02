/* Serve the repository on 8789. Run with Node and Playwright installed:
 * node tools/check_shap_series.cjs
 * SHAP_BASE_URL and SHAP_SCREENSHOTS can override the local URL and QA directory.
 * Numerical examples contain independent output-reconstruction assertions.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools/shap-series.json'), 'utf8'));
const folder = 'blog/ml/explainability/shapley-values';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const data = name => JSON.parse(read(`${folder}/assets/${name}.json`));
const near = (a, b, tolerance = 1e-8) => assert(Math.abs(a - b) <= tolerance, `${a} != ${b}`);
const frames = data('video-frames');
assert.equal(new Set(manifest.source_videos.map(v => v.id)).size, 9);
assert.deepEqual([...new Set(manifest.chapters.map(c => c.video))].sort(), manifest.source_videos.map(v => v.id).sort());
const articleHTML = manifest.chapters.map(c => read(`${folder}/${c.slug}.html`)).join('\n');
for (const frame of frames) {
  const source = manifest.source_videos.find(v => v.id === frame.video_id);
  assert(source && frame.seconds < source.duration_seconds);
  assert(articleHTML.includes(frame.file) && articleHTML.includes(frame.url), `Uncredited or unused frame: ${frame.file}`);
}
const exact = data('exact-examples');
for (const game of Object.values(exact)) {
  const players = Object.keys(game.phi);
  for (const order of game.orders) {
    const total = Object.values(order.gains).reduce((a,b) => a+b, 0);
    near(total, game.values[[...players].sort().join(',')] - game.values.none);
  }
  for (const player of players) near(game.phi[player], game.orders.reduce((a,o) => a+o.gains[player], 0)/game.orders.length);
}
const regression = data('regression-results');
near(regression.baseline + regression.first_phi.reduce((a,b) => a+b,0), regression.first_prediction, 2e-5);
assert(regression.test_mae < regression.mean_predictor_mae);
const classification = data('classification-results');
near(classification.binary_base_margin + classification.binary_phi.reduce((a,b) => a+b,0), classification.binary_margin);
near(1/(1+Math.exp(-classification.binary_margin)), classification.binary_probability);
near(classification.multi_probabilities.reduce((a,b) => a+b,0), 1, 1e-6);
const anomaly = data('anomaly-results');
near(anomaly.kernel_baseline + anomaly.first_kernel_phi.reduce((a,b) => a+b,0), anomaly.first_decision_score);
const c = 2*(Math.log(255)+0.5772156649015329)-2*255/256;
near(-Math.pow(2,-anomaly.first_path_length/c)-anomaly.offset, anomaly.first_decision_score, 1e-8);
const base = process.env.SHAP_BASE_URL || 'http://127.0.0.1:8789';
const screenshots = process.env.SHAP_SCREENSHOTS;
if (screenshots) fs.mkdirSync(screenshots, {recursive:true});
(async () => {
  const browser = await chromium.launch({channel:'chrome'});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', r => {if (r.url().startsWith(base) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);});
    // Disable analytics during local verification.
    await page.route('**/*goatcounter*', route => route.abort());
    const files = [...manifest.chapters.map(c => `${folder}/${c.slug}.html`), 'blog/ml/explainability/index.html', 'blog/ml/explainability/shap-lime/lime-local-surrogates.html'];
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width,height:1000});
      for (const file of files) {
        const response = await page.goto(`${base}/${file}`, {waitUntil:'networkidle'});
        assert.equal(response.status(),200);
        assert.equal(await page.locator('article h1').count(),1,file);
        assert.equal(await page.locator('.file-tree-file.active').count(),1,file);
        assert(await page.locator('.toc-section a').count()>0,file);
        assert.equal(await page.locator('.katex-error').count(),0,`${file}: broken math`);
        if (read(file).split('<h1>')[1]?.split('</article>')[0].includes('$$')) assert(await page.locator('.katex').count()>0,`${file}: math absent`);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${file}: horizontal overflow at ${width}`);
        for (const img of await page.locator('article img').all()) {
          await img.scrollIntoViewIfNeeded();
          await img.evaluate(i => i.decode());
        }
        const ids = await page.locator('article [id]').evaluateAll(nodes => nodes.map(n => n.id));
        assert.equal(ids.length, new Set(ids).size,`${file}: duplicate anchors`);
        const links = await page.locator('article [href],article [src]').evaluateAll(ns => ns.map(n=>n.getAttribute('href')||n.getAttribute('src')));
        for (const link of links) {
          const u = new URL(link,page.url());
          if (u.origin !== new URL(base).origin) continue;
          const target = path.join(root,decodeURIComponent(u.pathname));
          assert(fs.existsSync(target),`${file} → ${link}`);
          if (u.hash && target.endsWith('.html')) assert(fs.readFileSync(target,'utf8').includes(`id="${u.hash.slice(1)}"`),`${file}: absent anchor ${link}`);
        }
        if (screenshots && width === 390 && file.includes('shapley-values/')) {
          const name = path.basename(file,'.html');
          await page.evaluate(() => scrollTo(0,0));
          await page.screenshot({path:path.join(screenshots,`${name}-mobile.png`),fullPage:true});
        }
      }
      console.log(`Verified ${files.length} pages at ${width}px.`);
    }
    await page.goto(`${base}/${folder}/sharing-credit.html`,{waitUntil:'networkidle'});
    await page.getByRole('button',{name:'B joins first'}).focus();
    await page.keyboard.press('Enter');
    assert((await page.locator('[data-order-status]').innerText()).includes('A 6,250 and B 3,750'));
    assert.equal(await page.getByRole('button',{name:'B joins first'}).getAttribute('aria-pressed'),'true');
    await page.getByRole('button',{name:'A joins first'}).click();
    assert((await page.locator('[data-order-steps]').innerText()).includes('A adds 7,500'));
    for (const [legacy, mapping] of Object.entries(manifest.legacy_routes)) {
      for (const [fragment, destination] of [['',mapping.default],...Object.entries(mapping.fragments)]) {
        await page.goto(`${base}/blog/ml/explainability/${legacy}${fragment?'#'+fragment:''}`,{waitUntil:'networkidle'});
        assert.equal(page.url(),`${base}/${folder}/${destination}`,`${legacy}#${fragment}`);
      }
    }
    // The generated standalone force plot must work without the article shell.
    await page.goto(`${base}/${folder}/assets/regression-force.html`,{waitUntil:'networkidle'});
    assert(await page.locator('svg').count()>0,'Force plot did not render');
    assert.deepEqual(errors,[]);
    console.log('Source coverage, numerical fixtures, article links, mobile layout, keyboard controls, redirects, and force plot passed.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exit(1);});
