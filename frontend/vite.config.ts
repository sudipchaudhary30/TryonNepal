import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    proxy: {
      // Auth routes → Node server (port 4000)
      '/api/auth': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/api/users': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Garment, tryon, design routes → Python FastAPI (port 8000)
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/uploads': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('framer-motion')) {
              return 'vendor-ui';
            }
            if (id.includes('@mediapipe') || id.includes('@tensorflow') || id.includes('three')) {
              return 'vendor-ar';
            }
            if (id.includes('fabric')) {
              return 'vendor-design';
            }
          }
          return undefined;
        },
      },
    },
  },
});
