import { User } from '../models/index.js'
import { toPublicUser } from '../models/User.js'
import { findCoupleForUser } from '../services/coupleService.js'
import { emitToCouple } from '../services/socketService.js'
import {
  CURRENCIES,
  LANGUAGES,
  STATIC_RATES,
  detectRequestLocale,
} from '../config/locale.js'
import { badRequest } from '../utils/httpError.js'
import { asyncHandler } from '../middleware/errorHandler.js'

function toLocalePayload(user, extra = {}) {
  return {
    language: user?.language || extra.language || 'en',
    currency: user?.currency || extra.currency || 'USD',
    country: user?.country || extra.country || null,
  }
}

export const getUserLocale = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id)
  res.json(toLocalePayload(user))
})

export const updateUserLocale = asyncHandler(async (req, res) => {
  const { language, currency } = req.body || {}
  if (language && !LANGUAGES.includes(language)) {
    throw badRequest('Неподдерживаемый язык')
  }
  if (currency && !CURRENCIES.includes(currency)) {
    throw badRequest('Неподдерживаемая валюта')
  }

  const user = await User.findByPk(req.user.id)
  if (language) user.language = language
  if (currency) user.currency = currency
  await user.save()

  const couple = await findCoupleForUser(user.id)
  if (couple && currency) {
    const partnerId = couple.user1Id === user.id ? couple.user2Id : couple.user1Id
    if (partnerId) {
      const partner = await User.findByPk(partnerId)
      if (partner) {
        partner.currency = currency
        await partner.save()
      }
    }
  }

  const payload = toLocalePayload(user)
  if (couple) emitToCouple(couple.id, 'user:locale-changed', { ...payload, userId: user.id })
  res.json({ ...payload, user: toPublicUser(user) })
})

export const getGeolocation = asyncHandler(async (req, res) => {
  const locale = detectRequestLocale(req)
  res.json({
    country: locale.country,
    language: locale.language,
    currency: locale.currency,
    currencies: locale.currencies,
  })
})

export const getCurrencyRates = asyncHandler(async (_req, res) => {
  res.json({
    rates: STATIC_RATES,
    base: 'USD',
    note: 'static-mvp',
  })
})
