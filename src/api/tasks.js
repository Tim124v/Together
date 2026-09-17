import client from './client'

export const tasksApi = {
  list: (coupleId) => client.get(`/couples/${coupleId}/tasks`).then((r) => r.data),
  create: (coupleId, payload) => client.post(`/couples/${coupleId}/tasks`, payload).then((r) => r.data),
  update: (taskId, payload) => client.put(`/tasks/${taskId}`, payload).then((r) => r.data),
  changeStatus: (taskId, status) => client.patch(`/tasks/${taskId}/status`, { status }).then((r) => r.data),
  remove: (taskId) => client.delete(`/tasks/${taskId}`).then((r) => r.data),
}
