// vite-plugin-jsgame — after a production build, zip the dist/ output into a
// distributable <name>.jsgame package (the format jsgamelauncher / the
// jsgame-libretro core load). Pure-Node zip via fflate, so no system `zip`
// dependency and it works the same on every OS.
//
// The packed tree is the BUILT output (dist/), not the source: the loader
// resolves relative specifiers only, so the bundled bundle is what ships.
// package.json travels along with its "main" pointing at the built entry.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { zipSync } from 'fflate';

function walk(dir, base = dir, out = {}) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, base, out);
    else out[relative(base, full).split('\\').join('/')] = readFileSync(full);
  }
  return out;
}

/**
 * @param {{ name?: string }} [opts] - output basename (defaults to package.json name)
 */
export default function jsgame(opts = {}) {
  let outDir = 'dist';
  let root = process.cwd();
  return {
    name: 'vite-plugin-jsgame',
    apply: 'build',
    configResolved(cfg) {
      outDir = cfg.build.outDir;
      root = cfg.root;
    },
    closeBundle() {
      const distDir = join(root, outDir);
      if (!existsSync(distDir)) return;

      // entry name: opts.name -> package.json name -> "game"
      let name = opts.name;
      if (!name) {
        try { name = JSON.parse(readFileSync(join(root, 'package.json'))).name; } catch {}
      }
      name = name || 'game';

      // Pack the dist/ CONTENTS at the zip root so the game root == dist:
      // the entry (game.js) and its assets (images/, sounds/) all resolve
      // from the same root, matching how the game runs in the browser from
      // dist/. The packaged package.json's "main" is rewritten to the
      // root-relative entry ("game.js") so the loader finds it.
      const tree = walk(distDir);

      let pkg = {};
      try { pkg = JSON.parse(readFileSync(join(root, 'package.json'))); } catch {}
      const srcMain = (pkg.main || 'dist/game.js').replace(/^dist\//, '');
      pkg.main = tree[srcMain] ? srcMain : 'game.js';
      tree['package.json'] = Buffer.from(JSON.stringify(pkg, null, 2));

      const zipped = zipSync(tree, { level: 6 });
      const out = join(distDir, `${name}.jsgame`);
      writeFileSync(out, zipped);
      this.info?.(`jsgame: wrote ${relative(root, out)} (${zipped.length} bytes)`);
      console.log(`\n  jsgame  dist/${name}.jsgame  ${(zipped.length / 1024).toFixed(1)} kB\n`);
    },
  };
}
