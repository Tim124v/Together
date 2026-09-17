import client from './client'

export const authApi = {
  login: (email, password) => client.post('/auth/login', { email, password }).then((r) => r.data),
  register: (payload) => client.post('/auth/register', payload).then((r) => r.data),
  refresh: (refreshToken) => client.post('/auth/refresh', { refreshToken }).then((r) => r.data),
  me: () => client.get('/auth/me').then((r) => r.data),
}

export const coupleApi = {
  current: () => client.get('/couples/current').then((r) => r.data),
  create: (payload) => client.post('/couples', payload).then((r) => r.data),
  join: (inviteCode) => client.post('/couples/join', { inviteCode }).then((r) => r.data),
  get: (id) => client.get(`/couples/${id}`).then((r) => r.data),
  update: (id, payload) => client.put(`/couples/${id}`, payload).then((r) => r.data),
  inviteCode: (id) => client.get(`/couples/${id}/invite-code`).then((r) => r.data),
  regenerateCode: (id) => client.post(`/couples/${id}/regenerate-code`).then((r) => r.data),
  partnerInfo: (id) => client.get(`/couples/${id}/partner-info`).then((r) => r.data),
  leave: (id) => client.post(`/couples/${id}/leave`).then((r) => r.data),
}
