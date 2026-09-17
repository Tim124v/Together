import { Op } from 'sequelize'
import { BudgetCategory, BudgetItem } from '../models/index.js'
import {
  DEFAULT_BUDGET_CATEGORIES,
  itemPaid,
  splitPercents,
  toMoney,
  toPublicCategory,
  toPublicExpense,
} from '../models/BudgetItem.js'
import { logActivity } from '../services/activityService.js'
import { emitToCouple } from '../services/socketService.js'
import { notFound } from '../utils/httpError.js'
import { toISODate } from '../utils/dates.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

export async function ensureDefaultCategories(coupleId) {
  const count = await BudgetCategory.count({ where: { coupleId } })
  if (count > 0) return
  await BudgetCategory.bulkCreate(
    DEFAULT_BUDGET_CATEGORIES.map((cat) => ({ ...cat, coupleId })),
  )
}

async function loadOwnedExpense(itemId, userId) {
  const item = await BudgetItem.findByPk(itemId)
  if (!item) throw notFound('Расход не найден')
  const { Couple } = await import('../models/index.js')
  const couple = await Couple.findByPk(item.coupleId)
  if (!couple || (couple.user1Id !== userId && couple.user2Id !== userId)) {
    throw notFound('Расход не найден')
  }
  return { item, couple }
}

function monthKey(value) {
  if (value && /^\d{4}-\d{2}$/.test(value)) return value
  return toISODate(new Date()).slice(0, 7)
}

function monthWhere(month) {
  const key = monthKey(month)
  const [year, mon] = key.split('-').map(Number)
  const last = new Date(year, mon, 0).getDate()
  return {
    createdDate: {
      [Op.between]: [`${key}-01`, `${key}-${String(last).padStart(2, '0')}`],
    },
  }
}

function applyExpenseFields(item, body) {
  if (body.description !== undefined) item.description = body.description
  if (body.amount !== undefined) item.amount = toMoney(body.amount)
  if (body.category !== undefined) item.category = body.category
  if (body.paidBy !== undefined) item.paidBy = body.paidBy
  if (body.createdDate !== undefined) item.createdDate = body.createdDate
  if (body.splitType !== undefined || body.hePercent !== undefined || body.splitHe !== undefined) {
    const split = splitPercents({
      splitType: body.splitType ?? item.splitType,
      hePercent: body.hePercent ?? body.splitHe,
    })
    item.splitType = split.splitType
    item.hePercent = split.hePercent
    item.shePercent = split.shePercent
  }
}

export async function createExpenseRecord(couple, userId, body) {
  const split = splitPercents(body)
  const item = await BudgetItem.create({
    coupleId: couple.id,
    userId,
    category: body.category || 'other',
    description: body.description || '',
    amount: toMoney(body.amount),
    paidBy: body.paidBy || 'both',
    splitType: split.splitType,
    hePercent: split.hePercent,
    shePercent: split.shePercent,
    createdDate: body.createdDate || toISODate(new Date()),
    isSettled: false,
  })
  const payload = toPublicExpense(item)
  await logActivity({
    coupleId: couple.id,
    userId,
    action: 'expense_created',
    targetId: item.id,
    targetType: 'expense',
  })
  emitToCouple(couple.id, 'expense:created', payload)
  return payload
}

export async function updateExpenseRecord(itemId, userId, body) {
  const { item, couple } = await loadOwnedExpense(itemId, userId)
  applyExpenseFields(item, body)
  await item.save()
  const payload = toPublicExpense(item)
  emitToCouple(couple.id, 'expense:updated', payload)
  return payload
}

export async function settleExpenseRecord(itemId, userId) {
  const { item, couple } = await loadOwnedExpense(itemId, userId)
  item.isSettled = true
  item.settledAt = new Date()
  await item.save()
  const payload = toPublicExpense(item)
  emitToCouple(couple.id, 'expense:updated', payload)
  return payload
}

export async function deleteExpenseRecord(itemId, userId) {
  const { item, couple } = await loadOwnedExpense(itemId, userId)
  await item.destroy()
  await logActivity({
    coupleId: couple.id,
    userId,
    action: 'expense_deleted',
    targetId: itemId,
    targetType: 'expense',
  })
  emitToCouple(couple.id, 'expense:deleted', { itemId })
  return { itemId }
}

