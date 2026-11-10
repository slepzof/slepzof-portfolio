/* v25 Block 03: native touch/trackpad horizontal scroll and Apple-style arrow navigation. */
(()=>{
 const section=document.querySelector('#selected.sx25b3-slider');
 const rail=section?.querySelector('#sx25b3-rail');
 const prev=section?.querySelector('.sx25b3-prev');
 const next=section?.querySelector('.sx25b3-next');
 if(!rail||!prev||!next)return;
 const cards=[...rail.querySelectorAll('.sx25b3-card')];
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const maxScroll=()=>Math.max(0,rail.scrollWidth-rail.clientWidth);
 const positions=()=>cards.map(c=>c.offsetLeft-cards[0].offsetLeft);
 const update=()=>{
  prev.disabled=rail.scrollLeft<=2;
  next.disabled=rail.scrollLeft>=maxScroll()-2;
 };
 const step=(dir)=>{
  const offsets=positions(), current=rail.scrollLeft;
  const destination=dir>0
   ? offsets.find(p=>p>current+2) ?? maxScroll()
   : [...offsets].reverse().find(p=>p<current-2) ?? 0;
  rail.scrollTo({left:Math.min(maxScroll(),Math.max(0,destination)),behavior:reduced.matches?'instant':'smooth'});
 };
 prev.addEventListener('click',()=>step(-1));
 next.addEventListener('click',()=>step(1));
 rail.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
  event.preventDefault();step(event.key==='ArrowRight'?1:-1);
 });
 let ticking=false;
 rail.addEventListener('scroll',()=>{
  if(ticking)return;ticking=true;
  requestAnimationFrame(()=>{ticking=false;update();});
 },{passive:true});
 window.addEventListener('resize',update,{passive:true});
 update();
})();
