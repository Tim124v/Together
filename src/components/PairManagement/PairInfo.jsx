import { useEffect, useState } from 'react'
import { FiSave } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { daysTogetherFrom } from '../../utils/mappers'
import { formatDate } from '../../utils/helpers'
import Button from '../shared/Button'
import Card, { CardHeader } from '../shared/Card'

export default function PairInfo({ couple, onSave, busy, error }) {
  const { t } = useTranslation()
  const [name, setName] = useState(couple?.coupleName || '')
  const [startDate, setStartDate] = useState(couple?.startDate || '')

  useEffect(() => {
    setName(couple?.coupleName || '')
    setStartDate(couple?.startDate || '')
  }, [couple?.coupleName, couple?.startDate])
  const days = daysTogetherFrom(startDate || couple?.startDate)
  const dirty = name.trim() !== (couple?.coupleName || '') || (startDate || '') !== (couple?.startDate || '')

  return (
    <Card>
      <CardHeader title={t('pair.info')} subtitle={t('pair.infoSub')} />
      <div className="space-y-4">
        <div>
          <label className="label">{t('pair.pairName')}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="field" maxLength={100} />
        </div>
        <div>
          <label className="label">{t('pair.meetingDate')}</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="field" />
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {startDate ? t('pair.daysTogether', { date: formatDate(startDate), count: days }) : t('pair.noDateYet')}
          </p>
        </div>
        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
        <Button icon={FiSave} disabled={!dirty || busy || !name.trim()} onClick={() => onSave({ coupleName: name.trim(), startDate: startDate || null })}>
          {busy ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </Card>
  )
}
