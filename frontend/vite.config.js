import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Allowed hosts for development and preview
const allowedHosts = [
  'localhost',
  '.preview.emergentagent.com', // Wildcard for all preview subdomains
];

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.preview.emergentagent.com',
      'eka-garage.preview.emergentagent.com',
    ],
    proxy: {
      '/api/v1': {
        target: 'http://localhost:5000',
    host: true, // Listen on all network interfaces
    allowedHosts,
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
    allowedHosts,
  },
});
