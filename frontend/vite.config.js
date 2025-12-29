import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Listen on all network interfaces
    allowedHosts: [
      'eka-garage.preview.emergentagent.com',
      'localhost',
      '.preview.emergentagent.com', // Wildcard for all preview subdomains
    ],
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 3000,
    host: true,
    allowedHosts: [
      'eka-garage.preview.emergentagent.com',
      '.preview.emergentagent.com',
    ],
  },
});
