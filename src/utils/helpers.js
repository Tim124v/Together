export const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

export const MONTHS_NOM = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export const toISO = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const todayISO = () => toISO(new Date())

/** «10 декабря» / «10 декабря 2027» если год отличается от текущего */
export const formatDate = (isoDate) => {
  if (!isoDate) return '—'
  const [y, m, d] = isoDate.split('-').map(Number)
  const suffix = y === new Date().getFullYear() ? '' : ` ${y}`
  return `${d} ${MONTHS[m - 1]}${suffix}`
}

/** «Сегодня» / «Завтра» / «Просрочено на 2 дня» / «Через 5 дней» */
export const relativeDate = (isoDate) => {
  if (!isoDate) return '—'
  const target = new Date(`${isoDate}T00:00:00`)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = Math.round((target - now) / 86400000)
  if (diff === 0) return 'Сегодня'
  if (diff === 1) return 'Завтра'
  if (diff === -1) return 'Вчера'
  if (diff < 0) return `Просрочено: ${Math.abs(diff)} дн.`
  if (diff < 45) return `Через ${diff} дн.`
  return `Через ${Math.round(diff / 30)} мес.`
}

/** Массив дней месяца с ведущими пустыми ячейками (неделя начинается с понедельника) */
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
    label: 'Вы',
    text: 'text-him',
    bg: 'bg-him/12',
    ring: 'ring-him/30',
    solid: 'bg-him',
    gradient: 'bg-grad-him',
    dot: 'bg-him',
    border: 'border-him/40',
  },
  she: {
    label: 'Она',
    text: 'text-her',
    bg: 'bg-her/12',
    ring: 'ring-her/30',
    solid: 'bg-her',
    gradient: 'bg-grad-her',
    dot: 'bg-her',
    border: 'border-her/40',
  },
  both: {
    label: 'Общее',
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
  high: { label: 'High', className: 'bg-rose-500/12 text-rose-500' },
  med: { label: 'Med', className: 'bg-amber-500/14 text-amber-600 dark:text-amber-400' },
  low: { label: 'Low', className: 'bg-slate-500/12 text-slate-500 dark:text-slate-400' },
}

export const cx = (...classes) => classes.filter(Boolean).join(' ')

/** Русские склонения: plural(5, ['задача', 'задачи', 'задач']) → «задач» */
export const plural = (n, [one, few, many]) => {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return many
  if (last === 1) return one
  if (last >= 2 && last <= 4) return few
  return many
}

export const formatEventLine = (event, users) => {
  const who = event.participants === 'both' ? 'Вы оба' : users[event.participants]?.name ?? 'Вы оба'
  return `${formatDate(event.date)} — ${event.title} (${who})`
}
