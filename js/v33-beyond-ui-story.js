/* SLEPZOF Beyond UI v31.
   One pinned desktop storytelling stage, chapter-sized physical scroll distance,
   800ms protection against touchpad inertia after chapter changes.
   No changes to approved case text, art, or metrics. Mobile retains v30 mechanics. */
(()=>{
'use strict';
const section=document.querySelector('#beyond-ui.sx28-beyond');if(!section)return;
const intro=section.querySelector('.sx28-intro');
const story=section.querySelector('.sx28-story');
const stage=section.querySelector('.sx28-panel-column');
const radar=section.querySelector('.sx28-radar-sticky');
const panels=[...section.querySelectorAll('.sx28-panel[data-sx28-skill]')];
const nodes=[...section.querySelectorAll('.sx28-radar-sticky .sx28-node[data-sx28-jump]')];
const mobileNodes=[...section.querySelectorAll('.sx32-mobile-radar .sx28-node[data-sx28-jump]')];
const flash=section.querySelector('#sx29-flash-circle');
if(!story||!stage||!radar||!flash||panels.length!==8||nodes.length!==8)return;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const desktop=window.matchMedia('(min-width:801px)');
const anchors=[[179.102,26.8992],[299.159,59.7],[340.49,179.1],[285.382,284.723],[179.102,322.776],[86.5988,272.262],[18.3693,179.1],[67.573,67.5711]];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=x=>x*x*(3-2*x);
const headerHeight=()=>desktop.matches?64:(innerWidth<=560?56:60);
let active=-1,currentChapter=0,chapterSpan=1800,stageHeight=750,desktopReady=false;
let raf=0,lightFrame=0,lightX=anchors[0][0],lightY=anchors[0][1];
let locked=false,lockUntil=0,lockPosition=0,lockFrame=0;
let navigating=false,navigationToken=0,initialized=false;
const counted=new WeakSet(),counterTimers=new WeakMap();
const pendingReveal=new WeakSet();
const pageTop=()=>window.scrollY+story.getBoundingClientRect().top;
let mobileIndex=0,mobileBusy=false,mobileLockUntil=0,mobileSwitchToken=0,touchStartY=0,touchStartX=0;
const toggleInstantScroll=on=>document.documentElement.classList.toggle('sx33-controlled-scroll',on);
const chapterTop=i=>Math.round(pageTop()-headerHeight()-10+i*chapterSpan);
function spotlight(i){
 const goal=anchors[i];if(!goal)return;
 cancelAnimationFrame(lightFrame);
 const sx=lightX,sy=lightY,start=performance.now(),duration=660;
 const step=time=>{const v=reduced.matches?1:ease(clamp((time-start)/duration,0,1));
  lightX=sx+(goal[0]-sx)*v;lightY=sy+(goal[1]-sy)*v;
  flash.setAttribute('cx',String(lightX));flash.setAttribute('cy',String(lightY));
  if(v<1)lightFrame=requestAnimationFrame(step);
 };
 lightFrame=requestAnimationFrame(step);
}
function counter(panel){
 if(reduced.matches||!panel||counted.has(panel))return;
 const data=[...panel.querySelectorAll('.sx28-stat strong')].map(el=>{
  const original=el.textContent.trim();
  const m=original.match(/^([+−-]?)(\d[\d\s.,]*)(.*)$/u);if(!m)return null;
  const number=Number(m[2].replace(/\s/g,'').replace(',','.'));if(!Number.isFinite(number))return null;
  return {el,original,prefix:m[1],suffix:m[3],number,frac:(m[2].split(/[,.]/)[1]||'').length,spaced:/\d\s+\d/.test(m[2])};
 }).filter(Boolean);
 if(!data.length)return;counted.add(panel);const start=performance.now();
 for(const item of data)item.el.textContent=item.prefix+'0'+item.suffix;
 function tick(time){const t=clamp((time-start)/1600,0,1),v=1-Math.pow(1-t,3);
  for(const item of data){if(t>=1){item.el.textContent=item.original;continue;}
   let n=(item.number*v).toFixed(item.frac).replace('.',',');if(item.spaced)n=n.replace(/\B(?=(\d{3})+(?!\d))/g,' ');
   item.el.textContent=item.prefix+n+item.suffix;
  }if(t<1)requestAnimationFrame(tick);
 }requestAnimationFrame(tick);
}
function scheduleCount(panel){
 if(!panel||counted.has(panel)||counterTimers.has(panel))return;
 const t=setTimeout(()=>{counterTimers.delete(panel);counter(panel)},reduced.matches?0:390);
 counterTimers.set(panel,t);
}
function markActive(i,visible){
 i=clamp(i,0,7);
 const changed=active!==i;
 if(changed){
  active=i;nodes.forEach((node,j)=>node.setAttribute('aria-pressed',String(j===i)));
  section.dataset.sx28Active=String(i);spotlight(i);
  // A returning skill deserves the same staggered entrance as a new skill.
  // Reset hidden panels, never the original data or case artwork.
  panels.forEach((p,j)=>{if(j!==i)p.classList.remove('sx31-revealed');});
 }
 if(visible){
  const p=panels[i];
  if(!p.classList.contains('sx31-revealed')&&!pendingReveal.has(p)){
   pendingReveal.add(p);
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
    pendingReveal.delete(p);
    if(active===i)p.classList.add('sx31-revealed');
   }));
  }
  // On mobile wait until the figures actually enter view instead of
  // finishing the count while the user is still looking at the radar.
  if(desktopReady)scheduleCount(p);
 }
}
function panelOpacity(panel,opacity,offset){
 const visible=opacity>.005;
 panel.style.opacity=String(clamp(opacity,0,1));
 panel.style.transform=`translate3d(0,${offset.toFixed(1)}px,0)`;
 panel.style.visibility=visible?'visible':'hidden';
 const interactive=opacity>.97;
 panel.dataset.sx30Interactive=String(interactive);panel.inert=!interactive;
}
function drawChapter(i,frac,visible){
 i=clamp(i,0,7);frac=clamp(frac,0,1);
 const fadeOut=i<7&&!reduced.matches?ease(clamp((frac-.84)/.105,0,1)):0;
 const fadeIn=i<7&&!reduced.matches?ease(clamp((frac-.945)/.055,0,1)):0;
 const revealNext=fadeIn>.05;
 markActive(revealNext?i+1:i,visible);
 for(let j=0;j<8;j++){
  const p=panels[j];
  if(j!==i&&j!==i+1){panelOpacity(p,0,0);continue;}
  if(j===i){
   const excess=Math.max(0,p.scrollHeight-stage.clientHeight+12);
   const progress=ease(clamp(frac/.56,0,1));
   panelOpacity(p,1-fadeOut,-excess*progress-18*fadeOut);
  }else if(i<7)panelOpacity(p,fadeIn,22*(1-fadeIn));
 }
}
function inStory(){const r=story.getBoundingClientRect();return r.bottom>headerHeight()&&r.top<innerHeight;}
function beginLock(i){
 if(!desktopReady)return;
 currentChapter=clamp(i,0,7);locked=true;lockUntil=performance.now()+800;
 toggleInstantScroll(true);
 lockPosition=chapterTop(currentChapter);
 window.scrollTo(0,lockPosition);
 drawChapter(currentChapter,0,inStory());
 cancelAnimationFrame(lockFrame);
 function guard(now){
  if(!locked)return;
  if(Math.abs(window.scrollY-lockPosition)>1)window.scrollTo(0,lockPosition);
  if(now<lockUntil){lockFrame=requestAnimationFrame(guard);}else{
   locked=false;toggleInstantScroll(false);schedule();
  }
 }
 lockFrame=requestAnimationFrame(guard);
}
function readDesktop(){
 const r=story.getBoundingClientRect();
 const visible=r.bottom>headerHeight()&&r.top<innerHeight;
 if(!visible)return;
 const travel=clamp(-r.top+headerHeight()+10,0,8*chapterSpan);
 const position=travel/chapterSpan;
 const raw=Math.min(7,Math.floor((travel+2)/chapterSpan));
 if(!initialized){currentChapter=raw;initialized=true;}
 if(navigating)return;
 if(locked){if(Math.abs(window.scrollY-lockPosition)>1)window.scrollTo(0,lockPosition);drawChapter(currentChapter,0,visible);return;}
 if(raw!==currentChapter){
  // A single extremely fast trackpad flick can never skip a skill.
  const next=clamp(currentChapter+(raw>currentChapter?1:-1),0,7);
  beginLock(next);return;
 }
 const frac=clamp(position-currentChapter,0,1);
 drawChapter(currentChapter,frac,visible);
}
function mobileAtTop(){
 const r=story.getBoundingClientRect();return window.scrollY<=window.scrollY+r.top-headerHeight()+15;
}
function mobileAtEnd(){
 const r=panels[mobileIndex].getBoundingClientRect();
 // The final 120px is a generous reading buffer after the case arrows.
 return r.bottom<=innerHeight+54;
}
function inMobileChapter(){
 const r=story.getBoundingClientRect();
 return r.top<=headerHeight()+100&&r.bottom>headerHeight()+20;
}
function switchMobile(next){
 next=clamp(next,0,7);
 if(desktopReady||mobileBusy||next===mobileIndex)return;
 mobileBusy=true;
 toggleInstantScroll(true);
 const token=++mobileSwitchToken;
 const oldIndex=mobileIndex,oldPanel=panels[oldIndex],newPanel=panels[next];
 const fromY=window.scrollY;
 const toY=Math.max(0,pageTop()-headerHeight()-6);
 // Preserve overall page height while returning to the diagram.
 const oldHeight=oldPanel.getBoundingClientRect().height;
 stage.style.minHeight=Math.max(oldHeight,newPanel.scrollHeight)+'px';
 oldPanel.classList.add('sx33-leaving');
 const duration=reduced.matches?0:760,start=performance.now();
 let revealed=false;
 function showNew(){
  if(revealed||token!==mobileSwitchToken)return;
  revealed=true;
  oldPanel.hidden=true;oldPanel.inert=true;oldPanel.classList.remove('sx33-leaving','sx33-entered');
  mobileIndex=next;
  newPanel.hidden=false;newPanel.inert=false;newPanel.classList.add('sx33-entering');
  markActive(next,true);
  section.dataset.sx28Active=String(next);
  // Restart progress counters only when first read; never alter approved values.
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    newPanel.classList.remove('sx33-entering');newPanel.classList.add('sx33-entered');
  }));
 }
 function end(){
  if(token!==mobileSwitchToken)return;
  showNew();window.scrollTo(0,toY);
  stage.style.minHeight='';
  mobileLockUntil=performance.now()+320;
  setTimeout(()=>{if(token===mobileSwitchToken){mobileBusy=false;toggleInstantScroll(false);}},320);
 }
 if(!duration){showNew();end();return;}
 function tick(now){
  if(token!==mobileSwitchToken)return;
  const t=clamp((now-start)/duration,0,1);
  const progress=ease(t);
  window.scrollTo(0,fromY+(toY-fromY)*progress);
  if(t>.40)showNew();
  if(t<1)requestAnimationFrame(tick);else end();
 }
 requestAnimationFrame(tick);
}
function readMobile(){
 // Only one skill is in the document flow. Both its radar and copy scroll away.
 // At the end the next wheel/touch gesture returns to the new radar above.
 section.dataset.sx28Active=String(mobileIndex);
}
function readPosition(){raf=0;if(navigating)return;if(desktopReady)readDesktop();else readMobile();}
function schedule(){if(!raf)raf=requestAnimationFrame(readPosition);}
function bleedCarousels(){
 if(!desktopReady)return;
 panels.forEach(p=>{const c=p.querySelector('.sx28-carousel');if(!c)return;
  // Only the project strip bleeds to the viewport edge. Text remains 420px.
  const x=c.getBoundingClientRect().left;
  c.style.setProperty('--sx31-bleed',`${Math.max(270,Math.round(innerWidth-x-20))}px`);
  const ruler=p.querySelector('.sx28-stats');
  if(ruler)c.style.setProperty('--sx32-controls-width',`${Math.round(ruler.getBoundingClientRect().width)}px`);
 });
}
function layout(){
 const mode=desktop.matches;
 desktopReady=mode;
 if(mode){
  section.classList.add('sx30-desktop','sx31-desktop','sx33-desktop');section.classList.remove('sx33-mobile');
  stageHeight=Math.max(420,window.innerHeight-headerHeight()-20);
  // Physical scrolling of roughly two viewports per skill gives users time
  // to inspect and horizontally paginate projects before the next chapter.
  chapterSpan=Math.max(1930,Math.round(stageHeight*2.75));
  story.style.setProperty('--sx30-story-height',`${stageHeight+8*chapterSpan}px`);
  panels.forEach(p=>{p.hidden=false;p.style.visibility='hidden';p.style.opacity='0';p.style.removeProperty('width');p.dataset.sx30Interactive='false';p.inert=true;p.classList.remove('sx33-entering','sx33-entered','sx33-leaving');});
  currentChapter=clamp(Math.floor(clamp(window.scrollY-pageTop()+headerHeight()+10,0,8*chapterSpan)/chapterSpan),0,7);
  requestAnimationFrame(bleedCarousels);
 }else{
  section.classList.remove('sx30-desktop','sx31-desktop','sx33-desktop');section.classList.add('sx33-mobile');
  story.style.removeProperty('--sx30-story-height');
  panels.forEach((p,j)=>{p.style.removeProperty('opacity');p.style.removeProperty('transform');p.style.removeProperty('visibility');p.style.removeProperty('width');p.dataset.sx30Interactive='true';p.hidden=j!==mobileIndex;p.inert=j!==mobileIndex;p.querySelector('.sx28-carousel')?.style.removeProperty('--sx31-bleed');p.querySelector('.sx28-carousel')?.style.removeProperty('--sx32-controls-width');});
  section.dataset.sx28Active=String(mobileIndex);markActive(mobileIndex,true);
 }
 if(locked){locked=false;cancelAnimationFrame(lockFrame);toggleInstantScroll(false);}
 schedule();
}
function visit(i){
 if(i<0||i>=8)return;
 if(!desktopReady){
  if(i!==mobileIndex)switchMobile(i);
  else window.scrollTo({top:Math.max(0,pageTop()-headerHeight()-6),behavior:reduced.matches?'auto':'smooth'});
  return;
 }
 locked=false;cancelAnimationFrame(lockFrame);
 const token=++navigationToken;navigating=true;currentChapter=i;
 const to=chapterTop(i); // exact top of text, NEVER 10% inside the chapter
 panels.forEach((p,j)=>panelOpacity(p,j===i?1:0,0));
 markActive(i,true);
 window.scrollTo({top:to,behavior:reduced.matches?'auto':'smooth'});
 const started=performance.now();
 const check=()=>{
  if(token!==navigationToken)return;
  if(Math.abs(window.scrollY-to)<3||performance.now()-started>1450){
   navigating=false;beginLock(i);return;
  }requestAnimationFrame(check);
 };
 requestAnimationFrame(check);
}
[...nodes,...mobileNodes].forEach(node=>node.addEventListener('click',()=>visit(Number(node.dataset.sx28Jump))));
// On an in-flow mobile chapter, count the figures only when they can be seen.
if('IntersectionObserver' in window){
 const mobileCounters=new IntersectionObserver(entries=>{
  if(desktopReady)return;
  entries.forEach(e=>{if(e.isIntersecting)scheduleCount(e.target.closest('.sx28-panel'));});
 },{threshold:.3,rootMargin:'0px 0px -4% 0px'});
 panels.forEach(p=>{const stats=p.querySelector('.sx28-stats');if(stats)mobileCounters.observe(stats);});
}

