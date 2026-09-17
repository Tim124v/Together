import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import { toISODate } from '../utils/dates.js'

export const DEFAULT_BUDGET_CATEGORIES = [
  { slug: 'groceries', name: 'Продукты', icon: '🛒', color: '#10b981' },
  { slug: 'entertainment', name: 'Развлечения', icon: '🍔', color: '#f59e0b' },
  { slug: 'transport', name: 'Транспорт', icon: '✈️', color: '#3b82f6' },
  { slug: 'home', name: 'Дом', icon: '🏠', color: '#8b5cf6' },
  { slug: 'other', name: 'Другое', icon: '💰', color: '#64748b' },
]

export const BudgetItem = sequelize.define(
  'BudgetItem',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    coupleId: { type: DataTypes.UUID, allowNull: false, field: 'couple_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    category: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'other' },
    description: { type: DataTypes.STRING(255) },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    paidBy: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'both', field: 'paid_by' },
    splitType: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'equal', field: 'split_type' },
    hePercent: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 50, field: 'he_percent' },
    shePercent: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 50, field: 'she_percent' },
    createdDate: { type: DataTypes.DATEONLY, field: 'created_date' },
    isSettled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_settled' },
    settledAt: { type: DataTypes.DATE, field: 'settled_at' },
  },
  { tableName: 'budget_items', underscored: true, updatedAt: false },
)

export const BudgetCategory = sequelize.define(
  'BudgetCategory',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    coupleId: { type: DataTypes.UUID, allowNull: false, field: 'couple_id' },
    slug: { type: DataTypes.STRING(50), allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    icon: { type: DataTypes.STRING(50) },
    color: { type: DataTypes.STRING(10) },
  },
  { tableName: 'budget_categories', underscored: true, timestamps: false },
)

export function toMoney(value) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
}

export function splitPercents(body = {}) {
  const type = body.splitType === 'custom' ? 'custom' : 'equal'
  if (type === 'equal') return { splitType: 'equal', hePercent: 50, shePercent: 50 }
  const he = Number(body.hePercent ?? body.splitHe ?? 50)
  const clamped = Math.min(100, Math.max(0, Number.isFinite(he) ? he : 50))
  return { splitType: 'custom', hePercent: clamped, shePercent: 100 - clamped }
}

export function itemShares(item) {
  const amount = toMoney(item.amount)
  const hePercent = Number(item.hePercent ?? 50)
  const shePercent = Number(item.shePercent ?? 100 - hePercent)
  return {
    amount,
    heShare: toMoney((amount * hePercent) / 100),
    sheShare: toMoney((amount * shePercent) / 100),
  }
}

export function itemPaid(item) {
  const { amount, heShare, sheShare } = itemShares(item)
  if (item.paidBy === 'he') return { hePaid: amount, shePaid: 0, heShare, sheShare }
  if (item.paidBy === 'she') return { hePaid: 0, shePaid: amount, heShare, sheShare }
  return { hePaid: heShare, shePaid: sheShare, heShare, sheShare }
}

export function toPublicExpense(item) {
  const row = item.toJSON ? item.toJSON() : item
  const amount = toMoney(row.amount)
  return {
    id: row.id,
    coupleId: row.coupleId,
    userId: row.userId,
    category: row.category || 'other',
    description: row.description || '',
    amount,
    paidBy: row.paidBy,
    splitType: row.splitType,
    hePercent: Number(row.hePercent ?? 50),
    shePercent: Number(row.shePercent ?? 50),
    createdDate: toISODate(row.createdDate),
    isSettled: Boolean(row.isSettled),
    settledAt: row.settledAt || null,
    createdAt: row.createdAt,
  }
}

export function toPublicCategory(row) {
  const cat = row.toJSON ? row.toJSON() : row
  return {
    id: cat.id,
    coupleId: cat.coupleId,
    slug: cat.slug,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
  }
}
