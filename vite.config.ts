import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'

const rootDir = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://testfit.duckdns.org',
        changeOrigin: true,
        configure(proxy) {
          // 브라우저는 Vite와 통신하고, Vite가 배포 API에 서버 요청을 보낸다.
          proxy.on('proxyReq', (request) => request.removeHeader('origin'))
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src'),
    },
  },
})
