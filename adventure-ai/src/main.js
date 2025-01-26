// main.js
import { createReourceLoader } from './utils.js';
import { Game } from './game.js';
import { SpriteManager } from './spriteManager.js';

// Get canvas and create resource loader
const canvas = document.getElementById('gameCanvas');
const resources = createReourceLoader();

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

// Get WebGL context with pixel-perfect rendering
const ctx = canvas.getContext('2d', {
  antialias: false,
  imageSmoothingEnabled: false
});
ctx.imageSmoothingEnabled = false;

// Create and configure game instance
let game = null;

// Asset loading
async function loadAssets() {
  try {
    // Generate sprite sheets
    await spriteManager.generateSprites();
    
    // Create game instance
    game = new Game(canvas, resources);
    
  } catch (error) {
    console.error('Failed to load game assets:', error);
  }
}

// Initialize game
loadAssets().catch(console.error);



