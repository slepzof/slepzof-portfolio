# SLEPZOF: техническая архитектура

## Текущий рабочий подход

Сайт статический и публикуется из `dev` через GitHub Pages. `main` — стабильная ветка.

- `css/system/` — глобальные токены и повторно используемые стили.
- `css/v10.css` — **временная общая точка подключения** токенов ко всем использующим старую базу страницам, пока не внедрены прямые ссылки на системные стили.
- `css/v*.css` — пока действующее наследие версий. Удалять после миграции и проверки зависимостей.
- `js/v*.js` — действующая интерактивность; часть скриптов используется и на страницах кейсов.
- `assets/home/` — графика главной страницы по секциям.
- `assets/cases/<slug>/` — графика каждого проекта.
- `design/style-guide/` — доступная в браузере демонстрация дизайн-системы.
- `docs/` — инструкции, матрицы, архив прежних README/QA.
- `scripts/build_static.py` — сборка GitHub Pages, переписывает корневые пути на /slepzof-portfolio.
- `admin/`, `cms/` — локальная редактура, не публичный редактор на Pages.

## Что уже изменено

Подключена дизайн-система на главной. Блок «Как я работаю» использует ширину 1116px и общий H2. Для пятого блока CSS использует общую сетку/Lead XL и семантический H2, а sticky-логика держит viewport-sized stage и смещает отдельную Figma scene: это убирает пустую чёрную область после окончания прокрутки.

Старые контентные секции мигрируются постепенно, а не глобальной переустановкой селекторов `h1`-`h6`: старые мелкие заголовки карточек также часто размечены H3/H4 и массовое увеличение их испортит.

## Порядок следующего рефакторинга

1. Проверить реальные скриншоты и прокрутку на 1440, 1024, 768, 393; исправить расхождения с утверждёнными референсами.
2. По одному перевести Hero, Selected и Beyond UI на общие переменные.
3. Инвентаризировать все зависимости остальных `cases/*/index.html`, `projects/`, `marketing/`, `about/`.
4. После переноса удалить неиспользуемые `v*.css` и `v*.js`. История остаётся в Git.
5. Построить общий шаблон кейсов с контентом из данных для будущей CMS.

## Зависимости и ответственность

JS секций должен управлять только поведением (progress, transform, aria), CSS — размерами и темой. Высота sticky-секции рассчитывается из viewport + точной дистанции движения, без дополнительной пустой прокрутки в конце.

Для SEO требуется правильная иерархия HTML, а не переписывание H2/H3 «под размер». Типографические классы независимы от семантики.

Любые новые компоненты берут размеры и цвета из `css/system/tokens.css`. Не заводить новые versioned CSS при каждой правке.

## Desktop polish: 11 ноября 2026

Файлы актуальных эффектов:
- `css/v25-block3-slider-v5.css` + `js/v25-block3-slider-v3.js`: избранные проекты, двухстрочное описание и работающие кнопки слайдера (устойчивые snap-позиции в Safari).
- `css/v38-process.css`: общий контейнер 1116px, без увеличения изображений за границы прокручиваемой полосы при hover.
- `css/v41-markets.css` + `js/v41-markets.js`: обрезка по обеим границам серой панели; разделение вертикальной прокрутки на вводный подъём, горизонтальное движение, остановку на финальных карточках и показ футера.
- `css/sections/home-entrance.css` + `js/sections/home-entrance.js`: краткий лоадер с заполнением S синим и последующее плавное появление текста главного экрана. Только desktop ≥801px, с ограничением загрузки по времени; на мобильных версиях ничего не блокирует.

Утверждённые тексты, фотографии, порядок карточек и принципы мобильной колоды не менялись. Для визуальной проверки нужны реальные скриншоты Safari на 1440/1024/1920, потому что статический CI проверяет только сборку, ссылки и синтаксис.


## Mobile markets layout (11 November 2026)
The mobile market gallery now uses normal-flow header/footer and a dedicated sticky `.sx41-mobile-scroll` with its own gallery viewport and scroll runway. The gallery remains driven by native vertical scrolling, but no longer shares an absolute-positioning plane with the description or footer. Its progress fill is block-level and exposes `aria-valuenow`. Mobile layout and the Beyond UI mobile type overrides are maintained in `css/sections/mobile-layout.css` rather than another versioned stylesheet.


## Universal entry loader (11 November 2026)
The `css/sections/home-entrance.css` and `js/sections/home-entrance.js` sequence is shared by desktop and mobile: neutral S for 150ms, blue fill for 1050ms, filled hold for 200ms, and 320ms fade-out. Hero copy reveals with staggered motion; existing Lottie fallback crossfades after the real SVG/canvas is ready. Reduced-motion users skip this decorative sequence, Safari BFCache restores skip it, and a 2400ms inline watchdog removes the loading class if JavaScript fails.

