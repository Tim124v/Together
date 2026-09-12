import { useState } from 'react'
import Calendar from '../components/Calendar'
import Dashboard from '../components/Dashboard'
import Header from '../components/Header'
import Modals from '../components/Modals'
import Sidebar, { NAV_ITEMS } from '../components/Sidebar'
import TaskBoard from '../components/TaskBoard'
import Wishes from '../components/Wishes'
import { useApp } from '../context/AppContext'
import { cx } from '../utils/helpers'

const SCREENS = {
  dashboard: Dashboard,
  tasks: TaskBoard,
  calendar: Calendar,
  wishes: Wishes,
}

function MobileNav() {
  const { page, setPage } = useApp()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/60 bg-canvas/90 px-2 pb-1.5 pt-1.5 backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-[#0b1020]/90">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPage(id)}
            className={cx(
              'flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition',
              page === id ? 'text-brand-600 dark:text-brand-200' : 'text-slate-400',
            )}
          >
            <span
              className={cx(
                'grid h-8 w-8 place-items-center rounded-xl transition',
                page === id && 'bg-grad-brand text-white shadow-glow',
              )}
            >
              <Icon className="text-base" />
            </span>
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}

export default function Home() {
  const { page } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const Screen = SCREENS[page] ?? Dashboard

  return (
    <div className="min-h-screen bg-canvas dark:bg-[#0b1020]">
      {/* Декоративные градиентные пятна фона */}
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
            {/* key перезапускает fade-in анимацию при смене экрана */}
            <div key={page} className="animate-fade-in">
              <Screen />
            </div>
          </main>
        </div>

        <MobileNav />
        <Modals />
      </div>
    </div>
  )
}
