import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'
import { cx } from '../utils/helpers'
import Button from '../components/shared/Button'
import AuthLayout from './AuthLayout'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const { language, currency, country } = useLocale()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const inviteFromLink = (params.get('code') || '').toUpperCase()
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
      setError(t('auth.nameEmailPassword'))
      return
    }
    if (values.password !== values.confirm) {
      setError(t('auth.passwordsMismatch'))
      return
    }
    setBusy(true)
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        avatarColor: values.avatarColor,
        language,
        currency,
        country,
      })
      navigate(inviteFromLink ? `/couple-setup?code=${encodeURIComponent(inviteFromLink)}` : '/couple-setup', {
        replace: true,
      })
    } catch (err) {
      setError(apiError(err, t('auth.registerFailed')))
    } finally {
      setBusy(false)
    }
  }

  const colors = [
    { id: 'blue', label: t('auth.avatarBlue') },
    { id: 'pink', label: t('auth.avatarPink') },
    { id: 'green', label: t('auth.avatarGreen') },
  ]

  return (
    <AuthLayout
      title={t('auth.register')}
      subtitle={inviteFromLink ? t('auth.inviteAfter', { code: inviteFromLink }) : t('auth.registerSubtitle')}
      footer={
        <>
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="font-bold text-brand-600 dark:text-brand-200">
            {t('auth.signIn')}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">{t('common.name')}</label>
          <input value={values.name} onChange={set('name')} className="field" placeholder={t('auth.namePlaceholder')} />
        </div>
        <div>
          <label className="label">{t('common.email')}</label>
          <input type="email" value={values.email} onChange={set('email')} className="field" />
        </div>
        <div>
          <label className="label">{t('common.password')}</label>
          <input type="password" value={values.password} onChange={set('password')} className="field" />
        </div>
        <div>
          <label className="label">{t('auth.confirmPassword')}</label>
          <input type="password" value={values.confirm} onChange={set('confirm')} className="field" />
        </div>
        <div>
          <label className="label">{t('auth.avatarColor')}</label>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setValues((v) => ({ ...v, avatarColor: c.id }))}
                className={cx(
                  'h-9 flex-1 rounded-xl text-xs font-bold transition',
                  values.avatarColor === c.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/10',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
        <Button type="submit" className="w-full text-white" disabled={busy}>
          {busy ? t('auth.creatingAccount') : t('auth.signUp')}
        </Button>
      </form>
    </AuthLayout>
  )
}
