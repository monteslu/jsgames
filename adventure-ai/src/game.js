// game.js
import { GameEngine } from './engine.js';
import { Player } from './player.js';
import { WorldManager } from './worldManager.js';
import { STATUS_BAR, COLORS } from './constants.js';
import { WORLD_DATA } from './worldData.js';
import { playSound } from './utils.js';

export class Game extends GameEngine {
  constructor(canvas, resources) {
    super(canvas, resources);
    this.worldManager = new WorldManager();
    this.player = null;
    this.init();
  }

  async init() {
    await super.init();
    
    // Load world data
    this.worldManager.loadWorld(WORLD_DATA);
    
    // Create player at starting position
    this.player = new Player(10, 6, this.resources);
    
    // Start game loop
    this.lastTime = performance.now();
    this.gameLoop();
  }

  handleResize() {
    const canvas = this.canvas;
    const aspectRatio = canvas.width / canvas.height;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (windowWidth / windowHeight > aspectRatio) {
      // Window is wider than canvas aspect ratio
      canvas.style.width = `${windowHeight * aspectRatio}px`;
      canvas.style.height = `${windowHeight}px`;
    } else {
      // Window is taller than canvas aspect ratio
      canvas.style.width = `${windowWidth}px`;
      canvas.style.height = `${windowWidth / aspectRatio}px`;
    }
    
    // Ensure pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  gameLoop() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    this.update(deltaTime);
    this.draw();
    
    this.lastTime = currentTime;
    requestAnimationFrame(() => this.gameLoop());
  }

  updatePlaying(deltaTime, input) {
    // Update player
    const oldX = this.player.x;
    const oldY = this.player.y;
    this.player.update(deltaTime, input);
    
    // Check screen transitions
    this.checkScreenTransitions();
    
    // Check collisions
    if (!this.worldManager.isWalkable(this.player.x, this.player.y)) {
      this.player.x = oldX;
      this.player.y = oldY;
    }
    
    // Check item collection
    this.checkItemCollection();
  }

  checkScreenTransitions() {
    // Check if player has moved off screen
    if (this.player.x < 0) {
      if (this.worldManager.getNextScreen('left')) {
        this.startScreenTransition('left');
        this.player.x = this.playAreaWidth - 1;
      } else {
        this.player.x = 0;
      }
    } else if (this.player.x >= this.playAreaWidth) {
      if (this.worldManager.getNextScreen('right')) {
        this.startScreenTransition('right');
        this.player.x = 0;
      } else {
        this.player.x = this.playAreaWidth - 1;
      }
    } else if (this.player.y < 0) {
      if (this.worldManager.getNextScreen('up')) {
        this.startScreenTransition('up');
        this.player.y = this.playAreaHeight - 1;
      } else {
        this.player.y = 0;
      }
    } else if (this.player.y >= this.playAreaHeight) {
      if (this.worldManager.getNextScreen('down')) {
        this.startScreenTransition('down');
        this.player.y = 0;
      } else {
        this.player.y = this.playAreaHeight - 1;
      }
    }
  }

  checkItemCollection() {
    const tile = this.worldManager.getTile(this.player.tileX, this.player.tileY);
    if (this.worldManager.removeItem(this.player.tileX, this.player.tileY)) {
      // Play sound
      playSound(this.resources.sounds.item);
      
      // Update player inventory based on item type
      switch (tile) {
        case 'k':
          this.player.inventory.keys++;
          break;
        case 's':
          this.player.inventory.sword = true;
          break;
        case 'h':
          this.player.health = Math.min(this.player.health + 1, this.player.maxHealth);
          break;
      }
    }
  }

  drawPlaying() {
    // Draw game area background
    this.ctx.fillStyle = COLORS.black;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw status bar
    this.drawStatusBar();
    
    // Set up transform for game area
    this.ctx.save();
    this.ctx.translate(0, STATUS_BAR.height);
    
    // Draw current screen
    this.worldManager.drawScreen(this.ctx, this.resources);
    
    // Draw player
    this.player.draw(this.ctx);
    
    this.ctx.restore();
  }

  drawStatusBar() {
    // Draw status bar background
    this.ctx.fillStyle = COLORS.gray;
    this.ctx.fillRect(0, 0, this.width, STATUS_BAR.height);
    
    // Draw hearts
    const heartSheet = this.resources.images.items;
    for (let i = 0; i < this.player.maxHealth; i++) {
      const filled = i < this.player.health;
      this.ctx.drawImage(
        heartSheet,
        (filled ? 2 : 3) * 32, // Frame 2 for filled heart, 3 for empty
        0,
        32,
        32,
        STATUS_BAR.padding + i * (STATUS_BAR.heartWidth + STATUS_BAR.heartSpacing),
        STATUS_BAR.padding,
        STATUS_BAR.heartWidth,
        STATUS_BAR.heartHeight
      );
    }
    
    // Draw current weapon
    if (this.player.inventory.sword) {
      this.ctx.drawImage(
        this.resources.images.items,
        32, // Sword sprite
        0,
        32,
        32,
        this.width - STATUS_BAR.padding - STATUS_BAR.weaponSize,
        STATUS_BAR.padding,
        STATUS_BAR.weaponSize,
        STATUS_BAR.weaponSize
      );
    }
    
    // Draw key count
    if (this.player.inventory.keys > 0) {
      this.ctx.drawImage(
        this.resources.images.items,
        0, // Key sprite
        0,
        32,
        32,
        this.width - STATUS_BAR.padding - STATUS_BAR.weaponSize * 2,
        STATUS_BAR.padding,
        STATUS_BAR.weaponSize,
        STATUS_BAR.weaponSize
      );
      
      this.ctx.fillStyle = COLORS.white;
      this.ctx.font = '24px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        `×${this.player.inventory.keys}`,
        this.width - STATUS_BAR.padding - STATUS_BAR.weaponSize * 1.5,
        STATUS_BAR.padding + STATUS_BAR.weaponSize * 0.75
      );
    }
    
    // Draw mini-map
    this.worldManager.drawMiniMap(
      this.ctx,
      this.width / 2 - (this.worldManager.worldWidth * STATUS_BAR.miniMapScale) / 2,
      STATUS_BAR.padding,
      STATUS_BAR.miniMapScale
    );
  }
}
