import { useState } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import Button from '../shared/Button'
import Card, { CardHeader } from '../shared/Card'

export default function PairActions({ partnerConnected, onLeave, busy }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <CardHeader title={t('pair.danger')} subtitle={t('pair.dangerSub')} />
      {!open ? (
        <Button variant="danger" icon={FiAlertTriangle} onClick={() => setOpen(true)}>
          {partnerConnected ? t('pair.removeFromPair') : t('pair.deletePair')}
        </Button>
      ) : (
        <div className="space-y-3 rounded-2xl bg-rose-500/8 p-4">
          <p className="text-sm font-semibold text-rose-500">{t('pair.leaveConfirm')}</p>
          <div className="flex gap-2">
            <Button variant="danger" disabled={busy} onClick={onLeave}>
              {busy ? t('pair.leaving') : t('pair.yesLeave')}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
