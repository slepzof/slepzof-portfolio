/* SLEPZOF Beyond UI: natural scroll-driven chapters. No wheel hijacking. */
(()=>{
'use strict';
const section=document.querySelector('#beyond-ui.sx28-beyond');
if(!section)return;
const panels=[...section.querySelectorAll('.sx28-panel[data-sx28-skill]')];
const nodes=[...section.querySelectorAll('.sx28-node[data-sx28-jump]')];
const beam=section.querySelector('#sx28-accent-beam');
const point=section.querySelector('#sx28-accent-point');
if(panels.length!==8||nodes.length!==8||!beam||!point)return;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const mobile=window.matchMedia('(max-width:800px)');
const headerHeight=()=> mobile.matches ? (innerWidth<=560?56:60):64;
let active=-1, frame=0, programmed=false, navigationToken=0;
const scores=[8.5,9,9,8,8,7,9,8.5];
function paint(i){
 if(i===active||i<0||i>7)return;
 active=i;
 nodes.forEach((node,j)=>node.setAttribute('aria-pressed',String(i===j)));
 const theta=-Math.PI/2+i*Math.PI/4;
 const dist=scores[i]*15;
 const x=260+Math.cos(theta)*dist,y=260+Math.sin(theta)*dist;
 // Highlight the perimeter segment leading into the selected skill, as in the Figma radar.
 const previous=(i+7)%8;
 const previousTheta=-Math.PI/2+previous*Math.PI/4;
 const previousDistance=scores[previous]*15;
 beam.setAttribute('x1',(260+Math.cos(previousTheta)*previousDistance).toFixed(2));
 beam.setAttribute('y1',(260+Math.sin(previousTheta)*previousDistance).toFixed(2));
 beam.setAttribute('x2',x.toFixed(2));beam.setAttribute('y2',y.toFixed(2));
 point.setAttribute('cx',x.toFixed(2));point.setAttribute('cy',y.toFixed(2));
 section.dataset.sx28Active=String(i);
}
function readPosition(){
 frame=0;if(programmed)return;
 const offset=mobile.matches?Math.min(345,headerHeight()+section.querySelector('.sx28-radar-sticky').getBoundingClientRect().height-20):headerHeight()+100;
 // Last panel whose heading has reached the reading line is active.
 let nearest=0;
 for(let i=0;i<panels.length;i++){
  if(panels[i].getBoundingClientRect().top<=offset)nearest=i;
 }
 // Before the first panel: show the first skill.
 paint(nearest);
}
function schedule(){if(frame)return;frame=requestAnimationFrame(readPosition)}
function visit(i){
 if(i<0||i>=panels.length)return;
 paint(i);
 const head=headerHeight();
 const radarHeight=section.querySelector('.sx28-radar-sticky').getBoundingClientRect().height;
 const offset=mobile.matches?head+radarHeight-22:head+16;
 const top=window.scrollY+panels[i].getBoundingClientRect().top-offset;
 programmed=true;
 const token=++navigationToken;
 window.scrollTo({top,behavior:reduced.matches?'auto':'smooth'});
 // Highlight immediately; allow scroll tracking to resume after the target is reached.
 const check=()=>{
  if(token!==navigationToken)return;
  const d=Math.abs(panels[i].getBoundingClientRect().top-offset);
  if(d<5){programmed=false;schedule();return}
  if(performance.now()-start>1300){programmed=false;schedule();return}
  requestAnimationFrame(check);
 };
 const start=performance.now();requestAnimationFrame(check);
}
nodes.forEach(btn=>btn.addEventListener('click',()=>visit(Number(btn.dataset.sx28Jump))));
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',schedule,{passive:true});
// Native horizontal trackpad/touch scrolling per skill, with controls.
section.querySelectorAll('.sx28-carousel').forEach(carousel=>{
 const rail=carousel.querySelector('.sx28-carousel-rail');
 const prev=carousel.querySelector('.sx28-prev');
 const next=carousel.querySelector('.sx28-next');
 const cards=[...carousel.querySelectorAll('.sx28-card')];
 if(!rail||!prev||!next||!cards.length)return;
 const max=()=>Math.max(0,rail.scrollWidth-rail.clientWidth);
 const offsets=()=>cards.map(card=>card.offsetLeft-cards[0].offsetLeft);
 function update(){prev.disabled=rail.scrollLeft<=2;next.disabled=rail.scrollLeft>=max()-2}
 function move(dir){
  const candidates=offsets();const here=rail.scrollLeft;
  const destination=dir>0 ? candidates.find(v=>v>here+2)??max():[...candidates].reverse().find(v=>v<here-2)??0;
  rail.scrollTo({left:Math.min(max(),Math.max(0,destination)),behavior:reduced.matches?'auto':'smooth'});
 }
 prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
 rail.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
 rail.addEventListener('scroll',update,{passive:true});
 window.addEventListener('resize',update,{passive:true});update();
});
paint(0);schedule();
})();
