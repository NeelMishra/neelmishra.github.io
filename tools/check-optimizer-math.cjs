'use strict';
const assert=require('node:assert/strict');
require('../blog/dl/optimizers/optimizer-math.js');
const M=globalThis.OptimizerMath;
function close(a,b,tol=1e-10){assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);}
let h=M.hessian(20,25*Math.PI/180),w=[3,2],g=M.mv(h,w),eps=1e-5;
for(let i=0;i<2;i++){let a=w.slice(),b=w.slice();a[i]+=eps;b[i]-=eps;close((M.loss(a,h)-M.loss(b,h))/(2*eps),g[i],1e-7);}
let all=M.centers(.35).map(a=>M.mv(h,[w[0]-a[0],w[1]-a[1]]));
for(let j=0;j<2;j++)close(all.reduce((s,a)=>s+a[j],0)/8,g[j]);
let s=M.state();M.step('sgd',s,[3,4],{lr:.1});close(s.w[0],2.7);close(s.w[1],1.6);
s=M.state();M.step('sgd',s,M.mv(M.hessian(1,0),s.w),{lr:1});close(s.w[0],0);close(s.w[1],0);
let r1=M.rng(7),r2=M.rng(7);for(let i=0;i<100;i++)assert.equal(r1(),r2());
console.log('Optimizer numerical checks passed.');
s=M.state();M.step('momentum',s,[1,4],{lr:.1,beta:.9});M.step('momentum',s,[1,-4],{lr:.1,beta:.9});close(s.m[0],1.9);close(s.m[1],-.4);close(s.w[0],2.71);close(s.w[1],1.64);
let plain=M.state(),moment=M.state();for(let i=0;i<10;i++){M.step('sgd',plain,[i,-i],{lr:.03});M.step('momentum',moment,[i,-i],{lr:.03,beta:0});}assert.deepEqual(plain.w,moment.w);
