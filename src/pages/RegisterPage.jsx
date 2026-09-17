import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { cx } from '../utils/helpers'
import Button from '../components/shared/Button'
import AuthLayout from './AuthLayout'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    avatarColor: 'blue',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target ? e.target.value : e }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!values.name.trim() || !values.email.trim() || values.password.length < 6) {
      setError('Имя, email и пароль от 6 символов')
      return
    }
    if (values.password !== values.confirm) {
      setError('Пароли не совпадают')
      return
    }
    setBusy(true)
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        avatarColor: values.avatarColor,
      })
      navigate('/couple-setup', { replace: true })
    } catch (err) {
      setError(apiError(err, 'Не получилось зарегистрироваться'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Регистрация"
      subtitle="Создайте аккаунт и пригласите пару"
      footer={
        <>
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-bold text-brand-600 dark:text-brand-200">
            Войти
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Имя</label>
          <input value={values.name} onChange={set('name')} className="field" placeholder="Артём" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" value={values.email} onChange={set('email')} className="field" />
        </div>
        <div>
          <label className="label">Пароль</label>
          <input type="password" value={values.password} onChange={set('password')} className="field" />
        </div>
        <div>
          <label className="label">Повторите пароль</label>
          <input type="password" value={values.confirm} onChange={set('confirm')} className="field" />
        </div>
        <div>
          <label className="label">Цвет аватара</label>
          <div className="flex gap-2">
            {[
              { id: 'blue', label: 'Синий' },
              { id: 'pink', label: 'Розовый' },
              { id: 'green', label: 'Общий' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setValues((v) => ({ ...v, avatarColor: c.id }))}
                className={cx(
                  'h-9 flex-1 rounded-xl text-xs font-bold transition',
                  values.avatarColor === c.id ? 'bg-grad-brand text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/10',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Создаём…' : 'Создать аккаунт'}
        </Button>
      </form>
    </AuthLayout>
  )
}
