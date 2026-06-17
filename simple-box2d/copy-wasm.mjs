import { mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
mkdirSync('public', { recursive: true });
const base = join('node_modules','box2d-wasm','dist','es');
copyFileSync(join(base,'Box2D.js'),   join('public','Box2D.js'));
copyFileSync(join(base,'Box2D.wasm'), join('public','Box2D.wasm'));
console.log('copied Box2D.{js,wasm} -> public/');
