/* Serve the repo on 8789; run with Node and Playwright.
 * LINEAR_EXPLAIN_BASE_URL and LINEAR_EXPLAIN_SCREENSHOTS are optional.
 * Run linear_model_lab.py in the series folder to reproduce numerical results.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const folder = 'blog/ml/explainability/linear-models';
const manifest = JSON.parse(fs.readFileSync(path.join(root,'tools/linear-model-explainability-series.json'),'utf8'));
const results = JSON.parse(fs.readFileSync(path.join(root,folder,'assets/results.json'),'utf8'));
const base = process.env.LINEAR_EXPLAIN_BASE_URL || 'http://127.0.0.1:8789';
const screenshots = process.env.LINEAR_EXPLAIN_SCREENSHOTS;
const near = (a,b,tol=1e-8)=>assert(Math.abs(a-b)<tol,a+' != '+b);
near(results.shap.baseline+results.shap.values.reduce((a,b)=>a+b),50);
results.shap.library_values.forEach((v,i)=>near(v,results.shap.brute_values[i]));
near(results.holdout.mae,1.5);
near(results.holdout.rmse,Math.sqrt(2.5));
assert.equal(results.shap.random_checks,50);
if(screenshots)fs.mkdirSync(screenshots,{recursive:true});
(async()=>{
  const browser=await chromium.launch({channel:'chrome'});
  try{
    const page=await browser.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
    await page.route('**/*goatcounter*',r=>r.abort());
    for(const width of [1440,390,320]){
      await page.setViewportSize({width,height:1000});
      for(const chapter of manifest.chapters){
        const file=folder+'/'+chapter.slug+'.html';
        const response=await page.goto(base+'/'+file,{waitUntil:'networkidle'});
        assert.equal(response.status(),200);
        assert.equal(await page.locator('article h1').innerText(),chapter.title);
        assert.equal(await page.locator('.file-tree-file.active').count(),1,file);
        assert(await page.locator('.toc-section a').count()>0,file);
        assert.equal(await page.locator('.katex-error').count(),0,file);
        assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://neelmishra.github.io/'+file);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),file+': page overflow at '+width);
        assert.equal(await page.locator('.note-equation').evaluateAll(ns=>ns.filter(n=>n.scrollWidth>n.clientWidth+2).length),0,file+': equation overflow '+width);
        assert.equal(await page.locator('.note-table th,.note-table td').evaluateAll(ns=>ns.filter(n=>n.scrollWidth>n.clientWidth+2).length),0,file+': cell overflow '+width);
        const ids=await page.locator('article [id]').evaluateAll(ns=>ns.map(n=>n.id));
        assert.equal(ids.length,new Set(ids).size,file+': duplicate ids');
        for(const img of await page.locator('article img').all()){
          await img.scrollIntoViewIfNeeded();await img.evaluate(n=>n.decode());
          assert(await img.getAttribute('alt'));
        }
        const links=await page.locator('article [href],article [src]').evaluateAll(ns=>ns.map(n=>n.getAttribute('href')||n.getAttribute('src')));
        for(const link of links){
          const url=new URL(link,page.url());if(url.origin!==new URL(base).origin)continue;
          const target=path.join(root,decodeURIComponent(url.pathname));
          assert(fs.existsSync(target),file+': '+link);
          if(url.hash&&target.endsWith('.html'))assert(fs.readFileSync(target,'utf8').includes('id="'+url.hash.slice(1)+'"'),file+': anchor '+link);
        }
        if(chapter.slug==='index'){
          const rows=await page.locator('#customer-data tbody tr').evaluateAll(ns=>ns.map(n=>Array.from(n.cells,c=>c.textContent.trim())));
          assert.deepEqual(rows,results.customers.map(r=>[r.name,String(r.visits),r.premium?'Premium':'Basic',String(r.observed)]));
        }
        if(['index','interactions','linear-shap'].includes(chapter.slug)){
          for(const v of [0,2,4,6]){
            await page.locator('[data-visits]').fill(String(v));
            for(const p of [false,true]){
              await page.locator('[data-premium]').setChecked(p);
              const expected=20+5*v+10*Number(p)+(chapter.slug==='interactions'?2*v*Number(p):0);
              near(Number(await page.locator('[data-model-lab]').getAttribute('data-prediction')),expected);
            }
          }
          await page.locator('[data-visits]').fill('4');
          await page.locator('[data-premium]').check();
          await page.locator('[data-premium]').focus();await page.keyboard.press('Space');
          assert(!(await page.locator('[data-premium]').isChecked()));
          await page.locator('[data-premium]').check();
        }
        const first=await page.locator('article h2').first().getAttribute('id');
        await page.goto(base+'/'+file+'#'+first,{waitUntil:'networkidle'});
        const top=await page.locator('h2[id="'+first+'"]').evaluate(n=>n.getBoundingClientRect().top);
        const bottom=await page.locator('.site-header').evaluate(n=>n.getBoundingClientRect().bottom);
        assert(top>=bottom-2,file+': obscured anchor '+width);
        if(screenshots&&[1440,390].includes(width)){
          await page.evaluate(()=>scrollTo(0,0));
          await page.screenshot({path:path.join(screenshots,chapter.slug+'-'+width+'.png'),fullPage:true});
        }
      }
      console.log('Verified nine linear-model chapters at '+width+'px.');
    }
    await page.goto(base+'/blog.html',{waitUntil:'networkidle'});
    assert.equal(await page.locator('.blog-card[href^="'+folder+'/"]').count(),9);
    await page.goto(base+'/blog/ml/explainability/index.html',{waitUntil:'networkidle'});
    assert.equal(await page.locator('h2#linear-models').count(),1);
    assert.deepEqual(errors,[]);
    console.log('Navigation, index, references, math, tables, figures, interactive states and keyboard controls passed.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
