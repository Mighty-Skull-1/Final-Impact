// Final Impact - CPU Opponent AI
// A human-like arcade AI: it reacts after a (difficulty-based) delay instead of reading inputs
// frame-perfectly, rolls each decision ONCE per situation (not every frame), commits to movement
// for a while, plays footsies by range, anti-airs, punishes whiffs, confirms hits into specials,
// throws people who just hold block, techs throws, uses Breaker and its Ultimate.
import { FIGHTER_STATE } from './Constants.js';

const PROFILES = {
  dummy:     { reaction: 99, block: 0, lowBlock: 0, antiAir: 0, confirm: 0, punish: 0, aggression: 0, throwRate: 0, techChance: 0, breaker: 0, ultimate: 0, mistake: 0, passive: true },
  easy:      { reaction: 24, block: 0.22, lowBlock: 0.25, antiAir: 0.18, confirm: 0.22, punish: 0.2, aggression: 0.42, throwRate: 0.05, techChance: 0.08, breaker: 0.1, ultimate: 0.35, mistake: 0.22 },
  normal:    { reaction: 15, block: 0.42, lowBlock: 0.48, antiAir: 0.42, confirm: 0.5, punish: 0.45, aggression: 0.55, throwRate: 0.1, techChance: 0.25, breaker: 0.2, ultimate: 0.65, mistake: 0.1 },
  hard:      { reaction: 9, block: 0.64, lowBlock: 0.74, antiAir: 0.72, confirm: 0.85, punish: 0.8, aggression: 0.68, throwRate: 0.14, techChance: 0.5, breaker: 0.4, ultimate: 0.85, mistake: 0.05 },
  nightmare: { reaction: 6, block: 0.82, lowBlock: 0.88, antiAir: 0.88, confirm: 0.95, punish: 0.92, aggression: 0.76, throwRate: 0.18, techChance: 0.72, breaker: 0.6, ultimate: 1.0, mistake: 0.02 }
};

function lerpProfile(a, b, t) {
  const out = {};
  for (const k of Object.keys(a)) {
    out[k] = typeof a[k] === 'number' ? a[k] + (b[k] - a[k]) * t : a[k];
  }
  return out;
}

// What each base move-set's specials are good for (roster fighters reuse a base kit)
const MOVE_HINTS = {
  kazuki: { projectile: 'sp1', antiAir: 'sp2', rush: 'sp3', reversal: 'sp2' },
  raven: { projectile: 'sp1', antiAir: 'sp2', rush: 'sp3', reversal: 'sp2' },
  kagura: { projectile: 'sp3', antiAir: 'sp2', rush: 'sp2', teleport: 'sp1' },
  fang: { rush: 'sp1', antiAir: 'sp2', poke: 'sp3' },
  zephyr: { low: 'sp1', overhead: 'sp2', rush: 'sp3' },
  colossus: { rush: 'sp3', antiAir: 'sp2', armor: 'sp1' },
  mighty: { projectile: 'sp1', antiAir: 'sp2', rush: 'sp3' }
};
const ROSTER_BASE = {
  cinder: 'kagura', glacier: 'kazuki', oracle: 'kagura', bandit: 'raven', confessor: 'fang', valka: 'kazuki',
  convict: 'colossus', prophet: 'zephyr', ronin: 'kazuki', vagabond: 'raven', warden: 'fang', wretch: 'zephyr'
};
const BOSS_IDS = new Set(['riot_cop', 'promoter', 'boris', 'viktor', 'matriarch', 'street_lord', 'urban_legend', 'champion', 'endless_dragon']);

const roll = p => Math.random() < p;
const center = f => f.x + 40;

export class AIController {
  constructor(difficulty = 'normal') {
    this.difficulty = difficulty;
    this.campaignStage = 0;
    this.profile = PROFILES[difficulty] || PROFILES.normal;
    this.tickCount = 0;
    this.nextDecisionTime = 0;
    this.currentState = this.blankState();
    this.resetMemory();
  }

  blankState() {
    return {
      up: false, down: false, left: false, right: false, fwd: false, back: false,
      dashFwd: false, dashBack: false,
      lp: false, hp: false, lk: false, hk: false, sp1: false, sp2: false, sp3: false, dirty: false,
      lpJust: false, hpJust: false, lkJust: false, hkJust: false,
      sp1Just: false, sp2Just: false, sp3Just: false, dirtyJust: false,
      ultimateJust: false, throwJust: false
    };
  }

