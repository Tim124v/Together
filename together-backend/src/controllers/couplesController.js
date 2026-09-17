import { Couple, User } from '../models/index.js'
import {
  createCouple,
  ensureInviteCode,
  findCoupleForUser,
  joinCouple,
  leaveCouple,
  loadCoupleById,
  partnerInfoFor,
  regenerateInviteCode,
  toPublicCouple,
  updateCouple,
} from '../services/coupleService.js'
import { notFound } from '../utils/httpError.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { emitToCouple } from '../services/socketService.js'

const withUsers = (couple) =>
  Couple.findByPk(couple.id, {
    include: [
      { model: User, as: 'user1' },
      { model: User, as: 'user2' },
    ],
  })

async function joined(req, res, couple) {
  const publicCouple = toPublicCouple(couple)
  emitToCouple(couple.id, 'couple:partner-connected', {
    partner: publicCouple.user2,
    couple: publicCouple,
  })
  emitToCouple(couple.id, 'couple:updated', publicCouple)
  return res.status(req.method === 'POST' && req.path === '/' ? 201 : 200).json(publicCouple)
}

export const create = asyncHandler(async (req, res) => {
  if (req.body.inviteCode) {
    try {
      const couple = await joinCouple(req.user, req.body.inviteCode)
      return joined(req, res, couple)
    } catch (err) {
      if (err.codeInvalid && err.coupleId) emitToCouple(err.coupleId, 'couple:code-invalid', {})
      throw err
    }
  }
  const couple = await createCouple(req.user, req.body)
  res.status(201).json(toPublicCouple(couple))
})

export const join = asyncHandler(async (req, res) => {
  try {
    const couple = await joinCouple(req.user, req.body.inviteCode)
    return joined(req, res, couple)
  } catch (err) {
    if (err.codeInvalid && err.coupleId) emitToCouple(err.coupleId, 'couple:code-invalid', {})
    throw err
  }
})

export const getOne = asyncHandler(async (req, res) => {
  const couple = await loadCoupleById(req.params.id)
  if (!couple) throw notFound('Пара не найдена')
  res.json(toPublicCouple(couple))
})

export const current = asyncHandler(async (req, res) => {
  const couple = await findCoupleForUser(req.user.id)
  if (!couple) throw notFound('Вы ещё не в паре')
  res.json(toPublicCouple(couple))
})

export const update = asyncHandler(async (req, res) => {
  const couple = await updateCouple(req.couple, req.user.id, req.body)
  const publicCouple = toPublicCouple(couple)
  emitToCouple(couple.id, 'couple:updated', publicCouple)
  res.json(publicCouple)
})

export const inviteCode = asyncHandler(async (req, res) => {
  const couple = await ensureInviteCode(req.couple)
  res.json({
    inviteCode: couple.inviteCode,
    code: couple.inviteCode,
    inviteCodeAt: couple.inviteCodeAt || couple.createdAt,
  })
})

export const regenerateCode = asyncHandler(async (req, res) => {
  const couple = await regenerateInviteCode(req.couple, req.user.id)
  const publicCouple = toPublicCouple(couple)
  emitToCouple(couple.id, 'couple:code-regenerated', {
    inviteCode: couple.inviteCode,
    new_code: couple.inviteCode,
    couple: publicCouple,
  })
  res.json({ inviteCode: couple.inviteCode, code: couple.inviteCode, couple: publicCouple })
})

export const partnerInfo = asyncHandler(async (req, res) => {
  const couple = (await withUsers(req.couple)) || req.couple
  res.json(partnerInfoFor(couple, req.user.id))
})

export const leave = asyncHandler(async (req, res) => {
  const coupleId = req.couple.id
  const result = await leaveCouple(req.couple, req.user.id)
  emitToCouple(coupleId, 'couple:partner-disconnected', { userId: req.user.id })
  if (result.couple) emitToCouple(coupleId, 'couple:updated', toPublicCouple(result.couple))
  res.json({ ok: true, dissolved: result.dissolved, couple: result.couple ? toPublicCouple(result.couple) : null })
})
