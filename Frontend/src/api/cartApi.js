import { api } from './axiosInstance.js'

/**
 * @param {string} code
 * @param {number} cartTotal — sous-total panier en euros (TTC lignes)
 */
export async function validateCartCoupon(code, cartTotal) {
  const { data } = await api.post('/cart/validate-coupon', {
    code: String(code).trim(),
    cartTotal: Number(cartTotal),
  })
  return data.data
}