// Mobile: the following intentional gesture after the end opens one new skill.
// Inertial events while travelling back to the radar are absorbed.
window.addEventListener('wheel',e=>{
 if(desktopReady||!inMobileChapter())return;
 if(mobileBusy||performance.now()<mobileLockUntil){if(e.cancelable)e.preventDefault();return;}
 if(e.deltaY>6&&mobileAtEnd()&&mobileIndex<7){if(e.cancelable)e.preventDefault();switchMobile(mobileIndex+1);}
 else if(e.deltaY<-6&&mobileAtTop()&&mobileIndex>0){if(e.cancelable)e.preventDefault();switchMobile(mobileIndex-1);}
},{passive:false,capture:true});
window.addEventListener('touchmove',e=>{
 if(desktopReady)return;
 if(mobileBusy||performance.now()<mobileLockUntil){if(e.cancelable)e.preventDefault();}
},{passive:false,capture:true});
window.addEventListener('touchstart',e=>{
 if(desktopReady||!e.touches.length)return;
 touchStartY=e.touches[0].clientY;touchStartX=e.touches[0].clientX;
},{passive:true});
window.addEventListener('touchend',e=>{
 if(desktopReady||mobileBusy||performance.now()<mobileLockUntil||!inMobileChapter())return;
 if(!e.changedTouches.length)return;
 const dy=touchStartY-e.changedTouches[0].clientY;
 const dx=touchStartX-e.changedTouches[0].clientX;
 if(Math.abs(dy)<45||Math.abs(dy)<Math.abs(dx)*1.5)return;
 if(dy>0&&mobileAtEnd()&&mobileIndex<7)switchMobile(mobileIndex+1);
 else if(dy<0&&mobileAtTop()&&mobileIndex>0)switchMobile(mobileIndex-1);
},{passive:true});
// Pause physical scroll only for the requested 800ms after a new chapter.
// Outside that brief gate Safari's native wheel/touch/keyboard scrolling remains untouched.
function stopDuringLock(e){if(!locked||!desktopReady)return;if(e.cancelable)e.preventDefault();}
window.addEventListener('wheel',stopDuringLock,{passive:false});
window.addEventListener('touchmove',stopDuringLock,{passive:false});
window.addEventListener('keydown',e=>{
 if(!locked||!desktopReady)return;
 if(['ArrowDown','ArrowUp','PageDown','PageUp',' ','Home','End'].includes(e.key)&&e.cancelable)e.preventDefault();
},{capture:true});
// Approved horizontal slider behaviour, complete card artwork unchanged.
section.querySelectorAll('.sx28-carousel').forEach(c=>{
 const rail=c.querySelector('.sx28-carousel-rail'),prev=c.querySelector('.sx28-prev'),next=c.querySelector('.sx28-next');
 const cards=[...c.querySelectorAll('.sx28-card')];if(!rail||!prev||!next||!cards.length)return;
 const maximum=()=>Math.max(0,rail.scrollWidth-rail.clientWidth);
 const offsets=()=>cards.map(el=>el.offsetLeft-cards[0].offsetLeft);
 const update=()=>{
  const moved=rail.scrollLeft>6;
  rail.classList.toggle('sx33-has-leading',moved);
  prev.disabled=rail.scrollLeft<=2;next.disabled=rail.scrollLeft>=maximum()-2;
 };
 const move=dir=>{const here=rail.scrollLeft;
  const nextOffset=dir>0?(offsets().find(v=>v>here+2)??maximum()):([...offsets()].reverse().find(v=>v<here-2)??0);
  rail.scrollTo({left:clamp(nextOffset,0,maximum()),behavior:reduced.matches?'auto':'smooth'});
 };
 prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
 rail.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
 rail.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update,{passive:true});update();
});
// Progressive entrance of the intro and spotlight diagram as they enter view.
section.classList.add('sx31-motion-ready');
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(entry.isIntersecting){
    if(entry.target===intro)section.classList.add('sx31-intro-in');
    if(entry.target===radar)section.classList.add('sx31-radar-in');
    observer.unobserve(entry.target);
   }
  });
 },{threshold:.08,rootMargin:'0px 0px -8% 0px'});
 if(intro)observer.observe(intro);observer.observe(radar);
}else{section.classList.add('sx31-intro-in','sx31-radar-in');}
let resizeFrame=0;
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(layout)},{passive:true});
layout();
})();
