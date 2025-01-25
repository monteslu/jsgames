// vite has a bug where it doesn't load the module correctly
// so we need to load it manually

//jsgamelauncher doesn't need to do this hack

import Box2DFactory from './Box2D.deluxe.mjs';

window.Box2DFactory = Box2DFactory;
