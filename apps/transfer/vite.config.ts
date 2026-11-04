import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

const PORT = 3004;

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'transfer',
      filename: 'remoteEntry.js',
      exposes: { './App': './src/App.tsx' },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  server: { port: PORT, strictPort: true },
  preview: { port: PORT, strictPort: true },
  build: { target: 'esnext', modulePreload: false },
});
