// Final Impact - Projectiles Engine (Hadouken, Sonic Blade, Ki Kunai)
import { Box } from './Hitbox.js';
import { ATTACK_HEIGHT } from './Constants.js';

export class Projectile {
  constructor({
    owner,
    type,
    x,
    y,
    vx,
    vy = 0,
    width = 32,
    height = 24,
    damage = 60,
    color = '#38bdf8'
  }) {
    this.owner = owner;
    this.type = type;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.width = width;
    this.height = height;
    this.damage = damage;
    this.color = color;
    this.active = true;
    this.frame = 0;
    this.attackHeight = ATTACK_HEIGHT.HIGH;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.frame++;

    // Despawn if out of stage bounds
    if (this.x < -100 || this.x > 1100 || this.y > 400) {
      this.active = false;
    }
  }

  getHitbox() {
    return new Box(this.x, this.y, this.width, this.height);
  }

  render(ctx) {
    if (!this.active) return;
    ctx.save();

    if (this.type === 'hadouken') {
      // Swirling blue Ki Fireball with bright white core
      const pulse = Math.sin(this.frame * 0.4) * 2;
      const trail = this.vx > 0 ? -1 : 1;

      // Outer energy aura
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 16 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Middle blue Ki core
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 11, 0, Math.PI * 2);
      ctx.fill();

      // Bright white blazing center
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 6, 0, Math.PI * 2);
      ctx.fill();

      // Trailing Ki flame particles
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(this.x + (trail * 12), this.y + 4, 8, 4);
      ctx.fillRect(this.x + (trail * 18), this.y + 12, 10, 5);
      ctx.fillRect(this.x + (trail * 10), this.y + 16, 6, 4);

    } else if (this.type === 'sonic_blade') {
      // Spinning golden sonic razor crescent
      const rot = this.frame * 0.35;
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(rot);

      // Outer sonic glow
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-16, -16, 32, 32);

      // Slicing golden blades
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-18, -4, 36, 8);
      ctx.fillRect(-4, -18, 8, 36);

      // Intense white core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -6, 12, 12);

    } else if (this.type === 'ki_kunai') {
      // Twin cyan glowing kunai
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(this.x, this.y, 16, 5);
      ctx.fillRect(this.x + 4, this.y + 8, 16, 5);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x + 8, this.y + 1, 8, 3);
      ctx.fillRect(this.x + 12, this.y + 9, 8, 3);
    }

    ctx.restore();
  }
}

export class AlleyPickup {
  constructor(type, x, y = 290) {
    this.type = type; // 'bottle', 'brick', 'lumber'
    this.x = x;
    this.y = y;
    this.width = type === 'lumber' ? 26 : 14;
    this.height = type === 'lumber' ? 12 : 12;
    this.active = true;
    this.isAirborne = false;
    this.vx = 0;
    this.vy = 0;
    this.owner = null;
    this.damage = type === 'brick' ? 75 : (type === 'bottle' ? 65 : 85);
  }

  throw(owner, facingRight) {
    this.owner = owner;
    this.isAirborne = true;
    this.x = owner.x + (facingRight ? 50 : 10);
    this.y = owner.y - 50;
    this.vx = (facingRight ? 1 : -1) * (this.type === 'brick' ? 7.0 : 8.5);
    this.vy = this.type === 'brick' ? -5.5 : -2.5;
  }

  update() {
    if (this.isAirborne) {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.55;
      if (this.y >= 290) {
        this.y = 290;
        this.isAirborne = false;
        this.vx = 0;
        this.vy = 0;
        if (this.type === 'bottle') {
          this.active = false;
        }
      }
    }
  }

  getHitbox() {
    return new Box(this.x, this.y - 10, this.width, this.height);
  }

  render(ctx) {
    if (!this.active) return;
    ctx.save();
    if (this.type === 'bottle') {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(this.x, this.y - 8, 6, 12);
      ctx.fillStyle = '#6ee7b7';
      ctx.fillRect(this.x + 1, this.y - 12, 4, 5);
    } else if (this.type === 'brick') {
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(this.x, this.y - 6, 14, 8);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(this.x + 2, this.y - 5, 10, 6);
    } else if (this.type === 'lumber') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(this.x, this.y - 6, 26, 7);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(this.x + 2, this.y - 5, 22, 5);
    }
    ctx.restore();
  }
}
