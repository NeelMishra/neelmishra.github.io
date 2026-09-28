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
  document.querySelectorAll('[data-matrix="polar"]').forEach(polar);
  window.OptimizerMatrixUI={card:card,matrixText:matrixText};
})();
