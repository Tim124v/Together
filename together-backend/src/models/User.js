import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

export const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
    name: { type: DataTypes.STRING(255), allowNull: false },
    avatarColor: { type: DataTypes.STRING(10), field: 'avatar_color' },
  },
  { tableName: 'users', underscored: true, updatedAt: false },
)

export function toPublicUser(user) {
  if (!user) return null
  const row = user.toJSON ? user.toJSON() : user
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarColor: row.avatarColor,
    createdAt: row.createdAt,
  }
}
