import { cx } from '../../utils/helpers'

const VARIANTS = {
  primary:
    'bg-grad-brand text-white shadow-glow hover:brightness-[1.06] active:brightness-95',
  soft:
    'bg-brand/10 text-brand-600 hover:bg-brand/16 dark:bg-brand/20 dark:text-brand-200 dark:hover:bg-brand/28',
  ghost:
    'text-slate-500 hover:bg-slate-900/5 hover:text-ink dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white',
  outline:
    'border border-slate-200 bg-white/70 text-ink hover:border-brand/50 hover:text-brand-600 dark:border-white/12 dark:bg-white/5 dark:text-slate-100 dark:hover:border-brand/50',
  danger: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/18',
}

const SIZES = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-sm',
  icon: 'h-10 w-10',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className,
  ...props
}) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 disabled:pointer-events-none disabled:opacity-50',
        'active:scale-[0.97]',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className={cx('shrink-0', size === 'sm' ? 'text-sm' : 'text-base')} />}
      {children}
    </button>
  )
}
