import { cx } from '../../utils/helpers'
import { useTranslation } from 'react-i18next'

export default function Wizard({ step, total = 3, title, subtitle, children }) {
  const { t } = useTranslation()
  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1
          return (
            <span
              key={n}
              className={cx(
                'h-1.5 flex-1 rounded-full transition',
                n <= step ? 'bg-brand-600' : 'bg-slate-200 dark:bg-white/10',
              )}
            />
          )
        })}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {t('setup.step', { step, total })}
      </p>
      <h2 className="mt-1 text-lg font-extrabold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </div>
  )
}
