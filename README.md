# SLEPZOF Portfolio

Исходная рабочая ветка: **dev**. Ветка `main` — стабильная резервная версия. GitHub Pages автоматически публикует `dev`.

- [Портфолио](https://slepzof.github.io/slepzof-portfolio/)
- [Живой Style Guide (Light / Dark)](https://slepzof.github.io/slepzof-portfolio/design/style-guide/)
- [Дизайн-система](docs/STYLE_GUIDE.md)
- [Карта медиа и замена изображений](docs/ASSET_MAP.md)
- [Архитектура и план миграции](docs/ARCHITECTURE.md)
- [Аудит текущего репозитория](docs/REPOSITORY_AUDIT.md)
- [Модель кейсов, SEO и CMS](docs/CONTENT_MODEL.md)
- [Деплой](DEPLOY.md)

## Быстро найти нужный файл

| Что редактировать | Путь |
| --- | --- |
| Палитра Light / Dark, типографические и layout-токены | `css/system/tokens.css` |
| Общее подключение системы для старых страниц | `css/v10.css` (импорты `css/system/`) |
| Шрифты H1–H6 и тексты | `css/system/typography.css` |
| Контейнеры и сетка 1116 px | `css/system/layout.css` |
| Кнопки Primary / Secondary / Tertiary | `css/system/components.css` |
| «Сначала были факты» | `css/v38-process.css`, `js/v38-process.js`, `assets/home/process/` |
| «Каждый рынок» | `css/v41-markets.css`, `js/v41-markets.js`, `assets/home/markets/` |
| Изображения проектов | `assets/cases/<slug>/` |

**Внимание:** старые `css/v*.css` и `js/v*.js` ещё используются разными страницами. Их нельзя удалять без проверки всех зависимостей. Архив README и старых QA-снимков находится в `docs/archive/`.

## Сборка

```bash
SITE_BASE_PATH=/slepzof-portfolio python3 scripts/build_static.py
python3 scripts/check_design_system.py
```

Исходники публичные. Не коммитить пароли, токены или NDA. Админка на базе локального Python-сервера не публикуется GitHub Pages.
