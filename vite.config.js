import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/katalog/dist/',
  server: {
    proxy: {
      // Teruskan semua request /katalog/dist/api ke Apache (PHP)
      '/katalog/dist/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
      }
    }
  }
})
