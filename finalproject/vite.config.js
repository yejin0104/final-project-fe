import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      '/chat': {
        target: 'http://192.168.20.16:8080',
        changeOrigin: true,
        secure: false,
      },
      '/giftcard': {
        target: 'http://192.168.20.16:8080',  // ← 백엔드 주소
        changeOrigin: true,
        secure: false,
      }
    }
  },

  plugins: [react()],

  define: {
    global: "window",
  }
})