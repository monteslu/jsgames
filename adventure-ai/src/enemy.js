// enemy.js
import { DIRECTIONS } from './constants.js';
import { ENEMY_TYPES, getDropForEnemy } from './enemyTypes.js';
import { BEHAVIORS, EnemyBehaviorController } from './enemyBehaviors.js';

export class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.direction = DIRECTIONS.DOWN;
    this.config = ENEMY_TYPES[type];
    this.health = this.config.health;
    this.speed = this.config.speed;
    this.damage = this.config.damage;
    this.state = 'idle';
    this.stateTime = 0;
    this.currentFrame = 0;
    this.frameTime = 0;
    
    // Movement and targeting
    this.target = null;
    this.lastX = x;
    this.lastY = y;
    
    // Combat states
    this.knockbackTime = 0;
    this.knockbackDuration = 200;
    this.invincibleTime = 0;
    this.invincibleDuration = 500;
    
    // Behavior specific properties
    this.behaviorTime = 0;
    this.patrolPoints = [];
    this.currentPatrolPoint = 0;
    this.ambushTriggered = false;
    this.teleportCooldown = 0;
    this.swarmOffset = Math.random() * Math.PI * 2;
    
    // Initialize projectiles if ranged
    this.projectiles = new Set();
    if (this.config.behavior === BEHAVIORS.RANGED) {
      this.lastShotTime = 0;
    }
  }

  update(deltaTime, player, worldManager) {
    this.stateTime += deltaTime;
    this.behaviorTime += deltaTime;
    
    // Update knockback
    if (this.knockbackTime > 0) {
      this.knockbackTime = Math.max(0, this.knockbackTime - deltaTime);
      return;
    }
    
    // Update invincibility
    if (this.invincibleTime > 0) {
      this.invincibleTime = Math.max(0, this.invincibleTime - deltaTime);
    }
    
    // Store previous position
    this.lastX = this.x;
    this.lastY = this.y;
    
    const distToPlayer = Math.sqrt(
      Math.pow(player.x - this.x, 2) + 
      Math.pow(player.y - this.y, 2)
    );
    
    // Update behavior based on type
    switch (this.config.behavior) {
      case BEHAVIORS.CHASE:
        EnemyBehaviorController.updateChase(this, deltaTime, player, distToPlayer);
        break;
      case BEHAVIORS.PATROL:
        EnemyBehaviorController.updatePatrol(this, deltaTime, player, distToPlayer);
        break;
      case BEHAVIORS.AMBUSH:
        EnemyBehaviorController.updateAmbush(this, deltaTime, player, distToPlayer);
        break;
      case BEHAVIORS.RANGED:
        EnemyBehaviorController.updateRanged(this, deltaTime, player, distToPlayer);
        break;
      case BEHAVIORS.SWARM:
        EnemyBehaviorController.updateSwarm(this, deltaTime, player, distToPlayer);
        break;
      case BEHAVIORS.TELEPORT:
        EnemyBehaviorController.updateTeleport(this, deltaTime, player, distToPlayer, worldManager);
        break;
    }
    
    // Update projectiles if any
    this.updateProjectiles(deltaTime, player, worldManager);
    
    // Check collision with world
    if (!worldManager.isWalkable(this.x, this.y)) {
      this.x = this.lastX;
      this.y = this.lastY;
    }
    
    // Update animation
    this.updateAnimation(deltaTime);
  }

  updateProjectiles(deltaTime, player, worldManager) {
    if (this.projectiles.size === 0) return;
    
    for (const projectile of this.projectiles) {
      projectile.lifetime -= deltaTime;
      if (projectile.lifetime <= 0) {
        this.projectiles.delete(projectile);
        continue;
      }
      
      projectile.x += projectile.dx * deltaTime;
      projectile.y += projectile.dy * deltaTime;
      
      // Check collision with player
      const dx = player.x - projectile.x;
      const dy = player.y - projectile.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 0.5) {
        player.hurt(this.damage);
        this.projectiles.delete(projectile);
      }
      
      // Check collision with walls
      if (!worldManager.isWalkable(projectile.x, projectile.y)) {
        this.projectiles.delete(projectile);
      }
    }
  }

  shootAtPlayer(player) {
    if (this.stateTime >= this.config.shootCooldown) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        this.projectiles.add({
          x: this.x,
          y: this.y,
          dx: (dx / dist) * this.config.projectileSpeed,
          dy: (dy / dist) * this.config.projectileSpeed,
          lifetime: 2000
        });
        
        this.stateTime = 0;
        this.state = 'casting';
      }
    }
  }

  updateAnimation(deltaTime) {
    const animation = this.config.animations[this.state];
    if (!animation) return;
    
    this.frameTime += deltaTime;
    
    if (this.frameTime >= animation.frameTime) {
      this.frameTime = 0;
      this.currentFrame = (this.currentFrame + 1) % animation.frames.length;
    }
  }

  hurt(damage, knockbackDirection) {
    if (this.invincibleTime > 0) return;
    
    this.health -= damage;
    this.invincibleTime = this.invincibleDuration;
    
    // Apply knockback
    if (knockbackDirection) {
      const knockbackForce = 2;
      this.x += knockbackDirection.x * knockbackForce;
      this.y += knockbackDirection.y * knockbackForce;
      this.knockbackTime = this.knockbackDuration;
    }
  }

  draw(ctx) {
    // Skip drawing when briefly invincible
    if (this.invincibleTime > 0 && Math.floor(this.invincibleTime / 100) % 2 === 0) {
      return;
    }
    
    // Draw enemy sprite
    ctx.fillStyle = this.config.color;
    ctx.fillRect(
      Math.floor(this.x * 32),
      Math.floor(this.y * 32),
      32,
      32
    );
    
    // Draw simple frame indication
    ctx.strokeStyle = 'black';
    ctx.strokeRect(
      Math.floor(this.x * 32),
      Math.floor(this.y * 32),
      32,
      32
    );
    
    // Draw projectiles if any
    for (const projectile of this.projectiles) {
      ctx.fillStyle = this.config.color;
      ctx.beginPath();
      ctx.arc(
        Math.floor(projectile.x * 32 + 16),
        Math.floor(projectile.y * 32 + 16),
        6,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  isDead() {
    return this.health <= 0;
  }

  getDrops() {
    return getDropForEnemy(this.type);
  }
}
