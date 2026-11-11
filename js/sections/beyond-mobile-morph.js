/* SLEPZOF Beyond UI / Continuous Mobile Chapters.
   The original interactive radar leads into centered skill content.
   Every fourth scroll-stacked case card turns 45° and expands to reveal the
   NEXT chapter's original heading, stats, tools; no page-scroll hijack. */
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
let morph=null,stage=null,firstIdentity=null,portals=[],stacks=[],raf=0;
const originalRailAttrs=new WeakMap();
let active=-1;
/* The fourth card is the ACTUAL next chapter introduction, not a clone.
   The original heading/body live inside it until switching back to desktop. */
function makePortal(i){
 const panel=panels[i+1],rail=panels[i].querySelector('.sx28-carousel-rail');
 const head=panel.querySelector(':scope > .sx28-skill-head');
 const stats=panel.querySelector(':scope > .sx28-stats');
 const tools=panel.querySelector(':scope > .sx28-tools');
 if(!head||!stats||!tools||!rail)return null;
 const node=nodes()[i+1],label=node?.querySelector('span')?.textContent||'';
 // Stats remain observed by v34 even after entering the previous chapter.
 stats.dataset.sx45OwnerSkill=String(i+1);
 const previousLabelled=panel.getAttribute('aria-labelledby');
 panel.removeAttribute('aria-labelledby');
 panel.setAttribute('aria-label','Проекты навыка '+label);
 const wrapper=make('div','sx44-portal');
 wrapper.dataset.sx44Skill=String(i+1);
 wrapper.id='sx44-skill-'+(i+1);
 wrapper.setAttribute('role','region');
 wrapper.setAttribute('aria-label','Следующий навык: '+label);
 const hero=make('div','sx44-portal-hero');
 const counter=make('span','sx44-portal-counter');
 counter.textContent=String(i+1).padStart(2,'0')+' → '+String(i+2).padStart(2,'0')+' / 08';
 const art=make('div','sx44-portal-chart');
 const diagram=svg('svg',{viewBox:'0 0 400 160','aria-hidden':'true',focusable:'false'});
 const wheel=svg('g',{transform:'translate(200 261) rotate('+(-45*i)+')'});
 for(const r of [.25,.5,.75,1])wheel.append(svg('polygon',{
  points:points(186*r),fill:'none',stroke:'#353740','stroke-width':1.2
 }));
 for(let j=0;j<8;j++){
  const [x,y]=polar(j,186);
  wheel.append(svg('line',{x1:0,y1:0,x2:x.toFixed(2),y2:y.toFixed(2),
   stroke:'#26282E','stroke-width':1}));
 }
 wheel.append(svg('polygon',{points:points(186,scores),stroke:'#E0E0E6',
  'stroke-width':1.7,'stroke-linejoin':'round',fill:'#00B7FF','fill-opacity':.06}));
 for(let j=0;j<8;j++){
  const [x,y]=polar(j,186*scores[j]/10);
  wheel.append(svg('circle',{cx:x.toFixed(2),cy:y.toFixed(2),
   r:3,fill:'#E6E6E9'}));
 }
 const [fx,fy]=polar(i,186*scores[i]/10);
 const [tx,ty]=polar(i+1,186*scores[i+1]/10);
 const currentDot=svg('circle',{cx:fx.toFixed(2),cy:fy.toFixed(2),
  r:6,fill:'#00B7FF'});
 const nextDot=svg('circle',{cx:tx.toFixed(2),cy:ty.toFixed(2),
  r:6,fill:'#00B7FF',opacity:0});
 wheel.append(currentDot,nextDot);
 diagram.append(wheel);art.append(diagram);
 const identity=make('div','sx44-portal-identity');
 const icon=make('span','sx43-card-icon');
 const symbol=node?.querySelector('svg');
 if(symbol){
  const copy=symbol.cloneNode(true);
  const refs=new Map();
  copy.querySelectorAll('[id]').forEach((el,j)=>{
   const old=el.id,unique='sx44-'+i+'-'+j;
   refs.set(old,unique);el.id=unique;
  });
  copy.querySelectorAll('*').forEach(el=>{
   for(const attr of [...el.attributes]){
    let updated=attr.value;
    for(const [old,newId] of refs){
     updated=updated.split('url(#'+old+')').join('url(#'+newId+')');
     if(updated==='#'+old)updated='#'+newId;
    }
    if(updated!==attr.value)el.setAttribute(attr.name,updated);
   }
  });
  copy.setAttribute('aria-hidden','true');icon.append(copy);
 }
 const name=make('span','sx43-card-title');name.textContent=label;
 const rating=make('span','sx43-card-score');
 rating.textContent=node?.querySelector('b')?.textContent||'';
 identity.append(icon,name,rating);
 const preview=make('div','sx44-portal-preview');
 preview.setAttribute('aria-hidden','true'); // Decorative teaser, not duplicate reading content.
 preview.textContent=head.querySelector('h3')?.textContent?.replace(/\s+/g,' ').trim()||'';
 const content=make('div','sx44-portal-content');
 content.append(head,stats,tools); // Full approved chapter inside one card.
 hero.append(counter,art,identity,preview);
 wrapper.append(hero,content);
 rail.append(wrapper); // Fourth card is in the SAME scroll stack.
 panels[i].classList.add('sx45-has-portal');
 panel.classList.add('sx45-cases-only');
 return {wrapper,head,stats,tools,panel,previousLabelled,
   owner:panels[i],rail,hero,content,wheel,currentDot,nextDot,i};
}
function restoreContent(){
 panels.forEach(p=>{
  p.hidden=false;p.inert=false;
  for(const key of ['opacity','visibility','transform','height'])p.style.removeProperty(key);
  for(const cls of ['sx33-leaving','sx33-entering','sx33-entered',
   'sx37-enter-pending','sx37-enter-active'])p.classList.remove(cls);
 });
}
// A native vertical, 24px-spaced list becomes a stepped sticky stack.
// Do not intercept touch events or change the actual case cover contents.
function attachStack(panel){
 const carousel=panel.querySelector('.sx28-carousel');
 const rail=carousel?.querySelector('.sx28-carousel-rail');
 const cards=[...carousel?.querySelectorAll('a.sx28-card')||[]];
 if(!carousel||!rail||cards.length!==3)return null;
 carousel.classList.add('sx43-scroll-stack');
 originalRailAttrs.set(carousel,{
  label:rail.getAttribute('aria-label'),
  tabindex:rail.getAttribute('tabindex')
 });
 rail.setAttribute('aria-label','Кейсы навыка. Прокручивайте страницу вниз');
 rail.removeAttribute('tabindex');
 rail.scrollLeft=0;
 for(const card of cards){
  card.classList.remove('sx43-active','sx43-off');
  card.removeAttribute('aria-hidden');card.removeAttribute('tabindex');
  for(const prop of ['--sx43-depth','--sx43-card-offset',
    '--sx43-card-scale','--sx43-card-layer'])card.style.removeProperty(prop);
 }
 return carousel;
}
function detachStack(carousel){
 carousel.classList.remove('sx43-scroll-stack');
 const rail=carousel.querySelector('.sx28-carousel-rail');
 const old=originalRailAttrs.get(carousel);
 if(!rail||!old)return;
 for(const [name,value] of [['aria-label',old.label],['tabindex',old.tabindex]]){
  if(value===null)rail.removeAttribute(name);
  else rail.setAttribute(name,value);
 }
 originalRailAttrs.delete(carousel);
}
function draw(){
 raf=0;
 if(!mobile.matches||!morph)return;
 const height=innerHeight;
 const nav=innerWidth<=560?56:60;
 // Read all geometry before changing card width and hero height. This
 // avoids per-card forced reflow during scroll in Safari.
 const top=morph.getBoundingClientRect().top;
 const measurements=portals.map(portal=>({
  portal,
  y:portal.wrapper.getBoundingClientRect().top,
  railWidth:portal.rail.clientWidth||Math.max(280,innerWidth-40)
 }));
 const t=reduced.matches?1:ease((nav+8-top)/100);
 stage.style.setProperty('--sx43-morph',t.toFixed(4));
 stage.style.setProperty('--sx43-radar-shift',(98*t).toFixed(2)+'px');
 stage.style.setProperty('--sx43-radar-scale',(1+.30*t).toFixed(4));
 stage.style.setProperty('--sx43-radar-alpha','1');
 stage.style.setProperty('--sx43-identity-alpha',ease((t-.18)/.55).toFixed(3));
 stage.style.setProperty('--sx43-nodes-alpha',(1-ease((t-.08)/.58)).toFixed(3));
 stage.classList.toggle('sx43-morphed',t>.83);
 // Rotation begins on the first appearance of card four.
 // After turning 45°, its icon and a fragment of real copy appear.
 // Expansion is later; the original headline/paragraphs live in this card.
 let visible=0;
 for(const {portal,y,railWidth} of measurements){
  if(y<height*.6)visible=portal.i+1;
  if(y>height*1.35||y< -height*1.6)continue;
  const turnStart=height*1.02,turnEnd=height*.73;
  const turn=reduced.matches?(y<turnEnd?1:0):
   ease((turnStart-y)/(turnStart-turnEnd));
  const expandStart=height*.81,expandEnd=nav+24;
  const expand=reduced.matches?(y<expandEnd?1:0):
   ease((expandStart-y)/Math.max(220,expandStart-expandEnd));
  const identity=ease((turn-.14)/.65);
  const teaser=identity*(1-ease((expand-.18)/.38));
  const real=reduced.matches?1:ease((expand-.08)/.63);
  const portalWidth=railWidth+(innerWidth-railWidth)*expand;
  // At entry the portal equals a fourth full-height case cover.
  // As it becomes the next skill, the hero SHRINKS and its real text rises.
  const coverHeight=railWidth*2048/1424;
  const heroHeight=coverHeight+(270-coverHeight)*expand;
  const style=portal.wrapper.style;
  style.setProperty('--sx44-width',portalWidth.toFixed(2)+'px');
  style.setProperty('--sx44-radius',(27*(1-expand)).toFixed(2)+'px');
  style.setProperty('--sx44-border','rgba(37,38,42,'+(1-expand).toFixed(3)+')');
  style.setProperty('--sx44-shadow',(.48*(1-expand)).toFixed(3));
  style.setProperty('--sx44-hero-height',heroHeight.toFixed(2)+'px');
  style.setProperty('--sx44-identity-alpha',identity.toFixed(3));
  style.setProperty('--sx44-preview-alpha',teaser.toFixed(3));
  style.setProperty('--sx44-content-alpha',real.toFixed(3));
  style.setProperty('--sx44-content-limit',(1200*real).toFixed(2)+'px');
  style.setProperty('--sx44-content-padding',(20*expand).toFixed(2)+'px');
  style.setProperty('--sx44-expand',expand.toFixed(4));
  style.setProperty('--sx44-wheel-alpha',(1-.12*ease((expand-.32)/.54)).toFixed(3));
  portal.content.style.pointerEvents=real>.7?'auto':'none';
  portal.wheel.setAttribute('transform',
   'translate(200 261) rotate('+(-45*(portal.i+turn)).toFixed(2)+')');
  portal.currentDot.setAttribute('opacity',(1-turn).toFixed(3));
  portal.nextDot.setAttribute('opacity',turn.toFixed(3));
 }
 if(visible!==active){
  active=visible;section.dataset.sx28Active=String(visible);
  nodes().forEach((n,i)=>n.setAttribute('aria-pressed',String(i===visible)));
 }
}
const schedule=()=>{if(morph&&!raf)raf=requestAnimationFrame(draw);};
function enable(){
 if(!mobile.matches||morph)return;
 morph=make('div','sx43-morph-track');
 stage=make('div','sx43-morph-stage');
 source.classList.add('sx43-morph-radar');
 stage.append(source);
 // The first skill uses the same icon, name and score as the existing radar.
 // Nothing is rewritten or added to the approved case data.
 const firstNode=nodes()[0];
 firstIdentity=make('div','sx43-first-identity');
 const firstIcon=make('span','sx43-card-icon');
 const firstSvg=firstNode?.querySelector('svg')?.cloneNode(true);
 if(firstSvg){firstSvg.setAttribute('aria-hidden','true');firstIcon.append(firstSvg);}
 const firstLabel=make('span','sx43-card-title');
 firstLabel.textContent=firstNode?.querySelector('span')?.textContent||'';
 const firstScore=make('span','sx43-card-score');
 firstScore.textContent=firstNode?.querySelector('b')?.textContent||'';
 firstIdentity.append(firstIcon,firstLabel,firstScore);
 stage.append(firstIdentity);
 morph.append(stage);
 story.insertBefore(morph,column);
 section.classList.add('sx43-morph');
 portals=[];
 for(let i=0;i<7;i++){
  const portal=makePortal(i);
  if(portal)portals.push(portal);
 }
 document.documentElement.classList.remove('sx33-controlled-scroll');
 restoreContent();
 stacks=panels.map(attachStack).filter(Boolean);
 active=-1;schedule();requestAnimationFrame(schedule);
}
function disable(){
 if(!morph)return;
 if(raf){cancelAnimationFrame(raf);raf=0;}
 panels[0].insertBefore(source,panels[0].firstChild);
 source.classList.remove('sx43-morph-radar');
 firstIdentity?.remove();firstIdentity=null;
 morph.remove();
 for(const portal of portals){
  // Return the approved source nodes in their original order on desktop.
  const before=portal.panel.querySelector(':scope > .sx28-carousel');
  for(const el of [portal.head,portal.stats,portal.tools])
    portal.panel.insertBefore(el,before);
  delete portal.stats.dataset.sx45OwnerSkill;
  portal.owner.classList.remove('sx45-has-portal');
  portal.panel.classList.remove('sx45-cases-only');
  portal.panel.removeAttribute('aria-label');
  if(portal.previousLabelled)
    portal.panel.setAttribute('aria-labelledby',portal.previousLabelled);
  portal.wrapper.remove();
 }
 portals=[];
 stacks.forEach(detachStack);stacks=[];
 section.classList.remove('sx43-morph');morph=null;stage=null;active=-1;
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