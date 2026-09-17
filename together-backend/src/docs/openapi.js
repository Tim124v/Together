const server = process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 5050}`

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Together API',
    version: '1.3.0',
    description: 'REST + JWT для задач, календаря, мечт, капсул времени и общего бюджета. Real-time — Socket.io на том же порту.',
  },
  servers: [{ url: server }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': { get: { security: [], summary: 'Healthcheck', responses: { 200: { description: 'OK' } } } },
    '/api/auth/register': {
      post: {
        security: [],
        summary: 'Регистрация',
        requestBody: { content: { 'application/json': { schema: { example: { email: 'artem@together.app', password: 'together123', name: 'Артём', avatarColor: 'blue' } } } } },
        responses: { 201: { description: 'user + accessToken + refreshToken' } },
      },
    },
    '/api/auth/login': {
      post: {
        security: [],
        summary: 'Вход',
        requestBody: { content: { 'application/json': { schema: { example: { email: 'artem@together.app', password: 'together123' } } } } },
        responses: { 200: { description: 'JWT' } },
      },
    },
    '/api/auth/refresh': {
      post: {
        security: [],
        summary: 'Обновить access token',
        requestBody: { content: { 'application/json': { schema: { example: { refreshToken: '<token>' } } } } },
        responses: { 200: { description: 'Новая пара токенов' } },
      },
    },
    '/api/auth/me': { get: { summary: 'Текущий пользователь и пара', responses: { 200: { description: 'user + couple' } } } },
    '/api/couples': {
      post: {
        summary: 'Создать пару (partnerEmail) или вступить по inviteCode',
        requestBody: { content: { 'application/json': { schema: { example: { coupleName: 'Артём & Катя', startDate: '2024-05-20', partnerEmail: 'katya@together.app' } } } } },
        responses: { 201: { description: 'Couple' } },
      },
    },
    '/api/couples/join': {
      post: {
        summary: 'Вступить в пару по коду',
        requestBody: { content: { 'application/json': { schema: { example: { inviteCode: 'A1B2C3D4' } } } } },
        responses: { 200: { description: 'Couple' } },
      },
    },
    '/api/couples/current': { get: { summary: 'Моя пара', responses: { 200: { description: 'Couple' } } } },
    '/api/couples/{id}': {
      get: { summary: 'Информация о паре', parameters: [{ name: 'id', in: 'path', required: true }], responses: { 200: { description: 'Couple' } } },
      put: { summary: 'Обновить пару', parameters: [{ name: 'id', in: 'path', required: true }], responses: { 200: { description: 'Couple' } } },
    },
    '/api/couples/{coupleId}/tasks': {
      get: { summary: 'Все задачи пары', parameters: [{ name: 'coupleId', in: 'path', required: true }], responses: { 200: { description: 'Task[]' } } },
      post: { summary: 'Создать задачу', parameters: [{ name: 'coupleId', in: 'path', required: true }], responses: { 201: { description: 'Task' } } },
    },
    '/api/tasks/{taskId}': {
      put: { summary: 'Обновить задачу', parameters: [{ name: 'taskId', in: 'path', required: true }], responses: { 200: { description: 'Task' } } },
      delete: { summary: 'Удалить задачу', parameters: [{ name: 'taskId', in: 'path', required: true }], responses: { 200: { description: 'taskId' } } },
    },
    '/api/tasks/{taskId}/status': {
      patch: { summary: 'Сменить статус (канбан)', parameters: [{ name: 'taskId', in: 'path', required: true }], responses: { 200: { description: 'Task' } } },
    },
    '/api/couples/{coupleId}/events': {
      get: { summary: 'События. Query: year, month', parameters: [{ name: 'coupleId', in: 'path', required: true }], responses: { 200: { description: 'Event[]' } } },
      post: { summary: 'Создать событие', parameters: [{ name: 'coupleId', in: 'path', required: true }], responses: { 201: { description: 'Event' } } },
    },
    '/api/events/{eventId}': {
      put: { summary: 'Обновить событие', parameters: [{ name: 'eventId', in: 'path', required: true }], responses: { 200: { description: 'Event' } } },
      delete: { summary: 'Удалить событие', parameters: [{ name: 'eventId', in: 'path', required: true }], responses: { 200: { description: 'eventId' } } },
    },
    '/api/couples/{coupleId}/wishes': {
      get: { summary: 'Список мечт', parameters: [{ name: 'coupleId', in: 'path', required: true }], responses: { 200: { description: 'Wish[]' } } },
      post: { summary: 'Создать мечту', parameters: [{ name: 'coupleId', in: 'path', required: true }], responses: { 201: { description: 'Wish' } } },
    },
    '/api/wishes/{wishId}': {
      put: { summary: 'Обновить мечту', parameters: [{ name: 'wishId', in: 'path', required: true }], responses: { 200: { description: 'Wish' } } },
      delete: { summary: 'Удалить мечту', parameters: [{ name: 'wishId', in: 'path', required: true }], responses: { 200: { description: 'wishId' } } },
    },
    '/api/wishes/{wishId}/progress': {
      patch: { summary: 'Изменить прогресс 0–100', parameters: [{ name: 'wishId', in: 'path', required: true }], responses: { 200: { description: 'Wish' } } },
    },
    '/api/couples/{coupleId}/activities': {
      get: { summary: 'Лента активности', parameters: [{ name: 'coupleId', in: 'path', required: true }], responses: { 200: { description: 'Activity[]' } } },
    },
    '/api/couples/{coupleId}/capsules': {
      get: { summary: 'Все капсулы времени', parameters: [{ name: 'coupleId', in: 'path', required: true }], responses: { 200: { description: 'Capsule[]' } } },
      post: {
        summary: 'Создать капсулу',
        parameters: [{ name: 'coupleId', in: 'path', required: true }],
        requestBody: { content: { 'application/json': { schema: { example: { title: 'Наша первая поездка', description: 'Письмо себе', openDate: '2027-01-01', text: 'Помнишь рассвет?', tags: ['лето'], images: [] } } } } },
        responses: { 201: { description: 'Capsule' } },
      },
    },
    '/api/capsules/{capsuleId}': {
      get: { summary: 'Детали капсулы (контент скрыт, если дата ещё не наступила)', parameters: [{ name: 'capsuleId', in: 'path', required: true }], responses: { 200: { description: 'Capsule' } } },
      put: { summary: 'Обновить капсулу (только автор)', parameters: [{ name: 'capsuleId', in: 'path', required: true }], responses: { 200: { description: 'Capsule' } } },
      delete: { summary: 'Удалить капсулу (только автор)', parameters: [{ name: 'capsuleId', in: 'path', required: true }], responses: { 200: { description: 'capsuleId' } } },
    },
    '/api/capsules/{capsuleId}/open': {
      post: { summary: 'Открыть капсулу, если openDate уже наступила', parameters: [{ name: 'capsuleId', in: 'path', required: true }], responses: { 200: { description: 'Capsule' } } },
    },
    '/api/couples/{coupleId}/budget/expenses': {
      get: { summary: 'Расходы. Query: month=YYYY-MM', parameters: [{ name: 'coupleId', in: 'path', required: true }], responses: { 200: { description: 'Expense[]' } } },
      post: {
        summary: 'Добавить расход',
        parameters: [{ name: 'coupleId', in: 'path', required: true }],
        requestBody: { content: { 'application/json': { schema: { example: { description: 'Обед в кафе', amount: 1860, category: 'entertainment', paidBy: 'she', splitType: 'equal', createdDate: '2026-09-12' } } } } },
        responses: { 201: { description: 'Expense' } },
      },
    },
    '/api/couples/{coupleId}/budget/summary': {
      get: { summary: 'Итого за месяц (total, byCategory, byPayer)', parameters: [{ name: 'coupleId', in: 'path', required: true }], responses: { 200: { description: 'Summary' } } },
    },
    '/api/couples/{coupleId}/budget/balance': {
      get: { summary: 'Кто кому должен (по незакрытым сплитам)', parameters: [{ name: 'coupleId', in: 'path', required: true }], responses: { 200: { description: 'Balance' } } },
    },
    '/api/couples/{coupleId}/budget/categories': {
      get: { summary: 'Категории бюджета пары', parameters: [{ name: 'coupleId', in: 'path', required: true }], responses: { 200: { description: 'Category[]' } } },
    },
    '/api/budget-items/{itemId}': {
      put: { summary: 'Обновить расход', parameters: [{ name: 'itemId', in: 'path', required: true }], responses: { 200: { description: 'Expense' } } },
      delete: { summary: 'Удалить расход', parameters: [{ name: 'itemId', in: 'path', required: true }], responses: { 200: { description: 'itemId' } } },
    },
    '/api/budget-items/{itemId}/settle': {
      post: { summary: 'Отметить расход как рассчитанный', parameters: [{ name: 'itemId', in: 'path', required: true }], responses: { 200: { description: 'Expense' } } },
    },
  },
}
