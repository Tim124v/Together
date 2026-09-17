import { FiLock, FiUnlock } from 'react-icons/fi'
import Card from '../shared/Card'
import { cx, formatDate } from '../../utils/helpers'

const STATUS = {
  opened: { label: 'Открыто', icon: '🔓', className: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300' },
  ready: { label: 'Можно открыть', icon: '🎉', className: 'bg-amber-500/14 text-amber-600 dark:text-amber-300' },
  locked: { label: 'Ждёт открытия', icon: '⏰', className: 'bg-[#667eea]/12 text-[#667eea] dark:text-indigo-300' },
}

export default function CapsuleCard({ capsule, active, onSelect }) {
  const status = STATUS[capsule.status] || STATUS.opened
  return (
    <Card
      hover
      padding="p-4"
      className={cx(
        'cursor-pointer text-left transition ring-2',
        active ? 'ring-[#667eea]/50 shadow-lift' : 'ring-transparent',
      )}
      onClick={() => onSelect(capsule)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-extrabold tracking-tight">{capsule.title}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            {formatDate(capsule.createdDate)}
            {capsule.openDate ? ` · открыть ${formatDate(capsule.openDate)}` : ' · сразу открыта'}
          </p>
        </div>
        <span className={cx('chip shrink-0 px-2 py-1 text-[10px]', status.className)}>
          {status.icon} {status.label}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {capsule.preview || 'Без описания'}
      </p>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
        {capsule.locked ? <FiLock /> : <FiUnlock />}
        {capsule.createdByName || 'Капсула пары'}
      </div>
    </Card>
  )
}
