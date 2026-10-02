(function(){
  'use strict';
  Array.prototype.forEach.call(document.querySelectorAll('[data-model-lab]'),function(root){
    var slider=root.querySelector('[data-visits]'),check=root.querySelector('[data-premium]');
    function update(){
      var v=Number(slider.value),p=check.checked?1:0;
      var kind=root.getAttribute('data-model-lab'),value;
      root.querySelector('[data-visits-label]').textContent=v;
      if(kind==='interaction'){
        value=20+5*v+10*p+2*v*p;
        root.querySelector('[data-equation]').textContent='20 + '+5*v+' + '+10*p+' + '+2*v*p+' = '+value;
        root.querySelector('[data-meaning]').textContent='One more visit adds '+(5+2*p)+' dollars. At '+v+' visits, switching from Basic to Premium adds '+(10+2*v)+' dollars.';
      }else if(kind==='shap'){
        value=20+5*v+10*p;
        root.querySelector('[data-equation]').textContent='35 + ('+5*(v-2)+') + ('+10*(p-.5)+') = '+value;
        root.querySelector('[data-meaning]').textContent='Reference: 2 visits and a Premium share of 0.5. Visit contribution: '+5*(v-2)+' dollars. Plan contribution: '+10*(p-.5)+' dollars.';
      }else{
        value=20+5*v+10*p;
        root.querySelector('[data-equation]').textContent='20 + '+5*v+' + '+10*p+' = '+value;
        root.querySelector('[data-meaning]').textContent=(p?'Premium':'Basic')+' with '+v+' monthly visits gives a prediction of '+value+' dollars.';
      }
      root.setAttribute('data-prediction',String(value));
    }
    slider.addEventListener('input',update);check.addEventListener('change',update);update();
  });
})();
