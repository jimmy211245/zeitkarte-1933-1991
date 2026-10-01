import { defineConfig } from 'vite';

export default defineConfig({
  // relative Pfade, damit der Build in jedem Unterordner eines Webservers läuft
  base: './',
  server: { open: false, port: 5173 },
  build: { chunkSizeWarningLimit: 1500 },
});
