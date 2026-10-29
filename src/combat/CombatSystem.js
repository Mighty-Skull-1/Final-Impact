// Final Impact - Combat Director
// Universal combat rules shared by every fighter, layered on top of the per-character move code:
//   • screen-wide hit-stop (both fighters + projectiles freeze together, so hits land with weight)
//   • combo tracking with damage scaling and hit-stun decay (no more 70% touch-of-death or jab infinites)
//   • counter hits (hitting someone in the start-up of their own attack)
//   • throws (LP+LK up close) with a throw-tech window — the answer to someone who only blocks
//   • Combo Breaker (Dirty Tactic button while being comboed, costs 50% meter)
//   • Dirty Tactic cooldown + shorter stun so it is a comeback tool, not a spam button
//   • ultimate "super freeze" so the cut-in no longer hides live gameplay
//   • ability VFX hooks for every fighter, keyed off state changes, in the fighter's own glow colour
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE } from '../engine/Constants.js';
import { vfx } from '../graphics/VFX.js';
import { soundFX } from '../audio/SoundFX.js';
import { FIGHTER_DESIGNS } from '../graphics/FighterDesigns.js';

export const COMBAT_TUNING = {
  // Hit-stop (frames the whole fight freezes on impact)
  freezeLight: 6,
  freezeHeavy: 9,
  freezeKnockdown: 11,
  freezeBlock: 5,
  freezeKO: 26,
  // Combo scaling: hits 1-2 full damage, then -12% per hit, floor 35% (ultimates floor 55%)
  scaleStartHit: 2,
  scaleStep: 0.12,
  scaleFloor: 0.35,
  superScaleFloor: 0.55,
  // Hit-stun decay so long chains eventually drop
  stunDecayStart: 4,
  stunDecayStep: 0.06,
  stunDecayFloor: 0.6,
  counterDamage: 1.2,
  counterStun: 5,
  // Throws
  throwRange: 64,
  throwDamage: 115,
  throwTechWindow: 10,
  throwDuration: 34,
  throwProtect: 8,
  // Breaker
  breakerCost: 50,
  breakerInvuln: 22,
  // Dirty Tactic
  dirtyCooldown: 540,
  dirtyMaxStun: 42,
  // Rage
  rageDamageMult: 1.15,
  // Round intro lock (ROUND X → FIGHT!)
  introFrames: 92
};

const NEUTRAL_STATES = new Set([
  FIGHTER_STATE.IDLE, FIGHTER_STATE.WALK_FWD, FIGHTER_STATE.WALK_BACK, FIGHTER_STATE.DASH_FWD
]);

const LIGHT_NORMALS = new Set([
  FIGHTER_STATE.ATTACK_LIGHT_PUNCH, FIGHTER_STATE.ATTACK_LIGHT_KICK
]);

export function getGlow(f) {
  if (!f) return '#ffd34d';
  if (f._glow) return f._glow;
  const d = FIGHTER_DESIGNS[f.id];
  f._glow = (d && d.glow) || (f.team === 2 ? '#ff4d6d' : '#3fb6ff');
  return f._glow;
}

const center = f => f.x + 40;
const COLOR_EFFECT = { burn: '#ff8a3d', bleed: '#ff4d4d', chill: '#9be7ff', crush: '#fbbf24' };

export class CombatDirector {
  constructor(game) {
    this.game = game;
    this.freeze = 0;
    this.superFreeze = 0;
    this.superFreezeFighter = null;
    this.introTimer = 0;
    this.throws = [];
    this.koFlashDone = false;
    this.matchStats = { bestCombo: { 1: 0, 2: 0 } };
  }

  resetMatchStats() {
    this.matchStats = { bestCombo: { 1: 0, 2: 0 } };
  }

  get hud() { return this.game.hud; }

  shakeMult() {
    const s = this.game.settingsManager && this.game.settingsManager.settings;
    if (!s) return 1;
    return s.screenShake === 'off' ? 0 : (s.screenShake === 'low' ? 0.4 : 1.0);
  }

  resetRound() {
    this.freeze = 0;
    this.superFreeze = 0;
    this.superFreezeFighter = null;
    this.throws = [];
    this.introTimer = COMBAT_TUNING.introFrames;
    this.koFlashDone = false;
    vfx.clear();
    (this.game.allFighters || []).forEach(f => this.resetFighter(f));
  }

  resetFighter(f) {
    if (!f) return;
    f.comboHits = 0;
    f.comboDamage = 0;
    f.wallBouncedInCombo = false;
    f.dirtyCooldown = 0;
    f.invulnTimer = 0;
    f.throwProtect = 0;
    f.hitFlash = 0;
    if (f._baseWalk !== undefined) { f.walkSpeed = f._baseWalk; f.dashSpeed = f._baseDash; f._baseWalk = undefined; }
    f.chillTimer = 0;
    f._prevState = f.state;
    f._prevGrounded = f.isGrounded;
  }

