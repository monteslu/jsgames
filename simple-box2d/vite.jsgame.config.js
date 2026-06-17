import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import jsgame from '../vite-plugin-jsgame.js';

// jsgame build: alias 'box2d-wasm' to a shim that loads the non-SIMD factory
// from the on-disk sibling Box2D.js (real file -> real __dirname for its
// emscripten Node path) and injects the wasm. Box2D.js stays external (a raw
// asset shipped via copy-wasm), not bundled. Browser build (vite.config.js)
// untouched.
const shim = fileURLToPath(new URL('./src/box2d-wasm-jsgame-shim.js', import.meta.url));
export default defineConfig({
  base: './',
  resolve: { alias: [{ find: /^box2d-wasm$/, replacement: shim }] },
  build: { target: 'es2022', outDir: 'dist', emptyOutDir: true, copyPublicDir: true,
    lib: { entry: 'src/main.js', formats: ['es'], fileName: () => 'simple-box2d.js' },
    rollupOptions: { external: [/\.\/Box2D\.js$/], output: { inlineDynamicImports: true, assetFileNames: '[name][extname]' } } },
  plugins: [jsgame()],
});