## Beyond UI / Mobile Orbit (2026-11-11)

`css/sections/beyond-mobile-orbit.css` + `js/sections/beyond-mobile-orbit.js`: mobile-only, native scroll-driven narrative. The radar from the first skill is **moved** into one sticky viewport (not cloned), initially shown full-size. Native scroll zooms into the active vertex, then rotates the existing SVG 45 degrees between skills. The displayed icon/name/score follows the foreground vertex; the spotlight coordinates update continuously. All eight approved skill panels, their texts, metrics, tools, and project carousels are kept in natural document flow, without cloned full-screen overlays or forced scroll jumps.

`js/v34-beyond-ui-story.js` preserves existing desktop behaviour, while its legacy mobile switching/gesture handlers explicitly short-circuit when `.sx40-mobile-continuous` is present. Mobile radar point clicks still scroll directly to the appropriate content. On device-width changes the original radar returns to its source panel, so the desktop layout remains unchanged. Reduced-motion preference produces immediate, non-scrubbed states.

This is a deliberate transition away from `sx37-overlay` on mobile. Do not re-enable 800px chapter padding or mobile `scrollTo` chapter resets.


## Radar Instrument v2: full → compact (2026-11-11)
Replaced the overlapping full-screen mobile orbit with an introductory full-size original radar (`.sx40-overview`) and a single compact 190px opaque sticky instrument (`.sx40-reading > .sx40-instrument`). The original radar retains clickable labels; the compact graphic is a one-time clone of its SVG with renamed gradient/mask IDs to prevent collisions. Native scrolling continuously zooms/fades the introduction and rotates the compact graph 45 degrees as new skill panels enter view. The compact instrument is a child of the reading wrapper, so its sticky behavior stops naturally after Leadership and never appears in the next section. No touch interception or automatic scrollTo during normal reading.

## Beyond UI / Cinematic Chapters (2026-11-11)

Current mobile implementation: `css/sections/beyond-mobile-chapters.css` and `js/sections/beyond-mobile-chapters.js`. One **original interactive radar** appears in an independent, in-flow intro with a scroll-scrubbed zoom. All eight existing content sections remain in normal flow. Seven small diagram fragments live **between** the skills, animate a 45-degree clock turn and crossfade icon/name/score over 180–250px of normal vertical scrolling. The last skill ends normally; no sticky layer can spill into the next section. Old orbit CSS/JS, full-screen overlay CSS and forced chapter-switch handler are removed from the active branch; desktop scrollytelling and carousel code are preserved.


## Beyond UI mobile — Radar Morph (2026-11-11)
The active implementation is now `css/sections/beyond-mobile-morph.css` and `js/sections/beyond-mobile-morph.js`. It keeps the approved intro, original clickable radar, eight complete skill texts/metrics/tool lists and all 24 approved temporary project covers unchanged. The original radar moves into a short sticky morph runway (220px of scroll progress), transforming into a 132x150 skill card and releasing *before the reading content*. Reading content is centered using design tokens. Each project's three existing anchor cards becomes a deck with a touch horizontal swipe and accessible prev/next controls; vertical swipes remain native. Seven non-sticky, in-flow clock fragments rotate 45° to transition between skills. None of this applies above 800px. The previous Cinematic Chapters files remain in Git history but are removed from the active bundle.


## Beyond UI: mobile case-scroll stack (2026-11-11)
For every one of the 8 mobile skills, the existing 3 case links are normal document-flow items with **24px gaps**. During native vertical scroll, the covers use CSS `position:sticky` with progressively lower top offsets, and z-index values 1/2/3. Thus the second case climbs over the first while leaving its title strip visible, then the third climbs over the second. The stack releases at the end of the carousel. All original case art, metrics, typography and links remain unchanged. Horizontal swiping and arrows are removed only from this mobile case view. Desktop still uses its original horizontal slider. No scroll hijacking or additional duplicate cards.


## Beyond UI: nested skill portals, actual content (2026-11-11)
On mobile, each of the seven first skills retains three approved image case links, then appends a **fourth real DOM card** to the *same* 24px-spaced sticky stack. Its SVG radar starts turning 45° as soon as its top first enters the viewport, **before** the next skill preview appears. Continued native scrolling expands the same card from cover width to viewport width, reduces the corner radius to zero and reveals the **original** next skill heading and full description inside the card (moved, never rewritten or cloned). The next panel contains the original stats, tools and case links in normal flow immediately afterwards. At desktop widths, the same headings are put back into their original panels. Leadership has exactly three cases and no next-skill card. No touch capture, arbitrary timers, fixed overlay or page scroll reset. The behavior is scroll-reversible and restricted to below 801px.
