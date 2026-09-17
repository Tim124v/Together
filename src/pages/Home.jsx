import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Modals from '../components/Modals'
import Sidebar, { NAV_ITEMS } from '../components/Sidebar'
import { useApp } from '../context/AppContext'
import { cx } from '../utils/helpers'

function MobileNav() {
  const { page } = useApp()
  const navigate = useNavigate()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/60 bg-canvas/90 px-1 pt-1 backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-[#0b1020]/90 pb-[max(6px,env(safe-area-inset-bottom))]">
      <div className="flex items-stretch justify-between gap-0.5 overflow-x-auto">
        {NAV_ITEMS.map(({ id, short, label, icon: Icon, to }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            onClick={() => navigate(to)}
            className={cx(
              'flex min-h-[50px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-[8px] font-bold leading-tight transition',
              page === id ? 'text-brand-600 dark:text-brand-200' : 'text-slate-400',
            )}
          >
            <span
              className={cx(
                'grid h-8 w-8 shrink-0 place-items-center rounded-xl transition',
                page === id && 'bg-grad-brand text-white shadow-glow',
              )}
            >
              <Icon className="text-base" />
            </span>
            <span className="max-w-full truncate leading-none">{short || label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default function Home() {
  const { page } = useApp()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas dark:bg-[#0b1020]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-brand/16 blur-[100px]" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-her/14 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-him/12 blur-[100px]" />
      </div>

      <div className="relative">
        <Header onMenuClick={() => setMenuOpen(true)} />

        <div className="mx-auto flex w-full max-w-[1600px] gap-0 px-0 lg:px-4">
          <Sidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />

          <main className="min-w-0 flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-4 lg:pb-10">
            <div key={location.pathname} className="animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>

        <MobileNav />
        <Modals />
      </div>
    </div>
  )
}
