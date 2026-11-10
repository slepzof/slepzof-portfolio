/* SLEPZOF local editor, zero dependencies. */
(() => {
  'use strict';
  const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
  const ROLE_LIST=['Дизайн','Разработка','Маркетинг','Руководство','Аналитика','QA','Тестирование','Контент'];
  const SIZE_NAMES={large:'Большая', 'medium-vertical':'Средняя вертикальная','medium-horizontal':'Средняя горизонтальная',small:'Маленькая'};
  let state=null,slug=null,dirty=false,picked=null,activePage='/';
  let toastTimeout;
  function toast(msg){let box=$('#toast');box.textContent=msg;box.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>box.classList.remove('show'),3600)}
  function markDirty(){dirty=true;$('#save-status').textContent='Не сохранено';$('#save-status').classList.add('dirty')}
  function setSaved(){dirty=false;$('#save-status').textContent='Все изменения сохранены';$('#save-status').classList.remove('dirty')}
  function escapeHTML(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function pathOf(url){let u;try{u=new URL(url,location.origin)}catch{return '/'};return u.pathname.replace(/\/+$/,'')+'/'==='//'?'/':u.pathname.replace(/\/+$/,'')+'/'}
  function project(){return state?.projects?.[slug]}
  async function save(){
    if(!state)return;
    const btn=$('#save');btn.disabled=true;btn.textContent='Сохранение…';
    try{
      const res=await fetch('/api/cms/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(state)});
      const data=await res.json();if(!res.ok)throw new Error(data.error||'Не удалось сохранить');
      setSaved();toast(`Сохранено · ${data.projects} проектов`);
      if($('.view.active').id==='view-pages')reloadPreview();
    }catch(e){toast('Ошибка: '+e.message)}finally{btn.disabled=false;btn.textContent='Сохранить изменения'}
  }
  async function upload(file){
    if(!file)return null;
    if(file.size>18*1024*1024)throw Error('Максимальный размер изображения 18 МБ');
    const response=await fetch('/api/cms/upload',{method:'POST',headers:{'X-Filename':encodeURIComponent(file.name)},body:file});
    const r=await response.json();if(!response.ok)throw Error(r.error||'Не удалось загрузить');
    return r.url;
  }
  function filterList(){
    const query=$('#project-search').value.trim().toLowerCase();const list=$('#project-list');list.replaceChildren();
    const sorted=Object.values(state.projects).sort((a,b)=>Number(b.isNew)-Number(a.isNew)||String(a.title).localeCompare(String(b.title),'ru'));
    const found=sorted.filter(p=>(p.title+' '+p.slug+' '+(state.periods.find(t=>t.id===p.period)?.title||'')).toLowerCase().includes(query));
    const frag=document.createDocumentFragment();
    for(const p of found){const b=document.createElement('button');b.type='button';b.className='project-list-item'+(p.slug===slug?' active':'');
      b.innerHTML=`<strong>${escapeHTML(p.title)}</strong><span>${p.isNew?'Новый · ':''}${escapeHTML((state.periods.find(t=>t.id===p.period)||{}).title||'Без раздела')}</span>`;
      b.onclick=()=>selectProject(p.slug);frag.append(b)}list.append(frag);
    $('#project-count').textContent=Object.values(state.projects).length;
  }
  function populateImages(p){
    for(const device of ['desktop','tablet','mobile']){
      const preview=$('#preview-'+device);preview.replaceChildren();const url=p.images?.[device];
      if(url){const img=document.createElement('img');img.src=url;img.alt='Превью '+device;preview.append(img)}else preview.textContent='Не выбрано';
    }
  }
  function gallery(p){let root=$('#p-gallery');root.replaceChildren();(p.detail.gallery||[]).forEach((src,i)=>{
    const cell=document.createElement('div');cell.className='gallery-thumb';cell.innerHTML=`<img src="${escapeHTML(src)}" alt="Иллюстрация ${i+1}"><button aria-label="Удалить изображение">×</button>`;
    cell.querySelector('button').onclick=()=>{p.detail.gallery.splice(i,1);markDirty();gallery(p)};root.append(cell);
  })}
  function renderCardPreview(p){
    const host=$('#project-preview');host.replaceChildren();
    const div=document.createElement('div');div.className='live-case';
    div.style.setProperty('--card-color',p.color||'#dceafd');div.style.setProperty('--card-ink',p.ink==='light'?'white':'#111');
    const img=p.images?.desktop||p.images?.tablet||p.images?.mobile;
    div.innerHTML=`${img?`<img src="${escapeHTML(img)}" alt="">`:''}<div class="live-case-tags">${escapeHTML((p.roles||[]).join('  ·  '))}</div><div class="live-case-text"><strong>${escapeHTML(p.title)}</strong><p>${escapeHTML(p.summary)}</p><p>${escapeHTML(p.metric+' '+p.metricLabel)}</p></div>`;
    $('#project-preview-type').textContent=SIZE_NAMES[p.size]||'Маленькая';host.append(div);
  }
  function selectProject(next){
    slug=next;const p=project();if(!p)return;
    $('#project-empty').hidden=true;$('#project-editor').hidden=false;
    $('#editor-title').textContent=p.title;$('#editor-eyebrow').textContent=p.isNew?'НОВЫЙ ПРОЕКТ':'ИЗ КАТАЛОГА';
    $('#case-link').href=p.url||'/cases/'+slug+'/';
    for(const [id,key] of [['p-title','title'],['p-summary','summary'],['p-period','period'],['p-size','size'],['p-ink','ink'],['p-color-text','color'],['p-metric','metric'],['p-metric-label','metricLabel'],['p-url','url']]){const el=$('#'+id);if(el)el.value=p[key]||''}
    $('#p-slug').value=p.slug;$('#p-slug').disabled=!p.isNew;
    $('#p-color').value=/^#[0-9a-fA-F]{6}$/.test(p.color||'')?p.color:'#a8d2ff';
    for(const key of ['intro','problem','solution','result'])$('#p-detail-'+key).value=p.detail?.[key]||'';
    $('#p-managed').checked=!!p.managed;
    const roles=$('#p-roles');roles.replaceChildren();for(const role of ROLE_LIST){
      const label=document.createElement('label');label.className='role-option';
      label.innerHTML=`<input type="checkbox" value="${role}" ${(p.roles||[]).includes(role)?'checked':''}><span>${role}</span>`;
      label.querySelector('input').addEventListener('change',()=>{p.roles=$$('input:checked',roles).map(x=>x.value);p.managed=true;$('#p-managed').checked=true;markDirty();renderCardPreview(p)});
      roles.append(label);
    }
    populateImages(p);gallery(p);renderCardPreview(p);$('#delete-project').hidden=!p.isNew;filterList();
  }
  function createProject(){
    let i=1,slug0='new-project';while(state.projects[slug0+'-'+i])i++;
    const key=slug0+'-'+i;
    const project={slug:key,title:'Новый проект',summary:'Описание выполненной работы.',roles:['Дизайн'],period:'more',size:'large',color:'#b6d9fa',ink:'dark',metric:'',metricLabel:'',images:{desktop:'',tablet:'',mobile:''},url:'/cases/'+key+'/',isNew:true,managed:true,detail:{intro:'',problem:'',solution:'',result:'',gallery:[]}};
    state.projects[key]=project;markDirty();selectProject(key);toast('Проект создан. Заполните поля и сохраните.')
  }
  function duplicate(){const p=project();if(!p)return;const base=(p.slug+'-copy').slice(0,55);let key=base,i=2;while(state.projects[key])key=base+'-'+i++;
    const x=JSON.parse(JSON.stringify(p));x.slug=key;x.title+=' · копия';x.url='/cases/'+key+'/';x.isNew=true;x.managed=true;state.projects[key]=x;markDirty();selectProject(key)}
  function onTextField(event){const p=project();if(!p)return;const mapping={
    'p-title':'title','p-summary':'summary','p-period':'period','p-size':'size','p-ink':'ink','p-color-text':'color','p-metric':'metric','p-metric-label':'metricLabel','p-url':'url','p-color':'color'};
    if(mapping[event.target.id]){
      const field=mapping[event.target.id],val=event.target.value;
      p[field]=val;if(field!=='color'||/^#[\da-fA-F]{6}$/.test(val)){if(field==='color'){$('#p-color-text').value=val;$('#p-color').value=val}}
      if(field==='title')$('#editor-title').textContent=val;
      if(field==='url')$('#case-link').href=val;
      p.managed=true;$('#p-managed').checked=true;renderCardPreview(p);markDirty();return;
    }
    if(event.target.id.startsWith('p-detail-')){p.detail[event.target.id.replace('p-detail-','')]=event.target.value;markDirty();}
  }
  function renameProject(val){
    const p=project();if(!p||!p.isNew)return;
    const next=String(val).toLowerCase().normalize('NFKD').replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,72);
    if(!next||next===slug)return;if(state.projects[next]){toast('Такой адрес уже занят');$('#p-slug').value=slug;return}
    delete state.projects[slug];p.slug=next;p.url='/cases/'+next+'/';state.projects[next]=p;slug=next;
    $('#p-url').value=p.url;$('#case-link').href=p.url;markDirty();filterList();
  }
  function openTab(tab){$$('.navitem').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));$$('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+tab));if(tab==='pages')reloadPreview();}
  function initProjects(){
    const sel=$('#p-period');for(const period of state.periods){const option=document.createElement('option');option.value=period.id;option.textContent=period.title;sel.append(option)}
    $('#project-search').addEventListener('input',filterList);
    $('#add-project').onclick=createProject;$('#duplicate-project').onclick=duplicate;
    $('#delete-project').onclick=()=>{const p=project();if(!p?.isNew)return;if(!confirm(`Удалить ${p.title} из списка?`))return;delete state.projects[slug];slug=null;$('#project-editor').hidden=true;$('#project-empty').hidden=false;markDirty();filterList()};
    $('#p-managed').onchange=e=>{project().managed=e.target.checked;markDirty()};
    for(const id of ['p-title','p-summary','p-period','p-size','p-ink','p-color-text','p-metric','p-metric-label','p-url','p-color',...['intro','problem','solution','result'].map(x=>'p-detail-'+x)])$('#'+id).addEventListener('input',onTextField);
    $('#p-slug').addEventListener('change',e=>renameProject(e.target.value));
    $$('[data-upload]').forEach(input=>input.addEventListener('change',async e=>{
      const p=project();if(!p||!input.files[0])return;try{
        const url=await upload(input.files[0]);p.images[input.dataset.upload]=url;p.managed=true;$('#p-managed').checked=true;markDirty();populateImages(p);renderCardPreview(p);toast('Изображение добавлено');
      }catch(err){toast(err.message)}input.value='';
    }));
    $$('[data-clear]').forEach(btn=>btn.onclick=()=>{const p=project();if(!p)return;p.images[btn.dataset.clear]='';p.managed=true;markDirty();populateImages(p);renderCardPreview(p)});
    $('#p-gallery-upload').onchange=async e=>{const p=project();if(!p)return;for(const file of [...e.target.files]){try{const url=await upload(file);p.detail.gallery.push(url)}catch(err){toast(err.message)}}markDirty();gallery(p);e.target.value=''};
    filterList();selectProject(Object.keys(state.projects)[0]);
  }
  async function pages(){
    let entries=[];try{const r=await fetch('/api/cms/pages');entries=await r.json()}catch{}
    const sel=$('#page-select');sel.replaceChildren();for(const item of entries){const opt=document.createElement('option');opt.value=item.path;opt.textContent=item.title+' · '+item.path;sel.append(opt)};
    if(!entries.length){const opt=document.createElement('option');opt.value='/';opt.textContent='Главная';sel.append(opt)}
    sel.value='/';sel.onchange=()=>{activePage=sel.value;reloadPreview()};
    $('#reload-preview').onclick=reloadPreview;
    $('#apply-picked').onclick=applyPicked;
    $('#remove-picked').onclick=removePicked;
    $('#picked-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const url=await upload(file);$('#picked-image-url').value=url;toast('Изображение загружено')}catch(err){toast(err.message)}e.target.value=''};
    window.addEventListener('message',event=>{
      if(event.origin!==location.origin||event.source!==$('#site-preview').contentWindow)return;
      const info=event.data;if(info?.source!=='slepzof-cms'||info.kind!=='picked')return;
      picked=info;$('#picked-fields').hidden=false;$('#pick-help').hidden=true;
      $('#picked-location').textContent=info.path+'  ·  '+info.tag+'  ·  '+info.selector;
      const isImage=info.type==='image'||info.type==='background';
      $('#picked-text-field').hidden=isImage;$('#picked-image-field').hidden=!isImage;$('#global-row').hidden=isImage;
      $('#picked-text').value=isImage?'':info.value;
      $('#picked-image-url').value=info.type==='image'?info.value:'';
      $('#picked-link-field').hidden=!(info.tag==='A');
      if(info.tag==='A'){
        const link=$('#site-preview').contentDocument.querySelector(info.selector);$('#picked-link-url').value=link?.getAttribute('href')||'';
      }
      $('#picked-global').checked=false;
      updatePageCount();
    });
    updatePageCount();
  }
  function reloadPreview(){const url=activePage+(activePage.includes('?')?'&':'?')+'cmsEdit=1&t='+Date.now();$('#site-preview').src=url;$('#open-preview').href=activePage;$('#preview-location').textContent=activePage;picked=null;$('#picked-fields').hidden=true;$('#pick-help').hidden=false;updatePageCount()}
  function updatePageCount(){let n=(state.pageEdits?.[activePage]||[]).length;$('#page-edit-count').textContent=n?`${n} изменений для этой страницы`:'Нет изменений на этой странице'}
  function applyPicked(){
    if(!picked)return;
    const isImage=picked.type!=='text';let value=isImage?$('#picked-image-url').value.trim():$('#picked-text').value;
    if(isImage&&!value.startsWith('/')){toast('Сначала загрузите изображение');return}
    if(!state.pageEdits)state.pageEdits={};const list=state.pageEdits[activePage]||(state.pageEdits[activePage]=[]);
    const entry={selector:picked.selector,type:picked.type,value};
    if(picked.tag==='A')entry.href=$('#picked-link-url').value.trim();
    const pos=list.findIndex(v=>v.selector===entry.selector);if(pos>=0)list[pos]=entry;else list.push(entry);
    if(!isImage && $('#picked-global').checked && picked.value && picked.value!==value){
      state.globalText=state.globalText||[];
      const i=state.globalText.findIndex(e=>e.from===picked.value);
      if(i>=0)state.globalText[i].to=value;else state.globalText.push({from:picked.value,to:value});
    }
    try{
      const doc=$('#site-preview').contentDocument,el=doc?.querySelector(picked.selector);
      if(el){if(picked.type==='text')el.textContent=value;else if(picked.type==='image')el.src=value;else el.style.backgroundImage=`url("${value}")`;if(entry.href&&el.tagName==='A')el.href=entry.href}
    }catch{}
    markDirty();updatePageCount();toast('Правка добавлена. Теперь нажмите «Сохранить изменения».');
  }
  function removePicked(){if(!picked)return;const list=state.pageEdits?.[activePage];if(!list)return;const i=list.findIndex(e=>e.selector===picked.selector);if(i>=0){list.splice(i,1);markDirty();reloadPreview();toast('Правка удалена')}else toast('Для элемента нет сохранённых изменений')}
  function downloadJSON(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='SLEPZOF_content_backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  function initBackup(){
    $('#download-json').onclick=downloadJSON;
    $('#import-json').onchange=async event=>{const f=event.target.files[0];if(!f)return;let next;
      try{next=JSON.parse(await f.text());if(next.version!==1||!next.projects||!next.periods)throw Error('Неверный формат данных')}
      catch(e){toast('Не удалось прочитать файл: '+e.message);return}
      if(!confirm('Заменить текущие данные содержимым резервной копии?'))return;
      state=next;slug=null;markDirty();const sel=$('#p-period');sel.replaceChildren();for(const period of state.periods){const option=document.createElement('option');option.value=period.id;option.textContent=period.title;sel.append(option)}filterList();selectProject(Object.keys(state.projects)[0]);toast('Резервная копия загружена. Для фиксации нажмите «Сохранить».');
    }
  }
  async function boot(){
    try{const [status,source]=await Promise.all([fetch('/api/cms/status'),fetch('/cms/data.json',{cache:'no-store'})]);
      if(!status.ok)throw Error('Панель работает только через локальный server.py');if(!source.ok)throw Error('Данные проектов не найдены');
      state=await source.json();initProjects();pages();initBackup();setSaved();
    }catch(e){$('#save-status').textContent='Ошибка загрузки';toast(e.message);console.error(e)}
  }
  $('#save').onclick=save;
  $$('.navitem').forEach(button=>button.onclick=()=>openTab(button.dataset.tab));
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
  boot();
})();
