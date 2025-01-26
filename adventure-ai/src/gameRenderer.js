// gameRenderer.js
import { STATUS_BAR, COLORS, GAME_STATES, SPRITE_CONFIG, TILE_TYPES } from './constants.js';
import { drawLoadingScreen } from './utils.js';

export class GameRenderer {
  constructor(canvas, resources) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resources = resources;
  }

  handleResize() {
    const aspectRatio = this.canvas.width / this.canvas.height;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (windowWidth / windowHeight > aspectRatio) {
      this.canvas.style.width = `${windowHeight * aspectRatio}px`;
      this.canvas.style.height = `${windowHeight}px`;
    } else {
      this.canvas.style.width = `${windowWidth}px`;
      this.canvas.style.height = `${windowWidth / aspectRatio}px`;
    }
    
    this.ctx.imageSmoothingEnabled = false;
  }

  draw({ gameState, player, worldManager, combatSystem, transitionManager }) {
    if (!this.resources.isComplete()) {
      drawLoadingScreen(this.ctx, this.resources.getPercentComplete());
      return;
    }
    // Get current screen and its background color
    const currentScreen = worldManager.getCurrentScreen();
    // console.log('currentScreen', currentScreen);
    const backgroundColor = currentScreen?.backgroundColor || COLORS.tan;
    
    // Draw background with either custom color or default tan
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw status bar (always on top)
    this.drawStatusBar(player, worldManager);
    
    // Draw game area based on state
    if (gameState === GAME_STATES.PLAYING) {
      this.drawPlayArea(player, worldManager, combatSystem);
    } else if (gameState === GAME_STATES.TRANSITIONING) {
      this.drawTransition(player, worldManager, transitionManager);
    }
  }

  drawStatusBar(player, worldManager) {
    // Draw status bar background
    this.ctx.fillStyle = COLORS.black;
    this.ctx.fillRect(0, 0, this.canvas.width, STATUS_BAR.height);

    // Draw sections in order: health, minimap, weapons
    this.drawHealthSection(player);
    this.drawMinimapSection(worldManager);
    this.drawWeaponsSection(player);
  }

  drawHealthSection(player) {
    const section = STATUS_BAR.sections.health;
    
    for (let i = 0; i < player.maxHealth; i++) {
      const filled = i < player.health;
      this.ctx.drawImage(
        this.resources.images.items,
        (filled ? 2 : 3) * SPRITE_CONFIG.items.frameWidth,
        0,
        SPRITE_CONFIG.items.frameWidth,
        SPRITE_CONFIG.items.frameHeight,
        section.x + i * (STATUS_BAR.heartWidth + STATUS_BAR.heartSpacing),
        section.y,
        STATUS_BAR.heartWidth,
        STATUS_BAR.heartHeight
      );
    }
  }

  drawMinimapSection(worldManager) {
    const section = STATUS_BAR.sections.minimap;
    const minimapWidth = worldManager.worldWidth * STATUS_BAR.miniMap.screenWidth;
    const minimapHeight = worldManager.worldHeight * STATUS_BAR.miniMap.screenHeight;
    
    // Calculate center position if needed
    const x = section.x === 'center' 
      ? (this.canvas.width - minimapWidth) / 2 
      : section.x;

    worldManager.drawMiniMap(
      this.ctx,
      x,
      section.y
    );
  }

  drawWeaponsSection(player) {
    const section = STATUS_BAR.sections.weapons;
    const weaponsX = section.x < 0 
      ? this.canvas.width + section.x 
      : section.x;

    // Draw weapons from right to left
    let currentX = weaponsX;

    // Draw sword if player has it
    if (player.inventory.sword) {
      this.ctx.drawImage(
        this.resources.images.items,
        SPRITE_CONFIG.items.mapping[TILE_TYPES.SWORD] * SPRITE_CONFIG.items.frameWidth,
        0,
        SPRITE_CONFIG.items.frameWidth,
        SPRITE_CONFIG.items.frameHeight,
        currentX,
        section.y,
        STATUS_BAR.weaponSize,
        STATUS_BAR.weaponSize
      );
      currentX -= STATUS_BAR.weaponSize + STATUS_BAR.weaponSpacing;
    }

    // Draw bow and arrows if player has them
    if (player.inventory.bow) {
      this.ctx.drawImage(
        this.resources.images.items,
        SPRITE_CONFIG.items.mapping[TILE_TYPES.BOW] * SPRITE_CONFIG.items.frameWidth,
        0,
        SPRITE_CONFIG.items.frameWidth,
        SPRITE_CONFIG.items.frameHeight,
        currentX,
        section.y,
        STATUS_BAR.weaponSize,
        STATUS_BAR.weaponSize
      );

      // Draw arrow count
      this.drawItemCount(
        player.inventory.arrows,
        currentX + STATUS_BAR.weaponSize / 2,
        section.y + STATUS_BAR.weaponSize + 16
      );
      currentX -= STATUS_BAR.weaponSize + STATUS_BAR.weaponSpacing;
    }

    // Draw keys if player has any
    if (player.inventory.keys > 0) {
      this.ctx.drawImage(
        this.resources.images.items,
        SPRITE_CONFIG.items.mapping[TILE_TYPES.KEY] * SPRITE_CONFIG.items.frameWidth,
        0,
        SPRITE_CONFIG.items.frameWidth,
        SPRITE_CONFIG.items.frameHeight,
        currentX,
        section.y,
        STATUS_BAR.weaponSize,
        STATUS_BAR.weaponSize
      );

      this.drawItemCount(
        player.inventory.keys,
        currentX + STATUS_BAR.weaponSize / 2,
        section.y + STATUS_BAR.weaponSize + 16
      );
    }
  }

  drawItemCount(count, x, y) {
    this.ctx.fillStyle = COLORS.white;
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`×${count}`, x, y);
  }

  drawPlayArea(player, worldManager, combatSystem) {
    this.ctx.save();
    this.ctx.translate(0, STATUS_BAR.height);
    worldManager.drawScreen(this.ctx, this.resources);
    combatSystem.draw(this.ctx);
    player.draw(this.ctx);
    this.ctx.restore();
  }

  drawTransition(player, worldManager, transitionManager) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, STATUS_BAR.height, this.canvas.width, this.canvas.height - STATUS_BAR.height);
    this.ctx.clip();
    
    transitionManager.draw(this.ctx, this.canvas, worldManager, this.resources);
    
    this.ctx.restore();
  }
}