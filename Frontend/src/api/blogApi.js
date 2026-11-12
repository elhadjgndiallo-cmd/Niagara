import { api } from './axiosInstance.js'

export async function fetchBlogPosts(params = {}) {
  const { data } = await api.get('/blog', { params })
  return { posts: data.data || [], pagination: data.pagination || null }
}

export async function fetchBlogPost(id) {
  const { data } = await api.get(`/blog/${encodeURIComponent(id)}`)
  return data.data
}

export async function createBlogPost(body) {
  const { data } = await api.post('/blog', body)
  return data.data
}

export async function updateBlogPost(id, body) {
  const { data } = await api.put(`/blog/${encodeURIComponent(id)}`, body)
  return data.data
}

export async function deleteBlogPost(id) {
  await api.delete(`/blog/${encodeURIComponent(id)}`)
}
