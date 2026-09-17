import { Op } from 'sequelize'
import { Event } from '../models/index.js'
import { toPublicEvent } from '../models/Event.js'
import { logActivity } from '../services/activityService.js'
import { emitToCouple } from '../services/socketService.js'
import { colorByRole } from '../utils/roles.js'
import { notFound } from '../utils/httpError.js'
import { asyncHandler } from '../middleware/errorHandler.js'

async function loadOwnedEvent(eventId, userId) {
  const event = await Event.findByPk(eventId)
  if (!event) throw notFound('Событие не найдено')
  const { Couple } = await import('../models/index.js')
  const couple = await Couple.findByPk(event.coupleId)
  if (couple.user1Id !== userId && couple.user2Id !== userId) throw notFound('Событие не найдено')
  return { event, couple }
}

export async function createEventRecord(couple, userId, body) {
  const participants = body.participants || 'both'
  const event = await Event.create({
    coupleId: couple.id,
    title: body.title,
    eventDate: body.eventDate || body.date,
    eventTime: body.time || null,
    place: body.place || null,
    participants,
    color: body.color || colorByRole[participants],
  })
  const payload = toPublicEvent(event)
  await logActivity({
    coupleId: couple.id,
    userId,
    action: 'event_created',
    targetId: event.id,
    targetType: 'event',
  })
  emitToCouple(couple.id, 'event:created', payload)
  return payload
}

export const list = asyncHandler(async (req, res) => {
  const { month, year } = req.query
  const where = { coupleId: req.couple.id }
  if (month && year) {
    const mm = String(month).padStart(2, '0')
    const start = `${year}-${mm}-01`
    const end = `${year}-${mm}-31`
    where.eventDate = { [Op.between]: [start, end] }
  }
  const events = await Event.findAll({ where, order: [['eventDate', 'ASC']] })
  res.json(events.map(toPublicEvent))
})

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await createEventRecord(req.couple, req.user.id, req.body))
})

export const update = asyncHandler(async (req, res) => {
  const { event, couple } = await loadOwnedEvent(req.params.eventId, req.user.id)
  if (req.body.title !== undefined) event.title = req.body.title
  if (req.body.date || req.body.eventDate) event.eventDate = req.body.eventDate || req.body.date
  if (req.body.time !== undefined) event.eventTime = req.body.time
  if (req.body.place !== undefined) event.place = req.body.place
  if (req.body.participants !== undefined) {
    event.participants = req.body.participants
    event.color = req.body.color || colorByRole[req.body.participants]
  }
  if (req.body.color !== undefined) event.color = req.body.color
  await event.save()
  const payload = toPublicEvent(event)
  emitToCouple(couple.id, 'event:updated', payload)
  res.json(payload)
})

export const remove = asyncHandler(async (req, res) => {
  const { event, couple } = await loadOwnedEvent(req.params.eventId, req.user.id)
  await event.destroy()
  emitToCouple(couple.id, 'event:deleted', { eventId: req.params.eventId })
  res.json({ eventId: req.params.eventId })
})
