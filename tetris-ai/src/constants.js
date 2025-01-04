// Game board dimensions (standard Tetris size)
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const BLOCK_SIZE = 24; // pixels
export const PREVIEW_SIZE = 4; // size of the preview grid

// Colors for different pieces (retro NES-style palette)
export const COLORS = {
  I: '#00f0f0', // cyan
  O: '#f0f000', // yellow
  T: '#a000f0', // purple
  S: '#00f000', // green
  Z: '#f00000', // red
  J: '#0000f0', // blue
  L: '#f0a000', // orange
  ghost: '#333333', // ghost piece color
  grid: '#333333', // grid line color
  background: '#000000', // background color
  cleared: '#ffffff', // flash color for cleared lines
};

// Tetromino shapes in their initial orientation
export const SHAPES = {
  I: [[0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]],
  
  O: [[1, 1],
      [1, 1]],
  
  T: [[0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]],
  
  S: [[0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]],
  
  Z: [[1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]],
  
  J: [[1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]],
  
  L: [[0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]]
};

// Points awarded for different actions
export const POINTS = {
  SOFT_DROP: 1,
  HARD_DROP: 2,
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
};

// Game speed (milliseconds per drop)
export const STARTING_SPEED = 1000;
export const SOFT_DROP_SPEED = 50;
export const LOCK_DELAY = 500;

// DAS (Delayed Auto Shift) settings
export const DAS_DELAY = 167; // Initial delay before auto-repeat
export const DAS_SPEED = 33;  // Speed of auto-repeat