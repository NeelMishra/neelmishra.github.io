(function(){
  'use strict';
  var M=window.OptimizerMath,U=window.OptimizerLabUI;
  function matrixText(a){return '['+U.fmt(a[0])+', '+U.fmt(a[1])+']\n['+U.fmt(a[2])+', '+U.fmt(a[3])+']';}
  function card(parent,title,a,bound){var c=U.el('div','opt-matrix-card',null,parent);U.el('h4','',title,c);var plot=U.svg(c,title+': image of the unit circle; matrix entries and singular values follow.',280,240),scale=85/bound;
    function xy(v){return [140+scale*v[0],120-scale*v[1]];}
    U.shape(plot,'circle',{cx:140,cy:120,r:scale,fill:'none',stroke:'#cbd9d1','stroke-dasharray':'4 4'});U.shape(plot,'path',{d:'M20 120H260 M140 20V220',stroke:'#cbd9d1',fill:'none'});
    var pts=[];for(var i=0;i<=100;i++){var t=2*Math.PI*i/100;pts.push(xy(M.mv(a,[Math.cos(t),Math.sin(t)])));}U.shape(plot,'path',{d:U.path(pts),fill:'none',stroke:'#137b68','stroke-width':3});
    [[a[0],a[2]],[a[1],a[3]]].forEach(function(v,i){var p=xy(v);U.shape(plot,'line',{x1:140,y1:120,x2:p[0],y2:p[1],stroke:i?'#bd6426':'#477fa2','stroke-width':2});U.shape(plot,'circle',{cx:p[0],cy:p[1],r:3,fill:i?'#bd6426':'#477fa2'});});
    U.shape(plot,'text',{x:15,y:232,'font-size':12,fill:'#173d35'},'Shared scale: ±'+bound.toFixed(1));U.el('pre','',matrixText(a),c);U.el('p','', 'Singular values: '+M.singular(a).map(U.fmt).join(', '),c);
  }
  function polar(root){var s1=3,s2=.5,left=30,right=-20,controls=U.el('div','opt-controls',null,root);
    U.number(controls,'Singular value s₁',.1,10,.1,s1,function(v){s1=v;draw();});U.number(controls,'Singular value s₂',0,10,.1,s2,function(v){s2=v;draw();});U.number(controls,'Left rotation (degrees)',-90,90,5,left,function(v){left=v;draw();});U.number(controls,'Right rotation (degrees)',-90,90,5,right,function(v){right=v;draw();});
    var grid=U.el('div','opt-matrix-grid',null,root),out=U.el('output','opt-status','',root);out.setAttribute('aria-live','polite');
    function draw(){var a=M.fromSVD(s1,s2,left*Math.PI/180,right*Math.PI/180),q=M.polar(a),sign=a.map(function(v){return Math.abs(v)<1e-12?0:Math.sign(v);}),bound=Math.max(s1,s2,2)*1.15;grid.textContent='';card(grid,'Input matrix M',a,bound);card(grid,'Exact partial polar Q',q,bound);card(grid,'Entry-wise sign(M)',sign,bound);out.textContent='Input condition number: '+(s2===0?'infinite (rank deficient)':U.fmt(Math.max(s1,s2)/Math.min(s1,s2)))+'. Polar Frobenius norm: '+U.fmt(M.norm(q))+'. '+(s2===0?'The missing singular direction stays zero.':'The full-rank polar map preserves lengths.')+' Dashed gray: unit circle. Green: transformed circle. Blue and orange: transformed coordinate basis vectors.';root.dataset.polar=JSON.stringify(q);root.dataset.singular=JSON.stringify(M.singular(q));}draw();
  }
  function schulz(root){var big=3,small=.03,quintic=1,normalize=1,x,q,k,history,stopped;var controls=U.el('div','opt-controls',null,root);
    U.select(controls,'Polynomial',[[1,'Muon quintic'],[0,'Classical cubic']],1,function(v){quintic=v;reset();});U.number(controls,'Input singular value s₁',0,10,.1,big,function(v){big=v;reset();});U.number(controls,'Input singular value s₂',0,10,.01,small,function(v){small=v;reset();});U.select(controls,'Initial scaling',[[1,'Divide by Frobenius norm'],[0,'None · instability experiment']],1,function(v){normalize=v;reset();});
    var actions=U.el('div','opt-actions',null,root),step=U.button(actions,'Step iteration →',advance),five=U.button(actions,'Run 5 iterations',function(){for(var i=0;i<5;i++)advance();});U.button(actions,'Reset',reset);
    var chart=U.svg(root,'Largest and smallest singular values versus matrix iteration. Dashed target is one.',760,310);chart.classList.add('opt-wide-svg');var stats=U.el('div','opt-readout',null,root),out=U.el('output','opt-status','',root);out.setAttribute('aria-live','polite');
    function reset(){var a=M.fromSVD(big,small,.4,-.2);q=M.polar(a);var n=M.norm(a);x=normalize&&n>0?M.scale(a,1/n):a;k=0;history=[M.singular(x)];stopped=false;draw();}
    function advance(){if(k>=20||stopped)return;x=M.ns(x,quintic);k++;history.push(M.singular(x));if(M.norm(x)>1e6||!Number.isFinite(M.norm(x)))stopped=true;draw();}
    function draw(){chart.textContent='';var ymax=Math.max(1.4,Math.max.apply(null,history.map(function(v){return v[0];}))*1.1);
      [0,.5,1].forEach(function(f){var y=250-190*f;U.shape(chart,'line',{x1:60,y1:y,x2:710,y2:y,stroke:'#cbd9d1'});U.shape(chart,'text',{x:50,y:y+4,'text-anchor':'end','font-size':12,fill:'#173d35'},U.fmt(ymax*f));});
      U.shape(chart,'line',{x1:60,y1:250-190/ymax,x2:710,y2:250-190/ymax,stroke:'#173d35','stroke-dasharray':'5 4'});
      ['#137b68','#b66929'].forEach(function(color,j){U.shape(chart,'path',{d:U.path(history.map(function(v,i){return [60+650*i/20,250-190*v[j]/ymax];})),fill:'none',stroke:color,'stroke-width':3});});[0,5,10,15,20].forEach(function(t){U.shape(chart,'text',{x:60+650*t/20,y:276,'text-anchor':'middle','font-size':13,fill:'#173d35'},t);});U.shape(chart,'text',{x:25,y:27,'font-size':15,fill:'#173d35'},'Green: largest singular value · Orange: smallest · Dashed: target 1');
      var sv=history[history.length-1],defect=M.norm(M.add(M.mul(M.transpose(x),x),[-1,0,0,-1])),error=M.norm(M.add(x,M.scale(q,-1)));
      U.read(stats,[['Iteration',String(k)],['Singular values',U.vec(sv)],['Distance to exact partial polar',U.fmt(error)],['Orthogonality defect ‖XᵀX − I‖F',U.fmt(defect)]]);out.textContent=(stopped?'Stopped: iterate norm exceeded 10⁶. Unscaled iterations can diverge. ':quintic?'The quintic is a finite approximation; more iterations need not improve its error. ':'The normalized cubic converges on each positive singular direction. ')+(big===0||small===0?'Rank deficiency leaves a nonzero identity defect even at the correct partial polar factor. ':'')+'The horizontal axis counts inner matrix iterations, not optimizer steps.';step.disabled=five.disabled=stopped||k>=20;root.dataset.step=k;root.dataset.error=error;root.dataset.singular=JSON.stringify(sv);
    }reset();
  }
  function shampoo(root){var damping=.001,frequency=1,mode=0,s,last,g,controls=U.el('div','opt-controls',null,root);
    U.select(controls,'Gradient history',[[0,'Repeated fixed matrix'],[1,'Rotate left basis after step 5']],0,function(v){mode=v;reset();});U.select(controls,'Root refresh interval',[[1,'Every step'],[5,'Every 5 steps']],1,function(v){frequency=v;reset();});U.select(controls,'Initial damping δ',[[.000001,'10⁻⁶'],[.001,'10⁻³'],[1,'1']],.001,function(v){damping=v;reset();});
    var actions=U.el('div','opt-actions',null,root),step=U.button(actions,'Step →',advance);U.button(actions,'Run 20 steps',function(){while(s.t<20)advance();});U.button(actions,'Reset',reset);
    var grid=U.el('div','opt-matrix-grid',null,root),stats=U.el('div','opt-readout',null,root),out=U.el('output','opt-status','',root);out.setAttribute('aria-live','polite');
    function reset(){s=M.shampooState(damping);last=null;g=null;draw();}
    function advance(){if(s.t>=20)return;var angle=mode&&s.t>=5?70:20;g=M.fromSVD(4,1,angle*Math.PI/180,-20*Math.PI/180);last=M.shampooStep(s,g,frequency);draw();}
    function draw(){grid.textContent='';if(last){card(grid,'Current gradient G',g,4.6);card(grid,'Shampoo direction P',last.direction,4.6);card(grid,'Diagonal Adagrad comparison',last.diagonal,4.6);}else U.el('p','','Take a step to see the gradient and two computed directions.',grid);
      U.read(stats,[['Step',String(s.t)],['Row history L',matrixText(s.l)],['Column history R',matrixText(s.r)],['Eigenvalues of L',U.vec(M.eigh(s.l).values)],['Eigenvalues of R',U.vec(M.eigh(s.r).values)],['Last root refresh',String(s.refreshed)],['Shampoo direction norm',last?U.fmt(M.norm(last.direction)):'—']]);out.textContent='Step '+s.t+'. '+(s.t?'Both histories include the current gradient. Roots were last computed at step '+s.refreshed+'. ':'Histories start at δI. ')+'This supplied matrix sequence isolates preconditioning; it is not a neural-network training benchmark. Diagonal Adagrad accumulates each entry’s squared gradient separately.';step.disabled=s.t>=20;root.dataset.step=s.t;root.dataset.direction=last?JSON.stringify(last.direction):'[]';}reset();
  }
  document.querySelectorAll('[data-matrix="polar"]').forEach(polar);
  document.querySelectorAll('[data-matrix="shampoo"]').forEach(shampoo);
  document.querySelectorAll('[data-matrix="schulz"]').forEach(schulz);
  window.OptimizerMatrixUI={card:card,matrixText:matrixText};
})();
