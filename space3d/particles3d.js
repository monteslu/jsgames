import * as THREE from './three_wc.js';

// Shared geometries to reduce GC pressure
const sharedGeos = [
  new THREE.OctahedronGeometry(1, 0),
  new THREE.TetrahedronGeometry(1, 0),
  new THREE.IcosahedronGeometry(0.8, 0),
];

export class ParticleSystem3D {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  createExplosion(x, y, color = 0xff0000, count = 15) {
    const c = new THREE.Color(color);
    for (let i = 0; i < count; i++) {
      const geo = sharedGeos[Math.floor(Math.random() * sharedGeos.length)];
      const size = 0.5 + Math.random() * 1.5;
      const mat = new THREE.MeshPhongMaterial({
        color: c,
        emissive: c,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, Math.random() * 6 - 3);
      mesh.scale.setScalar(size);
      mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2;
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: (Math.random() - 0.5) * 1.5,
        rx: (Math.random() - 0.5) * 0.3,
        ry: (Math.random() - 0.5) * 0.3,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03,
      });
    }
  }

  createBossExplosion(x, y) {
    this.createExplosion(x, y, 0xff4400, 40);
    this.createExplosion(x, y, 0xffaa00, 25);
    this.createExplosion(x, y, 0xffffff, 10);
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.mesh.position.x += p.vx;
      p.mesh.position.y += p.vy;
      p.mesh.position.z += p.vz;
      p.mesh.rotation.x += p.rx;
      p.mesh.rotation.y += p.ry;
      p.life -= p.decay;
      p.mesh.material.opacity = Math.max(0, p.life);
      p.mesh.material.emissiveIntensity = p.life * 0.5;
      p.mesh.scale.setScalar(p.mesh.scale.x * 0.97);
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
      }
    }
  }
}
