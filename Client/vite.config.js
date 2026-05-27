import { defineConfig } from 'vite';

export default defineConfig({
  build: { outDir: 'build' },
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
