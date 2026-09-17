import { FiClock, FiMail } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { formatDate, formatRelativePast } from '../../utils/helpers'
import { useData } from '../../context/DataContext'
import Avatar from '../shared/Avatar'
import Card, { CardHeader } from '../shared/Card'
import Button from '../shared/Button'

export default function PartnerStatus({ couple, user, onRemind }) {
  const { t } = useTranslation()
  const { onlineIds } = useData()
  const partner = couple?.user1?.id === user?.id ? couple?.user2 : couple?.user1
  const waiting = !partner

  if (waiting) {
    return (
      <Card>
        <CardHeader title={t('pair.partner')} subtitle={t('pair.waitingInvite')} />
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/15 text-xl">⏳</span>
          <div>
            <p className="text-sm font-bold">{t('pair.partnerNotJoined')}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('pair.inviteSent', { when: formatRelativePast(couple?.inviteCodeAt || couple?.createdAt) })}
            </p>
            <Button variant="soft" size="sm" className="mt-3" icon={FiMail} onClick={onRemind}>
              {t('pair.sendReminder')}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const owner = couple?.user1?.id === partner.id ? 'he' : 'she'
  const online = onlineIds.includes(partner.id)
  const connected = couple?.partnerJoinedAt

  return (
    <Card>
      <CardHeader title={t('pair.partner')} subtitle={online ? t('pair.nowOnline') : t('common.offline')} />
      <div className="flex items-center gap-3">
        <Avatar owner={owner} size="lg" />
        <div className="min-w-0">
          <p className="text-sm font-extrabold tracking-tight">{t('pair.partnerInPair', { name: partner.name })}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <FiClock />{' '}
            {connected ? t('pair.inPairSince', { date: formatDate(String(connected).slice(0, 10)) }) : t('pair.inPair')}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">{partner.email}</p>
        </div>
      </div>
    </Card>
  )
}
