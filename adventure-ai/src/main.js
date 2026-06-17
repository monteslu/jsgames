// main.js
import { createResourceLoader } from './utils.js';
import { Game } from './game.js';
import { SpriteManager } from './spriteManager.js';

// Get canvas and create resource loader
const canvas = document.getElementById('gameCanvas');
const resources = createResourceLoader();

// Create sprite manager for retro graphics
const spriteManager = new SpriteManager();

// Size constants
const TILE_SIZE = 32;
const SCREEN_WIDTH = 20;
const SCREEN_HEIGHT = 12;
const STATUS_HEIGHT = 96;

// Ensure canvas has correct size
canvas.width = SCREEN_WIDTH * TILE_SIZE;
canvas.height = SCREEN_HEIGHT * TILE_SIZE + STATUS_HEIGHT;

// Get 2d context with pixel-perfect rendering
const ctx = canvas.getContext('2d', {
  antialias: false,
  imageSmoothingEnabled: false,
});
ctx.imageSmoothingEnabled = false;

// Create and configure game instance
let game = null;

// Asset loading
async function loadAssets() {
  try {
    // Generate sprite sheets first
    await spriteManager.generateSprites();

    // Pre-set generated images so engine.init() finds them already loaded
    resources.images.tiles = spriteManager.getTileSheet();
    resources.images.player = spriteManager.getPlayerSheet();
    resources.images.items = spriteManager.getItemSheet();
    // Mark image counts as already loaded
    resources.imgCount = 3;
    resources.imgLoadedCount = 3;

    // Create game instance (engine.init will load sounds and skip image re-loading)
    game = new Game(canvas, resources);
  } catch (error) {
    console.error('Failed to load game assets:', error);
  }
}

// Initialize game
loadAssets().catch(console.error);
