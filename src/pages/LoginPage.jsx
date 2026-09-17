import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Button from '../components/shared/Button'
import AuthLayout from './AuthLayout'

export default function LoginPage() {
  const { t } = useTranslation()
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
      setError(t('auth.enterEmailPassword'))
      return
    }
    setBusy(true)
    try {
      const data = await login(email.trim(), password)
      navigate(data.couple ? '/' : '/couple-setup', { replace: true })
    } catch (err) {
      setError(apiError(err, t('auth.invalidCredentials')))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title={t('auth.login')}
      subtitle={t('auth.loginSubtitle')}
      footer={
        <>
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-bold text-brand-600 dark:text-brand-200">
            {t('auth.register')}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">{t('common.email')}</label>
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
          <label className="label">{t('common.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
        <Button type="submit" className="w-full text-white" disabled={busy}>
          {busy ? t('auth.signingIn') : t('auth.signIn')}
        </Button>
        <p className="text-center text-[11px] text-slate-400">{t('auth.demo')}</p>
      </form>
    </AuthLayout>
  )
}
