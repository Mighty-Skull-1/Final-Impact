// Final Impact - World-space visual effects (hit sparks, shockwaves, dust, slashes, popups)
// Everything here is drawn inside the camera transform, so positions are stage coordinates.

const TAU = Math.PI * 2;

function rand(a, b) { return a + Math.random() * (b - a); }

export class VFXSystem {
  constructor() {
    this.items = [];
    this.screenFlash = null; // { color, alpha, decay }
    this.maxItems = 420;
  }

  clear() {
    this.items = [];
    this.screenFlash = null;
  }

  push(item) {
    if (this.items.length >= this.maxItems) this.items.shift();
    item.t = 0;
    this.items.push(item);
    return item;
  }

  // ---------- Emitters ----------

  // Main impact spark. dir = +1 (to the right) / -1. heavy = bigger.
  hitSpark(x, y, { dir = 1, heavy = false, color = '#ffd34d', core = '#ffffff', counter = false } = {}) {
    const size = heavy ? 1.6 : 1.0;
    // Bright core flash
    this.push({ kind: 'flash', x, y, r: 16 * size, life: heavy ? 9 : 6, color: core, glow: color });
    // Radial streaks biased in hit direction
    const n = heavy ? 14 : 9;
    for (let i = 0; i < n; i++) {
      const spread = heavy ? 1.6 : 1.2;
      const a = (dir > 0 ? 0 : Math.PI) + rand(-spread, spread);
      const sp = rand(3.5, heavy ? 9 : 6.5);
      this.push({
        kind: 'streak', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.6,
        len: rand(6, 14) * size, life: rand(8, 14) | 0, color: Math.random() < 0.35 ? core : color, w: heavy ? 2.2 : 1.6, drag: 0.86, grav: 0.12
      });
    }
    // Impact ring
    this.push({ kind: 'ring', x, y, r: 6, vr: heavy ? 3.4 : 2.4, life: heavy ? 12 : 9, color, w: heavy ? 3 : 2 });
    if (heavy) {
      // Directional shock slash ("cross" star)
      this.push({ kind: 'star', x, y, r: 28, life: 8, color: core, rot: rand(0, Math.PI) });
    }
    if (counter) {
      this.push({ kind: 'ring', x, y, r: 10, vr: 5, life: 14, color: '#ff3b3b', w: 3 });
    }
  }

  blockSpark(x, y, { dir = 1 } = {}) {
    // Shield arc facing the attacker
    const face = dir > 0 ? Math.PI : 0;
    this.push({ kind: 'arc', x, y, r: 16, vr: 1.2, a0: face - 1.1, a1: face + 1.1, life: 10, color: '#7dd3fc', w: 3 });
    for (let i = 0; i < 6; i++) {
      const a = face + rand(-1.0, 1.0);
      const sp = rand(2, 4.5);
      this.push({ kind: 'streak', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, len: rand(4, 8), life: 9, color: i % 2 ? '#e0f2fe' : '#38bdf8', w: 1.4, drag: 0.85, grav: 0 });
    }
  }

  dust(x, y, { dir = 0, amount = 6, scale = 1 } = {}) {
    for (let i = 0; i < amount; i++) {
      const vx = dir === 0 ? rand(-1.6, 1.6) : -dir * rand(0.4, 2.2);
      this.push({ kind: 'smoke', x: x + rand(-8, 8), y: y - rand(0, 4), vx, vy: rand(-0.9, -0.2), r: rand(3, 6) * scale, vr: 0.35 * scale, life: rand(18, 28) | 0, color: 'rgba(210, 196, 180, ALPHA)' });
    }
  }

  shockwave(x, y, { color = '#ffffff', size = 1, ground = true } = {}) {
    if (ground) {
      this.push({ kind: 'ellipse', x, y, rx: 10, ry: 3, vr: 5 * size, life: 18, color, w: 3 });
    } else {
      this.push({ kind: 'ring', x, y, r: 10, vr: 5 * size, life: 16, color, w: 4 });
    }
  }

