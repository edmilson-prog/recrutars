import { defineConfig } from 'vitest/config';
import path from 'path';

// Standalone Vitest config (does not import vite.config.ts to avoid the dev
// proxy / SWC plugin). Pure-logic unit tests only — node environment.
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
