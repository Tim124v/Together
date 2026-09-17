const extra = (process.env.CORS_ORIGIN || process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

export const corsOrigins = [
  ...extra,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
]

const vercelPreview = /^https:\/\/[\w.-]+\.vercel\.app$/

export function isAllowedOrigin(origin) {
  if (!origin) return true
  if (corsOrigins.includes(origin)) return true
  if (vercelPreview.test(origin)) return true
  return false
}

export const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true)
    return callback(null, false)
  },
  credentials: true,
}