  isFrozen() {
    return this.freeze > 0 || this.superFreeze > 0;
  }

  addFreeze(frames) {
    this.freeze = Math.max(this.freeze, frames);
  }

  // Called once per frame while frozen (hit-stop or super freeze)
  tickFreeze() {
    if (this.superFreeze > 0) {
      this.superFreeze--;
      const f = this.superFreezeFighter;
      if (f && !f.isDead) {
        // Charge-up aura during the freeze
        const glow = getGlow(f);
        vfx.motes(f.x + 14, f.y - 92, 52, 90, { color: glow, count: 3, rise: 2.4, size: 2.6 });
        if (this.superFreeze % 6 === 0) vfx.push({ kind: 'ring', x: center(f), y: f.y - 46, r: 8, vr: 3.2, life: 14, color: glow, w: 2 });
      }
      if (this.superFreeze === 0) this.superFreezeFighter = null;
      return;
    }
    if (this.freeze > 0) this.freeze--;
  }

  // ---------------------------------------------------------------
  // Input-level mechanics (throws / breaker / dirty cooldown)
  // Returns { consumed, input } — when consumed the fighter's own handleInput is skipped.
  // ---------------------------------------------------------------
  preInput(f, inputState, inputManager, opponent) {
    if (!f || f.isDead) return { consumed: true, input: inputState };

    // Fighters locked in a throw do nothing else
    if (f.state === FIGHTER_STATE.THROW || f.state === FIGHTER_STATE.THROWN) {
      if (f.state === FIGHTER_STATE.THROWN) this.tryTech(f, inputState);
      return { consumed: true, input: inputState };
    }

    // Round intro lock
    if (this.introTimer > 0) {
      return { consumed: true, input: inputState };
    }

    let state = inputState;

    // Combo Breaker: Dirty button while being comboed, needs 50% meter
    const inStun = f.hitStun > 0 || f.state === FIGHTER_STATE.BLIND_STUN;
    // (accepts a buffered press too, so mashing the button during hit-stop still counts)
    const breakerPressed = state.dirtyJust || (inputManager && f.playerNum <= 2 && !f.isCpu && inputManager.peekAction(f.playerNum) === 'DIRTY');
    if (inStun && breakerPressed && (f.comboHits || 0) >= 1 && f.superMeter >= COMBAT_TUNING.breakerCost) {
      this.performBreaker(f, opponent);
      if (inputManager && f.playerNum <= 2) inputManager.consumeAction(f.playerNum);
      return { consumed: true, input: state };
    }

    // Dirty Tactic cooldown: strip the input while recharging
    if (f.dirtyCooldown > 0 && (state.dirtyJust || state.dirty)) {
      state = { ...state, dirtyJust: false, dirty: false };
      if (inputManager && f.playerNum <= 2 && inputManager.peekAction(f.playerNum) === 'DIRTY') {
        inputManager.consumeAction(f.playerNum);
      }
    }

    // Throw: LP + LK together (either pressed this frame while the other is held)
    const throwPressed = (state.lpJust && state.lk) || (state.lkJust && state.lp) || state.throwJust;
    if (throwPressed && opponent && this.canStartThrow(f, opponent)) {
      if (inputManager && f.playerNum <= 2) inputManager.consumeAction(f.playerNum);
      this.startThrow(f, opponent, !!state.back);
      return { consumed: true, input: state };
    }

    return { consumed: false, input: state };
  }

  canStartThrow(f, target) {
    if (!f.isGrounded || !target.isGrounded) return false;
    const okState = NEUTRAL_STATES.has(f.state) || (LIGHT_NORMALS.has(f.state) && f.stateTimer <= 3 && !f.hasHitThisAttack);
    if (!okState) return false;
    if (target.isDead || target.isInvincible || target.hitStun > 0 || target.blockStun > 0) return false;
    if ((target.throwProtect || 0) > 0) return false;
    if ([FIGHTER_STATE.KNOCKDOWN, FIGHTER_STATE.THROW, FIGHTER_STATE.THROWN, FIGHTER_STATE.ULTIMATE,
      FIGHTER_STATE.WALL_REBOUND, FIGHTER_STATE.SUBMISSION_LOCK].includes(target.state)) return false;
    if (target.transitionTimer > 0 || target.isFlying) return false;
    if (target.id === 'endless_dragon') return false; // too big to grab
    return Math.abs(center(f) - center(target)) <= COMBAT_TUNING.throwRange;
  }

