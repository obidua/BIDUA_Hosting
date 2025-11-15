import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 7777,
    strictPort: true,
    host: true,
    hmr: {
      overlay: true,
      clientPort: 7777,
    },
    watch: {
      usePolling: true,
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  cacheDir: '.vite',
  build: {
    sourcemap: true,
    emptyOutDir: true,
  },
  clearScreen: false,
});
