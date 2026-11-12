import { api, setStoredToken } from './axiosInstance.js'

export async function loginRequest(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  if (data.success && data.data?.accessToken) {
    setStoredToken(data.data.accessToken)
  }
  return data
}

export async function registerRequest(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export async function logoutRequest() {
  const { data } = await api.post('/auth/logout')
  setStoredToken(null)
  return data
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me')
  return data.data
}