  startThrow(att, def, backThrow) {
    att.changeState(FIGHTER_STATE.THROW, true);
    def.changeState(FIGHTER_STATE.THROWN, true);
    att.vx = 0; def.vx = 0;
    att.activeHitbox = null; def.activeHitbox = null;
    att.facingRight = center(att) < center(def);
    def.facingRight = !att.facingRight;
    this.throws.push({ att, def, t: 0, backThrow, teched: false });
    soundFX.playWhoosh('heavy');
    vfx.push({ kind: 'flash', x: (center(att) + center(def)) / 2, y: att.y - 55, r: 14, life: 6, color: '#ffffff', glow: getGlow(att) });
  }

  tryTech(def, inputState) {
    const th = this.throws.find(t => t.def === def);
    if (!th || th.teched || th.t > COMBAT_TUNING.throwTechWindow) return;
    const pressed = (inputState.lpJust && inputState.lk) || (inputState.lkJust && inputState.lp) || inputState.throwJust;
    if (pressed) this.techThrow(th);
  }

  techThrow(th) {
    th.teched = true;
    const { att, def } = th;
    const dir = center(att) < center(def) ? 1 : -1;
    att.changeState(FIGHTER_STATE.IDLE, true);
    def.changeState(FIGHTER_STATE.IDLE, true);
    att.vx = -dir * 6.5;
    def.vx = dir * 6.5;
    att.blockStun = 10; def.blockStun = 10;
    att.changeState(FIGHTER_STATE.BLOCK, true);
    def.changeState(FIGHTER_STATE.BLOCK, true);
    const mx = (center(att) + center(def)) / 2;
    vfx.blockSpark(mx, att.y - 55, { dir });
    vfx.popup(mx, att.y - 100, 'TECH!', { color: '#7dd3fc', size: 14 });
    try { soundFX.playTech(); } catch (e) { soundFX.playBlock(); }
    this.addFreeze(6);
    this.throws = this.throws.filter(t => t !== th);
    this.notifyTraining('tech', def);
  }

  updateThrows() {
    for (let i = this.throws.length - 1; i >= 0; i--) {
      const th = this.throws[i];
      const { att, def } = th;
      th.t++;
      if (att.isDead || def.isDead || att.state !== FIGHTER_STATE.THROW || def.state !== FIGHTER_STATE.THROWN) {
        if (att.state === FIGHTER_STATE.THROW) att.changeState(FIGHTER_STATE.IDLE, true);
        if (def.state === FIGHTER_STATE.THROWN) def.changeState(FIGHTER_STATE.IDLE, true);
        this.throws.splice(i, 1);
        continue;
      }
      // CPU tech attempt (based on its difficulty profile)
      if (def.isCpu && !th.teched && th.t === 6) {
        const ai = this.game.getAIFor ? this.game.getAIFor(def) : null;
        let techChance = ai && ai.profile ? ai.profile.techChance : 0.25;
        if (this.game.isTraining && this.game.training) techChance = this.game.training.dummyTechs() ? 1 : 0;
        if (Math.random() < techChance) { this.techThrow(th); continue; }
      }
      const dir = att.facingRight ? 1 : -1;
      // Pull the victim in close
      const wantX = att.x + dir * 34;
      def.x += (wantX - def.x) * 0.35;
      if (th.t === 12 && th.backThrow) {
        // Swing them around to the other side
        def.x = att.x - dir * 34;
        att.facingRight = !att.facingRight;
        def.facingRight = !att.facingRight;
        vfx.speedLines(center(def), def.y - 20, { dir: -dir, count: 6 });
      }
      if (th.t >= 10 && th.t < 20) {
        def.y = 300 - Math.sin(((th.t - 10) / 10) * Math.PI) * 26;
      }
      if (th.t === 20) {
        def.y = 300;
        def.changeState(FIGHTER_STATE.IDLE, true);
        const data = {
          damage: COMBAT_TUNING.throwDamage,
          hitStun: 30,
          blockStun: 0,
          pushback: 7,
          height: ATTACK_HEIGHT.UNBLOCKABLE,
          hitType: HIT_TYPE.KNOCKDOWN,
          isThrow: true
        };
        this.applyHit(att, def, data, { x: center(def), y: def.y - 40 }, { throw: true });
        try { soundFX.playThrow(); } catch (e) {}
        this.notifyTraining('throw', att);
        vfx.dust(center(def), 300, { amount: 10, scale: 1.3 });
        vfx.shockwave(center(def), 300, { color: getGlow(att), size: 1.2 });
      }
      if (th.t >= COMBAT_TUNING.throwDuration) {
        if (att.state === FIGHTER_STATE.THROW) att.changeState(FIGHTER_STATE.IDLE, true);
        this.throws.splice(i, 1);
      }
    }
  }