  resetMemory() {
    this.move = null;          // 'fwd' | 'back' | null
    this.moveTimer = 0;
    this.crouch = false;
    this.guardTimer = 0;
    this.guardLow = false;
    this.pendingTap = null;    // { at, keys: [...] }
    this.lastAttackKey = null; // identity of the opponent's current attack
    this.lastWhiffKey = null;
    this.lastConfirmKey = null;
    this.aaPlanned = false;
    this.wasPlayerGrounded = true;
    this.comboBreakerRolled = false;
    this.seenProjectiles = new WeakSet();
    this.playerBlockFrames = 0;
  }

  setDifficulty(level, campaignStage = 0) {
    this.difficulty = level;
    this.campaignStage = campaignStage;
    if (campaignStage > 0) {
      // Campaign ramps from "easy-normal" at stage 1 to "hard+" at the final boss
      const t = Math.min(1, (campaignStage - 1) / 7);
      const start = lerpProfile(PROFILES.easy, PROFILES.normal, 0.6);
      this.profile = lerpProfile(start, PROFILES.hard, t);
      if (campaignStage >= 8) this.profile = lerpProfile(PROFILES.hard, PROFILES.nightmare, 0.4);
    } else if (level === 'training' || level === 'dummy') {
      this.profile = PROFILES.dummy;
    } else {
      this.profile = PROFILES[level] || PROFILES.normal;
    }
    this.resetMemory();
  }

  hints(cpu) {
    const base = ROSTER_BASE[cpu.id] || cpu.id;
    return MOVE_HINTS[base] || {};
  }

  // ---- taps ----
  tap(btn) {
    const s = this.currentState;
    switch (btn) {
      case 'lp': s.lp = s.lpJust = true; break;
      case 'hp': s.hp = s.hpJust = true; break;
      case 'lk': s.lk = s.lkJust = true; break;
      case 'hk': s.hk = s.hkJust = true; break;
      case 'sp1': s.sp1 = s.sp1Just = true; break;
      case 'sp2': s.sp2 = s.sp2Just = true; break;
      case 'sp3': s.sp3 = s.sp3Just = true; break;
      case 'dirty': s.dirty = s.dirtyJust = true; break;
      case 'ultimate': s.ultimateJust = true; break;
      case 'throw': s.throwJust = true; s.lp = s.lk = true; s.lpJust = true; break;
      default: break;
    }
  }
  // Legacy helpers (bosses / other code may call these)
  tapLP() { this.tap('lp'); }
  tapHP() { this.tap('hp'); }
  tapLK() { this.tap('lk'); }
  tapHK() { this.tap('hk'); }
  tapSP1() { this.tap('sp1'); }
  tapSP2() { this.tap('sp2'); }
  tapSP3() { this.tap('sp3'); }
  tapDirty() { this.tap('dirty'); }

  schedule(delay, keys) {
    this.pendingTap = { at: this.tickCount + Math.max(0, Math.round(delay)), keys };
  }

