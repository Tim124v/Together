import { cx, ownerStyle } from '../../utils/helpers'
import { useTranslation } from 'react-i18next'

const OWNERS = ['he', 'she', 'both']
const EMOJI = { he: '🧑‍💻', she: '💃', both: '💞' }

export default function OwnerPicker({ value, onChange, options = OWNERS, size = 'md', className }) {
  const { t } = useTranslation()
  return (
    <div
      className={cx(
        'inline-flex w-full gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-white/[0.06]',
        className,
      )}
    >
      {options.map((owner) => {
        const style = ownerStyle(owner)
        const active = value === owner
        return (
          <button
            key={owner}
            type="button"
            onClick={() => onChange(owner)}
            className={cx(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg font-semibold transition-all duration-200',
              size === 'sm' ? 'h-8 text-xs' : 'h-9 px-3 text-sm',
              active
                ? cx(style.gradient, 'text-white shadow-soft')
                : 'text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white',
            )}
          >
            <span>{EMOJI[owner]}</span>
            {t(`owner.${owner}`)}
          </button>
        )
      })}
    </div>
  )
}