  performBreaker(f, opponent) {
    f.superMeter = Math.max(0, f.superMeter - COMBAT_TUNING.breakerCost);
    this.notifyTraining('breaker', f);
    f.hitStun = 0;
    f.blindTimer = 0;
    f.blockStun = 0;
    f.changeState(FIGHTER_STATE.IDLE, true);
    f.invulnTimer = COMBAT_TUNING.breakerInvuln;
    f.isInvincible = true;
    f.comboHits = 0;
    f.comboDamage = 0;
    const glow = getGlow(f);
    const cx = center(f);
    // Blow every nearby enemy away
    (this.game.allFighters || []).forEach(o => {
      if (o === f || o.team === f.team || o.isDead) return;
      if (Math.abs(center(o) - cx) > 160) return;
      const away = center(o) > cx ? 1 : -1;
      o.activeHitbox = null;
      o.vx = away * 8.5;
      o.hitStun = 22;
      o.changeState(FIGHTER_STATE.HIT, true);
      o.hitStun = 22;
    });
    vfx.push({ kind: 'ring', x: cx, y: f.y - 46, r: 10, vr: 7, life: 18, color: '#ffe066', w: 5 });
    vfx.push({ kind: 'ring', x: cx, y: f.y - 46, r: 6, vr: 4.5, life: 20, color: glow, w: 3 });
    vfx.burst(cx, f.y - 46, { color: '#ffe066', count: 26, speed: 8 });
    vfx.popup(cx, f.y - 108, 'BREAKER!', { color: '#ffe066', size: 16, life: 50 });
    vfx.flashScreen('#fff3c4', 0.45, 0.06);
    try { soundFX.playBreaker(); } catch (e) { soundFX.playRageIgnite(); }
    this.hud.triggerShake(10 * this.shakeMult());
    this.addFreeze(14);
    this.game.triggerCameraZoom(1.12, 30);
  }

  // ---------------------------------------------------------------
  // Hit resolution
  // ---------------------------------------------------------------
  isInCombo(def) {
    return def.hitStun > 0 ||
      def.state === FIGHTER_STATE.BLIND_STUN ||
      def.state === FIGHTER_STATE.WALL_REBOUND ||
      def.state === FIGHTER_STATE.HIT_AIR ||
      (def.state === FIGHTER_STATE.KNOCKDOWN && !def.isGrounded);
  }

