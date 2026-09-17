import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Button from '../components/shared/Button'
import AuthLayout from './AuthLayout'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('artem@together.app')
  const [password, setPassword] = useState('together123')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Введите email и пароль')
      return
    }
    setBusy(true)
    try {
      const data = await login(email.trim(), password)
      navigate(data.couple ? '/' : '/couple-setup', { replace: true })
    } catch (err) {
      setError(apiError(err, 'Неверный email или пароль'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Вход"
      subtitle="Общая жизнь в одном приложении"
      footer={
        <>
          Нет аккаунта?{' '}
          <Link to="/register" className="font-bold text-brand-600 dark:text-brand-200">
            Регистрация
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            autoComplete="email"
            placeholder="artem@together.app"
          />
        </div>
        <div>
          <label className="label">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Входим…' : 'Войти'}
        </Button>
        <p className="text-center text-[11px] text-slate-400">
          Демо: artem@together.app / together123
        </p>
      </form>
    </AuthLayout>
  )
}
