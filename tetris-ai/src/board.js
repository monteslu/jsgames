import { BOARD_WIDTH, BOARD_HEIGHT } from './constants.js';

export class Board {
  constructor() {
    this.grid = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null));
    this.clearingLines = new Set();
  }

  isValidPosition(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = piece.x + x;
          const boardY = piece.y + y;

          // Check bounds
          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
            return false;
          }

          // Check collision with placed pieces
          if (boardY >= 0 && this.grid[boardY][boardX] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  }

  placePiece(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            this.grid[boardY][boardX] = piece.type;
          }
        }
      }
    }
  }

  findClearedLines() {
    const lines = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (this.grid[y].every(cell => cell !== null)) {
        lines.push(y);
        this.clearingLines.add(y);
      }
    }
    return lines;
  }

  clearLines(lines) {
    // Remove the cleared lines
    for (const line of lines) {
      this.clearingLines.delete(line);
      this.grid.splice(line, 1);
    }
    
    // Add new empty lines at the top
    for (let i = 0; i < lines.length; i++) {
      this.grid.unshift(Array(BOARD_WIDTH).fill(null));
    }
  }

  getGhostPosition(piece) {
    const ghost = piece.clone();
    while (this.isValidPosition(ghost)) {
      ghost.moveDown();
    }
    ghost.moveUp(); // Move back up to last valid position
    return ghost;
  }

  reset() {
    this.grid = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null));
    this.clearingLines.clear();
  }
}