  // ---- main ----
  update(cpuFighter, playerFighter) {
    this.tickCount++;
    const cpu = cpuFighter;
    const player = playerFighter;
    const s = this.currentState = this.blankState();
    const P = this.profile;

    if (!cpu || !player || cpu.isDead || player.isDead || P.passive) {
      return s;
    }
    // Throw tech for the CPU is rolled by the CombatDirector; never mash out of throws here
    if (cpu.state === FIGHTER_STATE.THROWN || cpu.state === FIGHTER_STATE.THROW) return s;

    const dx = center(player) - center(cpu);
    const dist = Math.abs(dx);
    const toRight = dx > 0;
    const hints = this.hints(cpu);
    const reaction = Math.max(2, P.reaction + (Math.random() - 0.5) * 4);
    const lowHealth = cpu.health < cpu.maxHealth * 0.3;
    const aggression = Math.min(0.95, P.aggression + (cpu.isRageMode ? 0.12 : 0) + (lowHealth ? 0.05 : 0));

    // Track how long the player has been turtling (holding block)
    const playerBlocking = player.state === FIGHTER_STATE.BLOCK || player.state === FIGHTER_STATE.CROUCH_BLOCK || player.isHoldingBack;
    this.playerBlockFrames = playerBlocking ? this.playerBlockFrames + 1 : Math.max(0, this.playerBlockFrames - 2);

    // ---------- 1. While being hit: Combo Breaker ----------
    const inStun = cpu.hitStun > 0 || cpu.state === FIGHTER_STATE.BLIND_STUN;
    if (inStun) {
      if ((cpu.comboHits || 0) >= 3 && cpu.superMeter >= 50 && !this.comboBreakerRolled) {
        this.comboBreakerRolled = true;
        if (roll(P.breaker)) { this.tap('dirty'); return s; }
      }
    } else if ((cpu.comboHits || 0) === 0) {
      this.comboBreakerRolled = false;
    }

    // Keep holding guard through block-strings
    if (cpu.blockStun > 0 || cpu.state === FIGHTER_STATE.BLOCK || cpu.state === FIGHTER_STATE.CROUCH_BLOCK) {
      this.holdBack(s, toRight);
      s.down = this.guardLow;
      return s;
    }
    if (cpu.hitStun > 0 || cpu.state === FIGHTER_STATE.KNOCKDOWN || !cpu.isGrounded) {
      // Can't act — but if we're airborne in a jump, maybe a jump attack
      if (!cpu.isGrounded && cpu.state === FIGHTER_STATE.JUMP && cpu.vy > -2 && dist < 110 && roll(0.25)) {
        this.tap(roll(0.5) ? 'hk' : 'hp');
      }
      return s;
    }

    // ---------- 2. Confirm our own hits into specials / ultimate ----------
    if (cpu.hasHitThisAttack && cpu.canCancelOnHit && cpu.canCancelOnHit()) {
      const key = cpu.state + ':' + (this.tickCount - cpu.stateTimer);
      if (this.lastConfirmKey !== key) {
        this.lastConfirmKey = key;
        if (roll(P.confirm)) {
          if (cpu.superMeter >= cpu.maxSuperMeter && roll(P.ultimate * 0.7)) this.schedule(2, ['ultimate']);
          else if (cpu.state.includes('LP') || cpu.state.includes('LK')) this.schedule(3, [roll(0.5) ? 'hp' : (hints.rush || 'sp1')]);
          else this.schedule(3, [hints.rush || hints.antiAir || 'sp2']);
        }
      }
    }

    // Execute a scheduled action
    if (this.pendingTap && this.tickCount >= this.pendingTap.at) {
      const keys = this.pendingTap.keys;
      this.pendingTap = null;
      keys.forEach(k => this.tap(k));
      return s;
    }

    // ---------- 3. Reactions to the opponent ----------
    // 3a. Anti-air: decide once per jump, then hit them as they come down
    const playerAir = !player.isGrounded && player.state !== FIGHTER_STATE.KNOCKDOWN;
    if (playerAir && this.wasPlayerGrounded) {
      this.aaPlanned = roll(P.antiAir) ? 'aa' : (roll(P.block) ? 'guard' : 'none');
    }
    this.wasPlayerGrounded = !playerAir;
    if (playerAir && dist < 150) {
      if (this.aaPlanned === 'aa' && player.vy > -5 && dist < 105) {
        this.aaPlanned = 'done';
        this.tap(hints.antiAir || 'hp');
        return s;
      }
      if (this.aaPlanned === 'guard' && player.vy > -2) {
        this.guardTimer = Math.max(this.guardTimer, 16);
        this.guardLow = false;
      }
    }

    // 3b. Incoming attacks: decide ONCE per attack whether we saw it coming
    const playerAttacking = player.isAttacking && player.isAttacking();
    if (playerAttacking && player.isGrounded) {
      const atkKey = player.state + ':' + (this.tickCount - player.stateTimer);
      if (atkKey !== this.lastAttackKey) {
        this.lastAttackKey = atkKey;
        const inThreat = dist < 150;
        if (inThreat && roll(P.block * (dist < 110 ? 1 : 0.7))) {
          this.guardTimer = 14 + Math.random() * 14;
          const isLow = player.state.startsWith('CROUCH_') || (player.currentAttackData && player.currentAttackData.height === 'LOW');
          this.guardLow = isLow ? roll(P.lowBlock) : roll(0.1);
        }
      }
      // Slow attacks give a second, reaction-based chance
      if (player.stateTimer >= reaction && !player.activeHitbox && !player.hasHitThisAttack && dist < 140 && this.guardTimer <= 0 && roll(P.block * 0.5)) {
        this.guardTimer = 14;
      }
    }

    // 3c. Incoming projectiles
    const projs = (typeof window !== 'undefined' && window.__GAME_INSTANCE && window.__GAME_INSTANCE.projectiles) || [];
    for (const p of projs) {
      if (!p || !p.active || p.owner === cpu || this.seenProjectiles.has(p)) continue;
      const pdx = center(cpu) - (p.x + (p.width || 0) / 2);
      const coming = Math.sign(p.vx) === Math.sign(pdx) && Math.abs(pdx) < 230;
      if (!coming) continue;
      this.seenProjectiles.add(p);
      const r = Math.random();
      if (r < P.block) { this.guardTimer = Math.max(this.guardTimer, Math.abs(pdx) / Math.max(4, Math.abs(p.vx)) + 8); this.guardLow = false; }
      else if (r < P.block + aggression * 0.3 && Math.abs(pdx) > 110) { this.jumpToward(s, toRight); return s; }
    }

    // 3d. Punish whiffs / recovery
    if (playerAttacking && !player.activeHitbox && !player.hasHitThisAttack && player.stateTimer > 7) {
      const wKey = player.state + ':' + (this.tickCount - player.stateTimer);
      if (wKey !== this.lastWhiffKey) {
        this.lastWhiffKey = wKey;
        if (dist < 135 && roll(P.punish)) {
          this.guardTimer = 0;
          if (cpu.superMeter >= cpu.maxSuperMeter && roll(P.ultimate * 0.5)) this.schedule(reaction * 0.5, ['ultimate']);
          else this.schedule(reaction * 0.5, [dist < 90 ? 'hp' : (hints.rush || 'hk')]);
        }
      }
    }

    // ---------- 4. Guarding ----------
    if (this.guardTimer > 0) {
      this.guardTimer--;
      this.holdBack(s, toRight);
      s.down = this.guardLow;
      return s;
    }

    // ---------- 5. Neutral game ----------
    if (this.moveTimer > 0) this.moveTimer--;
    if (this.tickCount >= this.nextDecisionTime) {
      this.nextDecisionTime = this.tickCount + Math.round(6 + reaction * 0.7 + Math.random() * 10);
      if (BOSS_IDS.has(cpu.id)) this.bossDecision(cpu, player, dist, toRight);
      else this.decide(cpu, player, dist, toRight, hints, aggression);
    }

    // Apply committed movement
    if (this.moveTimer > 0 && this.move) {
      if (this.move === 'fwd') this.holdFwd(s, toRight);
      else if (this.move === 'back') this.holdBack(s, toRight);
    }
    if (this.crouch && this.moveTimer > 0) s.down = true;
    // merge one-shot taps chosen by decide()
    if (this.decisionTaps) {
      this.decisionTaps.forEach(k => {
        if (k === 'jump') { s.up = true; }
        else if (k === 'dashFwd') s.dashFwd = true;
        else if (k === 'dashBack') s.dashBack = true;
        else if (k === 'down') s.down = true;
        else this.tap(k);
      });
      this.decisionTaps = null;
    }
    return s;
  }

