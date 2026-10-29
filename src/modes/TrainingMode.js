// Final Impact - Training Lab & Guided Tutorial
// • Training settings menu (F / gamepad SELECT): dummy action, guard, throw tech, record & playback,
//   health/meter refill, input display, hitboxes, damage & frame-advantage readout, position reset.
// • Guided tutorial: a short step-by-step lesson that teaches movement, attacks, specials, blocking,
//   combos, throws, throw techs, Combo Breaker and the Ultimate with live checks.
import { FIGHTER_STATE } from '../engine/Constants.js';
import { input } from '../engine/Input.js';
import { soundFX } from '../audio/SoundFX.js';
import { COLORS, FONTS, drawText, drawKeyCap, slantPath, hexToRgba, ease } from '../ui/Theme.js';

const BLANK = () => ({
  up: false, down: false, left: false, right: false, fwd: false, back: false, dashFwd: false, dashBack: false,
  lp: false, hp: false, lk: false, hk: false, sp1: false, sp2: false, sp3: false, dirty: false,
  lpJust: false, hpJust: false, lkJust: false, hkJust: false, sp1Just: false, sp2Just: false, sp3Just: false,
  dirtyJust: false, ultimateJust: false, throwJust: false
});

const NEUTRAL = new Set([FIGHTER_STATE.IDLE, FIGHTER_STATE.WALK_FWD, FIGHTER_STATE.WALK_BACK, FIGHTER_STATE.CROUCH]);
const isActionable = f => f && f.isGrounded && f.hitStun <= 0 && f.blockStun <= 0 && NEUTRAL.has(f.state);
const center = f => f.x + 40;

const OPTIONS = [
  { key: 'dummy', label: 'DUMMY ACTION', values: ['stand', 'crouch', 'jump', 'cpu', 'playback'], names: { stand: 'Stand', crouch: 'Crouch', jump: 'Jump', cpu: 'CPU Fights Back', playback: 'Play Recording' } },
  { key: 'guard', label: 'DUMMY GUARD', values: ['none', 'all', 'after', 'random'], names: { none: 'No Block', all: 'Block Everything', after: 'Block After 1st Hit', random: 'Random' } },
  { key: 'tech', label: 'THROW TECH', values: ['off', 'on'], names: { off: 'Off', on: 'Always Tech' } },
  { key: 'health', label: 'HEALTH', values: ['refill', 'normal'], names: { refill: 'Refill After Combos', normal: 'Normal' } },
  { key: 'meter', label: 'SUPER METER', values: ['infinite', 'normal'], names: { infinite: 'Always Full', normal: 'Normal' } },
  { key: 'inputs', label: 'INPUT DISPLAY', values: ['on', 'off'], names: { on: 'On', off: 'Off' } },
  { key: 'info', label: 'DAMAGE & FRAME INFO', values: ['on', 'off'], names: { on: 'On', off: 'Off' } },
  { key: 'hitboxes', label: 'HITBOXES', values: ['off', 'on'], names: { off: 'Off', on: 'On' } },
  { key: '_record', label: 'RECORD DUMMY', action: true, hint: 'Control the dummy for up to 10s' },
  { key: '_reset', label: 'RESET POSITIONS', action: true, hint: 'Back to the middle of the stage' },
  { key: '_close', label: 'RESUME', action: true }
];

const ARROWS = { 1: '↙', 2: '↓', 3: '↘', 4: '←', 5: '•', 6: '→', 7: '↖', 8: '↑', 9: '↗' };

