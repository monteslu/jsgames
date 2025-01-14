// spriteManager.js
import { SPRITE_CONFIG, COLORS } from './constants.js';

export class SpriteManager {
  constructor() {
    this.tileSheet = null;
    this.playerSheet = null;
    this.itemSheet = null;
    this.tileSize = 32;
    
    // Character colors
    this.characterColors = {
      body: COLORS.green,
      skin: COLORS.yellow,
      outline: COLORS.black
    };
  }

  createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  async generateSprites() {
    await Promise.all([
      this.generateTileSheet(),
      this.generatePlayerSheet(),
      this.generateItemSheet()
    ]);
  }

  generateTileSheet() {
    const numTiles = 5; // wall, door, bush, water, bridge
    const canvas = this.createCanvas(this.tileSize * numTiles, this.tileSize);
    const ctx = canvas.getContext('2d');

    // Wall tile
    this.drawWallTile(ctx, 0);

    // Door tile
    this.drawDoorTile(ctx, 1);

    // Bush tile
    this.drawBushTile(ctx, 2);

    // Water tile
    this.drawWaterTile(ctx, 3);

    // Bridge tile
    this.drawBridgeTile(ctx, 4);

    this.tileSheet = canvas;
    return Promise.resolve();
  }

  generatePlayerSheet() {
    // 4 directions x 2 frames per direction (standing and walking)
    const numFrames = 2;
    const numDirections = 4;
    const canvas = this.createCanvas(this.tileSize * numFrames, this.tileSize * numDirections);
    const ctx = canvas.getContext('2d');

    // Draw player sprites for each direction
    for (let dir = 0; dir < numDirections; dir++) {
      // Standing frame
      this.drawPlayerSprite(ctx, 0, dir, false);
      // Walking frame
      this.drawPlayerSprite(ctx, 1, dir, true);
    }

    this.playerSheet = canvas;
    return Promise.resolve();
  }

  generateItemSheet() {
    const numItems = 5; // key, sword, heart, bow, arrow
    const canvas = this.createCanvas(this.tileSize * numItems, this.tileSize);
    const ctx = canvas.getContext('2d');

    // Items
    this.drawKeySprite(ctx, 0);
    this.drawSwordSprite(ctx, 1);
    this.drawHeartSprite(ctx, 2, true);
    this.drawBowSprite(ctx, 3);
    this.drawArrowSprite(ctx, 4);

    this.itemSheet = canvas;
    return Promise.resolve();
  }

  drawPlayerSprite(ctx, frameX, direction, isWalking) {
    const x = frameX * this.tileSize;
    const y = direction * this.tileSize;
    const size = this.tileSize;

    // Clear the sprite area
    ctx.clearRect(x, y, size, size);

    // Draw the body (16x16 rectangle in center)
    ctx.fillStyle = this.characterColors.body;
    ctx.fillRect(x + 8, y + 8, 16, 16);

    // Draw head (12x12 square)
    ctx.fillStyle = this.characterColors.skin;
    ctx.fillRect(x + 10, y + 4, 12, 12);

    // Face details based on direction
    ctx.fillStyle = this.characterColors.outline;
    switch (direction) {
      case 0: // Up
        // No face details when facing up
        break;
      case 1: // Down
        // Eyes
        ctx.fillRect(x + 13, y + 8, 2, 2);
        ctx.fillRect(x + 17, y + 8, 2, 2);
        break;
      case 2: // Left
        // One eye on left side
        ctx.fillRect(x + 11, y + 8, 2, 2);
        break;
      case 3: // Right
        // One eye on right side
        ctx.fillRect(x + 19, y + 8, 2, 2);
        break;
    }

    // Add walking animation
    if (isWalking) {
      // Offset legs when walking
      ctx.fillStyle = this.characterColors.body;
      ctx.fillRect(x + 8, y + 24, 6, 6);  // Left leg
      ctx.fillRect(x + 18, y + 24, 6, 6); // Right leg
    } else {
      // Standing pose
      ctx.fillRect(x + 11, y + 24, 10, 6); // Legs together
    }
  }

