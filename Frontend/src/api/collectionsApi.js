import { api } from './axiosInstance.js'

export async function fetchCollections(params = {}) {
  const { data } = await api.get('/collections', { params })
  return { collections: data.data || [], pagination: data.pagination || null }
}

export async function fetchCollection(id) {
  const { data } = await api.get(`/collections/${encodeURIComponent(id)}`)
  return data.data
}

export async function createCollection(body) {
  const { data } = await api.post('/collections', body)
  return data.data
}

export async function updateCollection(id, body) {
  const { data } = await api.put(`/collections/${encodeURIComponent(id)}`, body)
  return data.data
}

export async function deleteCollection(id) {
  await api.delete(`/collections/${encodeURIComponent(id)}`)
}
