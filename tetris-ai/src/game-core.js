import { POINTS, STARTING_SPEED, SOFT_DROP_SPEED, LOCK_DELAY } from './constants.js';
import { Board } from './board.js';
import { Piece } from './piece.js';
import { loadSound, playSound } from './utils.js';

export class Game {
  constructor() {
    this.board = new Board();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.paused = false;
    this.dropSpeed = STARTING_SPEED;
    this.lastDrop = 0;
    this.lockDelay = null;
    this.softDropping = false;
    
    // Sound effects
    this.laserSound = null;
    this.clinkSound = null;
    this.thudSound = null;
    
    // Initialize piece sequence
    this.pieceTypes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    this.currentPiece = null;
    this.nextPiece = null;
    this.initializeNextPieces();

    // Load sounds
    this.initSounds();
  }

  async initSounds() {
    try {
      this.laserSound = await loadSound('sounds/laser.mp3');
      this.clinkSound = await loadSound('sounds/clink.mp3');
      this.thudSound = await loadSound('sounds/thud.mp3');
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  }

  initializeNextPieces() {
    if (!this.nextPiece) {
      this.nextPiece = new Piece(this.getRandomPiece());
    }
    this.spawnNextPiece();
  }

  getRandomPiece() {
    const index = Math.floor(Math.random() * this.pieceTypes.length);
    return this.pieceTypes[index];
  }

  spawnNextPiece() {
    this.currentPiece = this.nextPiece;
    this.nextPiece = new Piece(this.getRandomPiece());
    
    // Check for game over
    if (!this.board.isValidPosition(this.currentPiece)) {
      this.gameOver = true;
    }
    
    this.lockDelay = null;
  }

  moveLeft() {
    if (this.gameOver) return;
    this.currentPiece.moveLeft();
    if (!this.board.isValidPosition(this.currentPiece)) {
      this.currentPiece.moveRight();
    } else {
      this.lockDelay = null;
    }
  }

  moveRight() {
    if (this.gameOver) return;
    this.currentPiece.moveRight();
    if (!this.board.isValidPosition(this.currentPiece)) {
      this.currentPiece.moveLeft();
    } else {
      this.lockDelay = null;
    }
  }

  rotate(clockwise = true) {
    if (this.gameOver) return;
    const originalShape = this.currentPiece.shape.map(row => [...row]);
    const originalX = this.currentPiece.x;
    
    this.currentPiece.rotate(clockwise);
    
    // Wall kick tests
    const kicks = [
      [0, 0], [-1, 0], [1, 0], [-1, -1], [1, -1],
      [0, -1], [-2, 0], [2, 0], [0, -2]
    ];
    
    let validKickFound = false;
    for (const [xOffset, yOffset] of kicks) {
      this.currentPiece.x = originalX + xOffset;
      this.currentPiece.y += yOffset;
      
      if (this.board.isValidPosition(this.currentPiece)) {
        validKickFound = true;
        this.lockDelay = null;
        // Play rotation sound if rotation was successful
        if (this.clinkSound) {
          playSound(this.clinkSound);
        }
        break;
      }
      
      this.currentPiece.x = originalX;
      this.currentPiece.y -= yOffset;
    }
    
    if (!validKickFound) {
      this.currentPiece.shape = originalShape;
      this.currentPiece.x = originalX;
    }
  }

  softDrop() {
    if (this.gameOver) return;
    this.softDropping = true;
  }

  hardDrop() {
    if (this.gameOver) return;
    let dropDistance = 0;
    while (this.board.isValidPosition(this.currentPiece)) {
      this.currentPiece.moveDown();
      dropDistance++;
    }
    this.currentPiece.moveUp();
    dropDistance--;
    
    this.score += dropDistance * POINTS.HARD_DROP;
    this.lockPiece();
  }

  stopSoftDrop() {
    this.softDropping = false;
  }

  lockPiece() {
    // Play thud sound when piece locks
    if (this.thudSound) {
      playSound(this.thudSound);
    }

    this.board.placePiece(this.currentPiece);
    const clearedLines = this.board.findClearedLines();
    
    if (clearedLines.length > 0) {
      // Play laser sound when lines are cleared
      if (this.laserSound) {
        playSound(this.laserSound);
      }
      
      setTimeout(() => {
        this.board.clearLines(clearedLines);
        this.addScore(clearedLines.length);
      }, 200); // Short delay to show the flash effect
    }
    
    this.spawnNextPiece();
  }

  addScore(lineCount) {
    // Add score based on lines cleared
    switch (lineCount) {
      case 1:
        this.score += POINTS.SINGLE * this.level;
        break;
      case 2:
        this.score += POINTS.DOUBLE * this.level;
        break;
      case 3:
        this.score += POINTS.TRIPLE * this.level;
        break;
      case 4:
        this.score += POINTS.TETRIS * this.level;
        break;
    }
    
    // Add to total lines cleared
    this.lines += lineCount;
    
    // Level up every 10 lines (standard Tetris rules)
    const newLevel = Math.floor(this.lines / 10) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      // Speed up as level increases (max speed at level 20)
      this.dropSpeed = Math.max(STARTING_SPEED * Math.pow(0.8, Math.min(this.level - 1, 19)), 50);
    }
  }

  update(timestamp) {
    if (this.gameOver) return;

    // Check if piece should lock
    if (this.lockDelay !== null && timestamp - this.lockDelay >= LOCK_DELAY) {
      this.lockPiece();
      return;
    }

    // Normal drop timing
    const dropInterval = this.softDropping ? SOFT_DROP_SPEED : this.dropSpeed;
    if (timestamp - this.lastDrop >= dropInterval) {
      this.currentPiece.moveDown();
      
      if (!this.board.isValidPosition(this.currentPiece)) {
        this.currentPiece.moveUp();
        
        // Start lock delay if not already started
        if (this.lockDelay === null) {
          this.lockDelay = timestamp;
        }
      } else {
        if (this.softDropping) {
          this.score += POINTS.SOFT_DROP;
        }
        // Only reset lock delay if piece can move down
        this.lockDelay = null;
      }
      
      this.lastDrop = timestamp;
    }
  }

  reset() {
    this.board.reset();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.dropSpeed = STARTING_SPEED;
    this.lastDrop = 0;
    this.lockDelay = null;
    this.softDropping = false;
    this.currentPiece = null;
    this.nextPiece = null;
    this.initializeNextPieces();
  }
}