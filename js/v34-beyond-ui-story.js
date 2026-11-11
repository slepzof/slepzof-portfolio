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
// Mobile chapters are managed by the cinematic module.
const toggleInstantScroll=on=>document.documentElement.classList.toggle('sx33-controlled-scroll',on);
const continuousMobile=()=>section.classList.contains('sx43-morph');
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
// Mobile uses normal document flow; only explicit point clicks scroll to a skill.
function readMobile(){ /* No fullscreen mobile transitions. */ }
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
  panels.forEach(p=>{p.style.removeProperty('opacity');p.style.removeProperty('transform');p.style.removeProperty('visibility');p.style.removeProperty('width');p.dataset.sx30Interactive='true';p.hidden=false;p.inert=false;p.querySelector('.sx28-carousel')?.style.removeProperty('--sx31-bleed');p.querySelector('.sx28-carousel')?.style.removeProperty('--sx32-controls-width');});
  section.dataset.sx28Active=section.dataset.sx28Active||'0';
 }
 if(locked){locked=false;cancelAnimationFrame(lockFrame);toggleInstantScroll(false);}
 schedule();
}
function visit(i){
 if(i<0||i>=8)return;
 if(!desktopReady){
  // Only deliberate taps on a radar point may scroll to another chapter.
  const target=section.querySelector('.sx44-portal[data-sx44-skill="'+i+'"]')||panels[i];
  const rect=target.getBoundingClientRect();
  window.scrollTo({top:Math.max(0,window.scrollY+rect.top-headerHeight()-22),
    behavior:reduced.matches?'auto':'smooth'});
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
  entries.forEach(e=>{
   if(!e.isIntersecting)return;
   const owner=e.target.dataset.sx45OwnerSkill;
   scheduleCount(owner!==undefined?panels[Number(owner)]:e.target.closest('.sx28-panel'));
  });
 },{threshold:.3,rootMargin:'0px 0px -4% 0px'});
 panels.forEach(p=>{const stats=p.querySelector('.sx28-stats');if(stats)mobileCounters.observe(stats);});
}

// Native mobile wheel and touch events are never intercepted.
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
 // Card snap positions are offset by the rail's own left padding. In v33 the
 // reverse arrow compared raw offsets (0, 287...) to scrollLeft (4, 291...),
 // so it repeatedly snapped back to the *same* second card.
 const maximum=()=>Math.max(0,rail.scrollWidth-rail.clientWidth);
 const firstPosition=()=>parseFloat(getComputedStyle(rail).paddingLeft)||0;
 const snapPositions=()=>{
  const first=cards[0].offsetLeft, pad=firstPosition(), max=maximum();
  return cards.map(el=>clamp(el.offsetLeft-first+pad,0,max));
 };
 const closestIndex=(positions,x)=>positions.reduce((best,p,i)=>
   Math.abs(p-x)<Math.abs(positions[best]-x)?i:best,0);
 let committedIndex=null, committedAt=0;
 const update=()=>{
  if(c.classList.contains('sx43-scroll-stack'))return;
  const here=rail.scrollLeft, positions=snapPositions(), lo=positions[0], hi=positions[positions.length-1];
  rail.classList.toggle('sx33-has-leading',here>lo+7);
  prev.disabled=here<=lo+7;
  next.disabled=here>=hi-7;
 };
 const move=dir=>{
  // A mobile vertical stack has no horizontal carousel navigation.
  if(c.classList.contains('sx43-scroll-stack'))return;
  const positions=snapPositions(), here=rail.scrollLeft;
  // Consecutive fast clicks advance independently of an ongoing smooth scroll.
  const index=(committedIndex!==null&&performance.now()-committedAt<500)
   ?committedIndex:closestIndex(positions,here);
  const nextIndex=clamp(index+dir,0,cards.length-1);
  committedIndex=nextIndex;committedAt=performance.now();
  rail.scrollTo({left:positions[nextIndex],behavior:reduced.matches?'auto':'smooth'});
  // Disable boundary arrows immediately, not only after scroll settles.
  if(nextIndex===0)prev.disabled=true;
  if(nextIndex===cards.length-1)next.disabled=true;
 };
 prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
 rail.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
 rail.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update,{passive:true});
 // Mobile has one visible skill at a time. Recalculate the controls when a
 // previously hidden chapter becomes visible (its scrollWidth was zero).
 const owner=c.closest('.sx28-panel');
 if(owner&&'MutationObserver' in window){
  const observer=new MutationObserver(()=>requestAnimationFrame(update));
  observer.observe(owner,{attributes:true,attributeFilter:['hidden']});
 }
 update();
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
