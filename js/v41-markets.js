/* SLEPZOF / market spectrum — native scroll-driven gallery and mobile deck. */
(()=>{
  "use strict";
  function init(){
    const section=document.getElementById("markets");
    if(!section||section.dataset.sx41Init)return;
    const stage=section.querySelector(".sx41-stage");
    const scene=section.querySelector(".sx41-scene");
    const windowEl=section.querySelector(".sx41-window");
    const track=section.querySelector(".sx41-track");
    const deck=[...section.querySelectorAll(".sx41-deck-card")];
    const mobileScroll=section.querySelector(".sx41-mobile-scroll");
    const mobileRunway=section.querySelector(".sx41-mobile-runway");
    const progressBar=section.querySelector(".sx41-progress-bar");
    const progressText=section.querySelector(".sx41-progress-text");
    const progressFill=section.querySelector(".sx41-progress-fill");
    if(!stage||!scene||!windowEl||!track||!deck.length||!mobileScroll||!mobileRunway)return;
    section.dataset.sx41Init="1";
    section.classList.add("sx41-ready");
    const mobile=window.matchMedia("(max-width: 800px)");
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
    let navHeight=64;
    let stageHeight=720;
    let runway=2100;
    let deckStep=270;
    let desktopDistance=0;
    let verticalDistance=0;
    let galleryLift=0;
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
            :"translate3d(0,"+(-24*phase)+"px,0) scale("+(1-.03*phase)+")";
        }else if(delta===1){
          el.style.opacity="1";
          el.style.transform="translate3d(0,"+(12*(1-phase))+"px,0) scale("+(0.96+.04*phase)+")";
        }else{
          el.style.opacity=".75";
          el.style.transform="translate3d(0,20px,0) scale(.92)";
        }
      }
      lastVisible=visible;
      if(progressText)progressText.textContent=String(index+1).padStart(2,"0")+" / "+String(deck.length).padStart(2,"0");
      if(progressFill)progressFill.style.width=((indexFloat+1)/deck.length*100)+"%";
      if(progressBar)progressBar.setAttribute("aria-valuenow",String(index+1));
    }
    function measure(){
      const nav=document.querySelector(".sx25-nav")||document.querySelector(".sx-nav");
      navHeight=nav?Math.round(nav.getBoundingClientRect().height):64;
      section.style.setProperty("--sx41-nav-height",navHeight+"px");
      stageHeight=stage.getBoundingClientRect().height;
      desktopDistance=Math.max(0,track.scrollWidth-windowEl.clientWidth);
      // Pin only the viewport, not the taller Figma scene. This prevents
      // the empty screen after the last horizontally scrolled market.
      verticalDistance=Math.max(0,scene.offsetHeight-stageHeight);
      galleryLift=Math.min(verticalDistance,Math.max(0,
        windowEl.offsetTop-Math.max(24,(stageHeight-windowEl.offsetHeight)/2)
      ));
      if(mobile.matches){
        deckStep=clamp(Math.round(window.innerHeight*.34),245,320);
        runway=deckStep*(deck.length-1)+200;
        section.style.height="auto";
        mobileRunway.style.height=Math.ceil(runway)+"px";
      }else{
        runway=Math.max(1000,desktopDistance*1.55);
        section.style.height=Math.ceil(stageHeight+runway)+"px";
        mobileRunway.style.height="";
      }
      if(lastIsMobile!==mobile.matches){
        lastIsMobile=mobile.matches;
        if(!mobile.matches){
          for(const i of lastVisible)resetDeckCard(deck[i]);
          lastVisible.clear();
        }else{
          track.style.transform="";
        }
      }
      update();
    }
    function update(){
      const top=section.getBoundingClientRect().top;
      const consumed=clamp(navHeight-top,0,runway);
      if(mobile.matches){
        // Mobile copy and footer are normal-flow content. Only the deck sticks.
        scene.style.transform="";
        const scrollTop=mobileScroll.getBoundingClientRect().top;
        const mobileConsumed=clamp(navHeight+12-scrollTop,0,runway);
        const value=clamp(mobileConsumed/deckStep,0,deck.length-1);
        renderDeck(value);
      }else{
        // Intro: 0–16%; gallery: 16–72%; final cards hold: 72–86%.
        // Only afterwards reveal the footer at 86–100%.
        const t=consumed/runway;
        const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
        const lead=ease(t/.16),slide=clamp((t-.16)/.56,0,1);
        const outro=ease((t-.86)/.14);
        const y=galleryLift*lead+(verticalDistance-galleryLift)*outro;
        track.style.transform="translate3d("+(-desktopDistance*slide)+"px,0,0)";
        scene.style.transform="translate3d(0,"+(-y)+"px,0)";
      }
    }
    function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;update();});}
    window.addEventListener("scroll",schedule,{passive:true});
    window.addEventListener("resize",()=>{
      // Ignore iOS Safari toolbar fluctuations that don't change the layout width.
      const width=document.documentElement.clientWidth;
      if(width!==section._sx41Width || (!mobile.matches&&Math.abs(window.innerHeight-section._sx41Height)>2)){
        section._sx41Width=width;section._sx41Height=window.innerHeight;measure();
      }
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
    section._sx41Height=window.innerHeight;
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