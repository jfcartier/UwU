import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createProxyMiddleware } from 'http-proxy-middleware';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    hmr: {
      host: 'localhost',
      port: 5173,
    },
    middleware: [
      (app) => {
        app.use(
          '/proxy/jikan',
          createProxyMiddleware({
            target: 'https://api.jikan.moe/v4',
            changeOrigin: true,
            pathRewrite: {
              '^/proxy/jikan': '',
            },
            onProxyReq: (proxyReq, req) => {
              console.log(`[Proxy Request] ${req.method} ${req.url}`);
            },
            onProxyRes: (proxyRes, req, res) => {
              console.log(`[Proxy Response] ${req.method} ${req.url} - ${proxyRes.statusCode}`);
            },
          })
        );
      },
    ],
  },
});
