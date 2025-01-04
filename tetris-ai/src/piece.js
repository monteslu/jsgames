import { SHAPES } from './constants.js';

export class Piece {
  constructor(type) {
    this.type = type;
    this.shape = SHAPES[type];
    this.x = Math.floor((10 - this.shape[0].length) / 2); // Center piece horizontally
    this.y = 0;
    this.rotation = 0;
  }

  rotate(clockwise = true) {
    const newShape = [];
    const N = this.shape.length;
    
    for (let i = 0; i < N; i++) {
      newShape[i] = [];
      for (let j = 0; j < N; j++) {
        if (clockwise) {
          newShape[i][j] = this.shape[N - 1 - j][i];
        } else {
          newShape[i][j] = this.shape[j][N - 1 - i];
        }
      }
    }
    
    this.shape = newShape;
  }

  clone() {
    const piece = new Piece(this.type);
    piece.x = this.x;
    piece.y = this.y;
    piece.shape = this.shape.map(row => [...row]);
    piece.rotation = this.rotation;
    return piece;
  }

  moveLeft() {
    this.x--;
  }

  moveRight() {
    this.x++;
  }

  moveDown() {
    this.y++;
  }

  moveUp() {
    this.y--;
  }
}