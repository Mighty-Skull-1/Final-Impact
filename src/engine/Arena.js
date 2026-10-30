// Final Impact - Buildable arena
// Objects that fighters create mid-match and that change the stage for BOTH players:
//   wall     — rises from the floor; blocks movement and projectiles, can be stood on, shatters
//   platform — one-way floating scaffold; land on it from above, hold DOWN to drop through
//   slab     — ATLAS's ultimate: a ceiling slab that tracks a target, then crashes down
// Everything here is frame-driven (no timers), so it behaves the same offline and online.
import { GROUND_Y, FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE } from './Constants.js';
import { vfx } from '../graphics/VFX.js';
import { soundFX } from '../audio/SoundFX.js';

const STAGE_LEFT = 30;
const STAGE_RIGHT = 960 - 110; // max fighter.x

const WALL_W = 22;
const WALL_H = 74;
const WALL_LIFE = 420;
const PLATFORM_W = 112;
const PLATFORM_H = 8;
const PLATFORM_LIFE = 540;

const fighterLeft = f => f.x + 28;
const fighterRight = f => f.x + 52;

class ArenaManager {
  constructor() {
    this.objects = [];
    this.game = null;
    this.frame = 0;
  }

  clear() {
    this.objects = [];
  }

  get walls() { return this.objects.filter(o => o.kind === 'wall' && !o.dead); }
  get platforms() { return this.objects.filter(o => o.kind === 'platform' && !o.dead); }

  // ---------- builders ----------
  addWall(owner, x) {
    // One wall per owner: building a new one crumbles the old one
    this.objects.filter(o => o.kind === 'wall' && o.owner === owner).forEach(o => this.shatter(o, false));
    const wx = Math.max(STAGE_LEFT + 10, Math.min(STAGE_RIGHT + 60, x));
    const wall = { kind: 'wall', owner, x: wx, w: WALL_W, h: WALL_H, rise: 0, hp: 3, life: WALL_LIFE, age: 0, hitIds: new Set() };
    this.objects.push(wall);
    vfx.dust(wx + WALL_W / 2, GROUND_Y, { amount: 12, scale: 1.4 });
    vfx.shockwave(wx + WALL_W / 2, GROUND_Y, { color: '#f59e0b', size: 1.1 });
    try { soundFX.playWallRise(); } catch (e) {}
    return wall;
  }

  addPlatform(owner, cx, top) {
    const mine = this.objects.filter(o => o.kind === 'platform' && o.owner === owner);
    if (mine.length >= 2) this.remove(mine[0]);
    const x = Math.max(STAGE_LEFT, Math.min(STAGE_RIGHT + 80 - PLATFORM_W, cx - PLATFORM_W / 2));
    const p = { kind: 'platform', owner, x, top, w: PLATFORM_W, life: PLATFORM_LIFE, age: 0, build: 0 };
    this.objects.push(p);
    vfx.burst(x + PLATFORM_W / 2, top, { color: '#fbbf24', count: 14, speed: 4 });
    try { soundFX.playWallRise(); } catch (e) {}
    return p;
  }

  addSlab(owner, target) {
    const s = { kind: 'slab', owner, target, x: target ? target.x + 40 - 90 : 400, y: -60, w: 180, h: 30, t: 0, state: 'track', hitIds: new Set() };
    this.objects.push(s);
    return s;
  }

  remove(o) {
    o.dead = true;
  }

  shatter(o, big = true) {
    if (o.dead) return;
    o.dead = true;
    const top = GROUND_Y - o.h * Math.min(1, o.rise || 1);
    const cx = o.x + o.w / 2;
    vfx.burst(cx, top + o.h / 2, { color: '#a8a29e', count: big ? 26 : 12, speed: big ? 7 : 4, life: 26 });
    vfx.dust(cx, GROUND_Y, { amount: big ? 14 : 6, scale: 1.3 });
    try { soundFX.playNoiseCrack(0.25, 600, big ? 0.5 : 0.3); } catch (e) {}
  }

  // ---------- queries used by Fighter physics ----------
  wallTop(w) { return GROUND_Y - w.h * Math.min(1, w.rise); }

