import { api } from './axiosInstance.js'

export async function fetchAdminStats(params = {}) {
  const { data } = await api.get('/admin/stats', { params })
  return data.data
}

export async function fetchAdminOrders(params = {}) {
  const { page = 1, limit = 24, status, shopId } = params
  const { data } = await api.get('/orders', {
    params: { page, limit, ...(status ? { status } : {}), ...(shopId ? { shopId } : {}) },
  })
  return {
    orders: data.data || [],
    pagination: data.pagination || null,
  }
}

export async function fetchAdminUsers(params = {}) {
  const { page = 1, limit = 24 } = params
  const { data } = await api.get('/users', { params: { page, limit } })
  return {
    users: data.data || [],
    pagination: data.pagination || null,
  }
}

/** @param {Record<string, string|number|undefined>} [params] — q, isActive, category, page, limit */
export async function fetchAdminProducts(params = {}) {
  const { data } = await api.get('/admin/products', { params })
  return {
    products: data.data || [],
    pagination: data.pagination || null,
  }
}

/** @param {string} id — MongoDB id */
export async function fetchAdminProduct(id) {
  const { data } = await api.get(`/admin/products/${encodeURIComponent(id)}`)
  return data.data
}

export async function fetchAdminShops() {
  const { data } = await api.get('/shops/admin/all')
  return data.data || []
}

export async function createAdminShop(body) {
  const { data } = await api.post('/shops', body)
  return data.data
}

export async function updateAdminShop(id, body) {
  const { data } = await api.put(`/shops/${encodeURIComponent(id)}`, body)
  return data.data
}

export async function disableAdminShop(id) {
  const { data } = await api.delete(`/shops/${encodeURIComponent(id)}`)
  return data.data
}

export async function fetchAdminShopById(idOrSlug) {
  const { data } = await api.get(`/shops/${encodeURIComponent(idOrSlug)}`)
  return data.data
}

export async function updateAdminShopWhatsApp(id, body) {
  const { data } = await api.patch(`/shops/${encodeURIComponent(id)}/whatsapp`, body)
  return data.data
}

export async function fetchAdminShopStats(id) {
  const { data } = await api.get(`/shops/${encodeURIComponent(id)}/stats`)
  return data.data
}
