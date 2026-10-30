// Final Impact - Signature fighters
// Four fighters built around mechanics that don't exist anywhere else on the roster:
//   ECHO   — fights alongside a ghost of her own past (it replays her last 2 seconds),
//            and her ultimate rewinds time and replays every hit she landed at once.
//   GLITCH — steals the opponent's last special and uses it against them; his ultimate
//            scrambles the victim's controls.
//   TEMPO  — fights to a beat. Moves started on the beat build a multiplier (x1 → x4).
//   ATLAS  — builds walls and platforms that change the arena for both players, and
//            drops a ceiling slab as his ultimate.
// Normals, dashes, jumps and the dirty tactic come from the core (Kazuki) move-set; the
// specials and ultimates below replace his.
import { Kazuki } from './Kazuki.js';
import { Fighter } from './Fighter.js';
import { spriteGenerator } from '../graphics/SpriteGenerator.js';
import { Projectile } from '../engine/Projectiles.js';
import { Box } from '../engine/Hitbox.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE, GROUND_Y } from '../engine/Constants.js';
import { soundFX } from '../audio/SoundFX.js';
import { vfx } from '../graphics/VFX.js';
import { arena } from '../engine/Arena.js';
import { getFighterCatalogEntry } from './FighterCatalog.js';

const S = FIGHTER_STATE;
const SPECIALS = [S.SPECIAL_1, S.SPECIAL_2, S.SPECIAL_3];
const play = (name, ...args) => { try { if (soundFX[name]) soundFX[name](...args); } catch (e) {} };

// ===========================================================================
// Shared base
// ===========================================================================
class SignatureFighter extends Kazuki {
  constructor(options, id, name, tune = {}) {
    super(options);
    this.id = id;
    this.name = name;
    this.skinId = options.skinId || null;
    this.sprites = spriteGenerator.generateFighterSprites(id, this.skinId);
    this.maxHealth = Math.round(1000 * (tune.hp || 1));
    this.health = this.maxHealth;
    if (tune.walk) this.walkSpeed *= tune.walk;
    if (tune.dash) this.dashSpeed *= tune.dash;
    if (tune.jump) this.jumpForce *= tune.jump;
    this.baseDamage = tune.damage || 1;
    this.damageMult = this.baseDamage;
    this.ultimateStyle = null; // custom ultimate unless a subclass opts into the cinematic one
    this.baseReach = 0;
    this.reachBonus = 0;
  }

  // Kazuki's input layer routes SP1 / SP2 / SP3 here
  startHadouken() { this.special1(); }
  startShoryuken() { this.special2(); }
  startTatsumaki() { this.special3(); }
  special1() {}
  special2() {}
  special3() {}

  updateState(opponent) {
    if (opponent) this._lastOpponent = opponent;
    switch (this.state) {
      case S.SPECIAL_1: this.animTimer++; this.tickSpecial1(opponent); return;
      case S.SPECIAL_2: this.animTimer++; this.tickSpecial2(opponent); return;
      case S.SPECIAL_3: this.animTimer++; this.tickSpecial3(opponent); return;
      case S.ULTIMATE:
        if (!this.ultimateStyle) { this.animTimer++; this.tickUltimate(opponent); return; }
        break;
      default: break;
    }
    super.updateState(opponent);
  }
  tickSpecial1() { this.changeState(S.IDLE); }
  tickSpecial2() { this.changeState(S.IDLE); }
  tickSpecial3() { this.changeState(S.IDLE); }
  tickUltimate() { this.changeState(S.IDLE); }

  announce(name, kanji, subtitle) {
    try {
      window.dispatchEvent(new CustomEvent('ultimate-activated', { detail: { fighter: this, name, kanji, subtitle } }));
    } catch (e) {}
  }

  // Hit that goes through the combat director without the melee side effects (pushback, counters)
  scriptedHit(target, data, pos) {
    const p = pos || { x: target.x + 40, y: target.y - 50 };
    if (typeof this.combatHitOpts === 'function') return this.combatHitOpts(target, data, p, { projectile: true });
    if (typeof this.combatHit === 'function') return this.combatHit(target, data, p);
    return target.takeHit(data, this.facingRight ? 1 : -1);
  }

  fire(proj, cooldown = 20) {
    if (!this.spawnProjectile) return false;
    this.onFireProjectile(8, cooldown);
    this.spawnProjectile(proj);
    return true;
  }

  get dir() { return this.facingRight ? 1 : -1; }
  get cx() { return this.x + 40; }

  popup(text, color, size = 10, dy = 0) {
    vfx.popup(this.cx, this.y - 104 + dy, text, { color, size, life: 40 });
  }
}

// ===========================================================================
// ECHO — The Afterimage
// ===========================================================================
const ECHO_HISTORY = 200;
const ECHO_GHOST_FRAMES = 120;
const ECHO_COOLDOWN = 300;
const ECHO_REWIND = 180;

export class Echo extends SignatureFighter {
  constructor(options) {
    super(options, 'echo', 'ECHO', { hp: 1.0, walk: 1.1, dash: 1.12, damage: 1.06 });
    this.history = [];
    this.ghost = null;
    this.echoCd = 0;
    this.clock = 0;
    this.dealtLog = [];
    this.pendingEchoes = [];
    this._atkSerial = 0;
  }

  ensureEcho() {
    if (!this.history) this.history = [];
    if (!this.dealtLog) this.dealtLog = [];
    if (!this.pendingEchoes) this.pendingEchoes = [];
    if (this.clock === undefined) this.clock = 0;
    if (this.echoCd === undefined) this.echoCd = 0;
  }

  changeState(newState, force) {
    if (newState !== this.state || force) this._atkSerial = (this._atkSerial || 0) + 1;
    return super.changeState(newState, force);
  }

  update(opponent, stageWidth) {
    this.ensureEcho();
    super.update(opponent, stageWidth);
    if (this.hitStop > 0) return;
    this.clock++;
    if (this.echoCd > 0) this.echoCd--;
    this.recordFrame();
    this.updateGhost(opponent);
    this.updatePendingEchoes();
  }

