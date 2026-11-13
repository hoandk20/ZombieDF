import { defineConfig } from 'vite';

// base './' để file build chạy được cả trên GitHub Pages lẫn trong WebView của Android
export default defineConfig({
  base: './',
  // phông chữ nhỏ được nhúng thẳng vào CSS để bản một-file vẫn có đủ chữ
  build: { outDir: 'dist', target: 'es2019', assetsInlineLimit: 64 * 1024 },
});
