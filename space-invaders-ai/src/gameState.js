import { getInput } from './utils.js';
import { PLAYER_SETTINGS } from './constants.js';

export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.score = 0;
    this.lives = PLAYER_SETTINGS.LIVES;
    this.gameOver = false;
    this.lastTime = null;
  }

  update(deltaTime) {
    const [input] = getInput();
    
    if (this.gameOver && (input.START.pressed || input.BUTTON_SOUTH.pressed)) {
      console.log('resetting game');
      this.reset();
    }

    // Check for game over condition
    if (this.lives <= 0) {
      this.gameOver = true;
    }
  }

  addScore(points) {
    this.score += points;
  }

  getScore() {
    return this.score;
  }

  getLives() {
    return this.lives;
  }

  loseLife() {
    this.lives--;
    if (this.lives <= 0) {
      this.gameOver = true;
    }
  }

  setGameOver() {
    this.gameOver = true;
  }

  isGameOver() {
    return this.gameOver;
  }
}