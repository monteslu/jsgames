// player.js
import { PLAYER_STATES, DIRECTIONS, PLAYER_SPEED, PLAYER_ATTACK_DURATION, 
         PLAYER_HURT_DURATION, PLAYER_INVINCIBLE_DURATION, SPRITE_CONFIG, TILE_TYPES } from './constants.js';

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
    this.hitboxSize = 0.5;  // Slightly smaller than tile size
  }

  update(deltaTime, input) {
    this.stateTime += deltaTime;
    
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
      this.x += this.knockback.x * deltaTime * 0.01;
      this.y += this.knockback.y * deltaTime * 0.01;
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

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const normalizer = Math.sqrt(0.5);
      dx *= normalizer;
      dy *= normalizer;
    }

    // Calculate new position with delta time
    const newX = this.x + dx * PLAYER_SPEED * (deltaTime / 1000);
    const newY = this.y + dy * PLAYER_SPEED * (deltaTime / 1000);

    // Store current position for restoration if needed
    const oldX = this.x;
    const oldY = this.y;

    // Try horizontal movement
    if (dx !== 0) {
      this.x = newX;
      if (!this.isValidPosition()) {
        this.x = oldX;
      }
    }

    // Try vertical movement
    if (dy !== 0) {
      this.y = newY;
      if (!this.isValidPosition()) {
        this.y = oldY;
      }
    }

    // Update tile position and movement state
    this.tileX = Math.floor(this.x);
    this.tileY = Math.floor(this.y);
    this.moving = dx !== 0 || dy !== 0;
    this.state = this.moving ? PLAYER_STATES.WALKING : PLAYER_STATES.IDLE;
  }

  isValidPosition() {
    const hitbox = {
      left: this.x - this.hitboxSize / 2,
      right: this.x + this.hitboxSize / 2,
      top: this.y - this.hitboxSize / 2,
      bottom: this.y + this.hitboxSize / 2
    };

    // Get the tiles that the hitbox intersects with
    const minTileX = Math.floor(hitbox.left);
    const maxTileX = Math.ceil(hitbox.right);
    const minTileY = Math.floor(hitbox.top);
    const maxTileY = Math.ceil(hitbox.bottom);

    // Check screen transitions
    if (this.x < -0.45 || this.x > this.worldManager.screenWidth - 0.55 ||
        this.y < -0.45 || this.y > this.worldManager.screenHeight - 0.55) {
      return true;
    }

    // Check each tile for collision
    for (let y = minTileY; y < maxTileY; y++) {
      for (let x = minTileX; x < maxTileX; x++) {
        if (x >= 0 && x < this.worldManager.screenWidth && 
            y >= 0 && y < this.worldManager.screenHeight) {
          const tile = this.worldManager.getTile(x, y);
          if (tile === TILE_TYPES.WALL || 
            (tile === TILE_TYPES.DOOR && !this.inventory.keys)) {
            return false;
          }
        }
      }
    }

    return true;
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
    this.resources.sounds.sword?.play();
  }

  rangedAttack() {
    if (this.inventory.arrows <= 0) return;
    
    this.state = PLAYER_STATES.ATTACKING;
    this.stateTime = 0;
    this.currentFrame = 0;
    this.attackCooldown = PLAYER_ATTACK_DURATION + 200;
    
    this.combatSystem.createAttack(this, 'bow');
    this.inventory.arrows--;
    this.resources.sounds.bow?.play();
  }

  hurt(damage) {
    if (this.isInvincible) return;
    
    this.health = Math.max(0, this.health - damage);
    this.state = PLAYER_STATES.HURT;
    this.stateTime = 0;
    this.isInvincible = true;
    this.invincibleTime = 0;
    
    this.resources.sounds.hurt?.play();
    
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
      case 'key':
        this.inventory.keys++;
        break;
      case 'sword':
        this.inventory.sword = true;
        break;
      case 'bow':
        this.inventory.bow = true;
        break;
      case 'arrow':
        this.inventory.arrows += 5;
        break;
      case 'heart':
        this.heal(1);
        break;
      case 'heartContainer':
        this.maxHealth++;
        this.heal(1);
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
    
    ctx.strokeStyle = 'red';
    ctx.strokeRect(
      Math.floor(this.x * 32 - 16),  // Center the sprite on the position
      Math.floor(this.y * 32 - 16),
      32,
      32
    );
    ctx.drawImage(
      sprite,
      srcX,
      srcY,
      frameConfig.frameWidth,
      frameConfig.frameHeight,
      Math.floor(this.x * 32 - 16),  // Center the sprite on the position
      Math.floor(this.y * 32 - 16),
      32,
      32
    );
  }
}