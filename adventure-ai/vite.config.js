import { defineConfig } from 'vite';
import jsgame from '../vite-plugin-jsgame.js';

// jsgame is a node/libretro compatibility layer (NOT a browser) — it runs the
// game's entry JS module. So the .jsgame production build is the bundled entry
// module, not an HTML page. We build the entry in vite "lib" mode: it + all its
// imports (npm deps, dynamic imports) collapse into one self-contained ES file,
// dist/<name>.js, which package.json "main" points at. public/ assets are
// copied to dist/ root (fetch/Image paths resolve there). index.html is for
// browser dev only and is not part of the .jsgame.
export default defineConfig({
  base: './',
  publicDir: 'public',
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true,
    lib: {
      entry: 'src/main.js',
      formats: ['es'],
      fileName: () => 'adventure-ai.js',
    },
    rollupOptions: { output: { inlineDynamicImports: true, assetFileNames: '[name][extname]' } },
  },
  plugins: [jsgame()],
});
