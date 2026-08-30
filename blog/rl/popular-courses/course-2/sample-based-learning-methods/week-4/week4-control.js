(function(){
  'use strict';
  function byId(id){return document.getElementById(id);}
  function setText(id,value){var el=byId(id);if(el)el.textContent=value;}
  var buttons=document.querySelectorAll('[data-control-action]');
  if(!buttons.length)return;
  var q=[0,-1,2,1],probs=[.1,.1,.7,.1],chosen=2,reward=1,gamma=.9;
  function render(){
    buttons.forEach(function(btn){btn.classList.toggle('active',Number(btn.dataset.controlAction)===chosen);});
    var expected=0,max=-Infinity;
    q.forEach(function(v,i){expected+=probs[i]*v;max=Math.max(max,v);});
    setText('ctl-sarsa-target',(reward+gamma*q[chosen]).toFixed(3));
    setText('ctl-expected-target',(reward+gamma*expected).toFixed(3));
    setText('ctl-q-target',(reward+gamma*max).toFixed(3));
    setText('ctl-picked','a'+(chosen+1)+' with Q = '+q[chosen].toFixed(1));
  }
  buttons.forEach(function(btn){btn.addEventListener('click',function(){chosen=Number(btn.dataset.controlAction);render();});});
  render();
})();
