import client from './client'

export const eventsApi = {
  list: (coupleId, params) => client.get(`/couples/${coupleId}/events`, { params }).then((r) => r.data),
  create: (coupleId, payload) => client.post(`/couples/${coupleId}/events`, payload).then((r) => r.data),
  update: (eventId, payload) => client.put(`/events/${eventId}`, payload).then((r) => r.data),
  remove: (eventId) => client.delete(`/events/${eventId}`).then((r) => r.data),
}
