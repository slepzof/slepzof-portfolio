/* Universal S loader: the visible fill lasts 1.05s on both mobile and desktop.
   Release is time-bound and does not wait for Lottie/CDNs. */
(()=>{
 "use strict";
 const html=document.documentElement;
 if(!html.classList.contains("sx-home-loading"))return;
 const started=window.__sxHomeStarted??performance.now();
 if(matchMedia("(prefers-reduced-motion: reduce)").matches){
   html.classList.remove("sx-home-loading");
   document.querySelector(".sx-home-loader")?.remove();
   return;
 }
 let completed=false;
 let timer;
 function reveal(){
  if(completed)return;
  completed=true;
  html.classList.add("sx-home-entering");
  html.classList.remove("sx-home-loading");
  window.setTimeout(()=>{
   html.classList.remove("sx-home-entering");
   document.querySelector(".sx-home-loader")?.remove();
  },1250);
 }
 // Neutral 150ms + fill 1050ms + 200ms filled state = 1400ms.
 timer=window.setTimeout(reveal,Math.max(0,1400-(performance.now()-started)));
 window.addEventListener("pageshow",e=>{
  if(e.persisted){
   window.clearTimeout(timer);
   completed=true;
   html.classList.remove("sx-home-loading","sx-home-entering");
   document.querySelector(".sx-home-loader")?.remove();
  }
 });
})();
