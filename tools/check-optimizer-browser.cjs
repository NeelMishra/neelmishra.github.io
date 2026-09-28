const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const pages=process.argv.length>2?process.argv.slice(2):['index','sgd','momentum','adadelta','rmsprop','adam','muon','newton-schulz','shampoo','soap','lion'];
 const base=process.env.OPTIMIZER_BASE_URL || 'http://127.0.0.1:8775';
 const artifacts=process.env.OPTIMIZER_ARTIFACTS || '/tmp/optimizer-browser-check';fs.mkdirSync(artifacts,{recursive:true});
 for(const slug of pages){
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/blog/dl/optimizers/'+slug+'.html');
  await page.waitForTimeout(500);
  assert.equal(await page.locator('h1').count(),1);assert.ok(await page.locator('.toc-section a').count()>0);
  assert.equal(await page.locator('.katex-error').count(),0,'KaTeX errors');
  assert.ok(await page.locator('.katex').count()>0,'Math did not render');
  const broken=await page.evaluate(async()=>{let links=Array.from(document.querySelectorAll('article a[href],article img[src]')).map(a=>a.href||a.src).filter(u=>u.startsWith(location.origin));return (await Promise.all(links.map(async u=>[u,(await fetch(u)).status]))).filter(p=>p[1]!==200);});
  assert.deepEqual(broken,[],'Broken local links');
  const polar=page.locator('[data-matrix="polar"]');
  if(await polar.count()){
   let values=JSON.parse(await polar.getAttribute('data-singular'));values.forEach(v=>assert.ok(Math.abs(v-1)<1e-8));
   await polar.getByLabel('Singular value s₂',{exact:true}).fill('0');await polar.getByLabel('Singular value s₂',{exact:true}).blur();values=JSON.parse(await polar.getAttribute('data-singular'));assert.ok(values[1]<1e-7);
   await polar.getByLabel('Singular value s₂',{exact:true}).fill('0.5');await polar.getByLabel('Singular value s₂',{exact:true}).blur();await polar.scrollIntoViewIfNeeded();await page.screenshot({path:artifacts+'/'+slug+'-desktop.png'});
  }
  const ns=page.locator('[data-matrix="schulz"]');
  if(await ns.count()){
   await ns.getByRole('button',{name:'Play to selected iteration',exact:true}).click();await page.waitForTimeout(550);await ns.getByRole('button',{name:'Pause',exact:true}).click();let paused=await ns.getAttribute('data-step');await page.waitForTimeout(450);assert.equal(await ns.getAttribute('data-step'),paused);await ns.getByRole('button',{name:'Run to selected iteration',exact:true}).click();assert.equal(await ns.getAttribute('data-step'),'5');
   await ns.getByLabel('Polynomial',{exact:true}).selectOption('0');await ns.getByLabel('Iteration budget',{exact:true}).fill('20');await ns.getByLabel('Iteration budget',{exact:true}).blur();await ns.getByRole('button',{name:'Run to selected iteration',exact:true}).click();assert.ok(Number(await ns.getAttribute('data-error'))<1e-7);
   await ns.getByRole('button',{name:'Reset',exact:true}).click();await ns.scrollIntoViewIfNeeded();await page.screenshot({path:artifacts+'/'+slug+'-desktop.png'});
  }
  const sh=page.locator('[data-matrix="shampoo"]');
  if(await sh.count()){await sh.getByRole('button',{name:'Step →',exact:true}).click();assert.equal(await sh.getAttribute('data-step'),'1');await sh.getByRole('button',{name:'Run 20 steps',exact:true}).click();assert.equal(await sh.getAttribute('data-step'),'20');await sh.getByLabel('Gradient history',{exact:true}).selectOption('1');assert.equal(await sh.getAttribute('data-step'),'0');await sh.getByRole('button',{name:'Run 20 steps',exact:true}).click();await sh.scrollIntoViewIfNeeded();await page.screenshot({path:artifacts+'/'+slug+'-desktop.png'});}
  const soap=page.locator('[data-matrix="soap"]');
  if(await soap.count()){await soap.getByRole('button',{name:'Step →',exact:true}).click();assert.ok(Number(await soap.getAttribute('data-difference'))>0.01);for(const name of ['Calibration left angle','Calibration right angle']){await soap.getByLabel(name,{exact:true}).fill('0');await soap.getByLabel(name,{exact:true}).blur();}await soap.getByRole('button',{name:'Step →',exact:true}).click();assert.ok(Number(await soap.getAttribute('data-difference'))<1e-9);await soap.getByRole('button',{name:'Run 12 steps',exact:true}).click();assert.equal(await soap.getAttribute('data-step'),'12');await soap.scrollIntoViewIfNeeded();await page.screenshot({path:artifacts+'/'+slug+'-desktop.png'});}
  const lab=page.locator('[data-optimizer]');
  const stream=page.locator('[data-stream]');
  if(await stream.count()){await stream.getByRole('button',{name:'Step →',exact:true}).click();assert.equal(await stream.getAttribute('data-step'),'1');await stream.getByRole('button',{name:'Run 40 steps',exact:true}).click();assert.equal(await stream.getAttribute('data-step'),'40');await stream.getByRole('button',{name:'Reset',exact:true}).click();assert.equal(await stream.getAttribute('data-step'),'0');await stream.scrollIntoViewIfNeeded();await page.screenshot({path:artifacts+'/'+slug+'-desktop.png'});}
  if(await lab.count()){
   await lab.getByRole('button',{name:'Step →',exact:true}).click();assert.equal(await lab.getAttribute('data-step'),'1');
   let loss=await lab.getAttribute('data-loss');
   await lab.getByRole('button',{name:'Reset',exact:true}).click();await lab.getByRole('button',{name:'Step →',exact:true}).click();assert.equal(await lab.getAttribute('data-loss'),loss);
   await lab.getByRole('button',{name:'Play 100 steps',exact:true}).click();await page.waitForTimeout(400);await lab.getByRole('button',{name:'Pause',exact:true}).click();let step=await lab.getAttribute('data-step');await page.waitForTimeout(200);assert.equal(await lab.getAttribute('data-step'),step);
   await lab.scrollIntoViewIfNeeded();await page.screenshot({path:artifacts+'/'+slug+'-desktop.png'});
  }
  await page.setViewportSize({width:375,height:850});await page.waitForTimeout(100);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Mobile body overflow');
  if(await lab.count()){await lab.scrollIntoViewIfNeeded();await page.screenshot({path:artifacts+'/'+slug+'-mobile.png'});}
  for(const width of [320,768]){await page.setViewportSize({width,height:850});await page.waitForTimeout(80);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Body overflow at '+width);}
  assert.deepEqual(errors,[],'Browser JS error');
  console.log(slug+': desktop/mobile, links, math, demo passed');await page.close();
 }
 const index=await browser.newPage();await index.goto(base+'/blog.html');await index.waitForTimeout(250);
 assert.ok(await index.locator('a[href*="dl/optimizers/"]').count()>=11,'Missing series cards');
 await index.close();
 const nojs=await browser.newContext({javaScriptEnabled:false});const fallback=await nojs.newPage();await fallback.goto(base+'/blog/dl/optimizers/lion.html');assert.ok(await fallback.locator('h2').count()>=8);assert.ok(await fallback.locator('noscript').innerText());await nojs.close();
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
