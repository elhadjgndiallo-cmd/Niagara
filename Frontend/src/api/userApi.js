import { api, getStoredToken } from './axiosInstance.js'

/**
 * Multipart via fetch pour ne pas forcer Content-Type JSON (axios).
 * @param {File} file
 */
export async function uploadAvatar(file) {
  const fd = new FormData()
  fd.append('avatar', file)
  const t = getStoredToken()
  const res = await fetch('/api/v1/users/me/avatar', {
    method: 'POST',
    body: fd,
    credentials: 'include',
    headers: t ? { Authorization: `Bearer ${t}` } : {},
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Erreur ${res.status}`)
  }
  return data.data
}

export async function updateProfile(body) {
  const { data } = await api.put('/users/me', body)
  return data.data
}

export async function updatePassword({ currentPassword, newPassword }) {
  const { data } = await api.put('/users/me/password', { currentPassword, newPassword })
  return data
}

export async function fetchAddresses() {
  const { data } = await api.get('/users/me/addresses')
  return data.data || []
}

export async function addAddress(body) {
  const { data } = await api.post('/users/me/addresses', body)
  return data.data || []
}

export async function updateAddress(addressId, body) {
  const { data } = await api.put(`/users/me/addresses/${encodeURIComponent(addressId)}`, body)
  return data.data || []
}

export async function deleteAddress(addressId) {
  const { data } = await api.delete(`/users/me/addresses/${encodeURIComponent(addressId)}`)
  return data.data || []
}

export async function fetchWishlistProducts() {
  const { data } = await api.get('/users/me/wishlist')
  return data.data || []
}

export async function addWishlistProduct(productId) {
  const { data } = await api.post(`/users/me/wishlist/${encodeURIComponent(productId)}`)
  return data.data
}

export async function removeWishlistProduct(productId) {
  const { data } = await api.delete(`/users/me/wishlist/${encodeURIComponent(productId)}`)
  return data.data
}
