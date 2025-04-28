import { defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import createProxy from './vite.proxy.js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) =>  {
  const env = loadEnv(mode, process.cwd());
  
  process.env = { ...process.env, ...env}; 
  console.log('Proxy target:', process.env.VITE_PROXY_TARGET);

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // proxy: {
      //   '/api': {
      //     target: 'http://backend-api:9090',
      //     // target: 'http://localhost:9090',
      //     changeOrigin: true,
      //     secure: false,
      //   },
      // },
      proxy: createProxy(process.env.VITE_PROXY_TARGET),
    },
  };

})
