/* One incremental pass builds the original companion's binary-class fixture. */
(function () {
  'use strict';
  const root=document.getElementById('sweep-anim');if(!root)return;
  const labels=Array.from('AABABBABBB'),left=[0,0],right=[4,6],states=[];
  function gini(c){const n=c[0]+c[1];return n?1-(c[0]/n)**2-(c[1]/n)**2:null;}
  let bestThreshold=null,bestScore=null;
  for(let k=0;k<10;k++){
    if(k){const c=labels[k-1]==='A'?0:1;left[c]++;right[c]--;}
    const leftGini=gini(left),rightGini=gini(right),weighted=k?(k*leftGini+(10-k)*rightGini)/10:null;
    if(k&&(bestScore===null||weighted<bestScore)){bestScore=weighted;bestThreshold=k+.5;}
    states.push({k,left:left.slice(),right:right.slice(),leftGini,rightGini,weighted,gain:k?.48-weighted:null,threshold:k?k+.5:null,bestThreshold,bestScore,movedClass:k?labels[k-1]:null});
  }
  const step=document.getElementById('sweep-step'),play=document.getElementById('sweep-play'),seek=document.getElementById('sweep-seek');let k=0,timer=null;
  const f=v=>v===null?'—':v.toFixed(6);
  function child(name,counts,g){return `<section class="sweep-child" data-child="${name.toLowerCase()}"><h3>${name} · ${counts[0]+counts[1]} rows</h3>${counts.map((n,j)=>`<div class="sweep-count" data-class="${'AB'[j]}" data-count="${n}"><strong>${'AB'[j]}</strong><div class="sweep-bar" aria-hidden="true"><span style="width:${n/6*100}%"></span></div><strong>${n}</strong></div>`).join('')}<p>Gini: ${g===null?'undefined for an empty child':f(g)}</p></section>`;}
  function draw(){const s=states[k];root.dataset.result=JSON.stringify(s);
    document.getElementById('sweep-points').innerHTML=labels.map((c,i)=>`<div class="sweep-point" data-side="${i<k?'left':'right'}"><span>x=${i+1}</span><strong>${c}</strong><span>${i<k?'L':'R'}</span></div>`).join('');
    document.getElementById('sweep-info').textContent=k?`Candidate ${k} of 9: x < ${s.threshold}. Moved row x=${k}, class ${s.movedClass}: left[${s.movedClass}] +1, right[${s.movedClass}] −1.`:'Initialization: left is empty; all 10 rows are on the right. This is not a valid split.';
    document.getElementById('sweep-children').innerHTML=child('Left',s.left,s.leftGini)+child('Right',s.right,s.rightGini);
    document.getElementById('sweep-score').innerHTML=k?`Weighted Gini: (${k}/10) × ${f(s.leftGini)} + (${10-k}/10) × ${f(s.rightGini)} = ${f(s.weighted)}<br>Reduction: 0.480000 − ${f(s.weighted)} = ${f(s.gain)}`:'Parent Gini = 0.480000. Step once to create two nonempty children; no candidate has been scored yet.';
    document.getElementById('sweep-output').textContent=k?`Best ${k===9?'after all nine candidates':'so far'}: x < ${s.bestThreshold}, weighted Gini ${f(s.bestScore)}.`:'Best candidate: not yet available.';
    seek.value=k;document.getElementById('sweep-position').textContent=k+' / 9';step.disabled=k===9;play.textContent=timer!==null?'Pause':k===9?'Replay':'Play';play.setAttribute('aria-pressed',String(timer!==null));
  }
  function stop(){if(timer!==null){clearInterval(timer);timer=null;}}
  step.addEventListener('click',()=>{stop();if(k<9)k++;draw();});
  document.getElementById('sweep-reset').addEventListener('click',()=>{stop();k=0;draw();});
  seek.addEventListener('input',()=>{stop();k=Number(seek.value);draw();});
  play.addEventListener('click',()=>{if(timer!==null){stop();draw();return;}if(k===9)k=0;timer=setInterval(()=>{k++;if(k===9)stop();draw();},750);draw();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();draw();}});
  draw();document.getElementById('sweep-controls').hidden=false;
})();
