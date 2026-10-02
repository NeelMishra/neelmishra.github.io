/* Serve the repository on 8789, then run with Node and Playwright installed.
 * SHAP_BASE_URL overrides the server; TREE_SHAP_SCREENSHOTS saves preview images.
 * Run tree_shap_lab.py and verify_treeexplainer.py to regenerate numerical evidence.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const folder = 'blog/ml/explainability/tree-shap';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('tools/tree-shap-series.json'));
const exact = JSON.parse(read(`${folder}/assets/exact-results.json`));
const library = JSON.parse(read(`${folder}/assets/library-results.json`));
const near = (a,b,tol=1e-9) => assert(Math.abs(a-b)<=tol,`${a} != ${b}`);
near(exact.main.baseline.value + exact.main.phi.reduce((a,v)=>a+v.value,0),90);
near(exact.main.phi[1].value,3);
assert.equal(exact.independent_random_tree_checks,100);
near(library.reference_baseline + library.first_reference_phi.reduce((a,v)=>a+v,0),library.first_prediction,2e-6);
library.first_reference_phi.forEach((v,i)=>near(v,library.brute_reference_phi[i],2e-6));
library.toy_interactions.forEach((row,i)=>{
  near(row.reduce((a,v)=>a+v,0),exact.main.phi[i].value);
  row.forEach((v,j)=>near(v,library.toy_interactions[j][i]));
});
const base = process.env.SHAP_BASE_URL || 'http://127.0.0.1:8789';
const screenshots = process.env.TREE_SHAP_SCREENSHOTS;
if(screenshots) fs.mkdirSync(screenshots,{recursive:true});
(async()=>{
  const browser = await chromium.launch({channel:'chrome'});
  try {
    const page=await browser.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    await page.route('**/*goatcounter*',r=>r.abort());
    for(const width of [1440,390,320]){
      await page.setViewportSize({width,height:1000});
      for(const chapter of manifest.chapters){
        const file=`${folder}/${chapter.slug}.html`;
        const response=await page.goto(`${base}/${file}`,{waitUntil:'networkidle'});
        assert.equal(response.status(),200);
        assert.equal(await page.locator('article h1').innerText(),chapter.title);
        assert.equal(await page.locator('.file-tree-file.active').count(),1,file);
        assert(await page.locator('.toc-section a').count()>0,file);
        assert.equal(await page.locator('.katex-error').count(),0,file);
        assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),`https://neelmishra.github.io/${file}`);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${file}: page overflow ${width}`);
        const formulas = await page.locator('.note-equation').evaluateAll(ns=>ns.filter(n=>n.scrollWidth>n.clientWidth+2).length);
        assert.equal(formulas,0,`${file}: equation overflow ${width}`);
        for(const img of await page.locator('article img').all()){
          await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());
        }
        const ids=await page.locator('article [id]').evaluateAll(ns=>ns.map(n=>n.id));
        assert.equal(new Set(ids).size,ids.length,`${file}: duplicate anchor`);
        const links=await page.locator('article [href],article [src]').evaluateAll(ns=>ns.map(n=>n.getAttribute('href')||n.getAttribute('src')));
        for(const link of links){
          const url=new URL(link,page.url());if(url.origin!==new URL(base).origin)continue;
          const target=path.join(root,decodeURIComponent(url.pathname));
          assert(fs.existsSync(target),`${file} → ${link}`);
          if(url.hash&&target.endsWith('.html'))assert(fs.readFileSync(target,'utf8').includes(`id="${url.hash.slice(1)}"`),`${file}: absent anchor ${link}`);
        }
        const first=await page.locator('article h2').first().getAttribute('id');
        await page.goto(`${base}/${file}#${first}`,{waitUntil:'networkidle'});
        const position=await page.locator(`article h2[id="${first}"]`).evaluate(n=>n.getBoundingClientRect().top);
        const headerBottom=await page.locator('.site-header').evaluate(n=>n.getBoundingClientRect().bottom);
        assert(position>=headerBottom-2,`${file}: heading obscured ${width}`);
        if(screenshots&&[1440,390].includes(width)){
          await page.evaluate(()=>scrollTo(0,0));
          await page.screenshot({path:path.join(screenshots,`${chapter.slug}-${width}.png`),fullPage:true});
        }
      }
      console.log(`Verified all eight TreeSHAP chapters at ${width}px.`);
    }
    await page.goto(`${base}/${folder}/index.html`,{waitUntil:'networkidle'});
    for(let mask=0;mask<8;mask++){
      for(let j=0;j<3;j++)await page.locator(`[data-feature="${j}"]`).setChecked(Boolean(mask&(1<<j)));
      const key=[0,1,2].filter(j=>mask&(1<<j)).map(j=>'ABC'[j]).join(',')||'none';
      const label=await page.locator('[data-mask-output]').innerText();
      const value=Number(label.split('= ')[1].replace(/\.$/,''));
      near(value,exact.main.coalitions[key].value,1e-6);
    }
    await page.locator('[data-feature="0"]').focus();await page.keyboard.press('Space');
    assert(!(await page.locator('[data-feature="0"]').isChecked()));
    await page.goto(`${base}/blog.html`,{waitUntil:'networkidle'});
    assert.equal(await page.locator('.blog-card[href^="blog/ml/explainability/tree-shap/"]').count(),8);
    assert.deepEqual(errors,[]);
    console.log('Numerical records, links, responsive layout, formulas, anchors, eight interactive states, keyboard controls, and blog index passed.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
