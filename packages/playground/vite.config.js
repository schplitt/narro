import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    // Enable top-level await support
    lib: false,
  },
  esbuild: {
    target: 'esnext',
  },
})