  recordFrame() {
    if (this.state === S.ULTIMATE) return;
    const hb = this.activeHitbox && this.currentAttackData ? this.getGlobalHitbox() : null;
    const frames = this.sprites[this.state] || this.sprites.IDLE || [];
    this.history.push({
      x: this.x, y: this.y, facingRight: this.facingRight, state: this.state,
      img: (this.__animator && this.__animator.lastImg) || frames[Math.min(this.animFrame, frames.length - 1)],
      hb: hb ? { x: hb.x, y: hb.y, w: hb.w, h: hb.h, data: { ...this.currentAttackData } } : null,
      serial: this._atkSerial,
      health: this.health
    });
    if (this.history.length > ECHO_HISTORY) this.history.shift();
  }

  // SP1 — ECHO STEP: a ghost of her last 2 seconds steps out and replays them
  special1() {
    this.ensureEcho();
    if (this.echoCd > 0 || this.ghost || this.history.length < 20) {
      if (this.echoCd > 0) this.popup('RECHARGING', '#67e8f9', 8);
      return;
    }
    this.changeState(S.SPECIAL_1);
    this.ghost = { frames: this.history.slice(-ECHO_GHOST_FRAMES), i: 0, hit: new Set() };
    this.echoCd = ECHO_COOLDOWN;
    play('playEcho');
    const first = this.ghost.frames[0];
    vfx.push({ kind: 'ring', x: first.x + 40, y: first.y - 46, r: 8, vr: 3, life: 16, color: '#67e8f9', w: 3 });
    vfx.burst(this.cx, this.y - 50, { color: '#a5f3fc', count: 14, speed: 4 });
  }
  tickSpecial1() {
    this.animFrame = this.stateTimer < 6 ? 0 : (this.stateTimer < 12 ? 1 : 2);
    if (this.stateTimer >= 18) this.changeState(S.IDLE);
  }

  updateGhost(opponent) {
    const g = this.ghost;
    if (!g) return;
    const snap = g.frames[g.i];
    g.i++;
    if (!snap || g.i >= g.frames.length) { this.ghost = null; return; }
    if (g.i % 3 === 0) vfx.motes(snap.x + 22, snap.y - 80, 36, 70, { color: '#67e8f9', count: 1, rise: 0.6, size: 2 });
    if (!snap.hb || !opponent || opponent.isDead || opponent.isInvincible || g.hit.has(snap.serial)) return;
    const box = new Box(snap.hb.x, snap.hb.y, snap.hb.w, snap.hb.h);
    if (!opponent.getGlobalHurtboxes().some(h => box.intersects(h))) return;
    g.hit.add(snap.serial);
    const d = snap.hb.data;
    this.scriptedHit(opponent, {
      ...d, damage: Math.round((d.damage || 40) * 0.7), chipDamage: Math.round((d.chipDamage || 0) * 0.5), fromGhost: true
    }, { x: box.x + box.w / 2, y: box.y + box.h / 2 });
  }

  updatePendingEchoes() {
    for (let i = this.pendingEchoes.length - 1; i >= 0; i--) {
      const e = this.pendingEchoes[i];
      const t = e.target;
      e.t--;
      // A knocked-down foe gets the echo as they stand back up
      if (e.t <= 0 && t && t.isInvincible && !t.isDead && e.t > -120) continue;
      if (t && ((e.t === 10) || (e.t < 0 && t.state === S.KNOCKDOWN && t.knockdownTimer === 10))) {
        vfx.push({ kind: 'ring', x: t.x + 40, y: t.y - 50, r: 30, vr: -2.4, life: 10, color: '#67e8f9', w: 2 });
      }
      if (e.t <= 0) {
        this.pendingEchoes.splice(i, 1);
        if (!t || t.isDead || t.isInvincible) continue;
        this.scriptedHit(t, {
          damage: 65, hitStun: 18, blockStun: 0, pushback: 3, height: ATTACK_HEIGHT.UNBLOCKABLE,
          hitType: HIT_TYPE.LIGHT, fromEcho: true
        }, { x: t.x + 40, y: t.y - 50 });
        vfx.popup(t.x + 40, t.y - 96, 'DÉJÀ VU', { color: '#67e8f9', size: 10 });
        play('playEcho');
      }
    }
  }

  // SP2 — DÉJÀ VU: rising palm; the hit happens again a moment later
  special2() {
    this.changeState(S.SPECIAL_2);
    play('playShoryuken');
    this.isInvincible = true;
    this.isGrounded = false;
    this.vy = -10.5;
    this.vx = this.dir * 2.4;
  }
  tickSpecial2() {
    const t = this.stateTimer;
    if (t <= 2) this.animFrame = 0;
    else if (t <= 11) {
      this.animFrame = 1;
      this.activeHitbox = new Box(28, -14, 72, 62);
      this.currentAttackData = { damage: 95, hitStun: 30, blockStun: 16, pushback: 5, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.KNOCKDOWN, chipDamage: 12, echoMark: true };
    } else {
      this.animFrame = 2;
      this.activeHitbox = null;
      if (t > 40 && this.isGrounded) this.changeState(S.IDLE);
    }
    if (t >= 7) this.isInvincible = false;
  }

  // SP3 — PHASE SHIFT: slips through the opponent, then strikes from the other side
  special3() {
    this.changeState(S.SPECIAL_3);
    play('playShadowWarp');
    this.phaseDir = this.dir;
  }
  isProjectileInvulnerable() { return this.state === S.SPECIAL_3 && this.stateTimer <= 14; }
  getPushbox() {
    if (this.state === S.SPECIAL_3 && this.stateTimer <= 14) return new Box(this.x + 40, -9999, 0, 0);
    return super.getPushbox();
  }
  tickSpecial3(opponent) {
    const t = this.stateTimer;
    if (t <= 14) {
      this.isInvincible = t >= 2;
      this.animFrame = 0;
      this.vx = this.phaseDir * 9;
      if (t % 2 === 0) this.addAfterImage();
    } else if (t <= 20) {
      this.isInvincible = false;
      this.vx *= 0.5;
      if (t === 15 && opponent) this.facingRight = this.cx < opponent.x + 40;
      this.animFrame = 1;
      this.activeHitbox = new Box(36, 24, 60, 26);
      this.currentAttackData = { damage: 80, hitStun: 20, blockStun: 12, pushback: 5, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY };
    } else if (t <= 30) {
      this.animFrame = 2;
      this.activeHitbox = null;
    } else {
      this.changeState(S.IDLE);
    }
  }

