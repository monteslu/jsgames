// jsgame (node/libretro) entry — THREADED. The core now exposes Node detection
// to emscripten wasm, so box2d3's deluxe (pthread) build uses native
// worker_threads for threading, exactly like jsgamelauncher. We import the
// deluxe factory from the on-disk sibling module (public/ -> dist root, real
// file so emscripten's pthread worker URL resolves) and inject the wasm bytes.
const { default: Box2DFactory } = await import('./Box2D.deluxe.mjs');
const { start } = await import('./start.js');

const wasmBinary = new Uint8Array(await (await fetch('Box2D.deluxe.wasm')).arrayBuffer());
start(() => Box2DFactory({ wasmBinary }));
