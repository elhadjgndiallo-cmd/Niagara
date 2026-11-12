import { api } from './axiosInstance.js'

export async function fetchStockMovements(params = {}) {
  const { data } = await api.get('/stock', { params })
  return { movements: data.data || [], pagination: data.pagination || null }
}

export async function createStockMovement(body) {
  const { data } = await api.post('/stock', body)
  return data.data
}

export async function fetchLowStock(params = {}) {
  const { data } = await api.get('/stock/low', { params })
  return data.data || []
}
