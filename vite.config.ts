import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // 백엔드가 localhost 출처를 CORS 허용할 때까지 개발 서버가 대신 중계합니다.
      // base URL이 이 경로면 회의 전사 WebSocket도 같은 프록시를 타므로 ws를 함께 켭니다.
      '/api': {
        target: 'https://api.synqai.co.kr',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
