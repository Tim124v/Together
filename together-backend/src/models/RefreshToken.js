import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

export const RefreshToken = sequelize.define(
  'RefreshToken',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    tokenHash: { type: DataTypes.STRING(255), allowNull: false, field: 'token_hash' },
    expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
  },
  { tableName: 'refresh_tokens', underscored: true, updatedAt: false },
)
