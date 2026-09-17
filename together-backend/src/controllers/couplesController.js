import { Couple, User } from '../models/index.js'
import {
  createCouple,
  findCoupleForUser,
  joinCouple,
  toPublicCouple,
  updateCouple,
} from '../services/coupleService.js'
import { notFound } from '../utils/httpError.js'
import { asyncHandler } from '../middleware/errorHandler.js'

export const create = asyncHandler(async (req, res) => {
  if (req.body.inviteCode) {
    const couple = await joinCouple(req.user, req.body.inviteCode)
    return res.status(201).json(toPublicCouple(couple))
  }
  const couple = await createCouple(req.user, req.body)
  res.status(201).json(toPublicCouple(couple))
})

export const join = asyncHandler(async (req, res) => {
  const couple = await joinCouple(req.user, req.body.inviteCode)
  res.json(toPublicCouple(couple))
})

export const getOne = asyncHandler(async (req, res) => {
  const couple = await Couple.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user1' },
      { model: User, as: 'user2' },
    ],
  })
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
  res.json(toPublicCouple(couple))
})
