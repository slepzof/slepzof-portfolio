/* Beyond UI / mobile orbit. One original SVG, one sticky viewport,
   scroll-scrubbed zoom and clockwise progression, zero scroll hijacking.
   Approved desktop controller and case carousels stay in place. */
(()=>{
  'use strict';
  const section=document.querySelector('#beyond-ui.sx28-beyond');
  if(!section)return;
  const story=section.querySelector('.sx28-story');
  const column=story?.querySelector('.sx28-panel-column');
  const panels=[...section.querySelectorAll('.sx28-panel[data-sx28-skill]')];
  const mobile=matchMedia('(max-width:800px)');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  if(!story||!column||panels.length!==8)return;
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
  const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  const anchors=[[179.102,26.8992],[299.159,59.7],[340.49,179.1],
    [285.382,284.723],[179.102,322.776],[86.5988,272.262],
    [18.3693,179.1],[67.573,67.5711]];
  const first=panels[0].querySelector(':scope > .sx32-mobile-radar');
  if(!first)return;
  let scene=null;
  let slots=[],nodes=[],flash=null,raf=0,selected=-1;
  let labelPair=[-1,-1];
  const resetPanels=()=>{
    panels.forEach(p=>{
      p.hidden=false;
      p.inert=false;
      p.style.removeProperty('opacity');
      p.style.removeProperty('visibility');
      p.style.removeProperty('transform');
      p.classList.remove('sx33-leaving','sx33-entering','sx33-entered',
                         'sx37-enter-pending','sx37-enter-active');
    });
  };
  const fill=(slot,idx)=>{
    const node=nodes[idx];
    if(!node||!slot)return;
    const svg=node.querySelector('svg');
    if(svg){
      const cloned=svg.cloneNode(true);
      cloned.setAttribute('aria-hidden','true');
      slot.icon.replaceChildren(cloned);
    }
    slot.title.textContent=node.querySelector('span')?.textContent||'';
    slot.score.textContent=node.querySelector('b')?.textContent||'';
  };
  const choose=i=>{
    if(i===selected||!nodes.length)return;
    selected=i;
    nodes.forEach((n,j)=>n.setAttribute('aria-pressed',String(i===j)));
    section.dataset.sx28Active=String(i);
  };
  const draw=()=>{
    raf=0;
    if(!scene||!mobile.matches)return;
    const viewport=story.getBoundingClientRect();
    if(viewport.bottom<0||viewport.top>innerHeight*1.5)return;
    const nav=innerWidth<=560?56:60;
    // First view = the original full radar. Scrolling zooms into its vertex.
    const zoom=reduced.matches?
      (viewport.top<nav-35?1:0):
      ease((nav+12-viewport.top)/Math.max(160,innerHeight*.24));
    // Each upcoming panel supplies a native 45-degree clockwise transition.
    // The reading content is never hidden, snapped, or teleported.
    let orbit=0;
    const begin=innerHeight*.80,finish=innerHeight*.36;
    for(let i=1;i<panels.length;i++){
      const y=panels[i].getBoundingClientRect().top;
      const progress=clamp((begin-y)/(begin-finish),0,1);
      orbit+=reduced.matches?(progress>=.5?1:0):ease(progress);
    }
    orbit=clamp(orbit,0,7);
    const skill=clamp(Math.round(orbit),0,7);
    choose(skill);
    const a=Math.floor(orbit),b=Math.min(7,a+1),t=orbit-a;
    // Both labels stay mounted; crossfade is scrubbed by the SAME scroll
    // fraction that rotates the diagram. No instant icon/name swaps.
    if(a!==labelPair[0]){fill(slots[0],a);labelPair[0]=a;}
    if(b!==labelPair[1]){fill(slots[1],b);labelPair[1]=b;}
    if(flash){
      flash.setAttribute('cx',String(anchors[a][0]+(anchors[b][0]-anchors[a][0])*t));
      flash.setAttribute('cy',String(anchors[a][1]+(anchors[b][1]-anchors[a][1])*t));
    }
    const origin=scene.style;
    const mark=Math.round(zoom*1000)/1000;
    origin.setProperty('--sx40-zoom',String(mark));
    origin.setProperty('--sx40-meta-mix',String(t));
    origin.setProperty('--sx40-meta-y',(14*(1-mark)).toFixed(2)+'px');
    origin.setProperty('--sx40-meta-current-y',(-10*t).toFixed(2)+'px');
    origin.setProperty('--sx40-meta-next-y',(10*(1-t)).toFixed(2)+'px');
    origin.setProperty('--sx40-label-opacity',String(Math.max(0,1-mark*1.5)));
    origin.setProperty('--sx40-angle',(-45*orbit).toFixed(2)+'deg');
    origin.setProperty('--sx40-scale',(1+.85*mark).toFixed(3));
    origin.setProperty('--sx40-chart-y',(190*mark).toFixed(2)+'px');
    scene.classList.toggle('sx40-detail',mark>.74);
  };
  const schedule=()=>{
    if(!scene||raf)return;
    raf=requestAnimationFrame(draw);
  };
  function enable(){
    if(scene||!mobile.matches)return;
    // Move, do not clone, the original radar. All existing SVG masks and
    // labels keep their identity and no duplicate ids are introduced.
    scene=document.createElement('div');
    scene.className='sx40-scene';
    scene.setAttribute('aria-label','Интерактивная диаграмма навыков');
    const meta=document.createElement('div');
    meta.className='sx40-meta';
    const makeSlot=kind=>{
      const element=document.createElement('div');
      element.className='sx40-meta-layer sx40-meta-layer--'+kind;
      const i=document.createElement('span');i.className='sx40-meta-icon';
      const name=document.createElement('span');name.className='sx40-meta-title';
      const rating=document.createElement('span');rating.className='sx40-meta-score';
      element.append(i,name,rating);
      meta.append(element);
      return {icon:i,title:name,score:rating};
    };
    slots=[makeSlot('current'),makeSlot('next')];
    scene.append(first,meta);
    story.insertBefore(scene,column);
    nodes=[...first.querySelectorAll('.sx28-node[data-sx28-jump]')];
    flash=first.querySelector('[id*="sx29-flash-circle"]');
    section.classList.add('sx40-mobile-continuous');
    resetPanels();
    selected=-1;labelPair=[-1,-1];
    choose(0);
    schedule();
    requestAnimationFrame(schedule);
  }
  function disable(){
    if(!scene)return;
    if(raf){cancelAnimationFrame(raf);raf=0;}
    panels[0].insertBefore(first,panels[0].firstChild);
    scene.remove();
    scene=null;selected=-1;
    section.classList.remove('sx40-mobile-continuous');
  }
  function checkMode(){
    if(mobile.matches){
      enable();
      resetPanels();
      schedule();
    }else{
      disable();
    }
  }
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',()=>requestAnimationFrame(checkMode),{passive:true});
  window.addEventListener('pageshow',schedule);
  window.addEventListener('load',schedule,{once:true});
  checkMode();
})();
