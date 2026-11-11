/* Beyond UI: Cinematic Chapters. A native-scroll, reversible mobile narrative.
   ONE interactive original full radar, seven LIGHTWEIGHT in-flow fragments. */
(()=>{
'use strict';
const section=document.querySelector('#beyond-ui.sx28-beyond');
if(!section)return;
const story=section.querySelector('.sx28-story');
const column=story?.querySelector('.sx28-panel-column');
const panels=[...section.querySelectorAll('.sx28-panel[data-sx28-skill]')];
const source=panels[0]?.querySelector(':scope > .sx32-mobile-radar');
const mobile=matchMedia('(max-width:800px)');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
if(!story||!column||!source||panels.length!==8)return;
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const scores=[8.5,9,9,8,8,7,9,8.5];
const ns='http://www.w3.org/2000/svg';
const make=(tag,cls)=>{
 const el=document.createElement(tag);if(cls)el.className=cls;return el;
};
const svgEl=(tag,attrs={})=>{
 const el=document.createElementNS(ns,tag);
 Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));
 return el;
};
const polar=(i,r)=>[r*Math.cos(-Math.PI/2+i*Math.PI/4),
                      r*Math.sin(-Math.PI/2+i*Math.PI/4)];
const points=(r,values)=>Array.from({length:8},(_,i)=>{
 const [x,y]=polar(i,r*(values?values[i]/10:1));
 return x.toFixed(2)+','+y.toFixed(2);
}).join(' ');
const nodes=()=>[...source.querySelectorAll('.sx28-node[data-sx28-jump]')];
let overview=null,chapters=[],raf=0,current=-1;
const restoreContent=()=>{
 panels.forEach(el=>{
  el.hidden=false;el.inert=false;
  for(const prop of ['opacity','visibility','transform','height'])el.style.removeProperty(prop);
  for(const cls of ['sx33-leaving','sx33-entering','sx33-entered',
    'sx37-enter-pending','sx37-enter-active'])el.classList.remove(cls);
 });
};
const createLabel=(idx,kind)=>{
 const node=nodes()[idx];
 const layer=make('div','sx42-transition-label sx42-transition-label--'+kind);
 const icon=make('span','sx42-transition-icon');
 const svg=node?.querySelector('svg');
 if(svg){const copy=svg.cloneNode(true);copy.setAttribute('aria-hidden','true');icon.append(copy);}
 const name=make('span','sx42-transition-name');
 name.textContent=node?.querySelector('span')?.textContent||'';
 const score=make('span','sx42-transition-score');
 score.textContent=node?.querySelector('b')?.textContent||'';
 layer.append(icon,name,score);
 return layer;
};
const makeChart=index=>{
 const svg=svgEl('svg',{viewBox:'0 0 400 141','aria-hidden':'true',focusable:'false'});
 const wheel=svgEl('g',{transform:'translate(200 222) rotate('+(-45*index)+')'});
 for(const r of [.25,.5,.75,1]){
  wheel.append(svgEl('polygon',{points:points(194*r),fill:'none',stroke:'#34363B','stroke-width':'1.2'}));
 }
 for(let i=0;i<8;i++){
  const [x,y]=polar(i,194);
  wheel.append(svgEl('line',{x1:0,y1:0,x2:x.toFixed(2),y2:y.toFixed(2),
    stroke:'#26282E','stroke-width':1}));
 }
 wheel.append(svgEl('polygon',{points:points(194,scores),
  fill:'rgba(0,183,255,.055)',stroke:'#E2E2E5',
  'stroke-width':2,'stroke-linejoin':'round'}));
 for(let i=0;i<8;i++){
  const [x,y]=polar(i,194*scores[i]/10);
  wheel.append(svgEl('circle',{cx:x.toFixed(2),cy:y.toFixed(2),r:3.5,fill:'#E5E5EA'}));
 }
 const blueA=svgEl('circle',{r:6.2,fill:'#00B7FF'});
 const blueB=svgEl('circle',{r:6.2,fill:'#00B7FF',opacity:0});
 for(const [dot,i] of [[blueA,index],[blueB,index+1]]){
  const [x,y]=polar(i,194*scores[i]/10);
  dot.setAttribute('cx',x.toFixed(2));dot.setAttribute('cy',y.toFixed(2));
  wheel.append(dot);
 }
 svg.append(wheel);
 return {svg,wheel,blueA,blueB};
};
const createTransition=index=>{
 const element=make('div','sx42-transition');
 element.dataset.sx42From=String(index);
 element.setAttribute('aria-hidden','true');
 const counter=make('div','sx42-transition-index');
 counter.textContent=String(index+1).padStart(2,'0')+' → '+
    String(index+2).padStart(2,'0')+' / 08';
 const meta=make('div','sx42-transition-meta');
 const from=createLabel(index,'from'),to=createLabel(index+1,'to');
 meta.append(from,to);
 const art=make('div','sx42-transition-art');
 const chart=makeChart(index);
 art.append(chart.svg);element.append(counter,meta,art);
 return {element,from,to,...chart,index};
};
const select=i=>{
 if(i===current)return;
 current=i;section.dataset.sx28Active=String(i);
 nodes().forEach((n,j)=>n.setAttribute('aria-pressed',String(i===j)));
};
const render=()=>{
 raf=0;if(!mobile.matches||!overview)return;
 const h=innerHeight;
 const bounds=story.getBoundingClientRect();
 if(bounds.bottom<0||bounds.top>h*1.5)return;
 const view=overview.getBoundingClientRect();
 const zoom=reduced.matches?0:ease((h*.78-view.bottom)/Math.max(135,h*.24));
 const shape=source.querySelector('.sx28-radar');
 if(shape){
  shape.style.setProperty('--sx42-zoom-scale',(1+.35*zoom).toFixed(4));
  shape.style.setProperty('--sx42-zoom-y',(-30*zoom).toFixed(2)+'px');
  shape.style.setProperty('--sx42-zoom-opacity',(1-.5*zoom).toFixed(4));
 }
 let visible=0;
 for(let i=1;i<panels.length;i++){
  if(panels[i].getBoundingClientRect().top<h*.56)visible=i;
 }
 select(visible);
 const begin=h*.74,travel=clamp(h*.32,180,250);
 chapters.forEach(ch=>{
  const top=ch.element.getBoundingClientRect().top;
  if(top>h+250||top< -400)return;
  let t=clamp((begin-top)/travel,0,1);
  t=reduced.matches?(t>=.5?1:0):ease(t);
  ch.wheel.setAttribute('transform',
     'translate(200 222) rotate('+(-45*(ch.index+t)).toFixed(3)+')');
  ch.from.style.opacity=(1-t).toFixed(3);
  ch.from.style.transform='translate3d(0,'+(-8*t).toFixed(2)+'px,0)';
  ch.to.style.opacity=t.toFixed(3);
  ch.to.style.transform='translate3d(0,'+(8*(1-t)).toFixed(2)+'px,0)';
  ch.blueA.setAttribute('opacity',(1-t).toFixed(3));
  ch.blueB.setAttribute('opacity',t.toFixed(3));
 });
};
const schedule=()=>{if(overview&&!raf)raf=requestAnimationFrame(render);};
const enable=()=>{
 if(overview||!mobile.matches)return;
 overview=make('div','sx42-overview');
 overview.setAttribute('aria-label','Диаграмма восьми компетенций');
 overview.append(source); // Keep original clickable radar and listeners.
 story.insertBefore(overview,column);
 chapters=[];
 for(let i=0;i<7;i++){
  const ch=createTransition(i);
  column.insertBefore(ch.element,panels[i+1]);
  chapters.push(ch);
 }
 section.classList.add('sx42-cinematic');
 document.documentElement.classList.remove('sx33-controlled-scroll');
 restoreContent();
 current=-1;select(0);schedule();
 requestAnimationFrame(schedule);
};
const disable=()=>{
 if(!overview)return;
 if(raf){cancelAnimationFrame(raf);raf=0;}
 panels[0].insertBefore(source,panels[0].firstChild);
 chapters.forEach(ch=>ch.element.remove());chapters=[];
 overview.remove();overview=null;
 section.classList.remove('sx42-cinematic');
 current=-1;
};
const checkMode=()=>{
 if(mobile.matches){
  if(!overview)enable();
  else{restoreContent();schedule();}
 }else disable();
};
let resizeRaf=0;
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',()=>{
 if(resizeRaf)cancelAnimationFrame(resizeRaf);
 resizeRaf=requestAnimationFrame(()=>{resizeRaf=0;checkMode();});
},{passive:true});
window.addEventListener('pageshow',schedule);
window.addEventListener('load',schedule,{once:true});
checkMode();
})();