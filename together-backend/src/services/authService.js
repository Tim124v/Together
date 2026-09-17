import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { jwtConfig } from '../config/jwt.js'
import { RefreshToken, User } from '../models/index.js'
import { findCoupleForUser, toPublicCouple } from './coupleService.js'
import { conflict, unauthorized } from '../utils/httpError.js'
import { toPublicUser } from '../models/User.js'
import { detectRequestLocale } from '../config/locale.js'

async function withCouple(user, tokens) {
  const couple = await findCoupleForUser(user.id)
  return {
    user: toPublicUser(user),
    couple: couple ? toPublicCouple(couple) : null,
    ...tokens,
  }
}

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

const refreshTtlMs = () => {
  const raw = jwtConfig.refreshExpires
  if (raw.endsWith('d')) return Number(raw.slice(0, -1)) * 86400000
  return 30 * 86400000
}

export function signAccess(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpires,
  })
}

export function verifyAccess(token) {
  return jwt.verify(token, jwtConfig.accessSecret)
}

export async function issueTokens(user) {
  const accessToken = signAccess(user)
  const refreshToken = jwt.sign({ id: user.id }, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpires,
  })

  await RefreshToken.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + refreshTtlMs()),
  })

  return { accessToken, refreshToken, expiresIn: jwtConfig.accessExpires }
}

export async function register({ email, password, name, avatarColor, language, currency, country }, req) {
  const exists = await User.findOne({ where: { email } })
  if (exists) throw conflict('Пользователь с таким email уже есть')

  const detected = detectRequestLocale(req || { headers: {} })
  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 10))
  const user = await User.create({
    email,
    passwordHash,
    name,
    avatarColor: avatarColor || 'green',
    language: language || detected.language || 'en',
    currency: currency || detected.currency || 'USD',
    country: country || detected.country || null,
  })

  return withCouple(user, await issueTokens(user))
}

export async function login({ email, password }) {
  const user = await User.findOne({ where: { email } })
  if (!user) throw unauthorized('Неверный email или пароль')

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) throw unauthorized('Неверный email или пароль')

  return withCouple(user, await issueTokens(user))
}

export async function refresh(refreshToken) {
  let payload
  try {
    payload = jwt.verify(refreshToken, jwtConfig.refreshSecret)
  } catch {
    throw unauthorized('Refresh token недействителен')
  }

  const row = await RefreshToken.findOne({
    where: { userId: payload.id, tokenHash: hashToken(refreshToken) },
  })
  if (!row || row.expiresAt < new Date()) {
    if (row) await row.destroy()
    throw unauthorized('Refresh token отозван или истёк')
  }

  await row.destroy()
  const user = await User.findByPk(payload.id)
  if (!user) throw unauthorized('Пользователь не найден')
  return issueTokens(user)
}
