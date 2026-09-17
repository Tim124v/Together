import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import { toISODate } from '../utils/dates.js'

export const TimeCapsule = sequelize.define(
  'TimeCapsule',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    coupleId: { type: DataTypes.UUID, allowNull: false, field: 'couple_id' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    createdBy: { type: DataTypes.UUID, allowNull: false, field: 'created_by' },
    createdDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'created_date' },
    openDate: { type: DataTypes.DATEONLY, field: 'open_date' },
    content: { type: DataTypes.TEXT },
    isOpened: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_opened' },
    openedAt: { type: DataTypes.DATE, field: 'opened_at' },
  },
  { tableName: 'time_capsules', underscored: true, updatedAt: false },
)

export function parseCapsuleContent(raw) {
  if (!raw) return { text: '', images: [], memories: [], tags: [] }
  if (typeof raw === 'object') {
    return {
      text: raw.text || '',
      images: Array.isArray(raw.images) ? raw.images : [],
      memories: Array.isArray(raw.memories) ? raw.memories : [],
      tags: Array.isArray(raw.tags) ? raw.tags : [],
    }
  }
  try {
    const parsed = JSON.parse(raw)
    return parseCapsuleContent(parsed)
  } catch {
    return { text: String(raw), images: [], memories: [], tags: [] }
  }
}

export function stringifyCapsuleContent(content = {}, extras = {}) {
  const parsed = parseCapsuleContent(typeof content === 'string' ? content : content)
  return JSON.stringify({
    text: extras.text ?? parsed.text ?? '',
    images: extras.images ?? parsed.images ?? [],
    memories: extras.memories ?? parsed.memories ?? [],
    tags: extras.tags ?? parsed.tags ?? [],
  })
}

export function capsuleStatus(row, today) {
  const openDate = toISODate(row.openDate)
  const opened = Boolean(row.isOpened) || !openDate
  if (opened) return 'opened'
  if (openDate && openDate > today) return 'locked'
  return 'ready'
}

export function toPublicCapsule(capsule, { viewerId, includeContent = true } = {}) {
  const row = capsule.toJSON ? capsule.toJSON() : capsule
  const today = toISODate(new Date())
  const status = capsuleStatus(row, today)
  const locked = status !== 'opened'
  const full = parseCapsuleContent(row.content)
  const text = full.text || row.description || ''
  const preview = locked
    ? status === 'ready'
      ? 'Можно открыть — содержимое ещё скрыто'
      : 'Капсула ещё закрыта'
    : text.replace(/\s+/g, ' ').trim().slice(0, 140)

  return {
    id: row.id,
    coupleId: row.coupleId,
    title: row.title,
    description: row.description || '',
    createdBy: row.createdBy,
    createdByName: capsule.author?.name || null,
    createdDate: toISODate(row.createdDate),
    openDate: toISODate(row.openDate),
    content: locked ? null : includeContent ? full : { ...full, images: [] },
    preview,
    isOpened: status === 'opened',
    openedAt: row.openedAt || null,
    locked,
    canOpen: status === 'ready',
    status,
    isAuthor: Boolean(viewerId && viewerId === row.createdBy),
    createdAt: row.createdAt,
  }
}
