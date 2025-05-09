import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    host: true,
    watch: {
      usePolling: true, // important dans Docker
    },
  },
  plugins: [
    react(),
    tailwindcss()
  ]
})

/*
// Configuration simplifiée sans référence directe au plugin Tailwind
export default defineConfig(async () => {
  // Importer dynamiquement tailwindcss pour gérer le module ESM
  const tailwindcss = await import('@tailwindcss/vite').then(m => m.default);

  return {
    plugins: [
      react(),
      tailwindcss(), // Utilisation du plugin importé dynamiquement
      // Ajouter un plugin personnalisé pour la configuration du serveur proxy
      {
        name: 'configure-proxy',
        configureServer(server) {
          server.middlewares.use(
            '/proxy/jikan',
            createProxyMiddleware({
              target: 'https://api.jikan.moe/v4',
              changeOrigin: true,
              pathRewrite: {
                '^/proxy/jikan': '',
              },
              // Utiliser les propriétés listeners pour la compatibilité des types
              listeners: {
                proxyReq: (proxyReq, req) => {
                  console.log(`[Proxy Request] ${req.method} ${req.url}`);
                },
                proxyRes: (proxyRes, req) => {
                  console.log(`[Proxy Response] ${req.method} ${req.url} - ${proxyRes.statusCode}`);
                }
              }
            })
          );
        }
      } as Plugin
    ],
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
    }
  };
});
*/
