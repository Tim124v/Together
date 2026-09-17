import { verifyAccess } from '../services/authService.js'
import { Couple } from '../models/index.js'
import { unauthorized, forbidden } from '../utils/httpError.js'

export function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) throw unauthorized()
    req.user = verifyAccess(token)
    next()
  } catch (err) {
    next(err.status ? err : unauthorized('Недействительный токен'))
  }
}

export async function requireCouple(req, _res, next) {
  try {
    const coupleId = req.params.coupleId || req.params.id
    const couple = await Couple.findByPk(coupleId)
    if (!couple) throw forbidden('Пара не найдена')
    if (couple.user1Id !== req.user.id && couple.user2Id !== req.user.id) {
      throw forbidden('Вы не состоите в этой паре')
    }
    req.couple = couple
    next()
  } catch (err) {
    next(err)
  }
}
