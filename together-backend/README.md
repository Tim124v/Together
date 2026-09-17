# Together Backend 1.3

REST API + JWT + Socket.io для приложения Together. По умолчанию работает на **SQLite** (без установки Postgres). Схема PostgreSQL: `migrations/001_init_schema.sql` + `migrations/002_premium_features.sql`.

На macOS порт **5000** часто занят «Приёмником AirPlay» (Control Center). Если `npm start` пишет `EADDRINUSE`, выключите AirPlay Receiver в Системных настройках → Основные → AirDrop и Handoff — или задайте `PORT=5050` в `.env`.

- API: `http://localhost:5050`
- Swagger: `http://localhost:5050/api/docs`
- WebSocket: `ws://localhost:5050`

## Запуск

```bash
cd together-backend
npm install
npm run seed          # демо Артём & Катя; пересоздаёт БД, JWT сбрасываются
npm start             # http://localhost:5050
```

`npm start` сам скопирует `.env.example` → `.env`, если файла ещё нет.

Демо-аккаунты после seed:

| Кто | Email | Пароль |
| --- | --- | --- |
| Артём | `artem@together.app` | `together123` |
| Катя | `katya@together.app` | `together123` |

Код приглашения пары: `TOGETHER1`.

Для hot-reload: `npm run dev`.

## PostgreSQL (опционально)

```bash
createdb together
psql -d together -f migrations/001_init_schema.sql
```

В `.env`:

```
DB_DIALECT=postgres
DATABASE_URL=postgres://together:together@localhost:5432/together
```

`user2_id` в миграции nullable — чтобы можно было создать пару и пригласить партнёра кодом.

## Auth

`POST /api/auth/register` `{ email, password, name, avatarColor? }`  
`POST /api/auth/login` `{ email, password }`  
`POST /api/auth/refresh` `{ refreshToken }`  
`GET /api/auth/me`

Ответ логина:

```json
{
  "user": { "id": "...", "email": "...", "name": "Артём", "avatarColor": "blue" },
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": "24h"
}
```

Access JWT живёт 24 часа, refresh — 30 дней (хранится как SHA-256 в БД и ротируется). Пароли — bcrypt. На `/api/auth/*` стоит rate limit: 20 запросов / 15 минут.

Заголовок: `Authorization: Bearer <accessToken>`.

## Пары

`POST /api/couples` — создать пару (`partnerEmail`, `coupleName`, `startDate`) **или** вступить (`inviteCode`)  
`POST /api/couples/join` `{ inviteCode }`  
`GET /api/couples/current`  
`GET /api/couples/:id`  
`PUT /api/couples/:id`

`user1` = «он» (синий), `user2` = «она» (розовый). `assignedTo: null` у задачи = общее.

## Ресурсы пары

| Метод | Путь |
| --- | --- |
| GET/POST | `/api/couples/:coupleId/tasks` |
| PUT/DELETE | `/api/tasks/:taskId` |
| PATCH | `/api/tasks/:taskId/status` `{ "status": "in_progress" }` |
| GET/POST | `/api/couples/:coupleId/events` (`?year=2026&month=9`) |
| PUT/DELETE | `/api/events/:eventId` |
| GET/POST | `/api/couples/:coupleId/wishes` |
| PUT/DELETE | `/api/wishes/:wishId` |
| PATCH | `/api/wishes/:wishId/progress` `{ "progress": 50 }` |
| GET | `/api/couples/:coupleId/activities` |
| GET/POST | `/api/couples/:coupleId/capsules` |
| GET/PUT/DELETE | `/api/capsules/:capsuleId` |
| POST | `/api/capsules/:capsuleId/open` |
| GET/POST | `/api/couples/:coupleId/budget/expenses` (`?month=2026-09`) |
| GET | `/api/couples/:coupleId/budget/summary` |
| GET | `/api/couples/:coupleId/budget/balance` |
| GET | `/api/couples/:coupleId/budget/categories` |
| PUT/DELETE | `/api/budget-items/:itemId` |
| POST | `/api/budget-items/:itemId/settle` |

Статус канбана: `todo` \| `in_progress` \| `done` (принимается и `in-progress`).  
Категории мечт: `travel` \| `shopping` \| `home` \| `personal` (`growth` мапится в `personal`).  
Приоритет: `low` \| `medium` \| `high` (`med` → `medium`).

Ответы задач/событий/мечт совместимы с фронтендом MVP (`assigned`, `dueDate`, `status: "in-progress"`).

### Time Capsules

`content` — JSON `{ text, images[], memories[], tags[] }`. Для MVP фото можно слать как data-URL (base64), до 5 штук. Если `openDate` пустая — капсула сразу открыта. Если дата в будущем, текст и фото скрыты до `POST /open` (доступно в день открытия и позже). Удалять и редактировать может только автор.

