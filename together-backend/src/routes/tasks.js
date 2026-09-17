import { Router } from 'express'
import { changeStatus, create, list, remove, update } from '../controllers/tasksController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validation.js'
import { createTaskSchema, taskStatusSchema, updateTaskSchema } from '../validation/schemas.js'

const nested = Router({ mergeParams: true })
nested.get('/', list)
nested.post('/', validate(createTaskSchema), create)

const standalone = Router()
standalone.use(requireAuth)
standalone.put('/:taskId', validate(updateTaskSchema), update)
standalone.patch('/:taskId/status', validate(taskStatusSchema), changeStatus)
standalone.delete('/:taskId', remove)

export { standalone as taskItemRoutes }
export default nested
