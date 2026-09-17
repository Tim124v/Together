import { Router } from 'express'
import { list } from '../controllers/activitiesController.js'

const router = Router({ mergeParams: true })
router.get('/', list)
export default router
