// player.js
import { PLAYER_STATES, DIRECTIONS, PLAYER_SPEED, PLAYER_ATTACK_DURATION, 
         PLAYER_HURT_DURATION, PLAYER_INVINCIBLE_DURATION, SPRITE_CONFIG } from './constants.js';

export class Player {
  constructor(x, y, resources, combatSystem) {
    this.x = x;
    this.y = y;
    this.tileX = Math.floor(x);
    this.tileY = Math.floor(y);
    this.resources = resources;
    this.combatSystem = combatSystem;
    
    // State
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
    
    // Animation
    this.currentFrame = 0;
    this.frameTime = 0;
    this.stateTime = 0;
    this.invincibleTime = 0;
    this.isInvincible = false;
    
    // Movement
    this.velocityX = 0;
    this.velocityY = 0;
    this.moving = false;
    
    // Combat
    this.attackCooldown = 0;
    this.knockback = null;
    this.width = 1;  // Collision box size in tiles
    this.height = 1;
  }

  update(deltaTime, input) {
    this.stateTime += deltaTime;
    
    // Update invincibility
    if (this.isInvincible) {
      this.invincibleTime += deltaTime;
      if (this.invincibleTime >= PLAYER_INVINCIBLE_DURATION) {
        this.isInvincible = false;
        this.invincibleTime = 0;
      }
    }
    
    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
    }
    
    // Handle knockback
    if (this.knockback) {
      this.x += this.knockback.x * deltaTime * 0.01;
      this.y += this.knockback.y * deltaTime * 0.01;
      this.knockback.duration -= deltaTime;
      
      if (this.knockback.duration <= 0) {
        this.knockback = null;
      }
      
      // Update tile position even during knockback
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
    this.velocityX = 0;
    this.velocityY = 0;
    
    if (input.DPAD_LEFT.pressed) {
      this.velocityX = -PLAYER_SPEED;
      this.direction = DIRECTIONS.LEFT;
    } else if (input.DPAD_RIGHT.pressed) {
      this.velocityX = PLAYER_SPEED;
      this.direction = DIRECTIONS.RIGHT;
    }
    
    if (input.DPAD_UP.pressed) {
      this.velocityY = -PLAYER_SPEED;
      this.direction = DIRECTIONS.UP;
    } else if (input.DPAD_DOWN.pressed) {
      this.velocityY = PLAYER_SPEED;
      this.direction = DIRECTIONS.DOWN;
    }
    
    this.moving = this.velocityX !== 0 || this.velocityY !== 0;
    this.state = this.moving ? PLAYER_STATES.WALKING : PLAYER_STATES.IDLE;
    
    // Update position
    this.x += this.velocityX * deltaTime / 1000;
    this.y += this.velocityY * deltaTime / 1000;
    
    // Update tile position
    this.tileX = Math.floor(this.x);
    this.tileY = Math.floor(this.y);
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
    // Switch between weapons with shoulder buttons if both are available
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
    this.attackCooldown = PLAYER_ATTACK_DURATION + 100; // Add small buffer
    
    // Create sword attack
    this.combatSystem.createAttack(this, 'sword');
    
    // Play sword sound
    this.resources.sounds.sword?.play();
  }

  rangedAttack() {
    if (this.inventory.arrows <= 0) return;
    
    this.state = PLAYER_STATES.ATTACKING;
    this.stateTime = 0;
    this.currentFrame = 0;
    this.attackCooldown = PLAYER_ATTACK_DURATION + 200; // Longer cooldown for bow
    
    // Create arrow attack
    this.combatSystem.createAttack(this, 'bow');
    
    // Consume arrow
    this.inventory.arrows--;
    
    // Play bow sound
    this.resources.sounds.bow?.play();
  }

  hurt(damage) {
    if (this.isInvincible) return;
    
    this.health = Math.max(0, this.health - damage);
    this.state = PLAYER_STATES.HURT;
    this.stateTime = 0;
    this.isInvincible = true;
    this.invincibleTime = 0;
    
    // Play hurt sound
    this.resources.sounds.hurt?.play();
    
    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    // Handle player death (game over state)
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
      return; // Skip drawing every other 100ms while invincible
    }
    
    const sprite = this.resources.images.player;
    const frameConfig = SPRITE_CONFIG.player;
    const animation = SPRITE_CONFIG.player.animations[this.state];
    const frame = animation.frames[this.currentFrame];
    
    // Calculate source rectangle from sprite sheet
    const srcX = frame * frameConfig.frameWidth;
    const srcY = Object.values(DIRECTIONS).indexOf(this.direction) * frameConfig.frameHeight;
    
    ctx.drawImage(
      sprite,
      srcX,
      srcY,
      frameConfig.frameWidth,
      frameConfig.frameHeight,
      Math.floor(this.x * 32),
      Math.floor(this.y * 32),
      32,
      32
    );
  }
}
