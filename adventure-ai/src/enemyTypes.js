// enemyTypes.js
import { COLORS } from './constants.js';
import { BEHAVIORS } from './enemyBehaviors.js';

export const ENEMY_TYPES = {
  slime: {
    health: 2,
    speed: 0.05,
    damage: 1,
    behavior: BEHAVIORS.CHASE,
    color: COLORS.green,
    detectionRange: 5,
    animations: {
      idle: { frames: [0, 1], frameTime: 500 },
      moving: { frames: [1, 2, 3], frameTime: 200 },
      attacking: { frames: [4, 5], frameTime: 150 }
    },
    dropChance: 0.3,
    possibleDrops: ['heart', 'arrow']
  },

  bat: {
    health: 1,
    speed: 0.12,
    damage: 1,
    behavior: BEHAVIORS.SWARM,
    color: COLORS.magenta,
    detectionRange: 7,
    animations: {
      idle: { frames: [0, 1], frameTime: 100 },
      moving: { frames: [1, 2], frameTime: 100 },
      attacking: { frames: [3], frameTime: 0 }
    },
    dropChance: 0.2,
    possibleDrops: ['arrow']
  },

  skeleton: {
    health: 3,
    speed: 0.08,
    damage: 1,
    behavior: BEHAVIORS.PATROL,
    color: COLORS.gray,
    detectionRange: 6,
    animations: {
      idle: { frames: [0], frameTime: 0 },
      moving: { frames: [1, 2, 3, 4], frameTime: 150 },
      attacking: { frames: [5, 6], frameTime: 100 }
    },
    dropChance: 0.4,
    possibleDrops: ['heart', 'key', 'arrow']
  },

  wizard: {
    health: 2,
    speed: 0.06,
    damage: 1,
    behavior: BEHAVIORS.RANGED,
    color: COLORS.blue,
    detectionRange: 8,
    projectileSpeed: 0.15,
    shootCooldown: 2000,
    animations: {
      idle: { frames: [0], frameTime: 0 },
      casting: { frames: [1, 2], frameTime: 200 },
      moving: { frames: [3, 4], frameTime: 200 }
    },
    dropChance: 0.5,
    possibleDrops: ['heart', 'key', 'arrow', 'magicPotion']
  },

  ghost: {
    health: 2,
    speed: 0.1,
    damage: 1,
    behavior: BEHAVIORS.TELEPORT,
    color: COLORS.cyan,
    detectionRange: 6,
    teleportCooldown: 3000,
    animations: {
      idle: { frames: [0], frameTime: 0 },
      fade: { frames: [1, 2, 3], frameTime: 100 },
      moving: { frames: [0, 1], frameTime: 200 }
    },
    dropChance: 0.3,
    possibleDrops: ['heart', 'magicPotion']
  },

  spider: {
    health: 2,
    speed: 0.09,
    damage: 1,
    behavior: BEHAVIORS.AMBUSH,
    color: COLORS.red,
    detectionRange: 4,
    ambushSpeed: 0.25,
    animations: {
      idle: { frames: [0], frameTime: 0 },
      ambush: { frames: [1, 2, 3], frameTime: 100 },
      moving: { frames: [1, 2], frameTime: 150 }
    },
    dropChance: 0.35,
    possibleDrops: ['heart', 'arrow']
  }
};

// Helper functions for enemy generation
export function generateRandomEnemy(x, y, difficulty = 1) {
  const types = Object.keys(ENEMY_TYPES);
  const typeIndex = Math.floor(Math.random() * types.length);
  const type = types[typeIndex];
  
  const config = { ...ENEMY_TYPES[type] };
  
  // Scale enemy stats based on difficulty
  config.health = Math.ceil(config.health * difficulty);
  config.damage = Math.ceil(config.damage * difficulty);
  config.speed *= 1 + (difficulty - 1) * 0.1;
  
  return { type, x, y, config };
}

export function generateEnemyGroup(centerX, centerY, count, spread, difficulty = 1) {
  const enemies = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const distance = Math.random() * spread;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    enemies.push(generateRandomEnemy(x, y, difficulty));
  }
  return enemies;
}

export function getDropForEnemy(type) {
  const config = ENEMY_TYPES[type];
  if (Math.random() > config.dropChance) {
    return null;
  }
  const dropIndex = Math.floor(Math.random() * config.possibleDrops.length);
  return config.possibleDrops[dropIndex];
}
