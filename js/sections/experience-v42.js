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
 // GitHub Desktop originals are copied into per-case folders without
 // overwriting previously approved case covers.
 const uploadedCovers=new Set(["2space","aicors","apple-bar","aquator","artsavur","baraholka34","bill-split","bnqr","bonape-training","celtway","chatus","chexolchik","china-car","city-exchange","crush","dead-choices","deli-she","desire-inn","diary-book","digital-lawyer","domodel","domvrach","duckmaster","echo-app","erp","eurotek","exocure","fab-fantasy","finflow","fitness-pro","fly-ball","forfis-new-site","freshman","game-of-year","glavbankrot","greenbox","hamilya-shop","hash-hedge","history-app","horny-villa","invaprom","izi-crm","izum","khleb-iz-tandyra","logirus","luch","marcodo","media-garant","mobilka34","moonlight","my-ai-slut","myasnoy-dvor","nda-automotive-1","nda-automotive-2","nda-automotive-3","nda-bank","numa","onecase","onlinesklad","papa-pizza","parking","payment-gateway","pelikan","pilots-app","pixel-drop","pizza-dashboard","poker-n-sluts","propuska","psychology","quickpharm","restar","restomesto","ridis","rocket-jet","rsk","sailor-planner","salute","she-talks","slab-service","sober-driver","star-exchange","starhash-benchmark","tezgo","transport-tech","treasures-pskov","trips","twin-finder","vektor","verbatica","vezu-edu","virus","vita-ai","vk-media","vlad-bykov","vodacom","vodafon","vremena-goda","vybor","winline","wsct","x6","yacht-center","youtube-1","youtube-2"]);
 // Metadata for source artworks absent from the old static timeline. No fake
 // metrics or unpublished case details are manufactured.
 const extraProjects={"izi-crm":["IZI","Лёгкая CRM для отдела продаж","Создание собственной CRM вместо набора разрозненных сервисов.","/cases/automotive-automation/","CRM"],"nda-automotive-1":["Автомобильная экосистема продаж","Реклама, сайт, телефония и CRM","Цифровая инфраструктура автомобильного бизнеса. NDA до 2030 года.","/cases/automotive/","NDA"],"nda-automotive-2":["Продажа автомобилей через бренд","Автомобильный маркетинг","От подбора товаров до контента и рекламных сценариев. NDA до 2030 года.","/cases/automotive/","NDA"],"nda-automotive-3":["Воронка по продаже деталей","Маркетинговая система","Реклама, скрипты и работа с обращениями. NDA до 2030 года.","/cases/engine-leads/","NDA"],"my-ai-slut":["My AI Slut","ИИ-персонажи и общение","Чат с ИИ-персонажами и платной генерацией изображений.","/projects/","18+"],"fab-fantasy":["Fab Fantasy","Сюжетная Merge-игра для взрослых","Игровой мир с романтическими историями и интерактивными персонажами.","/projects/","18+"],"poker-n-sluts":["Poker N Sluts","Покер и игровые предложения","Маркетинговые игровые механики, слоты и предложения для игроков.","/projects/","18+"],"horny-villa":["Horny Villa","Merge-игра с развитием виллы","Внутриигровой магазин, монетизация и UX сценарии покупок.","/projects/","18+"],"desire-inn":["Desire Inn","Симулятор управления отелями","Развитие отелей, управление персоналом и историями персонажей.","/projects/","18+"],"onecase":["1Case","Telegram Mini App","Игровое приложение с механикой открытия кейсов.","/cases/onecase/","Game"],"finflow":["FinFlow","Личные финансы","Продукт для управления личными финансами.","/cases/finflow/","Fintech"],"nda-web3":["NDA Web3","Финансовый Web3-продукт","Детали проекта ограничены соглашением о конфиденциальности.","/projects/","NDA"],"youtube-1":["YouTube","Медийный проект","Собственные публикации, развитие аудитории и продвижение.","/cases/media/","Media"],"youtube-2":["VK","Медийный проект","Сообщества, контент и первые рекламные кампании.","/cases/media/","Media"],"vremena-goda":["Времена года","Бренд и маркетинг для 18+","Сложный сегмент, упаковка продукта и продвижение.","/cases/vremena-goda/","Marketing"],"exocure":["EXOCURE","Система аналитики","Интерфейсы и презентации аналитической платформы.","/cases/exocure/","Tech"],"payment-gateway":["Payment Gateway","Платёжный продукт","Полный цикл продуктового дизайна для криптоплатежей.","/cases/payment-gateway/","Fintech"]};
 const periods=[
  {id:"auto-2026",date:"Август 2026 - Октябрь 2026",name:"Автомобильная тематика",role:"Частная практика · NDA до 2030 года",desc:"В автомобильный бизнес я пришёл, чтобы проверить себя на прочность. До моего появления многое держалось на сарафанном радио, ручной обработке заявок и практически полном отсутствии цифровых инструментов. За несколько месяцев выстроил брендинг, маркетинговую стратегию, 27 воронок продаж, систему подбора товаров и автоматизацию колл-центра. В отдельных направлениях удалось получить 79 покупок и 127 успешных продаж за два месяца. Здесь я отвечал уже не за отдельный сайт или рекламу, а за то, как работает вся цифровая часть бизнеса. Подробности ограничены NDA до 2030 года.",slugs:["izi-crm","nda-automotive-1","nda-automotive-2","nda-automotive-3"],facts:[["4","дня от начала работы до первых продаж"],["79","покупок в сложной автомобильной нише"],["127","успешных продаж за два месяца"],["481","лид привлечён за четыре месяца"]]},
  {id:"summer-2026",date:"Июнь 2026 - Август 2026",name:"Проектная работа",role:"Lead Product Designer, CPO",desc:"После года работы над одной торговой экосистемой я резко сменил ритм. За неполные три месяца поработал над 14 проектами из совершенно разных сфер: от платёжных систем и CRM до игровых продуктов и аналитики. Где-то отвечал только за дизайн, а где-то подключал разработку и маркетинг. Например, полный цикл дизайна платёжного продукта занял 4 дня, в RSK количество заявок выросло на 21,6%, а для Dead Choices удалось проработать 171 сюжетную сцену. Самым сложным было не количество задач, а необходимость быстро разбираться в новом бизнесе и сразу находить рабочие решения.",slugs:["vremena-goda","rsk","payment-gateway","exocure","pixel-drop","dead-choices","aicors"],facts:[["69","забрендированных наборов и предметов"],["+21,6%","рост числа заявок в RSK"],["4","дня на полный цикл дизайна"],["8","дней на продуктовую логику"],["x4","ускорение разработки"],["171","сюжетная сцена Dead Choices"],["12","дней на полную проработку продукта"]]},
  {id:"hash",date:"Апрель 2025 - Май 2026",name:"Hash Hedge & WSCT",role:"Lead Product Designer",desc:"Всё началось с задачи по разработке рекламной воронки, а закончилось полноценной работой над торговой экосистемой. Больше года я занимался маркетинговым сайтом, личным кабинетом, торговым терминалом, платежами и системой контроля рисков. Только в обновлённом личном кабинете проработал около 465 состояний интерфейса. Отдельным направлением стал WSCT, турнирная платформа для трейдеров, для которой я разработал 6 маркетинговых воронок. Самой интересной частью работы было превращать сложную финансовую логику в интерфейс, которым человек может пользоваться без постоянных объяснений.",slugs:["hash-hedge","wsct"],facts:[["4,8","оценка удобства по опросам"],["6","маркетинговых воронок WSCT"],["465","состояний интерфейса"]]},
  {id:"private-2025",date:"Декабрь 2024 - Апрель 2025",name:"Частная практика",role:"Lead Product Designer · Маркетинг",desc:"После игровых проектов я снова вернулся к частной практике, но теперь брался за гораздо более сложные задачи. В подборку вошли финансовые сервисы, анонимные мессенджеры, медицинские платформы, игровые Telegram Mini Apps и продукты с несколькими ролями. Работал как над отдельными сценариями, так и над полноценными продуктами с нуля. Среди результатов этих проектов: 841 тыс. MAU у Chatus, 217 тыс. MAU у 1Case, 34,2 тыс. прохождений StarHash Benchmark и 182 заявки за неделю у 2Space. Это был период постоянного переключения между индустриями, где времени на долгое погружение практически не оставалось.",slugs:["echo-app","vlad-bykov","twin-finder","propuska","parking","media-garant","chatus","vita-ai","internship-platform","starhash-benchmark","luch","2space","forfis-new-site","digital-lawyer","star-exchange","city-exchange","greenbox","invaprom","onecase","crush","virus","finflow","bill-split","pilots-app","vybor","sailor-planner","nda-web3"],facts:[["841k","MAU у Chatus"],["34,2k","прохождений StarHash Benchmark"],["182","заявки за неделю у 2Space"]]},
  {id:"nutaku",date:"Декабрь 2024 - Февраль 2025",name:"Nutaku Projects · Аутсорс-дизайн",role:"UX Designer · Почасовой аутсорс",desc:"В Nutaku я работал на почасовой ставке, подключался к отдельным задачам по интерфейсам игр 18+, где требовалось переработать UX, игровые механики или монетизацию. Результаты иногда удивляли даже меня. В Horny Villa после переработки магазина количество покупок выросло примерно на 174%, а маркетинговые воронки Poker N Sluts принесли свыше $60 тыс. за три месяца. Для Fab Fantasy спроектировал 712 игровых сцен. Отдельной историей стал My AI Slut, который я практически с нуля собрал и передал заказчику. Ребята занялись продвижением, а спустя время я узнал, что у проекта уже 1,5 млн пользователей. При этом моя работа оставалась именно проектной, без управления командами и постоянного сопровождения продуктов.",slugs:["my-ai-slut","fab-fantasy","poker-n-sluts","horny-villa","desire-inn"],facts:[["1,5M","пользователей My AI Slut позже"],["712","спроектированных игровых сцен"],["$60k","платежей из маркетинговых воронок за три месяца"],["+174%","покупок после UX-редизайна магазина"],["+29%","вовлечённости после UX-доработок"]]},
  {id:"duck",date:"Август 2024 - Декабрь 2024",name:"DuckMaster & Game of Year",role:"Lead Product Designer",desc:"После полутора лет управления большими командами я решил вернуться к созданию продуктов своими руками. В DuckMaster всё началось с небольшого тестового задания, а уже за первые 4 дня я полностью переработал UI/UX игры с аудиторией 3,5 млн MAU. Дальше начались месяцы постоянных релизов, A/B-тестов и развития игровой экономики. Конверсия в первую платную прокрутку выросла с 4% до 19,2%, а D7 Retention с 4% до 39%. Отдельные игровые активности собирали $40–50 тыс. пользовательских платежей за 96 часов. Позже за 6 дней мы создали анимированный MVP Game of Year для инвестора.",slugs:["duckmaster","game-of-year"],facts:[["3,5M","активных пользователей в месяц"],["19,2%","конверсия в первую платную прокрутку"],["6","дней до MVP Game of Year"]]},
  {id:"bonape",date:"Январь 2023 - Август 2024",name:"BONAPE · SALUTE · ARTSAVUR",role:"CEO, Project Manager",desc:"Это был, пожалуй, самый тяжёлый период моей работы. Три направления одной компании: в BONAPE я обучал специалистов и руководил клиентскими проектами, в SALUTE отвечал за маркетинг и трафик, а в ARTSAVUR за дизайн и разработку. В общей сложности под моим прямым руководством было более 50 человек. За это время подготовил 24 специалиста, вместе с командой Apple Bar получили около 700 обращений и 132 оплаченных заказа, а рекламная сеть SALUTE выросла до 31 Telegram-канала с аудиторией 1,6 млн подписчиков. Кроме самих проектов на мне были клиенты, сроки, качество и большая часть сложных решений. В какой-то момент я понял, что практически перестал заниматься тем, ради чего вообще пришёл в эту профессию.",slugs:["bonape-training","salute","artsavur","apple-bar","aquator","yacht-center","jet-hunter","slab-service","china-car","domodel","she-talks","rocket-jet","numa"],facts:[["24","специалиста подготовлено"],["132","оплаченных заказа Apple Bar"],["1,6M","подписчиков сети SALUTE"],["50+","сотрудников в прямом подчинении"]]},
  {id:"onlinesklad",date:"Июнь 2022 - Январь 2023",name:"Onlinesklad",role:"Middle Product Designer, QA",desc:"Onlinesklad стал для меня одним из первых крупных проектов, где за внешне обычным маркетплейсом скрывалась сложная внутренняя система. Покупатели, поставщики, каталоги, остатки, заказы и разные сценарии работы с товарами. Я занимался проектированием интерфейсов, пользовательских сценариев, адаптивных состояний и проверкой реализации. Главная сложность была в том, чтобы сохранить понятную логику продукта для разных ролей, не превращая интерфейс в перегруженную систему управления складом.",slugs:["onlinesklad"],facts:[]},
  {id:"sober",date:"Декабрь 2021 - Май 2022",name:"Трезвый Водитель",role:"Middle Product Designer",desc:"В Трезвом Водителе я впервые настолько глубоко погрузился в проектирование сервиса с несколькими пользовательскими ролями. Одной клиентской части здесь было недостаточно: параллельно нужно было продумать приложение водителя, административную систему, работу с заказами, балансами и выплатами. За три месяца продуктом воспользовались около 2 700 пользователей. Главным результатом для меня стала не отдельная красивая часть интерфейса, а полноценная система, в которой все участники работают по одной понятной логике.",slugs:["sober-driver","sober-driver-app","sober-driver-driver","sober-driver-admin","sober-driver-web"],facts:[["2 700","пользователей за три месяца"]]},
  {id:"forfis",date:"Ноябрь 2020 - Декабрь 2021",name:"FORFIS",role:"Junior Product Designer",desc:"В FORFIS я работал над самыми разными коммерческими задачами: от небольших сайтов и рекламных материалов до интерфейсов сервисов и мобильных приложений. Проекты постоянно менялись, поэтому приходилось быстро разбираться в новой сфере, собирать структуру, проектировать интерфейс, подключать разработку и маркетинг. Именно здесь я начал гораздо серьёзнее относиться к пользовательским сценариям и коммерческим результатам, а не только к визуальной части дизайна. По сути, это был период, когда я постепенно переходил от веб-дизайна к полноценной продуктовой работе.",slugs:["pelikan","fly-ball","vodacom","psychology","hamilya-shop","hamilya-astro","blog-hamilya","eyebogo","treasures-pskov","history-app","transport-tech","tezgo","pizza-dashboard","deli-she","diary-book","restomesto","volgu-site"],facts:[]},
  {id:"2020-projects",date:"Январь 2020 - Ноябрь 2020",name:"Частная практика",role:"Web Designer, Marketing",desc:"В 2020 году я начал активно заниматься небольшими коммерческими проектами. Интернет-магазины, каталоги, доставка, сайты для локального бизнеса и первые самостоятельные рекламные кампании. Часто приходилось делать практически всё самому, от идеи и дизайна до запуска и привлечения покупателей. Moonlight получил 537 заявок и 42 продажи, в Mobilka34 по промокодам зафиксировали 3 410 офлайн-продаж, а ИЗЮМ вырос до 522 заказов в месяц. Тогда я впервые на практике увидел, что хороший сайт сам по себе ещё ничего не гарантирует, если за ним не стоит работающая система продаж.",slugs:["myasnoy-dvor","papa-pizza","khleb-iz-tandyra","moonlight","chexolchik","mobilka34","baraholka34","izum"],facts:[["537","заявок Moonlight"],["3 410","офлайн-продаж Mobilka34"],["522","заказа в месяц у ИЗЮМ"]]},
  {id:"media",date:"Сентябрь 2016 - Декабрь 2019",name:"Медийные проекты & RESTAR",role:"Web Designer, Marketing",desc:"Мой коммерческий опыт начался задолго до работы в продуктовых командах. Сначала были собственные медийные проекты, эксперименты с контентом, продвижением и привлечением аудитории через YouTube и VK. Постепенно это переросло в работу с реальным бизнесом. Одним из первых серьёзных коммерческих проектов стал RESTAR, где я занимался продвижением B2B-продукции. При небольшом рекламном бюджете удалось увеличить количество оплаченных заказов с 2 до 8–9 в год. Тогда я ещё не называл себя продуктовым дизайнером, но уже учился связывать цифровые инструменты с конкретным результатом.",slugs:["restar","youtube-1","youtube-2"],facts:[["8–9","оплаченных B2B-заказов в год"]]}
 ];
 function el(tag,cl,content){const x=document.createElement(tag);if(cl)x.className=cl;if(content!==undefined)x.textContent=content;return x;}
 const originalByPeriod=new Map(originalStages.map(x=>[x.id,x]));
 const newInner=el("div","sx42-inner");
 const existingHero=target?.querySelector("h2");
 if(existingHero)existingHero.textContent="Мой опыт работы.";
 if(target){const p=target.querySelector("p");if(p)p.remove();const a=target.querySelector("a");if(a)a.textContent="Все кейсы ↗";}
 const total=periods.length;
 const fallbackUsed=new Set();
 // Short excerpts from the supplied My Works source. Portraits are inserted
 // only after the actual files are pushed to the universal GitHub inbox.
 const reviews={
  "auto-2026":{author:"Отзыв заказчика",text:"Мне понравился твой подход. Ты относишься к проекту как к собственному. Спасибо тебе за работу и мой первый отпуск за шесть лет."},
  "summer-2026":{author:"Отзыв заказчика · Времена года",text:"Времена года — моё чадо, которое начало работать благодаря тебе. После тебя одного смогли заменить только три дизайнера."},
  "hash":{author:"David T. · CPO Hash Hedge",portrait:"david-t-hash-hedge",text:"Богдан, спасибо тебе за всё. Забавно, конечно: начинали с утки, а в итоге столько всего сделали в Hash Hedge. С тобой реально было приятно работать."},
  "private-2025":{author:"Vlad B. · Заказчик",portrait:"vlad-b",text:"Приятный человек и классный дизайнер. Поработав вместе с тобой над проектом, я понял, почему тебя рекомендовали к нам."},
  "nutaku":{author:"Отзыв заказчика",text:"Solid guy, honest as hell and knows his stuff even on complex projects."},
  "duck":{author:"David T. · CPO DuckMaster",portrait:"david-t-duckmaster",text:"Рады были поработать с тобой на проекте. Не ожидали, что за сутки ты пересоберёшь проект или его визуальное исполнение."}
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
     const extra=extraProjects[slug];
     if((!a&&!extra)||fallbackUsed.has(slug))continue;
     fallbackUsed.add(slug);
     const card=el("a","sx42-card");
     card.href=a?a.getAttribute("href"):extra[3];
     card.dataset.slug=slug;
     const image=a?.querySelector(".sx-card-image img");
     const oldTitle=a?.querySelector("h4");
     const oldDesc=a?.querySelector(".sx-card-copy > p");
     const oldMetric=a?.querySelector(".sx-card-metric");
     const oldTags=a?.querySelectorAll(".sx-tag")||[];
     if(image||uploadedCovers.has(slug)){
       const img=image?.cloneNode(true)||el("img","sx42-card-art");
       img.className="sx42-card-art";img.loading="lazy";img.decoding="async";
       img.alt="";
       if(uploadedCovers.has(slug)){
         img.src="/assets/cases/"+slug+"/cover-work.png";
         img.removeAttribute("srcset");
         img.removeAttribute("sizes");
       }
       img.width=1424;img.height=2048;
       card.append(img);
     }
     const overlay=el("div","sx42-card-content");
     const meta=el("div","sx42-card-meta");
     const year=d.date.match(/20\d\d/)?.[0]||"";
     const title=extra?.[0]||oldTitle?.textContent.trim()||slug;
     const headline=extra?.[1]||title;
     const subtitle=extra?.[2]||oldDesc?.textContent.trim()||"";
     meta.append(el("span","",title),el("span","",year));
     overlay.append(meta);
     overlay.append(el("h4","sx42-card-title",headline));
     if(subtitle)overlay.append(el("p","sx42-card-copy",subtitle));
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
     // Each card always has a distinct case arrow, including NDA artworks.
     rail.append(card);
   }
   // Text-only facts are deliberately not represented as invented project links.
   // Facts are paired with a real project link whenever possible.
   const factTarget={
     "auto-2026":["izi-crm","nda-automotive-1","nda-automotive-2","nda-automotive-3"],
     "summer-2026":["vremena-goda","rsk","payment-gateway","exocure","pixel-drop","dead-choices","aicors"],
     "hash":["hash-hedge","wsct","hash-hedge"],
     "private-2025":["chatus","starhash-benchmark","2space"],
     "nutaku":["my-ai-slut","fab-fantasy","poker-n-sluts","horny-villa","desire-inn"],
     "duck":["duckmaster","duckmaster","game-of-year"],
     "bonape":["bonape-training","apple-bar","salute","artsavur"],
     "sober":["sober-driver"],
     "2020-projects":["moonlight","mobilka34","izum"],
     "media":["restar"]
   };
   d.facts.forEach(([number,label],factIndex)=>{
     const slug=factTarget[d.id]?.[factIndex]||d.slugs[0];
     const link=originalCards.get(slug);
     const extra=extraProjects[slug];
     if(!link&&!extra)return;
     // Achievement cards use the same arrow, always.
     const card=el("a","sx42-card sx42-fact");
     card.href=link?link.getAttribute("href"):extra[3];
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
       if(review.portrait){
         const portrait=el("img","sx42-review-portrait");
         portrait.src="/assets/reviews/"+review.portrait+".png";
         portrait.alt="";portrait.loading="lazy";portrait.decoding="async";
         card.append(portrait);
       }
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
