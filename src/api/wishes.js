import client from './client'

export const wishesApi = {
  list: (coupleId) => client.get(`/couples/${coupleId}/wishes`).then((r) => r.data),
  create: (coupleId, payload) => client.post(`/couples/${coupleId}/wishes`, payload).then((r) => r.data),
  update: (wishId, payload) => client.put(`/wishes/${wishId}`, payload).then((r) => r.data),
  changeProgress: (wishId, progress) =>
    client.patch(`/wishes/${wishId}/progress`, { progress }).then((r) => r.data),
  remove: (wishId) => client.delete(`/wishes/${wishId}`).then((r) => r.data),
}

export const activitiesApi = {
  list: (coupleId) => client.get(`/couples/${coupleId}/activities`).then((r) => r.data),
}
