/* Fit actual squared-loss stumps; no random draws or precomputed animation. */
(() => {
  const rateControl = document.getElementById('boost-rate');
  if (!rateControl) return;
  const x = [1,2,3,4], y = [2,4,8,10];
  const mean = values => values.reduce((a,b)=>a+b,0)/values.length;
  const fmt = n => String(Number(n.toFixed(5)));
  function fit(target) {
    const constant=mean(target);
    let best={cut:null,left:constant,right:constant,error:target.reduce((s,r)=>s+(r-constant)**2,0)};
    for (const cut of [1.5,2.5,3.5]) {
      const left=mean(target.filter((_,i)=>x[i]<cut));
      const right=mean(target.filter((_,i)=>x[i]>=cut));
      const error=target.reduce((s,r,i)=>s+(r-(x[i]<cut?left:right))**2,0);
      if(error < best.error-1e-12) best={cut,left,right,error};
    }
    return best;
  }
  function train(rate) {
    let prediction=y.map(()=>mean(y));
    const trace=[{prediction:[...prediction],before:[...prediction],residual:y.map((yi,i)=>yi-prediction[i]),correction:null,mse:10,tree:null}];
    for(let t=1;t<=6;t++) {
      const before=[...prediction],residual=y.map((yi,i)=>yi-before[i]);
      const tree=fit(residual),correction=x.map(xi=>tree.cut===null||xi<tree.cut?tree.left:tree.right);
      prediction=before.map((fi,i)=>fi+rate*correction[i]);
      trace.push({before,residual,correction,prediction:[...prediction],tree,mse:mean(y.map((yi,i)=>(yi-prediction[i])**2))});
    }
    return trace;
  }
  let round=1;
  const prev=document.getElementById('boost-prev'),next=document.getElementById('boost-next'),reset=document.getElementById('boost-reset');
  function render() {
    const state=train(Number(rateControl.value))[round];
    const description=round===0?'Baseline mean 6; no tree fitted.':state.tree.cut===null?`Constant correction ${fmt(state.tree.left)}.`:`Split at x < ${state.tree.cut}; correction leaves ${fmt(state.tree.left)} and ${fmt(state.tree.right)}.`;
    document.getElementById('boost-status').textContent=`Round ${round} of 6. ${description} Training MSE: ${fmt(state.mse)}.`;
    const rows=x.map((xi,i)=>{const tr=document.createElement('tr');
      for(const value of [`${xi} / ${y[i]}`,fmt(state.before[i]),fmt(state.residual[i]),state.correction?fmt(state.correction[i]):'—',fmt(state.prediction[i])]){const td=document.createElement('td');td.textContent=value;tr.append(td);}return tr;});
    document.getElementById('boost-rows').replaceChildren(...rows);
    document.querySelectorAll('#boost-bars .note-bar-row').forEach((bar,i)=>{
      bar.querySelector('.note-bar > span').style.width=`${state.prediction[i]*10}%`;
      bar.lastElementChild.textContent=fmt(state.prediction[i]);
    });
    prev.disabled=round===0;next.disabled=round===6;
  }
  rateControl.disabled=false;reset.disabled=false;
  prev.addEventListener('click',()=>{round=Math.max(0,round-1);render();});
  next.addEventListener('click',()=>{round=Math.min(6,round+1);render();});
  reset.addEventListener('click',()=>{round=1;rateControl.value='0.5';render();});
  rateControl.addEventListener('change',render);
  render();
})();
