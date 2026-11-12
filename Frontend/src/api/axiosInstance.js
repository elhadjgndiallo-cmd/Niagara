import axios from 'axios'

const TOKEN_KEY = 'niagara_token'

/** En production sans proxy : définir VITE_API_BASE_URL (ex. http://localhost:5000/api/v1) avant le build. */
const baseURL = import.meta.env.VITE_API_BASE_URL?.trim() || '/api/v1'

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const t = localStorage.getItem(TOKEN_KEY)
  if (t) config.headers.Authorization = `Bearer ${t}`
  return config
})

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}
