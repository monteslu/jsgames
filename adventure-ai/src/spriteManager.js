// spriteManager.js
import { SPRITE_CONFIG, COLORS } from './constants.js';

export class SpriteManager {
  constructor() {
    this.tileSheet = null;
    this.playerSheet = null;
    this.itemSheet = null;
    this.tileSize = 32;

    this.characterColors = {
      tunic: '#228B22',
      tunicDark: '#1A6B1A',
      skin: '#FFDAB9',
      hair: '#8B6914',
      belt: '#8B4513',
      boots: '#6B3410',
      hat: '#228B22',
      hatDark: '#1A6B1A',
      outline: '#000000',
      white: '#FFFFFF'
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
    const numTiles = 10; // wall, door, bush, water, bridge, sand, lava, grass, tree, grave
    const canvas = this.createCanvas(this.tileSize * numTiles, this.tileSize);
    const ctx = canvas.getContext('2d');

    this.drawWallTile(ctx, 0);
    this.drawDoorTile(ctx, 1);
    this.drawBushTile(ctx, 2);
    this.drawWaterTile(ctx, 3);
    this.drawBridgeTile(ctx, 4);
    this.drawSandTile(ctx, 5);
    this.drawLavaTile(ctx, 6);
    this.drawGrassTile(ctx, 7);
    this.drawTreeTile(ctx, 8);
    this.drawGraveTile(ctx, 9);

    this.tileSheet = canvas;
    return Promise.resolve();
  }

  generatePlayerSheet() {
    const numFrames = 4; // idle, walk1, walk2, attack
    const numDirections = 4;
    const canvas = this.createCanvas(this.tileSize * numFrames, this.tileSize * numDirections);
    const ctx = canvas.getContext('2d');

    for (let dir = 0; dir < numDirections; dir++) {
      this.drawAdventurer(ctx, 0, dir, 'idle');
      this.drawAdventurer(ctx, 1, dir, 'walk1');
      this.drawAdventurer(ctx, 2, dir, 'walk2');
      this.drawAdventurer(ctx, 3, dir, 'attack');
    }

    this.playerSheet = canvas;
    return Promise.resolve();
  }

  generateItemSheet() {
    const numItems = 8; // key, sword, heart, bow, arrow, chest, crystal, bigHeart
    const canvas = this.createCanvas(this.tileSize * numItems, this.tileSize);
    const ctx = canvas.getContext('2d');

    this.drawKeySprite(ctx, 0);
    this.drawSwordSprite(ctx, 1);
    this.drawHeartSprite(ctx, 2, true);
    this.drawBowSprite(ctx, 3);
    this.drawArrowSprite(ctx, 4);
    this.drawChestSprite(ctx, 5);
    this.drawCrystalSprite(ctx, 6);
    this.drawBigHeartSprite(ctx, 7);

    this.itemSheet = canvas;
    return Promise.resolve();
  }

  // --- Player sprite (detailed adventurer) ---
  drawAdventurer(ctx, frameX, direction, pose) {
    const x = frameX * this.tileSize;
    const y = direction * this.tileSize;
    const c = this.characterColors;

    ctx.clearRect(x, y, this.tileSize, this.tileSize);

    // Leg positions based on pose
    let leftLegOff = 0, rightLegOff = 0;
    if (pose === 'walk1') { leftLegOff = -3; rightLegOff = 3; }
    if (pose === 'walk2') { leftLegOff = 3; rightLegOff = -3; }

    // Boots
    ctx.fillStyle = c.boots;
    ctx.fillRect(x + 10, y + 26 + leftLegOff, 5, 4);
    ctx.fillRect(x + 17, y + 26 + rightLegOff, 5, 4);

    // Legs
    ctx.fillStyle = c.tunicDark;
    ctx.fillRect(x + 10, y + 22 + leftLegOff, 5, 5);
    ctx.fillRect(x + 17, y + 22 + rightLegOff, 5, 5);

    // Body/Tunic
    ctx.fillStyle = c.tunic;
    ctx.fillRect(x + 8, y + 12, 16, 12);
    // Belt
    ctx.fillStyle = c.belt;
    ctx.fillRect(x + 8, y + 19, 16, 3);
    // Belt buckle
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + 14, y + 19, 4, 3);

    // Arms based on pose and direction
    ctx.fillStyle = c.tunic;
    if (pose === 'attack') {
      // Attack arm extended in facing direction
      switch (direction) {
        case 0: // up
          ctx.fillStyle = c.skin;
          ctx.fillRect(x + 20, y + 10, 4, 6);
          // Sword
          ctx.fillStyle = '#C0C0C0';
          ctx.fillRect(x + 21, y + 0, 2, 10);
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(x + 19, y + 10, 6, 2);
          break;
        case 1: // down
          ctx.fillStyle = c.skin;
          ctx.fillRect(x + 20, y + 14, 4, 6);
          ctx.fillStyle = '#C0C0C0';
          ctx.fillRect(x + 21, y + 20, 2, 10);
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(x + 19, y + 18, 6, 2);
          break;
        case 2: // left
          ctx.fillStyle = c.skin;
          ctx.fillRect(x + 2, y + 14, 6, 4);
          ctx.fillStyle = '#C0C0C0';
          ctx.fillRect(x - 2, y + 15, 6, 2);
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(x + 4, y + 13, 2, 6);
          break;
        case 3: // right
          ctx.fillStyle = c.skin;
          ctx.fillRect(x + 24, y + 14, 6, 4);
          ctx.fillStyle = '#C0C0C0';
          ctx.fillRect(x + 28, y + 15, 6, 2);
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(x + 26, y + 13, 2, 6);
          break;
      }
    } else {
      // Normal arms at sides
      ctx.fillStyle = c.skin;
      ctx.fillRect(x + 4, y + 13, 4, 8);
      ctx.fillRect(x + 24, y + 13, 4, 8);
    }

    // Head
    ctx.fillStyle = c.skin;
    ctx.fillRect(x + 10, y + 3, 12, 11);

    // Hair
    ctx.fillStyle = c.hair;
    switch (direction) {
      case 0: // up - show back of hair
        ctx.fillRect(x + 9, y + 2, 14, 7);
        break;
      case 1: // down - bangs
        ctx.fillRect(x + 10, y + 2, 12, 4);
        break;
      case 2: // left
        ctx.fillRect(x + 14, y + 2, 8, 4);
        ctx.fillRect(x + 18, y + 2, 4, 8);
        break;
      case 3: // right
        ctx.fillRect(x + 10, y + 2, 8, 4);
        ctx.fillRect(x + 10, y + 2, 4, 8);
        break;
    }

    // Hat (pointed cap)
    ctx.fillStyle = c.hat;
    switch (direction) {
      case 0: // up
        ctx.fillRect(x + 9, y + 0, 14, 5);
        ctx.fillRect(x + 20, y - 3, 4, 4);
        break;
      case 1: // down
        ctx.fillRect(x + 9, y + 0, 14, 5);
        ctx.fillRect(x + 9, y - 2, 4, 3);
        break;
      case 2: // left
        ctx.fillRect(x + 9, y + 0, 14, 5);
        ctx.fillRect(x + 5, y - 2, 6, 4);
        break;
      case 3: // right
        ctx.fillRect(x + 9, y + 0, 14, 5);
        ctx.fillRect(x + 21, y - 2, 6, 4);
        break;
    }

    // Face details
    if (direction !== 0) { // Not facing up
      ctx.fillStyle = c.outline;
      if (direction === 1) { // down
        // Eyes
        ctx.fillRect(x + 12, y + 7, 3, 3);
        ctx.fillRect(x + 18, y + 7, 3, 3);
        // Eye whites
        ctx.fillStyle = c.white;
        ctx.fillRect(x + 12, y + 7, 2, 2);
        ctx.fillRect(x + 18, y + 7, 2, 2);
        // Mouth
        ctx.fillStyle = c.outline;
        ctx.fillRect(x + 14, y + 12, 4, 1);
      } else if (direction === 2) { // left
        ctx.fillRect(x + 11, y + 7, 3, 3);
        ctx.fillStyle = c.white;
        ctx.fillRect(x + 11, y + 7, 2, 2);
      } else if (direction === 3) { // right
        ctx.fillRect(x + 18, y + 7, 3, 3);
        ctx.fillStyle = c.white;
        ctx.fillRect(x + 19, y + 7, 2, 2);
      }
    }

    // Shield on back when facing up
    if (direction === 0 && pose !== 'attack') {
      ctx.fillStyle = '#4169E1';
      ctx.fillRect(x + 12, y + 13, 8, 8);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x + 15, y + 14, 2, 6);
      ctx.fillRect(x + 13, y + 16, 6, 2);
    }
  }

  // --- Tile sprites ---
  drawWallTile(ctx, index) {
    const x = index * this.tileSize;
    // Dark stone base
    ctx.fillStyle = '#5A5A6A';
    ctx.fillRect(x, 0, this.tileSize, this.tileSize);
    // Brick pattern
    ctx.fillStyle = '#4A4A5A';
    for (let row = 0; row < 4; row++) {
      const offset = (row % 2) * 8;
      for (let col = 0; col < 3; col++) {
        ctx.fillRect(x + col * 12 + offset, row * 8 + 1, 10, 6);
      }
    }
    // Highlights
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    for (let row = 0; row < 4; row++) {
      const offset = (row % 2) * 8;
      for (let col = 0; col < 3; col++) {
        ctx.fillRect(x + col * 12 + offset, row * 8 + 1, 10, 1);
      }
    }
  }

  drawDoorTile(ctx, index) {
    const x = index * this.tileSize;
    ctx.fillStyle = '#5A5A6A';
    ctx.fillRect(x, 0, this.tileSize, this.tileSize);
    // Door
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(x + 4, 2, this.tileSize - 8, this.tileSize - 2);
    // Planks
    ctx.fillStyle = '#7A5A10';
    ctx.fillRect(x + 15, 2, 2, this.tileSize - 2);
    // Handle
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x + 22, 16, 3, 0, Math.PI * 2);
    ctx.fill();
    // Keyhole
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 21, 17, 2, 3);
  }

  drawBushTile(ctx, index) {
    const x = index * this.tileSize;
    // Bush body
    ctx.fillStyle = '#2D8B2D';
    ctx.beginPath();
    ctx.arc(x + 16, 20, 14, 0, Math.PI * 2);
    ctx.fill();
    // Highlights
    ctx.fillStyle = '#3DA83D';
    ctx.beginPath();
    ctx.arc(x + 10, 14, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 22, 16, 5, 0, Math.PI * 2);
    ctx.fill();
    // Berries
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(x + 8, 18, 3, 3);
    ctx.fillRect(x + 20, 22, 3, 3);
  }

  drawWaterTile(ctx, index) {
    const x = index * this.tileSize;
    ctx.fillStyle = '#2255CC';
    ctx.fillRect(x, 0, this.tileSize, this.tileSize);
    // Waves
    ctx.fillStyle = '#3366DD';
    for (let i = 0; i < 3; i++) {
      const wy = 4 + i * 10;
      for (let j = 0; j < 3; j++) {
        ctx.fillRect(x + 2 + j * 10 + (i % 2) * 5, wy, 8, 3);
      }
    }
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x + 6, 8, 4, 2);
    ctx.fillRect(x + 18, 18, 4, 2);
  }

  drawBridgeTile(ctx, index) {
    const x = index * this.tileSize;
    this.drawWaterTile(ctx, index);
    // Bridge planks
    ctx.fillStyle = '#B8860B';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + 2, i * 8 + 1, this.tileSize - 4, 6);
    }
    // Plank gaps
    ctx.fillStyle = '#8B6914';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + 2, i * 8, this.tileSize - 4, 1);
    }
    // Rails
    ctx.fillStyle = '#6B4423';
    ctx.fillRect(x + 1, 0, 2, this.tileSize);
    ctx.fillRect(x + this.tileSize - 3, 0, 2, this.tileSize);
  }

  drawSandTile(ctx, index) {
    const x = index * this.tileSize;
    ctx.fillStyle = '#E8D090';
    ctx.fillRect(x, 0, this.tileSize, this.tileSize);
    // Texture dots
    ctx.fillStyle = '#D4BC78';
    for (let i = 0; i < 8; i++) {
      const sx = x + ((i * 7 + 3) % this.tileSize);
      const sy = (i * 11 + 5) % this.tileSize;
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.fillStyle = '#F0E0A0';
    ctx.fillRect(x + 4, 4, 3, 2);
    ctx.fillRect(x + 20, 14, 3, 2);
  }

  drawLavaTile(ctx, index) {
    const x = index * this.tileSize;
    ctx.fillStyle = '#CC3300';
    ctx.fillRect(x, 0, this.tileSize, this.tileSize);
    // Hot spots
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(x + 4, 4, 8, 8);
    ctx.fillRect(x + 16, 12, 10, 8);
    ctx.fillRect(x + 8, 22, 8, 6);
    // Bright centers
    ctx.fillStyle = '#FFAA00';
    ctx.fillRect(x + 6, 6, 4, 4);
    ctx.fillRect(x + 18, 14, 6, 4);
    ctx.fillRect(x + 10, 24, 4, 3);
    // White-hot
    ctx.fillStyle = '#FFDD44';
    ctx.fillRect(x + 7, 7, 2, 2);
    ctx.fillRect(x + 20, 15, 2, 2);
  }

  drawGrassTile(ctx, index) {
    const x = index * this.tileSize;
    // No solid fill — transparent so the screen background color shows through

    // Draw grass tufts rooted at bottom, blades pointing up
    const tufts = [
      { tx: 4, base: 30 },
      { tx: 14, base: 29 },
      { tx: 24, base: 31 },
      { tx: 9, base: 28 },
      { tx: 19, base: 30 },
    ];
    for (const t of tufts) {
      const bx = x + t.tx;
      const base = t.base;
      // Left blade (dark, leaning left)
      ctx.fillStyle = '#2E7D32';
      ctx.beginPath();
      ctx.moveTo(bx, base);
      ctx.lineTo(bx - 4, base - 12);
      ctx.lineTo(bx - 2, base - 11);
      ctx.lineTo(bx + 1, base);
      ctx.fill();
      // Center blade (medium green, tallest)
      ctx.fillStyle = '#43A047';
      ctx.beginPath();
      ctx.moveTo(bx + 1, base);
      ctx.lineTo(bx + 1, base - 15);
      ctx.lineTo(bx + 3, base - 14);
      ctx.lineTo(bx + 3, base);
      ctx.fill();
      // Right blade (light, leaning right)
      ctx.fillStyle = '#66BB6A';
      ctx.beginPath();
      ctx.moveTo(bx + 3, base);
      ctx.lineTo(bx + 7, base - 11);
      ctx.lineTo(bx + 5, base - 10);
      ctx.lineTo(bx + 2, base);
      ctx.fill();
    }
  }

  drawTreeTile(ctx, index) {
    const x = index * this.tileSize;
    // Trunk
    ctx.fillStyle = '#6B4423';
    ctx.fillRect(x + 12, 18, 8, 14);
    // Foliage layers
    ctx.fillStyle = '#1B5E20';
    ctx.beginPath();
    ctx.moveTo(x + 16, 0);
    ctx.lineTo(x + 4, 14);
    ctx.lineTo(x + 28, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.moveTo(x + 16, 4);
    ctx.lineTo(x + 6, 18);
    ctx.lineTo(x + 26, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.moveTo(x + 16, 8);
    ctx.lineTo(x + 8, 22);
    ctx.lineTo(x + 24, 22);
    ctx.closePath();
    ctx.fill();
  }

  drawGraveTile(ctx, index) {
    const x = index * this.tileSize;
    // Ground
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x, 0, this.tileSize, this.tileSize);
    // Gravestone
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(x + 8, 8, 16, 20);
    // Rounded top
    ctx.beginPath();
    ctx.arc(x + 16, 10, 8, Math.PI, 0);
    ctx.fill();
    // Cross
    ctx.fillStyle = '#757575';
    ctx.fillRect(x + 14, 6, 4, 12);
    ctx.fillRect(x + 10, 10, 12, 3);
    // Dirt mound
    ctx.fillStyle = '#6D4C41';
    ctx.beginPath();
    ctx.ellipse(x + 16, 30, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Item sprites ---
  drawKeySprite(ctx, index) {
    const x = index * this.tileSize;
    ctx.fillStyle = '#FFD700';
    // Key head (ring)
    ctx.beginPath();
    ctx.arc(x + 10, 12, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FCD8A8';
    ctx.beginPath();
    ctx.arc(x + 10, 12, 3, 0, Math.PI * 2);
    ctx.fill();
    // Shaft
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + 14, 10, 12, 4);
    // Teeth
    ctx.fillRect(x + 22, 10, 2, 7);
    ctx.fillRect(x + 26, 10, 2, 9);
  }

  drawSwordSprite(ctx, index) {
    const x = index * this.tileSize;
    // Blade
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(x + 14, 2, 4, 18);
    // Blade tip
    ctx.beginPath();
    ctx.moveTo(x + 14, 2);
    ctx.lineTo(x + 16, -1);
    ctx.lineTo(x + 18, 2);
    ctx.closePath();
    ctx.fill();
    // Blade shine
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 15, 3, 1, 16);
    // Guard
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + 10, 20, 12, 3);
    // Handle
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 14, 23, 4, 5);
    // Pommel
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x + 16, 29, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHeartSprite(ctx, index, filled) {
    const x = index * this.tileSize;
    ctx.fillStyle = filled ? '#FF2222' : '#666666';
    // Heart shape
    ctx.beginPath();
    ctx.moveTo(x + 16, 26);
    ctx.bezierCurveTo(x + 4, 18, x + 4, 6, x + 16, 10);
    ctx.bezierCurveTo(x + 28, 6, x + 28, 18, x + 16, 26);
    ctx.fill();
    // Shine
    if (filled) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(x + 11, 12, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawBowSprite(ctx, index) {
    const x = index * this.tileSize;
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + 16, 16, 12, Math.PI * 0.25, Math.PI * 1.75);
    ctx.stroke();
    // String
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 24, 8);
    ctx.lineTo(x + 24, 24);
    ctx.stroke();
  }

  drawArrowSprite(ctx, index) {
    const x = index * this.tileSize;
    // Shaft
    ctx.fillStyle = '#B8860B';
    ctx.fillRect(x + 6, 15, 18, 2);
    // Head
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.moveTo(x + 28, 16);
    ctx.lineTo(x + 24, 12);
    ctx.lineTo(x + 24, 20);
    ctx.closePath();
    ctx.fill();
    // Fletching
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.moveTo(x + 6, 16);
    ctx.lineTo(x + 2, 11);
    ctx.lineTo(x + 8, 14);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 6, 16);
    ctx.lineTo(x + 2, 21);
    ctx.lineTo(x + 8, 18);
    ctx.fill();
  }

  drawChestSprite(ctx, index) {
    const x = index * this.tileSize;
    // Body
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(x + 4, 12, 24, 16);
    // Lid
    ctx.fillStyle = '#A0782A';
    ctx.fillRect(x + 3, 8, 26, 6);
    ctx.beginPath();
    ctx.arc(x + 16, 10, 13, Math.PI, 0);
    ctx.fillStyle = '#A0782A';
    ctx.fill();
    // Metal bands
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + 4, 10, 24, 2);
    ctx.fillRect(x + 4, 20, 24, 2);
    // Lock
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + 13, 14, 6, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 15, 16, 2, 3);
  }

  drawCrystalSprite(ctx, index) {
    const x = index * this.tileSize;
    // Glow
    ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(x + 16, 16, 14, 0, Math.PI * 2);
    ctx.fill();
    // Crystal body
    ctx.fillStyle = '#44BBFF';
    ctx.beginPath();
    ctx.moveTo(x + 16, 2);
    ctx.lineTo(x + 8, 12);
    ctx.lineTo(x + 10, 28);
    ctx.lineTo(x + 22, 28);
    ctx.lineTo(x + 24, 12);
    ctx.closePath();
    ctx.fill();
    // Facets
    ctx.fillStyle = '#88DDFF';
    ctx.beginPath();
    ctx.moveTo(x + 16, 2);
    ctx.lineTo(x + 12, 16);
    ctx.lineTo(x + 16, 28);
    ctx.lineTo(x + 20, 16);
    ctx.closePath();
    ctx.fill();
    // Bright highlight
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(x + 13, 6, 3, 8);
  }

  drawBigHeartSprite(ctx, index) {
    const x = index * this.tileSize;
    // Glow
    ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
    ctx.beginPath();
    ctx.arc(x + 16, 16, 15, 0, Math.PI * 2);
    ctx.fill();
    // Big heart shape (fills the whole tile)
    ctx.fillStyle = '#FF1144';
    ctx.beginPath();
    ctx.moveTo(x + 16, 28);
    ctx.bezierCurveTo(x + 0, 18, x + 0, 2, x + 16, 8);
    ctx.bezierCurveTo(x + 32, 2, x + 32, 18, x + 16, 28);
    ctx.fill();
    // Inner shine
    ctx.fillStyle = '#FF4466';
    ctx.beginPath();
    ctx.moveTo(x + 16, 24);
    ctx.bezierCurveTo(x + 6, 17, x + 6, 6, x + 16, 10);
    ctx.bezierCurveTo(x + 26, 6, x + 26, 17, x + 16, 24);
    ctx.fill();
    // Sparkle
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(x + 10, 10, 3, 0, Math.PI * 2);
    ctx.fill();
    // "+" symbol
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('+', x + 16, 20);
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
