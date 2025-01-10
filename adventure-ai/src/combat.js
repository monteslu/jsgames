// combat.js
import { DIRECTIONS, PLAYER_STATES } from './constants.js';
import { playSound } from './utils.js';

export class CombatSystem {
  constructor(resources) {
    this.resources = resources;
    this.attacks = new Set();
    this.particles = new Set();
  }

  update(deltaTime, player, enemies, worldManager) {
    // Update existing attacks
    for (const attack of this.attacks) {
      attack.lifetime -= deltaTime;
      if (attack.lifetime <= 0) {
        this.attacks.delete(attack);
        continue;
      }
      
      // Move attack if it's a projectile
      if (attack.type === 'projectile') {
        attack.x += attack.dx * attack.speed * deltaTime;
        attack.y += attack.dy * attack.speed * deltaTime;
      }
      
      // Check collisions with enemies
      for (const enemy of enemies) {
        if (this.checkCollision(attack, enemy)) {
          // Calculate knockback direction
          const knockback = {
            x: attack.dx * 0.2,  // Reduced knockback for better control
            y: attack.dy * 0.2
          };
          
          // Apply damage and knockback
          enemy.hurt(attack.damage, knockback);
          
          // Remove projectile attacks on hit
          if (attack.type === 'projectile') {
            this.attacks.delete(attack);
          }
          
          // Create hit particles
          this.createHitParticles(attack.x, attack.y);
          
          // Play hit sound
          playSound(this.resources.sounds.hit);
        }
      }
      
      // Check collision with walls for projectiles
      if (attack.type === 'projectile' && !worldManager.isWalkable(attack.x, attack.y)) {
        this.attacks.delete(attack);
        this.createHitParticles(attack.x, attack.y);
      }
    }
    
    // Update particles
    for (const particle of this.particles) {
      particle.lifetime -= deltaTime;
      if (particle.lifetime <= 0) {
        this.particles.delete(particle);
        continue;
      }
      
      particle.x += particle.dx * deltaTime * 0.01;
      particle.y += particle.dy * deltaTime * 0.01;
      particle.size = Math.max(0, particle.size * (particle.lifetime / particle.initialLifetime));
    }
    
    // Check for enemy collisions with player
    if (player.state !== PLAYER_STATES.HURT) {
      for (const enemy of enemies) {
        // Update enemy cooldown
        if (enemy.attackCooldown > 0) {
          enemy.attackCooldown = Math.max(0, enemy.attackCooldown - deltaTime);
          continue;
        }

        if (this.checkCollision(player, enemy)) {
          player.hurt(enemy.damage);
          
          // Set attack cooldown
          enemy.attackCooldown = enemy.attackCooldownDuration;
          
          // Knockback direction from enemy
          const dx = player.x - enemy.x;
          const dy = player.y - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 0) {
            player.knockback = {
              x: (dx / dist) * 0.15,  // Reduced knockback force
              y: (dy / dist) * 0.15,
              duration: 100  // Short knockback duration
            };
          }
        }
      }
    }
  }

  createAttack(attacker, type) {
    let attack;
    
    switch (type) {
      case 'sword':
        attack = this.createSwordAttack(attacker);
        break;
      case 'bow':
        attack = this.createArrowAttack(attacker);
        break;
    }
    
    if (attack) {
      this.attacks.add(attack);
      // Play attack sound
      playSound(this.resources.sounds[type]);
    }
  }

  createSwordAttack(player) {
    const directionVectors = {
      [DIRECTIONS.UP]: { dx: 0, dy: -1 },
      [DIRECTIONS.DOWN]: { dx: 0, dy: 1 },
      [DIRECTIONS.LEFT]: { dx: -1, dy: 0 },
      [DIRECTIONS.RIGHT]: { dx: 1, dy: 0 }
    };
    
    const vector = directionVectors[player.direction];
    
    return {
      type: 'melee',
      x: player.x + vector.dx * 0.7,  // Position sword hitbox closer to player
      y: player.y + vector.dy * 0.7,
      dx: vector.dx,
      dy: vector.dy,
      width: 1.2,  // Slightly larger hitbox for better hit detection
      height: 1.2,
      damage: 1,
      lifetime: 200,  // Short lifetime for quick attacks
      speed: 0
    };
  }

  createArrowAttack(player) {
    const directionVectors = {
      [DIRECTIONS.UP]: { dx: 0, dy: -1 },
      [DIRECTIONS.DOWN]: { dx: 0, dy: 1 },
      [DIRECTIONS.LEFT]: { dx: -1, dy: 0 },
      [DIRECTIONS.RIGHT]: { dx: 1, dy: 0 }
    };
    
    const vector = directionVectors[player.direction];
    
    return {
      type: 'projectile',
      x: player.x + vector.dx,
      y: player.y + vector.dy,
      dx: vector.dx,
      dy: vector.dy,
      width: 0.5,
      height: 0.5,
      damage: 1,
      lifetime: 1000,
      speed: 0.01
    };
  }

  createHitParticles(x, y) {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      this.particles.add({
        x,
        y,
        dx: Math.cos(angle),
        dy: Math.sin(angle),
        size: 4,
        color: '#fff',
        lifetime: 200,
        initialLifetime: 200
      });
    }
  }

  checkCollision(a, b) {
    // Simple AABB collision
    const aLeft = a.x - (a.width || 1) / 2;
    const aRight = a.x + (a.width || 1) / 2;
    const aTop = a.y - (a.height || 1) / 2;
    const aBottom = a.y + (a.height || 1) / 2;
    
    const bLeft = b.x - (b.width || 1) / 2;
    const bRight = b.x + (b.width || 1) / 2;
    const bTop = b.y - (b.height || 1) / 2;
    const bBottom = b.y + (b.height || 1) / 2;
    
    return !(
      aRight < bLeft ||
      aLeft > bRight ||
      aBottom < bTop ||
      aTop > bBottom
    );
  }

  draw(ctx) {
    // Draw attacks
    for (const attack of this.attacks) {
      // Only draw projectile attacks - melee attacks are shown by player animation
      if (attack.type === 'projectile') {
        ctx.fillStyle = '#ff0';
        ctx.fillRect(
          Math.floor((attack.x - attack.width/2) * 32),
          Math.floor((attack.y - attack.height/2) * 32),
          Math.floor(attack.width * 32),
          Math.floor(attack.height * 32)
        );
      }
    }
    
    // Draw particles
    for (const particle of this.particles) {
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.lifetime / particle.initialLifetime;
      ctx.fillRect(
        Math.floor(particle.x * 32 - particle.size/2),
        Math.floor(particle.y * 32 - particle.size/2),
        Math.floor(particle.size),
        Math.floor(particle.size)
      );
      ctx.globalAlpha = 1;
    }
  }
}