function computeBalance(items, couple) {
  let heNet = 0
  for (const item of items) {
    if (item.isSettled) continue
    const { hePaid, heShare } = itemPaid(item)
    heNet += hePaid - heShare
  }
  heNet = toMoney(heNet)
  const heName = couple?.user1?.name || 'Он'
  const sheName = couple?.user2?.name || 'Она'
  if (Math.abs(heNet) < 0.01) {
    return {
      heBalance: 0,
      amount: 0,
      debtor: null,
      creditor: null,
      message: 'Вы в расчёте',
      settled: true,
    }
  }
  if (heNet > 0) {
    return {
      heBalance: heNet,
      amount: heNet,
      debtor: 'she',
      creditor: 'he',
      message: `${sheName} должна ${heName}: ${heNet} руб`,
      settled: false,
    }
  }
  const amount = toMoney(Math.abs(heNet))
  return {
    heBalance: heNet,
    amount,
    debtor: 'he',
    creditor: 'she',
    message: `${heName} должен ${sheName}: ${amount} руб`,
    settled: false,
  }
}

export const listExpenses = asyncHandler(async (req, res) => {
  await ensureDefaultCategories(req.couple.id)
  const where = { coupleId: req.couple.id }
  if (req.query.month) Object.assign(where, monthWhere(req.query.month))
  const rows = await BudgetItem.findAll({
    where,
    order: [['createdDate', 'DESC'], ['createdAt', 'DESC']],
  })
  res.json(rows.map(toPublicExpense))
})

export const createExpense = asyncHandler(async (req, res) => {
  await ensureDefaultCategories(req.couple.id)
  res.status(201).json(await createExpenseRecord(req.couple, req.user.id, req.body))
})

export const summary = asyncHandler(async (req, res) => {
  const month = monthKey(req.query.month)
  const categories = await ensureAndListCategories(req.couple.id)
  const rows = await BudgetItem.findAll({
    where: { coupleId: req.couple.id, ...monthWhere(month) },
  })
  const items = rows.map(toPublicExpense)
  const byCategoryMap = new Map()
  const byPayer = { he: 0, she: 0, both: 0 }
  let total = 0
  for (const item of items) {
    total += item.amount
    byCategoryMap.set(item.category, toMoney((byCategoryMap.get(item.category) || 0) + item.amount))
    byPayer[item.paidBy] = toMoney((byPayer[item.paidBy] || 0) + item.amount)
  }
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]))
  res.json({
    month,
    monthLabel: MONTHS[Number(month.slice(5, 7)) - 1] || month,
    total: toMoney(total),
    count: items.length,
    byCategory: [...byCategoryMap.entries()].map(([slug, amount]) => ({
      category: slug,
      amount,
      name: catBySlug[slug]?.name || slug,
      icon: catBySlug[slug]?.icon || '💰',
      color: catBySlug[slug]?.color || '#64748b',
    })),
    byPayer,
  })
})

export const balance = asyncHandler(async (req, res) => {
  const month = req.query.month ? monthKey(req.query.month) : null
  const where = { coupleId: req.couple.id }
  if (month) Object.assign(where, monthWhere(month))
  const rows = await BudgetItem.findAll({ where })
  const { Couple, User } = await import('../models/index.js')
  const couple = await Couple.findByPk(req.couple.id, {
    include: [
      { model: User, as: 'user1', attributes: ['id', 'name'] },
      { model: User, as: 'user2', attributes: ['id', 'name'] },
    ],
  })
  res.json(computeBalance(rows.map(toPublicExpense), couple))
})

export const categories = asyncHandler(async (req, res) => {
  res.json(await ensureAndListCategories(req.couple.id))
})

async function ensureAndListCategories(coupleId) {
  await ensureDefaultCategories(coupleId)
  const rows = await BudgetCategory.findAll({ where: { coupleId } })
  return rows.map(toPublicCategory)
}

export const updateExpense = asyncHandler(async (req, res) => {
  res.json(await updateExpenseRecord(req.params.itemId, req.user.id, req.body))
})

export const settleExpense = asyncHandler(async (req, res) => {
  res.json(await settleExpenseRecord(req.params.itemId, req.user.id))
})

export const removeExpense = asyncHandler(async (req, res) => {
  res.json(await deleteExpenseRecord(req.params.itemId, req.user.id))
})
