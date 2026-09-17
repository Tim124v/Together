import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

export const Activity = sequelize.define(
  'Activity',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    coupleId: { type: DataTypes.UUID, allowNull: false, field: 'couple_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    action: { type: DataTypes.STRING(100), allowNull: false },
    targetId: { type: DataTypes.UUID, field: 'target_id' },
    targetType: { type: DataTypes.STRING(50), field: 'target_type' },
  },
  { tableName: 'activities', underscored: true, updatedAt: false },
)

export function toPublicActivity(activity, user) {
  const row = activity.toJSON ? activity.toJSON() : activity
  return {
    id: row.id,
    coupleId: row.coupleId,
    userId: row.userId,
    userName: user?.name ?? null,
    action: row.action,
    targetId: row.targetId,
    targetType: row.targetType,
    createdAt: row.createdAt,
  }
}
