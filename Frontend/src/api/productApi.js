import { api } from './axiosInstance.js'

export async function fetchFeatured() {
  const { data } = await api.get('/products/featured')
  return data.data
}

export async function fetchNewArrivals() {
  const { data } = await api.get('/products/new-arrivals')
  return data.data
}

export async function fetchOnSale() {
  const { data } = await api.get('/products/on-sale')
  return data.data
}

export async function fetchFlashSale() {
  const { data } = await api.get('/products/flash-sale')
  return data.data
}

export async function fetchBestsellers() {
  const { data } = await api.get('/products/bestsellers')
  return data.data
}

export async function fetchProducts(params) {
  const { data } = await api.get('/products', { params })
  return data
}

export async function fetchCategoryProducts(slug, params) {
  const { data } = await api.get(`/categories/${slug}/products`, { params })
  return data
}

export async function fetchProductBySlug(slug) {
  const { data } = await api.get(`/products/${encodeURIComponent(slug)}`)
  return data.data
}

/** @param {string} id — identifiant MongoDB */
export async function fetchProductById(id) {
  const { data } = await api.get(`/products/${encodeURIComponent(id)}`)
  return data.data
}

export async function fetchRelated(slug) {
  const { data } = await api.get(`/products/${encodeURIComponent(slug)}/related`)
  return data.data
}

export async function searchProducts(params) {
  const { data } = await api.get('/search', { params })
  return data
}

export async function fetchSearchSuggestions(q) {
  const { data } = await api.get('/search/suggestions', { params: { q } })
  return data.data
}

/** @param {Record<string, unknown>} body */
export async function createProduct(body) {
  const { data } = await api.post('/products', body)
  return data.data
}

/** @param {string} id @param {Record<string, unknown>} body */
export async function updateProduct(id, body) {
  const { data } = await api.put(`/products/${encodeURIComponent(id)}`, body)
  return data.data
}

/** @param {string} id */
export async function removeProduct(id) {
  await api.delete(`/products/${encodeURIComponent(id)}`)
}

/** @param {string} id @param {string} sku @param {number} stock */
export async function patchProductVariantStock(id, sku, stock) {
  const { data } = await api.patch(`/products/${encodeURIComponent(id)}/stock`, {
    sku,
    stock: Number(stock),
  })
  return data.data
}

/** @param {string} id @param {{ isActive?: boolean, endDate?: string|null, salePrice?: number|null }} body */
export async function patchProductFlashSale(id, body) {
  const { data } = await api.patch(`/products/${encodeURIComponent(id)}/flash-sale`, body)
  return data.data
}

/** @param {string} id @param {object} body — coupon fields ou { clear: true } */
export async function patchProductCoupon(id, body) {
  const { data } = await api.patch(`/products/${encodeURIComponent(id)}/coupon`, body)
  return data.data
}
