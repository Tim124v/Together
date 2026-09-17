export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.path} не найден` })
}

export function errorHandler(err, _req, res, _next) {
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Ошибка валидации',
      details: err.issues?.map((i) => ({ path: i.path.join('.'), message: i.message })),
    })
  }

  const status = err.status || 500
  if (status >= 500 && process.env.NODE_ENV !== 'production') console.error(err)
  if (status >= 500 && process.env.NODE_ENV === 'production') console.error(err.message)

  return res.status(status).json({
    error: err.message || 'Внутренняя ошибка сервера',
    details: process.env.NODE_ENV === 'production' ? undefined : err.details,
  })
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
