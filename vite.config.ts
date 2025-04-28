import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import proxy from './vite.proxy.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:9090',
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
    proxy: proxy,
  },
})
