export class ParticleSystem {
  constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.gravity = 0.001; // Units per ms^2
  }

  createExplosion(x, y, color, count = 30) {
      const colors = [color, '#FFA500', '#FFFFFF'];
      
      for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 0.3 + 0.2; // Units per ms
          const size = Math.random() * 3 + 1;
          const lifetime = Math.random() * 1000 + 1000; // Milliseconds the particle will live
          
          this.particles.push({
              x,
              y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size,
              color: colors[Math.floor(Math.random() * colors.length)],
              life: lifetime,
              maxLife: lifetime,
              alpha: 1
          });
      }
  }

  createBossExplosion(x, y) {
    const colors = ['#ff0000', '#ff4400', '#ff7700', '#ffaa00', '#ffffff'];
    const particleCount = 100;
    const minSpeed = 0.1;
    const maxSpeed = 0.4;
    const minSize = 4;
    const maxSize = 10;
    const minLifetime = 1500;
    const maxLifetime = 3000;
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
        const size = minSize + Math.random() * (maxSize - minSize);
        const lifetime = minLifetime + Math.random() * (maxLifetime - minLifetime);
        
        // Create main particle
        this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: lifetime,
            maxLife: lifetime,
            alpha: 1,
            gravity: 0.0001 // Reduced gravity for more outward explosion
        });

        // Create smaller trailing particle with same trajectory
        if (Math.random() < 0.5) {  // 50% chance for each particle to have a trail
            const trailLifetime = lifetime * 0.7;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed * 0.7,
                vy: Math.sin(angle) * speed * 0.7,
                size: size * 0.5,
                color: '#ffff00',  // Yellow/white trail
                life: trailLifetime,
                maxLife: trailLifetime,
                alpha: 0.7,
                gravity: 0.0001
            });
        }
    }
}

  // Modify the update method to include gravity parameter
  update(elapsed) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          
          p.x += p.vx * elapsed;
          p.y += p.vy * elapsed;
          p.vy += (p.gravity || this.gravity) * elapsed;  // Use particle-specific gravity if available
          p.life -= elapsed;
          p.alpha = (p.life / p.maxLife) * (p.alpha || 1);

          if (p.life <= 0) {
              this.particles.splice(i, 1);
          }
      }
  }

  // Modify the draw method to handle alpha
  draw() {
      this.ctx.save();
      for (const p of this.particles) {
          this.ctx.globalAlpha = p.alpha;
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fill();
      }
      this.ctx.restore();
  }

  updateold(elapsed) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          
          p.x += p.vx * elapsed;
          p.y += p.vy * elapsed;
          p.vy += this.gravity * elapsed;
          p.life -= elapsed;
          p.alpha = p.life / p.maxLife;

          if (p.life <= 0) {
              this.particles.splice(i, 1);
          }
      }
  }

  drawold() {
      this.ctx.save();
      for (const p of this.particles) {
          this.ctx.globalAlpha = p.alpha;
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fill();
      }
      this.ctx.restore();
  }
}