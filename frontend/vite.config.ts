import react from '@vitejs/plugin-react'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default {
  plugins: [
    react()
  ],
  build: {
    rollupOptions: {
      external: ['node:fs', 'node:path', 'node:os', 'node:crypto', 'os', 'crypto', 'fs', 'path'],
    },
  },
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  }
}
