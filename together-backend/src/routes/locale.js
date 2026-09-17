import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validation.js'
import { localeSchema } from '../validation/schemas.js'
import {
  getCurrencyRates,
  getGeolocation,
  getUserLocale,
  updateUserLocale,
} from '../controllers/localeController.js'

const users = Router()
users.get('/locale', requireAuth, getUserLocale)
users.put('/locale', requireAuth, validate(localeSchema), updateUserLocale)

export { users as userLocaleRoutes }

export const geolocationRoutes = Router()
geolocationRoutes.get('/', getGeolocation)

export const currencyRoutes = Router()
currencyRoutes.get('/rates', getCurrencyRates)
