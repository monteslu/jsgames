import * as THREE from './three_wc.js';

export class Boss3D {
  constructor({ scene, gameWidth, gameHeight, level, health, bossLaserSound, bigExplosionSound, playSound }) {
    this.scene = scene;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.level = level;
    this.maxHealth = health;
    this.health = health;
    this.bossLaserSound = bossLaserSound;
    this.bigExplosionSound = bigExplosionSound;
    this.playSound = playSound;

    this.width = gameWidth * 0.08;
    this.height = gameHeight * 0.15;
    this.x = gameWidth + this.width;
    this.y = gameHeight / 2;
    this.targetX = gameWidth * 0.75;
    this.speed = 0.3 + level * 0.05;
    this.entering = true;
    this.shootTimer = 0;
    this.shootInterval = Math.max(500, 2000 - level * 200);
    this.bullets = [];

    // Boss mesh — larger, more menacing
    const group = new THREE.Group();

    // Main body
    const bodyGeo = new THREE.BoxGeometry(this.width, this.height * 0.6, 2);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x880088 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Wings
    const wingGeo = new THREE.BoxGeometry(this.width * 0.3, this.height, 1);
    const wingMat = new THREE.MeshBasicMaterial({ color: 0xaa00aa });
    const topWing = new THREE.Mesh(wingGeo, wingMat);
    topWing.position.set(-this.width * 0.2, this.height * 0.3, 0);
    group.add(topWing);
    const bottomWing = new THREE.Mesh(wingGeo, wingMat);
    bottomWing.position.set(-this.width * 0.2, -this.height * 0.3, 0);
    group.add(bottomWing);

    // Core
    const coreGeo = new THREE.SphereGeometry(this.width * 0.15, 8, 8);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(this.width * 0.1, 0, 1);
    group.add(core);

    // Health bar background
    const hbBgGeo = new THREE.PlaneGeometry(this.width, 1);
    const hbBgMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    this.healthBarBg = new THREE.Mesh(hbBgGeo, hbBgMat);
    this.healthBarBg.position.set(0, this.height * 0.5, 1);
    group.add(this.healthBarBg);

    const hbGeo = new THREE.PlaneGeometry(this.width, 1);
    const hbMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.healthBar = new THREE.Mesh(hbGeo, hbMat);
    this.healthBar.position.set(0, this.height * 0.5, 1.1);
    group.add(this.healthBar);

    group.position.set(this.x, this.y, 0);
    this.mesh = group;
    this.scene.add(this.mesh);
  }

  update(dt, playerY) {
    if (this.entering) {
      this.x -= this.speed * 3;
      if (this.x <= this.targetX) {
        this.x = this.targetX;
        this.entering = false;
      }
    } else {
      // Track player Y with some smoothing
      const targetY = playerY;
      this.y += (targetY - this.y) * 0.02;
      this.y = Math.max(this.height / 2, Math.min(this.gameHeight - this.height / 2, this.y));
    }

    this.mesh.position.set(this.x, this.y, 0);

    // Update health bar
    const pct = this.health / this.maxHealth;
    this.healthBar.scale.x = pct;
    this.healthBar.position.x = -this.width * (1 - pct) * 0.5;

    // Shooting
    this.shootTimer += dt;
    if (!this.entering && this.shootTimer > this.shootInterval) {
      this.shootTimer = 0;
      this.shoot();
    }

    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x -= b.speed;
      b.mesh.position.x = b.x;
      if (b.x < -5) {
        this.scene.remove(b.mesh);
        b.mesh.geometry.dispose();
        b.mesh.material.dispose();
        this.bullets.splice(i, 1);
      }
    }
  }

  shoot() {
    const bulletGeo = new THREE.SphereGeometry(1.5, 6, 6);
    const bulletMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const mesh = new THREE.Mesh(bulletGeo, bulletMat);
    const b = {
      x: this.x - this.width / 2,
      y: this.y,
      width: 3,
      height: 3,
      speed: this.gameWidth * 0.005 + this.level * 0.5,
      mesh,
    };
    mesh.position.set(b.x, b.y, 0);
    this.scene.add(mesh);
    this.bullets.push(b);
    if (this.playSound && this.bossLaserSound) this.playSound(this.bossLaserSound);
  }

  getBullets() {
    return this.bullets;
  }

  hit() {
    this.health--;
    if (this.playSound && this.bigExplosionSound) this.playSound(this.bigExplosionSound);
    return this.health <= 0;
  }

  destroy() {
    // Clean up all meshes
    for (const b of this.bullets) {
      this.scene.remove(b.mesh);
      b.mesh.geometry.dispose();
      b.mesh.material.dispose();
    }
    this.bullets = [];
    this.scene.remove(this.mesh);
    this.mesh.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