  onSpecialHit(target, result, data) {
    this.ensureEcho();
    if (!target || result === 'blocked' || result === 'armored') return;
    if (data && !data.isUltimate) this.dealtLog.push({ f: this.clock, dmg: data.damage || 0 });
    if (this.dealtLog.length > 60) this.dealtLog.shift();
    if (data && data.echoMark) this.pendingEchoes.push({ t: 40, target });
  }

  // ULTIMATE — TIME COLLAPSE: rewind 3 seconds, then every hit from that window lands at once
  startUltimate(opponent) {
    this.ensureEcho();
    this.superMeter = 0;
    this.changeState(S.ULTIMATE);
    this.isInvincible = true;
    this.ultimateTarget = opponent;
    const hist = this.history.slice(-ECHO_REWIND);
    const since = this.clock - ECHO_REWIND;
    const dealtEntries = this.dealtLog.filter(e => e.f >= since);
    this.rewind = {
      path: hist,
      dealt: dealtEntries.reduce((n, e) => n + e.dmg, 0),
      hits: dealtEntries.length,
      startHealth: this.health,
      startX: this.cx,
      targetHealth: Math.min(this.maxHealth, Math.max(this.health, Math.min(hist.length ? hist[0].health : this.health, this.health + this.maxHealth * 0.35)))
    };
    this.ghost = null;
    play('playUltimateActivation');
    this.announce('TIME COLLAPSE', '時間崩壊', 'ECHO // REWIND THREE SECONDS');
  }
  tickUltimate(opponent) {
    const t = this.stateTimer;
    const r = this.rewind || { path: [], dealt: 0, hits: 0 };
    const target = opponent || this.ultimateTarget;
    this.isInvincible = true;
    this.vx = 0;
    if (t <= 26) {
      // Play her own history backwards
      const n = r.path.length;
      if (n) {
        const idx = Math.max(0, n - 1 - Math.floor((t / 26) * (n - 1)));
        const p = r.path[idx];
        this.x = p.x; this.y = Math.min(GROUND_Y, p.y); this.facingRight = p.facingRight;
      }
      this.isGrounded = this.y >= GROUND_Y - 0.5;
      this.animFrame = 0;
      this.health = Math.round(r.startHealth + (r.targetHealth - r.startHealth) * Math.min(1, t / 26));
      if (t % 2 === 0) this.addAfterImage();
      if (t % 3 === 0) vfx.push({ kind: 'line', x: this.cx + (Math.random() - 0.5) * 60, y: this.y - Math.random() * 90, vx: -this.dir * 6, len: 40, life: 8, color: 'rgba(165, 243, 252, ALPHA)' });
      if (t === 1) play('playRewind');
    } else if (t === 27) {
      this.y = GROUND_Y; this.isGrounded = true;
      // Time snaps back: the opponent is hit by everything she landed in those 3 seconds (if they're within reach)
      const inReach = target && Math.abs((target.x + 40) - (r.startX ?? this.cx)) <= 220;
      if (target && !target.isDead && inReach) {
        const dmg = Math.min(340, 110 + Math.round(r.dealt * 0.6));
        target.hitStun = Math.max(1, target.hitStun || 0);
        this.scriptedHit(target, {
          damage: dmg, hitStun: 40, blockStun: 0, pushback: 8, height: ATTACK_HEIGHT.UNBLOCKABLE,
          hitType: HIT_TYPE.KNOCKDOWN, isUltimate: true, ultimateFinisher: true
        }, { x: target.x + 40, y: target.y - 50 });
        vfx.popup(target.x + 40, target.y - 112, r.hits ? `${r.hits} HIT${r.hits === 1 ? '' : 'S'} REPLAYED` : 'TIME COLLAPSE', { color: '#a5f3fc', size: 13, life: 55 });
        this.ult = { phase: 'lock', lockT: 1 }; // lets Training / Daily Challenges count the landed ultimate
        const tx = target.x + 40, ty = target.y - 50;
        vfx.flashScreen('#e0f2fe', 0.7, 0.05);
        for (let k = 0; k < 4; k++) vfx.push({ kind: 'ring', x: tx, y: ty, r: 6 + k * 6, vr: 5 + k * 1.5, life: 24, color: k % 2 ? '#67e8f9' : '#ffffff', w: 4 });
        vfx.burst(tx, ty, { color: '#67e8f9', count: 34, speed: 9, life: 30 });
        play('playUltimateFinisher');
      } else {
        vfx.popup(this.cx, this.y - 110, 'TIME RESTORED', { color: '#a5f3fc', size: 12, life: 45 });
        vfx.burst(this.cx, this.y - 50, { color: '#67e8f9', count: 20, speed: 6 });
      }
    } else if (t <= 52) {
      if (this.ult) this.ult = null;
      this.animFrame = 3;
      if (t > 34) this.isInvincible = false;
    } else {
      this.rewind = null;
      this.isInvincible = false;
      this.changeState(S.IDLE);
    }
  }

  aiSuggest(opp, dist) {
    this.ensureEcho();
    const busy = this.history.slice(-90).filter(h => h.hb).length;
    if (this.echoCd <= 0 && !this.ghost && busy >= 6 && Math.random() < 0.5) return 'sp1';
    if (dist > 120 && dist < 220 && Math.random() < 0.12) return 'sp3';
    return null;
  }

  render(ctx) {
    const g = this.ghost;
    if (g) {
      const snap = g.frames[Math.max(0, g.i - 1)];
      if (snap && snap.img) {
        ctx.save();
        ctx.globalAlpha = 0.45 + 0.1 * Math.sin(g.i * 0.5);
        ctx.filter = 'brightness(1.5) sepia(1) hue-rotate(145deg) saturate(3)';
        if (!snap.facingRight) { ctx.translate(snap.x + 80, snap.y - 90); ctx.scale(-1, 1); ctx.drawImage(snap.img, 0, 0); }
        else ctx.drawImage(snap.img, snap.x, snap.y - 90);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#a5f3fc';
        for (let y = snap.y - 90; y < snap.y; y += 4) ctx.fillRect(snap.x + 16, y, 48, 1);
        ctx.restore();
      }
    }
    super.render(ctx);
    // Echo-step charge pips
    if (!this.isDead && this.echoCd > 0) {
      const k = 1 - this.echoCd / ECHO_COOLDOWN;
      ctx.save();
      ctx.strokeStyle = 'rgba(103, 232, 249, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.cx, this.y - 104, 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k);
      ctx.stroke();
      ctx.restore();
    }
  }
}

