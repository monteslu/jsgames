// player.js
import { PLAYER_STATES, DIRECTIONS, PLAYER_SPEED, PLAYER_ATTACK_DURATION, 
         PLAYER_HURT_DURATION, PLAYER_INVINCIBLE_DURATION, SPRITE_CONFIG, TILE_TYPES } from './constants.js';
import { playSound } from './utils.js';

export class Player {
  constructor(x, y, resources, combatSystem, worldManager) {
    this.x = x;
    this.y = y;
    this.tileX = Math.floor(x);
    this.tileY = Math.floor(y);
    this.resources = resources;
    this.combatSystem = combatSystem;
    this.worldManager = worldManager;
    
    this.state = PLAYER_STATES.IDLE;
    this.direction = DIRECTIONS.DOWN;
    this.health = 3;
    this.maxHealth = 3;
    this.inventory = {
      keys: 0,
      sword: false,
      bow: false,
      arrows: 0
    };
    
    this.currentFrame = 0;
    this.frameTime = 0;
    this.stateTime = 0;
    this.invincibleTime = 0;
    this.isInvincible = false;
    
    this.velocityX = 0;
    this.velocityY = 0;
    this.moving = false;
    
    this.attackCooldown = 0;
    this.knockback = null;
    this.hitboxSize = 0.6;  // Collision hitbox size (in tiles)
    this.currentWeapon = 'sword';  // Default weapon
  }

  update(deltaTime, input) {
    this.stateTime += deltaTime;

    // check if stuck in a wall
    if (!this.worldManager.isWalkable(this.x, this.y, this.hitboxSize)) {
      const unstuckPosition = this.worldManager.unstuckEntity(this.x, this.y, this.hitboxSize);
      this.x = unstuckPosition.x;
      this.y = unstuckPosition.y;
    }
    
    if (this.isInvincible) {
      this.invincibleTime += deltaTime;
      if (this.invincibleTime >= PLAYER_INVINCIBLE_DURATION) {
        this.isInvincible = false;
        this.invincibleTime = 0;
      }
    }
    
    if (this.attackCooldown > 0) {
      this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
    }
    
    if (this.knockback) {
      const oldX = this.x;
      const oldY = this.y;
      
      this.x += this.knockback.x;
      this.y += this.knockback.y;
      
      if (!this.worldManager.isWalkable(this.x, this.y, this.hitboxSize)) {
        this.x = oldX;
        this.y = oldY;
      }
      
      this.knockback.duration -= deltaTime;
      
      if (this.knockback.duration <= 0) {
        this.knockback = null;
      }
      
      this.tileX = Math.floor(this.x);
      this.tileY = Math.floor(this.y);
      return;
    }
    
    switch (this.state) {
      case PLAYER_STATES.IDLE:
      case PLAYER_STATES.WALKING:
        this.handleMovement(deltaTime, input);
        this.handleAttack(input);
        this.handleWeaponSwitch(input);
        break;
        
      case PLAYER_STATES.ATTACKING:
        if (this.stateTime >= PLAYER_ATTACK_DURATION) {
          this.state = PLAYER_STATES.IDLE;
          this.stateTime = 0;
        }
        break;
        
      case PLAYER_STATES.HURT:
        if (this.stateTime >= PLAYER_HURT_DURATION) {
          this.state = PLAYER_STATES.IDLE;
          this.stateTime = 0;
        }
        break;
    }
    
    this.updateAnimation(deltaTime);
  }

  handleMovement(deltaTime, input) {
    let dx = 0;
    let dy = 0;
    
    if (input.DPAD_LEFT.pressed) {
      dx = -1;
      this.direction = DIRECTIONS.LEFT;
    } else if (input.DPAD_RIGHT.pressed) {
      dx = 1;
      this.direction = DIRECTIONS.RIGHT;
    }
    
    if (input.DPAD_UP.pressed) {
      dy = -1;
      this.direction = DIRECTIONS.UP;
    } else if (input.DPAD_DOWN.pressed) {
      dy = 1;
      this.direction = DIRECTIONS.DOWN;
    }

    if (dx !== 0 && dy !== 0) {
      const normalizer = Math.sqrt(0.5);
      dx *= normalizer;
      dy *= normalizer;
    }

    const newX = this.x + dx * PLAYER_SPEED * (deltaTime / 1000);
    const newY = this.y + dy * PLAYER_SPEED * (deltaTime / 1000);

    const oldX = this.x;
    const oldY = this.y;

    if (dx !== 0) {
      this.x = newX;
      if (!this.isValidPosition()) {
        this.x = oldX;
      }
    }

    if (dy !== 0) {
      this.y = newY;
      if (!this.isValidPosition()) {
        this.y = oldY;
      }
    }

    this.tileX = Math.floor(this.x);
    this.tileY = Math.floor(this.y);
    this.moving = dx !== 0 || dy !== 0;
    
    // Only change to walking state if not attacking
    if (this.state !== PLAYER_STATES.ATTACKING) {
      this.state = this.moving ? PLAYER_STATES.WALKING : PLAYER_STATES.IDLE;
    }
  }

