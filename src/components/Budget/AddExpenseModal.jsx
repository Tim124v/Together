import { useEffect, useState } from 'react'
import { FiDollarSign } from 'react-icons/fi'
import Button from '../shared/Button'
import Modal from '../shared/Modal'
import { BUDGET_CATEGORIES } from '../../utils/budget'
import { cx, todayISO } from '../../utils/helpers'

const empty = {
  description: '',
  amount: '',
  category: 'groceries',
  paidBy: 'he',
  splitType: 'equal',
  hePercent: 50,
  createdDate: todayISO(),
}

export default function AddExpenseModal({ open, onClose, onCreate, users }) {
  const [values, setValues] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setValues({ ...empty, createdDate: todayISO() })
      setError('')
    }
  }, [open])

  const heName = users?.he?.name || 'Он'
  const sheName = users?.she?.name || 'Она'

  const submit = async () => {
    if (!values.description.trim() || !Number(values.amount)) return
    setSaving(true)
    setError('')
    try {
      await onCreate({
        description: values.description.trim(),
        amount: Number(values.amount),
        category: values.category,
        paidBy: values.paidBy,
        splitType: values.splitType,
        hePercent: Number(values.hePercent),
        createdDate: values.createdDate,
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Не получилось сохранить расход')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={FiDollarSign}
      title="Новый расход"
      subtitle="Попадёт в общий бюджет и пересчитает баланс"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={!values.description.trim() || !Number(values.amount) || saving}>
            {saving ? 'Сохраняем…' : 'Добавить расход'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Описание</label>
          <input
            autoFocus
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            placeholder="Обед в кафе"
            className="field"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Сумма</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.amount}
              onChange={(e) => setValues((v) => ({ ...v, amount: e.target.value }))}
              placeholder="1860"
              className="field"
            />
          </div>
          <div>
            <label className="label">Дата</label>
            <input
              type="date"
              value={values.createdDate}
              onChange={(e) => setValues((v) => ({ ...v, createdDate: e.target.value }))}
              className="field"
            />
          </div>
        </div>
        <div>
          <label className="label">Категория</label>
          <select
            value={values.category}
            onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
            className="field"
          >
            {BUDGET_CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Кто платил</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['he', heName],
              ['she', sheName],
              ['both', 'Вместе'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setValues((v) => ({ ...v, paidBy: id }))}
                className={cx(
                  'rounded-xl px-3 py-2 text-xs font-bold transition',
                  values.paidBy === id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-300',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Как делить</label>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {[
              ['equal', 'Поровну 50/50'],
              ['custom', 'Кастомный сплит'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setValues((v) => ({ ...v, splitType: id }))}
                className={cx(
                  'rounded-xl px-3 py-2 text-xs font-bold transition',
                  values.splitType === id
                    ? 'bg-[#10b981] text-white'
                    : 'bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-300',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {values.splitType === 'custom' && (
            <div>
              <div className="mb-2 flex justify-between text-[11px] font-bold text-slate-500">
                <span>{heName} {values.hePercent}%</span>
                <span>{sheName} {100 - Number(values.hePercent)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={values.hePercent}
                onChange={(e) => setValues((v) => ({ ...v, hePercent: Number(e.target.value) }))}
                className="w-full accent-emerald-500"
              />
            </div>
          )}
        </div>
        {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
      </div>
    </Modal>
  )
}
