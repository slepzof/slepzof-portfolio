/* v14: cleaned card presentation and tighter layout rules. */
(()=>{
 const palette=[['#068cff',false],['#ff583e',false],['#19bb57',false],['#7666ee',false],['#ffda32',true],['#aad8ff',true],['#ffe69e',true],['#7251bd',false],['#a7bfff',true]];
 const custom={
  'hash-hedge':['#ffdc2e',true], 'onlinesklad':['#acd8f9',true],
  'sober-driver':['#7361eb',false], 'duckmaster':['#0cbd60',false],
  'apple-bar':['#ff6546',false], 'pixel-drop':['#1eabf8',false],
  'engine-leads':['#16b951',false], 'parking':['#fa4e50',false],
  'vita-ai':['#0586fa',false], 'echo-app':['#0784f6',false],
  'greenbox':['#1ab958',false], 'bonape-training':['#8152e8',false],
  'restar':['#ffc84c',true], 'salute':['#fc603d',false],
  'artsavur':['#7867ee',false], 'rsk':['#1d83f4',false],
  'media':['#ffdf39',true], 'media-main':['#ffdf39',true],
  'media-toboboroda':['#dfe3e7',true], 'media-blvt':['#dfe3e7',true],
  'exocure':['#116de6',false], 'wsct':['#1cbc55',false]
 };
 const art={
  'pixel-drop':'/assets/cards/pixel-drop.webp',
  'parking':'/assets/cards/parking.webp',
  'vita-ai':'/assets/cards/vita-ai.webp',
  'echo-app':'/assets/cards/echo-app.webp'
 };
 const forceNoArt=new Set(['hash-hedge','engine-leads','media-main','media-toboboroda','media-blvt']);
 const icons={
  'дизайн':'design.svg','ux/ui':'design.svg','ux':'design.svg',
  'разработка':'dev.svg','frontend':'dev.svg','верстка':'dev.svg',
  'маркетинг':'marketing.svg','реклама':'marketing.svg',
  'руководство':'lead.svg','команда':'lead.svg',
 };
 function hash(s){let h=2166136261;for(const c of s){h=Math.imul(h^c.charCodeAt(0),16777619)>>>0}return h}
 function fitTags(card){
  const row=card.querySelector('.sx-card-role');
  if(!row)return;
  const tags=[...row.querySelectorAll('.sx-tag')];
  tags.forEach(t=>t.classList.remove('sx-tag-hidden'));
  const max=Math.max(0,row.clientWidth-2);
  for(let i=tags.length-1;i>=0 && row.scrollWidth>max;i--){
   tags[i].classList.add('sx-tag-hidden');
  }
 }
 function update(card){
  if(card.classList.contains('sx-v14-card'))return;
  const slug=card.dataset.slug || (card.getAttribute('href')||'').split('/').filter(Boolean).pop() || '';
  const [color,light]=custom[slug]||palette[hash(slug)%palette.length];
  card.classList.add('sx-v14-card','sx-v13-card');card.classList.toggle('sx-v13-light',light);
  card.style.setProperty('--sx-v13-bg',color);
  for(const tag of card.querySelectorAll('.sx-tag')){
   const icon=icons[(tag.textContent||'').trim().toLowerCase()];
   if(icon && !tag.querySelector('img')){
    const pict=document.createElement('img');pict.src='/assets/icons/'+icon;
    pict.alt='';pict.setAttribute('aria-hidden','true');pict.className='sx-v13-icon';
    tag.insertBefore(pict,tag.firstChild);
   }
  }
  const img=card.querySelector('.sx-card-image img');
  if(forceNoArt.has(slug)){
   card.classList.add('sx-v13-no-art');
  } else if(art[slug]&&img){
   img.src=art[slug];img.removeAttribute('srcset');card.classList.add('sx-v13-has-art');
   img.addEventListener('error',()=>{card.classList.remove('sx-v13-has-art');card.classList.add('sx-v13-no-art')},{once:true});
  } else if(img){
   card.classList.add('sx-v13-has-art');
   img.addEventListener('error',()=>{card.classList.remove('sx-v13-has-art');card.classList.add('sx-v13-no-art')},{once:true});
  } else {
   card.classList.add('sx-v13-no-art');
  }
  fitTags(card);
 }
 function paint(root){
  root.querySelectorAll('.sx-tile-card').forEach(update);
  root.querySelectorAll('.sx-mosaic').forEach(g=>g.classList.add('sx-v13-mosaic'));
 }
 paint(document);
 const catalog=document.querySelector('.sx-catalog-body');
 if(catalog){const obs=new MutationObserver(()=>paint(catalog));obs.observe(catalog,{subtree:true,childList:true});}
 const refit=()=>document.querySelectorAll('.sx-tile-card').forEach(fitTags);
 let raf=0; window.addEventListener('resize',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(refit)});
})();
