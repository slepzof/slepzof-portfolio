/* SLEPZOF / market spectrum — native scroll-driven gallery and mobile deck. */
(()=>{
  "use strict";
  function init(){
    const section=document.getElementById("markets");
    if(!section||section.dataset.sx41Init)return;
    const stage=section.querySelector(".sx41-stage");
    const windowEl=section.querySelector(".sx41-window");
    const track=section.querySelector(".sx41-track");
    const deck=[...section.querySelectorAll(".sx41-deck-card")];
    const progressText=section.querySelector(".sx41-progress-text");
    const progressFill=section.querySelector(".sx41-progress-fill");
    if(!stage||!windowEl||!track||!deck.length)return;
    section.dataset.sx41Init="1";
    section.classList.add("sx41-ready");
    const mobile=window.matchMedia("(max-width: 800px)");
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
    let navHeight=64;
    let stageHeight=720;
    let runway=2100;
    let deckStep=270;
    let desktopDistance=0;
    let lastIsMobile=null;
    let raf=0;
    let lastVisible=new Set();
    function clamp(n,a,b){return Math.min(b,Math.max(a,n));}
    function loadDeckImage(i){
      if(i<0||i>=deck.length)return;
      const img=deck[i].querySelector("img[data-sx41-src]");
      if(!img||img.getAttribute("src"))return;
      img.setAttribute("src",img.dataset.sx41Src);
      img.loading="eager";
    }
    function resetDeckCard(el){
      el.style.visibility="hidden";
      el.style.opacity="0";
      el.style.transform="translate3d(0,0,0) scale(.86)";
      el.style.zIndex="0";
      el.style.willChange="auto";
    }
    function renderDeck(indexFloat){
      const index=clamp(Math.floor(indexFloat),0,deck.length-1);
      const phase=clamp(indexFloat-index,0,1);
      const visible=new Set([index,index+1,index+2].filter(i=>i<deck.length));
      for(const i of lastVisible)if(!visible.has(i))resetDeckCard(deck[i]);
      for(const i of visible)loadDeckImage(i);
      for(const i of visible){
        const el=deck[i];
        const delta=i-index;
        el.style.visibility="visible";
        el.style.willChange="transform,opacity";
        el.style.zIndex=String(40-delta);
        if(delta===0){
          el.style.opacity=String(reduced.matches?1:clamp(1-phase*1.75,0,1));
          el.style.transform=reduced.matches
            ?"translate3d(0,0,0) scale(1)"
            :"translate3d("+(-12*phase)+"px,"+(-95*phase)+"px,0) rotate("+(-9*phase)+"deg) scale("+(1-.045*phase)+")";
        }else if(delta===1){
          el.style.opacity="1";
          el.style.transform="translate3d("+(8*(1-phase))+"px,"+(12*(1-phase))+"px,0) scale("+(0.95+.05*phase)+")";
        }else{
          el.style.opacity=".96";
          el.style.transform="translate3d(13px,23px,0) scale(.89)";
        }
      }
      lastVisible=visible;
      if(progressText)progressText.textContent=String(index+1).padStart(2,"0")+" / "+String(deck.length).padStart(2,"0");
      if(progressFill)progressFill.style.width=((indexFloat+1)/deck.length*100)+"%";
    }
    function measure(){
      const nav=document.querySelector(".sx25-nav")||document.querySelector(".sx-nav");
      navHeight=nav?Math.round(nav.getBoundingClientRect().height):64;
      section.style.setProperty("--sx41-nav-height",navHeight+"px");
      stageHeight=stage.getBoundingClientRect().height;
      desktopDistance=Math.max(0,track.scrollWidth-windowEl.clientWidth+20);
      if(mobile.matches){
        deckStep=clamp(Math.round(window.innerHeight*.34),245,320);
        runway=deckStep*(deck.length-1)+260;
      }else{
        runway=Math.max(1720,desktopDistance*2.0);
      }
      section.style.height=Math.ceil(stageHeight+runway)+"px";
      if(lastIsMobile!==mobile.matches){
        lastIsMobile=mobile.matches;
        if(!mobile.matches){
          for(const i of lastVisible)resetDeckCard(deck[i]);
          lastVisible.clear();
        }
      }
      update();
    }
    function update(){
      const top=section.getBoundingClientRect().top;
      const consumed=clamp(navHeight-top,0,runway);
      if(mobile.matches){
        const value=clamp(consumed/deckStep,0,deck.length-1);
        renderDeck(value);
      }else{
        const progress=clamp(consumed/runway,0,1);
        track.style.transform="translate3d("+(-desktopDistance*progress)+"px,0,0)";
      }
    }
    function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;update();});}
    window.addEventListener("scroll",schedule,{passive:true});
    window.addEventListener("resize",()=>{
      // Ignore iOS Safari toolbar fluctuations that don't change the layout width.
      const width=document.documentElement.clientWidth;
      if(width!==section._sx41Width){section._sx41Width=width;measure();}
      else schedule();
    },{passive:true});
    if("ResizeObserver" in window){
      let oldWidth=0;
      new ResizeObserver(()=>{
        const width=windowEl.clientWidth;
        if(!mobile.matches&&Math.abs(width-oldWidth)>1){oldWidth=width;measure();}
      }).observe(windowEl);
    }
    section._sx41Width=document.documentElement.clientWidth;
    loadDeckImage(0);loadDeckImage(1);loadDeckImage(2);
    if("IntersectionObserver" in window){
      const reveal=new IntersectionObserver(entries=>{
        if(entries.some(x=>x.isIntersecting)){
          section.classList.add("sx41-visible");
          reveal.disconnect();
        }
      },{threshold:.06});
      reveal.observe(section);
    }else section.classList.add("sx41-visible");
    measure();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();