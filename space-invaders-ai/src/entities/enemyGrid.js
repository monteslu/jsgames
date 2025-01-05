import { ENEMY_SETTINGS, COLORS, GROUND_SETTINGS } from '../constants.js';
import { playSound } from '../utils.js';
import { ParticleSystem } from '../particle.js';

export class EnemyGrid {
  constructor(screenWidth, screenHeight, enemyImages, enemyLaserSound, explosionSound, sizes) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.enemyImages = enemyImages;
    this.enemyLaserSound = enemyLaserSound;
    this.explosionSound = explosionSound;
    this.sizes = sizes;
    
    this.direction = 1;
    this.currentSpeed = ENEMY_SETTINGS.BASE_SPEED;
    this.bullets = [];
    this.lastShot = 0;
    this.lastAnimationUpdate = 0;
    this.animationInterval = 150; // Animation frame changes every 250ms
    
    this.particleSystem = new ParticleSystem();
    this.initializeEnemies();
  }

  reset() {
    this.direction = 1;
    this.currentSpeed = ENEMY_SETTINGS.BASE_SPEED;
    this.bullets = [];
    this.lastShot = 0;
    this.lastAnimationUpdate = 0;
    this.particleSystem.clear();
    this.initializeEnemies();
  }

  getScreenUnit(percentage, dimension = 'width') {
    return (percentage / 100) * (dimension === 'width' ? this.screenWidth : this.screenHeight);
  }

  initializeEnemies() {
    this.enemies = [];
    const enemyWidth = this.getScreenUnit(this.sizes.WIDTH);
    const enemyHeight = this.getScreenUnit(this.sizes.HEIGHT, 'height');
    const hSpacing = this.getScreenUnit(ENEMY_SETTINGS.HORIZONTAL_SPACING_PERCENT);
    const vSpacing = this.getScreenUnit(ENEMY_SETTINGS.VERTICAL_SPACING_PERCENT, 'height');
    
    const gridWidth = (ENEMY_SETTINGS.COLS * (enemyWidth + hSpacing)) - hSpacing;
    const startX = (this.screenWidth - gridWidth) / 2;
    const startY = this.getScreenUnit(ENEMY_SETTINGS.STARTING_Y_PERCENT, 'height');

    for (let row = 0; row < ENEMY_SETTINGS.ROWS; row++) {
      const enemyType = ENEMY_SETTINGS.ROW_PATTERNS[row];
      
      for (let col = 0; col < ENEMY_SETTINGS.COLS; col++) {
        this.enemies.push({
          x: startX + col * (enemyWidth + hSpacing),
          y: startY + row * (enemyHeight + vSpacing),
          width: enemyWidth,
          height: enemyHeight,
          alive: true,
          type: enemyType,
          row: row,
          animationFrame: 0,
          lastFrameUpdate: 0
        });
      }
    }
  }

  updateAnimations(timestamp) {
    if (timestamp - this.lastAnimationUpdate >= this.animationInterval) {
      this.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        // Move to next animation frame
        enemy.animationFrame = (enemy.animationFrame + 1) % 8;
      });
      
      this.lastAnimationUpdate = timestamp;
    }
  }

  update(deltaTime, player) {
    // Update animations
    this.updateAnimations(performance.now());
    
    // Update particle system
    this.particleSystem.update(deltaTime);

    if (this.enemies.filter(e => e.alive).length === 0) {
      this.initializeEnemies();
      this.currentSpeed += ENEMY_SETTINGS.SPEED_INCREASE;
    }

    let needsToDropAndReverse = false;
    const livingEnemies = this.enemies.filter(enemy => enemy.alive);
    
    const leftmost = Math.min(...livingEnemies.map(e => e.x));
    const rightmost = Math.max(...livingEnemies.map(e => e.x + e.width));

    // Calculate speed multiplier based on remaining enemies
    const totalEnemies = ENEMY_SETTINGS.ROWS * ENEMY_SETTINGS.COLS;
    const remainingEnemies = livingEnemies.length;
    const enemiesDestroyed = totalEnemies - remainingEnemies;
    
    // Scale speed based on how many enemies have been destroyed
    const speedMultiplier = Math.min(
      1 + (enemiesDestroyed * ENEMY_SETTINGS.SPEED_SCALE_FACTOR),
      ENEMY_SETTINGS.MAX_SPEED_MULTIPLIER
    );
    
    const moveDistance = this.currentSpeed * speedMultiplier * this.screenWidth * (deltaTime / 1000);

    if (this.direction > 0 && rightmost + moveDistance >= this.screenWidth) {
      needsToDropAndReverse = true;
    } else if (this.direction < 0 && leftmost - moveDistance <= 0) {
      needsToDropAndReverse = true;
    }

    const groundY = this.getScreenUnit(GROUND_SETTINGS.Y_PERCENT, 'height');
    
    this.enemies.forEach(enemy => {
      if (!enemy.alive) return;
      
      if (needsToDropAndReverse) {
        enemy.y += this.getScreenUnit(ENEMY_SETTINGS.DROP_DISTANCE_PERCENT, 'height');
      } else {
        enemy.x += this.direction * moveDistance;
      }

      if (enemy.y + enemy.height >= groundY) {
        if (window.gameState) {
          window.gameState.setGameOver();
        }
      }

      if (player.isAlive && this.checkCollision(enemy, player.getBounds())) {
        player.die();
        if (this.explosionSound) {
          playSound(this.explosionSound);
        }
      }
    });

    if (needsToDropAndReverse) {
      this.direction *= -1;
    }

    if (Date.now() - this.lastShot > ENEMY_SETTINGS.SHOOTING_INTERVAL) {
      if (Math.random() < ENEMY_SETTINGS.SHOOTING_CHANCE) {
        const shootingEnemies = livingEnemies.filter(enemy => {
          return !livingEnemies.some(other => 
            other.x === enemy.x && other.y > enemy.y
          );
        });
        
        if (shootingEnemies.length > 0) {
          const shooter = shootingEnemies[Math.floor(Math.random() * shootingEnemies.length)];
          this.shoot(shooter);
        }
      }
      this.lastShot = Date.now();
    }

    const bulletSpeed = ENEMY_SETTINGS.BULLET_SPEED * this.screenHeight * (deltaTime / 1000);
    this.bullets = this.bullets.filter(bullet => {
      bullet.y += bulletSpeed;
      
      if (player.isAlive && this.checkCollision(bullet, player.getBounds())) {
        player.die();
        if (this.explosionSound) {
          playSound(this.explosionSound);
        }
        return false;
      }
      
      return bullet.y < this.screenHeight;
    });

    player.bullets.forEach(bullet => {
      this.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        if (this.checkCollision(bullet, enemy)) {
          enemy.alive = false;
          bullet.y = -100;

          // Create explosion effect
          const explosionX = enemy.x + enemy.width / 2;
          const explosionY = enemy.y + enemy.height / 2;
          
          // Create multiple particle systems with different colors for a more dynamic effect
          this.particleSystem.createExplosion(explosionX, explosionY, '#FFD700', 15); // Gold particles
          this.particleSystem.createExplosion(explosionX, explosionY, '#FF4500', 10); // Red-orange particles
          this.particleSystem.createExplosion(explosionX, explosionY, '#FFFFFF', 5);  // White particles
          
          const points = ENEMY_SETTINGS.POINTS[`ROW_${enemy.row}`];
          if (window.gameState) {
            window.gameState.addScore(points);
          }
          
          if (this.explosionSound) {
            playSound(this.explosionSound);
          }
        }
      });
    });
  }

  shoot(enemy) {
    const bulletWidth = this.getScreenUnit(this.sizes.BULLET_WIDTH);
    const bulletHeight = this.getScreenUnit(this.sizes.BULLET_HEIGHT, 'height');

    this.bullets.push({
      x: enemy.x + (enemy.width / 2) - (bulletWidth / 2),
      y: enemy.y + enemy.height,
      width: bulletWidth,
      height: bulletHeight
    });

    if (this.enemyLaserSound) {
      playSound(this.enemyLaserSound);
    }
  }

  checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  draw(ctx) {
    // Draw enemies
    this.enemies.forEach(enemy => {
      if (!enemy.alive) return;
      
      const enemyImageArray = this.enemyImages[enemy.type];
      if (enemyImageArray && enemyImageArray[enemy.animationFrame]) {
        ctx.drawImage(
          enemyImageArray[enemy.animationFrame],
          enemy.x,
          enemy.y,
          enemy.width,
          enemy.height
        );
      }
    });

    if (this.bullets.length > 0) {
      // Draw enemy bullets
      ctx.fillStyle = COLORS.ENEMY_BULLET;
      ctx.strokeStyle = COLORS.ENEMY_BULLET_2;
      ctx.lineWidth = this.bullets[0].width / 4;
      this.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height);
      });
    }

    // Draw particle effects
    this.particleSystem.draw(ctx);
  }
}