class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.life = 1;
        this.fadeSpeed = 0.02 + Math.random() * 0.02;
    }

    update(deltaTime) {
        this.x += this.vx * (deltaTime / 16);
        this.y += this.vy * (deltaTime / 16);
        this.life -= this.fadeSpeed * (deltaTime / 16);
        this.alpha = this.life;
        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export class ParticleSystem {
    constructor() {
        this.particleSystems = [];
    }

    createExplosion(x, y, color = '#FFD700', particleCount = 20) {
        const particles = Array(particleCount).fill(null).map(() => new Particle(x, y, color));
        this.particleSystems.push(particles);
    }

    update(deltaTime) {
        this.particleSystems = this.particleSystems.map(system => 
            system.filter(particle => particle.update(deltaTime))
        ).filter(system => system.length > 0);
    }

    draw(ctx) {
        this.particleSystems.forEach(system => {
            system.forEach(particle => particle.draw(ctx));
        });
    }

    clear() {
        this.particleSystems = [];
    }
}