import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'src',
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'es2020',
    outDir: '../dist',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['@stacks/connect', '@stacks/transactions', 'leaflet']
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
