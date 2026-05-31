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
      '/api/fotmob': {
        target: 'https://www.fotmob.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/fotmob/, '/api'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.fotmob.com/',
        },
      },
      '/fotmob-page': {
        target: 'https://www.fotmob.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/fotmob-page/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/json,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
    },
  },
})
