/* Featured cases: animated expansion/collapse with return to section heading. */
(()=>{
  const section=document.querySelector('#selected.sx25b3-selected');
  if(!section) return;
  const button=section.querySelector('.sx25b3-toggle');
  const label=button?.querySelector('.sx25b3-toggle-text');
  const shell=section.querySelector('.sx25b3-extra-shell');
  const inner=shell?.querySelector('.sx25b3-extra-inner');
  if(!button || !label || !shell || !inner || inner.children.length!==3) return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  let expanded=false;
  let animId=0;
  const setAccessibility=(isOpen)=>{
    button.setAttribute('aria-expanded',String(isOpen));
    label.textContent=isOpen?'Скрыть проекты':'Показать ещё 3 проекта';
    shell.setAttribute('aria-hidden',String(!isOpen));
    shell.inert=!isOpen;
  };
  const finish=()=>{
    if(expanded){shell.style.height='auto';}
    else {
      shell.hidden=true;
      shell.style.height='0px';
      // One final alignment after the last row leaves document flow; prevents scroll anchoring jumps.
      requestAnimationFrame(()=>section.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'}));
    }
  };
  shell.addEventListener('transitionend',(event)=>{
    if(event.target===shell && event.propertyName==='height')finish();
  });
  button.addEventListener('click',()=>{
    const id=++animId;
    const next=!expanded;
    expanded=next;
    // Start returning to the section heading before reducing the page's height.
    if(!next){
      section.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'});
    }
    if(next){
      shell.hidden=false;
      shell.style.height='0px';
      shell.classList.remove('is-open');
      setAccessibility(true);
      if(reduce.matches){shell.classList.add('is-open');finish();return;}
      void shell.offsetHeight;
      requestAnimationFrame(()=>{
        if(animId!==id)return;
        shell.classList.add('is-open');
        shell.style.height=inner.scrollHeight+'px';
      });
    }else{
      // Freeze auto height first, then interpolate to zero; hide only when done.
      shell.style.height=shell.getBoundingClientRect().height+'px';
      setAccessibility(false);
      if(reduce.matches){shell.classList.remove('is-open');finish();return;}
      void shell.offsetHeight;
      requestAnimationFrame(()=>{
        if(animId!==id)return;
        shell.classList.remove('is-open');
        shell.style.height='0px';
      });
    }
  });
  window.addEventListener('resize',()=>{
    if(expanded && !shell.hidden && shell.style.height!=='auto'){
      shell.style.height=inner.scrollHeight+'px';
    }
  },{passive:true});
})();
