# Together — приложение для совместного управления жизнью

Версия 1.3: React UI на `:3000` + Express API и Socket.io на `:5050`.
Данные живут в SQLite, синхронизируются в реальном времени. Появились капсулы времени и общий бюджет.

![Dashboard](screenshots/01-dashboard.png)

## Запуск вместе

Нужны два терминала.

```bash
# 1. Backend
cd together-backend
npm install
npm run seed   # пересоздаёт БД — после этого нужно войти заново
npm start
# если 5000 занят AirPlay: PORT=5050 npm start
```

```bash
# 2. Frontend (корень репозитория)
cp .env.example .env   # VITE_API_URL=http://localhost:5050/api
npm install
npm start
```

Откройте [http://localhost:3000/login](http://localhost:3000/login).

Демо после seed:

| Кто | Email | Пароль |
| --- | --- | --- |
| Артём | `artem@together.app` | `together123` |
| Катя | `katya@together.app` | `together123` |

Код пары: `TOGETHER1`.

`npm run seed` полностью пересоздаёт SQLite. Старые JWT в `localStorage` перестают работать — фронт сам отправит на `/login`. Войдите снова демо-аккаунтом.

На production используйте `npm run seed:demo` в каталоге `together-backend` — создаёт демо-аккаунты, **не** стирая базу.

Если пары ещё нет — после входа откроется `/couple-setup`.

## Что синхронизируется

- JWT в `localStorage`, refresh при 401
- Задачи, события, мечты и лента — REST
- Создание/перемещение задач и прогресс мечт — сразу в БД
- Socket.io: изменения партнёра появляются без перезагрузки
- Капсулы времени и общий бюджет (сплит 50/50 или кастомный)

## Запуск только UI

```bash
npm install
npm start
```

Приложение откроется на [http://localhost:3000](http://localhost:3000). Без backend логин не заработает.

Другие команды:

| Команда | Что делает |
| --- | --- |
| `npm start` / `npm run dev` | dev-сервер Vite на порту 3000 |
| `npm run build` | production-сборка в `dist/` |
| `npm run preview` | локальный просмотр собранной версии |

Экраны: `/`, `/tasks`, `/calendar`, `/wishes`, `/capsules`, `/budget`.
Тему можно принудительно задать параметром `?theme=light` или `?theme=dark` (по умолчанию
берётся сохранённая, а при первом визите — системная).

## Стек

- **React 18** + **Vite** — быстрый dev-сервер и HMR
- **Tailwind CSS 3** — дизайн-система в `tailwind.config.js` (цвета, градиенты, анимации)
- **React Icons** (Feather + Hero Icons) — иконки
- Состояние — React Context (`src/context/AppContext.jsx`), без внешних стор-библиотек
- Drag & drop — нативный HTML5 Drag and Drop, без зависимостей

## Экраны

### 1. Dashboard

Метрики (задачи на сегодня, события месяца, общие цели, дни вместе), быстрые действия,
лента активностей, памятные даты и мечты в фокусе.

### 2. Shared Tasks — канбан

![Задачи](screenshots/02-tasks.png)

Три колонки `To Do / In Progress / Done`, карточки с ответственным, сроком и цветовым
кодом. Перетаскивание между колонками, чекбокс завершения, фильтры «Все / Мне / Ей / Общее».

### 3. Shared Calendar

![Календарь](screenshots/03-calendar.png)

Месячная сетка, события с цветом по участнику, тёмная полоса на днях с совместными
событиями, панель деталей выбранного дня и хронология месяца.

### 4. Wishes — общие мечты

![Мечты](screenshots/04-wishes.png)

Группировка по категориям (✈️ Путешествия, 🛍️ Покупки, 🏠 Дом/Ремонт, 🎯 Саморазвитие),
приоритет Low/Med/High, дата желаемого завершения, владелец и прогресс с шагом ±10%.

### 5. Time Capsules

Письма и фото с опциональной датой открытия. Закрытая капсула скрывает содержимое до нужного дня;
в день открытия — 🎉. Автор может удалить, ссылку можно скопировать.

### 6. Shared Budget

Расходы пары, категории, кто платил, сплит 50/50 или кастомный процент, баланс «кто кому должен»
и pie-чарты (recharts).

### Тёмная тема и мобильная версия

| Dark mode | Мобильный экран |
| --- | --- |
| ![Тёмная тема](screenshots/05-dark-mode.png) | ![Мобильная версия](screenshots/06-mobile.png) |

## Дизайн-система

| Роль | Цвет |
| --- | --- |
| Основной | `#667eea` (`brand`) |
| Акцент «Она» | `#f093fb` (`her`) |
| Акцент «Он» | `#4facfe` (`him`) |
| Общее | `#10b981` (`both`) |
| Фон | `#f8fafc` (`canvas`), тёмный — `#0b1020` |
| Текст | `#1e293b` (`ink`) |

Цвет всегда отвечает на вопрос «чьё это»: синий — Артём, розовый — Катя, зелёный — общее.
Поверхности собраны в утилиты `.surface`, `.field`, `.chip` (см. `src/index.css`).

## Структура

```
together-mvp/
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── public/
│   └── favicon.svg
├── screenshots/           # скриншоты + скрипт съёмки
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── Header.jsx
    │   ├── Sidebar.jsx
    │   ├── Dashboard.jsx
    │   ├── TaskBoard.jsx
    │   ├── Calendar.jsx
    │   ├── Wishes.jsx
    │   ├── TimeCapsules/
    │   ├── Budget/
    │   ├── Modals.jsx
    │   └── shared/
    │       ├── Avatar.jsx
    │       ├── Button.jsx
    │       ├── Card.jsx
    │       ├── Modal.jsx
    │       ├── OwnerPicker.jsx
    │       └── ProgressBar.jsx
    ├── context/
    │   └── AppContext.jsx
    ├── data/
    │   └── mockData.js
    ├── pages/
    │   ├── Home.jsx
    │   └── index.jsx
    └── utils/
        └── helpers.js
```

## Что интерактивно

- Переключение разделов (сайдбар, нижняя навигация на мобильном, hash-ссылки)
- Модалки «Добавить задачу / событие / желание» — с валидацией пустого названия,
  закрытием по `Esc`, клику по фону и `Enter` для отправки
- Drag & drop задач между колонками канбана
- Чекбокс завершения задачи (зачёркивание + запись в ленту активностей)
- Удаление задачи по наведению на карточку
- Клик по дню календаря — детали дня; переключение месяцев
- Прогресс мечты ±10%
- Переключатель тёмной/светлой темы (сохраняется в `localStorage`)
- Фильтры задач по владельцу и мечт по категориям

Добавленные объекты попадают в ленту активностей и пересчитывают метрики на Dashboard.

## Production Deploy (Vercel + Render)

Полный стек: API на [Render](https://render.com) (`together-backend/`), UI на [Vercel](https://vercel.com) (корень репо). Бесплатный план Render: web-сервис + Postgres.

### Deployment на Render (Бесплатно!)

Render даёт бесплатный Web Service (спин-даун после 15 мин простоя) и бесплатный Postgres (1 ГБ, **истекает через 30 дней**). Этого достаточно для MVP.

Файл `render.yaml` лежит в **корне репозитория** (Render Blueprint читает его оттуда). Копия для ручного пути — `together-backend/render.yaml`. Переменные: `together-backend/.env.render.example` и `.env.render.example` (фронт).

#### Backend (Node.js API + PostgreSQL)

**Вариант A — Blueprint (рекомендуется)**

1. [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint**.
2. Подключить GitHub-репозиторий `Tim124v/Together`, branch `main`.
3. Render подхватит корневой `render.yaml`: сервис `together-api` + БД `together-db` (Frankfurt, Free).
4. Когда спросит `sync: false` переменные:
   - `CORS_ORIGIN` = `https://<ваш-проект>.vercel.app` (можно сначала `https://placeholder.vercel.app` и поправить после деплоя фронта)
   - `PUBLIC_API_URL` = появится после первого деплоя, вида `https://together-api.onrender.com` — сохраните и при необходимости обновите
5. Apply. JWT-секреты сгенерируются сами (`generateValue`).

**Вариант B — вручную через UI**

1. **Создать сервис API:**
   - Перейти на [render.com](https://render.com) → New → **Web Service**
   - Подключить GitHub-репозиторий (`Tim124v/Together`)
   - Name: `together-api`
   - Region: **Frankfurt**
   - Branch: `main`
   - Root Directory: `together-backend`
   - Runtime: Node
   - Build Command: `npm ci --omit=optional`
   - Start Command: `npm start`
   - Instance Type: **Free**

2. **Добавить PostgreSQL:**
   - New → **PostgreSQL**
   - Name: `together-db`
   - Database: `together`
   - User: `together_user`
   - Region: **Frankfurt** (как API)
   - Instance Type: **Free**
   - В сервисе API: Environment → Add `DATABASE_URL` from `together-db` (Internal Database URL)

3. **Переменные окружения API:**

```
NODE_ENV=production
JWT_ACCESS_SECRET=<openssl rand -hex 32>
JWT_REFRESH_SECRET=<другой openssl rand -hex 32>
CORS_ORIGIN=https://<проект>.vercel.app
PUBLIC_API_URL=https://together-api.onrender.com
DB_SYNC=sync
PGSSL=true
DB_DIALECT=postgres
DATABASE_URL=<Internal Database URL из together-db>
```

`PORT` не задавайте — Render подставит сам.

4. Проверка: `https://together-api.onrender.com/health` и `/api/docs`. Первый запрос после сна сервиса может занять ~30–60 секунд.

5. Демо-аккаунты (база **не** стирается): в Render Dashboard → сервис API → **Shell**:

```bash
npm run seed:demo
```

Логин: `artem@together.app` / `together123`. Обычный `npm run seed` на production запрещён.

#### Frontend (Vercel)

1. New Project → этот репозиторий. Framework: **Vite**, Root: `.`, Build: `npm run build`, Output: `dist`.
2. Environment Variables **до** первого успешного продакшен-деплоя (иначе нужен Redeploy):

```
VITE_API_URL=https://together-api.onrender.com/api
VITE_SOCKET_URL=https://together-api.onrender.com
VITE_WS_URL=https://together-api.onrender.com
VITE_APP_NAME=Together
```

Подставьте свой onrender-URL, если имя сервиса другое. Шаблон: `.env.render.example`.

3. `vercel.json` уже редиректит SPA-роуты на `index.html`.
4. Скопируйте `https://<проект>.vercel.app` в Render `CORS_ORIGIN` и сделайте **Manual Deploy** API.

Локальная проверка сборки:

```bash
npm run build
npm run preview
```

#### Ограничения Free

- Web Service засыпает через 15 минут без трафика; WebSocket после пробуждения переподключается сам.
- Free Postgres: 1 ГБ, один на workspace, удаляется через 30 дней (+14 дней на апгрейд).
- `sqlite3` на Render не ставится (`npm ci --omit=optional`) — локально он optional и нужен для SQLite.

Шаблоны: `.env.render.example`, `together-backend/.env.render.example`, `.env.production.example`. Файлы `.env` в git не попадают.

Railway остаётся запасным вариантом — см. `together-backend/README.md`.

## Скриншоты

Пересобрать скриншоты (нужен установленный Google Chrome и запущенный dev-сервер):

```bash
bash screenshots/capture.sh
```
