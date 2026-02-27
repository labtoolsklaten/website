import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// MODE: 'production' = deploy ke domain sendiri (base: '/')
//       'local'      = localhost/katalog/dist/ (base: '/katalog/dist/')
const isProduction = process.env.DEPLOY_TARGET === 'production';

export default defineConfig({
  plugins: [react()],
  base: isProduction ? '/' : '/katalog/dist/',
  server: {
    proxy: {
      '/katalog/dist/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
      }
    }
  }
})
