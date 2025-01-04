import { BLOCK_SIZE, COLORS, BOARD_WIDTH, BOARD_HEIGHT, PREVIEW_SIZE } from './constants.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Calculate board position to center it
    this.boardX = Math.floor((canvas.width - BOARD_WIDTH * BLOCK_SIZE) / 2);
    this.boardY = Math.floor((canvas.height - BOARD_HEIGHT * BLOCK_SIZE) / 2);
    
    // Calculate preview position (right side of board)
    this.previewX = this.boardX + (BOARD_WIDTH * BLOCK_SIZE) + BLOCK_SIZE;
    this.previewY = this.boardY + BLOCK_SIZE;
    
    // For pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  drawBlock(x, y, color, ghost = false) {
    const screenX = this.boardX + x * BLOCK_SIZE;
    const screenY = this.boardY + y * BLOCK_SIZE;
    
    // Draw main block
    this.ctx.fillStyle = color;
    this.ctx.fillRect(screenX, screenY, BLOCK_SIZE, BLOCK_SIZE);
    
    if (!ghost) {
      // Draw highlight (top and left edges)
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.fillRect(screenX, screenY, BLOCK_SIZE, 2);
      this.ctx.fillRect(screenX, screenY, 2, BLOCK_SIZE);
      
      // Draw shadow (bottom and right edges)
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.fillRect(screenX, screenY + BLOCK_SIZE - 2, BLOCK_SIZE, 2);
      this.ctx.fillRect(screenX + BLOCK_SIZE - 2, screenY, 2, BLOCK_SIZE);
    }
  }

  drawPiece(piece, ghost = false) {
    const color = ghost ? COLORS.ghost : COLORS[piece.type];
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = piece.x + x;
          const boardY = piece.y + y;
          if (boardY >= 0) {
            this.drawBlock(boardX, boardY, color, ghost);
          }
        }
      }
    }
  }

  drawBoard(board) {
    // Draw background
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    this.ctx.strokeStyle = COLORS.grid;
    this.ctx.lineWidth = 1;
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      const screenX = this.boardX + x * BLOCK_SIZE;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, this.boardY);
      this.ctx.lineTo(screenX, this.boardY + BOARD_HEIGHT * BLOCK_SIZE);
      this.ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      const screenY = this.boardY + y * BLOCK_SIZE;
      this.ctx.beginPath();
      this.ctx.moveTo(this.boardX, screenY);
      this.ctx.lineTo(this.boardX + BOARD_WIDTH * BLOCK_SIZE, screenY);
      this.ctx.stroke();
    }
    
    // Draw placed blocks
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const block = board.grid[y][x];
        if (block) {
          const color = board.clearingLines.has(y) ? COLORS.cleared : COLORS[block];
          this.drawBlock(x, y, color);
        }
      }
    }
  }

  drawPreview(piece) {
    if (!piece) return;
    
    // Draw preview box
    this.ctx.strokeStyle = COLORS.grid;
    this.ctx.strokeRect(
      this.previewX,
      this.previewY,
      PREVIEW_SIZE * BLOCK_SIZE,
      PREVIEW_SIZE * BLOCK_SIZE
    );
    
    // Center the piece in the preview box
    const offsetX = Math.floor((PREVIEW_SIZE - piece.shape[0].length) / 2);
    const offsetY = Math.floor((PREVIEW_SIZE - piece.shape.length) / 2);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const screenX = this.previewX + (x + offsetX) * BLOCK_SIZE;
          const screenY = this.previewY + (y + offsetY) * BLOCK_SIZE;
          
          this.ctx.fillStyle = COLORS[piece.type];
          this.ctx.fillRect(screenX, screenY, BLOCK_SIZE, BLOCK_SIZE);
        }
      }
    }
  }

  drawScore(score, level, lines) {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${score}`, this.previewX, this.previewY + 150);
    this.ctx.fillText(`Level: ${level}`, this.previewX, this.previewY + 180);
    this.ctx.fillText(`Lines: ${lines}`, this.previewX, this.previewY + 210);
  }

  drawGameOver() {
    this.drawOverlay('GAME OVER', 'Press START to play again');
  }

  drawPaused() {
    this.drawOverlay('PAUSED', 'Press START to resume');
  }

  drawOverlay(mainText, subText) {
    // Semi-transparent background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(0, this.canvas.height / 2 - 50, this.canvas.width, 100);
    
    // Main text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '40px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(mainText, this.canvas.width / 2, this.canvas.height / 2);
    
    // Sub text
    this.ctx.font = '20px monospace';
    this.ctx.fillText(subText, this.canvas.width / 2, this.canvas.height / 2 + 40);
  }
}