import { loadSound, loadImage, playSound, getInput } from './utils.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const { width, height } = canvas;
let lastTime;
let laserSound;
let playerImg;

const player = {
  x: width / 2, // center of the screen
  y: height / 2, // center of the screen
  width: width * 0.1, // 10% of the screen width
  height: width * 0.1, // 10% of the screen width
  canPlaySound: true, // have to release the button to play again
  speed: width * 0.0005, // 0.05% of the screen width per millisecond  
};

function update(elapsedTime) {
  const [p1] = getInput();
  if (p1.BUTTON_SOUTH.pressed && player.canPlaySound) {
    playSound(laserSound);
    player.canPlaySound = false;
  } else if (!p1.BUTTON_SOUTH.pressed) {
    player.canPlaySound = true;
  }

  if (p1.DPAD_LEFT.pressed) {
    player.x -= player.speed * elapsedTime;
  } else if (p1.DPAD_RIGHT.pressed) {
    player.x += player.speed * elapsedTime;
  }

  if (p1.DPAD_UP.pressed) {
    player.y -= player.speed * elapsedTime;
  } else if (p1.DPAD_DOWN.pressed) {
    player.y += player.speed * elapsedTime;
  }
}

function draw() {
  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.width);
}

function gameLoop() {
  const deltaTime = performance.now() - lastTime;
  update(deltaTime);
  draw();
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

async function launch() {
  // wait for assets to load
  laserSound = await loadSound('sounds/laser.mp3');
  playerImg = await loadImage('images/js.png');
  lastTime = performance.now();
  gameLoop();
}


launch();