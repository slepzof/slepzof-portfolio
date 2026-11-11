/* SLEPZOF first-paint loader.
   Wait for the actual decoded hero fallback, not the Lottie JSON/CDN.
   Minimum dwell preserves the approved S fill; hard cap avoids trapped visitors. */
(()=>{
 "use strict";
 const html=document.documentElement;
 if(!html.classList.contains("sx-home-loading"))return;
 const started=window.__sxHomeStarted??performance.now();
 const fallback=document.querySelector("#sx20-hero-lottie .sx20-static-fallback");
 const MIN_DWELL=1200,MAX_WAIT=2800;
 let completed=false,decoded=false;
 let releaseTimer=0,deadline=0;
 const announce=()=>{
   window.__sxHeroVisible=true;
   window.dispatchEvent(new Event("sx:hero-revealed"));
 };
 const finish=()=>{
   if(completed)return;
   completed=true;
   clearTimeout(releaseTimer);
   clearTimeout(deadline);
   html.classList.add("sx-home-entering");
   html.classList.remove("sx-home-loading");
   announce();
   window.setTimeout(()=>{
     html.classList.remove("sx-home-entering");
     document.querySelector(".sx-home-loader")?.remove();
   },380);
 };
 const revealWhenReady=()=>{
   if(!decoded||completed)return;
   const elapsed=performance.now()-started;
   clearTimeout(releaseTimer);
   releaseTimer=window.setTimeout(()=>{
     // Give the decoded still frame an opportunity to paint before removing S.
     requestAnimationFrame(()=>requestAnimationFrame(finish));
   },Math.max(0,MIN_DWELL-elapsed));
 };
 const ready=()=>{
   if(completed)return;
   decoded=true;
   revealWhenReady();
 };
 if(matchMedia("(prefers-reduced-motion: reduce)").matches){
   html.classList.remove("sx-home-loading");
   document.querySelector(".sx-home-loader")?.remove();
   announce();
   return;
 }
 // Always leave the website usable, even when an image request fails or hangs.
 deadline=window.setTimeout(()=>{
   if(!decoded)html.classList.add("sx-home-still-fallback");
   finish();
 },Math.max(0,MAX_WAIT-(performance.now()-started)));
 if(!fallback){
   ready(); // Text + reserved hero area are still a valid first screen.
 }else{
   fallback.addEventListener("load",()=>{
     if(typeof fallback.decode==="function")fallback.decode().then(ready,ready);
     else ready();
   },{once:true});
   fallback.addEventListener("error",ready,{once:true});
   if(fallback.complete){
     if(typeof fallback.decode==="function")fallback.decode().then(ready,ready);
     else ready();
   }
 }
 window.addEventListener("pageshow",e=>{
   if(!e.persisted)return;
   clearTimeout(deadline);
   clearTimeout(releaseTimer);
   completed=true;
   html.classList.remove("sx-home-loading","sx-home-entering");
   document.querySelector(".sx-home-loader")?.remove();
   announce();
 });
})();