  decide(cpu, player, dist, toRight, hints, aggression) {
    const P = this.profile;
    const taps = [];
    const setMove = (dir, frames, crouch = false) => { this.move = dir; this.moveTimer = frames; this.crouch = crouch; };
    const canProjectile = hints.projectile && cpu.projectileCooldown <= 0 && (cpu.activeProjectileCount || 0) < 1;
    const meterFull = cpu.superMeter >= cpu.maxSuperMeter;

    // Occasional mistake: a random button or a pointless hop
    if (roll(P.mistake * 0.4)) {
      taps.push(['lp', 'hk', 'jump', 'lk'][Math.floor(Math.random() * 4)]);
      this.decisionTaps = taps;
      return;
    }

    if (dist > 250) {
      // FAR: zone, approach, or dash in
      const r = Math.random();
      if (canProjectile && r < 0.32 + (1 - aggression) * 0.2) taps.push(hints.projectile);
      else if (r < 0.75) setMove('fwd', 25 + Math.random() * 35);
      else if (r < 0.88) taps.push('dashFwd');
      else { setMove('back', 12); }
    } else if (dist > 125) {
      // MID: footsies — step in and out, poke, occasionally jump in
      const r = Math.random();
      if (r < 0.28 * (0.6 + aggression)) setMove('fwd', 12 + Math.random() * 18);
      else if (r < 0.42) setMove('back', 10 + Math.random() * 14);
      else if (r < 0.58 && dist < 170) { taps.push('down', 'hk'); }
      else if (r < 0.68 && dist < 165) taps.push('hk');
      else if (r < 0.74 && canProjectile) taps.push(hints.projectile);
      else if (r < 0.80 * (0.7 + aggression * 0.4)) taps.push('dashFwd');
      else if (r < 0.86) { taps.push('jump'); setMove('fwd', 30); }
      else { this.guardTimer = 10 + Math.random() * 10; }
    } else {
      // CLOSE: pressure, throws against turtling, mix-ups, sometimes back off
      const turtling = this.playerBlockFrames > 20;
      const r = Math.random();
      if (meterFull && roll(P.ultimate * 0.12)) taps.push('ultimate');
      else if (dist < 70 && roll(P.throwRate * (turtling ? 2.2 : 1))) taps.push('throw');
      else if (r < 0.26 * (0.5 + aggression)) taps.push('lp');
      else if (r < 0.42) taps.push('down', 'lk');
      else if (r < 0.54) taps.push('hp');
      else if (r < 0.62) taps.push(hints.rush || 'hk');
      else if (r < 0.68 && hints.overhead) taps.push(hints.overhead);
      else if (r < 0.76) taps.push('dashBack');
      else if (r < 0.86) { this.guardTimer = 10 + Math.random() * 12; this.guardLow = roll(0.5); }
      else setMove('back', 10);
    }
    this.decisionTaps = taps;
  }

