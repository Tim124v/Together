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
  update: (id, payload) => client.put(`/couples/${id}`, payload).then((r) => r.data),
}
