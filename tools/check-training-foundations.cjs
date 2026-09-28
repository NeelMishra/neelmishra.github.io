'use strict';const assert=require('node:assert/strict');require('../blog/dl/training-labs/training-math.js');const M=globalThis.TrainingMath;
function close(a,b,tol=1e-9){assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);}
close(M.soft(2,.6),1.4);close(M.soft(.4,.6),0);close(M.elastic(2,.6,.5),14/15);
// Verify the exact minimizer against nearby candidates, including the nonsmooth origin.
for(const z of [-2,-.4,0,.4,2]){const w=M.elastic(z,.6,.5),f=x=>.5*(x-z)**2+.6*Math.abs(x)+.25*x*x;for(let x=-3;x<=3;x+=.013)assert.ok(f(w)<=f(x)+1e-12);}
console.log('Training-foundation numerical checks passed.');
assert.deepEqual(M.projectBall([3,4],2),[1.2000000000000002,1.6]);
assert.deepEqual(M.projectBall([0,0],2),[0,0]);
close(M.decayPath(.2,.1,1)[1][1],1.996);close(M.decayPath(.2,.1,1)[1][2],1.96);
const noDrop=M.dropoutSamples(0,'activation',1,20);noDrop.forEach(a=>assert.deepEqual(a.y,[3.5,1]));
for(const mode of ['activation','connection']){const a=M.dropoutSamples(.5,mode,7,80000),m=[M.mean(a.map(x=>x.y[0])),M.mean(a.map(x=>x.y[1]))],cov=M.mean(a.map(x=>(x.y[0]-m[0])*(x.y[1]-m[1])));close(m[0],3.5,.035);close(m[1],1,.035);close(cov,mode==='activation'?1.25:0,.07);}
assert.equal(M.structuredMask('block',.25,1).flat().filter(x=>!x).length,32);
const branch=M.structuredMask('branch',.5,4).flat();assert.ok(branch.every(x=>x===branch[0]));
M.structuredMask('channel',.5,7).forEach(a=>assert.ok(a.every(x=>x===a[0])));
close(M.cutmix(.75,4,4).lambda,.75);close(M.cutmix(.75,0,4).lambda,.875);close(M.cutmix(1,4,4).lambda,1);close(M.cutmix(0,4,4).lambda,0);
