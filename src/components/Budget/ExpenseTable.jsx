import { FiCheck, FiTrash2 } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import ExpenseItem from './ExpenseItem'
import { categoryMeta, formatMoney, payerLabel, splitLabel } from '../../utils/budget'
import { formatDate } from '../../utils/helpers'
import { cx } from '../../utils/helpers'

export default function ExpenseTable({ expenses, users, categories, onSettle, onDelete }) {
  const { t } = useTranslation()
  if (!expenses.length) {
    return (
      <div className="surface-muted px-4 py-12 text-center text-sm text-slate-500">
        {t('budget.emptyMonth')}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {expenses.map((item) => (
          <ExpenseItem
            key={item.id}
            item={item}
            users={users}
            categories={categories}
            onSettle={onSettle}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="surface hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-400 dark:bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3 font-bold">{t('common.date')}</th>
                <th className="px-4 py-3 font-bold">{t('common.description')}</th>
                <th className="px-4 py-3 font-bold">{t('common.category')}</th>
                <th className="px-4 py-3 font-bold">{t('common.amount')}</th>
                <th className="px-4 py-3 font-bold">{t('budget.whoPaid')}</th>
                <th className="px-4 py-3 font-bold">{t('budget.howSplit')}</th>
                <th className="px-4 py-3 font-bold">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((item) => {
                const meta = categoryMeta(item.category, categories)
                return (
                  <tr
                    key={item.id}
                    className="border-t border-slate-100/80 dark:border-white/5"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(item.createdDate)}</td>
                    <td className="px-4 py-3 font-semibold">
                      {item.description}
                      {item.isSettled && (
                        <span className="ml-2 text-[10px] font-bold uppercase text-emerald-500">закрыто</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="chip bg-slate-100 px-2 py-1 text-[11px] dark:bg-white/[0.06]">
                        {meta.icon} {meta.name}
                      </span>
                    </td>
                    <td className={cx('px-4 py-3 font-extrabold tabular-nums', item.isSettled && 'text-slate-400 line-through')}>
                      {formatMoney(item.amount)}
                    </td>
                    <td className="px-4 py-3">{payerLabel(item.paidBy, users)}</td>
                    <td className="px-4 py-3 text-slate-500">{splitLabel(item)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {!item.isSettled && (
                          <button
                            type="button"
                            onClick={() => onSettle(item.id)}
                            className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/12 text-emerald-600"
                            title="Отметить как рассчитано"
                          >
                            <FiCheck />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-rose-500/10 text-rose-500"
                          title="Удалить"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
