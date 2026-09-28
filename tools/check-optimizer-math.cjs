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
s=M.state();let ad=M.step('adadelta',s,[2,2],{lr:1,rho:.9,eps:1e-6});close(s.v[0],.4);close(ad.delta[0],-.002/Math.sqrt(.400001));close(s.u[0],.1*ad.delta[0]**2);
let ad2=M.state();M.step('adadelta',ad2,[2,2],{lr:2,rho:.9,eps:1e-6});close(ad2.u[0],s.u[0]);close(ad2.w[0]-3,2*(s.w[0]-3));
s=M.state();let rms=M.step('rmsprop',s,[2,20],{lr:.1,rho:.9,eps:0});close(rms.delta[0],rms.delta[1]);close(rms.delta[0],-.1/Math.sqrt(.1));
s=M.state();for(let i=0;i<10;i++)M.step('rmsprop',s,[1,1],{lr:.1,rho:.9,eps:1e-8});close(s.v[0],1-.9**10);M.step('rmsprop',s,[10,10],{lr:.1,rho:.9,eps:1e-8});close(s.v[0],.9*(1-.9**10)+10);
s=M.state();let ap={lr:.1,b1:.9,b2:.999,correct:1,eps:0,decay:0};let a1=M.step('adam',s,[2,20],ap);close(a1.delta[0],-.1);close(a1.delta[1],-.1);let a2=M.step('adam',s,[-2,-20],ap);close(a2.delta[0],.0052631578947368);
s=M.state();let ua=M.step('adam',s,[2,2],{...ap,correct:0});close(ua.delta[0],-.1*.1/Math.sqrt(.001));
s=M.state();s.w=[2,2];let decay=M.step('adam',s,[0,0],{...ap,eps:1e-8,decay:.1});close(s.w[0],1.98);
