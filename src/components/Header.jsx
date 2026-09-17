import { FiBell, FiLogOut, FiMenu, FiMoon, FiSearch, FiSettings, FiSun } from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { cx, ownerStyle } from '../utils/helpers'
import Avatar from './shared/Avatar'

function UserPill({ owner }) {
  const { t } = useTranslation()
  const { users } = useApp()
  const { onlineIds } = useData()
  const user = users[owner]
  const style = ownerStyle(owner)
  const online = owner === 'both' || onlineIds.includes(user.id)

  return (
    <div
      className={cx(
        'group flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3.5 transition-all duration-300',
        'bg-white/70 ring-1 ring-slate-200/80 hover:shadow-soft dark:bg-white/[0.06] dark:ring-white/10',
      )}
    >
      <Avatar owner={owner} size="sm" ring={false} />
      <div className="hidden leading-tight sm:block">
        <p className="text-xs font-bold tracking-tight">{user.name}</p>
        <p className={cx('text-[10px] font-semibold', online ? style.text : 'text-slate-400')}>
          {online ? t('common.online') : t('common.offline')}
        </p>
      </div>
    </div>
  )
}

export default function Header({ onMenuClick }) {
  const { t } = useTranslation()
  const { theme, toggleTheme, stats } = useApp()
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-canvas/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1020]/80">
      <div className="flex h-16 items-center gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={t('common.menu')}
          className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-900/5 lg:hidden dark:text-slate-300 dark:hover:bg-white/10"
        >
          <FiMenu className="text-lg" />
        </button>

        <div className="flex items-center gap-3">
          <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-grad-brand text-white shadow-glow">
            <HiOutlineSparkles className="text-lg" />
            <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-white text-[9px] shadow-soft dark:bg-[#0b1020]">
              💞
            </span>
          </span>
          <div className="leading-tight">
            <p className="text-lg font-extrabold tracking-tight">
              Together
            </p>
            <p className="hidden text-[11px] font-medium text-slate-500 sm:block dark:text-slate-400">
              {t('header.daysTogether', { count: stats.daysTogether })}
            </p>
          </div>
        </div>

        <div className="mx-auto hidden w-full max-w-sm items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/70 px-3.5 py-2.5 text-sm text-slate-400 transition focus-within:border-brand/50 focus-within:ring-4 focus-within:ring-brand/12 md:flex dark:border-white/10 dark:bg-white/[0.04]">
          <FiSearch className="shrink-0" />
          <input
            placeholder={t('header.searchPlaceholder')}
            className="w-full bg-transparent text-ink outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
          <kbd className="hidden rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 lg:block dark:border-white/10">
            ⌘K
          </kbd>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            aria-label={t('header.pairSettings')}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-900/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <FiSettings className="text-lg" />
          </button>

          <button
            type="button"
            aria-label={t('common.notifications')}
            className="relative hidden h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-900/5 sm:grid dark:text-slate-300 dark:hover:bg-white/10"
          >
            <FiBell className="text-lg" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-her ring-2 ring-canvas dark:ring-[#0b1020]" />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t('common.toggleTheme')}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-900/5 dark:text-amber-300 dark:hover:bg-white/10"
          >
            {theme === 'dark' ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
          </button>

          <div className="hidden h-8 w-px bg-slate-200 sm:block dark:bg-white/10" />

          <div className="flex items-center gap-2">
            <UserPill owner="he" />
            <span className="hidden text-lg sm:block">💞</span>
            <UserPill owner="she" />
          </div>

          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/login')
            }}
            aria-label={t('common.logout')}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-500"
          >
            <FiLogOut className="text-lg" />
          </button>
        </div>
      </div>
    </header>
  )
}