  // Surfaces a falling fighter can land on: platform tops and wall tops
  surfaces(f) {
    const out = [];
    for (const o of this.objects) {
      if (o.dead) continue;
      if (o.kind === 'platform' && o.build >= 1) out.push({ top: o.top, x: o.x, w: o.w, oneWay: true });
      else if (o.kind === 'wall' && o.rise >= 1) out.push({ top: this.wallTop(o), x: o.x - 6, w: o.w + 12, oneWay: false });
    }
    return out;
  }

  overlapsX(f, s) {
    return fighterRight(f) > s.x && fighterLeft(f) < s.x + s.w;
  }

  // The floor height for a fighter that moved from prevY to f.y this frame (falling)
  floorFor(f, prevY) {
    let floor = GROUND_Y;
    if (f.vy < 0 || f.dropThrough > 0) return floor;
    for (const s of this.surfaces(f)) {
      if (!this.overlapsX(f, s)) continue;
      if (prevY <= s.top + 0.5 && f.y >= s.top && s.top < floor) floor = s.top;
    }
    return floor;
  }

  // Is a grounded fighter at height f.y still standing on something?
  supports(f) {
    if (f.y >= GROUND_Y - 0.5) return true;
    if (f.dropThrough > 0) return false;
    return this.surfaces(f).some(s => this.overlapsX(f, s) && Math.abs(s.top - f.y) < 1.5);
  }

  // Walls are solid: push fighters out sideways unless they're standing on top
  resolveWalls(f) {
    for (const w of this.objects) {
      if (w.dead || w.kind !== 'wall' || w.rise < 0.35) continue;
      const top = this.wallTop(w);
      if (f.y <= top + 1) continue; // above it / standing on it
      const l = fighterLeft(f), r = fighterRight(f);
      if (r <= w.x || l >= w.x + w.w) continue;
      const wc = w.x + w.w / 2;
      const fc = f.x + 40;
      if (fc < wc) f.x = w.x - 52;
      else f.x = w.x + w.w - 28;
      f.x = Math.max(STAGE_LEFT, Math.min(STAGE_RIGHT, f.x));
      if (Math.abs(f.vx) > 7 && (f.state === FIGHTER_STATE.KNOCKDOWN || f.hitStun > 0)) {
        // Slammed into a wall at speed: it gives way
        w.hp = 0;
        this.shatter(w, true);
      }
    }
  }

  // Wall the fighter is pinned against (for wall-splat checks), within `reach` px in direction dir
  wallBehind(f, dir, reach = 90) {
    for (const w of this.walls) {
      if (w.rise < 0.6) continue;
      const edge = dir > 0 ? w.x : w.x + w.w;
      const side = dir > 0 ? fighterRight(f) : fighterLeft(f);
      const gap = (edge - side) * dir;
      if (gap >= -6 && gap <= reach && f.y > this.wallTop(w)) return w;
    }
    return null;
  }

  // Projectiles (except the wall owner's own) break on walls
  blockProjectile(p) {
    // Remember where the shot came from, so one fired point-blank through a wall is still stopped
    if (p._ox === undefined) p._ox = p.owner ? p.owner.x + 40 : p.x + p.width / 2;
    const left = Math.min(p._ox, p.x), right = Math.max(p._ox, p.x + p.width);
    for (const w of this.walls) {
      if (w.rise < 0.5 || p.owner === w.owner) continue;
      const top = this.wallTop(w);
      if (right > w.x && left < w.x + w.w && p.y + p.height > top && p.y < GROUND_Y) {
        w.hp--;
        vfx.hitSpark(w.x + w.w / 2, p.y + p.height / 2, { dir: p.vx > 0 ? -1 : 1, heavy: true, color: '#fbbf24' });
        if (w.hp <= 0) this.shatter(w, true);
        return true;
      }
    }
    return false;
  }

