import { Server } from 'socket.io'
import { isAllowedOrigin } from '../config/cors.js'
import { verifyAccess } from './authService.js'
import { findCoupleForUser } from './coupleService.js'
import { createTaskRecord, deleteTaskRecord, updateTaskRecord } from '../controllers/tasksController.js'
import { createEventRecord } from '../controllers/eventsController.js'
import { updateWishRecord } from '../controllers/wishesController.js'
import { createCapsuleRecord, deleteCapsuleRecord, openCapsuleRecord } from '../controllers/capsulesController.js'
import { createExpenseRecord, deleteExpenseRecord } from '../controllers/budgetController.js'

let io

export function emitToCouple(coupleId, event, payload) {
  io?.to(`couple:${coupleId}`).emit(event, payload)
}

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
      credentials: true,
    },
  })

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token
      if (!token) return next(new Error('Нужен JWT в handshake.auth.token'))
      socket.user = verifyAccess(token)
      next()
    } catch {
      next(new Error('Недействительный токен'))
    }
  })

  io.on('connection', async (socket) => {
    const couple = await findCoupleForUser(socket.user.id)
    if (couple) {
      socket.join(`couple:${couple.id}`)
      socket.coupleId = couple.id
      socket.to(`couple:${couple.id}`).emit('user:online', {
        userId: socket.user.id,
        status: 'online',
      })
    }

    const withCouple = async (handler) => {
      const current = couple || (await findCoupleForUser(socket.user.id))
      if (!current) {
        socket.emit('error', { message: 'Сначала создайте пару' })
        return
      }
      try {
        await handler(current)
      } catch (err) {
        socket.emit('error', { message: err.message })
      }
    }

    socket.on('task:create', (payload) =>
      withCouple((c) => createTaskRecord(c, socket.user.id, payload || {})),
    )
    socket.on('task:update', (payload) =>
      withCouple(() => updateTaskRecord(payload.taskId, socket.user.id, payload)),
    )
    socket.on('task:delete', (payload) =>
      withCouple(() => deleteTaskRecord(payload.taskId, socket.user.id)),
    )
    socket.on('event:create', (payload) =>
      withCouple((c) => createEventRecord(c, socket.user.id, payload || {})),
    )
    socket.on('wish:update', (payload) =>
      withCouple(() => updateWishRecord(payload.wishId, socket.user.id, payload)),
    )
    socket.on('capsule:create', (payload) =>
      withCouple((c) => createCapsuleRecord(c, socket.user.id, payload || {})),
    )
    socket.on('capsule:open', (payload) =>
      withCouple(() => openCapsuleRecord(payload.capsuleId, socket.user.id)),
    )
    socket.on('capsule:delete', (payload) =>
      withCouple(() => deleteCapsuleRecord(payload.capsuleId, socket.user.id)),
    )
    socket.on('expense:create', (payload) =>
      withCouple((c) => createExpenseRecord(c, socket.user.id, payload || {})),
    )
    socket.on('expense:delete', (payload) =>
      withCouple(() => deleteExpenseRecord(payload.itemId, socket.user.id)),
    )

    socket.on('disconnect', () => {
      if (socket.coupleId) {
        socket.to(`couple:${socket.coupleId}`).emit('user:online', {
          userId: socket.user.id,
          status: 'offline',
        })
      }
    })
  })

  return io
}
