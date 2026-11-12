import { api } from './axiosInstance.js'

export async function fetchGiftCards(params = {}) {
  const { data } = await api.get('/gift-cards', { params })
  return { giftCards: data.data || [], pagination: data.pagination || null }
}

export async function createGiftCard(body) {
  const { data } = await api.post('/gift-cards', body)
  return data.data
}

export async function redeemGiftCard(code) {
  const { data } = await api.post('/gift-cards/redeem', { code })
  return data.data
}
