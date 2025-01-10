// transitionManager.js
import { STATUS_BAR, COLORS } from './constants.js';

export class TransitionManager {
  constructor() {
    this.active = false;
    this.direction = null;
    this.progress = 0;
    this.duration = 500;
  }

  checkTransition(player, worldManager) {
    const hitboxHalf = player.hitboxSize / 2;
    const transitionBuffer = 0.45;
    let transition = null;

    // Left transition    
    if (player.x - hitboxHalf < -transitionBuffer) {
      if (worldManager.getNextScreen('left')) {
        transition = {
          direction: 'left',
          newX: worldManager.screenWidth - hitboxHalf - transitionBuffer,
          newY: player.y
        };
      }
    } 
    // Right transition
    else if (player.x + hitboxHalf > worldManager.screenWidth + transitionBuffer) {
      if (worldManager.getNextScreen('right')) {
        transition = {
          direction: 'right',
          newX: hitboxHalf + transitionBuffer,
          newY: player.y
        };
      }
    }
    
    // Up transition
    if (player.y - hitboxHalf < -transitionBuffer) {
      if (worldManager.getNextScreen('up')) {
        transition = {
          direction: 'up',
          newX: player.x,
          newY: worldManager.screenHeight - hitboxHalf - transitionBuffer
        };
      }
    } 
    // Down transition
    else if (player.y + hitboxHalf > worldManager.screenHeight + transitionBuffer) {
      if (worldManager.getNextScreen('down')) {
        transition = {
          direction: 'down',
          newX: player.x,
          newY: hitboxHalf + transitionBuffer
        };
      }
    }

    if (transition) {
      this.start(transition.direction);
    }

    return transition;
  }

  start(direction) {
    this.active = true;
    this.direction = direction;
    this.progress = 0;
  }

  update(deltaTime) {
    if (!this.active) return;
    
    this.progress += deltaTime;
    
    if (this.progress >= this.duration) {
      this.active = false;
    }
  }

  isComplete() {
    return this.progress >= this.duration;
  }

  getProgress() {
    return this.progress / this.duration;
  }

  draw(ctx, canvas, worldManager, resources) {
    const progress = this.getProgress();
    const direction = this.direction;
    
    // Store original screen position
    const savedX = worldManager.currentScreenX;
    const savedY = worldManager.currentScreenY;
    
    switch(direction) {
      case 'right':
        this.drawHorizontalTransition(ctx, canvas, worldManager, resources, progress, 1);
        break;
      case 'left':
        this.drawHorizontalTransition(ctx, canvas, worldManager, resources, progress, -1);
        break;
      case 'down':
        this.drawVerticalTransition(ctx, canvas, worldManager, resources, progress, 1);
        break;
      case 'up':
        this.drawVerticalTransition(ctx, canvas, worldManager, resources, progress, -1);
        break;
    }
    
    // Restore original screen position
    worldManager.currentScreenX = savedX;
    worldManager.currentScreenY = savedY;
  }

  drawHorizontalTransition(ctx, canvas, worldManager, resources, progress, direction) {
    const nextScreen = worldManager.getNextScreen(direction > 0 ? 'right' : 'left');
    const playAreaHeight = canvas.height - STATUS_BAR.height;

    // Draw current screen and its background
    const currentScreen = worldManager.getCurrentScreen();
    ctx.save();
    ctx.translate(-canvas.width * progress * direction, STATUS_BAR.height);
    
    // Draw background for current screen
    ctx.fillStyle = currentScreen.backgroundColor || COLORS.tan;
    ctx.fillRect(0, 0, canvas.width, playAreaHeight);
    worldManager.drawScreen(ctx, resources);
    ctx.restore();
    
    // Draw next screen and its background if it exists
    if (nextScreen) {
      ctx.save();
      ctx.translate(canvas.width * (1 - progress) * direction, STATUS_BAR.height);
      
      if (direction > 0) {
        worldManager.currentScreenX++;
      } else {
        worldManager.currentScreenX--;
      }

      // Draw background for next screen
      const nextScreenObj = worldManager.getCurrentScreen();
      ctx.fillStyle = nextScreenObj.backgroundColor || COLORS.tan;
      ctx.fillRect(0, 0, canvas.width, playAreaHeight);
      worldManager.drawScreen(ctx, resources);
      ctx.restore();
    }
  }

  drawVerticalTransition(ctx, canvas, worldManager, resources, progress, direction) {
    const nextScreen = worldManager.getNextScreen(direction > 0 ? 'down' : 'up');
    const playAreaHeight = canvas.height - STATUS_BAR.height;
    
    // Draw current screen and its background
    const currentScreen = worldManager.getCurrentScreen();
    ctx.save();
    ctx.translate(0, -playAreaHeight * progress * direction + STATUS_BAR.height);
    
    // Draw background for current screen
    ctx.fillStyle = currentScreen.backgroundColor || COLORS.tan;
    ctx.fillRect(0, 0, canvas.width, playAreaHeight);
    worldManager.drawScreen(ctx, resources);
    ctx.restore();
    
    // Draw next screen and its background if it exists
    if (nextScreen) {
      ctx.save();
      ctx.translate(0, playAreaHeight * (1 - progress) * direction + STATUS_BAR.height);
      
      if (direction > 0) {
        worldManager.currentScreenY++;
      } else {
        worldManager.currentScreenY--;
      }

      // Draw background for next screen
      const nextScreenObj = worldManager.getCurrentScreen();
      ctx.fillStyle = nextScreenObj.backgroundColor || COLORS.tan;
      ctx.fillRect(0, 0, canvas.width, playAreaHeight);
      worldManager.drawScreen(ctx, resources);
      ctx.restore();
    }
  }
}