(function(root){'use strict';var M={};
M.soft=function(z,t){return Math.sign(z)*Math.max(Math.abs(z)-t,0);};
M.elastic=function(z,l1,l2){return M.soft(z,l1)/(1+l2);};
M.rng=function(seed){var s=seed>>>0;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return (s+.5)/4294967296;};};
M.normal=function(r){return Math.sqrt(-2*Math.log(r()))*Math.cos(2*Math.PI*r());};
M.mean=function(a){return a.reduce(function(s,x){return s+x;},0)/a.length;};
M.variance=function(a){var m=M.mean(a);return M.mean(a.map(function(x){return (x-m)*(x-m);}));};
root.TrainingMath=M;})(typeof window==='undefined'?globalThis:window);
