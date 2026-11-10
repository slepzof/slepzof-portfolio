/* v12. Preserves v11 pages and project catalog; changes only presentation metadata. */
(() => {
  const shades = [
    ['#058ffd', false], ['#f64b38', false], ['#1bb951', false],
    ['#7567ec', false], ['#ffde35', true], ['#a7c6ee', true],
    ['#e8ded3', true], ['#3b4faa', false], ['#c9d2ff', true],
    ['#06b6d8', false], ['#f4c8b6', true], ['#d8eeb7', true]
  ];
  const explicit = {
    'hash-hedge': ['#ffdb33', true], 'wsct':['#dfe8fc',true],
    'onlinesklad':['#b6d9f7',true], 'sober-driver':['#7264e7',false],
    'duckmaster':['#15b851',false], 'apple-bar':['#f46c49',false],
    'pixel-drop':['#02aef5',false], 'engine-leads':['#18b64b',false],
    'automotive':['#ef483f',false], 'automotive-automation':['#5d63dc',false],
    'echo-app':['#087dff',false], 'vita-ai':['#0584f6',false],
    'parking':['#f24d4d',false], 'bonape-training':['#685ee2',false],
    'restar':['#ded3e9',true], 'media':['#ffda32',true],
    'salute':['#ff492d',false], 'salute-telegram':['#ff4e30',false],
    'artsavur':['#7a64ee',false], 'greenbox':['#18bb59',false],
    'rsk':['#ffda32',true], 'exocure':['#3379ee',false],
    'meydan-racecourse':['#3d72e2',false], 'celtway':['#c8b7f9',true],
    'te-zgo':['#ffcf33',true], 'moonlight':['#2f3e88',false],
    'izum':['#d9c6eb',true], 'myasnoy-dvor':['#f04b34',false],
    'papa-pizza':['#fce276',true], 'mobilka34':['#247cef',false]
  };
  function colorOf(slug) {
    if(explicit[slug]) return explicit[slug];
    let sum=2166136261;for(const ch of slug){sum=(sum ^ ch.charCodeAt(0))*16777619 >>>0;}
    return shades[sum%shades.length];
  }
  function paint(card){
    const slug=card.dataset.slug || card.href?.replace(/\/$/,'').split('/').pop() || '';
    const [color,dark]=colorOf(slug);
    card.style.setProperty('--sx-tile-color',color);
    card.classList.add('sx-v12-card');
    card.classList.toggle('sx-ink-dark',dark);
    if(card.querySelector('.sx-card-metric strong')){
      card.classList.add('sx-has-stat');
    }
    const img=card.querySelector('.sx-card-image img');
    if(!img){card.classList.add('sx-no-image');return}
    // Most v11 covers are deliberate low-detail placeholders. Neutralize their white
    // backgrounds on vivid cards. A new real mockup is detected automatically.
    const classify=()=>{
      if(!img.naturalWidth || !img.naturalHeight)return;
      try {
        const c=document.createElement('canvas');c.width=36;c.height=24;
        const ctx=c.getContext('2d',{willReadFrequently:true});
        ctx.drawImage(img,0,0,36,24);
        const px=ctx.getImageData(0,0,36,24).data;
        const uniq=new Set();
        for(let i=0;i<px.length;i+=4){
          uniq.add(`${px[i]>>5}-${px[i+1]>>5}-${px[i+2]>>5}`);
        }
        card.classList.toggle('sx-placeholder-art',uniq.size<=14);
      }catch{card.classList.remove('sx-placeholder-art')}
    };
    if(img.complete && img.naturalWidth)classify();
    else img.addEventListener('load',classify,{once:true});
  }
  document.querySelectorAll('.sx-tile-card').forEach(paint);
  // The v11 catalog creates its mosaic on DOMContentLoaded. It also moves nodes,
  // so paint only after it finishes its own synchronous initialization.
  const catalog=document.querySelector('.sx-catalog-body');
  if(catalog){
    const obs=new MutationObserver(()=>{
      catalog.querySelectorAll('.sx-tile-card:not(.sx-v12-card)').forEach(paint);
      catalog.querySelectorAll('.sx-mosaic').forEach(grid=>grid.classList.add('sx-v12-mosaic'));
    });
    obs.observe(catalog,{subtree:true,childList:true});
    catalog.querySelectorAll('.sx-tile-card:not(.sx-v12-card)').forEach(paint);
    catalog.querySelectorAll('.sx-mosaic').forEach(grid=>grid.classList.add('sx-v12-mosaic'));
  }
  document.querySelectorAll('.sx-stage .sx-mosaic').forEach(grid=>grid.classList.add('sx-v12-mosaic'));
  // Cover images stay original and can be replaced in assets/cases/<slug>/cover.webp.
})();