  // Boss move preferences (kept from the original boss AI, now layered on the shared defence)
  bossDecision(cpu, player, dist, toRight) {
    const taps = [];
    const setMove = (dir, frames) => { this.move = dir; this.moveTimer = frames; };
    const id = cpu.id;
    const r = Math.random();
    if (id === 'riot_cop') {
      if (dist > 150) setMove('fwd', 25);
      else if (dist > 75) { if (r < 0.6) taps.push('lp'); else setMove('fwd', 12); }
      else taps.push(r < 0.55 ? 'hp' : 'lp');
    } else if (id === 'promoter') {
      if (dist > 210) { setMove('fwd', 25); if (r < 0.35) taps.push('jump'); }
      else if (dist > 95) { if (r < 0.5) taps.push('lp'); else setMove('fwd', 14); }
      else taps.push('lp');
    } else if (id === 'boris') {
      if (dist > 130) setMove('fwd', 25);
      else if (dist > 70) { if (r < 0.5) taps.push('hp'); else setMove('fwd', 12); }
      else taps.push(r < 0.55 ? 'sp1' : 'hp');
    } else if (id === 'viktor') {
      if (dist > 190) setMove('fwd', 22);
      else if (dist > 95) taps.push(r < 0.5 ? 'down' : 'hk', 'hk');
      else if (r < 0.4) setMove('back', 14); else taps.push('hk');
    } else if (id === 'matriarch') {
      if (dist > 170) setMove('fwd', 22);
      else if (dist > 85) taps.push(r < 0.5 ? 'lp' : 'hp');
      else if (r < 0.55) taps.push('hp'); else setMove('back', 14);
    } else if (id === 'street_lord') {
      if (dist > 130) setMove('fwd', 22);
      else taps.push(dist > 75 && r < 0.5 ? 'lp' : 'hp');
    } else if (id === 'urban_legend') {
      if (dist > 180) setMove('fwd', 22);
      else taps.push(r < 0.6 ? 'lp' : 'hp');
    } else if (id === 'champion') {
      const p2 = cpu.phase === 2;
      if (dist > 150) { if (r < (p2 ? 0.55 : 0.4)) taps.push('sp1'); else setMove('fwd', 22); }
      else if (dist > 80) { if (p2 && r < 0.45) taps.push('sp2'); else if (r < 0.5) taps.push('sp1'); else taps.push('lp'); }
      else if (p2 && r < 0.4) taps.push('sp3'); else taps.push(r < 0.55 ? 'hp' : 'lp');
    } else {
      // endless_dragon or unknown boss: its own class drives most of its behaviour
      if (dist > 160) setMove('fwd', 20);
      else taps.push(['lp', 'hp', 'hk', 'sp1', 'sp2'][Math.floor(r * 5)]);
    }
    if (dist < 70 && roll(this.profile.throwRate * 0.5) && id !== 'endless_dragon') taps.push('throw');
    this.decisionTaps = taps;
  }

  holdFwd(s, toRight) {
    s.fwd = true; s.back = false;
    s.right = toRight; s.left = !toRight;
  }

  holdBack(s, toRight) {
    s.back = true; s.fwd = false;
    s.left = toRight; s.right = !toRight;
  }

  jumpToward(s, toRight) {
    s.up = true;
    this.holdFwd(s, toRight);
    this.move = 'fwd';
    this.moveTimer = 30;
  }

  // Legacy API used by older code paths
  walkTowards(cpu, player) { this.holdFwd(this.currentState, player.x > cpu.x); }
  walkAway(cpu, player) { this.holdBack(this.currentState, player.x > cpu.x); }
  neutralize() { this.currentState = this.blankState(); }
}
