import { Game } from './game-core.js';
import { Renderer } from './renderer.js';
import { getInput } from './utils.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = 640;
canvas.height = 480;
const game = new Game();
const renderer = new Renderer(canvas);

let lastTime = performance.now();
let leftHeld = 0;
let rightHeld = 0;

// Track rotation button states
let canRotateClockwise = true;
let canRotateCounterClockwise = true;
let canTogglePause = true;

function handleInput() {
  const [player] = getInput();
  
  // Handle pause/unpause and game restart
  if (player.START.pressed) {
    if (canTogglePause) {
      if (game.gameOver) {
        game.reset();
      } else {
        game.paused = !game.paused;
      }
      canTogglePause = false;
    }
  } else {
    canTogglePause = true;
  }

  // Don't process other inputs if game is paused or over
  if (game.paused || game.gameOver) return;
  
  // Handle left/right movement with DAS (Delayed Auto Shift)
  if (player.DPAD_LEFT.pressed) {
    if (leftHeld === 0 || (leftHeld > 16 && leftHeld % 6 === 0)) {
      game.moveLeft();
    }
    leftHeld++;
  } else {
    leftHeld = 0;
  }
  
  if (player.DPAD_RIGHT.pressed) {
    if (rightHeld === 0 || (rightHeld > 16 && rightHeld % 6 === 0)) {
      game.moveRight();
    }
    rightHeld++;
  } else {
    rightHeld = 0;
  }
  
  // Rotation with button release check
  if (player.BUTTON_SOUTH.pressed) {
    if (canRotateClockwise) {
      game.rotate(true);
      canRotateClockwise = false;
    }
  } else {
    canRotateClockwise = true;
  }
  
  if (player.BUTTON_EAST.pressed) {
    if (canRotateCounterClockwise) {
      game.rotate(false);
      canRotateCounterClockwise = false;
    }
  } else {
    canRotateCounterClockwise = true;
  }
  
  // Dropping
  if (player.DPAD_DOWN.pressed) {
    game.softDrop();
  } else {
    game.stopSoftDrop();
  }
  
  if (player.BUTTON_NORTH.pressed && !player.prevState?.BUTTON_NORTH.pressed) {
    game.hardDrop();
  }
  
  // Store previous state for edge detection
  player.prevState = {
    BUTTON_NORTH: { pressed: player.BUTTON_NORTH.pressed }
  };
}

function gameLoop(timestamp) {
  handleInput();
  
  // Only update game state if not paused
  if (!game.paused && !game.gameOver) {
    game.update(timestamp);
  }
  
  // Render
  renderer.drawBoard(game.board);
  
  // Draw ghost piece and current piece if game is active
  if (game.currentPiece && !game.gameOver && !game.paused) {
    const ghost = game.board.getGhostPosition(game.currentPiece);
    renderer.drawPiece(ghost, true);
    renderer.drawPiece(game.currentPiece);
  }
  
  renderer.drawPreview(game.nextPiece);
  renderer.drawScore(game.score, game.level, game.lines);
  
  if (game.gameOver) {
    renderer.drawGameOver();
  } else if (game.paused) {
    renderer.drawPaused();
  }
  
  lastTime = timestamp;
  requestAnimationFrame(gameLoop);
}

// Start the game
requestAnimationFrame(gameLoop);