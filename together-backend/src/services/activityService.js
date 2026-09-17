import { Activity, User } from '../models/index.js'
import { toPublicActivity } from '../models/Activity.js'
import { emitToCouple } from './socketService.js'

export async function logActivity({ coupleId, userId, action, targetId, targetType }) {
  const activity = await Activity.create({ coupleId, userId, action, targetId, targetType })
  const user = await User.findByPk(userId)
  const payload = toPublicActivity(activity, user)
  emitToCouple(coupleId, 'activity:new', payload)
  return payload
}

export async function listActivities(coupleId, limit = 30) {
  const rows = await Activity.findAll({
    where: { coupleId },
    include: [{ model: User, attributes: ['id', 'name', 'avatarColor'] }],
    order: [['createdAt', 'DESC']],
    limit,
  })
  return rows.map((row) => toPublicActivity(row, row.User))
}
