import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import fs from 'fs';
import tailwindcss from '@tailwindcss/vite'
const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf-8'));

export default defineConfig({
  plugins: [react(), crx({ manifest }), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
      },
    },
  },
});
