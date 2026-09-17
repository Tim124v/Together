import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import { assignedRole, colorByRole, publicStatus } from '../utils/roles.js'
import { toISODate } from '../utils/dates.js'

export const Task = sequelize.define(
  'Task',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    coupleId: { type: DataTypes.UUID, allowNull: false, field: 'couple_id' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    assignedTo: { type: DataTypes.UUID, field: 'assigned_to' },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'todo' },
    color: { type: DataTypes.STRING(10) },
    dueDate: { type: DataTypes.DATEONLY, field: 'due_date' },
  },
  { tableName: 'tasks', underscored: true },
)

export function toPublicTask(task, couple) {
  const row = task.toJSON ? task.toJSON() : task
  const assigned = assignedRole(couple, row.assignedTo)
  return {
    id: row.id,
    coupleId: row.coupleId,
    title: row.title,
    description: row.description || '',
    note: row.description || '',
    assignedTo: row.assignedTo,
    assigned,
    status: publicStatus(row.status),
    color: row.color || colorByRole[assigned],
    dueDate: toISODate(row.dueDate),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
