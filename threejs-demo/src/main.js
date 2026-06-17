import * as THREE from 'three';
import { getInput, createResourceLoader, loadSound, playSound } from './utils.js';

const canvas = document.getElementById('game-canvas');
const gl = canvas.getContext('webgl2');

// Create renderer using the existing GL context
const renderer = new THREE.WebGLRenderer({
  canvas,
  context: gl,
  antialias: false,
});
renderer.setSize(canvas.width, canvas.height, false);
renderer.setClearColor(0x0a0a1a);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 100);
camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);

// Lights
const ambient = new THREE.AmbientLight(0x404060, 1.0);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffeedd, 1.5);
directional.position.set(3, 5, 4);
scene.add(directional);


// Ground plane with texture
const groundGeo = new THREE.PlaneGeometry(12, 12);
const groundMat = new THREE.MeshStandardMaterial({
  metalness: 0.1,
  roughness: 0.8,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
scene.add(ground);

const resources = createResourceLoader();
resources.addImage('floor', 'images/texture.jpg');

// Spinning cube
const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
const cubeMat = new THREE.MeshStandardMaterial({
  color: 0xe94560,
  metalness: 0.7,
  roughness: 0.15,
  emissive: 0x330000,
});
const cube = new THREE.Mesh(cubeGeo, cubeMat);
cube.position.set(-1.8, 0.5, 0);
scene.add(cube);

// Spinning sphere
const sphereGeo = new THREE.SphereGeometry(0.6, 32, 24);
const sphereMat = new THREE.MeshStandardMaterial({
  color: 0x2244aa,
  metalness: 0.8,
  roughness: 0.1,
  emissive: 0x000033,
});
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.set(1.8, 0.5, 0);
scene.add(sphere);

// Torus knot in the center
const knotGeo = new THREE.TorusKnotGeometry(0.6, 0.18, 100, 24);
const knotMat = new THREE.MeshStandardMaterial({
  color: 0x16c79a,
  metalness: 0.6,
  roughness: 0.15,
  emissive: 0x003322,
});
const knot = new THREE.Mesh(knotGeo, knotMat);
knot.position.set(0, 1.2, 0);
scene.add(knot);

// Generate a radial glow texture
function createGlowTexture(size = 64) {
  const data = new Uint8Array(size * size * 4);
  const center = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - center) / center;
      const dy = (y - center) / center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const alpha = Math.max(0, 1 - dist);
      const i = (y * size + x) * 4;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = alpha * alpha * 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

const glowTexture = createGlowTexture();

// Sparkle orbs — bright emissive spheres with attached point lights
const sparkleOrbs = [];
const sparkleColors = [0xffaa44, 0x44aaff, 0xff44aa];
const sparkleParams = [
  { radius: 2.5, speed: 0.6, height: 1.5, tilt: 0.3, phase: 0 },
  { radius: 3.0, speed: 0.45, height: 1.0, tilt: -0.4, phase: 2.1 },
  { radius: 2.0, speed: 0.8, height: 2.0, tilt: 0.5, phase: 4.2 },
];

for (let i = 0; i < 1; i++) {
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    color: sparkleColors[i],
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
  glow.scale.set(2, 2, 1);

  const group = new THREE.Group();
  group.add(core);
  group.add(glow);

  const light = new THREE.PointLight(sparkleColors[i], 15, 0);
  group.add(light);
  scene.add(group);
  sparkleOrbs.push({ orb: group, light, ...sparkleParams[i] });
}

let cameraAngle = 0;
let cameraHeight = 2.5;
let cameraDistance = 5.5;

let laserSound;
loadSound('sounds/laser.mp3').then(s => { laserSound = s; });

let btnSouthWas = false;
let btnEastWas = false;
let btnWestWas = false;
let btnNorthWas = false;

let textureApplied = false;
let lastTime = 0;

// Animation loop
function animate(time) {
  requestAnimationFrame(animate);
  const dt = Math.min((time - lastTime) / 1000, 0.1); // delta in seconds, capped
  lastTime = time;

  if (!textureApplied && resources.isComplete()) {
    const floorImg = resources.images.floor;
    // Draw to a temp canvas to get pixel data (needed for non-browser environments)
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = floorImg.width;
    tmpCanvas.height = floorImg.height;
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCtx.drawImage(floorImg, 0, 0);
    const imgData = tmpCtx.getImageData(0, 0, floorImg.width, floorImg.height);
    // Flip vertically — getImageData is top-down, GL expects bottom-up
    const src = imgData.data;
    const flipped = new Uint8Array(src.length);
    const rowBytes = floorImg.width * 4;
    for (let y = 0; y < floorImg.height; y++) {
      const srcOff = y * rowBytes;
      const dstOff = (floorImg.height - 1 - y) * rowBytes;
      flipped.set(src.subarray(srcOff, srcOff + rowBytes), dstOff);
    }
    const tex = new THREE.DataTexture(
      flipped,
      floorImg.width, floorImg.height,
      THREE.RGBAFormat
    );
    tex.needsUpdate = true;
    tex.colorSpace = THREE.SRGBColorSpace;
    groundMat.map = tex;
    groundMat.needsUpdate = true;
    textureApplied = true;
  }

  const t = time * 0.001;

  const [p1] = getInput();

  if (p1.GUIDE.pressed && p1.START.pressed && typeof process !== 'undefined') {
    process.exit(0);
  }

  // Play laser on face button press
  if (p1.BUTTON_SOUTH.pressed && !btnSouthWas) { console.log('LASER S'); playSound(laserSound); }
  if (p1.BUTTON_EAST.pressed && !btnEastWas) { console.log('LASER E'); playSound(laserSound); }
  if (p1.BUTTON_WEST.pressed && !btnWestWas) { console.log('LASER W'); playSound(laserSound); }
  if (p1.BUTTON_NORTH.pressed && !btnNorthWas) { console.log('LASER N'); playSound(laserSound); }
  btnSouthWas = p1.BUTTON_SOUTH.pressed;
  btnEastWas = p1.BUTTON_EAST.pressed;
  btnWestWas = p1.BUTTON_WEST.pressed;
  btnNorthWas = p1.BUTTON_NORTH.pressed;

  // Gamepad camera orbit (left stick orbits, right stick zooms)
  cameraAngle += p1.LEFT_STICK_X * 2.0 * dt;
  cameraHeight = Math.max(0.5, Math.min(6, cameraHeight - p1.LEFT_STICK_Y * 3.0 * dt));
  cameraDistance = Math.max(2, Math.min(10, cameraDistance + p1.RIGHT_STICK_Y * 3.0 * dt));

  camera.position.x = Math.sin(cameraAngle) * cameraDistance;
  camera.position.z = Math.cos(cameraAngle) * cameraDistance;
  camera.position.y = cameraHeight;
  camera.lookAt(0, 0.5, 0);

  // Animate objects
  cube.rotation.x = t * 0.7;
  cube.rotation.y = t * 1.0;

  sphere.rotation.y = t * 0.5;
  sphere.position.y = 0.5 + Math.sin(t * 2) * 0.3;

  knot.rotation.x = t * 0.4;
  knot.rotation.y = t * 0.6;
  knot.position.y = 1.2 + Math.sin(t * 1.3) * 0.15;


  // Update sparkle orbs
  for (const s of sparkleOrbs) {
    const angle = t * s.speed + s.phase;
    s.orb.position.x = Math.cos(angle) * s.radius;
    s.orb.position.z = Math.sin(angle) * s.radius;
    s.orb.position.y = s.height + Math.sin(angle * 2 + s.tilt) * 0.4;
    s.light.intensity = 12 + Math.sin(t * 3 + s.phase) * 6;
  }

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
