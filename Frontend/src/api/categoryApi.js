import { api } from './axiosInstance.js'

export async function fetchCategories() {
  const { data } = await api.get('/categories')
  return data.data
}

export async function fetchCategory(slug) {
  const { data } = await api.get(`/categories/${encodeURIComponent(slug)}`)
  return data.data
}
