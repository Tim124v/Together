import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { loginUser, me, refreshToken, registerUser } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validation.js'
import { loginSchema, refreshSchema, registerSchema } from '../validation/schemas.js'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток входа. Подождите 15 минут.' },
})

const router = Router()
router.post('/register', limiter, validate(registerSchema), registerUser)
router.post('/login', limiter, validate(loginSchema), loginUser)
router.post('/refresh', validate(refreshSchema), refreshToken)
router.get('/me', requireAuth, me)

export default router
