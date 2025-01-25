import { getInput, loadImage } from './utils.js';

let canvas = document.getElementById('game-canvas');
let texture;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const TILE_SIZE = canvas.width / 4;
const player = { x: 2.5 * TILE_SIZE, y: 11.5 * TILE_SIZE, angle: Math.PI / 2 };

const floor1 = [
  'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  'x                              x',
  'x          e                   x',
  'x    xx          xxx           x',
  'x                              x',
  'x           xxxx xxxx          x',
  'x     xx                       x',
  'x            x            xxxxxx',
  'x            x  xxx            x',
  'x       ss                     x',
  'x                      xx      x',
  'x              p               x',
  'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
];

const map = floor1.map(row => row.split(''));

const lookupTable = Array.from({ length: 360 }, (_, i) => ({
  cos: Math.cos((i * Math.PI) / 180),
  sin: Math.sin((i * Math.PI) / 180),
}));

function isWall(x, y) {
  const mapX = Math.floor(x / TILE_SIZE);
  const mapY = Math.floor(y / TILE_SIZE);
  return map[mapY] && map[mapY][mapX] === 'x';
}

function update(millis) {
  const speed = 1.7 * millis;
  const turnSpeed = 0.003 * millis;
  let newX = player.x;
  let newY = player.y;
  const [p1] = getInput();
  const angleDeg = (Math.floor(player.angle * 180 / Math.PI) % 360 + 360) % 360;

  if (p1.DPAD_UP.pressed) {
    newX += lookupTable[angleDeg].cos * speed;
    newY += lookupTable[angleDeg].sin * speed;
  }
  if (p1.DPAD_DOWN.pressed) {
    newX -= lookupTable[angleDeg].cos * speed;
    newY -= lookupTable[angleDeg].sin * speed;
  }
  if (!isWall(newX, player.y)) player.x = newX;
  if (!isWall(player.x, newY)) player.y = newY;
  if (p1.DPAD_LEFT.pressed) player.angle -= turnSpeed;
  if (p1.DPAD_RIGHT.pressed) player.angle += turnSpeed;
}

function castRay(angle) {
  const stepSize = 1;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let x = player.x;
  let y = player.y;
  let lastX = x;
  let lastY = y;

  while (!isWall(x, y)) {
    lastX = x;
    lastY = y;
    x += cos * stepSize;
    y += sin * stepSize;
  }

  const distance = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
  const isVertical = Math.abs(x - lastX) > Math.abs(y - lastY);
  
  return { distance, x, y, isVertical };
}

function draw() {
  const fov = Math.PI / 3;
  const numRays = canvas.width / 2;
  const halfHeight = canvas.height / 2;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, halfHeight);
  ctx.fillStyle = '#D2B48C';
  ctx.fillRect(0, halfHeight, canvas.width, halfHeight);

  for (let i = 0; i < numRays; i++) {
    const rayAngle = player.angle - fov / 2 + (fov * i) / numRays;
    const { distance, x, y, isVertical } = castRay(rayAngle);
    const correctedDistance = distance * Math.cos(rayAngle - player.angle);
    const wallHeight = (TILE_SIZE / correctedDistance) * 500;
    
    const coord = isVertical ? y : x;
    let textureX = Math.floor((coord % TILE_SIZE) * (texture.width / TILE_SIZE));
    if ((isVertical && Math.cos(rayAngle) > 0) || (!isVertical && Math.sin(rayAngle) > 0)) {
      textureX = texture.width - textureX - 1;
    }
    
    const sliceHeight = Math.min(wallHeight, canvas.height);
    ctx.drawImage(
      texture,
      textureX, 0,
      1, texture.height,
      i * 2, halfHeight - sliceHeight / 2,
      2, sliceHeight
    );
  }
}

let currentTime = performance.now();
function gameLoop() {
  const newTime = performance.now();
  const millis = newTime - currentTime;
  update(millis);
  draw();
  currentTime = newTime;
  requestAnimationFrame(gameLoop);
}

async function run() {
  texture = await loadImage('brick_256.png');
  debugger;
  gameLoop();
}

run();