  isValidPosition() {
    return this.worldManager.isWalkable(this.x, this.y, this.hitboxSize);
  }

  getHitbox() {
    return {
      left: this.x - this.hitboxSize / 2,
      right: this.x + this.hitboxSize / 2,
      top: this.y - this.hitboxSize / 2,
      bottom: this.y + this.hitboxSize / 2,
      width: this.hitboxSize,
      height: this.hitboxSize
    };
  }

  handleAttack(input) {
    if (this.attackCooldown > 0) return;
    
    if (input.BUTTON_SOUTH.pressed) {
      if (this.inventory.sword) {
        this.meleeAttack();
      }
    } else if (input.BUTTON_EAST.pressed) {
      if (this.inventory.bow && this.inventory.arrows > 0) {
        this.rangedAttack();
      }
    }
  }

  handleWeaponSwitch(input) {
    if (this.inventory.sword && this.inventory.bow) {
      if (input.LEFT_SHOULDER.pressed) {
        this.currentWeapon = 'sword';
      } else if (input.RIGHT_SHOULDER.pressed) {
        this.currentWeapon = 'bow';
      }
    }
  }

  meleeAttack() {
    this.state = PLAYER_STATES.ATTACKING;
    this.stateTime = 0;
    this.currentFrame = 0;
    this.attackCooldown = PLAYER_ATTACK_DURATION + 100;
    
    this.combatSystem.createAttack(this, 'sword');
    playSound(this.resources.sounds.sword);
  }

  rangedAttack() {
    if (this.inventory.arrows <= 0) return;
    
    this.state = PLAYER_STATES.ATTACKING;
    this.stateTime = 0;
    this.currentFrame = 0;
    this.attackCooldown = PLAYER_ATTACK_DURATION + 200;
    
    this.combatSystem.createAttack(this, 'bow');
    this.inventory.arrows--;
    playSound(this.resources.sounds.bow);
  }

  hurt(damage) {
    if (this.isInvincible) return;
    
    this.health = Math.max(0, this.health - damage);
    this.state = PLAYER_STATES.HURT;
    this.stateTime = 0;
    this.isInvincible = true;
    this.invincibleTime = 0;
    
    playSound(this.resources.sounds.hurt);
    
    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    console.log('Player died');
  }

  updateAnimation(deltaTime) {
    const animation = SPRITE_CONFIG.player.animations[this.state];
    if (!animation) return;
    
    this.frameTime += deltaTime;
    
    if (this.frameTime >= animation.frameTime) {
      this.frameTime = 0;
      this.currentFrame = (this.currentFrame + 1) % animation.frames.length;
    }
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  addItem(item) {
    switch (item) {
      case TILE_TYPES.KEY:
        this.inventory.keys++;
        playSound(this.resources.sounds.item);
        break;
      case TILE_TYPES.SWORD:
        this.inventory.sword = true;
        playSound(this.resources.sounds.tada);
        break;
      case TILE_TYPES.BOW:
        this.inventory.bow = true;
        playSound(this.resources.sounds.item);
        break;
      case TILE_TYPES.ARROW:
        this.inventory.arrows += 5;
        playSound(this.resources.sounds.item);
        break;
      case TILE_TYPES.HEART:
        this.heal(1);
        playSound(this.resources.sounds.item);
        break;
    }
  }

  draw(ctx) {
    if (this.isInvincible && Math.floor(this.invincibleTime / 100) % 2 === 0) {
      return;
    }
    
    const sprite = this.resources.images.player;
    const frameConfig = SPRITE_CONFIG.player;
    const animation = SPRITE_CONFIG.player.animations[this.state];
    const frame = animation.frames[this.currentFrame];
    
    const srcX = frame * frameConfig.frameWidth;
    const srcY = Object.values(DIRECTIONS).indexOf(this.direction) * frameConfig.frameHeight;
    
    // Draw sprite centered on position
    ctx.drawImage(
      sprite,
      srcX,
      srcY,
      frameConfig.frameWidth,
      frameConfig.frameHeight,
      Math.floor(this.x * 32 - 16),
      Math.floor(this.y * 32 - 16),
      32,
      32
    );

    // Draw sword swing effect when attacking
    if (this.state === PLAYER_STATES.ATTACKING && this.inventory.sword) {
      const swingProgress = this.stateTime / PLAYER_ATTACK_DURATION;
      const swingAngle = Math.PI * swingProgress;
      
      ctx.save();
      ctx.translate(
        Math.floor(this.x * 32),
        Math.floor(this.y * 32)
      );
      
      // Rotate based on direction and swing progress
      switch(this.direction) {
        case DIRECTIONS.RIGHT:
          ctx.rotate(swingAngle);
          break;
        case DIRECTIONS.LEFT:
          ctx.rotate(Math.PI + swingAngle);
          break;
        case DIRECTIONS.DOWN:
          ctx.rotate(Math.PI/2 + swingAngle);
          break;
        case DIRECTIONS.UP:
          ctx.rotate(-Math.PI/2 + swingAngle);
          break;
      }
      
      // Draw swing arc
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 20, -Math.PI/4, Math.PI/4);
      ctx.stroke();
      
      ctx.restore();
    }
  }
}