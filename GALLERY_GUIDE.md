# Как добавлять скриншоты пачками

У каждой галереи есть своя папка. Например:

- `assets/cases/hash-hedge/site/`
- `assets/cases/hash-hedge/dashboard/`
- `assets/cases/hash-hedge/terminal/`
- `assets/cases/onlinesklad/catalog/`, `accounts/`, `orders/`
- `assets/cases/duckmaster/ui/`, `gameplay/`, `economy/`
- `assets/cases/transport-tech/client/`, `operator/`, `admin/`
- для остальных проектов `assets/cases/ИМЯ/gallery/`

## Самый простой вариант, без программ и редактирования HTML

1. Создайте нужную папку, если она пока пуста.
2. Поместите в неё файлы `01.webp`, `02.webp`, `03.webp` и так далее **без пропусков в номерах**. Также поддерживаются JPG и PNG.
3. Перезагрузите страницу: изображения сами появятся в адаптивной сетке, и по нажатию откроются крупнее.

Можно добавлять десятки изображений сразу. Галерея проверяет их последовательность до первого пропуска.

## Если хотите сохранять любые названия файлов

Запустите из корня сайта `python3 refresh_galleries.py`. Скрипт создаст рядом с папками `gallery.json`, где перечислены имена всех изображений. После этого можно загрузить всю папку на Cloudflare Pages, в том числе со сложными названиями. HTML менять не нужно.

Галереи показывают реальные изображения, а не сшитые длинные коллажи. Обложки проектов, как и раньше, лежат в `assets/cases/PROJECT/cover.webp`.

## Новое: кейс обучения BONAPE

- `assets/cases/bonape-training/program/` — программа и методические материалы
- `assets/cases/bonape-training/assignments/` — задания и ревью
- `assets/cases/bonape-training/students/` — Figma учеников и их проекты
- `assets/cases/bonape-training/dashboards/` — кабинеты и рабочие процессы
- `assets/cases/bonape-training/commercial/` — коммерческие проекты

## Новое: фотографии к истории «Обо мне»

В `assets/cases/about-life/` есть папки `bakery`, `restar`, `media`, `forfis`, `development`, `bonape`, `today`. В любую можно положить 01.webp, 02.webp и так далее. Фото появятся внутри соответствующей главы автоматически.
