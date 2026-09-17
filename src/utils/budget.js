import i18n from '../i18n/config'
import { CURRENCY_STORAGE_KEY, intlLocale } from '../i18n/languages'

export const BUDGET_CATEGORIES = [
  { slug: 'groceries', icon: '🛒', color: '#10b981' },
  { slug: 'entertainment', icon: '🍔', color: '#f59e0b' },
  { slug: 'transport', icon: '✈️', color: '#3b82f6' },
  { slug: 'home', icon: '🏠', color: '#8b5cf6' },
  { slug: 'other', icon: '💰', color: '#64748b' },
]

export const categoryMeta = (slug, extras = []) => {
  const found = extras.find((c) => c.slug === slug) || BUDGET_CATEGORIES.find((c) => c.slug === slug) || BUDGET_CATEGORIES[4]
  return {
    ...found,
    name: found.name || i18n.t(`budget.${found.slug || 'other'}`),
  }
}

export function getActiveCurrency() {
  try {
    return localStorage.getItem(CURRENCY_STORAGE_KEY) || 'USD'
  } catch {
    return 'USD'
  }
}

export const formatMoney = (value, currency) => {
  const n = Number(value) || 0
  const code = currency || getActiveCurrency()
  try {
    return new Intl.NumberFormat(intlLocale(i18n.language), {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(n)
  } catch {
    return `${n.toLocaleString(intlLocale(i18n.language))} ${i18n.t(`currency.${code}`, { defaultValue: code })}`
  }
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
  const heName = users?.he?.name || i18n.t('budget.he')
  const sheName = users?.she?.name || i18n.t('budget.she')
  if (Math.abs(heNet) < 0.01) {
    return { amount: 0, debtor: null, creditor: null, message: i18n.t('budget.settled'), settled: true }
  }
  if (heNet > 0) {
    return {
      amount: heNet,
      debtor: 'she',
      creditor: 'he',
      message: i18n.t('budget.owes', { debtor: sheName, creditor: heName, amount: formatMoney(heNet) }),
      settled: false,
    }
  }
  const amount = money(Math.abs(heNet))
  return {
    amount,
    debtor: 'he',
    creditor: 'she',
    message: i18n.t('budget.owes', { debtor: heName, creditor: sheName, amount: formatMoney(amount) }),
    settled: false,
  }
}

export function payerLabel(paidBy, users) {
  if (paidBy === 'both') return i18n.t('budget.together')
  return users?.[paidBy]?.name || paidBy
}

export function splitLabel(item) {
  if (item.splitType === 'custom') return `${item.hePercent ?? 50} / ${item.shePercent ?? 50}`
  return i18n.t('budget.equally')
}
