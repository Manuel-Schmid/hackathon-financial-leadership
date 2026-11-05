/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  envDir: '..', // .env liegt in der Repo-Wurzel
  resolve: {
    alias: {
      '@config': path.resolve(__dirname, '../config'),
      '@': path.resolve(__dirname, 'src'),
    },
    // Wegen node_modules-Symlink (.nosync für iCloud) nur eine Kopie von React/Three auflösen
    dedupe: ['react', 'react-dom', 'three'],
  },
  server: { port: 5173, fs: { allow: ['..'] } },
  build: { chunkSizeWarningLimit: 1600 },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
