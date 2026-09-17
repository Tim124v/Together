import { Router } from 'express'
import {
  create,
  current,
  getOne,
  inviteCode,
  join,
  leave,
  partnerInfo,
  regenerateCode,
  update,
} from '../controllers/couplesController.js'
import { requireAuth, requireCouple } from '../middleware/auth.js'
import { validate } from '../middleware/validation.js'
import { createCoupleSchema, joinCoupleSchema, updateCoupleSchema } from '../validation/schemas.js'
import taskRoutes from './tasks.js'
import eventRoutes from './events.js'
import wishRoutes from './wishes.js'
import activityRoutes from './activities.js'
import capsuleRoutes from './capsules.js'
import budgetRoutes from './budget.js'

const router = Router()
router.use(requireAuth)

router.get('/current', current)
router.post('/', validate(createCoupleSchema), create)
router.post('/join', validate(joinCoupleSchema), join)
router.get('/:id', requireCouple, getOne)
router.put('/:id', requireCouple, validate(updateCoupleSchema), update)
router.get('/:id/invite-code', requireCouple, inviteCode)
router.post('/:id/regenerate-code', requireCouple, regenerateCode)
router.get('/:id/partner-info', requireCouple, partnerInfo)
router.post('/:id/leave', requireCouple, leave)

router.use('/:coupleId/tasks', requireCouple, taskRoutes)
router.use('/:coupleId/events', requireCouple, eventRoutes)
router.use('/:coupleId/wishes', requireCouple, wishRoutes)
router.use('/:coupleId/activities', requireCouple, activityRoutes)
router.use('/:coupleId/capsules', requireCouple, capsuleRoutes)
router.use('/:coupleId/budget', requireCouple, budgetRoutes)

export default router
