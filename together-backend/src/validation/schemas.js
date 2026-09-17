import { z } from 'zod'

const email = z.string().email().max(255).transform((v) => v.toLowerCase().trim())
const password = z.string().min(6).max(72)
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()
const assigned = z.enum(['he', 'she', 'both']).optional()
const status = z.enum(['todo', 'in_progress', 'in-progress', 'done']).optional()
const participants = z.enum(['he', 'she', 'both']).optional()
const category = z.enum(['travel', 'shopping', 'home', 'personal', 'growth']).optional()
const priority = z.enum(['low', 'medium', 'high', 'med']).optional()
const color = z.enum(['pink', 'blue', 'green']).optional().nullable()

export const registerSchema = z.object({
  email,
  password,
  name: z.string().min(1).max(255),
  avatarColor: z.enum(['pink', 'blue', 'green']).optional(),
  language: z.enum(['ru', 'en', 'es', 'fr', 'de', 'it', 'uk', 'pl']).optional(),
  currency: z.enum(['RUB', 'USD', 'EUR', 'GBP', 'UAH', 'PLN']).optional(),
  country: z.string().min(2).max(8).optional(),
})

export const localeSchema = z.object({
  language: z.enum(['ru', 'en', 'es', 'fr', 'de', 'it', 'uk', 'pl']).optional(),
  currency: z.enum(['RUB', 'USD', 'EUR', 'GBP', 'UAH', 'PLN']).optional(),
}).refine((d) => d.language || d.currency, { message: 'Нужен language или currency' })

export const loginSchema = z.object({ email, password })

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
})

export const createCoupleSchema = z.object({
  coupleName: z.string().min(1).max(100).optional(),
  startDate: date,
  partnerEmail: email.optional(),
  inviteCode: z.string().min(4).max(16).optional(),
})

export const updateCoupleSchema = z.object({
  coupleName: z.string().min(1).max(100).optional(),
  startDate: date,
})

export const joinCoupleSchema = z.object({
  inviteCode: z.string().min(4).max(16),
})

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
  assigned: assigned,
  assignedTo: z.string().uuid().optional().nullable(),
  status,
  color,
  dueDate: date,
})

export const updateTaskSchema = createTaskSchema.partial()

export const taskStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'in-progress', 'done']),
})

const eventFields = {
  title: z.string().min(1).max(255),
  date,
  eventDate: date,
  time: z.string().max(20).optional().nullable(),
  place: z.string().max(255).optional().nullable(),
  participants,
  color,
}

export const createEventSchema = z
  .object(eventFields)
  .refine((d) => d.date || d.eventDate, { message: 'Нужна дата события', path: ['date'] })

export const updateEventSchema = z.object(eventFields).partial()

export const createWishSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional().nullable(),
  category,
  priority,
  assigned: assigned,
  assignedTo: assigned,
  dueDate: date,
  targetDate: date,
  progress: z.number().int().min(0).max(100).optional(),
})

export const updateWishSchema = createWishSchema.partial()

export const wishProgressSchema = z.object({
  progress: z.number().int().min(0).max(100),
})

const imageData = z.string().max(2_000_000)
const capsuleContent = z
  .object({
    text: z.string().max(8000).optional().nullable(),
    images: z.array(imageData).max(5).optional(),
    memories: z.array(z.string().max(500)).max(20).optional(),
    tags: z.array(z.string().max(40)).max(12).optional(),
  })
  .optional()

export const createCapsuleSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(4000).optional().nullable(),
  openDate: date,
  createdDate: date,
  text: z.string().max(8000).optional().nullable(),
  images: z.array(imageData).max(5).optional(),
  memories: z.array(z.string().max(500)).max(20).optional(),
  tags: z.array(z.string().max(40)).max(12).optional(),
  content: capsuleContent,
})

export const updateCapsuleSchema = createCapsuleSchema.partial().extend({
  title: z.string().min(1).max(255).optional(),
})

const expenseCategory = z.enum(['groceries', 'entertainment', 'transport', 'home', 'other'])
const paidBy = z.enum(['he', 'she', 'both'])
const splitType = z.enum(['equal', 'custom'])

export const createExpenseSchema = z.object({
  description: z.string().min(1).max(255),
  amount: z.coerce.number().positive().max(1_000_000),
  category: expenseCategory.optional(),
  paidBy: paidBy.optional(),
  splitType: splitType.optional(),
  hePercent: z.coerce.number().min(0).max(100).optional(),
  splitHe: z.coerce.number().min(0).max(100).optional(),
  createdDate: date,
})

export const updateExpenseSchema = createExpenseSchema.partial()