// ---------------- Tutorial lessons ----------------
// check(t, game) is evaluated every frame; t.counters/t.flags are reset per step.
const LESSONS = [
  {
    title: 'MOVEMENT', text: 'Walk forward and back. Double-tap a direction to dash.',
    keys: [['A', 'D', 'Walk'], ['D D', 'Dash']], pad: [['STICK', 'Walk'], ['TAP TAP', 'Dash']],
    goals: [['fwdWalk', 25, 'Walk forward'], ['backWalk', 25, 'Walk back'], ['dash', 1, 'Dash']],
    dummy: 'stand', guard: 'none'
  },
  {
    title: 'JUMP & CROUCH', text: 'Jump over things and crouch under them.',
    keys: [['W', 'Jump'], ['S', 'Crouch']], pad: [['UP', 'Jump'], ['DOWN', 'Crouch']],
    goals: [['jump', 2, 'Jump twice'], ['crouch', 30, 'Crouch']],
    dummy: 'stand', guard: 'none'
  },
  {
    title: 'ATTACKS', text: 'Land each of the four basic attacks on the dummy.',
    keys: [['U', 'Light Punch'], ['I', 'Heavy Punch'], ['J', 'Light Kick'], ['K', 'Heavy Kick']],
    pad: [['X', 'LP'], ['Y', 'HP'], ['A', 'LK'], ['B', 'HK']],
    goals: [['hitLP', 1, 'Light Punch'], ['hitHP', 1, 'Heavy Punch'], ['hitLK', 1, 'Light Kick'], ['hitHK', 1, 'Heavy Kick']],
    dummy: 'stand', guard: 'none'
  },
  {
    title: 'SPECIAL MOVES', text: 'Every fighter has three specials on one button each.',
    keys: [['Q', 'Special 1'], ['E', 'Special 2'], ['R', 'Special 3']], pad: [['RB', 'Sp 1'], ['RT', 'Sp 2'], ['LB', 'Sp 3']],
    goals: [['sp1', 1, 'Special 1'], ['sp2', 1, 'Special 2'], ['sp3', 1, 'Special 3']],
    dummy: 'stand', guard: 'none'
  },
  {
    title: 'BLOCKING', text: 'Hold BACK (away from the dummy) to block its attacks.',
    keys: [['A', 'Hold back to block']], pad: [['STICK ←', 'Hold back to block']],
    goals: [['blockHigh', 3, 'Block 3 attacks']],
    dummy: 'scriptHigh', guard: 'none'
  },
  {
    title: 'LOW BLOCK', text: 'Sweeps hit low. Hold DOWN + BACK to block them.',
    keys: [['S', '+'], ['A', 'Crouch block']], pad: [['STICK ↙', 'Crouch block']],
    goals: [['blockLow', 2, 'Block 2 sweeps']],
    dummy: 'scriptLow', guard: 'none'
  },
  {
    title: 'COMBOS', text: 'Light attacks cancel into specials when they hit. Try U, U, then E.',
    keys: [['U', ''], ['U', ''], ['E', 'Combo']], pad: [['X', ''], ['X', ''], ['RT', 'Combo']],
    goals: [['combo3', 1, 'Land a 3-hit combo']],
    dummy: 'stand', guard: 'none'
  },
  {
    title: 'THROWS', text: 'Blocking stops strikes, but not throws. Walk up and grab!',
    keys: [['U+J', 'Throw (up close)']], pad: [['X+A', 'Throw (up close)']],
    goals: [['throwLanded', 1, 'Throw the blocking dummy']],
    dummy: 'stand', guard: 'all'
  },
  {
    title: 'THROW TECH', text: 'The dummy will grab you. Press throw the instant you are caught.',
    keys: [['U+J', 'Tech when grabbed']], pad: [['X+A', 'Tech when grabbed']],
    goals: [['teched', 1, 'Tech a throw']],
    dummy: 'scriptThrow', guard: 'none'
  },
  {
    title: 'COMBO BREAKER', text: 'Being comboed? Spend 50% Super to burst free.',
    keys: [['C', 'While being hit']], pad: [['LT', 'While being hit']],
    goals: [['breaker', 1, 'Break a combo']],
    dummy: 'scriptCombo', guard: 'none', meter: 60
  },
  {
    title: 'ULTIMATE', text: 'A full Super bar unlocks your Ultimate. Get close and unleash it!',
    keys: [['SPACE', 'Ultimate']], pad: [['R3', 'Ultimate']],
    goals: [['ultimateLock', 1, 'Land your Ultimate']],
    dummy: 'stand', guard: 'none', meter: 100
  }
];

export class TrainingController {
  constructor(game) {
    this.game = game;
    this.settings = this.loadSettings();
    this.menuOpen = false;
    this.menuIndex = 0;
    this.recording = false;
    this.recordBuffer = [];
    this.recordedInputs = [];
    this.playbackIndex = 0;
    this.inputLog = [];
    this.lastHit = null;
    this.lastCombo = null;
    this.frameAdv = null;
    this.advTrack = null;
    this.calmFrames = 0;
    this.afterHitGuard = 0;
    this.frame = 0;
    this.tutorial = null;
    this.toast = null;
    this.randomGuardRoll = false;
  }

