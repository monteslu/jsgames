// worldManager.js
import { TILE_TYPES } from './constants.js';

export class WorldManager {
  constructor() {
    this.worldWidth = 10;
    this.worldHeight = 10;
    this.screenWidth = 20;
    this.screenHeight = 12;
    this.currentScreenX = 0;
    this.currentScreenY = 0;
    
    // Initialize empty world grid
    this.worldGrid = Array(this.worldHeight).fill().map(() => 
      Array(this.worldWidth).fill().map(() => ({
        layout: this.createEmptyScreen(),
        items: new Set(),
        enemies: new Set(),
        visited: false
      }))
    );
  }

  createEmptyScreen() {
    return Array(this.screenHeight).fill().map(() => 
      Array(this.screenWidth).fill(TILE_TYPES.EMPTY)
    );
  }

  loadWorld(worldData) {
    // worldData should be a 10x10 array of screen definitions
    worldData.forEach((row, y) => {
      row.forEach((screenData, x) => {
        if (screenData) {
          this.worldGrid[y][x] = {
            layout: this.parseScreenLayout(screenData.layout),
            items: new Set(screenData.items || []),
            enemies: new Set(screenData.enemies || []),
            visited: false
          };
        }
      });
    });
  }

  parseScreenLayout(layout) {
    // Convert string array to 2D array of characters
    return layout.map(row => row.split(''));
  }

  getCurrentScreen() {
    return this.worldGrid[this.currentScreenY][this.currentScreenX];
  }

  getNextScreen(direction) {
    let nextX = this.currentScreenX;
    let nextY = this.currentScreenY;
    
    switch (direction) {
      case 'left':
        nextX = Math.max(0, this.currentScreenX - 1);
        break;
      case 'right':
        nextX = Math.min(this.worldWidth - 1, this.currentScreenX + 1);
        break;
      case 'up':
        nextY = Math.max(0, this.currentScreenY - 1);
        break;
      case 'down':
        nextY = Math.min(this.worldHeight - 1, this.currentScreenY + 1);
        break;
    }
    
    if (nextX === this.currentScreenX && nextY === this.currentScreenY) {
      return null; // No screen in that direction
    }
    
    return this.worldGrid[nextY][nextX];
  }

  changeScreen(direction) {
    switch (direction) {
      case 'left':
        if (this.currentScreenX > 0) {
          this.currentScreenX--;
          return true;
        }
        break;
      case 'right':
        if (this.currentScreenX < this.worldWidth - 1) {
          this.currentScreenX++;
          return true;
        }
        break;
      case 'up':
        if (this.currentScreenY > 0) {
          this.currentScreenY--;
          return true;
        }
        break;
      case 'down':
        if (this.currentScreenY < this.worldHeight - 1) {
          this.currentScreenY++;
          return true;
        }
        break;
    }
    return false;
  }

  isWalkable(x, y) {
    const screen = this.getCurrentScreen();
    const tileX = Math.floor(x);
    const tileY = Math.floor(y);
    
    if (tileX < 0 || tileX >= this.screenWidth || 
        tileY < 0 || tileY >= this.screenHeight) {
      return false;
    }
    
    const tile = screen.layout[tileY][tileX];
    return tile === TILE_TYPES.EMPTY || 
           tile === TILE_TYPES.BRIDGE ||
           (tile === TILE_TYPES.DOOR && this.hasKey);
  }

  getTile(x, y) {
    const screen = this.getCurrentScreen();
    if (x < 0 || x >= this.screenWidth || 
        y < 0 || y >= this.screenHeight) {
      return TILE_TYPES.WALL;
    }
    return screen.layout[y][x];
  }

  removeItem(x, y) {
    const screen = this.getCurrentScreen();
    if (screen.items.has(`${x},${y}`)) {
      screen.items.delete(`${x},${y}`);
      return true;
    }
    return false;
  }

  drawMiniMap(ctx, x, y, scale) {
    const mapWidth = this.worldWidth * scale;
    const mapHeight = this.worldHeight * scale;
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, mapWidth, mapHeight);
    
    // Draw visited screens
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.worldGrid.forEach((row, screenY) => {
      row.forEach((screen, screenX) => {
        if (screen.visited) {
          ctx.fillRect(
            x + screenX * scale,
            y + screenY * scale,
            scale,
            scale
          );
        }
      });
    });
    
    // Draw current screen
    ctx.fillStyle = 'white';
    ctx.fillRect(
      x + this.currentScreenX * scale,
      y + this.currentScreenY * scale,
      scale,
      scale
    );
  }

  drawScreen(ctx, resources) {
    const screen = this.getCurrentScreen();
    const tileSheet = resources.images.tiles;
    
    screen.layout.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile === TILE_TYPES.EMPTY) return;
        
        const tileIndex = SPRITE_CONFIG.tiles.mapping[tile] || 0;
        const srcX = tileIndex * SPRITE_CONFIG.tiles.frameWidth;
        
        ctx.drawImage(
          tileSheet,
          srcX,
          0,
          SPRITE_CONFIG.tiles.frameWidth,
          SPRITE_CONFIG.tiles.frameHeight,
          x * 32,
          y * 32,
          32,
          32
        );
      });
    });
    
    // Draw items
    const itemSheet = resources.images.items;
    screen.items.forEach(itemPos => {
      const [x, y] = itemPos.split(',').map(Number);
      const tile = screen.layout[y][x];
      const itemIndex = SPRITE_CONFIG.items.mapping[tile] || 0;
      
      ctx.drawImage(
        itemSheet,
        itemIndex * SPRITE_CONFIG.items.frameWidth,
        0,
        SPRITE_CONFIG.items.frameWidth,
        SPRITE_CONFIG.items.frameHeight,
        x * 32,
        y * 32,
        32,
        32
      );
    });
  }
}
