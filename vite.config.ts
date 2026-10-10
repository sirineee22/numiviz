import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/chapters': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/media/, '/media')
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // vendor: large, rarely-changed third-party libs
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-recharts': ['recharts'],
          'vendor-katex':    ['katex', 'react-katex'],
          'vendor-ui':       ['@radix-ui/react-tabs', '@radix-ui/react-dialog', '@radix-ui/react-tooltip'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
