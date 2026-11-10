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
      const cards=[...rail.querySelectorAll(".sx38-card")];
      if(!cards.length)return;
      const first=cards[0].getBoundingClientRect();
      const stops=cards.map(card=>card.getBoundingClientRect().left-first.left);
      const x=rail.scrollLeft;
      // Use real card boundaries: the supplied desktop covers have different widths.
      let target;
      if(dir>0)target=stops.find(pos=>pos>x+3);
      else target=stops.filter(pos=>pos<x-3).pop();
      if(target==null)target=dir>0?rail.scrollWidth-rail.clientWidth:0;
      rail.scrollTo({left:Math.max(0,Math.min(rail.scrollWidth-rail.clientWidth,target)),behavior:motion.matches?"auto":"smooth"});
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