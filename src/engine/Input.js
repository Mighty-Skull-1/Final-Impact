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

    // Gamepad API Management
    this.gamepads = [];
    this.gamepadPrevStates = {};
    this.gamepadJustPressed = {};
    this.knownGamepadIds = new Set();
    this.menuHoldTimes = {};

    // Listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.onKeyDown.bind(this));
      window.addEventListener('keyup', this.onKeyUp.bind(this));
      window.addEventListener('gamepadconnected', this.onGamepadConnected.bind(this));
      window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected.bind(this));
    }
  }

  onGamepadConnected(e) {
    const gp = e.gamepad;
    if (!gp) return;
    this.knownGamepadIds.add(gp.index);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gamepad-notification', {
        detail: {
          connected: true,
          index: gp.index,
          id: gp.id,
          playerNum: gp.index === 0 ? 1 : (gp.index === 1 ? 2 : gp.index + 1)
        }
      }));
    }
  }

  onGamepadDisconnected(e) {
    const gp = e.gamepad;
    if (!gp) return;
    this.knownGamepadIds.delete(gp.index);
    delete this.gamepadPrevStates[gp.index];
    delete this.gamepadJustPressed[gp.index];
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gamepad-notification', {
        detail: {
          connected: false,
          index: gp.index,
          id: gp.id,
          playerNum: gp.index === 0 ? 1 : (gp.index === 1 ? 2 : gp.index + 1)
        }
      }));
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
      // Clear this keycode from any other actions in this player's layout to prevent ghost collisions
      for (const [k, v] of Object.entries(this.controls[pKey])) {
        if (v === keyCode && k !== action) {
          this.controls[pKey][k] = null;
        }
      }
      this.controls[pKey][action] = keyCode;
      if (action === 'SP1') this.controls[pKey].QUICK_SP1 = keyCode;
      if (action === 'SP2') this.controls[pKey].QUICK_SP2 = keyCode;
      if (action === 'SP3') this.controls[pKey].QUICK_SP3 = keyCode;
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
    for (const idx of Object.keys(this.gamepadJustPressed)) {
      this.gamepadJustPressed[idx] = {};
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

  // Poll Gamepads every frame (detects hot-plugging, triggers, stick deadzones, and edges)
  pollGamepads() {
    const rawGps = (typeof navigator !== 'undefined' && navigator.getGamepads) ? navigator.getGamepads() : [];
    const active = [];
    const currentIndices = new Set();

    for (let i = 0; i < rawGps.length; i++) {
      const gp = rawGps[i];
      if (gp && gp.connected !== false) {
        active.push(gp);
        const idx = gp.index !== undefined ? gp.index : i;
        currentIndices.add(idx);

        // Auto-detect hot plug if browser didn't fire gamepadconnected event
        if (!this.knownGamepadIds.has(idx)) {
          this.knownGamepadIds.add(idx);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('gamepad-notification', {
              detail: {
                connected: true,
                index: idx,
                id: gp.id,
                playerNum: active.length === 1 ? 1 : 2
              }
            }));
          }
        }
      }
    }

    // Auto-detect disconnect
    for (const knownIdx of Array.from(this.knownGamepadIds)) {
      if (!currentIndices.has(knownIdx)) {
        this.knownGamepadIds.delete(knownIdx);
        delete this.gamepadPrevStates[knownIdx];
        delete this.gamepadJustPressed[knownIdx];
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gamepad-notification', {
            detail: {
              connected: false,
              index: knownIdx,
              playerNum: knownIdx === 0 ? 1 : (knownIdx === 1 ? 2 : knownIdx + 1)
            }
          }));
        }
      }
    }

    this.gamepads = active;
    const DEADZONE = 0.28;

    for (let pIdx = 0; pIdx < active.length; pIdx++) {
      const gp = active[pIdx];
      const idx = gp.index !== undefined ? gp.index : pIdx;

      if (!this.gamepadPrevStates[idx]) {
        this.gamepadPrevStates[idx] = { buttons: [], axes: [0, 0] };
      }
      const prev = this.gamepadPrevStates[idx];
      if (!this.gamepadJustPressed[idx]) {
        this.gamepadJustPressed[idx] = {};
      }

      // 1. Process Buttons (including analog triggers RT/LT)
      const currButtons = [];
      const numButtons = gp.buttons ? gp.buttons.length : 0;
      for (let b = 0; b < Math.max(numButtons, 16); b++) {
        const btn = gp.buttons ? gp.buttons[b] : null;
        const isPressed = !!btn && (btn.pressed || (typeof btn.value === 'number' && btn.value > 0.25));
        currButtons[b] = isPressed;

        const wasPressed = !!prev.buttons[b];
        if (isPressed && !wasPressed) {
          this.gamepadJustPressed[idx][b] = true;
        }
      }

      // 2. Process Analog Sticks with Deadzone
      const ax0 = gp.axes && gp.axes[0] !== undefined ? gp.axes[0] : 0; // Left Stick X
      const ax1 = gp.axes && gp.axes[1] !== undefined ? gp.axes[1] : 0; // Left Stick Y

      const stickLeft = ax0 < -DEADZONE;
      const stickRight = ax0 > DEADZONE;
      const stickUp = ax1 < -DEADZONE;
      const stickDown = ax1 > DEADZONE;

      const prevAxes = prev.axes || [0, 0];
      const prevStickLeft = prevAxes[0] < -DEADZONE;
      const prevStickRight = prevAxes[0] > DEADZONE;
      const prevStickUp = prevAxes[1] < -DEADZONE;
      const prevStickDown = prevAxes[1] > DEADZONE;

      if (stickLeft && !prevStickLeft) this.gamepadJustPressed[idx]['STICK_LEFT'] = true;
      if (stickRight && !prevStickRight) this.gamepadJustPressed[idx]['STICK_RIGHT'] = true;
      if (stickUp && !prevStickUp) this.gamepadJustPressed[idx]['STICK_UP'] = true;
      if (stickDown && !prevStickDown) this.gamepadJustPressed[idx]['STICK_DOWN'] = true;

      // Update state for next frame
      prev.buttons = currButtons;
      prev.axes = [ax0, ax1];
    }
  }

  hasGamepadConnected() {
    if (this.gamepads && this.gamepads.length > 0) return true;
    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      const gps = navigator.getGamepads();
      for (let i = 0; i < gps.length; i++) {
        if (gps[i] && gps[i].connected !== false) return true;
      }
    }
    return false;
  }

  getConnectedGamepads() {
    const result = [];
    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      const gps = navigator.getGamepads();
      for (let i = 0; i < gps.length; i++) {
        const gp = gps[i];
        if (gp && gp.connected !== false) {
          result.push({
            index: gp.index !== undefined ? gp.index : i,
            id: gp.id || `Gamepad ${i + 1}`,
            playerNum: result.length === 0 ? 1 : 2
          });
        }
      }
    }
    return result;
  }

  // Poll Gamepad by player index (0 = P1, 1 = P2)
  getGamepadState(playerIndex = 0) {
    if (!this.gamepads || this.gamepads.length === 0) {
      this.pollGamepads();
    }
    const gp = this.gamepads[playerIndex];
    if (!gp) return null;

    const idx = gp.index !== undefined ? gp.index : playerIndex;
    const just = this.gamepadJustPressed[idx] || {};

    const DEADZONE = 0.28;
    const ax0 = gp.axes && gp.axes[0] !== undefined ? gp.axes[0] : 0;
    const ax1 = gp.axes && gp.axes[1] !== undefined ? gp.axes[1] : 0;

    const stickLeft = ax0 < -DEADZONE;
    const stickRight = ax0 > DEADZONE;
    const stickUp = ax1 < -DEADZONE;
    const stickDown = ax1 > DEADZONE;

    const dpadUp = !!gp.buttons[12]?.pressed;
    const dpadDown = !!gp.buttons[13]?.pressed;
    const dpadLeft = !!gp.buttons[14]?.pressed;
    const dpadRight = !!gp.buttons[15]?.pressed;

    const up = dpadUp || stickUp;
    const down = dpadDown || stickDown;
    const left = dpadLeft || stickLeft;
    const right = dpadRight || stickRight;

    const upJust = !!just[12] || !!just['STICK_UP'];
    const downJust = !!just[13] || !!just['STICK_DOWN'];
    const leftJust = !!just[14] || !!just['STICK_LEFT'];
    const rightJust = !!just[15] || !!just['STICK_RIGHT'];

    // Standard Fighting Game Action Buttons:
    // Square / X = Light Punch
    const lp = !!gp.buttons[2]?.pressed;
    // Triangle / Y = Heavy Punch
    const hp = !!gp.buttons[3]?.pressed;
    // Cross / A = Light Kick
    const lk = !!gp.buttons[0]?.pressed;
    // Circle / B = Heavy Kick
    const hk = !!gp.buttons[1]?.pressed;

    // Bumpers and Triggers:
    // RB / R1 = Special 1 (Fireball)
    const sp1 = !!gp.buttons[5]?.pressed;
    // RT / R2 = Special 2 (Uppercut)
    const sp2 = !!gp.buttons[7]?.pressed || (gp.buttons[7]?.value > 0.25);
    // LB / L1 = Special 3 (Spin / Tatsu)
    const sp3 = !!gp.buttons[4]?.pressed;
    // LT / L2 = Dirty Tactic (Desperation Move)
    const dirty = !!gp.buttons[6]?.pressed || (gp.buttons[6]?.value > 0.25);

    // Naruto Ultimate Activation: R3 (right stick click), Select, LB+RB, LT+RT, or HP+HK
    const ultimateHold = !!gp.buttons[11]?.pressed ||
                         !!gp.buttons[8]?.pressed ||
                         (!!gp.buttons[4]?.pressed && !!gp.buttons[5]?.pressed) ||
                         (sp2 && dirty) ||
                         (hp && hk);

    const lpJust = !!just[2];
    const hpJust = !!just[3];
    const lkJust = !!just[0];
    const hkJust = !!just[1];
    const sp1Just = !!just[5];
    const sp2Just = !!just[7];
    const sp3Just = !!just[4];
    const dirtyJust = !!just[6];

    const ultimateJust = !!just[11] || !!just[8] ||
      (just[4] && gp.buttons[5]?.pressed) || (just[5] && gp.buttons[4]?.pressed) ||
      (just[6] && gp.buttons[7]?.pressed) || (just[7] && gp.buttons[6]?.pressed) ||
      (just[1] && hp) || (just[3] && hk);

    const start = !!gp.buttons[9]?.pressed;
    const startJust = !!just[9];
    const select = !!gp.buttons[8]?.pressed;
    const selectJust = !!just[8];
    const aJust = !!just[0];
    const bJust = !!just[1];
    const xJust = !!just[2];
    const yJust = !!just[3];

    return {
      connected: true,
      id: gp.id,
      index: idx,
      axes: [ax0, ax1],
      up, down, left, right,
      upJust, downJust, leftJust, rightJust,
      lp, hp, lk, hk,
      sp1, sp2, sp3, dirty,
      ultimate: ultimateHold,
      lpJust, hpJust, lkJust, hkJust,
      sp1Just, sp2Just, sp3Just, dirtyJust,
      ultimateJust,
      start, startJust, select, selectJust,
      aJust, bJust, xJust, yJust
    };
  }

  // Menu navigation helper with smooth repeat on hold
  getMenuNav(playerIndex = 0) {
    const gp = this.getGamepadState(playerIndex);
    if (!gp) return null;

    const now = performance.now();
    const navKey = `p${playerIndex}`;
    if (!this.menuHoldTimes[navKey]) {
      this.menuHoldTimes[navKey] = { up: 0, down: 0, left: 0, right: 0, nextRepeat: 0 };
    }
    const ht = this.menuHoldTimes[navKey];

    const checkRepeat = (dir, isHeld, isJust) => {
      if (isJust) {
        ht[dir] = now;
        ht.nextRepeat = now + 260; // Initial delay
        return true;
      }
      if (isHeld) {
        if (now >= ht.nextRepeat) {
          ht.nextRepeat = now + 140; // Hold repeat interval
          return true;
        }
      } else {
        ht[dir] = 0;
      }
      return false;
    };

    const up = checkRepeat('up', gp.up, gp.upJust);
    const down = checkRepeat('down', gp.down, gp.downJust);
    const left = checkRepeat('left', gp.left, gp.leftJust);
    const right = checkRepeat('right', gp.right, gp.rightJust);

    return {
      up,
      down,
      left,
      right,
      confirm: gp.aJust || gp.startJust,
      back: gp.bJust,
      extra: gp.xJust || gp.yJust,
      start: gp.startJust,
      lb: !!gp.sp3Just,
      rb: !!gp.sp1Just,
      lt: !!gp.dirtyJust,
      rt: !!gp.sp2Just,
      prevTab: !!gp.sp3Just || !!gp.dirtyJust,
      nextTab: !!gp.sp1Just || !!gp.sp2Just
    };
  }

  getAnyMenuNav() {
    const nav0 = this.getMenuNav(0);
    const nav1 = this.getMenuNav(1);
    if (!nav0 && !nav1) return null;
    if (!nav0) return nav1;
    if (!nav1) return nav0;

    return {
      up: nav0.up || nav1.up,
      down: nav0.down || nav1.down,
      left: nav0.left || nav1.left,
      right: nav0.right || nav1.right,
      confirm: nav0.confirm || nav1.confirm,
      back: nav0.back || nav1.back,
      extra: nav0.extra || nav1.extra,
      start: nav0.start || nav1.start,
      lb: nav0.lb || nav1.lb,
      rb: nav0.rb || nav1.rb,
      lt: nav0.lt || nav1.lt,
      rt: nav0.rt || nav1.rt,
      prevTab: nav0.prevTab || nav1.prevTab,
      nextTab: nav0.nextTab || nav1.nextTab
    };
  }

  // Get current frame state (seamlessly merges keyboard and gamepad)
  getState(playerNum = 1, facingRight = true) {
    const isP1 = playerNum === 1;
    const ctrl = isP1 ? this.controls.P1 : this.controls.P2;
    const gp = this.getGamepadState(isP1 ? 0 : 1);

    const rawUp = this.isDown(ctrl.UP) || !!gp?.up;
    const rawDown = this.isDown(ctrl.DOWN) || !!gp?.down;
    const rawLeft = this.isDown(ctrl.LEFT) || !!gp?.left;
    const rawRight = this.isDown(ctrl.RIGHT) || !!gp?.right;

    const fwd = facingRight ? rawRight : rawLeft;
    const back = facingRight ? rawLeft : rawRight;

    // Continuous button hold
    const lp = this.isDown(ctrl.LP) || !!gp?.lp;
    const hp = this.isDown(ctrl.HP) || !!gp?.hp;
    const lk = this.isDown(ctrl.LK) || !!gp?.lk;
    const hk = this.isDown(ctrl.HK) || !!gp?.hk;
    const quick1Valid = ctrl.QUICK_SP1 && ctrl.QUICK_SP1 !== ctrl.LP && ctrl.QUICK_SP1 !== ctrl.HP && ctrl.QUICK_SP1 !== ctrl.LK && ctrl.QUICK_SP1 !== ctrl.HK;
    const quick2Valid = ctrl.QUICK_SP2 && ctrl.QUICK_SP2 !== ctrl.LP && ctrl.QUICK_SP2 !== ctrl.HP && ctrl.QUICK_SP2 !== ctrl.LK && ctrl.QUICK_SP2 !== ctrl.HK;
    const quick3Valid = ctrl.QUICK_SP3 && ctrl.QUICK_SP3 !== ctrl.LP && ctrl.QUICK_SP3 !== ctrl.HP && ctrl.QUICK_SP3 !== ctrl.LK && ctrl.QUICK_SP3 !== ctrl.HK;

    const sp1 = this.isDown(ctrl.SP1) || (quick1Valid && this.isDown(ctrl.QUICK_SP1)) || !!gp?.sp1;
    const sp2 = this.isDown(ctrl.SP2) || (quick2Valid && this.isDown(ctrl.QUICK_SP2)) || !!gp?.sp2;
    const sp3 = (ctrl.SP3 && this.isDown(ctrl.SP3)) || (quick3Valid && this.isDown(ctrl.QUICK_SP3)) || !!gp?.sp3;
    const dirty = (ctrl.DIRTY && this.isDown(ctrl.DIRTY)) || !!gp?.dirty;
    const start = this.isDown(ctrl.START) || !!gp?.start;

    // Leading-edge triggers (Just Pressed this frame on Keyboard OR Gamepad!)
    const lpJust = this.isJustPressed(ctrl.LP) || !!gp?.lpJust;
    const hpJust = this.isJustPressed(ctrl.HP) || !!gp?.hpJust;
    const lkJust = this.isJustPressed(ctrl.LK) || !!gp?.lkJust;
    const hkJust = this.isJustPressed(ctrl.HK) || !!gp?.hkJust;
    const sp1Just = this.isJustPressed(ctrl.SP1) || (quick1Valid && this.isJustPressed(ctrl.QUICK_SP1)) || !!gp?.sp1Just;
    const sp2Just = this.isJustPressed(ctrl.SP2) || (quick2Valid && this.isJustPressed(ctrl.QUICK_SP2)) || !!gp?.sp2Just;
    const sp3Just = (ctrl.SP3 && this.isJustPressed(ctrl.SP3)) || (quick3Valid && this.isJustPressed(ctrl.QUICK_SP3)) || !!gp?.sp3Just;
    const dirtyJust = (ctrl.DIRTY && this.isJustPressed(ctrl.DIRTY)) || this.checkDownDownPunch(playerNum) || !!gp?.dirtyJust;

    // Directional leading-edge triggers
    const upJust = this.isJustPressed(ctrl.UP) || !!gp?.upJust;
    const downJust = this.isJustPressed(ctrl.DOWN) || !!gp?.downJust;
    const leftJust = this.isJustPressed(ctrl.LEFT) || !!gp?.leftJust;
    const rightJust = this.isJustPressed(ctrl.RIGHT) || !!gp?.rightJust;
    const fwdJust = facingRight ? rightJust : leftJust;
    const backJust = facingRight ? leftJust : rightJust;

    // Naruto Ultimate Activation: Configured key, Spacebar (for P1), HP+HK, or Gamepad trigger
    const ultimateJust = (ctrl.ULTIMATE && this.isJustPressed(ctrl.ULTIMATE)) ||
      (isP1 && this.isJustPressed('Space')) ||
      (this.isDown(ctrl.HP) && this.isDown(ctrl.HK)) ||
      !!gp?.ultimateJust;

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
      upJust,
      downJust,
      leftJust,
      rightJust,
      fwd,
      back,
      fwdJust,
      backJust,
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
    this.pollGamepads();

    const s1 = this.getState(1, p1FacingRight);
    const s2 = this.getState(2, p2FacingRight);

    // 1. Double tap dash detection for P1 (Keyboard & Gamepad 0)
    this.p1DashFwd = false;
    this.p1DashBack = false;
    const p1FwdKey = p1FacingRight ? this.controls.P1.RIGHT : this.controls.P1.LEFT;
    const p1BackKey = p1FacingRight ? this.controls.P1.LEFT : this.controls.P1.RIGHT;
    const gp1 = this.getGamepadState(0);
    const p1FwdJust = p1FacingRight ? (this.isJustPressed(p1FwdKey) || !!gp1?.rightJust) : (this.isJustPressed(p1FwdKey) || !!gp1?.leftJust);
    const p1BackJust = p1FacingRight ? (this.isJustPressed(p1BackKey) || !!gp1?.leftJust) : (this.isJustPressed(p1BackKey) || !!gp1?.rightJust);

    if (p1FwdJust) {
      const now = performance.now();
      if (now - this.p1LastFwdTap < 220) {
        this.p1DashFwd = true;
      }
      this.p1LastFwdTap = now;
    }
    if (p1BackJust) {
      const now = performance.now();
      if (now - this.p1LastBackTap < 220) {
        this.p1DashBack = true;
      }
      this.p1LastBackTap = now;
    }

    // 2. Double tap dash for P2 (Keyboard & Gamepad 1)
    this.p2DashFwd = false;
    this.p2DashBack = false;
    const p2FwdKey = p2FacingRight ? this.controls.P2.RIGHT : this.controls.P2.LEFT;
    const p2BackKey = p2FacingRight ? this.controls.P2.LEFT : this.controls.P2.RIGHT;
    const gp2 = this.getGamepadState(1);
    const p2FwdJust = p2FacingRight ? (this.isJustPressed(p2FwdKey) || !!gp2?.rightJust) : (this.isJustPressed(p2FwdKey) || !!gp2?.leftJust);
    const p2BackJust = p2FacingRight ? (this.isJustPressed(p2BackKey) || !!gp2?.leftJust) : (this.isJustPressed(p2BackKey) || !!gp2?.rightJust);

    if (p2FwdJust) {
      const now = performance.now();
      if (now - this.p2LastFwdTap < 220) {
        this.p2DashFwd = true;
      }
      this.p2LastFwdTap = now;
    }
    if (p2BackJust) {
      const now = performance.now();
      if (now - this.p2LastBackTap < 220) {
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
    // Keep freshest intent with a generous 14-frame combo cancel buffer (~233ms)
    queue.length = 0;
    queue.push({ action, frames: 14 });
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
    if (buf.length < 2) return false;

    let foundFwd = false;
    for (let i = 0; i < Math.min(18, buf.length); i++) {
      const d = buf[i].dir;
      if (!foundFwd && (d === 6 || d === 3)) {
        foundFwd = true;
      } else if (foundFwd && (d === 2 || d === 1 || d === 3)) {
        return true;
      }
    }
    return false;
  }

  checkDP(playerNum = 1) {
    const buf = playerNum === 1 ? this.p1Buffer : this.p2Buffer;
    if (buf.length < 3) return false;

    // DP: Forward -> Down -> Down-Forward (or Forward -> Down -> Forward on keyboard)
    // Checking backwards in time from newest frame:
    let step = 0; // 0: looking for final 6 or 3; 1: looking for 2, 1, or 3; 2: looking for initial 6 or 3
    for (let i = 0; i < Math.min(22, buf.length); i++) {
      const d = buf[i].dir;
      if (step === 0) {
        if (d === 6 || d === 3) step = 1;
      } else if (step === 1) {
        if (d === 2 || d === 1 || d === 3) step = 2;
      } else if (step === 2) {
        if (d === 6 || d === 3) return true;
      }
    }
    return false;
  }

  checkQCB(playerNum = 1) {
    const buf = playerNum === 1 ? this.p1Buffer : this.p2Buffer;
    if (buf.length < 2) return false;

    let foundBack = false;
    for (let i = 0; i < Math.min(18, buf.length); i++) {
      const d = buf[i].dir;
      if (!foundBack && (d === 4 || d === 1)) {
        foundBack = true;
      } else if (foundBack && (d === 2 || d === 3 || d === 1)) {
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
