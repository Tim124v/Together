import { useState } from 'react'
import { FiCheck, FiCopy, FiLink, FiRefreshCw } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { copyText } from '../../utils/helpers'
import Button from '../shared/Button'
import Card, { CardHeader } from '../shared/Card'

export default function InviteCode({ couple, onRegenerate, busy }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState('')
  const code = couple?.inviteCode || couple?.code || ''
  const shareLink = `${window.location.origin}/register?code=${encodeURIComponent(code)}`
  const shareText = t('pair.shareText', { code, link: shareLink })

  const copy = async (value, key) => {
    await copyText(value)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const regenerate = async () => {
    if (!window.confirm(t('pair.regenerateConfirm'))) return
    await onRegenerate()
  }

  return (
    <Card>
      <CardHeader title={t('pair.invite')} subtitle={t('pair.inviteSub')} />
      <p className="mb-3 rounded-2xl bg-slate-900 px-4 py-5 text-center font-mono text-3xl font-extrabold tracking-[0.28em] text-white dark:bg-white/10">
        {code || '—'}
      </p>
      <p className="mb-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t('pair.sendCode')}</p>
      <div className="flex flex-wrap gap-2">
        <Button icon={copied === 'code' ? FiCheck : FiCopy} onClick={() => copy(code, 'code')}>
          {copied === 'code' ? t('common.copied') : t('pair.copyCode')}
        </Button>
        <Button variant="soft" icon={copied === 'link' ? FiCheck : FiLink} onClick={() => copy(shareText, 'link')}>
          {copied === 'link' ? t('pair.linkCopied') : t('pair.copyLink')}
        </Button>
        <Button variant="outline" icon={FiRefreshCw} disabled={busy} onClick={regenerate}>
          {t('pair.newCode')}
        </Button>
      </div>
    </Card>
  )
}
