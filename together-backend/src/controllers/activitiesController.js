import { listActivities } from '../services/activityService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

export const list = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 100)
  res.json(await listActivities(req.couple.id, limit))
})
