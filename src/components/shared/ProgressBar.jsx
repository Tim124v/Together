import { cx, ownerStyle } from '../../utils/helpers'

export default function ProgressBar({ value = 0, owner = 'both', className, showLabel = false }) {
  const style = ownerStyle(owner)
  return (
    <div className={cx('flex items-center gap-3', className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
        <div
          className={cx('h-full rounded-full transition-all duration-700 ease-out', style.gradient)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-10 shrink-0 text-right text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
          {value}%
        </span>
      )}
    </div>
  )
}
