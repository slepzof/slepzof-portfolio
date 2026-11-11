/* SLEPZOF / Work experience v42.
   Recompose EXISTING project cards, do not duplicate large cover assets.
   All stages use the already-approved Featured Project slider rhythm.
   Original article and case links remain untouched. */
(()=>{
 "use strict";
 const section=document.querySelector("#experience");
 if(!section||section.dataset.sx42Ready)return;
 section.dataset.sx42Ready="1";
 const target=section.querySelector(".sx-experience-head");
 const root=section.querySelector(":scope > .sx-wrap");
 if(!root)return;
 const originalStages=[...section.querySelectorAll(".sx-stage")];
 const byId=new Map(originalStages.map(el=>[el.id,el]));
 // Keep originals available until all cards have been moved. Avoid creating
 // broken links or made-up covers for work absent from the repository.
 const originalCards=new Map();
 for(const stage of originalStages){
   for(const a of stage.querySelectorAll("a.sx-tile-card[data-slug]")){
     if(!originalCards.has(a.dataset.slug))originalCards.set(a.dataset.slug,a);
   }
 }
 const periods=[
  {id:"auto-2026",date:"Август 2026 - Октябрь 2026",name:"Автомобильная тематика",role:"Частная практика · NDA до 2030 года",desc:"В автомобильный бизнес я пришёл, чтобы проверить себя на прочность. До моего появления многое держалось на сарафанном радио, ручной обработке заявок и практически полном отсутствии цифровых инструментов. За несколько месяцев выстроил брендинг, маркетинговую стратегию, 27 воронок продаж, систему подбора товаров и автоматизацию колл-центра. В отдельных направлениях удалось получить 79 покупок и 127 успешных продаж за два месяца. Здесь я отвечал уже не за отдельный сайт или рекламу, а за то, как работает вся цифровая часть бизнеса. Подробности ограничены NDA до 2030 года.",slugs:["automotive","engine-leads","automotive-automation"],facts:[["4","дня от начала работы до первых продаж"],["79","покупок в сложной нише"],["127","успешных продаж за два месяца"]]},
  {id:"summer-2026",date:"Июнь 2026 - Август 2026",name:"Проектная работа",role:"Lead Product Designer, CPO",desc:"После года работы над одной торговой экосистемой я резко сменил ритм. За неполные три месяца поработал над 14 проектами из совершенно разных сфер: от платёжных систем и CRM до игровых продуктов и аналитики. Где-то отвечал только за дизайн, а где-то подключал разработку и маркетинг. Например, полный цикл дизайна платёжного продукта занял 4 дня, в RSK количество заявок выросло на 21,6%, а для Dead Choices удалось проработать 171 сюжетную сцену. Самым сложным было не количество задач, а необходимость быстро разбираться в новом бизнесе и сразу находить рабочие решения.",slugs:["vremena-goda","rsk","payment-gateway","exocure","pixel-drop","dead-choices","aicors","vezu-edu","meydan-racecourse","the-heights","hub71","exo-fleet-brain","exo-vision","exo-os","al-maktoum"],facts:[["+21,6%","рост заявок в RSK"],["4","дня на полный цикл дизайна"],["171","сюжетная сцена Dead Choices"]]},
  {id:"hash",date:"Апрель 2025 - Май 2026",name:"Hash Hedge & WSCT",role:"Lead Product Designer",desc:"Всё началось с задачи по разработке рекламной воронки, а закончилось полноценной работой над торговой экосистемой. Больше года я занимался маркетинговым сайтом, личным кабинетом, торговым терминалом, платежами и системой контроля рисков. Только в обновлённом личном кабинете проработал около 465 состояний интерфейса. Отдельным направлением стал WSCT, турнирная платформа для трейдеров, для которой я разработал 6 маркетинговых воронок. Самой интересной частью работы было превращать сложную финансовую логику в интерфейс, которым человек может пользоваться без постоянных объяснений.",slugs:["hash-hedge","wsct"],facts:[["465","состояний интерфейса"],["6","маркетинговых воронок WSCT"]]},
  {id:"private-2025",date:"Декабрь 2024 - Апрель 2025",name:"Частная практика",role:"Lead Product Designer · Маркетинг",desc:"После игровых проектов я снова вернулся к частной практике, но теперь брался за гораздо более сложные задачи. В подборку вошли финансовые сервисы, анонимные мессенджеры, медицинские платформы, игровые Telegram Mini Apps и продукты с несколькими ролями. Работал как над отдельными сценариями, так и над полноценными продуктами с нуля. Среди результатов этих проектов: 841 тыс. MAU у Chatus, 217 тыс. MAU у 1Case, 34,2 тыс. прохождений StarHash Benchmark и 182 заявки за неделю у 2Space. Это был период постоянного переключения между индустриями, где времени на долгое погружение практически не оставалось.",slugs:["echo-app","vlad-bykov","twin-finder","propuska","parking","media-garant","chatus","vita-ai","internship-platform","starhash-benchmark","luch","2space","forfis-new-site","digital-lawyer","star-exchange","city-exchange","greenbox","invaprom","crush","virus","bill-split","pilots-app","vybor","sailor-planner","bbets","logirus","marcodo","aicors","eurotek","neurostar"],facts:[["841k","MAU у Chatus"],["34,2k","прохождений StarHash Benchmark"],["182","заявки за неделю у 2Space"]]},
  {id:"nutaku",date:"Декабрь 2024 - Февраль 2025",name:"Nutaku Projects · Аутсорс-дизайн",role:"UX Designer · Почасовое сотрудничество",desc:"В Nutaku я работал на почасовой ставке, подключался к отдельным задачам по интерфейсам игр 18+, где требовалось переработать UX, игровые механики или монетизацию. Horny Villa после переработки магазина получила примерно на 174% больше покупок, маркетинговые воронки Poker N Sluts принесли свыше $60 тыс. за три месяца, для Fab Fantasy я спроектировал 712 игровых сцен. My AI Slut я практически с нуля собрал и передал заказчику; продвижением занималась другая команда, позже проект достиг 1,5 млн пользователей.",slugs:[],facts:[["712","игровых сцен"],["+174%","покупок в Horny Villa"],["1,5M","пользователей My AI Slut позднее"]]},
  {id:"duck",date:"Август 2024 - Декабрь 2024",name:"DuckMaster & Game of Year",role:"Lead Product Designer",desc:"После полутора лет управления большими командами я решил вернуться к созданию продуктов своими руками. В DuckMaster всё началось с небольшого тестового задания, а уже за первые 4 дня я полностью переработал UI/UX игры с аудиторией 3,5 млн MAU. Дальше начались месяцы постоянных релизов, A/B-тестов и развития игровой экономики. Конверсия в первую платную прокрутку выросла с 4% до 19,2%, а D7 Retention с 4% до 39%. Отдельные игровые активности собирали $40–50 тыс. пользовательских платежей за 96 часов. Позже за 6 дней мы создали анимированный MVP Game of Year для инвестора.",slugs:["duckmaster","game-of-year"],facts:[["3,5M","активных пользователей в месяц"],["19,2%","конверсия в первую платную прокрутку"],["6","дней до MVP Game of Year"]]},
  {id:"bonape",date:"Январь 2023 - Август 2024",name:"BONAPE · SALUTE · ARTSAVUR",role:"Предпринимательство · Управление командами",desc:"Параллельно развивал три направления: обучение, маркетинг и продуктовую разработку. BONAPE отвечала за обучение, SALUTE за трафик и рекламные воронки, ARTSAVUR за дизайн и разработку цифровых продуктов. Управлял командами с более чем 50 сотрудниками в прямом подчинении и проектами из разных отраслей.",slugs:["bonape-training","salute","artsavur","apple-bar","aquator","yacht-center","jet-hunter","greenbox","slab-service","china-car","domodel","she-talks","rocket-jet","numa"],facts:[["3","бизнес-направления одновременно"],["50+","сотрудников в прямом подчинении"]]},
  {id:"onlinesklad",date:"Июнь 2022 - Январь 2023",name:"Onlinesklad",role:"Product Designer",desc:"Работа над интерфейсами интернет-магазина и внутренней системой управления товаром, заказами и логистикой.",slugs:["onlinesklad"],facts:[]},
  {id:"sober",date:"Декабрь 2021 - Май 2022",name:"Трезвый Водитель",role:"Product Designer",desc:"Разработка цифровой экосистемы сервиса: интерфейсы клиента, водителя, администратора и публичный сайт.",slugs:["sober-driver","sober-driver-app","sober-driver-driver","sober-driver-admin","sober-driver-web"],facts:[]},
  {id:"forfis",date:"Ноябрь 2020 - Декабрь 2021",name:"FORFIS",role:"Дизайн и разработка",desc:"Работа над коммерческими интерфейсами, сайтами, приложениями и цифровыми продуктами для заказчиков разных отраслей.",slugs:["pelikan","fly-ball","vodacom","psychology","hamilya-shop","hamilya-astro","blog-hamilya","eyebogo","treasures-pskov","history-app","transport-tech","tezgo","pizza-dashboard","deli-she","diary-book","restomesto","volgu-site"],facts:[]},
  {id:"2020-projects",date:"Январь 2020 - Ноябрь 2020",name:"Частная практика",role:"Дизайн · Разработка",desc:"Первые самостоятельные коммерческие проекты: сайты, магазины и цифровые сервисы, где отвечал за дизайн и реализацию.",slugs:["myasnoy-dvor","papa-pizza","khleb-iz-tandyra","moonlight","chexolchik","mobilka34","baraholka34","izum"],facts:[]},
  {id:"media",date:"Сентябрь 2016 - Декабрь 2019",name:"Медийные проекты & RESTAR",role:"Собственные проекты",desc:"Работа с медиапроектами, аудиторией и первыми коммерческими продуктами, включая RESTAR.",slugs:["restar"],facts:[]}
 ];
 function el(tag,cl,content){const x=document.createElement(tag);if(cl)x.className=cl;if(content!==undefined)x.textContent=content;return x;}
 const originalByPeriod=new Map(originalStages.map(x=>[x.id,x]));
 const newInner=el("div","sx42-inner");
 const existingHero=target?.querySelector("h2");
 if(existingHero)existingHero.textContent="Мой опыт работы.";
 if(target){const p=target.querySelector("p");if(p)p.textContent="От первых проектов до продуктовых экосистем. Каждый период: история, результаты, отзывы и реальные проекты.";}
 const total=periods.length;
 const fallbackUsed=new Set();
 // Short excerpts from the supplied My Works source. Portraits are inserted
 // only after the actual files are pushed to the universal GitHub inbox.
 const reviews={
  "auto-2026":{author:"Отзыв заказчика",text:"Мне понравился твой подход. Ты относишься к проекту как к собственному. Спасибо тебе за работу и мой первый отпуск за шесть лет."},
  "summer-2026":{author:"Отзыв заказчика · Времена года",text:"Времена года — моё чадо, которое начало работать благодаря тебе. После тебя одного смогли заменить только три дизайнера."},
  "hash":{author:"David T. · CPO Hash Hedge",text:"Богдан, спасибо тебе за всё. Забавно, конечно: начинали с утки, а в итоге столько всего сделали в Hash Hedge. С тобой реально было приятно работать."},
  "private-2025":{author:"Отзыв заказчика",text:"Приятный человек и классный дизайнер. Поработав вместе с тобой над проектом, я понял, почему тебя рекомендовали к нам."},
  "nutaku":{author:"Отзыв заказчика",text:"Solid guy, honest as hell and knows his stuff even on complex projects."},
  "duck":{author:"Отзыв заказчика · DuckMaster",text:"Рады были поработать с тобой на проекте. Не ожидали, что за сутки ты пересоберёшь проект или его визуальное исполнение."}
 };
 for(let pi=0;pi<total;pi++){
   const d=periods[pi],stage=el("section","sx42-period"),heading=el("div","sx42-period-heading");
   stage.id=d.id;stage.dataset.period=d.id;
   const headingMain=el("div","sx42-period-main");
   headingMain.append(el("p","sx42-date",d.date),el("h3","sx42-period-name",d.name),el("p","sx42-role",d.role),el("p","sx42-description",d.desc));
   heading.append(headingMain);
   stage.append(heading);
   const railWrap=el("div","sx42-carousel");
   const rail=el("div","sx42-rail");rail.setAttribute("aria-label","Проекты периода: "+d.name);
   rail.tabIndex=0;
   for(const slug of d.slugs){
     let a=originalCards.get(slug);
     if(!a||fallbackUsed.has(slug))continue;
     fallbackUsed.add(slug);
     const card=el("a","sx42-card");
     card.href=a.getAttribute("href");
     card.dataset.slug=slug;
     const image=a.querySelector(".sx-card-image img");
     const oldTitle=a.querySelector("h4");
     const oldDesc=a.querySelector(".sx-card-copy > p");
     const oldMetric=a.querySelector(".sx-card-metric");
     const oldTags=a.querySelectorAll(".sx-tag");
     if(image){
       const img=image.cloneNode(true);img.className="sx42-card-art";img.loading="lazy";img.decoding="async";
       card.append(img);
     }
     const overlay=el("div","sx42-card-content");
     const meta=el("div","sx42-card-meta");
     const tags=[...oldTags].map(z=>z.textContent.trim()).slice(0,2).join(" · ");
     meta.append(el("span","",oldTitle?.textContent.trim()||slug),el("span","",tags||"2026"));
     overlay.append(meta);
     overlay.append(el("h4","sx42-card-title",oldTitle?.textContent.trim()||slug));
     if(oldDesc)overlay.append(el("p","sx42-card-copy",oldDesc.textContent.trim()));
     card.append(overlay);
     const foot=el("div","sx42-card-foot");
     if(oldMetric) {
       const metric=el("div","sx42-card-metric");
       const number=oldMetric.querySelector("strong");
       const label=oldMetric.querySelector("span");
       if(number)metric.append(el("strong","",number.textContent.trim()));
       if(label)metric.append(el("span","",label.textContent.trim()));
       foot.append(metric);
     }
     const arrow=el("span","sx42-card-arrow","↗");arrow.setAttribute("aria-hidden","true");
     foot.append(arrow);card.append(foot);
     rail.append(card);
   }
   // Text-only facts are deliberately not represented as invented project links.
   // Facts are paired with a real project link whenever possible.
   const factTarget={
     "auto-2026":["automotive","automotive","engine-leads"],
     "summer-2026":["rsk","payment-gateway","dead-choices"],
     "hash":["hash-hedge","wsct"],
     "private-2025":["chatus","starhash-benchmark","2space"],
     "duck":["duckmaster","duckmaster","game-of-year"],
     "bonape":["bonape-training","bonape-training"]
   };
   d.facts.forEach(([number,label],factIndex)=>{
     const slug=factTarget[d.id]?.[factIndex]||d.slugs[0];
     const link=originalCards.get(slug);
     if(!link)return;
     // Achievement cards use the same arrow, always.
     const card=el("a","sx42-card sx42-fact");
     card.href=link.getAttribute("href");
     card.append(el("div","sx42-fact-number",number),el("p","sx42-fact-copy",label));
     const arrow=el("span","sx42-card-arrow","↗");arrow.setAttribute("aria-hidden","true");
     card.append(arrow);rail.append(card);
   });
   // A text review shares the approved tall card size; real author portrait
   // is never guessed, fabricated or sourced from another person.
   if(reviews[d.id]&&rail.children.length){
     const review=reviews[d.id];
     const destination={
       "auto-2026":"automotive","summer-2026":"vremena-goda",
       "hash":"hash-hedge","private-2025":"vlad-bykov",
       "duck":"duckmaster"
     }[d.id];
     const source=originalCards.get(destination);
     if(source){
       const card=el("a","sx42-card sx42-review");
       card.href=source.getAttribute("href");
       card.append(el("span","sx42-quote-mark","“"),el("p","sx42-review-text",review.text));
       card.append(el("div","sx42-review-author",review.author));
       const arrow=el("span","sx42-card-arrow","↗");
       arrow.setAttribute("aria-hidden","true");
       card.append(arrow);
       rail.insertBefore(card,rail.children[Math.min(1,rail.children.length)]||null);
     }
   }
   if(rail.children.length){
     railWrap.append(rail);
     const controls=el("div","sx42-controls");
     const status=el("span","sx42-progress","01 / "+String(rail.children.length).padStart(2,"0"));
     const prev=el("button","sx42-prev","‹"),next=el("button","sx42-next","›");
     prev.type=next.type="button";prev.setAttribute("aria-label","Предыдущие проекты");next.setAttribute("aria-label","Следующие проекты");
     controls.append(status,prev,next);railWrap.append(controls);
     let raf=0;
     function update(){
       raf=0;
       const kids=[...rail.children];
       const x=rail.scrollLeft;
       const index=kids.reduce((best,k,i)=>Math.abs(k.offsetLeft-kids[0].offsetLeft-x)<Math.abs(kids[best].offsetLeft-kids[0].offsetLeft-x)?i:best,0);
       status.textContent=String(index+1).padStart(2,"0")+" / "+String(kids.length).padStart(2,"0");
       prev.disabled=x<2;next.disabled=x>=rail.scrollWidth-rail.clientWidth-2;
     }
     function move(step){
       const kids=[...rail.children];
       const x=rail.scrollLeft;
       const pos=kids.map(k=>Math.max(0,k.offsetLeft-kids[0].offsetLeft));
       const target=step>0?(pos.find(p=>p>x+2)??pos[pos.length-1]):([...pos].reverse().find(p=>p<x-2)??0);
       rail.scrollTo({left:target,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
     }
     prev.addEventListener("click",()=>move(-1));next.addEventListener("click",()=>move(1));
     rail.addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});
     rail.addEventListener("keydown",e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();move(e.key==="ArrowRight"?1:-1);}});
     window.addEventListener("resize",update,{passive:true});
     railWrap.addEventListener("sx42-update",update);
     requestAnimationFrame(update);
     stage.append(railWrap);
   }else{
     // Archive is not populated with uploaded covers yet. Keep truthful text,
     // without manufactured project images or broken "case" destinations.
     stage.append(el("p","sx42-awaiting","Обложки и карточки этого периода будут подключены после загрузки исходников."));
   }
   newInner.append(stage);
 }
 // Replace ONLY the previous experience content; no other homepage block moves.
 for(const wrap of [...section.querySelectorAll(":scope > .sx-wrap")]){
   if(wrap.contains(target))continue;
   wrap.remove();
 }
 section.append(newInner);
 section.classList.add("sx42-ready");
 const observer="IntersectionObserver" in window?new IntersectionObserver(entries=>{
   for(const entry of entries)if(entry.isIntersecting){
     entry.target.classList.add("sx42-visible");
     observer.unobserve(entry.target);
   }
 },{rootMargin:"0px 0px -7% 0px",threshold:.08}):null;
 for(const period of newInner.children){
   if(observer)observer.observe(period);
   else period.classList.add("sx42-visible");
 }
})();