  // Shared melee/projectile/throw hit application. Returns takeHit's result.
  applyHit(attacker, defender, baseData, pos, opts = {}) {
    const T = COMBAT_TUNING;
    const data = { ...baseData };
    const isSuper = attacker && attacker.state === FIGHTER_STATE.ULTIMATE;

    // Combo bookkeeping
    if (!this.isInCombo(defender)) {
      defender.comboHits = 0;
      defender.comboDamage = 0;
      defender.wallBouncedInCombo = false;
    }

    // Counter hit: caught in the start-up of their own attack
    const isCounter = !opts.projectile && !opts.throw &&
      defender.isAttacking && defender.isAttacking() && !defender.activeHitbox &&
      !defender.hasHitThisAttack && defender.stateTimer <= 14 && defender.state !== FIGHTER_STATE.ULTIMATE;

    // Damage modifiers
    let dmg = data.damage || 0;
    if (attacker && attacker.damageMult && !opts.throw) dmg *= attacker.damageMult;
    if (attacker && attacker.isRageMode) dmg *= (attacker.rageMult || T.rageDamageMult);
    if (defender.damageTakenMult) dmg *= defender.damageTakenMult;
    if (isCounter) {
      dmg *= T.counterDamage;
      data.hitStun = (data.hitStun || 16) + T.counterStun;
    }
    // Critical Riposte: a heavy blow on a stance-broken (dazed) foe
    const isHeavyBlow = data.hitType === HIT_TYPE.HEAVY || data.hitType === HIT_TYPE.KNOCKDOWN;
    const isCrit = !!defender.isStanceBroken && isHeavyBlow && !opts.projectile && !opts.throw;
    if (isCrit) {
      dmg *= 2.0;
      data.hitType = HIT_TYPE.KNOCKDOWN;
    }
    const n = defender.comboHits || 0; // hits already in this combo
    let scale = 1;
    if (n >= T.scaleStartHit) {
      scale = Math.max(isSuper ? T.superScaleFloor : T.scaleFloor, 1 - T.scaleStep * (n - T.scaleStartHit + 1));
    }
    dmg = Math.max(1, Math.round(dmg * scale));
    data.damage = dmg;
    if (data.chipDamage) data.chipDamage = Math.round(data.chipDamage * Math.min(1, scale + 0.2) * (defender.chipTakenMult ?? 1));

    // Hit-stun decay in long combos
    if (n >= T.stunDecayStart && data.hitStun) {
      const k = Math.max(T.stunDecayFloor, 1 - T.stunDecayStep * (n - T.stunDecayStart + 1));
      data.hitStun = Math.max(8, Math.round(data.hitStun * k));
    }
    // Dirty tactic stun cap
    if (data.hitType === HIT_TYPE.DIRTY_STUN) {
      data.stunFrames = Math.min(data.stunFrames || 60, T.dirtyMaxStun);
      data.hitStun = Math.min(data.hitStun || 60, T.dirtyMaxStun);
    }

    const healthBefore = defender.health;
    const result = defender.takeHit(data, attacker && attacker.facingRight ? 1 : -1);
    // Global freeze replaces the old per-fighter micro hit-stop
    defender.hitStop = 0;
    if (attacker) attacker.hitStop = 0;

    const dealt = Math.max(0, healthBefore - defender.health);
    const dir = attacker ? (center(defender) >= center(attacker) ? 1 : -1) : 1;

    // Corner pushback: if the defender can't be pushed further, the attacker slides back instead
    if (attacker && !opts.projectile && !opts.throw && attacker.isGrounded && result && result !== 'ko') {
      const stageW = 960;
      const cornered = defender.x <= 34 || defender.x >= stageW - 114;
      if (cornered && attacker.state !== FIGHTER_STATE.ULTIMATE) {
        attacker.vx = -dir * Math.max(2.5, (baseData.pushback || 4) * (result === 'blocked' ? 0.9 : 0.7));
      }
    }
    const glow = getGlow(attacker);
    const heavy = data.hitType === HIT_TYPE.HEAVY || data.hitType === HIT_TYPE.KNOCKDOWN || dmg >= 80;
    const shake = this.shakeMult();

    if (result === 'blocked') {
      this.notifyTraining('hit', attacker, defender, result, { dealt: 0, base: baseData.damage || 0, scale: 1 });
      // Specials and reversals are minus on block: shorten the defender's block-stun so
      // invincible uppercuts and rush moves can be punished instead of being free.
      const st = attacker ? attacker.state : '';
      const isSpecialState = st === FIGHTER_STATE.SPECIAL_1 || st === FIGHTER_STATE.SPECIAL_2 || st === FIGHTER_STATE.SPECIAL_3;
      if (attacker && !opts.projectile && isSpecialState) {
        const rising = !attacker.isGrounded || attacker.vy < 0;
        defender.blockStun = Math.min(defender.blockStun || 0, rising ? 7 : 11);
      }
      vfx.blockSpark(pos.x, pos.y, { dir });
      if (data.guardCrush) {
        defender.consumeStamina(data.guardCrush, true);
        vfx.popup(pos.x, pos.y - 30, 'GUARD CRUSH', { color: COLOR_EFFECT.crush, size: 10 });
      }
      this.addFreeze(T.freezeBlock);
      if (attacker) attacker.addSuper((baseData.damage || 0) * 0.03);
      defender.addSuper((baseData.damage || 0) * 0.05);
      this.hud.triggerShake((heavy ? 2.5 : 1) * shake);
      return result;
    }
    if (result === 'armored') {
      vfx.hitSpark(pos.x, pos.y, { dir, heavy: false, color: '#cbd5e1' });
      vfx.popup(pos.x, pos.y - 30, 'ARMOR', { color: '#cbd5e1', size: 10 });
      this.addFreeze(T.freezeLight);
      return result;
    }
    if (!result) return result;

    // Successful hit
    if (isCrit) {
      defender.isStanceBroken = false;
      defender.stanceBreakTimer = 0;
      defender.poise = 100;
      vfx.popup(pos.x, pos.y - 44, 'CRITICAL!', { color: '#ff4d4d', size: 16, life: 45, rise: 0.35 });
      vfx.flashScreen('#ffefc2', 0.4, 0.05);
      try { soundFX.playCritical(); } catch (e) {}
      vfx.burst(pos.x, pos.y, { color: '#ffe066', count: 26, speed: 8 });
      this.game.triggerCameraZoom(1.2, 50);
      if (attacker && attacker.playerNum === 1) { try { this.game.achievements.unlock('CRITICAL_RIPOSTE'); } catch (e) {} }
    }
    defender.comboHits = n + 1;
    defender.comboDamage = (defender.comboDamage || 0) + dealt;
    defender.hitFlash = heavy ? 5 : 3;

    vfx.hitSpark(pos.x, pos.y, { dir, heavy, color: isSuper ? '#ffe066' : (heavy ? glow : '#ffd34d'), counter: isCounter });
    if (isCounter) {
      vfx.popup(pos.x, pos.y - 34, 'COUNTER', { color: '#ff4d4d', size: 13 });
      try { soundFX.playCounterHit(); } catch (e) {}
    }
    if (result === 'knockdown' || result === 'ko') {
      vfx.shockwave(pos.x, pos.y, { color: glow, ground: false, size: 0.9 });
    }

    // Kit effects (burn, chill, bleed, blind, pull...)
    const effect = data.effect || opts.effect;
    if (effect) this.applyEffect(attacker, defender, effect, result, dir, pos, dmg);
    if (attacker && typeof attacker.onSpecialHit === 'function') {
      try { attacker.onSpecialHit(defender, result, data); } catch (e) {}
    }

    // Meter gain on hit
    if (attacker) attacker.addSuper(dmg * 0.07);

    // Freeze + shake
    let freeze = heavy ? T.freezeHeavy : T.freezeLight;
    if (result === 'knockdown') freeze = T.freezeKnockdown;
    if (isCrit) freeze = 18;
    if (isCounter) freeze += 3;
    if (result === 'ko') {
      freeze = T.freezeKO;
      if (!this.koFlashDone) {
        this.koFlashDone = true;
        vfx.flashScreen('#ffffff', 0.8, 0.05);
        vfx.burst(pos.x, pos.y, { color: glow, count: 34, speed: 9, life: 30 });
        vfx.push({ kind: 'ring', x: pos.x, y: pos.y, r: 10, vr: 8, life: 24, color: '#ffffff', w: 5 });
        this.game.triggerCameraZoom(1.25, 70);
      }
    }
    this.addFreeze(freeze);
    this.hud.triggerShake((result === 'ko' ? 14 : (heavy ? 6 : 2.5)) * shake);

    if (attacker) {
      const side = attacker.team === 1 ? 1 : 2;
      this.matchStats.bestCombo[side] = Math.max(this.matchStats.bestCombo[side] || 0, defender.comboHits);
    }
    this.notifyTraining('hit', attacker, defender, result, { dealt, base: baseData.damage || 0, scale, counter: isCounter, crit: isCrit });
    // HUD combo counter
    if (this.hud.setCombo && attacker) this.hud.setCombo(attacker.team === 1 ? 1 : 2, defender.comboHits, defender.comboDamage, isCounter);
    return result;
  }

