import { FiCalendar, FiCheckSquare, FiGrid, FiHeart, FiPlus, FiX } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { cx } from '../utils/helpers'
import { AvatarPair } from './shared/Avatar'
import ProgressBar from './shared/ProgressBar'

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', hint: 'Главный экран', icon: FiGrid },
  { id: 'tasks', label: 'Задачи', hint: 'Общий канбан', icon: FiCheckSquare },
  { id: 'calendar', label: 'Календарь', hint: 'События вдвоём', icon: FiCalendar },
  { id: 'wishes', label: 'Мечты', hint: 'Список желаний', icon: FiHeart },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const { page, setPage, tasks, events, wishes, openModal, stats } = useApp()

  const counters = {
    dashboard: null,
    tasks: tasks.filter((t) => t.status !== 'done').length,
    calendar: events.length,
    wishes: wishes.length,
  }

  const doneShare = Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100)

  const content = (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between lg:hidden">
        <p className="px-2 text-sm font-bold">Навигация</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть меню"
          className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/10"
        >
          <FiX />
        </button>
      </div>

      <nav className="space-y-1.5">
        {NAV_ITEMS.map(({ id, label, hint, icon: Icon }) => {
          const active = page === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setPage(id)
                onClose?.()
              }}
              className={cx(
                'group relative flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all duration-300',
                active
                  ? 'bg-grad-brand text-white shadow-glow'
                  : 'text-slate-600 hover:bg-white hover:shadow-soft dark:text-slate-300 dark:hover:bg-white/[0.06]',
              )}
            >
              <span
                className={cx(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-xl transition',
                  active
                    ? 'bg-white/20 text-white'
                    : 'bg-brand/8 text-brand-500 group-hover:bg-brand/14 dark:bg-white/[0.06] dark:text-brand-200',
                )}
              >
                <Icon className="text-[17px]" />
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block text-sm font-bold tracking-tight">{label}</span>
                <span className={cx('block text-[11px]', active ? 'text-white/70' : 'text-slate-400')}>
                  {hint}
                </span>
              </span>
              {counters[id] != null && (
                <span
                  className={cx(
                    'rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums',
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300',
                  )}
                >
                  {counters[id]}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="surface-muted p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Быстро добавить
        </p>
        <div className="space-y-2">
          {[
            { label: 'Задачу', modal: 'task', accent: 'text-both' },
            { label: 'Событие', modal: 'event', accent: 'text-him' },
            { label: 'Желание', modal: 'wish', accent: 'text-her' },
          ].map((item) => (
            <button
              key={item.modal}
              type="button"
              onClick={() => {
                openModal(item.modal)
                onClose?.()
              }}
              className="flex w-full items-center gap-2.5 rounded-xl bg-white/80 px-3 py-2.5 text-sm font-semibold transition hover:shadow-soft dark:bg-white/[0.05]"
            >
              <FiPlus className={cx('text-sm', item.accent)} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-2xl bg-grad-night p-4 text-white shadow-lift">
        <div className="mb-3 flex items-center justify-between">
          <AvatarPair size="sm" />
          <span className="text-lg animate-float">💞</span>
        </div>
        <p className="text-sm font-bold leading-tight">Артём &amp; Катя</p>
        <p className="mt-0.5 text-[11px] text-white/60">{stats.daysTogether} дней вместе</p>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-white/70">
            <span>Задачи недели</span>
            <span className="tabular-nums">{doneShare}%</span>
          </div>
          <ProgressBar value={doneShare} owner="both" />
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden w-[264px] shrink-0 lg:block">
        <div className="sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">{content}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-slate-900/45 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full w-[290px] animate-fade-in overflow-y-auto border-r border-white/60 bg-canvas shadow-2xl dark:border-white/10 dark:bg-[#0b1020]">
            {content}
          </div>
        </div>
      )}
    </>
  )
}
