/* Set initial catalogue filter on the dedicated role pages, without replacing the existing catalogue UI. */
(()=>{
 const current=document.currentScript?.dataset?.sxFocus;
 if(!current)return;
 const role={design:'Дизайн',marketing:'Маркетинг',leadership:'Руководство'}[current];
 if(!role)return;
 document.addEventListener('DOMContentLoaded',()=>{
   const button=[...document.querySelectorAll('.sx-filters button')].find(b=>b.dataset.filter===role);
   if(button)button.click();
 });
})();
