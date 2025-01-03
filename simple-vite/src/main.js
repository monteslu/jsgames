import { loadSound, loadImage, playSound, getInput } from './utils.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const { width, height } = canvas;
let lastTime;
let laserSound;
let playerImg;

const player = {
  x: width / 2,
  y: height / 2,
  width: width * 0.1,
  height: width * 0.1,
  canPlaySound: true,
  speed: width * 0.01, // 1% of the screen width  
};

function update() {
  const [p1] = getInput();
  if (p1.BUTTON_SOUTH.pressed && player.canPlaySound) {
    playSound(laserSound);
    player.canPlaySound = false;
  } else if (!p1.BUTTON_SOUTH.pressed) {
    player.canPlaySound = true;
  }

  if (p1.DPAD_LEFT.pressed) {
    player.x -= player.speed;
  } else if (p1.DPAD_RIGHT.pressed) {
    player.x += player.speed;
  }

  if (p1.DPAD_UP.pressed) {
    player.y -= player.speed;
  } else if (p1.DPAD_DOWN.pressed) {
    player.y += player.speed;
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
  laserSound = await loadSound('sounds/laser.mp3');
  playerImg = await loadImage('images/js.png');

  lastTime = performance.now();
  gameLoop();
}


launch();