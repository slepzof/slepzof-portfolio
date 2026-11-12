/* SLEPZOF Featured projects: reliable arrows, native scroll and Safari fallback. */
(()=>{
 "use strict";
 function bindRail(rail,prev,next,cards){
  if(!rail||!prev||!next||!cards.length||rail.dataset.sxFeaturedBound)return;
  rail.dataset.sxFeaturedBound="1";
  // Shared, byte-for-byte Featured carousel movement algorithm: same Safari
  // fallback, scroll positions, disabled states and arrow button behavior.
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const desktop=matchMedia("(min-width:801px)");
  const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
  const maximum=()=>Math.max(0,rail.scrollWidth-rail.clientWidth);
  const positions=()=>{
   const first=cards[0].getBoundingClientRect().left;
   const max=maximum();
   // Differences between card positions are already scroll-independent.
   // Do not add scrollLeft twice or Safari skips cards on subsequent clicks.
   return cards.map(c=>clamp(Math.round(c.getBoundingClientRect().left-first),0,max));
  };
  const controls=prev.closest(".sx25b3-controls");
  const update=()=>{
   const max=maximum(),x=rail.scrollLeft;
   // Hide inert arrows when all cards fit (e.g. 3 x 356 + 2 x 24).
   if(controls)controls.hidden=max<=2;
   prev.disabled=max<=2||x<=2;
   next.disabled=max<=2||x>=max-2;
  };
  let committed=null,lastClick=0;
  const move=dir=>{
   const pts=positions(),x=rail.scrollLeft,max=maximum();
   if(!max||!pts.length)return;
   let target;
   if(desktop.matches){
    const nearest=pts.reduce((best,p,i)=>Math.abs(p-x)<Math.abs(pts[best]-x)?i:best,0);
    const base=committed!==null&&performance.now()-lastClick<650?committed:nearest;
    committed=clamp(base+dir,0,pts.length-1);
    lastClick=performance.now();
    target=pts[committed];
   }else{
    committed=null;
    target=dir>0?(pts.find(p=>p>x+2)??max):([...pts].reverse().find(p=>p<x-2)??0);
   }
   target=clamp(target,0,max);
   if(Math.abs(target-x)<1)return;
   try{rail.scrollTo({left:target,behavior:reduced.matches?"auto":"smooth"});}
   catch(_){rail.scrollLeft=target;}
   if(desktop.matches)window.setTimeout(()=>{
    if(Math.abs(rail.scrollLeft-x)<2&&Math.abs(target-x)>3){
     rail.style.scrollBehavior="auto";
     rail.scrollLeft=target;
     requestAnimationFrame(()=>rail.style.removeProperty("scroll-behavior"));
    }
    update();
   },140);
  };
  prev.addEventListener("click",e=>{e.preventDefault();move(-1)});
  next.addEventListener("click",e=>{e.preventDefault();move(1)});
  rail.addEventListener("keydown",e=>{
   if(e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return;
   e.preventDefault();move(e.key==="ArrowRight"?1:-1);
  });
  let raf=0;
  rail.addEventListener("scroll",()=>{
   if(raf)return;
   raf=requestAnimationFrame(()=>{raf=0;update();});
  },{passive:true});
  window.addEventListener("resize",()=>{committed=null;update()},{passive:true});
  if("ResizeObserver" in window){
   const resize=new ResizeObserver(()=>{committed=null;update()});
   resize.observe(rail);
   if(cards[0])resize.observe(cards[0]);
  }
  // Safari may restore an old inner scroll offset on a new navigation.
  // Keep history/back-forward restoration intact, but start new visits at the
  // first approved project so the carousel aligns with the section grid.
  const nav=performance.getEntriesByType("navigation")[0];
  if(nav?.type==="navigate"){
   const reset=()=>{
    rail.style.scrollBehavior="auto";
    rail.scrollLeft=0;
    requestAnimationFrame(()=>{rail.style.removeProperty("scroll-behavior");update();});
   };
   reset();
   window.addEventListener("pageshow",e=>{if(!e.persisted)reset()},{once:true});
  }
  document.fonts?.ready?.then(update).catch(()=>{});
  update();
 }
 function init(){
  const section=document.querySelector("#selected.sx25b3-slider");
  if(section){
   bindRail(section.querySelector("#sx25b3-rail"),
    section.querySelector(".sx25b3-prev"),
    section.querySelector(".sx25b3-next"),
    [...section.querySelectorAll(".sx25b3-card")]);
  }
  // The work timeline uses the exact same controls & algorithm, rather than
  // separately maintaining divergent carousel movement and disabled states.
  for(const period of document.querySelectorAll("#experience.sx42-ready .sx42-period")){
   const rail=period.querySelector(".sx42-rail");
   bindRail(rail,
    period.querySelector(".sx42-featured-controls .sx25b3-prev"),
    period.querySelector(".sx42-featured-controls .sx25b3-next"),
    [...(rail?.querySelectorAll(".sx42-card")||[])]);
  }
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
 else init();
})();
