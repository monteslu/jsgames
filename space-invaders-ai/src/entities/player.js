import { getInput, playSound } from '../utils.js';
import { PLAYER_SETTINGS, COLORS } from '../constants.js';

export class Player {
  constructor(x, y, laserSound, playerImg, sizes) {
    this.x = x;
    this.y = y;
    this.laserSound = laserSound;
    this.playerImg = playerImg;
    this.sizes = sizes;  // Store size configuration
    this.bullets = [];
    this.lastShot = 0;
    this.isAlive = true;
    this.respawnTimer = 0;
    this.invulnerableTimer = 0;
  }

  getScreenUnit(percentage, screenDimension, dimension = 'width') {
    return (percentage / 100) * (dimension === 'width' ? screenDimension : screenDimension);
  }

  reset(screenWidth) {
    this.x = screenWidth / 2 - this.getScreenUnit(this.sizes.WIDTH, screenWidth) / 2;
    this.bullets = [];
    this.lastShot = 0;
    this.isAlive = true;
    this.respawnTimer = 0;
    this.invulnerableTimer = 2000; // 2 seconds of invulnerability after respawn
  }

  die() {
    if (this.invulnerableTimer <= 0) {
      this.isAlive = false;
      this.respawnTimer = 1500; // 1.5 seconds before respawn
      if (window.gameState) {
        window.gameState.loseLife();
      }
    }
  }

  update(deltaTime, screenWidth, screenHeight) {
    // Update timers
    if (this.respawnTimer > 0) {
      this.respawnTimer -= deltaTime;
      if (this.respawnTimer <= 0) {
        this.reset(screenWidth);
      }
      return;
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= deltaTime;
    }

    if (!this.isAlive) return;

    const [input] = getInput();
    const playerWidth = this.getScreenUnit(this.sizes.WIDTH, screenWidth);
    
    // Movement
    const moveDistance = PLAYER_SETTINGS.SPEED * screenWidth * (deltaTime / 1000);
    
    if (input.DPAD_LEFT.pressed) {
      this.x = Math.max(0, this.x - moveDistance);
    }
    if (input.DPAD_RIGHT.pressed) {
      this.x = Math.min(screenWidth - playerWidth, this.x + moveDistance);
    }
    
    // Shooting
    if (input.BUTTON_SOUTH.pressed && Date.now() - this.lastShot > PLAYER_SETTINGS.SHOOT_DELAY) {
      this.shoot(screenWidth, screenHeight);
      this.lastShot = Date.now();
    }
    
    // Update bullets
    this.bullets = this.bullets.filter(bullet => bullet.y > 0);
    const bulletSpeed = PLAYER_SETTINGS.BULLET_SPEED * screenHeight * (deltaTime / 1000);
    
    this.bullets.forEach(bullet => {
      bullet.y -= bulletSpeed;
    });
  }

  shoot(screenWidth, screenHeight) {
    const playerWidth = this.getScreenUnit(this.sizes.WIDTH, screenWidth);
    const bulletWidth = this.getScreenUnit(this.sizes.BULLET_WIDTH, screenWidth);
    const bulletHeight = this.getScreenUnit(this.sizes.BULLET_HEIGHT, screenHeight, 'height');

    this.bullets.push({
      x: this.x + (playerWidth / 2) - (bulletWidth / 2),
      y: this.y,
      width: bulletWidth,
      height: bulletHeight
    });
    
    if (this.laserSound) {
      playSound(this.laserSound);
    }
  }

  draw(ctx) {
    if (!this.isAlive && this.respawnTimer > 0) return;

    const screenWidth = ctx.canvas.width;
    const screenHeight = ctx.canvas.height;
    const playerWidth = this.getScreenUnit(this.sizes.WIDTH, screenWidth);
    const playerHeight = this.getScreenUnit(this.sizes.HEIGHT, screenHeight, 'height');
    
    // Draw player sprite with blinking effect during invulnerability
    if (this.playerImg && (this.invulnerableTimer <= 0 || Math.floor(this.invulnerableTimer / 100) % 2 === 0)) {
      ctx.drawImage(this.playerImg, this.x, this.y, playerWidth, playerHeight);
    }
    
    // Draw bullets
    ctx.fillStyle = COLORS.PLAYER_BULLET;
    this.bullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
  }

  getBounds() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    return {
      x: this.x,
      y: this.y,
      width: this.getScreenUnit(this.sizes.WIDTH, screenWidth),
      height: this.getScreenUnit(this.sizes.HEIGHT, screenHeight, 'height')
    };
  }
}