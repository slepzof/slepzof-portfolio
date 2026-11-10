/* v25: the shared menu and catalog's explicit Design / Marketing / Development links. */
(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded', function(){
    var nav=document.querySelector('.sx25-nav'), menu=document.querySelector('.sx25-menubutton');
    // v10 initializes the same menu on a different selector, so use its existing listener.
    if(nav){
      nav.querySelectorAll('.sx25-navlinks a').forEach(function(a){a.addEventListener('click', function(){nav.classList.remove('sx-open');if(menu)menu.setAttribute('aria-expanded','false');});});
    }
    var code=new URLSearchParams(location.search).get('focus');
    var type={design:'Дизайн',marketing:'Маркетинг',development:'Разработка'}[code];
    if(type){
      var btn=[].slice.call(document.querySelectorAll('.sx-filters button')).find(function(el){return el.dataset.filter===type;});
      if(btn){btn.click(); var search=document.querySelector('.sx-catalog-body'); if(search){setTimeout(function(){search.scrollIntoView({block:'start',behavior:'smooth'});},120);}}
    }
  });
})();
