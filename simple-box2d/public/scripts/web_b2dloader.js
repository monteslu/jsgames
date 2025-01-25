// vite has a bug where it doesn't load the module correctly
// so we need to load it manually

import Box2DFactory from './Box2D.simd.js';

window.Box2DFactory = Box2DFactory;


console.log('Box2DFactory', window.Box2DFactory);