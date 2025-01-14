// constants.js

export const TILE_TYPES = {
  EMPTY: ' ',
  WALL: 'x',
  DOOR: 'd',
  BUSH: 'b',
  WATER: 'w',  
  BRIDGE: '=',
  KEY: 'k',
  SWORD: 's',
  HEART: 'h',
  BOW: 'B',    
  ARROW: 'a'
};

export const DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right'
};

export const COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#7C7C7C',
  darkGray: '#404040',
  red: '#FF0000',
  lightGreenGrass: '#90EE90',
  green: '#00FF00',
  blue: '#0000FF',
  yellow: '#FFFF00',
  cyan: '#00FFFF',
  magenta: '#FF00FF',
  tan: '#FCD8A8',  
  minimap: {
    unexplored: '#404040',    
    explored: '#FCD8A8',      
    current: '#FFFFFF'        
  }
};

export const SPRITE_CONFIG = {
  tiles: {
    frameWidth: 32,
    frameHeight: 32,
    mapping: {
      [TILE_TYPES.WALL]: 0,
      [TILE_TYPES.DOOR]: 1,
      [TILE_TYPES.BUSH]: 2,
      [TILE_TYPES.WATER]: 3,    
      [TILE_TYPES.BRIDGE]: 4
    }
  },
  items: {
    frameWidth: 32,
    frameHeight: 32,
    mapping: {
      [TILE_TYPES.KEY]: 0,
      [TILE_TYPES.SWORD]: 1,
      [TILE_TYPES.HEART]: 2,
      [TILE_TYPES.BOW]: 3,
      [TILE_TYPES.ARROW]: 4
    }
  },
  player: {
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      idle: {
        frames: [0],
        frameTime: 0
      },
      walking: {
        frames: [0, 1],
        frameTime: 200
      },
      attacking: {
        frames: [2],
        frameTime: 200
      },
      hurt: {
        frames: [3],
        frameTime: 0
      }
    }
  },
  enemies: {
    frameWidth: 32,
    frameHeight: 32,
    types: {
      slime: {
        color: COLORS.green,
        frames: 2
      },
      skeleton: {
        color: COLORS.gray,
        frames: 4
      },
      bat: {
        color: COLORS.magenta,
        frames: 2
      }
    }
  }
};

export const PLAYER_SPEED = 5.0;
export const PLAYER_ATTACK_DURATION = 200;
export const PLAYER_HURT_DURATION = 500;
export const PLAYER_INVINCIBLE_DURATION = 1000;
export const PLAYER_ATTACK_COOLDOWN = 300;

export const PLAYER_STATES = {
  IDLE: 'idle',
  WALKING: 'walking',
  ATTACKING: 'attacking',
  HURT: 'hurt'
};

export const SCREEN_CONFIG = {
  TILE_SIZE: 32,
  PLAY_AREA_WIDTH: 20,
  PLAY_AREA_HEIGHT: 12,
  STATUS_HEIGHT: 96,
  TOTAL_WIDTH: 640,
  TOTAL_HEIGHT: 480
};

export const STATUS_BAR = {
  height: 96,
  heartWidth: 24,
  heartHeight: 24,
  heartSpacing: 4,
  weaponSize: 48,
  weaponSpacing: 8,
  miniMap: {
    screenWidth: 10,    
    screenHeight: 6,    
    padding: 8
  },
  padding: 8,
  sections: {
    health: {
      x: 8,
      y: 8,
      width: 120,
      height: 32
    },
    weapons: {
      x: -56,  
      y: 8,
      width: 48,
      height: 48
    },
    minimap: {
      x: 'center',  
      y: 8,
      width: null,  
      height: null  
    }
  }
};

export const GAME_STATES = {
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED: 'paused',
  TRANSITIONING: 'transitioning',
  GAME_OVER: 'game_over'
};

export const TRANSITION_CONFIG = {
  DURATION: 500,
  TYPES: {
    NONE: 'none',
    FADE: 'fade',
    SLIDE: 'slide'
  }
};

export const COMBAT_CONFIG = {
  SWORD: {
    damage: 1,
    range: 1.2,
    arc: Math.PI / 2,
    knockback: 0.2
  },
  BOW: {
    damage: 1,
    speed: 0.01,
    range: 8
  },
  DAGGER: {
    damage: 1,
    speed: 0.015,  // Faster than arrows
    range: 6,
    size: 0.3      // Smaller hitbox than arrows
  }
};

export const DEBUG_CONFIG = {
  SHOW_COLLISION: false,
  SHOW_GRID: false,
  SHOW_FPS: false,
  INVINCIBLE: false
};