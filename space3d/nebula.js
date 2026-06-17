import * as THREE from './three_wc.js';

const nebulaVertexShader = `
varying vec2 vUv;
varying vec3 vPos;
void main() {
  vUv = uv;
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const nebulaFragmentShader = `
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
varying vec3 vPos;

// Simplex-ish noise via hash
vec3 hash3(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 74.7)),
    dot(p, vec3(269.5, 183.3, 246.1)),
    dot(p, vec3(113.5, 271.9, 124.6))
  );
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);

  float a = dot(hash3(i), f);
  float b = dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0));
  float c = dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0));
  float d = dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0));
  float e = dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1));
  float ff = dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1));
  float g = dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1));
  float h = dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1));

  return mix(
    mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
    mix(mix(e, ff, u.x), mix(g, h, u.x), u.y),
    u.z
  );
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;

  // Radial falloff — cloud shape
  float dist = length(uv);
  float edge = smoothstep(1.0, 0.2, dist);

  // Animated noise
  vec3 noiseCoord = vec3(vUv * 3.0, uTime * 0.05);
  float n = fbm(noiseCoord);
  float n2 = fbm(noiseCoord * 2.0 + vec3(5.2, 1.3, 3.7));

  // Combine
  float density = edge * (0.5 + 0.5 * n) * (0.7 + 0.3 * n2);
  density = smoothstep(0.05, 0.6, density);

  // Color variation
  vec3 col = uColor + vec3(n * 0.1, n2 * 0.05, -n * 0.05);

  gl_FragColor = vec4(col, density * uOpacity);
}
`;

export function createNebula(scene, x, y, size, color, opacity, z) {
  const geo = new THREE.PlaneGeometry(size, size);
  const mat = new THREE.ShaderMaterial({
    vertexShader: nebulaVertexShader,
    fragmentShader: nebulaFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    },
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return { mesh, mat, speed: 0.05 + Math.random() * 0.1, size };
}

export function updateNebulae(nebulae, W, H, time) {
  for (const n of nebulae) {
    n.mesh.position.x -= n.speed;
    n.mat.uniforms.uTime.value = time;
    if (n.mesh.position.x < -n.size) {
      n.mesh.position.x = W + n.size;
      n.mesh.position.y = Math.random() * H;
    }
  }
}
