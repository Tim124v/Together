import { login, refresh, register } from '../services/authService.js'
import { findCoupleForUser, toPublicCouple } from '../services/coupleService.js'
import { User } from '../models/index.js'
import { toPublicUser } from '../models/User.js'
import { asyncHandler } from '../middleware/errorHandler.js'

export const registerUser = asyncHandler(async (req, res) => {
  const result = await register(req.body)
  res.status(201).json(result)
})

export const loginUser = asyncHandler(async (req, res) => {
  res.json(await login(req.body))
})

export const refreshToken = asyncHandler(async (req, res) => {
  res.json(await refresh(req.body.refreshToken))
})

export const me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id)
  const couple = await findCoupleForUser(req.user.id)
  res.json({
    user: toPublicUser(user),
    couple: couple ? toPublicCouple(couple) : null,
  })
})
