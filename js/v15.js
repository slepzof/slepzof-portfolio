/* v15: user SVGs are the final card, not backgrounds beneath old placeholder cards. */
(()=>{
 'use strict';
 const svgCards = new Set(['engine-leads','pixel-drop','parking','vita-ai','echo-app']);
 const concise={
 'onlinesklad':'B2B/B2C-маркетплейс: каталог, кабинеты, заказы, адаптивность и QA.',
 'sober-driver':'Приложения клиента и водителя, админка, сайт и реклама.',
 'duckmaster':'Telegram Mini App с игровой экономикой и торговлей. Пересобрал UI Kit.',
 'apple-bar':'Интернет-магазин, реклама и продвижение. Руководил командой.'
 };
 const palette = {
  'hash-hedge':['#ffdf35',true], 'onlinesklad':['#add9f8',true],
  'sober-driver':['#6f60e8',false], 'duckmaster':['#09bf60',false],
  'apple-bar':['#f56448',false], 'automotive':['#a8bff7',true],
  'automotive-automation':['#ffdf35',true], 'wsct':['#1ab64a',false],
  'rsk':['#0084ff',false], 'vremena-goda':['#add9f8',true],
  'payment-gateway':['#745ee9',false], 'dead-choices':['#a7bff8',true],
  'exocure':['#0084ff',false], 'bonape-training':['#755ae9',false],
  'media-main':['#ffe038',true], 'media-toboboroda':['#d8dbdf',true],
  'media-blvt':['#d8dbdf',true]
 };
 const rotation = [['#add9f8',true],['#6f60e8',false],['#1cbb55',false],['#f35d48',false],['#ffdf35',true],['#0084ff',false],['#a7bff8',true]];
 function paint(card){
  if(card.closest('.sx-selected-grid')) return; // v16 uses the six real customer covers.
  if(card.dataset.v15Card === '1') return;
  const slug=card.dataset.slug;
  if(!slug) return;
  card.dataset.v15Card = '1';
  const [color,light]=palette[slug]||rotation[[...slug].reduce((n,c)=>n+c.charCodeAt(0),0)%rotation.length];
  card.classList.add('sx-v15-card');
  card.classList.toggle('sx-v15-light', light);
  card.style.setProperty('--sx-v15-bg',color);
  if(svgCards.has(slug)) {
    const text=card.querySelector('h4')?.textContent?.trim()||slug;
    card.classList.add('sx-v15-exact-card');
    card.setAttribute('aria-label','Открыть кейс: '+text);
    card.replaceChildren();
    const img=document.createElement('img');
    img.className='sx-v15-svg';
    img.src='/assets/reference-cards/'+slug+'.webp';
    img.alt='';img.loading='eager'; img.decoding='async';
    card.appendChild(img);
  } else {
    /* Never show generated placeholder cover art over content. */
    card.classList.add('sx-v15-text-card');
    if(card.closest('.sx-selected-grid') && concise[slug]){const p=card.querySelector('.sx-card-copy>p');if(p)p.textContent=concise[slug];}
    card.classList.remove('sx-v13-has-art');
    card.classList.add('sx-v13-no-art');
    const decorative=card.querySelector('.sx-card-image');
    if(decorative) decorative.remove();
    card.querySelectorAll('.sx-card-arrow').forEach(el=>el.remove());

  }
 }
 function fitTags(root=document){
  root.querySelectorAll('.sx-v15-text-card .sx-card-role').forEach(row=>{
    const tags=[...row.querySelectorAll('.sx-tag')];
    tags.forEach(tag=>tag.classList.remove('sx-tag-hidden'));
    for(let i=tags.length-1;i>=0 && row.scrollWidth>row.clientWidth+2;i--){tags[i].classList.add('sx-tag-hidden')}
  });
 }
 function redraw(root=document){
   root.querySelectorAll('a.sx-card[data-slug]').forEach(paint);
   fitTags(root);
 }
 function reorganizeSummer(){
   const section=document.querySelector('#summer-2026');
   if(!section || section.dataset.v15Organized) return;
   section.dataset.v15Organized='1';
   const slides=section.querySelectorAll('.sx-slide');
   if(slides.length<2)return;
   const first=slides[0].querySelector('.sx-mosaic'), second=slides[1].querySelector('.sx-mosaic');
   if(!first||!second)return;
   const pixel=first.querySelector('[data-slug="pixel-drop"]');
   const exo=first.querySelector('[data-slug="exocure"]');
   if(pixel)first.prepend(pixel);
   if(exo)second.prepend(exo);
   first.classList.remove('sx-count-6');first.classList.add('sx-count-5','sx-v15-summer-five');
   second.classList.remove('sx-count-8');second.classList.add('sx-count-9');
 }
 reorganizeSummer();
 redraw();
 window.addEventListener('resize',()=>fitTags(),{passive:true});
 // Catalog renders/filters cards dynamically, keep design applied after updates.
 const catalog=document.querySelector('.sx-catalog-body');
 if(catalog){
   const observer=new MutationObserver(()=>redraw(catalog));
   observer.observe(catalog,{childList:true,subtree:true});
 }
})();