  // ---------- per frame ----------
  update() {
    this.frame++;
    const g = this.game;
    for (const o of this.objects) {
      if (o.dead) continue;
      o.age = (o.age || 0) + 1;
      if (o.kind === 'wall') {
        if (o.rise < 1) {
          o.rise = Math.min(1, o.rise + 0.16);
          // The rising wall launches anyone standing on its spot
          for (const f of (g && g.allFighters) || []) {
            if (!f || f.isDead || f === o.owner || f.team === (o.owner && o.owner.team) || o.hitIds.has(f)) continue;
            if (fighterRight(f) > o.x && fighterLeft(f) < o.x + o.w && f.isGrounded) {
              o.hitIds.add(f);
              this.hit(o.owner, f, { damage: 70, hitStun: 26, blockStun: 12, pushback: 6, height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.KNOCKDOWN, chipDamage: 8 }, { x: o.x + o.w / 2, y: GROUND_Y - 20 });
            }
          }
        }
        o.life--;
        if (o.life <= 0) this.shatter(o, false);
      } else if (o.kind === 'platform') {
        if (o.build < 1) o.build = Math.min(1, o.build + 0.12);
        o.life--;
        if (o.life <= 0) { o.dead = true; vfx.burst(o.x + o.w / 2, o.top, { color: '#a8a29e', count: 10, speed: 3 }); }
      } else if (o.kind === 'slab') {
        this.updateSlab(o);
      }
    }
    // Fighters standing on a vanished surface fall
    if (g && g.allFighters) {
      for (const f of g.allFighters) {
        if (!f) continue;
        if (f.dropThrough > 0) f.dropThrough--;
      }
    }
    if (this.objects.some(o => o.dead)) this.objects = this.objects.filter(o => !o.dead);
  }

  updateSlab(s) {
    s.t++;
    const tgt = s.target;
    if (s.state === 'track') {
      // Hovers above the target, following them, while the shadow warns everyone
      if (tgt && !tgt.isDead) s.x += ((tgt.x + 40 - s.w / 2) - s.x) * 0.12;
      s.y = Math.min(108, s.y + 6);
      if (s.t % 8 === 0) vfx.motes(s.x, s.y + s.h, s.w, 10, { color: '#f59e0b', count: 3, rise: -1.5, size: 2 });
      if (s.t >= 46) { s.state = 'fall'; s.vy = 4; }
    } else if (s.state === 'fall') {
      s.vy += 1.6;
      s.y += s.vy;
      const bottom = s.y + s.h;
      for (const f of (this.game && this.game.allFighters) || []) {
        if (!f || f.isDead || f.team === (s.owner && s.owner.team) || s.hitIds.has(f)) continue;
        const fl = fighterLeft(f) - 10, fr = fighterRight(f) + 10;
        if (fr > s.x && fl < s.x + s.w && bottom >= f.y - 86) {
          s.hitIds.add(f);
          const res = this.hit(s.owner, f, {
            damage: 270, hitStun: 40, blockStun: 22, pushback: 3, height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.KNOCKDOWN, chipDamage: 70, isUltimate: true, ultimateFinisher: true
          }, { x: f.x + 40, y: f.y - 70 });
          if (res && res !== 'blocked' && this.game && this.game.combat) this.game.combat.notifyTraining('ultimateLock', s.owner);
        }
      }
      if (bottom >= GROUND_Y) {
        s.dead = true;
        const cx = s.x + s.w / 2;
        vfx.flashScreen('#ffffff', 0.5, 0.06);
        vfx.shockwave(cx, GROUND_Y, { color: '#f59e0b', size: 2.6 });
        vfx.shockwave(cx, GROUND_Y, { color: '#ffffff', size: 1.6 });
        vfx.dust(cx, GROUND_Y, { amount: 26, scale: 2 });
        vfx.burst(cx, GROUND_Y - 10, { color: '#a8a29e', count: 36, speed: 9, life: 32, size: 3.5 });
        try { soundFX.playSlabCrash(); } catch (e) { try { soundFX.playUltimateFinisher(); } catch (e2) {} }
        const g = this.game;
        if (g && g.hud && g.hud.triggerShake) g.hud.triggerShake(16 * (g.combat ? g.combat.shakeMult() : 1));
        if (g && g.triggerCameraZoom) g.triggerCameraZoom(1.12, 40);
      }
    }
  }

  hit(owner, target, data, pos) {
    const g = this.game;
    if (g && g.combat && owner) return g.combat.applyHit(owner, target, data, pos, { projectile: true });
    return target.takeHit(data, 1);
  }

  // ---------- drawing (world space, before fighters) ----------
  render(ctx) {
    for (const o of this.objects) {
      if (o.dead) continue;
      if (o.kind === 'wall') this.renderWall(ctx, o);
      else if (o.kind === 'platform') this.renderPlatform(ctx, o);
    }
  }

  // Slabs draw after fighters so they fall in front of them
  renderOverlay(ctx) {
    for (const o of this.objects) {
      if (!o.dead && o.kind === 'slab') this.renderSlab(ctx, o);
    }
  }

