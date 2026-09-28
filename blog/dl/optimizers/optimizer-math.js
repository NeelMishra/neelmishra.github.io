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
    for(var i=0;i<2;i++){
      if(kind==='sgd')d[i]=-p.lr*g[i];
      else if(kind==='momentum'){s.m[i]=p.beta*s.m[i]+g[i];d[i]=-p.lr*s.m[i];}
      else if(kind==='adadelta'){
        s.v[i]=p.rho*s.v[i]+(1-p.rho)*g[i]*g[i];
        den[i]=Math.sqrt(s.v[i]+p.eps);num[i]=Math.sqrt(s.u[i]+p.eps);
        var raw=-num[i]*g[i]/den[i];
        s.u[i]=p.rho*s.u[i]+(1-p.rho)*raw*raw;d[i]=p.lr*raw;
      }
      else throw new Error('Unknown optimizer '+kind);
      s.w[i]+=d[i];
    }
    return {g:g.slice(),delta:d,den:den,num:num,m:s.m.slice(),v:s.v.slice(),u:s.u.slice()};
  };
  root.OptimizerMath=M;
})(typeof window==='undefined'?globalThis:window);
