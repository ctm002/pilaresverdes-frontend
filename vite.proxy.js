// vite.proxy.js
const target = 'http://localhost:9090';

export default {
  '/api': {
    target,
    changeOrigin: true,
    secure: false
  },
};
