import { plural } from './helpers'

export function usersFromCouple(couple) {
  return {
    he: {
      id: couple?.user1?.id || 'he',
      name: couple?.user1?.name || 'Вы',
      short: 'Вы',
      initials: (couple?.user1?.name || 'А').slice(0, 1),
      role: 'him',
      emoji: '🧑‍💻',
    },
    she: {
      id: couple?.user2?.id || 'she',
      name: couple?.user2?.name || 'Партнёр',
      short: 'Она',
      initials: (couple?.user2?.name || 'К').slice(0, 1),
      role: 'her',
      emoji: '💃',
    },
    both: {
      id: 'both',
      name: 'Вы оба',
      short: 'Общее',
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
  return `${years} ${plural(years, ['год', 'года', 'лет'])} ${months} ${plural(months, ['месяц', 'месяца', 'месяцев'])}`
}

const ACTION_TEXT = {
  task_created: 'добавил(а) задачу',
  task_completed: 'завершил(а) задачу',
  task_updated: 'обновил(а) задачу',
  task_deleted: 'удалил(а) задачу',
  event_created: 'добавил(а) событие',
  event_updated: 'обновил(а) событие',
  wish_created: 'создал(а) мечту',
  wish_progress: 'обновил(а) прогресс мечты',
  capsule_created: 'оставил(а) капсулу времени',
  capsule_opened: 'открыл(а) капсулу',
  capsule_deleted: 'удалил(а) капсулу',
  expense_created: 'добавил(а) расход',
  expense_deleted: 'удалил(а) расход',
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
  if (diff < 30) return 'только что'
  if (diff < 3600) return `${Math.max(1, Math.round(diff / 60))} мин. назад`
  if (diff < 86400) return `${Math.round(diff / 3600)} ч. назад`
  if (diff < 172800) return 'вчера'
  return new Date(iso).toLocaleDateString('ru-RU')
}

export function toFeedActivity(row, couple) {
  return {
    id: row.id,
    user: roleByUserId(couple, row.userId),
    text: ACTION_TEXT[row.action] || row.action,
    time: formatActivityTime(row.createdAt),
    icon: ACTION_ICON[row.action] || 'task',
    raw: row,
  }
}

export function anniversariesFromEvents(events = []) {
  return events
    .filter((e) => /день|годовщ|встреч|рожден|свадьб/i.test(e.title))
    .map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date || e.eventDate,
      emoji: e.title.includes('🎉') ? '🎉' : e.title.toLowerCase().includes('рожден') ? '🎂' : '💞',
      note: e.place || (e.participants === 'both' ? 'Вы оба' : ''),
    }))
}
