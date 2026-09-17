import { useTranslation } from 'react-i18next'
import Button from '../shared/Button'

export default function Step2Info({ coupleName, startDate, onName, onDate, onBack, onNext, busy, error }) {
  const { t } = useTranslation()
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onNext()
      }}
    >
      <div>
        <label className="label">{t('setup.pairName')}</label>
        <input
          value={coupleName}
          onChange={(e) => onName(e.target.value)}
          className="field"
          placeholder={t('setup.pairNamePlaceholder')}
          maxLength={100}
          autoFocus
        />
      </div>
      <div>
        <label className="label">{t('setup.meetingDateOptional')}</label>
        <input type="date" value={startDate} onChange={(e) => onDate(e.target.value)} className="field" />
        <p className="mt-1.5 text-[11px] text-slate-400">{t('setup.skipDateHint')}</p>
      </div>
      {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          ← {t('common.back')}
        </Button>
        <Button type="submit" className="flex-1 text-white" disabled={busy || !coupleName.trim()}>
          {busy ? t('common.creating') : `${t('common.next')} →`}
        </Button>
      </div>
    </form>
  )
}
