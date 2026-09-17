import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils/helpers'

export default function Modal({ open, onClose, title, subtitle, children, footer, icon: Icon }) {
  const { t } = useTranslation()
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 pb-[72px] sm:items-center sm:p-6 sm:pb-6">
      <div
        className="absolute inset-0 animate-fade-in bg-slate-900/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cx(
          'relative z-10 w-full max-w-lg animate-scale-in overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl',
          'dark:bg-[#141a2e] dark:ring-1 dark:ring-white/10',
        )}
      >
        <div className="flex items-start gap-3 border-b border-slate-100 px-6 py-5 dark:border-white/10">
          {Icon && (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-grad-brand text-white shadow-glow">
              <Icon className="text-lg" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-900/5 hover:text-ink dark:hover:bg-white/10 dark:hover:text-white"
          >
            <FiX />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-white/10 dark:bg-white/[0.02]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
