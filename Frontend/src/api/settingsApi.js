import { api } from './axiosInstance.js'

export async function fetchShopSettings() {
  const { data } = await api.get('/settings')
  return data.data
}

export async function updateWhatsAppSettings(body) {
  const { data } = await api.put('/settings/whatsapp', body)
  return data.data
}

export async function updateShopSettings(body) {
  const { data } = await api.put('/settings', body)
  return data.data
}

export async function updateFlashSaleSettings(body) {
  const { data } = await api.put('/settings/flash-sale', body)
  return data.data
}

export async function updateShippingSettings(body) {
  const { data } = await api.put('/settings/shipping', body)
  return data.data
}