  notifyTraining(kind, a, b, result, info) {
    // Daily challenge progress for the local player (outside Training)
    const g = this.game;
    if (!g.isTraining && g.recordChallenge && a && a === g.f1 && !a.isCpu) {
      if (kind === 'hit' && result !== 'blocked' && result !== 'armored') {
        if (info && info.counter) g.recordChallenge('counter');
        if (info && info.crit) g.recordChallenge('crit');
        if (b && b.comboHits === 5) g.recordChallenge('combo5');
      } else if (kind === 'throw' || kind === 'tech' || kind === 'breaker' || kind === 'ultimateLock') {
        g.recordChallenge(kind);
      }
    }
    const tr = this.game.isTraining && this.game.training;
    if (!tr) return;
    try {
      if (kind === 'hit') tr.onHit(a, b, result, info);
      else tr.onEvent(kind, a);
    } catch (e) {}
  }

  // Melee hit from Game.checkAttacks
  resolveMelee(attacker, defender, hitResult) {
    const res = this.applyHit(attacker, defender, hitResult.attack, { x: hitResult.hitX, y: hitResult.hitY });
    if (attacker.state === FIGHTER_STATE.DIRTY_TACTIC || hitResult.attack.hitType === HIT_TYPE.DIRTY_STUN) {
      this.hud.showDirtyBanner(attacker.name);
    }
    return res;
  }

  resolveProjectile(p, target) {
    const data = {
      effect: p.effect,
      damage: p.damage,
      hitStun: 22,
      blockStun: 14,
      pushback: 5,
      height: p.attackHeight,
      hitType: 'HEAVY',
      chipDamage: 12,
      isProjectile: true
    };
    return this.applyHit(p.owner, target, data, { x: p.x + p.width / 2, y: p.y + p.height / 2 }, { projectile: true });
  }

