import { playSound } from './sfx.js';
import { rgColorGradient } from './util.js';

const faces = [
  '🤣',
  '😂',
  '😁',
  '😀',
  '😏',
  '🙂',
  '🙄',
  '🤨',
  '😐',
  '😬',
  '😶',
  '😑',
  '😮',
  '😯',
  '😲',
  '😳',
  '🥺',
  '😦',
  '😧',
  '😨',
  '😰',
  '😥',
  '😢',
  '😭',
  '😞',
  '😖',
  '😣',
  '😓',
  '😩',
  '😫',
  '😠',
  '😤',
  '😡',
  '🤬',
  '😈',
  '👿',
  '💀',
];

export class Boss {
  constructor({ width, height, scale, health = 10, level = 1, bossLaserSound, bigExplosionSound }) {
    this.width = scale.SHIP_WIDTH * 3;
    this.height = scale.SHIP_HEIGHT * 3;
    this.screenWidth = width;
    this.screenHeight = height;
    this.level = level;

    // Start fully off screen to the right
    this.x = this.screenWidth;
    this.targetX = this.screenWidth * 0.75;
    this.y = height / 2 - this.height / 2;

    this.health = health;
    this.maxHealth = health;
    this.speed = scale.ENEMY_SPEED * 0.5;
    this.verticalSpeed = scale.ENEMY_SPEED * 0.2;
    this.bullets = [];
    this.lastShot = 0;
    this.shootDelay = Math.max(800 - level * 50, 40); // Faster shooting
    this.isEntering = true;
    this.timeSinceLastShot = 0;
    this.bulletSpeed = this.speed * (0.4 + 0.1 * level); // Slower bullets

    // Smooth movement variables
    this.targetY = this.y;
    this.verticalVelocity = 0;
    this.smoothingFactor = 0.95; // Higher = more inertia
    this.accelerationRate = 0.0001; // Lower = more delayed response
    this.bossLaserSound = bossLaserSound;
    this.bigExplosionSound = bigExplosionSound;
  }

  update(elapsed, playerY) {
    this.timeSinceLastShot += elapsed;

    // Handle entrance
    if (this.isEntering) {
      if (this.x > this.targetX) {
        this.x -= this.speed * elapsed;
      } else {
        this.isEntering = false;
        this.x = this.targetX;
      }
      return;
    }

    // Update target position based on player
    this.targetY = playerY - this.height / 2;

    // Calculate acceleration towards target
    const dy = this.targetY - this.y;

    // Apply smooth movement with inertia
    this.verticalVelocity = this.verticalVelocity * this.smoothingFactor + dy * this.accelerationRate * elapsed;

    // Apply velocity to position
    this.y += this.verticalVelocity * elapsed;

    // Keep boss within screen bounds
    this.y = Math.max(0, Math.min(this.screenHeight - this.height, this.y));

    // Shoot at player
    if (this.timeSinceLastShot >= this.shootDelay) {
      this.bullets.push({
        x: this.x,
        y: this.y + this.height / 2,
        width: this.width * 0.2,
        height: this.height * 0.15,
        speed: this.bulletSpeed,
      });
      this.timeSinceLastShot = 0;
      //   bossLaserSound();
      playSound(this.bossLaserSound);
    }

    // Update boss bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x -= bullet.speed * elapsed;
      if (bullet.x + bullet.width < 0) {
        this.bullets.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    // Draw boss bullets
    ctx.fillStyle = '#ff0000';
    for (const bullet of this.bullets) {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    // Main body
    ctx.beginPath();
    //   ctx.moveTo(this.x + this.width * 0.9, this.y + this.height * 0.5);
    //   ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.3);
    //   ctx.lineTo(this.x + this.width * 0.3, this.y + this.height * 0.3);
    //   ctx.lineTo(this.x + this.width * 0.3, this.y + this.height * 0.7);
    //   ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.7);
    ctx.moveTo(this.x + this.width, this.y + this.height * 0.5);
    ctx.lineTo(this.x + this.width * 0.6, this.y);
    ctx.lineTo(this.x, this.y + this.height * 0.1);
    ctx.lineTo(this.x, this.y + this.height * 0.9);
    ctx.lineTo(this.x + this.width * 0.6, this.y + this.height);
    ctx.closePath();
    ctx.fillStyle = '#ff0000';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // outline
    //   ctx.strokeStyle = '#fff';
    //   ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Face
    ctx.font = `${this.height * 0.8}px NotoColorEmoji`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(faces[Math.min(this.level - 1, faces.length - 1)], this.x + this.width * 0.4, this.y + this.height * 0.54);

    // Health bar
    const healthBarWidth = this.width / 2;
    const healthBarHeight = this.height / 20;
    const healthPercentage = this.health / this.maxHealth;
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + this.width / 4, this.y - healthBarHeight * 2, healthBarWidth, healthBarHeight);
    ctx.fillStyle = `rgb(${rgColorGradient(healthPercentage).join(',')})`;
    ctx.fillRect(this.x + this.width / 4, this.y - healthBarHeight * 2, healthBarWidth * healthPercentage, healthBarHeight);
  }

  hit() {
    this.health--;
    playSound(this.bigExplosionSound);
    return this.health <= 0;
  }

  getBullets() {
    return this.bullets;
  }
}
