import { Router } from 'express'
import { create, getOne, list, open, remove, update } from '../controllers/capsulesController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validation.js'
import { createCapsuleSchema, updateCapsuleSchema } from '../validation/schemas.js'

const nested = Router({ mergeParams: true })
nested.get('/', list)
nested.post('/', validate(createCapsuleSchema), create)

const standalone = Router()
standalone.use(requireAuth)
standalone.get('/:capsuleId', getOne)
standalone.put('/:capsuleId', validate(updateCapsuleSchema), update)
standalone.post('/:capsuleId/open', open)
standalone.delete('/:capsuleId', remove)

export { standalone as capsuleItemRoutes }
export default nested
