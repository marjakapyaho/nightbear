import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      backend: resolve(__dirname, './src/backend'),
      frontend: resolve(__dirname, './src/frontend'),
      shared: resolve(__dirname, './src/shared'),
    },
  },
  test: {
    include: ['**/*.test.ts'],
    globals: true,
  },
});
