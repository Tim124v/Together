import { useTranslation } from 'react-i18next'
import Button from '../shared/Button'

export default function Step2bCode({ inviteCode, onCode, onBack, onJoin, busy, error }) {
  const { t } = useTranslation()
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onJoin()
      }}
    >
      <div>
        <label className="label">{t('setup.pairCode')}</label>
        <input
          value={inviteCode}
          onChange={(e) => onCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))}
          className="field text-center font-mono text-xl font-extrabold tracking-[0.35em] uppercase"
          placeholder="TOGETHER1"
          autoFocus
          autoComplete="off"
        />
        <p className="mt-1.5 text-[11px] text-slate-400">{t('setup.pairCodeHint')}</p>
      </div>
      {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          ← {t('common.back')}
        </Button>
        <Button type="submit" className="flex-1 text-white" disabled={busy || inviteCode.trim().length < 4}>
          {busy ? t('common.checking') : `${t('setup.join')} →`}
        </Button>
      </div>
    </form>
  )
}
