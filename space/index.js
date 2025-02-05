import { ParticleSystem } from './particles.js';
import { Boss } from './boss.js';
import Cloud from './cloud.js';
import getInput from './input.js';
import { loadSound, playSound } from './sfx.js';
const SHIP_ROTATION = 45; // Degrees - adjust this to try different angles

// • 0 (no rotation)
// • 45 (diagonal)
// • 90 (vertical)
// • -45 (opposite diagonal)

const canvas = document.getElementById('gameCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const { width, height } = canvas;
const ctx = canvas.getContext('2d');

canvas.addEventListener('click', () => {
  canvas.requestFullscreen();
});

let shipExplosion = null;
let laserSound = null;
let powerDownSound = null;
let bossExplosionSound = null;
let bossLaserSound = null;
let bigExplosionSound = null;
let biggerExplosionSound = null;

// After canvas creation, add:
const particles = new ParticleSystem(canvas);

// Scale factors relative to canvas size
const SCALE = {
  SHIP_WIDTH: width * 0.04, // 4% of screen width
  SHIP_HEIGHT: height * 0.05, // 5% of screen height
  BLUE_SHIP_SCALE: 0.8, // Blue ships are 80% the size of others
  BULLET_WIDTH: width * 0.01,
  BULLET_HEIGHT: height * 0.01,
  PLAYER_SPEED: width * 0.01,
  BULLET_SPEED: width * 0.01,
  ENEMY_SPEED: width * 0.003,
  CLOUD_MIN_WIDTH: width * 0.1,
  CLOUD_MAX_WIDTH: width * 0.2,
  SCORE_SIZE: height * 0.04,
  SCORE_PADDING: height * 0.02,
  SHIP_LINE_WIDTH: width * 0.002,
};

// Game state
let score = 100;
let maxScore = 100;
let speedMultiplierNormal = 1;
let speedMultiplierSine = 1;
let speedMultiplierBlue = 1;
let shipsSpawned = 0;
let bossActive = false;
let boss = null;
let bossLevel = 1;
let shipsPerLevel = 13;

const clouds = [
  Array.from(
    { length: 3 },
    () =>
      new Cloud({
        layer: 0,
        scale: SCALE,
        gameWidth: width,
        gameHeight: height,
      })
  ),
  Array.from(
    { length: 4 },
    () =>
      new Cloud({
        layer: 1,
        scale: SCALE,
        gameWidth: width,
        gameHeight: height,
      })
  ),
  Array.from(
    { length: 5 },
    () =>
      new Cloud({
        layer: 2,
        scale: SCALE,
        gameWidth: width,
        gameHeight: height,
      })
  ),
];

function drawPlayerShip(x, y, width, height) {
  ctx.save();

  // Define the wing tilt offset
  const wingTilt = {
    up: height * 0.15,
    neutral: 0,
    down: -height * 0.15,
  }[player.facing];

  // Main fuselage

  //
  // Set up rotation
  const centerX = x + width * 0.4;
  const centerY = y + height * 0.54;
  ctx.translate(centerX, centerY);
  ctx.rotate((SHIP_ROTATION * Math.PI) / 180); // Convert degrees to radians
  ctx.translate(-centerX, -centerY);

  ctx.font = `${height * 0.9}px NotoEmoji`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText('🚀', centerX, centerY);
  // ctx.fillText('🚀', x + width, y + height);

  // Forward-swept wings - now more horizontal

  // ctx.beginPath();
  // ctx.moveTo(x + width * 0.7, y + height * 0.45); // Top wing join
  // ctx.lineTo(x + width * 0.5, y + height * 0.35 + wingTilt); // Top wing tip
  // ctx.lineTo(x + width * 0.3, y + height * 0.4 + wingTilt); // Top wing back
  // ctx.moveTo(x + width * 0.7, y + height * 0.55); // Bottom wing join
  // ctx.lineTo(x + width * 0.5, y + height * 0.65 + wingTilt); // Bottom wing tip
  // ctx.lineTo(x + width * 0.3, y + height * 0.6 + wingTilt); // Bottom wing back
  // ctx.strokeStyle = '#fff';
  // ctx.lineWidth = SCALE.SHIP_LINE_WIDTH;
  // ctx.stroke();

  // Engine glow
  // ctx.beginPath();
  // ctx.moveTo(x + width * 0.3, y + height * 0.4);
  // ctx.lineTo(x + width * 0.1, y + height * 0.5);
  // ctx.lineTo(x + width * 0.3, y + height * 0.6);
  // ctx.fillStyle = '#0ff';
  // ctx.fill();

  ctx.restore();
}

function drawEnemyShip(x, y, width, height, color = '#ff0000') {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + width * 0.9, y + height * 0.5);
  ctx.lineTo(x + width * 0.6, y + height * 0.2);
  ctx.lineTo(x + width * 0.1, y + height * 0.5);
  ctx.lineTo(x + width * 0.6, y + height * 0.8);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(1, width * 0.05);
  ctx.stroke();

  ctx.beginPath();
  const coreColor =
    {
      '#ff0000': '#f00',
      '#ffff00': '#ff0',
      '#0000ff': '#00f',
    }[color] || color;
  ctx.arc(x + width * 0.4, y + height * 0.5, height * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = coreColor;
  ctx.fill();
  ctx.restore();
}

function drawScore() {
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.font = `${SCALE.SCORE_SIZE}px Arial`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  if (score <= 0) {
    ctx.fillStyle = '#f00';
  } else if (score === maxScore) {
    ctx.fillStyle = '#0f0';
  }
  // Draw current score
  ctx.fillText(`Score: ${score}`, SCALE.SCORE_PADDING, SCALE.SCORE_PADDING);

  ctx.fillStyle = '#fff';

  // Draw max score
  ctx.fillText(`Max: ${maxScore}`, SCALE.SCORE_PADDING + width * 0.35, SCALE.SCORE_PADDING);

  const spanwedThisLevel = shipsSpawned % shipsPerLevel;
  const percentComplete = spanwedThisLevel / shipsPerLevel;
  ctx.fillText(`Level: ${bossLevel}`, SCALE.SCORE_PADDING + width * 0.85, SCALE.SCORE_PADDING);
  ctx.strokeStyle = '#000';
  const boxWidth = width / 6;
  const boxHeight = SCALE.SCORE_SIZE * 0.2;
  ctx.fillStyle = '#fff';
  const scoreY = SCALE.SCORE_PADDING + SCALE.SCORE_SIZE * 1.2;
  ctx.lineWidth = SCALE.SHIP_LINE_WIDTH;
  ctx.fillRect(SCALE.SCORE_PADDING + width * 0.8, scoreY, boxWidth * percentComplete, boxHeight);
  ctx.strokeRect(SCALE.SCORE_PADDING + width * 0.8, scoreY, boxWidth, boxHeight);

  // Draw speed multipliers (moved down a bit)
  // const smallerFont = SCALE.SCORE_SIZE * 0.6;
  // ctx.font = `${smallerFont}px Arial`;
  // ctx.fillText(`Red Speed: ${(speedMultiplierNormal * 100).toFixed(0)}%`, SCALE.SCORE_PADDING, SCALE.SCORE_SIZE * 1.5);
  // ctx.fillText(`Yellow Speed: ${(speedMultiplierSine * 100).toFixed(0)}%`, SCALE.SCORE_PADDING, SCALE.SCORE_SIZE * 2.5);
  // ctx.fillText(`Blue Speed: ${(speedMultiplierBlue * 100).toFixed(0)}%`, SCALE.SCORE_PADDING, SCALE.SCORE_SIZE * 3.5);
  // ctx.restore();
}

const player = {
  x: SCALE.SHIP_WIDTH * 2.5,
  y: height / 2,
  width: SCALE.SHIP_WIDTH,
  height: SCALE.SHIP_HEIGHT,
  speed: SCALE.PLAYER_SPEED,
  bullets: [],
  lastShot: 0,
  shootDelay: 130,
};

window.player = player;

const enemies = [];
const enemySpawnInterval = 2000;
let lastEnemySpawn = 0;

function resizeCanvas() {
  const aspectRatio = width / height;
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  if (windowWidth / windowHeight > aspectRatio) {
    canvas.style.width = `${windowHeight * aspectRatio}px`;
    canvas.style.height = `${windowHeight}px`;
  } else {
    canvas.style.width = `${windowWidth}px`;
    canvas.style.height = `${windowWidth / aspectRatio}px`;
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function detectCollision(a, b) {
  return a && b && a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function spawnEnemy() {
  if (!bossActive) {
    shipsSpawned++;

    // Check if it's time for boss
    if (shipsSpawned % shipsPerLevel === 0) {
      boss = new Boss({
        width,
        height,
        scale: SCALE,
        level: bossLevel,
        health: 9 + bossLevel,
        bossLaserSound,
        bigExplosionSound,
      });
      window.boss = boss;
      bossActive = true;
      return;
    }

    const random = Math.random();
    let type;
    if (random < 0.4) {
      type = 'normal';
    } else if (random < 0.8) {
      type = 'sine';
    } else {
      type = 'blue';
    }

    const baseSpeed = SCALE.ENEMY_SPEED;
    const speedMultiplier = {
      normal: speedMultiplierNormal,
      sine: speedMultiplierSine,
      blue: speedMultiplierBlue,
    }[type];

    const isBlue = type === 'blue';
    const shipWidth = isBlue ? SCALE.SHIP_WIDTH * SCALE.BLUE_SHIP_SCALE : SCALE.SHIP_WIDTH;
    const shipHeight = isBlue ? SCALE.SHIP_HEIGHT * SCALE.BLUE_SHIP_SCALE : SCALE.SHIP_HEIGHT;

    const enemy = {
      x: width + shipWidth,
      y: Math.random() * (height - shipHeight),
      width: shipWidth,
      height: shipHeight,
      speed: (baseSpeed/16.67) * (type === 'sine' ? 0.7 : 1) * speedMultiplier, // Normalize to 60fps
      type: type,
      startY: 0,
      angle: 0,
      amplitude: height * 0.15,
      // Reduced frequencies for wider waves
      frequency: ((Math.PI * 2) / width) * 0.075, // Halved again from previous value
      // Additional properties for blue ships
      angles: isBlue ? [0, 0, 0] : null,
      frequencies: isBlue ? [0.75, 1.35, 2.05] : null, // Halved the frequencies
      amplitudes: isBlue ? [height * 0.1, height * 0.05, height * 0.025] : null,
    };

    if (type === 'sine' || type === 'blue') {
      enemy.startY = enemy.y;
    }

    enemies.push(enemy);
    window.enemies = enemies;
  }
}

function update(elapsed) {
  const [p1] = getInput();
  // console.log(p1.LEFT_STICK_X, p1.LEFT_STICK_Y, p1.DPAD_LEFT.pressed, p1.DPAD_RIGHT.pressed);

  clouds.forEach((layer) => {
    layer.forEach((cloud) => cloud.update());
  });

  if (Math.abs(p1.LEFT_STICK_X) > 0.2) {
    if (p1.LEFT_STICK_X > 0) {
      player.x = Math.min(width - player.width, player.x + (player.speed/16.67) * elapsed * p1.LEFT_STICK_X);
    } else {
      player.x = Math.max(0, player.x + player.speed * p1.LEFT_STICK_X);
    }
  } else {
    if (p1.DPAD_LEFT.pressed) {
      player.x = Math.max(0, player.x - player.speed);
    } else if (p1.DPAD_RIGHT.pressed) {
      player.x = Math.min(width - player.width, player.x + player.speed);
    }
  }

  if (Math.abs(p1.LEFT_STICK_Y) > 0.2) {
    if (p1.LEFT_STICK_Y < 0) {
      player.y = Math.max(0, player.y + player.speed * p1.LEFT_STICK_Y);
      player.facing = 'down';
    } else {
      player.y = Math.min(height - player.height, player.y + player.speed * p1.LEFT_STICK_Y);
      player.facing = 'up';
    }
  } else {
    player.facing = 'neutral';
    if (p1.DPAD_UP.pressed) {
      player.y = Math.max(0, player.y - player.speed);
      player.facing = 'up';
    } else if (p1.DPAD_DOWN.pressed) {
      player.y = Math.min(height - player.height, player.y + player.speed);
      player.facing = 'down';
    }
  }

  if (p1.BUTTON_SOUTH.pressed && Date.now() - player.lastShot > player.shootDelay) {
    player.bullets.push({
      x: player.x + player.width,
      y: player.y + player.height / 2,
      width: SCALE.BULLET_WIDTH,
      height: SCALE.BULLET_HEIGHT,
      speed: SCALE.BULLET_SPEED,
    });
    player.lastShot = Date.now();
    playSound(laserSound);
    // Subtract a point for each shot
    score--;
    maxScore = Math.max(maxScore, score);
  }

  for (let i = player.bullets.length - 1; i >= 0; i--) {
    const bullet = player.bullets[i];
    bullet.x += (bullet.speed/16.67) * elapsed; // Normalize to 60fps

    if (bullet.x > width) {
      player.bullets.splice(i, 1);
      continue;
    }

    for (let j = enemies.length - 1; j >= 0; j--) {
      if (detectCollision(bullet, enemies[j])) {
        const enemy = enemies[j];
        const enemyColor = {
          normal: '#ff0000',
          sine: '#ffff00',
          blue: '#0000ff',
        }[enemy.type];

        // Create explosion at enemy's center
        particles.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemyColor);
        playSound(shipExplosion);

        // Rest of the collision handling...
        if (enemy.type === 'normal') {
          speedMultiplierNormal += 0.05;
        } else if (enemy.type === 'sine') {
          speedMultiplierSine += 0.06;
        } else if (enemy.type === 'blue') {
          speedMultiplierBlue += 0.07;
        }

        score += enemy.type === 'blue' ? 50 : enemy.type === 'sine' ? 15 : 10;
        maxScore = Math.max(maxScore, score);
        enemies.splice(j, 1);
        player.bullets.splice(i, 1);
        break;
      }
    }
  }

  // Check for collisions with player
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (detectCollision(player, enemy)) {
      // Create explosion at collision point
      const enemyColor = {
        normal: '#ff0000',
        sine: '#ffff00',
        blue: '#0000ff',
      }[enemy.type];

      particles.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemyColor);
      particles.createExplosion(player.x + player.width / 2, player.y + player.height / 2, 'green', 5);
      playSound(biggerExplosionSound);
      // Rest of the collision handling...
      if (enemy.type === 'normal') {
        speedMultiplierNormal += 0.05;
      } else if (enemy.type === 'sine') {
        speedMultiplierSine += 0.06;
      } else if (enemy.type === 'blue') {
        speedMultiplierBlue += 0.07;
      }

      // Penalize score
      score -= 50;
      maxScore = Math.max(maxScore, score);

      // Remove the enemy
      enemies.splice(i, 1);
    }
  }

  if (Date.now() - lastEnemySpawn > enemySpawnInterval) {
    spawnEnemy();
    lastEnemySpawn = Date.now();
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.x -= (enemy.speed/16.67) * elapsed; // Normalize to 60fps

    if (enemy.type === 'sine') {
      enemy.angle += enemy.speed * 0.05;
      enemy.y = enemy.startY + Math.sin(enemy.angle) * enemy.amplitude;
    } else if (enemy.type === 'blue') {
      // Update all three angles at different rates
      enemy.angles = enemy.angles.map((angle, idx) => angle + enemy.speed * 0.05 * enemy.frequencies[idx]);
      // Combine three sine waves for complex motion
      enemy.y = enemy.startY + Math.sin(enemy.angles[0]) * enemy.amplitudes[0] + Math.sin(enemy.angles[1]) * enemy.amplitudes[1] + Math.sin(enemy.angles[2]) * enemy.amplitudes[2];
    }

    if (enemy.x + enemy.width < 0) {
      score -= 10;
      maxScore = Math.max(maxScore, score);
      enemies.splice(i, 1);
      playSound(powerDownSound);
    }
  }

  particles.update(elapsed);

  // Update boss if active
  if (bossActive && boss) {
    boss.update(elapsed, player.y);

    // Check for player collision with boss bullets
    const bossBullets = boss.getBullets();
    for (let i = bossBullets.length - 1; i >= 0; i--) {
      if (detectCollision(player, bossBullets[i])) {
        score -= 50;
        maxScore = Math.max(maxScore, score);
        bossBullets.splice(i, 1);
        playSound(biggerExplosionSound);
        particles.createExplosion(player.x + player.width / 2, player.y + player.height / 2, 'green', 10);
      }
    }

    // Check for bullet hits on boss
    for (let i = player.bullets.length - 1; i >= 0; i--) {
      if (detectCollision(boss, player.bullets[i])) {
        if (boss.hit()) {
          const centerX = boss.x + boss.width / 2;
          const centerY = boss.y + boss.height / 2;

          // Center burst
          particles.createBossExplosion(centerX, centerY);

          // Additional bursts at key points of the boss
          particles.createBossExplosion(boss.x + boss.width * 0.3, boss.y + boss.height * 0.3);
          particles.createBossExplosion(boss.x + boss.width * 0.3, boss.y + boss.height * 0.7);
          particles.createBossExplosion(boss.x + boss.width * 0.7, boss.y + boss.height * 0.3);
          particles.createBossExplosion(boss.x + boss.width * 0.7, boss.y + boss.height * 0.7);

          playSound(biggerExplosionSound);
          playSound(bossExplosionSound);
          score += 100 + bossLevel * 50;
          maxScore = Math.max(maxScore, score);
          bossActive = false;
          boss = null;
          bossLevel++;
        }
        particles.createExplosion(player.bullets[i].x + player.bullets[i].width / 2, player.bullets[i].y + player.bullets[i].height / 2, '#f00', 5);
        player.bullets.splice(i, 1);
      }
    }
  }
}

function draw() {
  ctx.fillStyle = '#223755';
  ctx.fillRect(0, 0, width, height);

  clouds.forEach((layer) => {
    layer.forEach((cloud) => cloud.draw(ctx));
  });

  drawPlayerShip(player.x, player.y, player.width, player.height);

  ctx.fillStyle = '#ffff00';
  for (const bullet of player.bullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }

  for (const enemy of enemies) {
    const color = {
      normal: '#ff0000',
      sine: '#ffff00',
      blue: '#0000ff',
    }[enemy.type];

    drawEnemyShip(enemy.x, enemy.y, enemy.width, enemy.height, color);
  }

  particles.draw();

  // Draw boss if active
  if (bossActive && boss) {
    boss.draw(ctx);
  }

  drawScore();
}

async function startGame() {
  let start = performance.now();
  try {
    const allSounds = await Promise.all([
      loadSound('explosion_ship'),
      loadSound('laser'),
      loadSound('powerDown'),
      loadSound('scream'),
      loadSound('bigger_explosion'),
      loadSound('boss_laser'),
      loadSound('big_explosion'),
    ]);

    shipExplosion = allSounds[0];
    laserSound = allSounds[1];
    powerDownSound = allSounds[2];
    bossExplosionSound = allSounds[3];
    biggerExplosionSound = allSounds[4];
    bossLaserSound = allSounds[5];
    bigExplosionSound = allSounds[6];
  } catch (error) {
    console.error('Error loading sounds:', error);
  }
  console.log('LOAD SOUNDS took', performance.now() - start, 'ms');

  start = performance.now();

  const assetfont = new FontFace('NotoEmoji', 'url(NotoEmoji-Bold.ttf)');
  const loadedAssetFont = await assetfont.load();
  document.fonts.add(loadedAssetFont);

  const font = new FontFace('NotoColorEmoji', 'url(NotoColorEmoji.ttf)');
  const loadedFont = await font.load();
  document.fonts.add(loadedFont);

  console.log('LOAD FONTS took', performance.now() - start, 'ms');

  let lastTime = performance.now();
  const FIXED_TIMESTEP = 1000/60; // Target 60 FPS
  let accumulator = 0;

  function gameLoop(currentTime) {
    const frameTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Prevent spiral of death with max frame time
    accumulator += Math.min(frameTime, 250);
    
    // Update game logic in fixed time steps
    while (accumulator >= FIXED_TIMESTEP) {
      update(FIXED_TIMESTEP);
      accumulator -= FIXED_TIMESTEP;
    }
    
    // Render with interpolation
    const alpha = accumulator / FIXED_TIMESTEP;
    draw(alpha);

    requestAnimationFrame(gameLoop);
  }

  // Start the game loop with current time
  requestAnimationFrame(gameLoop);
}

startGame();
