/* Pure numerical routines used by the teaching labs and their checks. */
(function (root) {
  'use strict';
  var M = {};
  M.rng = function(seed) { var s=seed>>>0; return function(){s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;}; };
  M.hessian = function(k,angle){var c=Math.cos(angle),s=Math.sin(angle);return [c*c+k*s*s,(1-k)*c*s,(1-k)*c*s,s*s+k*c*c];};
  M.mv = function(a,v){return [a[0]*v[0]+a[1]*v[1],a[2]*v[0]+a[3]*v[1]];};
  M.loss = function(w,h){var g=M.mv(h,w);return (w[0]*g[0]+w[1]*g[1])/2;};
  M.centers = function(spread){return [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].map(function(a){return a.map(function(v){return v*spread;});});};
  M.gradient = function(w,h,batch,random,spread){
    if(!batch)return M.mv(h,w);
    var a=M.centers(spread),g=[0,0];
    for(var j=0;j<batch;j++){var c=a[Math.floor(random()*a.length)],v=M.mv(h,[w[0]-c[0],w[1]-c[1]]);g[0]+=v[0]/batch;g[1]+=v[1]/batch;} return g;
  };
  M.state = function(){return {w:[3,2],m:[0,0],v:[0,0],u:[0,0],t:0};};
  M.step = function(kind,s,g,p){
    var d=[0,0],den=[1,1],num=[1,1];s.t++;
    if(kind==='muon'||kind==='shampoo'||kind==='soap')return M.matrixTrajectoryStep(kind,s,g,p);
    for(var i=0;i<2;i++){
      if(kind==='sgd')d[i]=-p.lr*g[i];
      else if(kind==='momentum'){s.m[i]=p.beta*s.m[i]+g[i];d[i]=-p.lr*s.m[i];}
      else if(kind==='adadelta'){
        s.v[i]=p.rho*s.v[i]+(1-p.rho)*g[i]*g[i];
        den[i]=Math.sqrt(s.v[i]+p.eps);num[i]=Math.sqrt(s.u[i]+p.eps);
        var raw=-num[i]*g[i]/den[i];
        s.u[i]=p.rho*s.u[i]+(1-p.rho)*raw*raw;d[i]=p.lr*raw;
      }
      else if(kind==='rmsprop'){
        s.v[i]=p.rho*s.v[i]+(1-p.rho)*g[i]*g[i];den[i]=Math.sqrt(s.v[i])+p.eps;d[i]=-p.lr*g[i]/den[i];
      }
      else if(kind==='adam'){
        s.m[i]=p.b1*s.m[i]+(1-p.b1)*g[i];s.v[i]=p.b2*s.v[i]+(1-p.b2)*g[i]*g[i];
        num[i]=s.m[i]/(p.correct?1-Math.pow(p.b1,s.t):1);
        den[i]=Math.sqrt(s.v[i]/(p.correct?1-Math.pow(p.b2,s.t):1))+p.eps;
        d[i]=-p.lr*(num[i]/den[i]+p.decay*s.w[i]);
      }
      else if(kind==='lion'){
        num[i]=p.b1*s.m[i]+(1-p.b1)*g[i];d[i]=-p.lr*(Math.sign(num[i])+p.decay*s.w[i]);
        s.m[i]=p.b2*s.m[i]+(1-p.b2)*g[i];
      }
      else throw new Error('Unknown optimizer '+kind);
      s.w[i]+=d[i];
    }
    return {g:g.slice(),delta:d,den:den,num:num,m:s.m.slice(),v:s.v.slice(),u:s.u.slice()};
  };
  M.transpose=function(a){return [a[0],a[2],a[1],a[3]];};
  M.mul=function(a,b){return [a[0]*b[0]+a[1]*b[2],a[0]*b[1]+a[1]*b[3],a[2]*b[0]+a[3]*b[2],a[2]*b[1]+a[3]*b[3]];};
  M.scale=function(a,c){return a.map(function(v){return c*v;});};
  M.add=function(a,b){return a.map(function(v,i){return v+b[i];});};
  M.norm=function(a){return Math.sqrt(a.reduce(function(s,v){return s+v*v;},0));};
  M.rot=function(theta){var c=Math.cos(theta),s=Math.sin(theta);return [c,-s,s,c];};
  M.eigh=function(a){var off=(a[1]+a[2])/2,phi=.5*Math.atan2(2*off,a[0]-a[3]),r=Math.hypot((a[0]-a[3])/2,off),mid=(a[0]+a[3])/2;return {values:[mid+r,mid-r],q:M.rot(phi)};};
  M.power=function(a,p,floor){var e=M.eigh(a),v=e.values.map(function(x){return x<=0&&floor===0?0:Math.pow(Math.max(x,floor),p);});return M.mul(M.mul(e.q,[v[0],0,0,v[1]]),M.transpose(e.q));};
  M.singular=function(a){var largest=Math.sqrt(Math.max(0,M.eigh(M.mul(M.transpose(a),a)).values[0]));return [largest,largest?Math.abs(a[0]*a[3]-a[1]*a[2])/largest:0];};
  M.fromSVD=function(s1,s2,left,right){return M.mul(M.mul(M.rot(left),[s1,0,0,s2]),M.transpose(M.rot(right)));};
  M.polar=function(a){var e=M.eigh(M.mul(M.transpose(a),a)),v=e.values.map(function(x){return x>Math.max(1e-28,e.values[0]*1e-12)?1/Math.sqrt(x):0;});return M.mul(a,M.mul(M.mul(e.q,[v[0],0,0,v[1]]),M.transpose(e.q)));};
  M.ns=function(x,quintic){var a=M.mul(x,M.transpose(x));return quintic?M.add(M.scale(x,3.4445),M.mul(M.add(M.scale(a,-4.775),M.scale(M.mul(a,a),2.0315)),x)):M.add(M.scale(x,1.5),M.scale(M.mul(a,x),-.5));};
  M.shampooState=function(damping){return {l:[damping,0,0,damping],r:[damping,0,0,damping],v:[damping,damping,damping,damping],t:0,refreshed:0};};
  M.shampooStep=function(s,g,frequency){s.t++;s.l=M.add(s.l,M.mul(g,M.transpose(g)));s.r=M.add(s.r,M.mul(M.transpose(g),g));s.v=s.v.map(function(v,i){return v+g[i]*g[i];});
    if(s.t===1||(s.t-1)%frequency===0){s.left=M.power(s.l,-.25,0);s.right=M.power(s.r,-.25,0);s.refreshed=s.t;}
    return {direction:M.mul(M.mul(s.left,g),s.right),diagonal:g.map(function(v,i){return v/Math.sqrt(s.v[i]);})};
  };
  M.soapState=function(){return {m:[0,0,0,0],v:[0,0,0,0],t:0};};
  M.soapFixedStep=function(s,g,left,right,b1,b2,eps){var h=M.mul(M.mul(M.transpose(left),g),right);s.t++;
    var u=h.map(function(v,i){s.m[i]=b1*s.m[i]+(1-b1)*v;s.v[i]=b2*s.v[i]+(1-b2)*v*v;return (s.m[i]/(1-Math.pow(b1,s.t)))/(Math.sqrt(s.v[i]/(1-Math.pow(b2,s.t)))+eps);});
    return {projected:h,adapted:u,direction:M.mul(M.mul(left,u),M.transpose(right))};
  };
  M.qr2=function(a){var n=Math.hypot(a[0],a[2]);if(n<1e-30)return [1,0,0,1];var x=a[0]/n,y=a[2]/n,dot=x*a[1]+y*a[3],u=a[1]-dot*x,v=a[3]-dot*y,n2=Math.hypot(u,v);return n2>1e-20?[x,u/n2,y,v/n2]:[x,-y,y,x];};
  M.soapRowState=function(g,rho,damping){var r=[(1-rho)*g[0]*g[0]+damping,(1-rho)*g[0]*g[1],(1-rho)*g[0]*g[1],(1-rho)*g[1]*g[1]+damping];return {r:r,q:M.eigh(r).q,v:[0,0],refreshed:0};};
  M.matrixTrajectoryStep=function(kind,s,g,p){
    var grad=[g[0],g[1],0,0],direction,extra={};
    if(kind==='muon'){
      s.matrixMomentum=M.add(M.scale(s.matrixMomentum||[0,0,0,0],p.beta),M.scale(grad,1-p.beta));
      var candidate=p.nesterov?M.add(M.scale(grad,1-p.beta),M.scale(s.matrixMomentum,p.beta)):s.matrixMomentum.slice();
      direction=M.scale(candidate,1/(M.norm(candidate)+1e-7));for(var k=0;k<p.nsSteps;k++)direction=M.ns(direction,true);
      s.m=s.matrixMomentum.slice(0,2);extra.singular=M.singular(direction);
    }else if(kind==='shampoo'){
      if(!s.shampoo)s.shampoo=M.shampooState(p.damping);
      direction=M.shampooStep(s.shampoo,grad,p.frequency).direction;extra.eigen=M.eigh(s.shampoo.r).values;extra.refreshed=s.shampoo.refreshed;
    }else{
      if(!s.soap)s.soap=M.soapRowState(p.calibration||g,p.rho,p.damping);
      var state=s.soap,q=state.q,h=[g[0]*q[0]+g[1]*q[2],g[0]*q[1]+g[1]*q[3]],u=[];
      for(var j=0;j<2;j++){s.m[j]=p.b1*s.m[j]+(1-p.b1)*g[j];state.v[j]=p.b2*state.v[j]+(1-p.b2)*h[j]*h[j];}
      var mp=[s.m[0]*q[0]+s.m[1]*q[2],s.m[0]*q[1]+s.m[1]*q[3]];
      for(var j=0;j<2;j++)u[j]=(mp[j]/(1-Math.pow(p.b1,s.t)))/(Math.sqrt(state.v[j]/(1-Math.pow(p.b2,s.t)))+1e-8);
      direction=[u[0]*q[0]+u[1]*q[1],u[0]*q[2]+u[1]*q[3],0,0];extra.projected=h;extra.second=state.v.slice();extra.basis=q.slice();
      state.r=M.add(M.scale(state.r,p.rho),M.scale([g[0]*g[0],g[0]*g[1],g[0]*g[1],g[1]*g[1]],1-p.rho));
      if(s.t%p.frequency===0){var estimates=M.mul(M.mul(M.transpose(q),state.r),q);if(estimates[3]>estimates[0]){q=[q[1],q[0],q[3],q[2]];state.v.reverse();}state.q=M.qr2(M.mul(state.r,q));state.refreshed=s.t;}
      extra.refreshed=state.refreshed;
    }
    var delta=[-p.lr*direction[0],-p.lr*direction[1]];s.w[0]+=delta[0];s.w[1]+=delta[1];return {g:g.slice(),delta:delta,direction:direction,m:s.m.slice(),extra:extra};
  };
  root.OptimizerMath=M;
})(typeof window==='undefined'?globalThis:window);
