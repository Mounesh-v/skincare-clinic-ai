import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const resolvedPort = Number(env.VITE_APP_PORT || env.PORT || 5174)
  const host = env.VITE_APP_HOST || env.HOST || '127.0.0.1'
  const mlServicePort = Number(env.ML_SERVICE_PORT || 8000)

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host,
      port: resolvedPort,
      strictPort: true,
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${mlServicePort}`,
          changeOrigin: true,
          timeout: 120_000,        // 120s — ViT loads slowly on first request
          proxyTimeout: 120_000,
        },
      },
    },
    preview: {
      host,
      port: resolvedPort,
      strictPort: true,
    },
  }
})

