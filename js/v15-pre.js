/* Group pages into two-row mosaics before carousel navigation is initialized. */
(()=>{
 const section=document.querySelector('#summer-2026');
 const track=section?.querySelector('.sx-track');
 if(!track)return;
 const cards=[...track.querySelectorAll('.sx-mosaic>a.sx-card')];
 const find=slug=>cards.find(card=>card.dataset.slug===slug);
 const order=['pixel-drop','rsk','vremena-goda','payment-gateway','dead-choices',
   'exocure','vezu-edu','meydan-racecourse','the-heights','hub71',
   'exo-fleet-brain','exo-vision','exo-os','al-maktoum'];
 if(!order.every(find))return;
 const batches=[order.slice(0,5),order.slice(5,10),order.slice(10)];
 const frag=document.createDocumentFragment();
 batches.forEach((items,i)=>{
   const slide=document.createElement('div');slide.className='sx-slide';
   const grid=document.createElement('div');grid.className=`sx-mosaic sx-count-${items.length} sx-variant-${i} sx-v15-summer-page`;
   if(i===0)grid.classList.add('sx-v15-summer-five');
   items.forEach(slug=>grid.appendChild(find(slug)));
   slide.appendChild(grid);frag.appendChild(slide);
 });
 track.replaceChildren(frag);
 section.dataset.v15Organized='1';
})();
