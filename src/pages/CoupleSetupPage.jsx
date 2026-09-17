import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { todayISO } from '../utils/helpers'
import { cx } from '../utils/helpers'
import Button from '../components/shared/Button'
import AuthLayout from './AuthLayout'

export default function CoupleSetupPage() {
  const { createCouple, joinCouple, logout } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('create')
  const [coupleName, setCoupleName] = useState('')
  const [startDate, setStartDate] = useState(todayISO())
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'create') {
        if (!coupleName.trim()) {
          setError('Введите имя пары')
          return
        }
        await createCouple({ coupleName: coupleName.trim(), startDate })
      } else {
        if (!inviteCode.trim()) {
          setError('Введите код приглашения')
          return
        }
        await joinCouple(inviteCode.trim())
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(apiError(err, 'Не получилось сохранить пару'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout title="Ваша пара" subtitle="Создайте пространство вдвоём или войдите по коду">
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100/80 p-1 dark:bg-white/[0.06]">
        {[
          { id: 'create', label: 'Создать пару' },
          { id: 'join', label: 'Есть код' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={cx(
              'h-10 rounded-lg text-sm font-bold transition',
              mode === item.id ? 'bg-white shadow-soft dark:bg-white/12' : 'text-slate-500',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === 'create' ? (
          <>
            <div>
              <label className="label">Имя пары</label>
              <input
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                className="field"
                placeholder="Артём & Катя"
              />
            </div>
            <div>
              <label className="label">День начала</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="field" />
            </div>
          </>
        ) : (
          <div>
            <label className="label">Код приглашения</label>
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="field uppercase tracking-widest"
              placeholder="TOGETHER1"
            />
            <p className="mt-1.5 text-[11px] text-slate-400">Демо-код после seed: TOGETHER1</p>
          </div>
        )}

        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Сохраняем…' : mode === 'create' ? 'Создать пространство' : 'Присоединиться'}
        </Button>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="w-full text-center text-xs font-semibold text-slate-400 hover:text-ink"
        >
          Выйти из аккаунта
        </button>
      </form>
    </AuthLayout>
  )
}
