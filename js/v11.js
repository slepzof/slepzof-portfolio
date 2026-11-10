// SLEPZOF v11 - mixed catalog with dynamic reflow, usable with search and period deep links.
(() => {
 const body=document.body;
 const catalog=body.querySelector('.sx-catalog-body');
 if(!catalog)return;
 const oldSections=[...catalog.querySelectorAll('.sx-catalog-section')];
 const items=[];
 const seen=new Set();
 const ignored=new Set(['shutterstock','bakery']);
 const palette=['#f2ebe9','#e8eff1','#eaeaf4','#e9f0e8','#f4ecdf','#e8ebf3','#ebe7e2','#e8f0ef'];
 const brands={'hash-hedge':'#f4f1e8','wsct':'#e8ebf3','duckmaster':'#dfeae0','onlinesklad':'#e3edf2','sober-driver':'#e6ecf0','apple-bar':'#f5e6de','bonape-training':'#e8e4f2','salute':'#e8eef6','artsavur':'#eeecdf','greenbox':'#e5f0e5','restar':'#edeaf0','media':'#e9edfc','automotive':'#e5ebed','engine-leads':'#e7ecfa','exocure':'#e7e9f1'};
 const tint=slug=>brands[slug]||palette[[...slug].reduce((v,ch)=>(v*33+ch.charCodeAt(0))>>>0,7)%palette.length];
 for(const section of oldSections){
   const period=section.id.replace('group-','');
   for(const card of section.querySelectorAll('.sx-card')){
     const slug=card.getAttribute('href')?.replace(/\/$/,'').split('/').at(-1);
     if(!slug||seen.has(slug)||ignored.has(slug))continue;
     seen.add(slug);
     card.classList.add('sx-tile-card');
     card.style.setProperty('--sx-tile-color',tint(slug));
     items.push({slug,period:card.dataset.period||period,roles:card.querySelector('.sx-card-role')?.textContent||'',label:card.textContent,el:card});
   }
   section.remove();
 }
 const wall=document.createElement('div');wall.className='sx-catalog-wall';catalog.append(wall);
 const search=document.querySelector('#sx-project-search');
 const filters=[...document.querySelectorAll('.sx-filters button')];
 const countEl=document.querySelector('#sx-catalog-count');
 const params=new URLSearchParams(location.search);const period=params.get('period');
 let active='all';
 const stageNames={'auto-2026':'Автомобильные продукты','summer-2026':'Проекты 2026','hash':'Hash Hedge & WSCT','private-2025':'Частная практика','duck':'DuckMaster','bonape':'BONAPE','salute':'SALUTE','artsavur':'ARTSAVUR','onlinesklad':'Onlinesklad','sober':'Sober Driver','forfis':'FORFIS','2020-projects':'Коммерческие проекты','restar':'RESTAR','media':'YouTube и VK'};
 const title=document.querySelector('.sx-catalog-hero h1');
 if(period&&stageNames[period]){
  if(title)title.textContent='Работы периода: '+stageNames[period];
  const link=document.createElement('a');link.href='/projects/';link.className='sx-inline-link';link.textContent='Смотреть весь каталог ↗';
  document.querySelector('.sx-catalog-tools')?.append(link);
 }
 function redraw(){
   const q=(search?.value||'').toLocaleLowerCase('ru').trim();
   const matches=items.filter(i=>(!period||i.period===period)&&(active==='all'||i.roles.includes(active))&&(!q||i.label.toLocaleLowerCase('ru').includes(q)));
   const tmp=document.createDocumentFragment();
   const pageCount=matches.length?1:0;
   let offset=0;
   for(let p=0;p<pageCount;p++){
     const n=Math.floor(matches.length/pageCount)+(p<matches.length%pageCount?1:0);
     const chunk=matches.slice(offset,offset+n);offset+=n;
     const grid=document.createElement('div');grid.className=`sx-mosaic sx-count-${chunk.length} sx-variant-${p%3}`;
     for(const item of chunk){grid.append(item.el)}
     tmp.append(grid);
   }
   wall.replaceChildren(tmp);
   if(countEl)countEl.textContent=`${matches.length} ${matches.length===1?'работа':matches.length%10>=2&&matches.length%10<=4&&(matches.length%100<10||matches.length%100>=20)?'работы':'работ'}${period&&stageNames[period]?' за выбранный период':''}`;
   if(!matches.length){const p=document.createElement('p');p.textContent='Ничего не найдено. Попробуй другое название или направление.';wall.append(p)}
 }
 search?.addEventListener('input',redraw);
 for(const b of filters){b.addEventListener('click',()=>{active=b.dataset.filter||'all';filters.forEach(x=>x.classList.toggle('is-active',x===b));redraw()})}
 redraw();
})();
