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
    this.maxHealth = this.config.health;
    this.speed = this.config.speed;
    this.damage = this.config.damage;
    this.width = this.config.width || 0.7;
    this.height = this.config.height || 0.7;
    this.state = 'idle';
    this.stateTime = 0;
    this.currentFrame = 0;
    this.frameTime = 0;
    this.attackCooldown = 0;
    this.attackCooldownDuration = 1000;

    this.target = null;
    this.lastX = x;
    this.lastY = y;

    this.knockbackTime = 0;
    this.knockbackDuration = 200;
    this.invincibleTime = 0;
    this.invincibleDuration = 500;

    this.behaviorTime = 0;
    this.patrolPoints = [];
    this.currentPatrolPoint = 0;
    this.ambushTriggered = false;
    this.teleportCooldown = 0;
    this.swarmOffset = Math.random() * Math.PI * 2;

    this.projectiles = new Set();
    if (this.config.behavior === BEHAVIORS.RANGED) {
      this.lastShotTime = 0;
    }
  }

  update(deltaTime, player, worldManager) {
    this.stateTime += deltaTime;
    this.behaviorTime += deltaTime;

    if (this.knockbackTime > 0) {
      this.knockbackTime = Math.max(0, this.knockbackTime - deltaTime);
      return;
    }

    if (this.invincibleTime > 0) {
      this.invincibleTime = Math.max(0, this.invincibleTime - deltaTime);
    }

    this.lastX = this.x;
    this.lastY = this.y;

    const distToPlayer = Math.sqrt(
      Math.pow(player.x - this.x, 2) +
      Math.pow(player.y - this.y, 2)
    );

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

    this.updateProjectiles(deltaTime, player, worldManager);

    if (!worldManager.isWalkable(this.x, this.y)) {
      this.x = this.lastX;
      this.y = this.lastY;
    }

    this.updateAnimation(deltaTime);
  }

  updateProjectiles(deltaTime, player, worldManager) {
    for (const projectile of this.projectiles) {
      projectile.lifetime -= deltaTime;
      if (projectile.lifetime <= 0) {
        this.projectiles.delete(projectile);
        continue;
      }
      projectile.x += projectile.dx * deltaTime;
      projectile.y += projectile.dy * deltaTime;

      const dx = player.x - projectile.x;
      const dy = player.y - projectile.y;
      if (Math.sqrt(dx * dx + dy * dy) < 0.5) {
        player.hurt(this.damage);
        this.projectiles.delete(projectile);
      }
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
          x: this.x, y: this.y,
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
    if (knockbackDirection) {
      const knockbackForce = 2;
      this.x += knockbackDirection.x * knockbackForce;
      this.y += knockbackDirection.y * knockbackForce;
      this.knockbackTime = this.knockbackDuration;
    }
  }

  draw(ctx) {
    if (this.invincibleTime > 0 && Math.floor(this.invincibleTime / 80) % 2 === 0) {
      return;
    }

    const px = Math.floor(this.x * 32);
    const py = Math.floor(this.y * 32);
    const isHurt = this.invincibleTime > 0;

    switch (this.type) {
      case 'slime': this.drawSlime(ctx, px, py, isHurt); break;
      case 'bat': this.drawBat(ctx, px, py, isHurt); break;
      case 'skeleton': this.drawSkeleton(ctx, px, py, isHurt); break;
      case 'wizard': this.drawWizard(ctx, px, py, isHurt); break;
      case 'ghost': this.drawGhost(ctx, px, py, isHurt); break;
      case 'spider': this.drawSpider(ctx, px, py, isHurt); break;
      case 'goblin': this.drawGoblin(ctx, px, py, isHurt); break;
      case 'orc': this.drawOrc(ctx, px, py, isHurt); break;
      case 'troll': this.drawTroll(ctx, px, py, isHurt); break;
      case 'fireImp': this.drawFireImp(ctx, px, py, isHurt); break;
      case 'darkKnight': this.drawDarkKnight(ctx, px, py, isHurt); break;
      case 'swampBeast': this.drawSwampBeast(ctx, px, py, isHurt); break;
      case 'spiderQueen': this.drawSpiderQueen(ctx, px, py, isHurt); break;
      default: this.drawSlime(ctx, px, py, isHurt); break;
    }

    // Health bar for enemies with >1 max health
    if (this.maxHealth > 1) {
      this.drawHealthBar(ctx, px, py);
    }

    // Projectiles
    for (const p of this.projectiles) {
      ctx.fillStyle = this.config.color;
      ctx.beginPath();
      ctx.arc(Math.floor(p.x * 32), Math.floor(p.y * 32), 5, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      ctx.fillStyle = 'rgba(255,255,200,0.3)';
      ctx.beginPath();
      ctx.arc(Math.floor(p.x * 32), Math.floor(p.y * 32), 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawHealthBar(ctx, px, py) {
    const barWidth = this.width * 32;
    const barHeight = 3;
    const barX = px - barWidth / 2;
    const barY = py - this.height * 16 - 8;
    // Background
    ctx.fillStyle = '#440000';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    // Fill
    const pct = this.health / this.maxHealth;
    ctx.fillStyle = pct > 0.5 ? '#44CC44' : pct > 0.25 ? '#CCCC44' : '#CC4444';
    ctx.fillRect(barX, barY, barWidth * pct, barHeight);
  }

  // --- SLIME: bouncy green blob ---
  drawSlime(ctx, px, py, isHurt) {
    const bounce = Math.abs(Math.sin(this.behaviorTime * 0.005)) * 6;
    const squish = bounce * 0.4;
    ctx.fillStyle = isHurt ? this.config.colorHurt : this.config.color;
    ctx.beginPath();
    ctx.ellipse(px, py + 4 - bounce, 11 + squish, 9 + bounce * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(px, py + 10, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px - 4, py - 1 - bounce, 3, 0, Math.PI * 2);
    ctx.arc(px + 4, py - 1 - bounce, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(px - 3, py - bounce, 1.5, 0, Math.PI * 2);
    ctx.arc(px + 5, py - bounce, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(px - 5, py - 5 - bounce, 3, 2, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- BAT: flapping wings ---
  drawBat(ctx, px, py, isHurt) {
    const flap = Math.sin(this.behaviorTime * 0.015) * 8;
    const bodyColor = isHurt ? this.config.colorHurt : this.config.color;
    // Wings
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px - 14, py - 6 + flap, px - 16, py + 2 + flap);
    ctx.quadraticCurveTo(px - 10, py + 4, px, py);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + 14, py - 6 - flap, px + 16, py + 2 - flap);
    ctx.quadraticCurveTo(px + 10, py + 4, px, py);
    ctx.fill();
    // Body
    ctx.beginPath();
    ctx.ellipse(px, py, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eyes (red, glowing)
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.arc(px - 2, py - 2, 1.5, 0, Math.PI * 2);
    ctx.arc(px + 2, py - 2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Fangs
    ctx.fillStyle = '#fff';
    ctx.fillRect(px - 2, py + 2, 1, 3);
    ctx.fillRect(px + 1, py + 2, 1, 3);
  }

  // --- SKELETON: bony humanoid ---
  drawSkeleton(ctx, px, py, isHurt) {
    const walk = Math.sin(this.behaviorTime * 0.006) * 2;
    const color = isHurt ? this.config.colorHurt : this.config.color;
    // Legs
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - 3, py + 6);
    ctx.lineTo(px - 5, py + 14 + walk);
    ctx.moveTo(px + 3, py + 6);
    ctx.lineTo(px + 5, py + 14 - walk);
    ctx.stroke();
    // Spine
    ctx.beginPath();
    ctx.moveTo(px, py - 4);
    ctx.lineTo(px, py + 6);
    ctx.stroke();
    // Ribs
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(px - 5, py - 1 + i * 3);
      ctx.lineTo(px + 5, py - 1 + i * 3);
      ctx.stroke();
    }
    // Arms
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - 5, py);
    ctx.lineTo(px - 10, py + 6 - walk);
    ctx.moveTo(px + 5, py);
    ctx.lineTo(px + 10, py + 6 + walk);
    ctx.stroke();
    // Skull
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py - 8, 6, 0, Math.PI * 2);
    ctx.fill();
    // Eye sockets
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(px - 2, py - 9, 2, 0, Math.PI * 2);
    ctx.arc(px + 2, py - 9, 2, 0, Math.PI * 2);
    ctx.fill();
    // Jaw
    ctx.fillStyle = color;
    ctx.fillRect(px - 3, py - 4, 6, 2);
    ctx.fillStyle = '#000';
    ctx.fillRect(px - 2, py - 4, 1, 2);
    ctx.fillRect(px + 1, py - 4, 1, 2);
  }

  // --- WIZARD: robed figure with staff ---
  drawWizard(ctx, px, py, isHurt) {
    const bob = Math.sin(this.behaviorTime * 0.003) * 2;
    const color = isHurt ? this.config.colorHurt : this.config.color;
    // Robe
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(px - 8, py + 12);
    ctx.lineTo(px - 6, py - 2);
    ctx.lineTo(px + 6, py - 2);
    ctx.lineTo(px + 8, py + 12);
    ctx.closePath();
    ctx.fill();
    // Head
    ctx.fillStyle = '#FFDAB9';
    ctx.beginPath();
    ctx.arc(px, py - 6 + bob, 5, 0, Math.PI * 2);
    ctx.fill();
    // Hat
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(px, py - 20 + bob);
    ctx.lineTo(px - 8, py - 4 + bob);
    ctx.lineTo(px + 8, py - 4 + bob);
    ctx.closePath();
    ctx.fill();
    // Hat brim
    ctx.fillRect(px - 9, py - 5 + bob, 18, 3);
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px - 2, py - 7 + bob, 1.5, 0, Math.PI * 2);
    ctx.arc(px + 2, py - 7 + bob, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Staff
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(px + 9, py - 14 + bob, 2, 26);
    // Orb on staff
    ctx.fillStyle = '#FFDD44';
    const orbPulse = Math.sin(this.behaviorTime * 0.008) * 2;
    ctx.beginPath();
    ctx.arc(px + 10, py - 14 + bob, 3 + orbPulse * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,100,0.3)';
    ctx.beginPath();
    ctx.arc(px + 10, py - 14 + bob, 6 + orbPulse, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- GHOST: transparent hovering spirit ---
  drawGhost(ctx, px, py, isHurt) {
    const hover = Math.sin(this.behaviorTime * 0.004) * 4;
    const wave = this.behaviorTime * 0.003;
    ctx.globalAlpha = isHurt ? 0.4 : 0.6;
    // Body
    ctx.fillStyle = isHurt ? this.config.colorHurt : this.config.color;
    ctx.beginPath();
    ctx.arc(px, py - 4 + hover, 10, Math.PI, 0);
    ctx.lineTo(px + 10, py + 8 + hover);
    // Wavy bottom
    for (let i = 4; i >= -4; i--) {
      const wx = px + i * 2.5;
      const wy = py + 8 + hover + Math.sin(wave + i) * 3;
      ctx.lineTo(wx, wy);
    }
    ctx.closePath();
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(px - 3, py - 5 + hover, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(px + 3, py - 5 + hover, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Mouth
    ctx.beginPath();
    ctx.ellipse(px, py + 1 + hover, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // --- SPIDER: 8-legged creeper ---
  drawSpider(ctx, px, py, isHurt) {
    const legAnim = Math.sin(this.behaviorTime * 0.008);
    const color = isHurt ? this.config.colorHurt : this.config.color;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(px, py + 8, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Legs (4 per side)
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const offset = legAnim * (i % 2 === 0 ? 2 : -2);
      const angle = (i - 1.5) * 0.4;
      // Left legs
      ctx.beginPath();
      ctx.moveTo(px - 4, py);
      ctx.quadraticCurveTo(px - 12 - i, py - 4 + offset, px - 14 + i * 2, py + 4 + offset);
      ctx.stroke();
      // Right legs
      ctx.beginPath();
      ctx.moveTo(px + 4, py);
      ctx.quadraticCurveTo(px + 12 + i, py - 4 - offset, px + 14 - i * 2, py + 4 - offset);
      ctx.stroke();
    }
    // Abdomen
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(px, py + 2, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.ellipse(px, py - 4, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eyes (multiple)
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(px - 3, py - 5, 1.5, 0, Math.PI * 2);
    ctx.arc(px + 3, py - 5, 1.5, 0, Math.PI * 2);
    ctx.arc(px - 1, py - 6, 1, 0, Math.PI * 2);
    ctx.arc(px + 1, py - 6, 1, 0, Math.PI * 2);
    ctx.fill();
    // Fangs
    ctx.fillStyle = '#fff';
    ctx.fillRect(px - 2, py - 1, 1, 3);
    ctx.fillRect(px + 1, py - 1, 1, 3);
  }

  // --- GOBLIN: small green sneaky humanoid ---
  drawGoblin(ctx, px, py, isHurt) {
    const walk = Math.sin(this.behaviorTime * 0.008) * 2;
    const color = isHurt ? this.config.colorHurt : this.config.color;
    // Legs
    ctx.fillStyle = color;
    ctx.fillRect(px - 4, py + 4 + walk, 3, 6);
    ctx.fillRect(px + 1, py + 4 - walk, 3, 6);
    // Body (hunched)
    ctx.fillStyle = '#554422';  // leather armor
    ctx.fillRect(px - 5, py - 2, 10, 8);
    // Head (big for body)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py - 6, 7, 0, Math.PI * 2);
    ctx.fill();
    // Ears (big, pointy)
    ctx.beginPath();
    ctx.moveTo(px - 7, py - 6);
    ctx.lineTo(px - 14, py - 12);
    ctx.lineTo(px - 5, py - 9);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px + 7, py - 6);
    ctx.lineTo(px + 14, py - 12);
    ctx.lineTo(px + 5, py - 9);
    ctx.closePath();
    ctx.fill();
    // Eyes (big, yellow)
    ctx.fillStyle = '#FFDD00';
    ctx.beginPath();
    ctx.arc(px - 3, py - 7, 2.5, 0, Math.PI * 2);
    ctx.arc(px + 3, py - 7, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(px - 2, py - 7, 1, 0, Math.PI * 2);
    ctx.arc(px + 4, py - 7, 1, 0, Math.PI * 2);
    ctx.fill();
    // Toothy grin
    ctx.fillStyle = '#fff';
    ctx.fillRect(px - 3, py - 3, 1, 2);
    ctx.fillRect(px + 2, py - 3, 1, 2);
    // Dagger
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(px + 7, py - 2, 2, 8);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(px + 6, py + 5, 4, 3);
  }

  // --- ORC: big green muscular brute ---
  drawOrc(ctx, px, py, isHurt) {
    const walk = Math.sin(this.behaviorTime * 0.005) * 3;
    const color = isHurt ? this.config.colorHurt : this.config.color;
    // Legs (thick)
    ctx.fillStyle = color;
    ctx.fillRect(px - 7, py + 6 + walk, 5, 10);
    ctx.fillRect(px + 2, py + 6 - walk, 5, 10);
    // Boots
    ctx.fillStyle = '#4A3020';
    ctx.fillRect(px - 8, py + 14 + walk, 7, 4);
    ctx.fillRect(px + 1, py + 14 - walk, 7, 4);
    // Body (broad)
    ctx.fillStyle = '#6B4423';  // leather
    ctx.fillRect(px - 10, py - 4, 20, 12);
    // Arms (thick, muscular)
    ctx.fillStyle = color;
    ctx.fillRect(px - 14, py - 2, 5, 12);
    ctx.fillRect(px + 9, py - 2, 5, 12);
    // Fists
    ctx.fillRect(px - 14, py + 8, 5, 5);
    ctx.fillRect(px + 9, py + 8, 5, 5);
    // Head
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py - 8, 8, 0, Math.PI * 2);
    ctx.fill();
    // Jaw (heavy)
    ctx.fillRect(px - 7, py - 4, 14, 4);
    // Eyes (angry, small)
    ctx.fillStyle = '#FF4400';
    ctx.fillRect(px - 4, py - 10, 3, 2);
    ctx.fillRect(px + 1, py - 10, 3, 2);
    // Brow ridge
    ctx.fillStyle = '#336633';
    ctx.fillRect(px - 6, py - 12, 12, 2);
    // Tusks
    ctx.fillStyle = '#FFFFCC';
    ctx.fillRect(px - 4, py - 3, 2, 4);
    ctx.fillRect(px + 2, py - 3, 2, 4);
    // Axe
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(px + 14, py - 10, 2, 22);
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.moveTo(px + 14, py - 10);
    ctx.lineTo(px + 22, py - 6);
    ctx.lineTo(px + 22, py - 2);
    ctx.lineTo(px + 14, py - 2);
    ctx.closePath();
    ctx.fill();
  }

  // --- TROLL: huge grey hulking monster ---
  drawTroll(ctx, px, py, isHurt) {
    const walk = Math.sin(this.behaviorTime * 0.003) * 3;
    const color = isHurt ? this.config.colorHurt : this.config.color;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(px, py + 18, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Legs (massive)
    ctx.fillStyle = color;
    ctx.fillRect(px - 9, py + 6 + walk, 7, 14);
    ctx.fillRect(px + 2, py + 6 - walk, 7, 14);
    // Feet
    ctx.fillRect(px - 11, py + 18 + walk, 10, 4);
    ctx.fillRect(px + 1, py + 18 - walk, 10, 4);
    // Body (massive barrel chest)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(px, py, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Belly
    ctx.fillStyle = '#7A8899';
    ctx.beginPath();
    ctx.ellipse(px, py + 2, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Arms (long, hanging)
    ctx.fillStyle = color;
    ctx.fillRect(px - 18, py - 4, 6, 18);
    ctx.fillRect(px + 12, py - 4, 6, 18);
    // Hands/Fists (huge)
    ctx.beginPath();
    ctx.arc(px - 15, py + 14, 5, 0, Math.PI * 2);
    ctx.arc(px + 15, py + 14, 5, 0, Math.PI * 2);
    ctx.fill();
    // Head (small for body)
    ctx.beginPath();
    ctx.arc(px, py - 14, 8, 0, Math.PI * 2);
    ctx.fill();
    // Eyes (tiny, angry)
    ctx.fillStyle = '#FF2200';
    ctx.fillRect(px - 4, py - 16, 3, 2);
    ctx.fillRect(px + 1, py - 16, 3, 2);
    // Underbite
    ctx.fillStyle = color;
    ctx.fillRect(px - 6, py - 10, 12, 4);
    // Teeth
    ctx.fillStyle = '#FFFF99';
    ctx.fillRect(px - 4, py - 11, 2, 3);
    ctx.fillRect(px, py - 11, 2, 3);
    ctx.fillRect(px + 3, py - 11, 2, 3);
    // Club
    ctx.fillStyle = '#5A3A1A';
    ctx.fillRect(px + 17, py - 8, 4, 20);
    ctx.fillStyle = '#4A2A0A';
    ctx.beginPath();
    ctx.arc(px + 19, py - 8, 5, 0, Math.PI * 2);
    ctx.fill();
    // Nails in club
    ctx.fillStyle = '#AAA';
    ctx.fillRect(px + 16, py - 10, 2, 2);
    ctx.fillRect(px + 21, py - 6, 2, 2);
  }

  // --- FIRE IMP: small fiery demon ---
  drawFireImp(ctx, px, py, isHurt) {
    const hover = Math.sin(this.behaviorTime * 0.006) * 3;
    const color = isHurt ? this.config.colorHurt : this.config.color;
    // Fire aura
    const flicker = Math.sin(this.behaviorTime * 0.01) * 2;
    ctx.fillStyle = 'rgba(255,100,0,0.2)';
    ctx.beginPath();
    ctx.arc(px, py + hover, 12 + flicker, 0, Math.PI * 2);
    ctx.fill();
    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(px, py + hover, 7, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Horns
    ctx.fillStyle = '#AA2200';
    ctx.beginPath();
    ctx.moveTo(px - 4, py - 6 + hover);
    ctx.lineTo(px - 8, py - 14 + hover);
    ctx.lineTo(px - 2, py - 4 + hover);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px + 4, py - 6 + hover);
    ctx.lineTo(px + 8, py - 14 + hover);
    ctx.lineTo(px + 2, py - 4 + hover);
    ctx.fill();
    // Eyes (glowing)
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(px - 2, py - 2 + hover, 2, 0, Math.PI * 2);
    ctx.arc(px + 2, py - 2 + hover, 2, 0, Math.PI * 2);
    ctx.fill();
    // Flame tail
    ctx.fillStyle = '#FF4400';
    ctx.beginPath();
    ctx.moveTo(px, py + 8 + hover);
    ctx.quadraticCurveTo(px + 4, py + 14 + hover + flicker, px, py + 18 + hover + flicker);
    ctx.quadraticCurveTo(px - 4, py + 14 + hover - flicker, px, py + 8 + hover);
    ctx.fill();
  }

  // --- DARK KNIGHT: armored evil warrior ---
  drawDarkKnight(ctx, px, py, isHurt) {
    const walk = Math.sin(this.behaviorTime * 0.005) * 2;
    const color = isHurt ? this.config.colorHurt : this.config.color;
    // Legs
    ctx.fillStyle = color;
    ctx.fillRect(px - 5, py + 4 + walk, 4, 10);
    ctx.fillRect(px + 1, py + 4 - walk, 4, 10);
    // Boots (armored)
    ctx.fillStyle = '#222244';
    ctx.fillRect(px - 6, py + 12 + walk, 6, 4);
    ctx.fillRect(px, py + 12 - walk, 6, 4);
    // Body (dark armor)
    ctx.fillStyle = color;
    ctx.fillRect(px - 8, py - 6, 16, 12);
    // Armor highlight
    ctx.fillStyle = '#444466';
    ctx.fillRect(px - 6, py - 4, 12, 2);
    ctx.fillRect(px - 6, py, 12, 2);
    // Shoulders (pauldrons)
    ctx.fillStyle = '#222244';
    ctx.beginPath();
    ctx.arc(px - 9, py - 4, 4, 0, Math.PI * 2);
    ctx.arc(px + 9, py - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    // Arms
    ctx.fillStyle = color;
    ctx.fillRect(px - 13, py - 4, 4, 10);
    ctx.fillRect(px + 9, py - 4, 4, 10);
    // Helmet
    ctx.fillStyle = '#222244';
    ctx.beginPath();
    ctx.arc(px, py - 10, 7, 0, Math.PI * 2);
    ctx.fill();
    // Visor
    ctx.fillStyle = '#111133';
    ctx.fillRect(px - 5, py - 12, 10, 3);
    // Eye glow through visor
    ctx.fillStyle = '#FF2222';
    ctx.fillRect(px - 3, py - 11, 2, 1);
    ctx.fillRect(px + 1, py - 11, 2, 1);
    // Plume
    ctx.fillStyle = '#CC2222';
    ctx.fillRect(px - 1, py - 18, 2, 8);
    // Dark sword
    ctx.fillStyle = '#333';
    ctx.fillRect(px + 13, py - 14, 2, 22);
    ctx.fillStyle = '#555';
    ctx.fillRect(px + 13, py - 16, 2, 4);
    ctx.fillStyle = '#880000';
    ctx.fillRect(px + 10, py - 2, 8, 2);
  }

  // --- SWAMP BEAST: hulking swamp creature ---
  drawSwampBeast(ctx, px, py, isHurt) {
    const breath = Math.sin(this.behaviorTime * 0.003) * 2;
    const color = isHurt ? this.config.colorHurt : this.config.color;
    // Seaweed/moss dripping
    ctx.fillStyle = '#225522';
    for (let i = -2; i <= 2; i++) {
      const len = 4 + Math.sin(this.behaviorTime * 0.004 + i) * 3;
      ctx.fillRect(px + i * 5, py + 4, 2, len);
    }
    // Body (amorphous blob)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(px, py, 12 + breath, 10 + breath * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Lighter belly
    ctx.fillStyle = '#447755';
    ctx.beginPath();
    ctx.ellipse(px, py + 2, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eyes (multiple, glowing)
    ctx.fillStyle = '#88FF44';
    ctx.beginPath();
    ctx.arc(px - 5, py - 4, 3, 0, Math.PI * 2);
    ctx.arc(px + 4, py - 3, 2.5, 0, Math.PI * 2);
    ctx.arc(px + 1, py - 6, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(px - 4, py - 4, 1.5, 0, Math.PI * 2);
    ctx.arc(px + 5, py - 3, 1.2, 0, Math.PI * 2);
    ctx.arc(px + 2, py - 6, 1, 0, Math.PI * 2);
    ctx.fill();
    // Mouth (wide)
    ctx.fillStyle = '#113311';
    ctx.beginPath();
    ctx.ellipse(px, py + 4, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- SPIDER QUEEN: massive boss spider ---
  drawSpiderQueen(ctx, px, py, isHurt) {
    const legAnim = Math.sin(this.behaviorTime * 0.006);
    const color = isHurt ? this.config.colorHurt : this.config.color;
    const breath = Math.sin(this.behaviorTime * 0.003) * 2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px, py + 20, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs (4 per side, thick and long)
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const offset = legAnim * (i % 2 === 0 ? 4 : -4);
      const spread = (i - 1.5) * 0.35;
      // Left legs
      ctx.beginPath();
      ctx.moveTo(px - 10, py - 2 + i * 4);
      ctx.quadraticCurveTo(px - 26 - i * 2, py - 10 + offset + i * 3, px - 28 + i * 3, py + 10 + offset);
      ctx.stroke();
      // Right legs
      ctx.beginPath();
      ctx.moveTo(px + 10, py - 2 + i * 4);
      ctx.quadraticCurveTo(px + 26 + i * 2, py - 10 - offset + i * 3, px + 28 - i * 3, py + 10 - offset);
      ctx.stroke();
    }

    // Abdomen (huge, with markings)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(px, py + 6 + breath, 18, 14 + breath * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Hourglass marking
    ctx.fillStyle = '#CC0000';
    ctx.beginPath();
    ctx.moveTo(px, py - 2 + breath);
    ctx.lineTo(px - 5, py + 6 + breath);
    ctx.lineTo(px, py + 10 + breath);
    ctx.lineTo(px + 5, py + 6 + breath);
    ctx.closePath();
    ctx.fill();
    // Abdomen pattern
    ctx.strokeStyle = '#663355';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(px + i * 4, py + 8 + breath, 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Cephalothorax (head section)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(px, py - 10, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (8, arranged in rows - big central pair + smaller ones)
    ctx.fillStyle = '#FF0000';
    // Big central eyes
    ctx.beginPath();
    ctx.arc(px - 5, py - 13, 3.5, 0, Math.PI * 2);
    ctx.arc(px + 5, py - 13, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#FF6666';
    ctx.beginPath();
    ctx.arc(px - 6, py - 14, 1.5, 0, Math.PI * 2);
    ctx.arc(px + 4, py - 14, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Secondary eyes (smaller)
    ctx.fillStyle = '#DD0000';
    ctx.beginPath();
    ctx.arc(px - 9, py - 10, 2, 0, Math.PI * 2);
    ctx.arc(px + 9, py - 10, 2, 0, Math.PI * 2);
    ctx.fill();
    // Tertiary eyes (tiny)
    ctx.fillStyle = '#BB0000';
    ctx.beginPath();
    ctx.arc(px - 3, py - 8, 1.5, 0, Math.PI * 2);
    ctx.arc(px + 3, py - 8, 1.5, 0, Math.PI * 2);
    ctx.arc(px - 7, py - 6, 1, 0, Math.PI * 2);
    ctx.arc(px + 7, py - 6, 1, 0, Math.PI * 2);
    ctx.fill();

    // Fangs (large, dripping)
    ctx.fillStyle = '#FFFFAA';
    ctx.beginPath();
    ctx.moveTo(px - 4, py - 3);
    ctx.lineTo(px - 6, py + 6);
    ctx.lineTo(px - 2, py - 1);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px + 4, py - 3);
    ctx.lineTo(px + 6, py + 6);
    ctx.lineTo(px + 2, py - 1);
    ctx.closePath();
    ctx.fill();
    // Venom drip
    const drip = (this.behaviorTime * 0.004) % 1;
    ctx.fillStyle = '#88FF44';
    ctx.beginPath();
    ctx.arc(px - 6, py + 6 + drip * 8, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Crown/spines on head (queen marker)
    ctx.fillStyle = '#FFD700';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(px + i * 5, py - 18);
      ctx.lineTo(px + i * 5 - 2, py - 14);
      ctx.lineTo(px + i * 5 + 2, py - 14);
      ctx.closePath();
      ctx.fill();
    }

    // Boss name label
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SPIDER QUEEN', px, py - 26);
  }

  isDead() {
    return this.health <= 0;
  }

  getDrops() {
    return getDropForEnemy(this.type);
  }
}
