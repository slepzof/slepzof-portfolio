/* Featured section: keep the full original user artwork, with HTML copy accessible and links intact. */
(()=>{
 const section=document.querySelector('.sx-selected-grid');
 if(!section)return;
 const slugs=['hash-hedge','pixel-drop','onlinesklad','sober-driver','duckmaster','apple-bar'];
 for(const slug of slugs){
  const card=section.querySelector(`[data-slug="${slug}"]`);
  if(!card)continue;
  card.classList.add('sx-v16-featured');
  if(['hash-hedge','duckmaster','sober-driver'].includes(slug)) card.classList.add('sx-v16-dark-art');
  card.querySelectorAll('.sx-card-image,.sx-card-arrow').forEach(el=>el.remove());
  const image=document.createElement('img');
  image.src='/assets/featured-v16/'+slug+'.webp';
  image.className='sx-v16-cover'; image.alt=''; image.decoding='async';image.loading='lazy';
  image.setAttribute('aria-hidden','true');
  card.prepend(image);
  const roles=card.querySelector('.sx-card-role');
  if(roles){
   // Keep useful roles in one line. One-line fit is handled again in CSS for narrow screens.
   roles.classList.add('sx-v16-roles');
  }
 }
})();
