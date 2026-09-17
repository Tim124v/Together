import Card from '../shared/Card'
import { formatMoney } from '../../utils/budget'
import { MONTHS_NOM } from '../../utils/helpers'

export default function BudgetStats({ month, summary, balance }) {
  const [year, m] = (month || '').split('-')
  const monthLabel = m ? `${MONTHS_NOM[Number(m) - 1]} ${year}` : 'Этот месяц'
  const debtTone = balance?.settled
    ? 'text-emerald-600 dark:text-emerald-300'
    : 'text-rose-500'

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl" />
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{monthLabel}</p>
        <p className="mt-2 text-2xl font-extrabold tabular-nums">{formatMoney(summary.total)}</p>
        <p className="mt-1 text-xs text-slate-500">{summary.count} расходов за месяц</p>
      </Card>
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-rose-400/15 blur-2xl" />
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Баланс</p>
        <p className={`mt-2 text-lg font-extrabold leading-snug ${debtTone}`}>{balance?.message || '—'}</p>
        <p className="mt-1 text-xs text-slate-500">Считаем только незакрытые сплиты</p>
      </Card>
      <Card className="sm:col-span-2 xl:col-span-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Кто платил</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            ['he', 'Он'],
            ['she', 'Она'],
            ['both', 'Вместе'],
          ].map(([key, label]) => (
            <div key={key} className="surface-muted px-2 py-3">
              <p className="text-[11px] text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-extrabold tabular-nums">{formatMoney(summary.byPayer?.[key] || 0)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
