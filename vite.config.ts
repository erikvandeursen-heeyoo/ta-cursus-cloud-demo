import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  server: {
    hmr: {
        host: 'localhost',
    },
  }
})