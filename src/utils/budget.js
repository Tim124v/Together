export const BUDGET_CATEGORIES = [
  { slug: 'groceries', name: 'Продукты', icon: '🛒', color: '#10b981' },
  { slug: 'entertainment', name: 'Развлечения', icon: '🍔', color: '#f59e0b' },
  { slug: 'transport', name: 'Транспорт', icon: '✈️', color: '#3b82f6' },
  { slug: 'home', name: 'Дом', icon: '🏠', color: '#8b5cf6' },
  { slug: 'other', name: 'Другое', icon: '💰', color: '#64748b' },
]

export const categoryMeta = (slug, extras = []) =>
  extras.find((c) => c.slug === slug) || BUDGET_CATEGORIES.find((c) => c.slug === slug) || BUDGET_CATEGORIES[4]

export const formatMoney = (value) => {
  const n = Number(value) || 0
  return `${n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₽`
}

const money = (value) => Math.round((Number(value) || 0) * 100) / 100

export function computeBudgetSummary(expenses, month, categories = []) {
  const items = (expenses || []).filter((row) => !month || (row.createdDate || '').startsWith(month))
  const byCategoryMap = new Map()
  const byPayer = { he: 0, she: 0, both: 0 }
  let total = 0
  for (const item of items) {
    total += Number(item.amount) || 0
    byCategoryMap.set(item.category, money((byCategoryMap.get(item.category) || 0) + Number(item.amount)))
    if (byPayer[item.paidBy] !== undefined) byPayer[item.paidBy] = money(byPayer[item.paidBy] + Number(item.amount))
  }
  return {
    month,
    total: money(total),
    count: items.length,
    byCategory: [...byCategoryMap.entries()].map(([slug, amount]) => {
      const meta = categoryMeta(slug, categories)
      return { category: slug, amount, name: meta.name, icon: meta.icon, color: meta.color }
    }),
    byPayer: {
      he: money(byPayer.he),
      she: money(byPayer.she),
      both: money(byPayer.both),
    },
  }
}

export function computeBalance(expenses, users) {
  let heNet = 0
  for (const item of expenses || []) {
    if (item.isSettled) continue
    const amount = Number(item.amount) || 0
    const hePercent = item.splitType === 'custom' ? Number(item.hePercent ?? 50) : 50
    const heShare = money((amount * hePercent) / 100)
    const hePaid = item.paidBy === 'he' ? amount : item.paidBy === 'she' ? 0 : heShare
    heNet += hePaid - heShare
  }
  heNet = money(heNet)
  const heName = users?.he?.name || 'Он'
  const sheName = users?.she?.name || 'Она'
  if (Math.abs(heNet) < 0.01) {
    return { amount: 0, debtor: null, creditor: null, message: 'Вы в расчёте', settled: true }
  }
  if (heNet > 0) {
    return {
      amount: heNet,
      debtor: 'she',
      creditor: 'he',
      message: `${sheName} должна ${heName}: ${formatMoney(heNet)}`,
      settled: false,
    }
  }
  const amount = money(Math.abs(heNet))
  return {
    amount,
    debtor: 'he',
    creditor: 'she',
    message: `${heName} должен ${sheName}: ${formatMoney(amount)}`,
    settled: false,
  }
}

export function payerLabel(paidBy, users) {
  if (paidBy === 'both') return 'Вместе'
  return users?.[paidBy]?.name || paidBy
}

export function splitLabel(item) {
  if (item.splitType === 'custom') return `${item.hePercent ?? 50} / ${item.shePercent ?? 50}`
  return 'Поровну'
}
