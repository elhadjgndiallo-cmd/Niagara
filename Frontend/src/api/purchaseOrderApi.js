import { api } from './axiosInstance.js'

export async function fetchPurchaseOrders(params = {}) {
  const { data } = await api.get('/purchase-orders', { params })
  return { orders: data.data || [], pagination: data.pagination || null }
}

export async function createPurchaseOrder(body) {
  const { data } = await api.post('/purchase-orders', body)
  return data.data
}

export async function updatePurchaseOrder(id, body) {
  const { data } = await api.put(`/purchase-orders/${encodeURIComponent(id)}`, body)
  return data.data
}
