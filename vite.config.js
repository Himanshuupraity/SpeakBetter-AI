import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // expose on your local network so you can open it on your phone
    proxy: {
      // When VITE_AI_PROVIDER=api, the frontend calls /api/*; this forwards to the local backend (server/index.js).
      '/api': 'http://localhost:8787',
    },
  },
});
