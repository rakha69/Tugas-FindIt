import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'dev-entry-switcher',
      apply: 'serve',
      transformIndexHtml(html) {
        return html
          .replace(/<link rel="stylesheet" href="\.\/dist\/assets\/app\.css[^"]*">/, '')
          .replace('./dist/assets/app.js', '/src/main.jsx');
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/main.jsx',
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/app.[ext]'
      }
    }
  }
});

