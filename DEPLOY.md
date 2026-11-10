# SLEPZOF — онлайн-предпросмотр без Work/Warp Mode

## 1. Один раз загрузить текущую v35

1. Возьми архив `SLEPZOF_Portfolio_v25_BeyondUI_v35_Final.zip`.
2. Распакуй папку `slepzof-portfolio-v25`. Внутри неё должны быть `index.html`, `css/`, `js/`, `assets/` и другие каталоги.
3. Открой репозиторий `slepzof/slepzof-portfolio` в GitHub Desktop (можно скачать на Mac).
4. Склонируй репозиторий, скопируй **содержимое** папки `slepzof-portfolio-v25` в корень клона, не перезаписывая `README.md`, `DEPLOY.md`, `.gitignore` и `scripts/`.
5. Переключись на ветку `dev`, создай коммит `Import SLEPZOF v35` и нажми Push origin.
6. Проверь, что на GitHub в ветке dev появились `index.html`, `assets/`, `css/`, `js/`, `cms/data.json`.

**Не загружай локальные секреты, .env или пароли.** Репозиторий публичный.

## 2. Подключить Cloudflare Pages

1. Открой https://dash.cloudflare.com/ → **Workers & Pages**.
2. **Create application** → **Pages** → **Connect to Git**.
3. Подключи GitHub и выбери `slepzof/slepzof-portfolio`.
4. Укажи production branch: **main**.
5. Настройки сборки: Framework preset **None**, Build command `python3 scripts/build_static.py`, Build output directory `dist`.
6. В Cloudflare: **Settings → Builds → Branch control** — разреши предпросмотры для ветки **dev**.
7. Найди URL развёртывания ветки `dev` на вкладке Deployments. Сохрани его на MacBook и iPhone.

Preview URL привязан к ветке и будет обновляться при новых коммитах в `dev`. Публичная главная ветка `main` не изменяется, пока правки не утверждены.

## 3. После каждой правки

- ChatGPT изменяет файлы в GitHub в ветке `dev`.
- Cloudflare автоматически запускает деплой после push.
- Дождись в Deployments статуса **Success**, затем обнови один и тот же URL в Safari на MacBook или iPhone.
- Для сброса кеша в Safari на MacBook: Option+Command+R; на телефоне можно открыть ссылку в новой вкладке либо добавить query `?v=36`.

Это публикация **после коммита**, а не стриминг каждого нажатия клавиши.

## Ограничения

- Cloudflare Pages в этой конфигурации отдаёт только статические файлы. `server.py` и запись через `admin/` остаются локальными.
- `cms/data.json` публикуется как часть сайта: не хранить там секреты или приватную информацию.
- Если в исходной версии есть абсолютные ссылки (например `/assets/...`), Cloudflare Pages подходит, потому что сайт публикуется в корне домена.
- Если репозиторий нужно скрыть от посторонних, переведи его в Private до загрузки исходников.
