import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/personal-os/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
