import { api } from './axiosInstance.js'

export async function fetchAnalyticsOverview(params = {}) {
  const { data } = await api.get('/analytics/overview', { params })
  return data.data || {}
}

export async function fetchAnalyticsSales(params = {}) {
  const { data } = await api.get('/analytics/sales', { params })
  return data.data || []
}

export async function fetchAnalyticsTopProducts(params = {}) {
  const { data } = await api.get('/analytics/top-products', { params })
  return data.data || []
}

export async function fetchAnalyticsLive() {
  const { data } = await api.get('/analytics/live')
  return data.data || {}
}
