import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 3000,
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
        headers: {
          'x-api-key': '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',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Only split heavy & truly independent libs (no shared React helpers).
            // Everything else (React + all React-coupled libs) stays in a single
            // 'vendor' chunk to prevent circular cross-chunk dependencies.
            if (id.includes('@react-pdf') || id.includes('pdfjs-dist')) return 'vendor-pdf';
            if (id.includes('recharts') || id.match(/[/\\]d3-/)) return 'vendor-charts';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('xlsx')) return 'vendor-xlsx';
            if (id.includes('mammoth')) return 'vendor-mammoth';
            return 'vendor';
          }
        }
      }
    }
  },
}));
