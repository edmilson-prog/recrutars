import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 3001,
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
        headers: {
          'x-api-key': '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',
          'anthropic-version': '2023-06-01',
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
}));