// ===========================================================================
// GLITCH — The Corrupted
// ===========================================================================
const NO_STEAL = new Set(['mighty', 'endless_dragon', 'riot_cop', 'promoter', 'boris', 'viktor', 'matriarch', 'street_lord', 'urban_legend', 'champion']);
// Methods that always stay GLITCH's own while he runs someone else's move
const KEEP_OWN = new Set(['constructor', 'handleInput', 'update', 'render', 'takeHit', 'changeState', 'die', 'addSuper', 'getPushbox', 'getGlobalHurtboxes', 'getGlobalHitbox', 'isAttacking', 'canCancelOnHit']);
const STUB_INPUT = {
  peekAction: () => null, consumeAction() {}, consumeBuffer() {},
  checkDP: () => false, checkQCF: () => false, checkQCB: () => false,
  checkChargeBackFwd: () => false, checkChargeDownUp: () => false, easyInputs: false
};
function blankInput() {
  return {
    up: false, down: false, left: false, right: false, fwd: false, back: false, dashFwd: false, dashBack: false,
    lp: false, hp: false, lk: false, hk: false, sp1: false, sp2: false, sp3: false, dirty: false,
    lpJust: false, hpJust: false, lkJust: false, hkJust: false, sp1Just: false, sp2Just: false, sp3Just: false,
    dirtyJust: false, ultimateJust: false, throwJust: false
  };
}

class Packet extends Projectile {
  constructor(owner, x, y) {
    super({ owner, type: 'packet', x, y, vx: 0, width: 80, height: 70, damage: 60 });
    this.pierce = true;
    this.effect = 'daze';
    this.attackHeight = ATTACK_HEIGHT.HIGH;
    this._kitApplied = true;
  }
  update() {
    this.frame++;
    if (this.frame === 24) {
      vfx.burst(this.x + 40, this.y + 35, { color: '#a3e635', count: 22, speed: 6 });
      vfx.burst(this.x + 40, this.y + 35, { color: '#f0abfc', count: 14, speed: 5 });
      play('playGlitch');
    }
    if (this.frame >= 30) this.destroy();
  }
  getHitbox() {
    if (this.frame < 24) return new Box(-9999, -9999, 0, 0);
    return new Box(this.x, this.y, this.width, this.height);
  }
  render(ctx) {
    if (!this.active) return;
    ctx.save();
    const det = this.frame >= 24;
    const n = det ? 14 : 6;
    for (let i = 0; i < n; i++) {
      const s = det ? 4 + (this.frame - 24) * 2 : 3 + ((this.frame + i) % 3);
      const ox = ((i * 37 + this.frame * (det ? 7 : 3)) % 60) - 30;
      const oy = ((i * 23 + this.frame * 5) % 50) - 25;
      ctx.fillStyle = i % 3 === 0 ? '#a3e635' : (i % 3 === 1 ? '#f0abfc' : '#ffffff');
      ctx.globalAlpha = det ? Math.max(0, 1 - (this.frame - 24) / 6) : 0.5 + 0.5 * Math.sin(this.frame * 0.6 + i);
      ctx.fillRect(this.x + 40 + ox * (det ? 1.4 : 0.5), this.y + 35 + oy * (det ? 1.4 : 0.5), s, s);
    }
    ctx.restore();
  }
}

export class Glitch extends SignatureFighter {
  constructor(options) {
    super(options, 'glitch', 'GLITCH', { hp: 1.08, walk: 1.04, damage: 1.08 });
    this.ultimateStyle = 'glitch';
    this.stolen = null;
    this.stolenRun = null;
    this._installed = null;
  }

  // ---- SP1: LAG SPIKE — blinks through the opponent, leaving a corrupted packet behind
  special1() {
    this.changeState(S.SPECIAL_1);
    play('playGlitch');
  }
  tickSpecial1(opponent) {
    const t = this.stateTimer;
    this.isInvincible = t >= 3 && t <= 16;
    if (t <= 6) { this.animFrame = 0; this.vx = 0; }
    else if (t === 7) {
      // The packet is dropped right where the opponent was standing as he blinked through them
      const from = this.x + this.dir * 65;
      if (this.spawnProjectile) {
        this.activeProjectileCount++;
        this.spawnProjectile(new Packet(this, from, this.y - 80));
      }
      this.x = Math.max(30, Math.min(850, this.x + this.dir * 130));
      if (opponent) this.facingRight = this.cx < opponent.x + 40;
      vfx.speedLines(this.cx, this.y - 40, { dir: this.dir, count: 6 });
      this.tear = 10;
    } else if (t <= 26) this.animFrame = 2;
    else this.changeState(S.IDLE);
  }

  // ---- SP2: CTRL+C — a reaching data-hand that copies the opponent's last special
  special2() {
    this.changeState(S.SPECIAL_2);
    play('playWhoosh', 'heavy');
  }
  tickSpecial2() {
    const t = this.stateTimer;
    if (t <= 5) this.animFrame = 0;
    else if (t <= 11) {
      this.animFrame = 1;
      this.activeHitbox = new Box(40, 28, 96, 22);
      this.currentAttackData = { damage: 70, hitStun: 22, blockStun: 12, pushback: 3, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY, copyHand: true };
      if (t % 2 === 0) vfx.motes(this.x + (this.facingRight ? 80 : -56), this.y - 66, 56, 16, { color: '#a3e635', count: 2, rise: 0.2, size: 2 });
    } else if (t <= 25) { this.animFrame = 2; this.activeHitbox = null; }
    else this.changeState(S.IDLE);
  }

  onSpecialHit(target, result, data) {
    if (!target || !data || !data.copyHand) return;
    if (result === 'blocked' || result === 'armored') return;
    this.stealFrom(target);
  }

  stealFrom(target) {
    if (NO_STEAL.has(target.id) || target instanceof Glitch) {
      vfx.popup(this.cx, this.y - 108, target instanceof Glitch ? 'RECURSION ERROR' : 'ACCESS DENIED', { color: '#f87171', size: 11, life: 45 });
      return false;
    }
    const slot = target.lastSpecialSlot || 1;
    const entry = getFighterCatalogEntry(target.id);
    const sp = entry && entry.specials ? entry.specials.find(s => String(s.cmd || '').includes('SP' + slot)) : null;
    this.stolen = { cls: target.constructor, slot, name: (sp && sp.name) || `SPECIAL ${slot}`, from: target.name };
    vfx.popup(this.cx, this.y - 108, `COPIED: ${this.stolen.name.toUpperCase()}`, { color: '#a3e635', size: 11, life: 55 });
    play('playGlitch');
    this.tear = 12;
    return true;
  }

