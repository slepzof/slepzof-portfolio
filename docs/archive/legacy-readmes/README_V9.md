# SLEPZOF Portfolio v9

Статический сайт на HTML, CSS и JavaScript. Без npm и сборщика. Для проверки открыть на локальном HTTP сервере, например `python3 -m http.server 8000` из корневой папки, затем `http://localhost:8000`. Для Cloudflare Pages опубликовать содержимое папки `slepzof-v9`.

## Изображения

Обложки проектов: `assets/cases/<slug>/cover.webp`. Большое изображение в первом блоке: `assets/cases/hash-hedge/hero.webp`. Компания SALUTE: `assets/agencies/salute-logo.webp` и `assets/agencies/salute-background.webp`. ARTSAVUR: `assets/agencies/artsavur-logo.webp` и `assets/agencies/artsavur-background.webp`. При замене файлов сохраняйте название и расширение, тогда менять HTML или CSS не нужно. Портрет: `assets/home/about-portrait.webp`. PDF резюме: `assets/resume.pdf`.

## Артефакты

Для последовательности изображений внутри кейса: папка `assets/cases/<slug>/<group>/`, имена `01.webp`, `02.webp`, `03.webp` и так далее. После добавления можно запустить `python3 refresh_galleries.py`. Детали в `GALLERY_GUIDE.md`. Для истории обо мне: `assets/cases/about-life/<period>/`.

## Страницы

`index.html` — главная. `about/index.html` — биография. `work-with-me/index.html` — форматы сотрудничества. `projects/index.html` — каталог. `cases/*/index.html` — кейсы. Стили v9 в `css/v9.css`; предыдущие CSS оставлены для совместимости со 108 страницами.

## Что ещё нужно проверить перед публикацией

Заменить заглушки реальными изображениями и артефактами; проверить формулировки и цифры по документам; вручную открыть сайт в Safari на Mac и iPhone, проверить меню и галереи. RU/ENG ещё не сделан.
