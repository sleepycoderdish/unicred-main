// vite.config.js
// Configures the Vite bundler for Unicred frontend:
//  - "@" alias maps to src/ so imports look like @/components/... instead of ../../components/...
//  - "/api" proxy rewrites requests to the backend at localhost:5001
//    This avoids CORS issues in development — the browser thinks it's talking to itself.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // "@" resolves to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3000, // Dev server runs on http://localhost:3000
    proxy: {
      // Any request starting with /api is forwarded to the backend
      // e.g. fetch('/api/auth/login') → http://localhost:5001/api/auth/login
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true, // Changes the Host header to match the target
        secure: false,      // Allow self-signed certs in dev
      },
    },
  },
})
