(function () {
  'use strict';
  if (window.renderMathInElement) window.renderMathInElement(document.querySelector('.training-note'), {
    delimiters: [{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}], throwOnError:false
  });
})();
