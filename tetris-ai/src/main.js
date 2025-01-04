import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { getInput } from './utils.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game();
const renderer = new Renderer(canvas);

let lastTime = performance.now();
let leftHeld = 0;
let rightHeld = 0;

function handleInput() {
  const [player] = getInput();
  
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
  
  // Rotation
  if (player.BUTTON_SOUTH.pressed && !player.prevState?.BUTTON_SOUTH.pressed) {
    game.rotate(true); // Clockwise with Z
  }
  if (player.BUTTON_EAST.pressed && !player.prevState?.BUTTON_EAST.pressed) {
    game.rotate(false); // Counter-clockwise with X
  }
  
  // Dropping
  if (player.DPAD_DOWN.pressed) {
    game.softDrop();
  } else {
    game.stopSoftDrop();
  }
  
  if (player.BUTTON_NORTH.pressed && !player.prevState?.BUTTON_NORTH.pressed) {
    game.hardDrop(); // Hard drop with Up or Space
  }
  
  // Reset game
  if (player.START.pressed && !player.prevState?.START.pressed) {
    game.reset();
  }
  
  // Store previous state for edge detection
  player.prevState = {
    BUTTON_SOUTH: { pressed: player.BUTTON_SOUTH.pressed },
    BUTTON_EAST: { pressed: player.BUTTON_EAST.pressed },
    BUTTON_NORTH: { pressed: player.BUTTON_NORTH.pressed },
    START: { pressed: player.START.pressed }
  };
}

function gameLoop(timestamp) {
  handleInput();
  game.update(timestamp);
  
  // Render
  renderer.drawBoard(game.board);
  
  // Draw ghost piece
  if (game.currentPiece && !game.gameOver) {
    const ghost = game.board.getGhostPosition(game.currentPiece);
    renderer.drawPiece(ghost, true);
    renderer.drawPiece(game.currentPiece);
  }
  
  renderer.drawPreview(game.nextPiece);
  renderer.drawScore(game.score, game.level);
  
  if (game.gameOver) {
    renderer.drawGameOver();
  }
  
  lastTime = timestamp;
  requestAnimationFrame(gameLoop);
}

// Start the game
requestAnimationFrame(gameLoop);