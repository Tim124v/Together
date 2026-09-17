import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { COLOR_BY_OWNER, plural, todayISO } from '../utils/helpers'
import {
  anniversariesFromEvents,
  daysTogetherFrom,
  toFeedActivity,
  togetherCaption,
  usersFromCouple,
} from '../utils/mappers'
import { useAuth } from './AuthContext'
import { useData } from './DataContext'

const AppContext = createContext(null)

const PATH_TO_PAGE = {
  '/': 'dashboard',
  '/tasks': 'tasks',
  '/calendar': 'calendar',
  '/wishes': 'wishes',
  '/capsules': 'capsules',
  '/budget': 'budget',
}

const PAGE_TO_PATH = {
  dashboard: '/',
  tasks: '/tasks',
  calendar: '/calendar',
  wishes: '/wishes',
  capsules: '/capsules',
  budget: '/budget',
}

const themeFromEnv = () => {
  const forced = new URLSearchParams(window.location.search).get('theme')
  if (forced === 'light' || forced === 'dark') return forced
  const saved = localStorage.getItem('together-theme')
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function AppProvider({ children }) {
  const { couple } = useAuth()
  const data = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const [theme, setTheme] = useState(themeFromEnv)
  const [modal, setModal] = useState(null)

  const page = PATH_TO_PAGE[location.pathname] || 'dashboard'
  const setPage = useCallback((id) => navigate(PAGE_TO_PATH[id] || '/'), [navigate])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('together-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const users = useMemo(() => usersFromCouple(couple), [couple])
  const activities = useMemo(
    () => data.activities.map((row) => toFeedActivity(row, couple)),
    [data.activities, couple],
  )
  const anniversaries = useMemo(() => anniversariesFromEvents(data.events), [data.events])

  const stats = useMemo(() => {
    const today = todayISO()
    const [year, month] = today.split('-')
    const tasks = data.tasks
    const events = data.events
    const wishes = data.wishes
    const todayOpen = tasks.filter((t) => t.dueDate === today && t.status !== 'done')
    const monthEvents = events.filter((e) => (e.date || '').startsWith(`${year}-${month}`))
    const daysTogether = daysTogetherFrom(couple?.startDate)
    const years = Math.floor(daysTogether / 365)
    const months = Math.round((daysTogether % 365) / 30.437)
    const avgProgress = wishes.length
      ? Math.round(wishes.reduce((sum, w) => sum + w.progress, 0) / wishes.length)
      : 0
    return {
      todayTasks: todayOpen.length,
      todayShared: todayOpen.filter((t) => t.assigned === 'both').length,
      monthEvents: monthEvents.length,
      monthShared: monthEvents.filter((e) => e.participants === 'both').length,
      goals: wishes.length,
      avgProgress,
      daysTogether,
      togetherCaption: togetherCaption(daysTogether),
      years,
      months,
    }
  }, [data.tasks, data.events, data.wishes, couple?.startDate])

  const addTask = useCallback(async (task) => {
    await data.createTask({ ...task, color: task.color || COLOR_BY_OWNER[task.assigned] })
  }, [data])

  const moveTask = useCallback(async (id, status) => {
    await data.updateTask(id, { status })
  }, [data])

  const toggleTask = useCallback(async (id) => {
    const task = data.tasks.find((t) => t.id === id)
    if (!task) return
    await data.updateTask(id, { status: task.status === 'done' ? 'todo' : 'done' })
  }, [data])

  const removeTask = useCallback(async (id) => {
    await data.deleteTask(id)
  }, [data])

  const addEvent = useCallback(async (event) => {
    await data.createEvent(event)
  }, [data])

  const addWish = useCallback(async (wish) => {
    await data.createWish(wish)
  }, [data])

  const updateWishProgress = useCallback(async (id, progress) => {
    await data.updateWish(id, { progress })
  }, [data])

  const removeWish = useCallback(async (id) => {
    await data.deleteWish(id)
  }, [data])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      page,
      setPage,
      users,
      tasks: data.tasks,
      addTask,
      moveTask,
      toggleTask,
      removeTask,
      events: data.events,
      addEvent,
      wishes: data.wishes,
      addWish,
      updateWishProgress,
      removeWish,
      activities,
      anniversaries,
      stats,
      modal,
      openModal: setModal,
      closeModal: () => setModal(null),
      capsules: data.capsules,
      expenses: data.expenses,
      onlineIds: data.onlineIds,
      loading: data.loading,
      loadData: data.loadData,
    }),
    [
      theme, toggleTheme, page, setPage, users, data.tasks, data.events, data.wishes,
      data.capsules, data.expenses, data.onlineIds, data.loading, data.loadData,
      addTask, moveTask, toggleTask, removeTask,
      addEvent, addWish, updateWishProgress, removeWish, activities, anniversaries, stats, modal,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp должен вызываться внутри <AppProvider>')
  return ctx
}
