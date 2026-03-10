import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Fallback SPA: ruta /erroruser (debe coincidir con routes.errorUser en src/config.js)
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/erroruser') && !req.url.includes('.')) {
            req.url = '/'
          }
          next()
        })
      },
    },
  ],
  server: {
    port: 5176,
    strictPort: false,
  },
})
