(() => {
  const nav = document.querySelector('.sx-nav');
  const menu = nav?.querySelector('.sx-menubutton');
  menu?.addEventListener('click', () => {
    const expanded = nav.classList.toggle('sx-open');
    menu.setAttribute('aria-expanded', String(expanded));
  });
  document.querySelectorAll('.sx-navlinks a').forEach(a => a.addEventListener('click', () => {
    nav?.classList.remove('sx-open');menu?.setAttribute('aria-expanded','false');
  }));
  document.querySelectorAll('.sx-stage').forEach(stage => {
    const track = stage.querySelector('.sx-track');
    if(!track) return;
    const slides = [...track.querySelectorAll('.sx-slide')];
    const prev = stage.querySelector('.sx-slide-prev');
    const next = stage.querySelector('.sx-slide-next');
    const counter = stage.querySelector('.sx-pagecount');
    const position = i => slides[i].offsetLeft - slides[0].offsetLeft;
    const current = () => {
      let best = 0, dist = Infinity;
      slides.forEach((el,i) => {const d=Math.abs(track.scrollLeft-position(i));if(d<dist){dist=d;best=i}});
      return best;
    };
    const update = () => {
      const i=current();
      if(counter)counter.textContent=String(i+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
      if(prev)prev.disabled=i===0;
      if(next)next.disabled=i===slides.length-1;
    };
    const move = delta => {
      const i=Math.min(slides.length-1,Math.max(0,current()+delta));
      track.scrollTo({left:position(i),behavior:'smooth'});
    };
    prev?.addEventListener('click',()=>move(-1));next?.addEventListener('click',()=>move(1));
    track?.addEventListener('scroll',()=>requestAnimationFrame(update),{passive:true});
    update();
  });
  const search = document.querySelector('#sx-project-search');
  const filters = [...document.querySelectorAll('.sx-filters button')];
  let active='all';
  function filterCatalog(){
    const q=(search?.value||'').trim().toLocaleLowerCase('ru');
    document.querySelectorAll('.sx-catalog-section').forEach(section => {
      let visible=0;
      section.querySelectorAll('.sx-card').forEach(card => {
        const role=card.querySelector('.sx-card-role')?.textContent||'';
        const okCat=active==='all'||role.includes(active);
        const okText=!q||card.textContent.toLocaleLowerCase('ru').includes(q);
        const ok=okCat&&okText;
        card.classList.toggle('sx-is-hidden',!ok);
        if(ok)visible++;
      });
      section.classList.toggle('sx-is-hidden',!visible);
    });
  }
  search?.addEventListener('input',filterCatalog);
  filters.forEach(b=>b.addEventListener('click',()=>{active=b.dataset.filter||'all';filters.forEach(x=>x.classList.toggle('is-active',x===b));filterCatalog()}));
})();

/* SLEPZOF v36: consistent navigation across the published project subpath. */
(()=>{
 const menu=document.getElementById('sx25-main-menu');
 if(!menu)return;
 const base=location.pathname.startsWith('/slepzof-portfolio/')?'/slepzof-portfolio':'';
 const entries=[
  ['Кейсы','projects/'],['Опыт работы','#experience'],['Обо мне','about/'],
  ['Дизайн','design/'],['Маркетинг','marketing/'],
  ['Управление и обучение','management-training/'],['Работа со мной','work-with-me/']
 ];
 [...menu.querySelectorAll('a')].slice(0,7).forEach((a,i)=>{
  if(!entries[i])return;
  a.textContent=entries[i][0];
  a.setAttribute('href',base+'/'+entries[i][1]);
 });
})();
