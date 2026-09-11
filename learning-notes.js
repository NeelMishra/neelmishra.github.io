(function () {
  'use strict';
  function el(tag, cls, text, parent) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    if (parent) parent.appendChild(node);
    return node;
  }
  function button(parent, text, action) {
    var b = el('button', '', text, parent); b.type = 'button';
    b.addEventListener('click', action); return b;
  }
  function range(parent, label, min, max, step, value, change) {
    var wrap = el('div', 'note-controls', null, parent);
    var l = el('label', '', null, wrap);
    el('span', '', label, l);
    var input = el('input', '', null, l);
    input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = value;
    var out = el('span', '', String(value), l);
    input.addEventListener('input', function () { out.textContent = input.value; change(Number(input.value)); });
    return input;
  }
  function status(parent) { var n = el('output', 'note-status', '', parent); n.setAttribute('aria-live','polite'); return n; }
  function dataTable(parent, headers, rows, caption) {
    var wrap=el('div','note-table',null,parent),table=el('table','',null,wrap);
    if(caption)el('caption','',caption,table);
    var head=el('thead','',null,table),tr=el('tr','',null,head);
    headers.forEach(function(t){var th=el('th','',t,tr);th.scope='col';});
    var body=el('tbody','',null,table);
    rows.forEach(function(row){var r=el('tr','',null,body);row.forEach(function(t,i){var c=el(i===0?'th':'td','',t,r);if(i===0)c.scope='row';});});
    return body;
  }
  function results(parent, values) {
    parent.textContent = '';
    values.forEach(function (pair) {
      var box = el('div','note-result',null,parent); el('span','',pair[0],box); el('strong','',pair[1],box);
    });
  }
  function metrics(order, grades, k) {
    var total = grades.filter(function (g) { return g > 0; }).length;
    var hits = 0, ap = 0, rr = 0, dcg = 0;
    order.slice(0,k).forEach(function (id,i) {
      if (grades[id] > 0) { hits++; ap += hits/(i+1); if (!rr) rr = 1/(i+1); }
      dcg += (Math.pow(2,grades[id])-1)/(Math.log(i+2)/Math.LN2);
    });
    var ideal = grades.slice().sort(function(a,b){return b-a;}).slice(0,k);
    var idcg = ideal.reduce(function(s,g,i){return s+(Math.pow(2,g)-1)/(Math.log(i+2)/Math.LN2);},0);
    return {precision:hits/k, recall:hits/total, ap:ap/total, rr:rr, ndcg:dcg/idcg};
  }
  function ranking(root) {
    var order=[1,0,2,4,3,5], grades=[3,0,2,1,0,1], names=['A','B','C','D','E','F'], k=5;
    el('strong','','One query · six documents · four relevant',root);
    range(root,'Cutoff K',1,6,1,k,function(v){k=v;draw();});
    var list=el('ol','note-ranking',null,root), summary=el('div','note-results',null,root), out=status(root);
    function draw(focusId, direction) {
      list.textContent='';
      order.forEach(function(id,i) {
        var row=el('li',i>=k?'outside':'',null,list);
        el('span','note-rank',String(i+1),row);
        el('span','note-doc','Document '+names[id]+' · grade '+grades[id],row);
        [-1,1].forEach(function(delta) {
          var b=button(row,delta<0?'↑':'↓',function(){
            var j=i+delta, temp=order[j];order[j]=id;order[i]=temp;draw(id,delta);
          });
          b.setAttribute('aria-label','Move document '+names[id]+(delta<0?' up':' down'));
          b.dataset.doc=String(id); b.dataset.direction=String(delta);
          b.disabled=i+delta<0||i+delta>=order.length;
        });
      });
      var m=metrics(order,grades,k);
      results(summary,[['Precision@'+k,m.precision.toFixed(4)],['Recall@'+k,m.recall.toFixed(4)],['AP@'+k+' · ÷ all 4',m.ap.toFixed(4)],['RR@'+k,m.rr.toFixed(4)],['nDCG@'+k,m.ndcg.toFixed(4)]]);
      out.textContent='Top '+k+': '+order.slice(0,k).map(function(i){return names[i];}).join(', ')+'. AP divides by all four relevant catalog documents. nDCG uses gain 2^grade − 1.';
      if (focusId!==undefined) {
        var target=list.querySelector('[data-doc="'+focusId+'"][data-direction="'+direction+'"]');
        if(target && target.disabled) target=list.querySelector('[data-doc="'+focusId+'"]:not(:disabled)');
        if(target) target.focus();
      }
    }
    draw();
  }
  function graph(root) {
    el('strong','','Weighted evidence for application A',root);
    var scores=[.9,.6,.1], weights=[2,1,1], on=[true,true,true], buttons=[];
    var ns='http://www.w3.org/2000/svg',network=document.createElementNS(ns,'svg');
    network.setAttribute('viewBox','0 0 480 200');network.setAttribute('role','img');
    network.setAttribute('aria-label','Application A connected to three scored neighbors; selected relationships contribute to the feature.');
    root.appendChild(network);
    var controls=el('div','note-controls',null,root);
    scores.forEach(function(s,i){
      buttons.push(button(controls,['B','C','D'][i]+' · risk '+s+' · weight '+weights[i],function(){on[i]=!on[i];draw();}));
    });
    var summary=el('div','note-results',null,root),out=status(root);
    function draw(){
      var numerator=0,denominator=0;
      on.forEach(function(v,i){buttons[i].setAttribute('aria-pressed',String(v));if(v){numerator+=scores[i]*weights[i];denominator+=weights[i];}});
      network.textContent='';
      function shape(tag,attrs,text){var n=document.createElementNS(ns,tag);Object.keys(attrs).forEach(function(k){n.setAttribute(k,attrs[k]);});if(text)n.textContent=text;network.appendChild(n);return n;}
      [55,240,425].forEach(function(x,i){
        shape('line',{x1:240,y1:55,x2:x,y2:145,stroke:on[i]?'#21816a':'#d4d8d3','stroke-width':on[i]?weights[i]*2:1,'stroke-dasharray':on[i]?'none':'5 4'});
        shape('circle',{cx:x,cy:155,r:32,fill:on[i]?'#e0f0e9':'#f0f0ed',stroke:on[i]?'#21816a':'#adb8b1'});
        shape('text',{x:x,y:151,'text-anchor':'middle','font-size':15,'font-weight':700},['B','C','D'][i]);
        shape('text',{x:x,y:170,'text-anchor':'middle','font-size':12},String(scores[i]));
      });
      shape('circle',{cx:240,cy:40,r:30,fill:'#165d4c'});
      shape('text',{x:240,y:45,'text-anchor':'middle','font-size':16,'font-weight':700,style:'fill:white'},'A');
      results(summary,[['Evidence weight',denominator.toFixed(0)],['Unsmoothed mean',denominator?(numerator/denominator).toFixed(4):'No evidence'],['Smoothed feature',((numerator+.4)/(denominator+2)).toFixed(4)]]);
      out.textContent='Prior mean 0.2, strength 2: ('+numerator.toFixed(2)+' + 0.40) / ('+denominator+' + 2). This is a feature, not a calibrated maliciousness probability.';
    } draw();
  }
  function isolation(root) {
    el('strong','','A fixed isolation tree for [1, 2, 3, 4, 20]',root);
    var values=[1,2,3,4,20], selected=20, controls=el('div','note-controls',null,root),buttons=[];
    values.forEach(function(v){buttons.push(button(controls,String(v),function(){selected=v;draw();}));});
    var path=el('div','note-flow',null,root),out=status(root);
    function draw(){
      buttons.forEach(function(b,i){b.setAttribute('aria-pressed',String(values[i]===selected));});
      path.textContent='';
      var steps=selected===20?['20 > 10 → right','Leaf {20}: depth 1']:
        [selected+' ≤ 10 → left',selected+(selected<=2?' ≤ 2.5 → left':' > 2.5 → right'),selected+(selected<=2?(selected===1?' ≤ 1.5':' > 1.5'):(selected===3?' ≤ 3.5':' > 3.5')),'Leaf {'+selected+'}: depth 3'];
      steps.forEach(function(t,i){var box=el('div','',null,path);el('span','note-number',('0'+(i+1)).slice(-2),box);el('strong','',t,box);});
      out.textContent='Traversed splits: '+(selected===20?1:3)+'. A forest averages corrected path lengths over many randomly built trees; this selected tree only illustrates the path calculation.';
    } draw();
  }
  function word2vec(root) {
    var words=['boots','socks','jacket','boots','hat'],center=2,radius=1,buttons=[];
    el('strong','','One session: choose the center position',root);
    var controls=el('div','note-controls',null,root);
    words.forEach(function(w,i){var b=button(controls,(i+1)+': '+w,function(){center=i;draw();});b.setAttribute('aria-label','Center position '+(i+1)+', '+w);buttons.push(b);});
    range(root,'Context radius',1,3,1,radius,function(v){radius=v;draw();});
    var out=status(root);
    function draw(){
      var pairs=[];
      buttons.forEach(function(b,i){
        var context=i!==center&&Math.abs(i-center)<=radius;
        b.setAttribute('aria-pressed',String(i===center));b.classList.toggle('note-token-context',context);
        if(context)pairs.push('('+words[center]+', '+words[i]+' at position '+(i+1)+')');
      });
      out.textContent='Positive pairs: '+pairs.join('; ')+'. Duplicate token IDs can contribute separate positional examples.';
    } draw();
  }
  function contrastive(root) {
    var matrix=[[.8,.2,.1],[.1,.7,.2],[.2,.1,.9]],names=['Boots','Hat','Bag'],row=0,tau=.2,buttons=[];
    el('strong','','Fixed cosine similarities → row probabilities',root);
    var matrixBody=dataTable(root,['Image / caption','Boots','Hat','Bag'],[
      ['Boots','0.8','0.2','0.1'],['Hat','0.1','0.7','0.2'],['Bag','0.2','0.1','0.9']
    ],'Cosine similarities stay fixed. The controls change which row is inspected and its softmax temperature.');
    var controls=el('div','note-controls',null,root);
    names.forEach(function(n,i){buttons.push(button(controls,'Image: '+n,function(){row=i;draw();}));});
    range(root,'Temperature τ',.05,1,.05,tau,function(v){tau=v;draw();});
    var bars=el('div','',null,root),out=status(root);
    function draw(){
      buttons.forEach(function(b,i){b.setAttribute('aria-pressed',String(i===row));});
      Array.prototype.forEach.call(matrixBody.rows,function(r,i){r.classList.toggle('note-selected',i===row);});
      var logits=matrix[row].map(function(s){return s/tau;}),max=Math.max.apply(null,logits);
      var exps=logits.map(function(s){return Math.exp(s-max);}),sum=exps.reduce(function(a,b){return a+b;},0);
      var probs=exps.map(function(x){return x/sum;});bars.textContent='';
      probs.forEach(function(pr,i){
        var r=el('div','note-bar-row',null,bars);el('span','',names[i]+(i===row?' ✓':''),r);
        var bar=el('div','note-bar',null,r),fill=el('span','',null,bar);fill.style.width=(pr*100)+'%';
        el('strong','',pr.toFixed(4),r);
      });
      out.textContent='Image '+names[row]+': similarities ['+matrix[row].join(', ')+']. Positive probability '+probs[row].toFixed(4)+', row loss '+(-Math.log(probs[row])).toFixed(4)+'. The full CLIP loss also includes the reverse text-to-image direction.';
    } draw();
  }
  function threshold(root) {
    var scores=[.95,.9,.8,.7,.6,.5,.4,.3,.2,.1],labels=[1,1,0,1,0,1,0,1,0,0],t=.7;
    el('strong','','A fully labeled synthetic queue',root);
    range(root,'Flag score ≥ threshold',0,1,.05,t,function(v){t=v;draw();});
    var summary=el('div','note-results',null,root),out=status(root);
    function draw(){
      var tp=0,n=0;
      scores.forEach(function(s,i){if(s+1e-9>=t){n++;tp+=labels[i];}});
      results(summary,[['Queue size',String(n)],['True positives',String(tp)],['Precision',n?(tp/n).toFixed(3):'Undefined'],['Recall',(tp/5).toFixed(3)]]);
      out.textContent='Five positives exist among ten cases. '+(n-tp)+' false positives and '+(5-tp)+' missed positives at threshold '+t.toFixed(2)+'. At zero flagged cases, precision is undefined.';
    }draw();
  }
  function shap(root) {
    el('strong','','Two features · two possible arrival orders',root);
    dataTable(root,['Known features','v(S)'],[['None','0.10'],['A only','0.40'],['B only','0.20'],['A and B','0.80']],'All four coalition values are fixed; select a feature to calculate its contribution.');
    var controls=el('div','note-controls',null,root),choice=0,buttons=[];
    ['Feature A','Feature B'].forEach(function(n,i){buttons.push(button(controls,n,function(){choice=i;draw();}));});
    var out=status(root),summary=el('div','note-results',null,root);
    function draw(){
      buttons.forEach(function(b,i){b.setAttribute('aria-pressed',String(i===choice));});
      out.textContent=choice===0?'A arrives first: 0.40 − 0.10 = 0.30. A arrives after B: 0.80 − 0.20 = 0.60. Average = 0.45.':'B arrives first: 0.20 − 0.10 = 0.10. B arrives after A: 0.80 − 0.40 = 0.40. Average = 0.25.';
      results(summary,[['Baseline','0.10'],['A contribution','0.45'],['B contribution','0.25'],['Prediction','0.80']]);
    }draw();
  }
  function quantization(root) {
    var values=[-.9,-.2,.1,.55,.95],levels=9;
    el('strong','','Uniform grid over [−1, 1]',root);
    range(root,'Number of grid levels',3,17,2,levels,function(v){levels=v;draw();});
    var wrapper=el('div','note-table',null,root),out=status(root);
    function draw(){
      var step=2/(levels-1),mse=0;wrapper.textContent='';
      var table=el('table','',null,wrapper),head=el('thead','',null,table),tr=el('tr','',null,head);
      ['Original','Rounded','Error'].forEach(function(t){var th=el('th','',t,tr);th.scope='col';});
      var body=el('tbody','',null,table);
      values.forEach(function(v){
        var q=Math.max(-1,Math.min(1,-1+Math.round((v+1)/step)*step)),r=el('tr','',null,body);
        [v,q,q-v].forEach(function(x){el('td','',x.toFixed(3),r);});mse+=(q-v)*(q-v);
      });
      out.textContent='Step size = '+step.toFixed(3)+'. Mean squared weight error = '+(mse/values.length).toFixed(6)+'. Odd level counts include zero; this pedagogical grid is not a complete integer storage format.';
    }draw();
  }
  function optimizer(root) {
    var mode='GD',stepCount=15,buttons=[],modes=['GD','Momentum','Adam'];
    el('strong','','Computed trajectories on a narrow quadratic',root);
    var controls=el('div','note-controls',null,root);
    modes.forEach(function(n){buttons.push(button(controls,n,function(){mode=n;draw();}));});
    range(root,'Iterations shown',0,40,1,stepCount,function(v){stepCount=v;draw();});
    var ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 520 300');svg.setAttribute('role','img');svg.setAttribute('aria-label','Optimizer path and quadratic contours');root.appendChild(svg);
    var out=status(root);
    function shape(name,attrs){var node=document.createElementNS(ns,name);Object.keys(attrs).forEach(function(k){node.setAttribute(k,attrs[k]);});svg.appendChild(node);return node;}
    function draw(){
      buttons.forEach(function(b,i){b.setAttribute('aria-pressed',String(modes[i]===mode));});
      var x=3,y=2,mx=0,my=0,vx=0,vy=0,points=[[x,y]];
      for(var t=1;t<=stepCount;t++){
        var gx=x,gy=10*y,lr=mode==='GD'?.1:.2;
        if(mode==='GD'){x-=lr*gx;y-=lr*gy;}
        else{
          mx=.9*mx+.1*gx;my=.9*my+.1*gy;
          if(mode==='Momentum'){x-=lr*mx;y-=lr*my;}
          else{
            vx=.999*vx+.001*gx*gx;vy=.999*vy+.001*gy*gy;
            x-=lr*(mx/(1-Math.pow(.9,t)))/(Math.sqrt(vx/(1-Math.pow(.999,t)))+1e-8);
            y-=lr*(my/(1-Math.pow(.9,t)))/(Math.sqrt(vy/(1-Math.pow(.999,t)))+1e-8);
          }
        }points.push([x,y]);
      }
      svg.textContent='';
      function sx(v){return 260+v*62;}function sy(v){return 150-v*55;}
      [1,3,6,10,20].forEach(function(f){shape('ellipse',{cx:260,cy:150,rx:Math.sqrt(2*f)*62,ry:Math.sqrt(2*f/10)*55,fill:'none',stroke:'#dce7e1'});});
      shape('line',{x1:15,y1:150,x2:505,y2:150,stroke:'#9baea4'});shape('line',{x1:260,y1:12,x2:260,y2:288,stroke:'#9baea4'});
      shape('polyline',{points:points.map(function(p){return sx(p[0])+','+sy(p[1]);}).join(' '),fill:'none',stroke:'#17644e','stroke-width':2.5});
      points.forEach(function(p,i){shape('circle',{cx:sx(p[0]),cy:sy(p[1]),r:i===points.length-1?5:2.5,fill:i===points.length-1?'#c3781f':'#17644e'});});
      var tx=shape('text',{x:495,y:142,'font-size':13});tx.textContent='x';
      var ty=shape('text',{x:271,y:18,'font-size':13});ty.textContent='y';
      out.textContent=mode+' after '+stepCount+' steps: (x,y)=('+x.toFixed(4)+', '+y.toFixed(4)+'), loss '+(.5*(x*x+10*y*y)).toFixed(4)+'. Learning rate '+(mode==='GD'?'0.1':'0.2')+'; momentum β=0.9; Adam β₂=0.999. These fixed settings illustrate behavior, not a tuned optimizer comparison.';
    }draw();
  }
  var labs={ranking:ranking,graph:graph,isolation:isolation,word2vec:word2vec,contrastive:contrastive,threshold:threshold,shap:shap,quantization:quantization,optimizer:optimizer};
  function init(){
    if(window.renderMathInElement){
      document.querySelectorAll('.learning-note').forEach(function(article){
        window.renderMathInElement(article,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});
      });
    }
    document.querySelectorAll('[data-note-lab]').forEach(function(figure){
      var build=labs[figure.getAttribute('data-note-lab')];
      if(build){build(figure.querySelector('.note-live'));figure.classList.add('is-ready');}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
}());
