import * as THREE from './three_wc.js';
import { ParticleSystem3D } from './particles3d.js';
import { Boss3D } from './boss3d.js';
import getInput from './input.js';
import { loadSound, playSound, loadMusic, startLevelMusic, startBossMusic } from './sfx.js';
import { createNebula, updateNebulae } from './nebula.js';

// --- Setup ---
// Use existing canvas + GL context (wasmcart provides via DOM shim)
const canvas = document.getElementById('game-canvas') || document.getElementById('gameCanvas') || document.createElement('canvas');
// Prefer host preferred resolution (window.innerWidth/Height set by wasmcart-jsgame)
const prefW = (typeof window !== 'undefined' && window.innerWidth > 0) ? window.innerWidth : 0;
const prefH = (typeof window !== 'undefined' && window.innerHeight > 0) ? window.innerHeight : 0;
if (prefW > 0 && prefH > 0) {
  canvas.width = prefW;
  canvas.height = prefH;
} else if (!canvas.width || canvas.width < 2) {
  canvas.width = 640;
  canvas.height = 480;
}
const W = canvas.width;
const H = canvas.height;
const gl = canvas.getContext('webgl2');

const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: false });
renderer.setSize(W, H, false);
renderer.setClearColor(0x0a0a1a);
if (!canvas.parentElement && document.body) document.body.appendChild(canvas);

// Orthographic camera for 2D gameplay (Y-down to match game logic)
const camera = new THREE.OrthographicCamera(0, W, 0, H, -100, 100);
camera.position.z = 50;

const scene = new THREE.Scene();

// Lighting for 3D shapes
const ambientLight = new THREE.AmbientLight(0x334455, 1.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(50, 50, 80);
scene.add(dirLight);
const pointLight = new THREE.PointLight(0x00ccff, 1, 300);
pointLight.position.set(W * 0.1, H / 2, 30);
scene.add(pointLight);

// Resize
function resize() {
  const aspect = W / H;
  const ww = window.innerWidth || W, wh = window.innerHeight || H;
  if (canvas.style) {
    if (ww / wh > aspect) {
      canvas.style.width = `${wh * aspect}px`;
      canvas.style.height = `${wh}px`;
    } else {
      canvas.style.width = `${ww}px`;
      canvas.style.height = `${ww / aspect}px`;
    }
  }
}
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('resize', resize);
  resize();
}
if (canvas.requestFullscreen) {
  canvas.addEventListener('click', () => canvas.requestFullscreen());
}

const particles = new ParticleSystem3D(scene);

// --- Starfield parallax ---
const starLayers = [
  { count: 60, speed: 0.2, size: 0.5, color: 0x334466, z: -10 },
  { count: 80, speed: 0.5, size: 0.8, color: 0x556688, z: -5 },
  { count: 40, speed: 1.2, size: 1.2, color: 0x8899bb, z: -2 },
];

