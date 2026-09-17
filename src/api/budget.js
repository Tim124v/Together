import client from './client'

export const budgetApi = {
  expenses: (coupleId, month) =>
    client.get(`/couples/${coupleId}/budget/expenses`, { params: month ? { month } : {} }).then((r) => r.data),
  create: (coupleId, payload) =>
    client.post(`/couples/${coupleId}/budget/expenses`, payload).then((r) => r.data),
  summary: (coupleId, month) =>
    client.get(`/couples/${coupleId}/budget/summary`, { params: month ? { month } : {} }).then((r) => r.data),
  balance: (coupleId, month) =>
    client.get(`/couples/${coupleId}/budget/balance`, { params: month ? { month } : {} }).then((r) => r.data),
  categories: (coupleId) =>
    client.get(`/couples/${coupleId}/budget/categories`).then((r) => r.data),
  update: (itemId, payload) => client.put(`/budget-items/${itemId}`, payload).then((r) => r.data),
  settle: (itemId) => client.post(`/budget-items/${itemId}/settle`).then((r) => r.data),
  remove: (itemId) => client.delete(`/budget-items/${itemId}`).then((r) => r.data),
}
