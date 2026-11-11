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
 const extraProjects={"izi-crm":["IZI","Лёгкая CRM система для отдела продаж","Создание своей CRM, которая стала полной заменой Bitrix24, Teletype и Sipuni.","/cases/automotive-automation/","AUTOMOTIVE"],"nda-automotive-1":["NDA","Автомобильная экосистема продаж","Реклама, сайт, телефония и CRM. Как оптимизация одного звена показала x12 к продажам.","/cases/automotive/","AUTOMOTIVE"],"nda-automotive-2":["NDA","Продажа авто через создание бренда","От разработки парсера до завода по генерации роликов с обзорами машин и 500 статьями.","/cases/automotive/","AUTOMOTIVE"],"nda-automotive-3":["NDA","Рекламная воронка по продаже деталей","Полный цикл менеджмента компании: воронка, запуск посевов и написание скриптов для продаж.","/cases/engine-leads/","AUTOMOTIVE"],"my-ai-slut":["MY AI SLUTS","Создание и общение с ИИ персонажами","Продукт изначально создавался для своей идеи. Проработав месяц, нашёлся покупатель MVP.","/projects/","MATURE"],"fab-fantasy":["FAP FANTASY","Сюжетная Merge-игра для взрослых","Игровой мир с романтическими историями, интерактивными персонажами и исследованиями.","/projects/","MATURE"],"poker-n-sluts":["POKER N' SLUTS","Покерный клуб с эротикой 18+","Покер, слоты и мини-игры с персонажами, VIP-столами и историей спасения семьи.","/projects/","MATURE"],"horny-villa":["HORNY VILLA","Merge-игра с развитием виллы","Объединение предметов, обустройство особняка и развитие отношений с девушками.","/projects/","MATURE"],"desire-inn":["DESIRE INN","18+ симулятор управления отелями","Развитие сети отелей, работа с гостями, управление персоналом и романтические истории.","/projects/","MATURE"],"onecase":["1Case","Telegram Mini App","Игровое приложение с механикой открытия кейсов.","/cases/onecase/","Game"],"finflow":["FinFlow","Личные финансы","Продукт для управления личными финансами.","/cases/finflow/","Fintech"],"nda-web3":["NDA Web3","Финансовый Web3-продукт","Детали проекта ограничены соглашением о конфиденциальности.","/projects/","NDA"],"youtube-1":["TOBOGANT64D","YouTube-канал с игровыми нарезками","Не одна игра, а разные игровые моменты. Второй канал вырос до шестизначной аудитории.","/cases/media/","GAMING"],"youtube-2":["TOBOBORODA","YouTube-канал по Minecraft летсплеям","Первый опыт построения собственной аудитории.","/cases/media/","GAMING"],"vremena-goda":["Времена года","Бренд и маркетинг для 18+","Сложный сегмент, упаковка продукта и продвижение.","/cases/vremena-goda/","Marketing"],"exocure":["EXOCURE","Система аналитики","Интерфейсы и презентации аналитической платформы.","/cases/exocure/","Tech"],"payment-gateway":["Payment Gateway","Платёжный продукт","Полный цикл продуктового дизайна для криптоплатежей.","/cases/payment-gateway/","Fintech"],"rsk":["RSK","Сайт-каталог сувенирной компании","Большой ассортимент сувениров: задача превратить лида в покупателя.",null,""],"pixel-drop":["Pixel Drop","Маркетплейс для Roblox с кейсами","Переработанная игровая механика ускорила разработку в четыре раза.",null,""],"dead-choices":["Dead Choice","Игра, где выбор влияет на сюжет","171 проработанная сцена и сотни сюжетных зависимостей.",null,""],"aicors":["AiCors","Образовательная платформа с ИИ","Дизайн, разработка и pitch deck в ограниченные сроки.",null,""],"hash-hedge":["HASH HEDGE","Торговая экосистема для проп-трейдинга","История о том, как разработка одной маркетинговой воронки перетекла в полный редизайн.","/cases/hash-hedge/","FINTECH"],"wsct":["WSCT","Турнирная воронка для трейдеров","Привлечь трейдера мало. Нужно объяснить соревнование, правила и довести до участия.","/cases/wsct/","FINTECH"],"echo-app":["ЭХО","Анонимный мессенджер","Меньше публичных данных, больше требований к приватности и сценариям общения.",null,""],"vlad-bykov":["Vlad Bykov","Сайт для бренда одежды инфлюенсера","Визуальная подача личного бренда требует характера.",null,""],"twin-finder":["Twin Finder","Поиск двойников с помощью ИИ","Поиск визуально похожих людей с сохранением приватности.",null,""],"propuska":["Пропуска","Система пропусков для частного сектора","Процессы доступа, заявки и согласование с гостями.",null,""],"parking":["Parking","Приложение поиска парковок в Москве","Сценарии для водителя, которому информация нужна сразу.",null,""],"media-garant":["Media Garant","Гарант для сделок с цифровыми активами","Каждый шаг сделки должен быть прозрачным.",null,""],"chatus":["Chatus","Приложение для анонимных знакомств","Анонимность, пользовательские сценарии и общение.",null,""],"vita-ai":["Vita AI","Медицинский продукт с ИИ","Интерфейс, помогающий работать с медицинской информацией.",null,""],"internship-platform":["Internship Platform","Платформа поиска стажировок","Кандидат ищет возможность получить первый опыт.",null,""],"starhash-benchmark":["StarHash Benchmark","Бенчмарк оборудования для майнинга","Показатели и результаты в понятной системе сравнения.",null,""],"luch":["Луч","Приложение для детского творчества","Превратить готовую поделку в интересный цифровой процесс.",null,""],"2space":["2Space","Сайт для агентства TMA-приложений","Упаковка услуг по разработке Telegram Mini Apps.",null,""],"forfis-new-site":["FORFIS","Сайт для агентства полного цикла","Услуги, возможности команды и коммерческие сценарии.",null,""],"digital-lawyer":["Цифровой юрист","Продукт для поиска юриста через ИИ","ИИ помогает найти специалиста, но не подменяет его решение.",null,""],"star-exchange":["Star Exchange","Обмен Telegram Stars на криптовалюту","Прозрачные статусы и понятная логика обмена.",null,""],"city-exchange":["City Exchange","Приложение для обмена криптовалют","Управление обменами и финансовыми операциями.",null,""],"greenbox":["Greenbox","Продажа рулонного газона через сайт","Маркетинговые воронки и заявки вне сезонного спроса.",null,""],"invaprom":["Инвапром","Сайт производителя подъёмников","Точная информация о сложном промышленном оборудовании.",null,""],"crush":["Crush","TMA с игровой механикой","Короткие игровые действия должны оставаться интересными.",null,""],"virus":["Virus","Игровой продукт внутри Telegram","Результат одного действия влияет на игровой прогресс.",null,""],"bill-split":["Bill Split","Приложение для разделения расходов","Один платит за всех, другой только за себя.",null,""],"pilots-app":["PILOTS APP","Вакансии для авиации","Четыре роли, разные интересы и единая платформа.",null,""],"vybor":["Выбор","Маркетплейс вакансий","От структуры каталога до удобного поиска работы.",null,""],"sailor-planner":["Sailor Planner","Планировщик морских путешествий","Маршрут на воде зависит от множества условий.",null,""],"bonape-training":["BONAPE","Обучение специалистов и команд","От обучения специалистов до управления клиентскими проектами.",null,""],"salute":["SALUTE","Управление сетью Telegram-каналов","Маркетинг, трафик и рекламная сеть из 31 канала.",null,""],"artsavur":["ARTSAVUR","Команда цифровых продуктов","Дизайн, разработка и управление агентством.",null,""],"onlinesklad":["ONLINESKLAD","Строительный маркетплейс","Сложные сценарии, один дизайнер и год работы на бумаге. Как успеть всё за два месяца, а не год?","/cases/onlinesklad/","E-COMMERCE"],"sober-driver":["SOBER DRIVER","Приложение и сайт для вызова водителя","Масштабирование продукта в условиях жёсткой конкуренции и модерации на рынке услуг.","/cases/sober-driver/","MOBILITY"],"vodacom":["Vodacom","Сервис заказа и доставки воды","От приложения до сайта и рекламного продвижения.",null,""],"restar":["RESTAR","Поиск B2B-клиентов для продажи шпал","Около 9 тысяч рублей рекламного бюджета. Результат измерялся годовыми B2B-сделками.","/cases/restar/","INDUSTRIAL"],"vk-media":["BLVT","Сообщество с мемами ВКонтакте","От YouTube к развитию отдельного сообщества с собственной аудиторией.","/cases/media/","MEDIA"],"duckmaster":["DUCKMASTER","TMA с игровыми механиками","Что важнее пользователю: механика или её визуальное исполнение? Полный разбор с метриками.","/cases/duckmaster/","GAMEDEV"],"game-of-year":["GAME OF YEAR","Карточная RPG с механиками 18+","Битвы, уровни и откровенные персонажи. За визуалом скрывается полноценная игровая система.","/cases/game-of-year/","GAMEDEV"],"apple-bar":["APPLE BAR","Маркетплейс для устройств Apple","От небольшой офлайн-точки до онлайн-заказов и рекламных воронок.","/cases/apple-bar/","E-COMMERCE"]};
 const coverMetrics={"izi-crm":["4","дня от начала работы до первых продаж"],"nda-automotive-1":["79","покупок в сложной нише"],"nda-automotive-2":["127","успешных продаж за два месяца"],"nda-automotive-3":["481","лид за четыре месяца работы"],"vremena-goda":["69","забрендированных наборов и предметов"],"rsk":["+21,6%","рост заявок за неделю"],"payment-gateway":["4","дня на полный цикл дизайна"],"exocure":["8","дней на продуктовую логику"],"pixel-drop":["x4","ускорение разработки"],"dead-choices":["171","сюжетная сцена"],"aicors":["12","дней на полную проработку продукта"],"hash-hedge":["4,8","оценка удобства по результатам опроса"],"wsct":["6","маркетинговых воронок"],"my-ai-slut":["1,5M","пользователей у проекта впоследствии"],"fab-fantasy":["712","игровых сцен спроектировано"],"poker-n-sluts":["$60k","из маркетинговых предложений за три месяца"],"horny-villa":["+174%","к покупкам после UX редизайна"],"desire-inn":["+29%","к вовлечённости после UX доработок"],"duckmaster":["17","версий продукта с положительными тестами"],"game-of-year":["6","дней от идеи до MVP TMA"],"onlinesklad":["87","сложных сценариев"],"sober-driver":["4,8","оценка приложения в App Store и Google Play"],"restar":["x3","рост заказов за четыре месяца работы"]};
 const coverIndustries={"izi-crm":"AUTOMOTIVE","nda-automotive-1":"AUTOMOTIVE","nda-automotive-2":"AUTOMOTIVE","nda-automotive-3":"AUTOMOTIVE","vremena-goda":"MATURE","rsk":"E-COMMERCE","payment-gateway":"FINTECH","exocure":"SPORTTECH","pixel-drop":"GAMEDEV","dead-choices":"GAMEDEV","aicors":"EDTECH","hash-hedge":"FINTECH","wsct":"FINTECH","my-ai-slut":"MATURE","fab-fantasy":"MATURE","poker-n-sluts":"MATURE","horny-villa":"MATURE","desire-inn":"MATURE","duckmaster":"GAMEDEV","game-of-year":"GAMEDEV","onlinesklad":"E-COMMERCE","sober-driver":"MOBILITY","restar":"INDUSTRIAL","vk-media":"MEDIA","youtube-1":"GAMING","youtube-2":"GAMING"};
 const periods=[
  {id:"auto-2026",date:"Август 2026 - Октябрь 2026",name:"Автомобильная тематика",role:"Подробности проекта ограничены NDA до 2030 года / Частная практика",desc:"В автомобильный бизнес я пришёл, чтобы проверить себя на прочность. До моего появления многое держалось на сарафанном радио, ручной обработке заявок и практически полном отсутствии цифровых инструментов. За несколько месяцев выстроил брендинг, маркетинговую стратегию, 27 воронок продаж, систему подбора товаров и автоматизацию колл-центра. В отдельных направлениях удалось получить 79 покупок и 127 успешных продаж за два месяца. Здесь я отвечал уже не за отдельный сайт или рекламу, а за то, как работает вся цифровая часть бизнеса. Подробности ограничены NDA до 2030 года.",slugs:["izi-crm","nda-automotive-1","nda-automotive-2","nda-automotive-3"],facts:[["4","дня от начала работы до первых продаж"],["79","покупок в сложной автомобильной нише"],["127","успешных продаж за два месяца"],["481","лид привлечён за четыре месяца"]]},
  {id:"summer-2026",date:"Июнь 2026 - Август 2026",name:"Проектная работа",role:"7 проектов / Lead Product Designer, CPO",desc:"После года работы над одной торговой экосистемой я резко сменил ритм. За неполные три месяца поработал над 14 проектами из совершенно разных сфер: от платёжных систем и CRM до игровых продуктов и аналитики. Где-то отвечал только за дизайн, а где-то подключал разработку и маркетинг. Например, полный цикл дизайна платёжного продукта занял 4 дня, в RSK количество заявок выросло на 21,6%, а для Dead Choices удалось проработать 171 сюжетную сцену. Самым сложным было не количество задач, а необходимость быстро разбираться в новом бизнесе и сразу находить рабочие решения.",slugs:["vremena-goda","rsk","payment-gateway","exocure","pixel-drop","dead-choices","aicors"],facts:[["69","забрендированных наборов и предметов"],["+21,6%","рост числа заявок в RSK"],["4","дня на полный цикл дизайна"],["8","дней на продуктовую логику"],["x4","ускорение разработки"],["171","сюжетная сцена Dead Choices"],["12","дней на полную проработку продукта"]]},
  {id:"hash",date:"Апрель 2025 - Май 2026",name:"Hash Hedge & WSCT",role:"Lead Product Designer",desc:"Всё началось с задачи по разработке рекламной воронки, а закончилось полноценной работой над торговой экосистемой. Больше года я занимался маркетинговым сайтом, личным кабинетом, торговым терминалом, платежами и системой контроля рисков. Только в обновлённом личном кабинете проработал около 465 состояний интерфейса. Отдельным направлением стал WSCT, турнирная платформа для трейдеров, для которой я разработал 6 маркетинговых воронок. Самой интересной частью работы было превращать сложную финансовую логику в интерфейс, которым человек может пользоваться без постоянных объяснений.",slugs:["hash-hedge","wsct"],facts:[["4,8","оценка удобства по опросам"],["6","маркетинговых воронок WSCT"],["465","состояний интерфейса"]]},
  {id:"private-2025",date:"Декабрь 2024 - Апрель 2025",name:"Частная практика",role:"27 проектов / Lead Product Designer, SMM, PCC-Specialist",desc:"После игровых проектов я снова вернулся к частной практике, но теперь брался за гораздо более сложные задачи. В подборку вошли финансовые сервисы, анонимные мессенджеры, медицинские платформы, игровые Telegram Mini Apps и продукты с несколькими ролями. Работал как над отдельными сценариями, так и над полноценными продуктами с нуля. Среди результатов этих проектов: 841 тыс. MAU у Chatus, 217 тыс. MAU у 1Case, 34,2 тыс. прохождений StarHash Benchmark и 182 заявки за неделю у 2Space. Это был период постоянного переключения между индустриями, где времени на долгое погружение практически не оставалось.",slugs:["echo-app","vlad-bykov","twin-finder","propuska","parking","media-garant","chatus","vita-ai","internship-platform","starhash-benchmark","luch","2space","forfis-new-site","digital-lawyer","star-exchange","city-exchange","greenbox","invaprom","onecase","crush","virus","finflow","bill-split","pilots-app","vybor","sailor-planner","nda-web3"],facts:[["841k","MAU у Chatus"],["34,2k","прохождений StarHash Benchmark"],["182","заявки за неделю у 2Space"]]},
  {id:"nutaku",date:"Декабрь 2024 - Февраль 2025",name:"Nutaku Projects · Аутсорс-дизайн",role:"5 проектов / UX Designer",desc:"В Nutaku я работал на почасовой ставке, подключался к отдельным задачам по интерфейсам игр 18+, где требовалось переработать UX, игровые механики или монетизацию. Результаты иногда удивляли даже меня. В Horny Villa после переработки магазина количество покупок выросло примерно на 174%, а маркетинговые воронки Poker N Sluts принесли свыше $60 тыс. за три месяца. Для Fab Fantasy спроектировал 712 игровых сцен. Отдельной историей стал My AI Slut, который я практически с нуля собрал и передал заказчику. Ребята занялись продвижением, а спустя время я узнал, что у проекта уже 1,5 млн пользователей. При этом моя работа оставалась именно проектной, без управления командами и постоянного сопровождения продуктов.",slugs:["my-ai-slut","fab-fantasy","poker-n-sluts","horny-villa","desire-inn"],facts:[["1,5M","пользователей My AI Slut позже"],["712","спроектированных игровых сцен"],["$60k","платежей из маркетинговых воронок за три месяца"],["+174%","покупок после UX-редизайна магазина"],["+29%","вовлечённости после UX-доработок"]]},
  {id:"duck",date:"Август 2024 - Декабрь 2024",name:"DuckMaster & Game of Year",role:"Lead Product Designer",desc:"После полутора лет управления большими командами я решил вернуться к созданию продуктов своими руками. В DuckMaster всё началось с небольшого тестового задания, а уже за первые 4 дня я полностью переработал UI/UX игры с аудиторией 3,5 млн MAU. Дальше начались месяцы постоянных релизов, A/B-тестов и развития игровой экономики. Конверсия в первую платную прокрутку выросла с 4% до 19,2%, а D7 Retention с 4% до 39%. Отдельные игровые активности собирали $40–50 тыс. пользовательских платежей за 96 часов. Позже за 6 дней мы создали анимированный MVP Game of Year для инвестора.",slugs:["duckmaster","game-of-year"],facts:[["3,5M","активных пользователей в месяц"],["19,2%","конверсия в первую платную прокрутку"],["6","дней до MVP Game of Year"]]},
  {id:"bonape",date:"Январь 2023 - Август 2024",name:"BONAPE · SALUTE · ARTSAVUR",role:"27 проектов / CEO, PM",desc:"Это был, пожалуй, самый тяжёлый период моей работы. Три направления одной компании: в BONAPE я обучал специалистов и руководил клиентскими проектами, в SALUTE отвечал за маркетинг и трафик, а в ARTSAVUR за дизайн и разработку. В общей сложности под моим прямым руководством было более 50 человек. За это время подготовил 24 специалиста, вместе с командой Apple Bar получили около 700 обращений и 132 оплаченных заказа, а рекламная сеть SALUTE выросла до 31 Telegram-канала с аудиторией 1,6 млн подписчиков. Кроме самих проектов на мне были клиенты, сроки, качество и большая часть сложных решений. В какой-то момент я понял, что практически перестал заниматься тем, ради чего вообще пришёл в эту профессию.",slugs:["bonape-training","apple-bar","aquator","yacht-center","jet-hunter","greenbox","domashniy-doktor","slab-service","china-car","trips","fitnesspro","avtoshkola","domodel","vita-med","sailor-planner","glavbankrot","salute","salute-telegram","x6","salute-funnels","artsavur","rocket-jet","she-talks","celtway","verbatica","numa","vybor"],facts:[["24","специалиста подготовлено"],["132","оплаченных заказа Apple Bar"],["1,6M","подписчиков сети SALUTE"],["50+","сотрудников в прямом подчинении"]]},
  {id:"onlinesklad",date:"Июнь 2022 - Январь 2023",name:"Onlinesklad",role:"Middle Product Designer, QA",desc:"Onlinesklad стал для меня одним из первых крупных проектов, где за внешне обычным маркетплейсом скрывалась сложная внутренняя система. Покупатели, поставщики, каталоги, остатки, заказы и разные сценарии работы с товарами. Я занимался проектированием интерфейсов, пользовательских сценариев, адаптивных состояний и проверкой реализации. Главная сложность была в том, чтобы сохранить понятную логику продукта для разных ролей, не превращая интерфейс в перегруженную систему управления складом.",slugs:["onlinesklad"],facts:[]},
  {id:"sober",date:"Декабрь 2021 - Май 2022",name:"Трезвый Водитель",role:"Middle Product Designer",desc:"В Трезвом Водителе я впервые настолько глубоко погрузился в проектирование сервиса с несколькими пользовательскими ролями. Одной клиентской части здесь было недостаточно: параллельно нужно было продумать приложение водителя, административную систему, работу с заказами, балансами и выплатами. За три месяца продуктом воспользовались около 2 700 пользователей. Главным результатом для меня стала не отдельная красивая часть интерфейса, а полноценная система, в которой все участники работают по одной понятной логике.",slugs:["sober-driver","sober-driver-app","sober-driver-driver","sober-driver-admin","sober-driver-web"],facts:[["2 700","пользователей за три месяца"]]},
  {id:"forfis",date:"Ноябрь 2020 - Декабрь 2021",name:"FORFIS AGENCY",role:"15 проектов / Junior Product Designer",desc:"В FORFIS я работал над самыми разными коммерческими задачами: от небольших сайтов и рекламных материалов до интерфейсов сервисов и мобильных приложений. Проекты постоянно менялись, поэтому приходилось быстро разбираться в новой сфере, собирать структуру, проектировать интерфейс, подключать разработку и маркетинг. Именно здесь я начал гораздо серьёзнее относиться к пользовательским сценариям и коммерческим результатам, а не только к визуальной части дизайна. По сути, это был период, когда я постепенно переходил от веб-дизайна к полноценной продуктовой работе.",slugs:["vodacom","psychology","pelikan","fly-ball","restomesto","hamilya-shop","domashniy-doktor","treasures-pskov","history-app","transport-tech","tezgo","pizza-dashboard","deli-she","diary-book","trips","eyebogo","blog-hamilya","hamilya-astro","volgu-site"],facts:[]},
  {id:"2020-projects",date:"Январь 2020 - Ноябрь 2020",name:"Частная практика",role:"8 проектов / Web Designer, Marketing",desc:"В 2020 году я начал активно заниматься небольшими коммерческими проектами. Интернет-магазины, каталоги, доставка, сайты для локального бизнеса и первые самостоятельные рекламные кампании. Часто приходилось делать практически всё самому, от идеи и дизайна до запуска и привлечения покупателей. Moonlight получил 537 заявок и 42 продажи, в Mobilka34 по промокодам зафиксировали 3 410 офлайн-продаж, а ИЗЮМ вырос до 522 заказов в месяц. Тогда я впервые на практике увидел, что хороший сайт сам по себе ещё ничего не гарантирует, если за ним не стоит работающая система продаж.",slugs:["myasnoy-dvor","papa-pizza","khleb-iz-tandyra","moonlight","chexolchik","mobilka34","baraholka34","izum"],facts:[["537","заявок Moonlight"],["3 410","офлайн-продаж Mobilka34"],["522","заказа в месяц у ИЗЮМ"]]},
  {id:"media",date:"Сентябрь 2016 - Декабрь 2019",name:"Развитие в медиа & RESTAR",role:"Web Designer, Marketing",desc:"Мой коммерческий опыт начался задолго до работы в продуктовых командах. Сначала были собственные медийные проекты, эксперименты с контентом, продвижением и привлечением аудитории через YouTube и VK. Постепенно это переросло в работу с реальным бизнесом. Одним из первых серьёзных коммерческих проектов стал RESTAR, где я занимался продвижением B2B-продукции. При небольшом рекламном бюджете удалось увеличить количество оплаченных заказов с 2 до 8–9 в год. Тогда я ещё не называл себя продуктовым дизайнером, но уже учился связывать цифровые инструменты с конкретным результатом.",slugs:["restar","vk-media","youtube-1","youtube-2"],facts:[["8–9","оплаченных B2B-заказов в год"]]}
 ];
 function el(tag,cl,content){const x=document.createElement(tag);if(cl)x.className=cl;if(content!==undefined)x.textContent=content;return x;}
 const originalByPeriod=new Map(originalStages.map(x=>[x.id,x]));
 const newInner=el("div","sx42-inner");
 const existingHero=target?.querySelector("h2");
 if(existingHero)existingHero.textContent="Мой опыт работы.";
 if(target){const p=target.querySelector("p");if(p)p.remove();const eyebrow=target.querySelector(".sx-eyebrow");if(eyebrow)eyebrow.remove();const a=target.querySelector("a");if(a)a.textContent="Все кейсы ↗";}
 const total=periods.length;
 // Project cards may legitimately appear in more than one historical period.
 // Short excerpts from the supplied My Works source. Portraits are inserted
 // only after the actual files are pushed to the universal GitHub inbox.
 const reviews={"auto-2026":[{"id":"felix-g","name":"Felix G.","role":"NDA CEO","lead":"...мне понравился твой подход. Ты относишься к проекту, как к собственному.","body":"Спасибо тебе за работу и мой первый отпуск за 6 лет. Я не верил, что ты сможешь превысить KPI в 4 раза и взять ответственность за свои слова. Жалко с тобой прощаться, но надеюсь скрипты для менеджеров будут работать и без твоего надзора за ребятами.","before":"izi-crm","href":"/cases/automotive/"}],"summer-2026":[{"id":"alexey-rsk","name":"Alexey D.","role":"CEO RSK, ВРЕМЕНА ГОДА","lead":"...Времена года это мое чадо, которое начало работать, благодаря тебе!!","body":"Богдан хороший спец, после него пробовали другие ребята в найме, по итогу его одного смогли заменить только три дизайнера. Полиграфия, баннеры, сайты, реклама, CRM, всё настроил и сделал.","before":"vremena-goda","href":"/cases/vremena-goda/"},{"id":"victor-s","name":"Victor S.","role":"CEO EXOCURE","lead":"Хорошо выносит мозг и отрезвляет, когда глаз становится замыленным.","body":"С этим человеком быстрые звонки могут быть, только если вы не заинтересованы в своём продукте. 5 часов и 31 минуту мы обсуждали тупо один слайд презентации. Круто было поработать с дизайнером, а не очередным сотрудником.","after":"exocure","href":"/cases/exocure/"}],"hash":[{"id":"david-t-hash-hedge","name":"David T.","role":"CPO Hash Hedge","lead":"Богдан, спасибо тебе за всё. Забавно конечно начинали с утки, а в итоге столько всего сделали в Hash Hedge.","body":"С тобой реально было приятно работать, можно спокойно доверить задачу и не переживать за итог. Правда со сроками ты меня иногда подставлял ахах) За неделю делал месячный бэклог, а мне потом на тебя другие отделы жаловались.","after":"wsct","href":"/cases/hash-hedge/"}],"private-2025":[{"id":"vlad-b","name":"Vlad B.","role":"Заказчик","lead":"Let's put it this way. I'm a picky client, but only when it comes to incompetent designers who use AI instead of their own hands and eyes.","body":"You're a good designer, but you lack some fucking flexibility. Your website works well, but mine is good too.","after":"vlad-bykov","href":"/cases/vlad-bykov/"},{"id":"denis-k","name":"Denis K.","role":"Art Director Chatus","lead":"Приятный человек и классный дизайнер.","body":"Поработав вместе с тобой на проекте, понял, почему тебя рекомендовали к нам. Наши с тобой отношения сложно назвать хорошими, но работу мы сделали супер быстро и отставание дизайна на 1,5 месяца догнали за неделю.","after":"vlad-b","href":"/cases/chatus/"},{"id":"evgenii-g","name":"Evgenii G.","role":"Director GreenBox","lead":"...мой совет — работать с ним легко стало, когда дал ему полное согласие на всё...","body":"Продать газоны летом может каждый, а вот не в сезон звучит глупо. Богдана нашёл случайно, через знакомых, хотел к лету подготовиться, но он решил сделать запуск зимой. Теперь брони до 2027 года, короче советую поработать хоть раз с ним.","after":"greenbox","href":"/cases/greenbox/"}],"nutaku":[{"id":"alex","name":"Alex","role":"CPO Filth Fruits","lead":"Solid guy, honest as hell and knows his stuff even on complex projects.","body":"Bogdan was billing us hourly and let's be real, people love padding their hours lol. Not this guy tho. He'd actually cut his own time saying the job was too easy. Never had to question a single invoice. Mad respect for that.","after":"my-ai-slut","href":"/projects/"}],"duck":[{"id":"david-t-duckmaster","name":"David T.","role":"CPO DuckMaster","lead":"Рады были поработать с тобой на проекте. Не ожидал, что за сутки ты пересоберёшь проект или его визуальное исполнение.","body":"Когда смотрели твоё портфолио, были не уверены, что ты приживёшься у нас. В итоге за месяц мы изменили с тобой проект до какого-то неузнаваемого уровня. Надеюсь ещё поработать с тобой в будущем!","before":"duckmaster","href":"/cases/duckmaster/"}],"bonape":[{"id":"alexander-b","name":"Alexander B.","role":"Founder Apple Bar","lead":"Бизнес рос, но медленно.","body":"У нас была офлайн-точка по продаже телефонов в Волгограде. Посоветовали Богдана с его компанией, а за три недели сделали сайт-каталог в том стиле, который хотел, и после запустили рекламу. Более 500 заказов за месяц работы. Спасибо вам!","after":"apple-bar","href":"/cases/apple-bar/"}],"onlinesklad":[{"id":"almira-m","name":"Almira M.","role":"CPO Onlinesklad","lead":"...думала, что он слишком усложняет, но потом поняла, что именно благодаря этому мы половину интерфейса не переделывали.","body":"Богдану нельзя сказать, что нам нужен каталог товаров, он сразу начнёт спрашивать: а что если у товара пять поставщиков, разные цены, остатки? А если возврат? И так до бесконечности)","after":"onlinesklad","href":"/cases/onlinesklad/"},{"id":"sergey-j","name":"Sergey J.","role":"Founder Onlinesklad","lead":"Богдан показал себя как грамотный и ответственный специалист.","body":"Хорошо разобрался в специфике нашего продукта, самостоятельно находил проблемы и предлагал решения. Работа выполнена качественно, в согласованные сроки. Результатом доволен.","after":"almira-m","href":"/cases/onlinesklad/"}],"sober":[{"id":"evgenii-y","name":"Evgenii Y.","role":"Founder Sober Driver","lead":"Добротную работу делает, помог найти нам подрядчиков на разные задачи.","body":"Пришёл с командой, остался один на проекте и вытащил его из идеи до готового продукта. Справился с 176-страничным документом правок от новых подрядчиков, спасибо за работу, ещё позовём.","after":"sober-driver","href":"/cases/sober-driver/"}],"media":[{"id":"elena-s","name":"Elena S.","role":"CEO RESTAR & Mom Slepzof :)","lead":"Ответственный парень, который любит свою работу.","body":"Богдан с детства такой, если ему что-то действительно интересно, он может сутками сидеть, разбираться, пока не получится. Ответственный и исполнительный. Но иногда бывает ужасно ленивым, особенно если не видит смысла в том, что делает. Зато когда появляется цель, его уже не остановить.","after":"restar","href":"/cases/restar/"}]};
 for(let pi=0;pi<total;pi++){
   const d=periods[pi],stage=el("section","sx42-period"),heading=el("div","sx42-period-heading");
   stage.id=d.id;stage.dataset.period=d.id;
   const headingMain=el("div","sx42-period-main");
   headingMain.append(el("p","sx42-date",d.date),el("h3","sx42-period-name",d.name));
   const description=el("p","sx42-description");
   // Preserve the supplied copy while applying only the bold emphasis
   // explicitly shown in the Figma/PDF paragraph layout.
   const emphasis={
     "auto-2026":["За несколько месяцев выстроил брендинг, маркетинговую стратегию, 27 воронок продаж, систему подбора товаров и автоматизацию колл-центра.","79 покупок и 127 успешных продаж за два месяца"],
     "summer-2026":["полный цикл дизайна платёжного продукта занял 4 дня","количество заявок выросло на 21,6%","171 сюжетную сцену"],
     "hash":["около 465 состояний интерфейса","6 маркетинговых воронок"],
     "nutaku":["на 174% больше покупок","свыше $60 тыс. за три месяца","712 игровых сцен","1,5 млн пользователей"],
     "duck":["3,5 млн MAU","с 4% до 19,2%","с 4% до 39%","$40–50 тыс. пользовательских платежей за 96 часов","за 6 дней"],
     "bonape":["более 50 человек","24 специалиста","132 оплаченных заказа","1,6 млн подписчиков"],
     "onlinesklad":["проектированием интерфейсов"],
     "sober":["2 700 пользователей"]
   };
   let pieces=[d.desc];
   const strongPhrases=emphasis[d.id]||[];
   for(const phrase of strongPhrases){
     let next=[];
     for(const piece of pieces){
       if(typeof piece!=="string"){next.push(piece);continue}
       const fragments=piece.split(phrase);
       fragments.forEach((fragment,i)=>{if(fragment)next.push(fragment);if(i<fragments.length-1)next.push({strong:phrase})});
     }
     pieces=next;
   }
   for(const piece of pieces){
     if(typeof piece==="string")description.append(document.createTextNode(piece));
     else description.append(el("strong","",piece.strong));
   }
   headingMain.append(description,el("p","sx42-role",d.role));
   heading.append(headingMain);
   stage.append(heading);
   const railWrap=el("div","sx42-carousel");
   const rail=el("div","sx42-rail");rail.setAttribute("aria-label","Проекты периода: "+d.name);
   rail.tabIndex=0;
   for(const slug of d.slugs){
     let a=originalCards.get(slug);
     const extra=extraProjects[slug];
     // Do not invent empty black showcase tiles for a project with no supplied art.
     if(!a&&!uploadedCovers.has(slug))continue;
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
         const workSrc="/assets/cases/"+slug+"/cover-work.png";
         // When the original HTML references this same cover, the static
         // build has already supplied responsive srcset/sizes. Keep them.
         if(img.getAttribute("src")!==workSrc){
           img.src=workSrc;
           img.removeAttribute("srcset");
           img.removeAttribute("sizes");
         }
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
     const industry=coverIndustries[slug]||extra?.[4]||[...oldTags].map(z=>z.textContent.trim()).slice(0,1).join("")||"PROJECT";
     meta.append(el("span","",title+" | "+industry),el("span","",year));
     overlay.append(meta);
     overlay.append(el("h4","sx42-card-title",headline));
     if(subtitle)overlay.append(el("p","sx42-card-copy",subtitle));
     card.append(overlay);
     const foot=el("div","sx42-card-foot");
     const customMetric=coverMetrics[slug];
     if(customMetric||oldMetric){
       const number=customMetric?.[0]||oldMetric.querySelector("strong")?.textContent.trim();
       const label=customMetric?.[1]||oldMetric.querySelector("span")?.textContent.trim();
       if(number){
         const metric=el("div","sx42-card-metric");
         metric.append(el("strong","",number));
         if(label)metric.append(el("span","",label));
         foot.append(metric);
       }
     }
     const arrow=el("span","sx42-card-arrow","↗");arrow.setAttribute("aria-hidden","true");
     foot.append(arrow);card.append(foot);
     // Each card always has a distinct case arrow, including NDA artworks.
     rail.append(card);
   }
   // Reviews are positioned exactly between the matching source projects,
   // instead of being inserted mechanically as the second slide.
   for(const review of reviews[d.id]||[]){
     const card=el("a","sx42-card sx42-review");
     card.href=review.href||"/projects/";
     card.dataset.reviewId=review.id;
     card.setAttribute("aria-label","Отзыв "+review.name+", "+review.role);
     card.append(el("span","sx42-quote-mark","“"));
     card.append(el("p","sx42-review-lead",review.lead));
     if(review.body)card.append(el("p","sx42-review-body",review.body));
     const portrait=el("img","sx42-review-portrait");
     portrait.src="/assets/reviews/"+review.id+".png";
     portrait.alt=review.name;portrait.loading="lazy";portrait.decoding="async";
     card.append(portrait);
     card.append(el("div","sx42-review-author",review.name+" · "+review.role));
     const arrow=el("span","sx42-card-arrow","↗");
     arrow.setAttribute("aria-hidden","true");
     card.append(arrow);
     const before=review.before?rail.querySelector('[data-slug="'+review.before+'"],[data-review-id="'+review.before+'"]'):null;
     const after=review.after?rail.querySelector('[data-slug="'+review.after+'"],[data-review-id="'+review.after+'"]'):null;
     rail.insertBefore(card,before||after?.nextSibling||null);
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
