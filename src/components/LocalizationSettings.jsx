import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiGlobe } from 'react-icons/fi'
import { CURRENCIES, LANGUAGES } from '../i18n/languages'
import { useLocale } from '../context/LocaleContext'
import { cx } from '../utils/helpers'
import Button from './shared/Button'
import Card, { CardHeader } from './shared/Card'

export default function LocalizationSettings() {
  const { t } = useTranslation()
  const { language, currency, availableCurrencies, saveLocale } = useLocale()
  const [lang, setLang] = useState(language)
  const [curr, setCurr] = useState(currency)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const shown = CURRENCIES

  const save = async () => {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await saveLocale({ language: lang, currency: curr })
      setMessage('saved')
    } catch (err) {
      setError(err.response?.data?.error || err.message || t('settings.saveFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader icon={FiGlobe} title={t('settings.localization')} subtitle={t('settings.languageHint')} />
      <div className="space-y-5">
        <div>
          <p className="label">{t('settings.language')}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {LANGUAGES.map((row) => (
              <button
                key={row.code}
                type="button"
                onClick={() => setLang(row.code)}
                className={cx(
                  'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition',
                  lang === row.code
                    ? 'border-brand bg-brand-600 text-white shadow-soft'
                    : 'border-slate-200/80 text-ink hover:border-brand/40 dark:border-white/10 dark:text-slate-100',
                )}
              >
                <span>{row.flag}</span>
                <span>{row.native}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label">{t('settings.currency')}</p>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">{t('settings.currencyHint')}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {shown.map((row) => (
              <button
                key={row.code}
                type="button"
                onClick={() => setCurr(row.code)}
                className={cx(
                  'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition',
                  curr === row.code
                    ? 'border-brand bg-brand-600 text-white shadow-soft'
                    : 'border-slate-200/80 text-ink hover:border-brand/40 dark:border-white/10 dark:text-slate-100',
                )}
              >
                <span>{row.flag}</span>
                <span>
                  {t(`currency.name_${row.code}`)} {row.symbol}
                </span>
              </button>
            ))}
          </div>
        </div>

        {message === 'saved' && <p className="text-sm font-semibold text-emerald-600">{t('settings.localeSaved')}</p>}
        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
        <Button onClick={save} disabled={busy}>
          {busy ? t('common.saving') : t('settings.saveLocale')}
        </Button>
      </div>
    </Card>
  )
}
