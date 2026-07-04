import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        // Split large third-party libraries into their own chunks so each stays small
        // and is cached independently (changing app code no longer re-downloads vendors).
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // framer-motion ships its animation engine as separate packages (motion-dom, motion);
          // group them all so the 90 kB engine stays in this lazy chunk, not in eager `vendor`.
          if (
            id.includes('framer-motion') ||
            id.includes('/motion-dom/') ||
            /node_modules\/motion\//.test(id)
          ) {
            return 'framer-motion'
          }
          if (id.includes('@dnd-kit')) return 'dnd-kit'
          if (id.includes('@tanstack')) return 'tanstack'
          if (id.includes('react-router')) return 'router'
          if (
            id.includes('@reduxjs') ||
            id.includes('react-redux') ||
            id.includes('redux-persist') ||
            id.includes('immer')
          ) {
            return 'redux'
          }
          // Keep react, react-dom and scheduler together — they share a tightly-coupled
          // init order; splitting them breaks scheduler (e.g. "unstable_now" TypeError).
          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('/scheduler/')
          ) {
            return 'react-vendor'
          }
          return 'vendor'
        },
      },
    },
  },
})
