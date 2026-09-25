/* Actual stump training; two plots distinguish weights entering and leaving a round. */
(function(){
  var NS='http://www.w3.org/2000/svg';
  function add(svg,type,attrs){var e=document.createElementNS(NS,type);for(var k in attrs)e.setAttribute(k,attrs[k]);svg.appendChild(e);return e;}
  function text(svg,value,x,y,size,color,anchor){var e=add(svg,'text',{x:x,y:y,'font-family':'Arial,sans-serif','font-size':size||14,fill:color||INK,'text-anchor':anchor||'middle'});e.textContent=value;return e;}
  var entering=document.getElementById('ada-svg'),updated=document.getElementById('ada-updated-svg');if(!entering||!updated)return;
  var GREEN='#16785a',ORANGE='#b35426',BLUE='#1d4ed8',RED='#c62828',INK='#203d34',LINE='#cbd7d0';
  var data=[
    {x:1,y:2,l:-1},{x:2,y:3,l:-1},{x:4,y:4,l:-1},{x:6,y:2,l:-1},{x:2,y:6,l:-1},{x:3,y:5,l:-1},{x:5,y:3,l:-1},{x:7,y:1,l:-1},
    {x:8,y:8,l:1},{x:9,y:6,l:1},{x:6,y:7,l:1},{x:4,y:8,l:1},{x:8,y:4,l:1},{x:5,y:7,l:1},{x:7,y:5,l:1},{x:9,y:3,l:1}
  ];
  var N=data.length;
  // train AdaBoost, capturing per-round state (weights BEFORE update)
  function bestStump(w){
    var best={err:1e9};
    for(var f=0;f<2;f++){
      var vals=data.map(function(d){return f===0?d.x:d.y;}).slice().sort(function(a,b){return a-b;});
      var cand=[vals[0]-0.5];
      for(var k=0;k+1<vals.length;k++) cand.push((vals[k]+vals[k+1])/2);
      cand.push(vals[vals.length-1]+0.5);
      for(var c=0;c<cand.length;c++){
        var thr=cand[c];
        for(var pol=-1;pol<=1;pol+=2){
          var err=0;
          for(var i=0;i<N;i++){ var xv=f===0?data[i].x:data[i].y; var h=(xv>thr)?pol:-pol; if(h!==data[i].l) err+=w[i]; }
          if(err<best.err) best={err:err,f:f,thr:thr,pol:pol};
        }
      }
    }
    return best;
  }
  var rounds=[], T=5;
  (function train(){
    var w=[]; for(var i=0;i<N;i++) w.push(1/N);
    var F=[]; for(i=0;i<N;i++) F.push(0);
    for(var t=0;t<T;t++){
      var st=bestStump(w);
      var eps=Math.max(1e-6,Math.min(1-1e-6,st.err));
      var alpha=0.5*Math.log((1-eps)/eps);
      var miss=[], wsnap=w.slice();
      for(i=0;i<N;i++){ var xv=st.f===0?data[i].x:data[i].y; var h=(xv>st.thr)?st.pol:-st.pol; miss.push(h!==data[i].l); F[i]+=alpha*h; }
      var ok=0; for(i=0;i<N;i++) ok+=((F[i]>=0?1:-1)===data[i].l)?1:0;
      rounds.push({f:st.f,thr:st.thr,pol:st.pol,eps:eps,alpha:alpha,miss:miss,w:wsnap,acc:100*ok/N});
      // update weights
      var Z=0; for(i=0;i<N;i++){ var xv2=st.f===0?data[i].x:data[i].y; var h2=(xv2>st.thr)?st.pol:-st.pol; w[i]*=Math.exp(-alpha*data[i].l*h2); Z+=w[i]; }
      for(i=0;i<N;i++) w[i]/=Z;
      rounds[t].wNext=w.slice();rounds[t].F=F.slice();rounds[t].missCount=miss.filter(function(m){return m;}).length;
    }
  })();
  var t=-1,runner=null,widths=[];
  function canvas(svg){
    var width=Math.max(180,Math.floor(svg.getBoundingClientRect().width));svg.setAttribute('width',width);svg.setAttribute('height',292);svg.setAttribute('viewBox','0 0 '+width+' 292');
    while(svg.firstChild)svg.removeChild(svg.firstChild);return width;
  }
  function plot(svg,weights,r,phase){
    var width=canvas(svg),left=34,right=width-12,top=24,bottom=242;
    function sx(x){return left+x*(right-left)/10;}
    function sy(y){return bottom-y*(bottom-top)/10;}
    if(r){
      add(svg,'rect',{x:left,y:top,width:right-left,height:bottom-top,fill:'#fff0e8'});
      var start,end;
      if(r.f===0){start=r.pol>0?sx(r.thr):left;end=r.pol>0?right:sx(r.thr);add(svg,'rect',{x:start,y:top,width:end-start,height:bottom-top,fill:'#e9f3ed'});}
      else{start=r.pol>0?top:sy(r.thr);end=r.pol>0?sy(r.thr):bottom;add(svg,'rect',{x:left,y:start,width:right-left,height:end-start,fill:'#e9f3ed'});}
    }
    add(svg,'rect',{x:left,y:top,width:right-left,height:bottom-top,fill:'none',stroke:LINE});
    [0,5,10].forEach(function(v){text(svg,String(v),sx(v),bottom+22,14);text(svg,String(v),left-7,sy(v)+5,14,INK,'end');});
    text(svg,'x₁',(left+right)/2,282,16);text(svg,'x₂',left,17,16,INK,'start');
    if(r)add(svg,'line',{x1:r.f===0?sx(r.thr):left,y1:r.f===0?top:sy(r.thr),x2:r.f===0?sx(r.thr):right,y2:r.f===0?bottom:sy(r.thr),stroke:BLUE,'stroke-width':2,'stroke-dasharray':'5 4','data-stump-feature':r.f,'data-threshold':r.thr});
    data.forEach(function(d,i){
      var radius=18*Math.sqrt(weights[i]);
      add(svg,'circle',{cx:sx(d.x),cy:sy(d.y),r:radius,fill:d.l>0?GREEN:ORANGE,stroke:'#fffdf9','stroke-width':1,'data-row':i+1,'data-weight':weights[i],'data-label':d.l});
      if(r&&r.miss[i])add(svg,'circle',{cx:sx(d.x),cy:sy(d.y),r:radius+2.5,fill:'none',stroke:RED,'stroke-width':1.7,'data-missed-row':i+1});
    });
    text(svg,'row 5',sx(2)-10,sy(6)-12,14,INK,'end');
    add(svg,'line',{x1:sx(2)-8,y1:sy(6)-10,x2:sx(2)-3,y2:sy(6)-4,stroke:INK,'stroke-width':1});
    svg.setAttribute('aria-label',phase+' weights '+(r?'for round '+(t+1):'before training')+'. Circle areas are proportional to normalized weights. Horizontal axis: feature 1. Vertical axis: feature 2. Row 5 is at (2,6), class B.'+(r?' Red rings mark rows '+r.miss.flatMap(function(m,i){return m?[i+1]:[];}).join(', ')+' missed by this stump.':''));
    return width;
  }
  function weightRows(before,after,r){
    var container=document.getElementById('ada-weight-rows');while(container.firstChild)container.removeChild(container.firstChild);
    data.forEach(function(d,i){
      var card=document.createElement('section');card.className='ada-weight-row';card.dataset.row=String(i+1);card.dataset.entering=String(before[i]);card.dataset.updated=String(after[i]);card.dataset.missed=String(!!r&&r.miss[i]);card.dataset.combined=r?String(r.F[i]>=0?1:-1):'';
      var heading=document.createElement('h5');heading.textContent='Row '+(i+1)+' · ('+d.x+', '+d.y+') · '+(d.l>0?'A / +1':'B / −1');card.appendChild(heading);
      ['Entering: '+before[i].toFixed(4),'Updated: '+after[i].toFixed(4),r?'Stump: '+(r.miss[i]?'wrong':'correct')+' · combined: '+((r.F[i]>=0?1:-1)===d.l?'correct':'wrong'):'No learner has been fitted yet.'].forEach(function(value){var p=document.createElement('p');p.textContent=value;card.appendChild(p);});container.appendChild(card);
    });
  }
  function draw(){
    var r=t<0?null:rounds[t],before=r?r.w:data.map(function(){return 1/N;}),after=r?r.wNext:before;
    widths=[plot(entering,before,r,'Entering'),plot(updated,after,r,'Updated')];weightRows(before,after,r);
    var rule=document.getElementById('ada-rule');rule.textContent=r?'Stump: '+(r.f===0?'x₁':'x₂')+' > '+r.thr+' → '+(r.pol>0?'A':'B')+'; '+(r.f===0?'x₁':'x₂')+' ≤ '+r.thr+' → '+(r.pol>0?'B':'A')+'.':'No stump yet: every row begins with weight 1/16.';
    rule.dataset.feature=r?String(r.f):'';rule.dataset.threshold=r?String(r.thr):'';rule.dataset.polarity=r?String(r.pol):'';
    document.getElementById('ada-info').textContent=r?'Round '+(t+1)+' of 5: the stump misses '+r.missCount+' rows; combined accuracy is '+r.acc.toFixed(1)+'%.':'Initial state: equal weights, no fitted learners.';
    document.getElementById('ada-error').textContent=r?r.eps.toFixed(3):'—';document.getElementById('ada-missed').textContent=r?r.missCount+' / '+N+' ('+(100*r.missCount/N).toFixed(0)+'%)':'—';document.getElementById('ada-alpha').textContent=r?r.alpha.toFixed(3):'—';document.getElementById('ada-accuracy').textContent=r?r.acc.toFixed(1)+'%':'—';
    Array.prototype.forEach.call(document.querySelectorAll('#ada-history strong'),function(e,i){e.textContent=i<=t?rounds[i].acc.toFixed(0)+'%':'—';});
    document.getElementById('ada-output').textContent=t===T-1?'Final accuracy: '+rounds[T-1].acc.toFixed(1)+'% from 5 stumps':'';document.getElementById('ada-anim').dataset.round=String(t+1);
  }
  function step(){if(t<T-1){t++;draw();}}
  function reset(){if(runner){runner.cancel();runner=null;}t=-1;draw();}
  document.getElementById('ada-fallback').hidden=true;document.getElementById('ada-live').hidden=false;draw();
  function resize(){if(Math.floor(entering.getBoundingClientRect().width)!==widths[0]||Math.floor(updated.getBoundingClientRect().width)!==widths[1])draw();}
  if(window.ResizeObserver)new ResizeObserver(resize).observe(document.getElementById('ada-live'));else window.addEventListener('resize',resize);
  document.getElementById('ada-step').addEventListener('click',function(){if(runner){runner.cancel();runner=null;}step();});document.getElementById('ada-reset').addEventListener('click',reset);
  document.getElementById('ada-play').addEventListener('click',function(){
    if(runner){runner.cancel();runner=null;}if(t===T-1){t=-1;draw();}var steps=[];for(var k=t;k<T-1;k++)steps.push(step);runner=window.animRunner(steps,1200,function(){runner=null;});
  });
  document.getElementById('ada-controls').hidden=false;
})();
