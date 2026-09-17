import crypto from 'node:crypto'
import { Op } from 'sequelize'
import { Couple, User } from '../models/index.js'
import { conflict, forbidden, notFound } from '../utils/httpError.js'
import { toPublicUser } from '../models/User.js'
import { toISODate } from '../utils/dates.js'

const inviteCode = () => crypto.randomBytes(4).toString('hex').toUpperCase()

export async function findCoupleForUser(userId) {
  return Couple.findOne({
    where: { [Op.or]: [{ user1Id: userId }, { user2Id: userId }] },
    include: [
      { model: User, as: 'user1' },
      { model: User, as: 'user2' },
    ],
  })
}

export function toPublicCouple(couple) {
  const row = couple.toJSON ? couple.toJSON() : couple
  return {
    id: row.id,
    coupleName: row.coupleName,
    startDate: toISODate(row.startDate),
    inviteCode: row.inviteCode,
    createdAt: row.createdAt,
    user1: toPublicUser(couple.user1 || row.user1),
    user2: toPublicUser(couple.user2 || row.user2),
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

  const couple = await Couple.create({
    user1Id: user.id,
    user2Id: partner?.id ?? null,
    coupleName: coupleName || `${user.name} & ${partner?.name || '...'}`,
    startDate: startDate || null,
    inviteCode: inviteCode(),
  })

  return Couple.findByPk(couple.id, {
    include: [
      { model: User, as: 'user1' },
      { model: User, as: 'user2' },
    ],
  })
}

export async function joinCouple(user, code) {
  const existing = await findCoupleForUser(user.id)
  if (existing) throw conflict('Вы уже состоите в паре')

  const couple = await Couple.findOne({ where: { inviteCode: code.toUpperCase() } })
  if (!couple) throw notFound('Код приглашения не найден')
  if (couple.user1Id === user.id) throw conflict('Это ваше собственное приглашение')
  if (couple.user2Id) throw conflict('Пара уже собрана')

  couple.user2Id = user.id
  if (!couple.coupleName || couple.coupleName.endsWith('& ...')) {
    const owner = await User.findByPk(couple.user1Id)
    couple.coupleName = `${owner.name} & ${user.name}`
  }
  await couple.save()

  return Couple.findByPk(couple.id, {
    include: [
      { model: User, as: 'user1' },
      { model: User, as: 'user2' },
    ],
  })
}

export async function updateCouple(couple, userId, payload) {
  if (couple.user1Id !== userId && couple.user2Id !== userId) throw forbidden()
  if (payload.coupleName) couple.coupleName = payload.coupleName
  if (payload.startDate !== undefined) couple.startDate = payload.startDate
  await couple.save()
  return Couple.findByPk(couple.id, {
    include: [
      { model: User, as: 'user1' },
      { model: User, as: 'user2' },
    ],
  })
}
