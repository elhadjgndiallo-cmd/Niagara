import { api } from './axiosInstance.js'

export async function fetchSegments(params = {}) {
  const { data } = await api.get('/segments', { params })
  return { segments: data.data || [], pagination: data.pagination || null }
}

export async function createSegment(body) {
  const { data } = await api.post('/segments', body)
  return data.data
}

export async function updateSegment(id, body) {
  const { data } = await api.put(`/segments/${encodeURIComponent(id)}`, body)
  return data.data
}

export async function deleteSegment(id) {
  await api.delete(`/segments/${encodeURIComponent(id)}`)
}
