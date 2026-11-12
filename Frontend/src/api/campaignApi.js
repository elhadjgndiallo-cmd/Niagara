import { api } from './axiosInstance.js'

export async function fetchCampaigns(params = {}) {
  const { data } = await api.get('/campaigns', { params })
  return { campaigns: data.data || [], pagination: data.pagination || null }
}

export async function createCampaign(body) {
  const { data } = await api.post('/campaigns', body)
  return data.data
}

export async function updateCampaign(id, body) {
  const { data } = await api.put(`/campaigns/${encodeURIComponent(id)}`, body)
  return data.data
}

export async function deleteCampaign(id) {
  await api.delete(`/campaigns/${encodeURIComponent(id)}`)
}
