(function(){
  'use strict';
  var M=window.OptimizerMath,ns='http://www.w3.org/2000/svg';
  function el(tag,cls,text,parent){var n=document.createElement(tag);if(cls)n.className=cls;if(text!==null&&text!==undefined)n.textContent=text;if(parent)parent.appendChild(n);return n;}
  function shape(svg,tag,attrs,text){var n=document.createElementNS(ns,tag);Object.keys(attrs).forEach(function(k){n.setAttribute(k,attrs[k]);});if(text!==undefined)n.textContent=text;svg.appendChild(n);return n;}
  function svg(parent,label,w,h){var s=document.createElementNS(ns,'svg');s.setAttribute('viewBox','0 0 '+w+' '+h);s.setAttribute('role','img');s.setAttribute('aria-label',label);parent.appendChild(s);return s;}
  function button(p,label,fn){var b=el('button','',label,p);b.type='button';b.addEventListener('click',fn);return b;}
  function select(p,name,values,value,fn){var l=el('label','',name,p),s=el('select','',null,l);values.forEach(function(v){var o=el('option','',v[1],s);o.value=v[0];});s.value=String(value);s.addEventListener('change',function(){fn(Number(s.value));});return s;}
  function number(p,name,min,max,step,value,fn){var l=el('label','',name,p),s=el('input','',null,l);s.type='number';s.min=min;s.max=max;s.step=step;s.value=value;s.addEventListener('change',function(){var v=Number(s.value);if(!Number.isFinite(v)||s.value==='')v=value;v=Math.max(min,Math.min(max,v));s.value=v;fn(v);});return s;}
  function fmt(v){return Math.abs(v)>=1e4|| (v!==0&&Math.abs(v)<.001)?v.toExponential(3):v.toFixed(4);}
  function vec(v){return '('+v.map(fmt).join(', ')+')';}
  function read(p,pairs){p.textContent='';pairs.forEach(function(v){var b=el('div','',null,p);el('span','',v[0],b);el('strong','',v[1],b);});}
  function path(points){return points.map(function(p,i){return (i?'L':'M')+p[0].toFixed(2)+','+p[1].toFixed(2);}).join(' ');}
  function firstOrder(root){
    var kind=root.dataset.optimizer,p={lr:.04,k:20,angle:25,batch:1,spread:.35,seed:7,beta:.9,rho:.95,eps:1e-6,b1:.9,b2:.999,correct:1,decay:0},s,random,h,trail,losses,last,runner=null,stopped=false;
    if(kind==='momentum'){p.lr=.03;p.batch=0;}
    if(kind==='adadelta'){p.lr=1;p.eps=.001;p.batch=0;}
    if(kind==='adam'){p.lr=.07;p.batch=4;p.eps=1e-8;}
    var controls=el('div','opt-controls',null,root);
    if(kind==='adam'){number(controls,'First-moment β₁',0,.99,.05,p.b1,function(v){p.b1=v;reset();});number(controls,'Second-moment β₂',0,.9999,.001,p.b2,function(v){p.b2=v;reset();});select(controls,'Bias correction',[[1,'On · Adam'],[0,'Off · ablation']],1,function(v){p.correct=v;reset();});}
    if(kind==='momentum')number(controls,'Momentum β',0,.99,.05,p.beta,function(v){p.beta=v;reset();});
    if(kind==='adadelta'){number(controls,'Decay ρ',0,.999,.05,p.rho,function(v){p.rho=v;reset();});select(controls,'Epsilon ε',[[1e-8,'10⁻⁸'],[1e-6,'10⁻⁶'],[.001,'10⁻³ (demo default)'],[.01,'10⁻²']],p.eps,function(v){p.eps=v;reset();});}
    number(controls,kind==='adadelta'?'Step multiplier η':'Learning rate η',.000001,2,.01,p.lr,function(v){p.lr=v;reset();});
    select(controls,'Gradient batch',[[1,'1 sampled row'],[4,'4 sampled rows'],[16,'16 sampled rows'],[0,'Full dataset (exact)']],p.batch,function(v){p.batch=v;reset();});
    select(controls,'Curvature ratio κ',[[1,'1 · circular'],[5,'5'],[20,'20 · narrow'],[50,'50 · very narrow']],p.k,function(v){p.k=v;reset();});
    number(controls,'Rotation (degrees)',0,90,5,p.angle,function(v){p.angle=v;reset();});
    number(controls,'Sampling seed',1,999,1,p.seed,function(v){p.seed=v;reset();});
    var actions=el('div','opt-actions',null,root),step=button(actions,'Step →',advance),play=button(actions,'Play 100 steps',function(){if(runner){stop();return;}var count=Math.min(100,150-s.t),tasks=[];for(var i=0;i<count;i++)tasks.push(advance);play.textContent='Pause';runner=window.animRunner(tasks,120,function(){runner=null;play.textContent='Play 100 steps';});}),resetButton=button(actions,'Reset',reset);
    var plots=el('div','opt-plots',null,root),plane=svg(plots,'Parameter trajectory on the full-loss contours. Exact coordinates appear below.',400,330),curve=svg(plots,'Excess full loss versus update step. Vertical axis is log10(1 + loss).',400,330),out=el('output','opt-status','',root),stats=el('div','opt-readout',null,root);out.setAttribute('aria-live','polite');out.setAttribute('aria-atomic','true');
    el('p','','Changing a control resets the run. Eight quadratic examples; sampled rows are drawn independently with replacement. The orange dot is the current parameter. Plot bounds expand to include the trajectory.',root);
    function stop(){if(runner)runner.cancel();runner=null;play.textContent='Play 100 steps';}
    function reset(){stop();s=M.state();random=M.rng(p.seed);h=M.hessian(p.k,p.angle*Math.PI/180);trail=[s.w.slice()];losses=[M.loss(s.w,h)];last=null;stopped=false;draw();}
    function advance(){if(stopped||s.t>=150){stop();return;}var g=M.gradient(s.w,h,p.batch,random,p.spread);last=M.step(kind,s,g,p);trail.push(s.w.slice());losses.push(M.loss(s.w,h));if(!Number.isFinite(losses[losses.length-1])||losses[losses.length-1]>1e10){stopped=true;stop();}draw();}
    function draw(){
      plane.textContent='';curve.textContent='';var bound=Math.max(4,Math.max.apply(null,trail.map(function(w){return Math.max(Math.abs(w[0]),Math.abs(w[1]));}))*1.1),scale=130/bound;
      function xy(w){return [200+scale*w[0],165-scale*w[1]];}
      [2,10,30,80,180].forEach(function(level){var pts=[];for(var j=0;j<=100;j++){var theta=2*Math.PI*j/100,u=Math.sqrt(2*level)*Math.cos(theta),v=Math.sqrt(2*level/p.k)*Math.sin(theta),a=p.angle*Math.PI/180;pts.push(xy([Math.cos(a)*u-Math.sin(a)*v,Math.sin(a)*u+Math.cos(a)*v]));}shape(plane,'path',{d:path(pts),fill:'none',stroke:'#cbd9d1','stroke-width':1});});
      shape(plane,'line',{x1:45,y1:165,x2:355,y2:165,stroke:'#aab8b1'});shape(plane,'line',{x1:200,y1:30,x2:200,y2:300,stroke:'#aab8b1'});
      shape(plane,'path',{d:path(trail.map(xy)),fill:'none',stroke:'#137b68','stroke-width':2.5});var curr=xy(s.w);shape(plane,'circle',{cx:curr[0],cy:curr[1],r:5,fill:'#bb5c20'});shape(plane,'circle',{cx:200,cy:165,r:3,fill:'#173d35'});
      shape(plane,'text',{x:15,y:20,fill:'#173d35','font-size':13},'Parameter path · optimum at (0, 0)');shape(plane,'text',{x:285,y:320,fill:'#173d35','font-size':12},'w₁ · ±'+bound.toFixed(1));shape(plane,'text',{x:207,y:43,fill:'#173d35','font-size':12},'w₂');
      var max=Math.max(1,Math.max.apply(null,losses.map(function(v){return Math.log10(1+v);}))),pts=losses.map(function(v,i){return [50+320*i/150,275-230*Math.log10(1+v)/max];});
      [0,.5,1].forEach(function(q){var y=275-230*q;shape(curve,'line',{x1:50,y1:y,x2:370,y2:y,stroke:'#d3ded7'});shape(curve,'text',{x:42,y:y+4,'text-anchor':'end',fill:'#173d35','font-size':11},(q*max).toFixed(1));});
      shape(curve,'path',{d:path(pts),fill:'none',stroke:'#137b68','stroke-width':2.5});[0,50,100,150].forEach(function(t){shape(curve,'text',{x:50+320*t/150,y:297,'text-anchor':'middle',fill:'#173d35','font-size':12},t);});shape(curve,'text',{x:15,y:20,fill:'#173d35','font-size':13},'log₁₀(1 + excess full loss)');shape(curve,'text',{x:330,y:320,fill:'#173d35','font-size':12},'Step');
      out.textContent='Step '+s.t+' / 150. '+(stopped?'Stopped: excess loss exceeded 10¹⁰; this setting diverges.':s.t===150?'Run complete. Reset to replay.':p.batch?'A sampled update can increase full loss.':'Full gradient: no sampling noise.')+' Current excess full loss: '+fmt(losses[losses.length-1])+'.';
      var rows=[['Parameter w',vec(s.w)],['Last gradient g',last?vec(last.g):'—'],['Last displacement Δw',last?vec(last.delta):'—'],['Full loss above minimum',fmt(losses[losses.length-1])]];
      if(kind==='momentum')rows.push(['Buffer b',vec(s.m)],['Buffer multiplier β',fmt(p.beta)]);
      if(kind==='adadelta')rows.push(['RMS gradient (denominator)',last?vec(last.den):'—'],['Previous RMS update (numerator)',last?vec(last.num):'—'],['Squared-gradient state v',vec(s.v)],['Squared-update state u',vec(s.u)]);
      if(kind==='adam')rows.push(['Raw first moment m',vec(s.m)],['Raw second moment v',vec(s.v)],['Used first moment',last?vec(last.num):'—'],['Used RMS + ε',last?vec(last.den):'—']);
      read(stats,rows);
      step.disabled=play.disabled=stopped||s.t>=150;
      root.dataset.step=String(s.t);root.dataset.loss=String(losses[losses.length-1]);
    } reset();
  }
  function stream(root){
    var kind=root.dataset.stream,p={lr:.1,rho:.9,eps:1e-8,b1:.9,b2:.999,correct:1,decay:0},mode=0,s,history,last;
    var controls=el('div','opt-controls',null,root);
    select(controls,'Gradient sequence',[[0,'One spike at step 11'],[1,'Sign reversal after step 10'],[2,'Constant gradient']],0,function(v){mode=v;reset();});
    number(controls,'Decay ρ',0,.999,.05,p.rho,function(v){p.rho=v;reset();});
    var actions=el('div','opt-actions',null,root),step=button(actions,'Step →',advance);button(actions,'Run 40 steps',function(){while(s.t<40)advance();});button(actions,'Reset',reset);
    var chart=svg(root,'Supplied gradient magnitude and running RMS versus step. The readout gives exact current values.',760,310);chart.classList.add('opt-wide-svg');var stats=el('div','opt-readout',null,root),out=el('output','opt-status','',root);out.setAttribute('aria-live','polite');
    function reset(){s=M.state();history=[];last=null;draw();}
    function advance(){if(s.t>=40)return;var t=s.t+1,g=mode===0?(t===11?10:1):mode===1?(t>10?-1:1):1;last=M.step(kind,s,[g,g],p);history.push([g,Math.sqrt(s.v[0]),last.delta[0]]);draw();}
    function draw(){chart.textContent='';var max=mode===0?11:1.2;
      [0,.5,1].forEach(function(q){var y=250-190*q;shape(chart,'line',{x1:50,y1:y,x2:710,y2:y,stroke:'#cbd9d1'});shape(chart,'text',{x:42,y:y+4,'text-anchor':'end','font-size':13,fill:'#173d35'},fmt(max*q));});
      [0,10,20,30,40].forEach(function(t){shape(chart,'text',{x:50+660*t/40,y:278,'text-anchor':'middle','font-size':13,fill:'#173d35'},t);});
      ['#b66929','#137b68'].forEach(function(color,j){shape(chart,'path',{d:path(history.map(function(row,i){return [50+660*(i+1)/40,250-190*Math.abs(row[j])/max];})),fill:'none',stroke:color,'stroke-width':3});});
      shape(chart,'text',{x:30,y:28,'font-size':16,fill:'#173d35'},'Orange: |gradient|     Green: running RMS √v     Horizontal axis: step');
      read(stats,[['Step',String(s.t)],['Signed gradient',last?fmt(last.g[0]):'—'],['Squared-gradient memory v',fmt(s.v[0])],['RMS denominator',last?fmt(last.den[0]):'—'],['Displacement (η = 0.1)',last?fmt(last.delta[0]):'—']]);out.textContent=s.t?'Step '+s.t+': the update uses the current signed gradient divided by its running RMS. '+(s.t===11&&mode===0?'The spike enters the denominator immediately.':''):'A supplied gradient sequence isolates the optimizer’s memory; this is not a training run.';step.disabled=s.t>=40;root.dataset.step=s.t;root.dataset.loss=s.w[0];
    }reset();
  }
  document.querySelectorAll('[data-optimizer]').forEach(firstOrder);
  document.querySelectorAll('[data-stream]').forEach(stream);
  window.OptimizerLabUI={el:el,shape:shape,svg:svg,button:button,select:select,number:number,fmt:fmt,vec:vec,read:read,path:path};
})();