  applyEffect(attacker, def, effect, result, dir, pos, dmg) {
    const stunned = result === 'hit' || result === 'stun';
    switch (effect) {
      case 'burn':
        def.applyStatusEffect('BURN', 120);
        vfx.popup(pos.x, pos.y - 30, 'BURN', { color: COLOR_EFFECT.burn, size: 10 });
        break;
      case 'bleed':
        def.applyStatusEffect('BLEED', 180);
        vfx.popup(pos.x, pos.y - 30, 'BLEED', { color: COLOR_EFFECT.bleed, size: 10 });
        break;
      case 'chill':
        def.chillTimer = 150;
        vfx.popup(pos.x, pos.y - 30, 'CHILLED', { color: COLOR_EFFECT.chill, size: 10 });
        vfx.burst(pos.x, pos.y, { color: '#bfeaff', count: 12, speed: 4 });
        break;
      case 'freeze':
        if (stunned || !def.isGrounded) {
          def.hitStun = (def.hitStun || 0) + 16;
          def.chillTimer = Math.max(def.chillTimer || 0, 60);
          vfx.popup(pos.x, pos.y - 30, 'FROZEN', { color: COLOR_EFFECT.chill, size: 12 });
          vfx.burst(pos.x, pos.y, { color: '#e0f7ff', count: 18, speed: 5 });
        }
        break;
      case 'blind':
      case 'daze':
        if (stunned && def.isGrounded) {
          def.hitStun = 0;
          def.blindTimer = effect === 'blind' ? 28 : 22;
          def.changeState(FIGHTER_STATE.BLIND_STUN, true);
          vfx.popup(pos.x, pos.y - 30, effect === 'blind' ? 'BLINDED' : 'DAZED', { color: COLOR_EFFECT.crush, size: 10 });
        }
        break;
      case 'pull':
        if (stunned) def.vx = -dir * 5.5;
        break;
      case 'poise':
        def.poise = Math.max(0, (def.poise === undefined ? 100 : def.poise) - dmg * 0.6);
        break;
      case 'wallSplat':
        if (stunned || result === 'knockdown') {
          def.vx = dir * 11;
          def.wallBouncedInCombo = false;
        }
        break;
      case 'launch':
        if (result === 'knockdown') { def.vy = -11.5; def.vx *= 0.6; }
        break;
      default:
        break;
    }
  }

  // Called when an ultimate starts (from the 'ultimate-activated' event)
  onUltimate(fighter) {
    if (!fighter || typeof fighter !== 'object') return;
    this.superFreeze = 40;
    this.superFreezeFighter = fighter;
    const glow = getGlow(fighter);
    vfx.pillar(center(fighter), fighter.y + 4, { color: glow, w: 46, h: 220, life: 40 });
    vfx.flashScreen(glow, 0.35, 0.03);
    vfx.dust(center(fighter), 300, { amount: 12, scale: 1.5 });
  }

  // ---------------------------------------------------------------
  // Per-frame bookkeeping & ability FX (after fighters update)
  // ---------------------------------------------------------------
  postUpdate() {
    if (this.introTimer > 0) this.introTimer--;
    this.updateThrows();

    for (const f of this.game.allFighters || []) {
      if (!f) continue;
      if (f.dirtyCooldown > 0) f.dirtyCooldown--;
      // Chill: slower movement while it lasts
      if (f.chillTimer > 0) {
        if (f._baseWalk === undefined) { f._baseWalk = f.walkSpeed; f._baseDash = f.dashSpeed; }
        f.walkSpeed = f._baseWalk * 0.6;
        f.dashSpeed = f._baseDash * 0.7;
        f.chillTimer--;
        if (f.chillTimer % 6 === 0) vfx.motes(f.x + 20, f.y - 80, 40, 70, { color: '#bfeaff', count: 2, rise: 0.8, size: 2 });
        if (f.chillTimer <= 0) { f.walkSpeed = f._baseWalk; f.dashSpeed = f._baseDash; f._baseWalk = undefined; }
      }
      if (f.throwProtect > 0) f.throwProtect--;
      if (f.hitFlash > 0) f.hitFlash--;
      if (f.invulnTimer > 0) {
        f.invulnTimer--;
        f.isInvincible = f.invulnTimer > 0;
      }

      const prev = f._prevState;
      const cur = f.state;
      if (prev !== cur) this.onStateEnter(f, prev, cur);
      this.onStateTick(f, cur);

      // Landing dust
      if (f._prevGrounded === false && f.isGrounded) {
        const hard = prev === FIGHTER_STATE.KNOCKDOWN || cur === FIGHTER_STATE.KNOCKDOWN;
        vfx.dust(center(f), 300, { amount: hard ? 12 : 5, scale: hard ? 1.4 : 1 });
        try { soundFX.playLand(hard); } catch (e) {}
        if (hard) {
          this.hud.triggerShake(4 * this.shakeMult());
          vfx.shockwave(center(f), 300, { color: 'rgba(255,255,255,0.7)', size: 0.8 });
        }
      }
      // Combo ends → reset counter, allow fresh wall bounce
      if (!this.isInCombo(f) && f.comboHits > 0 && f.state !== FIGHTER_STATE.KNOCKDOWN) {
        f.comboHits = 0;
        f.comboDamage = 0;
        f.wallBouncedInCombo = false;
      }
      f._prevState = f.state;
      f._prevGrounded = f.isGrounded;
    }
  }

