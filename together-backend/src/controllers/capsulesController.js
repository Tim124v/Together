import { TimeCapsule, User } from '../models/index.js'
import {
  parseCapsuleContent,
  stringifyCapsuleContent,
  toPublicCapsule,
} from '../models/TimeCapsule.js'
import { logActivity } from '../services/activityService.js'
import { emitToCouple } from '../services/socketService.js'
import { badRequest, forbidden, notFound } from '../utils/httpError.js'
import { toISODate } from '../utils/dates.js'
import { asyncHandler } from '../middleware/errorHandler.js'

async function loadOwnedCapsule(capsuleId, userId) {
  const capsule = await TimeCapsule.findByPk(capsuleId, {
    include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
  })
  if (!capsule) throw notFound('Капсула не найдена')
  const { Couple } = await import('../models/index.js')
  const couple = await Couple.findByPk(capsule.coupleId)
  if (!couple || (couple.user1Id !== userId && couple.user2Id !== userId)) {
    throw notFound('Капсула не найдена')
  }
  return { capsule, couple }
}

function buildContent(body, existing) {
  const current = existing ? parseCapsuleContent(existing) : {}
  return stringifyCapsuleContent(current, {
    text: body.text ?? body.content?.text ?? current.text,
    images: body.images ?? body.content?.images ?? current.images,
    memories: body.memories ?? body.content?.memories ?? current.memories,
    tags: body.tags ?? body.content?.tags ?? current.tags,
  })
}

export async function createCapsuleRecord(couple, userId, body) {
  const today = toISODate(new Date())
  const openDate = body.openDate || null
  const isOpened = !openDate
  const capsule = await TimeCapsule.create({
    coupleId: couple.id,
    title: body.title,
    description: body.description || body.text || '',
    createdBy: userId,
    createdDate: body.createdDate || today,
    openDate,
    content: buildContent(body),
    isOpened,
    openedAt: isOpened ? new Date() : null,
  })
  const withAuthor = await TimeCapsule.findByPk(capsule.id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
  })
  const payload = toPublicCapsule(withAuthor, { viewerId: userId })
  await logActivity({
    coupleId: couple.id,
    userId,
    action: 'capsule_created',
    targetId: capsule.id,
    targetType: 'capsule',
  })
  emitToCouple(couple.id, 'capsule:created', payload)
  return payload
}

export async function updateCapsuleRecord(capsuleId, userId, body) {
  const { capsule, couple } = await loadOwnedCapsule(capsuleId, userId)
  if (capsule.createdBy !== userId) throw forbidden('Редактировать капсулу может только автор')
  if (body.title !== undefined) capsule.title = body.title
  if (body.description !== undefined) capsule.description = body.description
  if (body.openDate !== undefined) {
    capsule.openDate = body.openDate || null
    if (!capsule.openDate && !capsule.isOpened) {
      capsule.isOpened = true
      capsule.openedAt = new Date()
    }
  }
  if (
    body.content !== undefined ||
    body.text !== undefined ||
    body.images !== undefined ||
    body.tags !== undefined ||
    body.memories !== undefined
  ) {
    capsule.content = buildContent(body, capsule.content)
  }
  await capsule.save()
  const payload = toPublicCapsule(capsule, { viewerId: userId })
  emitToCouple(couple.id, 'capsule:updated', payload)
  return payload
}

export async function openCapsuleRecord(capsuleId, userId) {
  const { capsule, couple } = await loadOwnedCapsule(capsuleId, userId)
  const today = toISODate(new Date())
  const openDate = toISODate(capsule.openDate)
  if (capsule.isOpened || !openDate) {
    return toPublicCapsule(capsule, { viewerId: userId })
  }
  if (openDate > today) {
    throw badRequest(`Капсулу можно открыть только ${openDate}`)
  }
  capsule.isOpened = true
  capsule.openedAt = new Date()
  await capsule.save()
  const payload = toPublicCapsule(capsule, { viewerId: userId })
  await logActivity({
    coupleId: couple.id,
    userId,
    action: 'capsule_opened',
    targetId: capsule.id,
    targetType: 'capsule',
  })
  emitToCouple(couple.id, 'capsule:opened', payload)
  return payload
}

export async function deleteCapsuleRecord(capsuleId, userId) {
  const { capsule, couple } = await loadOwnedCapsule(capsuleId, userId)
  if (capsule.createdBy !== userId) throw forbidden('Удалить капсулу может только автор')
  await capsule.destroy()
  await logActivity({
    coupleId: couple.id,
    userId,
    action: 'capsule_deleted',
    targetId: capsuleId,
    targetType: 'capsule',
  })
  emitToCouple(couple.id, 'capsule:deleted', { capsuleId })
  return { capsuleId }
}

export const list = asyncHandler(async (req, res) => {
  const rows = await TimeCapsule.findAll({
    where: { coupleId: req.couple.id },
    include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']],
  })
  res.json(rows.map((row) => toPublicCapsule(row, { viewerId: req.user.id, includeContent: false })))
})

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await createCapsuleRecord(req.couple, req.user.id, req.body))
})

export const getOne = asyncHandler(async (req, res) => {
  const { capsule } = await loadOwnedCapsule(req.params.capsuleId, req.user.id)
  res.json(toPublicCapsule(capsule, { viewerId: req.user.id }))
})

export const update = asyncHandler(async (req, res) => {
  res.json(await updateCapsuleRecord(req.params.capsuleId, req.user.id, req.body))
})

export const open = asyncHandler(async (req, res) => {
  res.json(await openCapsuleRecord(req.params.capsuleId, req.user.id))
})

export const remove = asyncHandler(async (req, res) => {
  res.json(await deleteCapsuleRecord(req.params.capsuleId, req.user.id))
})
