import { useMemo } from 'react'
import { FiCalendar, FiCheckSquare, FiClock, FiDollarSign, FiGrid, FiHeart, FiPlus, FiSettings, FiX } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { cx } from '../utils/helpers'
import { AvatarPair } from './shared/Avatar'
import ProgressBar from './shared/ProgressBar'

export function useNavItems() {
  const { t } = useTranslation()
  return useMemo(
    () => [
      { id: 'dashboard', label: t('nav.dashboard'), short: t('nav.dashboardShort'), hint: t('nav.dashboardHint'), icon: FiGrid, to: '/' },
      { id: 'tasks', label: t('nav.tasks'), short: t('nav.tasks'), hint: t('nav.tasksHint'), icon: FiCheckSquare, to: '/tasks' },
      { id: 'calendar', label: t('nav.calendar'), short: t('nav.calendar'), hint: t('nav.calendarHint'), icon: FiCalendar, to: '/calendar' },
      { id: 'wishes', label: t('nav.wishes'), short: t('nav.wishes'), hint: t('nav.wishesHint'), icon: FiHeart, to: '/wishes' },
      { id: 'capsules', label: t('nav.capsules'), short: t('nav.capsules'), hint: t('nav.capsulesHint'), icon: FiClock, to: '/capsules' },
      { id: 'budget', label: t('nav.budget'), short: t('nav.budget'), hint: t('nav.budgetHint'), icon: FiDollarSign, to: '/budget' },
    ],
    [t],
  )
}

export function useSidebarItems() {
  const { t } = useTranslation()
  const nav = useNavItems()
  return useMemo(
    () => [...nav, { id: 'settings', label: t('nav.settings'), short: t('nav.settingsShort'), hint: t('nav.settingsHint'), icon: FiSettings, to: '/settings' }],
    [nav, t],
  )
}

export const NAV_ITEMS = [
  { id: 'dashboard', icon: FiGrid, to: '/' },
  { id: 'tasks', icon: FiCheckSquare, to: '/tasks' },
  { id: 'calendar', icon: FiCalendar, to: '/calendar' },
  { id: 'wishes', icon: FiHeart, to: '/wishes' },
  { id: 'capsules', icon: FiClock, to: '/capsules' },
  { id: 'budget', icon: FiDollarSign, to: '/budget' },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const { t } = useTranslation()
  const { page, tasks, events, wishes, capsules, expenses, openModal, stats } = useApp()
  const { couple } = useAuth()
  const navigate = useNavigate()
  const SIDEBAR_ITEMS = useSidebarItems()

  const counters = {
    dashboard: null,
    tasks: tasks.filter((t) => t.status !== 'done').length,
    calendar: events.length,
    wishes: wishes.length,
    capsules: capsules?.length || 0,
    budget: expenses?.length || 0,
    settings: null,
  }

  const doneShare = tasks.length
    ? Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100)
    : 0

  const content = (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between lg:hidden">
        <p className="px-2 text-sm font-bold">{t('nav.navigation')}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/10"
        >
          <FiX />
        </button>
      </div>

      <nav className="space-y-1.5">
        {SIDEBAR_ITEMS.map(({ id, label, hint, icon: Icon, to }) => {
          const active = page === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                navigate(to)
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
            {t('nav.quickAdd')}
        </p>
        <div className="space-y-2">
          {[
            { label: t('nav.addTask'), modal: 'task', accent: 'text-both' },
            { label: t('nav.addEvent'), modal: 'event', accent: 'text-him' },
            { label: t('nav.addWish'), modal: 'wish', accent: 'text-her' },
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

      <div
        className="mt-auto cursor-pointer rounded-2xl bg-grad-night p-4 text-white shadow-lift"
        onClick={() => {
          navigate('/settings')
          onClose?.()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') navigate('/settings')
        }}
        role="button"
        tabIndex={0}
      >
        <div className="mb-3 flex items-center justify-between">
          <AvatarPair size="sm" />
          <span className="text-lg animate-float">💞</span>
        </div>
        <p className="text-sm font-bold leading-tight">{couple?.coupleName || 'Together'}</p>
        <p className="mt-0.5 text-[11px] text-white/60">{t('header.daysTogether', { count: stats.daysTogether })}</p>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-white/70">
            <span>{t('nav.tasksWeek')}</span>
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
