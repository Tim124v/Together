import { useState } from 'react'
import { FiCheck, FiCopy } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { copyText } from '../../utils/helpers'
import Button from '../shared/Button'

export default function Step3Success({ couple, onDashboard }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const code = couple?.inviteCode || couple?.code || ''

  const copy = async () => {
    if (!code) return
    await copyText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5 text-center">
      <p className="text-2xl">✅</p>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
        {t('setup.createdPair', { name: couple?.coupleName })}
      </p>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t('setup.yourPairCode')}</p>
        <p className="mt-2 rounded-2xl bg-slate-900 px-4 py-4 font-mono text-2xl font-extrabold tracking-[0.35em] text-white dark:bg-white/10">
          {code}
        </p>
        <Button variant="soft" className="mt-3 w-full" icon={copied ? FiCheck : FiCopy} onClick={copy}>
          {copied ? t('common.copied') : t('pair.copyCode')}
        </Button>
      </div>
      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t('setup.sendCodeHint')}</p>
      <Button className="w-full text-white" onClick={onDashboard}>
        {t('setup.goDashboard')}
      </Button>
    </div>
  )
}
