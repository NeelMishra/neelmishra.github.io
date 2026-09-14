/* Tree geometry comes from the exported model; labels expose incoming mass. */
(function(){'use strict';
const NS='http://www.w3.org/2000/svg';
function el(tag,attrs,text){const node=document.createElementNS(NS,tag);Object.entries(attrs||{}).forEach(([k,v])=>node.setAttribute(k,v));if(text!==undefined)node.textContent=text;return node;}
function fmt(v){return String(Number(v.toFixed(3)));}
window.drawExplanationTree=function(svg,nodes,mass,selected){
 const leaves=nodes.filter(n=>n.left===n.right),width=Math.max(390,leaves.length*135),position={},level=125;let slot=0,depth=0;
 function layout(id,d){const n=nodes[id];depth=Math.max(depth,d);let x;if(n.left===n.right){x=width*(slot+.5)/leaves.length;slot++;}else{x=(layout(n.left,d+1)+layout(n.right,d+1))/2;}position[id]={x,y:65+d*level};return x;}
 layout(0,0);svg.setAttribute('viewBox','0 0 '+width+' '+(125+depth*level));svg.replaceChildren();
 for(const n of nodes){if(n.left===n.right)continue;for(const child of [n.left,n.right]){const a=position[n.id],b=position[child],active=(mass[String(child)]||0)>0;svg.appendChild(el('line',{x1:a.x,y1:a.y+33,x2:b.x,y2:b.y-33,class:'edge'+(active?' active':'')}));const x=a.x+(b.x-a.x)*.6,y=a.y+(b.y-a.y)*.6;svg.appendChild(el('text',{x,y:y+4,'text-anchor':'middle','font-size':18,class:'edge-label'},'w='+fmt(mass[String(child)]||0)));}}
 for(const n of nodes){const p=position[n.id],leaf=n.left===n.right,active=(mass[String(n.id)]||0)>0;svg.appendChild(el('rect',{x:p.x-58,y:p.y-34,width:116,height:68,rx:10,class:'node'+(active?' active':'')+(selected===n.id?' selected':'')}));svg.appendChild(el('text',{x:p.x,y:p.y-6,'text-anchor':'middle','font-size':21,'font-weight':700},leaf?'Score '+fmt(n.value):String.fromCharCode(65+n.feature)+' ≤ '+fmt(n.threshold)));svg.appendChild(el('text',{x:p.x,y:p.y+20,'text-anchor':'middle','font-size':18},'cover '+fmt(n.cover)));}
};
})();
