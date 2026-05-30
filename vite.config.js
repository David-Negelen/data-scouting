import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    proxy: {
      '/api/transfermarkt': {
        target: 'https://transfermarkt-api.fly.dev',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/transfermarkt/, ''),
      },
      '/api/football-data': {
        target: 'https://api.football-data.org/v4',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/football-data/, ''),
      },
    },
  },
})
