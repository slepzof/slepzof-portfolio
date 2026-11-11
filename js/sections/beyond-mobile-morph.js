/* SLEPZOF Beyond UI / Radar Morph, mobile only.
   Original radar => focus card, centered content, 3-card swipe deck,
   scroll-scrubbed 45° next-skill transition. No global scroll hijack. */
(()=>{
'use strict';
const section=document.querySelector('#beyond-ui.sx28-beyond');
const story=section?.querySelector('.sx28-story');
const column=story?.querySelector('.sx28-panel-column');
const panels=[...section?.querySelectorAll('.sx28-panel[data-sx28-skill]')||[]];
const source=panels[0]?.querySelector(':scope > .sx32-mobile-radar');
if(!story||!column||!source||panels.length!==8)return;
const mobile=matchMedia('(max-width:800px)');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
const ns='http://www.w3.org/2000/svg';
const make=(tag,cls)=>{const el=document.createElement(tag);if(cls)el.className=cls;return el;};
const svg=(tag,attrs={})=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
const scores=[8.5,9,9,8,8,7,9,8.5];
const polar=(i,r)=>[r*Math.cos(i*Math.PI/4-Math.PI/2),r*Math.sin(i*Math.PI/4-Math.PI/2)];
const points=(r,vals)=>Array.from({length:8},(_,i)=>{
 const [x,y]=polar(i,r*(vals?vals[i]/10:1));return x.toFixed(2)+','+y.toFixed(2);
}).join(' ');
const nodes=()=>[...source.querySelectorAll('.sx28-node[data-sx28-jump]')];
let morph=null,stage=null,focus=null,transitions=[],decks=[],raf=0;
let active=-1;
function cardFor(i,cls){
 const sourceNode=nodes()[i];
 const card=make('div',cls);
 const icon=make('span','sx43-card-icon');
 const original=sourceNode?.querySelector('svg');
 if(original){const clone=original.cloneNode(true);clone.setAttribute('aria-hidden','true');icon.append(clone);}
 const title=make('span','sx43-card-title');title.textContent=sourceNode?.querySelector('span')?.textContent||'';
 const score=make('span','sx43-card-score');score.textContent=sourceNode?.querySelector('b')?.textContent||'';
 card.append(icon,title,score);
 card.setAttribute('aria-hidden','true');
 return card;
}
function makeTransition(i){
 const wrap=make('div','sx43-transition');
 wrap.dataset.sx43From=String(i);
 wrap.setAttribute('aria-hidden','true');
 const counter=make('span','sx43-transition-counter');
 counter.textContent=String(i+1).padStart(2,'0')+' → '+String(i+2).padStart(2,'0')+' / 08';
 const art=make('div','sx43-transition-wheel');
 const chart=svg('svg',{viewBox:'0 0 400 150','aria-hidden':'true',focusable:false});
 const group=svg('g',{transform:'translate(200 208) rotate('+(-45*i)+')',class:'sx43-turn-group'});
 for(const r of [.25,.5,.75,1])group.append(svg('polygon',{
  points:points(190*r),fill:'none',stroke:'#383A42','stroke-width':1.25}));
 for(let j=0;j<8;j++){
  const [x,y]=polar(j,190);group.append(svg('line',{
   x1:0,y1:0,x2:x.toFixed(2),y2:y.toFixed(2),stroke:'#292A30','stroke-width':1}));
 }
 group.append(svg('polygon',{
  points:points(190,scores),stroke:'#E6E6EA',fill:'#00B7FF',
  'fill-opacity':.045,'stroke-width':2,'stroke-linejoin':'round'}));
 for(let j=0;j<8;j++){
  const [x,y]=polar(j,190*scores[j]/10);
  group.append(svg('circle',{cx:x.toFixed(2),cy:y.toFixed(2),r:j===i?5:3.1,
   fill:j===i?'#00B7FF':'#DCDCE1'}));
 }
 chart.append(group);art.append(chart);
 const next=cardFor(i+1,'sx43-next-card');
 wrap.append(counter,art,next);
 return {wrap,group,i};
}
function restoreContent(){
 panels.forEach(p=>{
  p.hidden=false;p.inert=false;
  for(const key of ['opacity','visibility','transform','height'])p.style.removeProperty(key);
  for(const cls of ['sx33-leaving','sx33-entering','sx33-entered',
   'sx37-enter-pending','sx37-enter-active'])p.classList.remove(cls);
 });
}
function attachDeck(panel){
 const carousel=panel.querySelector('.sx28-carousel');
 const rail=carousel?.querySelector('.sx28-carousel-rail');
 const cards=[...carousel?.querySelectorAll('a.sx28-card')||[]];
 const controls=carousel?.querySelector('.sx28-carousel-controls');
 const prev=controls?.querySelector('.sx28-prev');
 const next=controls?.querySelector('.sx28-next');
 if(!rail||cards.length!==3||!prev||!next)return null;
 const count=make('span','sx43-deck-count');
 controls.prepend(count);
 carousel.classList.add('sx43-mobile-deck');
 let index=0,start=null,suppressUntil=0;
 const render=()=>{
  count.textContent=String(index+1).padStart(2,'0')+' / 03';
  cards.forEach((card,i)=>{
   const depth=i-index;
   const visible=depth>=0&&depth<3;
   card.classList.toggle('sx43-active',depth===0);
   card.classList.toggle('sx43-off',!visible);
   card.style.setProperty('--sx43-depth',String(clamp(depth,0,2)));
   card.style.setProperty('--sx43-card-offset',(40-18*clamp(depth,0,2))+'px');
   card.style.setProperty('--sx43-card-scale',String(1-.04*clamp(depth,0,2)));
   card.style.setProperty('--sx43-card-layer',String(5-clamp(depth,0,2)));
   card.tabIndex=depth===0?0:-1;
   if(depth===0)card.removeAttribute('aria-hidden');
   else card.setAttribute('aria-hidden','true');
  });
  prev.disabled=index===0;next.disabled=index===cards.length-1;
 };
 const step=d=>{index=clamp(index+d,0,cards.length-1);render();};
 // Existing desktop listeners short-circuit while the deck class is present.
 prev.addEventListener('click',()=>step(-1));
 next.addEventListener('click',()=>step(1));
 rail.addEventListener('touchstart',e=>{
  if(e.touches.length!==1)return;
  start={x:e.touches[0].clientX,y:e.touches[0].clientY};
 },{passive:true});
 rail.addEventListener('touchend',e=>{
  if(!start||!e.changedTouches.length)return;
  const dx=e.changedTouches[0].clientX-start.x;
  const dy=e.changedTouches[0].clientY-start.y;
  start=null;
  if(Math.abs(dx)>44&&Math.abs(dx)>Math.abs(dy)*1.25){
   step(dx<0?1:-1);suppressUntil=Date.now()+450;
  }
 },{passive:true});
 rail.addEventListener('touchcancel',()=>{start=null},{passive:true});
 rail.addEventListener('click',e=>{
  if(Date.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}
 },true);
 rail.addEventListener('keydown',e=>{
  if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
  e.preventDefault();e.stopImmediatePropagation();step(e.key==='ArrowRight'?1:-1);
 },true);
 render();
 return {carousel,cards,count,prev,next,render};
}
function detachDeck(d){
 const {carousel,cards,count}=d;
 carousel.classList.remove('sx43-mobile-deck');
 count.remove();
 cards.forEach(card=>{
  card.classList.remove('sx43-active','sx43-off');
  card.style.removeProperty('--sx43-depth');
  card.style.removeProperty('--sx43-card-offset');
  card.style.removeProperty('--sx43-card-scale');
  card.style.removeProperty('--sx43-card-layer');
  card.removeAttribute('aria-hidden');card.removeAttribute('tabindex');
 });
}
function draw(){
 raf=0;
 if(!mobile.matches||!morph)return;
 const height=innerHeight;
 const nav=innerWidth<=560?56:60;
 const top=morph.getBoundingClientRect().top;
 const t=reduced.matches?1:ease((nav+8-top)/220);
 stage.style.setProperty('--sx43-morph',t.toFixed(4));
 stage.style.setProperty('--sx43-radar-shift',(-42*t).toFixed(2)+'px');
 stage.style.setProperty('--sx43-radar-scale',(1+.48*t).toFixed(4));
 stage.style.setProperty('--sx43-focus-alpha',ease((t-.29)/.64).toFixed(4));
 stage.style.setProperty('--sx43-focus-scale',(.8+.2*t).toFixed(4));
 stage.style.setProperty('--sx43-focus-y',(25*(1-t)).toFixed(2)+'px');
 stage.classList.toggle('sx43-morphed',t>.83);
 // Small clock turns occur in the document flow, not over reading content.
 let visible=0;
 for(let i=1;i<panels.length;i++){
  if(panels[i].getBoundingClientRect().top<height*.62)visible=i;
 }
 if(visible!==active){
  active=visible;section.dataset.sx28Active=String(visible);
  nodes().forEach((n,i)=>n.setAttribute('aria-pressed',String(i===visible)));
 }
 transitions.forEach(ch=>{
  const y=ch.wrap.getBoundingClientRect().top;
  if(y>height+300||y< -290)return;
  const span=clamp(height*.33,165,245);
  let p=clamp((height*.80-y)/span,0,1);
  p=reduced.matches?(p>.5?1:0):ease(p);
  ch.wrap.style.setProperty('--sx43-turn',p.toFixed(3));
  ch.wrap.style.setProperty('--sx43-next-scale',(.84+.16*p).toFixed(4));
  ch.group.setAttribute('transform',
   'translate(200 208) rotate('+(-45*(ch.i+p)).toFixed(2)+')');
 });
}
const schedule=()=>{if(morph&&!raf)raf=requestAnimationFrame(draw);};
function enable(){
 if(!mobile.matches||morph)return;
 morph=make('div','sx43-morph-track');
 stage=make('div','sx43-morph-stage');
 source.classList.add('sx43-morph-radar');
 focus=cardFor(0,'sx43-focus-card');
 stage.append(source,focus);morph.append(stage);
 story.insertBefore(morph,column);
 transitions=[];
 for(let i=0;i<7;i++){
  const ch=makeTransition(i);
  column.insertBefore(ch.wrap,panels[i+1]);transitions.push(ch);
 }
 section.classList.add('sx43-morph');
 document.documentElement.classList.remove('sx33-controlled-scroll');
 restoreContent();
 decks=panels.map(attachDeck).filter(Boolean);
 active=-1;schedule();requestAnimationFrame(schedule);
}
function disable(){
 if(!morph)return;
 if(raf){cancelAnimationFrame(raf);raf=0;}
 panels[0].insertBefore(source,panels[0].firstChild);
 source.classList.remove('sx43-morph-radar');
 focus.remove();morph.remove();
 transitions.forEach(ch=>ch.wrap.remove());transitions=[];
 decks.forEach(detachDeck);decks=[];
 section.classList.remove('sx43-morph');morph=null;stage=null;focus=null;active=-1;
}
function updateMode(){
 if(mobile.matches){if(!morph)enable();else{restoreContent();schedule();}}
 else disable();
}
let resizeRaf=0;
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',()=>{
 if(resizeRaf)cancelAnimationFrame(resizeRaf);
 resizeRaf=requestAnimationFrame(()=>{resizeRaf=0;updateMode();});
},{passive:true});
addEventListener('pageshow',schedule);
addEventListener('load',schedule,{once:true});
updateMode();
})();