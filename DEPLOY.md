# SLEPZOF: GitHub Pages на MacBook и iPhone

## 1. Загрузка сайта v35

Репозиторий: https://github.com/slepzof/slepzof-portfolio

1. Открой GitHub Desktop на Mac и клонируй репозиторий.
2. В GitHub Desktop выбери ветку `dev`.
3. Распакуй `SLEPZOF_Portfolio_v25_BeyondUI_v35_Final.zip`. Скопируй **содержимое** папки `slepzof-portfolio-v25` в корень клонированного репозитория: должны появиться `index.html`, `css/`, `js/`, `assets/`, `cases/`, `cms/`.
4. Не удаляй существующие `README.md`, `DEPLOY.md`, `.gitignore`, `scripts/`, `.github/`.
5. Коммит `Import SLEPZOF v35` → `Push origin`.

**Важно:** репозиторий публичный. Перед загрузкой исключи секреты, `.env`, пароли и приватные файлы. В GitHub Pages публикуются только статические публичные файлы, но исходники публичного репозитория могут просматривать другие.

## 2. Разрешить GitHub Pages

Открой https://github.com/slepzof/slepzof-portfolio/settings/pages

В секции **Build and deployment → Source** выбери **GitHub Actions** (не `Deploy from a branch`). Workflow `.github/workflows/pages.yml` публикует **только изменения из `dev`**.

В разделе **Actions** после push появится запуск `Deploy SLEPZOF GitHub Pages`. Дождись **Success**.

## 3. Сайт на MacBook и iPhone

После первого успешного deploy открой:

https://slepzof.github.io/slepzof-portfolio/

На MacBook: Safari → открой ссылку и обнови страницу после очередной публикации.

На iPhone: Safari → та же ссылка, добавить на главный экран по желанию.

Это постоянный URL. Новый код появляется только после коммита в `dev` и успешного деплоя (иногда публикация занимает несколько минут). Проверяй **Actions** и **Settings → Pages**, если обновление не появилось. При кешировании попробуй `?v=36` в конце URL.

## 4. Как работаем дальше

- ChatGPT читает актуальные файлы репозитория, меняет утверждённую часть проекта, коммитит в `dev`.
- GitHub Actions автоматически собирает и публикует сайт.
- Пользователь проверяет ссылку с MacBook и iPhone.
- После согласования обновление можно перенести в `main`.

## Почему именно Actions, а не обычная публикация ветки?

У SLEPZOF есть абсолютные пути (`/assets/...`, `/cases/...`). GitHub Pages у проектного репозитория работает под подпапкой `/slepzof-portfolio/`. Скрипт `scripts/build_static.py` исправляет пути **только в сборке** `dist/`. Не изменяет оригинальные файлы, не публикует `server.py` и локальную панель `admin/`.

## Диагностика

- В `dev` пока нет `index.html` — публикация не начнётся: сперва загрузи исходники v35.
- Запуск **Deploy SLEPZOF GitHub Pages** завершился ошибкой — открой Actions → failed job и посмотри лог.
- Получаешь 404 — проверь, что выбран **GitHub Actions**, workflow прошёл успешно и открыта ссылка с `/slepzof-portfolio/`.
- Админка `/admin/` и Python CMS недоступны онлайн: GitHub Pages отдаёт статические файлы, редактирование через локальный сервер остаётся локальным.
