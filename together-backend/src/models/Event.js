import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import { colorByRole } from '../utils/roles.js'
import { toISODate } from '../utils/dates.js'

export const Event = sequelize.define(
  'Event',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    coupleId: { type: DataTypes.UUID, allowNull: false, field: 'couple_id' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    eventDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'event_date' },
    eventTime: { type: DataTypes.STRING(20), field: 'event_time' },
    place: { type: DataTypes.STRING(255) },
    participants: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'both' },
    color: { type: DataTypes.STRING(10) },
  },
  { tableName: 'events', underscored: true, updatedAt: false },
)

export function toPublicEvent(event) {
  const row = event.toJSON ? event.toJSON() : event
  return {
    id: row.id,
    coupleId: row.coupleId,
    title: row.title,
    date: toISODate(row.eventDate),
    eventDate: toISODate(row.eventDate),
    time: row.eventTime || null,
    place: row.place || null,
    participants: row.participants,
    color: row.color || colorByRole[row.participants] || 'green',
    createdAt: row.createdAt,
  }
}