  // ---- SP3: CTRL+V — runs the stolen move; with nothing copied, a corrupting burst
  special3(opponent) {
    if (this.stolen) { this.pasteStolen(opponent || this._lastOpponent); return; }
    this.changeState(S.SPECIAL_3);
    play('playGlitch');
  }
  startTatsumaki() { this.special3(this._lastOpponent); }
  tickSpecial3() {
    const t = this.stateTimer;
    if (t <= 5) this.animFrame = 0;
    else if (t <= 10) {
      this.animFrame = 1;
      this.activeHitbox = new Box(28, 14, 64, 56);
      this.currentAttackData = { damage: 85, hitStun: 20, blockStun: 12, pushback: 6, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY, effect: 'daze' };
      if (t === 6) vfx.burst(this.cx + this.dir * 40, this.y - 50, { color: '#f0abfc', count: 16, speed: 5 });
    } else if (t <= 24) { this.animFrame = 2; this.activeHitbox = null; }
    else this.changeState(S.IDLE);
  }

  installStolen(cls) {
    this.uninstallStolen();
    const names = [];
    let proto = cls.prototype;
    while (proto && proto !== Fighter.prototype && proto !== Object.prototype) {
      for (const name of Object.getOwnPropertyNames(proto)) {
        if (KEEP_OWN.has(name) || names.includes(name)) continue;
        const d = Object.getOwnPropertyDescriptor(proto, name);
        if (!d || typeof d.value !== 'function') continue;
        names.push(name);
        Object.defineProperty(this, name, { value: d.value, writable: true, configurable: true, enumerable: false });
      }
      proto = Object.getPrototypeOf(proto);
    }
    const origSpawn = this.spawnProjectile;
    if (typeof this.applyProjectileKit === 'function' && origSpawn) {
      this.spawnProjectile = (p) => { if (p instanceof Projectile && !p._kitApplied) this.applyProjectileKit(p); origSpawn(p); };
    }
    this._installed = { names, origSpawn };
  }

  uninstallStolen() {
    const inst = this._installed;
    if (!inst) return;
    for (const name of inst.names) delete this[name];
    if (inst.origSpawn) this.spawnProjectile = inst.origSpawn;
    this._installed = null;
    this.stolenRun = null;
    this.reachBonus = 0;
    this.baseReach = 0;
  }

  pasteStolen(opponent) {
    const st = this.stolen;
    this.installStolen(st.cls);
    const input = blankInput();
    input[`sp${st.slot}`] = true;
    input[`sp${st.slot}Just`] = true;
    const before = this.state;
    try {
      st.cls.prototype.handleInput.call(this, input, STUB_INPUT, opponent);
    } catch (e) {
      // Whatever went wrong, GLITCH stays himself
    }
    if (this.state.startsWith('SPECIAL_') && (this.state !== before || this.stateTimer === 0)) {
      this.stolenRun = { state: this.state };
      vfx.popup(this.cx, this.y - 108, `PASTE: ${st.name.toUpperCase()}`, { color: '#f0abfc', size: 10, life: 40 });
      this.tear = 8;
    } else {
      this.uninstallStolen();
      vfx.popup(this.cx, this.y - 108, 'PASTE FAILED', { color: '#94a3b8', size: 9, life: 30 });
    }
  }

  update(opponent, stageWidth) {
    super.update(opponent, stageWidth);
    if (this.stolenRun && (!this.state.startsWith('SPECIAL_') || this.isDead)) this.uninstallStolen();
    if (this.tear > 0) this.tear--;
  }

  takeHit(attackData, fromDirection) {
    const res = super.takeHit(attackData, fromDirection);
    if (res && res !== 'blocked' && res !== 'armored') {
      if (this.stolenRun) this.uninstallStolen();
      if (this.stolen) {
        this.stolen = null;
        vfx.popup(this.cx, this.y - 108, 'DATA LOST', { color: '#f87171', size: 10, life: 40 });
      }
      this.tear = Math.max(this.tear || 0, 6);
    }
    return res;
  }

  // ---- ULTIMATE: BLUE SCREEN — cinematic beat-down that scrambles the victim's controls
  startUltimate(opponent) {
    this.superMeter = 0;
    this.uninstallStolen();
    this.changeState(S.ULTIMATE);
    this.ultimateTarget = opponent;
    this.isInvincible = true;
    play('playUltimateActivation');
    this.announce('BLUE SCREEN OF DEATH', '致命的例外', 'GLITCH // FATAL EXCEPTION 0x0000DEAD');
  }
  updateCinematicUltimate(target) {
    super.updateCinematicUltimate(target);
    if (this.ult && this.ult.phase === 'lock' && this.ult.lockT === 44 && target && !target.isDead) {
      target.scrambleTimer = 300;
      vfx.popup(target.x + 40, target.y - 118, 'CONTROLS SCRAMBLED', { color: '#60a5fa', size: 12, life: 60 });
    }
    if (this.ult && this.ult.phase === 'lock' && this.ult.lockT % 6 === 3) this.tear = 4;
  }
  ultimateFinisherFX(x, y) {
    vfx.flashScreen('#1d4ed8', 0.75, 0.04);
    vfx.push({ kind: 'ring', x, y, r: 12, vr: 9, life: 26, color: '#ffffff', w: 6 });
    vfx.push({ kind: 'ring', x, y, r: 8, vr: 6, life: 30, color: '#60a5fa', w: 4 });
    vfx.burst(x, y, { color: '#a3e635', count: 30, speed: 9, life: 28 });
    vfx.burst(x, y, { color: '#f0abfc', count: 20, speed: 7, life: 24 });
    vfx.popup(x, y - 60, ':(', { color: '#ffffff', size: 22, life: 50 });
    play('playGlitch');
  }

  aiSuggest(opp, dist) {
    if (this.stolen && dist < 200 && Math.random() < 0.45) return 'sp3';
    if (!this.stolen && dist > 60 && dist < 150 && Math.random() < 0.4) return 'sp2';
    if (dist > 160 && dist < 260 && Math.random() < 0.1) return 'sp1';
    return null;
  }

