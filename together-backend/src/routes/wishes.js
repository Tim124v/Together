import { Router } from 'express'
import { changeProgress, create, list, remove, update } from '../controllers/wishesController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validation.js'
import { createWishSchema, updateWishSchema, wishProgressSchema } from '../validation/schemas.js'

const nested = Router({ mergeParams: true })
nested.get('/', list)
nested.post('/', validate(createWishSchema), create)

const standalone = Router()
standalone.use(requireAuth)
standalone.put('/:wishId', validate(updateWishSchema), update)
standalone.patch('/:wishId/progress', validate(wishProgressSchema), changeProgress)
standalone.delete('/:wishId', remove)

export { standalone as wishItemRoutes }
export default nested