  burst(x, y, { color = '#ffd34d', count = 16, speed = 5, life = 22, size = 2.5, grav = 0.08 } = {}) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, TAU);
      const sp = rand(speed * 0.4, speed);
      this.push({ kind: 'dot', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rand(size * 0.5, size), life: rand(life * 0.6, life) | 0, color, drag: 0.92, grav });
    }
  }

  // Glowing ember/energy motes drifting up from an area (used for auras and charging)
  motes(x, y, w, h, { color = '#ffd34d', count = 3, rise = 1.6, size = 2.2 } = {}) {
    for (let i = 0; i < count; i++) {
      this.push({ kind: 'dot', x: x + rand(0, w), y: y + rand(0, h), vx: rand(-0.4, 0.4), vy: -rand(rise * 0.5, rise), r: rand(size * 0.5, size), life: rand(14, 26) | 0, color, drag: 0.98, grav: 0, glow: true });
    }
  }

  // Swooshing slash arc around (x, y)
  slash(x, y, { r = 34, dir = 1, color = '#ffffff', a0 = -1.2, a1 = 1.0, life = 9, w = 5 } = {}) {
    const flip = dir < 0;
    const s = flip ? Math.PI - a1 : a0;
    const e = flip ? Math.PI - a0 : a1;
    this.push({ kind: 'slash', x, y, r, a0: s, a1: e, life, color, w, ccw: false });
  }

  // Vertical light pillar (uppercuts, ultimates, fatalities)
  pillar(x, y, { color = '#ffd34d', w = 30, h = 160, life = 22 } = {}) {
    this.push({ kind: 'pillar', x, y, w, h, life, color });
  }

  // Horizontal speed streaks behind a dashing body
  speedLines(x, y, { dir = 1, color = 'rgba(255,255,255,ALPHA)', count = 4 } = {}) {
    for (let i = 0; i < count; i++) {
      this.push({ kind: 'line', x: x + rand(-6, 6), y: y + rand(-38, 0), vx: -dir * rand(3, 6), len: rand(14, 30), life: rand(6, 11) | 0, color });
    }
  }

  popup(x, y, text, { color = '#ffffff', size = 12, life = 40, rise = 0.45 } = {}) {
    this.push({ kind: 'text', x, y, text, color, size, life, rise });
  }

  flashScreen(color = '#ffffff', alpha = 0.6, decay = 0.08) {
    this.screenFlash = { color, alpha, decay };
  }

  // ---------- Simulation ----------

  update() {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      p.t++;
      if (p.vx !== undefined) {
        p.x += p.vx;
        p.y += p.vy || 0;
        if (p.drag) { p.vx *= p.drag; if (p.vy !== undefined) p.vy *= p.drag; }
        if (p.grav) p.vy += p.grav;
      }
      if (p.vr) {
        if (p.r !== undefined) p.r += p.vr;
        if (p.rx !== undefined) { p.rx += p.vr * 1.6; p.ry += p.vr * 0.35; }
      }
      if (p.t >= p.life) this.items.splice(i, 1);
    }
    if (this.screenFlash) {
      this.screenFlash.alpha -= this.screenFlash.decay;
      if (this.screenFlash.alpha <= 0) this.screenFlash = null;
    }
  }

  render(ctx) {
    if (this.items.length === 0) return;
    ctx.save();
    for (const p of this.items) {
      const k = 1 - p.t / p.life; // remaining life 1 → 0
      switch (p.kind) {
        case 'flash': {
          ctx.globalCompositeOperation = 'lighter';
          const r = p.r * (0.6 + (1 - k) * 0.8);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
          g.addColorStop(0, p.color);
          g.addColorStop(0.35, p.glow);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalAlpha = k;
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
          break;
        }
        case 'streak': {
          ctx.globalCompositeOperation = 'lighter';
          const sp = Math.hypot(p.vx, p.vy) || 1;
          const len = p.len * Math.min(1.4, sp / 3);
          ctx.globalAlpha = Math.min(1, k * 1.4);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.w * (0.5 + k * 0.5);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - (p.vx / sp) * len, p.y - (p.vy / sp) * len);
          ctx.stroke();
          break;
        }
        case 'ring': {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = k;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.w * k + 0.5;
          ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.1, p.r), 0, TAU); ctx.stroke();
          break;
        }
        case 'ellipse': {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = k * 0.9;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.w * k + 0.5;
          ctx.beginPath(); ctx.ellipse(p.x, p.y, Math.max(0.1, p.rx), Math.max(0.1, p.ry), 0, 0, TAU); ctx.stroke();
          break;
        }
        case 'arc': {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = k;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.w * k + 0.5;
          ctx.lineCap = 'round';
          ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.1, p.r), p.a0, p.a1); ctx.stroke();
          break;
        }
        case 'star': {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = k;
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          const r = p.r * (0.5 + (1 - k) * 0.7);
          for (let j = 0; j < 2; j++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(-r, 0); ctx.lineTo(0, -2.2 * k); ctx.lineTo(r, 0); ctx.lineTo(0, 2.2 * k);
            ctx.closePath(); ctx.fill();
          }
          ctx.restore();
          break;
        }
        case 'dot': {
          ctx.globalCompositeOperation = p.glow ? 'lighter' : 'source-over';
          ctx.globalAlpha = Math.min(1, k * 1.5);
          ctx.fillStyle = p.color;
          const r = Math.max(0.4, p.r * (0.4 + k * 0.6));
          ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
          break;
        }
        case 'smoke': {
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = p.color.replace('ALPHA', (0.45 * k).toFixed(3));
          ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.1, p.r), 0, TAU); ctx.fill();
          break;
        }
        case 'slash': {
          ctx.globalCompositeOperation = 'lighter';
          const prog = 1 - k;
          const sweep = p.a0 + (p.a1 - p.a0) * Math.min(1, prog * 2.2);
          ctx.globalAlpha = Math.min(1, k * 1.6);
          ctx.strokeStyle = p.color;
          ctx.lineCap = 'round';
          for (let j = 0; j < 3; j++) {
            ctx.lineWidth = p.w * (1 - j * 0.3) * k + 0.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r - j * 3, p.a0 + (sweep - p.a0) * (j * 0.15), sweep);
            ctx.stroke();
          }
          break;
        }
        case 'pillar': {
          ctx.globalCompositeOperation = 'lighter';
          const prog = p.t / p.life;
          const wNow = p.w * (prog < 0.2 ? prog / 0.2 : 1) * (1 - Math.max(0, prog - 0.6) / 0.4);
          const g = ctx.createLinearGradient(p.x - wNow / 2, 0, p.x + wNow / 2, 0);
          g.addColorStop(0, 'rgba(0,0,0,0)');
          g.addColorStop(0.5, p.color);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = g;
          ctx.fillRect(p.x - wNow / 2, p.y - p.h, wNow, p.h);
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillRect(p.x - wNow * 0.08, p.y - p.h, wNow * 0.16, p.h);
          break;
        }
        case 'line': {
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = p.color.replace('ALPHA', (0.7 * k).toFixed(3));
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - Math.sign(p.vx) * p.len, p.y);
          ctx.stroke();
          break;
        }
        case 'text': {
          ctx.globalCompositeOperation = 'source-over';
          const pop = p.t < 6 ? 1 + (6 - p.t) * 0.08 : 1;
          ctx.globalAlpha = Math.min(1, k * 2.5);
          ctx.font = `italic 900 ${Math.round(p.size * pop)}px "Bahnschrift", "Inter Display", "Arial Narrow", sans-serif`;
          ctx.textAlign = 'center';
          ctx.lineJoin = 'round';
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = 'rgba(0,0,0,0.9)';
          const yy = p.y - p.t * p.rise;
          ctx.strokeText(p.text, p.x, yy);
          ctx.fillStyle = p.color;
          ctx.fillText(p.text, p.x, yy);
          break;
        }
        default:
          break;
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }

  // Full-screen flash (call in screen space, after the world)
  renderScreen(ctx, W, H) {
    if (!this.screenFlash) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.screenFlash.alpha));
    ctx.fillStyle = this.screenFlash.color;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

export const vfx = new VFXSystem();
