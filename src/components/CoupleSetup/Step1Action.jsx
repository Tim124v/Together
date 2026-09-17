import { FiKey, FiPlus } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils/helpers'
import Button from '../shared/Button'

export default function Step1Action({ mode, onSelect, onNext, onLogout }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => onSelect('create')}
        className={cx(
          'w-full rounded-2xl border p-4 text-left transition',
          mode === 'create'
            ? 'border-brand/50 bg-brand/8 ring-4 ring-brand/10'
            : 'border-slate-200/80 hover:border-brand/30 dark:border-white/10',
        )}
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
          <FiPlus />
        </span>
        <p className="mt-3 text-sm font-extrabold">{t('setup.createNewPair')}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t('setup.createNewPairHint')}</p>
      </button>

      <button
        type="button"
        onClick={() => onSelect('join')}
        className={cx(
          'w-full rounded-2xl border p-4 text-left transition',
          mode === 'join'
            ? 'border-brand/50 bg-brand/8 ring-4 ring-brand/10'
            : 'border-slate-200/80 hover:border-brand/30 dark:border-white/10',
        )}
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-him/15 text-him">
          <FiKey />
        </span>
        <p className="mt-3 text-sm font-extrabold">{t('setup.joinExisting')}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t('setup.joinExistingHint')}</p>
      </button>

      <Button className="mt-2 w-full text-white" disabled={!mode} onClick={onNext}>
        {t('common.next')} →
      </Button>
      <button type="button" onClick={onLogout} className="w-full text-center text-xs font-semibold text-slate-400 hover:text-ink">
        {t('setup.logoutAccount')}
      </button>
    </div>
  )
}
