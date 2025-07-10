import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@mui/styled-engine': path.resolve(__dirname, 'node_modules/@mui/styled-engine-sc'),
    },
  },
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://localhost:5007', // Auth service
        changeOrigin: true,
        secure: false,
      },
      '/api/restaurant': {
        target: 'http://localhost:5008', // Restaurant service 
        changeOrigin: true,
        secure: false,
      },
      '/api/orders': {
        target: 'http://localhost:5001', // Order service
        changeOrigin: true,
        secure: false,
      },
      '/api/payment': {
        target: 'http://localhost:5010', // Payment service
        changeOrigin: true,
        secure: false,
      },
      '/api/delivery': {
        target: 'http://localhost:5011', // Delivery service
        changeOrigin: true,
        secure: false,
      },
      '/api/location': {
        target: 'http://localhost:5009', // Location service
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
