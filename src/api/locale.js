import client from './client'

export const localeApi = {
  get: () => client.get('/users/locale').then((r) => r.data),
  update: (payload) => client.put('/users/locale', payload).then((r) => r.data),
  geo: () => client.get('/geolocation').then((r) => r.data),
  rates: () => client.get('/currencies/rates').then((r) => r.data),
}
