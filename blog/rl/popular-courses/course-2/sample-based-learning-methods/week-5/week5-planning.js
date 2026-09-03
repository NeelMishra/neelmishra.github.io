(function(){
  'use strict';
  function byId(id){return document.getElementById(id);}
  function setText(id,value){var el=byId(id);if(el)el.textContent=value;}

  (function coin(){
    var draw=byId('model-draw'),reset=byId('model-reset');if(!draw||!reset)return;
    var heads=0,n=0,seed=12345;
    function rand(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
    function render(last){setText('model-samples',String(n));setText('model-heads',String(heads));setText('model-estimate',n?(heads/n).toFixed(3):'--');setText('model-last',last||'Draw from the sample model.');}
    draw.addEventListener('click',function(){var h=rand()<.5;n++;if(h)heads++;render(h?'sample: heads':'sample: tails');});
    reset.addEventListener('click',function(){heads=0;n=0;seed=12345;render();});render();
  })();

  (function bonus(){
    var tau=byId('dyna-tau'),kappa=byId('dyna-kappa');if(!tau||!kappa)return;
    function render(){
      var t=Number(tau.value),k=Number(kappa.value),bonus=k*Math.sqrt(t);
      setText('dyna-tau-value',String(t));setText('dyna-kappa-value',k.toFixed(3));setText('dyna-bonus-value',bonus.toFixed(3));
    }
    tau.addEventListener('input',render);kappa.addEventListener('input',render);render();
  })();
})();
