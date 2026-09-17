import client from './client'

export const capsulesApi = {
  list: (coupleId) => client.get(`/couples/${coupleId}/capsules`).then((r) => r.data),
  create: (coupleId, payload) =>
    client.post(`/couples/${coupleId}/capsules`, payload, { timeout: 45000 }).then((r) => r.data),
  get: (capsuleId) => client.get(`/capsules/${capsuleId}`).then((r) => r.data),
  update: (capsuleId, payload) => client.put(`/capsules/${capsuleId}`, payload).then((r) => r.data),
  open: (capsuleId) => client.post(`/capsules/${capsuleId}/open`).then((r) => r.data),
  remove: (capsuleId) => client.delete(`/capsules/${capsuleId}`).then((r) => r.data),
}
