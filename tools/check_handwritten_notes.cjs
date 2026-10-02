/* Serve the repo on port 8791, then run with Node and Playwright.
 * Optional: HANDWRITTEN_BASE_URL and HANDWRITTEN_SCREENSHOTS.
 * Run the companion calculations.py separately to verify the worked mathematics.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root,'tools/handwritten-notes-series.json'),'utf8'));
const folder = manifest.folder;
const base = process.env.HANDWRITTEN_BASE_URL || 'http://127.0.0.1:8791';
const shots = process.env.HANDWRITTEN_SCREENSHOTS;
if (shots) fs.mkdirSync(shots,{recursive:true});
const originals = JSON.parse(fs.readFileSync(path.join(root,folder,'sources/manifest.json'),'utf8'));
for (const item of originals) {
  const bytes = fs.readFileSync(path.join(root,folder,'sources',item.slug+'.pdf'));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);
}
(async()=>{
  const browser = await chromium.launch({channel:'chrome'});
  try {
    const page = await browser.newPage();
    const errors = [];
    const overflows = [];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400) errors.push(r.status()+' '+r.url());});
    await page.route('**/*goatcounter*',r=>r.abort());
    for (const width of [1440,390,320]) {
      await page.setViewportSize({width,height:1000});
      for (const chapter of manifest.chapters) {
        const file='blog/'+chapter.file;
        const response=await page.goto(base+'/'+file,{waitUntil:'networkidle'});
        assert.equal(response.status(),200,file);
        assert.equal(await page.locator('article h1').innerText(),chapter.title);
        assert.equal(await page.locator('.file-tree-file.active').count(),1,file);
        assert(await page.locator('.toc-section a').count()>0,file);
        assert.equal(await page.locator('.katex-error').count(),0,file);
        if(chapter.slug!=='index') assert(await page.locator('article .katex').count()>0,file+': math not rendered');
        assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://neelmishra.github.io/'+file);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),file+': page overflow '+width);
        if(width<900) {
          assert(await page.locator('.blog-post-layout').evaluate(n=>n.classList.contains('sidebar-collapsed')));
          const toggle=page.locator('.sidebar-toggle');
          await toggle.focus();await page.keyboard.press('Enter');
          assert.equal(await toggle.getAttribute('aria-expanded'),'true');
          await page.keyboard.press('Enter');
          assert.equal(await toggle.getAttribute('aria-expanded'),'false');
        }
        const eqs=await page.locator('.note-equation').evaluateAll(ns=>ns.filter(n=>n.scrollWidth>n.clientWidth+2).map(n=>n.textContent.trim().slice(0,90)));
        if(eqs.length) overflows.push({file,width,equations:eqs});
        assert.equal(await page.locator('.note-table th,.note-table td').evaluateAll(ns=>ns.filter(n=>n.scrollWidth>n.clientWidth+2).length),0,file+': table cell overflow '+width);
        const ids=await page.locator('article [id]').evaluateAll(ns=>ns.map(n=>n.id));
        assert.equal(ids.length,new Set(ids).size,file+': duplicate ids');
        const links=await page.locator('article [href],article [src]').evaluateAll(ns=>ns.map(n=>n.getAttribute('href')||n.getAttribute('src')));
        for(const link of links) {
          const url=new URL(link,page.url());
          if(url.origin!==new URL(base).origin) continue;
          const target=path.join(root,decodeURIComponent(url.pathname));
          assert(fs.existsSync(target),file+': broken link '+link);
          if(url.hash&&target.endsWith('.html')) assert(fs.readFileSync(target,'utf8').includes('id="'+url.hash.slice(1)+'"'),file+': broken anchor '+link);
        }
        if(chapter.slug!=='index') {
          const detail=page.locator('.source-page');
          assert.equal(await detail.count(),1);
          const summary=detail.locator('summary');
          await summary.focus();
          await page.keyboard.press('Enter');
          assert(await detail.evaluate(n=>n.open),file+': source disclosure did not open');
          const img=detail.locator('img');
          await img.scrollIntoViewIfNeeded();
          await img.evaluate(n=>n.decode());
          assert((await img.evaluate(n=>n.naturalWidth))>=1100);
          if(shots&&width===390&&chapter.slug==='mle-map') await page.screenshot({path:path.join(shots,'source-scan-mobile.png')});
          await summary.focus();await page.keyboard.press('Enter');
          assert(!(await detail.evaluate(n=>n.open)));
        }
        for(const img of await page.locator('article img').all()) {
          if(await img.isVisible()) {await img.scrollIntoViewIfNeeded();await img.evaluate(n=>n.decode());}
          assert(await img.getAttribute('alt'));
          if(shots&&width===1440&&(await img.getAttribute('src')).startsWith('assets/')) {
            await img.screenshot({path:path.join(shots,chapter.slug+'-figure.png')});
          }
        }
        const first=await page.locator('article h2').first().getAttribute('id');
        await page.goto(base+'/'+file+'#'+first,{waitUntil:'networkidle'});
        const top=await page.locator('h2[id="'+first+'"]').evaluate(n=>n.getBoundingClientRect().top);
        const bottom=await page.locator('.site-header').evaluate(n=>n.getBoundingClientRect().bottom);
        assert(top>=bottom-2,file+': obscured anchor '+width);
        if(shots&&[1440,390].includes(width)) {
          await page.evaluate(()=>scrollTo(0,0));
          await page.screenshot({path:path.join(shots,chapter.slug+'-'+width+'.png')});
          if(chapter.slug!=='index') {
            const tables=page.locator('article .note-table');
            await tables.last().scrollIntoViewIfNeeded();
            await page.screenshot({path:path.join(shots,chapter.slug+'-table-'+width+'.png')});
          }
        }
      }
      console.log('Verified seven handwritten-note pages at '+width+'px.');
    }
    await page.goto(base+'/blog.html',{waitUntil:'networkidle'});
    assert.equal(await page.locator('.blog-card[href^="'+folder+'/"]').count(),7);
    await page.goto(base+'/blog/ml/index.html',{waitUntil:'networkidle'});
    assert.equal(await page.locator('h2#handwritten-notes').count(),1);
    assert.deepEqual(errors,[]);
    assert.deepEqual(overflows,[]);
    console.log('Navigation, registry cards, source PDFs, keyboard disclosures, math, images and local links passed.');
    console.log('Equations needing horizontal scrolling: '+JSON.stringify(overflows));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
