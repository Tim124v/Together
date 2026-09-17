import { useTranslation } from 'react-i18next'
import Button from '../shared/Button'
import { daysTogetherFrom } from '../../utils/mappers'

export default function Step3bJoined({ couple, onDashboard }) {
  const { t } = useTranslation()
  const days = couple?.daysTogether ?? daysTogetherFrom(couple?.startDate)

  return (
    <div className="space-y-5 text-center">
      <p className="text-2xl">✅</p>
      <p className="text-base font-extrabold tracking-tight">{t('setup.joinedPair')}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        «{couple?.coupleName}»
        {days > 0 ? ` · ${t('header.daysTogether', { count: days })}` : ''}
      </p>
      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t('setup.sameDataHint')}</p>
      <Button className="w-full text-white" onClick={onDashboard}>
        {t('setup.goDashboard')}
      </Button>
    </div>
  )
}
