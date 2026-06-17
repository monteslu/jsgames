// Realm (jsgame) shim aliased in place of 'box2d-wasm'. Loads the non-SIMD
// factory from the on-disk sibling module (copy-wasm puts Box2D.js at the dist
// root — a real file so its emscripten Node path has a real __dirname) and
// injects the wasm bytes. main.js's `Box2DFactory()` is unchanged.
let factoryPromise;
export default function Box2DFactory(opts = {}) {
  if (!factoryPromise) {
    factoryPromise = import('./Box2D.js').then(async (m) => {
      const wasmBinary = new Uint8Array(await (await fetch('Box2D.wasm')).arrayBuffer());
      return { factory: m.default, wasmBinary };
    });
  }
  return factoryPromise.then(({ factory, wasmBinary }) => factory({ ...opts, wasmBinary }));
}
