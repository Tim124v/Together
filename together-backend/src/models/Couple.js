import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

export const Couple = sequelize.define(
  'Couple',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user1Id: { type: DataTypes.UUID, allowNull: false, field: 'user1_id' },
    user2Id: { type: DataTypes.UUID, field: 'user2_id' },
    coupleName: { type: DataTypes.STRING(255), field: 'couple_name' },
    startDate: { type: DataTypes.DATEONLY, field: 'start_date' },
    inviteCode: { type: DataTypes.STRING(16), unique: true, field: 'invite_code' },
    inviteCodeAt: { type: DataTypes.DATE, field: 'invite_code_at' },
    previousInviteCode: { type: DataTypes.STRING(16), field: 'previous_invite_code' },
    partnerJoinedAt: { type: DataTypes.DATE, field: 'partner_joined_at' },
  },
  { tableName: 'couples', underscored: true, updatedAt: false },
)
