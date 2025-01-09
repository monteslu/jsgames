// constants.js

// Game tile types
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

// Movement directions
export const DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right'
};

// Color palette (based on NES limitations)
export const COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#7C7C7C',
  red: '#FF0000',
  green: '#00FF00',
  blue: '#0000FF',
  yellow: '#FFFF00',
  cyan: '#00FFFF',
  magenta: '#FF00FF'
};

// Sprite configurations for all game elements
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

// Player movement and combat constants
export const PLAYER_SPEED = 1.75; // Tiles per second
export const PLAYER_ATTACK_DURATION = 250; // milliseconds
export const PLAYER_HURT_DURATION = 500; // milliseconds
export const PLAYER_INVINCIBLE_DURATION = 1000; // milliseconds

// Player states
export const PLAYER_STATES = {
  IDLE: 'idle',
  WALKING: 'walking',
  ATTACKING: 'attacking',
  HURT: 'hurt'
};

// Game screen configuration
export const SCREEN_CONFIG = {
  TILE_SIZE: 32,
  PLAY_AREA_WIDTH: 20,
  PLAY_AREA_HEIGHT: 12,
  STATUS_HEIGHT: 96,
  TOTAL_WIDTH: 640, // 20 tiles * 32 pixels
  TOTAL_HEIGHT: 480 // (12 tiles * 32 pixels) + 96 pixels status bar
};

// Status bar configuration
export const STATUS_BAR = {
  height: 96,
  heartWidth: 24,
  heartHeight: 24,
  heartSpacing: 4,
  weaponSize: 48,
  miniMapScale: 2,
  padding: 8
};

// Game states
export const GAME_STATES = {
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over'
};

// Screen transition configuration
export const TRANSITION_CONFIG = {
  DURATION: 500,
  TYPES: {
    NONE: 'none',
    FADE: 'fade',
    SLIDE: 'slide'
  }
};

// Debug configuration
export const DEBUG_CONFIG = {
  SHOW_COLLISION: false,
  SHOW_GRID: false,
  SHOW_FPS: false,
  INVINCIBLE: false
};