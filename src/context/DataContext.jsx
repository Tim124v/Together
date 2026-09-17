import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { budgetApi } from '../api/budget'
import { capsulesApi } from '../api/capsules'
import { eventsApi } from '../api/events'
import { activitiesApi, wishesApi } from '../api/wishes'
import { tasksApi } from '../api/tasks'
import { connectSocket, disconnectSocket } from '../services/socket'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)

const upsert = (list, item) => {
  if (!item?.id) return list
  const idx = list.findIndex((row) => row.id === item.id)
  if (idx === -1) return [item, ...list]
  const next = [...list]
  next[idx] = { ...next[idx], ...item }
  return next
}

export function DataProvider({ children }) {
  const { couple, user, setCouple, setUser, refreshSession } = useAuth()
  const [tasks, setTasks] = useState([])
  const [events, setEvents] = useState([])
  const [wishes, setWishes] = useState([])
  const [activities, setActivities] = useState([])
  const [capsules, setCapsules] = useState([])
  const [expenses, setExpenses] = useState([])
  const [budgetCategories, setBudgetCategories] = useState([])
  const [onlineIds, setOnlineIds] = useState([])
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    if (!couple?.id) return
    setLoading(true)
    try {
      const asList = (value) => (Array.isArray(value) ? value : value?.data || [])
      const settled = await Promise.allSettled([
        tasksApi.list(couple.id),
        eventsApi.list(couple.id),
        wishesApi.list(couple.id),
        activitiesApi.list(couple.id),
        capsulesApi.list(couple.id),
        budgetApi.expenses(couple.id),
        budgetApi.categories(couple.id),
      ])
      const valueOf = (index) => (settled[index].status === 'fulfilled' ? settled[index].value : [])
      setTasks(asList(valueOf(0)))
      setEvents(asList(valueOf(1)))
      setWishes(asList(valueOf(2)))
      setActivities(asList(valueOf(3)))
      setCapsules(asList(valueOf(4)))
      setExpenses(asList(valueOf(5)))
      setBudgetCategories(asList(valueOf(6)))
    } finally {
      setLoading(false)
    }
  }, [couple?.id])

  useEffect(() => {
    if (couple?.id) loadData()
    else {
      setTasks([])
      setEvents([])
      setWishes([])
      setActivities([])
      setCapsules([])
      setExpenses([])
      setBudgetCategories([])
    }
  }, [couple?.id, loadData])

  useEffect(() => {
    if (!couple?.id) {
      disconnectSocket()
      return undefined
    }
    const socket = connectSocket()
    if (!socket) return undefined
    if (user?.id) setOnlineIds((prev) => [...new Set([...prev, user.id])])

    const onTaskCreated = (task) => setTasks((prev) => upsert(prev, task))
    const onTaskUpdated = (task) => setTasks((prev) => upsert(prev, task))
    const onTaskDeleted = (payload) => {
      const id = payload?.taskId || payload
      setTasks((prev) => prev.filter((t) => t.id !== id))
    }
    const onEventCreated = (event) => setEvents((prev) => upsert(prev, event))
    const onEventUpdated = (event) => setEvents((prev) => upsert(prev, event))
    const onWishUpdated = (wish) => setWishes((prev) => upsert(prev, wish))
    const onWishCreated = (wish) => setWishes((prev) => upsert(prev, wish))
    const onWishDeleted = (payload) => {
      const id = payload?.wishId || payload
      setWishes((prev) => prev.filter((w) => w.id !== id))
    }
    const onActivity = (activity) => setActivities((prev) => upsert(prev, activity))
    const onCapsuleCreated = (capsule) => setCapsules((prev) => upsert(prev, capsule))
    const onCapsuleOpened = (capsule) => setCapsules((prev) => upsert(prev, capsule))
    const onCapsuleDeleted = (payload) => {
      const id = payload?.capsuleId || payload
      setCapsules((prev) => prev.filter((row) => row.id !== id))
    }
    const onExpenseCreated = (expense) => setExpenses((prev) => upsert(prev, expense))
    const onExpenseUpdated = (expense) => setExpenses((prev) => upsert(prev, expense))
    const onExpenseDeleted = (payload) => {
      const id = payload?.itemId || payload
      setExpenses((prev) => prev.filter((row) => row.id !== id))
    }
    const onPresence = ({ userId, status }) => {
      setOnlineIds((prev) => {
        const set = new Set(prev)
        if (status === 'online') set.add(userId)
        else set.delete(userId)
        return [...set]
      })
    }
    const onCoupleUpdated = (payload) => {
      const next = payload?.couple || payload
      if (next?.id) setCouple(next)
    }
    const onPartnerConnected = (payload) => {
      if (payload?.couple) setCouple(payload.couple)
      else refreshSession()
    }
    const onCodeRegen = (payload) => {
      if (payload?.couple) setCouple(payload.couple)
      else if (payload?.inviteCode || payload?.new_code) {
        const code = payload.inviteCode || payload.new_code
        setCouple((prev) => (prev ? { ...prev, inviteCode: code, code } : prev))
      }
    }
    const onPartnerLeft = () => {
      refreshSession()
    }
    const onLocaleChanged = (payload) => {
      if (!payload) return
      setUser((prev) => {
        if (!prev) return prev
        const next = { ...prev, currency: payload.currency || prev.currency }
        if (payload.userId === prev.id && payload.language) next.language = payload.language
        return next
      })
      if (payload.currency) {
        try {
          localStorage.setItem('together-currency', payload.currency)
        } catch {
          /* ignore */
        }
      }
    }

    socket.on('task:created', onTaskCreated)
    socket.on('task:updated', onTaskUpdated)
    socket.on('task:deleted', onTaskDeleted)
    socket.on('event:created', onEventCreated)
    socket.on('event:updated', onEventUpdated)
    socket.on('wish:created', onWishCreated)
    socket.on('wish:updated', onWishUpdated)
    socket.on('wish:deleted', onWishDeleted)
    socket.on('activity:new', onActivity)
    socket.on('user:online', onPresence)
    socket.on('capsule:created', onCapsuleCreated)
    socket.on('capsule:opened', onCapsuleOpened)
    socket.on('capsule:updated', onCapsuleCreated)
    socket.on('capsule:deleted', onCapsuleDeleted)
    socket.on('expense:created', onExpenseCreated)
    socket.on('expense:updated', onExpenseUpdated)
    socket.on('expense:deleted', onExpenseDeleted)
    socket.on('couple:updated', onCoupleUpdated)
    socket.on('couple:partner-connected', onPartnerConnected)
    socket.on('couple:code-regenerated', onCodeRegen)
    socket.on('couple:partner-disconnected', onPartnerLeft)
    socket.on('user:locale-changed', onLocaleChanged)

    return () => {
      socket.off('task:created', onTaskCreated)
      socket.off('task:updated', onTaskUpdated)
      socket.off('task:deleted', onTaskDeleted)
      socket.off('event:created', onEventCreated)
      socket.off('event:updated', onEventUpdated)
      socket.off('wish:created', onWishCreated)
      socket.off('wish:updated', onWishUpdated)
      socket.off('wish:deleted', onWishDeleted)
      socket.off('activity:new', onActivity)
      socket.off('user:online', onPresence)
      socket.off('capsule:created', onCapsuleCreated)
      socket.off('capsule:opened', onCapsuleOpened)
      socket.off('capsule:updated', onCapsuleCreated)
      socket.off('capsule:deleted', onCapsuleDeleted)
      socket.off('expense:created', onExpenseCreated)
      socket.off('expense:updated', onExpenseUpdated)
      socket.off('expense:deleted', onExpenseDeleted)
      socket.off('couple:updated', onCoupleUpdated)
      socket.off('couple:partner-connected', onPartnerConnected)
      socket.off('couple:code-regenerated', onCodeRegen)
      socket.off('couple:partner-disconnected', onPartnerLeft)
      socket.off('user:locale-changed', onLocaleChanged)
    }
  }, [couple?.id, user?.id, setCouple, setUser, refreshSession])

  const createTask = useCallback(
    async (title, assignedTo, dueDate, color) => {
      const body = typeof title === 'object' && title
        ? {
            title: title.title,
            assigned: title.assigned || title.assignedTo || 'both',
            dueDate: title.dueDate,
            color: title.color,
            description: title.note || title.description,
            status: title.status,
          }
        : { title, assigned: assignedTo, dueDate, color }
      const task = await tasksApi.create(couple.id, body)
      setTasks((prev) => upsert(prev, task))
      return task
    },
    [couple?.id],
  )

  const updateTask = useCallback(async (taskId, updates) => {
    const task = updates.status && Object.keys(updates).length === 1
      ? await tasksApi.changeStatus(taskId, updates.status)
      : await tasksApi.update(taskId, updates)
    setTasks((prev) => upsert(prev, task))
    return task
  }, [])

  const deleteTask = useCallback(async (taskId) => {
    await tasksApi.remove(taskId)
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }, [])

  const createEvent = useCallback(
    async (title, date, participants) => {
      const body = typeof title === 'object' && title
        ? {
            title: title.title,
            date: title.date || title.eventDate,
            time: title.time,
            place: title.place,
            participants: title.participants,
            color: title.color,
          }
        : { title, date, participants }
      const event = await eventsApi.create(couple.id, body)
      setEvents((prev) => upsert(prev, event))
      return event
    },
    [couple?.id],
  )

  const createWish = useCallback(
    async (payload) => {
      const wish = await wishesApi.create(couple.id, {
        title: payload.title,
        description: payload.description,
        category: payload.category,
        priority: payload.priority,
        assigned: payload.assigned || payload.assignedTo,
        dueDate: payload.dueDate || payload.targetDate,
        progress: payload.progress,
      })
      setWishes((prev) => upsert(prev, wish))
      return wish
    },
    [couple?.id],
  )

  const createCapsule = useCallback(
    async (payload) => {
      const capsule = await capsulesApi.create(couple.id, payload)
      setCapsules((prev) => upsert(prev, capsule))
      return capsule
    },
    [couple?.id],
  )

  const loadCapsule = useCallback(async (capsuleId) => {
    const capsule = await capsulesApi.get(capsuleId)
    setCapsules((prev) => upsert(prev, capsule))
    return capsule
  }, [])

  const openCapsule = useCallback(async (capsule) => {
    const id = capsule?.id || capsule
    const opened = await capsulesApi.open(id)
    setCapsules((prev) => upsert(prev, opened))
    return opened
  }, [])

  const deleteCapsule = useCallback(async (capsuleId) => {
    await capsulesApi.remove(capsuleId)
    setCapsules((prev) => prev.filter((row) => row.id !== capsuleId))
  }, [])

  const createExpense = useCallback(
    async (payload) => {
      const expense = await budgetApi.create(couple.id, payload)
      setExpenses((prev) => upsert(prev, expense))
      return expense
    },
    [couple?.id],
  )

  const settleExpense = useCallback(async (itemId) => {
    const expense = await budgetApi.settle(itemId)
    setExpenses((prev) => upsert(prev, expense))
    return expense
  }, [])

  const deleteExpense = useCallback(async (itemId) => {
    await budgetApi.remove(itemId)
    setExpenses((prev) => prev.filter((row) => row.id !== itemId))
  }, [])

  const updateWish = useCallback(async (wishId, updates) => {
    const wish = updates.progress !== undefined && Object.keys(updates).length === 1
      ? await wishesApi.changeProgress(wishId, updates.progress)
      : await wishesApi.update(wishId, updates)
    setWishes((prev) => upsert(prev, wish))
    return wish
  }, [])

  const deleteWish = useCallback(async (wishId) => {
    await wishesApi.remove(wishId)
    setWishes((prev) => prev.filter((w) => w.id !== wishId))
  }, [])

  const value = useMemo(
    () => ({
      tasks,
      events,
      wishes,
      activities,
      capsules,
      expenses,
      budgetCategories,
      onlineIds,
      loading,
      loadData,
      createTask,
      updateTask,
      deleteTask,
      createEvent,
      createWish,
      updateWish,
      deleteWish,
      createCapsule,
      loadCapsule,
      openCapsule,
      deleteCapsule,
      createExpense,
      settleExpense,
      deleteExpense,
    }),
    [
      tasks, events, wishes, activities, capsules, expenses, budgetCategories,
      onlineIds, loading, loadData,
      createTask, updateTask, deleteTask, createEvent, createWish, updateWish, deleteWish,
      createCapsule, loadCapsule, openCapsule, deleteCapsule,
      createExpense, settleExpense, deleteExpense,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData должен вызываться внутри <DataProvider>')
  return ctx
}
