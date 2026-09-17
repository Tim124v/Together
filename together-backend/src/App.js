import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { corsOptions } from './config/cors.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import coupleRoutes from './routes/couples.js'
import { taskItemRoutes } from './routes/tasks.js'
import { eventItemRoutes } from './routes/events.js'
import { wishItemRoutes } from './routes/wishes.js'
import { capsuleItemRoutes } from './routes/capsules.js'
import { budgetItemRoutes } from './routes/budget.js'
import { currencyRoutes, geolocationRoutes, userLocaleRoutes } from './routes/locale.js'
import { openApiSpec } from './docs/openapi.js'

export function createApp() {
  const app = express()
  if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1)
  app.use(helmet({ contentSecurityPolicy: false }))
  app.use(cors(corsOptions))
  app.use(express.json({ limit: '12mb' }))

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'together-backend', version: '1.5.0' })
  })

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: 'Together API' }))
  app.get('/api/docs.json', (_req, res) => res.json(openApiSpec))

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userLocaleRoutes)
  app.use('/api/geolocation', geolocationRoutes)
  app.use('/api/currencies', currencyRoutes)
  app.use('/api/couples', coupleRoutes)
  app.use('/api/tasks', taskItemRoutes)
  app.use('/api/events', eventItemRoutes)
  app.use('/api/wishes', wishItemRoutes)
  app.use('/api/capsules', capsuleItemRoutes)
  app.use('/api/budget-items', budgetItemRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}
