(() => {
  const extensions = ['webp','jpg','png','jpeg'];
  const probe = url => new Promise(resolve => { const i=new Image(); i.onload=()=>resolve(url);i.onerror=()=>resolve(null);i.src=url;});
  async function gather(folder,max) {
    const root='/assets/cases/'+folder+'/';
    try { const r=await fetch(root+'gallery.json',{cache:'no-cache'});if(r.ok){const names=await r.json();if(Array.isArray(names)&&names.length)return names.map(n=>root+encodeURIComponent(n));}}catch{}
    const list=[];
    for(let n=1;n<=Math.min(max,150);n++){
      const num=String(n).padStart(2,'0');let found=null;
      for(const ext of extensions){found=await probe(root+num+'.'+ext);if(found)break;}
      if(!found)break; list.push(found);
    }
    return list;
  }
  function dialog(src,alt) {
    const layer=document.createElement('div');layer.className='v7-gallery-dialog';layer.role='dialog';layer.setAttribute('aria-label','Просмотр экрана');
    const img=document.createElement('img');img.src=src;img.alt=alt;
    const close=document.createElement('button');close.className='v7-gallery-close';close.textContent='×';close.setAttribute('aria-label','Закрыть');
    const off=()=>{document.removeEventListener('keydown',key);layer.remove()};
    const key=e=>{if(e.key==='Escape')off()};
    document.addEventListener('keydown',key);close.addEventListener('click',off);layer.addEventListener('click',e=>{if(e.target===layer)off()});layer.append(img,close);document.body.append(layer);
  }
  async function init(el) {
    const folder=el.dataset.gallery;if(!folder)return;
    const images=await gather(folder,Number(el.dataset.max)||80);
    if(!images.length)return;
    el.replaceChildren();images.forEach((path,i)=>{const btn=document.createElement('button');btn.className='v7-gallery-photo';btn.type='button';btn.setAttribute('aria-label','Открыть экран '+(i+1));const im=new Image();im.loading='lazy';im.src=path;im.alt='Экран '+(i+1);im.onload=()=>{const ratio=im.naturalWidth/im.naturalHeight;btn.classList.add(ratio>1.3?'landscape':ratio>.85?'square':'portrait')};btn.append(im);btn.addEventListener('click',()=>dialog(path,im.alt));el.append(btn)})
  }
  document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('.v7-autogallery').forEach(init));
})();
