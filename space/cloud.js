// Cloud generation for parallax backgrounds
class Cloud {
  constructor({ layer, scale, gameWidth, gameHeight }) {
    this.layer = layer;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.width = Math.random() * scale.CLOUD_MAX_WIDTH + scale.CLOUD_MIN_WIDTH;
    this.height = this.width * 0.6;
    this.x = Math.random() * gameWidth;
    this.y = Math.random() * gameHeight;
    this.speed = (3 - layer) * (scale.ENEMY_SPEED * 0.5);
  }

  update() {
    this.x -= this.speed;
    if (this.x + this.width < 0) {
      this.x = this.gameWidth;
      this.y = Math.random() * this.gameHeight;
    }
  }

  draw(ctx) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 - this.layer * 0.03})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width * 0.3, 0, Math.PI * 2);
    ctx.arc(this.x + this.width * 0.4, this.y - this.height * 0.1, this.width * 0.4, 0, Math.PI * 2);
    ctx.arc(this.x + this.width * 0.6, this.y, this.width * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default Cloud;