import { cx } from '../../utils/helpers'

export default function Card({ children, className, hover = false, padding = 'p-5', as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={cx(
        'surface',
        padding,
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lift',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand-500 dark:bg-brand/20 dark:text-brand-200">
            <Icon className="text-lg" />
          </span>
        )}
        <div>
          <h3 className="text-base font-bold tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
