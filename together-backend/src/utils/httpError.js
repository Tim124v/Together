export class HttpError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export const notFound = (message = 'Не найдено') => new HttpError(404, message)
export const forbidden = (message = 'Недостаточно прав') => new HttpError(403, message)
export const unauthorized = (message = 'Нужна авторизация') => new HttpError(401, message)
export const conflict = (message = 'Конфликт данных') => new HttpError(409, message)
export const badRequest = (message = 'Некорректный запрос') => new HttpError(400, message)
