import { defineConfig, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

const remote = (port: number) => `http://localhost:${port}/assets/remoteEntry.js`;

const themeProxy: Record<string, ProxyOptions> = {
  '/backoffice-service': {
    target: 'http://34.18.92.50:8443',
    changeOrigin: true,
    secure: false,
    timeout: 20000,
    proxyTimeout: 20000,
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('Origin', 'http://34.18.92.50');
        proxyReq.setHeader('Referer', 'http://34.18.92.50/');
        proxyReq.setHeader('product', 'dkb_retail');
        proxyReq.setHeader('charset', 'utf-8');
        proxyReq.setHeader('Accept-Language', 'en-GB,en-US;q=0.9,en;q=0.8');
      });
    },
  },
};

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
  server: { port: 3000, strictPort: true, proxy: themeProxy },
  preview: { port: 3000, strictPort: true, proxy: themeProxy },
  build: { target: 'esnext', modulePreload: false },
});
