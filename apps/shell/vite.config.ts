import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

const remote = (port: number) => `http://localhost:${port}/assets/remoteEntry.js`;

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        accounts: remote(3001),
        cards: remote(3002),
        utility: remote(3003),
        transfer: remote(3004),
        beneficiary: remote(3005),
      },
      shared: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
    }),
  ],
  server: { port: 3000, strictPort: true },
  preview: { port: 3000, strictPort: true },
  build: { target: 'esnext', modulePreload: false },
});
