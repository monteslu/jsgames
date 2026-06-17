// npc.js
import { NPC_CONFIG, COLORS } from './constants.js';

export class NPC {
  constructor(x, y, config) {
    this.x = x;
    this.y = y;
    this.name = config.name || 'Stranger';
    this.dialog = config.dialog || ['...'];
    this.dialogIndex = 0;
    this.appearance = config.appearance || 'oldman';
    this.direction = config.direction || 'down';
    this.width = 0.8;
    this.height = 0.8;

    // Speech bubble state
    this.showBubble = false;
    this.bubbleTime = 0;
    this.bubbleText = '';
    this.interactCooldown = 0;

    // Animation
    this.animTime = 0;
    this.bobOffset = 0;

    // Indicator for when player is near
    this.playerNear = false;
  }

  update(deltaTime, player) {
    this.animTime += deltaTime;
    this.bobOffset = Math.sin(this.animTime * 0.003) * 2;

    // Check if player is nearby
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.playerNear = dist <= NPC_CONFIG.INTERACT_RANGE;

    // Face toward player when near
    if (this.playerNear) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? 'right' : 'left';
      } else {
        this.direction = dy > 0 ? 'down' : 'up';
      }
    }

    // Update bubble timer
    if (this.showBubble) {
      this.bubbleTime += deltaTime;
      if (this.bubbleTime >= NPC_CONFIG.BUBBLE_SHOW_TIME) {
        this.showBubble = false;
        this.bubbleTime = 0;
      }
    }

    if (this.interactCooldown > 0) {
      this.interactCooldown -= deltaTime;
    }
  }

  interact() {
    if (this.interactCooldown > 0) return false;

    this.bubbleText = this.dialog[this.dialogIndex];
    this.dialogIndex = (this.dialogIndex + 1) % this.dialog.length;
    this.showBubble = true;
    this.bubbleTime = 0;
    this.interactCooldown = 400;
    return true;
  }

  draw(ctx) {
    const px = Math.floor(this.x * 32);
    const py = Math.floor(this.y * 32 + this.bobOffset);

    // Draw NPC based on appearance
    switch (this.appearance) {
      case 'oldman':
        this.drawOldMan(ctx, px, py);
        break;
      case 'guard':
        this.drawGuard(ctx, px, py);
        break;
      case 'merchant':
        this.drawMerchant(ctx, px, py);
        break;
      case 'fairy':
        this.drawFairy(ctx, px, py);
        break;
      case 'villager':
        this.drawVillager(ctx, px, py);
        break;
      case 'witch':
        this.drawWitch(ctx, px, py);
        break;
      default:
        this.drawVillager(ctx, px, py);
        break;
    }

    // Draw interact indicator when player is near
    if (this.playerNear && !this.showBubble) {
      this.drawInteractIndicator(ctx, px, py);
    }

    // Draw speech bubble
    if (this.showBubble) {
      this.drawSpeechBubble(ctx, px, py);
    }
  }

  drawOldMan(ctx, px, py) {
    // Robe (brown)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(px - 8, py - 4, 16, 18);
    // Head (skin)
    ctx.fillStyle = '#FFDAB9';
    ctx.fillRect(px - 6, py - 14, 12, 12);
    // Beard (white)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(px - 4, py - 4, 8, 6);
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(px - 4, py - 10, 2, 2);
    ctx.fillRect(px + 2, py - 10, 2, 2);
    // Staff
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(px + 10, py - 18, 3, 32);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(px + 11, py - 18, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawGuard(ctx, px, py) {
    // Armor (silver/gray)
    ctx.fillStyle = '#A0A0A0';
    ctx.fillRect(px - 8, py - 4, 16, 18);
    // Helmet
    ctx.fillStyle = '#808080';
    ctx.fillRect(px - 8, py - 16, 16, 14);
    ctx.fillRect(px - 10, py - 6, 20, 4);
    // Face slit
    ctx.fillStyle = '#000';
    ctx.fillRect(px - 4, py - 10, 8, 2);
    // Spear
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(px + 10, py - 20, 2, 34);
    // Spear tip
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.moveTo(px + 11, py - 24);
    ctx.lineTo(px + 7, py - 18);
    ctx.lineTo(px + 15, py - 18);
    ctx.closePath();
    ctx.fill();
  }

  drawMerchant(ctx, px, py) {
    // Body (purple robe)
    ctx.fillStyle = '#800080';
    ctx.fillRect(px - 8, py - 4, 16, 18);
    // Head
    ctx.fillStyle = '#FFDAB9';
    ctx.fillRect(px - 6, py - 14, 12, 12);
    // Turban
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(px - 7, py - 18, 14, 6);
    ctx.beginPath();
    ctx.arc(px, py - 16, 8, Math.PI, 0);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(px - 4, py - 10, 2, 2);
    ctx.fillRect(px + 2, py - 10, 2, 2);
    // Mustache
    ctx.fillStyle = '#000';
    ctx.fillRect(px - 4, py - 5, 3, 2);
    ctx.fillRect(px + 1, py - 5, 3, 2);
  }

  drawFairy(ctx, px, py) {
    // Glow effect
    const glowAlpha = 0.3 + Math.sin(this.animTime * 0.005) * 0.2;
    ctx.fillStyle = `rgba(200, 255, 255, ${glowAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py - 6, 16, 0, Math.PI * 2);
    ctx.fill();
    // Wings
    ctx.fillStyle = 'rgba(150, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(px - 10, py - 8, 8, 12, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + 10, py - 8, 8, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Body (small, bright)
    ctx.fillStyle = '#E0FFE0';
    ctx.fillRect(px - 4, py - 10, 8, 12);
    // Head
    ctx.fillStyle = '#E0FFE0';
    ctx.beginPath();
    ctx.arc(px, py - 14, 5, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#00AAFF';
    ctx.fillRect(px - 3, py - 16, 2, 2);
    ctx.fillRect(px + 1, py - 16, 2, 2);
  }

  drawVillager(ctx, px, py) {
    // Body (blue shirt)
    ctx.fillStyle = '#4477AA';
    ctx.fillRect(px - 7, py - 4, 14, 16);
    // Head
    ctx.fillStyle = '#FFDAB9';
    ctx.fillRect(px - 5, py - 14, 10, 11);
    // Hair
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(px - 6, py - 16, 12, 5);
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(px - 3, py - 10, 2, 2);
    ctx.fillRect(px + 1, py - 10, 2, 2);
    // Legs
    ctx.fillStyle = '#6B4423';
    ctx.fillRect(px - 5, py + 12, 4, 4);
    ctx.fillRect(px + 1, py + 12, 4, 4);
  }

  drawWitch(ctx, px, py) {
    // Robe (dark purple)
    ctx.fillStyle = '#4B0082';
    ctx.fillRect(px - 8, py - 4, 16, 18);
    // Head
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(px - 5, py - 12, 10, 10);
    // Hat
    ctx.fillStyle = '#2D0050';
    ctx.beginPath();
    ctx.moveTo(px, py - 26);
    ctx.lineTo(px - 10, py - 12);
    ctx.lineTo(px + 10, py - 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(px - 12, py - 13, 24, 3);
    // Eyes (glowing)
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(px - 3, py - 9, 2, 2);
    ctx.fillRect(px + 1, py - 9, 2, 2);
  }

  drawInteractIndicator(ctx, px, py) {
    const bounce = Math.sin(this.animTime * 0.006) * 4;
    const iy = py - 28 + bounce;
    // Background circle
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.arc(px, iy - 2, 9, 0, Math.PI * 2);
    ctx.fill();
    // Yellow "!" marker
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('!', px, iy + 4);
    // "S" key hint below
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '9px monospace';
    ctx.fillText('[S]', px, iy + 16);
  }

  drawSpeechBubble(ctx, px, py) {
    const padding = NPC_CONFIG.BUBBLE_PADDING;
    const maxWidth = NPC_CONFIG.BUBBLE_MAX_WIDTH;
    const screenW = 20 * 32; // play area width in pixels
    const screenH = 12 * 32; // play area height in pixels

    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'left';

    // NPC name header + dialog text
    const nameText = this.name;
    // Measure with dialog font
    ctx.font = '20px monospace';
    const words = this.bubbleText.split(' ');
    const lines = [];
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      if (ctx.measureText(testLine).width > maxWidth - padding * 2) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = 26;
    const nameHeight = 32;
    const textWidths = lines.map(l => ctx.measureText(l).width);
    ctx.font = 'bold 22px monospace';
    const nameWidth = ctx.measureText(nameText).width;
    const bubbleWidth = Math.min(maxWidth, Math.max(nameWidth, ...textWidths) + padding * 2);
    const bubbleHeight = nameHeight + lines.length * lineHeight + padding * 2;

    // Position bubble above NPC, then clamp to screen
    let bubbleX = px - bubbleWidth / 2;
    let bubbleY = py - 36 - bubbleHeight;

    // Clamp horizontally
    if (bubbleX < 4) bubbleX = 4;
    if (bubbleX + bubbleWidth > screenW - 4) bubbleX = screenW - 4 - bubbleWidth;
    // Clamp vertically - if too high, show below NPC
    if (bubbleY < 4) bubbleY = py + 20;

    // Tail anchor point (always points to NPC)
    const tailX = Math.max(bubbleX + 12, Math.min(px, bubbleX + bubbleWidth - 12));
    const tailBelow = bubbleY > py; // tail points up if bubble is below

    // Fade effect
    let alpha = 1;
    const remaining = NPC_CONFIG.BUBBLE_SHOW_TIME - this.bubbleTime;
    if (remaining < NPC_CONFIG.BUBBLE_FADE_TIME) {
      alpha = remaining / NPC_CONFIG.BUBBLE_FADE_TIME;
    }
    ctx.globalAlpha = alpha;

    // Bubble shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    roundRect(ctx, bubbleX + 2, bubbleY + 2, bubbleWidth, bubbleHeight, 8);
    ctx.fill();

    // Bubble background
    ctx.fillStyle = '#FFFFF0';
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    roundRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Bubble tail
    ctx.fillStyle = '#FFFFF0';
    ctx.beginPath();
    if (tailBelow) {
      // Tail points up to NPC
      ctx.moveTo(tailX - 6, bubbleY);
      ctx.lineTo(tailX, bubbleY - 10);
      ctx.lineTo(tailX + 6, bubbleY);
    } else {
      // Tail points down to NPC
      ctx.moveTo(tailX - 6, bubbleY + bubbleHeight);
      ctx.lineTo(tailX, bubbleY + bubbleHeight + 10);
      ctx.lineTo(tailX + 6, bubbleY + bubbleHeight);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#333333';
    ctx.beginPath();
    if (tailBelow) {
      ctx.moveTo(tailX - 6, bubbleY);
      ctx.lineTo(tailX, bubbleY - 10);
      ctx.lineTo(tailX + 6, bubbleY);
    } else {
      ctx.moveTo(tailX - 6, bubbleY + bubbleHeight);
      ctx.lineTo(tailX, bubbleY + bubbleHeight + 10);
      ctx.lineTo(tailX + 6, bubbleY + bubbleHeight);
    }
    ctx.stroke();

    // Name (bold, colored)
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(nameText, bubbleX + padding, bubbleY + padding + 20);

    // Separator line
    ctx.strokeStyle = '#DDDDCC';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bubbleX + padding, bubbleY + padding + nameHeight - 2);
    ctx.lineTo(bubbleX + bubbleWidth - padding, bubbleY + padding + nameHeight - 2);
    ctx.stroke();

    // Dialog text
    ctx.fillStyle = '#222222';
    ctx.font = '20px monospace';
    lines.forEach((line, i) => {
      ctx.fillText(line, bubbleX + padding, bubbleY + padding + nameHeight + 22 + i * lineHeight);
    });

    ctx.globalAlpha = 1;
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