  render(ctx) {
    super.render(ctx);
    if (this.isDead) return;
    const img = this.__animator && this.__animator.lastImg;
    const glitching = (this.tear > 0) || (Math.floor(Date.now() / 90) % 23 === 0);
    if (!img || !glitching) return;
    ctx.save();
    const drawY = this.y - 90;
    // Horizontal tear slices + chromatic split
    for (let k = 0; k < 3; k++) {
      const sy = (k * 29 + Math.floor(Date.now() / 30)) % 80;
      const sh = 4 + (k * 7) % 9;
      const off = ((k % 2) ? 1 : -1) * (3 + (Date.now() / 50 % 6));
      ctx.globalAlpha = 0.85;
      if (this.facingRight) ctx.drawImage(img, 0, sy, 80, sh, this.x + off, drawY + sy, 80, sh);
      else {
        ctx.save();
        ctx.translate(this.x + 80 + off, drawY);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, sy, 80, sh, 0, sy, 80, sh);
        ctx.restore();
      }
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.25;
    ctx.filter = 'sepia(1) hue-rotate(260deg) saturate(6)';
    const dx = 3;
    if (this.facingRight) ctx.drawImage(img, this.x + dx, drawY);
    else { ctx.translate(this.x + 80 - dx, drawY); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0); }
    ctx.restore();
    // Stolen move tag
    if (this.stolen) {
      ctx.save();
      ctx.font = '700 6px "Bahnschrift", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#a3e635';
      ctx.fillText(`[${this.stolen.name.toUpperCase()}]`, this.cx, this.y - 100);
      ctx.restore();
    }
  }
}

// ===========================================================================
// TEMPO — The Beat
// ===========================================================================
export const BEAT_FRAMES = 30; // 120 BPM

