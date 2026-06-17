import { mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
mkdirSync('public', { recursive: true });
const base = join('node_modules','box2d3-wasm','build','dist','es','deluxe');
copyFileSync(join(base,'Box2D.deluxe.wasm'), join('public','Box2D.deluxe.wasm'));
copyFileSync(join(base,'Box2D.deluxe.mjs'),  join('public','Box2D.deluxe.mjs'));
console.log('copied Box2D.deluxe.{wasm,mjs} -> public/');
