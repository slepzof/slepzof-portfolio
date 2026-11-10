/* SLEPZOF v23: static-deployable content layer. Public pages never need a database. */
(() => {
  'use strict';
  const $=(s,el=document)=>el.querySelector(s), $$=(s,el=document)=>[...el.querySelectorAll(s)];
  const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl=s=>typeof s==='string'&&s.startsWith('/')&&!s.startsWith('//')&&!s.includes('\\')?s:'';
  const safeHex=s=>/^#[\da-fA-F]{3,8}$/.test(s||'')?s:'#dfebf7';
  const cleanRole=s=>String(s||'').slice(0,42);
  const normalizePath=p=>p.replace(/\/+$/,'')+'/' === '//' ? '/' : p.replace(/\/+$/,'')+'/';
  const page=normalizePath(location.pathname);
  let current=null;

  function picture(project){
    const images=project.images||{};
    const d=safeUrl(images.desktop||images.tablet||images.mobile||'');
    const t=safeUrl(images.tablet||images.desktop||images.mobile||'');
    const m=safeUrl(images.mobile||images.tablet||images.desktop||'');
    if(!d)return '';
    return `<picture class="cms-picture" aria-hidden="true"><source media="(max-width: 640px)" srcset="${escapeHtml(m)}"><source media="(max-width: 1024px)" srcset="${escapeHtml(t)}"><img src="${escapeHtml(d)}" alt="" loading="lazy"></picture>`;
  }
  function tile(project,forCatalog=false){
    const slug=project.slug;
    const size=project.size||'small';
    const sizeClass={large:'sx-feature','medium-horizontal':'cms-medium-horizontal','medium-vertical':'cms-medium-vertical',small:'sx-regular'}[size]||'sx-regular';
    const ink=project.ink==='light'?'light':'dark';
    const color=safeHex(project.color);
    const tags=(project.roles||[]).slice(0,4).map(r=>`<span class="cms-role">${escapeHtml(cleanRole(r))}</span>`).join('');
    const metric=project.metric?`<div class="cms-metric"><strong>${escapeHtml(project.metric)}</strong><span>${escapeHtml(project.metricLabel)}</span></div>`:'';
    const url=safeUrl(project.url)||'/cases/'+encodeURIComponent(slug)+'/';
    const a=document.createElement('a');
    a.className=`sx-card sx-tile-card cms-tile ${sizeClass} cms-ink-${ink}`;
    a.dataset.slug=slug;
    a.dataset.v15Card='1';
    a.dataset.cmsRendered='1';
    a.href=url;
    a.style.setProperty('--cms-bg',color);
    a.innerHTML=picture(project)+`<div class="cms-top">${tags}</div><div class="cms-copy"><h4>${escapeHtml(project.title)}</h4><p>${escapeHtml(project.summary)}</p>${metric}</div>`;
    if(forCatalog){a.classList.add('cms-catalog-tile')}
    return a;
  }
  function installProjects(data){
    const projects=data.projects||{};
    const changedPeriods=new Set();
    for(const project of Object.values(projects)){
      if(!project || !project.managed)continue;
      const slug=project.slug;
      changedPeriods.add(project.period);
      for(const node of $$(`[data-slug="${CSS.escape(slug)}"]`)){
        const catalog=!!node.closest('.sx-catalog-body');
        node.replaceWith(tile(project,catalog));
      }
      // Separately updates the six large featured cards, preserving carousel behavior.
      for(const node of $$(`[data-featured-slug="${CSS.escape(slug)}"]`)){
        const h=$('.sx17-body h3',node),p=$('.sx17-body p',node);
        if(h)h.textContent=project.featuredTitle||project.title;
        if(p)p.textContent=project.featuredDescription||project.summary;
        const roleRow=$('.sx17-tags',node);
        if(roleRow && project.roles){
          const icons={'Дизайн':'design','Разработка':'dev','Маркетинг':'marketing','Аналитика':'analytics','QA':'test','Тестирование':'test','Руководство':'lead'};
          roleRow.replaceChildren();
          for(const role of project.roles.slice(0,4)){
            const tag=document.createElement('span');tag.className='sx17-tag';
            const icon=icons[role];
            if(icon){const img=document.createElement('img');img.alt='';img.setAttribute('aria-hidden','true');img.src='/assets/icons/featured-v17/'+icon+'.svg';tag.append(img)}
            const label=document.createElement('span');label.textContent=role;tag.append(label);roleRow.append(tag);
          }
        }
        const metrics=$$('.sx17-metric',node);
        if(project.metrics && Array.isArray(project.metrics)) metrics.forEach((el,i)=>{
          if(!project.metrics[i])return;
          const n=$('strong',el),label=$('span',el);
          if(n)n.textContent=project.metrics[i].value||'';
          if(label)label.textContent=project.metrics[i].label||'';
        });
        if(project.images && project.images.desktop){
          const old=$('.sx17-bg',node),wrap=document.createElement('div');
          wrap.className='cms-featured-cover';wrap.innerHTML=picture(project);
          if(old)old.replaceWith(wrap);else node.prepend(wrap);
        }
      }
    }
    const additions=Object.values(projects).filter(p=>p && p.isNew && p.managed);
    if(!additions.length){ for(const id of changedPeriods){const stage=document.getElementById(id);if(stage)packStage(stage)} return; }
    for(const p of additions){
      // New cards appear in both main experience and the full catalog.
      let section=$(`.sx-catalog-section#group-${CSS.escape(p.period)}`);
      if(!section){
        section=document.createElement('section');section.className='sx-catalog-section cms-catalog-section';section.id='group-'+p.period;
        section.innerHTML=`<div class="sx-section-head"><h2>${escapeHtml((data.periods||[]).find(x=>x.id===p.period)?.title||'Дополнительные проекты')}</h2></div><div class="sx-catalog-grid"></div>`;
        $('.sx-catalog-body')?.append(section);
      }
      $('.sx-catalog-grid',section)?.append(tile(p,true));
      const stage=document.getElementById(p.period);
      changedPeriods.add(p.period);
      if(!stage)continue;
      const mosaics=$$('.sx-mosaic',stage);
      let mosaic=mosaics.find(m=>$$(':scope > .sx-card',m).length<6);
      if(!mosaic){
        // Avoid a third row or a page of empty whitespace.
        const track=$('.sx-track',stage);
        if(track){
          const slide=document.createElement('div');slide.className='sx-slide sx19-page cms-new-slide';
          slide.innerHTML='<div class="sx-mosaic sx19-mosaic cms-new-mosaic" data-sx19-rows="2"></div>';
          track.append(slide);mosaic=$('.sx-mosaic',slide);
        }else{
          mosaic=document.createElement('div');mosaic.className='sx-mosaic cms-new-mosaic';stage.append(mosaic);
        }
      }
      mosaic.append(tile(p));
    }
    for(const id of changedPeriods){const stage=document.getElementById(id);if(stage)packStage(stage)}
    // Catalog search/listener code is attached to existing event handlers; regenerate counts where possible.
    $('#sx-catalog-count')?.setAttribute('data-cms-total',String(Object.values(projects).length));
  }
  function packStage(stage){
    // Four-column packing, exactly two desktop rows per slide. Creates no empty slides.
    const sourceCards=$$('.sx-mosaic > .sx-card[data-slug]',stage);
    if(!sourceCards.length)return;
    const existingTrack=$('.sx-track',stage);
    const track=existingTrack||document.createElement('div');
    if(!existingTrack){track.className='sx-track sx19-track';stage.append(track)}
    const dims=card=>card.classList.contains('sx-feature')?[2,2]:card.classList.contains('cms-medium-vertical')?[1,2]:card.classList.contains('cms-medium-horizontal')?[2,1]:[1,1];
    const groups=[];let current=null;
    function makeGroup(){const grid=Array.from({length:2},()=>Array(4).fill(false));const g={grid,items:[]};groups.push(g);return g}
    function findSlot(g,w,h){for(let y=0;y<=2-h;y++)for(let x=0;x<=4-w;x++){
      let ok=true;for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(g.grid[yy][xx])ok=false;
      if(ok)return {x,y};
    }return null}
    current=makeGroup();
    for(const card of sourceCards){
      const [w,h]=dims(card);let slot=findSlot(current,w,h);
      if(!slot){current=makeGroup();slot=findSlot(current,w,h)}
      for(let y=slot.y;y<slot.y+h;y++)for(let x=slot.x;x<slot.x+w;x++)current.grid[y][x]=true;
      current.items.push({card,x:slot.x,y:slot.y,w,h});
    }
    // Original script listeners can keep the old detached nodes. Our scoped controller takes precedence.
    track.replaceChildren();
    for(let i=0;i<groups.length;i++){
      const slide=document.createElement('div');slide.className='sx-slide sx19-page cms-packed-page';slide.dataset.sx19Page=String(i);
      const mosaic=document.createElement('div');mosaic.className='sx-mosaic sx19-mosaic cms-packed';mosaic.dataset.sx19Rows='2';
      for(const {card,x,y,w,h} of groups[i].items){
        card.style.gridColumn=`${x+1} / span ${w}`;
        card.style.gridRow=`${y+1} / span ${h}`;
        mosaic.append(card);
      }
      slide.append(mosaic);track.append(slide);
    }
    $$('.sx-mosaic',stage).forEach(m=>{if(!m.querySelector('.sx-card'))m.remove()});
    stage.dataset.sx19Pages=String(groups.length);stage.dataset.cmsPacked='1';
    const controls=$('.sx-slide-controls',stage);
    if(controls)controls.hidden=groups.length<2;
    const dots=$('.sx18-dots',stage);if(dots){dots.replaceChildren();for(let i=0;i<groups.length;i++){
      const dot=document.createElement('button');dot.type='button';dot.className='sx18-dot';dot.setAttribute('aria-label',`Страница ${i+1}`);dots.append(dot);
    }}
    let active=0;
    const slides=$$('.cms-packed-page',track);
    function go(index){
      active=Math.max(0,Math.min(slides.length-1,index));
      track.style.height=Math.ceil(slides[active].getBoundingClientRect().height+6)+'px';
      track.scrollTo({left:slides[active].offsetLeft-slides[0].offsetLeft,behavior:'smooth'});
      $$('.sx18-dot',stage).forEach((node,i)=>node.classList.toggle('sx18-on',i===active));
      const counter=$('.sx18-current',stage);
      if(counter)counter.textContent=`${String(active+1).padStart(2,'0')} / ${String(groups.length).padStart(2,'0')}`;
    }
    const control=controls||stage;
    if(!control.dataset.cmsBound){
      control.dataset.cmsBound='1';
      control.addEventListener('click',event=>{
        const target=event.target.closest('.sx-slide-prev,.sx-slide-next,.sx18-dot');if(!target||!stage.contains(target))return;
        if(stage.dataset.cmsPacked!=='1')return;
        event.preventDefault();event.stopImmediatePropagation();
        if(target.matches('.sx-slide-prev'))go(active-1);
        else if(target.matches('.sx-slide-next'))go(active+1);
        else go($$('.sx18-dot',stage).indexOf(target));
      },true);
      dots?.addEventListener('click',event=>{
        const target=event.target.closest('.sx18-dot');if(!target)return;
        event.preventDefault();event.stopImmediatePropagation();go($$('.sx18-dot',stage).indexOf(target));
      },true);
      track.addEventListener('scroll',()=>{
        let index=0,dist=Infinity;slides.forEach((el,i)=>{const d=Math.abs(track.scrollLeft-(el.offsetLeft-slides[0].offsetLeft));if(d<dist){dist=d;index=i}});
        active=index;
        $$('.sx18-dot',stage).forEach((el,i)=>el.classList.toggle('sx18-on',i===active));
      },{passive:true});
      window.addEventListener('resize',()=>go(active),{passive:true});
    }
    requestAnimationFrame(()=>go(0));
  }
  function setUpExtraSlides(stage){
    const track=$('.sx-track',stage);if(!track)return;
    const slides=$$('.sx-slide',track),original=Number(stage.dataset.sx19Pages||slides.length);
    if(slides.length<=original)return;
    stage.dataset.sx19Pages=String(slides.length);
    const dots=$('.sx18-dots',stage),controls=$('.sx-slide-controls',stage);
    if(dots)for(let i=dots.children.length;i<slides.length;i++){
      const btn=document.createElement('button');btn.className='sx18-dot';btn.type='button';btn.setAttribute('aria-label',`Страница ${i+1}`);dots.append(btn);
    }
    let active=0;
    function go(i){
      active=Math.max(0,Math.min(slides.length-1,i));
      const el=slides[active];
      track.style.height=Math.ceil(el.getBoundingClientRect().height+6)+'px';
      track.scrollTo({left:el.offsetLeft-slides[0].offsetLeft,behavior:'smooth'});
      $$('.sx18-dot',stage).forEach((d,n)=>{d.classList.toggle('sx18-on',n===active);d.setAttribute('aria-current',n===active?'true':'false')});
      const count=$('.sx18-current',stage);if(count)count.textContent=`${String(active+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    }
    controls?.addEventListener('click',e=>{
      const dot=e.target.closest('.sx18-dot'),prev=e.target.closest('.sx-slide-prev'),next=e.target.closest('.sx-slide-next');
      if(dot||prev||next){e.preventDefault();e.stopImmediatePropagation();go(dot?$$('.sx18-dot',stage).indexOf(dot):active+(next?1:-1));}
    },true);
    dots?.addEventListener('click',e=>{const dot=e.target.closest('.sx18-dot');if(!dot)return;e.stopImmediatePropagation();e.preventDefault();go($$('.sx18-dot',stage).indexOf(dot))},true);
    go(0);
  }
  function applyEdits(data){
    // One-click global text replacements, intended for repeated nav/footer copy.
    for(const item of data.globalText||[]){
      if(!item || !item.from || !item.to)continue;
      for(const el of $$('h1,h2,h3,h4,p,a,button,span,li,strong,figcaption')){
        if(el.children.length===0 && el.textContent.trim()===item.from)el.textContent=item.to;
      }
    }
    const edits=data.pageEdits?.[page]||[];
    for(const edit of edits){
      try{
        const element=$(edit.selector);if(!element)continue;
        if(edit.type==='text')element.textContent=edit.value;
        if(edit.href && element.tagName==='A' && /^(https?:\/\/|mailto:|tel:|\/|#)/.test(edit.href))element.setAttribute('href',edit.href);
        if(edit.type==='image' && element.tagName==='IMG')element.src=safeUrl(edit.value)||element.src;
        if(edit.type==='background')element.style.backgroundImage=`url("${safeUrl(edit.value)}")`;
      }catch(e){console.warn('CMS edit skipped',e)}
    }
  }
  function selectorFor(element){
    // Stable while markup structure stays unchanged. User changes to text never alter this path.
    let s=[],cur=element;
    while(cur && cur.nodeType===1 && cur.tagName!=='HTML'){
      if(cur.id && /^[a-zA-Z][\w-]*$/.test(cur.id)){s.unshift('#'+CSS.escape(cur.id));break}
      const siblings=cur.parentElement?[...cur.parentElement.children].filter(x=>x.tagName===cur.tagName):[];
      const index=siblings.indexOf(cur)+1;
      s.unshift(cur.tagName.toLowerCase()+`:nth-of-type(${index})`);
      cur=cur.parentElement;
    }
    return s.join(' > ');
  }
  function enablePicking(){
    document.documentElement.classList.add('cms-pick-mode');
    document.addEventListener('click',event=>{
      if(!window.parent||window.parent===window)return;
      const target=event.target;
      const types='h1,h2,h3,h4,h5,h6,p,li,span,a,button,strong,small,figcaption,label,blockquote,td,th';
      const image=target.closest('img');
      let targetEl=image||target.closest(types);
      if(!targetEl){
        let node=target;while(node && node!==document.body){
          if(getComputedStyle(node).backgroundImage!=='none'){targetEl=node;break}
          node=node.parentElement;
        }
      }
      if(!targetEl)targetEl=target;
      if(!targetEl || targetEl===document.body)return;
      event.preventDefault();event.stopPropagation();
      $$('.cms-picked').forEach(el=>el.classList.remove('cms-picked'));
      targetEl.classList.add('cms-picked');
      const type=targetEl.tagName==='IMG'?'image':getComputedStyle(targetEl).backgroundImage!=='none' && !targetEl.matches(types)?'background':'text';
      window.parent.postMessage({source:'slepzof-cms',kind:'picked',path:page,selector:selectorFor(targetEl),type,value:type==='image'?targetEl.getAttribute('src'):type==='background'?getComputedStyle(targetEl).backgroundImage:targetEl.textContent.trim().slice(0,10000),tag:targetEl.tagName},location.origin);
    },true);
  }
  async function boot(){
    try{
      const res=await fetch('/cms/data.json',{cache:'no-store'});
      if(!res.ok)return;
      current=await res.json();
      installProjects(current);
      applyEdits(current);
      if(new URLSearchParams(location.search).has('cmsEdit'))enablePicking();
    }catch(error){console.warn('Content editor: fallback to original site',error)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
