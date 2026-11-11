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
