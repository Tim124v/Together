import { Router } from 'express'
import {
  balance,
  categories,
  createExpense,
  listExpenses,
  removeExpense,
  settleExpense,
  summary,
  updateExpense,
} from '../controllers/budgetController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validation.js'
import { createExpenseSchema, updateExpenseSchema } from '../validation/schemas.js'

const nested = Router({ mergeParams: true })
nested.get('/expenses', listExpenses)
nested.post('/expenses', validate(createExpenseSchema), createExpense)
nested.get('/summary', summary)
nested.get('/balance', balance)
nested.get('/categories', categories)

const standalone = Router()
standalone.use(requireAuth)
standalone.put('/:itemId', validate(updateExpenseSchema), updateExpense)
standalone.post('/:itemId/settle', settleExpense)
standalone.delete('/:itemId', removeExpense)

export { standalone as budgetItemRoutes }
export default nested
