import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiGlobe, FiHeart, FiUser } from 'react-icons/fi'
import { apiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { copyText, cx } from '../utils/helpers'
import PairInfo from '../components/PairManagement/PairInfo'
import InviteCode from '../components/PairManagement/InviteCode'
import PartnerStatus from '../components/PairManagement/PartnerStatus'
import PairActions from '../components/PairManagement/PairActions'
import LocalizationSettings from '../components/LocalizationSettings'

export default function SettingsPage() {
  const { t } = useTranslation()
  const { user, couple, updateCouple, regenerateInviteCode, leaveCouple, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('pair')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const tabs = [
    { id: 'pair', label: t('settings.pair'), icon: FiHeart },
    { id: 'localization', label: t('settings.localization'), icon: FiGlobe },
    { id: 'profile', label: t('settings.profile'), icon: FiUser },
  ]

  const save = async (payload) => {
    setError('')
    setBusy(true)
    try {
      await updateCouple(payload)
    } catch (err) {
      setError(apiError(err, t('settings.saveFailed')))
    } finally {
      setBusy(false)
    }
  }

  const regenerate = async () => {
    setBusy(true)
    try {
      await regenerateInviteCode()
    } finally {
      setBusy(false)
    }
  }

  const remind = async () => {
    const code = couple?.inviteCode || couple?.code || ''
    const link = `${window.location.origin}/register?code=${encodeURIComponent(code)}`
    await copyText(t('pair.remindText', { code, link }))
  }

  const leave = async () => {
    setBusy(true)
    try {
      await leaveCouple()
      navigate('/couple-setup', { replace: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-enter mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('settings.subtitle')}</p>
      </div>

      <div className="flex gap-1 rounded-2xl bg-slate-100/80 p-1 dark:bg-white/[0.06]">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cx(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition',
              tab === id ? 'bg-white shadow-soft dark:bg-white/12' : 'text-slate-500',
            )}
          >
            <Icon /> {label}
          </button>
        ))}
      </div>

      {tab === 'pair' && (
        <div className="space-y-4">
          <PairInfo couple={couple} onSave={save} busy={busy} error={error} />
          <PartnerStatus couple={couple} user={user} onRemind={remind} />
          <InviteCode couple={couple} onRegenerate={regenerate} busy={busy} />
          <PairActions partnerConnected={Boolean(couple?.user2)} onLeave={leave} busy={busy} />
        </div>
      )}

      {tab === 'localization' && <LocalizationSettings />}

      {tab === 'profile' && (
        <div className="surface space-y-3 p-5">
          <p className="text-sm font-bold">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <button
            type="button"
            className="text-sm font-semibold text-rose-500"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            {t('common.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
