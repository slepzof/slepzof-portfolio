/* SLEPZOF Design System | Cards v1.
   One DOM contract for Featured, Beyond UI and Work Experience.
   Figma geometry lives in css/system/tokens.css; the same CSS controls all. */
(()=>{
  "use strict";
  const root=window;
  const ASSET="/assets/";
  const tones={
    "echo-app":"light","vita-ai":"light","luch":"light",
    "city-exchange":"light","digital-lawyer":"light",
    "pixel-drop":"light","aicors":"light","psychology":"light",
    "domvrach":"light","pilots-app":"light","sailor-planner":"light",
    "2space":"light","numa":"light","glavbankrot":"light",
    "transport-tech":"light","trips":"light","pelikan":"light",
    "media-garant":"light","invaprom":"light","fitness-pro":"light",
    "parking":"light","restomesto":"light","history-app":"light"
  };
  function el(tag,cls,text){
    const node=document.createElement(tag);
    if(cls)node.className=cls;
    if(text!==undefined&&text!==null)node.textContent=String(text);
    return node;
  }
  function toneFor(slug,requested){
    return requested||tones[slug]||"dark";
  }
  function setTone(card,tone){
    const light=tone==="light";
    card.dataset.tone=light?"light":"dark";
    card.classList.toggle("ds-project-card--light",light);
    card.classList.toggle("sx25b3-card-light",light);
  }
  function createProject(data){
    const card=el("a","sx25b3-card ds-project-card"+(data.className?" "+data.className:""));
    card.href=data.href||"/projects/";
    card.dataset.slug=data.slug;
    card.setAttribute("aria-label","Открыть кейс "+(data.name||data.title||data.slug));
    setTone(card,toneFor(data.slug,data.tone));
    const art=el("img","sx25b3-art ds-project-card__art");
    art.src=data.cover;art.alt="";art.loading="lazy";art.decoding="async";
    art.width=1424;art.height=2048;
    card.append(art);
    const copy=el("div","sx25b3-card-copy ds-project-card__content");
    const meta=el("div","sx25b3-meta ds-project-card__meta");
    const parts=[data.name,data.category,data.year].filter(Boolean);
    parts.forEach((part,i)=>{
      if(i)meta.append(el("i"));
      meta.append(el("span","",part));
    });
    copy.append(meta,el("h3","",data.title||data.name||data.slug));
    if(data.description)copy.append(el("p","",data.description));
    card.append(copy);
    const footer=el("div","sx25b3-card-foot ds-project-card__foot");
    if(data.metric&&data.metric.value){
      const metric=el("div","sx25b3-metric ds-project-metric");
      const left=el("img","sx25b3-laurel");
      left.src=ASSET+"icons/featured-v17/laurel-l.svg";
      left.alt="";left.setAttribute("aria-hidden","true");
      const right=el("img","sx25b3-laurel");
      right.src=ASSET+"icons/featured-v17/laurel-r.svg";
      right.alt="";right.setAttribute("aria-hidden","true");
      metric.append(left,el("strong","",data.metric.value),right);
      if(data.metric.label)metric.append(el("span","",data.metric.label));
      footer.append(metric);
    }
    const arrow=el("span","sx25b3-arrow ds-project-arrow");
    arrow.setAttribute("aria-hidden","true");
    const icon=el("img");icon.src=ASSET+"featured-v25-block3/arrow.svg";
    icon.alt="";icon.setAttribute("aria-hidden","true");
    arrow.append(icon);
    footer.append(arrow);
    card.append(footer);
    return card;
  }
  function createReview(review){
    const card=el("article","sx42-card sx42-review ds-review-card");
    card.dataset.reviewId=review.id;
    card.setAttribute("aria-label","Отзыв "+review.name+", "+review.role);
    const quote=el("img","ds-review-card__quote");
    quote.src=ASSET+"icons/experience/quote.svg";
    quote.alt="";quote.width=32;quote.height=32;
    quote.setAttribute("aria-hidden","true");
    card.append(quote);
    card.append(el("p","ds-review-card__lead",review.lead));
    if(review.body)card.append(el("p","ds-review-card__body",review.body));
    const portrait=el("img","ds-review-card__portrait");
    portrait.src=ASSET+"reviews/"+review.id+".png";
    portrait.loading="lazy";portrait.decoding="async";
    portrait.alt=review.name;
    card.append(portrait);
    const author=el("p","ds-review-card__author",review.name+" · "+review.role);
    card.append(author);
    return card;
  }
  function hydrate(){
    // Existing Featured/Beyond cards are already server-rendered, so retain
    // their exact approved content and only attach the same component identity.
    for(const card of document.querySelectorAll(
      "#selected a.sx25b3-card, #beyond-ui a.sx28-card"
    )){
      card.classList.add("ds-project-card");
      const slug=card.dataset.sx25b3Slug||card.dataset.slug||"";
      setTone(card,toneFor(slug,card.classList.contains("sx25b3-card-light")?"light":null));
    }
  }
  root.SlepzofCards=Object.freeze({createProject,createReview,hydrate,toneFor});
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",hydrate,{once:true});
  }else hydrate();
})();
