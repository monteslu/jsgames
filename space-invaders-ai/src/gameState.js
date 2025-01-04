import { getInput } from './utils.js';
import { PLAYER_SETTINGS } from './constants.js';
import { playSound } from './utils.js';

export class GameState {
  constructor(gameOverSound) {
    this.gameOverSound = gameOverSound;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.lives = PLAYER_SETTINGS.LIVES;
    this.gameOver = false;
    this.lastTime = null;
    this.gameOverSoundPlayed = false;
  }

  update(deltaTime) {
    const [input] = getInput();
    
    if (this.gameOver && input.START.pressed) {
      this.reset();
    }

    // Check for game over condition
    if (this.lives <= 0) {
      this.setGameOver();
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
      this.setGameOver();
    }
  }

  setGameOver() {
    if (!this.gameOver) {  // Only play sound when first entering game over state
      this.gameOver = true;
      if (this.gameOverSound && !this.gameOverSoundPlayed) {
        playSound(this.gameOverSound);
        this.gameOverSoundPlayed = true;
      }
    }
  }

  isGameOver() {
    return this.gameOver;
  }
}