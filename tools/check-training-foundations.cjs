'use strict';const assert=require('node:assert/strict');require('../blog/dl/training-labs/training-math.js');const M=globalThis.TrainingMath;
function close(a,b,tol=1e-9){assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);}
close(M.soft(2,.6),1.4);close(M.soft(.4,.6),0);close(M.elastic(2,.6,.5),14/15);
// Verify the exact minimizer against nearby candidates, including the nonsmooth origin.
for(const z of [-2,-.4,0,.4,2]){const w=M.elastic(z,.6,.5),f=x=>.5*(x-z)**2+.6*Math.abs(x)+.25*x*x;for(let x=-3;x<=3;x+=.013)assert.ok(f(w)<=f(x)+1e-12);}
console.log('Training-foundation numerical checks passed.');
