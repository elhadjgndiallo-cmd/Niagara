import { api } from './axiosInstance.js'

/**
 * @param {object} body — items?, shippingMethod, couponCode, guestEmail?
 */
export async function quoteOrder(body) {
  const { data } = await api.post('/orders/quote', body)
  return data.data
}

/**
 * @param {object} body — conforme au contrôle backend createOrder
 */
export async function createOrder(body) {
  const { data } = await api.post('/orders', body)
  return data.data
}

export async function fetchOrder(id, guestEmail) {
  const { data } = await api.get(`/orders/${id}`, {
    params: guestEmail ? { guestEmail } : undefined,
  })
  return data.data
}

/**
 * @param {{ page?: number, limit?: number }} [opts]
 */
export async function fetchMyOrders(opts = {}) {
  const { page = 1, limit = 20 } = opts
  const { data } = await api.get('/orders/my-orders', { params: { page, limit } })
  return {
    orders: data.data || [],
    pagination: data.pagination || null,
  }
}

/**
 * Annulation client (invité : passer guestEmail pour l’accès).
 */
export async function cancelOrder(orderId, guestEmail) {
  const { data } = await api.post(
    `/orders/${orderId}/cancel`,
    guestEmail ? { guestEmail } : {},
  )
  return data.data
}
