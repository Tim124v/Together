import i18n from '../i18n/config'
import { intlLocale } from '../i18n/languages'

export const dateLocale = () => intlLocale(i18n.language)

export const monthName = (monthIndex, year = 2020) =>
  new Intl.DateTimeFormat(dateLocale(), { month: 'long' }).format(new Date(year, monthIndex, 1))

export const getMonthsNom = () => Array.from({ length: 12 }, (_, i) => {
  const raw = monthName(i)
  return raw.charAt(0).toUpperCase() + raw.slice(1)
})

export const getWeekdays = () => {
  const fmt = new Intl.DateTimeFormat(dateLocale(), { weekday: 'short' })
  return [1, 2, 3, 4, 5, 6, 0].map((day) => fmt.format(new Date(2024, 0, day)))
}

/** @deprecated use getMonthsNom() — kept for callers that still import the constant */
export const MONTHS = getMonthsNom()
export const MONTHS_NOM = getMonthsNom()
export const WEEKDAYS = getWeekdays()

export const toISO = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const todayISO = () => toISO(new Date())

export const formatDate = (isoDate) => {
  if (!isoDate) return '—'
  const [y, m, d] = String(isoDate).slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return '—'
  const date = new Date(y, m - 1, d)
  const opts = { day: 'numeric', month: 'long' }
  if (y !== new Date().getFullYear()) opts.year = 'numeric'
  return new Intl.DateTimeFormat(dateLocale(), opts).format(date)
}

export const relativeDate = (isoDate) => {
  if (!isoDate) return '—'
  const target = new Date(`${isoDate}T00:00:00`)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = Math.round((target - now) / 86400000)
  if (diff === 0) return i18n.t('relative.today')
  if (diff === 1) return i18n.t('relative.tomorrow')
  if (diff === -1) return i18n.t('relative.yesterday')
  if (diff < 0) return i18n.t('relative.overdue', { count: Math.abs(diff) })
  if (diff < 45) return i18n.t('relative.inDays', { count: diff })
  return i18n.t('relative.inMonths', { count: Math.round(diff / 30) })
}

export const buildMonthGrid = (year, month) => {
  const first = new Date(year, month, 1)
  const lead = (first.getDay() + 6) % 7
  const total = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: lead }, () => null)
  for (let day = 1; day <= total; day += 1) cells.push(toISO(new Date(year, month, day)))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export const OWNER_STYLES = {
  he: {
    text: 'text-him',
    bg: 'bg-him/12',
    ring: 'ring-him/30',
    solid: 'bg-him',
    gradient: 'bg-grad-him',
    dot: 'bg-him',
    border: 'border-him/40',
  },
  she: {
    text: 'text-her',
    bg: 'bg-her/12',
    ring: 'ring-her/30',
    solid: 'bg-her',
    gradient: 'bg-grad-her',
    dot: 'bg-her',
    border: 'border-her/40',
  },
  both: {
    text: 'text-both',
    bg: 'bg-both/12',
    ring: 'ring-both/30',
    solid: 'bg-both',
    gradient: 'bg-grad-both',
    dot: 'bg-both',
    border: 'border-both/40',
  },
}

export const ownerStyle = (owner) => OWNER_STYLES[owner] ?? OWNER_STYLES.both

export const COLOR_BY_OWNER = { he: 'blue', she: 'pink', both: 'green' }

export const PRIORITY = {
  high: { key: 'high', className: 'bg-rose-500/12 text-rose-500' },
  med: { key: 'med', className: 'bg-amber-500/14 text-amber-600 dark:text-amber-400' },
  low: { key: 'low', className: 'bg-slate-500/12 text-slate-500 dark:text-slate-400' },
}

export const cx = (...classes) => classes.filter(Boolean).join(' ')

export const formatRelativePast = (iso) => {
  if (!iso) return i18n.t('relative.recently')
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.max(1, Math.round(diff / 60000))
  if (mins < 60) return i18n.t('relative.minAgo', { count: mins })
  const hours = Math.round(mins / 60)
  if (hours < 24) return i18n.t('relative.hoursAgo', { count: hours })
  const days = Math.round(hours / 24)
  if (days < 30) return i18n.t('relative.daysAgo', { count: days })
  return formatDate(String(iso).slice(0, 10))
}

export async function copyText(value) {
  await navigator.clipboard.writeText(value)
}

export const plural = (n, [one, few, many]) => {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return many
  if (last === 1) return one
  if (last >= 2 && last <= 4) return few
  return many
}

export const formatEventLine = (event, users) => {
  const who = event.participants === 'both'
    ? i18n.t('owner.youBoth')
    : users[event.participants]?.name ?? i18n.t('owner.youBoth')
  return `${formatDate(event.date)} — ${event.title} (${who})`
}
