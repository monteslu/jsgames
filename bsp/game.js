import getInput from './input.js';
const { requestAnimationFrame } = globalThis;

const TILE_SIZE = 256; // Size of each tile in pixels
const player = { x: 2.5 * TILE_SIZE, y: 11.5 * TILE_SIZE, angle: 0 }; // Player position and angle

let canvas = document.getElementById('game-canvas');
canvas.width = 320;
canvas.height = 240;
const ctx = canvas.getContext('2d');

const game = {
  initialize: async (c) => {
    canvas = c;
    return canvas;
  },
};

// Define the map
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

// Precompute lookup table
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
  const stepSize = 8;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let x = player.x;
  let y = player.y;

  while (!isWall(x, y)) {
    x += cos * stepSize;
    y += sin * stepSize;
  }

  const distance = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
  return { distance, x, y };
}

function draw() {
  const fov = Math.PI / 3;
  const numRays = canvas.width / 2;
  const halfHeight = canvas.height / 2;
  const ceilingColor = '#87CEEB';
  const floorColor = '#D2B48C';

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ceiling and floor
  ctx.fillStyle = ceilingColor;
  ctx.fillRect(0, 0, canvas.width, halfHeight);

  ctx.fillStyle = floorColor;
  ctx.fillRect(0, halfHeight, canvas.width, halfHeight);

  ctx.beginPath();
  for (let i = 0; i < numRays; i++) {
    const rayAngle = player.angle - fov / 2 + (fov * i) / numRays;
    const { distance } = castRay(rayAngle);

    const correctedDistance = distance * Math.cos(rayAngle - player.angle);
    const wallHeight = (TILE_SIZE / correctedDistance) * 500;

    const color = `rgb(${255 - distance}, ${Math.min(255 - distance / 6, 240)}, ${Math.min(255 - distance / 4, 250)})`;
    ctx.fillStyle = color;
    ctx.fillRect(i * 2, halfHeight - wallHeight / 2, 2, wallHeight);
  }
  ctx.closePath();
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

gameLoop();

export default game;
