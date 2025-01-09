// game.js
import { GameEngine } from './engine.js';
import { Player } from './player.js';
import { WorldManager } from './worldManager.js';
import { STATUS_BAR, COLORS, GAME_STATES } from './constants.js';
import { WORLD_DATA } from './worldData.js';
import { playSound, getInput } from './utils.js';
import { CombatSystem } from './combat.js';

export class Game extends GameEngine {
  constructor(canvas, resources) {
    super(canvas, resources);
    this.combatSystem = new CombatSystem(resources);
    this.worldManager = new WorldManager(this.combatSystem);
    this.player = null;
    this.gameState = GAME_STATES.LOADING;
    this.transitionState = {
      active: false,
      direction: null,
      progress: 0,
      duration: 500
    };
    this.init();
  }

  async init() {
    await super.init();
    this.worldManager.loadWorld(WORLD_DATA);
    this.player = new Player(10, 6, this.resources, this.combatSystem, this.worldManager);
    this.lastTime = performance.now();
    this.gameState = GAME_STATES.PLAYING;
    this.gameLoop();
  }

  handleResize() {
    const canvas = this.canvas;
    const aspectRatio = canvas.width / canvas.height;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (windowWidth / windowHeight > aspectRatio) {
      canvas.style.width = `${windowHeight * aspectRatio}px`;
      canvas.style.height = `${windowHeight}px`;
    } else {
      canvas.style.width = `${windowWidth}px`;
      canvas.style.height = `${windowWidth / aspectRatio}px`;
    }
    
    this.ctx.imageSmoothingEnabled = false;
  }

  gameLoop() {
    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastTime, 32);
    this.update(deltaTime);
    this.draw();
    this.lastTime = currentTime;
    requestAnimationFrame(() => this.gameLoop());
  }

  update(deltaTime) {
    if (this.gameState === GAME_STATES.PLAYING) {
      const input = getInput()[0];
      const oldX = this.player.x;
      const oldY = this.player.y;
      this.player.update(deltaTime, input);
      
      if (!this.worldManager.isWalkable(this.player.x, this.player.y)) {
        this.player.x = oldX;
        this.player.y = oldY;
      }
      
      this.checkScreenTransitions();
      this.combatSystem.update(deltaTime, this.player, this.worldManager.getEnemies(), this.worldManager);
      this.worldManager.update(deltaTime, this.player);
      this.checkItemCollection();
    } else if (this.gameState === GAME_STATES.TRANSITIONING) {
      this.updateTransition(deltaTime);
    }
  }

