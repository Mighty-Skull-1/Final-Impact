// Final Impact - Projectiles Engine (Hadouken, Sonic Blade, Ki Kunai)
import { Box } from './Hitbox.js';
import { ATTACK_HEIGHT } from './Constants.js';
import { vfx } from '../graphics/VFX.js';
import { FIGHTER_DESIGNS } from '../graphics/FighterDesigns.js';

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

  destroy() {
    if (this.active) {
      this.active = false;
      if (this.owner && typeof this.owner.onProjectileDestroyed === 'function') {
        this.owner.onProjectileDestroyed();
      }
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.frame++;

    // Energy trail
    if (this.active && this.frame % 2 === 0) {
      const glow = this.getGlow();
      vfx.motes(this.x + this.width / 2 - Math.sign(this.vx) * 10, this.y + this.height / 2 - 6, 8, 12, { color: glow, count: 2, rise: 0.4, size: 2.2 });
    }

    // Despawn if out of stage bounds
    if (this.x < -100 || this.x > 1100 || this.y > 400) {
      this.destroy();
    }
  }

  getGlow() {
    if (this._glow) return this._glow;
    const o = this.owner;
    const d = o && FIGHTER_DESIGNS[o.id];
    const byType = { hadouken: '#38bdf8', sonic_blade: '#facc15', ki_kunai: '#22d3ee', god_palm: '#fbbf24' };
    this._glow = (d && d.glow) || byType[this.type] || this.color || '#38bdf8';
    return this._glow;
  }

  getHitbox() {
    return new Box(this.x, this.y, this.width, this.height);
  }

  render(ctx) {
    if (!this.active) return;
    const glow = this.getGlow();
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const dir = this.vx >= 0 ? 1 : -1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    if (this.type === 'sonic_blade') {
      // Spinning razor crescent
      ctx.translate(cx, cy);
      ctx.rotate(this.frame * 0.45 * dir);
      for (let i = 0; i < 2; i++) {
        ctx.rotate(Math.PI);
        ctx.strokeStyle = glow;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, 14, -0.2, 1.6);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0.1, 1.3);
        ctx.stroke();
      }
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
      g.addColorStop(0, 'rgba(255,255,255,0.9)');
      g.addColorStop(0.4, hexA(glow, 0.5));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
    } else if (this.type === 'ki_kunai') {
      // Twin glowing kunai with streaks
      for (let k = 0; k < 2; k++) {
        const ky = this.y + 2 + k * 8;
        const tail = ctx.createLinearGradient(this.x - dir * 26, 0, this.x + this.width / 2, 0);
        tail.addColorStop(0, 'rgba(0,0,0,0)');
        tail.addColorStop(1, hexA(glow, 0.8));
        ctx.fillStyle = tail;
        ctx.fillRect(Math.min(this.x - dir * 26, this.x), ky, 30, 3);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        const tipX = cx + dir * 10;
        ctx.moveTo(tipX, ky + 1.5);
        ctx.lineTo(tipX - dir * 10, ky - 1.5);
        ctx.lineTo(tipX - dir * 10, ky + 4.5);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // Energy orb (hadouken / god palm / generic)
      const big = this.type === 'god_palm' ? 1.5 : 1;
      const pulse = Math.sin(this.frame * 0.5) * 2;
      // Comet tail
      for (let i = 1; i <= 5; i++) {
        ctx.globalAlpha = 0.22 * (1 - i / 6);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx - dir * i * 7, cy + Math.sin(this.frame * 0.6 + i) * 1.5, (13 - i * 1.4) * big, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      const r = (17 + pulse) * big;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.3, '#ffffff');
      g.addColorStop(0.55, hexA(glow, 0.9));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      // Swirl
      ctx.strokeStyle = hexA('#ffffff', 0.6);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 9 * big, this.frame * 0.4, this.frame * 0.4 + 2.2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

function hexA(hex, a) {
  if (!hex || hex[0] !== '#') return hex;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
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

  destroy() {
    this.active = false;
    this.isAirborne = false;
    this.vx = 0;
    this.vy = 0;
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
