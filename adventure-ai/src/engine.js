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
    
    return this.resources.load().then(() => {
      this.currentState = this.GAME_STATES.PLAYING;
    });
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
    if (!this.screenTransition) return;
    
    // Calculate transition offsets based on direction
    let currentX = 0;
    let currentY = 0;
    let nextX = 0;
    let nextY = 0;
    
    switch (this.transitionDirection) {
      case 'right':
        nextX = this.width * (1 - this.transitionProgress);
        currentX = -this.width * this.transitionProgress;
        break;
      case 'left':
        nextX = -this.width * (1 - this.transitionProgress);
        currentX = this.width * this.transitionProgress;
        break;
      case 'down':
        nextY = this.height * (1 - this.transitionProgress);
        currentY = -this.height * this.transitionProgress;
        break;
      case 'up':
        nextY = -this.height * (1 - this.transitionProgress);
        currentY = this.height * this.transitionProgress;
        break;
    }
    
    // Draw both screens
    this.ctx.save();
    this.ctx.translate(currentX, currentY);
    this.drawScreen(this.currentScreen);
    this.ctx.restore();
    
    this.ctx.save();
    this.ctx.translate(nextX, nextY);
    this.drawScreen(this.nextScreen);
    this.ctx.restore();
  }

  drawScreen(screen) {
    // To be implemented in game.js
  }
}
