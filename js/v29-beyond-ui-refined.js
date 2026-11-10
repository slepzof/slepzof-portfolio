/* SLEPZOF Beyond UI: natural scroll-driven chapters. No wheel hijacking. */
(()=>{
'use strict';
const section=document.querySelector('#beyond-ui.sx28-beyond');
if(!section)return;
const panels=[...section.querySelectorAll('.sx28-panel[data-sx28-skill]')];
const nodes=[...section.querySelectorAll('.sx28-node[data-sx28-jump]')];
const flash=section.querySelector('#sx29-flash-circle');
if(panels.length!==8||nodes.length!==8||!flash)return;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const mobile=window.matchMedia('(max-width:800px)');
const headerHeight=()=> mobile.matches ? (innerWidth<=560?56:60):64;
let active=-1, frame=0, programmed=false, navigationToken=0;
let flashFrame=0, flashX=179.102, flashY=26.8992;
const anchors=[[179.102, 26.8992], [299.159, 59.7], [340.49, 179.1], [285.382, 284.723], [179.102, 322.776], [86.5988, 272.262], [18.3693, 179.1], [67.573, 67.5711]];
function focusTo(i){
 const target=anchors[i];if(!target)return;cancelAnimationFrame(flashFrame);
 const startX=flashX,startY=flashY,t0=performance.now(),duration=640;
 const animate=(t)=>{const progress=Math.min(1,(t-t0)/duration);const eased=1-Math.pow(1-progress,3);
  flashX=startX+(target[0]-startX)*eased;flashY=startY+(target[1]-startY)*eased;
  flash.setAttribute('cx',flashX.toFixed(2));flash.setAttribute('cy',flashY.toFixed(2));
  if(progress<1)flashFrame=requestAnimationFrame(animate);
 };
 if(reduced.matches){flashX=target[0];flashY=target[1];flash.setAttribute('cx',flashX);flash.setAttribute('cy',flashY)}
 else flashFrame=requestAnimationFrame(animate);
}

const scores=[8.5,9,9,8,8,7,9,8.5];
function paint(i){
 if(i===active||i<0||i>7)return;
 active=i;
 nodes.forEach((node,j)=>node.setAttribute('aria-pressed',String(i===j)));
 focusTo(i); // Move Figma radial light between the eight skill anchors.
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
