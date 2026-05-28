import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main:   resolve(__dirname, 'index.html'),
        login:  resolve(__dirname, 'login.html'),
        admin:  resolve(__dirname, 'admin.html'),
        orders: resolve(__dirname, 'orders.html'),
      },
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://furniture-qr98.onrender.com',
        changeOrigin: true,
      },
    },
  },
});
