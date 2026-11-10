/* v18: equal-size brand marks, hide least important roles when row becomes tight, unified pagination. */
(()=>{
 'use strict';
 const refit=()=>{
  document.querySelectorAll('#selected .sx17-top').forEach(top=>{
   const row=top.querySelector('.sx17-tags'), brand=top.querySelector('.sx18-brand');if(!row||!brand)return;
   const tags=[...row.querySelectorAll('.sx17-tag')];tags.forEach(el=>el.hidden=false);
   let budget=top.clientWidth-brand.getBoundingClientRect().width-10;
   for(let i=tags.length-1;i>=1 && row.scrollWidth>budget+1;i--){tags[i].hidden=true}
  });
 };
 let timer=0;window.addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(refit,80)},{passive:true});
 window.addEventListener('load',refit,{once:true});refit();
 for(const stage of document.querySelectorAll('#experience .sx-stage')){
  const track=stage.querySelector('.sx-track');if(!track)continue;
  const slides=[...track.querySelectorAll('.sx-slide')];if(slides.length<2)continue;
  const dots=[...stage.querySelectorAll('.sx18-dot')];const counter=stage.querySelector('.sx18-current');
  const refresh=()=>{
   let i=0,dist=Infinity;for(let k=0;k<slides.length;k++){const d=Math.abs(track.scrollLeft-(slides[k].offsetLeft-slides[0].offsetLeft));if(d<dist){dist=d;i=k}}
   if(counter)counter.textContent=String(i+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
   dots.forEach((x,k)=>{x.classList.toggle('sx18-on',k===i);x.setAttribute('aria-current',k===i?'true':'false')});
  };
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>track.scrollTo({left:slides[i].offsetLeft-slides[0].offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})));
  let raf=0;track.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(refresh)},{passive:true});refresh();
 }
})();
