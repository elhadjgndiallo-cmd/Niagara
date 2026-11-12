import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiProxy = {
  '/api': {
    target: process.env.VITE_PROXY_API || 'http://localhost:5000',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: apiProxy,
  },
  preview: {
    port: 4173,
    proxy: apiProxy,
  },
})
