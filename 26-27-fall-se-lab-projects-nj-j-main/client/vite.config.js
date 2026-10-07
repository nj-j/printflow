import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Bind to all interfaces for Static IP / LAN access
    port: 5174,
    strictPort: false, // Automatically fallback to the next available port if taken
  },
  preview: {
    host: '0.0.0.0', // Bind production preview for Static IP / LAN access
    port: 5174,
    strictPort: false,
  }
})
