export const toISODate = (value) => {
  if (!value) return null
  if (typeof value === 'string') return value.slice(0, 10)
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const addDays = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export const dayOfMonth = (day) => {
  const now = new Date()
  return toISODate(new Date(now.getFullYear(), now.getMonth(), day))
}
