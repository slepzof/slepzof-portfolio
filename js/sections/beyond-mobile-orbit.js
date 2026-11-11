/* SLEPZOF Radar Instrument / mobile only.
   A full radar introduction becomes a compact opaque clock-like strip.
   All eight original panels scroll naturally. No scroll capture or resets. */
(()=>{
 'use strict';
 const section=document.querySelector('#beyond-ui.sx28-beyond');
 if(!section)return;
 const story=section.querySelector('.sx28-story');
 const column=story?.querySelector('.sx28-panel-column');
 const panels=[...section.querySelectorAll('.sx28-panel[data-sx28-skill]')];
 const source=panels[0]?.querySelector(':scope > .sx32-mobile-radar');
 const mobile=matchMedia('(max-width:800px)');
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 if(!story||!column||!source||panels.length!==8)return;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
 // Original chart uses <g transform="translate(80 80)"> inside a 520 viewBox.
 const points=[[179.102,26.8992],[299.159,59.7],[340.49,179.1],
  [285.382,284.723],[179.102,322.776],[86.5988,272.262],
  [18.3693,179.1],[67.573,67.5711]];
 const elems={overview:null,reading:null,stage:null,chart:null,flash:null,meta:null,step:null};
 let tiles=[],nodes=[],active=-1,pair=[-1,-1],raf=0,locked=false;
 const restorePanels=()=>{
   panels.forEach(p=>{
     p.hidden=false;p.inert=false;
     p.style.removeProperty('opacity');
     p.style.removeProperty('visibility');
     p.style.removeProperty('transform');
     p.classList.remove('sx33-leaving','sx33-entering','sx33-entered',
      'sx37-enter-pending','sx37-enter-active');
   });
 };
 const make=(tag,className)=>{
   const el=document.createElement(tag);
   if(className)el.className=className;
   return el;
 };
 const cleanSvg=svg=>{
   // Duplicate gradients/masks must NEVER share IDs with the original.
   const ids=new Map();
   svg.querySelectorAll('[id]').forEach(el=>{
     const previous=el.id,updated=previous+'-instrument';
     ids.set(previous,updated);el.id=updated;
   });
   svg.querySelectorAll('*').forEach(el=>{
     for(const attr of Array.from(el.attributes)){
       let v=attr.value;
       for(const [oldId,newId] of ids){
         v=v.split('url(#'+oldId+')').join('url(#'+newId+')');
         if(v==='#'+oldId)v='#'+newId;
       }
       if(v!==attr.value)el.setAttribute(attr.name,v);
     }
   });
   svg.setAttribute('aria-hidden','true');
   svg.removeAttribute('role');
   return svg;
 };
 const makeLabel=kind=>{
   const layer=make('div','sx40-meta-layer sx40-meta-layer--'+kind);
   const icon=make('span','sx40-meta-icon');
   const title=make('span','sx40-meta-title');
   const score=make('span','sx40-meta-score');
   layer.append(icon,title,score);
   elems.meta.append(layer);
   return {icon,title,score};
 };
 const fill=(slot,i)=>{
   const n=nodes[i];if(!slot||!n)return;
   const svg=n.querySelector('svg');
   slot.icon.replaceChildren(svg?svg.cloneNode(true):document.createTextNode(''));
   slot.icon.querySelector('svg')?.setAttribute('aria-hidden','true');
   slot.title.textContent=n.querySelector('span')?.textContent||'';
   slot.score.textContent=n.querySelector('b')?.textContent||'';
 };
 const select=i=>{
   if(i===active)return;
   active=i;
   nodes.forEach((n,j)=>n.setAttribute('aria-pressed',String(i===j)));
   section.dataset.sx28Active=String(i);
   elems.stage.setAttribute('aria-label',
      'Навык '+(i+1)+' из 8: '+(tiles[0]?.title.textContent||''));
   elems.step.textContent=String(i+1).padStart(2,'0')+' / 08';
 };
 const draw=()=>{
   raf=0;
   if(!mobile.matches||!elems.stage)return;
   const stageBox=elems.stage.getBoundingClientRect();
   const overviewBox=elems.overview.getBoundingClientRect();
   const readBox=elems.reading.getBoundingClientRect();
   if(readBox.bottom<0||overviewBox.top>innerHeight*1.3)return;
   const nav=innerWidth<=560?56:60;
   const stageHeight=stageBox.height||190;
   // Full overview zooms to the upper vertex as it leaves the viewport.
   const approach=reduce.matches?0:smooth(
     (innerHeight*.75-overviewBox.bottom)/(innerHeight*.75-(nav+stageHeight))
   );
   const hero=source.querySelector('.sx28-radar');
   if(hero){
     hero.style.setProperty('--sx40-hero-scale',(1+.26*approach).toFixed(3));
     hero.style.setProperty('--sx40-hero-y',(-26*approach).toFixed(1)+'px');
     hero.style.setProperty('--sx40-hero-opacity',(1-.92*approach).toFixed(3));
   }
   // Transition to compact strip as it rises under the fixed navigation.
   const enter=smooth(
     (innerHeight*.82-stageBox.top)/(innerHeight*.82-(nav+stageHeight))
   );
   const remain=readBox.bottom-(nav+stageHeight);
   const exit=smooth(remain/110);
   elems.stage.style.setProperty('--sx40-dock-opacity',
     String(Math.min(enter,exit).toFixed(3)));
   // Incoming skill controls clockwise rotation. Unlike the former version,
   // the panel is 190px high and is never allowed to obscure the reading area.
   const begin=innerHeight*.76;
   const end=nav+stageHeight+30;
   let orbit=0;
   for(let i=1;i<panels.length;i++){
     const y=panels[i].getBoundingClientRect().top;
     const part=clamp((begin-y)/Math.max(150,begin-end),0,1);
     orbit+=reduce.matches?(part>=.5?1:0):smooth(part);
   }
   orbit=clamp(orbit,0,7);
   const a=Math.floor(orbit),b=Math.min(7,a+1),mix=orbit-a;
   if(a!==pair[0]){fill(tiles[0],a);pair[0]=a;}
   if(b!==pair[1]){fill(tiles[1],b);pair[1]=b;}
   const chosen=clamp(Math.round(orbit),0,7);
   select(chosen);
   elems.stage.setAttribute('aria-label',
      'Навык '+(chosen+1)+' из 8: '+nodes[chosen]?.querySelector('span')?.textContent);
   if(elems.flash){
     elems.flash.setAttribute('cx',String(points[a][0]+(points[b][0]-points[a][0])*mix));
     elems.flash.setAttribute('cy',String(points[a][1]+(points[b][1]-points[a][1])*mix));
   }
   elems.stage.style.setProperty('--sx40-angle',(-45*orbit).toFixed(2)+'deg');
   elems.stage.style.setProperty('--sx40-meta-mix',String(mix.toFixed(3)));
 };
 const schedule=()=>{
   if(!elems.stage||raf)return;
   raf=requestAnimationFrame(draw);
 };
 const enable=()=>{
   if(elems.stage||!mobile.matches)return;
   const originalSvg=source.querySelector('.sx28-radar-svg');
   if(!originalSvg)return;
   // Only one full overview. A second compact graphic is created once, not
   // eight repeated radars, and is clipped to a 190px instrument panel.
   elems.overview=make('div','sx40-overview');
   elems.reading=make('div','sx40-reading');
   elems.stage=make('div','sx40-instrument');
   elems.stage.setAttribute('role','group');
   elems.stage.setAttribute('aria-label','Интерактивная диаграмма навыков');
   elems.chart=cleanSvg(originalSvg.cloneNode(true));
   elems.chart.classList.add('sx40-instrument-chart');
   elems.flash=elems.chart.querySelector('[id*="sx29-flash-circle"]');
   elems.meta=make('div','sx40-meta');
   elems.step=make('span','sx40-step');
   tiles=[makeLabel('current'),makeLabel('next')];
   elems.stage.append(elems.chart,elems.meta,elems.step);
   // Moving the FULL radar keeps its original clickable labels.
   elems.overview.append(source);
   elems.reading.append(elems.stage,column);
   story.append(elems.overview,elems.reading);
   nodes=[...source.querySelectorAll('.sx28-node[data-sx28-jump]')];
   section.classList.add('sx40-mobile-continuous');
   document.documentElement.classList.remove('sx33-controlled-scroll');
   restorePanels();
   active=-1;pair=[-1,-1];
   fill(tiles[0],0);fill(tiles[1],1);
   select(0);schedule();
   requestAnimationFrame(schedule);
 };
 const disable=()=>{
   if(!elems.stage)return;
   if(raf){cancelAnimationFrame(raf);raf=0;}
   panels[0].insertBefore(source,panels[0].firstChild);
   story.append(column);
   elems.reading.remove();elems.overview.remove();
   section.classList.remove('sx40-mobile-continuous');
   Object.keys(elems).forEach(key=>elems[key]=null);
   tiles=[];nodes=[];active=-1;pair=[-1,-1];
 };
 const updateMode=()=>{
   if(mobile.matches){
     if(!elems.stage)enable();
     else {restorePanels();schedule();}
   }else disable();
 };
 let resizeRaf=0;
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',()=>{
   if(resizeRaf)cancelAnimationFrame(resizeRaf);
   resizeRaf=requestAnimationFrame(()=>{resizeRaf=0;updateMode();});
 },{passive:true});
 window.addEventListener('pageshow',schedule);
 window.addEventListener('load',schedule,{once:true});
 updateMode();
})();
