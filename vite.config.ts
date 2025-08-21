import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/messenger': {
        target: 'http://localhost:3209',
        changeOrigin: true,
        secure: false,
        ws: true // Поддержка WebSockets
      }
    }
  }
})
