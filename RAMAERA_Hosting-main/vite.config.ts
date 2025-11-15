import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4333,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 4333,
    },
    watch: {
      usePolling: true, // Better file watching
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Disable caching during development
  cacheDir: '.vite',
  build: {
    sourcemap: true,
  },
});
