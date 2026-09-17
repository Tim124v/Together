import { Task } from '../models/index.js'
import { toPublicTask } from '../models/Task.js'
import { logActivity } from '../services/activityService.js'
import { emitToCouple } from '../services/socketService.js'
import { colorByRole, normalizeStatus, userIdByRole } from '../utils/roles.js'
import { notFound } from '../utils/httpError.js'
import { asyncHandler } from '../middleware/errorHandler.js'

async function loadOwnedTask(taskId, userId) {
  const task = await Task.findByPk(taskId)
  if (!task) throw notFound('Задача не найдена')
  const { Couple } = await import('../models/index.js')
  const couple = await Couple.findByPk(task.coupleId)
  if (couple.user1Id !== userId && couple.user2Id !== userId) throw notFound('Задача не найдена')
  return { task, couple }
}

export async function createTaskRecord(couple, userId, body) {
  const assigned = body.assigned || (body.assignedTo ? undefined : 'both')
  const assignedTo = body.assignedTo ?? userIdByRole(couple, assigned)
  const role = assigned || (assignedTo ? undefined : 'both')
  const task = await Task.create({
    coupleId: couple.id,
    title: body.title,
    description: body.description ?? body.note ?? null,
    assignedTo,
    status: normalizeStatus(body.status),
    color: body.color || colorByRole[role || 'both'],
    dueDate: body.dueDate || null,
  })
  const payload = toPublicTask(task, couple)
  await logActivity({
    coupleId: couple.id,
    userId,
    action: 'task_created',
    targetId: task.id,
    targetType: 'task',
  })
  emitToCouple(couple.id, 'task:created', payload)
  return payload
}

export async function updateTaskRecord(taskId, userId, body) {
  const { task, couple } = await loadOwnedTask(taskId, userId)
  if (body.title !== undefined) task.title = body.title
  if (body.description !== undefined || body.note !== undefined) {
    task.description = body.description ?? body.note
  }
  if (body.status !== undefined) task.status = normalizeStatus(body.status)
  if (body.dueDate !== undefined) task.dueDate = body.dueDate
  if (body.color !== undefined) task.color = body.color
  if (body.assigned !== undefined || body.assignedTo !== undefined) {
    task.assignedTo = body.assignedTo ?? userIdByRole(couple, body.assigned)
    task.color = body.color || colorByRole[body.assigned || 'both']
  }
  await task.save()
  const payload = toPublicTask(task, couple)
  if (body.status === 'done' || body.status === 'todo') {
    await logActivity({
      coupleId: couple.id,
      userId,
      action: payload.status === 'done' ? 'task_completed' : 'task_updated',
      targetId: task.id,
      targetType: 'task',
    })
  }
  emitToCouple(couple.id, 'task:updated', payload)
  return payload
}

export async function deleteTaskRecord(taskId, userId) {
  const { task, couple } = await loadOwnedTask(taskId, userId)
  await task.destroy()
  await logActivity({
    coupleId: couple.id,
    userId,
    action: 'task_deleted',
    targetId: taskId,
    targetType: 'task',
  })
  emitToCouple(couple.id, 'task:deleted', { taskId })
  return { taskId }
}

export const list = asyncHandler(async (req, res) => {
  const tasks = await Task.findAll({
    where: { coupleId: req.couple.id },
    order: [['createdAt', 'DESC']],
  })
  res.json(tasks.map((t) => toPublicTask(t, req.couple)))
})

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await createTaskRecord(req.couple, req.user.id, req.body))
})

export const update = asyncHandler(async (req, res) => {
  res.json(await updateTaskRecord(req.params.taskId, req.user.id, req.body))
})

export const changeStatus = asyncHandler(async (req, res) => {
  res.json(await updateTaskRecord(req.params.taskId, req.user.id, { status: req.body.status }))
})

export const remove = asyncHandler(async (req, res) => {
  res.json(await deleteTaskRecord(req.params.taskId, req.user.id))
})
