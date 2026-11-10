/* Block 04: accessible, native horizontal scroll + non-blocking reveal. */
(()=>{
  "use strict";
  function init(){
    const section=document.getElementById("process");
    if(!section||section.dataset.sx38Init)return;
    section.dataset.sx38Init="1";
    const rail=section.querySelector(".sx38-track");
    const prev=section.querySelector(".sx38-prev");
    const next=section.querySelector(".sx38-next");
    if(!rail||!prev||!next)return;
    const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
    function update(){
      const max=Math.max(0,rail.scrollWidth-rail.clientWidth);
      const x=Math.max(0,rail.scrollLeft);
      prev.disabled=x<3;
      next.disabled=x>=max-3;
    }
    function move(dir){
      const card=rail.querySelector(".sx38-card");
      if(!card)return;
      const gap=parseFloat(getComputedStyle(rail).columnGap)||0;
      const step=card.getBoundingClientRect().width+gap;
      const x=rail.scrollLeft;
      // One complete card per click, no fractional jumps and no looping.
      rail.scrollTo({left:Math.max(0,Math.min(rail.scrollWidth-rail.clientWidth,x+step*dir)),behavior:motion.matches?"auto":"smooth"});
      window.setTimeout(update,450);
    }
    prev.addEventListener("click",()=>move(-1));
    next.addEventListener("click",()=>move(1));
    rail.addEventListener("keydown",e=>{
      if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();move(e.key==="ArrowRight"?1:-1);}
    });
    let pending=false;
    rail.addEventListener("scroll",()=>{
      if(pending)return;
      pending=true;requestAnimationFrame(()=>{pending=false;update();});
    },{passive:true});
    window.addEventListener("resize",update,{passive:true});
    if("ResizeObserver" in window){new ResizeObserver(update).observe(rail);}
    update();
    if(!motion.matches&&"IntersectionObserver" in window){
      section.classList.add("sx38-js-ready");
      const observer=new IntersectionObserver(entries=>{
        if(entries.some(e=>e.isIntersecting)){
          section.classList.add("sx38-visible");
          observer.disconnect();
        }
      },{rootMargin:"0px 0px -8% 0px",threshold:0.1});
      observer.observe(section.querySelector(".sx38-head"));
    }else{
      section.classList.add("sx38-visible");
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();