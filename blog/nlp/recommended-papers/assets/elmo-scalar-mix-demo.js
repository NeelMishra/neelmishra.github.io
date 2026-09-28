/* Original teaching features, not outputs from a pretrained ELMo model. */
(function () {
  'use strict';
  const features = {river: [[1,0],[0,2],[3,1]], loan: [[1,0],[2,0],[-1,2]]};
  const presets = {balanced:[.2,.3,.5],uniform:[1/3,1/3,1/3],lower:[.2,.6,.2],upper:[.1,.2,.7]};
  const names = {balanced:'Worked weights',uniform:'Equal layer weights',lower:'Lower layer emphasized',upper:'Upper layer emphasized'};
  const layerNames = ['Token layer h₀','Lower contextual layer h₁','Upper contextual layer h₂'];
  function softmax(a) { const e=a.map(v=>Math.exp(v-Math.max(...a)));const z=e.reduce((s,v)=>s+v,0);return e.map(v=>v/z); }
  function evaluate(logits,gamma) {
    const weights=softmax(logits),contexts={},grad_logits=[0,0,0];let grad_gamma=0;
    for (const [name,layers] of Object.entries(features)) {
      const contributions=layers.map((h,j)=>h.map(v=>v*weights[j]));
      const mixture=[0,1].map(c=>contributions.reduce((s,h)=>s+h[c],0));
      const output=mixture.map(v=>gamma*v),score=output[0]-output[1],probability=1/(1+Math.exp(-score)),label=name==='river'?1:0;
      const loss=Math.max(score,0)-label*score+Math.log1p(Math.exp(-Math.abs(score))),error=(probability-label)/2;
      const components=layers.map((h,j)=>error*gamma*weights[j]*((h[0]-mixture[0])-(h[1]-mixture[1])));
      const gamma_component=error*(mixture[0]-mixture[1]);components.forEach((v,j)=>grad_logits[j]+=v);grad_gamma+=gamma_component;
      contexts[name]={layers,contributions,mixture,output,score,probability,label,loss,grad_logits:components,grad_gamma:gamma_component};
    }
    return {weights,gamma,contexts,mean_loss:(contexts.river.loss+contexts.loan.loss)/2,grad_logits,grad_gamma};
  }
  function calculate(preset,gamma) {
    const logits=presets[preset].map(Math.log),result=evaluate(logits,gamma),step_size=.1;
    const after=evaluate(logits.map((v,j)=>v-step_size*result.grad_logits[j]),gamma-step_size*result.grad_gamma);
    return {preset,...result,step_size,after:{weights:after.weights,gamma:after.gamma,mean_loss:after.mean_loss}};
  }
  const f=(v,d=4)=>{const value=Math.abs(v)<.5*Math.pow(10,-d)?0:v;return value.toFixed(d).replace(/-/g,'−');};
  const vec=(v,d=4)=>'['+v.map(x=>f(x,d)).join(', ')+']';
  function contextMarkup(name,c,gamma) {
    const sentence=name==='river'?'“The river bank flooded.”':'“The bank approved a loan.”';
    return `<section class="el-box" data-context="${name}"><h3>${sentence}</h3><p>Three fixed features for this occurrence:</p><div class="el-layers">${c.layers.map((h,j)=>`<div class="el-layer" data-layer="${j}"><strong>${layerNames[j]}</strong><span>Feature: ${vec(h,1)}</span><span>× weight <b data-layer-weight="${j}"></b></span><span>Contribution: <b class="el-num" data-contribution="${j}">${vec(c.contributions[j])}</b></span></div>`).join('')}</div><div class="el-output"><span>Sum before γ</span><strong data-mixture>${vec(c.mixture)}</strong><span>× γ = ${f(gamma,1)}</span><strong data-output>${vec(c.output)}</strong></div><p class="el-num">Fixed head score: ${f(c.score)}<br>P(toy label = 1): ${f(c.probability)}<br>Assigned toy label: ${c.label}</p></section>`;
  }
  function gradientMarkup(r) {
    return ['a₀','a₁','a₂','γ'].map((name,j)=>{const river=j<3?r.contexts.river.grad_logits[j]:r.contexts.river.grad_gamma,loan=j<3?r.contexts.loan.grad_logits[j]:r.contexts.loan.grad_gamma,total=j<3?r.grad_logits[j]:r.grad_gamma;return `<section class="el-grad"><h3>Parameter ${name}</h3><span>River contribution: ${f(river,6)}</span><span>Loan contribution: ${f(loan,6)}</span><strong>Sum: ${f(total,6)}</strong></section>`;}).join('');
  }
  const demo=document.getElementById('el-demo');if(!demo)return;
  function draw() {
    const preset=document.getElementById('el-preset').value,gamma=Number(document.getElementById('el-gamma').value),r=calculate(preset,gamma);
    demo.dataset.result=JSON.stringify(r);
    document.getElementById('el-state').textContent=names[preset]+' · γ = '+gamma+'. Both occurrences use these same weights.';
    document.querySelectorAll('.el-weight').forEach((box,j)=>{box.querySelector('[data-weight]').textContent=f(r.weights[j],4);box.querySelector('.el-bar-fill').style.width=(r.weights[j]*100)+'%';box.dataset.weight=r.weights[j];});
    document.getElementById('el-contexts').innerHTML=Object.entries(r.contexts).map(([name,c])=>contextMarkup(name,c,gamma)).join('');
    document.querySelectorAll('[data-layer-weight]').forEach(e=>e.textContent=f(r.weights[Number(e.dataset.layerWeight)]));
    document.getElementById('el-gradients').innerHTML=gradientMarkup(r);
    document.getElementById('el-learning-state').textContent='One illustrative update from '+names[preset].toLowerCase()+', γ = '+gamma+'. Head and all layer vectors stay fixed.';
    document.getElementById('el-before-loss').textContent=f(r.mean_loss,6);
    document.getElementById('el-after-loss').textContent=f(r.after.mean_loss,6);
    document.getElementById('el-after-weights').textContent=vec(r.after.weights,6);
    document.getElementById('el-after-gamma').textContent=f(r.after.gamma,6);
  }
  ['el-preset','el-gamma'].forEach(id=>document.getElementById(id).addEventListener('change',draw));
  draw();document.getElementById('el-controls').hidden=false;
})();
