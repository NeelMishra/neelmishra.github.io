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
// Change native range values and dispatch the event consumed by the calculators.
// Keyboard checks below separately verify their normal user interaction.
const setRange = (page, selector, value) => page.locator(selector).evaluate((input, next) => {
  input.value = String(next);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}, value);

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
    if (published.some(ch => ch.id === '7')) {
      await page.goto(series + 'transformers-and-pretraining.html');
      assert(await page.locator('#transformer-controls').isVisible());
      // The stipulated Q/K pairs give these scaled scores directly. Calculate
      // the probability-weighted value average independently of the page code.
      const values = [[2, 0], [0, 2], [1, 3], [4, -1]];
      const snapshots = new Map();
      for (const position of [0, 1, 2, 3]) for (const masked of [true, false]) for (const strength of [-2, 3, 5]) {
        await page.locator('#transformer-position').selectOption(String(position));
        await page.locator('#transformer-mask').setChecked(masked);
        await setRange(page, '#transformer-strength', strength);
        const scores = position === 1 ? [0, 1, 1, 0] : position === 3 ? [1, 1, 2, strength] : [1, 0, 1, strength];
        const sourceIndices = masked ? Array.from({ length: position + 1 }, (_, i) => i) : [0, 1, 2, 3];
        const denominator = sourceIndices.reduce((sum, i) => sum + Math.exp(scores[i]), 0);
        const expected = scores.map((score, i) => sourceIndices.includes(i) ? Math.exp(score) / denominator : 0);
        const actual = await page.locator('#transformer-rows meter').evaluateAll(nodes => nodes.map(n => n.value));
        assert.equal(actual.length, 4);
        actual.forEach((weight, i) => near(weight, expected[i]));
        near(actual.reduce((sum, weight) => sum + weight, 0), 1);
        const text = await page.locator('#transformer-result').innerText();
        const head = text.match(/head output is \[([^\]]+)\]/)[1].split(',').map(Number);
        for (let dim = 0; dim < 2; dim++) near(head[dim], expected.reduce((sum, weight, i) => sum + weight * values[i][dim], 0));
        if (masked) actual.slice(position + 1).forEach(weight => assert.equal(weight, 0));
        snapshots.set(`${position}/${masked}/${strength}`, { weights: actual, head });
      }
      // Changing a future key cannot alter any earlier causal row; at the last
      // position toggling the mask changes nothing because every key is eligible.
      for (const position of [0, 1, 2]) assert.deepEqual(snapshots.get(`${position}/true/-2`), snapshots.get(`${position}/true/5`));
      assert.deepEqual(snapshots.get('0/true/3').weights, [1, 0, 0, 0]);
      assert.deepEqual(snapshots.get('3/true/3'), snapshots.get('3/false/3'));
      assert(snapshots.get('2/false/5').weights[3] > snapshots.get('2/false/-2').weights[3]);
      await page.locator('#transformer-reset').click();
      assert.equal(await page.locator('#transformer-position').inputValue(), '2');
      assert.equal(await page.locator('#transformer-strength').inputValue(), '3');
      assert(await page.locator('#transformer-mask').isChecked());
      assert.match(await page.locator('#transformer-result').innerText(), /head output is \[1.266956, 1.577681\]/);
    }
    if (published.some(ch => ch.id === '8')) {
      await page.goto(series + 'post-training.html');
      assert(await page.locator('#posttraining-policy').isEnabled());
      // Independent two-completion arithmetic includes reference reversal,
      // identical policies, extreme odds, and all exposed beta choices.
      const logOdds = p => Math.log(p / (1 - p));
      for (const [policy, reference] of [[.7, .6], [.8, .9], [.05, .95], [.95, .05], [.6, .6], [.95, .95]]) {
        for (const beta of ['.1', '.5', '1', '2']) {
          await setRange(page, '#posttraining-policy', policy);
          await setRange(page, '#posttraining-reference', reference);
          await page.locator('#posttraining-beta').selectOption(beta);
          const margin = logOdds(policy) - logOdds(reference), score = +beta * margin;
          const preference = 1 / (1 + Math.exp(-score));
          const loss = -Math.log(preference);
          const kl = policy * Math.log(policy / reference) + (1 - policy) * Math.log((1 - policy) / (1 - reference));
          // Numerically differentiate the pair loss as a function of the
          // policy's log odds, rather than restating the analytic derivative.
          const pairLoss = z => Math.log1p(Math.exp(-Number(beta) * (z - logOdds(reference))));
          const z = logOdds(policy), epsilon = 1e-5;
          const derivative = (pairLoss(z + epsilon) - pairLoss(z - epsilon)) / (2 * epsilon);
          const observed = [...(await page.locator('#posttraining-lab-result').innerText()).matchAll(/-?\d+\.\d+/g)].map(match => Number(match[0]));
          const expected = [100 * policy, 100 * reference, margin, score, 100 * preference, loss, derivative, kl];
          assert.equal(observed.length, expected.length);
          observed.forEach((value, i) => near(value, expected[i], i === 4 ? .0051 : .000051));
          if (policy === reference) {
            near(observed[4], 50);
            near(observed[5], Math.log(2), .000051);
            near(observed[7], 0);
          }
          if (policy < reference) assert(observed[4] < 50, 'A policy behind its reference must have negative DPO margin');
        }
      }
      await page.locator('#posttraining-reset').click();
      assert.equal(await page.locator('#posttraining-policy').inputValue(), '0.7');
      assert.equal(await page.locator('#posttraining-reference').inputValue(), '0.6');
      assert.equal(await page.locator('#posttraining-beta').inputValue(), '.5');
      assert.match(await page.locator('#posttraining-lab-result').innerText(), /preference probability 55.50%; loss 0.5888/);
      await page.locator('#posttraining-policy').focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('#posttraining-policy').inputValue(), '0.75');
      assert.match(await page.locator('#posttraining-lab-result').innerText(), /Policy chosen probability 75.0%/);
    }
    if (published.some(ch => ch.id === '9')) {
      await page.goto(series + 'masked-language-models.html');
      assert(await page.locator('#masked-controls').isVisible());
      const words = ['red', 'crossed', 'quiet'];
      const cases = [
        { treatments: ['mask', 'random', 'keep'], input: 'the [MASK] boat slept the quiet lake', selected: [0, 1, 2] },
        { treatments: ['mask', 'mask', 'mask'], input: 'the [MASK] boat [MASK] the [MASK] lake', selected: [0, 1, 2] },
        { treatments: ['random', 'random', 'random'], input: 'the blue boat slept the wide lake', selected: [0, 1, 2] },
        { treatments: ['keep', 'keep', 'keep'], input: 'the red boat crossed the quiet lake', selected: [0, 1, 2] },
        { treatments: ['keep', 'ignore', 'ignore'], input: 'the red boat crossed the quiet lake', selected: [0] },
        { treatments: ['ignore', 'ignore', 'keep'], input: 'the red boat crossed the quiet lake', selected: [2] },
        { treatments: ['ignore', 'random', 'keep'], input: 'the red boat slept the quiet lake', selected: [1, 2] },
        { treatments: ['ignore', 'ignore', 'ignore'], input: 'the red boat crossed the quiet lake', selected: [] }
      ];
      const unselectedRedResults = [];
      for (const state of cases) for (const confidence of [5, 50, 95]) {
        for (let i = 0; i < words.length; i++) await page.locator(`#masked-${words[i]}`).selectOption(state.treatments[i]);
        await setRange(page, '#masked-confidence', confidence);
        assert.equal(await page.locator('#masked-input').innerText(), 'Input: ' + state.input);
        const result = await page.locator('#masked-result').innerText();
        if (!state.selected.length) {
          assert.match(result, /mean MLM loss is undefined.*denominator would be zero/);
          assert.doesNotMatch(result, /NaN|Infinity/);
          continue;
        }
        const probability = [confidence / 100, .25, .8];
        // Product of original-target probabilities gives the joint likelihood;
        // corruption changes inputs, never the selected targets in this toy lab.
        const expectedSum = -Math.log(state.selected.reduce((product, i) => product * probability[i], 1));
        const observed = result.match(/Sum loss = ([\d.]+); selected positions = (\d+); mean loss = ([\d.]+)/);
        assert(observed, result);
        near(Number(observed[1]), expectedSum);
        assert.equal(Number(observed[2]), state.selected.length);
        near(Number(observed[3]), expectedSum / state.selected.length);
        assert(result.startsWith('Targets: ' + state.selected.map(i => words[i]).join(', ') + '.'));
        if (state.selected.length === 1 && state.selected[0] === 2) unselectedRedResults.push(result);
      }
      assert.equal(new Set(unselectedRedResults).size, 1, 'Confidence for an unselected target must not change MLM loss');
      await page.locator('#masked-reset').click();
      assert.equal(await page.locator('#masked-red').inputValue(), 'mask');
      assert.equal(await page.locator('#masked-crossed').inputValue(), 'random');
      assert.equal(await page.locator('#masked-quiet').inputValue(), 'keep');
      assert.equal(await page.locator('#masked-confidence').inputValue(), '50');
      assert.match(await page.locator('#masked-result').innerText(), /mean loss = 0.767528/);
    }
    if (published.some(ch => ch.id === '10')) {
      await page.goto(series + 'interpretability.html');
      assert(await page.locator('#interpretability-controls').isVisible());
      const probabilityFromOdds = odds => 100 * odds / (1 + odds);
      for (const g of [-3, 0, 3]) for (const c of [-3, 0, 3]) for (const action of ['none', 'g', 'c']) {
        await setRange(page, '#interpretability-g', g);
        await setRange(page, '#interpretability-c', c);
        await page.locator('#interpretability-action').selectOption(action);
        const readouts = await Promise.all(['probe-before', 'probe-after', 'model-before', 'model-after'].map(id =>
          page.locator('#interpretability-' + id).innerText().then(parseFloat)));
        const beforeProbe = probabilityFromOdds(Math.exp(2 * g));
        const beforeModel = probabilityFromOdds(Math.exp(c));
        [beforeProbe, action === 'g' ? 50 : beforeProbe, beforeModel, action === 'c' ? 50 : beforeModel]
          .forEach((expected, i) => near(readouts[i], expected, .0051));
        if (action === 'g') assert.equal(readouts[2], readouts[3], 'Ablating the probe coordinate must not change the toy model');
        if (action === 'c') assert.equal(readouts[0], readouts[1], 'Ablating the model coordinate must not change the probe');
      }
      await page.locator('#interpretability-reset').click();
      assert.equal(await page.locator('#interpretability-g').inputValue(), '1');
      assert.equal(await page.locator('#interpretability-c').inputValue(), '0.5');
      assert.equal(await page.locator('#interpretability-action').inputValue(), 'none');
      assert.equal(await page.locator('#interpretability-probe-after').innerText(), '88.08%');
      assert.equal(await page.locator('#interpretability-model-after').innerText(), '62.25%');
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
    await noJS.setViewportSize({ width: 320, height: 1000 });
    for (const [id, article, container] of [
      ['7', 'transformers-and-pretraining.html', '#transformer-controls'],
      ['9', 'masked-language-models.html', '#masked-controls'],
      ['10', 'interpretability.html', '#interpretability-controls']
    ]) if (published.some(ch => ch.id === id)) {
      await noJS.goto(series + article);
      assert(await noJS.locator(container).isHidden(), `No-JS controls should be hidden: ${article}`);
      assert(await noJS.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No-JS overflow: ${article}`);
      if (id === '7') {
        assert(await noJS.locator('#transformer-live').isHidden());
        assert.match(await noJS.locator('#transformer-result').innerText(), /head output is \[1.266956, 1.577681\]/);
      } else if (id === '9') {
        assert.equal(await noJS.locator('#masked-input').innerText(), 'Input: the [MASK] boat slept the quiet lake');
        assert.match(await noJS.locator('#masked-result').innerText(), /selected positions = 3; mean loss = 0.767528/);
      } else {
        assert.equal(await noJS.locator('#interpretability-probe-before').innerText(), '88.08%');
        assert.equal(await noJS.locator('#interpretability-model-before').innerText(), '62.25%');
        assert.match(await noJS.locator('noscript').innerText(), /Setting g to zero makes the probe’s probability 50%/);
      }
    }
    if (published.some(ch => ch.id === '8')) {
      await noJS.goto(series + 'post-training.html');
      for (const id of ['policy', 'reference', 'beta', 'reset']) assert(await noJS.locator('#posttraining-' + id).isDisabled());
      assert.match(await noJS.locator('#posttraining-lab-result').innerText(), /preference probability 55.50%; loss 0.5888/);
      assert.match(await noJS.locator('noscript').innerText(), /Controls require JavaScript/);
      assert(await noJS.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No-JS post-training overflow');
    }
    await noJS.close();
    assert.deepEqual(errors, [], 'Uncaught browser errors');
    console.log(`SLP checks passed: ${published.length} published chapters, ${files.length} pages at three viewport widths, local links, navigation, mobile preferences, all published interactive calculations.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
