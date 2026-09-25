/* Native HTML preserves readable row IDs, OOB membership, and votes at any width. */
(function(){
  var container=document.getElementById('bag-anim');if(!container)return;
  var samples=[[1,1,3,4,4,6,7,8],[2,2,3,3,5,6,8,8],[1,2,2,4,5,5,7,7],[1,3,3,4,6,6,7,8],[2,3,4,4,5,7,8,8]];
  var votes=['A','A','B','A','A'],idx=-1,runner=null;
  var sampleList=document.getElementById('bag-sample-chips'),oobChips=Array.prototype.slice.call(document.querySelectorAll('#bag-oob-chips li')),tokens=Array.prototype.slice.call(document.querySelectorAll('#bag-votes b'));
  function draw(){
    var sample=idx<0?[]:samples[idx],counts={},missing=[],a=0,b=0;
    sample.forEach(function(row){counts[row]=(counts[row]||0)+1;});
    while(sampleList.firstChild)sampleList.removeChild(sampleList.firstChild);
    for(var i=0;i<8;i++){
      var chip=document.createElement('li'),value=document.createElement('strong');chip.className='bag-chip';value.textContent=idx<0?'—':String(sample[i]);chip.appendChild(value);chip.setAttribute('aria-label',idx<0?'Draw '+(i+1)+' pending':'Draw '+(i+1)+': row '+sample[i]);sampleList.appendChild(chip);
    }
    oobChips.forEach(function(chip){
      var row=Number(chip.dataset.row),absent=idx>=0&&!counts[row];chip.dataset.oob=String(absent);chip.querySelector('span').textContent=idx<0?'—':absent?'OOB':'In';chip.setAttribute('aria-label','Row '+row+': '+(idx<0?'no sample yet':absent?'out of bag':'used in this sample'));if(absent)missing.push(row);
    });
    tokens.forEach(function(token,i){var vote=i<=idx?votes[i]:'';token.dataset.vote=vote;token.textContent=vote||'—';token.parentElement.setAttribute('aria-label','Tree '+(i+1)+': '+(vote?'vote '+vote:'pending'));if(vote==='A')a++;if(vote==='B')b++;});
    var total=a+b,repeats=Object.keys(counts).filter(function(row){return counts[row]>1;}).map(function(row){return 'row '+row+' × '+counts[row];});
    document.getElementById('bag-sample-heading').textContent=idx<0?'Bootstrap sample: ready':'Tree '+(idx+1)+' bootstrap sample';
    document.getElementById('bag-repeats').textContent=idx<0?'Step to reveal the first sample.':'Repeated draws: '+(repeats.length?repeats.join('; '):'none')+'.';
    document.getElementById('bag-oob-summary').textContent=idx<0?'OOB membership is determined separately for each tree.':'OOB for tree '+(idx+1)+': rows '+missing.join(', ')+'.';
    document.getElementById('bag-current-vote').textContent=idx<0?'No trees have voted yet.':'Tree '+(idx+1)+' contributes vote '+votes[idx]+'. Each tree gets one vote, regardless of which rows it sampled.';
    document.getElementById('bag-tally-a').style.width=(total?100*a/total:0)+'%';document.getElementById('bag-tally-b').style.width=(total?100*b/total:0)+'%';
    document.getElementById('bag-tally-bar').setAttribute('aria-label',a+' votes for A and '+b+' votes for B');
    document.getElementById('bag-tally-count').textContent='A: '+a+' '+(a===1?'vote':'votes')+' · B: '+b+' '+(b===1?'vote':'votes');
    document.getElementById('bag-info').textContent=idx<0?'Ready: five fixed samples and illustrative tree votes.':'Tree '+(idx+1)+' of 5: 8 draws, '+Object.keys(counts).length+' distinct rows, '+missing.length+' OOB rows.';
    document.getElementById('bag-output').textContent=idx===4?'Majority vote: A (4 vs 1)':idx<0?'':'Votes counted: '+total+' of 5';
    container.dataset.stage=String(idx);
  }
  function step(){if(idx<4){idx++;draw();}}
  function reset(){if(runner){runner.cancel();runner=null;}idx=-1;draw();}
  draw();
  document.getElementById('bag-step').addEventListener('click',function(){if(runner){runner.cancel();runner=null;}step();});
  document.getElementById('bag-reset').addEventListener('click',reset);
  document.getElementById('bag-play').addEventListener('click',function(){
    if(runner){runner.cancel();runner=null;}if(idx===4){idx=-1;draw();}
    var steps=[];for(var k=idx;k<4;k++)steps.push(step);
    runner=window.animRunner(steps,1100,function(){runner=null;});
  });
  document.getElementById('bag-controls').hidden=false;
})();
