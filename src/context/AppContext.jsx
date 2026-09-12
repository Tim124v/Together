import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  activities as seedActivities,
  anniversaries,
  daysTogether,
  events as seedEvents,
  tasks as seedTasks,
  users,
  wishes as seedWishes,
} from '../data/mockData'
import { COLOR_BY_OWNER, plural, todayISO } from '../utils/helpers'

const AppContext = createContext(null)

const PAGES = ['dashboard', 'tasks', 'calendar', 'wishes']

let nextId = 1000
const makeId = () => (nextId += 1)

const pageFromHash = () => {
  const hash = window.location.hash.replace('#', '')
  return PAGES.includes(hash) ? hash : 'dashboard'
}

const themeFromEnv = () => {
  const forced = new URLSearchParams(window.location.search).get('theme')
  if (forced === 'light' || forced === 'dark') return forced
  const saved = localStorage.getItem('together-theme')
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(themeFromEnv)
  const [page, setPage] = useState(pageFromHash)
  const [tasks, setTasks] = useState(seedTasks)
  const [events, setEvents] = useState(seedEvents)
  const [wishes, setWishes] = useState(seedWishes)
  const [activities, setActivities] = useState(seedActivities)
  const [modal, setModal] = useState(null) // 'task' | 'event' | 'wish' | null

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('together-theme', theme)
  }, [theme])

  useEffect(() => {
    if (pageFromHash() !== page) window.location.hash = page
    const onHashChange = () => setPage(pageFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [page])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const logActivity = useCallback((user, text, icon = 'task') => {
    setActivities((prev) => [{ id: makeId(), user, text, time: 'только что', icon }, ...prev].slice(0, 8))
  }, [])

  const addTask = useCallback(
    (task) => {
      const created = {
        id: makeId(),
        status: 'todo',
        ...task,
        color: COLOR_BY_OWNER[task.assigned] ?? 'green',
      }
      setTasks((prev) => [created, ...prev])
      logActivity(task.assigned, `добавил(а) задачу «${task.title}»`, 'task')
    },
    [logActivity],
  )

  const moveTask = useCallback((id, status) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }, [])

  const toggleTask = useCallback(
    (id) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t)),
      )
      const task = tasks.find((t) => t.id === id)
      if (task && task.status !== 'done') {
        logActivity(task.assigned, `завершил(а) задачу «${task.title}»`, 'check')
      }
    },
    [tasks, logActivity],
  )

  const removeTask = useCallback((id) => setTasks((prev) => prev.filter((t) => t.id !== id)), [])

  const addEvent = useCallback(
    (event) => {
      const created = {
        id: makeId(),
        ...event,
        color: COLOR_BY_OWNER[event.participants] ?? 'green',
      }
      setEvents((prev) => [...prev, created])
      logActivity(event.participants, `добавил(а) событие «${event.title}»`, 'calendar')
    },
    [logActivity],
  )

  const addWish = useCallback(
    (wish) => {
      const created = { id: makeId(), progress: 0, ...wish }
      setWishes((prev) => [created, ...prev])
      logActivity(wish.assigned, `создал(а) мечту «${wish.title}»`, 'star')
    },
    [logActivity],
  )

  const updateWishProgress = useCallback((id, progress) => {
    setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, progress } : w)))
  }, [])

  const stats = useMemo(() => {
    const today = todayISO()
    const [year, month] = today.split('-')
    const todayOpen = tasks.filter((t) => t.dueDate === today && t.status !== 'done')
    const monthEvents = events.filter((e) => e.date.startsWith(`${year}-${month}`))
    const sharedMonth = monthEvents.filter((e) => e.participants === 'both').length
    const avgProgress = wishes.length
      ? Math.round(wishes.reduce((sum, w) => sum + w.progress, 0) / wishes.length)
      : 0
    const years = Math.floor(daysTogether / 365)
    const months = Math.round((daysTogether % 365) / 30.437)
    return {
      todayTasks: todayOpen.length,
      todayShared: todayOpen.filter((t) => t.assigned === 'both').length,
      monthEvents: monthEvents.length,
      monthShared: sharedMonth,
      goals: wishes.length,
      avgProgress,
      daysTogether,
      togetherCaption: `${years} ${plural(years, ['год', 'года', 'лет'])} ${months} ${plural(months, ['месяц', 'месяца', 'месяцев'])}`,
    }
  }, [tasks, events, wishes])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      page,
      setPage,
      users,
      tasks,
      addTask,
      moveTask,
      toggleTask,
      removeTask,
      events,
      addEvent,
      wishes,
      addWish,
      updateWishProgress,
      activities,
      anniversaries,
      stats,
      modal,
      openModal: setModal,
      closeModal: () => setModal(null),
    }),
    [
      theme, toggleTheme, page, tasks, addTask, moveTask, toggleTask, removeTask,
      events, addEvent, wishes, addWish, updateWishProgress, activities, stats, modal,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp должен вызываться внутри <AppProvider>')
  return ctx
}