class SoundWave extends Projectile {
  constructor(owner, x, y, dir, onBeat) {
    super({ owner, type: 'soundwave', x, y, vx: dir * (onBeat ? 7.5 : 6.2), width: onBeat ? 34 : 26, height: onBeat ? 50 : 40, damage: onBeat ? 90 : 70 });
    this.onBeat = onBeat;
    if (onBeat) this.effect = 'daze';
    this._kitApplied = true;
    this._glow = '#f472b6';
  }
  render(ctx) {
    if (!this.active) return;
    const dir = this.vx >= 0 ? 1 : -1;
    const cx = this.x + this.width / 2, cy = this.y + this.height / 2;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const r = this.height / 2 - i * 5 + Math.sin(this.frame * 0.5 + i) * 2;
      ctx.strokeStyle = i === 0 ? '#ffffff' : (this.onBeat ? '#facc15' : '#f472b6');
      ctx.globalAlpha = 0.9 - i * 0.25;
      ctx.lineWidth = 3 - i * 0.6;
      ctx.beginPath();
      ctx.arc(cx - dir * i * 7, cy, Math.max(4, r), dir > 0 ? -1.1 : Math.PI - 1.1, dir > 0 ? 1.1 : Math.PI + 1.1);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export class Tempo extends SignatureFighter {
  constructor(options) {
    super(options, 'tempo', 'TEMPO', { hp: 1.0, walk: 1.04, damage: 0.92 });
    this.ultimateStyle = 'tempo';
    this.level = 1;
    this.onBeatMove = false;
    this.judge = null;
    this._openSerial = 0;
    this._bumpedSerial = -1;
  }

  // Shared fight clock (frame based, so it's identical for both players online)
  static beatOffset(lookahead = 0) {
    const ph = (arena.frame + lookahead) % BEAT_FRAMES;
    return Math.min(ph, BEAT_FRAMES - ph);
  }
  beatOffset(lookahead = 0) { return Tempo.beatOffset(lookahead); }

  changeState(newState, force) {
    const wasAttacking = this.isAttacking();
    const res = super.changeState(newState, force);
    const nowAttacking = this.isAttacking();
    // Only openers are judged; anything cancelled into from a hit keeps the opener's timing
    if (nowAttacking && !wasAttacking && newState !== S.ULTIMATE && newState !== S.DIRTY_TACTIC) this.judgeMove();
    return res;
  }

  judgeMove() {
    if (this.level === undefined) this.level = 1;
    const off = this.beatOffset();
    this._openSerial = (this._openSerial || 0) + 1;
    if (off <= 2) { this.onBeatMove = true; this.judge = { text: 'PERFECT', color: '#facc15', t: 24 }; }
    else if (off <= 5) { this.onBeatMove = true; this.judge = { text: 'GOOD', color: '#f472b6', t: 20 }; }
    else {
      this.onBeatMove = false;
      if (this.level > 1) { this.level = 1; this.judge = { text: 'OFF BEAT', color: '#94a3b8', t: 24 }; }
    }
  }

  update(opponent, stageWidth) {
    super.update(opponent, stageWidth);
    if (this.level === undefined) this.level = 1;
    this.damageMult = (this.baseDamage || 1) * (1 + 0.12 * (this.level - 1)) * (this.onBeatMove && SPECIALS.includes(this.state) ? 1.1 : 1);
    if (this.judge && --this.judge.t <= 0) this.judge = null;
    // The beat: a floor pulse and a metronome tick
    if (arena.frame % BEAT_FRAMES === 0 && !this.isDead) {
      vfx.push({ kind: 'ring', x: this.cx, y: GROUND_Y - 2, r: 10, vr: 2.2, life: 12, color: this.level >= 4 ? '#facc15' : '#f472b6', w: 2 });
      const fighters = (arena.game && arena.game.allFighters) || [];
      const leadTempo = fighters.find(f => f instanceof Tempo && !f.isDead);
      if (!leadTempo || leadTempo === this) play('playBeatTick', (arena.frame / BEAT_FRAMES) % 4 === 0);
    }
  }

  onSpecialHit(target, result, data) {
    if (!target || result === 'blocked' || result === 'armored' || (data && data.isUltimate)) return;
    if (this.onBeatMove && this._bumpedSerial !== this._openSerial) {
      this._bumpedSerial = this._openSerial;
      if (this.level < 4) {
        this.level++;
        vfx.popup(this.cx, this.y - 116, this.level >= 4 ? 'FEVER x4' : `x${this.level}`, { color: this.level >= 4 ? '#facc15' : '#f472b6', size: this.level >= 4 ? 14 : 12, life: 40 });
      }
    }
    if (this.level >= 4) this.addSuper((data && data.damage ? data.damage : 40) * 0.05);
  }

  takeHit(attackData, fromDirection) {
    const res = super.takeHit(attackData, fromDirection);
    if (res && res !== 'blocked' && res !== 'armored' && this.level > 1) {
      this.level = 1;
      this.judge = { text: 'DROPPED THE BEAT', color: '#94a3b8', t: 30 };
    }
    return res;
  }

  // SP1 — DROP THE BASS: a soundwave; on the beat it's bigger, faster and dazes
  special1() {
    if (!this.canFireProjectile(8)) return;
    this.changeState(S.SPECIAL_1);
    play('playHadouken');
  }
  tickSpecial1() {
    const t = this.stateTimer;
    if (t <= 6) this.animFrame = 0;
    else if (t <= 14) {
      this.animFrame = 2;
      if (t === 9) this.fire(new SoundWave(this, this.facingRight ? this.x + 60 : this.x - 14, this.y - 72, this.dir, this.onBeatMove), 22);
    } else if (t <= 24) this.animFrame = 3;
    else this.changeState(S.IDLE);
  }

  // SP2 — SCRATCH: rising spin kick anti-air
  special2() {
    this.changeState(S.SPECIAL_2);
    play('playFlashKick');
    this.isInvincible = true;
    this.isGrounded = false;
    this.vy = -11;
    this.vx = this.dir * 2.6;
  }
  tickSpecial2() {
    const t = this.stateTimer;
    if (t >= 6) this.isInvincible = false;
    if (t <= 2) this.animFrame = 0;
    else if (t <= 12) {
      this.animFrame = 1 + (Math.floor(t / 3) % 2);
      this.activeHitbox = new Box(22, -12, 80, 62);
      this.currentAttackData = { damage: 110, hitStun: 30, blockStun: 16, pushback: 5, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.KNOCKDOWN, chipDamage: 12 };
    } else {
      this.animFrame = 3;
      this.activeHitbox = null;
      if (t > 40 && this.isGrounded) this.changeState(S.IDLE);
    }
  }

  // SP3 — BREAKDOWN: low windmill sweep; on the beat it spins twice
  special3() {
    this.changeState(S.SPECIAL_3);
    play('playWhoosh', 'heavy');
    this.doubleSpin = !!this.onBeatMove;
  }
  tickSpecial3() {
    const t = this.stateTimer;
    const end = this.doubleSpin ? 34 : 26;
    this.animFrame = Math.floor(t / 4) % 4;
    if (t <= 16) this.vx = this.dir * 3.4;
    const active = (t >= 6 && t <= 13) || (this.doubleSpin && t >= 18 && t <= 24);
    if (this.doubleSpin && t === 17) this.hasHitThisAttack = false;
    if (active) {
      this.activeHitbox = new Box(16, 62, 82, 24);
      this.currentAttackData = { damage: this.doubleSpin ? 55 : 70, hitStun: 22, blockStun: 12, pushback: 4, height: ATTACK_HEIGHT.LOW, hitType: (this.doubleSpin && t < 17) ? HIT_TYPE.HEAVY : HIT_TYPE.KNOCKDOWN };
    } else this.activeHitbox = null;
    if (t > end) this.changeState(S.IDLE);
  }

  // ULTIMATE — ENCORE: cinematic beat-down; every hit lands on the rhythm and scales with the multiplier
  startUltimate(opponent) {
    this.superMeter = 0;
    this.changeState(S.ULTIMATE);
    this.ultimateTarget = opponent;
    this.isInvincible = true;
    this.encoreLevel = this.level || 1;
    play('playUltimateActivation');
    this.announce('ENCORE', 'アンコール', `TEMPO // MULTIPLIER x${this.encoreLevel}`);
  }
  ultimateHit(target, data, pos) {
    const k = 1 + 0.15 * ((this.encoreLevel || 1) - 1);
    play('playBeatTick', true);
    vfx.push({ kind: 'ring', x: pos.x, y: pos.y, r: 6, vr: 4, life: 12, color: '#f472b6', w: 3 });
    return super.ultimateHit(target, { ...data, damage: Math.round(data.damage * k) }, pos);
  }
  ultimateFinisherFX(x, y) {
    vfx.flashScreen('#fdf2f8', 0.7, 0.05);
    for (let k = 0; k < 5; k++) vfx.push({ kind: 'ring', x, y, r: 6 + k * 8, vr: 5 + k, life: 26, color: k % 2 ? '#facc15' : '#f472b6', w: 4 });
    vfx.shockwave(x, GROUND_Y, { color: '#f472b6', size: 2.4 });
    vfx.burst(x, y, { color: '#facc15', count: 30, speed: 9, life: 28 });
    this.level = 1;
  }

  aiSuggest(opp, dist) {
    if (dist > 220 && this.projectileCooldown <= 0 && Math.random() < 0.25) return 'sp1';
    if (dist < 120 && Math.random() < 0.12) return 'sp3';
    return null;
  }

  render(ctx) {
    super.render(ctx);
    if (this.isDead) return;
    const lvl = this.level || 1;
    // Beat meter: four bars that light up with the multiplier, pulsing on the beat
    const pulse = 1 - Math.min(1, (arena.frame % BEAT_FRAMES) / 8);
    ctx.save();
    const bx = this.cx - 13, by = this.y - 104;
    for (let i = 0; i < 4; i++) {
      const on = i < lvl;
      ctx.fillStyle = on ? (lvl >= 4 ? '#facc15' : '#f472b6') : 'rgba(255,255,255,0.18)';
      const h = 3 + i * 1.5 + (on ? pulse * 2 : 0);
      ctx.fillRect(bx + i * 7, by - h, 5, h);
    }
    if (this.judge) {
      ctx.globalAlpha = Math.min(1, this.judge.t / 8);
      ctx.font = '800 7px "Bahnschrift", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = this.judge.color;
      ctx.fillText(this.judge.text, this.cx, by - 12);
    }
    ctx.restore();
  }
}

// ===========================================================================
// ATLAS — The Architect
// ===========================================================================
export class Atlas extends SignatureFighter {
  constructor(options) {
    super(options, 'atlas', 'ATLAS', { hp: 1.0, walk: 0.9, dash: 0.92, jump: 0.95, damage: 0.97 });
    this.wallCd = 0;
  }

  update(opponent, stageWidth) {
    super.update(opponent, stageWidth);
    if (this.wallCd > 0) this.wallCd--;
  }

  // SP1 — RAISE WALL: hammer slam; a concrete wall erupts in front of him
  special1() {
    if ((this.wallCd || 0) > 0) return;
    this.changeState(S.SPECIAL_1);
    play('playWhoosh', 'heavy');
  }
  tickSpecial1() {
    const t = this.stateTimer;
    if (t <= 9) this.animFrame = 0;
    else if (t === 10) {
      this.animFrame = 2;
      const x = this.facingRight ? this.cx + 62 : this.cx - 62 - 22;
      arena.addWall(this, x);
      this.wallCd = 140;
      vfx.dust(this.cx + this.dir * 20, GROUND_Y, { amount: 8, scale: 1.2 });
    } else if (t <= 28) this.animFrame = 3;
    else this.changeState(S.IDLE);
  }

  // SP2 — SCAFFOLD: upward hammer swing that leaves a platform overhead
  special2() {
    this.changeState(S.SPECIAL_2);
    play('playShoryuken');
    this.isInvincible = true;
  }
  tickSpecial2() {
    const t = this.stateTimer;
    if (t >= 6) this.isInvincible = false;
    if (t <= 3) this.animFrame = 0;
    else if (t <= 12) {
      this.animFrame = 1;
      this.activeHitbox = new Box(28, -24, 76, 68);
      this.currentAttackData = { damage: 100, hitStun: 28, blockStun: 16, pushback: 5, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.KNOCKDOWN, chipDamage: 12 };
      if (t === 7) arena.addPlatform(this, this.cx + this.dir * 34, GROUND_Y - 80);
    } else if (t <= 30) { this.animFrame = 3; this.activeHitbox = null; }
    else this.changeState(S.IDLE);
  }

  // SP3 — WRECKING SWING: armoured haymaker; splats foes against walls and corners
  special3() {
    this.changeState(S.SPECIAL_3);
    play('playWhoosh', 'heavy');
  }
  tickSpecial3() {
    const t = this.stateTimer;
    if (t <= 11) { this.animFrame = 0; this.vx = this.dir * 1.2; }
    else if (t <= 17) {
      this.animFrame = 2;
      this.activeHitbox = new Box(34, 16, 86, 42);
      this.currentAttackData = { damage: 105, hitStun: 26, blockStun: 18, pushback: 9, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.KNOCKDOWN, chipDamage: 15, wreck: true };
    } else if (t <= 34) { this.animFrame = 3; this.activeHitbox = null; }
    else this.changeState(S.IDLE);
  }

  takeHit(attackData, fromDirection) {
    // Wrecking Swing wind-up absorbs one hit
    if (this.state === S.SPECIAL_3 && this.stateTimer <= 8 && !this._armorUsed && attackData.height !== ATTACK_HEIGHT.UNBLOCKABLE && !this.isDead && !this.isInvincible) {
      this._armorUsed = true;
      play('playBlock');
      this.health = Math.max(1, this.health - Math.floor((attackData.damage || 0) * 0.5));
      this.armorFlash = 6;
      return 'armored';
    }
    return super.takeHit(attackData, fromDirection);
  }
  changeState(newState, force) {
    if (newState !== this.state || force) this._armorUsed = false;
    return super.changeState(newState, force);
  }

  onSpecialHit(target, result, data) {
    if (!target || !data || !data.wreck || result === 'blocked' || result === 'armored' || target.isDead) return;
    const dir = target.x + 40 >= this.cx ? 1 : -1;
    const wall = arena.wallBehind(target, dir, 110);
    const cornered = dir > 0 ? target.x >= 960 - 110 - 40 : target.x <= 30 + 40;
    if (!wall && !cornered) return;
    if (wall) arena.shatter(wall, true);
    target.isInvincible = false; // knocked into the wall: the splat lands before the tumble
    this.scriptedHit(target, { damage: 60, hitStun: 30, blockStun: 0, pushback: 0, height: ATTACK_HEIGHT.UNBLOCKABLE, hitType: HIT_TYPE.HEAVY }, { x: target.x + 40, y: target.y - 50 });
    if (!target.isDead) {
      target.hitStun = 0;
      target.vx = -dir * 2.8;
      target.vy = -7;
      target.isGrounded = false;
      target.changeState(S.WALL_REBOUND, true);
      target.isInvincible = false;
    }
    vfx.popup(target.x + 40, target.y - 110, 'WALL SPLAT!', { color: '#f59e0b', size: 14, life: 45 });
    play('playWallBounce');
  }

  // ULTIMATE — CEILING DROP: a slab of the arena ceiling hunts the opponent, then falls
  startUltimate(opponent) {
    this.superMeter = 0;
    this.changeState(S.ULTIMATE);
    this.ultimateTarget = opponent;
    this.isInvincible = true;
    play('playUltimateActivation');
    this.announce('CEILING DROP', '天井崩落', 'ATLAS // DEMOLITION ORDER');
  }
  tickUltimate(opponent) {
    const t = this.stateTimer;
    this.vx = 0;
    if (t <= 12) this.animFrame = 0;
    else if (t === 13) {
      this.animFrame = 1;
      arena.addSlab(this, opponent || this.ultimateTarget);
      vfx.shockwave(this.cx, GROUND_Y, { color: '#f59e0b', size: 1.6 });
      vfx.dust(this.cx, GROUND_Y, { amount: 14, scale: 1.5 });
    } else if (t <= 34) { this.animFrame = 2; if (t > 22) this.isInvincible = false; }
    else { this.isInvincible = false; this.changeState(S.IDLE); }
  }

  aiSuggest(opp, dist) {
    if ((this.wallCd || 0) <= 0 && dist > 170 && !arena.walls.some(w => w.owner === this) && Math.random() < 0.3) return 'sp1';
    if (dist < 120 && Math.random() < 0.14) return 'sp3';
    return null;
  }
}

export const SIGNATURE_CLASSES = { echo: Echo, glitch: Glitch, tempo: Tempo, atlas: Atlas };

export const SIGNATURE_QUOTES = {
  echo: '"I already won this fight. I\'m just here to watch it happen again."',
  glitch: '"Your moves? Nice. Mine now."',
  tempo: '"Stay on beat or get knocked off it."',
  atlas: '"I don\'t fight in your arena. I build my own."'
};
