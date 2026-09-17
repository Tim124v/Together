import { Wish } from '../models/index.js'
import { toPublicWish } from '../models/Wish.js'
import { logActivity } from '../services/activityService.js'
import { emitToCouple } from '../services/socketService.js'
import { normalizeCategory, normalizePriority } from '../utils/roles.js'
import { notFound } from '../utils/httpError.js'
import { asyncHandler } from '../middleware/errorHandler.js'

async function loadOwnedWish(wishId, userId) {
  const wish = await Wish.findByPk(wishId)
  if (!wish) throw notFound('Мечта не найдена')
  const { Couple } = await import('../models/index.js')
  const couple = await Couple.findByPk(wish.coupleId)
  if (couple.user1Id !== userId && couple.user2Id !== userId) throw notFound('Мечта не найдена')
  return { wish, couple }
}

export async function updateWishRecord(wishId, userId, body) {
  const { wish, couple } = await loadOwnedWish(wishId, userId)
  if (body.title !== undefined) wish.title = body.title
  if (body.description !== undefined) wish.description = body.description
  if (body.category !== undefined) wish.category = normalizeCategory(body.category)
  if (body.priority !== undefined) wish.priority = normalizePriority(body.priority)
  if (body.assigned !== undefined || body.assignedTo !== undefined) {
    wish.assignedTo = body.assigned || body.assignedTo
  }
  if (body.dueDate !== undefined || body.targetDate !== undefined) {
    wish.targetDate = body.targetDate || body.dueDate
  }
  if (body.progress !== undefined) wish.progress = body.progress
  await wish.save()
  const payload = toPublicWish(wish)
  if (body.progress !== undefined) {
    await logActivity({
      coupleId: couple.id,
      userId,
      action: 'wish_progress',
      targetId: wish.id,
      targetType: 'wish',
    })
  }
  emitToCouple(couple.id, 'wish:updated', payload)
  return payload
}

export const list = asyncHandler(async (req, res) => {
  const wishes = await Wish.findAll({
    where: { coupleId: req.couple.id },
    order: [['createdAt', 'DESC']],
  })
  res.json(wishes.map(toPublicWish))
})

export const create = asyncHandler(async (req, res) => {
  const wish = await Wish.create({
    coupleId: req.couple.id,
    title: req.body.title,
    description: req.body.description || null,
    category: normalizeCategory(req.body.category),
    priority: normalizePriority(req.body.priority),
    assignedTo: req.body.assigned || req.body.assignedTo || 'both',
    targetDate: req.body.targetDate || req.body.dueDate || null,
    progress: req.body.progress ?? 0,
  })
  const payload = toPublicWish(wish)
  await logActivity({
    coupleId: req.couple.id,
    userId: req.user.id,
    action: 'wish_created',
    targetId: wish.id,
    targetType: 'wish',
  })
  emitToCouple(req.couple.id, 'wish:created', payload)
  res.status(201).json(payload)
})

export const update = asyncHandler(async (req, res) => {
  res.json(await updateWishRecord(req.params.wishId, req.user.id, req.body))
})

export const changeProgress = asyncHandler(async (req, res) => {
  res.json(await updateWishRecord(req.params.wishId, req.user.id, { progress: req.body.progress }))
})

export const remove = asyncHandler(async (req, res) => {
  const { wish, couple } = await loadOwnedWish(req.params.wishId, req.user.id)
  await wish.destroy()
  emitToCouple(couple.id, 'wish:deleted', { wishId: req.params.wishId })
  res.json({ wishId: req.params.wishId })
})
