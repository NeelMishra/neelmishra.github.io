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

  (function initEpisode(){
    var grid=byId('td-online-values'),step=byId('td-online-step'),reset=byId('td-online-reset'),status=byId('td-online-status');
    if(!grid||!step||!reset||!status)return;
    var states=['A','B','C','D','E'];
    var path=[0,1,2,3,4,5];
    var values,idx,alpha=.1;
    function resetAll(){values=[.5,.5,.5,.5,.5];idx=0;render(-1);status.textContent='No transition observed yet. The episode will finish with reward +1.';}
    function render(active){
      grid.innerHTML='';
      states.forEach(function(name,i){
        var cell=document.createElement('div');
        cell.className='sb-value'+(i===active?' active':'');
        cell.innerHTML='<strong>'+name+'</strong><span>V = '+values[i].toFixed(3)+'</span>';
        grid.appendChild(cell);
      });
    }
    step.addEventListener('click',function(){
      if(idx>=path.length-1){status.textContent='Episode complete. Reset to replay the online updates.';return;}
      var s=path[idx],sp=path[idx+1],r=sp===5?1:0,nextValue=sp===5?0:values[sp];
      var before=values[s],delta=r+nextValue-before;
      values[s]=before+alpha*delta;
      status.textContent=states[s]+' updates immediately from transition '+states[s]+' -> '+(sp===5?'terminal':states[sp])+': delta = '+delta.toFixed(3)+', V = '+values[s].toFixed(3)+'.';
      idx++;render(s);
    });
    reset.addEventListener('click',resetAll);
    resetAll();
  })();
})();