  onStateEnter(f, prev, cur) {
    const glow = getGlow(f);
    const cx = center(f);
    const dir = f.facingRight ? 1 : -1;
    // Throw protection when recovering from stun / knockdown
    if ((prev === FIGHTER_STATE.HIT || prev === FIGHTER_STATE.HIT_CROUCH || prev === FIGHTER_STATE.KNOCKDOWN ||
      prev === FIGHTER_STATE.BLOCK || prev === FIGHTER_STATE.CROUCH_BLOCK || prev === FIGHTER_STATE.THROWN) &&
      (cur === FIGHTER_STATE.IDLE || cur === FIGHTER_STATE.CROUCH)) {
      f.throwProtect = COMBAT_TUNING.throwProtect;
    }
    switch (cur) {
      case FIGHTER_STATE.DASH_FWD:
      case FIGHTER_STATE.DASH_BACK:
        this.notifyTraining('dash', f);
        vfx.dust(cx - dir * 10, 300, { dir: cur === FIGHTER_STATE.DASH_FWD ? dir : -dir, amount: 5 });
        break;
      case FIGHTER_STATE.JUMP:
        this.notifyTraining('jump', f);
        vfx.dust(cx, 300, { amount: 4, scale: 0.8 });
        break;
      case FIGHTER_STATE.SPECIAL_1:
      case FIGHTER_STATE.SPECIAL_2:
      case FIGHTER_STATE.SPECIAL_3:
        // Charge flash at the hands + a ring so every special "reads" instantly
        vfx.push({ kind: 'flash', x: cx + dir * 18, y: f.y - 58, r: 18, life: 8, color: '#ffffff', glow });
        vfx.push({ kind: 'ring', x: cx, y: f.y - 46, r: 12, vr: 2.6, life: 12, color: glow, w: 2 });
        f.addSuper(2.5);
        this.notifyTraining('special', f);
        break;
      case FIGHTER_STATE.DIRTY_TACTIC:
        f.dirtyCooldown = COMBAT_TUNING.dirtyCooldown;
        vfx.popup(cx, f.y - 104, 'DIRTY!', { color: '#fbbf24', size: 11, life: 30 });
        break;
      case FIGHTER_STATE.ULTIMATE:
        vfx.shockwave(cx, 300, { color: glow, size: 1.6 });
        break;
      default:
        break;
    }
  }

  // Continuous trails while an ability is active, so specials look like specials.
  onStateTick(f, cur) {
    if (f.isDead) return;
    if (f.ult && f.ult.phase === 'lock' && f.ult.lockT === 1) this.notifyTraining('ultimateLock', f);
    const glow = getGlow(f);
    const cx = center(f);
    const dir = f.facingRight ? 1 : -1;
    const isSpecial = cur === FIGHTER_STATE.SPECIAL_1 || cur === FIGHTER_STATE.SPECIAL_2 || cur === FIGHTER_STATE.SPECIAL_3;
    if (isSpecial || cur === FIGHTER_STATE.ULTIMATE) {
      const hb = f.getGlobalHitbox ? f.getGlobalHitbox() : null;
      if (hb) {
        // Energy motes along the active hitbox
        vfx.motes(hb.x, hb.y, hb.w, hb.h, { color: glow, count: cur === FIGHTER_STATE.ULTIMATE ? 4 : 2, rise: 1.2, size: 2.4 });
        if (f.stateTimer % 3 === 0) {
          vfx.slash(hb.x + hb.w / 2, hb.y + hb.h / 2, { r: Math.max(16, Math.min(40, hb.w * 0.45)), dir, color: glow, life: 8, w: 3 });
        }
      }
      if (!f.isGrounded || Math.abs(f.vx) > 4) {
        if (f.stateTimer % 2 === 0) vfx.speedLines(cx, f.y - 10, { dir: Math.sign(f.vx) || dir, count: 2 });
      }
      if (cur === FIGHTER_STATE.ULTIMATE && f.stateTimer % 2 === 0) {
        vfx.motes(f.x + 10, f.y - 95, 60, 95, { color: glow, count: 3, rise: 3, size: 3 });
      }
    }
    // Rage aura is handled by the fighter; add a subtle glow to fighters with a full meter
    if (f.superMeter >= f.maxSuperMeter && f.stateTimer % 5 === 0 && cur !== FIGHTER_STATE.ULTIMATE) {
      vfx.motes(f.x + 22, f.y - 70, 36, 60, { color: '#ffe066', count: 1, rise: 1.4, size: 1.6 });
    }
  }
}
