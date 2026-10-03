/* Serve the repo, then set ACTIVATION_BASE_URL and run with Node + Playwright. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {chromium} = require('playwright');
const root = path.resolve(__dirname,'..');
const folder = 'blog/dl/activation-functions';
const chapters = JSON.parse(fs.readFileSync(path.join(root,folder,'series.json'),'utf8'));
const base = process.env.ACTIVATION_BASE_URL || 'http://127.0.0.1:8791';
const shots = process.env.ACTIVATION_SCREENSHOTS;
if(shots) fs.mkdirSync(shots,{recursive:true});
const metadata={}; vm.runInNewContext(fs.readFileSync(path.join(root,'blog-posts.js'),'utf8'),metadata);
for(const c of chapters){
 const file='dl/activation-functions/'+c.slug+'.html';
 assert.equal(metadata.BLOG_POSTS[file].title,c.title);
 assert.equal(metadata.BLOG_POSTS[file].description,c.description);
 assert(metadata.BLOG_POSTS[file].meta.includes(c.minutes+' min read'));
}
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 try{
 const page=await browser.newPage();
 const errors=[],overflows=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.route('**/*goatcounter*',r=>r.abort());
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:1000});
  for(const c of chapters){
   const file=folder+'/'+c.slug+'.html';
   assert.equal((await page.goto(base+'/'+file,{waitUntil:'networkidle'})).status(),200);
   assert.equal(await page.locator('article h1').innerText(),c.title);
   assert.equal(await page.locator('.file-tree-file.active').count(),1,file);
   assert(await page.locator('.toc-section a').count()>0,file);
   assert(await page.locator('article .katex').count()>0,file);
   assert.equal(await page.locator('.katex-error').count(),0,file);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),file+': page overflow '+width);
   const eqs=await page.locator('.note-equation').evaluateAll(ns=>ns.filter(n=>n.scrollWidth>n.clientWidth+2).map(n=>n.querySelector('annotation')?.textContent));
   if(eqs.length)overflows.push({file,width,equations:eqs});
   assert.equal(await page.locator('.note-table td,.note-table th').evaluateAll(ns=>ns.filter(n=>n.scrollWidth>n.clientWidth+2).length),0,file+': table overflow '+width);
   const ids=await page.locator('article [id]').evaluateAll(ns=>ns.map(n=>n.id));
   assert.equal(ids.length,new Set(ids).size,file+': duplicate ids');
   const links=await page.locator('article [href],article [src]').evaluateAll(ns=>ns.map(n=>n.getAttribute('href')||n.getAttribute('src')));
   for(const link of links){
    const url=new URL(link,page.url());
    if(url.origin!==new URL(base).origin)continue;
    const target=path.join(root,decodeURIComponent(url.pathname));
    assert(fs.existsSync(target),file+': broken link '+link);
    if(url.hash&&target.endsWith('.html'))assert(fs.readFileSync(target,'utf8').includes('id="'+url.hash.slice(1)+'"'),file+': broken anchor '+link);
   }
   for(const img of await page.locator('article img').all()){
    assert(await img.getAttribute('alt'));
    await img.scrollIntoViewIfNeeded();await img.evaluate(n=>n.decode());
    assert(await img.evaluate(n=>n.naturalWidth>0));
    if(shots&&width===1440)await img.screenshot({path:path.join(shots,c.slug+'-figure.png')});
   }
   if(width<900){
    const toggle=page.locator('.sidebar-toggle');
    await toggle.focus();await page.keyboard.press('Enter');
    assert.equal(await toggle.getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Enter');
    assert.equal(await toggle.getAttribute('aria-expanded'),'false');
   }
   if(shots&&(width===1440||width===320)){
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.join(shots,c.slug+'-'+width+'.png')});
   }
  }
  console.log('Verified '+chapters.length+' activation pages at '+width+'px.');
 }
 await page.goto(base+'/blog.html',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.blog-card[href^="'+folder+'/"]').count(),chapters.length);
 await page.goto(base+'/blog/dl/transformers/building-blocks/feed-forward.html',{waitUntil:'networkidle'});
 await page.locator('article a[href="../../activation-functions/swiglu.html"]').click();
 assert(page.url().endsWith('/activation-functions/swiglu.html'));
 assert.deepEqual(errors,[]);
 assert.deepEqual(overflows,[]);
 console.log('Registries, navigation, local links, images, math, and mobile keyboard controls passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
