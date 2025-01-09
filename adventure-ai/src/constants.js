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
  HEART: 'h'
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
  red: '#FF0000',
  green: '#00FF00',
  blue: '#0000FF',
  yellow: '#FFFF00',
  cyan: '#00FFFF',
  magenta: '#FF00FF',
  tan: '#FCD8A8'
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
      [TILE_TYPES.HEART]: 2
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
        frameTime: 0
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
export const PLAYER_ATTACK_DURATION = 250;
export const PLAYER_HURT_DURATION = 500;
export const PLAYER_INVINCIBLE_DURATION = 1000;

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
  miniMapScale: 2,
  padding: 8
};

export const GAME_STATES = {
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED: 'paused',
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

export const DEBUG_CONFIG = {
  SHOW_COLLISION: false,
  SHOW_GRID: false,
  SHOW_FPS: false,
  INVINCIBLE: false
};