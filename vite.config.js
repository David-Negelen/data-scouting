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
      '/api/sofascore': {
        target: 'https://api.sofascore.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/sofascore/, '/api/v1'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': 'https://www.sofascore.com/',
          'Origin': 'https://www.sofascore.com',
        },
      },
    },
  },
})