### Budget

Категории: `groceries` \| `entertainment` \| `transport` \| `home` \| `other`.  
`paidBy`: `he` \| `she` \| `both`.  
Сплит: `equal` (50/50) или `custom` + `hePercent` (остальное — партнёру).  
`/balance` считает, кто кому должен, по незакрытым расходам (`POST .../settle` убирает позицию из долга).

## Socket.io

Клиент:

```js
import { io } from 'socket.io-client'

const socket = io('http://localhost:5000', {
  auth: { token: accessToken },
})

socket.emit('task:create', { title: 'Купить цветы', assigned: 'both' })
socket.emit('task:update', { taskId, status: 'done' })
socket.emit('task:delete', { taskId })
socket.emit('event:create', { title: 'Ужин', date: '2026-09-20', participants: 'both' })
socket.emit('wish:update', { wishId, progress: 50 })

socket.on('task:created', (task) => {})
socket.on('task:updated', (task) => {})
socket.on('task:deleted', ({ taskId }) => {})
socket.on('event:created', (event) => {})
socket.on('wish:updated', (wish) => {})
socket.on('activity:new', (activity) => {})
socket.on('user:online', ({ userId, status }) => {})
socket.on('capsule:created', (capsule) => {})
socket.on('capsule:opened', (capsule) => {})
socket.on('capsule:deleted', ({ capsuleId }) => {})
socket.on('expense:created', (expense) => {})
socket.on('expense:deleted', ({ itemId }) => {})
```

События уходят только в комнату своей пары (`couple:<id>`). Те же объекты приходят и после REST-запросов — партнёр видит изменения без перезагрузки.

## Документация API

- Swagger UI: http://localhost:5050/api/docs
- OpenAPI JSON: http://localhost:5050/api/docs.json
- Postman: `docs/Together.postman_collection.json`

`PUBLIC_API_URL` в `.env` подменяет базовый URL в Swagger (на Render берётся ещё `RENDER_EXTERNAL_URL`).

## Production Deploy (Render)

Рекомендуемый хостинг API: [Render](https://render.com) Free. Корневой `render.yaml` — Blueprint; в этой папке лежит копия `render.yaml` (если в UI указать этот путь).

1. Dashboard → **New → Blueprint** → репозиторий Together, `main`. Либо New → Web Service, **Root Directory: `together-backend`**, Build `npm ci --omit=optional`, Start `npm start`, plan **Free**, region Frankfurt.
2. Postgres `together-db` (Free, Frankfurt). В API добавьте Internal `DATABASE_URL`.
3. Variables — шаблон `.env.render.example`. `PORT` задаёт Render. При старте `sequelize.sync()` создаёт таблицы.
4. Проверка: `https://together-api.onrender.com/health` и `/api/docs`.
5. Демо-логин без wipe — Shell сервиса: `npm run seed:demo`.

Полный чеклист (Vercel, спин-даун, срок Free Postgres) — в корневом `README.md`.

## Production Deploy (Railway)

Запасной вариант. Root Directory: `together-backend`. Файл `railway.json` уже в этой папке.

1. New Project → Deploy from GitHub → репозиторий Together, branch `main`, root `together-backend`.
2. **+ New** → Database → PostgreSQL. Railway подставит `DATABASE_URL`.
3. Variables сервиса API — `.env.production.example`.

`PORT` задаёт Railway. SQL-миграции (`migrations/001_*.sql`, `002_*.sql`) — запасной путь через `psql`.

4. Проверка: `https://<сервис>.up.railway.app/health` и `/api/docs`.

`npm run seed` на production **заблокирован** (стирает данные). Для демо-логина без wipe:

```bash
npm run seed:demo
```

Это создаст `artem@together.app` / `katya@together.app` (пароль `together123`), если их ещё нет.

После деплоя фронта обновите `CORS_ORIGIN` на точный Vercel URL и рестартните сервис.

## Структура

```
together-backend/
├── migrations/001_init_schema.sql
├── migrations/002_premium_features.sql
├── src/
│   ├── config/          database, jwt, cors
│   ├── middleware/      auth, validation, errors
│   ├── routes/          auth, couples, tasks, events, wishes, activities, capsules, budget
│   ├── controllers/
│   ├── models/
│   ├── services/        auth, socket, activity, couple
│   ├── App.js
│   └── server.js
├── render.yaml
├── .env.example
├── .env.render.example
└── package.json
```

Фронтенд на :3000 подключается к этому API (`VITE_API_URL`). После обновления схемы перезапустите сервер; для демо-данных капсул и бюджета выполните `npm run seed`.
