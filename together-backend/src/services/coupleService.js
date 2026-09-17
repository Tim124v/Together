import crypto from 'node:crypto'
import { Op } from 'sequelize'
import { Couple, User } from '../models/index.js'
import { conflict, forbidden, notFound } from '../utils/httpError.js'
import { toPublicUser } from '../models/User.js'
import { daysTogether, toISODate } from '../utils/dates.js'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateInviteCode(length = 8) {
  let code = ''
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET[crypto.randomInt(ALPHABET.length)]
  }
  return code
}

export async function uniqueInviteCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateInviteCode()
    const taken = await Couple.findOne({
      where: { [Op.or]: [{ inviteCode: code }, { previousInviteCode: code }] },
    })
    if (!taken) return code
  }
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

const coupleIncludes = [
  { model: User, as: 'user1' },
  { model: User, as: 'user2' },
]

export async function loadCoupleById(id) {
  return Couple.findByPk(id, { include: coupleIncludes })
}

export async function findCoupleForUser(userId) {
  return Couple.findOne({
    where: { [Op.or]: [{ user1Id: userId }, { user2Id: userId }] },
    include: coupleIncludes,
  })
}

export function toPublicCouple(couple) {
  const row = couple.toJSON ? couple.toJSON() : couple
  const startDate = toISODate(row.startDate)
  const user1 = toPublicUser(couple.user1 || row.user1)
  const user2 = toPublicUser(couple.user2 || row.user2)
  return {
    id: row.id,
    coupleName: row.coupleName,
    couple_name: row.coupleName,
    startDate,
    start_date: startDate,
    inviteCode: row.inviteCode,
    code: row.inviteCode,
    user1Id: row.user1Id,
    user2Id: row.user2Id,
    user1_id: row.user1Id,
    user2_id: row.user2Id,
    user1,
    user2,
    user1_info: user1,
    user2_info: user2,
    createdAt: row.createdAt,
    inviteCodeAt: row.inviteCodeAt || row.createdAt,
    partnerJoinedAt: row.partnerJoinedAt || null,
    daysTogether: daysTogether(startDate),
    partnerConnected: Boolean(user2),
  }
}

export function partnerInfoFor(couple, userId) {
  const isUser1 = couple.user1Id === userId
  const partner = isUser1 ? couple.user2 : couple.user1
  if (!partner) {
    return {
      status: 'waiting',
      invitedAt: couple.inviteCodeAt || couple.createdAt,
    }
  }
  const publicPartner = toPublicUser(partner)
  return {
    status: 'connected',
    id: publicPartner.id,
    name: publicPartner.name,
    email: publicPartner.email,
    avatarColor: publicPartner.avatarColor,
    avatar_color: publicPartner.avatarColor,
    connectedAt: couple.partnerJoinedAt || partner.createdAt,
    connected_at: couple.partnerJoinedAt || partner.createdAt,
  }
}

export async function createCouple(user, { coupleName, startDate, partnerEmail }) {
  const existing = await findCoupleForUser(user.id)
  if (existing) throw conflict('Вы уже состоите в паре')

  let partner = null
  if (partnerEmail) {
    partner = await User.findOne({ where: { email: partnerEmail } })
    if (!partner) throw notFound('Партнёр с таким email не найден')
    if (partner.id === user.id) throw conflict('Нельзя пригласить самого себя')
    const partnerCouple = await findCoupleForUser(partner.id)
    if (partnerCouple) throw conflict('Этот пользователь уже в паре')
  }

  const now = new Date()
  const couple = await Couple.create({
    user1Id: user.id,
    user2Id: partner?.id ?? null,
    coupleName: coupleName || `${user.name} & ${partner?.name || '...'}`,
    startDate: startDate || null,
    inviteCode: await uniqueInviteCode(),
    inviteCodeAt: now,
    partnerJoinedAt: partner ? now : null,
  })

  return loadCoupleById(couple.id)
}

export async function joinCouple(user, rawCode) {
  const existing = await findCoupleForUser(user.id)
  if (existing) throw conflict('Вы уже состоите в паре')

  const code = String(rawCode || '').trim().toUpperCase()
  if (!code) throw notFound('Код приглашения не найден')

  const stale = await Couple.findOne({ where: { previousInviteCode: code } })
  if (stale) {
    const error = notFound('Этот код больше не действует. Попросите новый.')
    error.codeInvalid = true
    error.coupleId = stale.id
    throw error
  }

  const couple = await Couple.findOne({ where: { inviteCode: code } })
  if (!couple) throw notFound('Код приглашения не найден')
  if (couple.user1Id === user.id) throw conflict('Это ваше собственное приглашение')
  if (couple.user2Id) throw conflict('Пара уже собрана')

  couple.user2Id = user.id
  couple.partnerJoinedAt = new Date()
  if (!couple.coupleName || couple.coupleName.endsWith('& ...')) {
    const owner = await User.findByPk(couple.user1Id)
    couple.coupleName = `${owner.name} & ${user.name}`
  }
  await couple.save()

  return loadCoupleById(couple.id)
}

export async function updateCouple(couple, userId, payload) {
  if (couple.user1Id !== userId && couple.user2Id !== userId) throw forbidden()
  if (payload.coupleName) couple.coupleName = payload.coupleName.trim()
  if (payload.startDate !== undefined) couple.startDate = payload.startDate || null
  await couple.save()
  return loadCoupleById(couple.id)
}

export async function ensureInviteCode(couple) {
  if (couple.inviteCode) return loadCoupleById(couple.id)
  couple.inviteCode = await uniqueInviteCode()
  couple.inviteCodeAt = new Date()
  await couple.save()
  return loadCoupleById(couple.id)
}

export async function regenerateInviteCode(couple, userId) {
  if (couple.user1Id !== userId && couple.user2Id !== userId) throw forbidden()
  couple.previousInviteCode = couple.inviteCode
  couple.inviteCode = await uniqueInviteCode()
  couple.inviteCodeAt = new Date()
  await couple.save()
  return loadCoupleById(couple.id)
}

export async function leaveCouple(couple, userId) {
  if (couple.user1Id !== userId && couple.user2Id !== userId) throw forbidden()

  if (couple.user2Id === userId) {
    couple.user2Id = null
    couple.partnerJoinedAt = null
    await couple.save()
    return { dissolved: false, couple: await loadCoupleById(couple.id) }
  }

  if (couple.user2Id) {
    couple.user1Id = couple.user2Id
    couple.user2Id = null
    couple.partnerJoinedAt = null
    await couple.save()
    return { dissolved: false, couple: await loadCoupleById(couple.id) }
  }

  await couple.destroy()
  return { dissolved: true, couple: null }
}
