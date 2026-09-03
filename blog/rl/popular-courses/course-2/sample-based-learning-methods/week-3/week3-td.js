(function(){
  'use strict';
  function byId(id){return document.getElementById(id);}
  function setText(id,value){var el=byId(id);if(el)el.textContent=value;}

  (function initUpdate(){
    var alpha=byId('td-alpha'),gamma=byId('td-gamma'),reward=byId('td-reward');
    var current=byId('td-current'),next=byId('td-next');
    if(!alpha||!gamma||!reward||!current||!next)return;
    function render(){
      var a=Number(alpha.value),g=Number(gamma.value),r=Number(reward.value);
      var v=Number(current.value),vp=Number(next.value);
      var target=r+g*vp,delta=target-v,updated=v+a*delta;
      setText('td-alpha-value',a.toFixed(2));
      setText('td-gamma-value',g.toFixed(2));
      setText('td-reward-value',r.toFixed(1));
      setText('td-current-value',v.toFixed(2));
      setText('td-next-value',vp.toFixed(2));
      setText('td-target-value',target.toFixed(3));
      setText('td-error-value',delta.toFixed(3));
      setText('td-updated-value',updated.toFixed(3));
    }
    [alpha,gamma,reward,current,next].forEach(function(el){el.addEventListener('input',render);});
    render();
  })();

})();