  drawWallTile(ctx, index) {
    const x = index * this.tileSize;
    ctx.fillStyle = COLORS.gray;
    ctx.fillRect(x, 0, this.tileSize, this.tileSize);
    
    // Add brick pattern
    ctx.fillStyle = COLORS.black;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        ctx.fillRect(
          x + i * 8 + (j % 2 ? 4 : 0),
          j * 8,
          7,
          7
        );
      }
    }
  }

  drawDoorTile(ctx, index) {
    const x = index * this.tileSize;
    
    // Door frame
    ctx.fillStyle = COLORS.gray;
    ctx.fillRect(x, 0, this.tileSize, this.tileSize);
    
    // Door interior
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(x + 4, 4, this.tileSize - 8, this.tileSize - 4);
    
    // Handle
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(x + 22, 16, 4, 4);
  }

  drawBushTile(ctx, index) {
    const x = index * this.tileSize;
    
    // Base
    ctx.fillStyle = COLORS.green;
    ctx.fillRect(x, 8, this.tileSize, this.tileSize - 8);
    
    // Texture
    ctx.fillStyle = COLORS.black;
    for (let i = 0; i < 16; i++) {
      const px = x + Math.random() * this.tileSize;
      const py = 8 + Math.random() * (this.tileSize - 8);
      ctx.fillRect(px, py, 2, 2);
    }
  }

  drawWaterTile(ctx, index) {
    const x = index * this.tileSize;
    
    // Base water
    ctx.fillStyle = COLORS.blue;
    ctx.fillRect(x, 0, this.tileSize, this.tileSize);
    
    // Wave pattern
    ctx.fillStyle = COLORS.cyan;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(
        x + i * 8,
        4 + Math.sin(i) * 2,
        6,
        2
      );
    }
  }

  drawBridgeTile(ctx, index) {
    const x = index * this.tileSize;
    
    // Water background
    this.drawWaterTile(ctx, index);
    
    // Bridge planks
    ctx.fillStyle = COLORS.yellow;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + 2, i * 8, this.tileSize - 4, 6);
    }
  }

  drawKeySprite(ctx, index) {
    const x = index * this.tileSize;
    
    // Key body
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(x + 16, 8, 12, 4);
    
    // Key head
    ctx.beginPath();
    ctx.arc(x + 10, 10, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Key teeth
    ctx.fillRect(x + 20, 8, 2, 6);
    ctx.fillRect(x + 24, 8, 2, 8);
  }

  drawSwordSprite(ctx, index) {
    const x = index * this.tileSize;
    
    // Blade
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(x + 14, 4, 4, 20);
    
    // Blade shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(x + 15, 4, 2, 20);
    
    // Handle
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(x + 12, 24, 8, 4);
    
    // Guard
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(x + 10, 20, 12, 4);
    
    // Pommel
    ctx.fillStyle = COLORS.yellow;
    ctx.beginPath();
    ctx.arc(x + 16, 27, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHeartSprite(ctx, index, filled) {
    const x = index * this.tileSize;
    
    // Heart shape using rectangles for retro feel
    ctx.fillStyle = filled ? COLORS.red : COLORS.gray;
    
    // Top rectangles for the curves
    ctx.fillRect(x + 8, 8, 6, 6);
    ctx.fillRect(x + 18, 8, 6, 6);
    
    // Bottom triangle approximation with rectangles
    ctx.fillRect(x + 6, 14, 20, 4);
    ctx.fillRect(x + 8, 18, 16, 4);
    ctx.fillRect(x + 10, 22, 12, 4);
    ctx.fillRect(x + 14, 26, 4, 4);
  }

  drawBowSprite(ctx, index) {
    const x = index * this.tileSize;
    
    // Bow curve
    ctx.strokeStyle = COLORS.yellow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 16, 16, 12, Math.PI * 0.25, Math.PI * 1.75);
    ctx.stroke();
    
    // Bowstring
    ctx.strokeStyle = COLORS.white;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 16, 4);
    ctx.lineTo(x + 16, 28);
    ctx.stroke();
  }

  drawArrowSprite(ctx, index) {
    const x = index * this.tileSize;
    
    // Arrow shaft
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(x + 8, 15, 16, 2);
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(x + 24, 16);
    ctx.lineTo(x + 28, 12);
    ctx.lineTo(x + 28, 20);
    ctx.closePath();
    ctx.fill();
    
    // Arrow fletching
    ctx.fillStyle = COLORS.red;
    ctx.beginPath();
    ctx.moveTo(x + 8, 16);
    ctx.lineTo(x + 4, 12);
    ctx.lineTo(x + 8, 14);
    ctx.moveTo(x + 8, 16);
    ctx.lineTo(x + 4, 20);
    ctx.lineTo(x + 8, 18);
    ctx.fill();
  }

  getTileSheet() {
    return this.tileSheet;
  }

  getPlayerSheet() {
    return this.playerSheet;
  }

  getItemSheet() {
    return this.itemSheet;
  }
}