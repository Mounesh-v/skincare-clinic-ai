import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const resolvedPort = Number(env.VITE_APP_PORT || env.PORT || 5174)
  const host = env.VITE_APP_HOST || env.HOST || '127.0.0.1'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host,
      port: resolvedPort,
      strictPort: true,
    },
    preview: {
      host,
      port: resolvedPort,
      strictPort: true,
    },
  }
})
