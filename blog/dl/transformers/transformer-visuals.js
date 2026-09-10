/* Interactive experiments and mobile navigation for the transformer notes. */
(function () {
  'use strict';
  var article = document.querySelector('.tr-article');
  if (!article) return;
  // Keep the long explorer available without putting it ahead of the article on phones.
  var sidebar = document.querySelector('.blog-sidebar');
  var sidebarBody = sidebar && sidebar.querySelector('.blog-sidebar-body');
  if (sidebarBody) {
    var drawer = document.createElement('details');
    drawer.className = 'tr-mobile-explorer';
    var summary = document.createElement('summary');
    summary.textContent = 'Browse chapters & contents';
    drawer.append(summary, sidebarBody);
    sidebar.appendChild(drawer);
    var smallScreen = window.matchMedia('(max-width: 900px)');
    var mobileOpen = false;
    function arrangeExplorer() { drawer.open = smallScreen.matches ? mobileOpen : true; }
    drawer.addEventListener('toggle', function () { if (smallScreen.matches) mobileOpen = drawer.open; });
    smallScreen.addEventListener('change', arrangeExplorer);
    arrangeExplorer();
  }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function fmt(x) { return Math.abs(x) < .00005 ? '0.0000' : x.toFixed(4); }
  function vec(xs) { return '(' + xs.map(fmt).join(', ') + ')'; }
  function dot(a,b) { return a.reduce(function (sum,x,i) { return sum+x*b[i]; },0); }
  function softmax(scores) {
    var max = Math.max.apply(null,scores), w = scores.map(function (s) { return Math.exp(s-max); });
    var sum = w.reduce(function (a,b) { return a+b; },0);
    return w.map(function (v) { return v/sum; });
  }
  function note(body,text) { body.appendChild(el('p','tr-demo-note',text)); }
  function status(body) { var out=el('output','tr-status');out.setAttribute('aria-live','polite');out.setAttribute('aria-atomic','true');body.appendChild(out);return out; }
  function row(parent,values,label) {
    var wrap=el('div','tr-token-strip');wrap.appendChild(el('span','tr-mini-label',label));var group=el('div','tr-tokens');
    var cells=values.map(function (value) { var cell=el('span','tr-token',String(value));group.appendChild(cell);return cell; });
    wrap.appendChild(group);parent.appendChild(wrap);return cells;
  }
  function matrix(parent,rows,columns,label) {
    var wrap=el('div','tr-mini-matrix');wrap.appendChild(el('span','tr-mini-label',label));var grid=el('div','tr-matrix-grid');grid.style.setProperty('--cols',columns);
    var cells=[];for(var r=0;r<rows;r++){cells[r]=[];for(var c=0;c<columns;c++){var cell=el('span','tr-matrix-value','0');grid.appendChild(cell);cells[r].push(cell);}}
    wrap.appendChild(grid);parent.appendChild(wrap);return cells;
  }
  function fill(cells,values,highlight) {
    cells.forEach(function (row,r) { row.forEach(function (cell,c) {cell.textContent=typeof values[r][c]==='number'?(Math.floor(values[r][c])===values[r][c]?String(values[r][c]):fmt(values[r][c])):String(values[r][c]);cell.classList.toggle('is-lit',Boolean(highlight && highlight(r,c)));}); });
  }
  function pair(body) { var p=el('div','tr-pair');body.appendChild(p);return p; }
  function buttons(body) {
    var controls=el('div','tr-controls');var next=el('button','','Next step →'),reset=el('button','','↺ Reset');next.type=reset.type='button';next.dataset.advance='';reset.dataset.reset='';controls.append(next,reset);body.appendChild(controls);return {next:next,reset:reset};
  }
  function labelSelect(controls,label,values,initial) {
    var wrap=el('label','',label+' '),select=el('select');values.forEach(function (value) {var option=el('option','',String(value));option.value=value;select.appendChild(option);});select.value=initial;wrap.appendChild(select);controls.appendChild(wrap);return select;
  }
  function range(controls,label,min,max,step,value) {
    var wrap=el('label','',label+' '),input=el('input');input.type='range';input.min=min;input.max=max;input.step=step;input.value=value;wrap.appendChild(input);controls.appendChild(wrap);return input;
  }
  function controls(body) {var group=el('div','tr-controls');body.appendChild(group);return group;}
  function signedBars(body,count) {
    var chart=el('div','tr-chart'),labels=el('div','tr-chart-values'),bars=[];
    for(var i=0;i<count;i++){var column=el('div','tr-column'),bar=el('div','tr-column-fill'),value=el('span','','0');column.appendChild(bar);chart.appendChild(column);labels.appendChild(value);bars.push({bar:bar,value:value});}
    chart.setAttribute('aria-hidden','true');body.append(chart,labels);
    return function (values) {var extent=Math.max(2,Math.max.apply(null,values.map(Math.abs)));values.forEach(function (x,i) {bars[i].bar.style.height=(Math.abs(x)/extent*45)+'%';bars[i].bar.style.bottom=(x<0?50-Math.abs(x)/extent*45:50)+'%';bars[i].bar.classList.toggle('is-negative',x<0);bars[i].value.textContent=fmt(x);});};
  }
  var labs={
    embedding:function(body){
      var c=controls(body),position=labelSelect(c,'Input position',[1,2,3],1);
      note(body,'Toy IDs [4, 1, 4]. The table below shows only the two embedding rows used here. Highlighted rows are selected by the current position.');
      var ids=row(body,[4,1,4],'Input token IDs'),p=pair(body),table=matrix(p,2,3,'Table rows: ID 1 above, ID 4 below'),output=matrix(p,3,3,'Gathered vectors at positions 1, 2, 3');
      var out=status(body),vectors=[[1,0,1],[0,2,-1],[1,0,1]];
      function draw(){var i=Number(position.value)-1,lookup=i===1?0:1;ids.forEach(function(cell,j){cell.classList.toggle('is-lit',j===i);});fill(table,[[0,2,-1],[1,0,1]],function(r){return r===lookup;});fill(output,vectors,function(r){return r===i;});out.textContent='Position '+(i+1)+' contains ID '+[4,1,4][i]+'.\nSelected vector = '+vec(vectors[i])+'\nPositions 1 and 3 gather the same row; later context can change their representations.';}
      position.oninput=draw;draw();
    },
    heads:function(body){
      var c=controls(body),heads=labelSelect(c,'Number of heads',[1,2,4],2),position=labelSelect(c,'Trace token position',[1,2,3],1);
      note(body,'These toy numbers are already-projected Q features, with B = 1, n = 3, d = 8. Changing H partitions the feature width; it does not divide tokens into groups.');
      var input=matrix(body,3,8,'Q before splitting: [1, 3, 8]'),outputs=el('div','tr-pair');body.appendChild(outputs);var out=status(body);
      var values=[0,1,2].map(function(r){return [0,1,2,3,4,5,6,7].map(function(c){return r*10+c;});}),previousH=0,panels=[];
      function draw(){var h=Number(heads.value),width=8/h,selected=Number(position.value)-1;
        if(h!==previousH){outputs.replaceChildren();panels=[];for(var i=0;i<h;i++)panels.push(matrix(outputs,3,width,'Head '+(i+1)+': 3 tokens × '+width+' features'));previousH=h;}
        fill(input,values,function(r){return r===selected;});panels.forEach(function(panel,i){fill(panel,values.map(function(row){return row.slice(i*width,(i+1)*width);}),function(r){return r===selected;});});
        out.textContent='Reshape: [1, 3, '+h+', '+width+'] → transpose: [1, '+h+', 3, '+width+']\nEvery head still has all three token rows. The highlighted row follows token '+(selected+1)+' through the split.';
      }heads.oninput=position.oninput=draw;draw();
    },
    normalization:function(body){
      var c=controls(body),mode=labelSelect(c,'Operation',['LayerNorm','RMSNorm'],'LayerNorm'),offset=range(c,'Add to every feature',-5,5,.5,0),scale=range(c,'Positive input scale',.5,2,.25,1);
      note(body,'Input = scale × (1, 2, 3, 4) + offset. Both use ε = 10⁻⁵, learned scale 1, and no learned shift. The chart shows the resulting features around zero.');
      var inputs=row(body,[1,2,3,4],'Input features'),drawBars=signedBars(body,4),out=status(body);
      function draw(){var shift=Number(offset.value),a=Number(scale.value),xs=[1,2,3,4].map(function(x){return a*x+shift;}),mean=xs.reduce(function(x,y){return x+y;},0)/4;
        var centered=xs.map(function(x){return mode.value==='LayerNorm'?x-mean:x;}),stat=dot(centered,centered)/4,ys=centered.map(function(x){return x/Math.sqrt(stat+1e-5);});
        inputs.forEach(function(cell,i){cell.textContent=fmt(xs[i]);});drawBars(ys);out.textContent='Scale = '+a+' · Offset = '+shift+' · Input mean = '+fmt(mean)+'\n'+(mode.value==='LayerNorm'?'Centered variance':'Mean square')+' = '+fmt(stat)+'\nOutput = '+vec(ys)+'\nLayerNorm removes a common shift; RMSNorm does not. A small epsilon slightly affects scale invariance.';
      }[mode,offset,scale].forEach(function(input){input.oninput=draw;});draw();
    },
    residual:function(body){
      var b=buttons(body);note(body,'This arithmetic illustration fixes the branch outputs: X = (1, 2), attention update A = (0.5, −1), and MLP update F = (−0.25, 0.5). A trained model would compute A and F from normalized inputs.');
      var stages=row(body,['X','X + A','U + F'],'Follow the current residual vector'),state=row(body,[1,2],'Residual stream'),out=status(body),step=0,values=[[1,2],[1.5,1],[1.25,1.5]];
      function draw(){stages.forEach(function(cell,i){cell.classList.toggle('is-lit',i===step);});state.forEach(function(cell,i){cell.textContent=fmt(values[step][i]);cell.classList.add('is-lit');});b.next.disabled=step===2;out.textContent=['Start: preserve X on the skip path.','First write: U = X + A = (1.5, 1). The MLP reads normalized U.','Second write: Y = U + F = (1.25, 1.5). Adding F to the old X would skip the first update.'][step];}
      b.next.onclick=function(){step=Math.min(2,step+1);draw();};b.reset.onclick=function(){step=0;draw();};draw();
    },
    cache:function(body){
      var c=controls(body),mode=labelSelect(c,'Execution',['Use KV cache','Recompute full prefix'],'Use KV cache'),b=buttons(body);
      note(body,'Fixed illustrative continuation: “The cat sat” → “down” → “.”. Green = reused cache, orange = projected this pass, dashed = not yet available. These are chosen example tokens, not model samples.');
      var chips=row(body,['The','cat','sat','down','.'],'Logical token history'),out=status(body),step=0;
      function draw(){var n=3+step,cached=mode.value==='Use KV cache'&&step>0?n-1:0;chips.forEach(function(cell,i){cell.dataset.tokenState=i>=n?'pending':i<cached?'cached':'new';});b.next.disabled=step===2;out.textContent=(step===0?'Prefill':'Decode step '+step)+' · Prefix length = '+n+'\nK/V rows projected per layer this pass = '+(n-cached)+'\nPreviously cached rows reused = '+cached+'\nThe final query attends to '+n+' keys. '+(step===0?'The last prompt output supplies the first continuation distribution.':'The chosen new token is processed at its own absolute position.');}
      mode.oninput=draw;b.next.onclick=function(){step=Math.min(2,step+1);draw();};b.reset.onclick=function(){step=0;draw();};draw();
    },
    linear:function(body){
      var c=controls(body),query=labelSelect(c,'Query',['(1,1)','(1,0)','(0,1)'],'(1,1)'),b=buttons(body);
      note(body,'The displayed keys and queries are already kernel features. Writes arrive as k=(1,0), v=2; k=(1,1), v=4; k=(0,1), v=3. Each press adds one outer product and one normalizer update.');
      var p=pair(body),state=matrix(p,2,1,'S: feature × value'),normalizer=matrix(p,2,1,'z: accumulated key features'),out=status(body),step=0,keys=[[1,0],[1,1],[0,1]],values=[2,4,3];
      function draw(){var q={'(1,1)':[1,1],'(1,0)':[1,0],'(0,1)':[0,1]}[query.value],s=[0,0],z=[0,0],directNumerator=0,directMass=0;
        for(var t=0;t<step;t++){for(var i=0;i<2;i++){s[i]+=keys[t][i]*values[t];z[i]+=keys[t][i];}var weight=dot(q,keys[t]);directNumerator+=weight*values[t];directMass+=weight;}
        fill(state,s.map(function(v){return [v];}),function(){return step>0;});fill(normalizer,z.map(function(v){return [v];}),function(){return step>0;});var mass=dot(z,q),numerator=dot(s,q);b.next.disabled=step===3;
        out.textContent='Writes = '+step+' · Numerator Sᵀq = '+fmt(numerator)+' · Mass zᵀq = '+fmt(mass)+'\n'+(mass===0?'No positive kernel mass: this normalized read is undefined. Choose another query or add a write.':'Recurrent read = '+fmt(numerator/mass)+'\nDirect kernel-weighted read = '+fmt(directNumerator/directMass));
      }query.oninput=draw;b.next.onclick=function(){step=Math.min(3,step+1);draw();};b.reset.onclick=function(){step=0;draw();};draw();
    },
    kda:function(body){
      var c=controls(body),a=range(c,'Row 1 retention',0,1,.05,1),b=range(c,'Row 2 retention',0,1,.05,.25),beta=range(c,'Delta rate β',0,1,.05,.5);
      note(body,'Each change recomputes from S = I. Key k = (1,1)/√2, target v = (2,1). Row-wise decay happens before the delta read and write. Gate endpoints illustrate limiting cases.');
      var p=pair(body),decayed=matrix(p,2,2,'After row-wise decay'),updated=matrix(p,2,2,'After the delta write'),out=status(body);
      function draw(){var r1=Number(a.value),r2=Number(b.value),rate=Number(beta.value),k=[Math.SQRT1_2,Math.SQRT1_2],d=[[r1,0],[0,r2]],error=[2-r1*k[0],1-r2*k[1]],s=d.map(function(row,i){return row.map(function(value,j){return value+rate*k[i]*error[j];});}),read=[k[0]*s[0][0]+k[1]*s[1][0],k[0]*s[0][1]+k[1]*s[1][1]];
        fill(decayed,d,function(r){return (r===0?r1:r2)<1;});fill(updated,s,function(){return rate>0;});out.textContent='Retention = '+vec([r1,r2])+' · β = '+fmt(rate)+'\nError measured after decay = '+vec(error)+'\nRead of the written key after update = '+vec(read)+'\nAt β = 1, the unit-key read reaches the target (2,1). At β = 0, only row-wise decay remains.';
      }[a,b,beta].forEach(function(input){input.oninput=draw;});draw();
    },
    latent:function(body){
      var c=controls(body),route=labelSelect(c,'Inspect route',['Expanded K/V','Absorbed query'],'Expanded K/V'),q0=range(c,'First query coordinate',-2,2,.25,1);
      note(body,'A content-only example with 3 tokens, latent width 2, key width 4, and value width 3. The chapter separately explains the positional score path. Both routes use the same parameters and one softmax.');
      var p=pair(body),cache=matrix(p,3,2,'Cached content latents C'),work=el('div','tr-mini-matrix');p.appendChild(work);var output=row(body,[0,0,0],'Final value read'),out=status(body);
      var latents=[[1,0],[0,1],[1,1]],uk=[[1,0],[0,1],[1,1],[1,-1]],uv=[[1,0],[0,1],[1,1]],previous='',workCells;
      function draw(){var q=[Number(q0.value),0,.5,-.5],absorbed=[0,0];uk.forEach(function(row,i){row.forEach(function(v,j){absorbed[j]+=v*q[i];});});
        var keys=latents.map(function(c){return uk.map(function(row){return dot(row,c);});}),values=latents.map(function(c){return uv.map(function(row){return dot(row,c);});});
        var p1=softmax(keys.map(function(k){return dot(k,q)/2;})),p2=softmax(latents.map(function(c){return dot(c,absorbed)/2;})),explicit=[0,0,0],z=[0,0];
        p1.forEach(function(w,t){for(var i=0;i<3;i++)explicit[i]+=w*values[t][i];});p2.forEach(function(w,t){for(var i=0;i<2;i++)z[i]+=w*latents[t][i];});var result=uv.map(function(row){return dot(row,z);});
        if(route.value!==previous){work.replaceChildren();workCells=route.value==='Expanded K/V'?matrix(work,3,4,'Expanded keys: 3 × 4'):matrix(work,1,2,'Absorbed current query: Uᴷᵀq');previous=route.value;}
        fill(cache,latents,function(){return route.value==='Absorbed query';});fill(workCells,route.value==='Expanded K/V'?keys:[absorbed],function(){return true;});output.forEach(function(cell,i){cell.textContent=fmt(result[i]);cell.classList.add('is-lit');});
        var error=Math.max.apply(null,result.map(function(x,i){return Math.abs(x-explicit[i]);}));out.textContent='Query = '+vec(q)+'\nWeights = '+vec(p1)+'\nExpanded output = '+vec(explicit)+'\nLatent-route output = '+vec(result)+'\nMaximum difference = '+error.toExponential(2)+'\nStored scalar count in this content-only toy: 21 expanded K/V entries versus 6 joint latent entries.';
      }route.oninput=q0.oninput=draw;draw();
    },
    speculation:function(body){
      var c=controls(body),draft=labelSelect(c,'Draft distribution',['Underproduce token A','Match target','Overproduce token A'],'Underproduce token A');
      note(body,'Target p = (0.6, 0.3, 0.1). Green bar = accepted proposal mass min(p,q). Amber extension = rejection probability × residual distribution. Their sum must recover p.');
      var rows=[];['A','B','C'].forEach(function(name){var row=el('div','tr-prob-row'),track=el('div','tr-prob-track'),accepted=el('span'),residual=el('span'),value=el('span');track.setAttribute('aria-hidden','true');track.append(accepted,residual);row.append(el('span','','Token '+name),track,value);body.appendChild(row);rows.push({accepted:accepted,residual:residual,value:value});});var out=status(body),p=[.6,.3,.1];
      function draw(){var q=draft.value==='Match target'?p.slice():draft.value==='Overproduce token A'?[.8,.15,.05]:[.2,.5,.3],accepted=p.map(function(x,i){return Math.min(x,q[i]);}),residual=p.map(function(x,i){return Math.max(0,x-q[i]);}),reject=residual.reduce(function(a,b){return a+b;},0);
        rows.forEach(function(row,i){row.accepted.style.width=accepted[i]*100+'%';row.residual.style.width=residual[i]*100+'%';row.value.textContent=fmt(accepted[i]+residual[i]);});out.textContent='Draft q = '+vec(q)+'\nAccepted mass = '+vec(accepted)+'\nRejection probability = '+fmt(reject)+'\n'+(reject===0?'Every proposal is accepted. No residual distribution is needed.':'Residual distribution after rejection = '+vec(residual.map(function(x){return x/reject;})))+'\nFinal distribution = '+vec(p);
      }draft.oninput=draw;draw();
    },
    targets:function(body){
      var c=controls(body),position=labelSelect(c,'Prediction position',[1,2,3,4],3),mode=labelSelect(c,'Loss mask',['All targets','Last two targets only'],'All targets');
      note(body,'Inputs and targets are already shifted. A highlighted input is visible to the selected query. “Loss” marks targets included in the objective; excluding a target does not hide its input from later queries.');
      var inputs=row(body,['BOS','the','cat','slept'],'Inputs'),targets=row(body,['the','cat','slept','EOS'],'Targets'),loss=row(body,['loss','loss','loss','loss'],'Included in the loss'),out=status(body);
      function draw(){var at=Number(position.value)-1,mask=mode.value==='All targets'?[1,1,1,1]:[0,0,1,1];inputs.forEach(function(cell,i){cell.classList.toggle('is-lit',i<=at);});targets.forEach(function(cell,i){cell.classList.toggle('is-lit',i===at);});loss.forEach(function(cell,i){cell.textContent=mask[i]?'loss':'context only';cell.classList.toggle('is-lit',Boolean(mask[i]));});out.textContent='Input at query: '+['BOS','the','cat','slept'][at]+'\nPrediction target: '+['the','cat','slept','EOS'][at]+'\nVisible input positions: 1 through '+(at+1)+'\nThis target '+(mask[at]?'contributes to':'is excluded from')+' the loss. Valid targets in the sequence: '+mask.reduce(function(a,b){return a+b;},0)+'.';}
      position.oninput=mode.oninput=draw;draw();
    },
    bpe:function(body){
      var b=buttons(body);note(body,'Apply two explicitly chosen toy BPE rules: first l + o → lo, then lo + w → low. The full article explains how corpus frequencies determine their training order.');
      var sequence=el('div');body.appendChild(sequence);var rules=row(body,['l + o → lo','lo + w → low'],'Ordered merge list'),out=status(body),step=0;
      function draw(){sequence.replaceChildren();row(sequence,[['l','o','w','e','r'],['lo','w','e','r'],['low','e','r']][step],'Current pieces');rules.forEach(function(cell,i){cell.classList.toggle('is-lit',i<step);});b.next.disabled=step===2;out.textContent=['No merges applied. Start from the initial alphabet.','First merge applied: l and o become the piece lo.','Second merge applied: lo and w become low. Remaining pieces e and r have no additional rule in this toy list.'][step];}
      b.next.onclick=function(){step=Math.min(2,step+1);draw();};b.reset.onclick=function(){step=0;draw();};draw();
    },
    patches:function(body){
      var c=controls(body),size=labelSelect(c,'Patch side in pixels',[8,16,32],16),grid=el('div','tr-patch-grid');grid.setAttribute('role','img');body.appendChild(grid);
      note(body,'A synthetic color grid illustrates patch boundaries; it is not an image processed by a trained model. The input resolution is fixed at 224 × 224. Counts below exclude a classification token.');var out=status(body);
      function draw(){var side=Number(size.value),columns=224/side,n=columns*columns;grid.style.setProperty('--patch-cols',columns);grid.replaceChildren();for(var i=0;i<n;i++)grid.appendChild(el('span','tr-patch'));grid.setAttribute('aria-label',columns+' by '+columns+' grid containing '+n+' image patches');out.textContent='Grid: '+columns+' × '+columns+'\nPatch tokens: '+n+'\nRGB values per flattened patch: '+(side*side*3)+'\nPairwise score entries per head: '+(n*n).toLocaleString('en-US')+'\nRelative to 16-pixel patches: '+fmt(n/196)+'× tokens, '+fmt(n*n/(196*196))+'× pairwise scores.';}
      size.oninput=draw;draw();
    }
  };
  article.querySelectorAll('[data-lab]').forEach(function(figure){var init=labs[figure.dataset.lab];if(!init)return;var body=figure.querySelector('.tr-lab-body');body.replaceChildren();init(body);});
})();