// game.js
checkScreenTransitions() {
    let transitionDirection = null;
    let newPlayerX = this.player.x;
    let newPlayerY = this.player.y;
    
    const hitboxHalf = this.player.hitboxSize / 2;
    const transitionBuffer = 0.45;

    // Left transition    
    if (this.player.x - hitboxHalf < -transitionBuffer) {
      if (this.worldManager.getNextScreen('left')) {
        transitionDirection = 'left';
        newPlayerX = this.worldManager.screenWidth - hitboxHalf - transitionBuffer;
      } else {
        this.player.x = hitboxHalf + transitionBuffer;
      }
    } 
    // Right transition
    else if (this.player.x + hitboxHalf > this.worldManager.screenWidth + transitionBuffer) {
      if (this.worldManager.getNextScreen('right')) {
        transitionDirection = 'right';
        newPlayerX = hitboxHalf + transitionBuffer;
      } else {
        this.player.x = this.worldManager.screenWidth - hitboxHalf - transitionBuffer;
      }
    }
    
    // Up transition
    if (this.player.y - hitboxHalf < -transitionBuffer) {
      if (this.worldManager.getNextScreen('up')) {
        transitionDirection = 'up';
        newPlayerY = this.worldManager.screenHeight - hitboxHalf - transitionBuffer;
      } else {
        this.player.y = hitboxHalf + transitionBuffer;
      }
    } 
    // Down transition
    else if (this.player.y + hitboxHalf > this.worldManager.screenHeight + transitionBuffer) {
      if (this.worldManager.getNextScreen('down')) {
        transitionDirection = 'down';
        newPlayerY = hitboxHalf + transitionBuffer;
      } else {
        this.player.y = this.worldManager.screenHeight - hitboxHalf - transitionBuffer;
      }
    }
    
    if (transitionDirection) {
      this.startScreenTransition(transitionDirection);
      this.player.x = newPlayerX;
      this.player.y = newPlayerY;
    }
  }
  startScreenTransition(direction) {
    this.gameState = GAME_STATES.TRANSITIONING;
    this.transitionState = {
      active: true,
      direction: direction,
      progress: 0,
      duration: 500
    };
  }

  updateTransition(deltaTime) {
    this.transitionState.progress += deltaTime;
    
    if (this.transitionState.progress >= this.transitionState.duration) {
      this.worldManager.changeScreen(this.transitionState.direction);
      this.gameState = GAME_STATES.PLAYING;
      this.transitionState.active = false;
      this.transitionState.progress = 0;
    }
  }

  checkItemCollection() {
    const tile = this.worldManager.getTile(
      Math.floor(this.player.x), 
      Math.floor(this.player.y)
    );
    
    if (this.worldManager.removeItem(
      Math.floor(this.player.x), 
      Math.floor(this.player.y))
    ) {
      playSound(this.resources.sounds.item);
      this.player.addItem(tile);
    }
  }

  draw() {
    this.ctx.fillStyle = COLORS.tan;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw status bar (always on top, no animation)
    this.drawStatusBar();
    
    if (this.gameState === GAME_STATES.PLAYING) {
      this.drawPlayArea();
    } else if (this.gameState === GAME_STATES.TRANSITIONING) {
      this.drawTransition();
    }
  }

  drawPlayArea() {
    this.ctx.save();
    this.ctx.translate(0, STATUS_BAR.height);
    this.worldManager.drawScreen(this.ctx, this.resources);
    this.combatSystem.draw(this.ctx);
    this.player.draw(this.ctx);
    this.ctx.restore();
  }

  drawTransition() {
    const progress = this.transitionState.progress / this.transitionState.duration;
    const direction = this.transitionState.direction;
    
    // Save original screen position
    const savedX = this.worldManager.currentScreenX;
    const savedY = this.worldManager.currentScreenY;
    
    // Set clip region to play area only
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, STATUS_BAR.height, this.canvas.width, this.canvas.height - STATUS_BAR.height);
    this.ctx.clip();
    
    // Draw both screens based on direction
    switch(direction) {
      case 'right': {
        const nextScreen = this.worldManager.getNextScreen('right');
        // Current screen moving left
        this.ctx.save();
        this.ctx.translate(-this.canvas.width * progress, STATUS_BAR.height);
        this.worldManager.drawScreen(this.ctx, this.resources);
        this.ctx.restore();
        
        // Next screen coming from right
        if (nextScreen) {
          this.ctx.save();
          this.ctx.translate(this.canvas.width * (1 - progress), STATUS_BAR.height);
          this.worldManager.currentScreenX++;
          this.worldManager.drawScreen(this.ctx, this.resources);
          this.ctx.restore();
        }
        break;
      }

      case 'left': {
        const nextScreen = this.worldManager.getNextScreen('left');
        // Current screen moving right
        this.ctx.save();
        this.ctx.translate(this.canvas.width * progress, STATUS_BAR.height);
        this.worldManager.drawScreen(this.ctx, this.resources);
        this.ctx.restore();
        
        // Next screen coming from left
        if (nextScreen) {
          this.ctx.save();
          this.ctx.translate(-this.canvas.width * (1 - progress), STATUS_BAR.height);
          this.worldManager.currentScreenX--;
          this.worldManager.drawScreen(this.ctx, this.resources);
          this.ctx.restore();
        }
        break;
      }

      case 'down': {
        const nextScreen = this.worldManager.getNextScreen('down');
        // Current screen moving up
        this.ctx.save();
        this.ctx.translate(0, -this.canvas.height * progress + STATUS_BAR.height);
        this.worldManager.drawScreen(this.ctx, this.resources);
        this.ctx.restore();
        
        // Next screen coming from bottom
        if (nextScreen) {
          this.ctx.save();
          this.ctx.translate(0, this.canvas.height * (1 - progress) + STATUS_BAR.height);
          this.worldManager.currentScreenY++;
          this.worldManager.drawScreen(this.ctx, this.resources);
          this.ctx.restore();
        }
        break;
      }

      case 'up': {
        const nextScreen = this.worldManager.getNextScreen('up');
        // Current screen moving down
        this.ctx.save();
        this.ctx.translate(0, this.canvas.height * progress + STATUS_BAR.height);
        this.worldManager.drawScreen(this.ctx, this.resources);
        this.ctx.restore();
        
        // Next screen coming from top
        if (nextScreen) {
          this.ctx.save();
          this.ctx.translate(0, -this.canvas.height * (1 - progress) + STATUS_BAR.height);
          this.worldManager.currentScreenY--;
          this.worldManager.drawScreen(this.ctx, this.resources);
          this.ctx.restore();
        }
        break;
      }
    }
    
    // Restore original screen position and clip
    this.worldManager.currentScreenX = savedX;
    this.worldManager.currentScreenY = savedY;
    this.ctx.restore();
  }

  drawStatusBar() {
    this.ctx.fillStyle = COLORS.black;
    this.ctx.fillRect(0, 0, this.canvas.width, STATUS_BAR.height);
    
    for (let i = 0; i < this.player.maxHealth; i++) {
      const filled = i < this.player.health;
      this.ctx.drawImage(
        this.resources.images.items,
        (filled ? 2 : 3) * 32,
        0,
        32,
        32,
        STATUS_BAR.padding + i * (STATUS_BAR.heartWidth + STATUS_BAR.heartSpacing),
        STATUS_BAR.padding,
        STATUS_BAR.heartWidth,
        STATUS_BAR.heartHeight
      );
    }
    
    if (this.player.inventory.sword) {
      this.ctx.drawImage(
        this.resources.images.items,
        32,
        0,
        32,
        32,
        this.canvas.width - STATUS_BAR.padding - STATUS_BAR.weaponSize,
        STATUS_BAR.padding,
        STATUS_BAR.weaponSize,
        STATUS_BAR.weaponSize
      );
    }
    
    if (this.player.inventory.keys > 0) {
      this.ctx.drawImage(
        this.resources.images.items,
        0,
        0,
        32,
        32,
        this.canvas.width - STATUS_BAR.padding - STATUS_BAR.weaponSize * 2,
        STATUS_BAR.padding,
        STATUS_BAR.weaponSize,
        STATUS_BAR.weaponSize
      );
      
      this.ctx.fillStyle = COLORS.white;
      this.ctx.font = '24px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        `×${this.player.inventory.keys}`,
        this.canvas.width - STATUS_BAR.padding - STATUS_BAR.weaponSize * 1.5,
        STATUS_BAR.padding + STATUS_BAR.weaponSize * 0.75
      );
    }
    
    this.worldManager.drawMiniMap(
      this.ctx,
      this.canvas.width / 2 - (this.worldManager.worldWidth * STATUS_BAR.miniMapScale) / 2,
      STATUS_BAR.padding,
      STATUS_BAR.miniMapScale
    );
  }
}