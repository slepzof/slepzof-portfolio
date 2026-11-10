/* v19: current slide controls track height, preventing tall ghost spaces. */
(()=>{
 'use strict';
 const stages=[...document.querySelectorAll('#experience .sx-stage[data-sx19-pages]')];
 for(const stage of stages){
  const track=stage.querySelector('.sx19-track');
  if(!track)continue;
  const slides=[...track.querySelectorAll(':scope > .sx19-page')];
  const dots=[...stage.querySelectorAll('.sx18-dot')];
  const counter=stage.querySelector('.sx18-current');
  let active=0,frame=0;
  const update=()=>{
   let best=0,dist=Infinity;
   slides.forEach((el,i)=>{const d=Math.abs(track.scrollLeft - (el.offsetLeft-slides[0].offsetLeft));if(d<dist){dist=d;best=i}});
   active=best;
   const nextHeight=Math.ceil(slides[best].getBoundingClientRect().height+6);
   if(nextHeight>0)track.style.height=nextHeight+'px';
   dots.forEach((dot,i)=>{dot.classList.toggle('sx18-on',i===best);dot.setAttribute('aria-current',i===best?'true':'false')});
   if(counter)counter.textContent=String(best+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
   slides.forEach((slide,i)=>slide.setAttribute('aria-hidden',i===best?'false':'true'));
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update)};
  track.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  if('ResizeObserver' in window){new ResizeObserver(schedule).observe(slides[0]);}
  update();window.addEventListener('load',update,{once:true});
 }
})();
