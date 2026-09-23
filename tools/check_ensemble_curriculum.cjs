/* Serve the repo with python3 -m http.server 8788 --bind 127.0.0.1.
 * Run: NODE_PATH=/path/to/node_modules node tools/check_ensemble_curriculum.cjs
 * Requires Playwright and Chrome. ENSEMBLE_BASE_URL/BROWSER_PATH override defaults.
 * Regenerate numerical fixtures first with boosting/worked_examples.py and the
 * two exact-fraction scripts linked in the chapters.
 */
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),base=process.env.ENSEMBLE_BASE_URL||'http://127.0.0.1:8788';
const shots=process.env.ENSEMBLE_SCREENSHOTS;
if(shots)fs.mkdirSync(shots,{recursive:true});
const series={bagging:['index','bootstrap-aggregation','random-forests','evaluation','interview-guide'],boosting:['index','adaboost','gradient-boosting','classification-losses','modern-boosting','library-systems','regularization','interview-guide']};
const files=['bagging-and-boosting/index.html',...Object.entries(series).flatMap(([dir,names])=>names.map(n=>`${dir}/${n}.html`))];
const context={};const src=fs.readFileSync(path.join(root,'blog.js'),'utf8');
vm.runInNewContext(src.slice(0,src.indexOf('\n];')+3),context);
vm.runInNewContext(fs.readFileSync(path.join(root,'blog-posts.js'),'utf8'),context);
const ml=context.BLOG_TREE.find(n=>n.name==='ml');
for(const [dir,names] of Object.entries(series)){
 const node=ml.children.find(n=>n.name===dir);
 assert.deepEqual(Array.from(node.children,n=>n.file),names.map(n=>`ml/${dir}/${n}.html`));
 names.forEach((name,i)=>{
  const file=`ml/${dir}/${name}.html`,html=fs.readFileSync(path.join(root,'blog',file),'utf8');
  assert(context.BLOG_POSTS[file].series.endsWith(`Part ${i+1}`));
  assert(html.includes(`Part ${i+1} of ${names.length}`));
  const nav=html.match(/<nav class="post-nav"[\s\S]*?<\/nav>/)[0];
  if(i)assert(nav.includes(`class="prev" href="${names[i-1]}.html"`));
  if(i+1<names.length)assert(nav.includes(`class="next" href="${names[i+1]}.html"`));
  assert.equal(html.match(/<h1>(.*?)<\/h1>/)[1],context.BLOG_POSTS[file].title);
 });
}
const fixtures=JSON.parse(fs.readFileSync(path.join(root,'blog/ml/boosting/figures/worked-examples.json'),'utf8'));
const near=(a,b)=>assert(Math.abs(a-b)<0.000011,`${a} != ${b}`);
const pageURL=file=>`${base}/blog/ml/${file}`;
(async()=>{
 const browser=await chromium.launch(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{channel:'chrome'});
 try{
  const page=await browser.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  // Local response failures are not allowed to hide behind successful page loads.
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:1000});
   for(const file of files){
    assert.equal((await page.goto(pageURL(file),{waitUntil:'networkidle'})).status(),200);
    assert.equal(await page.locator('article h1').count(),1);
    assert.equal(await page.locator('.file-tree-file.active').count(),1,file);
    assert(await page.locator('.toc-section a').count()>0,file);
    // Open all optional proofs to catch hidden equation/layout errors too.
    await page.locator('article details').evaluateAll(ns=>ns.forEach(n=>n.open=true));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${file}: overflow at ${width}`);
    assert.equal(await page.locator('.katex-error').count(),0,file);
    const html=fs.readFileSync(path.join(root,'blog/ml',file),'utf8');
    if(/\$[^$]+\$/.test(html.slice(html.indexOf('<h1>'),html.indexOf('</article>'))))assert(await page.locator('.katex').count()>0,`${file}: math did not load`);
    for(const img of await page.locator('article img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
    const ids=await page.locator('article [id]').evaluateAll(ns=>ns.map(n=>n.id));
    assert.equal(new Set(ids).size,ids.length,`${file}: duplicate IDs`);
    const urls=await page.locator('article [href],article [src]').evaluateAll(ns=>ns.map(n=>n.getAttribute('href')||n.getAttribute('src')));
    for(const link of urls){
     const u=new URL(link,page.url());if(u.origin!==new URL(base).origin)continue;
     const local=path.join(root,decodeURIComponent(u.pathname));assert(fs.existsSync(local),`${file} → ${link}`);
     if(u.hash&&local.endsWith('.html'))assert(new RegExp(`id=["']${u.hash.slice(1)}["']`).test(fs.readFileSync(local,'utf8')),`${file} → ${link}`);
    }
    if(shots&&width===390){
     let i=0;for(const figure of await page.locator('article figure').all()){
      await figure.scrollIntoViewIfNeeded();await figure.screenshot({path:path.join(shots,`${file.replaceAll('/','-')}-${i++}.png`)});
     }
    }
   }
   console.log(`All ${files.length} pages verified at ${width}px, with proofs open.`);
  }
  await page.goto(pageURL('bagging/evaluation.html'));
  for(const [row,pred,error] of [[1,2,1],[2,6,16],[3,2.25,3.0625],[4,6,4],[5,4,9]]){
   await page.selectOption('#oob-row',String(row));
   assert((await page.locator('#oob-result').innerText()).includes(`OOB prediction ${pred}; squared error ${error}.`));
   assert.equal(await page.locator('#oob-cards .eligible').count(),1);
  }
  await page.goto(pageURL('boosting/gradient-boosting.html'));
  for(const rate of ['0.1','0.5','1']){
   await page.locator('#boost-reset').click();await page.selectOption('#boost-rate',rate);await page.locator('#boost-prev').click();
   const expected=fixtures.regression[rate==='1'?'1.0':rate];
   assert(await page.locator('#boost-prev').isDisabled());
   for(let round=0;round<=6;round++){
    const status=await page.locator('#boost-status').innerText();assert(status.startsWith(`Round ${round} of 6.`));
    near(Number(status.match(/MSE: ([0-9.]+)/)[1].replace(/\.$/,'')),expected[round].mse);
    const rows=await page.locator('#boost-rows tr').evaluateAll(ns=>ns.map(n=>Array.from(n.cells,c=>c.textContent)));
    rows.forEach((row,i)=>{
     near(Number(row[4]),expected[round].prediction[i]);
     if(round){near(Number(row[1]),expected[round].before[i]);near(Number(row[2]),expected[round].residual[i]);near(Number(row[3]),expected[round].correction[i]);}
    });
    if(round<6)await page.locator('#boost-next').click();
   }
   assert(await page.locator('#boost-next').isDisabled());
  }
  await page.locator('#boost-reset').click();assert.equal(await page.locator('#boost-rate').inputValue(),'0.5');
  await page.locator('#boost-next').focus();await page.keyboard.press('Enter');
  assert((await page.locator('#boost-status').innerText()).startsWith('Round 2'));
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('#boost-bars .note-bar > span').first().evaluate(n=>getComputedStyle(n).transitionDuration),'0s');
  if(shots)await page.locator('#residual-lab').screenshot({path:path.join(shots,'residual-lab-320.png')});
  // Old bookmarks retain their section hashes. Moved sections have explicit onward links.
  for(const [old,newFile,hash] of [['bagging-random-forests','bagging/bootstrap-aggregation','oob-worked'],['adaboost','boosting/adaboost','proof'],['gradient-boosting','boosting/gradient-boosting','classification'],['modern-boosting','boosting/modern-boosting','catboost'],['interview-guide','boosting/interview-guide','coding']]){
   await page.goto(pageURL(`bagging-and-boosting/${old}.html`)+`?from=bookmark#${hash}`);
   assert(page.url().endsWith(`${newFile}.html?from=bookmark#${hash}`));assert.equal(await page.locator(`#${hash}`).count(),1);
  }
  await page.goto(`${base}/blog.html`,{waitUntil:'networkidle'});
  for(const file of files)assert(await page.locator(`a[href="blog/ml/${file}"]`).count()>0,`${file}: missing blog index entry`);
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:1000}});const q=await nojs.newPage();
  for(const file of files){
   await q.goto(pageURL(file));assert(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${file}: no-JS overflow`);
   if(file==='bagging/evaluation.html'){assert(await q.locator('#oob-row').isDisabled());assert((await q.locator('#oob-result').innerText()).includes('3.0625'));}
   if(file==='boosting/gradient-boosting.html'){assert(await q.locator('#boost-next').isDisabled());assert((await q.locator('#boost-status').innerText()).includes('3.25'));if(shots)await q.locator('#residual-lab').screenshot({path:path.join(shots,'residual-lab-nojs-320.png')});}
  }
  await nojs.close();assert.deepEqual(errors,[]);
  console.log('PASS: 13 ordered chapters + roadmap, all links/math/images, 5 OOB rows, 21 independently checked boosting states, keyboard/reset/reduced motion, 5 legacy redirects, blog index, and no-JS fallbacks.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
