#!/usr/bin/env node
// Modernize a jsgames game in place WITHOUT rewriting its bespoke index.html or
// source. Adds: vite.config.js (stable entry + jsgame pack plugin), a
// fullscreen/resize snippet injected into index.html, package.json main +
// scripts + bumped devDeps. Leaves canvas ids, DOM, and game code untouched.
//
// Usage: node _update.mjs <game> [--browser-only] [--entry <file>]
//   --browser-only : skip the jsgame pack plugin + stable-entry (box2d games
//                    that keep their own vite config / COOP-COEP setup); only
//                    bump deps + inject fullscreen.
//   --entry <file> : entry source path if not src/main.js (e.g. index.js)
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const game = args[0];
const browserOnly = args.includes('--browser-only');
const entryIdx = args.indexOf('--entry');
const entrySrc = entryIdx >= 0 ? args[entryIdx + 1] : null;
const dir = join(process.cwd(), game);
if (!game || !existsSync(dir)) { console.error('usage: node _update.mjs <game> [--browser-only] [--entry f]'); process.exit(1); }

const read = (f) => { try { return readFileSync(join(dir, f), 'utf8'); } catch { return null; } };
const write = (f, s) => writeFileSync(join(dir, f), s);

// ── 1. inject fullscreen/resize into index.html (idempotent) ──
const html = read('index.html');
if (html && !html.includes('requestFullscreen')) {
  const snippet = `
  <script>
    // jsgame: scale canvas to window (letterbox) + click-to-fullscreen (browser
    // only; a libretro frontend owns its own window/fullscreen). Picks the first
    // <canvas> so it works regardless of this game's canvas id.
    (function () {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      function resize() {
        const ar = canvas.width / canvas.height, ww = innerWidth, wh = innerHeight;
        if (ww / wh > ar) { canvas.style.width = wh * ar + 'px'; canvas.style.height = wh + 'px'; }
        else { canvas.style.width = ww + 'px'; canvas.style.height = ww / ar + 'px'; }
      }
      addEventListener('resize', resize); resize();
      canvas.addEventListener('click', () =>
        document.fullscreenElement ? document.exitFullscreen?.() : canvas.requestFullscreen?.());
    })();
  </script>
`;
  // insert just before </body>
  const out = html.includes('</body>') ? html.replace('</body>', snippet + '</body>') : html + snippet;
  write('index.html', out);
  console.log(`  + injected fullscreen into index.html`);
} else if (html) {
  console.log(`  = index.html already has fullscreen`);
}


// ── 2. package.json: main, scripts, bumped devDeps ──
let pkg = {};
try { pkg = JSON.parse(read('package.json')); } catch {}
pkg.name = game; // force: several games carry a stale name copied from a template
pkg.type = 'module';
const entryName = `${game}.js`;
if (!browserOnly) {
  pkg.main = `dist/${entryName}`;
  pkg.scripts = { ...(pkg.scripts || {}), dev: 'vite', build: 'vite build', pack: 'vite build', preview: 'vite preview' };
  pkg.devDependencies = { ...(pkg.devDependencies || {}), fflate: '^0.8.3', vite: '^8.0.16' };
} else {
  // keep its own build setup; just ensure scripts exist + bump vite if present
  pkg.scripts = { dev: 'vite', build: 'vite build', preview: 'vite preview', ...(pkg.scripts || {}) };
}
// bump common deps to latest-ish
if (pkg.dependencies?.three) pkg.dependencies.three = '^0.184.0';
if (pkg.dependencies?.phaser) pkg.dependencies.phaser = '^3.90.0';
write('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log(`  + package.json updated (${browserOnly ? 'browser-only' : 'main=' + pkg.main})`);

// ── 3. vite.config.js (realm games only) ──
if (!browserOnly) {
  // The game's ENTRY MODULE is the build input (not index.html) — vite bundles
  // it + all its imports (deps from node_modules, lazy chunks) into a single
  // self-contained dist/<name>.js that the core runs directly. This is the
  // production build; index.html is only for browser dev.
  const entry = entrySrc || (existsSync(join(dir, 'src/main.js')) ? 'src/main.js'
              : existsSync(join(dir, 'src/index.js')) ? 'src/index.js'
              : existsSync(join(dir, 'index.js')) ? 'index.js' : 'game.js');
  write('vite.config.js', `import { defineConfig } from 'vite';
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
      entry: '${entry}',
      formats: ['es'],
      fileName: () => '${entryName}',
    },
    rollupOptions: { output: { inlineDynamicImports: true, assetFileNames: '[name][extname]' } },
  },
  plugins: [jsgame()],
});
`);
  console.log(`  + vite.config.js (lib build: ${entry} -> dist/${entryName})`);
}
console.log(`${game}: updated`);