  // ---------- persistence ----------
  loadSettings() {
    const def = { dummy: 'stand', guard: 'none', tech: 'off', health: 'refill', meter: 'infinite', inputs: 'on', info: 'on', hitboxes: 'off' };
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('final_impact_training') : null;
      if (raw) return { ...def, ...JSON.parse(raw) };
    } catch (e) {}
    return def;
  }

  saveSettings() {
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('final_impact_training', JSON.stringify(this.settings)); } catch (e) {}
  }

  // ---------- lifecycle ----------
  startSession({ tutorial = false } = {}) {
    this.menuOpen = false;
    this.recording = false;
    this.playbackIndex = 0;
    this.inputLog = [];
    this.lastHit = null;
    this.lastCombo = null;
    this.frameAdv = null;
    this.advTrack = null;
    this.toast = null;
    this.tutorial = tutorial ? { step: 0, counters: {}, done: false, stepT: 0, completeT: 0, finished: false } : null;
    if (this.tutorial) this.applyLessonSetup();
    this.game.showHitboxes = !tutorial && this.settings.hitboxes === 'on';
  }

  get active() {
    return !!(this.game && this.game.isTraining && this.game.f1 && this.game.f2);
  }

  isPaused() {
    return this.menuOpen;
  }

  toggleMenu() {
    if (this.tutorial) return;
    if (this.recording) { this.stopRecording(); return; }
    this.menuOpen = !this.menuOpen;
    this.menuIndex = 0;
    soundFX.playMenuSelect && soundFX.playMenuSelect();
  }

  // Menu navigation while paused (called from Game.update)
  updateMenu(nav) {
    if (!this.menuOpen) return;
    const opt = OPTIONS[this.menuIndex];
    if (nav.up) { this.menuIndex = (this.menuIndex - 1 + OPTIONS.length) % OPTIONS.length; this.tick(); }
    else if (nav.down) { this.menuIndex = (this.menuIndex + 1) % OPTIONS.length; this.tick(); }
    else if ((nav.left || nav.right) && !opt.action) {
      const vals = opt.values;
      const i = vals.indexOf(this.settings[opt.key]);
      this.settings[opt.key] = vals[(i + (nav.right ? 1 : vals.length - 1)) % vals.length];
      if (opt.key === 'hitboxes') this.game.showHitboxes = this.settings.hitboxes === 'on';
      if (opt.key === 'dummy' && this.settings.dummy === 'playback' && !this.recordedInputs.length) {
        this.flash('Nothing recorded yet — use RECORD DUMMY first');
      }
      this.saveSettings();
      this.tick();
    } else if (nav.confirm) {
      if (opt.key === '_record') this.startRecording();
      else if (opt.key === '_reset') { this.resetPositions(); this.menuOpen = false; }
      else if (opt.key === '_close') this.menuOpen = false;
      else {
        const vals = opt.values;
        const i = vals.indexOf(this.settings[opt.key]);
        this.settings[opt.key] = vals[(i + 1) % vals.length];
        if (opt.key === 'hitboxes') this.game.showHitboxes = this.settings.hitboxes === 'on';
        this.saveSettings();
      }
      this.tick();
    } else if (nav.back) {
      this.menuOpen = false;
    }
  }

  tick() { try { (soundFX.playMenuMove || soundFX.playMenuSelect).call(soundFX); } catch (e) {} }

  flash(text, color = COLORS.gold) { this.toast = { text, color, t: 120 }; }

  resetPositions() {
    const g = this.game;
    const f1 = g.f1, f2 = g.f2;
    [f1, f2].forEach(f => {
      f.vx = 0; f.vy = 0; f.y = 300; f.isGrounded = true; f.hitStun = 0; f.blockStun = 0;
      f.isInvincible = false; f.changeState(FIGHTER_STATE.IDLE, true);
      f.comboHits = 0; f.comboDamage = 0;
      f.health = f.maxHealth;
    });
    f1.x = 360; f2.x = 520;
    f1.facingRight = true; f2.facingRight = false;
    g.projectiles.forEach(p => p.destroy && p.destroy());
    g.projectiles = [];
    if (g.updateCamera) g.updateCamera(true);
  }

  startRecording() {
    this.menuOpen = false;
    this.recording = true;
    this.recordBuffer = [];
    this.settings.dummy = 'stand';
    this.flash('RECORDING — you control the dummy. Press F to stop.', COLORS.crimson);
  }

  stopRecording() {
    this.recording = false;
    this.recordedInputs = this.recordBuffer.slice();
    this.recordBuffer = [];
    if (this.recordedInputs.length > 10) {
      this.settings.dummy = 'playback';
      this.playbackIndex = 0;
      this.saveSettings();
      this.flash(`Recorded ${(this.recordedInputs.length / 60).toFixed(1)}s — dummy now plays it back`, COLORS.good);
    } else {
      this.flash('Recording too short', COLORS.warn);
    }
  }

  // ---------- per-frame hooks ----------
  // Input for the player character (blank while the player is driving the dummy)
  playerInput(raw) {
    if (this.recording) return BLANK();
    return raw;
  }

  // Input for the dummy (f2)
  dummyInput(dummy, player, ai) {
    const s = BLANK();
    const toRight = center(player) > center(dummy);
    const holdBack = () => { s.back = true; s.left = toRight; s.right = !toRight; };
    const holdFwd = () => { s.fwd = true; s.right = toRight; s.left = !toRight; };

    if (this.recording) {
      const st = input.getState(1, dummy.facingRight);
      const rec = {};
      for (const k of Object.keys(BLANK())) rec[k] = !!st[k];
      this.recordBuffer.push(rec);
      if (this.recordBuffer.length >= 600) this.stopRecording();
      return st;
    }

    const mode = this.tutorial ? LESSONS[this.tutorial.step]?.dummy : this.settings.dummy;
    const guard = this.tutorial ? LESSONS[this.tutorial.step]?.guard : this.settings.guard;

    // Guard logic (shared by every dummy action)
    const threat = player.isAttacking && player.isAttacking();
    const projectileIncoming = (this.game.projectiles || []).some(p => p.active && p.owner === player && Math.abs((p.x + 16) - center(dummy)) < 200);
    let wantGuard = false;
    if (guard === 'all') wantGuard = true;
    else if (guard === 'after') wantGuard = (dummy.comboHits || 0) > 0 || dummy.blockStun > 0 || this.afterHitGuard > 0;
    else if (guard === 'random') {
      if (threat && player.stateTimer <= 1) this.randomGuardRoll = Math.random() < 0.5;
      wantGuard = this.randomGuardRoll;
    }
    if (wantGuard && (threat || projectileIncoming || dummy.blockStun > 0)) {
      holdBack();
      const low = player.state && (player.state.startsWith('CROUCH_') || (player.currentAttackData && player.currentAttackData.height === 'LOW'));
      s.down = !!low;
      if (threat || projectileIncoming || dummy.blockStun > 0) return s;
    }

    switch (mode) {
      case 'crouch': s.down = true; break;
      case 'jump': if (dummy.isGrounded && dummy.state === FIGHTER_STATE.IDLE) s.up = true; break;
      case 'cpu': return ai ? ai.update(dummy, player) : s;
      case 'playback': {
        if (!this.recordedInputs.length) break;
        const rec = this.recordedInputs[this.playbackIndex % this.recordedInputs.length];
        this.playbackIndex++;
        // Recording was relative to the dummy's facing then; fwd/back stay relative now
        Object.assign(s, rec);
        s.right = rec.fwd ? toRight : (rec.back ? !toRight : false);
        s.left = rec.fwd ? !toRight : (rec.back ? toRight : false);
        break;
      }
      case 'scriptHigh':
      case 'scriptLow': {
        const dist = Math.abs(center(player) - center(dummy));
        const t = this.frame % 42;
        if (dist > 88) holdFwd();
        else if (t === 0) {
          if (mode === 'scriptLow') { s.down = true; s.hk = s.hkJust = true; }
          else { s.hp = s.hpJust = true; }
        } else if (mode === 'scriptLow' && t < 4) s.down = true;
        break;
      }
      case 'scriptThrow': {
        const dist = Math.abs(center(player) - center(dummy));
        if (dist > 55) holdFwd();
        else if (this.frame % 50 === 0) { s.throwJust = true; s.lpJust = true; s.lp = true; s.lk = true; }
        break;
      }
      case 'scriptCombo': {
        const dist = Math.abs(center(player) - center(dummy));
        const t = this.frame % 16;
        if (dummy.isAttacking && dummy.isAttacking() && dummy.hasHitThisAttack) {
          // keep the chain going
          if (dummy.stateTimer >= 6) { if (dummy.state === FIGHTER_STATE.ATTACK_LIGHT_PUNCH) { s.lp = s.lpJust = true; } }
        } else if (dist > 80) holdFwd();
        else if (t === 0) { s.lp = s.lpJust = true; }
        break;
      }
      default: break;
    }
    return s;
  }

  // Health / meter / stamina rules (replaces the old "refill every frame")
  applyResources() {
    const g = this.game;
    const f1 = g.f1, f2 = g.f2;
    const lesson = this.tutorial ? LESSONS[this.tutorial.step] : null;
    f1.stamina = f1.maxStamina;
    f2.stamina = f2.maxStamina;
    if (lesson) {
      if (lesson.meter !== undefined && f1.superMeter < lesson.meter && !(f1.state === FIGHTER_STATE.ULTIMATE)) {
        if (lesson.meter >= 100 || (f1.comboHits || 0) === 0) f1.superMeter = Math.max(f1.superMeter, lesson.meter);
      }
    } else if (this.settings.meter === 'infinite' && f1.state !== FIGHTER_STATE.ULTIMATE) {
      f1.superMeter = f1.maxSuperMeter;
    }
    const calm = !g.combat.isInCombo(f1) && !g.combat.isInCombo(f2) && f1.state !== FIGHTER_STATE.KNOCKDOWN && f2.state !== FIGHTER_STATE.KNOCKDOWN;
    this.calmFrames = calm ? this.calmFrames + 1 : 0;
    if ((this.settings.health === 'refill' || lesson) && this.calmFrames === 40) {
      f1.health = f1.maxHealth;
      f2.health = f2.maxHealth;
      if (g.hud) { g.hud.p1RedHealth = f1.health; g.hud.p2RedHealth = f2.health; }
    }
    // Nobody dies in the lab
    [f1, f2].forEach(f => { if (f.health < 1) f.health = 1; });
    if (this.afterHitGuard > 0) this.afterHitGuard--;
  }

  // Called after every frame of fight simulation
  update() {
    const g = this.game;
    if (!this.active) return;
    this.frame++;
    if (this.toast && --this.toast.t <= 0) this.toast = null;
    this.recordInputDisplay();
    this.trackFrameAdvantage();
    if (this.tutorial) this.updateTutorial();
    const f1 = g.f1;
    // Combo summary once a combo ends
    const f2 = g.f2;
    if (f2.comboHits > 0) this.liveCombo = { hits: f2.comboHits, dmg: f2.comboDamage };
    else if (this.liveCombo) { this.lastCombo = this.liveCombo; this.liveCombo = null; this.afterHitGuard = 45; }
    if (f1.state === FIGHTER_STATE.WALK_FWD && this.tutorial) this.count('fwdWalk');
    if (f1.state === FIGHTER_STATE.WALK_BACK && this.tutorial) this.count('backWalk');
    if (f1.state === FIGHTER_STATE.CROUCH && this.tutorial) this.count('crouch');
  }

  recordInputDisplay() {
    const g = this.game;
    const st = this.recording ? input.getState(1, g.f2.facingRight) : input.getState(1, g.f1.facingRight);
    const btns = [];
    if (st.lp) btns.push('LP'); if (st.hp) btns.push('HP'); if (st.lk) btns.push('LK'); if (st.hk) btns.push('HK');
    if (st.sp1) btns.push('S1'); if (st.sp2) btns.push('S2'); if (st.sp3) btns.push('S3');
    if (st.dirty) btns.push('DT');
    if (st.ultimateJust) btns.push('UL');
    const key = st.dir + '|' + btns.join(',');
    const top = this.inputLog[0];
    if (top && top.key === key) top.frames++;
    else {
      this.inputLog.unshift({ key, dir: st.dir, btns, frames: 1 });
      if (this.inputLog.length > 14) this.inputLog.pop();
    }
  }

  trackFrameAdvantage() {
    const t = this.advTrack;
    if (!t) return;
    const g = this.game;
    t.age++;
    if (t.attReady === null && isActionable(t.att)) t.attReady = t.age;
    if (t.defReady === null && isActionable(t.def)) t.defReady = t.age;
    if (t.attReady !== null && t.defReady !== null) {
      this.frameAdv = { value: t.defReady - t.attReady, kind: t.kind };
      this.advTrack = null;
    } else if (t.age > 180) {
      this.advTrack = null;
    }
    void g;
  }

  // From CombatDirector after every resolved hit
  onHit(attacker, defender, result, info) {
    if (!this.active) return;
    const g = this.game;
    if (attacker === g.f1) {
      if (result !== 'blocked' && result !== 'armored') {
        this.lastHit = { dmg: info.dealt, base: info.base, scale: info.scale, counter: info.counter, crit: info.crit, state: attacker.state };
      } else if (result === 'blocked') {
        this.lastHit = { dmg: 0, base: info.base, scale: 1, blocked: true, state: attacker.state };
      }
      this.advTrack = { att: attacker, def: defender, age: 0, attReady: null, defReady: null, kind: result === 'blocked' ? 'block' : 'hit' };
      if (this.tutorial && result !== 'blocked') {
        const map = { ATTACK_LP: 'hitLP', ATTACK_HP: 'hitHP', ATTACK_LK: 'hitLK', ATTACK_HK: 'hitHK', CROUCH_LP: 'hitLP', CROUCH_HP: 'hitHP', CROUCH_LK: 'hitLK', CROUCH_HK: 'hitHK' };
        if (map[attacker.state]) this.count(map[attacker.state]);
        if ((defender.comboHits || 0) >= 3) this.count('combo3');
      }
    } else if (defender === g.f1 && this.tutorial && result === 'blocked') {
      const low = attacker.state && attacker.state.startsWith('CROUCH_');
      this.count(low ? 'blockLow' : 'blockHigh');
    }
  }

  onEvent(type, actor) {
    if (!this.active || !this.tutorial) return;
    const g = this.game;
    if (type === 'throw' && actor === g.f1) this.count('throwLanded');
    if (type === 'tech' && actor === g.f1) this.count('teched');
    if (type === 'breaker' && actor === g.f1) this.count('breaker');
    if (type === 'ultimateLock' && actor === g.f1) this.count('ultimateLock');
    if (type === 'dash' && actor === g.f1) this.count('dash');
    if (type === 'jump' && actor === g.f1) this.count('jump');
    if (type === 'special' && actor === g.f1) this.count(actor.state === FIGHTER_STATE.SPECIAL_1 ? 'sp1' : (actor.state === FIGHTER_STATE.SPECIAL_2 ? 'sp2' : 'sp3'));
  }

  // Throw tech decision for the dummy
  dummyTechs() {
    return !this.tutorial && this.settings.tech === 'on';
  }

  // ---------- tutorial ----------
  count(key) {
    if (!this.tutorial || this.tutorial.done) return;
    this.tutorial.counters[key] = (this.tutorial.counters[key] || 0) + 1;
  }

  applyLessonSetup() {
    const g = this.game;
    const lesson = LESSONS[this.tutorial.step];
    if (!lesson) return;
    if (g.f1 && g.f2) {
      this.resetPositions();
      if (String(lesson.dummy).startsWith('script')) { g.f1.x = 380; g.f2.x = 470; }
      g.f1.superMeter = lesson.meter || 0;
    }
  }

  updateTutorial() {
    const tut = this.tutorial;
    if (tut.finished) return;
    tut.stepT++;
    const lesson = LESSONS[tut.step];
    if (!lesson) return;
    if (!tut.done) {
      const complete = lesson.goals.every(([k, n]) => (tut.counters[k] || 0) >= n);
      if (complete) {
        tut.done = true;
        tut.completeT = 0;
        try { (soundFX.playTutorialStep || soundFX.playSuperReady).call(soundFX); } catch (e) {}
      }
    } else {
      tut.completeT++;
      if (tut.completeT > 75) this.nextLesson();
    }
  }

  nextLesson() {
    const tut = this.tutorial;
    tut.step++;
    tut.counters = {};
    tut.done = false;
    tut.stepT = 0;
    if (tut.step >= LESSONS.length) {
      tut.finished = true;
      tut.finishT = 0;
      try { localStorage.setItem('final_impact_tutorial_done', 'true'); } catch (e) {}
      try { (soundFX.playUnlock || soundFX.playGong).call(soundFX); } catch (e) {}
      return;
    }
    this.applyLessonSetup();
  }

  skipLesson() {
    if (!this.tutorial || this.tutorial.finished) return false;
    this.nextLesson();
    return true;
  }

  // ---------- rendering ----------
  render(ctx, W, H) {
    if (!this.active) return;
    ctx.save();
    if (this.settings.inputs === 'on' || this.tutorial) this.renderInputDisplay(ctx, H);
    if (!this.tutorial && this.settings.info === 'on') this.renderInfo(ctx, W);
    if (this.tutorial) this.renderTutorial(ctx, W, H);
    else this.renderLabBar(ctx, W, H);
    if (this.recording) {
      const blink = Math.floor(this.frame / 20) % 2 === 0;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      slantPath(ctx, W / 2 - 92, 50, 184, 18, 6); ctx.fill();
      ctx.fillStyle = blink ? COLORS.crimson : '#5a0a14';
      ctx.beginPath(); ctx.arc(W / 2 - 74, 59, 4, 0, Math.PI * 2); ctx.fill();
      drawText(ctx, `REC  ${(this.recordBuffer.length / 60).toFixed(1)}s / 10s`, W / 2 + 6, 63, { font: FONTS.ui(9, 900), color: COLORS.text, align: 'center' });
    }
    if (this.toast) {
      const a = Math.min(1, this.toast.t / 20);
      ctx.globalAlpha = a;
      ctx.font = FONTS.ui(9, 900);
      const tw = ctx.measureText(this.toast.text).width + 28;
      ctx.fillStyle = 'rgba(8,7,12,0.9)';
      slantPath(ctx, W / 2 - tw / 2, 74, tw, 18, 6); ctx.fill();
      ctx.fillStyle = this.toast.color;
      ctx.fillRect(W / 2 - tw / 2 + 6, 74, 3, 18);
      drawText(ctx, this.toast.text, W / 2 + 3, 87, { font: FONTS.ui(9, 900), color: this.toast.color, align: 'center' });
      ctx.globalAlpha = 1;
    }
    if (this.menuOpen) this.renderMenu(ctx, W, H);
    ctx.restore();
  }

  renderInputDisplay(ctx, H) {
    const x = 10;
    let y = 128;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(x - 4, y - 12, 92, Math.min(14, this.inputLog.length) * 13 + 16);
    drawText(ctx, 'INPUTS', x, y - 2, { font: FONTS.ui(7, 900), color: COLORS.textDim, letterSpacing: 1.5 });
    y += 10;
    this.inputLog.slice(0, 14).forEach((e, i) => {
      ctx.globalAlpha = 1 - i * 0.055;
      drawText(ctx, String(Math.min(99, e.frames)).padStart(2, ' '), x + 12, y, { font: FONTS.mono(8, 700), color: COLORS.textMute, align: 'right' });
      drawText(ctx, ARROWS[e.dir] || '•', x + 22, y, { font: FONTS.ui(10, 900), color: e.dir === 5 ? COLORS.textMute : COLORS.text, align: 'center' });
      let bx = x + 32;
      e.btns.forEach(b => {
        const col = b.startsWith('S') || b === 'UL' ? COLORS.gold : (b === 'DT' ? COLORS.warn : (b.startsWith('L') ? COLORS.p1 : COLORS.p2));
        ctx.fillStyle = hexToRgba(col, 0.25);
        ctx.fillRect(bx, y - 8, 14, 10);
        drawText(ctx, b, bx + 7, y, { font: FONTS.ui(6.5, 900), color: col, align: 'center' });
        bx += 16;
      });
      y += 13;
    });
    ctx.restore();
  }

  renderInfo(ctx, W) {
    const x = W - 168;
    const y = 72;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(x, y, 158, 56);
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(x, y, 2, 56);
    const row = (label, value, yy, col = COLORS.text) => {
      drawText(ctx, label, x + 8, yy, { font: FONTS.ui(7, 800), color: COLORS.textDim });
      drawText(ctx, value, x + 150, yy, { font: FONTS.ui(8, 900), color: col, align: 'right' });
    };
    const lh = this.lastHit;
    row('LAST HIT', lh ? (lh.blocked ? 'BLOCKED' : `${lh.dmg} dmg${lh.scale < 0.99 ? ` (${Math.round(lh.scale * 100)}%)` : ''}${lh.counter ? ' COUNTER' : ''}${lh.crit ? ' CRIT' : ''}`) : '—', y + 12);
    const lc = this.liveCombo || this.lastCombo;
    row(this.liveCombo ? 'COMBO' : 'LAST COMBO', lc ? `${lc.hits} hits · ${Math.round(lc.dmg)} dmg` : '—', y + 25);
    const fa = this.frameAdv;
    const advTxt = fa ? `${fa.value > 0 ? '+' : ''}${fa.value} on ${fa.kind}` : '—';
    row('FRAME ADVANTAGE', advTxt, y + 38, fa ? (fa.value > 0 ? COLORS.good : (fa.value < 0 ? COLORS.bad : COLORS.text)) : COLORS.text);
    const opt = (k) => OPTIONS.find(o => o.key === k);
    row('DUMMY', `${opt('dummy').names[this.settings.dummy]} · ${opt('guard').names[this.settings.guard]}`, y + 51, COLORS.meter);
    ctx.restore();
  }

  renderLabBar(ctx, W, H) {
    if (this.menuOpen) return;
    const pad = input.hasGamepadConnected && input.hasGamepadConnected();
    const label = pad ? 'SELECT' : 'F';
    ctx.save();
    const x = 10, y = H - 66;
    const w = drawKeyCap(ctx, label, x, y, { h: 11, font: FONTS.ui(7, 900) });
    drawText(ctx, this.recording ? 'Stop recording' : 'Training settings', x + w + 4, y + 8.5, { font: FONTS.ui(7.5, 800), color: COLORS.textDim, outline: 2 });
    ctx.restore();
  }

  renderMenu(ctx, W, H) {
    ctx.save();
    ctx.fillStyle = 'rgba(3, 2, 8, 0.72)';
    ctx.fillRect(0, 0, W, H);
    const pw = 330, rowH = 21;
    const ph = 46 + OPTIONS.length * rowH + 22;
    const px = (W - pw) / 2, py = (H - ph) / 2;
    ctx.fillStyle = 'rgba(14, 12, 20, 0.97)';
    slantPath(ctx, px, py, pw, ph, 10); ctx.fill();
    ctx.strokeStyle = hexToRgba(COLORS.gold, 0.5); ctx.lineWidth = 1; ctx.stroke();
    drawText(ctx, 'TRAINING SETTINGS', px + 22, py + 26, { font: FONTS.display(17), color: COLORS.text });
    drawText(ctx, 'GAME PAUSED', px + pw - 22, py + 25, { font: FONTS.ui(7.5, 800), color: COLORS.gold, align: 'right', letterSpacing: 1.5 });
    OPTIONS.forEach((o, i) => {
      const y = py + 40 + i * rowH;
      const sel = i === this.menuIndex;
      if (sel) {
        ctx.fillStyle = hexToRgba(COLORS.gold, 0.16);
        slantPath(ctx, px + 14, y, pw - 28, rowH - 3, 5); ctx.fill();
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(px + 16, y + 2, 2, rowH - 7);
      }
      drawText(ctx, o.label, px + 26, y + 12.5, { font: FONTS.ui(8.5, 900), color: sel ? COLORS.text : COLORS.textDim });
      if (o.action) {
        if (o.hint) drawText(ctx, o.hint, px + pw - 26, y + 12.5, { font: FONTS.ui(7.5, 700), color: COLORS.textMute, align: 'right' });
      } else {
        const v = o.names[this.settings[o.key]];
        drawText(ctx, sel ? `◀  ${v}  ▶` : v, px + pw - 26, y + 12.5, { font: FONTS.ui(8.5, 900), color: sel ? COLORS.gold : COLORS.text, align: 'right' });
      }
    });
    const pad = input.hasGamepadConnected && input.hasGamepadConnected();
    drawText(ctx, pad ? 'D-PAD navigate · ◀ ▶ change · A select · SELECT close' : 'W/S navigate · A/D change · ENTER select · F close',
      W / 2, py + ph - 10, { font: FONTS.ui(7.5, 700), color: COLORS.textMute, align: 'center' });
    ctx.restore();
  }

  renderTutorial(ctx, W, H) {
    const tut = this.tutorial;
    const pad = input.hasGamepadConnected && input.hasGamepadConnected();
    ctx.save();
    if (tut.finished) {
      tut.finishT = (tut.finishT || 0) + 1;
      const a = Math.min(1, tut.finishT / 20);
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(3, 2, 8, 0.72)';
      ctx.fillRect(0, 0, W, H);
      drawText(ctx, 'TUTORIAL COMPLETE', W / 2, H / 2 - 30, { font: FONTS.display(30), color: COLORS.goldPale, align: 'center', outline: 5 });
      drawText(ctx, "You know everything you need. Now go win some fights.", W / 2, H / 2 - 6, { font: FONTS.ui(10, 700), color: COLORS.text, align: 'center' });
      drawText(ctx, 'TIP: Practice Mode has a dummy you can record, set to block, and more (press F).', W / 2, H / 2 + 12, { font: FONTS.ui(8.5, 700), color: COLORS.textDim, align: 'center' });
      drawText(ctx, pad ? 'Press A to return to the menu' : 'Press ENTER to return to the menu', W / 2, H / 2 + 40, { font: FONTS.ui(9, 900), color: COLORS.gold, align: 'center' });
      ctx.restore();
      return;
    }
    const lesson = LESSONS[tut.step];
    const pw = 360, ph = 74;
    const px = (W - pw) / 2, py = 58;
    const slide = ease.outCubic(Math.min(1, tut.stepT / 14));
    ctx.translate(0, (1 - slide) * -20);
    ctx.globalAlpha = slide;
    ctx.fillStyle = 'rgba(10, 8, 16, 0.9)';
    slantPath(ctx, px, py, pw, ph, 10); ctx.fill();
    ctx.strokeStyle = tut.done ? COLORS.good : hexToRgba(COLORS.gold, 0.45);
    ctx.lineWidth = tut.done ? 1.5 : 1;
    ctx.stroke();
    drawText(ctx, `LESSON ${tut.step + 1} / ${LESSONS.length}`, px + 20, py + 14, { font: FONTS.ui(7, 900), color: COLORS.gold, letterSpacing: 1.5 });
    drawText(ctx, lesson.title, px + 20, py + 31, { font: FONTS.display(16), color: tut.done ? COLORS.good : COLORS.text });
    drawText(ctx, lesson.text, px + 20, py + 45, { font: FONTS.ui(8.5, 700), color: COLORS.textDim, maxWidth: pw - 40 });
    // Key prompts
    let kx = px + 20;
    (pad ? lesson.pad : lesson.keys).forEach(k => {
      k.slice(0, -1).forEach(key => { kx += drawKeyCap(ctx, key, kx, py + 52, { h: 12, font: FONTS.ui(7.5, 900) }) + 3; });
      const lbl = k[k.length - 1];
      if (lbl) {
        drawText(ctx, lbl, kx + 1, py + 61, { font: FONTS.ui(7.5, 800), color: COLORS.text });
        ctx.font = FONTS.ui(7.5, 800);
        kx += ctx.measureText(lbl).width + 12;
      }
    });
    // Goals (right side)
    let gy = py + 14;
    lesson.goals.forEach(([k, n, label]) => {
      const have = Math.min(n, tut.counters[k] || 0);
      const done = have >= n;
      const gx = px + pw - 20;
      drawText(ctx, done ? '✔' : '○', gx, gy, { font: FONTS.ui(8, 900), color: done ? COLORS.good : COLORS.textMute, align: 'right' });
      const txt = n > 3 && !done ? `${label}` : (n > 1 ? `${label} ${have}/${n}` : label);
      drawText(ctx, txt, gx - 12, gy, { font: FONTS.ui(7.5, 800), color: done ? COLORS.good : COLORS.text, align: 'right' });
      gy += 11;
    });
    if (tut.done) {
      drawText(ctx, 'NICE!', W / 2, py + ph + 22, { font: FONTS.display(20), color: COLORS.good, align: 'center', outline: 4 });
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    // Skip / quit hint
    const sx = 10, sy = H - 66;
    const w1 = drawKeyCap(ctx, pad ? 'SELECT' : 'ENTER', sx, sy, { h: 11, font: FONTS.ui(7, 900) });
    drawText(ctx, 'Skip lesson', sx + w1 + 4, sy + 8.5, { font: FONTS.ui(7.5, 800), color: COLORS.textDim, outline: 2 });
    const w2 = drawKeyCap(ctx, pad ? 'START' : 'P', sx + w1 + 62, sy, { h: 11, font: FONTS.ui(7, 900) });
    drawText(ctx, 'Pause / quit', sx + w1 + 62 + w2 + 4, sy + 8.5, { font: FONTS.ui(7.5, 800), color: COLORS.textDim, outline: 2 });
  }
}

export const TUTORIAL_LESSONS = LESSONS;
export const TRAINING_OPTIONS = OPTIONS;
