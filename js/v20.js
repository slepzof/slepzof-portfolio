/* SLEPZOF Hero Lottie: retain original 9.5MB artwork and animation.
   Decode + paint the existing WebP still first; load/parse animation only when
   hero is visible and the first screen has been released. */
(function(){
 'use strict';
 var el=document.getElementById('sx20-hero-lottie');
 if(!el)return;
 var providers=[
  'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js',
  'https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie.min.js'
 ];
 var url=el.getAttribute('data-animation'),instance=null;
 var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 var compact=window.matchMedia('(max-width:800px)').matches;
 var firstScreenVisible=!!window.__sxHeroVisible||
  !document.documentElement.classList.contains('sx-home-loading');
 var inView=true,requested=false,scheduled=false,renderReady=false;
 if(reduced||!url)return; // Respect reduced motion without downloading JSON/CDN.
 function maybePlay(){
  if(!instance||!renderReady)return;
  if(inView&&document.visibilityState!=='hidden')instance.play();
  else instance.pause();
 }
 function fail(){
  el.classList.add('sx20-failed');
  // The previously approved still image remains visible as the fallback.
 }
 function boot(){
  if(requested)return;
  requested=true;
  if(!window.lottie){fail();return;}
  try{
   instance=window.lottie.loadAnimation({
    container:el,renderer:'svg',loop:true,autoplay:false,path:url,
    rendererSettings:{preserveAspectRatio:'xMidYMid meet',
      progressiveLoad:true,hideOnTransparent:true}
   });
   instance.addEventListener('DOMLoaded',function(){
    if(compact&&typeof instance.setSubframe==='function')instance.setSubframe(false);
    instance.goToAndStop(0,true);
    // A DOMLoaded event alone does NOT guarantee the first SVG paint.
    requestAnimationFrame(function(){requestAnimationFrame(function(){
     if(!instance)return;
     renderReady=true;
     el.classList.add('sx20-ready');
     maybePlay();
    });});
   });
   instance.addEventListener('data_failed',fail);
  }catch(_){fail();}
 }
 function loadLibrary(index){
  if(index>=providers.length){fail();return;}
  var tag=document.createElement('script');
  tag.src=providers[index];tag.async=true;
  tag.onload=function(){if(window.lottie)boot();else loadLibrary(index+1);};
  tag.onerror=function(){loadLibrary(index+1);};
  document.head.appendChild(tag);
 }
 function scheduleBoot(){
  if(scheduled||requested||!firstScreenVisible||!inView||
     document.visibilityState==='hidden')return;
  scheduled=true;
  var work=function(){
   scheduled=false;
   if(!firstScreenVisible||!inView||requested)return;
   if(window.lottie)boot();else loadLibrary(0);
  };
  if('requestIdleCallback' in window)requestIdleCallback(work,{timeout:1200});
  else window.setTimeout(work,200);
 }
 if('IntersectionObserver' in window){
  var observer=new IntersectionObserver(function(entries){
   inView=entries[0].isIntersecting;
   if(inView)scheduleBoot();
   maybePlay();
  },{threshold:0.03});
  observer.observe(el);
 }
 window.addEventListener('sx:hero-revealed',function(){
  firstScreenVisible=true;scheduleBoot();
 },{once:true});
 document.addEventListener('visibilitychange',function(){
  if(document.visibilityState==='visible')scheduleBoot();
  maybePlay();
 });
 window.addEventListener('pageshow',scheduleBoot);
 scheduleBoot();
})();
