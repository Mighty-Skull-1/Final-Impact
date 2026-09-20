// Final Impact - Advanced Responsive Input Engine
// Features leading-edge triggers, 8-frame input buffering, double-tap dashing, and Naruto-style Ultimate input

import { DEFAULT_CONTROLS } from './Constants.js';

export class InputManager {
  constructor() {
    this.keys = {};
    this.justPressed = {};
    this.p1Buffer = [];
    this.p2Buffer = [];
    this.bufferMaxLength = 30;

    // Double tap dash trackers
    this.p1LastFwdTap = 0;
    this.p1LastBackTap = 0;
    this.p1DashFwd = false;
    this.p1DashBack = false;

    this.p2LastFwdTap = 0;
    this.p2LastBackTap = 0;
    this.p2DashFwd = false;
    this.p2DashBack = false;

    // Charge trackers
    this.p1ChargeBack = 0;
    this.p1ChargeDown = 0;
    this.p2ChargeBack = 0;
    this.p2ChargeDown = 0;

    // Action input queue (8-frame buffer for buttery-smooth combos)
    this.p1ActionQueue = [];
    this.p2ActionQueue = [];

    // Easy input mode toggle
    this.easyInputs = false;

    // Configurable Keybindings
    this.controls = {
      P1: { ...DEFAULT_CONTROLS.P1 },
      P2: { ...DEFAULT_CONTROLS.P2 }
    };
    this.loadCustomControls();

    // Frame-cached states for consistent leading-edge triggers across the 60fps tick
    this.p1CurrentState = null;
    this.p2CurrentState = null;

    // Listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.onKeyDown.bind(this));
      window.addEventListener('keyup', this.onKeyUp.bind(this));
    }
  }

  loadCustomControls() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('final_impact_custom_controls');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.P1) this.controls.P1 = { ...this.controls.P1, ...parsed.P1 };
          if (parsed.P2) this.controls.P2 = { ...this.controls.P2, ...parsed.P2 };
        }
      }
    } catch (e) {
      console.warn('Failed to load custom controls', e);
    }
  }

  saveCustomControls() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('final_impact_custom_controls', JSON.stringify(this.controls));
      }
    } catch (e) {}
  }

  setKeybind(playerNum, action, keyCode) {
    const pKey = playerNum === 1 ? 'P1' : 'P2';
    if (this.controls[pKey]) {
      this.controls[pKey][action] = keyCode;
      if (action === 'QUICK_SP1') this.controls[pKey].SP1 = keyCode;
      if (action === 'QUICK_SP2') this.controls[pKey].SP2 = keyCode;
      if (action === 'QUICK_SP3') this.controls[pKey].SP3 = keyCode;
      this.saveCustomControls();
    }
  }

  resetDefaultControls() {
    this.controls = {
      P1: { ...DEFAULT_CONTROLS.P1 },
      P2: { ...DEFAULT_CONTROLS.P2 }
    };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('final_impact_custom_controls');
      }
    } catch (e) {}
  }

  endFrame() {
    this.p1CurrentState = null;
    this.p2CurrentState = null;
    for (const k of Object.keys(this.justPressed)) {
      this.justPressed[k] = false;
    }
  }

  onKeyDown(e) {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Escape'].includes(e.code)) {
      e.preventDefault();
    }
    if (!this.keys[e.code]) {
      this.justPressed[e.code] = true;
    }
    this.keys[e.code] = true;
  }

  onKeyUp(e) {
    this.keys[e.code] = false;
    this.justPressed[e.code] = false;
  }

  isDown(code) {
    return !!this.keys[code];
  }

  isJustPressed(code) {
    return !!this.justPressed[code];
  }

  consumeKey(code) {
    this.justPressed[code] = false;
  }

  // Poll Gamepad
  pollGamepad(playerIndex = 0) {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[playerIndex];
    if (!gp) return null;

    const dpadUp = gp.buttons[12]?.pressed || gp.axes[1] < -0.5;
    const dpadDown = gp.buttons[13]?.pressed || gp.axes[1] > 0.5;
    const dpadLeft = gp.buttons[14]?.pressed || gp.axes[0] < -0.5;
    const dpadRight = gp.buttons[15]?.pressed || gp.axes[0] > 0.5;

    return {
      up: dpadUp,
      down: dpadDown,
      left: dpadLeft,
      right: dpadRight,
      lp: gp.buttons[2]?.pressed,   // Square / X
      hp: gp.buttons[3]?.pressed,   // Triangle / Y
      sp1: gp.buttons[5]?.pressed,  // R1 / RB
      lk: gp.buttons[0]?.pressed,   // Cross / A
      hk: gp.buttons[1]?.pressed,   // Circle / B
      sp2: gp.buttons[7]?.pressed,  // R2 / RT
      ultimate: gp.buttons[4]?.pressed && gp.buttons[5]?.pressed, // L1 + R1
      start: gp.buttons[9]?.pressed
    };
  }

  // Get current frame state
  getState(playerNum = 1, facingRight = true) {
    const isP1 = playerNum === 1;
    const ctrl = isP1 ? this.controls.P1 : this.controls.P2;
    const gp = this.pollGamepad(isP1 ? 0 : 1);

    const rawUp = this.isDown(ctrl.UP) || gp?.up;
    const rawDown = this.isDown(ctrl.DOWN) || gp?.down;
    const rawLeft = this.isDown(ctrl.LEFT) || gp?.left;
    const rawRight = this.isDown(ctrl.RIGHT) || gp?.right;

    const fwd = facingRight ? rawRight : rawLeft;
    const back = facingRight ? rawLeft : rawRight;

    // Continuous button hold
    const lp = this.isDown(ctrl.LP) || gp?.lp;
    const hp = this.isDown(ctrl.HP) || gp?.hp;
    const lk = this.isDown(ctrl.LK) || gp?.lk;
    const hk = this.isDown(ctrl.HK) || gp?.hk;
    const sp1 = this.isDown(ctrl.SP1) || (ctrl.QUICK_SP1 && this.isDown(ctrl.QUICK_SP1)) || gp?.sp1;
    const sp2 = this.isDown(ctrl.SP2) || (ctrl.QUICK_SP2 && this.isDown(ctrl.QUICK_SP2)) || gp?.sp2;
    const sp3 = (ctrl.SP3 && this.isDown(ctrl.SP3)) || (ctrl.QUICK_SP3 && this.isDown(ctrl.QUICK_SP3));
    const dirty = (ctrl.DIRTY && this.isDown(ctrl.DIRTY)) || gp?.dirty;
    const start = this.isDown(ctrl.START) || gp?.start;

    // Leading-edge triggers (Just Pressed this frame!)
    const lpJust = this.isJustPressed(ctrl.LP);
    const hpJust = this.isJustPressed(ctrl.HP);
    const lkJust = this.isJustPressed(ctrl.LK);
    const hkJust = this.isJustPressed(ctrl.HK);
    const sp1Just = this.isJustPressed(ctrl.SP1) || (ctrl.QUICK_SP1 && this.isJustPressed(ctrl.QUICK_SP1));
    const sp2Just = this.isJustPressed(ctrl.SP2) || (ctrl.QUICK_SP2 && this.isJustPressed(ctrl.QUICK_SP2));
    const sp3Just = (ctrl.SP3 && this.isJustPressed(ctrl.SP3)) || (ctrl.QUICK_SP3 && this.isJustPressed(ctrl.QUICK_SP3));
    const dirtyJust = (ctrl.DIRTY && this.isJustPressed(ctrl.DIRTY)) || this.checkDownDownPunch(playerNum);

    // Naruto Ultimate Activation: Configured key, Spacebar (for P1), HP+HK, or Gamepad trigger
    const ultimateJust = (ctrl.ULTIMATE && this.isJustPressed(ctrl.ULTIMATE)) ||
      (isP1 && this.isJustPressed('Space')) ||
      (this.isDown(ctrl.HP) && this.isDown(ctrl.HK)) ||
      gp?.ultimate;

    // Directional notation (1-9)
    let dir = 5;
    if (rawDown) {
      if (back) dir = 1;
      else if (fwd) dir = 3;
      else dir = 2;
    } else if (rawUp) {
      if (back) dir = 7;
      else if (fwd) dir = 9;
      else dir = 8;
    } else {
      if (back) dir = 4;
      else if (fwd) dir = 6;
      else dir = 5;
    }

    const dashFwd = isP1 ? this.p1DashFwd : this.p2DashFwd;
    const dashBack = isP1 ? this.p1DashBack : this.p2DashBack;

    return {
      up: rawUp,
      down: rawDown,
      left: rawLeft,
      right: rawRight,
      fwd,
      back,
      dir,
      lp,
      hp,
      lk,
      hk,
      sp1,
      sp2,
      sp3,
      dirty,
      lpJust,
      hpJust,
      lkJust,
      hkJust,
      sp1Just,
      sp2Just,
      sp3Just,
      dirtyJust,
      ultimateJust,
      dashFwd,
      dashBack,
      start
    };
  }

  // Update input history and buffer tick (60 FPS)
  update(p1FacingRight = true, p2FacingRight = false) {
    const s1 = this.getState(1, p1FacingRight);
    const s2 = this.getState(2, p2FacingRight);

    // 1. Double tap dash detection for P1
    this.p1DashFwd = false;
    this.p1DashBack = false;
    const p1FwdKey = p1FacingRight ? this.controls.P1.RIGHT : this.controls.P1.LEFT;
    const p1BackKey = p1FacingRight ? this.controls.P1.LEFT : this.controls.P1.RIGHT;

    if (this.isJustPressed(p1FwdKey)) {
      const now = performance.now();
      if (now - this.p1LastFwdTap < 200) {
        this.p1DashFwd = true;
      }
      this.p1LastFwdTap = now;
    }
    if (this.isJustPressed(p1BackKey)) {
      const now = performance.now();
      if (now - this.p1LastBackTap < 200) {
        this.p1DashBack = true;
      }
      this.p1LastBackTap = now;
    }

    // 2. Double tap dash for P2
    this.p2DashFwd = false;
    this.p2DashBack = false;
    const p2FwdKey = p2FacingRight ? this.controls.P2.RIGHT : this.controls.P2.LEFT;
    const p2BackKey = p2FacingRight ? this.controls.P2.LEFT : this.controls.P2.RIGHT;

    if (this.isJustPressed(p2FwdKey)) {
      const now = performance.now();
      if (now - this.p2LastFwdTap < 200) {
        this.p2DashFwd = true;
      }
      this.p2LastFwdTap = now;
    }
    if (this.isJustPressed(p2BackKey)) {
      const now = performance.now();
      if (now - this.p2LastBackTap < 200) {
        this.p2DashBack = true;
      }
      this.p2LastBackTap = now;
    }

    // 3. Action Queue (6-frame input buffer for responsive combos without ghost delays)
    if (s1.ultimateJust) this.queueAction(1, 'ULTIMATE');
    else if (s1.dirtyJust) this.queueAction(1, 'DIRTY');
    else if (s1.sp3Just) this.queueAction(1, 'SP3');
    else if (s1.sp2Just) this.queueAction(1, 'SP2');
    else if (s1.sp1Just) this.queueAction(1, 'SP1');
    else if (s1.hpJust) this.queueAction(1, 'HP');
    else if (s1.hkJust) this.queueAction(1, 'HK');
    else if (s1.lpJust) this.queueAction(1, 'LP');
    else if (s1.lkJust) this.queueAction(1, 'LK');

    if (s2.ultimateJust) this.queueAction(2, 'ULTIMATE');
    else if (s2.dirtyJust) this.queueAction(2, 'DIRTY');
    else if (s2.sp3Just) this.queueAction(2, 'SP3');
    else if (s2.sp2Just) this.queueAction(2, 'SP2');
    else if (s2.sp1Just) this.queueAction(2, 'SP1');
    else if (s2.hpJust) this.queueAction(2, 'HP');
    else if (s2.hkJust) this.queueAction(2, 'HK');
    else if (s2.lpJust) this.queueAction(2, 'LP');
    else if (s2.lkJust) this.queueAction(2, 'LK');

    // Decrement action queue life
    this.decayActionQueue(this.p1ActionQueue);
    this.decayActionQueue(this.p2ActionQueue);

    // Track charge timers
    if (s1.back) this.p1ChargeBack++;
    else this.p1ChargeBack = 0;

    if (s1.down) this.p1ChargeDown++;
    else this.p1ChargeDown = 0;

    if (s2.back) this.p2ChargeBack++;
    else this.p2ChargeBack = 0;

    if (s2.down) this.p2ChargeDown++;
    else this.p2ChargeDown = 0;

    // Buffer history
    this.p1Buffer.unshift(s1);
    if (this.p1Buffer.length > this.bufferMaxLength) this.p1Buffer.pop();

    this.p2Buffer.unshift(s2);
    if (this.p2Buffer.length > this.bufferMaxLength) this.p2Buffer.pop();
  }

  queueAction(playerNum, action) {
    const queue = playerNum === 1 ? this.p1ActionQueue : this.p2ActionQueue;
    // Keep freshest intent
    queue.length = 0;
    queue.push({ action, frames: 6 });
  }

  peekAction(playerNum) {
    const queue = playerNum === 1 ? this.p1ActionQueue : this.p2ActionQueue;
    return queue.length > 0 ? queue[0].action : null;
  }

  consumeAction(playerNum) {
    const queue = playerNum === 1 ? this.p1ActionQueue : this.p2ActionQueue;
    if (queue.length > 0) return queue.shift().action;
    return null;
  }

  decayActionQueue(queue) {
    for (let i = queue.length - 1; i >= 0; i--) {
      queue[i].frames--;
      if (queue[i].frames <= 0) queue.splice(i, 1);
    }
  }

  // Lenient Special Motion Checkers (QCF, DP, QCB)
  checkQCF(playerNum = 1) {
    const buf = playerNum === 1 ? this.p1Buffer : this.p2Buffer;
    if (buf.length < 4) return false;

    let foundFwd = false;
    let foundDown = false;

    for (let i = 0; i < Math.min(18, buf.length); i++) {
      const d = buf[i].dir;
      if (!foundFwd && (d === 6 || d === 3)) {
        foundFwd = true;
      } else if (foundFwd && (d === 2 || d === 1 || d === 3)) {
        foundDown = true;
        return true;
      }
    }
    return false;
  }

  checkDP(playerNum = 1) {
    const buf = playerNum === 1 ? this.p1Buffer : this.p2Buffer;
    if (buf.length < 5) return false;

    let foundDownDiag = false;
    let foundDown = false;
    let foundFwd = false;

    for (let i = 0; i < Math.min(20, buf.length); i++) {
      const d = buf[i].dir;
      if (!foundDownDiag && d === 3) {
        foundDownDiag = true;
      } else if (foundDownDiag && !foundDown && (d === 2 || d === 1)) {
        foundDown = true;
      } else if (foundDown && !foundFwd && d === 6) {
        foundFwd = true;
        return true;
      }
    }
    return false;
  }

  checkQCB(playerNum = 1) {
    const buf = playerNum === 1 ? this.p1Buffer : this.p2Buffer;
    if (buf.length < 4) return false;

    let foundBack = false;
    let foundDown = false;

    for (let i = 0; i < Math.min(18, buf.length); i++) {
      const d = buf[i].dir;
      if (!foundBack && (d === 4 || d === 1)) {
        foundBack = true;
      } else if (foundBack && (d === 2 || d === 3 || d === 1)) {
        foundDown = true;
        return true;
      }
    }
    return false;
  }

  checkDownDownPunch(playerNum = 1) {
    const isP1 = playerNum === 1;
    const ctrl = isP1 ? this.controls.P1 : this.controls.P2;
    const punchJust = this.isJustPressed(ctrl.LP) || this.isJustPressed(ctrl.HP);
    const rawDown = this.isDown(ctrl.DOWN);
    if (!punchJust || !rawDown) return false;

    const buf = isP1 ? this.p1Buffer : this.p2Buffer;
    if (buf.length < 3) return false;

    let step = 0; // 0 = looking for non-down frame, 1 = looking for prior down frame
    for (let i = 0; i < Math.min(22, buf.length); i++) {
      const b = buf[i];
      if (step === 0) {
        if (!b.down) {
          step = 1;
        }
      } else if (step === 1) {
        if (b.down) {
          return true;
        }
      }
    }
    return false;
  }

  checkChargeBackFwd(playerNum = 1) {
    const charge = playerNum === 1 ? this.p1ChargeBack : this.p2ChargeBack;
    const buf = playerNum === 1 ? this.p1Buffer : this.p2Buffer;
    if (buf.length === 0) return false;
    return charge >= 20 && buf[0].fwd;
  }

  checkChargeDownUp(playerNum = 1) {
    const charge = playerNum === 1 ? this.p1ChargeDown : this.p2ChargeDown;
    const buf = playerNum === 1 ? this.p1Buffer : this.p2Buffer;
    if (buf.length === 0) return false;
    return charge >= 20 && buf[0].up;
  }

  consumeBuffer(playerNum = 1) {
    if (playerNum === 1) {
      this.p1Buffer = [];
      this.p1ActionQueue = [];
    } else {
      this.p2Buffer = [];
      this.p2ActionQueue = [];
    }
  }
}

export const input = new InputManager();
