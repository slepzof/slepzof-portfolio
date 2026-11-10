/* SLEPZOF Beyond UI v30: pinned desktop chapters + natural mobile scrolling.
   No wheel hijack or forced snap: touchpads, mouse wheel, keyboard and reverse scroll
   all move through the same continuous document. */
(()=>{
'use strict';
const section=document.querySelector('#beyond-ui.sx28-beyond');
if(!section)return;
const story=section.querySelector('.sx28-story');
const stage=section.querySelector('.sx28-panel-column');
const radar=section.querySelector('.sx28-radar-sticky');
const panels=[...section.querySelectorAll('.sx28-panel[data-sx28-skill]')];
const nodes=[...section.querySelectorAll('.sx28-node[data-sx28-jump]')];
const flash=section.querySelector('#sx29-flash-circle');
if(!story||!stage||!radar||!flash||panels.length!==8||nodes.length!==8)return;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const desktop=window.matchMedia('(min-width:801px)');
const anchors=[[179.102,26.8992],[299.159,59.7],[340.49,179.1],[285.382,284.723],[179.102,322.776],[86.5988,272.262],[18.3693,179.1],[67.573,67.5711]];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ease=x=>x*x*(3-2*x);
let active=-1,raf=0,lightingFrame=0,lightX=anchors[0][0],lightY=anchors[0][1];
let chapterSpan=800,stageHeight=760,desktopReady=false,lastMode=false;
let navigating=false,navigationToken=0;
const headerHeight=()=>desktop.matches?64:(innerWidth<=560?56:60);
function focusTo(i){
 const target=anchors[i];if(!target)return;cancelAnimationFrame(lightingFrame);
 const x0=lightX,y0=lightY,start=performance.now(),duration=640;
 const step=t=>{
  const v=ease(clamp((t-start)/duration,0,1));
  lightX=x0+(target[0]-x0)*v;lightY=y0+(target[1]-y0)*v;
  flash.setAttribute('cx',String(lightX));flash.setAttribute('cy',String(lightY));
  if(v<1)lightingFrame=requestAnimationFrame(step);
 };
 if(reduced.matches){lightX=target[0];lightY=target[1];flash.setAttribute('cx',String(lightX));flash.setAttribute('cy',String(lightY));}
 else lightingFrame=requestAnimationFrame(step);
}
// Keep the author-approved values/suffixes: 96+, 4,7, +31%, 3,1k, 2 793 etc.
const counted=new WeakSet();
const animated=new WeakSet();
function runCounters(panel){
 if(reduced.matches||!panel||counted.has(panel))return;
 const targets=[...panel.querySelectorAll('.sx28-stat strong')].map(el=>{
  const original=el.textContent.trim();
  const match=original.match(/^([+−-]?)(\d[\d\s.,]*)(.*)$/u);
  if(!match)return null;
  const number=match[2].replace(/\s/g,'').replace(',','.');
  const value=Number(number);
  if(!Number.isFinite(value))return null;
  const fractional=(match[2].split(/[,.]/)[1]||'').length;
  const spaced=/\d\s+\d/.test(match[2]);
  return {el,original,prefix:match[1],suffix:match[3],value,fractional,spaced};
 }).filter(Boolean);
 if(!targets.length)return;
 counted.add(panel);const begin=performance.now();
 for(const item of targets)item.el.textContent=item.prefix+'0'+item.suffix;
 const render=now=>{
  const t=clamp((now-begin)/1600,0,1),v=1-Math.pow(1-t,3);
  for(const item of targets){
   if(t===1){item.el.textContent=item.original;continue;}
   let shown=(item.value*v).toFixed(item.fractional).replace('.',',');
   if(item.spaced)shown=shown.replace(/\B(?=(\d{3})+(?!\d))/g,' ');
   item.el.textContent=item.prefix+shown+item.suffix;
  }
  if(t<1)requestAnimationFrame(render);
 };
 requestAnimationFrame(render);
}
function paint(i,visible){
 i=clamp(i,0,7);
 if(i!==active){active=i;nodes.forEach((node,j)=>node.setAttribute('aria-pressed',String(i===j)));focusTo(i);section.dataset.sx28Active=String(i);}
 if(visible)runCounters(panels[i]);
}
function layout(){
 const shouldBeDesktop=desktop.matches;
 if(shouldBeDesktop){
  section.classList.add('sx30-desktop');
  stageHeight=Math.max(440,window.innerHeight-headerHeight()-20);
  chapterSpan=Math.max(700,Math.round(stageHeight*1.12));
  story.style.setProperty('--sx30-story-height',`${stageHeight+8*chapterSpan}px`);
  panels.forEach(p=>{p.style.opacity='0';p.style.visibility='visible';p.dataset.sx30Interactive='false';p.inert=true;});
 }else{
  section.classList.remove('sx30-desktop');story.style.removeProperty('--sx30-story-height');
  panels.forEach(p=>{p.style.removeProperty('opacity');p.style.removeProperty('transform');p.style.removeProperty('visibility');p.dataset.sx30Interactive='true';p.inert=false;});
 }
 desktopReady=shouldBeDesktop;lastMode=shouldBeDesktop;
 readPosition();
}
function setPanel(panel,opacity,offset){
 const visible=opacity>0.005;
 panel.style.opacity=String(clamp(opacity,0,1));
 panel.style.transform=`translate3d(0,${offset.toFixed(2)}px,0)`;
 panel.style.visibility=visible?'visible':'hidden';
 const interactive=opacity>=0.55;
 panel.dataset.sx30Interactive=String(interactive);
 panel.inert=!interactive;
}
function readDesktop(){
 const rect=story.getBoundingClientRect();
 const travel=clamp(-rect.top+headerHeight()+10,0,8*chapterSpan);
 const position=travel/chapterSpan;
 const index=clamp(Math.floor(position),0,7);
 const frac=clamp(position-index,0,1);
 // The first 72% reveals the complete current chapter; the last 28%
 // smoothly replaces it in the SAME viewport position with the next one.
 const blend=index<7?(reduced.matches?(frac>.86?1:0):ease(clamp((frac-.72)/.28,0,1))):0;
 const visible=rect.bottom>headerHeight()&&rect.top<innerHeight;
 const mainIndex=blend>.5?index+1:index;
 paint(mainIndex,visible);
 panels.forEach((panel,j)=>{
  if(j!==index&&j!==index+1){setPanel(panel,0,0);return;}
  const contentOverflow=Math.max(0,panel.scrollHeight-stage.clientHeight+12);
  if(j===index){
   const pan=contentOverflow*ease(clamp(frac/.7,0,1));
   // Sequential translucent exit/entrance keeps competing headlines from
   // ghosting over one another in the same space while still feeling fluid.
   const outgoing=1-ease(clamp(blend/.54,0,1));
   setPanel(panel,outgoing,-pan-25*blend);
  }else if(index<7){
   const incoming=ease(clamp((blend-.46)/.54,0,1));
   setPanel(panel,incoming,28*(1-blend));
  }
 });
}
function readMobile(){
 const offset=Math.min(345,headerHeight()+radar.getBoundingClientRect().height-20);
 let nearest=0;
 for(let i=0;i<panels.length;i++)if(panels[i].getBoundingClientRect().top<=offset)nearest=i;
 const rect=story.getBoundingClientRect();
 paint(nearest,rect.bottom>0&&rect.top<innerHeight);
}
function readPosition(){raf=0;if(navigating)return;if(desktopReady)readDesktop();else readMobile();}
function schedule(){if(!raf)raf=requestAnimationFrame(readPosition);}
function visit(i){
 if(i<0||i>=panels.length)return;
 paint(i,true);
 const rect=story.getBoundingClientRect();
 const top=desktopReady
  ? window.scrollY+rect.top-headerHeight()-10+i*chapterSpan+Math.round(chapterSpan*.1)
  : window.scrollY+panels[i].getBoundingClientRect().top-(headerHeight()+radar.getBoundingClientRect().height-22);
 navigating=true;const token=++navigationToken;
 scrollTo({top,behavior:reduced.matches?'auto':'smooth'});
 const start=performance.now();
 const check=()=>{
  if(token!==navigationToken)return;
  if(Math.abs(window.scrollY-top)<4||performance.now()-start>1500){navigating=false;schedule();return;}
  requestAnimationFrame(check);
 };
 requestAnimationFrame(check);
}
nodes.forEach((node)=>node.addEventListener('click',()=>visit(Number(node.dataset.sx28Jump))));
// Native horizontal swipes & arrows, identical to the approved Featured Projects.
section.querySelectorAll('.sx28-carousel').forEach(carousel=>{
 const rail=carousel.querySelector('.sx28-carousel-rail');
 const prev=carousel.querySelector('.sx28-prev');
 const next=carousel.querySelector('.sx28-next');
 const cards=[...carousel.querySelectorAll('.sx28-card')];
 if(!rail||!prev||!next||!cards.length)return;
 const maximum=()=>Math.max(0,rail.scrollWidth-rail.clientWidth);
 const offsets=()=>cards.map(c=>c.offsetLeft-cards[0].offsetLeft);
 const update=()=>{prev.disabled=rail.scrollLeft<=2;next.disabled=rail.scrollLeft>=maximum()-2;};
 const move=dir=>{
  const here=rail.scrollLeft;
  const dest=dir>0?(offsets().find(v=>v>here+2)??maximum()):([...offsets()].reverse().find(v=>v<here-2)??0);
  rail.scrollTo({left:clamp(dest,0,maximum()),behavior:reduced.matches?'auto':'smooth'});
 };
 prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
 rail.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
 rail.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update,{passive:true});update();
});
let resizeTimer=0;
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',()=>{cancelAnimationFrame(resizeTimer);resizeTimer=requestAnimationFrame(layout)},{passive:true});
layout();
})();
