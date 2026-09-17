import { io } from 'socket.io-client'
import { storage } from './storage'
import { WS_URL } from '../api/client'

let socket = null

export function connectSocket() {
  const token = storage.getAccess()
  if (!token) return null
  if (socket?.connected) return socket

  socket?.disconnect()
  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  })
  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
