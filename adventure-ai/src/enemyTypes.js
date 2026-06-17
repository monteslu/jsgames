// enemyTypes.js
import { COLORS } from './constants.js';
import { BEHAVIORS } from './enemyBehaviors.js';

export const ENEMY_TYPES = {
  slime: {
    health: 2,
    speed: 2,
    damage: 1,
    behavior: BEHAVIORS.CHASE,
    color: '#44DD44',
    colorHurt: '#DD4444',
    detectionRange: 5,
    width: 0.7,
    height: 0.7,
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
    speed: 3.5,
    damage: 1,
    behavior: BEHAVIORS.SWARM,
    color: '#CC44CC',
    colorHurt: '#FF6666',
    detectionRange: 7,
    width: 0.5,
    height: 0.4,
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
    speed: 2.5,
    damage: 1,
    behavior: BEHAVIORS.PATROL,
    color: '#CCCCAA',
    colorHurt: '#FF8888',
    detectionRange: 6,
    width: 0.6,
    height: 0.9,
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
    speed: 1.5,
    damage: 1,
    behavior: BEHAVIORS.RANGED,
    color: '#6644CC',
    colorHurt: '#FF6666',
    detectionRange: 6,
    width: 0.6,
    height: 0.8,
    projectileSpeed: 0.003,
    shootCooldown: 2500,
    animations: {
      idle: { frames: [0], frameTime: 0 },
      casting: { frames: [1, 2], frameTime: 200 },
      moving: { frames: [3, 4], frameTime: 200 }
    },
    dropChance: 0.5,
    possibleDrops: ['heart', 'key', 'arrow']
  },

  ghost: {
    health: 2,
    speed: 2.0,
    damage: 1,
    behavior: BEHAVIORS.TELEPORT,
    color: '#88DDFF',
    colorHurt: '#FF8888',
    detectionRange: 6,
    width: 0.6,
    height: 0.7,
    teleportCooldown: 3000,
    animations: {
      idle: { frames: [0], frameTime: 0 },
      fade: { frames: [1, 2, 3], frameTime: 100 },
      moving: { frames: [0, 1], frameTime: 200 }
    },
    dropChance: 0.3,
    possibleDrops: ['heart']
  },

  spider: {
    health: 2,
    speed: 1.8,
    damage: 1,
    behavior: BEHAVIORS.AMBUSH,
    color: '#884422',
    colorHurt: '#FF4444',
    detectionRange: 4,
    width: 0.7,
    height: 0.5,
    ambushSpeed: 5.0,
    animations: {
      idle: { frames: [0], frameTime: 0 },
      ambush: { frames: [1, 2, 3], frameTime: 100 },
      moving: { frames: [1, 2], frameTime: 150 }
    },
    dropChance: 0.35,
    possibleDrops: ['heart', 'arrow']
  },

  // --- New types ---

  goblin: {
    health: 2,
    speed: 3.5,
    damage: 1,
    behavior: BEHAVIORS.AMBUSH,
    color: '#66AA44',
    colorHurt: '#FF6644',
    detectionRange: 5,
    width: 0.5,
    height: 0.6,
    ambushSpeed: 6.0,
    animations: {
      idle: { frames: [0], frameTime: 0 },
      ambush: { frames: [1, 2], frameTime: 80 },
      moving: { frames: [1, 2], frameTime: 120 }
    },
    dropChance: 0.35,
    possibleDrops: ['arrow', 'key']
  },

  orc: {
    health: 5,
    speed: 2.0,
    damage: 2,
    behavior: BEHAVIORS.CHASE,
    color: '#448844',
    colorHurt: '#CC4444',
    detectionRange: 6,
    width: 0.9,
    height: 1.0,
    animations: {
      idle: { frames: [0, 1], frameTime: 400 },
      moving: { frames: [1, 2, 3], frameTime: 180 },
      attacking: { frames: [4, 5], frameTime: 120 }
    },
    dropChance: 0.5,
    possibleDrops: ['heart', 'heart', 'key', 'arrow']
  },

  troll: {
    health: 8,
    speed: 1.2,
    damage: 3,
    behavior: BEHAVIORS.PATROL,
    color: '#667788',
    colorHurt: '#DD5555',
    detectionRange: 5,
    width: 1.1,
    height: 1.2,
    animations: {
      idle: { frames: [0], frameTime: 0 },
      moving: { frames: [1, 2, 3, 4], frameTime: 250 },
      attacking: { frames: [5, 6], frameTime: 200 }
    },
    dropChance: 0.6,
    possibleDrops: ['heart', 'heart', 'key', 'arrow', 'arrow']
  },

  fireImp: {
    health: 2,
    speed: 1.8,
    damage: 1,
    behavior: BEHAVIORS.RANGED,
    color: '#FF6622',
    colorHurt: '#FFAA44',
    detectionRange: 5,
    width: 0.5,
    height: 0.5,
    projectileSpeed: 0.003,
    shootCooldown: 2500,
    animations: {
      idle: { frames: [0], frameTime: 0 },
      casting: { frames: [1, 2], frameTime: 150 },
      moving: { frames: [3, 4], frameTime: 150 }
    },
    dropChance: 0.3,
    possibleDrops: ['heart', 'arrow']
  },

  darkKnight: {
    health: 6,
    speed: 2.5,
    damage: 2,
    behavior: BEHAVIORS.CHASE,
    color: '#333355',
    colorHurt: '#884444',
    detectionRange: 7,
    width: 0.8,
    height: 1.0,
    animations: {
      idle: { frames: [0], frameTime: 0 },
      moving: { frames: [1, 2, 3], frameTime: 160 },
      attacking: { frames: [4, 5], frameTime: 100 }
    },
    dropChance: 0.5,
    possibleDrops: ['heart', 'key', 'arrow', 'arrow']
  },

  swampBeast: {
    health: 4,
    speed: 1.5,
    damage: 2,
    behavior: BEHAVIORS.AMBUSH,
    color: '#336644',
    colorHurt: '#884422',
    detectionRange: 4,
    width: 0.9,
    height: 0.8,
    ambushSpeed: 4.0,
    animations: {
      idle: { frames: [0], frameTime: 0 },
      ambush: { frames: [1, 2, 3], frameTime: 120 },
      moving: { frames: [1, 2], frameTime: 180 }
    },
    dropChance: 0.4,
    possibleDrops: ['heart', 'arrow']
  },

  spiderQueen: {
    health: 16,
    speed: 1.8,
    damage: 2,
    behavior: BEHAVIORS.CHASE,
    color: '#552244',
    colorHurt: '#CC2222',
    detectionRange: 10,
    width: 1.6,
    height: 1.4,
    isBoss: true,
    animations: {
      idle: { frames: [0, 1], frameTime: 300 },
      moving: { frames: [1, 2, 3], frameTime: 150 },
      attacking: { frames: [4, 5], frameTime: 100 }
    },
    dropChance: 1.0,
    possibleDrops: ['bigHeart']
  }
};

export function getDropForEnemy(type) {
  const config = ENEMY_TYPES[type];
  if (!config || Math.random() > config.dropChance) {
    return null;
  }
  const dropIndex = Math.floor(Math.random() * config.possibleDrops.length);
  return config.possibleDrops[dropIndex];
}
