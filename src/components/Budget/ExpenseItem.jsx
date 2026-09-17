import { FiCheck, FiTrash2 } from 'react-icons/fi'
import { categoryMeta, formatMoney, payerLabel, splitLabel } from '../../utils/budget'
import { formatDate } from '../../utils/helpers'
import { cx } from '../../utils/helpers'

export default function ExpenseItem({ item, users, categories, onSettle, onDelete }) {
  const meta = categoryMeta(item.category, categories)
  return (
    <div className="surface-muted flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{item.description}</p>
        <p className="mt-1 text-[11px] text-slate-400">
          {formatDate(item.createdDate)} · {meta.icon} {meta.name} · {payerLabel(item.paidBy, users)} · {splitLabel(item)}
        </p>
      </div>
      <p className={cx('text-sm font-extrabold tabular-nums', item.isSettled && 'text-slate-400 line-through')}>
        {formatMoney(item.amount)}
      </p>
      <div className="flex gap-2">
        {!item.isSettled && (
          <button type="button" onClick={() => onSettle(item.id)} className="chip bg-emerald-500/12 text-emerald-600">
            <FiCheck /> Закрыть
          </button>
        )}
        <button type="button" onClick={() => onDelete(item.id)} className="chip bg-rose-500/10 text-rose-500">
          <FiTrash2 />
        </button>
      </div>
    </div>
  )
}