  renderWall(ctx, w) {
    const h = w.h * Math.min(1, w.rise);
    const top = GROUND_Y - h;
    const fading = w.life < 60 && Math.floor(w.life / 4) % 2 === 0;
    ctx.save();
    ctx.globalAlpha = fading ? 0.55 : 1;
    // body: stacked concrete blocks
    ctx.fillStyle = '#57534e';
    ctx.fillRect(w.x, top, w.w, h);
    ctx.fillStyle = '#78716c';
    for (let y = top; y < GROUND_Y - 2; y += 12) {
      const off = (Math.floor((y - top) / 12) % 2) * 6;
      ctx.fillRect(w.x + 1 + off, y + 1, w.w - 8, 9);
    }
    // hazard stripe cap
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(w.x - 2, top, w.w + 4, 5);
    ctx.fillStyle = '#1c1917';
    for (let i = 0; i < w.w + 4; i += 6) ctx.fillRect(w.x - 2 + i, top, 3, 5);
    // cracks per lost hp
    ctx.strokeStyle = 'rgba(20,16,12,0.9)';
    ctx.lineWidth = 1;
    for (let k = 0; k < 3 - w.hp; k++) {
      ctx.beginPath();
      ctx.moveTo(w.x + 4 + k * 5, top + 8 + k * 14);
      ctx.lineTo(w.x + 12 + k * 3, top + 20 + k * 14);
      ctx.lineTo(w.x + 7 + k * 4, top + 30 + k * 14);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(w.x + w.w - 4, top + 5, 4, h - 5);
    ctx.restore();
  }

  renderPlatform(ctx, p) {
    const fading = p.life < 70 && Math.floor(p.life / 4) % 2 === 0;
    const wFull = p.w * p.build;
    const x = p.x + (p.w - wFull) / 2;
    ctx.save();
    ctx.globalAlpha = fading ? 0.5 : 1;
    // support struts down to the floor
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
    ctx.lineWidth = 2;
    for (const sx of [x + 8, x + wFull - 8]) {
      ctx.beginPath(); ctx.moveTo(sx, p.top + PLATFORM_H); ctx.lineTo(sx, GROUND_Y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.beginPath(); ctx.moveTo(x + 8, p.top + PLATFORM_H); ctx.lineTo(x + wFull - 8, GROUND_Y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + wFull - 8, p.top + PLATFORM_H); ctx.lineTo(x + 8, GROUND_Y); ctx.stroke();
    // deck
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x, p.top, wFull, PLATFORM_H);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x, p.top, wFull, 3);
    ctx.fillStyle = '#451a03';
    for (let i = 10; i < wFull; i += 14) ctx.fillRect(x + i, p.top + 3, 1, PLATFORM_H - 3);
    ctx.restore();
  }

  renderSlab(ctx, s) {
    ctx.save();
    // Warning shadow on the floor
    const k = Math.min(1, s.t / 30);
    ctx.fillStyle = `rgba(0,0,0,${0.25 + 0.35 * k})`;
    ctx.beginPath();
    ctx.ellipse(s.x + s.w / 2, GROUND_Y + 1, s.w / 2 * (0.6 + 0.4 * k), 7, 0, 0, Math.PI * 2);
    ctx.fill();
    if (s.state === 'track' && Math.floor(s.t / 5) % 2 === 0) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(s.x, GROUND_Y - 96, s.w, 96);
      ctx.setLineDash([]);
    }
    // The slab itself
    ctx.fillStyle = '#44403c';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.fillStyle = '#78716c';
    ctx.fillRect(s.x + 3, s.y + 3, s.w - 6, 8);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(s.x, s.y + s.h - 5, s.w, 5);
    ctx.fillStyle = '#1c1917';
    for (let i = 0; i < s.w; i += 10) ctx.fillRect(s.x + i, s.y + s.h - 5, 5, 5);
    // rebar
    ctx.strokeStyle = '#a8a29e';
    ctx.lineWidth = 2;
    for (let i = 20; i < s.w; i += 40) {
      ctx.beginPath(); ctx.moveTo(s.x + i, s.y); ctx.lineTo(s.x + i - 4, s.y - 8); ctx.stroke();
    }
    ctx.restore();
  }
}

export const arena = new ArenaManager();
