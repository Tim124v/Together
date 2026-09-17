import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import { publicCategory, publicPriority } from '../utils/roles.js'
import { toISODate } from '../utils/dates.js'

export const Wish = sequelize.define(
  'Wish',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    coupleId: { type: DataTypes.UUID, allowNull: false, field: 'couple_id' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    category: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'personal' },
    priority: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'medium' },
    assignedTo: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'both', field: 'assigned_to' },
    targetDate: { type: DataTypes.DATEONLY, field: 'target_date' },
    progress: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { tableName: 'wishes', underscored: true, updatedAt: false },
)

export function toPublicWish(wish) {
  const row = wish.toJSON ? wish.toJSON() : wish
  return {
    id: row.id,
    coupleId: row.coupleId,
    title: row.title,
    description: row.description || '',
    category: publicCategory(row.category),
    priority: publicPriority(row.priority),
    assigned: row.assignedTo,
    assignedTo: row.assignedTo,
    dueDate: toISODate(row.targetDate),
    targetDate: toISODate(row.targetDate),
    progress: row.progress,
    createdAt: row.createdAt,
  }
}
