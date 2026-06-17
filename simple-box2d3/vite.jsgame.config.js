import { defineConfig } from 'vite';
import jsgame from '../vite-plugin-jsgame.js';

// THREADED jsgame build. The deluxe box2d3 module contains an emscripten pthread
// Web Worker (new Worker(new URL('Box2D.deluxe.mjs', import.meta.url))). It must
// remain a real on-disk module (shipped via copy-wasm to public/ -> dist root)
// so its worker URL resolves; we mark it external so vite never bundles/parses
// its worker. The core resolves the runtime import from the game root.
export default defineConfig({
  base: './',
  build: {
    target: 'es2022', outDir: 'dist', emptyOutDir: true, copyPublicDir: true,
    lib: { entry: 'src/main.jsgame.js', formats: ['es'], fileName: () => 'simple-box2d3.js' },
    rollupOptions: { external: [/Box2D\.deluxe\.mjs$/], output: { inlineDynamicImports: true } },
  },
  plugins: [jsgame()],
});
