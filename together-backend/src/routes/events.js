import { Router } from 'express'
import { create, list, remove, update } from '../controllers/eventsController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validation.js'
import { createEventSchema, updateEventSchema } from '../validation/schemas.js'

const nested = Router({ mergeParams: true })
nested.get('/', list)
nested.post('/', validate(createEventSchema), create)

const standalone = Router()
standalone.use(requireAuth)
standalone.put('/:eventId', validate(updateEventSchema), update)
standalone.delete('/:eventId', remove)

export { standalone as eventItemRoutes }
export default nested
