import i18n from '../i18n/config'

export function usersFromCouple(couple) {
  return {
    he: {
      id: couple?.user1?.id || 'he',
      name: couple?.user1?.name || i18n.t('owner.fallbackYou'),
      short: i18n.t('owner.he'),
      initials: (couple?.user1?.name || 'A').slice(0, 1),
      role: 'him',
      emoji: '🧑‍💻',
    },
    she: {
      id: couple?.user2?.id || 'she',
      name: couple?.user2?.name || i18n.t('owner.fallbackPartner'),
      short: i18n.t('owner.she'),
      initials: (couple?.user2?.name || 'K').slice(0, 1),
      role: 'her',
      emoji: '💃',
    },
    both: {
      id: 'both',
      name: i18n.t('owner.youBoth'),
      short: i18n.t('owner.both'),
      initials: '∞',
      role: 'both',
      emoji: '💞',
    },
  }
}

export function roleByUserId(couple, userId) {
  if (!userId) return 'both'
  if (couple?.user1?.id === userId) return 'he'
  if (couple?.user2?.id === userId) return 'she'
  return 'both'
}

export function daysTogetherFrom(startDate) {
  if (!startDate) return 0
  const start = new Date(`${startDate}T00:00:00`)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.max(0, Math.round((now - start) / 86400000))
}

export function togetherCaption(days) {
  const years = Math.floor(days / 365)
  const months = Math.round((days % 365) / 30.437)
  return `${i18n.t('time.years', { count: years })} ${i18n.t('time.months', { count: months })}`
}

const ACTION_TEXT = {
  task_created: 'activity.task_created',
  task_completed: 'activity.task_completed',
  task_updated: 'activity.task_updated',
  task_deleted: 'activity.task_deleted',
  event_created: 'activity.event_created',
  event_updated: 'activity.event_updated',
  wish_created: 'activity.wish_created',
  wish_progress: 'activity.wish_progress',
  capsule_created: 'activity.capsule_created',
  capsule_opened: 'activity.capsule_opened',
  capsule_deleted: 'activity.capsule_deleted',
  expense_created: 'activity.expense_created',
  expense_deleted: 'activity.expense_deleted',
}

const ACTION_ICON = {
  task_created: 'task',
  task_completed: 'check',
  task_updated: 'task',
  task_deleted: 'task',
  event_created: 'calendar',
  event_updated: 'calendar',
  wish_created: 'star',
  wish_progress: 'heart',
  capsule_created: 'star',
  capsule_opened: 'check',
  capsule_deleted: 'star',
  expense_created: 'heart',
  expense_deleted: 'heart',
}

export function formatActivityTime(iso) {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  const diff = Math.round((Date.now() - t) / 1000)
  if (diff < 30) return i18n.t('relative.justNow')
  if (diff < 3600) return i18n.t('relative.minAgo', { count: Math.max(1, Math.round(diff / 60)) })
  if (diff < 86400) return i18n.t('relative.hoursAgo', { count: Math.round(diff / 3600) })
  if (diff < 172800) return i18n.t('relative.yesterday')
  return new Date(iso).toLocaleDateString(i18n.language || 'en')
}

export function toFeedActivity(row, couple) {
  return {
    id: row.id,
    user: roleByUserId(couple, row.userId),
    text: ACTION_TEXT[row.action] ? i18n.t(ACTION_TEXT[row.action]) : row.action,
    time: formatActivityTime(row.createdAt),
    icon: ACTION_ICON[row.action] || 'task',
    raw: row,
  }
}

export function anniversariesFromEvents(events = []) {
  return events
    .filter((e) => /день|годовщ|встреч|рожден|свадьб|birthday|anniversary|wedding|meet|anniv|cumple|geburt|compleanno|urodzin/i.test(e.title))
    .map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date || e.eventDate,
      emoji: e.title.includes('🎉') || /birthday|рожден|cumple|geburt|compleanno|urodzin/i.test(e.title) ? (e.title.includes('🎉') ? '🎉' : '🎂') : '💞',
      note: e.place || (e.participants === 'both' ? i18n.t('owner.youBoth') : ''),
    }))
}
