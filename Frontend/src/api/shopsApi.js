import { api } from './axiosInstance.js'

export async function fetchShops(params = {}) {
  const { data } = await api.get('/shops', { params })
  return data.data || []
}

export async function fetchNearbyShops({ lat, lng, maxKm = 100 }) {
  const { data } = await api.get('/shops/nearby', { params: { lat, lng, maxKm } })
  return data.data || []
}

export async function fetchDefaultShop() {
  const { data } = await api.get('/shops/default')
  return data.data || null
}
