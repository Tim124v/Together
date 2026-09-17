import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, coupleApi } from '../api/auth'
import { apiError } from '../api/client'
import { disconnectSocket } from '../services/socket'
import { storage } from '../services/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [couple, setCouple] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)

  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [])

  const applySession = (data) => {
    if (data.accessToken) storage.setTokens(data.accessToken, data.refreshToken)
    if (data.user) setUser(data.user)
    if (data.couple !== undefined) setCouple(data.couple)
    return data
  }

  useEffect(() => {
    const boot = async () => {
      if (!storage.getAccess()) {
        setLoading(false)
        setReady(true)
        return
      }
      try {
        const data = await authApi.me()
        setUser(data.user)
        setCouple(data.couple)
      } catch {
        storage.clear()
        setUser(null)
        setCouple(null)
      } finally {
        setLoading(false)
        setReady(true)
      }
    }
    boot()
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      return applySession(await authApi.login(email, password))
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async ({ name, email, password, avatarColor, language, currency, country }) => {
    setLoading(true)
    try {
      return applySession(await authApi.register({ name, email, password, avatarColor, language, currency, country }))
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    const data = await authApi.me()
    setUser(data.user)
    setCouple(data.couple)
    return data
  }, [])

  const createCouple = useCallback(async (payload) => {
    const created = await coupleApi.create(payload)
    setCouple(created)
    return created
  }, [])

  const joinCouple = useCallback(async (inviteCode) => {
    const joined = await coupleApi.join(inviteCode)
    setCouple(joined)
    return joined
  }, [])

  const updateCouple = useCallback(async (payload) => {
    if (!couple?.id) return null
    const updated = await coupleApi.update(couple.id, payload)
    setCouple(updated)
    return updated
  }, [couple?.id])

  const regenerateInviteCode = useCallback(async () => {
    if (!couple?.id) return null
    const data = await coupleApi.regenerateCode(couple.id)
    if (data.couple) setCouple(data.couple)
    else setCouple((prev) => (prev ? { ...prev, inviteCode: data.inviteCode, code: data.inviteCode } : prev))
    return data
  }, [couple?.id])

  const leaveCouple = useCallback(async () => {
    if (!couple?.id) return null
    const result = await coupleApi.leave(couple.id)
    setCouple(null)
    return result
  }, [couple?.id])

  const logout = useCallback(() => {
    disconnectSocket()
    storage.clear()
    setUser(null)
    setCouple(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      couple,
      loading,
      ready,
      isAuthed: Boolean(storage.getAccess() && user),
      login,
      register,
      logout,
      refreshToken: refreshSession,
      refreshSession,
      createCouple,
      joinCouple,
      updateCouple,
      regenerateInviteCode,
      leaveCouple,
      setCouple,
      setUser,
      updateUser,
      errorMessage: apiError,
    }),
    [user, couple, loading, ready, login, register, logout, refreshSession, createCouple, joinCouple, updateCouple, regenerateInviteCode, leaveCouple, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен вызываться внутри <AuthProvider>')
  return ctx
}
