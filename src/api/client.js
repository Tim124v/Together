import axios from 'axios'
import { storage } from '../services/storage'

const apiUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.REACT_APP_API_URL ||
  'http://localhost:5050/api'

const origin = apiUrl.replace(/\/api\/?$/, '')

export const API_URL = apiUrl
export const WS_URL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_SOCKET_URL || origin

const client = axios.create({
  baseURL: API_URL,
  timeout: 45000,
  maxBodyLength: 12 * 1024 * 1024,
  maxContentLength: 12 * 1024 * 1024,
})

const raw = axios.create({
  baseURL: API_URL,
  timeout: 15000,
})

let refreshPromise = null

async function refreshAccess() {
  const refreshToken = storage.getRefresh()
  if (!refreshToken) throw new Error('no-refresh')
  const { data } = await raw.post('/auth/refresh', { refreshToken })
  storage.setTokens(data.accessToken, data.refreshToken)
  return data.accessToken
}

client.interceptors.request.use((config) => {
  const token = storage.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    const status = err.response?.status
    const isAuthCall = original?.url?.includes('/auth/')

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true
      try {
        refreshPromise = refreshPromise || refreshAccess()
        const token = await refreshPromise
        refreshPromise = null
        original.headers.Authorization = `Bearer ${token}`
        return client(original)
      } catch {
        refreshPromise = null
        storage.clear()
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(err)
  },
)

export const apiError = (err, fallback = 'Не получилось выполнить запрос') =>
  err.response?.data?.error || err.message || fallback

export default client
