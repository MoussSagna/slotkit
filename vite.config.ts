/// <reference types="vitest/config" />
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import pkg from './package.json' with { type: 'json' };

// Les peerDependencies (React, MUI, Emotion, date-fns) restent externes : l'acheteur les fournit.
const external = Object.keys(pkg.peerDependencies);

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    sourcemap: true,
    rolldownOptions: {
      // Exclut aussi les sous-chemins (ex. @mui/material/Button, date-fns/locale).
      external: (id) => external.some((dep) => id === dep || id.startsWith(`${dep}/`)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
