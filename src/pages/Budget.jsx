import { useMemo, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import AddExpenseModal from '../components/Budget/AddExpenseModal'
import BudgetCharts from '../components/Budget/BudgetCharts'
import BudgetStats from '../components/Budget/BudgetStats'
import ExpenseTable from '../components/Budget/ExpenseTable'
import Button from '../components/shared/Button'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { categoryMeta, computeBalance, computeBudgetSummary } from '../utils/budget'
import { todayISO } from '../utils/helpers'

function byPayerCategories(expenses, paidBy, categories) {
  const map = new Map()
  for (const item of expenses) {
    if (item.paidBy !== paidBy) continue
    map.set(item.category, (map.get(item.category) || 0) + Number(item.amount || 0))
  }
  return [...map.entries()].map(([slug, amount]) => {
    const meta = categoryMeta(slug, categories)
    return { category: slug, amount, name: meta.name, icon: meta.icon, color: meta.color }
  })
}

export default function Budget() {
  const { users } = useApp()
  const { expenses, budgetCategories, createExpense, settleExpense, deleteExpense } = useData()
  const [month, setMonth] = useState(todayISO().slice(0, 7))
  const [open, setOpen] = useState(false)

  const monthExpenses = useMemo(
    () => expenses.filter((row) => (row.createdDate || '').startsWith(month)),
    [expenses, month],
  )
  const summary = useMemo(
    () => computeBudgetSummary(monthExpenses, month, budgetCategories),
    [monthExpenses, month, budgetCategories],
  )
  const balance = useMemo(
    () => computeBalance(monthExpenses, users),
    [monthExpenses, users],
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-500">Общий бюджет</p>
          <h1 className="text-2xl font-extrabold tracking-tight">Shared Budget</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Кто что оплатил и кто кому должен в этом месяце.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="field !w-auto"
          />
          <Button icon={FiPlus} onClick={() => setOpen(true)}>
            Добавить расход
          </Button>
        </div>
      </div>

      <BudgetStats month={month} summary={summary} balance={balance} />
      <BudgetCharts
        his={byPayerCategories(monthExpenses, 'he', budgetCategories)}
        hers={byPayerCategories(monthExpenses, 'she', budgetCategories)}
      />
      <ExpenseTable
        expenses={monthExpenses}
        users={users}
        categories={budgetCategories}
        onSettle={settleExpense}
        onDelete={(id) => {
          if (window.confirm('Удалить этот расход?')) deleteExpense(id)
        }}
      />

      <AddExpenseModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={createExpense}
        users={users}
      />
    </div>
  )
}
