// engine.js
import { getInput } from './utils.js';

export class GameEngine {
  constructor(canvas, resources) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resources = resources;
    this.width = canvas.width;
    this.height = canvas.height;
    this.tileSize = 32;
    this.playAreaWidth = 20;
    this.playAreaHeight = 12;
    this.statusBarHeight = 96;
    this.currentScreen = null;
    this.nextScreen = null;
    this.screenTransition = null;
    this.lastTime = performance.now();
    
    // Constants for game state
    this.GAME_STATES = {
      LOADING: 'loading',
      PLAYING: 'playing',
      TRANSITIONING: 'transitioning',
      PAUSED: 'paused'
    };
    
    this.currentState = this.GAME_STATES.LOADING;
    
    // Screen transition properties
    this.transitionProgress = 0;
    this.transitionSpeed = 0.005; // Progress per millisecond
    this.transitionDirection = null;
  }

  init() {
    // Load resources
    this.resources.addImage('tiles', 'images/tiles.png');
    this.resources.addImage('player', 'images/player.png');
    this.resources.addImage('items', 'images/items.png');
    this.resources.addSound('sword', 'sounds/sword.mp3');
    this.resources.addSound('item', 'sounds/item.mp3');
    this.resources.addSound('hurt', 'sounds/hurt.mp3');
    this.resources.addSound('tada', 'sounds/tada.mp3');
    this.currentState = this.GAME_STATES.LOADING;
    
    return this.resources.load();
  }

  update(deltaTime) {
    const input = getInput()[0]; // Get first player's input
    
    switch (this.currentState) {
      case this.GAME_STATES.PLAYING:
        this.updatePlaying(deltaTime, input);
        break;
      case this.GAME_STATES.TRANSITIONING:
        this.updateTransition(deltaTime);
        break;
    }
  }

  updatePlaying(deltaTime, input) {
    // To be implemented in game.js
  }

  updateTransition(deltaTime) {
    if (!this.screenTransition) return;
    
    this.transitionProgress += this.transitionSpeed * deltaTime;
    
    if (this.transitionProgress >= 1) {
      this.currentScreen = this.nextScreen;
      this.nextScreen = null;
      this.screenTransition = null;
      this.transitionProgress = 0;
      this.currentState = this.GAME_STATES.PLAYING;
    }
  }

  startScreenTransition(direction, nextScreen) {
    this.currentState = this.GAME_STATES.TRANSITIONING;
    this.transitionDirection = direction;
    this.nextScreen = nextScreen;
    this.transitionProgress = 0;
  }

  draw() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.width, this.height);
    console.log('this.resources.isComplete()', this.resources.isComplete(), this.currentState);
    if (!this.resources.isComplete()) {

      this.drawLoading();
      return;
    }
    
    switch (this.currentState) {
      case this.GAME_STATES.LOADING:
        this.drawLoading();
        break;
      case this.GAME_STATES.PLAYING:
        this.drawPlaying();
        break;
      case this.GAME_STATES.TRANSITIONING:
        this.drawTransition();
        break;
    }
  }

  drawLoading() {
    const percent = this.resources.getPercentComplete();
    this.ctx.fillStyle = 'white';
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Loading... ${Math.floor(percent * 100)}%`, this.width / 2, this.height / 2);
  }

  drawPlaying() {
    // To be implemented in game.js
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
        const playAreaHeight = this.canvas.height - STATUS_BAR.height;
        
        // Current screen moving up
        this.ctx.save();
        this.ctx.translate(0, -playAreaHeight * progress + STATUS_BAR.height);
        this.worldManager.drawScreen(this.ctx, this.resources);
        this.ctx.restore();
        
        // Next screen coming from bottom
        if (nextScreen) {
          this.ctx.save();
          this.ctx.translate(0, playAreaHeight * (1 - progress) + STATUS_BAR.height);
          this.worldManager.currentScreenY++;
          this.worldManager.drawScreen(this.ctx, this.resources);
          this.ctx.restore();
        }
        break;
      }

      case 'up': {
        const nextScreen = this.worldManager.getNextScreen('up');
        const playAreaHeight = this.canvas.height - STATUS_BAR.height;
        
        // Current screen moving down
        this.ctx.save();
        this.ctx.translate(0, playAreaHeight * progress + STATUS_BAR.height);
        this.worldManager.drawScreen(this.ctx, this.resources);
        this.ctx.restore();
        
        // Next screen coming from top
        if (nextScreen) {
          this.ctx.save();
          this.ctx.translate(0, -playAreaHeight * (1 - progress) + STATUS_BAR.height);
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

  drawScreen(screen) {
    // To be implemented in game.js
  }
}
