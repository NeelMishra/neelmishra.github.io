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
const target=M.smoothTarget(3,.15,0);close(target[0],.9);close(target[1],.05);
for(const t of [1,2,8]){const z=[2,.5,-1],q=M.softmax([3,2,-2],t),p=M.softmax(z,t),h=1e-5;for(let i=0;i<3;i++){const a=z.slice(),b=z.slice();a[i]+=h;b[i]-=h;const numeric=t*t*(M.crossEntropy(q,M.softmax(a,t))-M.crossEntropy(q,M.softmax(b,t)))/(2*h);close(numeric,t*(p[i]-q[i]),1e-8);}}
const early=M.earlyData(.35);assert.ok(early.best[0]>0&&early.best[0]<2000);for(let i=1;i<early.path.length;i++)assert.ok(early.path[i][1]<=early.path[i-1][1]+1e-12);
// Verify the analytic path against one direct gradient step on the actual design matrix.
const b=Array.from({length:16},(_,k)=>M.mean(early.train.map(([x,y])=>y*(k?Math.sqrt(2)*Math.cos(k*Math.PI*x):1)/(k+1))));early.coefficients(1).forEach((a,k)=>close(a,.8*b[k]/(k+1),1e-12));
for(const x of [-.8,.4,1]){close(M.noiseLoss(x,2,0).exact,Math.pow(Math.sin(2*x)-.4,2));const r=M.rng(82);let sum=0;for(let i=0;i<100000;i++)sum+=Math.pow(Math.sin(2*(x+.2*M.normal(r)))-.4,2);close(sum/100000,M.noiseLoss(x,2,.2).exact,.006);}
for(const w of [-1.3,-.2,.6,1.2]){const h=1e-6;close(M.samGradient(w),(M.samLoss(w+h)-M.samLoss(w-h))/(2*h),1e-7);}
assert.equal(M.samProbe(1,.2).probe,1);assert.ok(M.neighborhoodMax(1,.15).loss>M.neighborhoodMax(-1,.15).loss);close(M.neighborhoodMax(.6,0).loss,M.samLoss(.6));
const net=M.network({sizes:[3,4,2],batch:2,activation:'tanh',seed:3}),h=1e-5;
function probeInput(offset){let batch=net.h[0].map(r=>r.slice());batch[0][1]+=offset;for(const w of net.weights)batch=M.forwardLayer(w,batch,'tanh',0).h;return batch.flat().reduce((s,v,i)=>s+v*net.grads[2].flat()[i],0);}
close(net.grads[0][0][1],(probeInput(h)-probeInput(-h))/(2*h),1e-9);
const zeroNet=M.network({sizes:[4,4,4],gain:0});close(zeroNet.forward[2].second,0);close(zeroNet.backward[0].second,0);
for(const mode of ['fanin','xavier','fanout']){const n=M.network({sizes:[64,128],mode:mode,batch:256,seed:17}),v=mode==='fanin'?1/64:mode==='fanout'?1/128:2/192;close(n.forward[1].second/n.forward[0].second,64*v,.05);close(n.backward[0].second/n.backward[1].second,128*v,.07);}
const rr=M.rng(37),draws=Array.from({length:200000},()=>Math.sqrt(2)*M.normal(rr)),relu=draws.map(x=>Math.max(0,x));close(M.mean(relu),1/Math.sqrt(Math.PI),.005);close(M.mean(relu.map(x=>x*x)),1,.012);close(M.variance(relu),1-1/Math.PI,.012);
for(const a of [0,.2,1])close(M.mean(draws.map(x=>Math.pow(M.activate(x,'leaky',a),2))),1+a*a,.02);
const q=M.orthogonalize([[1,2,3],[2,-1,4],[3,1,-2]]);q.forEach((row,i)=>q.forEach((other,j)=>close(row.reduce((s,x,k)=>s+x*other[k],0),i===j?1:0,1e-12)));
const sv=M.singularValues([[1,1],[0,1]]);close(sv[0],(Math.sqrt(5)+1)/2,1e-12);close(sv[1],(Math.sqrt(5)-1)/2,1e-12);
const on=M.network({sizes:Array(11).fill(16),activation:'linear',orthogonal:true});M.singularValues(M.jacobian(on,'linear')).forEach(x=>close(x,1,1e-10));
const ln=M.network({sizes:Array(8).fill(16),activation:'relu',orthogonal:true,lsuv:true,gain:Math.sqrt(2)});ln.forward.slice(1).forEach(s=>close(s.variance,1,.011));
const residualZero=M.residualNetwork(10,0,51);residualZero.forward.forEach(s=>close(s.second,residualZero.forward[0].second,1e-12));residualZero.backward.forEach(s=>close(s.second,residualZero.backward[10].second,1e-12));
const residualScaled=M.residualNetwork(40,1/Math.sqrt(40),51);assert.ok(residualScaled.forward[40].second/residualScaled.forward[0].second<5);
