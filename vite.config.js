import { defineConfig } from 'vite';

// base './' để file build chạy được cả trên GitHub Pages lẫn trong WebView của Android
export default defineConfig({
  base: './',
  build: { outDir: 'dist', target: 'es2019' },
});