const stars = [];
for (const layer of starLayers) {
  for (let i = 0; i < layer.count; i++) {
    const geo = new THREE.CircleGeometry(layer.size, 4);
    const mat = new THREE.MeshBasicMaterial({ color: layer.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(Math.random() * W, Math.random() * H, layer.z);
    scene.add(mesh);
    stars.push({ mesh, speed: layer.speed });
  }
}

function updateStars() {
  for (const s of stars) {
    s.mesh.position.x -= s.speed;
    if (s.mesh.position.x < -2) {
      s.mesh.position.x = W + 2;
      s.mesh.position.y = Math.random() * H;
    }
  }
}

// --- Shader nebula clouds (parallax background) ---
const nebulaColors = [0x1a0033, 0x0a1a33, 0x331a1a, 0x0a2233, 0x1a0a33, 0x0a3322];
const nebulae = [];
for (let i = 0; i < 5; i++) {
  const size = 120 + Math.random() * 200;
  const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
  const opacity = 0.3 + Math.random() * 0.3;
  const n = createNebula(scene, Math.random() * W, Math.random() * H, size, color, opacity, -15 - i);
  nebulae.push(n);
}

// --- Player ship ---
function createPlayerShip() {
  const group = new THREE.Group();

  // Fuselage — elongated octahedron
  const bodyGeo = new THREE.ConeGeometry(6, 28, 8);
  bodyGeo.rotateZ(-Math.PI / 2);
  const bodyMat = new THREE.MeshPhongMaterial({ color: 0x00aadd, shininess: 80, specular: 0x44eeff });
  group.add(new THREE.Mesh(bodyGeo, bodyMat));

  // Wings — flat box with depth
  const wingGeo = new THREE.BoxGeometry(10, 24, 3);
  const wingMat = new THREE.MeshPhongMaterial({ color: 0x006699, shininess: 40 });
  const wing = new THREE.Mesh(wingGeo, wingMat);
  wing.position.set(-5, 0, 0);
  group.add(wing);

  // Cockpit — small sphere on top
  const cockpitGeo = new THREE.SphereGeometry(3, 8, 8);
  const cockpitMat = new THREE.MeshPhongMaterial({ color: 0x88eeff, emissive: 0x224444, shininess: 120 });
  const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
  cockpit.position.set(4, 0, 4);
  group.add(cockpit);

  // Engine pods
  for (const yOff of [-8, 8]) {
    const engGeo = new THREE.CylinderGeometry(2, 3, 8, 6);
    engGeo.rotateZ(Math.PI / 2);
    const engMat = new THREE.MeshPhongMaterial({ color: 0x334455 });
    const eng = new THREE.Mesh(engGeo, engMat);
    eng.position.set(-12, yOff, 0);
    group.add(eng);

    // Engine glow
    const glowGeo = new THREE.SphereGeometry(2.5, 6, 6);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(-16, yOff, 0);
    group.add(glow);
  }

  // Slight tilt to show 3D
  group.rotation.x = -0.3;
  group.rotation.y = 0.15;

  return group;
}

const playerMesh = createPlayerShip();
scene.add(playerMesh);

const player = {
  x: W * 0.1,
  y: H / 2,
  width: 25,
  height: 22,
  speed: W * 0.008,
  bullets: [],
  lastShot: 0,
  shootDelay: 130,
  mesh: playerMesh,
};

// --- Enemy ships ---
function createEnemyMesh(type) {
  const group = new THREE.Group();
  const colors = { normal: 0xff2200, sine: 0xffcc00, blue: 0x2244ff };
  const emissive = { normal: 0x440000, sine: 0x443300, blue: 0x000044 };
  const color = colors[type] || 0xff0000;

  // Main body — octahedron (alien look)
  const bodyGeo = new THREE.OctahedronGeometry(8, 0);
  bodyGeo.scale(1.3, 0.8, 0.6);
  const bodyMat = new THREE.MeshPhongMaterial({
    color, emissive: emissive[type] || 0x220000, shininess: 60
  });
  group.add(new THREE.Mesh(bodyGeo, bodyMat));

  // Prongs — cones sticking out
  for (const yOff of [-6, 6]) {
    const prongGeo = new THREE.ConeGeometry(2, 10, 4);
    prongGeo.rotateZ(yOff > 0 ? -Math.PI / 4 : Math.PI / 4);
    const prongMat = new THREE.MeshPhongMaterial({ color: 0x666666, shininess: 30 });
    const prong = new THREE.Mesh(prongGeo, prongMat);
    prong.position.set(-3, yOff, 0);
    group.add(prong);
  }

  // Glowing core
  const coreGeo = new THREE.SphereGeometry(3, 8, 8);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(2, 0, 3);
  group.add(core);

  // Tilt to show 3D
  group.rotation.x = 0.2;
  group.rotation.z = Math.PI; // face left

  return group;
}

const enemies = [];
const enemySpawnInterval = 2000;
let lastEnemySpawn = 0;

// --- Bullets ---
function createBulletMesh() {
  const geo = new THREE.CapsuleGeometry(1, 5, 4, 6);
  geo.rotateZ(Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  const mesh = new THREE.Mesh(geo, mat);
  // Add a glow trail
  const trailGeo = new THREE.ConeGeometry(1.5, 8, 4);
  trailGeo.rotateZ(Math.PI / 2);
  const trailMat = new THREE.MeshBasicMaterial({ color: 0x004466, transparent: true, opacity: 0.5 });
  const trail = new THREE.Mesh(trailGeo, trailMat);
  trail.position.x = -5;
  mesh.add(trail);
  return mesh;
}

// --- Game state ---
let score = 100;
let maxScore = 100;
let speedMultiplierNormal = 1;
let speedMultiplierSine = 1;
let speedMultiplierBlue = 1;
let shipsSpawned = 0;
let bossActive = false;
let boss = null;
let bossLevel = 1;
const shipsPerLevel = 13;
let paused = false;

// --- Sounds ---
let shipExplosion, laserSound, powerDownSound, bossExplosionSound, bossLaserSound, bigExplosionSound, biggerExplosionSound;

// --- HUD (rendered as sprites) ---
function createTextSprite(text, size = 28, color = '#ffffff') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');
  ctx.font = `bold ${size}px Arial`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';
  ctx.fillText(text, 4, 4);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  // Scale to match canvas pixel ratio in world space
  sprite.scale.set(W * 0.9, W * 0.9 * (48/1024), 1);
  sprite.center.set(0, 0);
  return { sprite, canvas, ctx, tex };
}

const hud = createTextSprite('Score: 100', 28);
hud.sprite.position.set(5, 5, 10);
scene.add(hud.sprite);

function updateHUD() {
  const { ctx, canvas, tex } = hud;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '28px Arial';
  ctx.fillStyle = score <= 0 ? '#ff0000' : score === maxScore ? '#00ff00' : '#ffffff';
  ctx.fillText(`Score: ${score}  Max: ${maxScore}  Level: ${bossLevel}`, 0, 0);
  tex.needsUpdate = true;
}

// --- Collision ---
function detectCollision(a, b) {
  return a && b && a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

// --- Spawn ---
function spawnEnemy() {
  if (bossActive) return;
  shipsSpawned++;

  if (shipsSpawned % shipsPerLevel === 0) {
    boss = new Boss3D({
      scene, gameWidth: W, gameHeight: H, level: bossLevel,
      health: 9 + bossLevel, bossLaserSound, bigExplosionSound, playSound,
    });
    bossActive = true;
    startBossMusic();
    return;
  }

  const r = Math.random();
  const type = r < 0.4 ? 'normal' : r < 0.8 ? 'sine' : 'blue';
  const isBlue = type === 'blue';
  const sw = isBlue ? 16 : 20;
  const sh = isBlue ? 12 : 14;
  const baseSpeed = W * 0.003;
  const mult = { normal: speedMultiplierNormal, sine: speedMultiplierSine, blue: speedMultiplierBlue }[type];

  const mesh = createEnemyMesh(type);
  const enemy = {
    x: W + sw, y: Math.random() * (H - sh),
    width: sw, height: sh,
    speed: (baseSpeed / 3) * (type === 'sine' ? 0.7 : 1) * mult,
    type, startY: 0, angle: 0,
    amplitude: H * 0.15,
    frequency: (Math.PI * 2 / W) * 0.075,
    angles: isBlue ? [0, 0, 0] : null,
    frequencies: isBlue ? [0.75, 1.35, 2.05] : null,
    amplitudes: isBlue ? [H * 0.1, H * 0.05, H * 0.025] : null,
    mesh,
  };
  if (type === 'sine' || type === 'blue') enemy.startY = enemy.y;
  mesh.position.set(enemy.x, enemy.y, 0);
  scene.add(mesh);
  enemies.push(enemy);
}

// --- Update ---
function update(elapsed) {
  const inputs = getInput();
  const db = { pressed: false, value: 0 };
  const raw = inputs[0] || {};
  const p1 = {
    DPAD_UP: raw.DPAD_UP || db, DPAD_DOWN: raw.DPAD_DOWN || db,
    DPAD_LEFT: raw.DPAD_LEFT || db, DPAD_RIGHT: raw.DPAD_RIGHT || db,
    BUTTON_SOUTH: raw.BUTTON_SOUTH || db, BUTTON_EAST: raw.BUTTON_EAST || db,
    BUTTON_WEST: raw.BUTTON_WEST || db, BUTTON_NORTH: raw.BUTTON_NORTH || db,
    LEFT_STICK_X: raw.LEFT_STICK_X || 0, LEFT_STICK_Y: raw.LEFT_STICK_Y || 0,
    RIGHT_STICK_X: raw.RIGHT_STICK_X || 0, RIGHT_STICK_Y: raw.RIGHT_STICK_Y || 0,
  };

  updateStars();
  updateNebulae(nebulae, W, H, performance.now() * 0.001);

  // Player movement
  if (Math.abs(p1.LEFT_STICK_X) > 0.2) {
    player.x += player.speed * p1.LEFT_STICK_X;
  } else {
    if (p1.DPAD_LEFT.pressed) player.x -= player.speed;
    if (p1.DPAD_RIGHT.pressed) player.x += player.speed;
  }
  if (Math.abs(p1.LEFT_STICK_Y) > 0.2) {
    player.y += player.speed * p1.LEFT_STICK_Y;
  } else {
    if (p1.DPAD_UP.pressed) player.y -= player.speed;
    if (p1.DPAD_DOWN.pressed) player.y += player.speed;
  }
  player.x = Math.max(0, Math.min(W - player.width, player.x));
  player.y = Math.max(0, Math.min(H - player.height, player.y));
  playerMesh.position.set(player.x + player.width / 2, player.y + player.height / 2, 0);
  // Point light follows player
  pointLight.position.set(player.x, player.y + player.height / 2, 30);

  // Shooting
  if (p1.BUTTON_SOUTH.pressed && Date.now() - player.lastShot > player.shootDelay) {
    const mesh = createBulletMesh();
    const b = {
      x: player.x + player.width, y: player.y + player.height / 2,
      width: 6, height: 2, speed: W * 0.012, mesh,
    };
    mesh.position.set(b.x, b.y, 0);
    scene.add(mesh);
    player.bullets.push(b);
    player.lastShot = Date.now();
    playSound(laserSound);
    score--;
    maxScore = Math.max(maxScore, score);
  }

  // Update bullets
  for (let i = player.bullets.length - 1; i >= 0; i--) {
    const b = player.bullets[i];
    b.x += (b.speed / 16.67) * elapsed;
    b.mesh.position.x = b.x;
    if (b.x > W + 10) {
      scene.remove(b.mesh); b.mesh.geometry.dispose(); b.mesh.material.dispose();
      player.bullets.splice(i, 1);
      continue;
    }
    // Bullet-enemy collision
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (detectCollision(b, enemies[j])) {
        const e = enemies[j];
        particles.createExplosion(e.x + e.width / 2, e.y + e.height / 2,
          e.type === 'blue' ? 0x2244ff : e.type === 'sine' ? 0xffcc00 : 0xff2200);
        playSound(shipExplosion);
        if (e.type === 'normal') speedMultiplierNormal += 0.05;
        else if (e.type === 'sine') speedMultiplierSine += 0.06;
        else speedMultiplierBlue += 0.07;
        score += e.type === 'blue' ? 50 : e.type === 'sine' ? 15 : 10;
        maxScore = Math.max(maxScore, score);
        scene.remove(e.mesh); e.mesh.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
        enemies.splice(j, 1);
        scene.remove(b.mesh); b.mesh.geometry.dispose(); b.mesh.material.dispose();
        player.bullets.splice(i, 1);
        break;
      }
    }
  }

  // Player-enemy collision
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (detectCollision(player, e)) {
      particles.createExplosion(e.x + e.width / 2, e.y + e.height / 2,
        e.type === 'blue' ? 0x2244ff : e.type === 'sine' ? 0xffcc00 : 0xff2200);
      particles.createExplosion(player.x + player.width / 2, player.y + player.height / 2, 0x00ff00, 5);
      playSound(biggerExplosionSound);
      score -= 50;
      maxScore = Math.max(maxScore, score);
      scene.remove(e.mesh); e.mesh.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
      enemies.splice(i, 1);
    }
  }

  // Spawn enemies
  if (Date.now() - lastEnemySpawn > enemySpawnInterval) {
    spawnEnemy();
    lastEnemySpawn = Date.now();
  }

  // Move enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.x -= (e.speed / 3) * elapsed;
    if (e.type === 'sine') {
      e.angle += e.speed * 0.05;
      e.y = e.startY + Math.sin(e.angle) * e.amplitude;
    } else if (e.type === 'blue') {
      e.angles = e.angles.map((a, idx) => a + e.speed * 0.05 * e.frequencies[idx]);
      e.y = e.startY + Math.sin(e.angles[0]) * e.amplitudes[0] + Math.sin(e.angles[1]) * e.amplitudes[1] + Math.sin(e.angles[2]) * e.amplitudes[2];
    }
    e.mesh.position.set(e.x, e.y, 0);
    // Spin enemies to show 3D
    e.mesh.rotation.z += 0.02;
    if (e.type === 'blue') e.mesh.rotation.x += 0.03;
    if (e.type === 'sine') e.mesh.rotation.y += 0.02;

    if (e.x + e.width < 0) {
      score -= 10;
      maxScore = Math.max(maxScore, score);
      scene.remove(e.mesh); e.mesh.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
      enemies.splice(i, 1);
      playSound(powerDownSound);
    }
  }

  particles.update(elapsed);

  // Boss
  if (bossActive && boss) {
    boss.update(elapsed, player.y + player.height / 2);

    // Boss bullets hit player
    const bossBullets = boss.getBullets();
    for (let i = bossBullets.length - 1; i >= 0; i--) {
      if (detectCollision(player, bossBullets[i])) {
        score -= 50;
        maxScore = Math.max(maxScore, score);
        scene.remove(bossBullets[i].mesh); bossBullets[i].mesh.geometry.dispose(); bossBullets[i].mesh.material.dispose();
        bossBullets.splice(i, 1);
        playSound(biggerExplosionSound);
        particles.createExplosion(player.x + player.width / 2, player.y + player.height / 2, 0x00ff00, 10);
      }
    }

    // Player bullets hit boss
    for (let i = player.bullets.length - 1; i >= 0; i--) {
      if (detectCollision(boss, player.bullets[i])) {
        if (boss.hit()) {
          particles.createBossExplosion(boss.x + boss.width / 2, boss.y);
          playSound(biggerExplosionSound);
          playSound(bossExplosionSound);
          score += 100 + bossLevel * 50;
          maxScore = Math.max(maxScore, score);
          boss.destroy();
          bossActive = false;
          boss = null;
          bossLevel++;
          startLevelMusic();
        }
        particles.createExplosion(player.bullets[i].x, player.bullets[i].y, 0xff0000, 5);
        scene.remove(player.bullets[i].mesh); player.bullets[i].mesh.geometry.dispose(); player.bullets[i].mesh.material.dispose();
        player.bullets.splice(i, 1);
      }
    }
  }

  updateHUD();
}

// --- Start ---
async function startGame() {
  try {
    const allSounds = await Promise.all([
      loadSound('explosion_ship'), loadSound('laser'), loadSound('powerdown'),
      loadSound('scream'), loadSound('bigger_explosion'), loadSound('boss_laser'),
      loadSound('big_explosion'),
    ]);
    shipExplosion = allSounds[0]; laserSound = allSounds[1]; powerDownSound = allSounds[2];
    bossExplosionSound = allSounds[3]; biggerExplosionSound = allSounds[4];
    bossLaserSound = allSounds[5]; bigExplosionSound = allSounds[6];
  } catch (e) { console.error('Sound load error:', e); }

  await loadMusic();
  startLevelMusic();

  let lastTime = performance.now();
  const FIXED_TIMESTEP = 1000 / 60;
  let accumulator = 0;

  function gameLoop(currentTime) {
    const frameTime = currentTime - lastTime;
    lastTime = currentTime;
    if (paused) { requestAnimationFrame(gameLoop); return; }

    accumulator += Math.min(frameTime, 250);
    while (accumulator >= FIXED_TIMESTEP) {
      update(FIXED_TIMESTEP);
      accumulator -= FIXED_TIMESTEP;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}

startGame();
