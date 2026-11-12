/* SLEPZOF Work Experience: orchestration ONLY.
   Data: js/data/work-experience.js
   Components: js/system/portfolio-cards.js
   Styles: css/system/portfolio-projects.css + layout/experience.css
   Slider: js/v25-block3-slider-v3.js (shared with Featured). */
(()=>{
 "use strict";
 const section=document.querySelector("#experience");
 const data=window.SlepzofWorkData;
 const components=window.SlepzofCards;
 if(!section||section.dataset.sx42Ready||!data||!components)return;
 const heading=section.querySelector(".sx-experience-head");
 if(!heading)return;
 const originalCards=new Map();
 for(const card of section.querySelectorAll(".sx-stage a.sx-tile-card[data-slug]")){
  if(!originalCards.has(card.dataset.slug))originalCards.set(card.dataset.slug,card);
 }
 const selected=new Map();
 for(const card of document.querySelectorAll("#selected a.sx25b3-card[data-sx25b3-slug]")){
  selected.set(card.dataset.sx25b3Slug,card);
 }
 const el=(tag,cls,content)=>{
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(content!==undefined)node.textContent=content;
  return node;
 };
 function details(slug,period){
  const legacy=originalCards.get(slug);
  const featured=selected.get(slug);
  const extra=data.extraProjects[slug];
  const fromPdf=data.pdfPeriodCards?.[period.id]?.[slug]||null;
  // FitnessPro's original uploaded cover was filed under the normalized
  // "fitness-pro" slug. Use the actual source cover, never placeholder artwork.
  const sourceSlug=slug==="fitnesspro"?"fitness-pro":slug;
  const uploaded=data.uploadedCovers.has(sourceSlug)||slug==="rdmart"||slug==="nda-web3";
  if(!uploaded&&!legacy&&!featured)return null;
  // The source PDF registry is authoritative for every published work card.
  // Do not reintroduce copy from older marketing data or legacy DOM fallbacks.
  if(!fromPdf||!fromPdf.name||!fromPdf.title||!fromPdf.description||
     !fromPdf.category||!fromPdf.year||!fromPdf.tone||
     !Array.isArray(fromPdf.metric)||fromPdf.metric.length!==2){
    console.error("Missing approved PDF data:",period.id,slug);
    return null;
  }
  const name=fromPdf.name;
  const title=fromPdf.title;
  const description=fromPdf.description;
  const category=fromPdf.category;
  const year=fromPdf.year;
  const metric={value:fromPdf.metric[0],label:fromPdf.metric[1]};
  const cover=uploaded?"/assets/cases/"+sourceSlug+"/cover-work."+(slug==="rdmart"||slug==="nda-web3"?"svg":"png"):
    (featured?.querySelector(".sx25b3-art")?.getAttribute("src")||
     legacy?.querySelector(".sx-card-image img")?.getAttribute("src"));
  if(!cover)return null;
  return {
    slug,mediaSlug:sourceSlug,name,title,description,category,year,metric,cover,
    tone:fromPdf.tone,
    href:legacy?.getAttribute("href")||featured?.getAttribute("href")||extra?.[3]||"/projects/",
    className:"sx42-card"
  };
 }
 function emphasize(container,text,phrases){
  let remainder=[text];
  for(const phrase of phrases||[]){
   if(!phrase)continue;
   const next=[];
   for(const entry of remainder){
    if(typeof entry!=="string"){next.push(entry);continue;}
    const parts=entry.split(phrase);
    parts.forEach((part,i)=>{
     if(part)next.push(part);
     if(i<parts.length-1)next.push({bold:phrase});
    });
   }
   remainder=next;
  }
  for(const part of remainder){
   container.append(typeof part==="string"?document.createTextNode(part):
     el("strong","",part.bold));
  }
 }
 const title=heading.querySelector("h2");
 if(title)title.textContent="Мой опыт работы.";
 heading.querySelector(".sx-eyebrow")?.remove();
 heading.querySelector("p")?.remove();
 const allCases=heading.querySelector("a");
 if(allCases){allCases.textContent="Все кейсы ›";allCases.href="/projects/";}
 const newInner=el("div","sx42-inner");
 for(const period of data.periods){
  const stage=el("section","sx42-period");
  stage.id=period.id;stage.dataset.period=period.id;
  const introduction=el("div","sx42-period-heading");
  const main=el("div","sx42-period-main");
  main.append(el("p","sx42-date",period.date),el("h3","sx42-period-name",period.name));
  const description=el("p","sx42-description");
  emphasize(description,period.desc,data.emphasis[period.id]);
  main.append(description,el("p","sx42-role",period.role));
  introduction.append(main);
  stage.append(introduction);
  const shell=el("div","sx42-carousel");
  const rail=el("div","sx42-rail");
  rail.tabIndex=0;
  rail.setAttribute("role","region");
  rail.setAttribute("aria-roledescription","карусель");
  rail.setAttribute("aria-label","Проекты периода: "+period.name);
  for(const slug of period.slugs){
   const project=details(slug,period);
   if(!project)continue;
   rail.append(components.createProject(project));
  }
  for(const review of data.reviews[period.id]||[]){
   const card=components.createReview(review);
   const before=review.before?rail.querySelector('[data-slug="'+review.before+'"],[data-review-id="'+review.before+'"]'):null;
   const after=review.after?rail.querySelector('[data-slug="'+review.after+'"],[data-review-id="'+review.after+'"]'):null;
   rail.insertBefore(card,before||after?.nextSibling||null);
  }
  if(rail.children.length){
   shell.append(rail);
   // Reuse the SAME two real SVG controls from Featured Projects.
   const sourceControls=document.querySelector("#selected .sx25b3-controls");
   if(sourceControls){
    const controls=sourceControls.cloneNode(true);
    controls.classList.add("sx42-featured-controls");
    controls.setAttribute("aria-label","Листать проекты: "+period.name);
    shell.append(controls);
   }
   stage.append(shell);
  }
  newInner.append(stage);
 }
 // Replace only the legacy experience stages. Other sections stay untouched.
 for(const wrap of section.querySelectorAll(":scope > .sx-wrap")){
  if(wrap.contains(heading))continue;
  wrap.remove();
 }
 section.append(newInner);
 section.classList.add("sx42-ready");
 section.dataset.sx42Ready="1";
 const observer="IntersectionObserver" in window?new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   entry.target.classList.add("sx42-visible");
   observer.unobserve(entry.target);
  }
 },{rootMargin:"0px 0px -6% 0px",threshold:0.04}):null;
 for(const stage of newInner.children){
  if(observer)observer.observe(stage);
  else stage.classList.add("sx42-visible");
 }
})();
