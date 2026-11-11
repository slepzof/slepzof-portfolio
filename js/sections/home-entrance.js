/* SLEPZOF homepage desktop entrance.
   Bounded duration: short minimum, never wait indefinitely for Lottie CDN. */
(()=>{
 "use strict";
 const html=document.documentElement;
 if(!html.classList.contains("sx-home-loading"))return;
 const started=window.__sxHomeStarted??performance.now();
 const reduced=matchMedia("(prefers-reduced-motion: reduce)");
 if(reduced.matches){html.classList.remove("sx-home-loading");return;}
 const lottie=document.getElementById("sx20-hero-lottie");
 let completed=false,observer;
 const finish=()=>{
  if(completed)return;
  completed=true;
  observer?.disconnect();
  setTimeout(()=>{
   html.classList.add("sx-home-entering");
   html.classList.remove("sx-home-loading");
   setTimeout(()=>{
    html.classList.remove("sx-home-entering");
    document.querySelector(".sx-home-loader")?.remove();
   },1050);
  },Math.max(0,560-(performance.now()-started)));
 };
 if(lottie&&(lottie.classList.contains("sx20-ready")||lottie.classList.contains("sx20-failed")))finish();
 else if(lottie&&"MutationObserver" in window){
  observer=new MutationObserver(()=>{
   if(lottie.classList.contains("sx20-ready")||lottie.classList.contains("sx20-failed"))finish();
  });
  observer.observe(lottie,{attributes:true,attributeFilter:["class"]});
 }
 setTimeout(finish,Math.max(0,1300-(performance.now()-started)));
 window.addEventListener("pageshow",event=>{
  if(event.persisted){html.classList.remove("sx-home-loading");finish();}
 },{once:true});
})();
