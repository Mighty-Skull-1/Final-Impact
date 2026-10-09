(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/engine/Constants.js
  var GAME_WIDTH = 640;
  var GAME_HEIGHT = 360;
  var STAGE_WIDTH = 960;
  var GROUND_Y = 300;
  var FPS = 60;
  var FRAME_TIME = 1e3 / FPS;
  var FIGHTER_STATE = {
    IDLE: "IDLE",
    WALK_FWD: "WALK_FWD",
    WALK_BACK: "WALK_BACK",
    CROUCH: "CROUCH",
    JUMP: "JUMP",
    FALL: "FALL",
    LAND: "LAND",
    // Normal Attacks
    ATTACK_LIGHT_PUNCH: "ATTACK_LP",
    ATTACK_HEAVY_PUNCH: "ATTACK_HP",
    ATTACK_LIGHT_KICK: "ATTACK_LK",
    ATTACK_HEAVY_KICK: "ATTACK_HK",
    // Crouching Attacks
    CROUCH_LIGHT_PUNCH: "CROUCH_LP",
    CROUCH_HEAVY_PUNCH: "CROUCH_HP",
    CROUCH_LIGHT_KICK: "CROUCH_LK",
    CROUCH_HEAVY_KICK: "CROUCH_HK",
    // Sweep
    // Jumping Attacks
    JUMP_PUNCH: "JUMP_PUNCH",
    JUMP_KICK: "JUMP_KICK",
    // Movement Extensions
    DASH_FWD: "DASH_FWD",
    DASH_BACK: "DASH_BACK",
    // Special Moves
    SPECIAL_1: "SPECIAL_1",
    SPECIAL_2: "SPECIAL_2",
    SPECIAL_3: "SPECIAL_3",
    SUPER: "SUPER",
    ULTIMATE: "ULTIMATE",
    DIRTY_TACTIC: "DIRTY_TACTIC",
    // Defense / Reaction
    BLOCK: "BLOCK",
    CROUCH_BLOCK: "CROUCH_BLOCK",
    HIT: "HIT",
    HIT_CROUCH: "HIT_CROUCH",
    HIT_AIR: "HIT_AIR",
    KNOCKDOWN: "KNOCKDOWN",
    BLIND_STUN: "BLIND_STUN",
    WALL_REBOUND: "WALL_REBOUND",
    WINDED: "WINDED",
    SUBMISSION_LOCK: "SUBMISSION_LOCK",
    OVERHEAT_STUN: "OVERHEAT_STUN",
    PICKUP_ATTACK: "PICKUP_ATTACK",
    WAKEUP: "WAKEUP",
    // Endings
    VICTORY: "VICTORY",
    DEFEAT: "DEFEAT"
  };
  var ATTACK_HEIGHT = {
    HIGH: "HIGH",
    // Blocked standing or crouching
    MID: "MID",
    // Blocked standing only (overhead)
    LOW: "LOW",
    // Blocked crouching only (sweeps)
    UNBLOCKABLE: "UNBLOCKABLE"
    // Dirty Tactics bypass guard
  };
  var HIT_TYPE = {
    LIGHT: "LIGHT",
    HEAVY: "HEAVY",
    KNOCKDOWN: "KNOCKDOWN",
    WALL_BOUNCE: "WALL_BOUNCE",
    DIRTY_STUN: "DIRTY_STUN",
    BLEED_SLASH: "BLEED_SLASH",
    SUBMISSION_LOCK: "SUBMISSION_LOCK"
  };
  var LIMB_ZONE = {
    LEAD_ARM: "leadArm",
    REAR_ARM: "rearArm",
    LEAD_LEG: "leadLeg",
    REAR_LEG: "rearLeg",
    TORSO: "torso",
    HEAD: "head"
  };
  var STATUS_EFFECT = {
    BLEED: "BLEED",
    OVERHEAT: "OVERHEAT",
    PARALYSIS: "PARALYSIS",
    WINDED: "WINDED"
  };
  var DEFAULT_CONTROLS = {
    P1: {
      UP: "KeyW",
      DOWN: "KeyS",
      LEFT: "KeyA",
      RIGHT: "KeyD",
      LP: "KeyU",
      // Light Punch
      HP: "KeyI",
      // Heavy Punch
      LK: "KeyJ",
      // Light Kick
      HK: "KeyK",
      // Heavy Kick
      SP1: "KeyO",
      // Special Move 1 (Fireball / Sonic / Warp)
      SP2: "KeyL",
      // Special Move 2 (Uppercut / Flash Kick / Spiral)
      SP3: "Semicolon",
      // Special Move 3 (Hurricane / Blitz / Kunai)
      DIRTY: "KeyC",
      // Dirty Tactic Desperation Move
      ULTIMATE: "Space",
      // Naruto Ultimate Secret Technique
      // Quick Action Specials:
      QUICK_SP1: "KeyQ",
      QUICK_SP2: "KeyE",
      QUICK_SP3: "KeyR",
      START: "Enter"
    },
    P2: {
      UP: "ArrowUp",
      DOWN: "ArrowDown",
      LEFT: "ArrowLeft",
      RIGHT: "ArrowRight",
      LP: "Numpad4",
      HP: "Numpad5",
      LK: "Numpad1",
      HK: "Numpad2",
      SP1: "Numpad7",
      SP2: "Numpad8",
      SP3: "Numpad9",
      DIRTY: "Numpad3",
      // Dirty Tactic Desperation Move
      ULTIMATE: "Numpad0",
      START: "NumpadEnter"
    }
  };

  // src/engine/Input.js
  var InputManager = class {
    constructor() {
      this.keys = {};
      this.justPressed = {};
      this.p1Buffer = [];
      this.p2Buffer = [];
      this.bufferMaxLength = 30;
      this.p1LastFwdTap = 0;
      this.p1LastBackTap = 0;
      this.p1DashFwd = false;
      this.p1DashBack = false;
      this.p2LastFwdTap = 0;
      this.p2LastBackTap = 0;
      this.p2DashFwd = false;
      this.p2DashBack = false;
      this.p1ChargeBack = 0;
      this.p1ChargeDown = 0;
      this.p2ChargeBack = 0;
      this.p2ChargeDown = 0;
      this.p1ActionQueue = [];
      this.p2ActionQueue = [];
      this.easyInputs = false;
      this.controls = {
        P1: { ...DEFAULT_CONTROLS.P1 },
        P2: { ...DEFAULT_CONTROLS.P2 }
      };
      this.loadCustomControls();
      this.p1CurrentState = null;
      this.p2CurrentState = null;
      this.gamepads = [];
      this.gamepadPrevStates = {};
      this.gamepadJustPressed = {};
      this.knownGamepadIds = /* @__PURE__ */ new Set();
      this.menuHoldTimes = {};
      if (typeof window !== "undefined") {
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));
        window.addEventListener("gamepadconnected", this.onGamepadConnected.bind(this));
        window.addEventListener("gamepaddisconnected", this.onGamepadDisconnected.bind(this));
      }
    }
    onGamepadConnected(e) {
      const gp = e.gamepad;
      if (!gp) return;
      this.knownGamepadIds.add(gp.index);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("gamepad-notification", {
          detail: {
            connected: true,
            index: gp.index,
            id: gp.id,
            playerNum: gp.index === 0 ? 1 : gp.index === 1 ? 2 : gp.index + 1
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("gamepad-notification", {
          detail: {
            connected: false,
            index: gp.index,
            id: gp.id,
            playerNum: gp.index === 0 ? 1 : gp.index === 1 ? 2 : gp.index + 1
          }
        }));
      }
    }
    loadCustomControls() {
      try {
        if (typeof localStorage !== "undefined") {
          const saved = localStorage.getItem("final_impact_custom_controls");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.P1) this.controls.P1 = { ...this.controls.P1, ...parsed.P1 };
            if (parsed.P2) this.controls.P2 = { ...this.controls.P2, ...parsed.P2 };
          }
        }
      } catch (e) {
        console.warn("Failed to load custom controls", e);
      }
    }
    saveCustomControls() {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("final_impact_custom_controls", JSON.stringify(this.controls));
        }
      } catch (e) {
      }
    }
    setKeybind(playerNum, action, keyCode) {
      const pKey = playerNum === 1 ? "P1" : "P2";
      if (this.controls[pKey]) {
        for (const [k, v] of Object.entries(this.controls[pKey])) {
          if (v === keyCode && k !== action) {
            this.controls[pKey][k] = null;
          }
        }
        this.controls[pKey][action] = keyCode;
        if (action === "SP1") this.controls[pKey].QUICK_SP1 = keyCode;
        if (action === "SP2") this.controls[pKey].QUICK_SP2 = keyCode;
        if (action === "SP3") this.controls[pKey].QUICK_SP3 = keyCode;
        this.saveCustomControls();
      }
    }
    resetDefaultControls() {
      this.controls = {
        P1: { ...DEFAULT_CONTROLS.P1 },
        P2: { ...DEFAULT_CONTROLS.P2 }
      };
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem("final_impact_custom_controls");
        }
      } catch (e) {
      }
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
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab", "Escape"].includes(e.code)) {
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
      const rawGps = typeof navigator !== "undefined" && navigator.getGamepads ? navigator.getGamepads() : [];
      const active = [];
      const currentIndices = /* @__PURE__ */ new Set();
      for (let i = 0; i < rawGps.length; i++) {
        const gp = rawGps[i];
        if (gp && gp.connected !== false) {
          active.push(gp);
          const idx = gp.index !== void 0 ? gp.index : i;
          currentIndices.add(idx);
          if (!this.knownGamepadIds.has(idx)) {
            this.knownGamepadIds.add(idx);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("gamepad-notification", {
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
      for (const knownIdx of Array.from(this.knownGamepadIds)) {
        if (!currentIndices.has(knownIdx)) {
          this.knownGamepadIds.delete(knownIdx);
          delete this.gamepadPrevStates[knownIdx];
          delete this.gamepadJustPressed[knownIdx];
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("gamepad-notification", {
              detail: {
                connected: false,
                index: knownIdx,
                playerNum: knownIdx === 0 ? 1 : knownIdx === 1 ? 2 : knownIdx + 1
              }
            }));
          }
        }
      }
      this.gamepads = active;
      const DEADZONE = 0.28;
      for (let pIdx = 0; pIdx < active.length; pIdx++) {
        const gp = active[pIdx];
        const idx = gp.index !== void 0 ? gp.index : pIdx;
        if (!this.gamepadPrevStates[idx]) {
          this.gamepadPrevStates[idx] = { buttons: [], axes: [0, 0] };
        }
        const prev = this.gamepadPrevStates[idx];
        if (!this.gamepadJustPressed[idx]) {
          this.gamepadJustPressed[idx] = {};
        }
        const currButtons = [];
        const numButtons = gp.buttons ? gp.buttons.length : 0;
        for (let b = 0; b < Math.max(numButtons, 16); b++) {
          const btn = gp.buttons ? gp.buttons[b] : null;
          const isPressed = !!btn && (btn.pressed || typeof btn.value === "number" && btn.value > 0.25);
          currButtons[b] = isPressed;
          const wasPressed = !!prev.buttons[b];
          if (isPressed && !wasPressed) {
            this.gamepadJustPressed[idx][b] = true;
          }
        }
        const ax0 = gp.axes && gp.axes[0] !== void 0 ? gp.axes[0] : 0;
        const ax1 = gp.axes && gp.axes[1] !== void 0 ? gp.axes[1] : 0;
        const stickLeft = ax0 < -DEADZONE;
        const stickRight = ax0 > DEADZONE;
        const stickUp = ax1 < -DEADZONE;
        const stickDown = ax1 > DEADZONE;
        const prevAxes = prev.axes || [0, 0];
        const prevStickLeft = prevAxes[0] < -DEADZONE;
        const prevStickRight = prevAxes[0] > DEADZONE;
        const prevStickUp = prevAxes[1] < -DEADZONE;
        const prevStickDown = prevAxes[1] > DEADZONE;
        if (stickLeft && !prevStickLeft) this.gamepadJustPressed[idx]["STICK_LEFT"] = true;
        if (stickRight && !prevStickRight) this.gamepadJustPressed[idx]["STICK_RIGHT"] = true;
        if (stickUp && !prevStickUp) this.gamepadJustPressed[idx]["STICK_UP"] = true;
        if (stickDown && !prevStickDown) this.gamepadJustPressed[idx]["STICK_DOWN"] = true;
        prev.buttons = currButtons;
        prev.axes = [ax0, ax1];
      }
    }
    hasGamepadConnected() {
      if (this.gamepads && this.gamepads.length > 0) return true;
      if (typeof navigator !== "undefined" && navigator.getGamepads) {
        const gps = navigator.getGamepads();
        for (let i = 0; i < gps.length; i++) {
          if (gps[i] && gps[i].connected !== false) return true;
        }
      }
      return false;
    }
    getConnectedGamepads() {
      const result = [];
      if (typeof navigator !== "undefined" && navigator.getGamepads) {
        const gps = navigator.getGamepads();
        for (let i = 0; i < gps.length; i++) {
          const gp = gps[i];
          if (gp && gp.connected !== false) {
            result.push({
              index: gp.index !== void 0 ? gp.index : i,
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
      const idx = gp.index !== void 0 ? gp.index : playerIndex;
      const just = this.gamepadJustPressed[idx] || {};
      const DEADZONE = 0.28;
      const ax0 = gp.axes && gp.axes[0] !== void 0 ? gp.axes[0] : 0;
      const ax1 = gp.axes && gp.axes[1] !== void 0 ? gp.axes[1] : 0;
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
      const upJust = !!just[12] || !!just["STICK_UP"];
      const downJust = !!just[13] || !!just["STICK_DOWN"];
      const leftJust = !!just[14] || !!just["STICK_LEFT"];
      const rightJust = !!just[15] || !!just["STICK_RIGHT"];
      const lp = !!gp.buttons[2]?.pressed;
      const hp = !!gp.buttons[3]?.pressed;
      const lk = !!gp.buttons[0]?.pressed;
      const hk = !!gp.buttons[1]?.pressed;
      const sp1 = !!gp.buttons[5]?.pressed;
      const sp2 = !!gp.buttons[7]?.pressed || gp.buttons[7]?.value > 0.25;
      const sp3 = !!gp.buttons[4]?.pressed;
      const dirty = !!gp.buttons[6]?.pressed || gp.buttons[6]?.value > 0.25;
      const ultimateHold = !!gp.buttons[11]?.pressed || !!gp.buttons[8]?.pressed || !!gp.buttons[4]?.pressed && !!gp.buttons[5]?.pressed || sp2 && dirty || hp && hk;
      const lpJust = !!just[2];
      const hpJust = !!just[3];
      const lkJust = !!just[0];
      const hkJust = !!just[1];
      const sp1Just = !!just[5];
      const sp2Just = !!just[7];
      const sp3Just = !!just[4];
      const dirtyJust = !!just[6];
      const ultimateJust = !!just[11] || !!just[8] || just[4] && gp.buttons[5]?.pressed || just[5] && gp.buttons[4]?.pressed || just[6] && gp.buttons[7]?.pressed || just[7] && gp.buttons[6]?.pressed || just[1] && hp || just[3] && hk;
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
        up,
        down,
        left,
        right,
        upJust,
        downJust,
        leftJust,
        rightJust,
        lp,
        hp,
        lk,
        hk,
        sp1,
        sp2,
        sp3,
        dirty,
        ultimate: ultimateHold,
        lpJust,
        hpJust,
        lkJust,
        hkJust,
        sp1Just,
        sp2Just,
        sp3Just,
        dirtyJust,
        ultimateJust,
        start,
        startJust,
        select,
        selectJust,
        aJust,
        bJust,
        xJust,
        yJust
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
          ht.nextRepeat = now + 260;
          return true;
        }
        if (isHeld) {
          if (now >= ht.nextRepeat) {
            ht.nextRepeat = now + 140;
            return true;
          }
        } else {
          ht[dir] = 0;
        }
        return false;
      };
      const up = checkRepeat("up", gp.up, gp.upJust);
      const down = checkRepeat("down", gp.down, gp.downJust);
      const left = checkRepeat("left", gp.left, gp.leftJust);
      const right = checkRepeat("right", gp.right, gp.rightJust);
      return {
        up,
        down,
        left,
        right,
        confirm: gp.aJust || gp.startJust,
        back: gp.bJust,
        extra: gp.xJust || gp.yJust,
        start: gp.startJust
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
        start: nav0.start || nav1.start
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
      const lp = this.isDown(ctrl.LP) || !!gp?.lp;
      const hp = this.isDown(ctrl.HP) || !!gp?.hp;
      const lk = this.isDown(ctrl.LK) || !!gp?.lk;
      const hk = this.isDown(ctrl.HK) || !!gp?.hk;
      const quick1Valid = ctrl.QUICK_SP1 && ctrl.QUICK_SP1 !== ctrl.LP && ctrl.QUICK_SP1 !== ctrl.HP && ctrl.QUICK_SP1 !== ctrl.LK && ctrl.QUICK_SP1 !== ctrl.HK;
      const quick2Valid = ctrl.QUICK_SP2 && ctrl.QUICK_SP2 !== ctrl.LP && ctrl.QUICK_SP2 !== ctrl.HP && ctrl.QUICK_SP2 !== ctrl.LK && ctrl.QUICK_SP2 !== ctrl.HK;
      const quick3Valid = ctrl.QUICK_SP3 && ctrl.QUICK_SP3 !== ctrl.LP && ctrl.QUICK_SP3 !== ctrl.HP && ctrl.QUICK_SP3 !== ctrl.LK && ctrl.QUICK_SP3 !== ctrl.HK;
      const sp1 = this.isDown(ctrl.SP1) || quick1Valid && this.isDown(ctrl.QUICK_SP1) || !!gp?.sp1;
      const sp2 = this.isDown(ctrl.SP2) || quick2Valid && this.isDown(ctrl.QUICK_SP2) || !!gp?.sp2;
      const sp3 = ctrl.SP3 && this.isDown(ctrl.SP3) || quick3Valid && this.isDown(ctrl.QUICK_SP3) || !!gp?.sp3;
      const dirty = ctrl.DIRTY && this.isDown(ctrl.DIRTY) || !!gp?.dirty;
      const start = this.isDown(ctrl.START) || !!gp?.start;
      const lpJust = this.isJustPressed(ctrl.LP) || !!gp?.lpJust;
      const hpJust = this.isJustPressed(ctrl.HP) || !!gp?.hpJust;
      const lkJust = this.isJustPressed(ctrl.LK) || !!gp?.lkJust;
      const hkJust = this.isJustPressed(ctrl.HK) || !!gp?.hkJust;
      const sp1Just = this.isJustPressed(ctrl.SP1) || quick1Valid && this.isJustPressed(ctrl.QUICK_SP1) || !!gp?.sp1Just;
      const sp2Just = this.isJustPressed(ctrl.SP2) || quick2Valid && this.isJustPressed(ctrl.QUICK_SP2) || !!gp?.sp2Just;
      const sp3Just = ctrl.SP3 && this.isJustPressed(ctrl.SP3) || quick3Valid && this.isJustPressed(ctrl.QUICK_SP3) || !!gp?.sp3Just;
      const dirtyJust = ctrl.DIRTY && this.isJustPressed(ctrl.DIRTY) || this.checkDownDownPunch(playerNum) || !!gp?.dirtyJust;
      const upJust = this.isJustPressed(ctrl.UP) || !!gp?.upJust;
      const downJust = this.isJustPressed(ctrl.DOWN) || !!gp?.downJust;
      const leftJust = this.isJustPressed(ctrl.LEFT) || !!gp?.leftJust;
      const rightJust = this.isJustPressed(ctrl.RIGHT) || !!gp?.rightJust;
      const fwdJust = facingRight ? rightJust : leftJust;
      const backJust = facingRight ? leftJust : rightJust;
      const ultimateJust = ctrl.ULTIMATE && this.isJustPressed(ctrl.ULTIMATE) || isP1 && this.isJustPressed("Space") || this.isDown(ctrl.HP) && this.isDown(ctrl.HK) || !!gp?.ultimateJust;
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
      this.p1DashFwd = false;
      this.p1DashBack = false;
      const p1FwdKey = p1FacingRight ? this.controls.P1.RIGHT : this.controls.P1.LEFT;
      const p1BackKey = p1FacingRight ? this.controls.P1.LEFT : this.controls.P1.RIGHT;
      const gp1 = this.getGamepadState(0);
      const p1FwdJust = p1FacingRight ? this.isJustPressed(p1FwdKey) || !!gp1?.rightJust : this.isJustPressed(p1FwdKey) || !!gp1?.leftJust;
      const p1BackJust = p1FacingRight ? this.isJustPressed(p1BackKey) || !!gp1?.leftJust : this.isJustPressed(p1BackKey) || !!gp1?.rightJust;
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
      this.p2DashFwd = false;
      this.p2DashBack = false;
      const p2FwdKey = p2FacingRight ? this.controls.P2.RIGHT : this.controls.P2.LEFT;
      const p2BackKey = p2FacingRight ? this.controls.P2.LEFT : this.controls.P2.RIGHT;
      const gp2 = this.getGamepadState(1);
      const p2FwdJust = p2FacingRight ? this.isJustPressed(p2FwdKey) || !!gp2?.rightJust : this.isJustPressed(p2FwdKey) || !!gp2?.leftJust;
      const p2BackJust = p2FacingRight ? this.isJustPressed(p2BackKey) || !!gp2?.leftJust : this.isJustPressed(p2BackKey) || !!gp2?.rightJust;
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
      if (s1.ultimateJust) this.queueAction(1, "ULTIMATE");
      else if (s1.dirtyJust) this.queueAction(1, "DIRTY");
      else if (s1.sp3Just) this.queueAction(1, "SP3");
      else if (s1.sp2Just) this.queueAction(1, "SP2");
      else if (s1.sp1Just) this.queueAction(1, "SP1");
      else if (s1.hpJust) this.queueAction(1, "HP");
      else if (s1.hkJust) this.queueAction(1, "HK");
      else if (s1.lpJust) this.queueAction(1, "LP");
      else if (s1.lkJust) this.queueAction(1, "LK");
      if (s2.ultimateJust) this.queueAction(2, "ULTIMATE");
      else if (s2.dirtyJust) this.queueAction(2, "DIRTY");
      else if (s2.sp3Just) this.queueAction(2, "SP3");
      else if (s2.sp2Just) this.queueAction(2, "SP2");
      else if (s2.sp1Just) this.queueAction(2, "SP1");
      else if (s2.hpJust) this.queueAction(2, "HP");
      else if (s2.hkJust) this.queueAction(2, "HK");
      else if (s2.lpJust) this.queueAction(2, "LP");
      else if (s2.lkJust) this.queueAction(2, "LK");
      this.decayActionQueue(this.p1ActionQueue);
      this.decayActionQueue(this.p2ActionQueue);
      if (s1.back) this.p1ChargeBack++;
      else this.p1ChargeBack = 0;
      if (s1.down) this.p1ChargeDown++;
      else this.p1ChargeDown = 0;
      if (s2.back) this.p2ChargeBack++;
      else this.p2ChargeBack = 0;
      if (s2.down) this.p2ChargeDown++;
      else this.p2ChargeDown = 0;
      this.p1Buffer.unshift(s1);
      if (this.p1Buffer.length > this.bufferMaxLength) this.p1Buffer.pop();
      this.p2Buffer.unshift(s2);
      if (this.p2Buffer.length > this.bufferMaxLength) this.p2Buffer.pop();
    }
    queueAction(playerNum, action) {
      const queue = playerNum === 1 ? this.p1ActionQueue : this.p2ActionQueue;
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
      let step = 0;
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
      let step = 0;
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
  };
  var input = new InputManager();

  // src/audio/SoundFX.js
  var SoundFX = class {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.musicGain = null;
      this.sfxGain = null;
      this.masterGain = null;
      this.musicPlaying = false;
      this.musicTimer = null;
      this.tempo = 138;
      this.step = 0;
      this.currentTrack = "fight";
    }
    init() {
      if (this.ctx) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-6, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(3e-3, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.68, this.ctx.currentTime);
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);
        const noiseLen = this.ctx.sampleRate * 2;
        this.sharedNoiseBuffer = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
        const data = this.sharedNoiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseLen; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        if (this.ctx.state === "suspended") {
          this.ctx.resume();
        }
      } catch (e) {
        console.warn("Web Audio API not supported", e);
      }
    }
    ensureContext() {
      if (!this.ctx) {
        this.init();
      } else if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }
    setMasterVolume(val) {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
      }
    }
    setMusicVolume(val) {
      if (this.musicGain && this.ctx) {
        this.musicGain.gain.setValueAtTime(Math.max(0, Math.min(1, val * 0.45)), this.ctx.currentTime);
      }
    }
    setSFXVolume(val) {
      if (this.sfxGain && this.ctx) {
        this.sfxGain.gain.setValueAtTime(Math.max(0, Math.min(1, val * 0.9)), this.ctx.currentTime);
      }
    }
    // Retro Arcade Menu Confirm / Select Chime
    playMenuSelect() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = "square";
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.setValueAtTime(659.25, now + 0.06);
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1046.5, now);
      osc2.frequency.setValueAtTime(1318.5, now + 0.06);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.18);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.18);
      osc2.stop(now + 0.18);
    }
    // Quick Snappy Dash Whoosh
    playDash() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.12);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.12);
    }
    // Naruto Shadow Clone "POOF" Sound
    playClonePoof() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.15);
      this.playNoiseCrack(0.2, 1600, 0.45);
    }
    // Naruto Anime Ultimate Secret Technique (Ougi) Activation Sound
    playUltimateActivation() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(260, now);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.6);
      subGain.gain.setValueAtTime(0.85, now);
      subGain.gain.exponentialRampToValueAtTime(1e-3, now + 0.8);
      subOsc.connect(subGain);
      subGain.connect(this.sfxGain);
      subOsc.start(now);
      subOsc.stop(now + 0.8);
      const shimmer = this.ctx.createOscillator();
      const shimGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      shimmer.type = "sawtooth";
      shimmer.frequency.setValueAtTime(440, now);
      shimmer.frequency.exponentialRampToValueAtTime(1760, now + 0.5);
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(6, now);
      shimGain.gain.setValueAtTime(0.01, now);
      shimGain.gain.linearRampToValueAtTime(0.4, now + 0.2);
      shimGain.gain.exponentialRampToValueAtTime(1e-3, now + 0.7);
      shimmer.connect(filter);
      filter.connect(shimGain);
      shimGain.connect(this.sfxGain);
      shimmer.start(now);
      shimmer.stop(now + 0.7);
    }
    // Huge Ultimate Finisher Detonation
    playUltimateFinisher() {
      if (!this.ctx) return;
      this.playHitHeavy();
      setTimeout(() => this.playKO(), 120);
    }
    // --- Sound Effects ---
    // Light Attack Swing Whoosh
    playWhoosh(type = "light") {
      if (!this.ctx || !this.sharedNoiseBuffer) return;
      const now = this.ctx.currentTime;
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.sharedNoiseBuffer;
      noise.loop = true;
      filter.type = "bandpass";
      const startFreq = type === "heavy" ? 700 : 1200;
      const endFreq = type === "heavy" ? 250 : 400;
      filter.frequency.setValueAtTime(startFreq, now);
      filter.frequency.exponentialRampToValueAtTime(endFreq, now + 0.12);
      filter.Q.setValueAtTime(3, now);
      gain.gain.setValueAtTime(type === "heavy" ? 0.3 : 0.18, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.12);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(now);
      noise.stop(now + 0.12);
    }
    // Hit Impact (Light)
    playHitLight() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.08);
      this.playNoiseCrack(0.05, 1400, 0.25);
    }
    // Hit Impact (Heavy) - Bone crushing street fighter impact
    playHitHeavy() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(350, now);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.2);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.2);
      this.playNoiseCrack(0.12, 800, 0.45);
    }
    playHitConfirm(type = "light") {
      if (type === "heavy") this.playHitHeavy();
      else this.playHitLight();
    }
    // Block Guard (Metallic Clink)
    playBlock() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = "square";
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(660, now + 0.09);
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(1320, now);
      osc2.frequency.exponentialRampToValueAtTime(1100, now + 0.09);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.1);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.1);
      osc2.stop(now + 0.1);
    }
    // Fireball (Hadouken) Cast
    playHadouken() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.3);
      this.playNoiseCrack(0.25, 1200, 0.35);
    }
    // Dragon Punch / Shoryuken Roar
    playShoryuken() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.35);
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(1500, now + 0.2);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.35);
    }
    // Sonic Blade / Projectile release
    playSonicBlade() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.25);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.25);
    }
    // Flash Somersault
    playFlashKick() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.18);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.25);
      this.playNoiseCrack(0.2, 1600, 0.3);
    }
    // Shadow Warp Teleport
    playShadowWarp() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.18);
    }
    // Knockdown Ground Thud
    playKnockdown() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.28);
      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.3);
    }
    // K.O. Impact Boom (slow motion explosion)
    playKO() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 1.2);
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(200, now);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 1.4);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 1.4);
      this.playNoiseCrack(0.8, 400, 0.6);
    }
    // Super Meter Ready chime
    playSuperReady() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + idx * 0.06 + 0.18);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.2);
      });
    }
    // Round gong / bell
    playGong() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(320, now);
      osc1.frequency.exponentialRampToValueAtTime(240, now + 1.2);
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(480, now);
      osc2.frequency.exponentialRampToValueAtTime(360, now + 1.2);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 1.4);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.4);
      osc2.stop(now + 1.4);
    }
    playNoiseCrack(duration = 0.2, filterFreq = 1200, gainVal = 0.4) {
      if (!this.ctx || !this.sharedNoiseBuffer) return;
      try {
        const now = this.ctx.currentTime;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.sharedNoiseBuffer;
        noise.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(filterFreq, now);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(gainVal, now);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + duration);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + duration);
      } catch (e) {
      }
    }
    // Adrenaline / Rage Mode Ignition
    playRageIgnite() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.35);
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(3, now);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.45);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.45);
      this.playNoiseCrack(0.35, 2400, 0.3);
    }
    // Kazuki: Pocket Gravel / Sand Toss
    playPocketSand() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.playNoiseCrack(0.25, 3500, 0.5);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.22);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.22);
    }
    // Raven: Concealed Taser Shock
    playTaserShock() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const t = now + i * 0.05;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(850 + i % 2 * 200, t);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.045);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.045);
      }
    }
    // Kagura: Caltrops & Smoke Powder
    playCaltrops() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [1200, 1800, 2400, 1600].forEach((freq, idx) => {
        const t = now + idx * 0.035;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.06);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.06);
      });
      this.playNoiseCrack(0.2, 1800, 0.35);
    }
    // Arena Corner Crowd Cheering Roar
    playCrowdCheer() {
      if (!this.ctx || !this.sharedNoiseBuffer) return;
      const now = this.ctx.currentTime;
      try {
        const duration = 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.sharedNoiseBuffer;
        noise.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(900, now);
        filter.Q.setValueAtTime(1.5, now);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + duration);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + duration);
      } catch (e) {
      }
    }
    // Announcer Voice Synthesizer (Retro 16-bit arcade chords)
    playAnnouncer(call) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const speechChord = (baseFreq, duration, type = "sawtooth") => {
        const chord = [1, 1.25, 1.5];
        chord.forEach((ratio) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();
          osc.type = type;
          osc.frequency.setValueAtTime(baseFreq * ratio, now);
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(1e3, now);
          filter.Q.setValueAtTime(4, now);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(1e-3, now + duration);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + duration);
        });
      };
      switch (call) {
        case "ROUND1":
          speechChord(220, 0.45, "sawtooth");
          setTimeout(() => speechChord(277, 0.5, "square"), 350);
          break;
        case "ROUND2":
          speechChord(220, 0.45, "sawtooth");
          setTimeout(() => speechChord(330, 0.5, "square"), 350);
          break;
        case "FINALROUND":
          speechChord(180, 0.4, "sawtooth");
          setTimeout(() => speechChord(240, 0.6, "sawtooth"), 350);
          break;
        case "FINISH_HIM":
          this.playGong();
          speechChord(110, 0.7, "sawtooth");
          setTimeout(() => speechChord(98, 0.9, "sawtooth"), 380);
          break;
        case "FLAWLESS":
          speechChord(392, 0.25, "sine");
          setTimeout(() => speechChord(523, 0.25, "sine"), 160);
          setTimeout(() => speechChord(659, 0.7, "square"), 320);
          break;
        case "FIGHT":
          this.playGong();
          speechChord(330, 0.6, "sawtooth");
          break;
        case "KO":
          this.playKO();
          setTimeout(() => speechChord(150, 0.9, "sawtooth"), 100);
          break;
        case "YOU_WIN":
          speechChord(260, 0.3, "sine");
          setTimeout(() => speechChord(330, 0.3, "sine"), 200);
          setTimeout(() => speechChord(392, 0.3, "sine"), 400);
          setTimeout(() => speechChord(523, 0.6, "square"), 600);
          break;
      }
    }
    // --- Dynamic Arcade Fight Background Music ---
    startMusic(track = "fight") {
      this.ensureContext();
      if (this.musicPlaying) this.stopMusic();
      if (!this.ctx) return;
      if (this.musicGain) {
        try {
          const now = this.ctx.currentTime;
          this.musicGain.gain.cancelScheduledValues(now);
          this.musicGain.gain.setValueAtTime(0.35, now);
        } catch (e) {
        }
      }
      this.musicPlaying = true;
      this.currentTrack = track;
      this.step = 0;
      const stepInterval = 60 / this.tempo / 4;
      let nextNoteTime = this.ctx.currentTime + 0.05;
      const schedule = () => {
        if (!this.musicPlaying) return;
        if (this.ctx && this.ctx.currentTime - nextNoteTime > 0.3) {
          nextNoteTime = this.ctx.currentTime + 0.05;
        }
        while (nextNoteTime < this.ctx.currentTime + 0.2) {
          this.playMusicStep(this.step, nextNoteTime);
          this.step = (this.step + 1) % 64;
          nextNoteTime += stepInterval;
        }
        this.musicTimer = setTimeout(schedule, 50);
      };
      schedule();
    }
    stopMusic() {
      this.musicPlaying = false;
      if (this.musicTimer) {
        clearTimeout(this.musicTimer);
        this.musicTimer = null;
      }
      if (this.ctx && this.musicGain) {
        try {
          const now = this.ctx.currentTime;
          this.musicGain.gain.cancelScheduledValues(now);
          this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
          this.musicGain.gain.linearRampToValueAtTime(1e-4, now + 0.02);
        } catch (e) {
        }
      }
    }
    playMusicStep(step, time) {
      if (!this.ctx) return;
      const isKick = step % 8 === 0 || step % 16 === 6 || step % 32 === 26;
      const isSnare = step % 8 === 4;
      const isHat = step % 2 === 0;
      if (isKick) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.exponentialRampToValueAtTime(35, time + 0.1);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(1e-3, time + 0.12);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.12);
      }
      if (isSnare) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.exponentialRampToValueAtTime(80, time + 0.12);
        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(1e-3, time + 0.12);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.12);
        if (this.sharedNoiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = this.sharedNoiseBuffer;
          noise.loop = true;
          const filter = this.ctx.createBiquadFilter();
          filter.type = "highpass";
          filter.frequency.setValueAtTime(1e3, time);
          const ngain = this.ctx.createGain();
          ngain.gain.setValueAtTime(0.18, time);
          ngain.gain.exponentialRampToValueAtTime(1e-3, time + 0.1);
          noise.connect(filter);
          filter.connect(ngain);
          ngain.connect(this.musicGain);
          noise.start(time);
          noise.stop(time + 0.1);
        }
      }
      if (isHat && this.sharedNoiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.sharedNoiseBuffer;
        noise.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.setValueAtTime(6e3, time);
        const hgain = this.ctx.createGain();
        hgain.gain.setValueAtTime(0.08, time);
        hgain.gain.exponentialRampToValueAtTime(1e-3, time + 0.04);
        noise.connect(filter);
        filter.connect(hgain);
        hgain.connect(this.musicGain);
        noise.start(time);
        noise.stop(time + 0.04);
      }
      const bassline = [
        40,
        40,
        52,
        40,
        40,
        40,
        55,
        40,
        43,
        43,
        55,
        43,
        45,
        45,
        57,
        45,
        40,
        40,
        52,
        40,
        40,
        40,
        55,
        40,
        47,
        47,
        59,
        47,
        45,
        45,
        43,
        42
      ];
      const midiNote = bassline[step % 32];
      if (midiNote) {
        const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, time);
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, time);
        filter.frequency.exponentialRampToValueAtTime(120, time + 0.14);
        gain.gain.setValueAtTime(0.28, time);
        gain.gain.exponentialRampToValueAtTime(1e-3, time + 0.16);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.16);
      }
      const leadNotes = [
        64,
        null,
        67,
        null,
        71,
        null,
        74,
        76,
        null,
        74,
        71,
        null,
        67,
        null,
        64,
        null,
        69,
        null,
        72,
        null,
        76,
        null,
        79,
        81,
        null,
        79,
        76,
        null,
        72,
        null,
        69,
        null
      ];
      const leadNote = leadNotes[step % 32];
      if (leadNote) {
        const freq = 440 * Math.pow(2, (leadNote - 69) / 12);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, time);
        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1800, time);
        filter.Q.setValueAtTime(2, time);
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(1e-3, time + 0.22);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.22);
      }
    }
  };
  var soundFX = new SoundFX();

  // src/graphics/Stage.js
  var Stage = class {
    constructor(stageId = "suzaku") {
      this.stageId = stageId;
      this.time = 0;
      this.trainX = -300;
      this.lightningTimer = 0;
      this.isLightning = false;
      this.petals = [];
      this.steamParticles = [];
      this.initParticles();
    }
    initParticles() {
      for (let i = 0; i < 30; i++) {
        this.petals.push({
          x: Math.random() * 1e3,
          y: Math.random() * 360,
          speedX: 0.8 + Math.random() * 1.2,
          speedY: 0.4 + Math.random() * 0.8,
          size: 2 + Math.random() * 3,
          angle: Math.random() * Math.PI * 2,
          rotSpeed: 0.02 + Math.random() * 0.03
        });
      }
      for (let i = 0; i < 20; i++) {
        this.steamParticles.push({
          x: 400 + Math.random() * 40 - 20,
          y: 290,
          speedY: -0.4 - Math.random() * 0.5,
          speedX: -0.2 + Math.random() * 0.4,
          size: 2 + Math.random() * 4,
          alpha: 0.6,
          life: Math.random() * 60
        });
      }
    }
    update() {
      this.time++;
      if (this.stageId === "suzaku") {
        this.petals.forEach((p) => {
          p.x -= p.speedX;
          p.y += p.speedY;
          p.angle += p.rotSpeed;
          if (p.x < -10) p.x = 1e3;
          if (p.y > 360) p.y = -10;
        });
      }
      if (this.stageId === "neo_tokyo") {
        this.trainX += 8;
        if (this.trainX > 1400) {
          if (Math.random() < 0.01) this.trainX = -500;
        }
        this.steamParticles.forEach((s) => {
          s.y += s.speedY;
          s.x += s.speedX;
          s.size += 0.05;
          s.alpha -= 8e-3;
          s.life++;
          if (s.alpha <= 0 || s.y < 230) {
            s.x = 400 + Math.random() * 30 - 15;
            s.y = 290;
            s.alpha = 0.6;
            s.size = 2 + Math.random() * 3;
            s.life = 0;
          }
        });
      }
      if (this.stageId === "thunder_dojo") {
        this.lightningTimer++;
        if (this.lightningTimer > 200 && Math.random() < 0.03) {
          this.isLightning = true;
          this.lightningTimer = 0;
          setTimeout(() => {
            this.isLightning = false;
          }, 80);
        }
      }
      if (this.stageId === "ember_forge") {
        this.petals.forEach((p) => {
          p.y -= p.speedY * 1.4;
          p.x += Math.sin(this.time * 0.03 + p.angle) * 0.5;
          p.angle += p.rotSpeed;
          if (p.y < -10) {
            p.y = 300 + Math.random() * 60;
            p.x = Math.random() * 1e3;
          }
        });
      }
      if (this.stageId === "bamboo_night") {
        this.petals.forEach((p) => {
          p.angle += p.rotSpeed * 0.8;
          p.x += Math.cos(p.angle) * 0.6 - 0.1;
          p.y += Math.sin(p.angle * 1.3) * 0.5;
          if (p.x < -10) p.x = 1e3;
          if (p.y < 40) p.y = 40;
          if (p.y > 290) p.y = 290;
        });
      }
    }
    render(ctx, cameraX, canvasWidth, canvasHeight) {
      if (this.stageId === "suzaku") {
        this.renderSuzaku(ctx, cameraX, canvasWidth, canvasHeight);
      } else if (this.stageId === "neo_tokyo") {
        this.renderNeoTokyo(ctx, cameraX, canvasWidth, canvasHeight);
      } else if (this.stageId === "dragon_shrine") {
        this.renderDragonShrine(ctx, cameraX, canvasWidth, canvasHeight);
      } else if (this.stageId === "ember_forge") {
        this.renderEmberForge(ctx, cameraX, canvasWidth, canvasHeight);
      } else if (this.stageId === "bamboo_night") {
        this.renderBambooNight(ctx, cameraX, canvasWidth, canvasHeight);
      } else {
        this.renderThunderDojo(ctx, cameraX, canvasWidth, canvasHeight);
      }
      this.renderCrowd(ctx, cameraX, canvasWidth, canvasHeight);
    }
    // ==========================================
    // STAGE 1: SUZAKU ROOFTOP (Sunset)
    // ==========================================
    renderSuzaku(ctx, cameraX, W, H) {
      const sky = ctx.createLinearGradient(0, 0, 0, 240);
      sky.addColorStop(0, "#31103f");
      sky.addColorStop(0.3, "#781d42");
      sky.addColorStop(0.65, "#c73e3a");
      sky.addColorStop(0.85, "#e67e22");
      sky.addColorStop(1, "#f39c12");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      const sunX = 420 - cameraX * 0.05;
      ctx.fillStyle = "#ff3838";
      ctx.beginPath();
      ctx.arc(sunX, 130, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(120, 29, 66, 0.4)";
      const cloudOffset = (this.time * 0.2 - cameraX * 0.1) % W;
      ctx.fillRect(cloudOffset - W, 80, 180, 24);
      ctx.fillRect(cloudOffset + 100, 60, 240, 30);
      ctx.fillRect(cloudOffset + 420, 95, 200, 22);
      const farX = -cameraX * 0.2;
      ctx.fillStyle = "#2b0c2c";
      for (let x = -100; x < W + 200; x += 120) {
        const px2 = x + farX;
        ctx.beginPath();
        ctx.moveTo(px2, 200);
        ctx.lineTo(px2 + 40, 160);
        ctx.lineTo(px2 + 80, 200);
        ctx.fill();
        ctx.fillRect(px2 + 20, 180, 40, 60);
        ctx.fillRect(px2 + 95, 140, 3, 70);
        if (this.time % 60 < 30) {
          ctx.fillStyle = "#ff2a4b";
          ctx.fillRect(px2 + 94, 138, 5, 3);
          ctx.fillStyle = "#2b0c2c";
        }
      }
      const midX = -cameraX * 0.5;
      ctx.fillStyle = "#1a081e";
      ctx.fillRect(0, 220, W, 80);
      for (let x = -80; x < W + 100; x += 90) {
        const rx = x + midX;
        ctx.fillStyle = "#3a1740";
        ctx.fillRect(rx, 215, 80, 10);
        ctx.fillRect(rx - 4, 212, 6, 6);
        ctx.fillRect(rx + 78, 212, 6, 6);
      }
      const lanternX = 260 - cameraX * 0.5;
      const sway = Math.sin(this.time * 0.05) * 4;
      ctx.fillStyle = "#3d1620";
      ctx.fillRect(lanternX, 160, 2, 30);
      ctx.fillStyle = "#d9381e";
      ctx.fillRect(lanternX - 10 + sway, 190, 22, 28);
      ctx.fillStyle = "#ffb703";
      ctx.fillRect(lanternX - 6 + sway, 196, 14, 16);
      const floorY = 290;
      const fgX = -cameraX * 1;
      ctx.fillStyle = "#1e1022";
      ctx.fillRect(0, floorY, W, H - floorY);
      for (let x = -60; x < W + 80; x += 40) {
        const tx = x + fgX % 40;
        ctx.fillStyle = "#331a38";
        ctx.fillRect(tx, floorY, 36, 12);
        ctx.fillStyle = "#4c2654";
        ctx.fillRect(tx + 2, floorY + 2, 32, 4);
        ctx.fillStyle = "#59292b";
        ctx.fillRect(tx + 16, floorY + 12, 8, 58);
      }
      ctx.fillStyle = "#f472b6";
      this.petals.forEach((p) => {
        const screenX = (p.x - cameraX * 0.8) % (W + 80);
        ctx.save();
        ctx.translate(screenX, p.y);
        ctx.rotate(p.angle);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        ctx.restore();
      });
    }
    // ==========================================
    // STAGE 2: NEO TOKYO UNDERPASS (Cyberpunk)
    // ==========================================
    renderNeoTokyo(ctx, cameraX, W, H) {
      ctx.fillStyle = "#080914";
      ctx.fillRect(0, 0, W, H);
      const farX = -cameraX * 0.2;
      for (let i = 0; i < 12; i++) {
        const bx = i * 90 + farX;
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(bx, 60 + i % 3 * 20, 70, 200);
        ctx.fillStyle = i % 2 === 0 ? "#06b6d4" : "#ec4899";
        for (let wy = 80; wy < 220; wy += 18) {
          if ((i + wy) % 5 === 0) {
            ctx.fillRect(bx + 10, wy, 8, 6);
            ctx.fillRect(bx + 30, wy, 8, 6);
            ctx.fillRect(bx + 50, wy, 8, 6);
          }
        }
      }
      const railY = 170;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, railY, W, 8);
      for (let px2 = -50; px2 < W + 100; px2 += 140) {
        const rx = px2 - cameraX * 0.4;
        ctx.fillRect(rx, railY + 8, 16, 60);
      }
      const trainScreenX = this.trainX - cameraX * 0.4;
      ctx.fillStyle = "#0ea5e9";
      ctx.fillRect(trainScreenX, railY - 14, 280, 14);
      ctx.fillStyle = "#fef08a";
      for (let wx = 10; wx < 260; wx += 24) {
        ctx.fillRect(trainScreenX + wx, railY - 10, 16, 6);
      }
      const bbX = 320 - cameraX * 0.6;
      ctx.fillStyle = "#111827";
      ctx.fillRect(bbX, 80, 140, 60);
      ctx.strokeStyle = "#ec4899";
      ctx.lineWidth = 2;
      ctx.strokeRect(bbX, 80, 140, 60);
      ctx.fillStyle = "#ec4899";
      ctx.font = "bold 16px monospace";
      ctx.fillText("FINAL IMPACT", bbX + 10, 105);
      ctx.fillStyle = "#06b6d4";
      ctx.font = "11px monospace";
      ctx.fillText("NEO-TOKYO // 2099", bbX + 12, 125);
      const floorY = 290;
      const fgX = -cameraX * 1;
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, floorY, W, H - floorY);
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(0, floorY, W, 4);
      for (let x = -60; x < W + 100; x += 100) {
        const lx = x + fgX % 100;
        ctx.fillStyle = "rgba(234, 179, 8, 0.4)";
        ctx.fillRect(lx, floorY + 16, 50, 6);
      }
      ctx.fillStyle = "rgba(236, 72, 153, 0.25)";
      ctx.beginPath();
      ctx.ellipse(360 - cameraX * 0.9, floorY + 24, 70, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(6, 182, 212, 0.25)";
      ctx.beginPath();
      ctx.ellipse(180 - cameraX * 0.9, floorY + 36, 50, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      this.steamParticles.forEach((s) => {
        const sx = s.x - cameraX * 0.9;
        ctx.beginPath();
        ctx.arc(sx, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    // ==========================================
    // STAGE 3: THUNDER DOJO
    // ==========================================
    renderThunderDojo(ctx, cameraX, W, H) {
      ctx.fillStyle = this.isLightning ? "#e2e8f0" : "#14141d";
      ctx.fillRect(0, 0, W, H);
      if (this.isLightning) {
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(0, 40, W, 180);
      }
      const winX = -cameraX * 0.3;
      for (let x = -80; x < W + 100; x += 110) {
        const sx = x + winX;
        ctx.fillStyle = this.isLightning ? "#ffffff" : "#2b2b3b";
        ctx.fillRect(sx, 50, 95, 140);
        ctx.fillStyle = "#451a03";
        ctx.fillRect(sx, 50, 95, 4);
        ctx.fillRect(sx, 186, 95, 4);
        ctx.fillRect(sx, 50, 4, 140);
        ctx.fillRect(sx + 91, 50, 4, 140);
        ctx.fillRect(sx, 95, 95, 3);
        ctx.fillRect(sx, 140, 95, 3);
        ctx.fillRect(sx + 30, 50, 3, 140);
        ctx.fillRect(sx + 60, 50, 3, 140);
      }
      const tapX = 280 - cameraX * 0.6;
      ctx.fillStyle = "#7f1d1d";
      ctx.fillRect(tapX, 60, 80, 130);
      ctx.fillStyle = "#b91c1c";
      ctx.fillRect(tapX + 6, 66, 68, 118);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(tapX + 24, 85, 32, 40);
      ctx.fillStyle = "#7f1d1d";
      ctx.font = "bold 24px serif";
      ctx.fillText("\u7ADC", tapX + 28, 115);
      const swordX = 480 - cameraX * 0.6;
      ctx.fillStyle = "#1c1917";
      ctx.fillRect(swordX, 170, 50, 24);
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(swordX - 10, 166, 70, 3);
      const floorY = 290;
      const fgX = -cameraX * 1;
      ctx.fillStyle = "#291307";
      ctx.fillRect(0, floorY, W, 8);
      ctx.fillStyle = "#78716c";
      ctx.fillRect(0, floorY + 8, W, H - floorY - 8);
      for (let x = -80; x < W + 120; x += 120) {
        const tx = x + fgX % 120;
        ctx.fillStyle = "#1c1917";
        ctx.fillRect(tx, floorY + 8, 10, H - floorY - 8);
        ctx.fillStyle = "#57534e";
        ctx.fillRect(tx + 10, floorY + 8, 110, H - floorY - 8);
      }
    }
    // ==========================================
    // ARENA EDGE CROWD SPECTATORS
    // ==========================================
    renderCrowd(ctx, cameraX, W, H) {
      const leftX = 15 - cameraX;
      const rightX = 890 - cameraX;
      if (leftX > -90 && leftX < 240) {
        ctx.save();
        ctx.fillStyle = "#475569";
        ctx.fillRect(leftX - 10, 248, 70, 5);
        ctx.fillRect(leftX, 253, 4, 47);
        ctx.fillRect(leftX + 45, 253, 4, 47);
        const b1 = Math.sin(this.time * 0.16) * 3.5;
        ctx.fillStyle = "#fed7aa";
        ctx.fillRect(leftX + 6, 204 + b1, 14, 14);
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(leftX + 10, 194 + b1, 6, 11);
        ctx.fillStyle = "#450a0a";
        ctx.fillRect(leftX + 14, 212 + b1, 4, 3);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(leftX + 4, 218 + b1, 18, 30);
        ctx.fillStyle = "#fed7aa";
        ctx.fillRect(leftX + 18, 198 + b1, 6, 14);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(leftX + 17, 194 + b1, 8, 5);
        const b2 = Math.cos(this.time * 0.22) * 3;
        ctx.fillStyle = "#ea580c";
        ctx.fillRect(leftX + 28, 208 + b2, 18, 6);
        ctx.fillStyle = "#fde68a";
        ctx.fillRect(leftX + 30, 214 + b2, 14, 12);
        ctx.fillStyle = "#15803d";
        ctx.fillRect(leftX + 26, 226 + b2, 22, 22);
        ctx.fillStyle = "#fde68a";
        ctx.fillRect(leftX + 24, 205 + b2 * 1.3, 6, 8);
        ctx.fillRect(leftX + 44, 207 + b2 * 1.3, 6, 8);
        ctx.restore();
      }
      if (rightX > 400 && rightX < W + 90) {
        ctx.save();
        ctx.fillStyle = "#475569";
        ctx.fillRect(rightX - 5, 248, 70, 5);
        ctx.fillRect(rightX + 5, 253, 4, 47);
        ctx.fillRect(rightX + 50, 253, 4, 47);
        const b3 = Math.sin(this.time * 0.18 + 1.2) * 3;
        ctx.fillStyle = "#18181b";
        ctx.fillRect(rightX + 10, 202 + b3, 16, 7);
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(rightX + 9, 208 + b3, 18, 4);
        ctx.fillStyle = "#fed7aa";
        ctx.fillRect(rightX + 11, 212 + b3, 14, 12);
        ctx.fillStyle = "#b91c1c";
        ctx.fillRect(rightX + 8, 224 + b3, 20, 24);
        ctx.fillStyle = "#fed7aa";
        ctx.fillRect(rightX + 4, 198 + b3 * 1.2, 6, 12);
        ctx.fillRect(rightX + 24, 198 + b3 * 1.2, 6, 12);
        const b4 = Math.cos(this.time * 0.14) * 2.5;
        ctx.fillStyle = "#d97706";
        ctx.fillRect(rightX + 32, 204 + b4, 16, 7);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(rightX + 34, 211 + b4, 14, 4);
        ctx.fillStyle = "#fed7aa";
        ctx.fillRect(rightX + 34, 215 + b4, 13, 10);
        ctx.fillStyle = "#7c3aed";
        ctx.fillRect(rightX + 28, 225 + b4, 24, 23);
        ctx.fillStyle = "#fed7aa";
        ctx.fillRect(rightX + 20, 228 + b4, 10, 6);
        ctx.restore();
      }
    }
    // ==========================================
    // STAGE 8: DRAGON SHRINE (Crimson Twilight)
    // ==========================================
    renderDragonShrine(ctx, cameraX, W, H) {
      const sky = ctx.createLinearGradient(0, 0, 0, 240);
      sky.addColorStop(0, "#0c0015");
      sky.addColorStop(0.25, "#1a0a2e");
      sky.addColorStop(0.5, "#3b0764");
      sky.addColorStop(0.75, "#7f1d1d");
      sky.addColorStop(1, "#450a0a");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      const moonX = W * 0.75 - cameraX * 0.05;
      ctx.fillStyle = "rgba(220, 38, 38, 0.3)";
      ctx.beginPath();
      ctx.arc(moonX, 55, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.arc(moonX, 55, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#991b1b";
      ctx.beginPath();
      ctx.arc(moonX + 6, 52, 26, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 8; i++) {
        const cx = (i * 140 + this.time * 0.15) % (W + 200) - 100;
        ctx.fillStyle = `rgba(30, 5, 56, ${0.5 + Math.sin(i) * 0.2})`;
        ctx.beginPath();
        ctx.arc(cx, 30 + i * 8, 55 + i * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      if (this.isLightning) {
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 2;
        ctx.beginPath();
        const lx = 200 + Math.random() * (W - 400);
        ctx.moveTo(lx, 0);
        for (let y = 0; y < 200; y += 15) {
          ctx.lineTo(lx + (Math.random() - 0.5) * 40, y);
        }
        ctx.stroke();
        ctx.fillStyle = "rgba(168, 85, 247, 0.15)";
        ctx.fillRect(0, 0, W, H);
      }
      ctx.fillStyle = "#1e0538";
      ctx.beginPath();
      ctx.moveTo(0, 180);
      for (let x = 0; x <= W; x += 40) {
        ctx.lineTo(x - cameraX * 0.08, 140 + Math.sin(x * 0.015) * 35);
      }
      ctx.lineTo(W, 300);
      ctx.lineTo(0, 300);
      ctx.fill();
      const pillarColor = "#292524";
      const pillarHighlight = "#44403c";
      const lp = 60 - cameraX * 0.3;
      ctx.fillStyle = pillarColor;
      ctx.fillRect(lp, 120, 30, 180);
      ctx.fillStyle = pillarHighlight;
      ctx.fillRect(lp + 4, 120, 6, 180);
      ctx.fillStyle = "#78350f";
      ctx.fillRect(lp - 8, 112, 46, 12);
      ctx.fillStyle = `rgba(168, 85, 247, ${0.4 + Math.sin(this.time * 0.04) * 0.3})`;
      ctx.fillRect(lp + 10, 160, 10, 3);
      ctx.fillRect(lp + 8, 200, 14, 3);
      ctx.fillRect(lp + 12, 240, 8, 3);
      const rp = W - 90 - cameraX * 0.3;
      ctx.fillStyle = pillarColor;
      ctx.fillRect(rp, 120, 30, 180);
      ctx.fillStyle = pillarHighlight;
      ctx.fillRect(rp + 20, 120, 6, 180);
      ctx.fillStyle = "#78350f";
      ctx.fillRect(rp - 8, 112, 46, 12);
      ctx.fillStyle = `rgba(168, 85, 247, ${0.4 + Math.sin(this.time * 0.05 + 1) * 0.3})`;
      ctx.fillRect(rp + 10, 170, 10, 3);
      ctx.fillRect(rp + 6, 210, 14, 3);
      ctx.fillRect(rp + 12, 250, 8, 3);
      const groundGrad = ctx.createLinearGradient(0, 290, 0, H);
      groundGrad.addColorStop(0, "#1c1917");
      groundGrad.addColorStop(0.3, "#292524");
      groundGrad.addColorStop(1, "#0c0a09");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 290, W, H - 290);
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + Math.sin(this.time * 0.03) * 0.25})`;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const rx = 80 + i * 150 - cameraX * 0.2;
        ctx.beginPath();
        ctx.moveTo(rx, 295);
        ctx.lineTo(rx + 15, 305);
        ctx.lineTo(rx + 5, 315);
        ctx.lineTo(rx + 20, 325);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.6;
      for (const p of this.petals) {
        const ex = p.x - cameraX * 0.1;
        ctx.fillStyle = Math.random() < 0.5 ? "#ef4444" : "#f97316";
        ctx.fillRect(ex, p.y, p.size * 0.7, p.size * 0.7);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(12, 0, 21, 0.4)";
      ctx.fillRect(0, 270, W, 25);
    }
    // ==========================================
    // STAGE 5: EMBER FORGE (Volcanic Foundry)
    // ==========================================
    renderEmberForge(ctx, cameraX, W, H) {
      const pulse = 0.5 + Math.sin(this.time * 0.04) * 0.5;
      const sky = ctx.createLinearGradient(0, 0, 0, 260);
      sky.addColorStop(0, "#0a0303");
      sky.addColorStop(0.5, "#2a0a06");
      sky.addColorStop(1, "#7c2d12");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      const vx = -cameraX * 0.1;
      ctx.fillStyle = "#1c0a07";
      ctx.beginPath();
      ctx.moveTo(-50 + vx, 250);
      ctx.lineTo(120 + vx, 120);
      ctx.lineTo(170 + vx, 128);
      ctx.lineTo(330 + vx, 250);
      ctx.lineTo(380 + vx, 250);
      ctx.lineTo(520 + vx, 90);
      ctx.lineTo(580 + vx, 100);
      ctx.lineTo(760 + vx, 250);
      ctx.lineTo(900 + vx, 250);
      ctx.fill();
      ctx.fillStyle = `rgba(251, 146, 60, ${0.55 + pulse * 0.3})`;
      ctx.fillRect(120 + vx, 118, 52, 6);
      ctx.fillRect(520 + vx, 88, 60, 6);
      const lg = ctx.createLinearGradient(0, 215, 0, 262);
      lg.addColorStop(0, `rgba(249, 115, 22, ${0.35 + pulse * 0.2})`);
      lg.addColorStop(1, "rgba(127, 29, 29, 0.0)");
      ctx.fillStyle = lg;
      ctx.fillRect(0, 215, W, 47);
      const lavaX = -cameraX * 0.25;
      ctx.fillStyle = "#fb923c";
      for (let x = -60; x < W + 120; x += 90) {
        const sx = x + lavaX % 90;
        ctx.fillRect(sx, 246 + Math.sin(this.time * 0.05 + x) * 2, 42, 3);
      }
      const colX = -cameraX * 0.45;
      for (let x = 40; x < 1400; x += 260) {
        const px2 = x + colX;
        if (px2 < -80 || px2 > W + 40) continue;
        ctx.fillStyle = "#1f1917";
        ctx.fillRect(px2, 70, 34, 230);
        ctx.fillStyle = "#3a2d28";
        ctx.fillRect(px2 + 4, 70, 6, 230);
        ctx.fillStyle = "#57534e";
        for (let y = 96; y < 290; y += 44) ctx.fillRect(px2 - 3, y, 40, 5);
        ctx.fillStyle = "#78716c";
        for (let y = 0; y < 70; y += 8) ctx.fillRect(px2 + 15 + Math.sin(this.time * 0.03 + y) * 1.5, y, 3, 5);
        ctx.fillStyle = `rgba(251, 146, 60, ${0.5 + pulse * 0.4})`;
        ctx.fillRect(px2 + 8, 210, 18, 22);
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(px2 + 12, 216, 10, 10);
      }
      const ax = 380 - cameraX * 0.6;
      ctx.fillStyle = "#0c0a09";
      ctx.fillRect(ax, 236, 120, 18);
      ctx.fillRect(ax + 22, 254, 76, 36);
      ctx.fillRect(ax + 8, 222, 104, 14);
      ctx.fillRect(ax + 108, 226, 28, 7);
      ctx.fillStyle = "#292524";
      ctx.fillRect(ax + 8, 222, 104, 3);
      const floorY = 290;
      const fg = ctx.createLinearGradient(0, floorY, 0, H);
      fg.addColorStop(0, "#292524");
      fg.addColorStop(1, "#0c0a09");
      ctx.fillStyle = fg;
      ctx.fillRect(0, floorY, W, H - floorY);
      ctx.fillStyle = "#44403c";
      ctx.fillRect(0, floorY, W, 3);
      ctx.strokeStyle = `rgba(251, 146, 60, ${0.55 + pulse * 0.35})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const rx = 30 + i * 130 - cameraX;
        ctx.beginPath();
        ctx.moveTo(rx, floorY + 4);
        ctx.lineTo(rx + 14, floorY + 16);
        ctx.lineTo(rx + 2, floorY + 28);
        ctx.lineTo(rx + 18, floorY + 42);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.85;
      for (const p of this.petals) {
        const ex = p.x - cameraX * 0.35;
        ctx.fillStyle = p.size > 3.5 ? "#fde047" : p.size > 2.6 ? "#fb923c" : "#ef4444";
        ctx.fillRect(ex, p.y, p.size * 0.6, p.size * 0.6);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(124, 45, 18, ${0.18 + pulse * 0.1})`;
      ctx.fillRect(0, 262, W, 30);
    }
    // ==========================================
    // STAGE 6: MOONLIT BAMBOO (Silent Midnight Grove)
    // ==========================================
    renderBambooNight(ctx, cameraX, W, H) {
      const sky = ctx.createLinearGradient(0, 0, 0, 280);
      sky.addColorStop(0, "#02060f");
      sky.addColorStop(0.55, "#0b2a33");
      sky.addColorStop(1, "#134e4a");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      const moonX = 470 - cameraX * 0.04;
      ctx.fillStyle = "rgba(203, 213, 225, 0.10)";
      ctx.beginPath();
      ctx.arc(moonX, 78, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(226, 232, 240, 0.18)";
      ctx.beginPath();
      ctx.arc(moonX, 78, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f1f5f9";
      ctx.beginPath();
      ctx.arc(moonX, 78, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.arc(moonX - 10, 70, 6, 0, Math.PI * 2);
      ctx.arc(moonX + 9, 86, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e2e8f0";
      for (let i = 0; i < 40; i++) {
        const sx = (i * 83 - cameraX * 0.02 + 1e3) % W;
        const sy = i * 37 % 130;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(this.time * 0.03 + i));
        ctx.globalAlpha = tw;
        ctx.fillRect(sx, sy, 2, 2);
      }
      ctx.globalAlpha = 1;
      const drawStalks = (parallax, spacing, color, hl, topY, width) => {
        const off = -cameraX * parallax;
        for (let x = -spacing; x < W + spacing * 2; x += spacing) {
          const bx = x + off % spacing;
          const sway = Math.sin(this.time * 0.02 + x * 0.05) * 3;
          ctx.fillStyle = color;
          ctx.fillRect(bx + sway * 0.4, topY, width, 300 - topY);
          ctx.fillStyle = hl;
          ctx.fillRect(bx + sway * 0.4, topY, 2, 300 - topY);
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          for (let y = topY + 22; y < 300; y += 38) {
            ctx.fillRect(bx + sway * 0.4 - 1, y, width + 2, 3);
          }
          ctx.fillStyle = hl;
          ctx.fillRect(bx + width + sway, topY + 40, 16, 3);
          ctx.fillRect(bx - 14 + sway, topY + 70, 14, 3);
        }
      };
      drawStalks(0.2, 54, "#0b3b36", "#115e59", 20, 10);
      const lx = 260 - cameraX * 0.55;
      const lx2 = 700 - cameraX * 0.55;
      [lx, lx2].forEach((x) => {
        ctx.fillStyle = "#334155";
        ctx.fillRect(x + 12, 232, 16, 58);
        ctx.fillRect(x + 4, 224, 32, 10);
        ctx.fillRect(x + 8, 196, 24, 28);
        ctx.fillRect(x + 2, 190, 36, 8);
        const flick = 0.75 + Math.sin(this.time * 0.15 + x) * 0.15;
        ctx.fillStyle = `rgba(253, 224, 71, ${flick})`;
        ctx.fillRect(x + 14, 204, 12, 14);
        ctx.fillStyle = "rgba(253, 224, 71, 0.12)";
        ctx.beginPath();
        ctx.arc(x + 20, 211, 34, 0, Math.PI * 2);
        ctx.fill();
      });
      drawStalks(0.75, 150, "#064e3b", "#10b981", -10, 18);
      const floorY = 290;
      const fg = ctx.createLinearGradient(0, floorY, 0, H);
      fg.addColorStop(0, "#1e293b");
      fg.addColorStop(1, "#020617");
      ctx.fillStyle = fg;
      ctx.fillRect(0, floorY, W, H - floorY);
      ctx.fillStyle = "#166534";
      ctx.fillRect(0, floorY, W, 4);
      ctx.fillStyle = "#334155";
      for (let x = -80; x < W + 120; x += 96) {
        const tx = x + -cameraX % 96;
        ctx.fillRect(tx + 4, floorY + 10, 84, 4);
        ctx.fillRect(tx + 44, floorY + 14, 4, H - floorY - 14);
      }
      for (const p of this.petals) {
        const fx = p.x - cameraX * 0.3;
        const glow = 0.4 + 0.6 * Math.abs(Math.sin(this.time * 0.08 + p.angle * 3));
        ctx.fillStyle = `rgba(190, 242, 100, ${glow * 0.25})`;
        ctx.fillRect(fx - 2, p.y - 2, 7, 7);
        ctx.fillStyle = `rgba(254, 249, 195, ${glow})`;
        ctx.fillRect(fx, p.y, 3, 3);
      }
      ctx.fillStyle = "rgba(148, 163, 184, 0.10)";
      ctx.fillRect(0, 262, W, 34);
    }
  };

  // src/ui/HUD.js
  var HUD = class {
    constructor() {
      this.timer = 99;
      this.timerTicks = 0;
      this.announcement = null;
      this.announcementTimer = 0;
      this.hitSparks = [];
      this.screenShake = 0;
      this.p1RedHealth = 1e3;
      this.p2RedHealth = 1e3;
      this.comboP1 = 0;
      this.comboTimerP1 = 0;
      this.comboP2 = 0;
      this.comboTimerP2 = 0;
      this.ultimateCinematic = null;
      window.addEventListener("ultimate-activated", (e) => {
        this.triggerUltimateCinematic(e.detail);
      });
      this.eldenRingBanner = null;
      this.legendVanquishedBanner = null;
      if (typeof window !== "undefined") {
        window.addEventListener("elden-ring-phase2", (e) => {
          this.triggerEldenRingPhase2(e.detail.boss);
        });
        window.addEventListener("legend-vanquished", () => {
          this.triggerLegendVanquished();
        });
      }
      this.dirtyBanner = null;
      this.crowdBanner = null;
      this.gamepadToast = null;
      if (typeof window !== "undefined") {
        window.addEventListener("gamepad-notification", (e) => {
          const detail = e.detail || {};
          const text = detail.connected ? `\u{1F3AE} CONTROLLER ${detail.playerNum || 1} CONNECTED!` : `\u{1F3AE} CONTROLLER ${detail.playerNum || 1} DISCONNECTED`;
          this.gamepadToast = {
            text,
            connected: detail.connected,
            timer: 140
          };
        });
      }
    }
    triggerEldenRingPhase2(boss) {
      this.eldenRingBanner = {
        timer: 160,
        boss
      };
      this.triggerShake(16);
    }
    triggerLegendVanquished() {
      this.legendVanquishedBanner = {
        timer: 220
      };
      this.triggerShake(14);
    }
    showDirtyBanner(fighterName) {
      this.dirtyBanner = {
        name: fighterName,
        timer: 70
      };
    }
    showCrowdBanner(text = "CROWD SHOVE!") {
      this.crowdBanner = {
        text,
        timer: 75
      };
    }
    triggerUltimateCinematic(detail) {
      this.ultimateCinematic = {
        ...detail,
        frame: 0,
        maxFrames: 42
      };
      this.triggerShake(12);
    }
    reset(roundNumber = 1) {
      this.timer = 99;
      this.timerTicks = 0;
      this.hitSparks = [];
      this.screenShake = 0;
      this.ultimateCinematic = null;
      this.dirtyBanner = null;
      this.crowdBanner = null;
      this.setAnnouncement(roundNumber === 1 ? "ROUND 1" : roundNumber === 2 ? "ROUND 2" : "FINAL ROUND", 90);
    }
    setAnnouncement(text, duration = 90) {
      this.announcement = text;
      this.announcementTimer = duration;
    }
    addHitSpark(x, y, type = "hit") {
      if (this.hitSparks.length >= 8) {
        this.hitSparks.shift();
      }
      this.hitSparks.push({
        x,
        y,
        type,
        frame: 0,
        maxFrames: type === "block" ? 8 : 12,
        particles: Array.from({ length: 10 }, () => ({
          vx: (Math.random() * 2 - 1) * 4,
          vy: (Math.random() * 2 - 1) * 4,
          size: Math.random() * 3 + 2,
          color: type === "block" ? Math.random() < 0.5 ? "#38bdf8" : "#ffffff" : Math.random() < 0.6 ? "#facc15" : "#ef4444"
        }))
      });
    }
    triggerShake(intensity = 8) {
      this.screenShake = intensity;
    }
    recordHit(attackerPlayerNum) {
      if (attackerPlayerNum === 1) {
        this.comboP1++;
        this.comboTimerP1 = 50;
      } else {
        this.comboP2++;
        this.comboTimerP2 = 50;
      }
    }
    update(f1, f2) {
      this.timerTicks++;
      if (this.timerTicks >= 60 && this.timer > 0 && !f1.isDead && !f2.isDead) {
        this.timerTicks = 0;
        this.timer--;
      }
      if (this.screenShake > 0) {
        this.screenShake *= 0.85;
        if (this.screenShake < 0.5) this.screenShake = 0;
      }
      if (this.p1RedHealth > f1.health) {
        this.p1RedHealth -= 3;
      } else {
        this.p1RedHealth = f1.health;
      }
      if (this.p2RedHealth > f2.health) {
        this.p2RedHealth -= 3;
      } else {
        this.p2RedHealth = f2.health;
      }
      if (this.announcementTimer > 0) {
        this.announcementTimer--;
        if (this.announcementTimer === 0) {
          if (this.announcement?.startsWith("ROUND")) {
            this.setAnnouncement("FIGHT!", 60);
          } else {
            this.announcement = null;
          }
        }
      }
      for (let i = this.hitSparks.length - 1; i >= 0; i--) {
        const spark = this.hitSparks[i];
        spark.frame++;
        spark.particles.forEach((p) => {
          p.x = (p.x || spark.x) + p.vx;
          p.y = (p.y || spark.y) + p.vy;
          p.size = Math.max(0, p.size - 0.2);
        });
        if (spark.frame >= spark.maxFrames) {
          this.hitSparks.splice(i, 1);
        }
      }
      if (this.comboTimerP1 > 0) {
        this.comboTimerP1--;
        if (this.comboTimerP1 === 0) this.comboP1 = 0;
      }
      if (this.comboTimerP2 > 0) {
        this.comboTimerP2--;
        if (this.comboTimerP2 === 0) this.comboP2 = 0;
      }
      if (this.ultimateCinematic) {
        this.ultimateCinematic.frame++;
        if (this.ultimateCinematic.frame >= this.ultimateCinematic.maxFrames) {
          this.ultimateCinematic = null;
        }
      }
      if (this.dirtyBanner) {
        this.dirtyBanner.timer--;
        if (this.dirtyBanner.timer <= 0) this.dirtyBanner = null;
      }
      if (this.crowdBanner) {
        this.crowdBanner.timer--;
        if (this.crowdBanner.timer <= 0) this.crowdBanner = null;
      }
    }
    getShakeOffset() {
      if (this.screenShake <= 0) return { x: 0, y: 0 };
      return {
        x: (Math.random() * 2 - 1) * this.screenShake,
        y: (Math.random() * 2 - 1) * this.screenShake
      };
    }
    render(ctx, f1, f2, W, H, f3 = null, f4 = null) {
      ctx.save();
      const barW = 240;
      const barH = 14;
      const barY = 24;
      const p1X = 30;
      const p1Rage = f1.isRageMode;
      const p1BorderColor = p1Rage ? Math.floor(Date.now() / 80) % 2 === 0 ? "#ef4444" : "#f97316" : "#facc15";
      ctx.fillStyle = "#000000";
      ctx.fillRect(p1X - 2, barY - 2, barW + 4, barH + 4);
      ctx.fillStyle = p1BorderColor;
      ctx.fillRect(p1X - 1, barY - 1, barW + 2, barH + 2);
      ctx.fillStyle = "#1e1b4b";
      ctx.fillRect(p1X, barY, barW, barH);
      const p1RedW = this.p1RedHealth / f1.maxHealth * barW;
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(p1X + barW - p1RedW, barY, p1RedW, barH);
      const p1CurrW = f1.health / f1.maxHealth * barW;
      const p1Grad = ctx.createLinearGradient(0, barY, 0, barY + barH);
      if (p1Rage) {
        p1Grad.addColorStop(0, "#ffedd5");
        p1Grad.addColorStop(0.5, "#f97316");
        p1Grad.addColorStop(1, "#c2410c");
      } else {
        p1Grad.addColorStop(0, "#fef08a");
        p1Grad.addColorStop(0.5, "#eab308");
        p1Grad.addColorStop(1, "#ca8a04");
      }
      ctx.fillStyle = p1Grad;
      ctx.fillRect(p1X + barW - p1CurrW, barY, p1CurrW, barH);
      const p2X = W - barW - 30;
      const p2Rage = f2.isRageMode;
      const isBossPhase2 = f2.phase === 2;
      const p2BorderColor = isBossPhase2 ? Math.floor(Date.now() / 60) % 2 === 0 ? "#dc2626" : "#7c3aed" : p2Rage ? Math.floor(Date.now() / 80) % 2 === 0 ? "#ef4444" : "#f97316" : "#facc15";
      ctx.fillStyle = "#000000";
      ctx.fillRect(p2X - 2, barY - 2, barW + 4, barH + 4);
      ctx.fillStyle = p2BorderColor;
      ctx.fillRect(p2X - 1, barY - 1, barW + 2, barH + 2);
      ctx.fillStyle = "#1e1b4b";
      ctx.fillRect(p2X, barY, barW, barH);
      const p2RedW = this.p2RedHealth / f2.maxHealth * barW;
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(p2X, barY, p2RedW, barH);
      const p2CurrW = f2.health / f2.maxHealth * barW;
      const p2Grad = ctx.createLinearGradient(0, barY, 0, barY + barH);
      if (isBossPhase2) {
        p2Grad.addColorStop(0, "#fca5a5");
        p2Grad.addColorStop(0.5, "#dc2626");
        p2Grad.addColorStop(1, "#581c87");
      } else if (p2Rage) {
        p2Grad.addColorStop(0, "#ffedd5");
        p2Grad.addColorStop(0.5, "#f97316");
        p2Grad.addColorStop(1, "#c2410c");
      } else {
        p2Grad.addColorStop(0, "#fef08a");
        p2Grad.addColorStop(0.5, "#eab308");
        p2Grad.addColorStop(1, "#ca8a04");
      }
      ctx.fillStyle = p2Grad;
      ctx.fillRect(p2X, barY, p2CurrW, barH);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px monospace";
      ctx.fillText(f1.name, p1X + 4, barY - 6);
      if (p1Rage) {
        ctx.fillStyle = p1BorderColor;
        ctx.font = "bold 11px monospace";
        ctx.fillText("[ RAGE MODE ]", p1X + 70, barY - 6);
      }
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px monospace";
      ctx.fillText(f2.name, p2X + barW - ctx.measureText(f2.name).width - 4, barY - 6);
      if (isBossPhase2) {
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 10px monospace";
        ctx.fillText("[ PHASE II : PRIMEVAL APEX ]", p2X + 6, barY - 6);
      } else if (p2Rage) {
        ctx.fillStyle = p2BorderColor;
        ctx.font = "bold 11px monospace";
        ctx.fillText("[ RAGE MODE ]", p2X + barW - 170, barY - 6);
      }
      const stamY = barY + barH + 2;
      const stamH = 4;
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(p1X, stamY, barW, stamH);
      const p1StamW = (f1.stamina || 100) / 100 * barW;
      ctx.fillStyle = f1.state === "WINDED" ? "#ef4444" : "#10b981";
      ctx.fillRect(p1X + barW - p1StamW, stamY, p1StamW, stamH);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(p2X, stamY, barW, stamH);
      const p2StamW = (f2.stamina || 100) / 100 * barW;
      ctx.fillStyle = f2.state === "WINDED" ? "#ef4444" : "#10b981";
      ctx.fillRect(p2X, stamY, p2StamW, stamH);
      const limbY = stamY + 9;
      ctx.font = "bold 8px monospace";
      const p1ArmColor = f1.limbs?.leadArm <= 0 ? "#ef4444" : f1.limbs?.leadArm <= 40 ? "#f59e0b" : "#94a3b8";
      const p1LegColor = f1.limbs?.leadLeg <= 0 ? "#ef4444" : f1.limbs?.leadLeg <= 40 ? "#f59e0b" : "#94a3b8";
      const p1TorsoColor = f1.limbs?.torso <= 30 ? "#ef4444" : "#94a3b8";
      ctx.fillStyle = p1ArmColor;
      ctx.fillText(f1.limbs?.leadArm <= 0 ? "ARM:BRK" : `ARM:${Math.round(f1.limbs?.leadArm || 100)}`, p1X, limbY);
      ctx.fillStyle = p1LegColor;
      ctx.fillText(f1.limbs?.leadLeg <= 0 ? "LEG:BRK" : `LEG:${Math.round(f1.limbs?.leadLeg || 100)}`, p1X + 50, limbY);
      ctx.fillStyle = p1TorsoColor;
      ctx.fillText(f1.limbs?.torso <= 30 ? "RIB:BRK" : `RIB:${Math.round(f1.limbs?.torso || 100)}`, p1X + 100, limbY);
      const p2ArmColor = f2.limbs?.leadArm <= 0 ? "#ef4444" : f2.limbs?.leadArm <= 40 ? "#f59e0b" : "#94a3b8";
      const p2LegColor = f2.limbs?.leadLeg <= 0 ? "#ef4444" : f2.limbs?.leadLeg <= 40 ? "#f59e0b" : "#94a3b8";
      const p2TorsoColor = f2.limbs?.torso <= 30 ? "#ef4444" : "#94a3b8";
      ctx.fillStyle = p2ArmColor;
      ctx.fillText(f2.limbs?.leadArm <= 0 ? "ARM:BRK" : `ARM:${Math.round(f2.limbs?.leadArm || 100)}`, p2X + barW - 140, limbY);
      ctx.fillStyle = p2LegColor;
      ctx.fillText(f2.limbs?.leadLeg <= 0 ? "LEG:BRK" : `LEG:${Math.round(f2.limbs?.leadLeg || 100)}`, p2X + barW - 90, limbY);
      ctx.fillStyle = p2TorsoColor;
      ctx.fillText(f2.limbs?.torso <= 30 ? "RIB:BRK" : `RIB:${Math.round(f2.limbs?.torso || 100)}`, p2X + barW - 40, limbY);
      for (let r = 0; r < f1.roundsWon; r++) {
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(p1X + barW - 14 - r * 16, barY + barH + 10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.font = "bold 8px monospace";
        ctx.fillText("V", p1X + barW - 17 - r * 16, barY + barH + 13);
      }
      for (let r = 0; r < f2.roundsWon; r++) {
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(p2X + 14 + r * 16, barY + barH + 10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.font = "bold 8px monospace";
        ctx.fillText("V", p2X + 11 + r * 16, barY + barH + 13);
      }
      const allyBarY = limbY + 11;
      if (f3) {
        const f3W = 110;
        const f3H = 8;
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(p1X, allyBarY, f3W, f3H);
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1;
        ctx.strokeRect(p1X, allyBarY, f3W, f3H);
        const f3Pct = Math.max(0, Math.min(1, f3.health / f3.maxHealth));
        ctx.fillStyle = f3.isDead ? "#475569" : "#10b981";
        ctx.fillRect(p1X + 1, allyBarY + 1, (f3W - 2) * f3Pct, f3H - 2);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 7.5px monospace";
        ctx.fillText(`ALLY [${f3.name}]: ${Math.round(Math.max(0, f3.health))}`, p1X + 2, allyBarY - 2);
      }
      if (f4) {
        const f4W = 110;
        const f4H = 8;
        const f4X = p2X + barW - f4W;
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(f4X, allyBarY, f4W, f4H);
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1;
        ctx.strokeRect(f4X, allyBarY, f4W, f4H);
        const f4Pct = Math.max(0, Math.min(1, f4.health / f4.maxHealth));
        ctx.fillStyle = f4.isDead ? "#475569" : "#f97316";
        ctx.fillRect(f4X + 1, allyBarY + 1, (f4W - 2) * f4Pct, f4H - 2);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 7.5px monospace";
        ctx.fillText(`[${f4.name}]: ${Math.round(Math.max(0, f4.health))}`, f4X + 2, allyBarY - 2);
      }
      const timerStr = this.timer.toString().padStart(2, "0");
      ctx.fillStyle = "#000000";
      ctx.font = "bold 28px monospace";
      ctx.fillText(timerStr, W / 2 - 17, barY + 16);
      ctx.fillStyle = this.timer <= 10 ? "#ef4444" : "#fde047";
      ctx.fillText(timerStr, W / 2 - 18, barY + 15);
      const superW = 160;
      const superH = 10;
      const superY = H - 20;
      ctx.fillStyle = "#000000";
      ctx.fillRect(p1X - 1, superY - 1, superW + 2, superH + 2);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(p1X, superY, superW, superH);
      const p1SuperFill = f1.superMeter / f1.maxSuperMeter * superW;
      ctx.fillStyle = f1.superMeter >= f1.maxSuperMeter ? "#38bdf8" : "#0284c7";
      ctx.fillRect(p1X, superY, p1SuperFill, superH);
      ctx.fillStyle = f1.superMeter >= f1.maxSuperMeter ? "#38bdf8" : "#94a3b8";
      ctx.font = "bold 10px monospace";
      ctx.fillText(f1.superMeter >= f1.maxSuperMeter ? "\u2605 SECRET TECHNIQUE [SPACE]" : "EX METER", p1X, superY - 4);
      ctx.fillStyle = "#000000";
      ctx.fillRect(p2X + barW - superW - 1, superY - 1, superW + 2, superH + 2);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(p2X + barW - superW, superY, superW, superH);
      const p2SuperFill = f2.superMeter / f2.maxSuperMeter * superW;
      ctx.fillStyle = f2.superMeter >= f2.maxSuperMeter ? "#38bdf8" : "#0284c7";
      ctx.fillRect(p2X + barW - p2SuperFill, superY, p2SuperFill, superH);
      ctx.fillStyle = f2.superMeter >= f2.maxSuperMeter ? "#38bdf8" : "#94a3b8";
      ctx.fillText(f2.superMeter >= f2.maxSuperMeter ? "\u2605 SECRET TECHNIQUE" : "EX METER", p2X + barW - 120, superY - 4);
      if (f1.superMeter >= f1.maxSuperMeter && Math.floor(Date.now() / 300) % 2 === 0) {
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 10px monospace";
        ctx.fillText("PRESS [SPACE] FOR OUGI ULTIMATE!", p1X, superY - 16);
      }
      if (this.comboP1 > 1) {
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 20px monospace";
        ctx.fillText(`${this.comboP1} HITS!`, p1X + 20, 80);
      }
      if (this.comboP2 > 1) {
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 20px monospace";
        ctx.fillText(`${this.comboP2} HITS!`, p2X + barW - 110, 80);
      }
      if (this.announcement) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#000000";
        ctx.font = "bold 36px monospace";
        ctx.fillText(this.announcement, W / 2 + 2, H / 2 - 18);
        ctx.fillStyle = this.announcement === "K.O." ? "#dc2626" : this.announcement === "FIGHT!" ? "#f97316" : "#fde047";
        ctx.fillText(this.announcement, W / 2, H / 2 - 20);
        ctx.textAlign = "left";
      }
      this.hitSparks.forEach((spark) => {
        spark.particles.forEach((p) => {
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        if (spark.frame < 4) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(spark.x - 4, spark.y - 4, 8, 8);
        }
      });
      if (this.ultimateCinematic) {
        const u = this.ultimateCinematic;
        const progress = u.frame / u.maxFrames;
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 2;
        const centerX = W / 2;
        const centerY = H / 2;
        for (let a = 0; a < Math.PI * 2; a += 0.25) {
          const offset = u.frame * 8 % 30;
          const r1 = 60 + offset;
          const r2 = 360;
          ctx.beginPath();
          ctx.moveTo(centerX + Math.cos(a) * r1, centerY + Math.sin(a) * r1);
          ctx.lineTo(centerX + Math.cos(a) * r2, centerY + Math.sin(a) * r2);
          ctx.stroke();
        }
        ctx.restore();
        const bannerY = 120;
        const bannerH = 110;
        ctx.fillStyle = "rgba(10, 5, 20, 0.92)";
        ctx.fillRect(0, bannerY, W, bannerH);
        ctx.fillStyle = "#facc15";
        ctx.fillRect(0, bannerY, W, 3);
        ctx.fillRect(0, bannerY + bannerH - 3, W, 3);
        const slideX = progress < 0.2 ? (0.2 - progress) * 500 : progress > 0.8 ? (progress - 0.8) * 500 : 0;
        ctx.save();
        ctx.translate(-slideX, 0);
        const winSprites = u.fighter.sprites?.VICTORY || u.fighter.sprites?.IDLE || [];
        const portraitImg = winSprites[0];
        if (portraitImg) {
          ctx.drawImage(portraitImg, 20, bannerY + 5, 100, 100);
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(56, bannerY + 28, 14, 5);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(60, bannerY + 29, 6, 3);
        }
        ctx.textAlign = "left";
        ctx.fillStyle = "#fde047";
        ctx.font = "900 32px serif";
        ctx.fillText(`\u3010 \u5965\u7FA9 \u3011 ${u.kanji}`, 130, bannerY + 45);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px monospace";
        ctx.fillText(u.name, 134, bannerY + 75);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 10px monospace";
        ctx.fillText(u.subtitle, 136, bannerY + 95);
        ctx.restore();
      }
      if (this.dirtyBanner && this.dirtyBanner.timer > 0) {
        ctx.save();
        const bannerY = H - 56;
        ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        ctx.fillRect(W / 2 - 140, bannerY, 280, 24);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.strokeRect(W / 2 - 140, bannerY, 280, 24);
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`\u26A1 DIRTY TACTIC! [${this.dirtyBanner.name}] \u26A1`, W / 2, bannerY + 16);
        ctx.restore();
      }
      if (this.crowdBanner && this.crowdBanner.timer > 0) {
        ctx.save();
        const bannerY = 88;
        ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        ctx.fillRect(W / 2 - 110, bannerY, 220, 24);
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2;
        ctx.strokeRect(W / 2 - 110, bannerY, 220, 24);
        ctx.fillStyle = "#4ade80";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("\u2605 CROWD SHOVE! \u2605", W / 2, bannerY + 16);
        ctx.restore();
      }
      if (f1.state === "SUBMISSION_LOCK" || f2.state === "SUBMISSION_LOCK") {
        const victim = f1.state === "SUBMISSION_LOCK" ? f1 : f2;
        ctx.save();
        const sY = H / 2 + 25;
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(W / 2 - 130, sY - 20, 260, 42);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.strokeRect(W / 2 - 130, sY - 20, 260, 42);
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText("\u26A0\uFE0F MASH BUTTONS TO ESCAPE SUBMISSION! \u26A0\uFE0F", W / 2, sY - 6);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(W / 2 - 100, sY + 4, 200, 10);
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(W / 2 - 100, sY + 4, Math.min(200, (victim.submissionStruggle || 0) / 100 * 200), 10);
        ctx.restore();
      }
      if (this.eldenRingBanner && this.eldenRingBanner.timer > 0) {
        this.eldenRingBanner.timer--;
        const b = this.eldenRingBanner;
        ctx.save();
        const barH2 = 100;
        const barY2 = H / 2 - barH2 / 2;
        ctx.fillStyle = "rgba(10, 2, 8, 0.94)";
        ctx.fillRect(0, barY2, W, barH2);
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(0, barY2, W, 3);
        ctx.fillRect(0, barY2 + barH2 - 3, W, 3);
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(0, barY2 + 3, W, 1);
        ctx.fillRect(0, barY2 + barH2 - 4, W, 1);
        ctx.textAlign = "center";
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 12px serif";
        ctx.fillText("\u2756  LORD OF BLOOD & CINDERS  \u2756", W / 2, barY2 + 28);
        ctx.fillStyle = "#fef08a";
        ctx.font = "900 24px serif";
        ctx.fillText("REX GANNON, PRIMEVAL APEX", W / 2, barY2 + 58);
        ctx.fillStyle = "#f87171";
        ctx.font = "bold 12px monospace";
        ctx.fillText("\u2014 PHASE II : THE UNBROKEN WILL \u2014", W / 2, barY2 + 82);
        ctx.restore();
      }
      if (this.legendVanquishedBanner && this.legendVanquishedBanner.timer > 0) {
        this.legendVanquishedBanner.timer--;
        ctx.save();
        const alpha = Math.min(1, this.legendVanquishedBanner.timer / 40);
        ctx.globalAlpha = alpha;
        ctx.textAlign = "center";
        ctx.fillStyle = "#fde047";
        ctx.font = "900 38px serif";
        ctx.fillText("LEGEND VANQUISHED", W / 2, H / 2 - 10);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 12px monospace";
        ctx.fillText("CAMPAIGN CHAMPION OF FINAL IMPACT", W / 2, H / 2 + 18);
        ctx.restore();
      }
      if (this.gamepadToast && this.gamepadToast.timer > 0) {
        this.gamepadToast.timer--;
        ctx.save();
        const alpha = Math.min(1, this.gamepadToast.timer / 25);
        ctx.globalAlpha = alpha;
        const bY = 22;
        const bW = 280;
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.fillRect(W / 2 - bW / 2, bY, bW, 26);
        ctx.strokeStyle = this.gamepadToast.connected ? "#38bdf8" : "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(W / 2 - bW / 2, bY, bW, 26);
        ctx.fillStyle = this.gamepadToast.connected ? "#38bdf8" : "#fbbf24";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(this.gamepadToast.text, W / 2, bY + 17);
        ctx.restore();
      }
      ctx.restore();
    }
  };

  // src/ui/TitleScreen.js
  var TitleScreen = class {
    constructor() {
      this.time = 0;
    }
    render(ctx, W, H) {
      this.time++;
      const t = this.time;
      const cx = W / 2;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#0a0000");
      bg.addColorStop(0.55, "#3b0808");
      bg.addColorStop(1, "#0a0101");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      const pulse = Math.sin(t * 0.04) * 0.5 + 0.5;
      const sun = ctx.createRadialGradient(cx, 130, 10, cx, 130, 210);
      sun.addColorStop(0, `rgba(251, 191, 36, ${0.55 + pulse * 0.2})`);
      sun.addColorStop(0.4, "rgba(220, 38, 38, 0.35)");
      sun.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#120202";
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, 250);
      ctx.lineTo(90, 200);
      ctx.lineTo(170, 245);
      ctx.lineTo(260, 190);
      ctx.lineTo(340, 240);
      ctx.lineTo(430, 195);
      ctx.lineTo(520, 245);
      ctx.lineTo(580, 205);
      ctx.lineTo(W, 250);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      for (let i = 0; i < 50; i++) {
        const ex = (i * 83 + Math.sin(t * 0.02 + i * 1.7) * 18 + W) % W;
        const ey = H - (t * (0.5 + i % 6 * 0.18) + i * 47) % H;
        ctx.globalAlpha = 0.3 + i % 4 * 0.15;
        ctx.fillStyle = i % 3 === 0 ? "#fde047" : "#fb923c";
        ctx.fillRect(ex, ey, 2, 2);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, 22);
      ctx.fillRect(0, H - 22, W, 22);
      ctx.fillStyle = "#b91c1c";
      ctx.fillRect(0, 22, W, 2);
      ctx.fillRect(0, H - 24, W, 2);
      ctx.textAlign = "center";
      ctx.globalAlpha = 0.35 + pulse * 0.15;
      ctx.fillStyle = "#facc15";
      ctx.font = "900 150px serif";
      ctx.fillText("\u9F8D", cx, 150);
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(cx, 0);
      ctx.transform(1, 0, -0.12, 1, 0, 0);
      ctx.font = "900 56px monospace";
      ctx.fillStyle = "#000";
      ctx.fillText("FINAL", 4, 96);
      ctx.fillText("IMPACT", 4, 150);
      const grad = ctx.createLinearGradient(0, 50, 0, 152);
      grad.addColorStop(0, "#fef9c3");
      grad.addColorStop(0.45, "#facc15");
      grad.addColorStop(0.75, "#dc2626");
      grad.addColorStop(1, "#7f1d1d");
      ctx.fillStyle = grad;
      ctx.fillText("FINAL", 0, 92);
      ctx.fillText("IMPACT", 0, 146);
      ctx.restore();
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 11px monospace";
      ctx.fillText("~  THE ULTIMATE TOURNAMENT  ~", cx, 176);
      if (Math.floor(t / 25) % 2 === 0) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 15px monospace";
        const hasGp = input.hasGamepadConnected();
        const prompt = hasGp ? "PRESS [A], [START], OR [SPACE]" : "PRESS [SPACE] OR [ENTER]";
        ctx.fillText(prompt, cx, 214);
      }
      const boxW = 460;
      const boxH = 58;
      const boxX = cx - boxW / 2;
      const boxY = 262;
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxW - 1, boxH - 1);
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 10px monospace";
      ctx.fillText("MOVE  W A S D     PUNCH  U I O     KICK  J K L", cx, boxY + 20);
      ctx.fillStyle = input.hasGamepadConnected() ? "#4ade80" : "#d6d3d1";
      ctx.font = "9px monospace";
      ctx.fillText(
        input.hasGamepadConnected() ? "GAMEPAD CONNECTED & READY" : "CONTROLLERS (XBOX / PS / USB) & 2P KEYBOARD SUPPORTED",
        cx,
        boxY + 38
      );
      ctx.fillStyle = "#a8a29e";
      ctx.fillText("FINISH HIM: SPACE / HP+HK", cx, boxY + 51);
      ctx.fillStyle = "#78716c";
      ctx.font = "9px monospace";
      ctx.fillText("\xA9 2026 FINAL IMPACT ARCADE", cx, H - 8);
      ctx.textAlign = "left";
    }
  };

  // src/ui/ModeSelect.js
  var ModeSelect = class _ModeSelect {
    constructor() {
      this.modes = [
        {
          id: "campaign",
          badge: "STORY MODE",
          title: "\u{1F3C6} CAMPAIGN",
          subtitle: "THE 7 UNDERGROUND BOSSES",
          description: "Battle through 7 scaling crime bosses and face the 2-Phase Primeval Apex & Endless Dragon.",
          color: "#facc15"
        },
        {
          id: "coop_campaign",
          badge: "2P CO-OP RAID",
          title: "\u{1F91D} CO-OP CAMPAIGN",
          subtitle: "ONLINE 2-PLAYER BOSS RAID",
          description: "Team up with an online friend to conquer all 8 campaign bosses together in simultaneous 2v1 and 2v2 boss battles.",
          color: "#a855f7"
        },
        {
          id: "cpu",
          badge: "SOLO BATTLE",
          title: "\u2694\uFE0F 1V1 VS CPU",
          subtitle: "ARCADE SINGLE MATCH",
          description: "Classic 1v1 fighting game match against tactical AI. Choose your opponent, arena, and calibrate AI reaction speed.",
          color: "#38bdf8"
        },
        {
          id: "2p",
          badge: "LOCAL VERSUS",
          title: "\u{1F94A} 1V1 VS FRIEND",
          subtitle: "COUCH 2-PLAYER VERSUS",
          description: "Settle the score on one keyboard or twin gamepads. Player 1 (WASD + UIJK) vs Player 2 (Arrows + Numpad).",
          color: "#ec4899"
        },
        {
          id: "2v2",
          badge: "SIMULTANEOUS",
          title: "\u{1F525} 2V2 TEAM BRAWL",
          subtitle: "4-FIGHTER TAG WAR",
          description: "Two teams of two battle simultaneously on-screen with cel-shaded rim lighting and team pushboxes.",
          color: "#f97316"
        },
        {
          id: "online",
          badge: "NETPLAY P2P",
          title: "\u{1F310} ONLINE VERSUS",
          subtitle: "BATTLE A FRIEND VIA ROOM CODE",
          description: "Connect directly with a friend online using zero-setup WebRTC peer-to-peer. Low-latency input streaming with room codes.",
          color: "#c084fc"
        },
        {
          id: "training",
          badge: "DOJO LAB",
          title: "\u{1F94B} PRACTICE MODE",
          subtitle: "TRAINING & COMBO LAB",
          description: "Unlimited health, infinite EX super gauge, and stamina. Master special moves, frame traps, and cancel strings.",
          color: "#4ade80"
        },
        {
          id: "shop",
          badge: "CUSTOM SKINS",
          title: "\u{1F6CD}\uFE0F ITEM SHOP",
          subtitle: "PREVIEW & EQUIP SKINS",
          description: "Browse, unlock, and equip custom fighter skins, auras, hitsparks, and titles with your earned tournament fight coins.",
          color: "#eab308"
        }
      ];
      this.selectedIndex = 0;
      this.difficultyOptions = ["easy", "normal", "hard"];
      this.difficultyIndex = 1;
      this.animTimer = 0;
    }
    get selectedMode() {
      return this.modes[this.selectedIndex].id;
    }
    get currentDifficulty() {
      return this.difficultyOptions[this.difficultyIndex];
    }
    handleInput(inputState) {
      if (inputState.up) {
        this.selectedIndex = (this.selectedIndex - 1 + this.modes.length) % this.modes.length;
        soundFX.playWhoosh("light");
      } else if (inputState.down) {
        this.selectedIndex = (this.selectedIndex + 1) % this.modes.length;
        soundFX.playWhoosh("light");
      }
      if (this.selectedMode === "cpu") {
        if (inputState.left) {
          this.difficultyIndex = (this.difficultyIndex - 1 + this.difficultyOptions.length) % this.difficultyOptions.length;
          soundFX.playWhoosh("light");
        } else if (inputState.right) {
          this.difficultyIndex = (this.difficultyIndex + 1) % this.difficultyOptions.length;
          soundFX.playWhoosh("light");
        }
      }
    }
    // Spacious layout constants across full vertical height (H=360, usable: 48 to 330)
    static get LIST() {
      return { x: 18, y: 48, w: 256, h: 32, gap: 3.5 };
    }
    handleClick(x, y, onBack, onConfirm, W = 640) {
      if (x >= 10 && x <= 125 && y >= 6 && y <= 38) {
        soundFX.playWhoosh("light");
        if (onBack) onBack();
        return true;
      }
      const L = _ModeSelect.LIST;
      if (x >= 12 && x <= L.x + L.w + 20) {
        for (let idx = 0; idx < this.modes.length; idx++) {
          const cy = L.y + idx * (L.h + L.gap);
          if (y >= cy - 1 && y <= cy + L.h + L.gap) {
            const wasSelected = this.selectedIndex === idx;
            this.selectedIndex = idx;
            soundFX.playWhoosh("light");
            if (wasSelected) {
              soundFX.playGong();
              if (onConfirm) onConfirm();
            }
            return true;
          }
        }
      }
      const px2 = 286, py = 48, pw = W - 18 - px2, ph = 282;
      if (x >= px2 && x <= px2 + pw && y >= py && y <= py + ph) {
        if (this.selectedMode === "cpu" && y >= py + ph - 85 && y <= py + ph - 52) {
          if (x < px2 + pw / 2) {
            this.difficultyIndex = (this.difficultyIndex - 1 + this.difficultyOptions.length) % this.difficultyOptions.length;
          } else {
            this.difficultyIndex = (this.difficultyIndex + 1) % this.difficultyOptions.length;
          }
          soundFX.playWhoosh("light");
          return true;
        }
        soundFX.playGong();
        if (onConfirm) onConfirm();
        return true;
      }
      return false;
    }
    wrapText(ctx, text, maxW) {
      const words = text.split(" ");
      const lines = [];
      let line = "";
      for (const w of words) {
        const test = line ? line + " " + w : w;
        if (ctx.measureText(test).width > maxW && line) {
          lines.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      return lines;
    }
    render(ctx, W, H) {
      this.animTimer++;
      const t = this.animTimer;
      const cur = this.modes[this.selectedIndex];
      const pulse = Math.sin(t * 0.12) * 0.5 + 0.5;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#150303");
      bg.addColorStop(0.55, "#220808");
      bg.addColorStop(1, "#050101");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 0.16 + pulse * 0.08;
      const glow = ctx.createRadialGradient(W * 0.7, H * 0.5, 10, W * 0.7, H * 0.5, 280);
      glow.addColorStop(0, cur.color);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      for (let i = 0; i < 30; i++) {
        const ex = (i * 73 + Math.sin(t * 0.02 + i) * 14) % W;
        const ey = H - (t * (0.4 + i % 5 * 0.14) + i * 53) % H;
        ctx.globalAlpha = 0.22 + i % 4 * 0.1;
        ctx.fillStyle = i % 3 === 0 ? "#fde047" : "#f97316";
        ctx.fillRect(ex, ey, 2, 2);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#0a0101";
      ctx.fillRect(0, 0, W, 42);
      ctx.fillRect(0, H - 26, W, 26);
      ctx.fillStyle = "#b91c1c";
      ctx.fillRect(0, 42, W, 2);
      ctx.fillRect(0, H - 28, W, 2);
      ctx.fillStyle = "#450a0a";
      ctx.fillRect(12, 8, 102, 26);
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 1;
      ctx.strokeRect(12.5, 8.5, 101, 25);
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("< TITLE [B]", 63, 24);
      ctx.fillStyle = "#facc15";
      ctx.font = "900 18px monospace";
      ctx.fillText("CHOOSE YOUR DESTINY", W / 2 + 10, 26);
      const L = _ModeSelect.LIST;
      this.modes.forEach((m, idx) => {
        const sel = idx === this.selectedIndex;
        const y = L.y + idx * (L.h + L.gap);
        const x = L.x + (sel ? 8 : 0);
        const w = L.w - (sel ? 8 : 0);
        ctx.fillStyle = sel ? "rgba(127, 29, 29, 0.95)" : "rgba(20, 8, 8, 0.82)";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w - 12, y);
        ctx.lineTo(x + w, y + L.h / 2);
        ctx.lineTo(x + w - 12, y + L.h);
        ctx.lineTo(x, y + L.h);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = sel ? m.color : "#3f1d1d";
        ctx.lineWidth = sel ? 2 : 1;
        ctx.stroke();
        if (sel) {
          ctx.fillStyle = m.color;
          ctx.fillRect(x - 6, y + 3, 4, L.h - 6);
        }
        const label = m.title.replace(/^[^A-Za-z0-9]+/, "");
        ctx.textAlign = "left";
        ctx.fillStyle = sel ? "#ffffff" : "#a8a29e";
        ctx.font = sel ? "bold 12px monospace" : "bold 11px monospace";
        ctx.fillText(label, x + 14, y + 14);
        ctx.fillStyle = sel ? m.color : "#78716c";
        ctx.font = "bold 8px monospace";
        ctx.fillText(m.badge, x + 14, y + 26);
      });
      const px2 = 286, py = 48, pw = W - 18 - px2, ph = 282;
      ctx.fillStyle = "rgba(10, 3, 3, 0.92)";
      ctx.fillRect(px2, py, pw, ph);
      ctx.strokeStyle = cur.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(px2 + 1, py + 1, pw - 2, ph - 2);
      ctx.strokeStyle = "rgba(250, 204, 21, 0.45)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px2 + 5, py + 5, pw - 10, ph - 10);
      ctx.globalAlpha = 0.1 + pulse * 0.05;
      ctx.fillStyle = cur.color;
      ctx.font = "900 160px serif";
      ctx.textAlign = "center";
      ctx.fillText("\u9F8D", px2 + pw / 2, py + 185);
      ctx.globalAlpha = 1;
      ctx.fillStyle = cur.color;
      ctx.font = "bold 9px monospace";
      ctx.fillText("~ " + cur.badge + " ~", px2 + pw / 2, py + 26);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 20px monospace";
      ctx.fillText(cur.title.replace(/^[^A-Za-z0-9]+/, ""), px2 + pw / 2, py + 50);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 9.5px monospace";
      ctx.fillText(cur.subtitle, px2 + pw / 2, py + 68);
      ctx.strokeStyle = "rgba(250, 204, 21, 0.3)";
      ctx.beginPath();
      ctx.moveTo(px2 + 24, py + 78);
      ctx.lineTo(px2 + pw - 24, py + 78);
      ctx.stroke();
      ctx.fillStyle = "#e7e5e4";
      ctx.font = "11px monospace";
      this.wrapText(ctx, cur.description, pw - 36).forEach((ln, i) => {
        ctx.fillText(ln, px2 + pw / 2, py + 100 + i * 18);
      });
      if (cur.id === "campaign") {
        ctx.fillStyle = "rgba(220, 38, 38, 0.2)";
        ctx.fillRect(px2 + 16, py + 148, pw - 32, 60);
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 1;
        ctx.strokeRect(px2 + 16, py + 148, pw - 32, 60);
        ctx.fillStyle = "#f87171";
        ctx.font = "bold 8.5px monospace";
        ctx.fillText("\u2694\uFE0F CAMPAIGN CHAPTER ROADMAP (8 BOSSES):", px2 + pw / 2, py + 162);
        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 7.5px monospace";
        ctx.fillText("1: SGT. VANCE  \u2794  2: PROMOTER  \u2794  3: BOUNCER TWINS", px2 + pw / 2, py + 178);
        ctx.fillText("4: MATRIARCH  \u2794  5: STREET LORD  \u2794  6: URBAN LEGEND", px2 + pw / 2, py + 190);
        ctx.fillText("7: THE CHAMPION  \u2794  8: PRIMEVAL ENDLESS DRAGON \u{1F409}", px2 + pw / 2, py + 201);
      }
      if (cur.id === "cpu") {
        const d = this.currentDifficulty;
        const dColor = d === "hard" ? "#ef4444" : d === "normal" ? "#f59e0b" : "#22c55e";
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(px2 + 20, py + ph - 88, pw - 40, 26);
        ctx.strokeStyle = dColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(px2 + 20, py + ph - 88, pw - 40, 26);
        ctx.fillStyle = dColor;
        ctx.font = "bold 11px monospace";
        ctx.fillText("\u25C0  DIFFICULTY: " + d.toUpperCase() + "  \u25B6", px2 + pw / 2, py + ph - 71);
      }
      const btnW = pw - 32;
      const btnH = 34;
      const btnX = px2 + 16;
      const btnY = py + ph - 44;
      const btnPulse = Math.floor(t / 25) % 2 === 0;
      ctx.fillStyle = btnPulse ? "rgba(185, 28, 28, 0.9)" : "rgba(153, 27, 27, 0.85)";
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(btnX, btnY, btnW, btnH);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px monospace";
      const actionVerb = cur.id === "shop" ? "ENTER ITEM SHOP" : `START ${cur.title.replace(/^[^A-Za-z0-9]+/, "")}`;
      ctx.fillText(`\u25B6  ${actionVerb}  [ENTER / CLICK]`, px2 + pw / 2, btnY + 22);
      ctx.fillStyle = "#d6d3d1";
      ctx.font = "bold 9px monospace";
      ctx.fillText("W/S NAVIGATE   A/D DIFFICULTY   ENTER CONFIRM   B/ESC BACK", W / 2, H - 10);
      ctx.textAlign = "left";
    }
  };

  // src/graphics/StageCatalog.js
  var STAGE_CATALOG = [
    {
      id: "suzaku",
      name: "SUZAKU ROOFTOP",
      location: "Tokyo Sunset",
      blurb: "Falling cherry blossoms drift across a blood-red sunset skyline.",
      accent: "#f97316"
    },
    {
      id: "neo_tokyo",
      name: "NEO UNDERPASS",
      location: "Cyberpunk District",
      blurb: "Neon steam vents and a roaring bullet train shake the concrete.",
      accent: "#22d3ee"
    },
    {
      id: "thunder_dojo",
      name: "THUNDER DOJO",
      location: "Ancient Storm Hall",
      blurb: "Lightning flashes through shoji screens above polished tatami.",
      accent: "#facc15"
    },
    {
      id: "dragon_shrine",
      name: "DRAGON SHRINE",
      location: "Crimson Twilight",
      blurb: "Rune-lit pillars glow beneath a blood moon and violet storm.",
      accent: "#a855f7"
    },
    {
      id: "ember_forge",
      name: "EMBER FORGE",
      location: "Volcanic Foundry",
      blurb: "Molten rivers roar behind a forge where legends were hammered.",
      accent: "#ef4444"
    },
    {
      id: "bamboo_night",
      name: "MOONLIT BAMBOO",
      location: "Silent Midnight Grove",
      blurb: "Fireflies drift between swaying bamboo under a silver moon.",
      accent: "#34d399"
    }
  ];

  // src/graphics/FighterRig.js
  var OUT = "#120a0c";
  function hexToRgb(h) {
    const s = h.replace("#", "");
    const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
    const n = parseInt(f, 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function rgbToHex(r, g, b) {
    const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
    return "#" + c(r) + c(g) + c(b);
  }
  var shadeCache = /* @__PURE__ */ new Map();
  function shade(hex, amt) {
    const key = hex + amt;
    if (shadeCache.has(key)) return shadeCache.get(key);
    const [r, g, b] = hexToRgb(hex);
    const t = amt < 0 ? 0 : 255;
    const k = Math.abs(amt);
    const out = rgbToHex(r + (t - r) * k, g + (t - g) * k, b + (t - b) * k);
    shadeCache.set(key, out);
    return out;
  }
  function px(ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  }
  function brush(ctx, x1, y1, x2, y2, w, c) {
    const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1)));
    ctx.fillStyle = c;
    const half = w / 2;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      ctx.fillRect(Math.round(x1 + (x2 - x1) * t - half), Math.round(y1 + (y2 - y1) * t - half), w, w);
    }
  }
  function poly(ctx, pts, c) {
    let minY = Infinity, maxY = -Infinity;
    for (const p of pts) {
      minY = Math.min(minY, p[1]);
      maxY = Math.max(maxY, p[1]);
    }
    ctx.fillStyle = c;
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      const yy = y + 0.5;
      let lo = Infinity, hi = -Infinity;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if (a[1] <= yy && b[1] > yy || b[1] <= yy && a[1] > yy) {
          const x = a[0] + (yy - a[1]) / (b[1] - a[1]) * (b[0] - a[0]);
          lo = Math.min(lo, x);
          hi = Math.max(hi, x);
        }
      }
      if (hi >= lo) ctx.fillRect(Math.round(lo), y, Math.max(1, Math.round(hi) - Math.round(lo)), 1);
    }
  }
  function ik(sx, sy, tx, ty, l1, l2, bend) {
    let dx = tx - sx, dy = ty - sy;
    let d = Math.hypot(dx, dy);
    const maxd = l1 + l2 - 0.05;
    if (d > maxd) {
      const k = maxd / d;
      dx *= k;
      dy *= k;
      d = maxd;
      tx = sx + dx;
      ty = sy + dy;
    }
    if (d < 0.5) d = 0.5;
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const mx = sx + dx * a / d, my = sy + dy * a / d;
    return { ex: mx + -dy / d * h * bend, ey: my + dx / d * h * bend, hx: tx, hy: ty };
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function lerpArr(a, b, t) {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  }
  var BASE = { hy: 1, lean: 0, fa: [12, 1], ra: [8, 3], ff: [10, 26], rf: [-9, 27], hdx: 0, hdy: 0, expr: "normal" };
  var CROUCH = { hy: 13, lean: 2, fa: [12, 6], ra: [8, 8], ff: [12, 14], rf: [-10, 14], hdx: 1, hdy: 0 };
  var AIR = { hy: -10, lean: 0, fa: [10, -6], ra: [6, -4], ff: [10, 20], rf: [-6, 22], hdx: 0, hdy: 0 };
  var ATTACKS = {
    light_punch: { base: BASE, wind: { fa: [4, 5], lean: -1 }, strike: { fa: [22, -2], lean: 2, ra: [6, 6] } },
    heavy_punch: { base: BASE, wind: { fa: [-3, 7], lean: -3, ra: [12, 0] }, strike: { fa: [25, -3], lean: 6, ff: [16, 26], rf: [-12, 27], hy: 2 } },
    light_kick: { base: BASE, wind: { ff: [12, 16], lean: -1 }, strike: { ff: [25, 4], lean: -3, ra: [0, -6] } },
    heavy_kick: { base: BASE, wind: { ff: [8, 12], lean: -4 }, strike: { ff: [27, -6], lean: -8, fa: [10, -8], ra: [-12, 0], hy: 0 } },
    crouch_lp: { base: CROUCH, wind: { fa: [6, 7] }, strike: { fa: [22, 5] } },
    crouch_hp: { base: CROUCH, wind: { fa: [6, 12], hy: 14 }, strike: { fa: [10, -22], hy: 9, ff: [10, 17] } },
    crouch_lk: { base: CROUCH, wind: { ff: [10, 12] }, strike: { ff: [24, 12] } },
    crouch_hk: { base: CROUCH, wind: { ff: [8, 12], lean: 3 }, strike: { ff: [30, 14], lean: -4, rf: [-12, 14], hy: 14 } },
    jump_punch: { base: AIR, wind: { fa: [6, -2] }, strike: { fa: [22, 8] } },
    jump_kick: { base: AIR, wind: { ff: [8, 14] }, strike: { ff: [24, 14], lean: -4 } },
    special_1: { base: BASE, wind: { fa: [3, 8], ra: [0, 8], lean: -3, hy: 3 }, strike: { fa: [24, 2], ra: [20, 4], lean: 4, ff: [14, 26], hy: 2 } },
    special_2: { base: BASE, wind: { hy: 6, fa: [6, 12], ra: [4, 12] }, strike: { fa: [8, -26], ra: [4, -12], hy: -6, ff: [8, 22], rf: [-6, 24], lean: 2 } },
    special_3: { base: BASE, wind: { ff: [8, 14], lean: -2 }, strike: { ff: [28, -2], lean: -6, hy: -3, fa: [8, -6] } },
    dirty: { base: CROUCH, wind: { fa: [0, 10] }, strike: { fa: [20, 12], lean: 3 } }
  };
  var PROFILES = {
    2: ["w", 1],
    3: ["w", 1, 0.45],
    4: ["w", 0.55, 1, 0.4],
    5: ["w", 0.3, 0.7, 1, 0.4]
  };
  function mergePose(base, over) {
    return { ...BASE, ...base, ...over };
  }
  function blendPose(a, b, t) {
    return {
      hy: lerp(a.hy, b.hy, t),
      lean: lerp(a.lean, b.lean, t),
      hdx: lerp(a.hdx || 0, b.hdx || 0, t),
      hdy: lerp(a.hdy || 0, b.hdy || 0, t),
      fa: lerpArr(a.fa, b.fa, t),
      ra: lerpArr(a.ra, b.ra, t),
      ff: lerpArr(a.ff, b.ff, t),
      rf: lerpArr(a.rf, b.rf, t),
      expr: b.expr || a.expr
    };
  }
  function poseFor(state, i, n) {
    const ph = i / n * Math.PI * 2;
    switch (state) {
      case "idle": {
        const b = Math.sin(ph);
        return mergePose(BASE, { hy: 1 + Math.round(b * 0.8), fa: [12, 1 + b * 0.8], ra: [8, 3 - b * 0.5], lean: Math.round(b * 0.5) });
      }
      case "walk": {
        const s = Math.sin(ph), c = Math.cos(ph);
        return mergePose(BASE, {
          hy: 1 + Math.abs(s) * 0.6,
          ff: [9 + 7 * s, 26 - Math.max(0, c) * 5],
          rf: [-9 - 7 * s, 26 - Math.max(0, -c) * 5],
          fa: [11 - 3 * s, 2],
          ra: [8 + 3 * s, 3]
        });
      }
      case "jump": {
        const peak = i === 1 ? -14 : -8;
        return mergePose(AIR, { hy: peak, ff: i === 2 ? [8, 24] : [10, 18], rf: i === 2 ? [-8, 24] : [-6, 22] });
      }
      case "crouch":
        return mergePose(CROUCH, { hy: 13 + (i === 0 ? -2 : 0) });
      case "hit": {
        const k = i === 0 ? 0 : 1;
        return mergePose(BASE, { hy: 1 + k, lean: -3 - k * 2, fa: [-4, 8], ra: [-8, 6], hdx: -2, hdy: 1, ff: [8, 26], rf: [-12 - k * 2, 26], expr: "pain" });
      }
      case "block":
        return mergePose(BASE, { hy: 3 + (i % 2 === 1 ? 1 : 0), lean: -1, fa: [8, -6], ra: [10, -4], ff: [11, 24], rf: [-10, 25], hdx: -1, hdy: 1, expr: "block" });
      case "dash": {
        const k = i % 2;
        return mergePose(BASE, { hy: 4, lean: 8, ff: [18 - k * 3, 24], rf: [-16 + k * 3, 27 - k * 4], fa: [-6, 4], ra: [-8, 2], hdx: 2, hdy: 1 });
      }
      case "ultimate": {
        const charge = { hy: 3, lean: -2, fa: [4, -18], ra: [-4, -16], ff: [13, 26], rf: [-12, 26], expr: "rage" };
        const fin = { hy: 2, lean: 7, fa: [27, -2], ra: [24, 2], ff: [16, 26], rf: [-12, 26], expr: "rage" };
        const base = mergePose(BASE, {});
        if (i < 4) return blendPose(base, mergePose(BASE, charge), (i + 1) / 4);
        const e = Math.min(1, (i - 3) / 2) * (i === 7 ? 0.6 : 1);
        return blendPose(mergePose(BASE, charge), mergePose(BASE, fin), e);
      }
      default: {
        const def = ATTACKS[state];
        if (!def) return mergePose(BASE, {});
        const base = mergePose(def.base, {});
        const prof = PROFILES[Math.min(5, Math.max(2, n))];
        const p = prof[Math.min(i, prof.length - 1)];
        if (p === "w") return blendPose(base, mergePose(def.base, def.wind), 1);
        return blendPose(base, mergePose(def.base, def.strike), p);
      }
    }
  }
  function buildMetrics(spec) {
    const b = spec.build || "normal";
    if (b === "heavy") return { limb: 7, thigh: 8, sw: 9, hw: 7, torso: 19, headW: 13 };
    if (b === "lean") return { limb: 5, thigh: 6, sw: 6.5, hw: 5, torso: 19, headW: 11 };
    return { limb: 6, thigh: 7, sw: 7.5, hw: 6, torso: 19, headW: 12 };
  }
  function drawArm(ctx, spec, M, sh, target, isFront) {
    const k = ik(sh[0], sh[1], sh[0] + target[0], sh[1] + target[1], 10, 10, 1);
    const skin = spec.skin;
    const armCol = spec.arms ? spec.arms.color : null;
    const style = spec.arms && spec.arms.style || "bare";
    const w = M.limb - 1;
    const dim = isFront ? 0 : -0.22;
    const upperCol = style === "sleeve" || style === "long" || style === "gauntlet" && false ? armCol : skin;
    const lowerCol = style === "long" ? armCol : style === "gauntlet" ? armCol : skin;
    const A = [sh[0], sh[1]], B = [k.ex, k.ey], C = [k.hx, k.hy];
    brush(ctx, A[0], A[1], B[0], B[1], w + 2, OUT);
    brush(ctx, B[0], B[1], C[0], C[1], w + 2, OUT);
    brush(ctx, A[0], A[1], B[0], B[1], w, shade(upperCol, dim));
    brush(ctx, B[0], B[1], C[0], C[1], w, shade(lowerCol, dim));
    brush(ctx, A[0] + 1, A[1] - 1, B[0] + 1, B[1] - 1, 1, shade(upperCol, 0.2 + dim));
    brush(ctx, B[0] + 1, B[1] - 1, C[0] + 1, C[1] - 1, 1, shade(lowerCol, 0.2 + dim));
    if (style === "gauntlet") {
      const mx = lerp(B[0], C[0], 0.5), my = lerp(B[1], C[1], 0.5);
      brush(ctx, mx, my, C[0], C[1], w + 1, shade(armCol, 0.1 + dim));
      px(ctx, C[0] - 1, C[1] - 1, 2, 1, shade(armCol, 0.5));
    }
    const gl = spec.gloves || { style: "none" };
    if (gl.style === "wraps") {
      const mx = lerp(B[0], C[0], 0.45), my = lerp(B[1], C[1], 0.45);
      brush(ctx, mx, my, C[0], C[1], w, shade(gl.color, dim));
      px(ctx, mx - 1, my, w, 1, shade(gl.color, -0.3));
    }
    const handCol = gl.style === "glove" || gl.style === "claws" ? gl.color : skin;
    const hs = gl.style === "glove" ? w + 1 : w - 1;
    px(ctx, C[0] - hs / 2 - 1, C[1] - hs / 2 - 1, hs + 2, hs + 2, OUT);
    px(ctx, C[0] - hs / 2, C[1] - hs / 2, hs, hs, shade(handCol, dim));
    px(ctx, C[0] - hs / 2 + 1, C[1] - hs / 2, 1, 1, shade(handCol, 0.4));
    if (gl.style === "claws") {
      for (let c = 0; c < 3; c++) {
        brush(ctx, C[0] + 1, C[1] - 1 + c, C[0] + 5, C[1] - 1 + c, 1, "#e5e7eb");
      }
    }
    if (spec.pauldrons && isFront) {
      px(ctx, A[0] - 4, A[1] - 3, 9, 6, OUT);
      px(ctx, A[0] - 3, A[1] - 2, 7, 4, spec.pauldrons);
      px(ctx, A[0] - 2, A[1] - 2, 4, 1, shade(spec.pauldrons, 0.4));
      px(ctx, A[0] - 3, A[1] + 1, 7, 1, shade(spec.pauldrons, -0.35));
    } else if (spec.pauldrons) {
      px(ctx, A[0] - 3, A[1] - 3, 7, 5, OUT);
      px(ctx, A[0] - 2, A[1] - 2, 5, 3, shade(spec.pauldrons, -0.25));
    }
    return C;
  }
  function drawLeg(ctx, spec, M, hip, target, isFront) {
    const k = ik(hip[0], hip[1], hip[0] + target[0], hip[1] + target[1], 14, 14, -1);
    const dim = isFront ? 0 : -0.22;
    const bt = spec.bottom || { style: "pants", color: "#444" };
    const boots = spec.boots || { style: "bare" };
    const skin = spec.skin;
    const bare = bt.style === "loin" || bt.style === "shorts" || bt.style === "skirt";
    const thighCol = bt.style === "loin" || bt.style === "skirt" ? skin : bt.color;
    const shinCol = bt.style === "pants" || bt.style === "hakama" ? bt.color : skin;
    const w = M.thigh;
    const A = [hip[0], hip[1]], B = [k.ex, k.ey], C = [k.hx, k.hy];
    brush(ctx, A[0], A[1], B[0], B[1], w + 2, OUT);
    brush(ctx, B[0], B[1], C[0], C[1], w - 1, OUT);
    brush(ctx, A[0], A[1], B[0], B[1], w, shade(thighCol, dim));
    brush(ctx, B[0], B[1], C[0], C[1], w - 2, shade(shinCol, dim));
    brush(ctx, A[0] + 1, A[1] - 1, B[0] + 1, B[1] - 1, 2, shade(thighCol, 0.2 + dim));
    brush(ctx, B[0] + 1, B[1] - 1, C[0] + 1, C[1] - 1, 1, shade(shinCol, 0.2 + dim));
    if (bt.trim) {
      const hx = lerp(A[0], B[0], 0.82), hy = lerp(A[1], B[1], 0.82);
      brush(ctx, hx, hy, B[0], B[1], w, shade(bt.trim, dim));
    }
    const bs = boots.style || "bare";
    if (bs !== "bare") {
      const sx = lerp(B[0], C[0], 0.45), sy = lerp(B[1], C[1], 0.45);
      const bw = bs === "greave" ? w - 1 : w - 1;
      brush(ctx, sx, sy, C[0], C[1], bw + 2, OUT);
      brush(ctx, sx, sy, C[0], C[1], bw, shade(boots.color, dim));
      brush(ctx, sx + 1, sy - 1, C[0] + 1, C[1] - 1, 1, shade(boots.color, 0.3 + dim));
      if (boots.trim) px(ctx, sx - bw / 2, sy, bw, 1, shade(boots.trim, dim));
    }
    const footCol = bs === "bare" ? skin : boots.color;
    px(ctx, C[0] - 3, C[1] - 2, 10, 5, OUT);
    px(ctx, C[0] - 2, C[1] - 1, 8, 3, shade(footCol, dim));
    px(ctx, C[0] - 2, C[1] - 1, 8, 1, shade(footCol, 0.25 + dim));
    px(ctx, C[0] - 2, C[1] + 1, 8, 1, shade(footCol, -0.35 + dim));
    if (spec.kneePads && isFront) {
      px(ctx, B[0] - 2, B[1] - 2, 5, 5, OUT);
      px(ctx, B[0] - 1, B[1] - 1, 3, 3, spec.kneePads);
    }
    return C;
  }
  function drawTorso(ctx, spec, M, hip, sc, state, t) {
    const top = spec.top || { style: "bare" };
    const sw = M.sw, hw = M.hw;
    const skin = spec.skin;
    const main = top.style === "bare" ? skin : top.color || "#555";
    const L = [sc[0] - sw, sc[1]], R = [sc[0] + sw, sc[1]];
    const HL = [hip[0] - hw, hip[1] + 1], HR = [hip[0] + hw, hip[1] + 1];
    const neck = [sc[0], sc[1] - 2];
    const outline = [[L[0] - 1, L[1] - 1], [R[0] + 1, R[1] - 1], [HR[0] + 1, HR[1] + 1], [HL[0] - 1, HL[1] + 1]];
    poly(ctx, outline, OUT);
    poly(ctx, [L, R, HR, HL], main);
    const midL = [lerp(L[0], R[0], 0.38), L[1]], midLb = [lerp(HL[0], HR[0], 0.38), HL[1]];
    poly(ctx, [L, midL, midLb, HL], shade(main, -0.28));
    const midR = [lerp(L[0], R[0], 0.85), L[1]], midRb = [lerp(HL[0], HR[0], 0.85), HL[1]];
    poly(ctx, [midR, R, HR, midRb], shade(main, 0.14));
    const cx = (sc[0] + hip[0]) / 2;
    switch (top.style) {
      case "bare": {
        px(ctx, sc[0] - 4, sc[1] + 3, 4, 1, shade(skin, -0.35));
        px(ctx, sc[0] + 1, sc[1] + 3, 5, 1, shade(skin, -0.35));
        px(ctx, cx, sc[1] + 4, 1, hip[1] - sc[1] - 4, shade(skin, -0.3));
        for (let r = 0; r < 3; r++) px(ctx, cx - 3, sc[1] + 8 + r * 3, 7, 1, shade(skin, -0.25));
        break;
      }
      case "vest":
      case "jacket":
      case "robe": {
        const under = top.under || skin;
        poly(ctx, [[sc[0] + 1, sc[1]], [sc[0] + 5, sc[1]], [hip[0] + 4, hip[1]], [hip[0], hip[1]]], under);
        brush(ctx, sc[0] + 1, sc[1], hip[0], hip[1] - 1, 1, shade(top.trim || main, 0.1));
        brush(ctx, sc[0] + 5, sc[1], hip[0] + 4, hip[1] - 1, 1, shade(top.trim || main, 0.1));
        if (top.style === "jacket") {
          px(ctx, sc[0] - sw, sc[1], 2, 3, shade(main, 0.3));
        }
        if (top.stars) {
          for (let s = 0; s < 6; s++) {
            const sx = L[0] + 2 + s * 5 % (sw * 2 - 3), sy = sc[1] + 3 + s * 7 % 14;
            px(ctx, sx, sy, 1, 1, "#fde68a");
          }
        }
        break;
      }
      case "tank": {
        px(ctx, sc[0] - 3, sc[1], 6, 1, skin);
        px(ctx, sc[0] - 2, sc[1] + 1, 4, 1, skin);
        break;
      }
      case "wraps": {
        for (let r = 0; r < 4; r++) px(ctx, L[0] + r % 2, sc[1] + 2 + r * 3, sw * 2 - 1, 1, shade(main, -0.3));
        break;
      }
      case "armor": {
        const trim = top.trim || shade(main, 0.35);
        px(ctx, sc[0] - sw + 1, sc[1] + 1, sw * 2 - 2, 1, shade(main, 0.45));
        brush(ctx, sc[0] + 1, sc[1] + 2, hip[0] + 1, hip[1] - 3, 1, shade(main, -0.4));
        for (let r = 0; r < 4; r++) {
          px(ctx, L[0] + 1, sc[1] + 5 + r * 3, sw * 2 - 2, 1, shade(main, -0.38));
          px(ctx, sc[0] + 3, sc[1] + 6 + r * 3, 1, 1, trim);
        }
        px(ctx, sc[0] - 1, sc[1] + 2, 3, 3, trim);
        break;
      }
    }
    const belt = spec.belt;
    if (belt) {
      const by = hip[1] - 2;
      px(ctx, hip[0] - hw - 1, by - 1, hw * 2 + 3, 5, OUT);
      px(ctx, hip[0] - hw, by, hw * 2 + 1, 3, belt.color);
      px(ctx, hip[0] - hw, by, hw * 2 + 1, 1, shade(belt.color, 0.35));
      if (belt.buckle) px(ctx, hip[0] + 1, by, 3, 3, belt.buckle);
      if (belt.tails) {
        const sway = Math.sin(t * 1.3) * 1.5;
        brush(ctx, hip[0] - hw + 1, by + 2, hip[0] - hw - 3 + sway, by + 10, 2, belt.color);
        brush(ctx, hip[0] - hw + 2, by + 2, hip[0] - hw - 1 + sway, by + 12, 2, shade(belt.color, -0.25));
      }
    }
    if (spec.fur) {
      px(ctx, sc[0] - sw - 1, sc[1] - 3, sw * 2 + 3, 4, OUT);
      px(ctx, sc[0] - sw, sc[1] - 2, sw * 2 + 1, 3, spec.fur);
      for (let f = 0; f < sw * 2; f += 2) px(ctx, sc[0] - sw + f, sc[1] + 1, 1, 1, shade(spec.fur, -0.3));
      px(ctx, sc[0] - sw + 1, sc[1] - 2, sw * 2 - 1, 1, shade(spec.fur, 0.35));
    }
    if (spec.bandolier) {
      brush(ctx, L[0] + 1, sc[1] + 1, HR[0] - 1, hip[1] - 2, 2, OUT);
      brush(ctx, L[0] + 1, sc[1] + 1, HR[0] - 1, hip[1] - 2, 1, spec.bandolier);
      for (let b = 0; b < 4; b++) {
        const bx = lerp(L[0] + 2, HR[0] - 2, (b + 0.5) / 4), by = lerp(sc[1] + 2, hip[1] - 3, (b + 0.5) / 4);
        px(ctx, bx, by, 2, 2, "#fbbf24");
      }
    }
    return { neck };
  }
  function drawBottomOver(ctx, spec, M, hip, t) {
    const bt = spec.bottom || {};
    const hw = M.hw;
    const sway = Math.sin(t * 1.1) * 1.2;
    if (bt.style === "hakama") {
      const col = bt.color;
      const pts = [[hip[0] - hw - 1, hip[1]], [hip[0] + hw + 2, hip[1]], [hip[0] + hw + 6 + sway, hip[1] + 25], [hip[0] - hw - 6 + sway, hip[1] + 25]];
      poly(ctx, [[pts[0][0] - 1, pts[0][1] - 1], [pts[1][0] + 1, pts[1][1] - 1], [pts[2][0] + 1, pts[2][1] + 1], [pts[3][0] - 1, pts[3][1] + 1]], OUT);
      poly(ctx, pts, col);
      poly(ctx, [pts[0], [hip[0] - 1, hip[1]], [hip[0] - 2 + sway, hip[1] + 25], pts[3]], shade(col, -0.25));
      if (bt.trim) px(ctx, pts[3][0], hip[1] + 22, pts[2][0] - pts[3][0], 2, bt.trim);
      brush(ctx, hip[0] + 2, hip[1] + 2, hip[0] + 3 + sway, hip[1] + 24, 1, shade(col, 0.2));
    } else if (bt.style === "skirt") {
      const col = bt.color;
      const pts = [[hip[0] - hw - 1, hip[1]], [hip[0] + hw + 2, hip[1]], [hip[0] + hw + 5 + sway, hip[1] + 12], [hip[0] - hw - 5 + sway, hip[1] + 12]];
      poly(ctx, [[pts[0][0] - 1, pts[0][1] - 1], [pts[1][0] + 1, pts[1][1] - 1], [pts[2][0] + 1, pts[2][1] + 1], [pts[3][0] - 1, pts[3][1] + 1]], OUT);
      poly(ctx, pts, col);
      poly(ctx, [pts[0], [hip[0] - 1, hip[1]], [hip[0] - 2 + sway, hip[1] + 12], pts[3]], shade(col, -0.25));
      for (let s = 0; s < 4; s++) px(ctx, pts[3][0] + s * 4, hip[1] + 4, 1, 8, shade(col, -0.35));
      if (bt.trim) px(ctx, pts[3][0], hip[1] + 11, pts[2][0] - pts[3][0], 1, bt.trim);
    } else if (bt.style === "loin") {
      const col = bt.color;
      poly(ctx, [[hip[0] + 1, hip[1]], [hip[0] + hw + 1, hip[1]], [hip[0] + hw + 2 + sway, hip[1] + 14], [hip[0] + 2 + sway, hip[1] + 14]], OUT);
      poly(ctx, [[hip[0] + 2, hip[1] + 1], [hip[0] + hw, hip[1] + 1], [hip[0] + hw + 1 + sway, hip[1] + 13], [hip[0] + 3 + sway, hip[1] + 13]], col);
    } else {
      px(ctx, hip[0] - hw - 1, hip[1] - 1, hw * 2 + 3, 7, OUT);
      px(ctx, hip[0] - hw, hip[1], hw * 2 + 1, 5, bt.color || "#444");
      px(ctx, hip[0] - hw, hip[1], hw * 2 + 1, 1, shade(bt.color || "#444", 0.25));
    }
  }
  function drawHead(ctx, spec, M, hc, pose, t, state) {
    const [hx, hy] = hc;
    const skin = spec.skin;
    const hairC = spec.hair ? spec.hair.color : "#222";
    const hs = spec.hair && spec.hair.style || "none";
    const hd = spec.head || { type: "none" };
    const mask = spec.mask;
    const w = M.headW;
    const sway = Math.sin(t * 1.4) * 2;
    const hurt = pose.expr === "pain";
    const rage = pose.expr === "rage";
    if (hs === "long" || hs === "braids") {
      brush(ctx, hx - 4, hy - 3, hx - 7 + sway, hy + 12, 5, OUT);
      brush(ctx, hx - 4, hy - 3, hx - 7 + sway, hy + 12, 3, hairC);
      brush(ctx, hx - 4, hy - 3, hx - 6 + sway, hy + 12, 1, shade(hairC, 0.3));
      if (hs === "braids") for (let b = 0; b < 5; b++) px(ctx, hx - 8 + sway * 0.8, hy + 2 + b * 2, 3, 1, shade(hairC, -0.4));
    }
    if (hs === "ponytail") {
      brush(ctx, hx - 5, hy - 4, hx - 12 + sway, hy + 6, 4, OUT);
      brush(ctx, hx - 5, hy - 4, hx - 12 + sway, hy + 6, 2, hairC);
    }
    if (hd.type === "band" && hd.tails) {
      brush(ctx, hx - 5, hy - 3, hx - 12 + sway, hy + 3, 3, OUT);
      brush(ctx, hx - 5, hy - 3, hx - 12 + sway, hy + 3, 1, hd.color);
      brush(ctx, hx - 5, hy - 2, hx - 11 - sway, hy + 8, 3, OUT);
      brush(ctx, hx - 5, hy - 2, hx - 11 - sway, hy + 8, 1, shade(hd.color, -0.2));
    }
    if (hd.type === "hood") {
      poly(ctx, [[hx - 8, hy - 8], [hx + 6, hy - 9], [hx + 8, hy + 1], [hx + 5, hy + 8], [hx - 9, hy + 10]], OUT);
      poly(ctx, [[hx - 7, hy - 7], [hx + 5, hy - 8], [hx + 7, hy + 1], [hx + 4, hy + 7], [hx - 8, hy + 9]], hd.color);
      poly(ctx, [[hx - 7, hy - 7], [hx - 1, hy - 8], [hx - 3, hy + 8], [hx - 8, hy + 9]], shade(hd.color, -0.3));
    }
    px(ctx, hx - w / 2 - 1, hy - 7, w + 2, 14, OUT);
    const faceRows = [[3, 6], [2, 8], [1, 10], [0, 11], [0, 11], [0, 11], [0, 11], [1, 10], [1, 9], [2, 8], [3, 6]];
    for (let r = 0; r < faceRows.length; r++) {
      const [o, wd] = faceRows[r];
      const rw = Math.round(wd / 11 * w);
      px(ctx, hx - w / 2 + Math.round(o / 11 * w), hy - 6 + r, rw, 1, skin);
    }
    px(ctx, hx - w / 2 + 1, hy - 5, 3, 9, shade(skin, -0.25));
    px(ctx, hx + w / 2 - 3, hy - 2, 2, 5, shade(skin, 0.18));
    px(ctx, hx + 2, hy + 1, 2, 2, shade(skin, -0.12));
    const eyeC = spec.eyes || "#111";
    const ey = hy - 1;
    if (mask && mask.type === "blindfold") {
      px(ctx, hx - w / 2, ey - 1, w, 3, OUT);
      px(ctx, hx - w / 2, ey, w, 2, mask.color);
      px(ctx, hx - w / 2, ey, w, 1, shade(mask.color, 0.3));
      brush(ctx, hx - w / 2, ey, hx - w / 2 - 6 + sway, ey + 5, 2, mask.color);
    } else if (hurt) {
      px(ctx, hx + 1, ey, 3, 1, "#111");
      px(ctx, hx + 5, ey, 3, 1, "#111");
    } else {
      px(ctx, hx + 1, ey - 1, 3, 3, "#f8fafc");
      px(ctx, hx + 5, ey - 1, 3, 3, "#f8fafc");
      px(ctx, hx + 3, ey - 1, 1, 3, eyeC);
      px(ctx, hx + 7, ey - 1, 1, 3, eyeC);
      px(ctx, hx + 1, ey - 3, 4, 1, shade(hairC, -0.1));
      px(ctx, hx + 5, ey - 3 + (rage ? 1 : 0), 4, 1, shade(hairC, -0.1));
    }
    if (!mask || mask.type === "blindfold") {
      if (hurt) px(ctx, hx + 3, hy + 4, 3, 2, "#450a0a");
      else if (rage) px(ctx, hx + 3, hy + 4, 4, 2, "#7f1d1d");
      else px(ctx, hx + 3, hy + 4, 3, 1, shade(skin, -0.5));
    }
    if (mask && mask.type === "lower") {
      poly(ctx, [[hx - w / 2, hy + 1], [hx + w / 2, hy + 1], [hx + w / 2 - 2, hy + 6], [hx - w / 2 + 2, hy + 6]], OUT);
      poly(ctx, [[hx - w / 2 + 1, hy + 1], [hx + w / 2 - 1, hy + 1], [hx + w / 2 - 3, hy + 5], [hx - w / 2 + 3, hy + 5]], mask.color);
      px(ctx, hx - w / 2 + 1, hy + 3, w - 3, 1, shade(mask.color, -0.3));
      px(ctx, hx + w / 2 - 4, hy + 1, 3, 1, shade(mask.color, 0.35));
    } else if (mask && mask.type === "full") {
      px(ctx, hx - w / 2, hy - 6, w, 12, mask.color);
      px(ctx, hx - w / 2, hy - 6, 3, 12, shade(mask.color, -0.3));
      px(ctx, hx + w / 2 - 3, hy - 4, 2, 6, shade(mask.color, 0.18));
      const gc = spec.glow || "#fff";
      px(ctx, hx - 1, hy - 2, w / 2 + 3, 3, "#000");
      ctx.globalAlpha = 0.55;
      px(ctx, hx - 2, hy - 3, w / 2 + 5, 5, gc);
      ctx.globalAlpha = 1;
      px(ctx, hx, hy - 1, w / 2 + 1, 1, hurt ? "#e5e7eb" : "#ffffff");
      px(ctx, hx - w / 2 + 2, hy + 3, w - 4, 1, shade(mask.color, -0.35));
    } else if (mask && mask.type === "burlap") {
      px(ctx, hx - w / 2, hy - 7, w, 14, mask.color);
      px(ctx, hx - w / 2, hy - 7, 3, 14, shade(mask.color, -0.28));
      for (let r = 0; r < 14; r += 3) px(ctx, hx - w / 2, hy - 7 + r, w, 1, shade(mask.color, -0.18));
      px(ctx, hx + 1, hy - 2, 3, 3, "#0a0a0a");
      px(ctx, hx + 6, hy - 2, 3, 3, "#0a0a0a");
      px(ctx, hx + 2, hy + 4, 6, 1, "#0a0a0a");
      for (let s = 0; s < 3; s++) px(ctx, hx + 2 + s * 2, hy + 3, 1, 3, "#0a0a0a");
      px(ctx, hx - w / 2 - 1, hy + 6, w + 2, 2, shade(mask.color, -0.3));
    }
    if (hs === "spiky") {
      poly(ctx, [[hx - 7, hy - 3], [hx - 6, hy - 11], [hx - 3, hy - 7], [hx - 1, hy - 14], [hx + 2, hy - 8], [hx + 5, hy - 12], [hx + 7, hy - 5], [hx + 6, hy - 3]], OUT);
      poly(ctx, [[hx - 6, hy - 4], [hx - 5, hy - 10], [hx - 3, hy - 6], [hx - 1, hy - 12], [hx + 2, hy - 7], [hx + 5, hy - 10], [hx + 6, hy - 5], [hx + 5, hy - 4]], hairC);
      px(ctx, hx - 1, hy - 11, 1, 3, shade(hairC, 0.35));
    } else if (hs === "short" || hs === "long" || hs === "braids" || hs === "ponytail") {
      poly(ctx, [[hx - 7, hy - 2], [hx - 6, hy - 8], [hx, hy - 9], [hx + 6, hy - 7], [hx + 7, hy - 3], [hx + 3, hy - 4], [hx, hy - 5], [hx - 4, hy - 3]], OUT);
      poly(ctx, [[hx - 6, hy - 3], [hx - 5, hy - 7], [hx, hy - 8], [hx + 5, hy - 6], [hx + 6, hy - 4], [hx + 3, hy - 5], [hx, hy - 6], [hx - 4, hy - 4]], hairC);
      px(ctx, hx - 2, hy - 7, 4, 1, shade(hairC, 0.35));
    } else if (hs === "mohawk") {
      poly(ctx, [[hx - 3, hy - 6], [hx - 2, hy - 13], [hx + 3, hy - 14], [hx + 4, hy - 6]], OUT);
      poly(ctx, [[hx - 2, hy - 7], [hx - 1, hy - 12], [hx + 2, hy - 13], [hx + 3, hy - 7]], hairC);
    } else if (hs === "topknot") {
      px(ctx, hx - 2, hy - 13, 5, 5, OUT);
      px(ctx, hx - 1, hy - 12, 3, 3, hairC);
      px(ctx, hx - 6, hy - 7, 12, 3, OUT);
      px(ctx, hx - 5, hy - 6, 10, 2, hairC);
    } else if (hs === "bun") {
      px(ctx, hx - 3, hy - 13, 6, 6, OUT);
      px(ctx, hx - 2, hy - 12, 4, 4, hairC);
      px(ctx, hx - 6, hy - 7, 12, 3, OUT);
      px(ctx, hx - 5, hy - 6, 10, 2, hairC);
    }
    if (hd.type === "band") {
      px(ctx, hx - w / 2 - 1, hy - 5, w + 2, 4, OUT);
      px(ctx, hx - w / 2, hy - 4, w, 2, hd.color);
      px(ctx, hx - w / 2, hy - 4, w, 1, shade(hd.color, 0.35));
      if (hd.trim) px(ctx, hx + 3, hy - 4, 2, 2, hd.trim);
    } else if (hd.type === "hat") {
      poly(ctx, [[hx - 15, hy - 4], [hx, hy - 15], [hx + 15, hy - 4]], OUT);
      poly(ctx, [[hx - 14, hy - 5], [hx, hy - 14], [hx + 14, hy - 5]], hd.color);
      poly(ctx, [[hx - 14, hy - 5], [hx - 2, hy - 13], [hx - 2, hy - 5]], shade(hd.color, -0.25));
      px(ctx, hx - 15, hy - 5, 30, 2, shade(hd.color, -0.4));
      for (let r = 0; r < 4; r++) px(ctx, hx - 10 + r * 6, hy - 9 + r % 2, 3, 1, shade(hd.color, 0.3));
    } else if (hd.type === "kabuto") {
      poly(ctx, [[hx - 8, hy - 2], [hx - 7, hy - 10], [hx, hy - 12], [hx + 7, hy - 10], [hx + 8, hy - 2]], OUT);
      poly(ctx, [[hx - 7, hy - 3], [hx - 6, hy - 9], [hx, hy - 11], [hx + 6, hy - 9], [hx + 7, hy - 3]], hd.color);
      poly(ctx, [[hx - 7, hy - 3], [hx - 6, hy - 9], [hx - 2, hy - 10], [hx - 3, hy - 3]], shade(hd.color, -0.3));
      px(ctx, hx - 8, hy - 4, 16, 2, shade(hd.color, -0.35));
      brush(ctx, hx - 5, hy - 12, hx - 1, hy - 17, 1, hd.trim || "#fbbf24");
      brush(ctx, hx + 5, hy - 12, hx + 1, hy - 17, 1, hd.trim || "#fbbf24");
      poly(ctx, [[hx - 9, hy], [hx - 5, hy - 2], [hx - 4, hy + 7], [hx - 10, hy + 9]], shade(hd.color, -0.15));
      px(ctx, hx - 10, hy + 2, 5, 1, hd.trim || "#fbbf24");
    } else if (hd.type === "helm") {
      poly(ctx, [[hx - 8, hy + 4], [hx - 8, hy - 6], [hx - 3, hy - 10], [hx + 4, hy - 9], [hx + 8, hy - 4], [hx + 8, hy + 4]], OUT);
      poly(ctx, [[hx - 7, hy + 3], [hx - 7, hy - 5], [hx - 3, hy - 9], [hx + 3, hy - 8], [hx + 7, hy - 4], [hx + 7, hy + 3]], hd.color);
      px(ctx, hx - 7, hy - 5, 4, 8, shade(hd.color, -0.3));
      px(ctx, hx + 1, hy - 2, 7, 3, "#000");
      const gc = spec.glow || "#fff";
      ctx.globalAlpha = 0.6;
      px(ctx, hx + 3, hy - 1, 5, 1, gc);
      ctx.globalAlpha = 1;
      px(ctx, hx - 1, hy - 9, 3, 2, shade(hd.color, 0.4));
    } else if (hd.type === "turban") {
      poly(ctx, [[hx - 8, hy - 1], [hx - 7, hy - 9], [hx, hy - 11], [hx + 7, hy - 9], [hx + 8, hy - 1]], OUT);
      poly(ctx, [[hx - 7, hy - 2], [hx - 6, hy - 8], [hx, hy - 10], [hx + 6, hy - 8], [hx + 7, hy - 2]], hd.color);
      for (let r = 0; r < 4; r++) px(ctx, hx - 7 + r, hy - 8 + r * 2, 14 - r * 2, 1, shade(hd.color, -0.25));
      brush(ctx, hx - 6, hy - 3, hx - 12 + sway, hy + 7, 3, OUT);
      brush(ctx, hx - 6, hy - 3, hx - 12 + sway, hy + 7, 1, hd.color);
      if (hd.veil) {
        px(ctx, hx - w / 2, hy + 1, w, 5, OUT);
        px(ctx, hx - w / 2 + 1, hy + 2, w - 2, 3, hd.veil);
      }
    } else if (hd.type === "horns") {
      poly(ctx, [[hx - 6, hy - 5], [hx - 9, hy - 15], [hx - 3, hy - 7]], OUT);
      poly(ctx, [[hx + 2, hy - 6], [hx + 6, hy - 16], [hx + 7, hy - 6]], OUT);
      poly(ctx, [[hx - 6, hy - 6], [hx - 8, hy - 14], [hx - 4, hy - 7]], hd.color);
      poly(ctx, [[hx + 3, hy - 7], [hx + 6, hy - 15], [hx + 6, hy - 7]], hd.color);
    } else if (hd.type === "hood") {
      poly(ctx, [[hx - 8, hy - 8], [hx + 7, hy - 9], [hx + 9, hy - 2], [hx + 4, hy - 3], [hx - 2, hy - 4], [hx - 8, hy - 2]], OUT);
      poly(ctx, [[hx - 7, hy - 7], [hx + 6, hy - 8], [hx + 8, hy - 3], [hx + 4, hy - 4], [hx - 2, hy - 5], [hx - 7, hy - 3]], hd.color);
      px(ctx, hx - 6, hy - 6, 6, 1, shade(hd.color, 0.3));
      ctx.globalAlpha = 0.55;
      px(ctx, hx - w / 2 + 1, hy - 4, w - 1, 3, "#000");
      ctx.globalAlpha = 1;
      if (hd.cowl) {
        poly(ctx, [[hx - 8, hy + 3], [hx + 8, hy + 3], [hx + 9, hy + 9], [hx - 9, hy + 9]], OUT);
        poly(ctx, [[hx - 7, hy + 3], [hx + 7, hy + 3], [hx + 8, hy + 8], [hx - 8, hy + 8]], hd.cowl);
      }
    }
    if (hd.type === "hood" && spec.glow && !hurt) {
      ctx.globalAlpha = 0.9;
      px(ctx, hx + 2, hy - 1, 2, 1, spec.glow);
      px(ctx, hx + 6, hy - 1, 2, 1, spec.glow);
      ctx.globalAlpha = 1;
    }
  }
  function drawBackStuff(ctx, spec, hip, sc, t, state, pose) {
    const sway = Math.sin(t * 1.2) * 3;
    const fast = state === "dash" ? 6 : 0;
    if (spec.wings) {
      const w = spec.wings;
      const flap = Math.sin(t * 1.5) * 4;
      poly(ctx, [[sc[0] - 2, sc[1] + 2], [sc[0] - 14 - fast, sc[1] - 16 + flap], [sc[0] - 30 - fast, sc[1] - 6 + flap], [sc[0] - 22 - fast, sc[1] + 4], [sc[0] - 26 - fast, sc[1] + 14], [sc[0] - 8, sc[1] + 12]], OUT);
      poly(ctx, [[sc[0] - 2, sc[1] + 3], [sc[0] - 14 - fast, sc[1] - 14 + flap], [sc[0] - 28 - fast, sc[1] - 5 + flap], [sc[0] - 21 - fast, sc[1] + 4], [sc[0] - 24 - fast, sc[1] + 12], [sc[0] - 8, sc[1] + 11]], w.membrane);
      brush(ctx, sc[0] - 3, sc[1] + 3, sc[0] - 14 - fast, sc[1] - 14 + flap, 2, w.bone);
      brush(ctx, sc[0] - 3, sc[1] + 3, sc[0] - 28 - fast, sc[1] - 5 + flap, 1, w.bone);
      brush(ctx, sc[0] - 3, sc[1] + 3, sc[0] - 24 - fast, sc[1] + 12, 1, w.bone);
    }
    if (spec.tail) {
      const col = spec.tail;
      const pts = [[hip[0] - 4, hip[1] + 2], [hip[0] - 11, hip[1] + 6 + sway * 0.3], [hip[0] - 18, hip[1] + 10 + sway * 0.6], [hip[0] - 24, hip[1] + 6 + sway]];
      for (let i = 0; i < pts.length - 1; i++) brush(ctx, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 5 - i, OUT);
      for (let i = 0; i < pts.length - 1; i++) brush(ctx, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 3 - Math.floor(i / 2), col);
      px(ctx, pts[3][0] - 2, pts[3][1] - 1, 3, 3, spec.tailTip || shade(col, 0.4));
    }
    if (spec.cape) {
      const col = spec.cape;
      const len = spec.capeLen || 38;
      const back = state === "dash" ? 12 : 0;
      const pts = [[sc[0] - 4, sc[1] - 1], [sc[0] + 2, sc[1]], [hip[0] - 8 - back + sway, hip[1] + len - 14], [hip[0] - 16 - back + sway * 1.5, hip[1] + len - 10]];
      poly(ctx, [[pts[0][0] - 1, pts[0][1] - 1], [pts[1][0] + 1, pts[1][1] - 1], [pts[2][0] + 1, pts[2][1] + 1], [pts[3][0] - 1, pts[3][1] + 1]], OUT);
      poly(ctx, pts, col);
      poly(ctx, [pts[0], [lerp(pts[0][0], pts[1][0], 0.4), pts[0][1]], [lerp(pts[3][0], pts[2][0], 0.4), pts[3][1]], pts[3]], shade(col, -0.3));
      for (let r = 0; r < 4; r++) px(ctx, pts[3][0] + r * 3, pts[3][1] + r % 2, 2, 2, shade(col, -0.2));
      brush(ctx, pts[1][0] - 1, pts[1][1] + 2, pts[2][0] - 2, pts[2][1], 1, shade(col, 0.25));
    }
    if (spec.scarf) {
      const col = spec.scarf;
      const nk = [sc[0] - 1, sc[1] - 1];
      const rear = state === "dash" ? 8 : 0;
      brush(ctx, nk[0], nk[1], nk[0] - 9 - rear + sway * 0.6, nk[1] + 3, 4, OUT);
      brush(ctx, nk[0], nk[1], nk[0] - 17 - rear + sway, nk[1] + 9 + sway * 0.4, 4, OUT);
      brush(ctx, nk[0], nk[1], nk[0] - 9 - rear + sway * 0.6, nk[1] + 3, 2, col);
      brush(ctx, nk[0] - 9 - rear + sway * 0.6, nk[1] + 3, nk[0] - 17 - rear + sway, nk[1] + 9 + sway * 0.4, 2, shade(col, -0.2));
    }
    if (spec.backsword) {
      const sword = spec.backsword;
      brush(ctx, sc[0] + 3, sc[1] - 12, sc[0] - 14, sc[1] + 20, 4, OUT);
      brush(ctx, sc[0] + 3, sc[1] - 12, sc[0] - 14, sc[1] + 20, 2, sword.blade || "#cbd5e1");
      brush(ctx, sc[0] + 4, sc[1] - 12, sc[0] - 13, sc[1] + 20, 1, "#f8fafc");
      brush(ctx, sc[0] - 1, sc[1] - 5, sc[0] + 5, sc[1] - 3, 3, OUT);
      brush(ctx, sc[0], sc[1] - 5, sc[0] + 4, sc[1] - 3, 1, sword.guard || "#fbbf24");
      brush(ctx, sc[0] + 3, sc[1] - 12, sc[0] + 5, sc[1] - 17, 3, OUT);
      brush(ctx, sc[0] + 3, sc[1] - 12, sc[0] + 5, sc[1] - 17, 1, sword.grip || "#7c2d12");
    }
  }
  function drawEffects(ctx, spec, state, i, n, handPos, footPos, sc, hip) {
    const glow = spec.glow || "#ffffff";
    const e = state === "ultimate" ? Math.min(1, (i + 1) / 5) : 0;
    if (state.startsWith("special") || state === "ultimate") {
      ctx.globalAlpha = 0.35 + 0.15 * Math.sin(i * 1.6);
      ctx.fillStyle = glow;
      const hp = handPos;
      const r = state === "ultimate" ? 6 + i * 2 : 5 + i * 1.5;
      ctx.beginPath();
      ctx.arc(hp[0] + 2, hp[1], r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(hp[0] + 2, hp[1], r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (state === "ultimate") {
      ctx.globalAlpha = 0.1 + e * 0.12;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(hip[0], sc[1] + 8, 18 + i * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if ((state === "heavy_kick" || state === "special_3" || state === "special_2" || state === "light_kick") && i > 0 && i < n - 1) {
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = glow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hip[0] + 2, hip[1] + 4, 26, -1, 0.25);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      ctx.arc(hip[0] + 2, hip[1] + 4, 27, -0.9, 0.1);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if ((state === "heavy_punch" || state === "light_punch") && i === 1 + (state === "heavy_punch" ? 1 : 0)) {
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(handPos[0] - 12, handPos[1] - 2);
      ctx.lineTo(handPos[0] - 2, handPos[1]);
      ctx.moveTo(handPos[0] - 12, handPos[1] + 2);
      ctx.lineTo(handPos[0] - 3, handPos[1] + 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (state === "dash") {
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#ffffff";
      for (let s = 0; s < 3; s++) ctx.fillRect(hip[0] - 30 - s * 6, sc[1] + s * 8, 14 + s * 3, 1);
      ctx.globalAlpha = 1;
    }
  }
  function renderFigure(ctx, spec, state, i, n) {
    const M = buildMetrics(spec);
    const pose = poseFor(state, i, n);
    const t = i;
    const hip = [40, 59 + pose.hy];
    const sc = [hip[0] + pose.lean, hip[1] - M.torso];
    const hc = [sc[0] + 2 + pose.hdx, sc[1] - 9 + pose.hdy];
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(40 + pose.lean * 0.3, 87, 17, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    drawBackStuff(ctx, spec, hip, sc, state === "idle" ? i : i * 1.5, state, pose);
    const shF = [sc[0] + 4, sc[1] + 2], shR = [sc[0] - 4, sc[1] + 2];
    drawArm(ctx, spec, M, shR, pose.ra, false);
    drawLeg(ctx, spec, M, [hip[0] - 3, hip[1] + 2], pose.rf, false);
    const footPos = drawLeg(ctx, spec, M, [hip[0] + 3, hip[1] + 2], pose.ff, true);
    drawBottomOver(ctx, spec, M, hip, t);
    drawTorso(ctx, spec, M, hip, sc, state, t);
    drawHead(ctx, spec, M, hc, pose, t, state);
    const handPos = drawArm(ctx, spec, M, shF, pose.fa, true);
    drawEffects(ctx, spec, state, i, n, handPos, footPos, sc, hip);
  }
  function renderFrame(createCanvas, spec, state, i, n, W, H) {
    const { canvas, ctx } = createCanvas(W, H);
    if (state === "knockdown") {
      const tmp = createCanvas(W, H);
      renderFigure(tmp.ctx, spec, "hit", 1, 2);
      const ang = [0.8, 1.25, 1.5][Math.min(i, 2)];
      const piv = [[44, 70], [46, 77], [50, 80]][Math.min(i, 2)];
      ctx.save();
      ctx.translate(piv[0], piv[1]);
      ctx.rotate(-ang);
      ctx.translate(-40, -59);
      ctx.drawImage(tmp.canvas, 0, 0);
      ctx.restore();
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(34, 88, 28, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      renderFigure(ctx, spec, state, i, n);
    }
    if (state === "hit") {
      ctx.globalCompositeOperation = "source-atop";
      ctx.globalAlpha = i === 0 ? 0.16 : 0.06;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
    return canvas;
  }
  var RIG_STATE_COUNTS = {
    idle: 4,
    walk: 6,
    jump: 3,
    crouch: 2,
    hit: 2,
    knockdown: 3,
    block: 2,
    light_punch: 3,
    heavy_punch: 4,
    light_kick: 3,
    heavy_kick: 4,
    crouch_lp: 3,
    crouch_hp: 4,
    crouch_lk: 3,
    crouch_hk: 4,
    jump_punch: 2,
    jump_kick: 2,
    special_1: 5,
    special_2: 5,
    special_3: 4,
    ultimate: 8,
    dirty: 3,
    dash: 3
  };
  var UPPER_MAP = {
    idle: ["IDLE", "WINDED", "VICTORY"],
    walk: ["WALK_FWD", "WALK_BACK"],
    jump: ["JUMP", "FALL", "LAND", "WALL_REBOUND"],
    crouch: ["CROUCH"],
    hit: ["HIT", "HIT_CROUCH", "HIT_AIR", "BLIND_STUN", "SUBMISSION_LOCK", "OVERHEAT_STUN"],
    knockdown: ["KNOCKDOWN", "DEFEAT"],
    block: ["BLOCK", "CROUCH_BLOCK"],
    light_punch: ["ATTACK_LP", "ATTACK_LIGHT_PUNCH"],
    heavy_punch: ["ATTACK_HP", "ATTACK_HEAVY_PUNCH", "PICKUP_ATTACK"],
    light_kick: ["ATTACK_LK", "ATTACK_LIGHT_KICK"],
    heavy_kick: ["ATTACK_HK", "ATTACK_HEAVY_KICK"],
    crouch_lp: ["CROUCH_LP", "CROUCH_LIGHT_PUNCH"],
    crouch_hp: ["CROUCH_HP", "CROUCH_HEAVY_PUNCH"],
    crouch_lk: ["CROUCH_LK", "CROUCH_LIGHT_KICK"],
    crouch_hk: ["CROUCH_HK", "CROUCH_HEAVY_KICK"],
    jump_punch: ["JUMP_PUNCH"],
    jump_kick: ["JUMP_KICK"],
    special_1: ["SPECIAL_1"],
    special_2: ["SPECIAL_2"],
    special_3: ["SPECIAL_3"],
    ultimate: ["ULTIMATE", "SUPER"],
    dirty: ["DIRTY_TACTIC"],
    dash: ["DASH_FWD", "DASH_BACK"]
  };
  function buildRigFrames(spec, createCanvas, W = 80, H = 90) {
    const frames = {};
    for (const [state, count] of Object.entries(RIG_STATE_COUNTS)) {
      frames[state] = [];
      for (let i = 0; i < count; i++) frames[state].push(renderFrame(createCanvas, spec, state, i, count, W, H));
    }
    for (const [s, keys] of Object.entries(UPPER_MAP)) {
      for (const k of keys) frames[k] = frames[s];
    }
    return frames;
  }

  // src/graphics/FighterDesigns.js
  var FIGHTER_DESIGNS = {
    // ===== Campaign bosses =====
    riot_cop: {
      build: "heavy",
      skin: "#d9ad8d",
      eyes: "#93c5fd",
      head: { type: "helm", color: "#1e3a8a" },
      top: { style: "armor", color: "#1e3a8a", trim: "#e2e8f0" },
      bottom: { style: "pants", color: "#172554", trim: "#334155" },
      boots: { style: "greave", color: "#0f172a", trim: "#475569" },
      arms: { style: "gauntlet", color: "#1e40af" },
      gloves: { style: "glove", color: "#0f172a" },
      pauldrons: "#1e40af",
      kneePads: "#1e40af",
      belt: { color: "#0f172a", buckle: "#fbbf24" },
      glow: "#60a5fa"
    },
    promoter: {
      build: "normal",
      skin: "#e0b48f",
      eyes: "#fbbf24",
      hair: { style: "short", color: "#0f0f12" },
      top: { style: "jacket", color: "#6d28d9", trim: "#fbbf24", under: "#f8fafc" },
      bottom: { style: "pants", color: "#1c1033", trim: "#fbbf24" },
      boots: { style: "boot", color: "#0f0f12", trim: "#fbbf24" },
      arms: { style: "long", color: "#6d28d9" },
      gloves: { style: "glove", color: "#fbbf24" },
      belt: { color: "#fbbf24", buckle: "#f8fafc" },
      cape: "#4c1d95",
      capeLen: 30,
      glow: "#facc15"
    },
    boris: {
      build: "heavy",
      skin: "#e8bf9f",
      eyes: "#7f1d1d",
      hair: { style: "short", color: "#eab308" },
      top: { style: "tank", color: "#111827" },
      bottom: { style: "pants", color: "#374151", trim: "#1f2937" },
      boots: { style: "boot", color: "#0b0f19", trim: "#374151" },
      gloves: { style: "wraps", color: "#d1d5db" },
      belt: { color: "#7f1d1d", buckle: "#d1d5db" },
      glow: "#ef4444"
    },
    viktor: {
      build: "lean",
      skin: "#d6ad92",
      eyes: "#38bdf8",
      hair: { style: "short", color: "#0b0b0f" },
      mask: { type: "lower", color: "#111827" },
      top: { style: "jacket", color: "#1f2937", trim: "#38bdf8", under: "#0b0f19" },
      bottom: { style: "pants", color: "#0f172a", trim: "#38bdf8" },
      boots: { style: "boot", color: "#0b0f19", trim: "#38bdf8" },
      arms: { style: "long", color: "#1f2937" },
      gloves: { style: "glove", color: "#0b0f19" },
      belt: { color: "#38bdf8" },
      glow: "#38bdf8"
    },
    matriarch: {
      build: "lean",
      skin: "#e3c0a4",
      eyes: "#f43f5e",
      hair: { style: "bun", color: "#d4d4d8" },
      top: { style: "robe", color: "#9f1239", trim: "#fbbf24", under: "#111111" },
      bottom: { style: "hakama", color: "#4c0519", trim: "#fbbf24" },
      boots: { style: "boot", color: "#1c1917" },
      arms: { style: "long", color: "#9f1239" },
      gloves: { style: "glove", color: "#fbbf24" },
      belt: { color: "#fbbf24", tails: true },
      glow: "#f43f5e"
    },
    street_lord: {
      build: "heavy",
      skin: "#b8865f",
      eyes: "#22d3ee",
      hair: { style: "mohawk", color: "#22d3ee" },
      top: { style: "vest", color: "#27272a", trim: "#22d3ee", under: "#b8865f" },
      bottom: { style: "pants", color: "#18181b", trim: "#22d3ee" },
      boots: { style: "greave", color: "#3f3f46", trim: "#22d3ee" },
      arms: { style: "gauntlet", color: "#52525b" },
      gloves: { style: "claws", color: "#3f3f46" },
      pauldrons: "#3f3f46",
      belt: { color: "#22d3ee", buckle: "#f8fafc" },
      glow: "#22d3ee"
    },
    urban_legend: {
      build: "lean",
      skin: "#c9c9d1",
      eyes: "#ffffff",
      head: { type: "hood", color: "#27272a" },
      hair: { style: "none", color: "#111" },
      top: { style: "jacket", color: "#3f3f46", trim: "#a1a1aa", under: "#18181b" },
      bottom: { style: "pants", color: "#18181b", trim: "#52525b" },
      boots: { style: "boot", color: "#0a0a0a", trim: "#71717a" },
      arms: { style: "long", color: "#3f3f46" },
      gloves: { style: "glove", color: "#0a0a0a" },
      cape: "#27272a",
      capeLen: 36,
      glow: "#f4f4f5"
    },
    champion: {
      build: "heavy",
      skin: "#8a5a3a",
      eyes: "#fde047",
      hair: { style: "none", color: "#111" },
      head: { type: "band", color: "#fbbf24", trim: "#b91c1c", tails: true },
      top: { style: "bare" },
      bottom: { style: "shorts", color: "#fbbf24", trim: "#b91c1c" },
      boots: { style: "boot", color: "#b91c1c", trim: "#fbbf24" },
      gloves: { style: "glove", color: "#b91c1c" },
      belt: { color: "#fde047", buckle: "#b91c1c" },
      cape: "#7f1d1d",
      capeLen: 36,
      glow: "#fbbf24"
    },
    // ===== Core roster (rebuilt on the rig) =====
    kazuki: {
      build: "normal",
      skin: "#f0bf94",
      eyes: "#1a1210",
      hair: { style: "spiky", color: "#241b18" },
      head: { type: "band", color: "#ef2d4e", trim: "#ffffff", tails: true },
      top: { style: "jacket", color: "#f8fafc", trim: "#cbd5e1", under: "#f0bf94" },
      bottom: { style: "pants", color: "#f1f5f9", trim: "#94a3b8" },
      boots: { style: "wrap", color: "#e2e8f0", trim: "#94a3b8" },
      arms: { style: "sleeve", color: "#f8fafc" },
      gloves: { style: "glove", color: "#ef2d4e" },
      belt: { color: "#1e212d", buckle: "#475569", tails: true },
      glow: "#38bdf8"
    },
    raven: {
      build: "heavy",
      skin: "#e8b588",
      eyes: "#1f2937",
      hair: { style: "short", color: "#eab308" },
      top: { style: "vest", color: "#334155", trim: "#94a3b8", under: "#e8b588" },
      bottom: { style: "pants", color: "#4d7c0f", trim: "#1a4106" },
      boots: { style: "boot", color: "#18181b", trim: "#52525b" },
      arms: { style: "bare" },
      gloves: { style: "glove", color: "#1f2937" },
      pauldrons: "#334155",
      belt: { color: "#292524", buckle: "#facc15" },
      bandolier: "#292524",
      glow: "#facc15"
    },
    kagura: {
      build: "lean",
      skin: "#f6c7a3",
      eyes: "#67e8f9",
      hair: { style: "ponytail", color: "#312e81" },
      head: { type: "band", color: "#06b6d4", trim: "#f43f5e", tails: false },
      mask: { type: "lower", color: "#0e7490" },
      top: { style: "jacket", color: "#6d28d9", trim: "#06b6d4", under: "#1e0538" },
      bottom: { style: "pants", color: "#4c1d95", trim: "#06b6d4" },
      boots: { style: "boot", color: "#1e0538", trim: "#06b6d4" },
      arms: { style: "long", color: "#6d28d9" },
      gloves: { style: "glove", color: "#1e0538" },
      belt: { color: "#f43f5e", tails: true },
      scarf: "#f43f5e",
      glow: "#06b6d4"
    },
    // ===== Redesigned originals =====
    fang: {
      build: "lean",
      skin: "#c68b5a",
      eyes: "#1a0f0a",
      hair: { style: "short", color: "#141414" },
      head: { type: "band", color: "#fbbf24", trim: "#dc2626", tails: true },
      top: { style: "bare" },
      bottom: { style: "shorts", color: "#dc2626", trim: "#fbbf24" },
      boots: { style: "wrap", color: "#f5f0e8", trim: "#b8ad9a" },
      gloves: { style: "wraps", color: "#f5f0e8" },
      belt: { color: "#fbbf24", buckle: "#dc2626" },
      glow: "#ef4444"
    },
    zephyr: {
      build: "lean",
      skin: "#6b4528",
      eyes: "#0b0b0b",
      hair: { style: "spiky", color: "#f1f5f9" },
      top: { style: "tank", color: "#22c55e" },
      bottom: { style: "pants", color: "#f8fafc", trim: "#22c55e" },
      boots: { style: "boot", color: "#facc15", trim: "#a16207" },
      gloves: { style: "none" },
      belt: { color: "#22c55e", tails: true },
      glow: "#4ade80"
    },
    colossus: {
      build: "heavy",
      skin: "#e0ab80",
      eyes: "#1c1917",
      hair: { style: "short", color: "#78350f" },
      top: { style: "bare" },
      bottom: { style: "shorts", color: "#1c1917", trim: "#d97706" },
      boots: { style: "boot", color: "#27272a", trim: "#d97706" },
      gloves: { style: "glove", color: "#b91c1c" },
      belt: { color: "#d97706", buckle: "#fde047" },
      glow: "#fbbf24"
    },
    mighty: {
      build: "heavy",
      skin: "#f5d35b",
      eyes: "#38bdf8",
      hair: { style: "spiky", color: "#fbbf24" },
      top: { style: "armor", color: "#f59e0b", trim: "#fff7ae" },
      bottom: { style: "skirt", color: "#1e1b4b", trim: "#fde047" },
      boots: { style: "greave", color: "#f59e0b", trim: "#fde047" },
      arms: { style: "gauntlet", color: "#fbbf24" },
      gloves: { style: "glove", color: "#fde047" },
      pauldrons: "#fbbf24",
      cape: "#b45309",
      capeLen: 40,
      belt: { color: "#fde047", buckle: "#38bdf8" },
      glow: "#facc15"
    },
    endless_dragon: {
      build: "heavy",
      skin: "#6d28d9",
      eyes: "#fbbf24",
      hair: { style: "none", color: "#4c1d95" },
      head: { type: "horns", color: "#f5f0e8" },
      top: { style: "armor", color: "#5b21b6", trim: "#fbbf24" },
      bottom: { style: "skirt", color: "#3b0764", trim: "#ef4444" },
      boots: { style: "greave", color: "#4c1d95", trim: "#fbbf24" },
      arms: { style: "gauntlet", color: "#7c3aed" },
      gloves: { style: "claws", color: "#4c1d95" },
      wings: { membrane: "#4c1d95", bone: "#a78bfa" },
      tail: "#6d28d9",
      tailTip: "#ef4444",
      pauldrons: "#7c3aed",
      glow: "#a855f7"
    },
    // ===== MK-style ninjas =====
    cinder: {
      build: "normal",
      skin: "#c58a62",
      eyes: "#fff",
      hair: { style: "none", color: "#111" },
      mask: { type: "full", color: "#18181b" },
      top: { style: "jacket", color: "#1f1f23", trim: "#f97316", under: "#111113" },
      bottom: { style: "pants", color: "#1c1c20", trim: "#f97316" },
      boots: { style: "boot", color: "#27272a", trim: "#f97316" },
      arms: { style: "long", color: "#1f1f23" },
      gloves: { style: "glove", color: "#f97316" },
      belt: { color: "#f97316", tails: true },
      scarf: "#f97316",
      glow: "#fb923c"
    },
    glacier: {
      build: "normal",
      skin: "#e5c4a8",
      eyes: "#e0f2fe",
      hair: { style: "none", color: "#0c4a6e" },
      head: { type: "band", color: "#0ea5e9", trim: "#e0f2fe", tails: true },
      mask: { type: "lower", color: "#38bdf8" },
      top: { style: "armor", color: "#1d4ed8", trim: "#e0f2fe" },
      bottom: { style: "pants", color: "#172554", trim: "#38bdf8" },
      boots: { style: "greave", color: "#38bdf8", trim: "#e0f2fe" },
      arms: { style: "gauntlet", color: "#7dd3fc" },
      gloves: { style: "glove", color: "#bae6fd" },
      pauldrons: "#60a5fa",
      belt: { color: "#e0f2fe", buckle: "#38bdf8" },
      glow: "#38bdf8"
    },
    // ===== Archetype fighters (inspired by hooded / armoured wanderers) =====
    oracle: {
      build: "lean",
      skin: "#e3c3a6",
      eyes: "#2dd4bf",
      hair: { style: "long", color: "#27272a" },
      head: { type: "hood", color: "#a8a29e" },
      top: { style: "robe", color: "#7f1d1d", trim: "#e7e5e4", under: "#44403c", stars: true },
      bottom: { style: "hakama", color: "#5b1a1a", trim: "#e7e5e4" },
      boots: { style: "boot", color: "#3f3f46" },
      arms: { style: "long", color: "#7f1d1d" },
      gloves: { style: "glove", color: "#d6d3d1" },
      belt: { color: "#2dd4bf", tails: true },
      cape: "#d6d3d1",
      capeLen: 30,
      glow: "#5eead4"
    },
    bandit: {
      build: "lean",
      skin: "#a77a52",
      eyes: "#fde047",
      hair: { style: "short", color: "#2b1d14" },
      mask: { type: "lower", color: "#a8a29e" },
      top: { style: "jacket", color: "#57534e", trim: "#78716c", under: "#292524" },
      bottom: { style: "pants", color: "#44403c", trim: "#292524" },
      boots: { style: "boot", color: "#292524", trim: "#78716c" },
      arms: { style: "sleeve", color: "#57534e" },
      gloves: { style: "wraps", color: "#a8a29e" },
      belt: { color: "#78350f", buckle: "#fbbf24" },
      bandolier: "#78350f",
      scarf: "#b45309",
      glow: "#fbbf24"
    },
    confessor: {
      build: "normal",
      skin: "#d8b799",
      eyes: "#e5e7eb",
      head: { type: "hood", color: "#4b5563", cowl: "#374151" },
      hair: { style: "none", color: "#111" },
      top: { style: "robe", color: "#374151", trim: "#9ca3af", under: "#1f2937" },
      bottom: { style: "pants", color: "#292524", trim: "#57534e" },
      boots: { style: "boot", color: "#1c1917", trim: "#57534e" },
      arms: { style: "long", color: "#374151" },
      gloves: { style: "glove", color: "#1c1917" },
      belt: { color: "#92400e", buckle: "#d1d5db", tails: true },
      cape: "#4b5563",
      capeLen: 34,
      glow: "#e5e7eb"
    },
    valka: {
      build: "lean",
      skin: "#b9835a",
      eyes: "#fef3c7",
      hair: { style: "braids", color: "#171717" },
      head: { type: "band", color: "#b91c1c", trim: "#fbbf24", tails: false },
      top: { style: "wraps", color: "#d6d3d1" },
      bottom: { style: "skirt", color: "#7f1d1d", trim: "#fbbf24" },
      boots: { style: "boot", color: "#44403c", trim: "#a8a29e" },
      arms: { style: "gauntlet", color: "#78716c" },
      gloves: { style: "wraps", color: "#d6d3d1" },
      pauldrons: "#78716c",
      belt: { color: "#b91c1c", tails: true },
      glow: "#f87171"
    },
    convict: {
      build: "heavy",
      skin: "#c9a98a",
      eyes: "#111",
      mask: { type: "burlap", color: "#b09d7a" },
      hair: { style: "none", color: "#111" },
      top: { style: "jacket", color: "#8a8470", trim: "#6b6552", under: "#c9a98a" },
      bottom: { style: "pants", color: "#4a4538", trim: "#2e2a21" },
      boots: { style: "wrap", color: "#8a8470", trim: "#4a4538" },
      arms: { style: "sleeve", color: "#8a8470" },
      gloves: { style: "wraps", color: "#8a8470" },
      belt: { color: "#57534e", buckle: "#a8a29e" },
      glow: "#d6d3d1"
    },
    prophet: {
      build: "normal",
      skin: "#c99a6e",
      eyes: "#fff",
      hair: { style: "short", color: "#4a2f1b" },
      mask: { type: "blindfold", color: "#e7e5e4" },
      top: { style: "robe", color: "#ca8a04", trim: "#fde68a", under: "#78350f" },
      bottom: { style: "pants", color: "#57402a", trim: "#3b2a1a" },
      boots: { style: "boot", color: "#3b2a1a", trim: "#78350f" },
      arms: { style: "long", color: "#ca8a04" },
      gloves: { style: "wraps", color: "#e7e5e4" },
      fur: "#a16207",
      belt: { color: "#78350f", buckle: "#fbbf24", tails: true },
      glow: "#fde047"
    },
    ronin: {
      build: "normal",
      skin: "#dcb594",
      eyes: "#111",
      hair: { style: "none", color: "#111" },
      head: { type: "kabuto", color: "#7f1d1d", trim: "#fbbf24" },
      mask: { type: "lower", color: "#1c1917" },
      top: { style: "armor", color: "#991b1b", trim: "#fbbf24" },
      bottom: { style: "skirt", color: "#1c1917", trim: "#dc2626" },
      boots: { style: "greave", color: "#292524", trim: "#dc2626" },
      arms: { style: "gauntlet", color: "#292524" },
      gloves: { style: "glove", color: "#44403c" },
      pauldrons: "#991b1b",
      belt: { color: "#dc2626", tails: true },
      backsword: { blade: "#e2e8f0", guard: "#fbbf24", grip: "#1c1917" },
      glow: "#f87171"
    },
    vagabond: {
      build: "heavy",
      skin: "#cfae92",
      eyes: "#fbbf24",
      head: { type: "helm", color: "#52525b" },
      hair: { style: "none", color: "#111" },
      top: { style: "armor", color: "#52525b", trim: "#a1a1aa" },
      bottom: { style: "pants", color: "#3f3f46", trim: "#27272a" },
      boots: { style: "greave", color: "#52525b", trim: "#a1a1aa" },
      arms: { style: "gauntlet", color: "#71717a" },
      gloves: { style: "glove", color: "#3f3f46" },
      pauldrons: "#71717a",
      kneePads: "#71717a",
      cape: "#475569",
      capeLen: 42,
      backsword: { blade: "#d4d4d8", guard: "#71717a", grip: "#27272a" },
      belt: { color: "#78350f", buckle: "#a1a1aa" },
      glow: "#fbbf24"
    },
    warden: {
      build: "normal",
      skin: "#c08d62",
      eyes: "#111",
      head: { type: "turban", color: "#dbeafe", veil: "#bfdbfe" },
      hair: { style: "none", color: "#111" },
      top: { style: "armor", color: "#52627a", trim: "#cbd5e1" },
      bottom: { style: "pants", color: "#334155", trim: "#1e293b" },
      boots: { style: "boot", color: "#1e293b", trim: "#64748b" },
      arms: { style: "sleeve", color: "#475569" },
      gloves: { style: "glove", color: "#334155" },
      pauldrons: "#64748b",
      belt: { color: "#991b1b", buckle: "#fbbf24", tails: true },
      scarf: "#60a5fa",
      glow: "#93c5fd"
    },
    wretch: {
      build: "lean",
      skin: "#d9a98d",
      eyes: "#1c1917",
      hair: { style: "none", color: "#111" },
      top: { style: "wraps", color: "#e7ddc8" },
      bottom: { style: "loin", color: "#d6c7a6" },
      boots: { style: "wrap", color: "#e7ddc8", trim: "#b8a98a" },
      gloves: { style: "wraps", color: "#e7ddc8" },
      belt: { color: "#a8956f" },
      glow: "#e7e5e4"
    }
  };

  // src/shop/SkinCatalog.js
  var COINS_KEY = "final_impact_player_coins";
  var OWNED_SKINS_KEY = "final_impact_owned_skins";
  var EQUIPPED_SKINS_KEY = "final_impact_equipped_skins";
  var DEFAULT_STARTING_COINS = 500;
  var SKIN_CATALOG = [
    // ===== KAZUKI SKINS =====
    {
      id: "kazuki_shadow",
      fighterId: "kazuki",
      name: "SHADOW SHINOBI",
      tier: "RARE",
      tierColor: "#38bdf8",
      price: 300,
      desc: "Covert midnight shinobi robes tailored for silent elimination.",
      designOverrides: {
        top: { style: "jacket", color: "#18181b", trim: "#ef4444", under: "#09090b" },
        bottom: { style: "pants", color: "#09090b", trim: "#dc2626" },
        boots: { style: "wrap", color: "#18181b", trim: "#dc2626" },
        arms: { style: "sleeve", color: "#18181b" },
        gloves: { style: "glove", color: "#dc2626" },
        head: { type: "band", color: "#dc2626", trim: "#000000", tails: true },
        belt: { color: "#dc2626", buckle: "#09090b", tails: true },
        glow: "#ef4444"
      }
    },
    {
      id: "kazuki_cyber",
      fighterId: "kazuki",
      name: "CYBER DRAGON",
      tier: "EPIC",
      tierColor: "#c084fc",
      price: 600,
      desc: "High-tech illuminated cyberweave gi pulsating with nanotech ki.",
      designOverrides: {
        hair: { style: "spiky", color: "#06b6d4" },
        top: { style: "jacket", color: "#0f172a", trim: "#06b6d4", under: "#0284c7" },
        bottom: { style: "pants", color: "#0f172a", trim: "#06b6d4" },
        boots: { style: "wrap", color: "#0284c7", trim: "#38bdf8" },
        arms: { style: "sleeve", color: "#0f172a" },
        gloves: { style: "glove", color: "#06b6d4" },
        head: { type: "band", color: "#06b6d4", trim: "#38bdf8", tails: true },
        belt: { color: "#0284c7", buckle: "#38bdf8", tails: true },
        glow: "#38bdf8"
      }
    },
    {
      id: "kazuki_gold",
      fighterId: "kazuki",
      name: "GOLDEN EMPEROR",
      tier: "LEGENDARY",
      tierColor: "#facc15",
      price: 1e3,
      desc: "Imperial golden silk woven for tournament grand champions.",
      designOverrides: {
        hair: { style: "spiky", color: "#fef08a" },
        top: { style: "jacket", color: "#eab308", trim: "#fef08a", under: "#ca8a04" },
        bottom: { style: "pants", color: "#ca8a04", trim: "#fef08a" },
        boots: { style: "wrap", color: "#eab308", trim: "#fef08a" },
        arms: { style: "sleeve", color: "#eab308" },
        gloves: { style: "glove", color: "#ffffff" },
        head: { type: "band", color: "#ffffff", trim: "#facc15", tails: true },
        belt: { color: "#ffffff", buckle: "#facc15", tails: true },
        glow: "#facc15"
      }
    },
    // ===== RAVEN SKINS =====
    {
      id: "raven_urban",
      fighterId: "raven",
      name: "URBAN BLACK OPS",
      tier: "RARE",
      tierColor: "#38bdf8",
      price: 300,
      desc: "Low-profile stealth spec-ops armor with thermal crimson visor.",
      designOverrides: {
        hair: { style: "short", color: "#18181b" },
        top: { style: "vest", color: "#18181b", trim: "#ef4444", under: "#27272a" },
        bottom: { style: "pants", color: "#27272a", trim: "#dc2626" },
        boots: { style: "boot", color: "#09090b", trim: "#ef4444" },
        gloves: { style: "glove", color: "#ef4444" },
        pauldrons: "#18181b",
        belt: { color: "#09090b", buckle: "#ef4444" },
        glow: "#ef4444"
      }
    },
    {
      id: "raven_arctic",
      fighterId: "raven",
      name: "ARCTIC COMMANDO",
      tier: "EPIC",
      tierColor: "#c084fc",
      price: 600,
      desc: "Sub-zero cryo-insulated tactical rig designed for tundra operations.",
      designOverrides: {
        hair: { style: "short", color: "#e2e8f0" },
        top: { style: "vest", color: "#e2e8f0", trim: "#0284c7", under: "#cbd5e1" },
        bottom: { style: "pants", color: "#94a3b8", trim: "#0284c7" },
        boots: { style: "boot", color: "#1e293b", trim: "#38bdf8" },
        gloves: { style: "glove", color: "#0284c7" },
        pauldrons: "#cbd5e1",
        belt: { color: "#0f172a", buckle: "#38bdf8" },
        glow: "#38bdf8"
      }
    },
    {
      id: "raven_juggernaut",
      fighterId: "raven",
      name: "OBSIDIAN JUGGERNAUT",
      tier: "LEGENDARY",
      tierColor: "#facc15",
      price: 1e3,
      desc: "Reinforced titanium heavy plated blast armor with gold trim.",
      designOverrides: {
        top: { style: "vest", color: "#0a0a0a", trim: "#f59e0b", under: "#171717" },
        bottom: { style: "pants", color: "#171717", trim: "#f59e0b" },
        boots: { style: "boot", color: "#0a0a0a", trim: "#fbbf24" },
        gloves: { style: "glove", color: "#f59e0b" },
        pauldrons: "#f59e0b",
        belt: { color: "#0a0a0a", buckle: "#fbbf24" },
        glow: "#fbbf24"
      }
    },
    // ===== KAGURA SKINS =====
    {
      id: "kagura_bloodmoon",
      fighterId: "kagura",
      name: "BLOOD MOON",
      tier: "RARE",
      tierColor: "#38bdf8",
      price: 300,
      desc: "Crimson assassin vestments infused with dark moon ninja arts.",
      designOverrides: {
        hair: { style: "ponytail", color: "#18181b" },
        head: { type: "band", color: "#dc2626", trim: "#000000", tails: false },
        mask: { type: "lower", color: "#991b1b" },
        top: { style: "jacket", color: "#991b1b", trim: "#dc2626", under: "#450a0a" },
        bottom: { style: "pants", color: "#450a0a", trim: "#dc2626" },
        boots: { style: "boot", color: "#18181b", trim: "#dc2626" },
        gloves: { style: "glove", color: "#991b1b" },
        belt: { color: "#dc2626", tails: true },
        scarf: "#dc2626",
        glow: "#ef4444"
      }
    },
    {
      id: "kagura_neonghost",
      fighterId: "kagura",
      name: "NEON PHANTOM",
      tier: "EPIC",
      tierColor: "#c084fc",
      price: 600,
      desc: "Hyper-vibrant synthwave kunoichi suit with electric lime trails.",
      designOverrides: {
        hair: { style: "ponytail", color: "#f43f5e" },
        head: { type: "band", color: "#10b981", trim: "#f43f5e", tails: false },
        mask: { type: "lower", color: "#10b981" },
        top: { style: "jacket", color: "#022c22", trim: "#10b981", under: "#064e3b" },
        bottom: { style: "pants", color: "#064e3b", trim: "#10b981" },
        boots: { style: "boot", color: "#022c22", trim: "#10b981" },
        gloves: { style: "glove", color: "#10b981" },
        belt: { color: "#f43f5e", tails: true },
        scarf: "#f43f5e",
        glow: "#10b981"
      }
    },
    {
      id: "kagura_sovereign",
      fighterId: "kagura",
      name: "CELESTIAL EMPRESS",
      tier: "LEGENDARY",
      tierColor: "#facc15",
      price: 1e3,
      desc: "Grand royal silk laced with iridescent starlight filaments.",
      designOverrides: {
        hair: { style: "ponytail", color: "#ffffff" },
        head: { type: "band", color: "#facc15", trim: "#ffffff", tails: false },
        mask: { type: "lower", color: "#581c87" },
        top: { style: "jacket", color: "#3b0764", trim: "#facc15", under: "#581c87" },
        bottom: { style: "pants", color: "#581c87", trim: "#facc15" },
        boots: { style: "boot", color: "#1e1b4b", trim: "#facc15" },
        gloves: { style: "glove", color: "#facc15" },
        belt: { color: "#facc15", tails: true },
        scarf: "#facc15",
        glow: "#c084fc"
      }
    },
    // ===== FANG SKINS =====
    {
      id: "fang_viper",
      fighterId: "fang",
      name: "EMERALD VIPER",
      tier: "RARE",
      tierColor: "#38bdf8",
      price: 300,
      desc: "Lethal jade silk fight trunks blessed by jungle Muay Thai masters.",
      designOverrides: {
        head: { type: "band", color: "#10b981", trim: "#064e3b", tails: true },
        bottom: { style: "shorts", color: "#047857", trim: "#10b981" },
        boots: { style: "wrap", color: "#d1fae5", trim: "#10b981" },
        gloves: { style: "wraps", color: "#d1fae5" },
        belt: { color: "#10b981", buckle: "#064e3b" },
        glow: "#10b981"
      }
    },
    {
      id: "fang_kingcobra",
      fighterId: "fang",
      name: "BLACK COBRA",
      tier: "EPIC",
      tierColor: "#c084fc",
      price: 600,
      desc: "Pitch obsidian trunks stitched with golden dragon scales.",
      designOverrides: {
        head: { type: "band", color: "#eab308", trim: "#18181b", tails: true },
        bottom: { style: "shorts", color: "#18181b", trim: "#eab308" },
        boots: { style: "wrap", color: "#27272a", trim: "#eab308" },
        gloves: { style: "wraps", color: "#27272a" },
        belt: { color: "#eab308", buckle: "#18181b" },
        glow: "#facc15"
      }
    },
    // ===== ZEPHYR SKINS =====
    {
      id: "zephyr_solar",
      fighterId: "zephyr",
      name: "SOLAR FLARE",
      tier: "RARE",
      tierColor: "#38bdf8",
      price: 300,
      desc: "Blazing sunset acrobat attire built for high-speed momentum.",
      designOverrides: {
        hair: { style: "spiky", color: "#f97316" },
        top: { style: "tank", color: "#ea580c" },
        bottom: { style: "pants", color: "#431407", trim: "#fb923c" },
        boots: { style: "boot", color: "#fb923c", trim: "#c2410c" },
        belt: { color: "#fb923c", tails: true },
        glow: "#f97316"
      }
    },
    {
      id: "zephyr_electric",
      fighterId: "zephyr",
      name: "ELECTRIC SAMBA",
      tier: "EPIC",
      tierColor: "#c084fc",
      price: 600,
      desc: "High-frequency neon attire discharging kinetic spark arcs.",
      designOverrides: {
        hair: { style: "spiky", color: "#38bdf8" },
        top: { style: "tank", color: "#0284c7" },
        bottom: { style: "pants", color: "#0f172a", trim: "#38bdf8" },
        boots: { style: "boot", color: "#06b6d4", trim: "#0284c7" },
        belt: { color: "#38bdf8", tails: true },
        glow: "#38bdf8"
      }
    },
    // ===== COLOSSUS SKINS =====
    {
      id: "colossus_titanium",
      fighterId: "colossus",
      name: "TITANIUM TITAN",
      tier: "RARE",
      tierColor: "#38bdf8",
      price: 300,
      desc: "Metallic chrome boxing shorts with reinforced shock gloves.",
      designOverrides: {
        bottom: { style: "shorts", color: "#334155", trim: "#94a3b8" },
        boots: { style: "boot", color: "#1e293b", trim: "#cbd5e1" },
        gloves: { style: "glove", color: "#38bdf8" },
        belt: { color: "#94a3b8", buckle: "#e2e8f0" },
        glow: "#38bdf8"
      }
    },
    {
      id: "colossus_gold",
      fighterId: "colossus",
      name: "GOLDEN GOLIATH",
      tier: "EPIC",
      tierColor: "#c084fc",
      price: 600,
      desc: "Heavy 24-karat championship trunks and jewel-encrusted knuckles.",
      designOverrides: {
        bottom: { style: "shorts", color: "#ca8a04", trim: "#fef08a" },
        boots: { style: "boot", color: "#854d0e", trim: "#fde047" },
        gloves: { style: "glove", color: "#dc2626" },
        belt: { color: "#facc15", buckle: "#ffffff" },
        glow: "#facc15"
      }
    },
    // ===== CINDER SKINS =====
    {
      id: "cinder_ghostfire",
      fighterId: "cinder",
      name: "COBALT GHOSTFIRE",
      tier: "EPIC",
      tierColor: "#c084fc",
      price: 600,
      desc: "Superheated cobalt blue spiritual flames and crystalline armor.",
      designOverrides: {
        top: { style: "jacket", color: "#1e3a8a", trim: "#60a5fa", under: "#172554" },
        bottom: { style: "pants", color: "#172554", trim: "#3b82f6" },
        boots: { style: "boot", color: "#0f172a", trim: "#60a5fa" },
        head: { type: "band", color: "#60a5fa", trim: "#93c5fd", tails: true },
        gloves: { style: "glove", color: "#3b82f6" },
        scarf: "#60a5fa",
        belt: { color: "#3b82f6", tails: true },
        glow: "#60a5fa"
      }
    },
    // ===== GLACIER SKINS =====
    {
      id: "glacier_magma",
      fighterId: "glacier",
      name: "VOLCANIC RIDGE",
      tier: "EPIC",
      tierColor: "#c084fc",
      price: 600,
      desc: "Molten obsidian crusted with bubbling core magma.",
      designOverrides: {
        top: { style: "armor", color: "#7c2d12", trim: "#f97316" },
        bottom: { style: "pants", color: "#431407", trim: "#ea580c" },
        boots: { style: "greave", color: "#292524", trim: "#f97316" },
        arms: { style: "gauntlet", color: "#ea580c" },
        gloves: { style: "claws", color: "#f97316" },
        glow: "#ea580c"
      }
    },
    // ===== M1GHTY ADMIN SPECIAL SKINS =====
    {
      id: "mighty_void",
      fighterId: "mighty",
      name: "VOID HARBINGER",
      tier: "MYTHIC",
      tierColor: "#f43f5e",
      price: 2500,
      desc: "Abyssal cosmic matter form with dimensional singularity energy.",
      designOverrides: {
        skin: "#cbd5e1",
        eyes: "#a855f7",
        hair: { style: "spiky", color: "#6b21a8" },
        top: { style: "armor", color: "#3b0764", trim: "#c084fc" },
        bottom: { style: "skirt", color: "#1e1b4b", trim: "#a855f7" },
        boots: { style: "greave", color: "#3b0764", trim: "#c084fc" },
        arms: { style: "gauntlet", color: "#6b21a8" },
        gloves: { style: "glove", color: "#c084fc" },
        pauldrons: "#6b21a8",
        cape: "#1e1b4b",
        belt: { color: "#a855f7", buckle: "#f43f5e" },
        glow: "#c084fc"
      }
    },
    {
      id: "mighty_crimson",
      fighterId: "mighty",
      name: "CRIMSON GOD",
      tier: "MYTHIC",
      tierColor: "#f43f5e",
      price: 2500,
      desc: "Cataclysmic solar blood plate armor radiating pure annihilation.",
      designOverrides: {
        skin: "#fca5a5",
        eyes: "#ffffff",
        hair: { style: "spiky", color: "#dc2626" },
        top: { style: "armor", color: "#991b1b", trim: "#fca5a5" },
        bottom: { style: "skirt", color: "#450a0a", trim: "#ef4444" },
        boots: { style: "greave", color: "#991b1b", trim: "#fca5a5" },
        arms: { style: "gauntlet", color: "#b91c1c" },
        gloves: { style: "glove", color: "#ef4444" },
        pauldrons: "#b91c1c",
        cape: "#7f1d1d",
        belt: { color: "#ef4444", buckle: "#ffffff" },
        glow: "#ef4444"
      }
    }
  ];
  var EconomyManager = class {
    static getCoins() {
      try {
        if (typeof localStorage !== "undefined") {
          const stored = localStorage.getItem(COINS_KEY);
          if (stored === null) {
            localStorage.setItem(COINS_KEY, String(DEFAULT_STARTING_COINS));
            return DEFAULT_STARTING_COINS;
          }
          return Math.max(0, parseInt(stored, 10) || 0);
        }
      } catch (e) {
      }
      return DEFAULT_STARTING_COINS;
    }
    static addCoins(amount) {
      const cur = this.getCoins();
      const updated = Math.max(0, cur + Math.floor(amount));
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(COINS_KEY, String(updated));
        }
      } catch (e) {
      }
      return updated;
    }
    static spendCoins(amount) {
      const cur = this.getCoins();
      if (cur < amount) return false;
      const updated = cur - amount;
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(COINS_KEY, String(updated));
        }
      } catch (e) {
      }
      return true;
    }
    static setCoins(amount) {
      const valid = Math.max(0, Math.floor(amount));
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(COINS_KEY, String(valid));
        }
      } catch (e) {
      }
      return valid;
    }
    static getOwnedSkins() {
      try {
        if (typeof localStorage !== "undefined") {
          const stored = localStorage.getItem(OWNED_SKINS_KEY);
          if (stored) {
            const list = JSON.parse(stored);
            if (Array.isArray(list)) return new Set(list);
          }
        }
      } catch (e) {
      }
      return /* @__PURE__ */ new Set();
    }
    static isSkinOwned(skinId) {
      if (!skinId || skinId === "default" || skinId.endsWith("_default")) return true;
      return this.getOwnedSkins().has(skinId);
    }
    static buySkin(skinId) {
      const skin = SKIN_CATALOG.find((s) => s.id === skinId);
      if (!skin) return { success: false, reason: "Skin not found" };
      if (this.isSkinOwned(skinId)) return { success: true, alreadyOwned: true };
      if (!this.spendCoins(skin.price)) {
        return { success: false, reason: "Insufficient coins" };
      }
      const owned = this.getOwnedSkins();
      owned.add(skinId);
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(OWNED_SKINS_KEY, JSON.stringify(Array.from(owned)));
        }
      } catch (e) {
      }
      return { success: true, skin };
    }
    static getEquippedSkin(fighterId) {
      try {
        if (typeof localStorage !== "undefined") {
          const stored = localStorage.getItem(EQUIPPED_SKINS_KEY);
          if (stored) {
            const map = JSON.parse(stored);
            return map[fighterId] || null;
          }
        }
      } catch (e) {
      }
      return null;
    }
    static equipSkin(fighterId, skinId) {
      try {
        if (typeof localStorage !== "undefined") {
          let map = {};
          const stored = localStorage.getItem(EQUIPPED_SKINS_KEY);
          if (stored) map = JSON.parse(stored);
          if (!skinId || skinId === "default" || skinId === `${fighterId}_default`) {
            delete map[fighterId];
          } else {
            map[fighterId] = skinId;
          }
          localStorage.setItem(EQUIPPED_SKINS_KEY, JSON.stringify(map));
        }
      } catch (e) {
      }
      return skinId;
    }
    static unlockAllSkins() {
      const allIds = SKIN_CATALOG.map((s) => s.id);
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(OWNED_SKINS_KEY, JSON.stringify(allIds));
        }
      } catch (e) {
      }
      return allIds.length;
    }
    static resetOwnedSkins() {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(OWNED_SKINS_KEY);
          localStorage.removeItem(EQUIPPED_SKINS_KEY);
        }
      } catch (e) {
      }
    }
    // Cosmetics & Customization Management (Auras, Sparks, Titles)
    static _inMemoryCosmetics = null;
    static getEquippedCosmetics() {
      if (this._inMemoryCosmetics) return { ...this._inMemoryCosmetics };
      try {
        if (typeof localStorage !== "undefined") {
          const stored = localStorage.getItem("final_impact_equipped_cosmetics");
          if (stored) {
            const parsed = JSON.parse(stored);
            this._inMemoryCosmetics = parsed;
            return parsed;
          }
        }
      } catch (e) {
      }
      const def = { aura: "aura_none", spark: "spark_classic", title: "title_fighter" };
      this._inMemoryCosmetics = def;
      return { ...def };
    }
    static equipCosmetic(type, itemId) {
      const current = this.getEquippedCosmetics();
      current[type] = itemId;
      this._inMemoryCosmetics = current;
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("final_impact_equipped_cosmetics", JSON.stringify(current));
        }
      } catch (e) {
      }
      return current;
    }
  };
  var AURA_CATALOG = [
    { id: "aura_none", name: "NONE (STANDARD)", price: 0, tier: "COMMON", tierColor: "#94a3b8", color: "transparent", desc: "Standard combat appearance with no active energy aura." },
    { id: "aura_flame", name: "DRAGON FLAME", price: 400, tier: "RARE", tierColor: "#38bdf8", color: "#ef4444", desc: "Rising burning crimson embers and heat haze." },
    { id: "aura_cyber", name: "NEON OVERCHARGE", price: 500, tier: "EPIC", tierColor: "#c084fc", color: "#06b6d4", desc: "Crackling cyan cybernetic electricity and particle sparks." },
    { id: "aura_void", name: "VOID SHADOWS", price: 750, tier: "EPIC", tierColor: "#c084fc", color: "#a855f7", desc: "Abyssal gravity smoke radiating from the fighter." },
    { id: "aura_golden_ki", name: "SUPER SAIYAN KI", price: 1e3, tier: "LEGENDARY", tierColor: "#facc15", color: "#fde047", desc: "Ascended radiant golden ki flame pillar." },
    { id: "aura_frost", name: "GLACIAL BLIZZARD", price: 600, tier: "RARE", tierColor: "#38bdf8", color: "#38bdf8", desc: "Freezing cryogenic mist and floating ice crystals." }
  ];
  var SPARK_CATALOG = [
    { id: "spark_classic", name: "ARCADE RETRO", price: 0, tier: "COMMON", tierColor: "#94a3b8", color: "#facc15", desc: "Classic 16-bit arcade golden hit sparks." },
    { id: "spark_blood", name: "MORTAL BLOODBURST", price: 350, tier: "RARE", tierColor: "#38bdf8", color: "#dc2626", desc: "Deep crimson visceral splatter particles on impact." },
    { id: "spark_lightning", name: "VOLT JOLT", price: 500, tier: "EPIC", tierColor: "#c084fc", color: "#38bdf8", desc: "High-voltage electric lightning arcs that burst on hit." },
    { id: "spark_golden_runes", name: "ELDEN RUNES", price: 800, tier: "LEGENDARY", tierColor: "#facc15", color: "#fef08a", desc: "Shattered glowing Golden Order runes on every strike." }
  ];
  var TITLE_CATALOG = [
    { id: "title_fighter", name: "NOVICE CONTENDER", price: 0, tier: "COMMON", tierColor: "#94a3b8", desc: "Arcade contender seeking glory." },
    { id: "title_tarnished", name: "THE TARNISHED", price: 400, tier: "RARE", tierColor: "#38bdf8", desc: "Warrior guided by the blessing of Grace." },
    { id: "title_arcade_god", name: "ARCADE GRANDMASTER", price: 750, tier: "EPIC", tierColor: "#c084fc", desc: "Undefeated master of combo execution and spacing." },
    { id: "title_lord_flame", name: "LORD OF FRENZIED FLAME", price: 1200, tier: "LEGENDARY", tierColor: "#facc15", desc: "Harbinger of molten ruin and relentless pressure." },
    { id: "title_dragon_slayer", name: "DRAGON SLAYER", price: 1500, tier: "LEGENDARY", tierColor: "#facc15", desc: "Vanquisher of the Endless Primeval Dragon." }
  ];
  function getSkinDesign(baseDesign, skinId) {
    if (!baseDesign) return baseDesign;
    if (!skinId || skinId === "default" || skinId.endsWith("_default")) return baseDesign;
    const skin = SKIN_CATALOG.find((s) => s.id === skinId);
    if (!skin || !skin.designOverrides) return baseDesign;
    const result = JSON.parse(JSON.stringify(baseDesign));
    const overrides = skin.designOverrides;
    for (const [k, v] of Object.entries(overrides)) {
      if (v && typeof v === "object" && !Array.isArray(v) && result[k] && typeof result[k] === "object") {
        result[k] = { ...result[k], ...v };
      } else {
        result[k] = v;
      }
    }
    return result;
  }

  // src/graphics/SpriteGenerator.js
  var SpriteGenerator = class {
    constructor() {
      this.cache = /* @__PURE__ */ new Map();
    }
    // Helper to create an offscreen canvas
    createCanvas(width, height) {
      const c = document.createElement("canvas");
      c.width = width;
      c.height = height;
      const ctx = c.getContext("2d", { alpha: true });
      ctx.imageSmoothingEnabled = false;
      return { canvas: c, ctx };
    }
    // Draw a pixel rect on a grid
    drawPixel(ctx, x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
    }
    // Pre-generate all sprite frames for a fighter (with optional custom skin override)
    generateFighterSprites(fighterId, skinId = null) {
      const key = `fighter_${fighterId}_${skinId || "default"}`;
      if (this.cache.has(key)) return this.cache.get(key);
      if (FIGHTER_DESIGNS[fighterId] && !this.legacy) {
        const design = getSkinDesign(FIGHTER_DESIGNS[fighterId], skinId);
        const rigged = buildRigFrames(design, (w, h) => this.createCanvas(w, h), 80, 90);
        this.cache.set(key, rigged);
        return rigged;
      }
      const sprites = {};
      const width = 80;
      const height = 90;
      const palettes = {
        kazuki: {
          skinHighlight: "#ffe2c7",
          skinMid: "#f4ba86",
          skinShadow: "#c47d4e",
          skinDeep: "#7a421e",
          giWhite: "#ffffff",
          giMid: "#dbe4ed",
          giShadow: "#8ea0b5",
          giDeep: "#49596b",
          belt: "#1e212d",
          beltShadow: "#0c0d12",
          hair: "#241b18",
          hairShadow: "#100c0b",
          redBright: "#ff2d55",
          redShadow: "#a60a28",
          glow: "#38bdf8"
        },
        raven: {
          skinHighlight: "#ffe3cb",
          skinMid: "#f0b784",
          skinShadow: "#b87747",
          skinDeep: "#74401c",
          hairHighlight: "#fde047",
          hairMid: "#eab308",
          hairShadow: "#a16207",
          vestMid: "#334155",
          vestDark: "#1e293b",
          vestDeep: "#0f172a",
          camoLight: "#84cc16",
          camoMid: "#4d7c0f",
          camoDark: "#1a4106",
          bootDark: "#18181b",
          bootDeep: "#09090b",
          glow: "#facc15"
        },
        kagura: {
          skinHighlight: "#fff1e6",
          skinMid: "#f6c7a3",
          skinShadow: "#c58564",
          skinDeep: "#78462d",
          hair: "#1e1b4b",
          hairShadow: "#0f0c2e",
          suitLight: "#7c3aed",
          suitMid: "#581c87",
          suitDark: "#3b0764",
          suitDeep: "#1e0538",
          scarfBright: "#f43f5e",
          scarfShadow: "#9f1239",
          neonGlow: "#06b6d4",
          bladeMetal: "#e2e8f0",
          bladeShadow: "#64748b"
        },
        fang: {
          skinHighlight: "#e8c4a0",
          skinMid: "#c99b6d",
          skinShadow: "#8b6239",
          skinDeep: "#5a3a1e",
          hair: "#1a1a1a",
          hairShadow: "#0a0a0a",
          wrapsWhite: "#f5f0e8",
          wrapsShadow: "#c4b8a8",
          shortsRed: "#dc2626",
          shortsShadow: "#991b1b",
          mongkolGold: "#fbbf24",
          mongkolShadow: "#b45309",
          glow: "#ef4444"
        },
        zephyr: {
          skinHighlight: "#8b6c4a",
          skinMid: "#6b4c30",
          skinShadow: "#4a3420",
          skinDeep: "#2d1f12",
          hair: "#f5f5f5",
          hairShadow: "#a3a3a3",
          tankGreen: "#22c55e",
          tankShadow: "#15803d",
          pantsWhite: "#fafafa",
          pantsShadow: "#d4d4d4",
          shoesYellow: "#facc15",
          shoesShadow: "#a16207",
          glow: "#4ade80"
        },
        colossus: {
          skinHighlight: "#fde8d0",
          skinMid: "#e8b88a",
          skinShadow: "#b8845a",
          skinDeep: "#7a5230",
          hair: "#78350f",
          hairShadow: "#451a03",
          glovesRed: "#b91c1c",
          glovesShadow: "#7f1d1d",
          shortsBlack: "#1c1917",
          shortsShadow: "#0c0a09",
          bootsBlack: "#18181b",
          bootsShadow: "#09090b",
          beltGold: "#d97706",
          glow: "#fbbf24"
        },
        endless_dragon: {
          skinHighlight: "#6b21a8",
          skinMid: "#581c87",
          skinShadow: "#3b0764",
          skinDeep: "#1e0538",
          scalesLight: "#7c3aed",
          scalesMid: "#6d28d9",
          scalesDark: "#4c1d95",
          eyeGlow: "#fbbf24",
          hornBone: "#f5f0e8",
          hornShadow: "#a3a3a3",
          flameCore: "#ef4444",
          flameMid: "#f97316",
          flameOuter: "#fbbf24",
          glow: "#a855f7"
        },
        mighty: {
          skinHighlight: "#fef08a",
          skinMid: "#facc15",
          skinShadow: "#ca8a04",
          skinDeep: "#854d0e",
          hair: "#fbbf24",
          hairShadow: "#b45309",
          armorGold: "#f59e0b",
          tankGreen: "#0f172a",
          tankShadow: "#020617",
          glovesRed: "#eab308",
          glovesShadow: "#ca8a04",
          beltGold: "#fde047",
          shortsRed: "#1e1b4b",
          shortsShadow: "#0f172a",
          shoesYellow: "#f59e0b",
          eyeGlow: "#38bdf8",
          glow: "#facc15"
        }
      };
      const p = palettes[fighterId] || palettes.kazuki;
      const frameBuilders = {
        kazuki: this.buildKazukiFrames.bind(this),
        raven: this.buildRavenFrames.bind(this),
        kagura: this.buildKaguraFrames.bind(this),
        fang: this.buildGenericFrames.bind(this),
        zephyr: this.buildGenericFrames.bind(this),
        colossus: this.buildGenericFrames.bind(this),
        endless_dragon: this.buildGenericFrames.bind(this),
        mighty: this.buildGenericFrames.bind(this)
      };
      const builder = frameBuilders[fighterId] || frameBuilders.kazuki;
      const frameList = builder(p, width, height);
      for (const [animName, frames] of Object.entries(frameList)) {
        sprites[animName] = frames;
      }
      this.cache.set(key, sprites);
      return sprites;
    }
    // ==========================================
    // KAZUKI - The Ansatsuken Striker
    // ==========================================
    buildKazukiFrames(p, W, H) {
      const anims = {};
      const renderFrame2 = (drawFn) => {
        const { canvas, ctx } = this.createCanvas(W, H);
        drawFn(ctx);
        return canvas;
      };
      anims.IDLE = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        const bob = [0, 1, 0, -1][frame];
        const flutter = [0, 1, 2, 1][frame];
        this.drawShadow(ctx, 40, H - 4, 18, 4);
        ctx.fillStyle = p.skinShadow;
        ctx.fillRect(29, 68, 8, 16);
        ctx.fillRect(44, 68, 9, 16);
        ctx.fillStyle = p.giMid;
        ctx.fillRect(27, 82, 11, 5);
        ctx.fillRect(43, 82, 11, 5);
        ctx.fillStyle = p.giDeep;
        ctx.fillRect(26, 50 + bob, 28, 22);
        ctx.fillStyle = p.giShadow;
        ctx.fillRect(27, 50 + bob, 12, 20);
        ctx.fillRect(42, 50 + bob, 12, 20);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(29, 52 + bob, 8, 16);
        ctx.fillRect(44, 52 + bob, 8, 16);
        ctx.fillStyle = p.beltShadow;
        ctx.fillRect(28, 48 + bob, 24, 5);
        ctx.fillStyle = p.belt;
        ctx.fillRect(29, 49 + bob, 22, 3);
        ctx.fillRect(36 + flutter, 52 + bob, 3, 12);
        ctx.fillRect(40 + flutter, 52 + bob, 3, 10);
        ctx.fillStyle = p.giDeep;
        ctx.fillRect(26, 28 + bob, 28, 21);
        ctx.fillStyle = p.giShadow;
        ctx.fillRect(27, 29 + bob, 10, 19);
        ctx.fillRect(43, 29 + bob, 10, 19);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(28, 30 + bob, 8, 17);
        ctx.fillRect(44, 30 + bob, 8, 17);
        ctx.fillStyle = p.skinDeep;
        ctx.fillRect(36, 29 + bob, 8, 14);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(37, 30 + bob, 6, 12);
        ctx.fillStyle = p.skinHighlight;
        ctx.fillRect(38, 31 + bob, 4, 6);
        ctx.fillStyle = p.skinShadow;
        ctx.fillRect(20, 31 + bob, 8, 14);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(21, 32 + bob, 6, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(20, 24 + bob, 8, 8);
        ctx.fillStyle = p.skinDeep;
        ctx.fillRect(48, 32 + bob, 9, 14);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(49, 33 + bob, 7, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(51, 26 + bob, 9, 8);
        ctx.fillStyle = p.skinShadow;
        ctx.fillRect(37, 22 + bob, 6, 7);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(34, 11 + bob, 12, 13);
        ctx.fillStyle = p.skinHighlight;
        ctx.fillRect(36, 13 + bob, 9, 7);
        ctx.fillStyle = p.hairShadow;
        ctx.fillRect(39, 16 + bob, 5, 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(40, 18 + bob, 3, 2);
        ctx.fillStyle = "#000000";
        ctx.fillRect(42, 18 + bob, 2, 2);
        ctx.fillStyle = p.hairShadow;
        ctx.fillRect(32, 6 + bob, 16, 7);
        ctx.fillRect(30, 8 + bob, 5, 5);
        ctx.fillRect(44, 7 + bob, 6, 5);
        ctx.fillStyle = p.hair;
        ctx.fillRect(34, 7 + bob, 12, 5);
        ctx.fillRect(38, 4 + bob, 6, 4);
        ctx.fillStyle = p.redShadow;
        ctx.fillRect(33, 13 + bob, 15, 4);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(34, 14 + bob, 13, 2);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(23 - flutter * 2, 14 + bob + flutter, 11, 3);
        ctx.fillRect(19 - flutter * 3, 16 + bob + flutter * 2, 9, 3);
      }));
      anims.WALK_FWD = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        const step = [0, 2, 0, -2][frame];
        const legStride = [-4, 0, 4, 0][frame];
        this.drawShadow(ctx, 40, H - 4, 18, 4);
        ctx.fillStyle = p.giDeep;
        ctx.fillRect(26 - legStride, 50, 12, 22);
        ctx.fillRect(42 + legStride, 50, 12, 22);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(28 - legStride, 52, 8, 18);
        ctx.fillRect(44 + legStride, 52, 8, 18);
        ctx.fillStyle = p.giMid;
        ctx.fillRect(27 - legStride, 80, 10, 6);
        ctx.fillRect(43 + legStride, 80, 10, 6);
        ctx.fillStyle = p.belt;
        ctx.fillRect(28, 48 + step, 24, 4);
        ctx.fillRect(37 + step, 52, 3, 10);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(28, 30 + step, 24, 19);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(37, 30 + step, 6, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(20 + legStride, 28 + step, 8, 8);
        ctx.fillRect(52 - legStride, 26 + step, 8, 8);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(35, 12 + step, 12, 13);
        ctx.fillStyle = p.hair;
        ctx.fillRect(33, 7 + step, 15, 6);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(33, 14 + step, 15, 3);
        ctx.fillRect(22, 15 + step, 11, 3);
      }));
      anims.WALK_BACK = anims.WALK_FWD;
      anims.CROUCH = [0, 1].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 22, 5);
        ctx.fillStyle = p.giDeep;
        ctx.fillRect(20, 58, 40, 18);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(22, 60, 16, 14);
        ctx.fillRect(42, 60, 16, 14);
        ctx.fillStyle = p.giMid;
        ctx.fillRect(18, 78, 14, 6);
        ctx.fillRect(48, 78, 14, 6);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(26, 40, 28, 20);
        ctx.fillStyle = p.belt;
        ctx.fillRect(27, 56, 26, 4);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(28, 36, 10, 10);
        ctx.fillRect(42, 34, 10, 10);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(34, 24, 12, 12);
        ctx.fillStyle = p.hair;
        ctx.fillRect(32, 18, 15, 7);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(32, 25, 15, 3);
      }));
      anims.JUMP = [0, 1, 2].map((frame) => renderFrame2((ctx) => {
        const yOff = [6, -18, -4][frame];
        this.drawShadow(ctx, 40, H - 4, 12, 3);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(28, 48 + yOff, 12, 16);
        ctx.fillRect(42, 52 + yOff, 12, 14);
        ctx.fillStyle = p.giMid;
        ctx.fillRect(26, 62 + yOff, 10, 6);
        ctx.fillRect(44, 64 + yOff, 10, 6);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(28, 26 + yOff, 26, 22);
        ctx.fillStyle = p.belt;
        ctx.fillRect(28, 46 + yOff, 26, 4);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(22, 18 + yOff, 8, 8);
        ctx.fillRect(50, 16 + yOff, 8, 8);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(35, 10 + yOff, 12, 12);
        ctx.fillStyle = p.hair;
        ctx.fillRect(33, 5 + yOff, 15, 6);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(33, 12 + yOff, 15, 3);
        ctx.fillRect(18, 16 + yOff, 15, 4);
      }));
      anims.ATTACK_LP = [0, 1, 2].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 20, 4);
        const reach = [0, 16, 4][frame];
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(26, 50, 28, 24);
        ctx.fillStyle = p.giMid;
        ctx.fillRect(25, 80, 11, 5);
        ctx.fillRect(45, 80, 11, 5);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(28, 30, 24, 20);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(46, 32, 8 + reach, 8);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(52 + reach, 31, 10, 10);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(35, 12, 12, 13);
        ctx.fillStyle = p.hair;
        ctx.fillRect(33, 7, 15, 6);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(33, 14, 15, 3);
      }));
      anims.ATTACK_HP = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 42, H - 4, 24, 5);
        const step = [0, 6, 12, 4][frame];
        const fistX = [48, 56, 72, 54][frame];
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(22, 52, 16, 24);
        ctx.fillRect(40 + step, 54, 18, 22);
        ctx.fillStyle = p.giMid;
        ctx.fillRect(20, 80, 12, 6);
        ctx.fillRect(44 + step, 80, 14, 6);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(28 + step / 2, 30, 26, 22);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(42 + step / 2, 33, fistX - 42, 9);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(fistX, 31, 12, 12);
        if (frame === 2) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(fistX + 10, 29, 6, 16);
          ctx.fillStyle = p.glow;
          ctx.fillRect(fistX + 12, 27, 4, 20);
        }
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(35 + step / 2, 13, 12, 13);
        ctx.fillStyle = p.hair;
        ctx.fillRect(33 + step / 2, 8, 15, 6);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(33 + step / 2, 15, 15, 3);
        ctx.fillRect(20 + step / 2, 16, 14, 3);
      }));
      anims.ATTACK_LK = [0, 1, 2].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 36, H - 4, 16, 4);
        const reach = [0, 18, 6][frame];
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(28, 48, 12, 28);
        ctx.fillStyle = p.giMid;
        ctx.fillRect(27, 80, 12, 6);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(38, 54 - reach / 2, 14 + reach, 10);
        ctx.fillStyle = p.giMid;
        ctx.fillRect(50 + reach, 52 - reach / 2, 12, 12);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(28, 28, 22, 20);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(36, 26, 8, 8);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(32, 12, 12, 12);
        ctx.fillStyle = p.hair;
        ctx.fillRect(30, 7, 15, 6);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(30, 14, 15, 3);
      }));
      anims.ATTACK_HK = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 36, H - 4, 18, 4);
        const angle = [0, 1, 2, 0][frame];
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(30, 50, 12, 26);
        ctx.fillStyle = p.giMid;
        ctx.fillRect(28, 80, 12, 6);
        if (angle === 1 || angle === 2) {
          ctx.fillStyle = p.giWhite;
          ctx.fillRect(38, 26, 28, 12);
          ctx.fillStyle = p.giMid;
          ctx.fillRect(64, 24, 14, 14);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(66, 16, 6, 8);
          ctx.fillStyle = p.glow;
          ctx.fillRect(68, 12, 4, 6);
        } else {
          ctx.fillStyle = p.giWhite;
          ctx.fillRect(36, 44, 18, 14);
        }
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(24, 30, 20, 20);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(22, 14, 12, 12);
        ctx.fillStyle = p.hair;
        ctx.fillRect(20, 9, 15, 6);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(20, 16, 15, 3);
      }));
      anims.CROUCH_LP = [0, 1, 2].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 22, 5);
        const reach = [0, 14, 4][frame];
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(22, 58, 36, 20);
        ctx.fillRect(26, 40, 24, 20);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(44, 48, 8 + reach, 7);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(50 + reach, 46, 9, 9);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(34, 24, 12, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(32, 26, 15, 3);
      }));
      anims.CROUCH_HK = [0, 1, 2].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 44, H - 4, 30, 5);
        const sweepReach = [0, 24, 8][frame];
        ctx.fillStyle = p.redBright;
        ctx.fillRect(20, 72, 8, 8);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(24, 52, 24, 18);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(34, 72, 20 + sweepReach, 10);
        ctx.fillStyle = p.giMid;
        ctx.fillRect(52 + sweepReach, 70, 14, 12);
        if (frame === 1) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(66 + sweepReach, 66, 6, 6);
          ctx.fillRect(62 + sweepReach, 78, 8, 4);
        }
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(28, 38, 12, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(26, 40, 15, 3);
      }));
      anims.JUMP_PUNCH = [0, 1].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 12, 3);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(28, 32, 24, 24);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(46, 42, 14, 8);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(58, 44, 10, 10);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(34, 18, 12, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(32, 20, 15, 3);
      }));
      anims.JUMP_KICK = [0, 1].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 12, 3);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(26, 30, 22, 22);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(40, 40, 24, 10);
        ctx.fillStyle = p.giMid;
        ctx.fillRect(62, 42, 14, 12);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(30, 16, 12, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(28, 18, 15, 3);
      }));
      anims.SPECIAL_1 = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 24, 5);
        if (frame === 0 || frame === 1) {
          ctx.fillStyle = p.giWhite;
          ctx.fillRect(24, 50, 28, 26);
          ctx.fillRect(26, 30, 24, 20);
          ctx.fillStyle = p.redBright;
          ctx.fillRect(16, 38, 12, 12);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(12, 36, 12, 12);
          ctx.fillStyle = p.glow;
          ctx.fillRect(10, 34, 16, 16);
        } else {
          ctx.fillStyle = p.giWhite;
          ctx.fillRect(22, 50, 32, 26);
          ctx.fillRect(28, 30, 28, 20);
          ctx.fillStyle = p.skinMid;
          ctx.fillRect(48, 32, 16, 12);
          ctx.fillStyle = p.redBright;
          ctx.fillRect(62, 30, 12, 14);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(72, 26, 8, 22);
          ctx.fillStyle = p.glow;
          ctx.fillRect(70, 24, 12, 26);
        }
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(34, 14, 12, 12);
        ctx.fillStyle = p.hair;
        ctx.fillRect(32, 9, 15, 6);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(32, 16, 15, 3);
        ctx.fillRect(18, 16, 14, 4);
      }));
      anims.SPECIAL_2 = [0, 1, 2, 3, 4].map((frame) => renderFrame2((ctx) => {
        const heights = [4, -10, -28, -20, -6][frame];
        this.drawShadow(ctx, 40, H - 4, Math.max(8, 20 - Math.abs(heights) / 2), 4);
        if (frame === 0) {
          ctx.fillStyle = p.giWhite;
          ctx.fillRect(24, 54, 32, 22);
          ctx.fillRect(26, 38, 26, 18);
          ctx.fillStyle = p.redBright;
          ctx.fillRect(46, 44, 10, 10);
        } else {
          ctx.fillStyle = p.giWhite;
          ctx.fillRect(30, 44 + heights, 14, 26);
          ctx.fillStyle = p.giMid;
          ctx.fillRect(28, 70 + heights, 10, 6);
          ctx.fillStyle = p.giWhite;
          ctx.fillRect(28, 26 + heights, 22, 20);
          ctx.fillStyle = p.skinMid;
          ctx.fillRect(40, 6 + heights, 8, 22);
          ctx.fillStyle = p.redBright;
          ctx.fillRect(39, 0 + heights, 10, 12);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(38, -4 + heights, 12, 10);
          ctx.fillStyle = p.glow;
          ctx.fillRect(36, -8 + heights, 16, 14);
          ctx.fillStyle = "#fbbf24";
          ctx.fillRect(37, -12 + heights, 14, 8);
        }
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(32, 14 + (frame === 0 ? 20 : heights), 12, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(30, 16 + (frame === 0 ? 20 : heights), 15, 3);
      }));
      anims.SPECIAL_3 = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 14, 3);
        const rot = frame;
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(30, 26, 20, 22);
        if (rot % 2 === 0) {
          ctx.fillStyle = p.giWhite;
          ctx.fillRect(10, 36, 60, 12);
          ctx.fillStyle = p.giMid;
          ctx.fillRect(8, 35, 10, 14);
          ctx.fillRect(62, 35, 10, 14);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(4, 38, 12, 4);
          ctx.fillRect(66, 38, 12, 4);
        } else {
          ctx.fillStyle = p.giDeep;
          ctx.fillRect(24, 34, 32, 14);
        }
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(34, 12, 12, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(32, 14, 15, 3);
        ctx.fillRect(18, 14, 14, 4);
      }));
      anims.HIT = [0, 1].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 36, H - 4, 18, 4);
        const recoil = [4, 8][frame];
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(20 - recoil, 52, 26, 24);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(22 - recoil, 30, 24, 22);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(26 - recoil * 1.5, 12, 12, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(24 - recoil * 1.5, 14, 15, 3);
        ctx.fillRect(12 - recoil * 1.5, 14, 12, 4);
      }));
      anims.HIT_CROUCH = anims.HIT;
      anims.HIT_AIR = anims.HIT;
      anims.BLOCK = [renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 18, 4);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(26, 50, 26, 26);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(28, 30, 24, 20);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(38, 26, 12, 16);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(40, 24, 12, 14);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(30, 14, 12, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(28, 16, 15, 3);
      })];
      anims.CROUCH_BLOCK = [renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 22, 5);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(22, 58, 36, 20);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(38, 40, 14, 14);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(30, 24, 12, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(28, 26, 15, 3);
      })];
      anims.KNOCKDOWN = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        if (frame === 0) {
          this.drawShadow(ctx, 36, H - 4, 22, 4);
          ctx.fillStyle = p.giWhite;
          ctx.fillRect(16, 44, 48, 16);
          ctx.fillStyle = p.skinMid;
          ctx.fillRect(10, 42, 12, 12);
          ctx.fillStyle = p.redBright;
          ctx.fillRect(8, 43, 14, 3);
        } else if (frame === 1) {
          this.drawShadow(ctx, 40, H - 4, 44, 6);
          ctx.fillStyle = p.giWhite;
          ctx.fillRect(14, 74, 52, 10);
          ctx.fillStyle = p.skinMid;
          ctx.fillRect(8, 72, 10, 10);
          ctx.fillStyle = p.redBright;
          ctx.fillRect(6, 73, 12, 3);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(10, 68, 6, 6);
          ctx.fillRect(58, 68, 6, 6);
        } else {
          this.drawShadow(ctx, 40, H - 4, 30, 5);
          ctx.fillStyle = p.giWhite;
          ctx.fillRect(22, 64, 34, 16);
          ctx.fillStyle = p.skinMid;
          ctx.fillRect(26, 48, 12, 12);
          ctx.fillStyle = p.redBright;
          ctx.fillRect(24, 50, 15, 3);
        }
      }));
      anims.VICTORY = [0, 1].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 20, 4);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(26, 48, 28, 28);
        ctx.fillStyle = p.giMid;
        ctx.fillRect(25, 80, 12, 6);
        ctx.fillRect(45, 80, 12, 6);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(26, 26, 28, 24);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(26, 34, 28, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(24, 36, 10, 8);
        ctx.fillRect(46, 36, 10, 8);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(34, 10, 12, 14);
        ctx.fillStyle = p.hair;
        ctx.fillRect(32, 5, 16, 7);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(32, 12, 16, 3);
        ctx.fillRect(14 - frame * 2, 12 + frame, 18, 4);
      }));
      return anims;
    }
    // ==========================================
    // RAVEN - The Tactical Commando
    // ==========================================
    buildRavenFrames(p, W, H) {
      const anims = {};
      const renderFrame2 = (drawFn) => {
        const { canvas, ctx } = this.createCanvas(W, H);
        drawFn(ctx);
        return canvas;
      };
      anims.IDLE = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        const bob = [0, 1, 0, -1][frame];
        this.drawShadow(ctx, 40, H - 4, 22, 5);
        ctx.fillStyle = p.bootDeep;
        ctx.fillRect(26, 76, 12, 10);
        ctx.fillRect(44, 76, 12, 10);
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(24, 48 + bob, 14, 28);
        ctx.fillRect(42, 48 + bob, 14, 28);
        ctx.fillStyle = p.camoLight;
        ctx.fillRect(26, 54 + bob, 6, 6);
        ctx.fillRect(46, 60 + bob, 6, 6);
        ctx.fillStyle = p.camoDark;
        ctx.fillRect(28, 64 + bob, 7, 5);
        ctx.fillRect(44, 52 + bob, 7, 6);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(24, 26 + bob, 32, 22);
        ctx.fillStyle = p.skinHighlight;
        ctx.fillRect(28, 28 + bob, 10, 8);
        ctx.fillRect(42, 28 + bob, 10, 8);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(26, 26 + bob, 5, 22);
        ctx.fillRect(49, 26 + bob, 5, 22);
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(38, 34 + bob, 4, 5);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(16, 28 + bob, 10, 16);
        ctx.fillRect(52, 28 + bob, 10, 16);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(16, 22 + bob, 10, 9);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(52, 20 + bob, 10, 9);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(33, 11 + bob, 14, 14);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(38, 16 + bob, 8, 2);
        ctx.fillStyle = p.hairShadow;
        ctx.fillRect(31, 3 + bob, 18, 9);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(32, 2 + bob, 16, 8);
        ctx.fillStyle = p.hairHighlight;
        ctx.fillRect(33, 1 + bob, 14, 3);
      }));
      anims.WALK_FWD = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        const step = [0, 2, 0, -2][frame];
        const stride = [-5, 0, 5, 0][frame];
        this.drawShadow(ctx, 40, H - 4, 22, 5);
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(24 - stride, 48, 14, 28);
        ctx.fillRect(42 + stride, 48, 14, 28);
        ctx.fillStyle = p.bootDeep;
        ctx.fillRect(24 - stride, 76, 14, 10);
        ctx.fillRect(42 + stride, 76, 14, 10);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(24, 26 + step, 32, 22);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(26, 26 + step, 5, 22);
        ctx.fillRect(49, 26 + step, 5, 22);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(16 + stride, 24 + step, 10, 9);
        ctx.fillRect(52 - stride, 22 + step, 10, 9);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(33, 11 + step, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(32, 2 + step, 16, 9);
      }));
      anims.WALK_BACK = anims.WALK_FWD;
      anims.CROUCH = [0, 1].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 26, 5);
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(18, 56, 44, 20);
        ctx.fillStyle = p.bootDeep;
        ctx.fillRect(16, 76, 14, 10);
        ctx.fillRect(48, 76, 14, 10);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(24, 36, 32, 22);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(30, 28, 10, 10);
        ctx.fillRect(44, 26, 10, 10);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(34, 18, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(33, 9, 16, 9);
      }));
      anims.JUMP = [0, 1, 2].map((frame) => renderFrame2((ctx) => {
        const yOff = [4, -18, -4][frame];
        this.drawShadow(ctx, 40, H - 4, 14, 4);
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(26, 46 + yOff, 28, 20);
        ctx.fillStyle = p.bootDeep;
        ctx.fillRect(28, 64 + yOff, 11, 8);
        ctx.fillRect(41, 64 + yOff, 11, 8);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(24, 24 + yOff, 32, 22);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(18, 16 + yOff, 10, 10);
        ctx.fillRect(52, 14 + yOff, 10, 10);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(33, 10 + yOff, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(32, 1 + yOff, 16, 9);
      }));
      anims.ATTACK_LP = [0, 1, 2].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 22, 5);
        const reach = [0, 18, 4][frame];
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(24, 48, 30, 28);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(24, 26, 30, 22);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(48, 28, 10 + reach, 9);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(56 + reach, 27, 12, 11);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(33, 11, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(32, 2, 16, 9);
      }));
      anims.ATTACK_HP = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 42, H - 4, 26, 5);
        const step = [0, 8, 14, 6][frame];
        const fistX = [46, 58, 74, 56][frame];
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(22, 50, 16, 26);
        ctx.fillRect(42 + step, 52, 18, 24);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(26 + step / 2, 28, 30, 22);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(44 + step / 2, 30, fistX - 44, 10);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(fistX, 28, 14, 14);
        if (frame === 2) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(fistX + 12, 24, 6, 22);
          ctx.fillStyle = p.glow;
          ctx.fillRect(fistX + 16, 20, 4, 30);
        }
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(33 + step / 2, 12, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(32 + step / 2, 3, 16, 9);
      }));
      anims.ATTACK_LK = [0, 1, 2].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 36, H - 4, 18, 4);
        const reach = [0, 16, 4][frame];
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(26, 48, 14, 28);
        ctx.fillRect(38, 54, 16 + reach, 12);
        ctx.fillStyle = p.bootDeep;
        ctx.fillRect(52 + reach, 52, 14, 12);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(24, 26, 28, 22);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(33, 11, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(32, 2, 16, 9);
      }));
      anims.ATTACK_HK = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 22, 5);
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(28, 50, 14, 26);
        if (frame === 1 || frame === 2) {
          ctx.fillStyle = p.camoMid;
          ctx.fillRect(38, 22, 14, 36);
          ctx.fillStyle = p.bootDeep;
          ctx.fillRect(44, 14, 14, 14);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(56, 18, 4, 28);
        } else {
          ctx.fillStyle = p.camoMid;
          ctx.fillRect(36, 46, 16, 20);
        }
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(24, 28, 26, 22);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(30, 12, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(29, 3, 16, 9);
      }));
      anims.CROUCH_LP = [0, 1, 2].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 26, 5);
        const reach = [0, 16, 4][frame];
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(20, 56, 40, 20);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(24, 36, 28, 20);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(48 + reach, 42, 12, 10);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(32, 18, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(31, 9, 16, 9);
      }));
      anims.CROUCH_HK = [0, 1, 2].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 44, H - 4, 32, 5);
        const sweepReach = [0, 24, 8][frame];
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(22, 54, 24, 18);
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(34, 70, 22 + sweepReach, 12);
        ctx.fillStyle = p.bootDeep;
        ctx.fillRect(54 + sweepReach, 68, 16, 14);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(26, 38, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(25, 29, 16, 9);
      }));
      anims.JUMP_PUNCH = [0, 1].map((frame) => renderFrame2((ctx) => {
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(26, 32, 28, 22);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(52, 42, 12, 12);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(32, 16, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(31, 7, 16, 9);
      }));
      anims.JUMP_KICK = [0, 1].map((frame) => renderFrame2((ctx) => {
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(24, 30, 24, 22);
        ctx.fillStyle = p.bootDeep;
        ctx.fillRect(58, 40, 16, 14);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(28, 16, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(27, 7, 16, 9);
      }));
      anims.SPECIAL_1 = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 42, H - 4, 26, 5);
        if (frame < 2) {
          ctx.fillStyle = p.camoMid;
          ctx.fillRect(24, 48, 30, 28);
          ctx.fillStyle = p.skinMid;
          ctx.fillRect(24, 26, 30, 22);
          ctx.fillStyle = p.vestDark;
          ctx.fillRect(32, 28, 14, 14);
          ctx.fillStyle = p.glow;
          ctx.fillRect(30, 26, 18, 18);
        } else {
          ctx.fillStyle = p.camoMid;
          ctx.fillRect(22, 48, 34, 28);
          ctx.fillStyle = p.skinMid;
          ctx.fillRect(24, 26, 30, 22);
          ctx.fillStyle = p.vestDark;
          ctx.fillRect(56, 26, 14, 12);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(68, 18, 8, 28);
          ctx.fillStyle = p.glow;
          ctx.fillRect(72, 12, 6, 40);
        }
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(33, 11, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(32, 2, 16, 9);
      }));
      anims.SPECIAL_2 = [0, 1, 2, 3, 4].map((frame) => renderFrame2((ctx) => {
        const yOff = [2, -14, -28, -18, -4][frame];
        this.drawShadow(ctx, 40, H - 4, 14, 4);
        if (frame === 0) {
          ctx.fillStyle = p.camoMid;
          ctx.fillRect(20, 54, 40, 22);
          ctx.fillStyle = p.skinMid;
          ctx.fillRect(24, 36, 30, 20);
        } else {
          ctx.fillStyle = p.camoMid;
          ctx.fillRect(28, 34 + yOff, 24, 24);
          ctx.fillStyle = p.bootDeep;
          ctx.fillRect(24, 14 + yOff, 14, 16);
          ctx.fillRect(42, 14 + yOff, 14, 16);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(20, 4 + yOff, 40, 8);
          ctx.fillStyle = p.glow;
          ctx.fillRect(16, -2 + yOff, 48, 12);
        }
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(33, 20 + yOff, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(32, 11 + yOff, 16, 9);
      }));
      anims.SPECIAL_3 = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 44, H - 4, 28, 5);
        const rush = [0, 12, 24, 16][frame];
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(20 + rush / 2, 52, 34, 24);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(24 + rush / 2, 30, 28, 22);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(52 + rush, 32, 16, 14);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(16 + rush / 2, 36, 8, 8);
        ctx.fillStyle = p.glow;
        ctx.fillRect(10 + rush / 2, 38, 12, 6);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(32 + rush / 2, 14, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(31 + rush / 2, 5, 16, 9);
      }));
      anims.HIT = [0, 1].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 36, H - 4, 20, 5);
        const recoil = [4, 8][frame];
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(20 - recoil, 50, 30, 26);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(24 - recoil, 28, 28, 22);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(30 - recoil * 1.5, 12, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(29 - recoil * 1.5, 3, 16, 9);
      }));
      anims.HIT_CROUCH = anims.HIT;
      anims.HIT_AIR = anims.HIT;
      anims.BLOCK = [renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 22, 5);
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(24, 48, 30, 28);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(24, 26, 30, 22);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(40, 24, 14, 16);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(30, 12, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(29, 3, 16, 9);
      })];
      anims.CROUCH_BLOCK = [renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 26, 5);
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(18, 56, 44, 20);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(40, 38, 14, 16);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(30, 20, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(29, 11, 16, 9);
      })];
      anims.KNOCKDOWN = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        if (frame === 0) {
          ctx.fillStyle = p.camoMid;
          ctx.fillRect(16, 46, 50, 16);
          ctx.fillStyle = p.skinMid;
          ctx.fillRect(10, 44, 12, 12);
        } else if (frame === 1) {
          this.drawShadow(ctx, 40, H - 4, 48, 6);
          ctx.fillStyle = p.camoMid;
          ctx.fillRect(14, 74, 54, 11);
          ctx.fillStyle = p.skinMid;
          ctx.fillRect(8, 72, 12, 12);
        } else {
          this.drawShadow(ctx, 40, H - 4, 32, 5);
          ctx.fillStyle = p.camoMid;
          ctx.fillRect(22, 62, 36, 18);
          ctx.fillStyle = p.skinMid;
          ctx.fillRect(28, 44, 14, 14);
        }
      }));
      anims.VICTORY = [0, 1].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 22, 5);
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(24, 48, 28, 28);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(24, 24, 30, 24);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(44, 10, 10, 8);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(38, 18, 8, 12);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(38, 32, 6, 6);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(32, 8, 14, 14);
        ctx.fillStyle = p.hairMid;
        ctx.fillRect(31, -1, 16, 9);
      }));
      return anims;
    }
    // ==========================================
    // KAGURA - The Cyber Kunoichi
    // ==========================================
    buildKaguraFrames(p, W, H) {
      const anims = {};
      const renderFrame2 = (drawFn) => {
        const { canvas, ctx } = this.createCanvas(W, H);
        drawFn(ctx);
        return canvas;
      };
      anims.IDLE = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        const bob = [0, 1, 0, -1][frame];
        const flutter = [0, 1, 2, 1][frame];
        this.drawShadow(ctx, 40, H - 4, 16, 4);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(28, 70, 8, 14);
        ctx.fillRect(44, 70, 8, 14);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(28, 80, 8, 3);
        ctx.fillRect(44, 80, 8, 3);
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(26, 48 + bob, 12, 24);
        ctx.fillRect(42, 48 + bob, 12, 24);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(28, 28 + bob, 24, 20);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(32, 30 + bob, 16, 16);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(39, 32 + bob, 2, 12);
        ctx.fillStyle = p.bladeMetal;
        ctx.fillRect(24, 46 + bob, 6, 2);
        ctx.fillRect(50, 46 + bob, 6, 2);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(20, 32 + bob, 8, 14);
        ctx.fillRect(52, 32 + bob, 8, 14);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(20, 26 + bob, 8, 8);
        ctx.fillRect(52, 24 + bob, 8, 8);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(34, 10 + bob, 12, 14);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(38, 16 + bob, 6, 3);
        ctx.fillStyle = p.hairShadow;
        ctx.fillRect(30, 8 + bob, 6, 12);
        ctx.fillStyle = p.scarfBright;
        ctx.fillRect(32, 22 + bob, 16, 6);
        ctx.fillRect(18 - flutter * 2, 24 + bob + flutter, 14, 5);
        ctx.fillRect(10 - flutter * 3, 28 + bob + flutter * 2, 12, 4);
      }));
      anims.WALK_FWD = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        const step = [0, 2, 0, -2][frame];
        const stride = [-6, 0, 6, 0][frame];
        this.drawShadow(ctx, 40, H - 4, 16, 4);
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(26 - stride, 48, 12, 24);
        ctx.fillRect(42 + stride, 48, 12, 24);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(26 - stride, 72, 8, 12);
        ctx.fillRect(42 + stride, 72, 8, 12);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(28, 28 + step, 24, 20);
        ctx.fillStyle = p.scarfBright;
        ctx.fillRect(32, 22 + step, 16, 6);
        ctx.fillRect(16, 24 + step, 16, 5);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(34, 10 + step, 12, 14);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(38, 16 + step, 6, 3);
      }));
      anims.WALK_BACK = anims.WALK_FWD;
      anims.CROUCH = [0, 1].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 20, 4);
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(20, 56, 38, 20);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(26, 38, 24, 18);
        ctx.fillStyle = p.scarfBright;
        ctx.fillRect(28, 34, 16, 5);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(32, 20, 12, 14);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(36, 26, 6, 3);
      }));
      anims.JUMP = [0, 1, 2].map((frame) => renderFrame2((ctx) => {
        const yOff = [4, -20, -6][frame];
        this.drawShadow(ctx, 40, H - 4, 12, 3);
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(28, 44 + yOff, 22, 18);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(28, 26 + yOff, 22, 18);
        ctx.fillStyle = p.scarfBright;
        ctx.fillRect(16, 30 + yOff, 16, 5);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(32, 12 + yOff, 12, 14);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(36, 18 + yOff, 6, 3);
      }));
      anims.ATTACK_LP = [0, 1, 2].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 18, 4);
        const reach = [0, 16, 4][frame];
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(26, 48, 24, 26);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(28, 28, 22, 20);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(48, 32, 10 + reach, 6);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(56 + reach, 30, 8, 10);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(34, 10, 12, 14);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(38, 16, 6, 3);
      }));
      anims.ATTACK_HP = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 22, 5);
        const reach = [0, 12, 22, 10][frame];
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(24, 48, 26, 26);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(28, 28, 22, 20);
        ctx.fillStyle = p.bladeMetal;
        ctx.fillRect(48, 28, 12 + reach, 4);
        ctx.fillRect(46, 36, 14 + reach, 4);
        if (frame === 2) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(66 + reach, 18, 6, 28);
          ctx.fillStyle = p.suitLight;
          ctx.fillRect(70 + reach, 14, 4, 36);
        }
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(34, 10, 12, 14);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(38, 16, 6, 3);
      }));
      anims.ATTACK_LK = [0, 1, 2].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 36, H - 4, 16, 4);
        const reach = [0, 18, 6][frame];
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(26, 48, 12, 26);
        ctx.fillRect(38, 52, 14 + reach, 8);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(50 + reach, 50, 10, 10);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(28, 28, 20, 20);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(32, 12, 12, 12);
      }));
      anims.ATTACK_HK = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 38, H - 4, 18, 4);
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(28, 50, 12, 24);
        if (frame === 1 || frame === 2) {
          ctx.fillStyle = p.suitMid;
          ctx.fillRect(36, 18, 12, 34);
          ctx.fillStyle = p.neonGlow;
          ctx.fillRect(44, 12, 12, 12);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(52, 16, 4, 30);
        } else {
          ctx.fillStyle = p.suitMid;
          ctx.fillRect(34, 46, 14, 16);
        }
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(24, 28, 20, 20);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(28, 12, 12, 12);
      }));
      anims.CROUCH_LP = [0, 1, 2].map((frame) => renderFrame2((ctx) => {
        const reach = [0, 14, 4][frame];
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(20, 56, 36, 20);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(24, 38, 22, 18);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(46 + reach, 44, 10, 8);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(30, 22, 12, 12);
      }));
      anims.CROUCH_HK = [0, 1, 2].map((frame) => renderFrame2((ctx) => {
        const reach = [0, 26, 8][frame];
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(22, 54, 22, 18);
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(34, 70, 20 + reach, 10);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(52 + reach, 68, 12, 12);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(26, 38, 12, 12);
      }));
      anims.JUMP_PUNCH = [0, 1].map((frame) => renderFrame2((ctx) => {
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(26, 30, 22, 22);
        ctx.fillStyle = p.bladeMetal;
        ctx.fillRect(48, 40, 14, 4);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(32, 14, 12, 12);
      }));
      anims.JUMP_KICK = [0, 1].map((frame) => renderFrame2((ctx) => {
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(24, 28, 22, 22);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(54, 42, 14, 10);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(28, 14, 12, 12);
      }));
      anims.SPECIAL_1 = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 16, 4);
        const alpha = [0.8, 0.2, 0.2, 0.9][frame];
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(28, 30, 24, 38);
        ctx.fillStyle = p.scarfBright;
        ctx.fillRect(24, 28, 28, 6);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(18, 24, 12, 12);
        ctx.fillRect(48, 20, 14, 14);
        ctx.fillRect(34, 10, 16, 16);
        ctx.globalAlpha = 1;
      }));
      anims.SPECIAL_2 = [0, 1, 2, 3, 4].map((frame) => renderFrame2((ctx) => {
        const yOff = [2, -12, -26, -18, -6][frame];
        this.drawShadow(ctx, 40, H - 4, 12, 3);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(28, 30 + yOff, 22, 22);
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(32, 48 + yOff, 12, 20);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(48, 16 + yOff, 8, 26);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(52, 10 + yOff, 10, 36);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(32, 14 + yOff, 12, 12);
      }));
      anims.SPECIAL_3 = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 38, H - 4, 18, 4);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(26, 30, 24, 22);
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(26, 50, 24, 26);
        ctx.fillStyle = p.bladeMetal;
        ctx.fillRect(52, 30, 16, 4);
        ctx.fillRect(54, 38, 16, 4);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(66, 29, 6, 6);
        ctx.fillRect(68, 37, 6, 6);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(32, 12, 12, 14);
        ctx.fillStyle = p.scarfBright;
        ctx.fillRect(16, 24, 14, 5);
      }));
      anims.HIT = [0, 1].map((frame) => renderFrame2((ctx) => {
        const recoil = [4, 8][frame];
        this.drawShadow(ctx, 36, H - 4, 16, 4);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(24 - recoil, 30, 24, 22);
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(24 - recoil, 50, 22, 26);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(28 - recoil * 1.5, 14, 12, 12);
        ctx.fillStyle = p.scarfBright;
        ctx.fillRect(16 - recoil * 1.5, 22, 14, 5);
      }));
      anims.HIT_CROUCH = anims.HIT;
      anims.HIT_AIR = anims.HIT;
      anims.BLOCK = [renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 18, 4);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(26, 30, 22, 22);
        ctx.fillStyle = p.bladeMetal;
        ctx.fillRect(38, 24, 4, 16);
        ctx.fillRect(44, 24, 4, 16);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(30, 14, 12, 12);
      })];
      anims.CROUCH_BLOCK = [renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 20, 4);
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(20, 56, 38, 20);
        ctx.fillStyle = p.bladeMetal;
        ctx.fillRect(38, 40, 4, 14);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(30, 22, 12, 12);
      })];
      anims.KNOCKDOWN = [0, 1, 2, 3].map((frame) => renderFrame2((ctx) => {
        if (frame === 0) {
          ctx.fillStyle = p.suitLight;
          ctx.fillRect(16, 44, 46, 14);
        } else if (frame === 1) {
          this.drawShadow(ctx, 40, H - 4, 44, 5);
          ctx.fillStyle = p.suitLight;
          ctx.fillRect(14, 76, 50, 9);
        } else {
          this.drawShadow(ctx, 40, H - 4, 28, 4);
          ctx.fillStyle = p.suitLight;
          ctx.fillRect(24, 62, 32, 16);
        }
      }));
      anims.VICTORY = [0, 1].map((frame) => renderFrame2((ctx) => {
        this.drawShadow(ctx, 40, H - 4, 18, 4);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(28, 26, 22, 24);
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(28, 48, 22, 28);
        ctx.fillStyle = p.bladeMetal;
        ctx.fillRect(48, 22, 4, 16);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(49, 18, 2, 6);
        ctx.fillStyle = p.suitDark;
        ctx.fillRect(32, 10, 12, 14);
        ctx.fillStyle = p.scarfBright;
        ctx.fillRect(16 - frame * 2, 20 + frame, 16, 5);
      }));
      return anims;
    }
    // Draw ground shadow ellipse
    drawShadow(ctx, cx, cy, rx, ry) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Generic frame builder for new characters (Fang, Zephyr, Colossus, Endless Dragon)
    buildGenericFrames(p, width, height) {
      const frames = {};
      const stateConfigs = {
        idle: 4,
        walk: 6,
        jump: 3,
        crouch: 2,
        hit: 2,
        knockdown: 3,
        block: 2,
        light_punch: 3,
        heavy_punch: 4,
        light_kick: 3,
        heavy_kick: 4,
        crouch_lp: 3,
        crouch_hp: 4,
        crouch_lk: 3,
        crouch_hk: 4,
        jump_punch: 2,
        jump_kick: 2,
        special_1: 5,
        special_2: 5,
        special_3: 4,
        ultimate: 8,
        dirty: 3,
        dash: 3
      };
      const isMighty = !!p.armorGold;
      const isColossus = !isMighty && !!p.glovesRed;
      const isDragon = !!p.scalesLight;
      const bodyW = isColossus || isMighty ? 36 : isDragon ? 34 : 28;
      const bodyH = isColossus || isMighty ? 28 : 26;
      const skinH = p.skinHighlight || p.scalesLight || "#ccc";
      const skinM = p.skinMid || p.scalesMid || "#aaa";
      const skinS = p.skinShadow || p.scalesDark || "#777";
      const hairC = p.hair || p.hornBone || "#333";
      const glowC = p.glow || "#fff";
      const torsoC = p.wrapsWhite || p.tankGreen || p.glovesRed || p.scalesLight || skinH;
      const torsoS = p.wrapsShadow || p.tankShadow || p.glovesShadow || p.scalesDark || skinS;
      const legsC = p.shortsRed || p.pantsWhite || p.shortsBlack || p.scalesMid || "#555";
      const legsS = p.shortsShadow || p.pantsShadow || p.shortsShadow || p.scalesDark || "#333";
      const feetC = p.skinShadow || p.shoesYellow || p.bootsBlack || p.scalesDark || "#444";
      for (const [state, count] of Object.entries(stateConfigs)) {
        frames[state] = [];
        for (let i = 0; i < count; i++) {
          const { canvas, ctx } = this.createCanvas(width, height);
          const bob = state === "idle" ? Math.sin(i * 1.57) * 2 : 0;
          const walkShift = state === "walk" ? Math.sin(i * 1.05) * 3 : 0;
          const hitShift = state === "hit" ? 4 : 0;
          const crouchY = state === "crouch" || state.startsWith("crouch_") ? 8 : 0;
          const jumpY = state === "jump" ? -10 : 0;
          const bx = 26 - (isColossus ? 4 : 0);
          const by = 24 + bob + crouchY + jumpY;
          this.drawShadow(ctx, 40, 88, isColossus ? 22 : 18, 4);
          if (isDragon) {
            this.drawPixel(ctx, bx + 2, by - 16, 8, 10, p.hornBone);
            this.drawPixel(ctx, bx + bodyW - 10, by - 16, 8, 10, p.hornBone);
            this.drawPixel(ctx, bx + 4, by - 8, bodyW - 8, 10, hairC);
          } else {
            this.drawPixel(ctx, bx + 4, by - 10, bodyW - 8, 12, hairC);
            this.drawPixel(ctx, bx + 6, by - 8, bodyW - 12, 8, p.hairShadow || "#111");
          }
          this.drawPixel(ctx, bx + 2, by, bodyW - 4, 12, skinH);
          this.drawPixel(ctx, bx + 4, by + 2, bodyW - 8, 8, skinM);
          if (isMighty) {
            this.drawPixel(ctx, bx + 7, by + 3, 4, 3, "#38bdf8");
            this.drawPixel(ctx, bx + bodyW - 11, by + 3, 4, 3, "#38bdf8");
          } else if (isDragon) {
            this.drawPixel(ctx, bx + 8, by + 4, 4, 3, p.eyeGlow);
            this.drawPixel(ctx, bx + bodyW - 12, by + 4, 4, 3, p.eyeGlow);
          } else {
            this.drawPixel(ctx, bx + 8, by + 4, 3, 2, "#111");
            this.drawPixel(ctx, bx + bodyW - 11, by + 4, 3, 2, "#111");
          }
          this.drawPixel(ctx, bx, by + 12, bodyW, bodyH, torsoC);
          this.drawPixel(ctx, bx + 2, by + 14, bodyW - 4, bodyH - 4, torsoS);
          const armExtend = state.includes("punch") || state.includes("special") ? 14 + i * 4 : 0;
          const kickExtend = state.includes("kick") ? 8 : 0;
          this.drawPixel(ctx, bx - 6 - hitShift, by + 14, 8, 18 + (state.includes("punch") && i > 0 ? 6 : 0), skinM);
          this.drawPixel(ctx, bx + bodyW - 2, by + 14, 8 + armExtend, 8, skinM);
          if (isColossus) {
            this.drawPixel(ctx, bx - 8, by + 28, 10, 8, p.glovesRed);
            this.drawPixel(ctx, bx + bodyW + armExtend - 2, by + 14, 10, 10, p.glovesRed);
          }
          if (p.wrapsWhite && !isColossus) {
            this.drawPixel(ctx, bx - 6, by + 28, 8, 6, p.wrapsWhite);
            this.drawPixel(ctx, bx + bodyW + armExtend, by + 16, 8, 6, p.wrapsWhite);
          }
          if (p.mongkolGold) {
            this.drawPixel(ctx, bx, by + 12 + bodyH, bodyW, 4, p.mongkolGold);
          } else if (p.beltGold) {
            this.drawPixel(ctx, bx + 2, by + 12 + bodyH, bodyW - 4, 4, p.beltGold);
          }
          const legY = by + 14 + bodyH;
          this.drawPixel(ctx, bx + 2 + walkShift, legY, 10, 16 + kickExtend, legsC);
          this.drawPixel(ctx, bx + bodyW - 12 - walkShift, legY, 10, 16 + kickExtend, legsC);
          this.drawPixel(ctx, bx + 4 + walkShift, legY + 2, 6, 12, legsS);
          this.drawPixel(ctx, bx + bodyW - 10 - walkShift, legY + 2, 6, 12, legsS);
          this.drawPixel(ctx, bx + walkShift, legY + 16 + kickExtend, 12, 5, feetC);
          this.drawPixel(ctx, bx + bodyW - 14 - walkShift, legY + 16 + kickExtend, 12, 5, feetC);
          if (state.includes("special") || state === "ultimate") {
            ctx.globalAlpha = 0.5 + Math.sin(i * 1.2) * 0.3;
            ctx.fillStyle = glowC;
            ctx.beginPath();
            ctx.arc(40 + armExtend, by + 20, 8 + i * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          if (isMighty) {
            ctx.globalAlpha = 0.35 + Math.sin(i * 1.5) * 0.2;
            ctx.fillStyle = "#fbbf24";
            ctx.beginPath();
            ctx.arc(40, by + 18, 30 + Math.sin(i * 2) * 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          if (isDragon && (state === "idle" || state.includes("special") || state === "ultimate")) {
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = p.flameCore;
            ctx.beginPath();
            ctx.arc(40, by + 20, 22 + Math.sin(i * 1.5) * 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = p.flameOuter;
            ctx.beginPath();
            ctx.arc(40, by + 16, 28 + Math.sin(i * 1.2) * 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          if (state === "hit" || state === "knockdown") {
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(bx, by, bodyW, bodyH + 20);
            ctx.globalAlpha = 1;
          }
          frames[state].push(canvas);
        }
      }
      const upperMap = {
        idle: ["IDLE", "WINDED", "VICTORY"],
        walk: ["WALK_FWD", "WALK_BACK"],
        jump: ["JUMP", "FALL", "LAND", "WALL_REBOUND"],
        crouch: ["CROUCH"],
        hit: ["HIT", "HIT_CROUCH", "HIT_AIR", "BLIND_STUN", "SUBMISSION_LOCK", "OVERHEAT_STUN"],
        knockdown: ["KNOCKDOWN", "DEFEAT"],
        block: ["BLOCK", "CROUCH_BLOCK"],
        light_punch: ["ATTACK_LP", "ATTACK_LIGHT_PUNCH"],
        heavy_punch: ["ATTACK_HP", "ATTACK_HEAVY_PUNCH", "PICKUP_ATTACK"],
        light_kick: ["ATTACK_LK", "ATTACK_LIGHT_KICK"],
        heavy_kick: ["ATTACK_HK", "ATTACK_HEAVY_KICK"],
        crouch_lp: ["CROUCH_LP", "CROUCH_LIGHT_PUNCH"],
        crouch_hp: ["CROUCH_HP", "CROUCH_HEAVY_PUNCH"],
        crouch_lk: ["CROUCH_LK", "CROUCH_LIGHT_KICK"],
        crouch_hk: ["CROUCH_HK", "CROUCH_HEAVY_KICK"],
        jump_punch: ["JUMP_PUNCH"],
        jump_kick: ["JUMP_KICK"],
        special_1: ["SPECIAL_1"],
        special_2: ["SPECIAL_2"],
        special_3: ["SPECIAL_3"],
        ultimate: ["ULTIMATE", "SUPER"],
        dirty: ["DIRTY_TACTIC"],
        dash: ["DASH_FWD", "DASH_BACK"]
      };
      for (const [s, keys] of Object.entries(upperMap)) {
        if (frames[s]) {
          for (const k of keys) {
            frames[k] = frames[s];
          }
        }
      }
      if (!frames.IDLE && frames.idle) frames.IDLE = frames.idle;
      return frames;
    }
  };
  var spriteGenerator = new SpriteGenerator();

  // src/utils/CryptoAuth.js
  var ADMIN_DIGEST = "f3bdf0246bdfe126001c15c48d12b05610eee4475d3e7afe9c10cf56a0ac1f01";
  var AUTH_STORAGE_KEY = "final_impact_admin_auth_session";
  var M1GHTY_STORAGE_KEY = "final_impact_unlocked_mighty";
  var CHEATS_STORAGE_KEY = "final_impact_admin_cheats";
  async function computeSha256(str) {
    if (typeof str !== "string") return "";
    if (typeof crypto !== "undefined" && crypto.subtle && typeof TextEncoder !== "undefined") {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuf = await crypto.subtle.digest("SHA-256", data);
      const hashArr = Array.from(new Uint8Array(hashBuf));
      return hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    try {
      const nodeCrypto = await import("crypto");
      return nodeCrypto.createHash("sha256").update(str).digest("hex");
    } catch (err) {
    }
    let h1 = 2166136261, h2 = 668265263;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ code, 16777619);
      h2 = Math.imul(h2 ^ code >> 4, 16777619);
    }
    return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
  }
  async function verifyAdminPassword(inputPassword) {
    if (!inputPassword || typeof inputPassword !== "string") return false;
    const hash = await computeSha256(inputPassword);
    return hash.toLowerCase() === ADMIN_DIGEST.toLowerCase();
  }
  function isAdminAuthenticated() {
    try {
      if (typeof sessionStorage !== "undefined") {
        return sessionStorage.getItem(AUTH_STORAGE_KEY) === "true";
      }
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
      }
    } catch (e) {
    }
    return false;
  }
  function setAdminAuthenticated(authenticated) {
    try {
      if (authenticated) {
        if (typeof sessionStorage !== "undefined") sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
        if (typeof localStorage !== "undefined") localStorage.setItem(AUTH_STORAGE_KEY, "true");
      } else {
        if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(AUTH_STORAGE_KEY);
        if (typeof localStorage !== "undefined") localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
    }
  }
  function isMightyUnlocked() {
    try {
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(M1GHTY_STORAGE_KEY) === "true";
      }
    } catch (e) {
    }
    return false;
  }
  function setMightyUnlocked(unlocked) {
    try {
      if (typeof localStorage !== "undefined") {
        if (unlocked) {
          localStorage.setItem(M1GHTY_STORAGE_KEY, "true");
        } else {
          localStorage.removeItem(M1GHTY_STORAGE_KEY);
        }
      }
    } catch (e) {
    }
  }
  function getAdminCheats() {
    try {
      if (typeof localStorage !== "undefined") {
        const saved = localStorage.getItem(CHEATS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
    }
    return {
      godMode: false,
      infiniteSuper: false,
      oneHitKO: false
    };
  }
  function setAdminCheats(cheats) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(CHEATS_STORAGE_KEY, JSON.stringify(cheats));
      }
    } catch (e) {
    }
  }
  var STEALTH_MODE_STORAGE_KEY = "final_impact_steam_stealth_mode";
  var _inMemoryStealth = null;
  function isStealthMode() {
    if (_inMemoryStealth !== null) return _inMemoryStealth;
    try {
      if (typeof window !== "undefined" && window.location && window.location.search) {
        if (window.location.search.includes("dev=1") || window.location.search.includes("admin=show")) {
          return false;
        }
      }
      if (typeof localStorage !== "undefined") {
        const stored = localStorage.getItem(STEALTH_MODE_STORAGE_KEY);
        if (stored !== null) return stored === "true";
      }
    } catch (e) {
    }
    return true;
  }
  function setStealthMode(enabled) {
    _inMemoryStealth = !!enabled;
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STEALTH_MODE_STORAGE_KEY, enabled ? "true" : "false");
      }
    } catch (e) {
    }
  }

  // src/ui/CharacterSelect.js
  var CharacterSelect = class {
    constructor() {
      this.characters = [
        {
          id: "kazuki",
          name: "KAZUKI",
          title: "THE DRAGON STRIKER",
          style: "Ansatsuken Karate",
          origin: "Japan",
          power: 4,
          speed: 4,
          defense: 4,
          specials: [
            { name: "Hadouken", cmd: "\u2193 \u2198 \u2192 + P (or SP1)", desc: "Ki Fireball projectile" },
            { name: "Shoryuken", cmd: "\u2192 \u2193 \u2198 + P (or SP2)", desc: "Invincible rising uppercut" },
            { name: "Tatsumaki", cmd: "\u2193 \u2199 \u2190 + K", desc: "Spinning horizontal kick" }
          ]
        },
        {
          id: "raven",
          name: "RAVEN",
          title: "TACTICAL COMMANDO",
          style: "Military Brawling",
          origin: "USA",
          power: 5,
          speed: 3,
          defense: 5,
          specials: [
            { name: "Sonic Blade", cmd: "\u2190 (hold) \u2192 + P (or SP1)", desc: "Spinning sonic razor blade" },
            { name: "Flash Somersault", cmd: "\u2193 (hold) \u2191 + K (or SP2)", desc: "Anti-air backflip slash" },
            { name: "Blitz Knuckle", cmd: "\u2193 \u2198 \u2192 + P", desc: "Rocket-assisted straight punch" }
          ]
        },
        {
          id: "kagura",
          name: "KAGURA",
          title: "CYBER KUNOICHI",
          style: "Shadow Ninjutsu",
          origin: "Neo Tokyo",
          power: 3,
          speed: 5,
          defense: 3,
          specials: [
            { name: "Shadow Warp", cmd: "\u2193 \u2199 \u2190 + P (or SP1)", desc: "Teleports behind opponent" },
            { name: "Crescent Gale", cmd: "\u2193 \u2198 \u2192 + K (or SP2)", desc: "Triple rising wind kick" },
            { name: "Ki Kunai", cmd: "\u2193 \u2198 \u2192 + P", desc: "Rapid glowing energy kunai" }
          ]
        },
        {
          id: "fang",
          name: "FANG",
          title: "THE LETHAL STRIKER",
          style: "Muay Thai / Lethwei",
          origin: "Thailand",
          power: 4,
          speed: 4,
          defense: 4,
          specials: [
            { name: "Tiger Knee", cmd: "\u2193 \u2198 \u2192 + K (or SP1)", desc: "Forward leaping knee strike" },
            { name: "Cyclone Elbow", cmd: "\u2192 \u2193 \u2198 + P (or SP2)", desc: "Double spinning slicing elbow" },
            { name: "Iron Teep", cmd: "\u2193 \u2199 \u2190 + K (or SP3)", desc: "High pushback front kick" }
          ]
        },
        {
          id: "zephyr",
          name: "ZEPHYR",
          title: "THE WIND DANCER",
          style: "Capoeira Acrobat",
          origin: "Brazil",
          power: 3,
          speed: 5,
          defense: 3,
          specials: [
            { name: "Windmill Kick", cmd: "\u2193 \u2198 \u2192 + K (or SP1)", desc: "Spinning ground sweep kick" },
            { name: "Handstand Axe", cmd: "\u2192 \u2193 \u2198 + P (or SP2)", desc: "Overhead handstand heel drop" },
            { name: "Flare Slide", cmd: "\u2193 \u2199 \u2190 + K (or SP3)", desc: "Low evasive sliding sweep" }
          ]
        },
        {
          id: "colossus",
          name: "COLOSSUS",
          title: "THE IRON WALL",
          style: "Heavyweight Boxing",
          origin: "USA",
          power: 5,
          speed: 2,
          defense: 5,
          specials: [
            { name: "Dempsey Blow", cmd: "\u2193 \u2198 \u2192 + P (or SP1)", desc: "Armored heavy body blow" },
            { name: "Corkscrew", cmd: "\u2192 \u2193 \u2198 + P (or SP2)", desc: "Rising spiral uppercut" },
            { name: "Gazelle Punch", cmd: "\u2193 \u2199 \u2190 + P (or SP3)", desc: "Leaping heavy hook" }
          ]
        },
        {
          id: "cinder",
          name: "CINDER",
          title: "EMBER SHINOBI",
          style: "Flame Ninjutsu",
          origin: "Ash Province",
          power: 3,
          speed: 5,
          defense: 3,
          specials: [
            { name: "Flame Warp", cmd: "\u2193 \u2199 \u2190 + P (or SP1)", desc: "Vanishes in smoke, reappears behind foe" },
            { name: "Ember Gale", cmd: "\u2193 \u2198 \u2192 + K (or SP2)", desc: "Triple rising fire kick" },
            { name: "Fire Kunai", cmd: "\u2193 \u2198 \u2192 + P", desc: "Rapid blazing kunai" }
          ]
        },
        {
          id: "glacier",
          name: "GLACIER",
          title: "FROSTBOUND ASSASSIN",
          style: "Ice Ansatsuken",
          origin: "Frozen North",
          power: 4,
          speed: 4,
          defense: 4,
          specials: [
            { name: "Ice Shard", cmd: "\u2193 \u2198 \u2192 + P (or SP1)", desc: "Freezing ki projectile" },
            { name: "Frost Rise", cmd: "\u2192 \u2193 \u2198 + P (or SP2)", desc: "Invincible rising uppercut" },
            { name: "Blizzard Kick", cmd: "\u2193 \u2199 \u2190 + K", desc: "Spinning icy kick" }
          ]
        },
        {
          id: "oracle",
          name: "ORACLE",
          title: "STAR-READER",
          style: "Astral Sorcery",
          origin: "Observatory Ruins",
          power: 2,
          speed: 4,
          defense: 3,
          specials: [
            { name: "Star Step", cmd: "\u2193 \u2199 \u2190 + P (or SP1)", desc: "Blinks behind the opponent" },
            { name: "Comet Fall", cmd: "\u2193 \u2198 \u2192 + K (or SP2)", desc: "Triple rising comet strike" },
            { name: "Astral Dart", cmd: "\u2193 \u2198 \u2192 + P", desc: "Rapid starlight darts" }
          ]
        },
        {
          id: "bandit",
          name: "BANDIT",
          title: "ROAD REAVER",
          style: "Dirty Brawling",
          origin: "Wastelands",
          power: 4,
          speed: 4,
          defense: 3,
          specials: [
            { name: "Razor Toss", cmd: "\u2190 (hold) \u2192 + P (or SP1)", desc: "Spinning thrown blade" },
            { name: "Back Flip Slash", cmd: "\u2193 (hold) \u2191 + K (or SP2)", desc: "Anti-air flip slash" },
            { name: "Knuckle Dust", cmd: "\u2193 \u2198 \u2192 + P", desc: "Armoured straight punch" }
          ]
        },
        {
          id: "confessor",
          name: "CONFESSOR",
          title: "HOODED INQUISITOR",
          style: "Penitent Striking",
          origin: "Hollow Cathedral",
          power: 4,
          speed: 3,
          defense: 4,
          specials: [
            { name: "Penance Knee", cmd: "\u2193 \u2198 \u2192 + K (or SP1)", desc: "Leaping knee strike" },
            { name: "Judgement Elbow", cmd: "\u2192 \u2193 \u2198 + P (or SP2)", desc: "Double spinning elbow" },
            { name: "Silent Teep", cmd: "\u2193 \u2199 \u2190 + K (or SP3)", desc: "Heavy pushback kick" }
          ]
        },
        {
          id: "valka",
          name: "VALKA",
          title: "SHIELD-SISTER",
          style: "Warrior Karate",
          origin: "Northern Hold",
          power: 3,
          speed: 5,
          defense: 3,
          specials: [
            { name: "War Cry", cmd: "\u2193 \u2198 \u2192 + P (or SP1)", desc: "Ki shockwave projectile" },
            { name: "Valkyrie Rise", cmd: "\u2192 \u2193 \u2198 + P (or SP2)", desc: "Invincible rising strike" },
            { name: "Storm Spin", cmd: "\u2193 \u2199 \u2190 + K", desc: "Spinning horizontal kick" }
          ]
        },
        {
          id: "convict",
          name: "CONVICT",
          title: "THE SACKED ONE",
          style: "Prison Boxing",
          origin: "Black Gaol",
          power: 5,
          speed: 2,
          defense: 5,
          specials: [
            { name: "Chain Hook", cmd: "\u2193 \u2198 \u2192 + P (or SP1)", desc: "Armoured heavy body blow" },
            { name: "Breakout", cmd: "\u2192 \u2193 \u2198 + P (or SP2)", desc: "Rising spiral uppercut" },
            { name: "Cell Rush", cmd: "\u2193 \u2199 \u2190 + P (or SP3)", desc: "Leaping heavy hook" }
          ]
        },
        {
          id: "prophet",
          name: "PROPHET",
          title: "THE BLIND SEER",
          style: "Mystic Capoeira",
          origin: "Dune Temple",
          power: 3,
          speed: 4,
          defense: 3,
          specials: [
            { name: "Sand Wheel", cmd: "\u2193 \u2198 \u2192 + K (or SP1)", desc: "Spinning ground sweep" },
            { name: "Vision Axe", cmd: "\u2192 \u2193 \u2198 + P (or SP2)", desc: "Overhead heel drop" },
            { name: "Dust Slide", cmd: "\u2193 \u2199 \u2190 + K (or SP3)", desc: "Low evasive slide" }
          ]
        },
        {
          id: "ronin",
          name: "RONIN",
          title: "CRIMSON BLADE",
          style: "Bushido Karate",
          origin: "Feudal Japan",
          power: 4,
          speed: 4,
          defense: 4,
          specials: [
            { name: "Wave Cutter", cmd: "\u2193 \u2198 \u2192 + P (or SP1)", desc: "Ki slash projectile" },
            { name: "Rising Katana", cmd: "\u2192 \u2193 \u2198 + P (or SP2)", desc: "Invincible rising slash" },
            { name: "Whirl Kick", cmd: "\u2193 \u2199 \u2190 + K", desc: "Spinning horizontal kick" }
          ]
        },
        {
          id: "vagabond",
          name: "VAGABOND",
          title: "WANDERING KNIGHT",
          style: "Heavy Blade Brawling",
          origin: "Fallen Kingdom",
          power: 5,
          speed: 3,
          defense: 5,
          specials: [
            { name: "Edge Wave", cmd: "\u2190 (hold) \u2192 + P (or SP1)", desc: "Spinning blade wave" },
            { name: "Knight Flip", cmd: "\u2193 (hold) \u2191 + K (or SP2)", desc: "Anti-air backflip slash" },
            { name: "Shield Ram", cmd: "\u2193 \u2198 \u2192 + P", desc: "Armoured straight punch" }
          ]
        },
        {
          id: "warden",
          name: "WARDEN",
          title: "WALL OF THE DESERT",
          style: "Desert Boxing Kicks",
          origin: "Sand Citadel",
          power: 4,
          speed: 3,
          defense: 5,
          specials: [
            { name: "Citadel Knee", cmd: "\u2193 \u2198 \u2192 + K (or SP1)", desc: "Forward leaping knee" },
            { name: "Twin Blades", cmd: "\u2192 \u2193 \u2198 + P (or SP2)", desc: "Double spinning elbow" },
            { name: "Iron Gate", cmd: "\u2193 \u2199 \u2190 + K (or SP3)", desc: "Pushback front kick" }
          ]
        },
        {
          id: "wretch",
          name: "WRETCH",
          title: "THE UNBROKEN",
          style: "Desperate Scrapping",
          origin: "Nowhere",
          power: 2,
          speed: 5,
          defense: 2,
          specials: [
            { name: "Scramble Spin", cmd: "\u2193 \u2198 \u2192 + K (or SP1)", desc: "Spinning ground sweep" },
            { name: "Crow Drop", cmd: "\u2192 \u2193 \u2198 + P (or SP2)", desc: "Overhead heel drop" },
            { name: "Gutter Slide", cmd: "\u2193 \u2199 \u2190 + K (or SP3)", desc: "Low sliding sweep" }
          ]
        },
        {
          id: "mighty",
          name: "M1GHTY",
          title: "DIVINE ANNIHILATOR",
          style: "One-Hit Extinction",
          origin: "Astral Realm",
          power: 5,
          speed: 5,
          defense: 5,
          isSecret: true,
          specials: [
            { name: "God Palm", cmd: "\u2193 \u2198 \u2192 + P (or SP1)", desc: "Instant 9999 KO Solar Palm" },
            { name: "Apex Shatter", cmd: "\u2192 \u2193 \u2198 + P (or SP2)", desc: "Invincible 9999 Uppercut" },
            { name: "Void Tremor", cmd: "\u2193 \u2199 \u2190 + P (or SP3)", desc: "Instant 9999 Warp Strike" }
          ]
        },
        {
          id: "endless_dragon",
          name: "ENDLESS DRAGON",
          title: "ANCIENT VOID EMPEROR",
          style: "Draconic Cataclysm & Flight",
          origin: "Primeval Realm",
          power: 5,
          speed: 4,
          defense: 5,
          isBoss: true,
          specials: [
            { name: "Dragon Claw", cmd: "\u2193 \u2198 \u2192 + P (or SP1)", desc: "Brutal Rend Slash" },
            { name: "Tail Sweep", cmd: "\u2192 \u2193 \u2198 + K (or SP2)", desc: "Low Knockdown Sweep" },
            { name: "Dragon Flight", cmd: "SP3 (or Aerial)", desc: "Fly freely & divebomb" }
          ]
        }
      ];
      this.stages = STAGE_CATALOG;
      this.p1Index = 0;
      this.p2Index = 1;
      this.stageIndex = 0;
      this.gameMode = "campaign";
      this.cpuDifficulty = "normal";
      this.localPlayerNum = 1;
      this.p1Locked = false;
      this.p2Locked = false;
      this.animTimer = 0;
      this.animFrame = 0;
      this.codeFeedback = "";
      this.codeFeedbackColor = "#38bdf8";
      this.onOpenAdmin = null;
      this.previewSprites = {};
      this.refreshPreviews();
    }
    refreshPreviews() {
      this.characters.forEach((c) => {
        const equippedSkin = EconomyManager.getEquippedSkin(c.id);
        this.previewSprites[c.id] = spriteGenerator.generateFighterSprites(c.id, equippedSkin);
      });
    }
    isMightyUnlocked() {
      return isMightyUnlocked();
    }
    unlockMighty() {
      setMightyUnlocked(true);
      const equipped = EconomyManager.getEquippedSkin("mighty");
      this.previewSprites["mighty"] = spriteGenerator.generateFighterSprites("mighty", equipped);
    }
    lockMighty() {
      setMightyUnlocked(false);
    }
    openAdminPortal() {
      if (typeof this.onOpenAdmin === "function") {
        this.onOpenAdmin();
      } else if (typeof window !== "undefined" && typeof window.openAdminPortal === "function") {
        window.openAdminPortal();
      }
    }
    isDragonUnlocked() {
      try {
        return typeof localStorage !== "undefined" && localStorage.getItem("final_impact_unlocked_dragon") === "true";
      } catch (e) {
        return false;
      }
    }
    hasBeatenDragon() {
      try {
        return typeof localStorage !== "undefined" && localStorage.getItem("final_impact_beaten_dragon") === "true";
      } catch (e) {
        return false;
      }
    }
    unlockDragon() {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("final_impact_unlocked_dragon", "true");
          localStorage.setItem("final_impact_beaten_dragon", "true");
        }
        if (!this.previewSprites["endless_dragon"]) {
          this.previewSprites["endless_dragon"] = spriteGenerator.generateFighterSprites("endless_dragon");
        }
      } catch (e) {
      }
    }
    isCurrentSelectionLocked(isP1 = true) {
      const idx = isP1 ? this.p1Index : this.p2Index;
      const char = this.characters[idx];
      if (!char) return false;
      if (char.id === "mighty" && !this.isMightyUnlocked()) return "mighty";
      if (char.id === "endless_dragon" && !this.isDragonUnlocked()) return "dragon";
      return false;
    }
    setMode(mode, difficulty = "normal", localPlayerNum = 1) {
      this.gameMode = mode;
      this.cpuDifficulty = difficulty;
      this.localPlayerNum = localPlayerNum;
    }
    gridCols() {
      return Math.ceil(this.characters.length / 2);
    }
    /** Roster grid geometry (shared by hit-testing and rendering). */
    gridLayout(W = 640) {
      const cols = this.gridCols();
      const tileW = 50, tileH = 36, gap = 3;
      const totalW = cols * tileW + (cols - 1) * gap;
      return { cols, tileW, tileH, gap, x0: Math.round((W - totalW) / 2), y0: 248 };
    }
    handleInput(inputState, isP1 = true) {
      if (this.showCodeModal) return;
      if (isP1) {
        if (inputState.left) {
          this.p1Index = (this.p1Index - 1 + this.characters.length) % this.characters.length;
          soundFX.playWhoosh("light");
        } else if (inputState.right) {
          this.p1Index = (this.p1Index + 1) % this.characters.length;
          soundFX.playWhoosh("light");
        }
        if (inputState.up || inputState.down) {
          this.p1Index = (this.p1Index + this.gridCols()) % this.characters.length;
          soundFX.playWhoosh("light");
        }
      } else {
        if (inputState.up || inputState.down) {
          this.p2Index = (this.p2Index + this.gridCols()) % this.characters.length;
          soundFX.playWhoosh("light");
        }
        if (inputState.left) {
          this.p2Index = (this.p2Index - 1 + this.characters.length) % this.characters.length;
          soundFX.playWhoosh("light");
        } else if (inputState.right) {
          this.p2Index = (this.p2Index + 1) % this.characters.length;
          soundFX.playWhoosh("light");
        }
      }
    }
    handleClick(x, y, onBack, onConfirm, W = 640, H = 360) {
      if (x >= 12 && x <= 110 && y >= 10 && y <= 34) {
        soundFX.playWhoosh("light");
        if (onBack) onBack();
        return true;
      }
      const isStealth = isStealthMode() && !isAdminAuthenticated();
      if (!isStealth && x >= W - 165 && x <= W - 12 && y >= 10 && y <= 34) {
        this.openAdminPortal();
        return true;
      }
      const G = this.gridLayout(W);
      for (let idx = 0; idx < this.characters.length; idx++) {
        const col = idx % G.cols, row = Math.floor(idx / G.cols);
        const tx = G.x0 + col * (G.tileW + G.gap), ty = G.y0 + row * (G.tileH + G.gap);
        if (x >= tx && x <= tx + G.tileW && y >= ty && y <= ty + G.tileH) {
          const char = this.characters[idx];
          const prevIdx = this.gameMode === "online" && this.localPlayerNum === 2 ? this.p2Index : this.p1Index;
          const wasAlreadySelected = prevIdx === idx;
          if (this.gameMode === "online" && this.localPlayerNum === 2) {
            this.p2Index = idx;
          } else {
            this.p1Index = idx;
          }
          soundFX.playWhoosh("light");
          if (char.id === "mighty" && !this.isMightyUnlocked()) {
            if (isStealth) {
              this.codeFeedback = "\u{1F512} CLASSIFIED TOURNAMENT FIGHTER: LOCKED";
              this.codeFeedbackColor = "#ef4444";
            } else {
              this.codeFeedback = "\u{1F512} M1GHTY RESTRICTED TO ADMINS! CLICK ADMIN PORTAL [A] TO LOG IN.";
              this.codeFeedbackColor = "#fbbf24";
              this.openAdminPortal();
            }
            return true;
          } else if (char.id === "endless_dragon" && !this.isDragonUnlocked()) {
            try {
              soundFX.playBlock();
            } catch (e) {
            }
            return true;
          }
          if (wasAlreadySelected && onConfirm && (this.gameMode !== "online" || this.localPlayerNum === 1)) {
            onConfirm();
          }
          return true;
        }
      }
      const px0 = 218, pw = W - 2 * px0, py0 = 62, ph0 = 176;
      if (x >= px0 && x <= px0 + pw && y >= py0 && y <= py0 + ph0) {
        if (this.gameMode !== "online" || this.localPlayerNum === 1) {
          const lockedType = this.isCurrentSelectionLocked(this.gameMode !== "online" || this.localPlayerNum === 1);
          if (!lockedType && onConfirm) {
            onConfirm();
            return true;
          }
        }
      }
      const btnW = 380;
      const btnH = 34;
      const btnX = (W - btnW) / 2;
      const btnY = H - 38;
      if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
        if (this.gameMode !== "online" || this.localPlayerNum === 1) {
          const lockedType = this.isCurrentSelectionLocked(this.gameMode !== "online" || this.localPlayerNum === 1);
          if (lockedType) {
            try {
              soundFX.playBlock();
            } catch (e) {
            }
            if (lockedType === "mighty") {
              if (isStealth) {
                this.codeFeedback = "\u{1F512} CLASSIFIED TOURNAMENT FIGHTER: LOCKED";
                this.codeFeedbackColor = "#ef4444";
              } else {
                this.codeFeedback = "\u{1F512} M1GHTY RESTRICTED TO ADMINS! CLICK ADMIN PORTAL [A] TO LOG IN.";
                this.codeFeedbackColor = "#fbbf24";
                this.openAdminPortal();
              }
            }
            return true;
          }
          if (onConfirm) onConfirm();
          return true;
        }
      }
      return false;
    }
    render(ctx, W, H) {
      this.animTimer++;
      if (this.animTimer % 8 === 0) {
        this.animFrame = (this.animFrame + 1) % 4;
      }
      const mightyUnlocked = this.isMightyUnlocked();
      const dragonUnlocked = this.isDragonUnlocked();
      const hasBeatenDragon = this.hasBeatenDragon();
      const t = this.animTimer;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#12040a");
      bg.addColorStop(0.55, "#2a0a12");
      bg.addColorStop(1, "#070204");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      const spot = ctx.createRadialGradient(W / 2, 150, 10, W / 2, 150, 260);
      spot.addColorStop(0, "rgba(220, 38, 38, 0.28)");
      spot.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 28; i++) {
        const ex = (i * 67 + Math.sin(t * 0.02 + i) * 12 + W) % W;
        const ey = H - (t * (0.35 + i % 5 * 0.12) + i * 41) % H;
        ctx.globalAlpha = 0.2 + i % 4 * 0.1;
        ctx.fillStyle = i % 3 === 0 ? "#fde047" : "#f97316";
        ctx.fillRect(ex, ey, 2, 2);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, 38);
      ctx.fillStyle = "#b91c1c";
      ctx.fillRect(0, 38, W, 2);
      ctx.fillStyle = "#450a0a";
      ctx.fillRect(12, 10, 98, 24);
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 1;
      ctx.strokeRect(12.5, 10.5, 97, 23);
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("< BACK [B]", 61, 25);
      const isStealth = isStealthMode() && !isAdminAuthenticated();
      if (!isStealth) {
        const codeBtnX = W - 158;
        const codeBtnW = 146;
        ctx.fillStyle = mightyUnlocked ? "rgba(22, 101, 52, 0.9)" : "rgba(69, 10, 10, 0.9)";
        ctx.fillRect(codeBtnX, 10, codeBtnW, 24);
        ctx.strokeStyle = mightyUnlocked ? "#22c55e" : "#dc2626";
        ctx.strokeRect(codeBtnX + 0.5, 10.5, codeBtnW - 1, 23);
        ctx.fillStyle = mightyUnlocked ? "#86efac" : "#fca5a5";
        ctx.font = "bold 8.5px monospace";
        ctx.fillText(mightyUnlocked ? "\u26A1 ADMIN ACTIVE [A]" : "\u{1F512} ADMIN PORTAL [A]", codeBtnX + codeBtnW / 2, 25);
      }
      ctx.fillStyle = "#facc15";
      ctx.font = "900 18px monospace";
      ctx.fillText(hasBeatenDragon ? "CHOOSE YOUR FIGHTER  *" : "CHOOSE YOUR FIGHTER", W / 2, 26);
      const modeLabels = {
        campaign: "CAMPAIGN  -  8 BOSSES & THE ENDLESS DRAGON",
        coop_campaign: "CO-OP CAMPAIGN  -  ONLINE BOSS RAID",
        cpu: "VS CPU  -  AI: " + (this.cpuDifficulty || "normal").toUpperCase(),
        "2p": "LOCAL 2-PLAYER VERSUS",
        "2v2": "2V2 TEAM BRAWL",
        online: "ONLINE VERSUS",
        training: "TRAINING DOJO"
      };
      ctx.fillStyle = "#fca5a5";
      ctx.font = "bold 9px monospace";
      ctx.fillText(modeLabels[this.gameMode] || modeLabels.campaign, W / 2, 52);
      const showP2 = ["2p", "online", "coop_campaign", "cpu", "2v2", "training"].includes(this.gameMode);
      const p2Controlled = ["2p", "online", "coop_campaign"].includes(this.gameMode);
      const lockedOf = (ch) => ch.id === "mighty" && !mightyUnlocked || ch.id === "endless_dragon" && !dragonUnlocked;
      const drawShowcase = (idx, cx, mirror, tag, tagColor) => {
        const ch = this.characters[idx];
        const locked = lockedOf(ch);
        const scale = 1.85;
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath();
        ctx.ellipse(cx, 236, 62, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = tagColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cx, 236, 62, 9, 0, 0, Math.PI * 2);
        ctx.stroke();
        if (locked) {
          ctx.fillStyle = "#1f1620";
          ctx.fillRect(cx - 50, 100, 100, 130);
          ctx.fillStyle = "#6b7280";
          ctx.font = "900 64px monospace";
          ctx.textAlign = "center";
          ctx.fillText("?", cx, 190);
        } else {
          const sprites = this.previewSprites[ch.id];
          const frames = sprites?.idle || sprites?.IDLE || [];
          const img = frames[this.animFrame % (frames.length || 1)];
          if (img) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.translate(cx, 238);
            if (mirror) ctx.scale(-1, 1);
            ctx.scale(scale, scale);
            ctx.drawImage(img, -40, -88);
            ctx.restore();
          }
        }
        ctx.textAlign = "center";
        ctx.fillStyle = tagColor;
        ctx.font = "bold 9px monospace";
        ctx.fillText(tag, cx, 66);
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 15px monospace";
        ctx.fillText(locked ? "???" : ch.name, cx, 82);
        ctx.fillStyle = "#d6d3d1";
        ctx.font = "8px monospace";
        ctx.fillText(locked ? "LOCKED" : ch.title, cx, 93);
      };
      let p1Tag = "PLAYER 1", p2Tag = p2Controlled ? "PLAYER 2" : "CPU";
      if (this.gameMode === "online") {
        p1Tag = this.localPlayerNum === 2 ? "HOST" : "YOU";
        p2Tag = this.localPlayerNum === 2 ? "YOU" : "RIVAL";
      }
      if (this.gameMode === "coop_campaign") {
        p1Tag = this.localPlayerNum === 2 ? "HOST" : "YOU (P1)";
        p2Tag = this.localPlayerNum === 2 ? "YOU (ALLY)" : "ALLY (P2)";
      }
      drawShowcase(this.p1Index, 110, false, p1Tag, "#38bdf8");
      if (showP2 && this.gameMode !== "campaign") drawShowcase(this.p2Index, W - 110, true, p2Tag, "#ef4444");
      else {
        ctx.fillStyle = "#7f1d1d";
        ctx.font = "900 64px monospace";
        ctx.textAlign = "center";
        ctx.fillText("?", W - 110, 190);
        ctx.fillStyle = "#fca5a5";
        ctx.font = "bold 9px monospace";
        ctx.fillText("BOSS RUSH AWAITS", W - 110, 82);
      }
      const focusIdx = this.gameMode === "online" && this.localPlayerNum === 2 ? this.p2Index : this.p1Index;
      const fc = this.characters[focusIdx];
      const px0 = 218, pw = W - 2 * px0, py0 = 62;
      ctx.fillStyle = "rgba(8, 3, 4, 0.82)";
      ctx.fillRect(px0, py0, pw, 176);
      ctx.strokeStyle = "#7f1d1d";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px0 + 0.5, py0 + 0.5, pw - 1, 175);
      ctx.fillStyle = "#facc15";
      ctx.textAlign = "center";
      ctx.font = "bold 9px monospace";
      ctx.fillText("FIGHTER PROFILE", W / 2, py0 + 13);
      if (lockedOf(fc)) {
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 10px monospace";
        ctx.fillText(fc.id === "mighty" ? "CLASSIFIED ADMIN FIGHTER" : "FINAL BOSS", W / 2, py0 + 55);
        ctx.fillStyle = "#f87171";
        ctx.font = "9px monospace";
        ctx.fillText(fc.id === "mighty" ? "\u{1F512} RESTRICTED: ADMIN ACCESS ONLY" : "BEAT THE ENDLESS DRAGON", W / 2, py0 + 75);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "8px monospace";
        ctx.fillText(fc.id === "mighty" ? "LOG IN VIA ADMIN PORTAL [A]" : "IN CAMPAIGN TO UNLOCK", W / 2, py0 + 92);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px monospace";
        ctx.fillText(fc.name, W / 2, py0 + 28);
        const equippedSkinId = EconomyManager.getEquippedSkin(fc.id);
        if (equippedSkinId) {
          const skinObj = SKIN_CATALOG.find((s) => s.id === equippedSkinId);
          ctx.fillStyle = skinObj ? skinObj.tierColor : "#38bdf8";
          ctx.font = "bold 7px monospace";
          ctx.fillText(`\u2605 SKIN: ${skinObj ? skinObj.name : equippedSkinId}`, W / 2, py0 + 38);
        }
        ctx.fillStyle = "#a8a29e";
        ctx.font = "8px monospace";
        ctx.fillText(fc.style + " - " + fc.origin, W / 2, py0 + (equippedSkinId ? 48 : 42));
        const stat = (label, val, y) => {
          ctx.textAlign = "left";
          ctx.fillStyle = "#a8a29e";
          ctx.font = "bold 8px monospace";
          ctx.fillText(label, px0 + 14, y);
          for (let i = 0; i < 5; i++) {
            ctx.fillStyle = i < val ? "#f59e0b" : "#3f2a2a";
            ctx.fillRect(px0 + 48 + i * 18, y - 7, 15, 7);
          }
        };
        stat("POWER", fc.power, py0 + 60);
        stat("SPEED", fc.speed, py0 + 74);
        stat("DEFEN", fc.defense, py0 + 88);
        ctx.textAlign = "left";
        fc.specials.forEach((sp, i) => {
          const y = py0 + 108 + i * 19;
          ctx.fillStyle = "#fbbf24";
          ctx.font = "bold 8px monospace";
          ctx.fillText("* " + sp.name, px0 + 14, y);
          ctx.fillStyle = "#9ca3af";
          ctx.font = "7px monospace";
          ctx.fillText(sp.cmd.split(" (")[0], px0 + 22, y + 9);
        });
        ctx.textAlign = "center";
      }
      const G = this.gridLayout(W);
      this.characters.forEach((char, idx) => {
        const col = idx % G.cols, row = Math.floor(idx / G.cols);
        const tx = G.x0 + col * (G.tileW + G.gap), ty = G.y0 + row * (G.tileH + G.gap);
        const locked = lockedOf(char);
        const isP1 = this.p1Index === idx;
        const isP2 = this.p2Index === idx && showP2 && this.gameMode !== "campaign";
        ctx.fillStyle = locked ? "#120a12" : "#1a0b10";
        ctx.fillRect(tx, ty, G.tileW, G.tileH);
        if (locked) {
          ctx.fillStyle = "#4b5563";
          ctx.font = "900 22px monospace";
          ctx.textAlign = "center";
          ctx.fillText("?", tx + G.tileW / 2, ty + 26);
        } else {
          const sprites = this.previewSprites[char.id];
          const frames = sprites?.idle || sprites?.IDLE || [];
          const img = frames[0];
          if (img) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(tx + 1, ty + 1, G.tileW - 2, G.tileH - 2);
            ctx.clip();
            ctx.drawImage(img, 19, 8, 42, 34, tx + 2, ty + 2, G.tileW - 4, G.tileH - 4);
            ctx.restore();
          }
          if (char.id === "mighty" || char.id === "endless_dragon") {
            ctx.fillStyle = char.id === "mighty" ? "rgba(250, 204, 21, 0.18)" : "rgba(168, 85, 247, 0.2)";
            ctx.fillRect(tx, ty, G.tileW, G.tileH);
          }
        }
        ctx.strokeStyle = "#4a1d24";
        ctx.lineWidth = 1;
        ctx.strokeRect(tx + 0.5, ty + 0.5, G.tileW - 1, G.tileH - 1);
        if (isP1 || isP2) {
          const pulse = 0.6 + Math.sin(t * 0.2) * 0.4;
          if (isP1) {
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 2;
            ctx.globalAlpha = pulse;
            ctx.strokeRect(tx - 1, ty - 1, G.tileW + 2, G.tileH + 2);
            ctx.globalAlpha = 1;
          }
          if (isP2) {
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.globalAlpha = isP1 ? 1 : pulse;
            ctx.strokeRect(tx + (isP1 ? 1 : -1), ty + (isP1 ? 1 : -1), G.tileW + (isP1 ? -2 : 2), G.tileH + (isP1 ? -2 : 2));
            ctx.globalAlpha = 1;
          }
          ctx.font = "bold 7px monospace";
          ctx.textAlign = "left";
          if (isP1) {
            ctx.fillStyle = "#0c4a6e";
            ctx.fillRect(tx + 1, ty + 1, 12, 8);
            ctx.fillStyle = "#e0f2fe";
            ctx.fillText("P1", tx + 2, ty + 8);
          }
          if (isP2) {
            ctx.fillStyle = "#7f1d1d";
            ctx.fillRect(tx + G.tileW - 13, ty + 1, 12, 8);
            ctx.fillStyle = "#fee2e2";
            ctx.fillText(p2Controlled ? "P2" : "CPU", tx + G.tileW - 12, ty + 8);
          }
          ctx.textAlign = "center";
        }
      });
      ctx.textAlign = "center";
      const btnW = 360;
      const btnH = 26;
      const btnX = (W - btnW) / 2;
      const btnY = H - 33;
      const currentLocked = this.isCurrentSelectionLocked(this.gameMode !== "online" || this.localPlayerNum === 1);
      if (currentLocked === "mighty") {
        ctx.fillStyle = "rgba(120, 53, 15, 0.9)";
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(btnX, btnY, btnW, btnH);
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 10px monospace";
        ctx.fillText("\u{1F512} M1GHTY IS LOCKED! PRESS [A] FOR ADMIN PORTAL", W / 2, btnY + 17);
      } else if (currentLocked === "dragon") {
        ctx.fillStyle = "rgba(88, 28, 135, 0.9)";
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(btnX, btnY, btnW, btnH);
        ctx.fillStyle = "#e9d5ff";
        ctx.font = "bold 10.5px monospace";
        ctx.fillText("\u{1F512} DEFEAT THE ENDLESS DRAGON IN CAMPAIGN TO UNLOCK", W / 2, btnY + 17);
      } else if (this.gameMode === "online" && this.localPlayerNum === 2) {
        const pulse = Math.floor(Date.now() / 350) % 2 === 0;
        ctx.fillStyle = pulse ? "rgba(30, 27, 75, 0.95)" : "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(btnX, btnY, btnW, btnH);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 11px monospace";
        ctx.fillText("\u23F3 WAITING FOR HOST TO START THE BATTLE...", W / 2, btnY + 17);
      } else {
        ctx.fillStyle = "rgba(22, 101, 52, 0.85)";
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(btnX, btnY, btnW, btnH);
        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 12px monospace";
        ctx.fillText((["cpu", "2p", "2v2", "training"].includes(this.gameMode) ? "\u2694\uFE0F CHOOSE STAGE [ENTER / CLICK]" : "\u2694\uFE0F START BATTLE [ENTER / CLICK]") + "  |  [B / ESC] BACK", W / 2, btnY + 17);
      }
      if (this.codeFeedback) {
        const fbW = 440;
        const fbH = 24;
        const fbX = (W - fbW) / 2;
        const fbY = H - 64;
        ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
        ctx.fillRect(fbX, fbY, fbW, fbH);
        ctx.strokeStyle = this.codeFeedbackColor || "#fde047";
        ctx.lineWidth = 1;
        ctx.strokeRect(fbX, fbY, fbW, fbH);
        ctx.fillStyle = this.codeFeedbackColor || "#fde047";
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        ctx.fillText(this.codeFeedback, W / 2, fbY + 16);
      }
      ctx.textAlign = "left";
    }
  };

  // src/engine/Hitbox.js
  var Box = class {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    }
    intersects(other) {
      return this.x < other.x + other.w && this.x + this.w > other.x && this.y < other.y + other.h && this.y + this.h > other.y;
    }
  };
  var HitboxSystem = class {
    // Check if two rectangular boxes intersect
    static testOverlap(boxA, boxB) {
      return boxA.x < boxB.x + boxB.w && boxA.x + boxA.w > boxB.x && boxA.y < boxB.y + boxB.h && boxA.y + boxA.h > boxB.y;
    }
    // Check collision between attacker's active hitbox and defender's hurtbox
    static checkAttackHit(attacker, defender) {
      if (!attacker.activeHitbox) return null;
      if (defender.isInvincible) return null;
      const hit = attacker.getGlobalHitbox();
      if (!hit) return null;
      const hurtboxes = defender.getGlobalHurtboxes();
      for (const hurt of hurtboxes) {
        if (this.testOverlap(hit, hurt)) {
          return {
            hitX: hit.x + hit.w / 2,
            hitY: hit.y + hit.h / 2,
            attack: attacker.currentAttackData
          };
        }
      }
      return null;
    }
    // Pushbox separation to prevent grounded fighters walking through each other
    static resolvePushboxes(f1, f2, stageLeft = 40, stageRight = 920) {
      if (!f1.isGrounded || !f2.isGrounded) return;
      const p1 = f1.getPushbox();
      const p2 = f2.getPushbox();
      if (this.testOverlap(p1, p2)) {
        const overlapX = p1.x + p1.w - p2.x;
        const overlapAlt = p2.x + p2.w - p1.x;
        const minOverlap = Math.min(Math.abs(overlapX), Math.abs(overlapAlt));
        if (minOverlap > 0) {
          if (f1.x < f2.x) {
            f1.x -= minOverlap / 2;
            f2.x += minOverlap / 2;
          } else {
            f1.x += minOverlap / 2;
            f2.x -= minOverlap / 2;
          }
        }
      }
      f1.x = Math.max(stageLeft, Math.min(stageRight - 80, f1.x));
      f2.x = Math.max(stageLeft, Math.min(stageRight - 80, f2.x));
    }
  };

  // src/engine/AI.js
  var AIController = class {
    constructor(difficulty = "normal") {
      this.difficulty = difficulty;
      this.campaignStage = 0;
      this.tickCount = 0;
      this.nextDecisionTime = 0;
      this.currentState = {
        up: false,
        down: false,
        left: false,
        right: false,
        fwd: false,
        back: false,
        dashFwd: false,
        dashBack: false,
        lp: false,
        hp: false,
        lk: false,
        hk: false,
        sp1: false,
        sp2: false,
        sp3: false,
        dirty: false,
        lpJust: false,
        hpJust: false,
        lkJust: false,
        hkJust: false,
        sp1Just: false,
        sp2Just: false,
        sp3Just: false,
        dirtyJust: false
      };
    }
    setDifficulty(level, campaignStage = 0) {
      this.difficulty = level;
      this.campaignStage = campaignStage;
    }
    tapLP() {
      this.currentState.lp = true;
      this.currentState.lpJust = true;
    }
    tapHP() {
      this.currentState.hp = true;
      this.currentState.hpJust = true;
    }
    tapLK() {
      this.currentState.lk = true;
      this.currentState.lkJust = true;
    }
    tapHK() {
      this.currentState.hk = true;
      this.currentState.hkJust = true;
    }
    tapSP1() {
      this.currentState.sp1 = true;
      this.currentState.sp1Just = true;
    }
    tapSP2() {
      this.currentState.sp2 = true;
      this.currentState.sp2Just = true;
    }
    tapSP3() {
      this.currentState.sp3 = true;
      this.currentState.sp3Just = true;
    }
    tapDirty() {
      this.currentState.dirty = true;
      this.currentState.dirtyJust = true;
    }
    update(cpuFighter, playerFighter) {
      this.tickCount++;
      this.currentState.lp = false;
      this.currentState.hp = false;
      this.currentState.lk = false;
      this.currentState.hk = false;
      this.currentState.sp1 = false;
      this.currentState.sp2 = false;
      this.currentState.sp3 = false;
      this.currentState.dirty = false;
      this.currentState.lpJust = false;
      this.currentState.hpJust = false;
      this.currentState.lkJust = false;
      this.currentState.hkJust = false;
      this.currentState.sp1Just = false;
      this.currentState.sp2Just = false;
      this.currentState.sp3Just = false;
      this.currentState.dirtyJust = false;
      this.currentState.dashFwd = false;
      this.currentState.dashBack = false;
      if (!cpuFighter || !playerFighter || cpuFighter.isDead || playerFighter.isDead) {
        this.neutralize();
        return this.currentState;
      }
      const dist = Math.abs(cpuFighter.x - playerFighter.x);
      const isPlayerAttacking = playerFighter.activeHitbox !== null;
      const isPlayerAirborne = !playerFighter.isGrounded;
      let blockChance = 0.55;
      let reactionDelay = 10;
      let antiAirChance = 0.55;
      let aggression = 0.7;
      if (this.campaignStage > 0) {
        const stage = this.campaignStage;
        blockChance = 0.35 + stage * 0.08;
        reactionDelay = Math.max(2, 18 - stage * 2.3);
        antiAirChance = 0.4 + stage * 0.08;
        aggression = 0.5 + stage * 0.07;
      } else if (this.difficulty === "easy") {
        blockChance = 0.3;
        reactionDelay = 22;
        antiAirChance = 0.35;
        aggression = 0.45;
      } else if (this.difficulty === "hard") {
        blockChance = 0.85;
        reactionDelay = 4;
        antiAirChance = 0.85;
        aggression = 0.9;
      } else if (this.difficulty === "nightmare") {
        blockChance = 0.92;
        reactionDelay = 2;
        antiAirChance = 0.95;
        aggression = 0.98;
      }
      if (cpuFighter.canCancelOnHit() && !cpuFighter.isDead) {
        if (Math.random() < aggression) {
          if (Math.random() < 0.45) {
            this.tapHP();
          } else if (Math.random() < 0.75) {
            this.tapSP1();
          } else {
            this.tapSP2();
          }
          return this.currentState;
        }
      }
      if (isPlayerAttacking && dist < 140) {
        if (Math.random() < blockChance) {
          this.currentState.fwd = false;
          this.currentState.back = true;
          this.currentState.left = cpuFighter.facingRight;
          this.currentState.right = !cpuFighter.facingRight;
          const isLow = playerFighter.currentAttackData?.height === "LOW";
          this.currentState.down = isLow || Math.random() < 0.45;
          this.currentState.up = false;
          return this.currentState;
        }
      }
      if (isPlayerAirborne && dist < 130 && cpuFighter.isGrounded) {
        if (Math.random() < antiAirChance) {
          if (Math.random() < 0.6) {
            this.tapSP2();
          } else {
            this.tapHP();
          }
          return this.currentState;
        }
      }
      const isPlayerVulnerable = playerFighter.state === FIGHTER_STATE.HIT || playerFighter.state === FIGHTER_STATE.HIT_CROUCH || playerFighter.state === FIGHTER_STATE.BLIND_STUN || playerFighter.state === FIGHTER_STATE.WINDED;
      if (isPlayerVulnerable && dist < 110 && !cpuFighter.isAttacking()) {
        if (Math.random() < 0.5) {
          this.tapHP();
        } else {
          this.tapLP();
        }
        return this.currentState;
      }
      if (this.tickCount >= this.nextDecisionTime) {
        this.nextDecisionTime = this.tickCount + Math.max(2, Math.floor(reactionDelay + (Math.random() - 0.5) * 6));
        this.makeDecision(cpuFighter, playerFighter, dist, aggression);
      }
      return this.currentState;
    }
    makeDecision(cpu, player, dist, aggression = 0.7) {
      this.neutralize();
      if (cpu.id === "riot_cop") {
        if (dist > 150) {
          this.walkTowards(cpu, player);
        } else if (dist > 75) {
          if (Math.random() < 0.7) this.tapLP();
          else this.walkTowards(cpu, player);
        } else {
          if (Math.random() < 0.6) this.tapHP();
          else this.tapLP();
        }
        return;
      }
      if (cpu.id === "promoter") {
        if (dist > 210) {
          if (Math.random() < 0.45) {
            this.currentState.up = true;
            this.walkTowards(cpu, player);
          } else {
            this.walkTowards(cpu, player);
          }
        } else if (dist > 95) {
          if (Math.random() < 0.55) this.tapLP();
          else this.walkTowards(cpu, player);
        } else {
          this.tapLP();
        }
        return;
      }
      if (cpu.id === "boris") {
        if (dist > 130) {
          this.walkTowards(cpu, player);
        } else if (dist > 70) {
          if (Math.random() < 0.5) this.tapHP();
          else this.walkTowards(cpu, player);
        } else {
          if (Math.random() < 0.65) this.tapSP1();
          else this.tapHP();
        }
        return;
      }
      if (cpu.id === "viktor") {
        if (dist > 190) {
          this.walkTowards(cpu, player);
        } else if (dist > 95) {
          if (Math.random() < 0.5) {
            this.currentState.down = true;
            this.tapHK();
          } else {
            this.tapHK();
          }
        } else {
          if (Math.random() < 0.45) this.walkAway(cpu, player);
          else this.tapHK();
        }
        return;
      }
      if (cpu.id === "matriarch") {
        if (dist > 170) {
          this.walkTowards(cpu, player);
        } else if (dist > 85) {
          if (Math.random() < 0.5) this.tapLP();
          else this.tapHP();
        } else {
          if (Math.random() < 0.55) this.tapHP();
          else this.walkAway(cpu, player);
        }
        return;
      }
      if (cpu.id === "street_lord") {
        if (dist > 130) {
          this.walkTowards(cpu, player);
        } else if (dist > 75) {
          if (Math.random() < 0.5) this.tapLP();
          else this.tapHP();
        } else {
          this.tapHP();
        }
        return;
      }
      if (cpu.id === "urban_legend") {
        if (dist > 180) {
          this.walkTowards(cpu, player);
        } else if (dist > 90) {
          if (Math.random() < 0.7) this.tapLP();
          else this.walkTowards(cpu, player);
        } else {
          if (Math.random() < 0.5) this.tapLP();
          else this.tapHP();
        }
        return;
      }
      if (cpu.id === "champion") {
        const isPhase2 = cpu.phase === 2;
        if (dist > 150) {
          if (Math.random() < (isPhase2 ? 0.6 : 0.45)) {
            this.tapSP1();
          } else {
            this.walkTowards(cpu, player);
          }
        } else if (dist > 80) {
          if (isPhase2 && Math.random() < 0.5) {
            this.tapSP2();
          } else if (Math.random() < 0.45) {
            this.tapSP1();
          } else {
            this.tapLP();
          }
        } else {
          if (isPhase2 && Math.random() < 0.45) {
            this.tapSP3();
          } else if (Math.random() < 0.55) {
            this.tapHP();
          } else {
            this.tapLP();
          }
        }
        return;
      }
      if (dist > 230) {
        const roll = Math.random();
        if (roll < 0.45) {
          this.tapSP1();
        } else if (roll < 0.78) {
          this.walkTowards(cpu, player);
        } else {
          this.walkTowards(cpu, player);
          this.currentState.up = true;
        }
        return;
      }
      if (dist > 105) {
        const roll = Math.random();
        if (roll < 0.35) {
          this.walkTowards(cpu, player);
        } else if (roll < 0.5) {
          this.walkAway(cpu, player);
        } else if (roll < 0.75) {
          if (Math.random() < 0.5) this.tapHP();
          else this.tapHK();
        } else if (roll < 0.9) {
          this.currentState.down = true;
          this.tapHK();
        } else {
          this.currentState.dashFwd = true;
        }
        return;
      }
      const closeRoll = Math.random();
      if (closeRoll < 0.35) {
        this.tapLP();
      } else if (closeRoll < 0.55) {
        this.currentState.down = true;
        this.tapLK();
      } else if (closeRoll < 0.75) {
        this.tapHP();
      } else if (closeRoll < 0.88) {
        this.tapSP2();
      } else {
        this.walkAway(cpu, player);
      }
    }
    walkTowards(cpu, player) {
      const isToLeft = player.x < cpu.x;
      this.currentState.left = isToLeft;
      this.currentState.right = !isToLeft;
      this.currentState.fwd = true;
      this.currentState.back = false;
    }
    walkAway(cpu, player) {
      const isToLeft = player.x < cpu.x;
      this.currentState.left = !isToLeft;
      this.currentState.right = isToLeft;
      this.currentState.fwd = false;
      this.currentState.back = true;
    }
    neutralize() {
      this.currentState.up = false;
      this.currentState.down = false;
      this.currentState.left = false;
      this.currentState.right = false;
      this.currentState.fwd = false;
      this.currentState.back = false;
      this.currentState.dashFwd = false;
      this.currentState.dashBack = false;
    }
  };

  // src/ui/SettingsModal.js
  function formatKey(code) {
    if (!code) return "NONE";
    if (code.startsWith("Key")) return code.slice(3).toUpperCase();
    if (code.startsWith("Digit")) return code.slice(5);
    if (code.startsWith("Numpad")) {
      const sub = code.slice(6);
      if (sub === "Enter") return "NUM ENTER";
      return `NUM ${sub}`;
    }
    if (code === "Space") return "SPACE";
    if (code === "Semicolon") return ";";
    if (code === "Quote") return "'";
    if (code === "Comma") return ",";
    if (code === "Period") return ".";
    if (code === "Slash") return "/";
    if (code === "Backslash") return "\\";
    if (code === "BracketLeft") return "[";
    if (code === "BracketRight") return "]";
    if (code === "Minus") return "-";
    if (code === "Equal") return "=";
    if (code.startsWith("Arrow")) return code.slice(5).toUpperCase();
    if (code === "ShiftLeft") return "L-SHIFT";
    if (code === "ShiftRight") return "R-SHIFT";
    if (code === "ControlLeft") return "L-CTRL";
    if (code === "ControlRight") return "R-CTRL";
    if (code === "AltLeft") return "L-ALT";
    if (code === "AltRight") return "R-ALT";
    if (code === "Enter") return "ENTER";
    if (code === "Tab") return "TAB";
    return code.toUpperCase();
  }
  var ACTION_GROUPS = [
    {
      title: "\u2014 MOVEMENT \u2014",
      actions: [
        { key: "UP", label: "Jump / Up" },
        { key: "DOWN", label: "Crouch / Down" },
        { key: "LEFT", label: "Move Left" },
        { key: "RIGHT", label: "Move Right" }
      ]
    },
    {
      title: "\u2014 NORMAL ATTACKS \u2014",
      actions: [
        { key: "LP", label: "Light Punch (LP)" },
        { key: "HP", label: "Heavy Punch (HP)" },
        { key: "LK", label: "Light Kick (LK)" },
        { key: "HK", label: "Heavy Kick (HK)" }
      ]
    },
    {
      title: "\u2014 SPECIAL ATTACKS \u2014",
      actions: [
        { key: "SP1", label: "Special 1 (QCF / Fireball)" },
        { key: "SP2", label: "Special 2 (DP / Uppercut)" },
        { key: "SP3", label: "Special 3 (Spin / Tatsu)" }
      ]
    },
    {
      title: "\u2014 TACTICAL & ULTIMATE \u2014",
      actions: [
        { key: "DIRTY", label: "Dirty Tactic (Desperation)" },
        { key: "ULTIMATE", label: "Ultimate Secret Jutsu" }
      ]
    }
  ];
  var SettingsManager = class {
    constructor(game) {
      this.game = game;
      this.isOpen = false;
      this.currentTab = "general";
      this.selectedPlayer = 1;
      this.isRebinding = false;
      this.rebindingAction = null;
      this.listenersInitialized = false;
      this.focusIndex = 0;
      this.settings = {
        masterVolume: 80,
        musicVolume: 70,
        sfxVolume: 90,
        gameSpeed: 100,
        // 50, 75, 100, 125
        difficulty: "normal",
        // 'easy', 'normal', 'hard'
        screenShake: "full",
        // 'off', 'low', 'full'
        easyInputs: false
      };
      this.load();
      this.applySettings();
      if (typeof window !== "undefined") {
        window.addEventListener("DOMContentLoaded", () => this.initDomListeners());
        if (document.readyState === "complete" || document.readyState === "interactive") {
          this.initDomListeners();
        }
      }
    }
    load() {
      try {
        if (typeof localStorage !== "undefined") {
          const saved = localStorage.getItem("final_impact_settings");
          if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
          }
        }
      } catch (e) {
      }
    }
    save() {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("final_impact_settings", JSON.stringify(this.settings));
        }
      } catch (e) {
      }
    }
    applySettings() {
      try {
        soundFX.setMasterVolume(this.settings.masterVolume / 100);
        soundFX.setMusicVolume(this.settings.musicVolume / 100);
        soundFX.setSFXVolume(this.settings.sfxVolume / 100);
      } catch (e) {
      }
      input.easyInputs = this.settings.easyInputs;
      if (this.game && this.game.ai) {
        this.game.ai.setDifficulty(this.settings.difficulty);
      }
    }
    setGameSpeed(speed) {
      this.settings.gameSpeed = speed;
      this.save();
    }
    initDomListeners() {
      if (this.listenersInitialized) return;
      this.listenersInitialized = true;
      const tabGenBtn = document.getElementById("tabGeneralBtn");
      const tabCtrlBtn = document.getElementById("tabControlsBtn");
      if (tabGenBtn) tabGenBtn.addEventListener("click", () => this.switchTab("general"));
      if (tabCtrlBtn) tabCtrlBtn.addEventListener("click", () => this.switchTab("controls"));
      const p1Btn = document.getElementById("p1ControlsBtn");
      const p2Btn = document.getElementById("p2ControlsBtn");
      if (p1Btn) p1Btn.addEventListener("click", () => this.switchPlayer(1));
      if (p2Btn) p2Btn.addEventListener("click", () => this.switchPlayer(2));
      const resetBtn = document.getElementById("resetKeybindsBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => this.resetKeybinds());
      }
      const handleLeave = (target) => {
        if (this.game && typeof this.game.leaveGame === "function") {
          this.game.leaveGame(target);
        } else {
          this.close();
        }
      };
      const leaveFightBtn = document.getElementById("leaveFightBtn");
      if (leaveFightBtn) leaveFightBtn.addEventListener("click", () => handleLeave("MODE_SELECT"));
      const charSelectBtn = document.getElementById("charSelectBtn");
      if (charSelectBtn) charSelectBtn.addEventListener("click", () => handleLeave("CHAR_SELECT"));
      const genLeaveBtn = document.getElementById("generalLeaveMatchBtn");
      if (genLeaveBtn) genLeaveBtn.addEventListener("click", () => handleLeave("MODE_SELECT"));
      const genCharBtn = document.getElementById("generalCharSelectBtn");
      if (genCharBtn) genCharBtn.addEventListener("click", () => handleLeave("CHAR_SELECT"));
      const openAdminBtn = document.getElementById("settingsOpenAdminBtn");
      if (openAdminBtn) {
        openAdminBtn.addEventListener("click", () => {
          this.close();
          if (this.game && this.game.adminModal) {
            this.game.adminModal.open();
          } else if (typeof window !== "undefined" && typeof window.openAdminPortal === "function") {
            window.openAdminPortal();
          }
        });
      }
      window.addEventListener("keydown", (e) => {
        if (!this.isRebinding || !this.rebindingAction) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.code === "Escape") {
          this.cancelRebinding();
          try {
            if (soundFX && typeof soundFX.playBlock === "function") soundFX.playBlock();
          } catch (err) {
          }
          return;
        }
        this.finishRebinding(e.code);
      }, true);
      const container = document.getElementById("keybindsContainer");
      if (container) {
        container.addEventListener("click", (e) => {
          const row = e.target.closest(".keybind-row");
          if (!row) return;
          const actionKey = row.getAttribute("data-action");
          if (!actionKey) return;
          e.preventDefault();
          e.stopPropagation();
          if (this.isRebinding && this.rebindingAction === actionKey) {
            this.cancelRebinding();
            return;
          }
          this.startRebinding(actionKey);
        });
      }
    }
    getActionLabel(actionKey) {
      for (const g of ACTION_GROUPS) {
        const found = g.actions.find((a) => a.key === actionKey);
        if (found) return found.label;
      }
      return actionKey;
    }
    startRebinding(actionKey) {
      const container = document.getElementById("keybindsContainer");
      const pKey = this.selectedPlayer === 1 ? "P1" : "P2";
      const activeControls = input.controls[pKey] || {};
      if (container) {
        const allRows = container.querySelectorAll(".keybind-row");
        allRows.forEach((r) => {
          r.classList.remove("rebinding-active");
          const btn = r.querySelector(".keybind-key-btn");
          const act = r.getAttribute("data-action");
          if (btn && act) {
            btn.classList.remove("rebinding");
            btn.textContent = formatKey(activeControls[act]);
          }
        });
        const targetRow = container.querySelector(`.keybind-row[data-action="${actionKey}"]`);
        if (targetRow) {
          targetRow.classList.add("rebinding-active");
          const targetBtn = targetRow.querySelector(".keybind-key-btn");
          if (targetBtn) {
            targetBtn.classList.add("rebinding");
            targetBtn.textContent = "PRESS KEY...";
          }
        }
      }
      this.isRebinding = true;
      this.rebindingAction = actionKey;
      const hintEl = document.querySelector(".controls-hint");
      if (hintEl) {
        const label = this.getActionLabel(actionKey);
        hintEl.innerHTML = `<span style="color: #facc15; animation: pulse-rebinding 0.8s infinite alternate;">\u{1F3AF} REBINDING: [ ${label.toUpperCase()} ]<br>PRESS ANY KEY ON YOUR KEYBOARD (ESC TO CANCEL)</span>`;
      }
      try {
        if (soundFX && typeof soundFX.playHitLight === "function") soundFX.playHitLight();
      } catch (e) {
      }
    }
    finishRebinding(keyCode) {
      if (!this.rebindingAction) return;
      const actionKey = this.rebindingAction;
      const hintEl = document.querySelector(".controls-hint");
      if (keyCode === "KeyP") {
        if (hintEl) {
          hintEl.innerHTML = `<span style="color: #ef4444; font-weight: bold;">\u26A0 [P] IS RESERVED FOR PAUSE / SETTINGS. CHOOSE ANOTHER KEY.</span>`;
        }
        try {
          if (soundFX && typeof soundFX.playBlock === "function") soundFX.playBlock();
        } catch (e) {
        }
        return;
      }
      if (keyCode === "F11") {
        if (hintEl) {
          hintEl.innerHTML = `<span style="color: #ef4444; font-weight: bold;">\u26A0 [F11] IS RESERVED FOR FULLSCREEN. CHOOSE ANOTHER KEY.</span>`;
        }
        try {
          if (soundFX && typeof soundFX.playBlock === "function") soundFX.playBlock();
        } catch (e) {
        }
        return;
      }
      input.setKeybind(this.selectedPlayer, actionKey, keyCode);
      const container = document.getElementById("keybindsContainer");
      if (container) {
        const targetRow = container.querySelector(`.keybind-row[data-action="${actionKey}"]`);
        if (targetRow) {
          targetRow.classList.remove("rebinding-active");
          const targetBtn = targetRow.querySelector(".keybind-key-btn");
          if (targetBtn) {
            targetBtn.classList.remove("rebinding");
            targetBtn.textContent = formatKey(keyCode);
          }
        }
      }
      const label = this.getActionLabel(actionKey);
      if (hintEl) {
        hintEl.innerHTML = `<span style="color: #4ade80;">\u2713 BOUND [ ${label.toUpperCase()} ] \u2794 ${formatKey(keyCode)}</span>`;
      }
      this.isRebinding = false;
      this.rebindingAction = null;
      try {
        if (soundFX && typeof soundFX.playHitLight === "function") soundFX.playHitLight();
      } catch (e) {
      }
      if (typeof document !== "undefined" && document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
    }
    cancelRebinding() {
      if (this.rebindingAction) {
        const container = document.getElementById("keybindsContainer");
        const pKey = this.selectedPlayer === 1 ? "P1" : "P2";
        const activeControls = input.controls[pKey] || {};
        if (container) {
          const targetRow = container.querySelector(`.keybind-row[data-action="${this.rebindingAction}"]`);
          if (targetRow) {
            targetRow.classList.remove("rebinding-active");
            const targetBtn = targetRow.querySelector(".keybind-key-btn");
            if (targetBtn) {
              targetBtn.classList.remove("rebinding");
              targetBtn.textContent = formatKey(activeControls[this.rebindingAction]);
            }
          }
        }
      }
      this.isRebinding = false;
      this.rebindingAction = null;
      const hintEl = document.querySelector(".controls-hint");
      if (hintEl) {
        hintEl.innerHTML = `CLICK ANY ROW OR BUTTON BELOW, THEN PRESS A KEY TO REBIND. ESCAPE TO CANCEL.`;
      }
    }
    switchTab(tab) {
      this.currentTab = tab;
      this.cancelRebinding();
      const tabGenBtn = document.getElementById("tabGeneralBtn");
      const tabCtrlBtn = document.getElementById("tabControlsBtn");
      const genPane = document.getElementById("tabGeneralContent");
      const ctrlPane = document.getElementById("tabControlsContent");
      if (tabGenBtn) tabGenBtn.classList.toggle("active", tab === "general");
      if (tabCtrlBtn) tabCtrlBtn.classList.toggle("active", tab === "controls");
      if (genPane) genPane.style.display = tab === "general" ? "flex" : "none";
      if (ctrlPane) ctrlPane.style.display = tab === "controls" ? "flex" : "none";
      if (tab === "controls") {
        this.renderKeybinds();
      }
    }
    switchPlayer(playerNum) {
      this.selectedPlayer = playerNum;
      this.cancelRebinding();
      const p1Btn = document.getElementById("p1ControlsBtn");
      const p2Btn = document.getElementById("p2ControlsBtn");
      if (p1Btn) p1Btn.classList.toggle("active", playerNum === 1);
      if (p2Btn) p2Btn.classList.toggle("active", playerNum === 2);
      this.renderKeybinds();
    }
    toggle() {
      this.isOpen = !this.isOpen;
      const modal = document.getElementById("settingsModal");
      if (modal) {
        modal.style.display = this.isOpen ? "flex" : "none";
        if (this.isOpen) {
          this.cancelRebinding();
          this.syncUI();
        }
      }
    }
    close() {
      this.isOpen = false;
      this.cancelRebinding();
      if (typeof document !== "undefined") {
        document.querySelectorAll(".arcade-focus").forEach((el) => el.classList.remove("arcade-focus"));
      }
      const modal = document.getElementById("settingsModal");
      if (modal) modal.style.display = "none";
    }
    resetKeybinds() {
      input.resetDefaultControls();
      try {
        if (soundFX && typeof soundFX.playHitHeavy === "function") soundFX.playHitHeavy();
      } catch (e) {
      }
      this.cancelRebinding();
      this.renderKeybinds();
    }
    renderKeybinds() {
      const container = document.getElementById("keybindsContainer");
      if (!container) return;
      this.cancelRebinding();
      const hintEl = document.querySelector(".controls-hint");
      if (hintEl) {
        hintEl.innerHTML = `CLICK ANY ROW OR BUTTON BELOW, THEN PRESS A KEY TO REBIND. ESCAPE TO CANCEL.`;
      }
      container.innerHTML = "";
      const pKey = this.selectedPlayer === 1 ? "P1" : "P2";
      const activeControls = input.controls[pKey] || {};
      ACTION_GROUPS.forEach((group) => {
        const header = document.createElement("div");
        header.className = "keybind-group-header";
        header.textContent = group.title;
        container.appendChild(header);
        group.actions.forEach((action) => {
          const row = document.createElement("div");
          row.className = "keybind-row";
          row.setAttribute("data-action", action.key);
          const nameLabel = document.createElement("span");
          nameLabel.className = "keybind-action-name";
          nameLabel.textContent = action.label;
          const keyBtn = document.createElement("button");
          keyBtn.type = "button";
          keyBtn.className = "keybind-key-btn";
          keyBtn.setAttribute("data-action", action.key);
          keyBtn.textContent = formatKey(activeControls[action.key]);
          row.appendChild(nameLabel);
          row.appendChild(keyBtn);
          container.appendChild(row);
        });
      });
    }
    syncUI() {
      const masterSlider = document.getElementById("masterVol");
      const musicSlider = document.getElementById("musicVol");
      const sfxSlider = document.getElementById("sfxVol");
      const speedSelect = document.getElementById("gameSpeedSelect");
      const diffSelect = document.getElementById("aiDiffSelect");
      const shakeSelect = document.getElementById("shakeSelect");
      const easyToggle = document.getElementById("easyInputsCheck");
      if (masterSlider) masterSlider.value = this.settings.masterVolume;
      if (musicSlider) musicSlider.value = this.settings.musicVolume;
      if (sfxSlider) sfxSlider.value = this.settings.sfxVolume;
      if (speedSelect) speedSelect.value = this.settings.gameSpeed;
      if (diffSelect) diffSelect.value = this.settings.difficulty;
      if (shakeSelect) shakeSelect.value = this.settings.screenShake;
      if (easyToggle) easyToggle.checked = this.settings.easyInputs;
      const masterLabel = document.getElementById("masterVolVal");
      const musicLabel = document.getElementById("musicVolVal");
      const sfxLabel = document.getElementById("sfxVolVal");
      if (masterLabel) masterLabel.textContent = `${this.settings.masterVolume}%`;
      if (musicLabel) musicLabel.textContent = `${this.settings.musicVolume}%`;
      if (sfxLabel) sfxLabel.textContent = `${this.settings.sfxVolume}%`;
      this.renderKeybinds();
      const inFight = this.game && (this.game.screen === "FIGHT" || this.game.screen === "ROUND_OVER" || this.game.screen === "VICTORY");
      const inCharSelect = this.game && (this.game.screen === "CHAR_SELECT" || this.game.screen === "ONLINE_LOBBY");
      const leaveBtn = document.getElementById("leaveFightBtn");
      const charBtn = document.getElementById("charSelectBtn");
      const resumeBtn = document.getElementById("closeSettingsBtn");
      const matchGroup = document.getElementById("matchActionsGroup");
      const genLeaveBtn = document.getElementById("generalLeaveMatchBtn");
      const genCharBtn = document.getElementById("generalCharSelectBtn");
      if (inFight) {
        if (leaveBtn) {
          leaveBtn.style.display = "inline-block";
          leaveBtn.textContent = "\u{1F6AA} LEAVE GAME";
        }
        if (charBtn) {
          charBtn.style.display = this.game && this.game.isOnline ? "none" : "inline-block";
          charBtn.textContent = "\u{1F465} CHAR SELECT";
        }
        if (resumeBtn) {
          resumeBtn.textContent = "RESUME FIGHT [P]";
        }
        if (matchGroup) {
          matchGroup.style.display = "flex";
        }
        if (genLeaveBtn) {
          genLeaveBtn.textContent = "\u{1F6AA} LEAVE GAME (QUIT TO MENU)";
        }
        if (genCharBtn) {
          genCharBtn.style.display = this.game && this.game.isOnline ? "none" : "inline-block";
        }
      } else if (inCharSelect) {
        if (leaveBtn) {
          leaveBtn.style.display = "inline-block";
          leaveBtn.textContent = "\u{1F6AA} BACK TO MODES";
        }
        if (charBtn) {
          charBtn.style.display = "none";
        }
        if (resumeBtn) {
          resumeBtn.textContent = "CLOSE [P]";
        }
        if (matchGroup) {
          matchGroup.style.display = "flex";
        }
        if (genLeaveBtn) {
          genLeaveBtn.textContent = "\u{1F6AA} BACK TO MODE SELECT";
        }
        if (genCharBtn) {
          genCharBtn.style.display = "none";
        }
      } else {
        if (leaveBtn) {
          leaveBtn.style.display = "none";
        }
        if (charBtn) {
          charBtn.style.display = "none";
        }
        if (resumeBtn) {
          resumeBtn.textContent = "CLOSE [P]";
        }
        if (matchGroup) {
          matchGroup.style.display = "none";
        }
      }
      const connectedGps = input.getConnectedGamepads();
      const statusEl = document.getElementById("gamepadStatusText");
      if (statusEl) {
        if (connectedGps.length > 0) {
          const p1Gp = connectedGps[0];
          statusEl.innerHTML = `<span style="color: #4ade80;">\u25CF CONNECTED: ${p1Gp.id.slice(0, 24)}</span>`;
        } else {
          statusEl.innerHTML = `<span style="color: #94a3b8;">\u25CB NO CONTROLLER DETECTED</span>`;
        }
      }
    }
    getFocusableElements() {
      const list = [];
      if (this.currentTab === "general") {
        const ids = [
          "tabGeneralBtn",
          "tabControlsBtn",
          "masterVol",
          "musicVol",
          "sfxVol",
          "gameSpeedSelect",
          "aiDiffSelect",
          "shakeSelect",
          "easyInputsCheck",
          "generalLeaveMatchBtn",
          "generalCharSelectBtn",
          "closeSettingsBtn"
        ];
        ids.forEach((id) => {
          const el = document.getElementById(id);
          if (el && el.offsetParent !== null && el.style.display !== "none") {
            list.push(el);
          }
        });
      } else {
        const ids = [
          "tabGeneralBtn",
          "tabControlsBtn",
          "p1ControlsBtn",
          "p2ControlsBtn",
          "resetKeybindsBtn",
          "leaveFightBtn",
          "closeSettingsBtn"
        ];
        ids.forEach((id) => {
          const el = document.getElementById(id);
          if (el && el.offsetParent !== null && el.style.display !== "none") {
            list.push(el);
          }
        });
      }
      return list;
    }
    highlightFocused(elements) {
      if (typeof document === "undefined") return;
      document.querySelectorAll(".arcade-focus").forEach((el) => el.classList.remove("arcade-focus"));
      if (elements && elements[this.focusIndex]) {
        const target = elements[this.focusIndex];
        target.classList.add("arcade-focus");
        if (typeof target.scrollIntoView === "function") {
          target.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }
    updateGamepad() {
      if (!this.isOpen) return;
      const connectedGps = input.getConnectedGamepads();
      const statusEl = document.getElementById("gamepadStatusText");
      if (statusEl) {
        if (connectedGps.length > 0) {
          const p1Gp = connectedGps[0];
          statusEl.innerHTML = `<span style="color: #4ade80;">\u25CF CONNECTED: ${p1Gp.id.slice(0, 24)}</span>`;
        } else {
          statusEl.innerHTML = `<span style="color: #94a3b8;">\u25CB NO CONTROLLER DETECTED</span>`;
        }
      }
      const gp0 = input.getGamepadState(0);
      const lastInputEl = document.getElementById("gamepadLastInput");
      if (lastInputEl && gp0) {
        const activeBtns = [];
        if (gp0.lp) activeBtns.push("X / LP");
        if (gp0.hp) activeBtns.push("Y / HP");
        if (gp0.lk) activeBtns.push("A / LK");
        if (gp0.hk) activeBtns.push("B / HK");
        if (gp0.sp1) activeBtns.push("RB / SP1");
        if (gp0.sp2) activeBtns.push("RT / SP2");
        if (gp0.sp3) activeBtns.push("LB / SP3");
        if (gp0.dirty) activeBtns.push("LT / DIRTY");
        if (gp0.ultimate) activeBtns.push("ULTIMATE");
        if (gp0.start) activeBtns.push("START");
        if (gp0.select) activeBtns.push("SELECT");
        if (gp0.up) activeBtns.push("UP");
        if (gp0.down) activeBtns.push("DOWN");
        if (gp0.left) activeBtns.push("LEFT");
        if (gp0.right) activeBtns.push("RIGHT");
        if (activeBtns.length > 0) {
          lastInputEl.textContent = activeBtns.join(" + ");
          lastInputEl.style.color = "#fde047";
        }
      }
      const nav = input.getAnyMenuNav();
      if (!nav) return;
      if (nav.back || nav.start) {
        this.close();
        try {
          soundFX.playMenuSelect();
        } catch (e) {
        }
        return;
      }
      const focusable = this.getFocusableElements();
      if (focusable.length === 0) return;
      if (this.focusIndex === void 0 || this.focusIndex < 0 || this.focusIndex >= focusable.length) {
        this.focusIndex = 0;
      }
      if (nav.up) {
        this.focusIndex = (this.focusIndex - 1 + focusable.length) % focusable.length;
        this.highlightFocused(focusable);
        try {
          soundFX.playWhoosh("light");
        } catch (e) {
        }
        return;
      }
      if (nav.down) {
        this.focusIndex = (this.focusIndex + 1) % focusable.length;
        this.highlightFocused(focusable);
        try {
          soundFX.playWhoosh("light");
        } catch (e) {
        }
        return;
      }
      const curEl = focusable[this.focusIndex];
      if (!curEl) return;
      if (nav.left || nav.right) {
        const delta = nav.right ? 1 : -1;
        if (curEl.id === "tabGeneralBtn" || curEl.id === "tabControlsBtn") {
          this.switchTab(this.currentTab === "general" ? "controls" : "general");
          try {
            soundFX.playWhoosh("light");
          } catch (e) {
          }
        } else if (curEl.id === "p1ControlsBtn" || curEl.id === "p2ControlsBtn") {
          this.switchPlayer(this.selectedPlayer === 1 ? 2 : 1);
          try {
            soundFX.playWhoosh("light");
          } catch (e) {
          }
        } else if (curEl.type === "range") {
          const step = 5;
          const newVal = Math.max(Number(curEl.min || 0), Math.min(Number(curEl.max || 100), Number(curEl.value) + delta * step));
          curEl.value = newVal;
          curEl.dispatchEvent(new Event("input", { bubbles: true }));
          try {
            soundFX.playWhoosh("light");
          } catch (e) {
          }
        } else if (curEl.tagName === "SELECT") {
          const newIdx = Math.max(0, Math.min(curEl.options.length - 1, curEl.selectedIndex + delta));
          if (newIdx !== curEl.selectedIndex) {
            curEl.selectedIndex = newIdx;
            curEl.dispatchEvent(new Event("change", { bubbles: true }));
            try {
              soundFX.playWhoosh("light");
            } catch (e) {
            }
          }
        }
      }
      if (nav.confirm) {
        if (curEl.type === "checkbox") {
          curEl.checked = !curEl.checked;
          curEl.dispatchEvent(new Event("change", { bubbles: true }));
          try {
            soundFX.playHitLight();
          } catch (e) {
          }
        } else if (curEl.tagName === "BUTTON") {
          curEl.click();
        }
      }
    }
  };

  // src/engine/Projectiles.js
  var Projectile = class {
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
      color = "#38bdf8"
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
        if (this.owner && typeof this.owner.onProjectileDestroyed === "function") {
          this.owner.onProjectileDestroyed();
        }
      }
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.frame++;
      if (this.x < -100 || this.x > 1100 || this.y > 400) {
        this.destroy();
      }
    }
    getHitbox() {
      return new Box(this.x, this.y, this.width, this.height);
    }
    render(ctx) {
      if (!this.active) return;
      ctx.save();
      if (this.type === "hadouken") {
        const pulse = Math.sin(this.frame * 0.4) * 2;
        const trail = this.vx > 0 ? -1 : 1;
        ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 16 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(this.x + trail * 12, this.y + 4, 8, 4);
        ctx.fillRect(this.x + trail * 18, this.y + 12, 10, 5);
        ctx.fillRect(this.x + trail * 10, this.y + 16, 6, 4);
      } else if (this.type === "sonic_blade") {
        const rot = this.frame * 0.35;
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(rot);
        ctx.fillStyle = "#fde047";
        ctx.fillRect(-16, -16, 32, 32);
        ctx.fillStyle = "#eab308";
        ctx.fillRect(-18, -4, 36, 8);
        ctx.fillRect(-4, -18, 8, 36);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-6, -6, 12, 12);
      } else if (this.type === "ki_kunai") {
        ctx.fillStyle = "#06b6d4";
        ctx.fillRect(this.x, this.y, 16, 5);
        ctx.fillRect(this.x + 4, this.y + 8, 16, 5);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(this.x + 8, this.y + 1, 8, 3);
        ctx.fillRect(this.x + 12, this.y + 9, 8, 3);
      } else if (this.type === "god_palm") {
        const pulse = Math.sin(this.frame * 0.5) * 4;
        const trail = this.vx > 0 ? -1 : 1;
        ctx.fillStyle = "rgba(250, 204, 21, 0.45)";
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 28 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(this.x + trail * 16, this.y - 2, 24, 6);
        ctx.fillRect(this.x + trail * 24, this.y + 10, 30, 8);
        ctx.fillRect(this.x + trail * 14, this.y + 22, 20, 6);
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(this.x + trail * 8, this.y + 6, 12, 14);
      }
      ctx.restore();
    }
  };
  var AlleyPickup = class {
    constructor(type, x, y = 290) {
      this.type = type;
      this.x = x;
      this.y = y;
      this.width = type === "lumber" ? 26 : 14;
      this.height = type === "lumber" ? 12 : 12;
      this.active = true;
      this.isAirborne = false;
      this.vx = 0;
      this.vy = 0;
      this.owner = null;
      this.damage = type === "brick" ? 75 : type === "bottle" ? 65 : 85;
    }
    throw(owner, facingRight) {
      this.owner = owner;
      this.isAirborne = true;
      this.x = owner.x + (facingRight ? 50 : 10);
      this.y = owner.y - 50;
      this.vx = (facingRight ? 1 : -1) * (this.type === "brick" ? 7 : 8.5);
      this.vy = this.type === "brick" ? -5.5 : -2.5;
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
          if (this.type === "bottle") {
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
      if (this.type === "bottle") {
        ctx.fillStyle = "#10b981";
        ctx.fillRect(this.x, this.y - 8, 6, 12);
        ctx.fillStyle = "#6ee7b7";
        ctx.fillRect(this.x + 1, this.y - 12, 4, 5);
      } else if (this.type === "brick") {
        ctx.fillStyle = "#b91c1c";
        ctx.fillRect(this.x, this.y - 6, 14, 8);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(this.x + 2, this.y - 5, 10, 6);
      } else if (this.type === "lumber") {
        ctx.fillStyle = "#78350f";
        ctx.fillRect(this.x, this.y - 6, 26, 7);
        ctx.fillStyle = "#b45309";
        ctx.fillRect(this.x + 2, this.y - 5, 22, 5);
      }
      ctx.restore();
    }
  };

  // src/fighters/Fighter.js
  var Fighter = class {
    constructor({
      id,
      name,
      x,
      facingRight = true,
      playerNum = 1,
      isCpu = false,
      skinId = null
    }) {
      this.id = id;
      this.skinId = skinId;
      this.name = name;
      this.x = x;
      this.y = GROUND_Y;
      this.vx = 0;
      this.vy = 0;
      this.facingRight = facingRight;
      this.playerNum = playerNum;
      this.isCpu = isCpu;
      this.team = playerNum === 1 || playerNum === 3 ? 1 : 2;
      this.maxHealth = 1e3;
      this.health = 1e3;
      this.superMeter = 0;
      this.maxSuperMeter = 100;
      this.roundsWon = 0;
      this.maxStamina = 100;
      this.stamina = 100;
      this.staminaRegenRate = 0.9;
      this.windedTimer = 0;
      this.limbs = {
        leadArm: 100,
        rearArm: 100,
        leadLeg: 100,
        rearLeg: 100,
        torso: 100,
        head: 100
      };
      this.statusEffects = [];
      this.heldPickup = null;
      this.submissionStruggle = 0;
      this.state = FIGHTER_STATE.IDLE;
      this.stateTimer = 0;
      this.animFrame = 0;
      this.animTimer = 0;
      this.animSpeed = 5;
      this.isGrounded = true;
      this.isInvincible = false;
      this.isDead = false;
      this.isHoldingBack = false;
      this.isCrouching = false;
      this.hitStop = 0;
      this.hitStun = 0;
      this.blockStun = 0;
      this.knockdownTimer = 0;
      this.hasHitThisAttack = false;
      this.afterImages = [];
      this.isRageMode = false;
      this.armorDepleted = false;
      this.armorFlash = 0;
      this.blindTimer = 0;
      this.rageParticles = [];
      this.sweatParticles = [];
      this.tacticalParticles = [];
      this.activeHitbox = null;
      this.currentAttackData = null;
      this.walkSpeed = 3.6;
      this.dashSpeed = 7.8;
      this.jumpForce = -13.5;
      this.gravity = 0.65;
      this.projectileCooldown = 0;
      this.activeProjectileCount = 0;
      this.sprites = spriteGenerator.generateFighterSprites(this.id, this.skinId);
    }
    consumeStamina(amount, canWind = false) {
      this.stamina = Math.max(0, this.stamina - amount);
      if (canWind && this.stamina <= 0 && this.state !== FIGHTER_STATE.WINDED && this.isGrounded && !this.isDead) {
        this.changeState(FIGHTER_STATE.WINDED);
        this.windedTimer = 35;
      }
    }
    canFireProjectile(staminaCost = 10) {
      if (this.projectileCooldown > 0) return false;
      if (this.activeProjectileCount >= 2) return false;
      return true;
    }
    onFireProjectile(staminaCost = 10, cooldown = 18) {
      this.consumeStamina(staminaCost, false);
      this.projectileCooldown = cooldown;
      this.activeProjectileCount++;
    }
    onProjectileDestroyed() {
      if (this.activeProjectileCount > 0) {
        this.activeProjectileCount--;
      }
    }
    damageLimb(zone, amount) {
      if (this.limbs[zone] === void 0) return;
      const oldVal = this.limbs[zone];
      this.limbs[zone] = Math.max(0, this.limbs[zone] - amount);
      if (oldVal > 0 && this.limbs[zone] === 0) {
        soundFX.playKnockdown();
      }
    }
    applyStatusEffect(effect, duration) {
      this.statusEffects.push({ effect, duration });
    }
    hasStatusEffect(effect) {
      return this.statusEffects.some((s) => s.effect === effect && s.duration > 0);
    }
    isAttacking() {
      return this.state.startsWith("ATTACK_") || this.state.startsWith("CROUCH_LP") || this.state.startsWith("CROUCH_HP") || this.state.startsWith("CROUCH_LK") || this.state.startsWith("CROUCH_HK") || this.state.startsWith("JUMP_PUNCH") || this.state.startsWith("JUMP_KICK") || this.state.startsWith("SPECIAL_") || this.state === FIGHTER_STATE.ULTIMATE || this.state === FIGHTER_STATE.DIRTY_TACTIC;
    }
    canCancelOnHit() {
      return this.hasHitThisAttack && (this.state === FIGHTER_STATE.ATTACK_LIGHT_PUNCH || this.state === FIGHTER_STATE.ATTACK_LIGHT_KICK || this.state === FIGHTER_STATE.CROUCH_LIGHT_PUNCH || this.state === FIGHTER_STATE.CROUCH_LIGHT_KICK || this.state === FIGHTER_STATE.ATTACK_HEAVY_PUNCH || this.state === FIGHTER_STATE.ATTACK_HEAVY_KICK || this.state === FIGHTER_STATE.CROUCH_HEAVY_PUNCH || this.state === FIGHTER_STATE.CROUCH_HEAVY_KICK);
    }
    // Bounding Boxes
    getPushbox() {
      return new Box(this.x + 28, this.y - 74, 24, 74);
    }
    getGlobalHurtboxes() {
      const isCrouching = this.state === FIGHTER_STATE.CROUCH || this.state === FIGHTER_STATE.CROUCH_BLOCK || this.state.startsWith("CROUCH_");
      if (isCrouching) {
        return [
          new Box(this.x + 14, this.y - 56, 52, 56)
        ];
      }
      if (!this.isGrounded) {
        return [
          new Box(this.x + 16, this.y - 74, 48, 60)
        ];
      }
      return [
        new Box(this.x + 18, this.y - 88, 44, 26),
        new Box(this.x + 14, this.y - 64, 52, 36),
        new Box(this.x + 18, this.y - 28, 44, 28)
      ];
    }
    getGlobalHitbox() {
      if (!this.activeHitbox) return null;
      const offset = this.facingRight ? this.activeHitbox.x : 80 - this.activeHitbox.x - this.activeHitbox.w;
      return new Box(
        this.x + offset,
        this.y - 90 + this.activeHitbox.y,
        this.activeHitbox.w,
        this.activeHitbox.h
      );
    }
    changeState(newState, force = false) {
      if (this.state === newState && !force) {
        if (this.isAttacking() && this.canCancelOnHit()) {
          this.stateTimer = 0;
          this.animFrame = 0;
          this.animTimer = 0;
          this.activeHitbox = null;
          this.hasHitThisAttack = false;
        }
        return;
      }
      this.state = newState;
      this.stateTimer = 0;
      this.animFrame = 0;
      this.animTimer = 0;
      this.activeHitbox = null;
      this.hasHitThisAttack = false;
      if (newState === FIGHTER_STATE.IDLE) {
        this.isInvincible = false;
      }
    }
    // Double-tap Dashing
    startDash(forward = true) {
      if (this.isAttacking() || !this.isGrounded || this.hitStun > 0 || this.blockStun > 0 || this.state === FIGHTER_STATE.WINDED) return;
      this.consumeStamina(8, false);
      soundFX.playDash();
      this.changeState(forward ? FIGHTER_STATE.DASH_FWD : FIGHTER_STATE.DASH_BACK);
      let speed = forward ? this.dashSpeed : this.dashSpeed * 0.7;
      if (this.limbs.leadLeg <= 0) {
        speed *= 0.52;
      }
      const dir = this.facingRight ? forward ? 1 : -1 : forward ? -1 : 1;
      this.vx = dir * speed;
    }
    update(opponent, stageWidth = 960) {
      if (this.hitStop > 0) {
        this.hitStop--;
        return;
      }
      this.stateTimer++;
      if (this.armorFlash > 0) this.armorFlash--;
      if (this.projectileCooldown > 0) this.projectileCooldown--;
      if (this.state === FIGHTER_STATE.WINDED) {
        this.windedTimer--;
        this.vx *= 0.8;
        if (this.stateTimer % 10 === 0) {
          this.sweatParticles.push({
            x: this.x + 40 + (Math.random() - 0.5) * 12,
            y: this.y - 75,
            vy: 1.5,
            alpha: 1
          });
        }
        if (this.windedTimer <= 0) {
          this.stamina = 35;
          this.changeState(FIGHTER_STATE.IDLE);
        }
        return;
      }
      if (!this.isAttacking() && this.state !== FIGHTER_STATE.BLOCK && this.state !== FIGHTER_STATE.CROUCH_BLOCK && !this.isDead) {
        const torsoMult = this.limbs.torso <= 30 ? 0.5 : 1;
        this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate * torsoMult);
      }
      for (let i = this.statusEffects.length - 1; i >= 0; i--) {
        const se = this.statusEffects[i];
        se.duration--;
        if (se.effect === STATUS_EFFECT.BLEED) {
          if (se.duration % 30 === 0 && !this.isDead) {
            this.health = Math.max(1, this.health - 6);
            this.tacticalParticles.push({
              x: this.x + 40 + (Math.random() - 0.5) * 12,
              y: this.y - 50 + (Math.random() - 0.5) * 15,
              vx: (Math.random() - 0.5) * 1.5,
              vy: 1.5,
              size: 3,
              alpha: 1,
              color: "#b71c1c"
            });
          }
        }
        if (se.duration <= 0) {
          this.statusEffects.splice(i, 1);
        }
      }
      if (!this.isRageMode && this.health <= this.maxHealth * 0.3 && !this.isDead) {
        this.isRageMode = true;
        soundFX.playRageIgnite();
        window.dispatchEvent(new CustomEvent("rage-ignited", { detail: { fighter: this } }));
      }
      if (this.canTurnAround()) {
        this.armorDepleted = false;
      }
      if (this.canTurnAround() && opponent) {
        this.facingRight = this.x < opponent.x;
      }
      if (this.isRageMode && !this.isDead) {
        for (let i = 0; i < 2; i++) {
          this.rageParticles.push({
            x: this.x + 18 + Math.random() * 44,
            y: this.y - 12 - Math.random() * 68,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -(1.8 + Math.random() * 2.2),
            size: 3 + Math.random() * 4,
            alpha: 1,
            color: Math.random() < 0.6 ? "#ff3d00" : Math.random() < 0.5 ? "#ff9100" : "#ffea00"
          });
        }
      }
      if (this.health <= this.maxHealth * 0.35 && this.state === FIGHTER_STATE.IDLE && !this.isDead && Math.random() < 0.12) {
        this.sweatParticles.push({
          x: this.x + (this.facingRight ? 54 : 26) + (Math.random() - 0.5) * 6,
          y: this.y - 75,
          vy: 1.5 + Math.random() * 1.5,
          alpha: 1
        });
      }
      for (let i = this.rageParticles.length - 1; i >= 0; i--) {
        const p = this.rageParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.05;
        if (p.alpha <= 0) this.rageParticles.splice(i, 1);
      }
      for (let i = this.sweatParticles.length - 1; i >= 0; i--) {
        const s = this.sweatParticles[i];
        s.y += s.vy;
        s.alpha -= 0.04;
        if (s.alpha <= 0) this.sweatParticles.splice(i, 1);
      }
      for (let i = this.tacticalParticles.length - 1; i >= 0; i--) {
        const tp = this.tacticalParticles[i];
        tp.x += tp.vx;
        tp.y += tp.vy;
        tp.alpha -= 0.045;
        if (tp.alpha <= 0) this.tacticalParticles.splice(i, 1);
      }
      if (this.state === FIGHTER_STATE.BLIND_STUN) {
        this.blindTimer--;
        this.vx *= 0.85;
        if (this.blindTimer <= 0) {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        return;
      }
      if (this.state === FIGHTER_STATE.WALL_REBOUND) {
        this.vy += this.gravity * 0.75;
        this.y += this.vy;
        this.x += this.vx;
        if (this.y >= GROUND_Y) {
          this.y = GROUND_Y;
          this.vy = 0;
          this.vx = 0;
          this.isGrounded = true;
          this.changeState(FIGHTER_STATE.IDLE);
        }
        return;
      }
      if (this.state === FIGHTER_STATE.DASH_FWD || this.state === FIGHTER_STATE.DASH_BACK) {
        this.x += this.vx;
        this.vx *= 0.92;
        if (this.stateTimer % 2 === 0) {
          this.addAfterImage();
        }
        if (this.stateTimer >= 14) {
          this.changeState(FIGHTER_STATE.IDLE);
        }
      } else if (!this.isGrounded) {
        this.vy += this.gravity;
        this.y += this.vy;
        this.x += this.vx;
        if (this.y >= GROUND_Y) {
          this.y = GROUND_Y;
          this.vy = 0;
          this.vx = 0;
          this.isGrounded = true;
          if (this.state !== FIGHTER_STATE.KNOCKDOWN && !this.isDead) {
            this.changeState(FIGHTER_STATE.IDLE);
          }
        }
      } else {
        this.x += this.vx;
        this.vx *= 0.8;
      }
      this.x = Math.max(30, Math.min(stageWidth - 110, this.x));
      for (let i = this.afterImages.length - 1; i >= 0; i--) {
        this.afterImages[i].alpha -= 0.12;
        if (this.afterImages[i].alpha <= 0) {
          this.afterImages.splice(i, 1);
        }
      }
      if (this.hitStun > 0) {
        this.hitStun--;
        if (this.hitStun === 0) {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        return;
      }
      if (this.blockStun > 0) {
        this.blockStun--;
        if (this.blockStun === 0) {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        return;
      }
      if (this.state === FIGHTER_STATE.KNOCKDOWN) {
        if (this.isDead) return;
        this.knockdownTimer--;
        if (this.knockdownTimer <= 0) {
          this.isInvincible = false;
          this.changeState(FIGHTER_STATE.IDLE);
        }
        return;
      }
      this.updateState(opponent);
    }
    executePickupAttack(type, opponent) {
      const item = this.heldPickup;
      this.heldPickup = null;
      this.consumeStamina(6, false);
      if (item === "brick" || item === "bottle") {
        if (this.spawnProjectile) {
          const p = new AlleyPickup(item, this.x, this.y - 45);
          p.throw(this, this.facingRight);
          this.spawnProjectile(p);
        }
        soundFX.playWhoosh("heavy");
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH);
      } else if (item === "lumber") {
        soundFX.playWhoosh("heavy");
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH);
        this.activeHitbox = new Box(35, 15, 75, 55);
        this.currentAttackData = {
          damage: 85,
          hitStun: 30,
          blockStun: 18,
          pushback: 8,
          height: ATTACK_HEIGHT.MID,
          hitType: HIT_TYPE.KNOCKDOWN,
          chipDamage: 15
        };
      }
    }
    handleInput(inputState, inputManager, opponent) {
      if (this.hitStun > 0 || this.blockStun > 0 || this.state === FIGHTER_STATE.KNOCKDOWN || this.state === FIGHTER_STATE.BLIND_STUN || this.state === FIGHTER_STATE.WINDED || this.state === FIGHTER_STATE.OVERHEAT_STUN) {
        return;
      }
      if (this.state === FIGHTER_STATE.SUBMISSION_LOCK) {
        if (inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputState.dirtyJust || inputState.lp || inputState.hp) {
          this.submissionStruggle = Math.min(100, (this.submissionStruggle || 0) + 14);
          soundFX.playWhoosh("light");
        }
        return;
      }
      this.isHoldingBack = !!inputState.back;
      this.isCrouching = !!inputState.down;
      const pNum = this.playerNum;
      if (this.heldPickup) {
        const wantsAttack = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputState.dirtyJust || inputManager && (inputManager.peekAction(pNum) === "LP" || inputManager.peekAction(pNum) === "HP" || inputManager.peekAction(pNum) === "DIRTY");
        if (wantsAttack && !this.isAttacking()) {
          if (inputManager) inputManager.consumeAction(pNum);
          this.executePickupAttack(this.heldPickup, opponent);
          return;
        }
      }
      const lpTrigger = inputState.lpJust || inputManager && inputManager.peekAction(pNum) === "LP";
      const hpTrigger = inputState.hpJust || inputManager && inputManager.peekAction(pNum) === "HP";
      const lkTrigger = inputState.lkJust || inputManager && inputManager.peekAction(pNum) === "LK";
      const hkTrigger = inputState.hkJust || inputManager && inputManager.peekAction(pNum) === "HK";
      const sp1Trigger = inputState.sp1Just || inputManager && inputManager.peekAction(pNum) === "SP1";
      const sp2Trigger = inputState.sp2Just || inputManager && inputManager.peekAction(pNum) === "SP2";
      if (!this.isGrounded) {
        if (this.state === FIGHTER_STATE.JUMP) {
          if (lpTrigger || hpTrigger) {
            if (inputManager) inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_PUNCH);
            soundFX.playWhoosh("light");
          } else if (lkTrigger || hkTrigger) {
            if (inputManager) inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_KICK);
            soundFX.playWhoosh("heavy");
          }
        }
        return;
      }
      if (this.isAttacking() && !this.canCancelOnHit()) {
        return;
      }
      if (sp1Trigger) {
        if (inputManager) inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.SPECIAL_1);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (sp2Trigger) {
        if (inputManager) inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.SPECIAL_2);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (inputState.down) {
        if (lpTrigger) {
          if (inputManager) inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_PUNCH, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hpTrigger) {
          if (inputManager) inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_PUNCH, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (lkTrigger) {
          if (inputManager) inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_KICK, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hkTrigger) {
          if (inputManager) inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_KICK, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (!this.isAttacking()) {
          this.changeState(FIGHTER_STATE.CROUCH);
        }
        return;
      }
      if (lpTrigger) {
        if (inputManager) inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_PUNCH, true);
        soundFX.playWhoosh("light");
        return;
      }
      if (hpTrigger) {
        if (inputManager) inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (lkTrigger) {
        if (inputManager) inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_KICK, true);
        soundFX.playWhoosh("light");
        return;
      }
      if (hkTrigger) {
        if (inputManager) inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_KICK, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (this.isAttacking() || this.state === FIGHTER_STATE.DASH_FWD || this.state === FIGHTER_STATE.DASH_BACK) {
        return;
      }
      if (inputState.dashFwd) {
        this.startDash(true);
        return;
      }
      if (inputState.dashBack) {
        this.startDash(false);
        return;
      }
      if (inputState.up) {
        this.vy = this.jumpForce;
        this.isGrounded = false;
        this.changeState(FIGHTER_STATE.JUMP);
        if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 3.8;
        else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 3.8;
        soundFX.playJump();
        return;
      }
      if (inputState.fwd) {
        this.vx = (this.facingRight ? 1 : -1) * this.walkSpeed;
        this.changeState(FIGHTER_STATE.WALK_FWD);
      } else if (inputState.back) {
        this.vx = (this.facingRight ? -1 : 1) * (this.walkSpeed * 0.75);
        this.changeState(FIGHTER_STATE.WALK_BACK);
      } else {
        this.changeState(FIGHTER_STATE.IDLE);
      }
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      if (this.isAttacking()) {
        if (this.stateTimer <= 4) {
          this.animFrame = 0;
        } else if (this.stateTimer <= 13) {
          this.animFrame = 1;
          if (!this.activeHitbox) {
            const isCrouch = this.state.startsWith("CROUCH_");
            const isHeavy = this.state.includes("HEAVY") || this.state.includes("HK") || this.state.includes("HP");
            this.activeHitbox = new Box(36, isCrouch ? 48 : 22, 58, 28);
            this.currentAttackData = {
              damage: isHeavy ? 80 : 45,
              hitStun: isHeavy ? 24 : 14,
              blockStun: isHeavy ? 16 : 10,
              pushback: isHeavy ? 6 : 4,
              height: isCrouch ? ATTACK_HEIGHT.LOW : isHeavy ? ATTACK_HEIGHT.MID : ATTACK_HEIGHT.HIGH,
              hitType: isHeavy ? HIT_TYPE.HEAVY : HIT_TYPE.LIGHT
            };
          }
        } else if (this.stateTimer <= 19) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.activeHitbox = null;
          this.changeState(this.isCrouching ? FIGHTER_STATE.CROUCH : FIGHTER_STATE.IDLE);
        }
        return;
      }
      if (this.animTimer >= this.animSpeed) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % (frames ? frames.length : 1);
      }
    }
    canTurnAround() {
      return [
        FIGHTER_STATE.IDLE,
        FIGHTER_STATE.WALK_FWD,
        FIGHTER_STATE.WALK_BACK,
        FIGHTER_STATE.CROUCH
      ].includes(this.state);
    }
    addAfterImage() {
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      const img = frames[Math.min(this.animFrame, frames.length - 1)];
      if (img) {
        this.afterImages.push({
          x: this.x,
          y: this.y,
          facingRight: this.facingRight,
          img,
          alpha: 0.6
        });
      }
    }
    takeHit(attackData, fromDirection) {
      if (this.isInvincible || this.isDead) return false;
      const isHeavy = attackData.hitType === HIT_TYPE.HEAVY || attackData.hitType === HIT_TYPE.KNOCKDOWN;
      this.hitStop = isHeavy ? 4 : 2;
      const isUnblockable = attackData.height === ATTACK_HEIGHT.UNBLOCKABLE;
      const isHeavyStartup = (this.state === FIGHTER_STATE.ATTACK_HEAVY_PUNCH || this.state === FIGHTER_STATE.ATTACK_HEAVY_KICK || this.state === FIGHTER_STATE.CROUCH_HEAVY_PUNCH || this.state === FIGHTER_STATE.CROUCH_HEAVY_KICK) && this.animFrame <= 1;
      if (this.isRageMode && !this.armorDepleted && isHeavyStartup && !isUnblockable) {
        this.armorDepleted = true;
        soundFX.playBlock();
        this.health = Math.max(1, this.health - Math.floor(attackData.damage * 0.5));
        this.addSuper(attackData.damage * 0.12);
        this.armorFlash = 8;
        return "armored";
      }
      const canBlock = this.isGrounded && !this.isAttacking() && !isUnblockable && (this.isHoldingBack || this.state === FIGHTER_STATE.BLOCK || this.state === FIGHTER_STATE.CROUCH_BLOCK || this.state === FIGHTER_STATE.WALK_BACK);
      let blocked = false;
      if (canBlock) {
        const isCrouching2 = this.state === FIGHTER_STATE.CROUCH || this.state === FIGHTER_STATE.CROUCH_BLOCK || this.isCrouching;
        if (attackData.height === ATTACK_HEIGHT.HIGH) {
          blocked = true;
        } else if (attackData.height === ATTACK_HEIGHT.MID) {
          blocked = !isCrouching2;
        } else if (attackData.height === ATTACK_HEIGHT.LOW) {
          blocked = isCrouching2;
        }
      }
      if (blocked) {
        soundFX.playBlock();
        const chip = attackData.chipDamage || 0;
        this.health = Math.max(1, this.health - chip);
        this.consumeStamina(attackData.damage * 0.15, true);
        this.damageLimb(LIMB_ZONE.LEAD_ARM, attackData.damage * 0.18);
        this.blockStun = attackData.blockStun || 12;
        this.vx = (this.facingRight ? -1 : 1) * (attackData.pushback * 0.7);
        const isCrouching2 = this.state === FIGHTER_STATE.CROUCH || this.isCrouching;
        this.changeState(isCrouching2 ? FIGHTER_STATE.CROUCH_BLOCK : FIGHTER_STATE.BLOCK);
        return "blocked";
      }
      if (isHeavy) soundFX.playHitHeavy();
      else soundFX.playHitLight();
      this.health = Math.max(0, this.health - attackData.damage);
      this.addSuper(attackData.damage * 0.08);
      if (attackData.hitType === HIT_TYPE.BLEED_SLASH) {
        this.applyStatusEffect(STATUS_EFFECT.BLEED, 240);
      }
      if (attackData.height === ATTACK_HEIGHT.LOW) {
        this.damageLimb(LIMB_ZONE.LEAD_LEG, attackData.damage * 0.35);
      } else if (attackData.height === ATTACK_HEIGHT.MID) {
        this.damageLimb(LIMB_ZONE.TORSO, attackData.damage * 0.22);
        this.damageLimb(LIMB_ZONE.LEAD_ARM, attackData.damage * 0.15);
      } else if (attackData.height === ATTACK_HEIGHT.HIGH) {
        this.damageLimb(LIMB_ZONE.HEAD, attackData.damage * 0.3);
        this.damageLimb(LIMB_ZONE.LEAD_ARM, attackData.damage * 0.15);
      }
      if (this.health <= 0) {
        this.die();
        return "ko";
      }
      if (attackData.hitType === HIT_TYPE.DIRTY_STUN) {
        this.blindTimer = attackData.stunFrames || 65;
        this.vx = (this.facingRight ? -1 : 1) * 2.5;
        this.changeState(FIGHTER_STATE.BLIND_STUN);
        return "stun";
      }
      if (attackData.hitType === HIT_TYPE.KNOCKDOWN || !this.isGrounded) {
        soundFX.playKnockdown();
        this.isInvincible = true;
        this.knockdownTimer = 50;
        this.vx = (this.facingRight ? -1 : 1) * 6.5;
        this.vy = -7.5;
        this.isGrounded = false;
        this.changeState(FIGHTER_STATE.KNOCKDOWN);
        return "knockdown";
      }
      let stunVal = attackData.hitStun || 16;
      if (this.limbs.head <= 30) {
        stunVal += 3;
      }
      this.hitStun = stunVal;
      this.vx = (this.facingRight ? -1 : 1) * attackData.pushback;
      const isCrouching = this.state === FIGHTER_STATE.CROUCH || this.isCrouching;
      this.changeState(isCrouching ? FIGHTER_STATE.HIT_CROUCH : FIGHTER_STATE.HIT);
      return "hit";
    }
    addSuper(amount) {
      const mult = this.isRageMode ? 1.5 : 1;
      this.superMeter = Math.min(this.maxSuperMeter, this.superMeter + amount * mult);
      if (this.superMeter >= this.maxSuperMeter) {
        soundFX.playSuperReady();
      }
    }
    die() {
      this.isDead = true;
      soundFX.playAnnouncer("KO");
      this.vx = (this.facingRight ? -1 : 1) * 7.5;
      this.vy = -8.5;
      this.isGrounded = false;
      this.isInvincible = true;
      this.changeState(FIGHTER_STATE.KNOCKDOWN);
    }
    renderBattleDamage(ctx) {
      if (this.isDead) return;
      if (this.health <= this.maxHealth * 0.65) {
        ctx.save();
        ctx.fillStyle = "rgba(180, 40, 60, 0.75)";
        ctx.fillRect(44, 23, 6, 2);
        ctx.fillStyle = "rgba(100, 30, 90, 0.6)";
        ctx.fillRect(42, 19, 5, 3);
        ctx.strokeStyle = "rgba(220, 50, 50, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(32, 46);
        ctx.lineTo(44, 52);
        ctx.stroke();
        ctx.fillStyle = "rgba(120, 50, 40, 0.7)";
        ctx.fillRect(36, 72, 7, 3);
        ctx.restore();
      }
      if (this.health <= this.maxHealth * 0.35) {
        ctx.save();
        ctx.fillStyle = "rgba(50, 15, 70, 0.85)";
        ctx.fillRect(46, 17, 7, 5);
        ctx.fillStyle = "#b71c1c";
        ctx.fillRect(44, 26, 2, 5);
        ctx.fillStyle = "#e53935";
        ctx.fillRect(45, 29, 2, 3);
        ctx.strokeStyle = "#c62828";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(28, 38);
        ctx.lineTo(52, 48);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(34, 34);
        ctx.lineTo(46, 54);
        ctx.stroke();
        ctx.strokeStyle = "#b71c1c";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(34, 65);
        ctx.lineTo(48, 69);
        ctx.stroke();
        ctx.restore();
      }
    }
    render(ctx) {
      this.afterImages.forEach((ghost) => {
        ctx.save();
        ctx.globalAlpha = ghost.alpha;
        if (!ghost.facingRight) {
          ctx.translate(ghost.x + 80, ghost.y - 90);
          ctx.scale(-1, 1);
          ctx.drawImage(ghost.img, 0, 0);
        } else {
          ctx.drawImage(ghost.img, ghost.x, ghost.y - 90);
        }
        ctx.restore();
      });
      if (this.rageParticles.length > 0) {
        ctx.save();
        for (const p of this.rageParticles) {
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        ctx.restore();
      }
      if (this.sweatParticles.length > 0) {
        ctx.save();
        for (const s of this.sweatParticles) {
          ctx.globalAlpha = Math.max(0, s.alpha);
          ctx.fillStyle = "#67e8f9";
          ctx.fillRect(s.x, s.y, 2, 4);
        }
        ctx.restore();
      }
      if (this.tacticalParticles.length > 0) {
        ctx.save();
        for (const tp of this.tacticalParticles) {
          ctx.globalAlpha = Math.max(0, tp.alpha);
          ctx.fillStyle = tp.color;
          ctx.fillRect(tp.x, tp.y, tp.size, tp.size);
        }
        ctx.restore();
      }
      if (this.playerNum === 1 && !this.isDead && typeof EconomyManager !== "undefined") {
        const cos = EconomyManager.getEquippedCosmetics();
        if (cos && cos.aura && cos.aura !== "aura_none") {
          const auraDef = AURA_CATALOG.find((a) => a.id === cos.aura);
          if (auraDef && auraDef.color !== "transparent") {
            ctx.save();
            const t = Date.now() * 5e-3;
            ctx.globalAlpha = 0.55;
            ctx.fillStyle = auraDef.color;
            for (let i = 0; i < 5; i++) {
              const px2 = this.x + 36 + Math.sin(t + i * 1.4) * 24;
              const py = this.y - 12 - (t * 45 + i * 16) % 65;
              ctx.fillRect(px2, py, 2.5, 3.5);
            }
            ctx.restore();
          }
        }
      }
      const frames = this.sprites[this.state] || (this.state === FIGHTER_STATE.CROUCH_HEAVY_PUNCH ? this.sprites.CROUCH_LP : null) || (this.state === FIGHTER_STATE.DIRTY_TACTIC ? this.sprites.ATTACK_HP || this.sprites.IDLE : null) || (this.state === FIGHTER_STATE.BLIND_STUN ? this.sprites.HIT || this.sprites.IDLE : null) || (this.state === FIGHTER_STATE.WALL_REBOUND ? this.sprites.JUMP || this.sprites.IDLE : null) || this.sprites.IDLE || [];
      if (!frames || frames.length === 0) return;
      const currentImg = frames[Math.min(this.animFrame, frames.length - 1)];
      if (!currentImg) return;
      ctx.save();
      let drawY = this.y - 90;
      if (this.health <= this.maxHealth * 0.35 && this.state === FIGHTER_STATE.IDLE && !this.isDead) {
        drawY += Math.sin(Date.now() / 140) * 2;
      }
      if (!this.facingRight) {
        ctx.translate(this.x + 80, drawY);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(this.x, drawY);
      }
      if (this.armorFlash > 0) {
        ctx.filter = "brightness(2.5)";
      }
      ctx.drawImage(currentImg, 0, 0);
      ctx.filter = "none";
      this.renderBattleDamage(ctx);
      ctx.restore();
      if (this.state === FIGHTER_STATE.BLIND_STUN) {
        const starTime = Date.now() / 180;
        const headX = this.x + 40;
        const headY = this.y - 96;
        ctx.save();
        for (let i = 0; i < 3; i++) {
          const a = starTime + i * (Math.PI * 2 / 3);
          const sx = headX + Math.cos(a) * 20;
          const sy = headY + Math.sin(a) * 6;
          ctx.fillStyle = "#fde047";
          ctx.fillRect(sx - 3, sy - 1, 6, 2);
          ctx.fillRect(sx - 1, sy - 3, 2, 6);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(sx - 1, sy - 1, 2, 2);
        }
        ctx.restore();
      }
      ctx.save();
      ctx.fillStyle = this.team === 1 ? "rgba(56, 189, 248, 0.45)" : "rgba(244, 63, 94, 0.45)";
      ctx.beginPath();
      ctx.ellipse(this.x + 40, this.y, 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (this.heldPickup) {
        ctx.save();
        const pickX = this.facingRight ? this.x + 55 : this.x + 10;
        const pickY = this.y - 45;
        if (this.heldPickup === "bottle") {
          ctx.fillStyle = "#10b981";
          ctx.fillRect(pickX, pickY, 5, 12);
          ctx.fillStyle = "#6ee7b7";
          ctx.fillRect(pickX + 1, pickY - 4, 3, 4);
        } else if (this.heldPickup === "brick") {
          ctx.fillStyle = "#b91c1c";
          ctx.fillRect(pickX, pickY, 10, 7);
          ctx.fillStyle = "#dc2626";
          ctx.fillRect(pickX + 1, pickY + 1, 7, 4);
        } else if (this.heldPickup === "lumber") {
          ctx.fillStyle = "#78350f";
          ctx.fillRect(pickX - 4, pickY - 18, 7, 36);
          ctx.fillStyle = "#b45309";
          ctx.fillRect(pickX - 2, pickY - 16, 3, 32);
        }
        ctx.restore();
      }
    }
  };

  // src/fighters/Kazuki.js
  var Kazuki = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "kazuki",
        name: "KAZUKI"
      });
      this.spawnProjectile = null;
      this.ultimateTarget = null;
    }
    handleInput(inputState, inputManager, opponent) {
      if (this.hitStun > 0 || this.blockStun > 0 || this.state === FIGHTER_STATE.KNOCKDOWN) {
        return;
      }
      if (this.state === FIGHTER_STATE.SUBMISSION_LOCK) {
        if (inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputState.dirtyJust) {
          this.submissionStruggle = Math.min(100, (this.submissionStruggle || 0) + 14);
          soundFX.playWhoosh("light");
        }
        return;
      }
      const pNum = this.playerNum;
      if (this.heldPickup) {
        const wantsAttack = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputManager && (inputManager.peekAction(pNum) === "LP" || inputManager.peekAction(pNum) === "HP");
        if (wantsAttack && !this.isAttacking()) {
          if (inputManager) inputManager.consumeAction(pNum);
          this.executePickupAttack(this.heldPickup, opponent);
          return;
        }
      }
      this.isHoldingBack = !!inputState.back;
      this.isCrouching = !!inputState.down;
      const canSuper = this.superMeter >= 100 || inputManager.easyInputs;
      const wantsUltimate = inputState.ultimateJust || inputManager.peekAction(pNum) === "ULTIMATE";
      if (wantsUltimate && canSuper) {
        if (this.canCancelOnHit() || !this.isAttacking()) {
          inputManager.consumeBuffer(pNum);
          this.startUltimate(opponent);
          return;
        }
      }
      const wantsDirty = inputState.dirtyJust || inputManager.peekAction(pNum) === "DIRTY";
      if (wantsDirty && this.isGrounded && (!this.isAttacking() || this.canCancelOnHit())) {
        inputManager.consumeAction(pNum);
        this.startPocketSand();
        return;
      }
      if (!this.isGrounded) {
        if (this.state === FIGHTER_STATE.JUMP) {
          if (inputState.lpJust || inputState.hpJust || inputManager.peekAction(pNum) === "LP" || inputManager.peekAction(pNum) === "HP") {
            inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_PUNCH);
            soundFX.playWhoosh("light");
          } else if (inputState.lkJust || inputState.hkJust || inputManager.peekAction(pNum) === "LK" || inputManager.peekAction(pNum) === "HK") {
            inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_KICK);
            soundFX.playWhoosh("heavy");
          }
        }
        return;
      }
      if (this.isAttacking() && !this.canCancelOnHit()) {
        return;
      }
      const anyAttackJust = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust;
      const isDP = inputManager.checkDP(pNum) && anyAttackJust || inputState.sp2Just || inputManager.peekAction(pNum) === "SP2";
      if (isDP) {
        inputManager.consumeBuffer(pNum);
        this.startShoryuken();
        return;
      }
      const isQCF = inputManager.checkQCF(pNum) && anyAttackJust || inputState.sp1Just || inputManager.peekAction(pNum) === "SP1";
      if (isQCF) {
        inputManager.consumeBuffer(pNum);
        this.startHadouken();
        return;
      }
      const isQCB = inputManager.checkQCB(pNum) && anyAttackJust || inputState.sp3Just || inputManager.peekAction(pNum) === "SP3";
      if (isQCB) {
        inputManager.consumeBuffer(pNum);
        this.startTatsumaki();
        return;
      }
      if (!this.isAttacking()) {
        if (inputState.dashFwd) {
          this.startDash(true);
          return;
        }
        if (inputState.dashBack) {
          this.startDash(false);
          return;
        }
      }
      const lpTrigger = inputState.lpJust || inputManager.peekAction(pNum) === "LP";
      const hpTrigger = inputState.hpJust || inputManager.peekAction(pNum) === "HP";
      const lkTrigger = inputState.lkJust || inputManager.peekAction(pNum) === "LK";
      const hkTrigger = inputState.hkJust || inputManager.peekAction(pNum) === "HK";
      if (inputState.down) {
        if (lpTrigger) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_PUNCH, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hpTrigger) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_PUNCH, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (lkTrigger) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_KICK, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hkTrigger) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_KICK, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (!this.isAttacking()) {
          this.changeState(FIGHTER_STATE.CROUCH);
        }
        return;
      }
      if (lpTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_PUNCH, true);
        soundFX.playWhoosh("light");
        return;
      }
      if (hpTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (lkTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_KICK, true);
        soundFX.playWhoosh("light");
        return;
      }
      if (hkTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_KICK, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (this.isAttacking() || this.state === FIGHTER_STATE.DASH_FWD || this.state === FIGHTER_STATE.DASH_BACK) {
        return;
      }
      if (inputState.up) {
        this.vy = this.jumpForce;
        this.isGrounded = false;
        this.changeState(FIGHTER_STATE.JUMP);
        if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 3.8;
        else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 3.8;
        return;
      }
      if (inputState.fwd) {
        this.vx = (this.facingRight ? 1 : -1) * this.walkSpeed;
        this.changeState(FIGHTER_STATE.WALK_FWD);
      } else if (inputState.back) {
        this.vx = (this.facingRight ? -1 : 1) * (this.walkSpeed * 0.75);
        this.changeState(FIGHTER_STATE.WALK_BACK);
      } else {
        this.changeState(FIGHTER_STATE.IDLE);
      }
    }
    startHadouken() {
      if (!this.canFireProjectile(10)) return;
      this.onFireProjectile(10, 18);
      this.changeState(FIGHTER_STATE.SPECIAL_1);
      soundFX.playHadouken();
    }
    startShoryuken() {
      this.changeState(FIGHTER_STATE.SPECIAL_2);
      soundFX.playShoryuken();
      this.isInvincible = true;
      this.isGrounded = false;
      this.vy = -12.5;
      this.vx = (this.facingRight ? 1 : -1) * 3.8;
    }
    startTatsumaki() {
      this.changeState(FIGHTER_STATE.SPECIAL_3);
      soundFX.playWhoosh("heavy");
      this.isGrounded = false;
      this.vy = -3;
      this.vx = (this.facingRight ? 1 : -1) * 5.2;
    }
    // Dirty Tactic: Pocket Gravel / Sand Toss
    startPocketSand() {
      this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
      soundFX.playPocketSand();
      const originX = this.facingRight ? this.x + 50 : this.x + 10;
      for (let i = 0; i < 22; i++) {
        this.tacticalParticles.push({
          x: originX,
          y: this.y - 65 + (Math.random() - 0.5) * 18,
          vx: (this.facingRight ? 1 : -1) * (4.5 + Math.random() * 5.5),
          vy: (Math.random() - 0.5) * 3.5,
          size: 2 + Math.random() * 3,
          alpha: 1,
          color: Math.random() < 0.6 ? "#d97706" : Math.random() < 0.5 ? "#b45309" : "#fef3c7"
        });
      }
    }
    // Naruto-Style Ultimate Jutsu: DRAGON GOD ROAR (竜神轟天破)
    startUltimate(opponent) {
      this.superMeter = 0;
      this.changeState(FIGHTER_STATE.ULTIMATE);
      this.ultimateTarget = opponent;
      this.isInvincible = true;
      soundFX.playUltimateActivation();
      window.dispatchEvent(new CustomEvent("ultimate-activated", {
        detail: {
          fighter: this,
          name: "DRAGON GOD OUGI: RYUJIN GOTENHA",
          kanji: "\u7ADC\u795E\u8F5F\u5929\u7834",
          subtitle: "SECRET TECHNIQUE // DRAGON GOD ROAR"
        }
      }));
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      switch (this.state) {
        case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 7) {
            this.animFrame = 1;
            this.activeHitbox = new Box(40, 24, 56, 18);
            this.currentAttackData = {
              damage: 40,
              hitStun: 14,
              blockStun: 10,
              pushback: 4,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.LIGHT
            };
          } else if (this.stateTimer <= 11) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 9) this.animFrame = 1;
          else if (this.stateTimer <= 15) {
            this.animFrame = 2;
            this.activeHitbox = new Box(38, 20, 75, 24);
            this.currentAttackData = {
              damage: 95,
              hitStun: 22,
              blockStun: 16,
              pushback: 7,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.HEAVY
            };
          } else if (this.stateTimer <= 20) {
            this.animFrame = 3;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ATTACK_LIGHT_KICK:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 7) {
            this.animFrame = 1;
            this.activeHitbox = new Box(40, 44, 58, 20);
            this.currentAttackData = {
              damage: 45,
              hitStun: 14,
              blockStun: 10,
              pushback: 4,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.LIGHT
            };
          } else if (this.stateTimer <= 12) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_KICK:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 10) this.animFrame = 1;
          else if (this.stateTimer <= 15) {
            this.animFrame = 2;
            this.activeHitbox = new Box(38, 14, 78, 28);
            this.currentAttackData = {
              damage: 105,
              hitStun: 24,
              blockStun: 16,
              pushback: 8,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.HEAVY
            };
          } else if (this.stateTimer <= 22) {
            this.animFrame = 3;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.CROUCH_LIGHT_PUNCH:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 7) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 38, 54, 18);
            this.currentAttackData = {
              damage: 35,
              hitStun: 12,
              blockStun: 9,
              pushback: 3,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.LIGHT
            };
          } else if (this.stateTimer <= 11) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.CROUCH);
          }
          break;
        case FIGHTER_STATE.CROUCH_HEAVY_PUNCH:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 13) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 16, 62, 36);
            this.currentAttackData = {
              damage: 90,
              hitStun: 24,
              blockStun: 14,
              pushback: 6,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.KNOCKDOWN
            };
          } else if (this.stateTimer <= 20) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.CROUCH);
          }
          break;
        case FIGHTER_STATE.CROUCH_LIGHT_KICK:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 7) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 58, 56, 18);
            this.currentAttackData = {
              damage: 38,
              hitStun: 12,
              blockStun: 9,
              pushback: 4,
              height: ATTACK_HEIGHT.LOW,
              hitType: HIT_TYPE.LIGHT
            };
          } else if (this.stateTimer <= 11) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.CROUCH);
          }
          break;
        case FIGHTER_STATE.CROUCH_HEAVY_KICK:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 11) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 56, 88, 24);
            this.currentAttackData = {
              damage: 85,
              hitStun: 28,
              blockStun: 14,
              pushback: 6,
              height: ATTACK_HEIGHT.LOW,
              hitType: HIT_TYPE.KNOCKDOWN
            };
          } else if (this.stateTimer <= 20) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.CROUCH);
          }
          break;
        case FIGHTER_STATE.JUMP_PUNCH:
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 32, 58, 30);
          this.currentAttackData = {
            damage: 75,
            hitStun: 18,
            blockStun: 14,
            pushback: 4,
            height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.HEAVY
          };
          break;
        case FIGHTER_STATE.JUMP_KICK:
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 38, 65, 26);
          this.currentAttackData = {
            damage: 85,
            hitStun: 20,
            blockStun: 16,
            pushback: 5,
            height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.HEAVY
          };
          break;
        case FIGHTER_STATE.SPECIAL_1:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 10) this.animFrame = 1;
          else if (this.stateTimer <= 16) {
            this.animFrame = 2;
            if (this.stateTimer === 11 && this.spawnProjectile) {
              const pX = this.facingRight ? this.x + 65 : this.x - 20;
              this.spawnProjectile(new Projectile({
                owner: this,
                type: "hadouken",
                x: pX,
                y: this.y - 60,
                vx: (this.facingRight ? 1 : -1) * 9.5,
                damage: 88
              }));
            }
          } else if (this.stateTimer <= 25) {
            this.animFrame = 3;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.SPECIAL_2:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 8) {
            this.animFrame = 1;
            this.activeHitbox = new Box(28, -15, 70, 60);
            this.currentAttackData = {
              damage: 130,
              hitStun: 30,
              blockStun: 18,
              pushback: 6,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.KNOCKDOWN,
              chipDamage: 15
            };
          } else if (this.stateTimer <= 15) {
            this.animFrame = 2;
            this.activeHitbox = new Box(28, -25, 70, 60);
          } else if (this.stateTimer <= 22) {
            this.animFrame = 3;
            this.activeHitbox = null;
            this.isInvincible = false;
          } else if (this.stateTimer <= 32) {
            this.animFrame = 4;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.SPECIAL_3:
          this.animFrame = Math.floor(this.stateTimer / 4) % 4;
          this.activeHitbox = new Box(10, 26, 85, 26);
          this.currentAttackData = {
            damage: 40,
            hitStun: 16,
            blockStun: 12,
            pushback: 4,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.LIGHT
          };
          if (this.stateTimer === 12) {
            this.hasHitThisAttack = false;
          }
          if (this.stateTimer > 26) {
            this.activeHitbox = null;
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        // ==========================================
        // NARUTO-STYLE CINEMATIC ULTIMATE: RYUJIN GOTENHA
        // ==========================================
        case FIGHTER_STATE.ULTIMATE:
          if (this.stateTimer <= 20) {
            this.animFrame = 0;
            this.vx = 0;
            this.addAfterImage();
          } else if (this.stateTimer <= 36) {
            this.animFrame = 1;
            this.vx = (this.facingRight ? 1 : -1) * 13.5;
            this.addAfterImage();
            this.activeHitbox = new Box(40, 20, 48, 40);
            this.currentAttackData = {
              damage: 340,
              hitStun: 60,
              blockStun: 25,
              pushback: 10,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.KNOCKDOWN,
              chipDamage: 50
            };
          } else if (this.stateTimer <= 65) {
            this.animFrame = 2;
            this.activeHitbox = null;
            this.vx *= 0.85;
            if (this.stateTimer === 38) {
              soundFX.playUltimateFinisher();
            }
          } else if (this.stateTimer <= 85) {
            this.animFrame = 3;
            this.isInvincible = false;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.DIRTY_TACTIC:
          if (this.stateTimer <= 6) {
            this.animFrame = 0;
          } else if (this.stateTimer <= 15) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 18, 72, 40);
            this.currentAttackData = {
              damage: 50,
              hitStun: 70,
              blockStun: 20,
              pushback: 4,
              height: ATTACK_HEIGHT.UNBLOCKABLE,
              hitType: HIT_TYPE.DIRTY_STUN,
              stunFrames: 70
            };
          } else if (this.stateTimer <= 25) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        default:
          if (this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % frames.length;
          }
          break;
      }
    }
  };

  // src/fighters/Raven.js
  var Raven = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "raven",
        name: "RAVEN"
      });
      this.walkSpeed = 3.4;
      this.dashSpeed = 7.5;
      this.jumpForce = -13;
      this.spawnProjectile = null;
      this.ultimateTarget = null;
    }
    handleInput(inputState, inputManager, opponent) {
      if (this.hitStun > 0 || this.blockStun > 0 || this.state === FIGHTER_STATE.KNOCKDOWN) {
        return;
      }
      if (this.state === FIGHTER_STATE.SUBMISSION_LOCK) {
        if (inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputState.dirtyJust) {
          this.submissionStruggle = Math.min(100, (this.submissionStruggle || 0) + 14);
          soundFX.playWhoosh("light");
        }
        return;
      }
      const pNum = this.playerNum;
      if (this.heldPickup) {
        const wantsAttack = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputManager && (inputManager.peekAction(pNum) === "LP" || inputManager.peekAction(pNum) === "HP");
        if (wantsAttack && !this.isAttacking()) {
          if (inputManager) inputManager.consumeAction(pNum);
          this.executePickupAttack(this.heldPickup, opponent);
          return;
        }
      }
      this.isHoldingBack = !!inputState.back;
      this.isCrouching = !!inputState.down;
      const canSuper = this.superMeter >= 100 || inputManager.easyInputs;
      const wantsUltimate = inputState.ultimateJust || inputManager.peekAction(pNum) === "ULTIMATE";
      if (wantsUltimate && canSuper) {
        if (this.canCancelOnHit() || !this.isAttacking()) {
          inputManager.consumeBuffer(pNum);
          this.startUltimate(opponent);
          return;
        }
      }
      const wantsDirty = inputState.dirtyJust || inputManager.peekAction(pNum) === "DIRTY";
      if (wantsDirty && this.isGrounded && (!this.isAttacking() || this.canCancelOnHit())) {
        inputManager.consumeAction(pNum);
        this.startTaserShock();
        return;
      }
      if (!this.isGrounded) {
        if (this.state === FIGHTER_STATE.JUMP) {
          if (inputState.lpJust || inputState.hpJust || inputManager.peekAction(pNum) === "LP" || inputManager.peekAction(pNum) === "HP") {
            inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_PUNCH);
            soundFX.playWhoosh("light");
          } else if (inputState.lkJust || inputState.hkJust || inputManager.peekAction(pNum) === "LK" || inputManager.peekAction(pNum) === "HK") {
            inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_KICK);
            soundFX.playWhoosh("heavy");
          }
        }
        return;
      }
      if (this.isAttacking() && !this.canCancelOnHit()) {
        return;
      }
      const anyAttackJust = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust;
      const isSomersault = (inputManager.checkChargeDownUp(pNum) || inputManager.checkDP(pNum)) && anyAttackJust || inputState.sp2Just || inputManager.peekAction(pNum) === "SP2";
      if (isSomersault) {
        inputManager.consumeBuffer(pNum);
        this.startFlashKick();
        return;
      }
      const isSonicBlade = (inputManager.checkChargeBackFwd(pNum) || inputManager.checkQCF(pNum)) && anyAttackJust || inputState.sp1Just || inputManager.peekAction(pNum) === "SP1";
      if (isSonicBlade) {
        inputManager.consumeBuffer(pNum);
        this.startSonicBlade();
        return;
      }
      const isBlitz = inputManager.checkQCB(pNum) && anyAttackJust || inputState.sp3Just || inputManager.peekAction(pNum) === "SP3";
      if (isBlitz) {
        inputManager.consumeBuffer(pNum);
        this.startBlitzKnuckle();
        return;
      }
      if (!this.isAttacking()) {
        if (inputState.dashFwd) {
          this.startDash(true);
          return;
        }
        if (inputState.dashBack) {
          this.startDash(false);
          return;
        }
      }
      const lpTrigger = inputState.lpJust || inputManager.peekAction(pNum) === "LP";
      const hpTrigger = inputState.hpJust || inputManager.peekAction(pNum) === "HP";
      const lkTrigger = inputState.lkJust || inputManager.peekAction(pNum) === "LK";
      const hkTrigger = inputState.hkJust || inputManager.peekAction(pNum) === "HK";
      if (inputState.down) {
        if (lpTrigger) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_PUNCH, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hpTrigger) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_PUNCH, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (lkTrigger) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_KICK, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hkTrigger) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_KICK, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (!this.isAttacking()) {
          this.changeState(FIGHTER_STATE.CROUCH);
        }
        return;
      }
      if (lpTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_PUNCH, true);
        soundFX.playWhoosh("light");
        return;
      }
      if (hpTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (lkTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_KICK, true);
        soundFX.playWhoosh("light");
        return;
      }
      if (hkTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_KICK, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (this.isAttacking() || this.state === FIGHTER_STATE.DASH_FWD || this.state === FIGHTER_STATE.DASH_BACK) {
        return;
      }
      if (inputState.up) {
        this.vy = this.jumpForce;
        this.isGrounded = false;
        this.changeState(FIGHTER_STATE.JUMP);
        if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 3.5;
        else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 3.5;
        return;
      }
      if (inputState.fwd) {
        this.vx = (this.facingRight ? 1 : -1) * this.walkSpeed;
        this.changeState(FIGHTER_STATE.WALK_FWD);
      } else if (inputState.back) {
        this.vx = (this.facingRight ? -1 : 1) * (this.walkSpeed * 0.75);
        this.changeState(FIGHTER_STATE.WALK_BACK);
      } else {
        this.changeState(FIGHTER_STATE.IDLE);
      }
    }
    startSonicBlade() {
      if (!this.canFireProjectile(10)) return;
      this.onFireProjectile(10, 18);
      this.changeState(FIGHTER_STATE.SPECIAL_1);
      soundFX.playSonicBlade();
    }
    startFlashKick() {
      this.changeState(FIGHTER_STATE.SPECIAL_2);
      soundFX.playFlashKick();
      this.isInvincible = true;
      this.isGrounded = false;
      this.vy = -12.5;
      this.vx = (this.facingRight ? 1 : -1) * 1.6;
    }
    startBlitzKnuckle() {
      this.changeState(FIGHTER_STATE.SPECIAL_3);
      soundFX.playWhoosh("heavy");
      this.vx = (this.facingRight ? 1 : -1) * 8;
    }
    // Dirty Tactic: Concealed Taser Shock
    startTaserShock() {
      this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
      soundFX.playTaserShock();
      const originX = this.facingRight ? this.x + 52 : this.x + 8;
      for (let i = 0; i < 18; i++) {
        this.tacticalParticles.push({
          x: originX + (Math.random() - 0.5) * 10,
          y: this.y - 50 + (Math.random() - 0.5) * 16,
          vx: (this.facingRight ? 1 : -1) * (3 + Math.random() * 4),
          vy: (Math.random() - 0.5) * 3,
          size: 2 + Math.random() * 3,
          alpha: 1,
          color: Math.random() < 0.7 ? "#38bdf8" : "#ffffff"
        });
      }
    }
    // Naruto-Style Ultimate Jutsu: TACTICAL OVERDRIVE (超戦術・雷光撃)
    startUltimate(opponent) {
      this.superMeter = 0;
      this.changeState(FIGHTER_STATE.ULTIMATE);
      this.ultimateTarget = opponent;
      this.isInvincible = true;
      soundFX.playUltimateActivation();
      window.dispatchEvent(new CustomEvent("ultimate-activated", {
        detail: {
          fighter: this,
          name: "TACTICAL OVERDRIVE: APEX STRIKE",
          kanji: "\u8D85\u6226\u8853\u30FB\u96F7\u5149\u6483",
          subtitle: "SECRET TECHNIQUE // APEX BOMBARDMENT"
        }
      }));
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      switch (this.state) {
        case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 7) {
            this.animFrame = 1;
            this.activeHitbox = new Box(40, 24, 56, 18);
            this.currentAttackData = {
              damage: 42,
              hitStun: 14,
              blockStun: 10,
              pushback: 4,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.LIGHT
            };
          } else if (this.stateTimer <= 11) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 9) this.animFrame = 1;
          else if (this.stateTimer <= 15) {
            this.animFrame = 2;
            this.activeHitbox = new Box(38, 20, 75, 24);
            this.currentAttackData = {
              damage: 100,
              hitStun: 22,
              blockStun: 16,
              pushback: 8,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.HEAVY
            };
          } else if (this.stateTimer <= 21) {
            this.animFrame = 3;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ATTACK_LIGHT_KICK:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 7) {
            this.animFrame = 1;
            this.activeHitbox = new Box(40, 44, 58, 20);
            this.currentAttackData = {
              damage: 42,
              hitStun: 14,
              blockStun: 10,
              pushback: 4,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.LIGHT
            };
          } else if (this.stateTimer <= 11) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_KICK:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 10) this.animFrame = 1;
          else if (this.stateTimer <= 15) {
            this.animFrame = 2;
            this.activeHitbox = new Box(38, 14, 78, 28);
            this.currentAttackData = {
              damage: 110,
              hitStun: 24,
              blockStun: 16,
              pushback: 8,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.HEAVY
            };
          } else if (this.stateTimer <= 22) {
            this.animFrame = 3;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.CROUCH_LIGHT_PUNCH:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 7) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 38, 54, 18);
            this.currentAttackData = {
              damage: 38,
              hitStun: 12,
              blockStun: 9,
              pushback: 3,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.LIGHT
            };
          } else if (this.stateTimer <= 11) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.CROUCH);
          }
          break;
        case FIGHTER_STATE.CROUCH_HEAVY_PUNCH:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 13) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 16, 62, 36);
            this.currentAttackData = {
              damage: 95,
              hitStun: 24,
              blockStun: 14,
              pushback: 7,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.KNOCKDOWN
            };
          } else if (this.stateTimer <= 20) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.CROUCH);
          }
          break;
        case FIGHTER_STATE.CROUCH_LIGHT_KICK:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 7) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 58, 56, 18);
            this.currentAttackData = {
              damage: 40,
              hitStun: 12,
              blockStun: 9,
              pushback: 4,
              height: ATTACK_HEIGHT.LOW,
              hitType: HIT_TYPE.LIGHT
            };
          } else if (this.stateTimer <= 11) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.CROUCH);
          }
          break;
        case FIGHTER_STATE.CROUCH_HEAVY_KICK:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 11) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 56, 88, 24);
            this.currentAttackData = {
              damage: 90,
              hitStun: 28,
              blockStun: 14,
              pushback: 6,
              height: ATTACK_HEIGHT.LOW,
              hitType: HIT_TYPE.KNOCKDOWN
            };
          } else if (this.stateTimer <= 21) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.CROUCH);
          }
          break;
        case FIGHTER_STATE.JUMP_PUNCH:
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 32, 58, 30);
          this.currentAttackData = {
            damage: 80,
            hitStun: 18,
            blockStun: 14,
            pushback: 4,
            height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.HEAVY
          };
          break;
        case FIGHTER_STATE.JUMP_KICK:
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 38, 65, 26);
          this.currentAttackData = {
            damage: 90,
            hitStun: 20,
            blockStun: 16,
            pushback: 5,
            height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.HEAVY
          };
          break;
        case FIGHTER_STATE.SPECIAL_1:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 10) this.animFrame = 1;
          else if (this.stateTimer <= 16) {
            this.animFrame = 2;
            if (this.stateTimer === 11 && this.spawnProjectile) {
              const pX = this.facingRight ? this.x + 65 : this.x - 20;
              this.spawnProjectile(new Projectile({
                owner: this,
                type: "sonic_blade",
                x: pX,
                y: this.y - 58,
                vx: (this.facingRight ? 1 : -1) * 10.2,
                damage: 92
              }));
            }
          } else if (this.stateTimer <= 25) {
            this.animFrame = 3;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.SPECIAL_2:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 8) {
            this.animFrame = 1;
            this.activeHitbox = new Box(20, -18, 72, 62);
            this.currentAttackData = {
              damage: 135,
              hitStun: 30,
              blockStun: 18,
              pushback: 6,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.KNOCKDOWN,
              chipDamage: 18
            };
          } else if (this.stateTimer <= 14) {
            this.animFrame = 2;
            this.activeHitbox = new Box(20, -26, 72, 62);
          } else if (this.stateTimer <= 22) {
            this.animFrame = 3;
            this.activeHitbox = null;
            this.isInvincible = false;
          } else if (this.stateTimer <= 32) {
            this.animFrame = 4;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.SPECIAL_3:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 16) {
            this.animFrame = 2;
            this.activeHitbox = new Box(35, 20, 80, 30);
            this.currentAttackData = {
              damage: 105,
              hitStun: 24,
              blockStun: 14,
              pushback: 8,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.KNOCKDOWN
            };
          } else if (this.stateTimer <= 23) {
            this.animFrame = 3;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        // ==========================================
        // NARUTO-STYLE CINEMATIC ULTIMATE: APEX STRIKE
        // ==========================================
        case FIGHTER_STATE.ULTIMATE:
          if (this.stateTimer <= 20) {
            this.animFrame = 0;
            this.vx = 0;
            this.addAfterImage();
          } else if (this.stateTimer <= 36) {
            this.animFrame = 1;
            this.vx = (this.facingRight ? 1 : -1) * 14;
            this.addAfterImage();
            this.activeHitbox = new Box(40, 16, 50, 44);
            this.currentAttackData = {
              damage: 350,
              hitStun: 60,
              blockStun: 25,
              pushback: 10,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.KNOCKDOWN,
              chipDamage: 50
            };
          } else if (this.stateTimer <= 65) {
            this.animFrame = 2;
            this.activeHitbox = null;
            this.vx *= 0.85;
            if (this.stateTimer === 38) {
              soundFX.playUltimateFinisher();
            }
          } else if (this.stateTimer <= 85) {
            this.animFrame = 3;
            this.isInvincible = false;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.DIRTY_TACTIC:
          if (this.stateTimer <= 5) {
            this.animFrame = 0;
          } else if (this.stateTimer <= 15) {
            this.animFrame = 1;
            this.activeHitbox = new Box(40, 22, 65, 35);
            this.currentAttackData = {
              damage: 55,
              hitStun: 60,
              blockStun: 18,
              pushback: 4,
              height: ATTACK_HEIGHT.UNBLOCKABLE,
              hitType: HIT_TYPE.DIRTY_STUN,
              stunFrames: 60
            };
          } else if (this.stateTimer <= 24) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        default:
          if (this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % frames.length;
          }
          break;
      }
    }
  };

  // src/fighters/Kagura.js
  var Kagura = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "kagura",
        name: "KAGURA"
      });
      this.walkSpeed = 4.2;
      this.dashSpeed = 9.2;
      this.jumpForce = -14;
      this.spawnProjectile = null;
      this.ultimateTarget = null;
    }
    handleInput(inputState, inputManager, opponent) {
      if (this.hitStun > 0 || this.blockStun > 0 || this.state === FIGHTER_STATE.KNOCKDOWN) {
        return;
      }
      if (this.state === FIGHTER_STATE.SUBMISSION_LOCK) {
        if (inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputState.dirtyJust) {
          this.submissionStruggle = Math.min(100, (this.submissionStruggle || 0) + 14);
          soundFX.playWhoosh("light");
        }
        return;
      }
      const pNum = this.playerNum;
      if (this.heldPickup) {
        const wantsAttack = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputManager && (inputManager.peekAction(pNum) === "LP" || inputManager.peekAction(pNum) === "HP");
        if (wantsAttack && !this.isAttacking()) {
          if (inputManager) inputManager.consumeAction(pNum);
          this.executePickupAttack(this.heldPickup, opponent);
          return;
        }
      }
      this.isHoldingBack = !!inputState.back;
      this.isCrouching = !!inputState.down;
      const canSuper = this.superMeter >= 100 || inputManager.easyInputs;
      const wantsUltimate = inputState.ultimateJust || inputManager.peekAction(pNum) === "ULTIMATE";
      if (wantsUltimate && canSuper) {
        if (this.canCancelOnHit() || !this.isAttacking()) {
          inputManager.consumeBuffer(pNum);
          this.startUltimate(opponent);
          return;
        }
      }
      const wantsDirty = inputState.dirtyJust || inputManager.peekAction(pNum) === "DIRTY";
      if (wantsDirty && this.isGrounded && (!this.isAttacking() || this.canCancelOnHit())) {
        inputManager.consumeAction(pNum);
        this.startCaltrops();
        return;
      }
      if (!this.isGrounded) {
        if (this.state === FIGHTER_STATE.JUMP) {
          if (inputState.lpJust || inputState.hpJust || inputManager.peekAction(pNum) === "LP" || inputManager.peekAction(pNum) === "HP") {
            inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_PUNCH);
            soundFX.playWhoosh("light");
          } else if (inputState.lkJust || inputState.hkJust || inputManager.peekAction(pNum) === "LK" || inputManager.peekAction(pNum) === "HK") {
            inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_KICK);
            soundFX.playWhoosh("heavy");
          }
        }
        return;
      }
      if (this.isAttacking() && !this.canCancelOnHit()) {
        return;
      }
      const anyPunchJust = inputState.lpJust || inputState.hpJust;
      const anyKickJust = inputState.lkJust || inputState.hkJust;
      const isCrescent = (inputManager.checkDP(pNum) || inputManager.checkQCF(pNum)) && anyKickJust || inputState.sp2Just || inputManager.peekAction(pNum) === "SP2";
      if (isCrescent) {
        inputManager.consumeBuffer(pNum);
        this.startCrescentGale();
        return;
      }
      const isWarp = inputManager.checkQCB(pNum) && (anyPunchJust || anyKickJust) || inputState.sp1Just || inputManager.peekAction(pNum) === "SP1";
      if (isWarp) {
        inputManager.consumeBuffer(pNum);
        this.startShadowWarp(opponent);
        return;
      }
      const isKunai = inputManager.checkQCF(pNum) && anyPunchJust || inputState.sp3Just || inputManager.peekAction(pNum) === "SP3";
      if (isKunai) {
        inputManager.consumeBuffer(pNum);
        this.startKunai();
        return;
      }
      if (!this.isAttacking()) {
        if (inputState.dashFwd) {
          this.startDash(true);
          return;
        }
        if (inputState.dashBack) {
          this.startDash(false);
          return;
        }
      }
      const lpTrigger = inputState.lpJust || inputManager.peekAction(pNum) === "LP";
      const hpTrigger = inputState.hpJust || inputManager.peekAction(pNum) === "HP";
      const lkTrigger = inputState.lkJust || inputManager.peekAction(pNum) === "LK";
      const hkTrigger = inputState.hkJust || inputManager.peekAction(pNum) === "HK";
      if (inputState.down) {
        if (lpTrigger) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_PUNCH, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hpTrigger) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_PUNCH, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (lkTrigger) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_KICK, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hkTrigger) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_KICK, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (!this.isAttacking()) {
          this.changeState(FIGHTER_STATE.CROUCH);
        }
        return;
      }
      if (lpTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_PUNCH, true);
        soundFX.playWhoosh("light");
        return;
      }
      if (hpTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (lkTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_KICK, true);
        soundFX.playWhoosh("light");
        return;
      }
      if (hkTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_KICK, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (this.isAttacking() || this.state === FIGHTER_STATE.DASH_FWD || this.state === FIGHTER_STATE.DASH_BACK) {
        return;
      }
      if (inputState.up) {
        this.vy = this.jumpForce;
        this.isGrounded = false;
        this.changeState(FIGHTER_STATE.JUMP);
        if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 4.4;
        else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 4.4;
        return;
      }
      if (inputState.fwd) {
        this.vx = (this.facingRight ? 1 : -1) * this.walkSpeed;
        this.changeState(FIGHTER_STATE.WALK_FWD);
      } else if (inputState.back) {
        this.vx = (this.facingRight ? -1 : 1) * (this.walkSpeed * 0.8);
        this.changeState(FIGHTER_STATE.WALK_BACK);
      } else {
        this.changeState(FIGHTER_STATE.IDLE);
      }
    }
    startShadowWarp(opponent) {
      this.changeState(FIGHTER_STATE.SPECIAL_1);
      soundFX.playShadowWarp();
      this.isInvincible = true;
      setTimeout(() => {
        if (opponent) {
          this.x = opponent.facingRight ? opponent.x - 70 : opponent.x + 70;
          this.facingRight = this.x < opponent.x;
        }
        this.isInvincible = false;
      }, 160);
    }
    startCrescentGale() {
      this.changeState(FIGHTER_STATE.SPECIAL_2);
      soundFX.playFlashKick();
      this.isInvincible = true;
      this.isGrounded = false;
      this.vy = -13;
      this.vx = (this.facingRight ? 1 : -1) * 3.4;
    }
    startKunai() {
      if (!this.canFireProjectile(10)) return;
      this.onFireProjectile(10, 18);
      this.changeState(FIGHTER_STATE.SPECIAL_3);
      soundFX.playWhoosh("light");
    }
    // Dirty Tactic: Caltrops & Smoke Powder
    startCaltrops() {
      this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
      soundFX.playCaltrops();
      const originX = this.facingRight ? this.x + 40 : this.x + 10;
      for (let i = 0; i < 12; i++) {
        this.tacticalParticles.push({
          x: originX + (this.facingRight ? i * 6 : -i * 6),
          y: this.y - 10 + (Math.random() - 0.5) * 6,
          vx: (this.facingRight ? 1 : -1) * (2 + Math.random() * 3.5),
          vy: -Math.random() * 2.5,
          size: 3,
          alpha: 1,
          color: "#94a3b8"
        });
      }
      for (let i = 0; i < 16; i++) {
        this.tacticalParticles.push({
          x: originX + (Math.random() - 0.5) * 20,
          y: this.y - 25 + (Math.random() - 0.5) * 15,
          vx: (Math.random() - 0.5) * 2.5,
          vy: -(1 + Math.random() * 2),
          size: 4 + Math.random() * 6,
          alpha: 0.8,
          color: Math.random() < 0.5 ? "#cbd5e1" : "#64748b"
        });
      }
    }
    // Naruto-Style Shadow Clone Ultimate Jutsu (影分身・千夜蓮華)
    startUltimate(opponent) {
      this.superMeter = 0;
      this.changeState(FIGHTER_STATE.ULTIMATE);
      this.ultimateTarget = opponent;
      this.isInvincible = true;
      soundFX.playClonePoof();
      soundFX.playUltimateActivation();
      window.dispatchEvent(new CustomEvent("ultimate-activated", {
        detail: {
          fighter: this,
          name: "SHADOW OUGI: THOUSAND NIGHTFALL CLONES",
          kanji: "\u5F71\u5206\u8EAB\u30FB\u5343\u591C\u84EE\u83EF",
          subtitle: "SECRET TECHNIQUE // SHADOW CLONE LOTUS"
        }
      }));
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      switch (this.state) {
        case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 6) {
            this.animFrame = 1;
            this.activeHitbox = new Box(40, 24, 56, 18);
            this.currentAttackData = {
              damage: 38,
              hitStun: 13,
              blockStun: 9,
              pushback: 4,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.LIGHT
            };
          } else if (this.stateTimer <= 10) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 8) this.animFrame = 1;
          else if (this.stateTimer <= 14) {
            this.animFrame = 2;
            this.activeHitbox = new Box(38, 20, 75, 24);
            this.currentAttackData = {
              damage: 92,
              hitStun: 22,
              blockStun: 15,
              pushback: 7,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.HEAVY
            };
          } else if (this.stateTimer <= 20) {
            this.animFrame = 3;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ATTACK_LIGHT_KICK:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 6) {
            this.animFrame = 1;
            this.activeHitbox = new Box(40, 44, 58, 20);
            this.currentAttackData = {
              damage: 40,
              hitStun: 13,
              blockStun: 9,
              pushback: 4,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.LIGHT
            };
          } else if (this.stateTimer <= 10) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_KICK:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 9) this.animFrame = 1;
          else if (this.stateTimer <= 14) {
            this.animFrame = 2;
            this.activeHitbox = new Box(38, 14, 78, 28);
            this.currentAttackData = {
              damage: 100,
              hitStun: 24,
              blockStun: 15,
              pushback: 7,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.HEAVY
            };
          } else if (this.stateTimer <= 21) {
            this.animFrame = 3;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.CROUCH_LIGHT_PUNCH:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 6) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 38, 54, 18);
            this.currentAttackData = {
              damage: 35,
              hitStun: 12,
              blockStun: 9,
              pushback: 3,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.LIGHT
            };
          } else if (this.stateTimer <= 10) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.CROUCH);
          }
          break;
        case FIGHTER_STATE.CROUCH_HEAVY_PUNCH:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 13) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 16, 62, 36);
            this.currentAttackData = {
              damage: 90,
              hitStun: 24,
              blockStun: 14,
              pushback: 7,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.KNOCKDOWN
            };
          } else if (this.stateTimer <= 20) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.CROUCH);
          }
          break;
        case FIGHTER_STATE.CROUCH_LIGHT_KICK:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 6) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 58, 56, 18);
            this.currentAttackData = {
              damage: 38,
              hitStun: 12,
              blockStun: 9,
              pushback: 4,
              height: ATTACK_HEIGHT.LOW,
              hitType: HIT_TYPE.LIGHT
            };
          } else if (this.stateTimer <= 10) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.CROUCH);
          }
          break;
        case FIGHTER_STATE.CROUCH_HEAVY_KICK:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 10) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 56, 88, 24);
            this.currentAttackData = {
              damage: 82,
              hitStun: 26,
              blockStun: 14,
              pushback: 6,
              height: ATTACK_HEIGHT.LOW,
              hitType: HIT_TYPE.KNOCKDOWN
            };
          } else if (this.stateTimer <= 19) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.CROUCH);
          }
          break;
        case FIGHTER_STATE.JUMP_PUNCH:
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 32, 58, 30);
          this.currentAttackData = {
            damage: 75,
            hitStun: 18,
            blockStun: 14,
            pushback: 4,
            height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.HEAVY
          };
          break;
        case FIGHTER_STATE.JUMP_KICK:
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 38, 65, 26);
          this.currentAttackData = {
            damage: 85,
            hitStun: 20,
            blockStun: 16,
            pushback: 5,
            height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.HEAVY
          };
          break;
        case FIGHTER_STATE.SPECIAL_1:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 10) this.animFrame = 1;
          else if (this.stateTimer <= 15) this.animFrame = 2;
          else if (this.stateTimer <= 20) this.animFrame = 3;
          else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.SPECIAL_2:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 8) {
            this.animFrame = 1;
            this.activeHitbox = new Box(25, -10, 75, 55);
            this.currentAttackData = {
              damage: 125,
              hitStun: 28,
              blockStun: 18,
              pushback: 6,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.KNOCKDOWN,
              chipDamage: 16
            };
          } else if (this.stateTimer <= 14) {
            this.animFrame = 2;
            this.activeHitbox = new Box(25, -18, 75, 55);
          } else if (this.stateTimer <= 21) {
            this.animFrame = 3;
            this.activeHitbox = null;
            this.isInvincible = false;
          } else if (this.stateTimer <= 32) {
            this.animFrame = 4;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.SPECIAL_3:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 8) this.animFrame = 1;
          else if (this.stateTimer <= 14) {
            this.animFrame = 2;
            if (this.stateTimer === 10 && this.spawnProjectile) {
              const pX = this.facingRight ? this.x + 60 : this.x - 20;
              this.spawnProjectile(new Projectile({
                owner: this,
                type: "ki_kunai",
                x: pX,
                y: this.y - 56,
                vx: (this.facingRight ? 1 : -1) * 10.8,
                damage: 82
              }));
            }
          } else if (this.stateTimer <= 21) {
            this.animFrame = 3;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        // ==========================================
        // NARUTO-STYLE SHADOW CLONE ULTIMATE (千夜蓮華)
        // ==========================================
        case FIGHTER_STATE.ULTIMATE:
          if (this.stateTimer <= 20) {
            this.animFrame = 0;
            this.vx = 0;
            if (this.stateTimer % 4 === 0) {
              this.addAfterImage();
            }
          } else if (this.stateTimer <= 38) {
            this.animFrame = 1;
            this.vx = (this.facingRight ? 1 : -1) * 15;
            this.addAfterImage();
            this.activeHitbox = new Box(36, 10, 52, 44);
            this.currentAttackData = {
              damage: 360,
              hitStun: 60,
              blockStun: 25,
              pushback: 10,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.KNOCKDOWN,
              chipDamage: 50
            };
          } else if (this.stateTimer <= 65) {
            this.animFrame = 2;
            this.activeHitbox = null;
            this.vx *= 0.85;
            if (this.stateTimer === 38) {
              soundFX.playUltimateFinisher();
            }
          } else if (this.stateTimer <= 85) {
            this.animFrame = 3;
            this.isInvincible = false;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.DIRTY_TACTIC:
          if (this.stateTimer <= 5) {
            this.animFrame = 0;
          } else if (this.stateTimer <= 15) {
            this.animFrame = 1;
            this.activeHitbox = new Box(32, 54, 88, 30);
            this.currentAttackData = {
              damage: 65,
              hitStun: 45,
              blockStun: 20,
              pushback: 5,
              height: ATTACK_HEIGHT.UNBLOCKABLE,
              hitType: HIT_TYPE.KNOCKDOWN
            };
          } else if (this.stateTimer <= 25) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        default:
          if (this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % frames.length;
          }
          break;
      }
    }
  };

  // src/fighters/Fang.js
  var Fang = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "fang",
        name: "FANG"
      });
      this.walkSpeed = 3.8;
      this.dashSpeed = 8.2;
      this.jumpForce = -13;
      this.ultimateTarget = null;
    }
    handleInput(inputState, inputManager, opponent) {
      if (this.hitStun > 0 || this.blockStun > 0 || this.state === FIGHTER_STATE.KNOCKDOWN) return;
      if (this.state === FIGHTER_STATE.SUBMISSION_LOCK) {
        if (inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputState.dirtyJust) {
          this.submissionStruggle = Math.min(100, (this.submissionStruggle || 0) + 14);
          soundFX.playWhoosh("light");
        }
        return;
      }
      const pNum = this.playerNum;
      if (this.heldPickup) {
        const wantsAttack = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputManager && (inputManager.peekAction(pNum) === "LP" || inputManager.peekAction(pNum) === "HP");
        if (wantsAttack && !this.isAttacking()) {
          if (inputManager) inputManager.consumeAction(pNum);
          this.executePickupAttack(this.heldPickup, opponent);
          return;
        }
      }
      this.isHoldingBack = !!inputState.back;
      this.isCrouching = !!inputState.down;
      const canSuper = this.superMeter >= 100 || inputManager.easyInputs;
      const wantsUltimate = inputState.ultimateJust || inputManager.peekAction(pNum) === "ULTIMATE";
      if (wantsUltimate && canSuper) {
        if (this.canCancelOnHit() || !this.isAttacking()) {
          inputManager.consumeBuffer(pNum);
          this.startUltimate(opponent);
          return;
        }
      }
      const wantsDirty = inputState.dirtyJust || inputManager.peekAction(pNum) === "DIRTY";
      if (wantsDirty && this.isGrounded && (!this.isAttacking() || this.canCancelOnHit())) {
        inputManager.consumeAction(pNum);
        this.startDirtyTactic();
        return;
      }
      if (!this.isGrounded) {
        if (this.state === FIGHTER_STATE.JUMP) {
          if (inputState.lpJust || inputState.hpJust || inputManager.peekAction(pNum) === "LP" || inputManager.peekAction(pNum) === "HP") {
            inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_PUNCH);
            soundFX.playWhoosh("light");
          } else if (inputState.lkJust || inputState.hkJust || inputManager.peekAction(pNum) === "LK" || inputManager.peekAction(pNum) === "HK") {
            inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_KICK);
            soundFX.playWhoosh("heavy");
          }
        }
        return;
      }
      if (this.isAttacking() && !this.canCancelOnHit()) return;
      const anyAttackJust = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust;
      const isSP2 = inputManager.checkDP(pNum) && anyAttackJust || inputState.sp2Just || inputManager.peekAction(pNum) === "SP2";
      if (isSP2) {
        inputManager.consumeBuffer(pNum);
        this.startCycloneElbow();
        return;
      }
      const isSP1 = inputManager.checkQCF(pNum) && anyAttackJust || inputState.sp1Just || inputManager.peekAction(pNum) === "SP1";
      if (isSP1) {
        inputManager.consumeBuffer(pNum);
        this.startTigerKnee();
        return;
      }
      const isSP3 = inputManager.checkQCB(pNum) && anyAttackJust || inputState.sp3Just || inputManager.peekAction(pNum) === "SP3";
      if (isSP3) {
        inputManager.consumeBuffer(pNum);
        this.startIronTeep();
        return;
      }
      if (!this.isAttacking()) {
        if (inputState.dashFwd) {
          this.startDash(true);
          return;
        }
        if (inputState.dashBack) {
          this.startDash(false);
          return;
        }
      }
      const lpT = inputState.lpJust || inputManager.peekAction(pNum) === "LP";
      const hpT = inputState.hpJust || inputManager.peekAction(pNum) === "HP";
      const lkT = inputState.lkJust || inputManager.peekAction(pNum) === "LK";
      const hkT = inputState.hkJust || inputManager.peekAction(pNum) === "HK";
      if (inputState.down) {
        if (lpT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_PUNCH, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hpT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_PUNCH, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (lkT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_KICK, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hkT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_KICK, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        this.changeState(FIGHTER_STATE.CROUCH);
        return;
      }
      if (lpT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_PUNCH, true);
        soundFX.playWhoosh("light");
        return;
      }
      if (hpT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (lkT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_KICK, true);
        soundFX.playWhoosh("light");
        return;
      }
      if (hkT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_KICK, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (inputState.up) {
        this.vy = this.jumpForce;
        this.isGrounded = false;
        this.changeState(FIGHTER_STATE.JUMP);
        if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 3.8;
        else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 3.8;
        return;
      }
      if (inputState.fwd) {
        this.vx = (this.facingRight ? 1 : -1) * this.walkSpeed;
        this.changeState(FIGHTER_STATE.WALK_FWD);
      } else if (inputState.back) {
        this.vx = (this.facingRight ? -1 : 1) * (this.walkSpeed * 0.75);
        this.changeState(FIGHTER_STATE.WALK_BACK);
      } else {
        this.changeState(FIGHTER_STATE.IDLE);
      }
    }
    startTigerKnee() {
      this.changeState(FIGHTER_STATE.SPECIAL_1);
      soundFX.playWhoosh("heavy");
      this.isGrounded = false;
      this.vy = -6;
      this.vx = (this.facingRight ? 1 : -1) * 7;
    }
    startCycloneElbow() {
      this.changeState(FIGHTER_STATE.SPECIAL_2);
      soundFX.playWhoosh("heavy");
      this.vx = (this.facingRight ? 1 : -1) * 3;
    }
    startIronTeep() {
      this.changeState(FIGHTER_STATE.SPECIAL_3);
      soundFX.playWhoosh("light");
    }
    startDirtyTactic() {
      this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
      soundFX.playPocketSand();
      const originX = this.facingRight ? this.x + 50 : this.x + 10;
      for (let i = 0; i < 18; i++) {
        this.tacticalParticles.push({
          x: originX,
          y: this.y - 65 + (Math.random() - 0.5) * 18,
          vx: (this.facingRight ? 1 : -1) * (4 + Math.random() * 5),
          vy: (Math.random() - 0.5) * 3,
          size: 2 + Math.random() * 3,
          alpha: 1,
          color: Math.random() < 0.5 ? "#d97706" : "#fef3c7"
        });
      }
    }
    startUltimate(opponent) {
      this.superMeter = 0;
      this.changeState(FIGHTER_STATE.ULTIMATE);
      this.ultimateTarget = opponent;
      this.isInvincible = true;
      soundFX.playUltimateActivation();
      window.dispatchEvent(new CustomEvent("ultimate-activated", {
        detail: { fighter: this.id, playerNum: this.playerNum, name: this.name, ultimateName: "ANCIENT TIGER WRATH" }
      }));
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      switch (this.state) {
        case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 7) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 34, 48, 18);
            this.currentAttackData = { damage: 35, hitStun: 12, blockStun: 8, pushback: 3, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.LIGHT };
          } else if (this.stateTimer <= 12) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 12) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 30, 58, 22);
            this.currentAttackData = { damage: 70, hitStun: 22, blockStun: 12, pushback: 5, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY };
          } else if (this.stateTimer <= 20) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.ATTACK_LIGHT_KICK:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 8) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 50, 52, 20);
            this.currentAttackData = { damage: 40, hitStun: 14, blockStun: 8, pushback: 3, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
          } else if (this.stateTimer <= 14) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_KICK:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 13) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 40, 70, 26);
            this.currentAttackData = { damage: 85, hitStun: 24, blockStun: 14, pushback: 6, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY };
          } else if (this.stateTimer <= 22) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.CROUCH_LIGHT_PUNCH:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 7) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 50, 46, 16);
            this.currentAttackData = { damage: 30, hitStun: 10, blockStun: 6, pushback: 2, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
          } else if (this.stateTimer <= 12) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.CROUCH_HEAVY_PUNCH:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 11) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 44, 56, 20);
            this.currentAttackData = { damage: 65, hitStun: 20, blockStun: 12, pushback: 4, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
          } else if (this.stateTimer <= 18) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.CROUCH_LIGHT_KICK:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 8) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 58, 55, 18);
            this.currentAttackData = { damage: 35, hitStun: 12, blockStun: 6, pushback: 2, height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.LIGHT };
          } else if (this.stateTimer <= 14) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.CROUCH_HEAVY_KICK:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 11) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 56, 80, 22);
            this.currentAttackData = { damage: 80, hitStun: 26, blockStun: 14, pushback: 5, height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.KNOCKDOWN };
          } else if (this.stateTimer <= 20) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.JUMP_PUNCH:
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 32, 55, 28);
          this.currentAttackData = { damage: 70, hitStun: 18, blockStun: 14, pushback: 4, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
          break;
        case FIGHTER_STATE.JUMP_KICK:
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 38, 62, 24);
          this.currentAttackData = { damage: 80, hitStun: 20, blockStun: 16, pushback: 5, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
          break;
        // SPECIAL 1: TIGER KNEE
        case FIGHTER_STATE.SPECIAL_1:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 12) {
            this.animFrame = 1;
            this.activeHitbox = new Box(30, 20, 60, 40);
            this.currentAttackData = { damage: 100, hitStun: 26, blockStun: 14, pushback: 6, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
          } else if (this.stateTimer <= 20) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        // SPECIAL 2: CYCLONE ELBOW (2 hits)
        case FIGHTER_STATE.SPECIAL_2:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 8) {
            this.animFrame = 1;
            this.activeHitbox = new Box(32, 28, 55, 30);
            this.currentAttackData = { damage: 60, hitStun: 16, blockStun: 10, pushback: 3, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
          } else if (this.stateTimer <= 9) {
            this.animFrame = 2;
            this.activeHitbox = null;
            this.hasHitThisAttack = false;
          } else if (this.stateTimer <= 14) {
            this.animFrame = 3;
            this.activeHitbox = new Box(32, 24, 60, 34);
            this.currentAttackData = { damage: 70, hitStun: 24, blockStun: 14, pushback: 6, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
          } else if (this.stateTimer <= 22) {
            this.animFrame = 4;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        // SPECIAL 3: IRON TEEP
        case FIGHTER_STATE.SPECIAL_3:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 10) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 40, 65, 24);
            this.currentAttackData = { damage: 65, hitStun: 20, blockStun: 12, pushback: 9, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
          } else if (this.stateTimer <= 18) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        // ULTIMATE: ANCIENT TIGER WRATH
        case FIGHTER_STATE.ULTIMATE:
          if (this.stateTimer <= 18) {
            this.animFrame = Math.floor(this.stateTimer / 5);
            this.vx = 0;
          } else if (this.stateTimer === 20 && this.ultimateTarget) {
            const dist = Math.abs(this.x - this.ultimateTarget.x);
            if (dist < 200) {
              this.x = this.ultimateTarget.x + (this.facingRight ? -60 : 60);
            }
          } else if (this.stateTimer >= 25 && this.stateTimer <= 55) {
            this.animFrame = 4 + (this.stateTimer % 4 < 2 ? 0 : 1);
            if (this.stateTimer % 8 === 0 && this.ultimateTarget && !this.ultimateTarget.isDead) {
              this.ultimateTarget.takeHit({ damage: 80, hitStun: 8, blockStun: 6, pushback: 2, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY }, this.facingRight ? 1 : -1);
              soundFX.playHitHeavy();
            }
          } else if (this.stateTimer === 60 && this.ultimateTarget && !this.ultimateTarget.isDead) {
            this.animFrame = 6;
            this.ultimateTarget.takeHit({ damage: 150, hitStun: 35, blockStun: 20, pushback: 10, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.KNOCKDOWN }, this.facingRight ? 1 : -1);
            soundFX.playHitHeavy();
            soundFX.playKO();
          } else if (this.stateTimer >= 65 && this.stateTimer <= 80) {
            this.animFrame = 7;
          } else if (this.stateTimer > 80) {
            this.isInvincible = false;
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.DIRTY_TACTIC:
          if (this.stateTimer <= 6) {
            this.animFrame = 0;
          } else if (this.stateTimer <= 15) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 18, 70, 38);
            this.currentAttackData = {
              damage: 50,
              hitStun: 70,
              blockStun: 20,
              pushback: 4,
              height: ATTACK_HEIGHT.UNBLOCKABLE,
              hitType: HIT_TYPE.DIRTY_STUN,
              stunFrames: 70
            };
          } else if (this.stateTimer <= 25) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        default:
          if (frames && frames.length > 0 && this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % frames.length;
          }
          break;
      }
    }
  };

  // src/fighters/Zephyr.js
  var Zephyr = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "zephyr",
        name: "ZEPHYR"
      });
      this.walkSpeed = 4.5;
      this.dashSpeed = 9.5;
      this.jumpForce = -15;
      this.ultimateTarget = null;
    }
    handleInput(inputState, inputManager, opponent) {
      if (this.hitStun > 0 || this.blockStun > 0 || this.state === FIGHTER_STATE.KNOCKDOWN) return;
      if (this.state === FIGHTER_STATE.SUBMISSION_LOCK) {
        if (inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputState.dirtyJust) {
          this.submissionStruggle = Math.min(100, (this.submissionStruggle || 0) + 14);
          soundFX.playWhoosh("light");
        }
        return;
      }
      const pNum = this.playerNum;
      if (this.heldPickup) {
        const wantsAttack = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputManager && (inputManager.peekAction(pNum) === "LP" || inputManager.peekAction(pNum) === "HP");
        if (wantsAttack && !this.isAttacking()) {
          if (inputManager) inputManager.consumeAction(pNum);
          this.executePickupAttack(this.heldPickup, opponent);
          return;
        }
      }
      this.isHoldingBack = !!inputState.back;
      this.isCrouching = !!inputState.down;
      const canSuper = this.superMeter >= 100 || inputManager.easyInputs;
      const wantsUltimate = inputState.ultimateJust || inputManager.peekAction(pNum) === "ULTIMATE";
      if (wantsUltimate && canSuper) {
        if (this.canCancelOnHit() || !this.isAttacking()) {
          inputManager.consumeBuffer(pNum);
          this.startUltimate(opponent);
          return;
        }
      }
      const wantsDirty = inputState.dirtyJust || inputManager.peekAction(pNum) === "DIRTY";
      if (wantsDirty && this.isGrounded && (!this.isAttacking() || this.canCancelOnHit())) {
        inputManager.consumeAction(pNum);
        this.startDirtyTactic();
        return;
      }
      if (!this.isGrounded) {
        if (this.state === FIGHTER_STATE.JUMP) {
          if (inputState.lpJust || inputState.hpJust || inputManager.peekAction(pNum) === "LP" || inputManager.peekAction(pNum) === "HP") {
            inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_PUNCH);
            soundFX.playWhoosh("light");
          } else if (inputState.lkJust || inputState.hkJust || inputManager.peekAction(pNum) === "LK" || inputManager.peekAction(pNum) === "HK") {
            inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_KICK);
            soundFX.playWhoosh("heavy");
          }
        }
        return;
      }
      if (this.isAttacking() && !this.canCancelOnHit()) return;
      const anyAttackJust = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust;
      const isSP2 = inputManager.checkDP(pNum) && anyAttackJust || inputState.sp2Just || inputManager.peekAction(pNum) === "SP2";
      if (isSP2) {
        inputManager.consumeBuffer(pNum);
        this.startHandstandAxe();
        return;
      }
      const isSP1 = inputManager.checkQCF(pNum) && anyAttackJust || inputState.sp1Just || inputManager.peekAction(pNum) === "SP1";
      if (isSP1) {
        inputManager.consumeBuffer(pNum);
        this.startWindmillKick();
        return;
      }
      const isSP3 = inputManager.checkQCB(pNum) && anyAttackJust || inputState.sp3Just || inputManager.peekAction(pNum) === "SP3";
      if (isSP3) {
        inputManager.consumeBuffer(pNum);
        this.startFlareSlide();
        return;
      }
      if (!this.isAttacking()) {
        if (inputState.dashFwd) {
          this.startDash(true);
          return;
        }
        if (inputState.dashBack) {
          this.startDash(false);
          return;
        }
      }
      const lpT = inputState.lpJust || inputManager.peekAction(pNum) === "LP";
      const hpT = inputState.hpJust || inputManager.peekAction(pNum) === "HP";
      const lkT = inputState.lkJust || inputManager.peekAction(pNum) === "LK";
      const hkT = inputState.hkJust || inputManager.peekAction(pNum) === "HK";
      if (inputState.down) {
        if (lpT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_PUNCH, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hpT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_PUNCH, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (lkT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_KICK, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hkT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_KICK, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        this.changeState(FIGHTER_STATE.CROUCH);
        return;
      }
      if (lpT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_PUNCH, true);
        soundFX.playWhoosh("light");
        return;
      }
      if (hpT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (lkT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_KICK, true);
        soundFX.playWhoosh("light");
        return;
      }
      if (hkT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_KICK, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (inputState.up) {
        this.vy = this.jumpForce;
        this.isGrounded = false;
        this.changeState(FIGHTER_STATE.JUMP);
        if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 4.2;
        else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 4.2;
        return;
      }
      if (inputState.fwd) {
        this.vx = (this.facingRight ? 1 : -1) * this.walkSpeed;
        this.changeState(FIGHTER_STATE.WALK_FWD);
      } else if (inputState.back) {
        this.vx = (this.facingRight ? -1 : 1) * (this.walkSpeed * 0.75);
        this.changeState(FIGHTER_STATE.WALK_BACK);
      } else {
        this.changeState(FIGHTER_STATE.IDLE);
      }
    }
    startWindmillKick() {
      this.changeState(FIGHTER_STATE.SPECIAL_1);
      soundFX.playWhoosh("heavy");
      this.isInvincible = true;
      setTimeout(() => {
        this.isInvincible = false;
      }, 66);
      this.vx = (this.facingRight ? 1 : -1) * 3;
    }
    startHandstandAxe() {
      this.changeState(FIGHTER_STATE.SPECIAL_2);
      soundFX.playWhoosh("heavy");
    }
    startFlareSlide() {
      this.changeState(FIGHTER_STATE.SPECIAL_3);
      soundFX.playWhoosh("heavy");
      this.vx = (this.facingRight ? 1 : -1) * 6;
    }
    startDirtyTactic() {
      this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
      soundFX.playPocketSand();
      const originX = this.facingRight ? this.x + 50 : this.x + 10;
      for (let i = 0; i < 16; i++) {
        this.tacticalParticles.push({
          x: originX,
          y: this.y - 60 + (Math.random() - 0.5) * 20,
          vx: (this.facingRight ? 1 : -1) * (3.5 + Math.random() * 5),
          vy: (Math.random() - 0.5) * 4,
          size: 2 + Math.random() * 3,
          alpha: 1,
          color: Math.random() < 0.5 ? "#22c55e" : "#4ade80"
        });
      }
    }
    startUltimate(opponent) {
      this.superMeter = 0;
      this.changeState(FIGHTER_STATE.ULTIMATE);
      this.ultimateTarget = opponent;
      this.isInvincible = true;
      soundFX.playUltimateActivation();
      window.dispatchEvent(new CustomEvent("ultimate-activated", {
        detail: { fighter: this.id, playerNum: this.playerNum, name: this.name, ultimateName: "RHYTHM OF THE TEMPEST" }
      }));
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      switch (this.state) {
        case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
          if (this.stateTimer <= 2) this.animFrame = 0;
          else if (this.stateTimer <= 6) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 34, 46, 16);
            this.currentAttackData = { damage: 30, hitStun: 10, blockStun: 6, pushback: 2, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.LIGHT };
          } else if (this.stateTimer <= 10) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 10) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 30, 54, 20);
            this.currentAttackData = { damage: 65, hitStun: 20, blockStun: 12, pushback: 5, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY };
          } else if (this.stateTimer <= 18) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.ATTACK_LIGHT_KICK:
          if (this.stateTimer <= 2) this.animFrame = 0;
          else if (this.stateTimer <= 7) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 48, 50, 18);
            this.currentAttackData = { damage: 35, hitStun: 12, blockStun: 7, pushback: 3, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
          } else if (this.stateTimer <= 11) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_KICK:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 12) {
            this.animFrame = 1;
            this.activeHitbox = new Box(32, 38, 68, 24);
            this.currentAttackData = { damage: 80, hitStun: 22, blockStun: 14, pushback: 6, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY };
          } else if (this.stateTimer <= 21) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.CROUCH_LIGHT_PUNCH:
          if (this.stateTimer <= 2) this.animFrame = 0;
          else if (this.stateTimer <= 6) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 50, 44, 14);
            this.currentAttackData = { damage: 25, hitStun: 8, blockStun: 5, pushback: 2, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
          } else if (this.stateTimer <= 10) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.CROUCH_HEAVY_PUNCH:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 10) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 44, 52, 18);
            this.currentAttackData = { damage: 60, hitStun: 18, blockStun: 10, pushback: 4, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
          } else if (this.stateTimer <= 16) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.CROUCH_LIGHT_KICK:
          if (this.stateTimer <= 2) this.animFrame = 0;
          else if (this.stateTimer <= 7) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 58, 52, 16);
            this.currentAttackData = { damage: 30, hitStun: 10, blockStun: 5, pushback: 2, height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.LIGHT };
          } else if (this.stateTimer <= 11) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.CROUCH_HEAVY_KICK:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 10) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 56, 78, 20);
            this.currentAttackData = { damage: 75, hitStun: 24, blockStun: 12, pushback: 5, height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.KNOCKDOWN };
          } else if (this.stateTimer <= 18) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.JUMP_PUNCH:
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 30, 50, 26);
          this.currentAttackData = { damage: 60, hitStun: 16, blockStun: 12, pushback: 3, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
          break;
        case FIGHTER_STATE.JUMP_KICK:
          this.animFrame = 1;
          this.activeHitbox = new Box(30, 36, 60, 22);
          this.currentAttackData = { damage: 70, hitStun: 18, blockStun: 14, pushback: 4, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
          break;
        // SPECIAL 1: WINDMILL KICK
        case FIGHTER_STATE.SPECIAL_1:
          if (this.stateTimer <= 4) {
            this.animFrame = 0;
          } else if (this.stateTimer <= 15) {
            this.animFrame = 1 + this.stateTimer % 3;
            this.activeHitbox = new Box(24, 28, 90, 36);
            this.currentAttackData = { damage: 90, hitStun: 24, blockStun: 14, pushback: 6, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
          } else if (this.stateTimer <= 22) {
            this.animFrame = 4;
            this.activeHitbox = null;
          } else {
            this.isInvincible = false;
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        // SPECIAL 2: HANDSTAND AXE HEEL
        case FIGHTER_STATE.SPECIAL_2:
          if (this.stateTimer <= 6) this.animFrame = 0;
          else if (this.stateTimer <= 14) {
            this.animFrame = 1;
            this.activeHitbox = new Box(30, 10, 55, 50);
            this.currentAttackData = { damage: 95, hitStun: 28, blockStun: 16, pushback: 5, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY };
          } else if (this.stateTimer <= 24) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        // SPECIAL 3: BBOY FLARE SLIDE
        case FIGHTER_STATE.SPECIAL_3:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 12) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 58, 75, 20);
            this.currentAttackData = { damage: 70, hitStun: 22, blockStun: 12, pushback: 7, height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.KNOCKDOWN };
          } else if (this.stateTimer <= 20) {
            this.animFrame = 2;
            this.activeHitbox = null;
            this.vx *= 0.5;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        // ULTIMATE: RHYTHM OF THE TEMPEST
        case FIGHTER_STATE.ULTIMATE:
          if (this.stateTimer <= 18) {
            this.animFrame = Math.floor(this.stateTimer / 5);
            this.vx = 0;
          } else if (this.stateTimer === 20 && this.ultimateTarget) {
            const dist = Math.abs(this.x - this.ultimateTarget.x);
            if (dist < 200) {
              this.x = this.ultimateTarget.x + (this.facingRight ? -60 : 60);
            }
          } else if (this.stateTimer >= 25 && this.stateTimer <= 60) {
            this.animFrame = 4 + (this.stateTimer % 4 < 2 ? 0 : 1);
            if (this.stateTimer % 7 === 0 && this.ultimateTarget && !this.ultimateTarget.isDead) {
              this.ultimateTarget.takeHit({ damage: 65, hitStun: 8, blockStun: 6, pushback: 2, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY }, this.facingRight ? 1 : -1);
              soundFX.playHitHeavy();
            }
          } else if (this.stateTimer === 65 && this.ultimateTarget && !this.ultimateTarget.isDead) {
            this.animFrame = 6;
            this.ultimateTarget.takeHit({ damage: 130, hitStun: 35, blockStun: 20, pushback: 10, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.KNOCKDOWN }, this.facingRight ? 1 : -1);
            soundFX.playHitHeavy();
            soundFX.playKO();
          } else if (this.stateTimer >= 70 && this.stateTimer <= 85) {
            this.animFrame = 7;
          } else if (this.stateTimer > 85) {
            this.isInvincible = false;
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.DIRTY_TACTIC:
          if (this.stateTimer <= 6) {
            this.animFrame = 0;
          } else if (this.stateTimer <= 15) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 18, 70, 38);
            this.currentAttackData = {
              damage: 50,
              hitStun: 70,
              blockStun: 20,
              pushback: 4,
              height: ATTACK_HEIGHT.UNBLOCKABLE,
              hitType: HIT_TYPE.DIRTY_STUN,
              stunFrames: 70
            };
          } else if (this.stateTimer <= 25) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        default:
          if (frames && frames.length > 0 && this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % frames.length;
          }
          break;
      }
    }
  };

  // src/fighters/Colossus.js
  var Colossus = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "colossus",
        name: "COLOSSUS"
      });
      this.walkSpeed = 2.8;
      this.dashSpeed = 6.5;
      this.jumpForce = -11.5;
      this.superArmorActive = false;
      this.ultimateTarget = null;
    }
    takeHit(attackData, fromDirection) {
      if (this.superArmorActive && attackData.hitType === HIT_TYPE.LIGHT) {
        soundFX.playBlock();
        this.health = Math.max(1, this.health - Math.floor(attackData.damage * 0.5));
        this.armorFlash = 5;
        return "armored";
      }
      return super.takeHit(attackData, fromDirection);
    }
    handleInput(inputState, inputManager, opponent) {
      if (this.hitStun > 0 || this.blockStun > 0 || this.state === FIGHTER_STATE.KNOCKDOWN) return;
      if (this.state === FIGHTER_STATE.SUBMISSION_LOCK) {
        if (inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputState.dirtyJust) {
          this.submissionStruggle = Math.min(100, (this.submissionStruggle || 0) + 14);
          soundFX.playWhoosh("light");
        }
        return;
      }
      const pNum = this.playerNum;
      if (this.heldPickup) {
        const wantsAttack = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputManager && (inputManager.peekAction(pNum) === "LP" || inputManager.peekAction(pNum) === "HP");
        if (wantsAttack && !this.isAttacking()) {
          if (inputManager) inputManager.consumeAction(pNum);
          this.executePickupAttack(this.heldPickup, opponent);
          return;
        }
      }
      this.isHoldingBack = !!inputState.back;
      this.isCrouching = !!inputState.down;
      const canSuper = this.superMeter >= 100 || inputManager.easyInputs;
      const wantsUltimate = inputState.ultimateJust || inputManager.peekAction(pNum) === "ULTIMATE";
      if (wantsUltimate && canSuper) {
        if (this.canCancelOnHit() || !this.isAttacking()) {
          inputManager.consumeBuffer(pNum);
          this.startUltimate(opponent);
          return;
        }
      }
      const wantsDirty = inputState.dirtyJust || inputManager.peekAction(pNum) === "DIRTY";
      if (wantsDirty && this.isGrounded && (!this.isAttacking() || this.canCancelOnHit())) {
        inputManager.consumeAction(pNum);
        this.startDirtyTactic();
        return;
      }
      if (!this.isGrounded) {
        if (this.state === FIGHTER_STATE.JUMP) {
          if (inputState.lpJust || inputState.hpJust || inputManager.peekAction(pNum) === "LP" || inputManager.peekAction(pNum) === "HP") {
            inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_PUNCH);
            soundFX.playWhoosh("heavy");
          } else if (inputState.lkJust || inputState.hkJust || inputManager.peekAction(pNum) === "LK" || inputManager.peekAction(pNum) === "HK") {
            inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_KICK);
            soundFX.playWhoosh("heavy");
          }
        }
        return;
      }
      if (this.isAttacking() && !this.canCancelOnHit()) return;
      const anyAttackJust = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust;
      const isSP2 = inputManager.checkDP(pNum) && anyAttackJust || inputState.sp2Just || inputManager.peekAction(pNum) === "SP2";
      if (isSP2) {
        inputManager.consumeBuffer(pNum);
        this.startCorkscrewUppercut();
        return;
      }
      const isSP1 = inputManager.checkQCF(pNum) && anyAttackJust || inputState.sp1Just || inputManager.peekAction(pNum) === "SP1";
      if (isSP1) {
        inputManager.consumeBuffer(pNum);
        this.startDempseyBlow();
        return;
      }
      const isSP3 = inputManager.checkQCB(pNum) && anyAttackJust || inputState.sp3Just || inputManager.peekAction(pNum) === "SP3";
      if (isSP3) {
        inputManager.consumeBuffer(pNum);
        this.startGazellePunch();
        return;
      }
      if (!this.isAttacking()) {
        if (inputState.dashFwd) {
          this.startDash(true);
          return;
        }
        if (inputState.dashBack) {
          this.startDash(false);
          return;
        }
      }
      const lpT = inputState.lpJust || inputManager.peekAction(pNum) === "LP";
      const hpT = inputState.hpJust || inputManager.peekAction(pNum) === "HP";
      const lkT = inputState.lkJust || inputManager.peekAction(pNum) === "LK";
      const hkT = inputState.hkJust || inputManager.peekAction(pNum) === "HK";
      if (inputState.down) {
        if (lpT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_PUNCH, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hpT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_PUNCH, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (lkT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_KICK, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hkT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_KICK, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        this.changeState(FIGHTER_STATE.CROUCH);
        return;
      }
      if (lpT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_PUNCH, true);
        soundFX.playWhoosh("light");
        return;
      }
      if (hpT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (lkT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_KICK, true);
        soundFX.playWhoosh("light");
        return;
      }
      if (hkT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_KICK, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (inputState.up) {
        this.vy = this.jumpForce;
        this.isGrounded = false;
        this.changeState(FIGHTER_STATE.JUMP);
        if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 2.8;
        else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 2.8;
        return;
      }
      if (inputState.fwd) {
        this.vx = (this.facingRight ? 1 : -1) * this.walkSpeed;
        this.changeState(FIGHTER_STATE.WALK_FWD);
      } else if (inputState.back) {
        this.vx = (this.facingRight ? -1 : 1) * (this.walkSpeed * 0.75);
        this.changeState(FIGHTER_STATE.WALK_BACK);
      } else {
        this.changeState(FIGHTER_STATE.IDLE);
      }
    }
    startDempseyBlow() {
      this.changeState(FIGHTER_STATE.SPECIAL_1);
      soundFX.playWhoosh("heavy");
      this.superArmorActive = true;
    }
    startCorkscrewUppercut() {
      this.changeState(FIGHTER_STATE.SPECIAL_2);
      soundFX.playShoryuken();
      this.isInvincible = true;
      this.isGrounded = false;
      this.vy = -10;
      this.vx = (this.facingRight ? 1 : -1) * 3;
    }
    startGazellePunch() {
      this.changeState(FIGHTER_STATE.SPECIAL_3);
      soundFX.playWhoosh("heavy");
      this.vx = (this.facingRight ? 1 : -1) * 6;
    }
    startDirtyTactic() {
      this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
      soundFX.playPocketSand();
      const originX = this.facingRight ? this.x + 55 : this.x + 5;
      for (let i = 0; i < 20; i++) {
        this.tacticalParticles.push({
          x: originX,
          y: this.y - 60 + (Math.random() - 0.5) * 20,
          vx: (this.facingRight ? 1 : -1) * (4 + Math.random() * 5),
          vy: (Math.random() - 0.5) * 3.5,
          size: 2 + Math.random() * 3,
          alpha: 1,
          color: Math.random() < 0.5 ? "#b91c1c" : "#fbbf24"
        });
      }
    }
    startUltimate(opponent) {
      this.superMeter = 0;
      this.changeState(FIGHTER_STATE.ULTIMATE);
      this.ultimateTarget = opponent;
      this.isInvincible = true;
      soundFX.playUltimateActivation();
      window.dispatchEvent(new CustomEvent("ultimate-activated", {
        detail: { fighter: this.id, playerNum: this.playerNum, name: this.name, ultimateName: "DEMPSEY ROLL" }
      }));
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      switch (this.state) {
        case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 9) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 32, 52, 20);
            this.currentAttackData = { damage: 45, hitStun: 14, blockStun: 8, pushback: 4, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.LIGHT };
          } else if (this.stateTimer <= 14) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
          if (this.stateTimer <= 7) this.animFrame = 0;
          else if (this.stateTimer <= 15) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 28, 62, 26);
            this.currentAttackData = { damage: 90, hitStun: 26, blockStun: 16, pushback: 7, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY };
          } else if (this.stateTimer <= 24) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.ATTACK_LIGHT_KICK:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 10) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 50, 54, 22);
            this.currentAttackData = { damage: 40, hitStun: 14, blockStun: 8, pushback: 4, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
          } else if (this.stateTimer <= 15) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_KICK:
          if (this.stateTimer <= 7) this.animFrame = 0;
          else if (this.stateTimer <= 16) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 40, 72, 28);
            this.currentAttackData = { damage: 95, hitStun: 28, blockStun: 16, pushback: 8, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.KNOCKDOWN };
          } else if (this.stateTimer <= 26) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.CROUCH_LIGHT_PUNCH:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 9) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 50, 50, 18);
            this.currentAttackData = { damage: 40, hitStun: 12, blockStun: 7, pushback: 3, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
          } else if (this.stateTimer <= 14) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.CROUCH_HEAVY_PUNCH:
          if (this.stateTimer <= 6) this.animFrame = 0;
          else if (this.stateTimer <= 14) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 42, 58, 22);
            this.currentAttackData = { damage: 85, hitStun: 24, blockStun: 14, pushback: 6, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
          } else if (this.stateTimer <= 22) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.CROUCH_LIGHT_KICK:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 10) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 58, 58, 18);
            this.currentAttackData = { damage: 35, hitStun: 12, blockStun: 6, pushback: 3, height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.LIGHT };
          } else if (this.stateTimer <= 15) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.CROUCH_HEAVY_KICK:
          if (this.stateTimer <= 6) this.animFrame = 0;
          else if (this.stateTimer <= 14) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 56, 85, 24);
            this.currentAttackData = { damage: 90, hitStun: 28, blockStun: 16, pushback: 7, height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.KNOCKDOWN };
          } else if (this.stateTimer <= 24) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.JUMP_PUNCH:
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 28, 58, 30);
          this.currentAttackData = { damage: 80, hitStun: 20, blockStun: 16, pushback: 5, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
          break;
        case FIGHTER_STATE.JUMP_KICK:
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 36, 60, 26);
          this.currentAttackData = { damage: 85, hitStun: 22, blockStun: 16, pushback: 6, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
          break;
        // SPECIAL 1: DEMPSEY BODY BLOW (Super Armor during startup)
        case FIGHTER_STATE.SPECIAL_1:
          if (this.stateTimer <= 8) {
            this.animFrame = 0;
            this.superArmorActive = true;
          } else if (this.stateTimer <= 16) {
            this.animFrame = 1;
            this.superArmorActive = false;
            this.activeHitbox = new Box(36, 34, 65, 30);
            this.currentAttackData = { damage: 140, hitStun: 32, blockStun: 18, pushback: 8, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
          } else if (this.stateTimer <= 26) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.superArmorActive = false;
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        // SPECIAL 2: CORKSCREW UPPERCUT
        case FIGHTER_STATE.SPECIAL_2:
          if (this.stateTimer <= 5) {
            this.animFrame = 0;
          } else if (this.stateTimer <= 12) {
            this.animFrame = 1;
            this.activeHitbox = new Box(28, -10, 65, 55);
            this.currentAttackData = { damage: 120, hitStun: 30, blockStun: 16, pushback: 6, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY };
          } else if (this.stateTimer <= 20) {
            this.animFrame = 2;
            this.activeHitbox = null;
            this.isInvincible = false;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        // SPECIAL 3: GAZELLE PUNCH
        case FIGHTER_STATE.SPECIAL_3:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 12) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 28, 60, 32);
            this.currentAttackData = { damage: 100, hitStun: 26, blockStun: 14, pushback: 7, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
          } else if (this.stateTimer <= 20) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        // ULTIMATE: DEMPSEY ROLL
        case FIGHTER_STATE.ULTIMATE:
          if (this.stateTimer <= 18) {
            this.animFrame = Math.floor(this.stateTimer / 5);
            this.vx = 0;
          } else if (this.stateTimer === 20 && this.ultimateTarget) {
            const dist = Math.abs(this.x - this.ultimateTarget.x);
            if (dist < 200) {
              this.x = this.ultimateTarget.x + (this.facingRight ? -60 : 60);
            }
          } else if (this.stateTimer >= 25 && this.stateTimer <= 65) {
            this.animFrame = 4 + (this.stateTimer % 4 < 2 ? 0 : 1);
            if (this.stateTimer % 7 === 0 && this.ultimateTarget && !this.ultimateTarget.isDead) {
              this.ultimateTarget.takeHit({ damage: 70, hitStun: 8, blockStun: 6, pushback: 1, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY }, this.facingRight ? 1 : -1);
              soundFX.playHitHeavy();
            }
          } else if (this.stateTimer === 70 && this.ultimateTarget && !this.ultimateTarget.isDead) {
            this.animFrame = 6;
            this.ultimateTarget.takeHit({ damage: 180, hitStun: 40, blockStun: 22, pushback: 12, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.KNOCKDOWN }, this.facingRight ? 1 : -1);
            soundFX.playHitHeavy();
            soundFX.playKO();
          } else if (this.stateTimer >= 75 && this.stateTimer <= 90) {
            this.animFrame = 7;
          } else if (this.stateTimer > 90) {
            this.isInvincible = false;
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.DIRTY_TACTIC:
          if (this.stateTimer <= 6) {
            this.animFrame = 0;
          } else if (this.stateTimer <= 15) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 18, 70, 38);
            this.currentAttackData = {
              damage: 50,
              hitStun: 70,
              blockStun: 20,
              pushback: 4,
              height: ATTACK_HEIGHT.UNBLOCKABLE,
              hitType: HIT_TYPE.DIRTY_STUN,
              stunFrames: 70
            };
          } else if (this.stateTimer <= 25) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        default:
          if (frames && frames.length > 0 && this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % frames.length;
          }
          break;
      }
    }
  };

  // src/fighters/Mighty.js
  var Mighty = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "mighty",
        name: "M1GHTY"
      });
      this.walkSpeed = 4.5;
      this.dashSpeed = 11;
      this.jumpForce = -13.8;
      this.maxHealth = 2500;
      this.health = 2500;
      this.ultimateTarget = null;
    }
    handleInput(inputState, inputManager, opponent) {
      if (this.hitStun > 0 || this.blockStun > 0 || this.state === FIGHTER_STATE.KNOCKDOWN) return;
      if (this.state === FIGHTER_STATE.SUBMISSION_LOCK) {
        if (inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputState.dirtyJust) {
          this.submissionStruggle = Math.min(100, (this.submissionStruggle || 0) + 25);
          soundFX.playWhoosh("heavy");
        }
        return;
      }
      const pNum = this.playerNum;
      if (this.heldPickup) {
        const wantsAttack = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputManager && (inputManager.peekAction(pNum) === "LP" || inputManager.peekAction(pNum) === "HP");
        if (wantsAttack && !this.isAttacking()) {
          if (inputManager) inputManager.consumeAction(pNum);
          this.executePickupAttack(this.heldPickup, opponent);
          return;
        }
      }
      this.isHoldingBack = !!inputState.back;
      this.isCrouching = !!inputState.down;
      const canSuper = this.superMeter >= 100 || inputManager.easyInputs;
      const wantsUltimate = inputState.ultimateJust || inputManager.peekAction(pNum) === "ULTIMATE";
      if (wantsUltimate && canSuper) {
        if (this.canCancelOnHit() || !this.isAttacking()) {
          inputManager.consumeBuffer(pNum);
          this.startUltimate(opponent);
          return;
        }
      }
      const wantsDirty = inputState.dirtyJust || inputManager.peekAction(pNum) === "DIRTY";
      if (wantsDirty && this.isGrounded && (!this.isAttacking() || this.canCancelOnHit())) {
        inputManager.consumeAction(pNum);
        this.startDivineSmite();
        return;
      }
      if (!this.isGrounded) {
        if (this.state === FIGHTER_STATE.JUMP) {
          if (inputState.lpJust || inputState.hpJust || inputManager.peekAction(pNum) === "LP" || inputManager.peekAction(pNum) === "HP") {
            inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_PUNCH);
            soundFX.playWhoosh("heavy");
          } else if (inputState.lkJust || inputState.hkJust || inputManager.peekAction(pNum) === "LK" || inputManager.peekAction(pNum) === "HK") {
            inputManager.consumeAction(pNum);
            this.changeState(FIGHTER_STATE.JUMP_KICK);
            soundFX.playWhoosh("heavy");
          }
        }
        return;
      }
      if (this.isAttacking() && !this.canCancelOnHit()) return;
      const anyAttackJust = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust;
      const isSP3 = inputManager.checkQCB(pNum) && anyAttackJust || inputState.sp3Just || inputManager.peekAction(pNum) === "SP3";
      if (isSP3) {
        inputManager.consumeBuffer(pNum);
        this.startVoidTremor(opponent);
        return;
      }
      const isSP2 = inputManager.checkDP(pNum) && anyAttackJust || inputState.sp2Just || inputManager.peekAction(pNum) === "SP2";
      if (isSP2) {
        inputManager.consumeBuffer(pNum);
        this.startApexShatter();
        return;
      }
      const isSP1 = inputManager.checkQCF(pNum) && anyAttackJust || inputState.sp1Just || inputManager.peekAction(pNum) === "SP1";
      if (isSP1) {
        inputManager.consumeBuffer(pNum);
        this.startGodPalm();
        return;
      }
      if (!this.isAttacking()) {
        if (inputState.dashFwd) {
          this.startDash(true);
          return;
        }
        if (inputState.dashBack) {
          this.startDash(false);
          return;
        }
      }
      const lpT = inputState.lpJust || inputManager.peekAction(pNum) === "LP";
      const hpT = inputState.hpJust || inputManager.peekAction(pNum) === "HP";
      const lkT = inputState.lkJust || inputManager.peekAction(pNum) === "LK";
      const hkT = inputState.hkJust || inputManager.peekAction(pNum) === "HK";
      if (inputState.down) {
        if (lpT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_PUNCH, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (hpT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_PUNCH, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (lkT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_LIGHT_KICK, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (hkT) {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.CROUCH_HEAVY_KICK, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        this.changeState(FIGHTER_STATE.CROUCH);
        return;
      }
      if (lpT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_PUNCH, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (hpT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (lkT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_LIGHT_KICK, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (hkT) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.ATTACK_HEAVY_KICK, true);
        soundFX.playWhoosh("heavy");
        return;
      }
      if (inputState.up) {
        this.vy = this.jumpForce;
        this.isGrounded = false;
        this.changeState(FIGHTER_STATE.JUMP);
        if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 4.2;
        else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 4.2;
        return;
      }
      if (inputState.fwd) {
        this.vx = (this.facingRight ? 1 : -1) * this.walkSpeed;
        this.changeState(FIGHTER_STATE.WALK_FWD);
      } else if (inputState.back) {
        this.vx = (this.facingRight ? -1 : 1) * (this.walkSpeed * 0.8);
        this.changeState(FIGHTER_STATE.WALK_BACK);
      } else {
        this.changeState(FIGHTER_STATE.IDLE);
      }
    }
    startGodPalm() {
      this.changeState(FIGHTER_STATE.SPECIAL_1);
      soundFX.playHadouken();
    }
    startApexShatter() {
      this.changeState(FIGHTER_STATE.SPECIAL_2);
      soundFX.playShoryuken();
      this.isInvincible = true;
      this.isGrounded = false;
      this.vy = -13;
      this.vx = (this.facingRight ? 1 : -1) * 5;
    }
    startVoidTremor(opponent) {
      this.changeState(FIGHTER_STATE.SPECIAL_3);
      soundFX.playWhoosh("heavy");
      if (opponent) {
        this.x = opponent.x + (opponent.facingRight ? -60 : 60);
        this.facingRight = !opponent.facingRight;
      }
    }
    startDivineSmite() {
      this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
      soundFX.playUltimateActivation();
      const originX = this.facingRight ? this.x + 50 : this.x + 10;
      for (let i = 0; i < 28; i++) {
        this.tacticalParticles.push({
          x: originX,
          y: this.y - 65 + (Math.random() - 0.5) * 25,
          vx: (this.facingRight ? 1 : -1) * (5 + Math.random() * 6),
          vy: (Math.random() - 0.5) * 4,
          size: 3 + Math.random() * 4,
          alpha: 1,
          color: Math.random() < 0.5 ? "#facc15" : "#38bdf8"
        });
      }
    }
    startUltimate(opponent) {
      this.superMeter = 0;
      this.changeState(FIGHTER_STATE.ULTIMATE);
      this.ultimateTarget = opponent;
      this.isInvincible = true;
      soundFX.playUltimateActivation();
      window.dispatchEvent(new CustomEvent("ultimate-activated", {
        detail: {
          fighter: this.id,
          playerNum: this.playerNum,
          name: this.name,
          ultimateName: "M1GHTY APEX EXTINCTION",
          kanji: "\u795E\u6EC5",
          subtitle: "ONE HIT EXTINCTION // DIVINE WILL"
        }
      }));
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      const godAttackData = (h = ATTACK_HEIGHT.UNBLOCKABLE) => ({
        damage: 9999,
        chipDamage: 9999,
        hitStun: 99,
        blockStun: 99,
        pushback: 14,
        height: h,
        hitType: HIT_TYPE.KNOCKDOWN
      });
      switch (this.state) {
        case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
          if (this.stateTimer <= 2) this.animFrame = 0;
          else if (this.stateTimer <= 7) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 28, 55, 24);
            this.currentAttackData = godAttackData();
          } else if (this.stateTimer <= 11) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 10) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 22, 65, 30);
            this.currentAttackData = godAttackData();
          } else if (this.stateTimer <= 16) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.ATTACK_LIGHT_KICK:
          if (this.stateTimer <= 2) this.animFrame = 0;
          else if (this.stateTimer <= 7) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 44, 58, 22);
            this.currentAttackData = godAttackData();
          } else if (this.stateTimer <= 12) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_KICK:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 12) {
            this.animFrame = 1;
            this.activeHitbox = new Box(34, 34, 75, 30);
            this.currentAttackData = godAttackData();
          } else if (this.stateTimer <= 18) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.CROUCH_LIGHT_PUNCH:
          if (this.stateTimer <= 2) this.animFrame = 0;
          else if (this.stateTimer <= 6) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 48, 50, 20);
            this.currentAttackData = godAttackData();
          } else if (this.stateTimer <= 10) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.CROUCH_HEAVY_PUNCH:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 9) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 40, 62, 26);
            this.currentAttackData = godAttackData();
          } else if (this.stateTimer <= 15) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.CROUCH_LIGHT_KICK:
          if (this.stateTimer <= 2) this.animFrame = 0;
          else if (this.stateTimer <= 7) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 56, 58, 20);
            this.currentAttackData = godAttackData();
          } else if (this.stateTimer <= 11) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.CROUCH_HEAVY_KICK:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 11) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 54, 85, 26);
            this.currentAttackData = godAttackData();
          } else if (this.stateTimer <= 17) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else this.changeState(FIGHTER_STATE.CROUCH);
          break;
        case FIGHTER_STATE.JUMP_PUNCH:
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 30, 62, 32);
          this.currentAttackData = godAttackData();
          break;
        case FIGHTER_STATE.JUMP_KICK:
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 34, 70, 28);
          this.currentAttackData = godAttackData();
          break;
        // SPECIAL 1: GOD PALM (One-Hit KO Projectile)
        case FIGHTER_STATE.SPECIAL_1:
          if (this.stateTimer <= 4) {
            this.animFrame = 0;
          } else if (this.stateTimer === 5) {
            this.animFrame = 1;
            if (this.spawnProjectile) {
              const p = new Projectile({
                owner: this,
                type: "god_palm",
                x: this.facingRight ? this.x + 55 : this.x - 45,
                y: this.y - 65,
                vx: (this.facingRight ? 1 : -1) * 12,
                width: 46,
                height: 38,
                damage: 9999,
                color: "#fbbf24"
              });
              p.attackHeight = ATTACK_HEIGHT.UNBLOCKABLE;
              this.spawnProjectile(p);
            }
            this.activeHitbox = new Box(36, 25, 55, 30);
            this.currentAttackData = godAttackData();
          } else if (this.stateTimer <= 15) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        // SPECIAL 2: APEX SHATTER (Invincible Rising Golden Strike)
        case FIGHTER_STATE.SPECIAL_2:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 14) {
            this.animFrame = 1;
            this.activeHitbox = new Box(30, 0, 65, 55);
            this.currentAttackData = godAttackData();
          } else if (this.stateTimer <= 22) {
            this.animFrame = 2;
            this.activeHitbox = null;
            this.isInvincible = false;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        // SPECIAL 3: VOID TREMOR (Flash Step Strike)
        case FIGHTER_STATE.SPECIAL_3:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 10) {
            this.animFrame = 1;
            this.activeHitbox = new Box(34, 30, 68, 30);
            this.currentAttackData = godAttackData();
          } else if (this.stateTimer <= 18) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        // DIRTY TACTIC: DIVINE SMITE
        case FIGHTER_STATE.DIRTY_TACTIC:
          if (this.stateTimer <= 4) {
            this.animFrame = 0;
          } else if (this.stateTimer <= 12) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 15, 75, 45);
            this.currentAttackData = godAttackData();
          } else if (this.stateTimer <= 20) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        // ULTIMATE: M1GHTY APEX EXTINCTION (Screen-shaking One-Hit KO Cinematic)
        case FIGHTER_STATE.ULTIMATE:
          if (this.stateTimer <= 15) {
            this.animFrame = Math.floor(this.stateTimer / 4);
            this.vx = 0;
          } else if (this.stateTimer === 18 && this.ultimateTarget) {
            this.x = this.ultimateTarget.x + (this.facingRight ? -50 : 50);
          } else if (this.stateTimer >= 22 && this.stateTimer <= 50) {
            this.animFrame = 4 + (this.stateTimer % 4 < 2 ? 0 : 1);
            if (this.stateTimer === 30 && this.ultimateTarget && !this.ultimateTarget.isDead) {
              this.ultimateTarget.takeHit({
                damage: 9999,
                chipDamage: 9999,
                hitStun: 99,
                blockStun: 99,
                pushback: 18,
                height: ATTACK_HEIGHT.UNBLOCKABLE,
                hitType: HIT_TYPE.KNOCKDOWN
              }, this.facingRight ? 1 : -1);
              soundFX.playKO();
            }
          } else if (this.stateTimer >= 55 && this.stateTimer <= 75) {
            this.animFrame = 7;
          } else if (this.stateTimer > 75) {
            this.isInvincible = false;
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        default:
          if (frames && frames.length > 0 && this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % frames.length;
          }
          break;
      }
    }
  };

  // src/fighters/bosses/RiotCop.js
  var RiotCop = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "riot_cop",
        name: "SGT. VANCE"
      });
      this.walkSpeed = 2.6;
      this.dashSpeed = 5.2;
      this.shieldRaised = true;
      this.shieldIntegrity = 120;
      this.maxShieldIntegrity = 120;
      this.shieldBrokenTimer = 0;
      this.isBatonElectrified = false;
    }
    takeHit(attackData, fromDirection) {
      if (this.isInvincible || this.isDead) return false;
      const hitFromFront = this.facingRight && fromDirection < 0 || !this.facingRight && fromDirection > 0;
      const isUnblockable = attackData.height === ATTACK_HEIGHT.UNBLOCKABLE;
      const isLowAnkle = attackData.height === ATTACK_HEIGHT.LOW;
      if (this.shieldRaised && hitFromFront && !isUnblockable && !isLowAnkle && this.shieldBrokenTimer <= 0) {
        soundFX.playBlock();
        const isSpecialOrProj = attackData.chipDamage && attackData.chipDamage > 0 || attackData.isProjectile;
        const shieldDmg = isSpecialOrProj ? attackData.damage * 2 : attackData.damage;
        this.shieldIntegrity -= shieldDmg;
        if (isSpecialOrProj) {
          this.health = Math.max(1, this.health - Math.floor(attackData.damage * 0.25));
        }
        this.vx = (this.facingRight ? -1 : 1) * 3.5;
        if (this.shieldIntegrity <= 0) {
          soundFX.playKO();
          this.shieldRaised = false;
          this.shieldBrokenTimer = 180;
          this.changeState(FIGHTER_STATE.HIT);
          return "shield_broken";
        }
        return "blocked";
      }
      if (isUnblockable) {
        this.shieldRaised = false;
        this.shieldBrokenTimer = 90;
      }
      const result = super.takeHit(attackData, fromDirection);
      if (this.health <= this.maxHealth * 0.5 && !this.isBatonElectrified) {
        this.isBatonElectrified = true;
        soundFX.playTaserShock();
      }
      return result;
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      if (this.shieldBrokenTimer > 0) {
        this.shieldBrokenTimer--;
        if (this.shieldBrokenTimer === 0) {
          this.shieldRaised = true;
          this.shieldIntegrity = this.maxShieldIntegrity;
        }
      }
      switch (this.state) {
        case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 9) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 26, 60, 20);
            this.currentAttackData = {
              damage: this.isBatonElectrified ? 55 : 40,
              hitStun: this.isBatonElectrified ? 24 : 14,
              blockStun: 12,
              pushback: 5,
              height: ATTACK_HEIGHT.MID,
              hitType: this.isBatonElectrified ? HIT_TYPE.DIRTY_STUN : HIT_TYPE.LIGHT,
              chipDamage: this.isBatonElectrified ? 8 : 0
            };
          } else if (this.stateTimer <= 14) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
          if (this.stateTimer <= 6) this.animFrame = 0;
          else if (this.stateTimer <= 13) {
            this.animFrame = 1;
            this.activeHitbox = new Box(35, 18, 55, 45);
            this.currentAttackData = {
              damage: 90,
              hitStun: 28,
              blockStun: 18,
              pushback: 8,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.KNOCKDOWN,
              chipDamage: 12
            };
          } else if (this.stateTimer <= 22) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        default:
          super.updateState(opponent);
          break;
      }
    }
    render(ctx) {
      super.render(ctx);
      if (this.shieldRaised && this.shieldBrokenTimer <= 0) {
        ctx.save();
        const sX = this.facingRight ? this.x + 48 : this.x + 12;
        const sY = this.y - 78;
        ctx.fillStyle = "rgba(71, 85, 105, 0.75)";
        ctx.fillRect(sX, sY, 18, 64);
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.strokeRect(sX, sY, 18, 64);
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(sX + 2, sY + 12, 14, 6);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 8px monospace";
        ctx.fillText("POLICE", sX - 5, sY - 4);
        if (this.isBatonElectrified && Math.random() < 0.4) {
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(sX + 12 + (Math.random() - 0.5) * 8, sY + 30 + (Math.random() - 0.5) * 8, 3, 3);
        }
        ctx.restore();
      }
    }
  };

  // src/fighters/bosses/Promoter.js
  var Promoter = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "promoter",
        name: "DANTE CRUZ"
      });
      this.walkSpeed = 4.2;
      this.dashSpeed = 9;
      this.hasSummonedWave1 = false;
      this.hasSummonedWave2 = false;
      this.cashBills = [];
      this.isWallLeaping = false;
    }
    throwCashScatter() {
      soundFX.playPocketSand();
      for (let i = 0; i < 20; i++) {
        this.cashBills.push({
          x: this.x + 35 + (Math.random() - 0.5) * 25,
          y: this.y - 60 + (Math.random() - 0.5) * 20,
          vx: (this.facingRight ? 1 : -1) * (3.5 + Math.random() * 4.5),
          vy: -1.5 + (Math.random() - 0.5) * 3,
          rot: Math.random() * Math.PI,
          alpha: 1
        });
      }
    }
    executeWallParkourLeap(isLeftWall) {
      this.isWallLeaping = true;
      this.isGrounded = false;
      soundFX.playWhoosh("heavy");
      this.vy = -11;
      this.vx = isLeftWall ? 7.5 : -7.5;
      this.changeState(FIGHTER_STATE.JUMP_KICK);
    }
    update(opponent, stageWidth = 960) {
      super.update(opponent, stageWidth);
      for (let i = this.cashBills.length - 1; i >= 0; i--) {
        const bill = this.cashBills[i];
        bill.x += bill.vx;
        bill.y += bill.vy;
        bill.vy += 0.15;
        bill.rot += 0.08;
        bill.alpha -= 0.02;
        if (bill.alpha <= 0 || bill.y > 310) {
          this.cashBills.splice(i, 1);
        }
      }
      if ((this.x <= 45 || this.x >= stageWidth - 125) && this.isGrounded && Math.random() < 0.04) {
        this.executeWallParkourLeap(this.x <= 45);
      }
      if (this.health <= this.maxHealth * 0.75 && !this.hasSummonedWave1) {
        this.hasSummonedWave1 = true;
        this.throwCashScatter();
      }
      if (this.health <= this.maxHealth * 0.35 && !this.hasSummonedWave2) {
        this.hasSummonedWave2 = true;
        this.throwCashScatter();
      }
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      switch (this.state) {
        case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 8) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 24, 62, 18);
            this.currentAttackData = {
              damage: 42,
              hitStun: 15,
              blockStun: 10,
              pushback: 4,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.LIGHT
            };
          } else if (this.stateTimer <= 13) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.JUMP_KICK:
          this.animFrame = 1;
          this.activeHitbox = new Box(32, 40, 65, 30);
          this.currentAttackData = {
            damage: 85,
            hitStun: 22,
            blockStun: 16,
            pushback: 6,
            height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.KNOCKDOWN
          };
          break;
        default:
          super.updateState(opponent);
          break;
      }
    }
    render(ctx) {
      super.render(ctx);
      if (this.cashBills.length > 0) {
        ctx.save();
        for (const bill of this.cashBills) {
          ctx.globalAlpha = Math.max(0, bill.alpha);
          ctx.translate(bill.x, bill.y);
          ctx.rotate(bill.rot);
          ctx.fillStyle = "#22c55e";
          ctx.fillRect(-6, -3, 12, 6);
          ctx.fillStyle = "#facc15";
          ctx.fillRect(-2, -2, 4, 4);
          ctx.rotate(-bill.rot);
          ctx.translate(-bill.x, -bill.y);
        }
        ctx.restore();
      }
    }
  };

  // src/fighters/bosses/BouncerTwins.js
  var BorisBouncer = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "boris",
        name: "BORIS"
      });
      this.maxHealth = 850;
      this.health = 850;
      this.walkSpeed = 2.2;
      this.dashSpeed = 4.8;
      this.isGrappling = false;
      this.isBloodRage = false;
    }
    takeHit(attackData, fromDirection) {
      if (this.state === FIGHTER_STATE.SPECIAL_1 && !attackData.height === ATTACK_HEIGHT.UNBLOCKABLE) {
        soundFX.playBlock();
        this.health = Math.max(1, this.health - Math.floor(attackData.damage * 0.5));
        this.armorFlash = 6;
        return "armored";
      }
      return super.takeHit(attackData, fromDirection);
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      switch (this.state) {
        case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
          if (this.stateTimer <= 7) this.animFrame = 0;
          else if (this.stateTimer <= 16) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 15, 60, 48);
            this.currentAttackData = {
              damage: 95,
              hitStun: 28,
              blockStun: 18,
              pushback: 7,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.KNOCKDOWN
            };
          } else if (this.stateTimer <= 25) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.SPECIAL_1:
          if (this.stateTimer <= 10) this.animFrame = 0;
          else if (this.stateTimer <= 18) {
            this.animFrame = 1;
            this.activeHitbox = new Box(34, 20, 52, 45);
            this.currentAttackData = {
              damage: 120,
              hitStun: 45,
              blockStun: 22,
              pushback: 8,
              height: ATTACK_HEIGHT.UNBLOCKABLE,
              hitType: HIT_TYPE.KNOCKDOWN
            };
          } else if (this.stateTimer <= 28) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        default:
          super.updateState(opponent);
          break;
      }
    }
  };
  var ViktorBouncer = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "viktor",
        name: "VIKTOR"
      });
      this.maxHealth = 750;
      this.health = 750;
      this.walkSpeed = 4.2;
      this.dashSpeed = 8.5;
      this.isBloodRage = false;
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      switch (this.state) {
        case FIGHTER_STATE.ATTACK_HEAVY_KICK:
          if (this.stateTimer <= 6) this.animFrame = 0;
          else if (this.stateTimer <= 14) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 20, 78, 30);
            this.currentAttackData = {
              damage: 80,
              hitStun: 22,
              blockStun: 16,
              pushback: 6,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.HEAVY
            };
          } else if (this.stateTimer <= 22) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.CROUCH_HEAVY_KICK:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 12) {
            this.animFrame = 1;
            this.activeHitbox = new Box(34, 56, 85, 24);
            this.currentAttackData = {
              damage: 75,
              hitStun: 30,
              blockStun: 14,
              pushback: 5,
              height: ATTACK_HEIGHT.LOW,
              hitType: HIT_TYPE.KNOCKDOWN
            };
          } else if (this.stateTimer <= 20) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.CROUCH);
          }
          break;
        default:
          super.updateState(opponent);
          break;
      }
    }
  };

  // src/fighters/bosses/Matriarch.js
  var Matriarch = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "matriarch",
        name: "MADAM CHEN"
      });
      this.walkSpeed = 3.8;
      this.dashSpeed = 8.5;
      this.isSwordDrawn = false;
      this.reversalCooldown = 0;
    }
    takeHit(attackData, fromDirection) {
      if (this.isInvincible || this.isDead) return false;
      const isNormal = attackData.hitType === HIT_TYPE.LIGHT || attackData.hitType === HIT_TYPE.HEAVY;
      const isUnblockable = attackData.height === ATTACK_HEIGHT.UNBLOCKABLE;
      if (this.state === FIGHTER_STATE.IDLE && isNormal && !isUnblockable && this.reversalCooldown <= 0 && Math.random() < 0.65) {
        this.reversalCooldown = 90;
        soundFX.playBlock();
        this.changeState(FIGHTER_STATE.SPECIAL_2);
        this.activeHitbox = new Box(32, 22, 55, 35);
        this.currentAttackData = {
          damage: 85,
          hitStun: 35,
          blockStun: 20,
          pushback: 6,
          height: ATTACK_HEIGHT.MID,
          hitType: HIT_TYPE.KNOCKDOWN
        };
        return "countered";
      }
      const res = super.takeHit(attackData, fromDirection);
      if (this.health <= this.maxHealth * 0.5 && !this.isSwordDrawn) {
        this.isSwordDrawn = true;
        soundFX.playFlashKick();
      }
      return res;
    }
    update(opponent, stageWidth = 960) {
      super.update(opponent, stageWidth);
      if (this.reversalCooldown > 0) this.reversalCooldown--;
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      switch (this.state) {
        case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 9) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 22, 60, 22);
            this.currentAttackData = {
              damage: this.isSwordDrawn ? 60 : 45,
              hitStun: 18,
              blockStun: 12,
              pushback: 4,
              height: ATTACK_HEIGHT.HIGH,
              hitType: this.isSwordDrawn ? HIT_TYPE.BLEED_SLASH : HIT_TYPE.LIGHT,
              chipDamage: this.isSwordDrawn ? 10 : 0
            };
          } else if (this.stateTimer <= 14) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
          if (this.stateTimer <= 6) this.animFrame = 0;
          else if (this.stateTimer <= 14) {
            this.animFrame = 1;
            this.activeHitbox = new Box(35, 18, 70, 36);
            this.currentAttackData = {
              damage: this.isSwordDrawn ? 105 : 75,
              hitStun: 28,
              blockStun: 18,
              pushback: 6,
              height: ATTACK_HEIGHT.MID,
              hitType: this.isSwordDrawn ? HIT_TYPE.BLEED_SLASH : HIT_TYPE.HEAVY,
              chipDamage: this.isSwordDrawn ? 18 : 0
            };
          } else if (this.stateTimer <= 22) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        default:
          super.updateState(opponent);
          break;
      }
    }
    render(ctx) {
      super.render(ctx);
      if (this.isSwordDrawn) {
        ctx.save();
        const sX = this.facingRight ? this.x + 55 : this.x + 8;
        const sY = this.y - 55;
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sX, sY);
        ctx.lineTo(sX + (this.facingRight ? 24 : -24), sY + 18);
        ctx.stroke();
        if (Math.random() < 0.3) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(sX + (this.facingRight ? 12 : -12), sY + 9, 3, 3);
        }
        ctx.restore();
      }
    }
  };

  // src/fighters/bosses/StreetLord.js
  var StreetLord = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "street_lord",
        name: "KRUGER"
      });
      this.maxHealth = 1200;
      this.health = 1200;
      this.walkSpeed = 2.4;
      this.dashSpeed = 5;
      this.isArmorPhase = false;
      this.overheatStunTimer = 0;
      this.steamVentTimer = 0;
    }
    takeHit(attackData, fromDirection) {
      if (this.isInvincible || this.isDead) return false;
      if (this.state === FIGHTER_STATE.OVERHEAT_STUN) {
        soundFX.playHitHeavy();
        const critDamage = Math.floor(attackData.damage * 2);
        this.health = Math.max(0, this.health - critDamage);
        this.armorFlash = 6;
        if (this.health <= 0) this.die();
        return "crit_hit";
      }
      if (this.isArmorPhase) {
        const isBreaker = attackData.height === ATTACK_HEIGHT.UNBLOCKABLE || attackData.hitType === HIT_TYPE.DIRTY_STUN || attackData.damage && attackData.damage >= 180;
        if (isBreaker) {
          this.triggerOverheatShutdown();
          this.health = Math.max(0, this.health - attackData.damage);
          this.armorFlash = 6;
          if (this.health <= 0) {
            this.die();
            return "ko";
          }
          return "overheat_break";
        }
        soundFX.playBlock();
        this.health = Math.max(0, this.health - Math.floor(attackData.damage * 0.7));
        this.armorFlash = 6;
        if (this.health <= 0) {
          this.die();
          return "ko";
        }
        return "armored";
      }
      const res = super.takeHit(attackData, fromDirection);
      if (this.health <= this.maxHealth * 0.4 && !this.isArmorPhase && this.state !== FIGHTER_STATE.OVERHEAT_STUN) {
        this.isArmorPhase = true;
        soundFX.playRageIgnite();
        soundFX.playNoiseCrack(0.4, 600, 0.6);
      }
      return res;
    }
    triggerOverheatShutdown() {
      this.isArmorPhase = false;
      this.changeState(FIGHTER_STATE.OVERHEAT_STUN);
      this.overheatStunTimer = 120;
      soundFX.playKO();
      soundFX.playNoiseCrack(0.5, 900, 0.7);
    }
    update(opponent, stageWidth = 960) {
      super.update(opponent, stageWidth);
      if (this.state === FIGHTER_STATE.OVERHEAT_STUN) {
        this.overheatStunTimer--;
        this.vx *= 0.85;
        if (this.stateTimer % 6 === 0) {
          this.tacticalParticles.push({
            x: this.x + 35 + (Math.random() - 0.5) * 20,
            y: this.y - 70,
            vx: (Math.random() - 0.5) * 2,
            vy: -2.5,
            size: 5,
            alpha: 0.8,
            color: "#e2e8f0"
          });
        }
        if (this.overheatStunTimer <= 0) {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        return;
      }
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      switch (this.state) {
        case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 11) {
            this.animFrame = 1;
            this.activeHitbox = new Box(40, 24, 68, 24);
            this.currentAttackData = {
              damage: 60,
              hitStun: 20,
              blockStun: 14,
              pushback: 6,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.HEAVY
            };
          } else if (this.stateTimer <= 17) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
          if (this.stateTimer <= 8) this.animFrame = 0;
          else if (this.stateTimer <= 18) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 16, 75, 52);
            this.currentAttackData = {
              damage: 110,
              hitStun: 35,
              blockStun: 22,
              pushback: 9,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.KNOCKDOWN,
              chipDamage: 22
            };
          } else if (this.stateTimer <= 28) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        default:
          super.updateState(opponent);
          break;
      }
    }
    render(ctx) {
      super.render(ctx);
      if (this.isArmorPhase) {
        ctx.save();
        const pX = this.facingRight ? this.x + 45 : this.x + 15;
        const pY = this.y - 50;
        ctx.fillStyle = Math.floor(Date.now() / 60) % 2 === 0 ? "#ea580c" : "#f97316";
        ctx.fillRect(pX, pY, 14, 22);
        ctx.restore();
      }
    }
  };

  // src/fighters/bosses/UrbanLegend.js
  var UrbanLegend = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "urban_legend",
        name: "THE SHADE"
      });
      this.walkSpeed = 4;
      this.dashSpeed = 8.8;
      this.isShadowGlitch = false;
    }
    takeHit(attackData, fromDirection) {
      if (attackData.height === ATTACK_HEIGHT.UNBLOCKABLE) {
        this.isShadowGlitch = true;
        setTimeout(() => {
          this.isShadowGlitch = false;
        }, 800);
      }
      return super.takeHit(attackData, fromDirection);
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      switch (this.state) {
        case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
          if (this.stateTimer <= 3) this.animFrame = 0;
          else if (this.stateTimer <= 6) {
            this.animFrame = 1;
            this.activeHitbox = new Box(40, 24, 60, 20);
            this.currentAttackData = {
              damage: 45,
              hitStun: 16,
              blockStun: 12,
              pushback: 3,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.LIGHT
            };
          } else if (this.stateTimer <= 10) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 12) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 20, 70, 36);
            this.currentAttackData = {
              damage: 90,
              hitStun: 26,
              blockStun: 18,
              pushback: 5,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.HEAVY
            };
          } else if (this.stateTimer <= 19) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        default:
          super.updateState(opponent);
          break;
      }
    }
    render(ctx) {
      ctx.save();
      ctx.filter = this.isShadowGlitch ? "invert(1) drop-shadow(0 0 10px red)" : "brightness(0.2) drop-shadow(0 0 6px cyan)";
      super.render(ctx);
      ctx.restore();
    }
  };

  // src/fighters/bosses/Champion.js
  var Champion = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "champion",
        name: "REX GANNON"
      });
      this.walkSpeed = 3.6;
      this.dashSpeed = 7.6;
      this.isApplyingSubmission = false;
      this.submissionTimer = 0;
      this.targetSubmissionLimb = LIMB_ZONE.LEAD_ARM;
      this.phase = 1;
      this.hasTransitioned = false;
      this.transitionTimer = 0;
      this.phase2FlameParticles = [];
      this.shockwaves = [];
    }
    takeHit(attackData, fromDirection) {
      if (this.isInvincible && this.transitionTimer <= 0) return false;
      if (this.isDead) return false;
      if (this.phase === 2 && attackData.hitType === HIT_TYPE.LIGHT) {
        soundFX.playBlock();
        this.health = Math.max(1, this.health - Math.floor(attackData.damage * 0.5));
        this.armorFlash = 5;
        return "armored";
      }
      if (this.phase === 1 && !this.hasTransitioned && this.health - attackData.damage <= 0) {
        this.triggerPhase2Transition();
        return "phase_transition";
      }
      const res = super.takeHit(attackData, fromDirection);
      if (this.phase === 2 && this.health <= 0) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("legend-vanquished", { detail: { boss: this } }));
        }
      }
      return res;
    }
    triggerPhase2Transition() {
      this.phase = 2;
      this.hasTransitioned = true;
      this.transitionTimer = 160;
      this.name = "REX GANNON, PRIMEVAL APEX";
      this.maxHealth = 1200;
      this.health = 1200;
      this.walkSpeed = 4.8;
      this.dashSpeed = 9.4;
      this.isInvincible = true;
      this.vx = 0;
      this.vy = 0;
      this.changeState(FIGHTER_STATE.IDLE);
      soundFX.playKO();
      soundFX.playRageIgnite();
      soundFX.playGong();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("elden-ring-phase2", { detail: { boss: this } }));
      }
    }
    attemptShootTakedown(opponent) {
      this.changeState(FIGHTER_STATE.SPECIAL_1);
      soundFX.playWhoosh("heavy");
      this.vx = (this.facingRight ? 1 : -1) * (this.phase === 2 ? 10.5 : 8.5);
    }
    startSubmissionLock(opponent, limbZone = LIMB_ZONE.LEAD_ARM) {
      this.isApplyingSubmission = true;
      this.submissionTimer = this.phase === 2 ? 130 : 160;
      this.targetSubmissionLimb = limbZone;
      opponent.changeState(FIGHTER_STATE.SUBMISSION_LOCK);
      opponent.submissionStruggle = 0;
      soundFX.playKnockdown();
    }
    update(opponent, stageWidth = 960) {
      if (this.transitionTimer > 0) {
        this.transitionTimer--;
        this.vx = 0;
        this.vy = 0;
        for (let i = 0; i < 4; i++) {
          this.phase2FlameParticles.push({
            x: this.x + 40 + (Math.random() - 0.5) * 45,
            y: this.y - Math.random() * 85,
            vx: (Math.random() - 0.5) * 3,
            vy: -(2.5 + Math.random() * 3.5),
            size: 4 + Math.random() * 5,
            alpha: 1,
            color: Math.random() < 0.6 ? "#dc2626" : Math.random() < 0.5 ? "#7c3aed" : "#fbbf24"
          });
        }
        if (this.transitionTimer <= 0) {
          this.isInvincible = false;
        }
        return;
      }
      super.update(opponent, stageWidth);
      if (this.phase === 2 && !this.isDead) {
        for (let i = 0; i < 3; i++) {
          this.phase2FlameParticles.push({
            x: this.x + 20 + Math.random() * 45,
            y: this.y - 10 - Math.random() * 75,
            vx: (Math.random() - 0.5) * 2.2,
            vy: -(2.2 + Math.random() * 3.2),
            size: 3 + Math.random() * 5,
            alpha: 1,
            color: Math.random() < 0.6 ? "#dc2626" : Math.random() < 0.5 ? "#9333ea" : "#f59e0b"
          });
        }
      }
      for (let i = this.phase2FlameParticles.length - 1; i >= 0; i--) {
        const p = this.phase2FlameParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.04;
        if (p.alpha <= 0) this.phase2FlameParticles.splice(i, 1);
      }
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.x += sw.vx;
        sw.life--;
        if (opponent && !opponent.isDead && sw.active && opponent.isGrounded) {
          if (Math.abs(sw.x - opponent.x) < 36) {
            sw.active = false;
            opponent.takeHit({
              damage: 65,
              hitStun: 26,
              blockStun: 14,
              pushback: 7,
              height: ATTACK_HEIGHT.LOW,
              hitType: HIT_TYPE.KNOCKDOWN,
              chipDamage: 12
            }, sw.vx > 0 ? 1 : -1);
            soundFX.playHitHeavy();
          }
        }
        if (sw.life <= 0 || sw.x < 0 || sw.x > stageWidth) {
          this.shockwaves.splice(i, 1);
        }
      }
      if (opponent && opponent.state === FIGHTER_STATE.KNOCKDOWN && !this.isApplyingSubmission && Math.abs(this.x - opponent.x) < 70) {
        this.startSubmissionLock(opponent, Math.random() < 0.5 ? LIMB_ZONE.LEAD_ARM : LIMB_ZONE.LEAD_LEG);
      }
      if (this.isApplyingSubmission) {
        this.submissionTimer--;
        this.vx = 0;
        if (opponent) {
          opponent.vx = 0;
          if (opponent.submissionStruggle >= 100) {
            this.isApplyingSubmission = false;
            soundFX.playWhoosh("light");
            opponent.changeState(FIGHTER_STATE.IDLE);
            this.changeState(FIGHTER_STATE.HIT);
            return;
          }
        }
        if (this.submissionTimer <= 0) {
          this.isApplyingSubmission = false;
          soundFX.playKO();
          if (opponent) {
            opponent.damageLimb(this.targetSubmissionLimb, 100);
            opponent.health = Math.max(1, opponent.health - (this.phase === 2 ? 140 : 90));
            opponent.changeState(FIGHTER_STATE.KNOCKDOWN);
          }
          this.changeState(FIGHTER_STATE.IDLE);
        }
      }
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      switch (this.state) {
        case FIGHTER_STATE.SPECIAL_1:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 14) {
            this.animFrame = 1;
            this.activeHitbox = new Box(32, 45, 65, 30);
            this.currentAttackData = {
              damage: this.phase === 2 ? 95 : 70,
              hitStun: 30,
              blockStun: 14,
              pushback: 6,
              height: ATTACK_HEIGHT.LOW,
              hitType: HIT_TYPE.KNOCKDOWN
            };
          } else if (this.stateTimer <= 22) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.SPECIAL_2:
          if (this.stateTimer <= 6) {
            this.animFrame = 0;
            this.vy = -4.5;
          } else if (this.stateTimer === 12) {
            this.animFrame = 1;
            soundFX.playKnockdown();
            soundFX.playHitHeavy();
            this.shockwaves.push({
              x: this.x + (this.facingRight ? 45 : 15),
              y: 295,
              vx: (this.facingRight ? 1 : -1) * 8.2,
              life: 65,
              active: true
            });
          } else if (this.stateTimer <= 22) {
            this.animFrame = 2;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.SPECIAL_3:
          if (this.stateTimer <= 4) {
            this.animFrame = 0;
            this.vx = (this.facingRight ? 1 : -1) * 5.5;
          } else if (this.stateTimer <= 16) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 20, 70, 35);
            this.currentAttackData = {
              damage: 110,
              hitStun: 35,
              blockStun: 20,
              pushback: 8,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.KNOCKDOWN,
              chipDamage: 20
            };
          } else if (this.stateTimer <= 25) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
          if (this.stateTimer <= 4) this.animFrame = 0;
          else if (this.stateTimer <= 9) {
            this.animFrame = 1;
            this.activeHitbox = new Box(38, 22, 58, 22);
            this.currentAttackData = {
              damage: this.phase === 2 ? 65 : 50,
              hitStun: 18,
              blockStun: 12,
              pushback: 4,
              height: ATTACK_HEIGHT.HIGH,
              hitType: HIT_TYPE.LIGHT
            };
          } else if (this.stateTimer <= 14) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
          if (this.stateTimer <= 6) this.animFrame = 0;
          else if (this.stateTimer <= 15) {
            this.animFrame = 1;
            this.activeHitbox = new Box(36, 18, 65, 40);
            this.currentAttackData = {
              damage: this.phase === 2 ? 120 : 95,
              hitStun: 30,
              blockStun: 18,
              pushback: 8,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.HEAVY
            };
          } else if (this.stateTimer <= 23) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        default:
          super.updateState(opponent);
          break;
      }
    }
    render(ctx) {
      this.shockwaves.forEach((sw) => {
        ctx.save();
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(sw.x - 8, 280, 16, 20);
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(sw.x - 5, 275, 10, 25);
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(sw.x - 2, 270, 4, 30);
        ctx.restore();
      });
      if (this.phase2FlameParticles.length > 0) {
        ctx.save();
        for (const p of this.phase2FlameParticles) {
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        ctx.restore();
      }
      ctx.save();
      if (this.phase === 2) {
        ctx.filter = "drop-shadow(0 0 10px #dc2626)";
      }
      super.render(ctx);
      ctx.restore();
      if (this.phase === 2 && !this.isDead) {
        ctx.save();
        const eyeX = this.facingRight ? this.x + 50 : this.x + 28;
        const eyeY = this.y - 78;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(eyeX, eyeY, 4, 3);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(eyeX + 1, eyeY + 1, 2, 1);
        ctx.restore();
      }
    }
  };

  // src/fighters/bosses/EndlessDragon.js
  var EndlessDragon = class extends Fighter {
    constructor(options) {
      super({
        ...options,
        id: "endless_dragon",
        name: "THE ENDLESS DRAGON"
      });
      this.maxHealth = 2600;
      this.health = 2600;
      this.walkSpeed = 3.4;
      this.dashSpeed = 8.5;
      this.jumpForce = -13.5;
      this.phase = 1;
      this.hasTransitioned = false;
      this.transitionTimer = 0;
      this.phase2FlameParticles = [];
      this.shockwaves = [];
      this.lightningBolts = [];
      this.isFlying = false;
      this.flightTimer = 0;
      this.hoverY = 175;
      this.wingFlapAngle = 0;
      this.diveBombing = false;
      this.carpetBombing = false;
      this.carpetTimer = 0;
      this.randomAbilityTimer = 90;
      this.currentAbility = null;
      this.abilityTimer = 0;
      this.flightCooldown = 120;
    }
    takeHit(attackData, fromDirection) {
      if (this.isInvincible && this.transitionTimer <= 0) return false;
      if (this.isDead) return false;
      if (this.isFlying && attackData.height === ATTACK_HEIGHT.LOW) {
        return false;
      }
      if (this.phase === 2 && attackData.hitType === HIT_TYPE.LIGHT) {
        soundFX.playBlock();
        this.health = Math.max(1, this.health - Math.floor(attackData.damage * 0.45));
        this.armorFlash = 6;
        return "armored";
      }
      if (this.phase === 1 && !this.hasTransitioned && this.health - attackData.damage <= 0) {
        this.triggerPhase2Transition();
        return "phase_transition";
      }
      if (this.isFlying && (attackData.hitType === HIT_TYPE.KNOCKDOWN || attackData.hitType === HIT_TYPE.HEAVY)) {
        this.endFlight(true);
      }
      const res = super.takeHit(attackData, fromDirection);
      if (this.phase === 2 && this.health <= 0) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("legend-vanquished", { detail: { boss: this } }));
        }
      }
      return res;
    }
    triggerPhase2Transition() {
      this.phase = 2;
      this.hasTransitioned = true;
      this.transitionTimer = 220;
      this.name = "THE ENDLESS DRAGON, ASCENDED";
      this.maxHealth = 2200;
      this.health = 2200;
      this.walkSpeed = 4.8;
      this.dashSpeed = 10.5;
      this.isInvincible = true;
      this.vx = 0;
      this.vy = 0;
      this.endFlight(false);
      this.changeState(FIGHTER_STATE.IDLE);
      soundFX.playKO();
      soundFX.playRageIgnite();
      soundFX.playGong();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("elden-ring-phase2", { detail: { boss: this } }));
      }
    }
    startFlight(duration = 420) {
      if (this.isFlying || this.isDead || this.state === FIGHTER_STATE.KNOCKDOWN) return;
      this.isFlying = true;
      this.flightTimer = duration;
      this.isGrounded = false;
      this.vy = -10;
      soundFX.playWhoosh("heavy");
      soundFX.playRageIgnite();
    }
    endFlight(crash = false) {
      this.isFlying = false;
      this.flightTimer = 0;
      this.diveBombing = false;
      this.carpetBombing = false;
      this.flightCooldown = 150;
      if (crash) {
        this.vy = 8;
        this.changeState(FIGHTER_STATE.KNOCKDOWN);
        soundFX.playHitHeavy();
      } else {
        this.vy = 4;
      }
    }
    handleInput(inputState, inputManager, opponent) {
      if (this.isCpu) return;
      if (this.hitStun > 0 || this.blockStun > 0 || this.state === FIGHTER_STATE.KNOCKDOWN) return;
      const pNum = this.playerNum;
      this.isHoldingBack = !!inputState.back;
      this.isCrouching = !this.isFlying && !!inputState.down;
      if (this.isFlying) {
        const flightSpeed = 5.2;
        if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * flightSpeed;
        else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * flightSpeed;
        else this.vx *= 0.85;
        if (inputState.up) this.hoverY = Math.max(120, this.hoverY - 3);
        if (inputState.down) this.hoverY = Math.min(230, this.hoverY + 3);
        if (inputState.hkJust || inputState.lkJust) {
          this.startCataclysmicDivebomb(opponent);
          return;
        }
        if (inputState.hpJust || inputState.lpJust) {
          this.fireCarpetFlame();
          return;
        }
        if (inputState.sp3Just) {
          this.endFlight(false);
          return;
        }
        return;
      }
      const canSuper = this.superMeter >= 100 || inputManager && inputManager.easyInputs;
      const wantsUltimate = inputState.ultimateJust || inputManager && inputManager.peekAction(pNum) === "ULTIMATE";
      if (wantsUltimate && canSuper && !this.isAttacking()) {
        if (inputManager) inputManager.consumeBuffer(pNum);
        this.startUltimate(opponent);
        return;
      }
      const wantsDirty = inputState.dirtyJust || inputManager && inputManager.peekAction(pNum) === "DIRTY";
      if (wantsDirty && this.isGrounded && !this.isAttacking()) {
        if (inputManager) inputManager.consumeAction(pNum);
        this.startDraconicRoar();
        return;
      }
      const anyAttackJust = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust;
      const isSP3 = inputState.sp3Just || inputManager && inputManager.peekAction(pNum) === "SP3";
      if (isSP3 && !this.isAttacking()) {
        if (inputManager) inputManager.consumeBuffer(pNum);
        this.startFlight(450);
        return;
      }
      const isSP1 = inputState.sp1Just || inputManager && (inputManager.checkQCF(pNum) && anyAttackJust || inputManager.peekAction(pNum) === "SP1");
      if (isSP1 && !this.isAttacking()) {
        if (inputManager) inputManager.consumeBuffer(pNum);
        this.changeState(FIGHTER_STATE.SPECIAL_1);
        soundFX.playWhoosh("heavy");
        return;
      }
      const isSP2 = inputState.sp2Just || inputManager && (inputManager.checkDP(pNum) && anyAttackJust || inputManager.peekAction(pNum) === "SP2");
      if (isSP2 && !this.isAttacking()) {
        if (inputManager) inputManager.consumeBuffer(pNum);
        this.changeState(FIGHTER_STATE.SPECIAL_2);
        soundFX.playWhoosh("heavy");
        return;
      }
      const lpT = inputState.lpJust;
      const hpT = inputState.hpJust;
      const lkT = inputState.lkJust;
      const hkT = inputState.hkJust;
      if (!this.isAttacking()) {
        if (inputState.down) {
          if (lpT) {
            this.changeState(FIGHTER_STATE.CROUCH_LIGHT_PUNCH, true);
            soundFX.playWhoosh("light");
            return;
          }
          if (hpT) {
            this.changeState(FIGHTER_STATE.CROUCH_HEAVY_PUNCH, true);
            soundFX.playWhoosh("heavy");
            return;
          }
          if (lkT) {
            this.changeState(FIGHTER_STATE.CROUCH_LIGHT_KICK, true);
            soundFX.playWhoosh("light");
            return;
          }
          if (hkT) {
            this.changeState(FIGHTER_STATE.CROUCH_HEAVY_KICK, true);
            soundFX.playWhoosh("heavy");
            return;
          }
          this.changeState(FIGHTER_STATE.CROUCH);
          return;
        }
        if (lpT) {
          this.changeState(FIGHTER_STATE.ATTACK_LIGHT_PUNCH, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hpT) {
          this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (lkT) {
          this.changeState(FIGHTER_STATE.ATTACK_LIGHT_KICK, true);
          soundFX.playWhoosh("light");
          return;
        }
        if (hkT) {
          this.changeState(FIGHTER_STATE.ATTACK_HEAVY_KICK, true);
          soundFX.playWhoosh("heavy");
          return;
        }
        if (inputState.up && this.isGrounded) {
          this.vy = this.jumpForce;
          this.isGrounded = false;
          this.changeState(FIGHTER_STATE.JUMP);
          return;
        }
        if (inputState.fwd) {
          this.vx = (this.facingRight ? 1 : -1) * this.walkSpeed;
          this.changeState(FIGHTER_STATE.WALK_FWD);
        } else if (inputState.back) {
          this.vx = (this.facingRight ? -1 : 1) * (this.walkSpeed * 0.75);
          this.changeState(FIGHTER_STATE.WALK_BACK);
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
      }
    }
    startDraconicRoar() {
      this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
      soundFX.playHadouken();
      this.shockwaves.push(
        { x: this.x + 40, vx: 6.5, life: 35, active: true, damage: 85, wide: true },
        { x: this.x + 40, vx: -6.5, life: 35, active: true, damage: 85, wide: true }
      );
    }
    startUltimate(opponent) {
      this.superMeter = 0;
      this.changeState(FIGHTER_STATE.ULTIMATE);
      this.isInvincible = true;
      soundFX.playUltimateActivation();
      soundFX.playGong();
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          if (!this.isDead) {
            const targetX = opponent ? opponent.x + (Math.random() - 0.5) * 120 : 300 + Math.random() * 360;
            this.shockwaves.push({
              x: targetX,
              vx: (Math.random() - 0.5) * 2,
              vy: 9,
              y: -60,
              life: 65,
              active: true,
              damage: 90,
              isAerial: true,
              wide: true
            });
            soundFX.playWhoosh("heavy");
          }
        }, i * 180);
      }
    }
    update(opponent, stageWidth = 960) {
      if (this.transitionTimer > 0) {
        this.transitionTimer--;
        this.vx = 0;
        this.vy = 0;
        for (let i = 0; i < 6; i++) {
          this.phase2FlameParticles.push({
            x: this.x + 40 + (Math.random() - 0.5) * 60,
            y: this.y - Math.random() * 95,
            vx: (Math.random() - 0.5) * 5,
            vy: -(3 + Math.random() * 5),
            size: 5 + Math.random() * 7,
            alpha: 1,
            color: Math.random() < 0.35 ? "#a855f7" : Math.random() < 0.5 ? "#ef4444" : "#fbbf24"
          });
        }
        if (this.transitionTimer <= 0) {
          this.isInvincible = false;
          this.randomAbilityTimer = 40;
          this.startFlight(480);
        }
        return;
      }
      this.wingFlapAngle += this.isFlying ? 0.28 : 0.08;
      if (this.isFlying && !this.diveBombing) {
        this.flightTimer--;
        this.isGrounded = false;
        const targetY = this.hoverY + Math.sin(Date.now() * 5e-3) * 12;
        this.y += (targetY - this.y) * 0.12;
        this.phase2FlameParticles.push({
          x: this.x + 10 + Math.random() * 60,
          y: this.y + 5,
          vx: (Math.random() - 0.5) * 2,
          vy: 2 + Math.random() * 2,
          size: 3 + Math.random() * 4,
          alpha: 0.9,
          color: Math.random() < 0.5 ? "#7c3aed" : "#fbbf24"
        });
        if (this.isCpu && opponent && !opponent.isDead) {
          const dist = opponent.x - this.x;
          const flightDir = dist > 0 ? 1 : -1;
          this.vx = flightDir * (this.phase === 2 ? 4.8 : 3.5);
          this.facingRight = dist > 0;
          if (this.flightTimer % 80 === 0) {
            const aerialMoves = ["carpet", "meteors", "dive"];
            const move = aerialMoves[Math.floor(Math.random() * aerialMoves.length)];
            if (move === "carpet") this.fireCarpetFlame();
            else if (move === "meteors") this.executeMeteorSwarm(stageWidth);
            else if (move === "dive") this.startCataclysmicDivebomb(opponent);
          }
        }
        if (this.flightTimer <= 0) {
          this.startCataclysmicDivebomb(opponent);
        }
      } else {
        if (this.flightCooldown > 0) this.flightCooldown--;
        super.update(opponent, stageWidth);
      }
      if (this.phase === 2 && !this.isDead) {
        for (let i = 0; i < 3; i++) {
          this.phase2FlameParticles.push({
            x: this.x + 20 + Math.random() * 50,
            y: this.y - 10 - Math.random() * 80,
            vx: (Math.random() - 0.5) * 2.5,
            vy: -(2.5 + Math.random() * 3.5),
            size: 3 + Math.random() * 5,
            alpha: 1,
            color: Math.random() < 0.4 ? "#a855f7" : Math.random() < 0.5 ? "#dc2626" : "#fbbf24"
          });
        }
        if (this.isCpu && !this.isAttacking() && this.state === FIGHTER_STATE.IDLE && !this.isFlying) {
          this.randomAbilityTimer--;
          if (this.randomAbilityTimer <= 0) {
            if (this.flightCooldown <= 0 && Math.random() < 0.55) {
              this.startFlight(450);
            } else {
              this.executeRandomAbility(opponent, stageWidth);
            }
            this.randomAbilityTimer = this.phase === 2 ? 70 + Math.floor(Math.random() * 35) : 100 + Math.floor(Math.random() * 45);
          }
        }
      } else if (this.isCpu && !this.isAttacking() && this.state === FIGHTER_STATE.IDLE && !this.isFlying) {
        if (this.flightCooldown <= 0 && Math.random() < 0.35) {
          this.startFlight(360);
        }
      }
      for (let i = this.phase2FlameParticles.length - 1; i >= 0; i--) {
        const p = this.phase2FlameParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.035;
        if (p.alpha <= 0) this.phase2FlameParticles.splice(i, 1);
      }
      if (this.phase2FlameParticles.length > 70) {
        this.phase2FlameParticles.splice(0, this.phase2FlameParticles.length - 70);
      }
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.x += sw.vx;
        if (sw.vy !== void 0) sw.y = (sw.y || 0) + sw.vy;
        sw.life--;
        if (opponent && !opponent.isDead && sw.active) {
          const hitRange = sw.wide ? 55 : 38;
          const swY = sw.y !== void 0 ? sw.y : 300;
          const yDist = Math.abs(swY - opponent.y);
          if (Math.abs(sw.x - opponent.x) < hitRange && yDist < 65) {
            sw.active = false;
            opponent.takeHit({
              damage: sw.damage || 75,
              hitStun: 28,
              blockStun: 16,
              pushback: 8,
              height: sw.height || ATTACK_HEIGHT.LOW,
              hitType: HIT_TYPE.KNOCKDOWN,
              chipDamage: 18
            }, sw.vx > 0 ? 1 : -1);
            soundFX.playHitHeavy();
          }
        }
        if (sw.life <= 0 || sw.x < -60 || sw.x > stageWidth + 60 || sw.y !== void 0 && sw.y > 330) {
          this.shockwaves.splice(i, 1);
        }
      }
      for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
        const lb = this.lightningBolts[i];
        lb.life--;
        if (lb.active && lb.life <= 20) {
          if (opponent && !opponent.isDead && Math.abs(lb.x - opponent.x) < 45) {
            lb.active = false;
            opponent.takeHit({
              damage: 85,
              hitStun: 30,
              blockStun: 18,
              pushback: 6,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.KNOCKDOWN,
              chipDamage: 16
            }, 1);
            soundFX.playHitHeavy();
          }
        }
        if (lb.life <= 0) this.lightningBolts.splice(i, 1);
      }
      if (this.diveBombing) {
        this.vy += 2;
        this.y += this.vy;
        this.x += this.vx;
        if (this.y >= 300) {
          this.y = 300;
          this.vy = 0;
          this.vx = 0;
          this.isGrounded = true;
          this.diveBombing = false;
          this.endFlight(false);
          soundFX.playKO();
          soundFX.playHitHeavy();
          if (opponent && !opponent.isDead && Math.abs(this.x - opponent.x) < 130) {
            opponent.takeHit({
              damage: this.phase === 2 ? 140 : 110,
              hitStun: 35,
              blockStun: 20,
              pushback: 12,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.KNOCKDOWN,
              chipDamage: 25
            }, this.facingRight ? 1 : -1);
          }
          this.shockwaves.push(
            { x: this.x + 40, vx: 7.5, life: 45, active: true, damage: 70, wide: true },
            { x: this.x + 40, vx: -7.5, life: 45, active: true, damage: 70, wide: true }
          );
        }
      }
    }
    fireCarpetFlame() {
      soundFX.playHadouken();
      const dir = this.facingRight ? 1 : -1;
      for (let i = 0; i < 3; i++) {
        this.shockwaves.push({
          x: this.x + dir * (30 + i * 40),
          y: this.y + 20,
          vx: dir * (4 + i),
          vy: 5,
          life: 50,
          active: true,
          damage: 65,
          wide: true,
          height: ATTACK_HEIGHT.LOW
        });
      }
    }
    startCataclysmicDivebomb(opponent) {
      this.diveBombing = true;
      this.vy = 16;
      soundFX.playWhoosh("heavy");
      if (opponent && !opponent.isDead) {
        this.vx = (opponent.x - this.x) * 0.055;
      }
    }
    executeMeteorSwarm(stageWidth) {
      soundFX.playWhoosh("heavy");
      const count = this.phase === 2 ? 6 : 4;
      for (let i = 0; i < count; i++) {
        const mx = 80 + Math.random() * (stageWidth - 160);
        this.shockwaves.push({
          x: mx,
          vx: (Math.random() - 0.5) * 2,
          vy: 8 + Math.random() * 2,
          y: -40 - i * 30,
          life: 75,
          active: true,
          damage: 75,
          isAerial: true,
          wide: true
        });
      }
    }
    executeRandomAbility(opponent, stageWidth) {
      const abilities = ["dragon_roar", "meteor_rain", "teleport_blitz", "void_lightning", "dive_bomb"];
      const choice = abilities[Math.floor(Math.random() * abilities.length)];
      switch (choice) {
        case "dragon_roar":
          this.startDraconicRoar();
          break;
        case "meteor_rain":
          this.executeMeteorSwarm(stageWidth);
          break;
        case "teleport_blitz":
          soundFX.playWhoosh("heavy");
          if (opponent && !opponent.isDead) {
            this.x = opponent.facingRight ? opponent.x - 75 : opponent.x + 75;
            this.facingRight = this.x < opponent.x;
            this.changeState(FIGHTER_STATE.SPECIAL_1);
          }
          break;
        case "void_lightning":
          soundFX.playHadouken();
          for (let i = 0; i < 3; i++) {
            const lx = 120 + Math.random() * (stageWidth - 240);
            this.lightningBolts.push({ x: lx, life: 35, active: true });
          }
          break;
        case "dive_bomb":
          this.startFlight(120);
          setTimeout(() => {
            if (this.isFlying) this.startCataclysmicDivebomb(opponent);
          }, 300);
          break;
      }
    }
    updateState(opponent) {
      this.animTimer++;
      const frames = this.sprites[this.state] || this.sprites.IDLE;
      switch (this.state) {
        case FIGHTER_STATE.SPECIAL_1:
          if (this.stateTimer <= 5) this.animFrame = 0;
          else if (this.stateTimer <= 14) {
            this.animFrame = 1;
            this.activeHitbox = new Box(20, 20, 100, 45);
            this.currentAttackData = {
              damage: this.phase === 2 ? 140 : 120,
              hitStun: 30,
              blockStun: 16,
              pushback: 8,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.KNOCKDOWN
            };
          } else if (this.stateTimer <= 24) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.SPECIAL_2:
          if (this.stateTimer <= 6) this.animFrame = 0;
          else if (this.stateTimer <= 15) {
            this.animFrame = 1;
            this.activeHitbox = new Box(10, 55, 100, 25);
            this.currentAttackData = {
              damage: this.phase === 2 ? 110 : 95,
              hitStun: 26,
              blockStun: 14,
              pushback: 8,
              height: ATTACK_HEIGHT.LOW,
              hitType: HIT_TYPE.KNOCKDOWN
            };
          } else if (this.stateTimer <= 25) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.SPECIAL_3:
          this.startFlight(420);
          this.changeState(FIGHTER_STATE.IDLE);
          break;
        case FIGHTER_STATE.DIRTY_TACTIC:
          if (this.stateTimer <= 6) {
            this.animFrame = 0;
          } else if (this.stateTimer <= 16) {
            this.animFrame = 1;
            this.activeHitbox = new Box(15, 15, 80, 50);
            this.currentAttackData = {
              damage: 80,
              hitStun: 50,
              blockStun: 18,
              pushback: 8,
              height: ATTACK_HEIGHT.UNBLOCKABLE,
              hitType: HIT_TYPE.DIRTY_STUN,
              stunFrames: 50
            };
          } else if (this.stateTimer <= 26) {
            this.animFrame = 2;
            this.activeHitbox = null;
          } else {
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        case FIGHTER_STATE.ULTIMATE:
          if (this.stateTimer <= 18) {
            this.animFrame = Math.floor(this.stateTimer / 5);
          } else if (this.stateTimer <= 75) {
            this.animFrame = 4 + (this.stateTimer % 4 < 2 ? 0 : 1);
          } else {
            this.isInvincible = false;
            this.changeState(FIGHTER_STATE.IDLE);
          }
          break;
        default:
          if (frames && frames.length > 0 && this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % frames.length;
          }
          break;
      }
    }
    render(ctx) {
      if (this.isFlying) {
        ctx.save();
        const altitude = 300 - this.y;
        const shadowW = Math.max(16, 45 - altitude * 0.15);
        const shadowAlpha = Math.max(0.12, 0.45 - altitude * 18e-4);
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(this.x + 40, 298, shadowW, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      super.render(ctx);
      if (this.isFlying && !this.isDead) {
        ctx.save();
        ctx.fillStyle = this.phase === 2 ? "rgba(192, 132, 252, 0.65)" : "rgba(239, 68, 68, 0.55)";
        const flapY = Math.sin(this.wingFlapAngle) * 10;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y - 45);
        ctx.lineTo(this.x - 35, this.y - 75 + flapY);
        ctx.lineTo(this.x - 10, this.y - 30);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.x + 60, this.y - 45);
        ctx.lineTo(this.x + 105, this.y - 75 + flapY);
        ctx.lineTo(this.x + 80, this.y - 30);
        ctx.fill();
        ctx.restore();
      }
      for (const p of this.phase2FlameParticles) {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (const sw of this.shockwaves) {
        if (!sw.active) continue;
        ctx.fillStyle = this.phase === 2 ? "rgba(168, 85, 247, 0.75)" : "rgba(239, 68, 68, 0.75)";
        const swY = sw.y !== void 0 ? sw.y : 290;
        if (sw.isAerial) {
          ctx.beginPath();
          ctx.arc(sw.x, swY, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fbbf24";
          ctx.beginPath();
          ctx.arc(sw.x, swY, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(sw.x, swY, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(sw.x - 15, 285, 30, 14);
          ctx.fillStyle = "#fbbf24";
          ctx.fillRect(sw.x - 8, 288, 16, 7);
        }
      }
      for (const lb of this.lightningBolts) {
        if (!lb.active) continue;
        ctx.save();
        ctx.strokeStyle = "#c084fc";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(lb.x, 0);
        ctx.lineTo(lb.x - 8, 100);
        ctx.lineTo(lb.x + 10, 200);
        ctx.lineTo(lb.x, 300);
        ctx.stroke();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }
      if ((this.phase === 2 || this.isFlying) && !this.isDead) {
        ctx.globalAlpha = 0.18 + Math.sin(Date.now() * 4e-3) * 0.09;
        ctx.fillStyle = this.phase === 2 ? "#7c3aed" : "#dc2626";
        ctx.beginPath();
        ctx.arc(this.x + 38, this.y - 45, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  };

  // src/network/Netplay.js
  var Netplay = class {
    constructor() {
      this.peer = null;
      this.conn = null;
      this.isHost = false;
      this.roomCode = null;
      this.status = "DISCONNECTED";
      this.statusMessage = "";
      this.ping = 0;
      this.lastPingSent = 0;
      this.pingInterval = null;
      this.remoteInputState = {};
      this.latestSnapshot = null;
      this.onConnectCallbacks = [];
      this.onDisconnectCallbacks = [];
      this.onMessageCallbacks = [];
    }
    get isConnected() {
      return this.status === "CONNECTED" && this.conn && this.conn.open;
    }
    generateRoomCode() {
      return Math.floor(1e4 + Math.random() * 9e4).toString();
    }
    onConnect(cb) {
      this.onConnectCallbacks.push(cb);
    }
    onDisconnect(cb) {
      this.onDisconnectCallbacks.push(cb);
    }
    onMessage(cb) {
      this.onMessageCallbacks.push(cb);
    }
    hostMatch(customCode = null) {
      this.disconnect();
      this.isHost = true;
      this.roomCode = customCode || this.generateRoomCode();
      this.status = "HOSTING";
      this.statusMessage = "REGISTERING ROOM...";
      if (typeof window === "undefined" || !window.Peer) {
        this.statusMessage = "PEERJS NOT LOADED";
        console.warn("PeerJS library not loaded. Check internet connection or CDN.");
        return;
      }
      try {
        const peerId = `final-impact-room-${this.roomCode}`;
        this.peer = new window.Peer(peerId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              { urls: "stun:global.stun.twilio.com:3478" }
            ]
          }
        });
        this.peer.on("open", (id) => {
          this.status = "HOSTING";
          this.statusMessage = "WAITING FOR CHALLENGER...";
        });
        this.peer.on("connection", (conn) => {
          this.setupConnection(conn);
        });
        this.peer.on("error", (err) => {
          console.error("Host Peer error:", err);
          if (err.type === "unavailable-id") {
            this.hostMatch();
          } else {
            this.statusMessage = `ERROR: ${err.type || "SIGNALING FAILED"}`;
          }
        });
      } catch (e) {
        console.error("Failed to instantiate Peer:", e);
        this.statusMessage = "NETPLAY INITIALIZATION FAILED";
      }
    }
    joinMatch(code) {
      if (!code) return;
      this.disconnect();
      this.isHost = false;
      const cleanCode = code.toString().trim().replace(/^IMP-/i, "").replace(/[^0-9a-zA-Z]/g, "");
      this.roomCode = cleanCode;
      this.status = "CONNECTING";
      this.statusMessage = "CONNECTING TO HOST...";
      if (typeof window === "undefined" || !window.Peer) {
        this.statusMessage = "PEERJS NOT LOADED";
        return;
      }
      try {
        this.peer = new window.Peer({
          debug: 1,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              { urls: "stun:global.stun.twilio.com:3478" }
            ]
          }
        });
        this.peer.on("open", (id) => {
          const targetId = `final-impact-room-${cleanCode}`;
          const conn = this.peer.connect(targetId, {
            reliable: true,
            serialization: "json"
          });
          this.setupConnection(conn);
        });
        this.peer.on("error", (err) => {
          console.error("Join Peer error:", err);
          this.statusMessage = `ROOM NOT FOUND (${cleanCode})`;
        });
      } catch (e) {
        console.error("Failed to connect:", e);
        this.statusMessage = "CONNECTION ATTEMPT FAILED";
      }
    }
    setupConnection(conn) {
      this.conn = conn;
      conn.on("open", () => {
        this.status = "CONNECTED";
        this.statusMessage = "CHALLENGER CONNECTED!";
        this.startPingTracker();
        this.onConnectCallbacks.forEach((cb) => cb(this.isHost));
      });
      conn.on("data", (data) => {
        this.handleIncomingData(data);
      });
      conn.on("close", () => {
        this.status = "DISCONNECTED";
        this.statusMessage = "CONNECTION CLOSED";
        this.stopPingTracker();
        this.onDisconnectCallbacks.forEach((cb) => cb());
      });
      conn.on("error", (err) => {
        console.error("Data connection error:", err);
        this.statusMessage = "CONNECTION ERROR";
      });
    }
    handleIncomingData(data) {
      if (!data || !data.type) return;
      if (data.type === "PING") {
        this.send({ type: "PONG", t: data.t });
        return;
      }
      if (data.type === "PONG") {
        const rtt = Date.now() - data.t;
        this.ping = Math.max(1, Math.round(rtt / 2));
        return;
      }
      if (data.type === "INPUT") {
        const incoming = data.inputs || {};
        if (this.remoteInputState) {
          if (this.remoteInputState.lpJust) incoming.lpJust = true;
          if (this.remoteInputState.hpJust) incoming.hpJust = true;
          if (this.remoteInputState.lkJust) incoming.lkJust = true;
          if (this.remoteInputState.hkJust) incoming.hkJust = true;
          if (this.remoteInputState.sp1Just) incoming.sp1Just = true;
          if (this.remoteInputState.sp2Just) incoming.sp2Just = true;
          if (this.remoteInputState.sp3Just) incoming.sp3Just = true;
          if (this.remoteInputState.dirtyJust) incoming.dirtyJust = true;
          if (this.remoteInputState.ultimateJust) incoming.ultimateJust = true;
        }
        this.remoteInputState = incoming;
      } else if (data.type === "SNAPSHOT") {
        this.latestSnapshot = data;
      }
      this.onMessageCallbacks.forEach((cb) => cb(data));
    }
    send(data) {
      if (this.conn && this.conn.open) {
        try {
          this.conn.send(data);
        } catch (err) {
          console.warn("Failed to send packet:", err);
        }
      }
    }
    sendInput(inputState) {
      this.send({
        type: "INPUT",
        inputs: inputState
      });
    }
    sendSnapshot(snapshot) {
      this.send({
        type: "SNAPSHOT",
        ...snapshot
      });
    }
    sendRematchVote(vote) {
      this.send({
        type: "REMATCH_VOTE",
        vote
      });
    }
    startPingTracker() {
      this.stopPingTracker();
      this.pingInterval = setInterval(() => {
        if (this.isConnected) {
          this.send({ type: "PING", t: Date.now() });
        }
      }, 1e3);
    }
    stopPingTracker() {
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
    }
    disconnect() {
      this.stopPingTracker();
      if (this.conn) {
        try {
          this.conn.close();
        } catch (e) {
        }
        this.conn = null;
      }
      if (this.peer) {
        try {
          this.peer.destroy();
        } catch (e) {
        }
        this.peer = null;
      }
      this.status = "DISCONNECTED";
      this.statusMessage = "";
      this.roomCode = null;
      this.remoteInputState = {};
      this.latestSnapshot = null;
    }
  };

  // src/ui/OnlineLobby.js
  var OnlineLobby = class {
    constructor(netplay, game) {
      this.netplay = netplay;
      this.game = game;
      this.subState = "MENU";
      this.menuIndex = 0;
      this.matchMode = "versus";
      this.joinInputCode = "";
      this.copiedToastTimer = 0;
      this.animTimer = 0;
      if (typeof window !== "undefined") {
        window.addEventListener("paste", (e) => {
          if (this.game.screen === "ONLINE_LOBBY" && this.subState === "JOINING") {
            const text = (e.clipboardData || window.clipboardData).getData("text");
            if (text) {
              const clean = text.replace(/[^0-9a-zA-Z]/g, "").slice(0, 6);
              this.joinInputCode = clean;
              soundFX.playWhoosh("light");
            }
          }
        });
      }
    }
    reset(preserveMode = false) {
      this.subState = "MENU";
      this.menuIndex = 0;
      this.joinInputCode = "";
      this.copiedToastTimer = 0;
      if (!preserveMode) {
        this.matchMode = "versus";
      }
    }
    copyInviteLink() {
      if (!this.netplay.roomCode) return;
      const url = `${window.location.origin}${window.location.pathname}?room=${this.netplay.roomCode}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          this.copiedToastTimer = 90;
          soundFX.playSuperReady();
        }).catch(() => {
          this.fallbackCopyText(url);
        });
      } else {
        this.fallbackCopyText(url);
      }
    }
    fallbackCopyText(text) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        this.copiedToastTimer = 90;
        soundFX.playSuperReady();
      } catch (e) {
        console.warn("Copy failed", e);
      }
    }
    handleInput(inputState) {
      if (inputState.toggleMode && (this.subState === "MENU" || this.subState === "HOSTING")) {
        this.matchMode = this.matchMode === "versus" ? "coop_campaign" : "versus";
        soundFX.playWhoosh("light");
      }
      if (this.subState === "MENU") {
        if (inputState.up || inputState.down) {
          this.menuIndex = 1 - this.menuIndex;
          soundFX.playWhoosh("light");
        }
        if (inputState.confirm) {
          if (this.menuIndex === 0) {
            this.subState = "HOSTING";
            this.netplay.hostMatch();
            soundFX.playMenuSelect();
          } else {
            this.subState = "JOINING";
            this.joinInputCode = "";
            soundFX.playMenuSelect();
          }
        }
        return;
      }
      if (this.subState === "HOSTING") {
        if (inputState.copy) {
          this.copyInviteLink();
        }
        if (inputState.back) {
          this.netplay.disconnect();
          this.subState = "MENU";
          soundFX.playWhoosh("light");
        }
        return;
      }
      if (this.subState === "JOINING") {
        if (inputState.back) {
          this.netplay.disconnect();
          this.subState = "MENU";
          soundFX.playWhoosh("light");
          return;
        }
        if (inputState.key) {
          const k = inputState.key;
          if (k === "Backspace") {
            if (this.joinInputCode.length > 0) {
              this.joinInputCode = this.joinInputCode.slice(0, -1);
              soundFX.playWhoosh("light");
            }
          } else if (/^[0-9a-zA-Z]$/.test(k) && this.joinInputCode.length < 6) {
            this.joinInputCode += k.toUpperCase();
            soundFX.playWhoosh("light");
          } else if (k === "Enter") {
            if (this.joinInputCode.length >= 4 && this.netplay.status !== "CONNECTING") {
              this.netplay.joinMatch(this.joinInputCode);
              soundFX.playMenuSelect();
            }
          }
        }
        if (inputState.confirm && this.joinInputCode.length >= 4 && this.netplay.status !== "CONNECTING") {
          this.netplay.joinMatch(this.joinInputCode);
          soundFX.playMenuSelect();
        }
      }
    }
    handleClick(x, y) {
      const W = this.game && this.game.canvas ? this.game.canvas.width : 640;
      if (x >= 12 && x <= 110 && y >= 10 && y <= 34) {
        if (this.subState === "MENU") {
          if (this.game) this.game.screen = "MODE_SELECT";
          soundFX.playWhoosh("light");
        } else {
          this.netplay.disconnect();
          this.subState = "MENU";
          soundFX.playWhoosh("light");
        }
        return true;
      }
      if (this.subState === "MENU" || this.subState === "HOSTING") {
        const pillW = 280;
        const pillH = 22;
        const pillX = W / 2 - pillW / 2;
        const pillY = 54;
        if (x >= pillX && x <= pillX + pillW && y >= pillY && y <= pillY + pillH) {
          this.matchMode = this.matchMode === "versus" ? "coop_campaign" : "versus";
          soundFX.playWhoosh("light");
          return true;
        }
      }
      if (this.subState === "MENU") {
        const boxW = 420;
        const boxH = 62;
        const startY = 88;
        const gapY = 76;
        if (x >= W / 2 - boxW / 2 && x <= W / 2 + boxW / 2 && y >= startY && y <= startY + boxH) {
          this.menuIndex = 0;
          this.handleInput({ confirm: true });
          return true;
        } else if (x >= W / 2 - boxW / 2 && x <= W / 2 + boxW / 2 && y >= startY + gapY && y <= startY + gapY + boxH) {
          this.menuIndex = 1;
          this.handleInput({ confirm: true });
          return true;
        }
      } else if (this.subState === "HOSTING") {
        if (y >= 120 && y <= 200) {
          this.copyInviteLink();
          return true;
        }
      } else if (this.subState === "JOINING") {
        if (y >= 130 && y <= 185 && this.joinInputCode.length >= 4) {
          this.netplay.joinMatch(this.joinInputCode);
          soundFX.playMenuSelect();
          return true;
        }
      }
      return false;
    }
    render(ctx, W, H) {
      this.animTimer++;
      if (this.copiedToastTimer > 0) this.copiedToastTimer--;
      ctx.fillStyle = "#08051a";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#27184d";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(30, 27, 75, 0.85)";
      ctx.fillRect(12, 10, 95, 22);
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 1;
      ctx.strokeRect(12, 10, 95, 22);
      ctx.fillStyle = "#fde047";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      const backLabel = this.subState === "MENU" ? "\u2B05\uFE0F MODES [B]" : "\u2B05\uFE0F CANCEL [B]";
      ctx.fillText(backLabel, 60, 24);
      ctx.textAlign = "center";
      ctx.fillStyle = "#c084fc";
      ctx.font = "bold 18px monospace";
      ctx.fillText("\u{1F310} FINAL IMPACT - ONLINE NETPLAY", W / 2, 26);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px monospace";
      ctx.fillText("WEBRTC ZERO-SETUP PEER-TO-PEER NETPLAY", W / 2, 40);
      const isCoop = this.matchMode === "coop_campaign";
      const pillW = 280;
      const pillH = 22;
      const pillX = W / 2 - pillW / 2;
      const pillY = 54;
      ctx.fillStyle = isCoop ? "rgba(88, 28, 135, 0.85)" : "rgba(30, 27, 75, 0.85)";
      ctx.fillRect(pillX, pillY, pillW, pillH);
      ctx.strokeStyle = isCoop ? "#facc15" : "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pillX, pillY, pillW, pillH);
      ctx.fillStyle = isCoop ? "#fde047" : "#38bdf8";
      ctx.font = "bold 10px monospace";
      const modeLabel = isCoop ? "\u{1F91D} MODE: CO-OP CAMPAIGN (2P RAID)" : "\u2694\uFE0F MODE: 1V1 VERSUS";
      ctx.fillText(`${modeLabel} \u27F3 [M]`, W / 2, pillY + 15);
      if (this.subState === "MENU") {
        const boxW = 420;
        const boxH = 62;
        const startY = 88;
        const gapY = 76;
        const options = [
          { title: "\u{1F451} HOST A MATCH", desc: isCoop ? "Host a 2P Co-Op Boss Raid & generate Room Code" : "Generate a Room Code and invite your friend" },
          { title: "\u2694\uFE0F JOIN A MATCH", desc: isCoop ? "Enter 5-digit Room Code to join Co-Op Raid" : "Enter a 5-digit Room Code to connect" }
        ];
        options.forEach((opt, idx) => {
          const isSelected = this.menuIndex === idx;
          const y = startY + idx * gapY;
          ctx.fillStyle = isSelected ? "#1e1b4b" : "#0f0c24";
          ctx.fillRect(W / 2 - boxW / 2, y, boxW, boxH);
          ctx.strokeStyle = isSelected ? isCoop ? "#facc15" : "#a855f7" : "#3b2d6b";
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.strokeRect(W / 2 - boxW / 2, y, boxW, boxH);
          if (isSelected) {
            ctx.fillStyle = "#fde047";
            ctx.font = "bold 16px monospace";
            ctx.fillText(`\u25BA ${opt.title} \u25C4`, W / 2, y + 26);
          } else {
            ctx.fillStyle = "#e2e8f0";
            ctx.font = "bold 15px monospace";
            ctx.fillText(opt.title, W / 2, y + 26);
          }
          ctx.fillStyle = "#94a3b8";
          ctx.font = "11px monospace";
          ctx.fillText(opt.desc, W / 2, y + 48);
        });
        ctx.fillStyle = "#facc15";
        ctx.font = "12px monospace";
        ctx.fillText("[W / S] NAVIGATE  |  [M] TOGGLE MODE  |  [ENTER] CONFIRM  |  [B / ESC] BACK", W / 2, H - 24);
      } else if (this.subState === "HOSTING") {
        const code = this.netplay.roomCode || ".....";
        ctx.fillStyle = "#170f36";
        ctx.fillRect(W / 2 - 200, 85, 400, 190);
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 2;
        ctx.strokeRect(W / 2 - 200, 85, 400, 190);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 14px monospace";
        ctx.fillText("SHARE THIS ROOM CODE WITH YOUR FRIEND:", W / 2, 115);
        ctx.fillStyle = "#090518";
        ctx.fillRect(W / 2 - 130, 130, 260, 52);
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 2;
        ctx.strokeRect(W / 2 - 130, 130, 260, 52);
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 28px monospace";
        ctx.fillText(code, W / 2, 166);
        const pulse = Math.floor(Date.now() / 350) % 2 === 0;
        ctx.fillStyle = pulse ? "#38bdf8" : "#0284c7";
        ctx.font = "12px monospace";
        ctx.fillText(this.netplay.statusMessage || "WAITING FOR CHALLENGER TO CONNECT...", W / 2, 215);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px monospace";
        ctx.fillText("CLICK CODE OR PRESS [C] TO COPY LINK  |  [B / ESC] CANCEL", W / 2, 248);
        if (this.copiedToastTimer > 0) {
          ctx.fillStyle = "#22c55e";
          ctx.font = "bold 13px monospace";
          ctx.fillText("\u2713 INVITE LINK COPIED TO CLIPBOARD!", W / 2, 298);
        }
      } else if (this.subState === "JOINING") {
        ctx.fillStyle = "#170f36";
        ctx.fillRect(W / 2 - 200, 85, 400, 190);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.strokeRect(W / 2 - 200, 85, 400, 190);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 14px monospace";
        ctx.fillText("ENTER 5-DIGIT ROOM CODE:", W / 2, 115);
        ctx.fillStyle = "#090518";
        ctx.fillRect(W / 2 - 130, 130, 260, 52);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.strokeRect(W / 2 - 130, 130, 260, 52);
        const displayCode = (this.joinInputCode + "_____").slice(0, 5);
        const cursor = Math.floor(Date.now() / 400) % 2 === 0 ? "|" : "";
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 28px monospace";
        ctx.fillText(this.joinInputCode + cursor, W / 2, 166);
        if (this.netplay.statusMessage) {
          ctx.fillStyle = this.netplay.statusMessage.includes("ERROR") || this.netplay.statusMessage.includes("NOT FOUND") ? "#ef4444" : "#facc15";
          ctx.font = "12px monospace";
          ctx.fillText(this.netplay.statusMessage, W / 2, 215);
        } else {
          ctx.fillStyle = "#94a3b8";
          ctx.font = "11px monospace";
          ctx.fillText("TYPE DIGITS ON KEYBOARD (OR CTRL+V TO PASTE)", W / 2, 215);
        }
        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px monospace";
        ctx.fillText("[ENTER] CONNECT  |  [BACKSPACE] DELETE  |  [B / ESC] CANCEL", W / 2, 248);
      }
      ctx.textAlign = "left";
    }
  };

  // src/ui/StageSelect.js
  var MODE_LABELS = {
    cpu: "1V1 VS CPU",
    "2p": "1V1 LOCAL VERSUS",
    "2v2": "2V2 TEAM BRAWL",
    online: "ONLINE VERSUS",
    training: "TRAINING DOJO"
  };
  var StageSelect = class {
    constructor(catalog) {
      this.catalog = catalog;
      this.index = 0;
      this.tick = 0;
      this.thumbs = {};
      this.liveStage = null;
      this.liveStageId = null;
      this.mode = "cpu";
      this.p1Name = "P1";
      this.p2Name = "CPU";
      this.canChoose = true;
      this.layout = {
        preview: { x: 20, y: 52, w: 312, h: 176 },
        info: { x: 346, y: 52, w: 274, h: 176 },
        tileW: 84,
        tileH: 47,
        tileGap: 4,
        tileY: 242,
        back: { x: 12, y: 10, w: 95, h: 22 },
        btn: { w: 360, h: 26 }
      };
    }
    // Total selectable tiles = every arena + the RANDOM tile
    get count() {
      return this.catalog.length + 1;
    }
    get isRandom() {
      return this.index === this.catalog.length;
    }
    setContext({ mode = "cpu", p1Name = "P1", p2Name = "CPU", canChoose = true } = {}) {
      this.mode = mode;
      this.p1Name = p1Name;
      this.p2Name = p2Name;
      this.canChoose = canChoose;
      this.tick = 0;
      this.liveStage = null;
      this.liveStageId = null;
    }
    setIndex(idx) {
      if (typeof idx !== "number" || isNaN(idx)) return;
      this.index = (idx % this.count + this.count) % this.count;
    }
    move(dir) {
      this.index = (this.index + dir + this.count) % this.count;
      try {
        soundFX.playWhoosh("light");
      } catch (e) {
      }
    }
    handleInput(inputState) {
      if (!this.canChoose) return false;
      if (inputState.left) {
        this.move(-1);
        return true;
      }
      if (inputState.right) {
        this.move(1);
        return true;
      }
      if (inputState.up) {
        this.move(-4);
        return true;
      }
      if (inputState.down) {
        this.move(4);
        return true;
      }
      return false;
    }
    // Resolve the current tile into a concrete catalog index (RANDOM picks one)
    resolveSelection() {
      if (this.isRandom) {
        return Math.floor(Math.random() * this.catalog.length);
      }
      return this.index;
    }
    getTileX(i, W = 640) {
      const { tileW, tileGap } = this.layout;
      const total = this.count * tileW + (this.count - 1) * tileGap;
      return (W - total) / 2 + i * (tileW + tileGap);
    }
    handleClick(x, y, W = 640, H = 360, callbacks = {}) {
      const { onBack, onConfirm } = callbacks;
      const { back, tileW, tileH, tileY, preview, btn } = this.layout;
      if (x >= back.x && x <= back.x + back.w && y >= back.y && y <= back.y + back.h) {
        try {
          soundFX.playWhoosh("light");
        } catch (e) {
        }
        if (onBack) onBack();
        return true;
      }
      if (!this.canChoose) return false;
      if (y >= tileY && y <= tileY + tileH) {
        for (let i = 0; i < this.count; i++) {
          const tx = this.getTileX(i, W);
          if (x >= tx && x <= tx + tileW) {
            if (this.index === i) {
              if (onConfirm) onConfirm();
            } else {
              this.index = i;
              try {
                soundFX.playWhoosh("light");
              } catch (e) {
              }
            }
            return true;
          }
        }
      }
      const btnX = (W - btn.w) / 2;
      const btnY = H - 34;
      const inPreview = x >= preview.x && x <= preview.x + preview.w && y >= preview.y && y <= preview.y + preview.h;
      const inBtn = x >= btnX && x <= btnX + btn.w && y >= btnY && y <= btnY + btn.h;
      if (inPreview || inBtn) {
        if (onConfirm) onConfirm();
        return true;
      }
      return false;
    }
    // Which arena the big preview shows right now
    getPreviewCatalogIndex() {
      if (this.isRandom) {
        return Math.floor(this.tick / 40) % this.catalog.length;
      }
      return this.index;
    }
    update() {
      this.tick++;
      const entry = this.catalog[this.getPreviewCatalogIndex()];
      if (!entry) return;
      if (this.liveStageId !== entry.id) {
        this.liveStage = new Stage(entry.id);
        this.liveStageId = entry.id;
        for (let i = 0; i < 20; i++) this.liveStage.update();
      }
      if (this.liveStage) this.liveStage.update();
    }
    // Lazily bake one cached thumbnail per call so opening the screen never hitches
    bakeNextThumb() {
      if (typeof document === "undefined" || typeof document.createElement !== "function") return;
      const next = this.catalog.find((s) => !this.thumbs[s.id]);
      if (!next) return;
      try {
        const c = document.createElement("canvas");
        c.width = 168;
        c.height = 95;
        const tctx = c.getContext("2d");
        tctx.imageSmoothingEnabled = false;
        tctx.scale(168 / 640, 95 / 360);
        const st = new Stage(next.id);
        for (let i = 0; i < 40; i++) st.update();
        st.render(tctx, 160, 640, 360);
        this.thumbs[next.id] = c;
      } catch (e) {
        this.thumbs[next.id] = null;
      }
    }
    wrapText(ctx, text, maxWidth) {
      const words = text.split(" ");
      const lines = [];
      let line = "";
      words.forEach((w) => {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = w;
        } else {
          line = test;
        }
      });
      if (line) lines.push(line);
      return lines;
    }
    drawBackground(ctx, W, H) {
      const t = this.tick;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#140306");
      bg.addColorStop(0.55, "#2b0808");
      bg.addColorStop(1, "#0a0102");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(W / 2, H / 2 + 10, 150, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(W / 2, H / 2 + 10, 128, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = "#facc15";
      ctx.font = "900 190px serif";
      ctx.textAlign = "center";
      ctx.fillText("\u9F8D", W / 2, H / 2 + 76);
      ctx.restore();
      for (let i = 0; i < 36; i++) {
        const ex = (i * 71 + Math.sin(t * 0.01 + i) * 14 + 640) % W;
        const ey = H - (i * 53 + t * (0.4 + i % 5 * 0.18)) % (H + 20);
        ctx.fillStyle = i % 3 === 0 ? "#fde047" : i % 3 === 1 ? "#f97316" : "#ef4444";
        ctx.globalAlpha = 0.25 + i % 4 * 0.12;
        ctx.fillRect(ex, ey, 2, 2);
      }
      ctx.globalAlpha = 1;
      const vg = ctx.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 380);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    }
    render(ctx, W, H) {
      this.bakeNextThumb();
      const L = this.layout;
      const entry = this.isRandom ? null : this.catalog[this.index];
      const previewEntry = this.catalog[this.getPreviewCatalogIndex()];
      const accent = (entry || previewEntry || { accent: "#facc15" }).accent;
      this.drawBackground(ctx, W, H);
      ctx.fillStyle = "rgba(30, 27, 75, 0.0)";
      ctx.fillStyle = "rgba(127, 29, 29, 0.55)";
      ctx.fillRect(0, 6, W, 36);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(0, 6, W, 2);
      ctx.fillRect(0, 40, W, 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(L.back.x, L.back.y, L.back.w, L.back.h);
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 1;
      ctx.strokeRect(L.back.x, L.back.y, L.back.w, L.back.h);
      ctx.fillStyle = "#fde047";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("\u2B05\uFE0F BACK [B]", L.back.x + L.back.w / 2, L.back.y + 14);
      ctx.textAlign = "center";
      ctx.fillStyle = "#000";
      ctx.font = "900 22px monospace";
      ctx.fillText("CHOOSE YOUR BATTLEFIELD", W / 2 + 2, 31);
      const tg = ctx.createLinearGradient(0, 14, 0, 34);
      tg.addColorStop(0, "#fef08a");
      tg.addColorStop(0.55, "#f59e0b");
      tg.addColorStop(1, "#b91c1c");
      ctx.fillStyle = tg;
      ctx.fillText("CHOOSE YOUR BATTLEFIELD", W / 2, 29);
      const pv = L.preview;
      ctx.save();
      ctx.beginPath();
      ctx.rect(pv.x, pv.y, pv.w, pv.h);
      ctx.clip();
      ctx.translate(pv.x, pv.y);
      const s = pv.w / 640;
      ctx.scale(s, s);
      if (this.liveStage) {
        const camX = 160 + Math.sin(this.tick * 0.012) * 150;
        this.liveStage.render(ctx, camX, 640, 360);
      } else {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 640, 360);
      }
      ctx.restore();
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      for (let y = pv.y; y < pv.y + pv.h; y += 3) ctx.fillRect(pv.x, y, pv.w, 1);
      const pulse = 0.65 + Math.sin(this.tick * 0.1) * 0.35;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000";
      ctx.strokeRect(pv.x - 3, pv.y - 3, pv.w + 6, pv.h + 6);
      ctx.lineWidth = 2;
      ctx.strokeStyle = accent;
      ctx.globalAlpha = pulse;
      ctx.strokeRect(pv.x - 2, pv.y - 2, pv.w + 4, pv.h + 4);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#facc15";
      [[pv.x - 5, pv.y - 5], [pv.x + pv.w - 3, pv.y - 5], [pv.x - 5, pv.y + pv.h - 3], [pv.x + pv.w - 3, pv.y + pv.h - 3]].forEach(([cx, cy]) => ctx.fillRect(cx, cy, 8, 8));
      if (this.isRandom) {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(pv.x, pv.y, pv.w, pv.h);
        ctx.fillStyle = "#fde047";
        ctx.font = "900 54px monospace";
        ctx.textAlign = "center";
        ctx.fillText("?", pv.x + pv.w / 2, pv.y + pv.h / 2 + 18);
      }
      const ip = L.info;
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.fillRect(ip.x, ip.y, ip.w, ip.h);
      ctx.strokeStyle = "#7f1d1d";
      ctx.lineWidth = 2;
      ctx.strokeRect(ip.x, ip.y, ip.w, ip.h);
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 1;
      ctx.strokeRect(ip.x + 3, ip.y + 3, ip.w - 6, ip.h - 6);
      ctx.textAlign = "left";
      ctx.fillStyle = accent;
      ctx.font = "bold 8px monospace";
      ctx.fillText(this.isRandom ? "FATE DECIDES" : `ARENA ${String(this.index + 1).padStart(2, "0")} / ${String(this.catalog.length).padStart(2, "0")}`, ip.x + 12, ip.y + 20);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 18px monospace";
      ctx.fillText(this.isRandom ? "RANDOM ARENA" : entry.name, ip.x + 12, ip.y + 42);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 10px monospace";
      ctx.fillText(this.isRandom ? "Unknown Location" : entry.location, ip.x + 12, ip.y + 58);
      ctx.fillStyle = "#7f1d1d";
      ctx.fillRect(ip.x + 12, ip.y + 66, ip.w - 24, 2);
      ctx.fillStyle = accent;
      ctx.fillRect(ip.x + 12, ip.y + 66, 46, 2);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "10px monospace";
      const blurb = this.isRandom ? "Let the tournament gods choose. Any arena can be drawn - you will not know until the fight begins!" : entry.blurb;
      this.wrapText(ctx, blurb, ip.w - 28).slice(0, 4).forEach((ln, i) => {
        ctx.fillText(ln, ip.x + 12, ip.y + 84 + i * 13);
      });
      ctx.fillStyle = "rgba(127, 29, 29, 0.45)";
      ctx.fillRect(ip.x + 10, ip.y + 134, ip.w - 20, 32);
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 8px monospace";
      ctx.fillText(MODE_LABELS[this.mode] || "MATCH", ip.x + 16, ip.y + 146);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${this.p1Name}  VS  ${this.p2Name}`, ip.x + ip.w / 2, ip.y + 160);
      for (let i = 0; i < this.count; i++) {
        const tx = this.getTileX(i, W);
        const ty = L.tileY;
        const isSel = i === this.index;
        const isRandTile = i === this.catalog.length;
        const tEntry = isRandTile ? null : this.catalog[i];
        ctx.save();
        if (isSel) {
          const lift = Math.sin(this.tick * 0.2) * 1.5 - 3;
          ctx.translate(0, lift);
        }
        ctx.fillStyle = "#000";
        ctx.fillRect(tx, ty, L.tileW, L.tileH);
        if (isRandTile) {
          const cyc = this.catalog[Math.floor(this.tick / 12) % this.catalog.length];
          const th = cyc && this.thumbs[cyc.id];
          if (th) {
            ctx.globalAlpha = 0.45;
            ctx.drawImage(th, tx, ty, L.tileW, L.tileH);
            ctx.globalAlpha = 1;
          }
          ctx.fillStyle = "#fde047";
          ctx.font = "900 26px monospace";
          ctx.textAlign = "center";
          ctx.fillText("?", tx + L.tileW / 2, ty + L.tileH / 2 + 9);
        } else {
          const th = this.thumbs[tEntry.id];
          if (th) {
            ctx.drawImage(th, tx, ty, L.tileW, L.tileH);
          } else {
            ctx.fillStyle = "#1f2937";
            ctx.fillRect(tx, ty, L.tileW, L.tileH);
          }
        }
        if (!isSel) {
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(tx, ty, L.tileW, L.tileH);
        }
        const col = isSel ? isRandTile ? "#fde047" : tEntry.accent : "#44403c";
        ctx.lineWidth = isSel ? 3 : 1;
        ctx.strokeStyle = "#000";
        ctx.strokeRect(tx - 1, ty - 1, L.tileW + 2, L.tileH + 2);
        ctx.strokeStyle = col;
        ctx.strokeRect(tx, ty, L.tileW, L.tileH);
        if (isSel) {
          ctx.strokeStyle = "#facc15";
          ctx.lineWidth = 1;
          ctx.strokeRect(tx - 3, ty - 3, L.tileW + 6, L.tileH + 6);
        }
        ctx.restore();
        ctx.textAlign = "center";
        ctx.fillStyle = isSel ? "#ffffff" : "#78716c";
        ctx.font = `${isSel ? "bold " : ""}7px monospace`;
        ctx.fillText(isRandTile ? "RANDOM" : tEntry.name, tx + L.tileW / 2, ty + L.tileH + 12);
      }
      if (this.canChoose) {
        const arrowPulse = Math.sin(this.tick * 0.2) * 3;
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 18px monospace";
        ctx.textAlign = "center";
        ctx.fillText("\u25C0", 7 - arrowPulse * 0.4, L.tileY + 30);
        ctx.fillText("\u25B6", W - 7 + arrowPulse * 0.4, L.tileY + 30);
      }
      const btnX = (W - L.btn.w) / 2;
      const btnY = H - 34;
      ctx.textAlign = "center";
      if (!this.canChoose) {
        const blink = Math.floor(this.tick / 18) % 2 === 0;
        ctx.fillStyle = blink ? "rgba(30, 27, 75, 0.95)" : "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(btnX, btnY, L.btn.w, L.btn.h);
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(btnX, btnY, L.btn.w, L.btn.h);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 11px monospace";
        ctx.fillText("\u23F3 HOST IS CHOOSING THE BATTLEFIELD...", W / 2, btnY + 17);
      } else {
        ctx.fillStyle = "rgba(127, 29, 29, 0.92)";
        ctx.fillRect(btnX, btnY, L.btn.w, L.btn.h);
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(btnX, btnY, L.btn.w, L.btn.h);
        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 11px monospace";
        ctx.fillText("\u2694\uFE0F FIGHT HERE [ENTER]   \u25C0 \u25B6 CHOOSE   [B] BACK", W / 2, btnY + 17);
      }
      ctx.textAlign = "left";
    }
  };

  // src/ui/VersusScreen.js
  var easeOutCubic = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  var VersusScreen = class {
    constructor() {
      this.active = false;
      this.t = 0;
      this.duration = 150;
      this.data = null;
    }
    start(data = {}) {
      this.active = true;
      this.t = 0;
      this.duration = data.duration || 150;
      this.data = data;
      this.slammed = false;
    }
    skip() {
      if (this.active && this.t > 30) {
        this.t = Math.max(this.t, this.duration - 12);
        return true;
      }
      return false;
    }
    // Returns true when the intro has finished
    update() {
      if (!this.active) return true;
      this.t++;
      if (!this.slammed && this.t >= 40) {
        this.slammed = true;
        try {
          soundFX.playUltimateActivation && soundFX.playUltimateActivation();
        } catch (e) {
        }
      }
      if (this.t >= this.duration) {
        this.active = false;
        return true;
      }
      return false;
    }
    getSprite(fighter) {
      if (!fighter || !fighter.sprites) return null;
      const s = fighter.sprites;
      const frames = s.IDLE || s.idle || [];
      if (!frames.length) return null;
      return frames[Math.floor(this.t / 10) % frames.length];
    }
    drawPortrait(ctx, fighter, side, W, H, progress) {
      const img = this.getSprite(fighter);
      const baseX = side === "left" ? W * 0.26 : W * 0.74;
      const slide = (1 - easeOutCubic(progress)) * (side === "left" ? -W * 0.6 : W * 0.6);
      const groundY = H - 78;
      ctx.save();
      ctx.translate(baseX + slide, groundY);
      if (side === "right") ctx.scale(-1, 1);
      if (img && img.height) {
        const scale = Math.min(3.2, 215 / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = side === "left" ? "#38bdf8" : "#ef4444";
        ctx.fillRect(-w / 2 - 4, -h - 2, w + 8, h + 4);
        ctx.globalAlpha = 1;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, -w / 2, -h, w, h);
      } else {
        ctx.fillStyle = side === "left" ? "#1e3a5f" : "#5f1e1e";
        ctx.fillRect(-34, -190, 68, 190);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "900 44px monospace";
        ctx.textAlign = "center";
        ctx.fillText("?", 0, -90);
      }
      ctx.restore();
    }
    drawNamePlate(ctx, fighter, fallbackName, side, W, H, progress) {
      const plateW = 250;
      const plateH = 34;
      const y = H - 60;
      const slide = (1 - easeOutCubic((progress - 0.15) / 0.85)) * (side === "left" ? -plateW - 20 : plateW + 20);
      const x = side === "left" ? 14 + slide : W - plateW - 14 + slide;
      const name = fighter && fighter.name || fallbackName || "???";
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
      ctx.fillRect(x, y, plateW, plateH);
      ctx.fillStyle = side === "left" ? "#0ea5e9" : "#dc2626";
      ctx.fillRect(side === "left" ? x : x + plateW - 5, y, 5, plateH);
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, plateW, plateH);
      ctx.textAlign = side === "left" ? "left" : "right";
      const tx = side === "left" ? x + 14 : x + plateW - 14;
      ctx.fillStyle = "#000";
      ctx.font = "900 18px monospace";
      ctx.fillText(String(name).toUpperCase(), tx + 1, y + 23);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(String(name).toUpperCase(), tx, y + 22);
      ctx.restore();
    }
    render(ctx, W, H, stage = null, cameraX = 0) {
      if (!this.data) return;
      const d = this.data;
      const t = this.t;
      if (stage) {
        stage.render(ctx, cameraX, W, H);
      } else {
        ctx.fillStyle = "#0a0102";
        ctx.fillRect(0, 0, W, H);
      }
      ctx.fillStyle = "rgba(30, 0, 0, 0.62)";
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#facc15";
      for (let i = -2; i < 10; i++) {
        const sx = i * 90 + t * 3 % 90;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + 26, 0);
        ctx.lineTo(sx - 70, H);
        ctx.lineTo(sx - 96, H);
        ctx.fill();
      }
      ctx.restore();
      ctx.save();
      if (t >= 40 && t < 54) {
        const k = (54 - t) * 0.5;
        ctx.translate((Math.random() * 2 - 1) * k, (Math.random() * 2 - 1) * k);
      }
      const inProg = Math.min(1, t / 36);
      this.drawPortrait(ctx, d.f1, "left", W, H, inProg);
      this.drawPortrait(ctx, d.f2, "right", W, H, inProg);
      this.drawNamePlate(ctx, d.f1, d.p1Label, "left", W, H, Math.min(1, t / 50));
      this.drawNamePlate(ctx, d.f2, d.p2Label, "right", W, H, Math.min(1, t / 50));
      if (t >= 40) {
        const k = Math.min(1, (t - 40) / 10);
        const scale = 3.2 - 2.2 * easeOutCubic(k);
        const pulse = 1 + Math.sin(t * 0.18) * 0.03;
        ctx.save();
        ctx.translate(W / 2, H / 2 - 24);
        ctx.scale(scale * pulse, scale * pulse);
        ctx.textAlign = "center";
        ctx.fillStyle = "#000";
        ctx.font = "900 70px monospace";
        ctx.fillText("VS", 3, 25);
        const vg = ctx.createLinearGradient(0, -30, 0, 30);
        vg.addColorStop(0, "#fef08a");
        vg.addColorStop(0.5, "#f59e0b");
        vg.addColorStop(1, "#b91c1c");
        ctx.fillStyle = vg;
        ctx.fillText("VS", 0, 22);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#7f1d1d";
        ctx.strokeText("VS", 0, 22);
        ctx.restore();
      }
      if (d.topLabel) {
        const bw = 300;
        const by = 14;
        const slide = (1 - easeOutCubic(t / 28)) * -60;
        ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
        ctx.fillRect(W / 2 - bw / 2, by + slide, bw, 24);
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(W / 2 - bw / 2, by + slide, bw, 24);
        ctx.textAlign = "center";
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 12px monospace";
        ctx.fillText(d.topLabel, W / 2, by + 16 + slide);
      }
      if (d.stageName) {
        const aw = 260;
        const ay = H - 30;
        const aProg = easeOutCubic((t - 20) / 30);
        ctx.save();
        ctx.globalAlpha = aProg;
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(W / 2 - aw / 2, ay, aw, 22);
        ctx.fillStyle = "#7f1d1d";
        ctx.fillRect(W / 2 - aw / 2, ay, aw, 2);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`ARENA: ${d.stageName}${d.stageLocation ? "  -  " + d.stageLocation : ""}`, W / 2, ay + 15);
        ctx.restore();
      }
      ctx.restore();
      if (t >= 40 && t < 48) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(48 - t) / 10})`;
        ctx.fillRect(0, 0, W, H);
      }
      const curtain = Math.max(0, 1 - t / 22);
      if (curtain > 0) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H / 2 * curtain);
        ctx.fillRect(0, H - H / 2 * curtain, W, H / 2 * curtain);
      }
      const remaining = this.duration - t;
      if (remaining < 14) {
        ctx.fillStyle = `rgba(0, 0, 0, ${(14 - remaining) / 14})`;
        ctx.fillRect(0, 0, W, H);
      }
      if (t > 30 && Math.floor(t / 20) % 2 === 0) {
        ctx.fillStyle = "rgba(226, 232, 240, 0.55)";
        ctx.font = "8px monospace";
        ctx.textAlign = "right";
        ctx.fillText("PRESS ENTER TO SKIP", W - 8, 10);
      }
      ctx.textAlign = "left";
    }
  };

  // src/audio/Announcer.js
  var Announcer = class {
    constructor() {
      this.speechAvailable = typeof window !== "undefined" && "speechSynthesis" in window;
      this.voice = null;
      this.initVoice();
    }
    initVoice() {
      if (!this.speechAvailable) return;
      const findVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        this.voice = voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Male") || v.name.includes("David") || v.name.includes("Google US English") || v.name.includes("Natural"))) || voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
      };
      findVoice();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = findVoice;
      }
    }
    speak(text, { pitch = 0.55, rate = 0.95, volume = 1 } = {}) {
      if (!this.speechAvailable) return;
      try {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        if (this.voice) utt.voice = this.voice;
        utt.pitch = pitch;
        utt.rate = rate;
        utt.volume = volume;
        window.speechSynthesis.speak(utt);
      } catch (e) {
      }
    }
    // --- MORTAL KOMBAT STYLE CALLS ---
    round1() {
      this.speak("Round 1... Fight!", { pitch: 0.5, rate: 0.9 });
      try {
        soundFX.playAnnouncer("FIGHT");
      } catch (e) {
      }
    }
    round2() {
      this.speak("Round 2... Fight!", { pitch: 0.5, rate: 0.9 });
      try {
        soundFX.playAnnouncer("FIGHT");
      } catch (e) {
      }
    }
    finalRound() {
      this.speak("Final Round... Fight!", { pitch: 0.45, rate: 0.85 });
      try {
        soundFX.playAnnouncer("FIGHT");
      } catch (e) {
      }
    }
    finishHim() {
      this.speak("Finish Him!", { pitch: 0.42, rate: 0.85 });
      try {
        soundFX.playAnnouncer("FINISH_HIM");
      } catch (e) {
      }
    }
    fatality() {
      this.speak("Fatality!", { pitch: 0.38, rate: 0.8 });
    }
    stageFatality() {
      this.speak("Stage Fatality!", { pitch: 0.38, rate: 0.8 });
    }
    brutality() {
      this.speak("Brutality!", { pitch: 0.38, rate: 0.85 });
    }
    flawlessVictory() {
      this.speak("Flawless Victory!", { pitch: 0.45, rate: 0.85 });
    }
    testYourMight() {
      this.speak("Test Your Might!", { pitch: 0.48, rate: 0.85 });
    }
    // --- ELDEN RING ATMOSPHERIC CALLS ---
    youDied() {
      this.speak("You Died", { pitch: 0.3, rate: 0.65 });
    }
    greatEnemyFelled() {
      this.speak("Great Enemy Felled", { pitch: 0.42, rate: 0.8 });
    }
    legendFelled() {
      this.speak("Legend Felled", { pitch: 0.38, rate: 0.75 });
    }
    godSlain() {
      this.speak("God Slain", { pitch: 0.35, rate: 0.7 });
    }
  };
  var announcer = new Announcer();

  // src/combat/FatalitySystem.js
  var FATALITY_CATALOG = {
    kazuki: {
      id: "dragon_cremation",
      name: "DRAGON CREMATION",
      japanese: "\u9F8D \u708E \u846C",
      inputDesc: "\u2193 \u2193 HP (or SPACE)",
      color: "#ef4444",
      secondaryColor: "#f59e0b",
      type: "flame_pillar"
    },
    raven: {
      id: "orbital_annihilation",
      name: "ORBITAL ANNIHILATION",
      japanese: "\u8ECC \u9053 \u7832",
      inputDesc: "\u2193 \u2192 HP (or SPACE)",
      color: "#06b6d4",
      secondaryColor: "#38bdf8",
      type: "orbital_laser"
    },
    kagura: {
      id: "shadow_decapitation",
      name: "SHADOW DECAPITATION",
      japanese: "\u5F71 \u5203 \u65AD",
      inputDesc: "\u2190 \u2192 HK (or SPACE)",
      color: "#a855f7",
      secondaryColor: "#e879f9",
      type: "shadow_clone"
    },
    fang: {
      id: "wolf_pack_massacre",
      name: "WOLF PACK MASSACRE",
      japanese: "\u72FC \u7FA4 \u6BBA",
      inputDesc: "\u2192 \u2192 HP (or SPACE)",
      color: "#e11d48",
      secondaryColor: "#fb7185",
      type: "spirit_slash"
    },
    zephyr: {
      id: "tempest_slice",
      name: "TEMPEST SLICE",
      japanese: "\u66B4 \u98A8 \u88C2",
      inputDesc: "\u2193 \u2191 HK (or SPACE)",
      color: "#10b981",
      secondaryColor: "#6ee7b7",
      type: "cyclone"
    },
    colossus: {
      id: "seismic_crush",
      name: "SEISMIC CRUSH",
      japanese: "\u5730 \u9707 \u5727",
      inputDesc: "\u2193 \u2193 HK (or SPACE)",
      color: "#f97316",
      secondaryColor: "#fdba74",
      type: "earth_crush"
    },
    cinder: {
      id: "inferno_eruption",
      name: "INFERNO ERUPTION",
      japanese: "\u696D \u706B \u5674",
      inputDesc: "\u2192 \u2193 HP (or SPACE)",
      color: "#dc2626",
      secondaryColor: "#facc15",
      type: "magma_erupt"
    },
    glacier: {
      id: "absolute_zero",
      name: "ABSOLUTE ZERO",
      japanese: "\u7D76 \u5BFE \u96F6",
      inputDesc: "\u2193 \u2190 HP (or SPACE)",
      color: "#38bdf8",
      secondaryColor: "#e0f2fe",
      type: "ice_shatter"
    },
    mighty: {
      id: "void_singularity",
      name: "VOID SINGULARITY",
      japanese: "\u865A \u7121 \u5D29",
      inputDesc: "\u2193 \u2193 SPACE",
      color: "#ec4899",
      secondaryColor: "#8b5cf6",
      type: "black_hole"
    },
    endless_dragon: {
      id: "primeval_extinction",
      name: "PRIMEVAL EXTINCTION",
      japanese: "\u539F \u521D \u6EC5",
      inputDesc: "\u2193 \u2193 HP",
      color: "#facc15",
      secondaryColor: "#ef4444",
      type: "dragon_breath"
    }
  };
  var FatalitySystem = class {
    constructor() {
      this.reset();
    }
    reset() {
      this.active = false;
      this.phase = "none";
      this.t = 0;
      this.type = "fatality";
      this.finisherData = null;
      this.winner = null;
      this.loser = null;
      this.stageId = "";
      this.particles = [];
      this.flash = 0;
      this.slowMo = 1;
    }
    start(winner, loser, stageId, chosenType = "fatality") {
      this.reset();
      this.active = true;
      this.phase = "cinematic";
      this.winner = winner;
      this.loser = loser;
      this.stageId = stageId || "cyber_city";
      this.type = chosenType;
      this.t = 0;
      const charId = winner ? winner.id : "kazuki";
      this.finisherData = FATALITY_CATALOG[charId] || FATALITY_CATALOG.kazuki;
      if (winner && loser) {
        const dir = loser.x >= winner.x ? 1 : -1;
        winner.facingRight = dir === 1;
        winner.x = Math.max(80, Math.min(880, loser.x - dir * 85));
        winner.vx = 0;
        winner.changeState(FIGHTER_STATE.VICTORY, true);
        loser.vx = 0;
        loser.vy = 0;
        loser.isGrounded = true;
      }
      try {
        soundFX.stopMusic();
        soundFX.playUltimateActivation();
      } catch (e) {
      }
    }
    triggerStageFatality(winner, loser, stageId) {
      this.start(winner, loser, stageId, "stage_fatality");
    }
    triggerBrutality(winner, loser, stageId) {
      this.start(winner, loser, stageId, "brutality");
    }
    spawnParticle(x, y, vx, vy, color, size = 3, life = 45) {
      this.particles.push({ x, y, vx, vy, color, size, life, maxLife: life });
    }
    spawnBurst(x, y, color, count = 35, speedMax = 8) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * speedMax;
        this.spawnParticle(
          x,
          y,
          Math.cos(a) * sp,
          Math.sin(a) * sp - 2,
          color,
          2 + Math.random() * 4,
          30 + Math.random() * 35
        );
      }
    }
    update(hud) {
      if (!this.active) return false;
      this.t++;
      if (this.flash > 0) this.flash -= 0.05;
      this.particles = this.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.life--;
        return p.life > 0;
      });
      const w = this.winner;
      const l = this.loser;
      const data = this.finisherData;
      if (this.phase === "cinematic") {
        if (this.t < 40) {
          if (this.t % 4 === 0 && w) {
            const c = Math.random() < 0.6 ? data.color : data.secondaryColor;
            this.spawnParticle(w.x + (Math.random() - 0.5) * 40, w.y - 20, 0, -4 - Math.random() * 3, c, 3, 20);
          }
          if (hud && this.t % 8 === 0) hud.triggerShake(4);
        }
        if (this.t === 40 && l) {
          this.flash = 1;
          if (hud) hud.triggerShake(30);
          try {
            soundFX.playUltimateFinisher();
            soundFX.playHitHeavy();
          } catch (e) {
          }
          const dir = w && w.facingRight ? 1 : -1;
          l.vx = dir * 12;
          l.vy = -18;
          l.isGrounded = false;
          this.spawnBurst(l.x, l.y - 50, data.color, 45, 9);
          this.spawnBurst(l.x, l.y - 50, data.secondaryColor, 35, 7);
          this.spawnBurst(l.x, l.y - 50, "#ffffff", 25, 11);
        }
        if (this.t > 40 && this.t < 120 && l) {
          if (this.t % 3 === 0) {
            this.spawnParticle(l.x, l.y - 40, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, data.color, 4, 30);
          }
        }
        if (this.t >= 130) {
          this.phase = "banner";
          this.t = 0;
          if (this.type === "stage_fatality") {
            announcer.stageFatality();
          } else if (this.type === "brutality") {
            announcer.brutality();
          } else {
            announcer.fatality();
          }
          try {
            soundFX.playLowGong();
          } catch (e) {
          }
        }
      } else if (this.phase === "banner") {
        if (this.t >= 180) {
          this.phase = "done";
          this.active = false;
          return true;
        }
      }
      return false;
    }
    renderWorld(ctx) {
      if (!this.active) return;
      this.particles.forEach((p) => {
        const a = Math.max(0, p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      });
      const w = this.winner;
      const l = this.loser;
      const data = this.finisherData;
      if (this.phase === "cinematic" && this.t >= 35 && this.t < 90 && l) {
        if (data.type === "flame_pillar" || data.type === "magma_erupt") {
          const h = Math.min(320, (this.t - 35) * 18);
          ctx.save();
          ctx.globalAlpha = 0.75;
          const grad = ctx.createLinearGradient(l.x - 40, 0, l.x + 40, 0);
          grad.addColorStop(0, "rgba(239, 68, 68, 0)");
          grad.addColorStop(0.3, "#f59e0b");
          grad.addColorStop(0.5, "#fef08a");
          grad.addColorStop(0.7, "#ef4444");
          grad.addColorStop(1, "rgba(239, 68, 68, 0)");
          ctx.fillStyle = grad;
          ctx.fillRect(l.x - 50, l.y - h, 100, h);
          ctx.restore();
        }
        if (data.type === "orbital_laser") {
          ctx.save();
          ctx.globalAlpha = 0.85;
          const beamGrad = ctx.createLinearGradient(l.x - 30, 0, l.x + 30, 0);
          beamGrad.addColorStop(0, "rgba(6, 182, 212, 0)");
          beamGrad.addColorStop(0.5, "#ffffff");
          beamGrad.addColorStop(1, "rgba(6, 182, 212, 0)");
          ctx.fillStyle = beamGrad;
          ctx.fillRect(l.x - 35, 0, 70, l.y);
          ctx.restore();
        }
        if (data.type === "black_hole") {
          const r = Math.min(80, (this.t - 35) * 3);
          ctx.save();
          ctx.beginPath();
          ctx.arc(l.x, l.y - 50, r, 0, Math.PI * 2);
          ctx.fillStyle = "#09090b";
          ctx.fill();
          ctx.strokeStyle = "#ec4899";
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    renderOverlay(ctx, W, H) {
      if (!this.active) return;
      const t = this.t;
      ctx.save();
      const barH = 46;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, barH);
      ctx.fillRect(0, H - barH, W, barH);
      if (this.flash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, this.flash)})`;
        ctx.fillRect(0, 0, W, H);
      }
      if (this.phase === "cinematic") {
        if (this.t > 45 && this.finisherData) {
          ctx.textAlign = "center";
          ctx.fillStyle = "#fca5a5";
          ctx.font = "bold 12px monospace";
          ctx.fillText(this.finisherData.name, W / 2, barH + 24);
          if (this.finisherData.japanese) {
            ctx.font = "900 18px serif";
            ctx.fillStyle = "#dc2626";
            ctx.fillText(this.finisherData.japanese, W / 2, barH + 46);
          }
        }
      } else if (this.phase === "banner") {
        const alpha = Math.min(1, t / 15);
        ctx.globalAlpha = alpha;
        ctx.textAlign = "center";
        let title = "F A T A L I T Y";
        let sub = this.finisherData ? this.finisherData.name : "PERFECT EXECUTION";
        let titleCol = "#dc2626";
        if (this.type === "stage_fatality") {
          title = "S T A G E   F A T A L I T Y";
          sub = "HAZARDOUS ELIMINATION";
          titleCol = "#f97316";
        } else if (this.type === "brutality") {
          title = "B R U T A L I T Y";
          sub = "SAVAGE UNBROKEN COMBO";
          titleCol = "#a855f7";
        }
        ctx.fillStyle = "rgba(10, 2, 4, 0.88)";
        ctx.fillRect(0, H / 2 - 50, W, 100);
        ctx.strokeStyle = titleCol;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(W * 0.1, H / 2 - 50);
        ctx.lineTo(W * 0.9, H / 2 - 50);
        ctx.moveTo(W * 0.1, H / 2 + 50);
        ctx.lineTo(W * 0.9, H / 2 + 50);
        ctx.stroke();
        ctx.shadowColor = titleCol;
        ctx.shadowBlur = 25;
        ctx.fillStyle = titleCol;
        ctx.font = "900 42px serif";
        ctx.fillText(title, W / 2, H / 2 + 10);
        ctx.shadowBlur = 0;
        const winnerName = this.winner ? this.winner.name.toUpperCase() : "PLAYER 1";
        ctx.fillStyle = "#fef08a";
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText(`${winnerName} WINS`, W / 2, H / 2 + 36);
        ctx.fillStyle = "#94a3b8";
        ctx.font = '7px "Press Start 2P"';
        ctx.fillText(sub, W / 2, H / 2 - 28);
      }
      ctx.restore();
    }
  };
  var fatalitySystem = new FatalitySystem();

  // src/ui/FinishHim.js
  var FINISH_PROMPT_FRAMES = 300;
  var FINISH_END_FRAMES = 110;
  var FinishHim = class {
    constructor() {
      this.reset();
    }
    reset() {
      this.active = false;
      this.phase = "none";
      this.t = 0;
      this.winner = null;
      this.loser = null;
      this.flawless = false;
      this.executed = false;
      this.flash = 0;
      this.rings = [];
      this.sparks = [];
      this.hud = null;
    }
    // winner/loser: Fighter instances. hud: HUD (for screen shake)
    start(winner, loser, hud, { flawless = false, stageId = "cyber_city" } = {}) {
      this.reset();
      this.active = true;
      this.phase = "prompt";
      this.t = 0;
      this.winner = winner;
      this.loser = loser;
      this.hud = hud;
      this.stageId = stageId;
      this.flawless = flawless;
      try {
        announcer.finishHim();
      } catch (e) {
      }
      if (hud && hud.triggerShake) hud.triggerShake(10);
    }
    // True while Game should skip normal fighter input processing
    get blocksInput() {
      return this.active;
    }
    checkFinisherInput() {
      if (!this.winner) return null;
      const num = this.winner.playerNum === 2 ? 2 : 1;
      try {
        const st = input.getState(num, this.winner.facingRight);
        if (st.dirtyJust) return "stage_fatality";
        if (st.ultimateJust || st.hpJust && st.hkJust || st.special1Just || st.special2Just || st.special3Just) {
          return "fatality";
        }
      } catch (e) {
      }
      return null;
    }
    beginFatality(type = "fatality") {
      this.phase = "fatality";
      this.t = 0;
      this.executed = true;
      fatalitySystem.start(this.winner, this.loser, this.stageId, type);
    }
    beginExecute() {
      this.beginFatality("fatality");
    }
    spawnRing(x, y, color, speed = 3, life = 40) {
      this.rings.push({ x, y, r: 6, vr: speed, life, maxLife: life, color });
    }
    spawnSparks(x, y, count = 28) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 7;
        this.sparks.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 2,
          life: 30 + Math.random() * 30,
          size: 2 + Math.random() * 3,
          color: Math.random() < 0.5 ? "#fde047" : Math.random() < 0.5 ? "#ffffff" : "#f97316"
        });
      }
    }
    // Advances one logical frame. Returns true once the whole sequence has finished.
    update() {
      if (!this.active) return true;
      this.t++;
      if (this.flash > 0) this.flash -= 0.06;
      if (this.phase === "prompt") {
        const finisherType = this.checkFinisherInput();
        if (finisherType) {
          this.beginFatality(finisherType);
        } else if (this.t >= FINISH_PROMPT_FRAMES) {
          this.phase = "end";
          this.t = 0;
          if (this.flawless) {
            announcer.flawlessVictory();
          }
        }
      } else if (this.phase === "fatality") {
        const done = fatalitySystem.update(this.hud);
        if (done) {
          this.phase = "end";
          this.t = 0;
          if (this.flawless) {
            announcer.flawlessVictory();
          }
        }
      } else if (this.phase === "end") {
        if (this.t >= FINISH_END_FRAMES) {
          this.active = false;
          this.phase = "none";
          return true;
        }
      }
      return false;
    }
    // Skips straight to the end (e.g. player quit)
    forceFinish() {
      this.active = false;
      this.phase = "none";
    }
    // World-space effects (drawn inside the camera translate)
    renderWorld(ctx) {
      if (!this.active) return;
      if (this.phase === "fatality") {
        fatalitySystem.renderWorld(ctx);
        return;
      }
    }
    // Screen-space overlay (text, letterbox, flash)
    renderOverlay(ctx, W, H) {
      if (!this.active) return;
      if (this.phase === "fatality") {
        fatalitySystem.renderOverlay(ctx, W, H);
        return;
      }
      const t = this.t;
      const pulse = Math.sin(Date.now() / 90);
      ctx.save();
      ctx.textAlign = "center";
      if (this.phase === "prompt") {
        const vg = ctx.createRadialGradient(W / 2, H / 2, 90, W / 2, H / 2, 380);
        vg.addColorStop(0, "rgba(0,0,0,0)");
        vg.addColorStop(1, `rgba(127, 0, 0, ${0.45 + pulse * 0.08})`);
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, W, H);
        const appear = Math.min(1, t / 14);
        const scale = 1 + (1 - appear) * 2.2 + pulse * 0.02;
        ctx.save();
        ctx.translate(W / 2, H / 2 - 36);
        ctx.scale(scale, scale);
        ctx.globalAlpha = appear;
        ctx.fillStyle = "#000";
        ctx.font = "900 46px monospace";
        ctx.fillText("FINISH HIM!", 3, 3);
        const g = ctx.createLinearGradient(0, -34, 0, 6);
        g.addColorStop(0, "#fca5a5");
        g.addColorStop(0.5, "#dc2626");
        g.addColorStop(1, "#450a0a");
        ctx.fillStyle = g;
        ctx.fillText("FINISH HIM!", 0, 0);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#fde047";
        ctx.strokeText("FINISH HIM!", 0, 0);
        ctx.restore();
        const remain = Math.max(0, 1 - t / FINISH_PROMPT_FRAMES);
        const bw = 220;
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(W / 2 - bw / 2, H / 2 + 2, bw, 8);
        ctx.fillStyle = remain < 0.25 ? "#ef4444" : "#facc15";
        ctx.fillRect(W / 2 - bw / 2 + 1, H / 2 + 3, (bw - 2) * remain, 6);
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 1;
        ctx.strokeRect(W / 2 - bw / 2, H / 2 + 2, bw, 8);
        const charId = this.winner ? this.winner.id : "kazuki";
        const fatInfo = FATALITY_CATALOG[charId] || FATALITY_CATALOG.kazuki;
        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 9px monospace";
        ctx.fillText(`[SPACE / HP+HK] FATALITY: ${fatInfo.name}`, W / 2, H / 2 + 24);
        ctx.fillStyle = "#f87171";
        ctx.font = "8px monospace";
        ctx.fillText(`[C] STAGE HAZARD FATALITY`, W / 2, H / 2 + 38);
      }
      if (this.phase === "execute") {
        const bar = Math.min(1, t / 14) * 34;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, bar);
        ctx.fillRect(0, H - bar, W, bar);
        if (t < 60) {
          ctx.fillStyle = `rgba(0, 10, 30, ${Math.min(0.5, t / 60 * 0.5)})`;
          ctx.fillRect(0, 0, W, H);
          ctx.strokeStyle = "rgba(125, 211, 252, 0.35)";
          ctx.lineWidth = 1.5;
          for (let a = 0; a < Math.PI * 2; a += 0.3) {
            const r1 = 220 - t % 20 * 6;
            ctx.beginPath();
            ctx.moveTo(W / 2 + Math.cos(a) * r1, H / 2 + Math.sin(a) * r1);
            ctx.lineTo(W / 2 + Math.cos(a) * (r1 + 80), H / 2 + Math.sin(a) * (r1 + 80));
            ctx.stroke();
          }
        }
        if (t >= 66) {
          const k = Math.min(1, (t - 66) / 12);
          ctx.save();
          ctx.translate(W / 2, H / 2 - 6);
          ctx.scale(1.6 - 0.6 * k, 1.6 - 0.6 * k);
          ctx.globalAlpha = k;
          ctx.fillStyle = "#000";
          ctx.font = "900 40px monospace";
          ctx.fillText("FINAL IMPACT", 3, 3);
          const tg = ctx.createLinearGradient(0, -30, 0, 8);
          tg.addColorStop(0, "#fef9c3");
          tg.addColorStop(0.5, "#facc15");
          tg.addColorStop(1, "#b91c1c");
          ctx.fillStyle = tg;
          ctx.fillText("FINAL IMPACT", 0, 0);
          ctx.fillStyle = "#fca5a5";
          ctx.font = "bold 16px serif";
          ctx.fillText("\u7D42\u3000\u6483", 0, 24);
          ctx.restore();
        }
      }
      if (this.phase === "end") {
        const k = Math.min(1, t / 18);
        const fade = t > FINISH_END_FRAMES - 20 ? Math.max(0, (FINISH_END_FRAMES - t) / 20) : 1;
        ctx.globalAlpha = k * fade;
        if (this.flawless) {
          ctx.fillStyle = "rgba(0,0,0,0.55)";
          ctx.fillRect(0, H / 2 - 38, W, 66);
          ctx.fillStyle = "#facc15";
          ctx.fillRect(0, H / 2 - 38, W, 2);
          ctx.fillRect(0, H / 2 + 26, W, 2);
          ctx.fillStyle = "#000";
          ctx.font = "900 34px monospace";
          ctx.fillText("FLAWLESS VICTORY", W / 2 + 2, H / 2 + 6);
          const fg = ctx.createLinearGradient(0, H / 2 - 24, 0, H / 2 + 10);
          fg.addColorStop(0, "#fef9c3");
          fg.addColorStop(1, "#f59e0b");
          ctx.fillStyle = fg;
          ctx.fillText("FLAWLESS VICTORY", W / 2, H / 2 + 4);
          ctx.fillStyle = "#e2e8f0";
          ctx.font = "bold 10px monospace";
          ctx.fillText(this.executed ? "AND A PERFECT FINISH" : "NOT A SCRATCH TAKEN", W / 2, H / 2 + 20);
        } else if (this.winner) {
          const nm = `${String(this.winner.name).toUpperCase()} WINS`;
          ctx.fillStyle = "#000";
          ctx.font = "900 30px monospace";
          ctx.fillText(nm, W / 2 + 2, H / 2 + 4);
          ctx.fillStyle = "#fde047";
          ctx.fillText(nm, W / 2, H / 2 + 2);
        }
        ctx.globalAlpha = 1;
      }
      if (this.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, this.flash)})`;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
    }
  };

  // src/fighters/RosterFighters.js
  function makeRosterFighter(Base, id, name, tune = {}) {
    return class extends Base {
      constructor(options) {
        super(options);
        this.id = id;
        this.name = name;
        this.skinId = options.skinId || null;
        this.sprites = spriteGenerator.generateFighterSprites(id, this.skinId);
        const hp = tune.hp || 1;
        this.maxHealth = Math.round(this.maxHealth * hp);
        this.health = this.maxHealth;
        if (tune.walk) this.walkSpeed *= tune.walk;
        if (tune.dash) this.dashSpeed *= tune.dash;
        if (tune.jump) this.jumpForce *= tune.jump;
      }
    };
  }
  var ROSTER_CLASSES = {
    cinder: makeRosterFighter(Kagura, "cinder", "CINDER", { hp: 0.94, walk: 1.06, dash: 1.05 }),
    glacier: makeRosterFighter(Kazuki, "glacier", "GLACIER", { hp: 1, walk: 0.97 }),
    oracle: makeRosterFighter(Kagura, "oracle", "ORACLE", { hp: 0.9, jump: 1.04 }),
    bandit: makeRosterFighter(Raven, "bandit", "BANDIT", { hp: 1, walk: 1.05 }),
    confessor: makeRosterFighter(Fang, "confessor", "CONFESSOR", { hp: 1.03, walk: 0.98 }),
    valka: makeRosterFighter(Kazuki, "valka", "VALKA", { hp: 0.96, walk: 1.08, jump: 1.05 }),
    convict: makeRosterFighter(Colossus, "convict", "CONVICT", { hp: 1.12, walk: 0.92, dash: 0.95 }),
    prophet: makeRosterFighter(Zephyr, "prophet", "PROPHET", { hp: 0.95, walk: 1.04 }),
    ronin: makeRosterFighter(Kazuki, "ronin", "RONIN", { hp: 1, dash: 1.08 }),
    vagabond: makeRosterFighter(Raven, "vagabond", "VAGABOND", { hp: 1.1, walk: 0.93 }),
    warden: makeRosterFighter(Fang, "warden", "WARDEN", { hp: 1.06, walk: 0.96 }),
    wretch: makeRosterFighter(Zephyr, "wretch", "WRETCH", { hp: 0.88, walk: 1.12, dash: 1.1, jump: 1.08 })
  };
  var ROSTER_QUOTES = {
    cinder: '"Burn bright, burn fast. Then burn out."',
    glacier: '"Cold steel and colder resolve. You are already frozen."',
    oracle: '"The stars wrote your defeat long before you were born."',
    bandit: '"Nothing personal. I just take what I want."',
    confessor: '"Kneel. Your sins end here."',
    valka: '"Sing of my victory in the halls of the fallen!"',
    convict: '"Years in the dark taught me how to hit back."',
    prophet: '"I did not need eyes to see how this would end."',
    ronin: '"A masterless blade still cuts true."',
    vagabond: '"Another battle. Another road. Move aside."',
    warden: '"The wall does not break. You do."',
    wretch: '"Even the weakest can bite when cornered."'
  };

  // src/ui/ShopScreen.js
  var ShopScreen = class {
    constructor() {
      this.fighters = [
        { id: "kazuki", name: "KAZUKI" },
        { id: "raven", name: "RAVEN" },
        { id: "kagura", name: "KAGURA" },
        { id: "fang", name: "FANG" },
        { id: "zephyr", name: "ZEPHYR" },
        { id: "colossus", name: "COLOSSUS" },
        { id: "cinder", name: "CINDER" },
        { id: "glacier", name: "GLACIER" },
        { id: "mighty", name: "M1GHTY" }
      ];
      this.categories = ["SKINS", "AURAS", "SPARKS", "TITLES"];
      this.currentCategoryIndex = 0;
      this.selectedFighterIndex = 0;
      this.selectedSkinIndex = 0;
      this.selectedItemIndex = 0;
      this.animTimer = 0;
      this.animFrame = 0;
      this.message = "";
      this.messageColor = "#38bdf8";
      this.messageTimer = 0;
      this.previewSprites = /* @__PURE__ */ new Map();
    }
    get currentCategory() {
      return this.categories[this.currentCategoryIndex];
    }
    get currentFighter() {
      const mightyOpen = isMightyUnlocked();
      const availableFighters = this.fighters.filter((f) => f.id !== "mighty" || mightyOpen);
      const safeIndex = Math.min(this.selectedFighterIndex, availableFighters.length - 1);
      return availableFighters[Math.max(0, safeIndex)] || this.fighters[0];
    }
    get availableSkins() {
      const fighterId = this.currentFighter.id;
      const defaultSkin = {
        id: `${fighterId}_default`,
        fighterId,
        name: "CLASSIC ORIGINAL",
        tier: "CORE",
        tierColor: "#94a3b8",
        price: 0,
        desc: "The signature battle-tested classic arcade tournament attire.",
        isDefault: true
      };
      const catalogSkins = SKIN_CATALOG.filter((s) => s.fighterId === fighterId);
      return [defaultSkin, ...catalogSkins];
    }
    get currentSkin() {
      const skins = this.availableSkins;
      const safeIndex = Math.min(this.selectedSkinIndex, skins.length - 1);
      return skins[Math.max(0, safeIndex)] || skins[0];
    }
    get availableItems() {
      if (this.currentCategory === "SKINS") return this.availableSkins;
      if (this.currentCategory === "AURAS") return AURA_CATALOG;
      if (this.currentCategory === "SPARKS") return SPARK_CATALOG;
      return TITLE_CATALOG;
    }
    get currentItem() {
      const items = this.availableItems;
      const idx = this.currentCategory === "SKINS" ? this.selectedSkinIndex : this.selectedItemIndex;
      const safeIdx = Math.max(0, Math.min(idx, items.length - 1));
      return items[safeIdx] || items[0];
    }
    getPreviewSprite(fighterId, skinId) {
      const key = `${fighterId}_${skinId || "default"}`;
      if (!this.previewSprites.has(key)) {
        const sp = spriteGenerator.generateFighterSprites(fighterId, skinId);
        this.previewSprites.set(key, sp);
      }
      return this.previewSprites.get(key);
    }
    handleInput(inputState) {
      const mightyOpen = isMightyUnlocked();
      const availableFighters = this.fighters.filter((f) => f.id !== "mighty" || mightyOpen);
      if (inputState.tab || inputState.special3) {
        this.currentCategoryIndex = (this.currentCategoryIndex + 1) % this.categories.length;
        this.selectedItemIndex = 0;
        soundFX.playWhoosh("light");
        return;
      }
      if (this.currentCategory === "SKINS") {
        if (inputState.up) {
          this.selectedFighterIndex = (this.selectedFighterIndex - 1 + availableFighters.length) % availableFighters.length;
          this.selectedSkinIndex = 0;
          soundFX.playWhoosh("light");
        } else if (inputState.down) {
          this.selectedFighterIndex = (this.selectedFighterIndex + 1) % availableFighters.length;
          this.selectedSkinIndex = 0;
          soundFX.playWhoosh("light");
        }
        const skins = this.availableSkins;
        if (inputState.left) {
          this.selectedSkinIndex = (this.selectedSkinIndex - 1 + skins.length) % skins.length;
          soundFX.playWhoosh("light");
        } else if (inputState.right) {
          this.selectedSkinIndex = (this.selectedSkinIndex + 1) % skins.length;
          soundFX.playWhoosh("light");
        }
      } else {
        const items = this.availableItems;
        if (inputState.left || inputState.up) {
          this.selectedItemIndex = (this.selectedItemIndex - 1 + items.length) % items.length;
          soundFX.playWhoosh("light");
        } else if (inputState.right || inputState.down) {
          this.selectedItemIndex = (this.selectedItemIndex + 1) % items.length;
          soundFX.playWhoosh("light");
        }
      }
      if (inputState.confirm || inputState.lp || inputState.hp) {
        this.triggerSkinAction();
      }
    }
    triggerSkinAction() {
      if (this.currentCategory === "SKINS") {
        const skin = this.currentSkin;
        const fighter = this.currentFighter;
        const equipped = EconomyManager.getEquippedSkin(fighter.id);
        const isEquipped = equipped === skin.id || !equipped && skin.isDefault;
        if (isEquipped) {
          this.showMessage("ALREADY EQUIPPED!", "#fbbf24");
          soundFX.playBlock();
          return;
        }
        const isOwned = skin.isDefault || EconomyManager.isSkinOwned(skin.id);
        if (isOwned) {
          EconomyManager.equipSkin(fighter.id, skin.isDefault ? null : skin.id);
          this.showMessage(`\u2728 ${skin.name} EQUIPPED! \u2728`, "#4ade80");
          soundFX.playUltimateActivation();
        } else {
          const res = EconomyManager.buySkin(skin.id);
          if (res.success) {
            EconomyManager.equipSkin(fighter.id, skin.id);
            this.showMessage(`\u{1F389} UNLOCKED & EQUIPPED: ${skin.name}!`, "#facc15");
            soundFX.playUltimateActivation();
          } else {
            this.showMessage("\u274C INSUFFICIENT COINS! WIN MATCHES TO EARN MORE.", "#ef4444");
            soundFX.playBlock();
          }
        }
      } else {
        const item = this.currentItem;
        const cat = this.currentCategory;
        const cosType = cat === "AURAS" ? "aura" : cat === "SPARKS" ? "spark" : "title";
        const equippedCos = EconomyManager.getEquippedCosmetics();
        const isEquipped = equippedCos[cosType] === item.id;
        if (isEquipped) {
          this.showMessage("ALREADY EQUIPPED!", "#fbbf24");
          soundFX.playBlock();
          return;
        }
        const isOwned = item.price === 0 || EconomyManager.isSkinOwned(item.id);
        if (isOwned) {
          EconomyManager.equipCosmetic(cosType, item.id);
          this.showMessage(`\u2728 ${item.name} EQUIPPED! \u2728`, "#4ade80");
          soundFX.playUltimateActivation();
        } else {
          if (EconomyManager.spendCoins(item.price)) {
            const owned = EconomyManager.getOwnedSkins();
            owned.add(item.id);
            try {
              if (typeof localStorage !== "undefined") {
                localStorage.setItem("final_impact_owned_skins", JSON.stringify(Array.from(owned)));
              }
            } catch (e) {
            }
            EconomyManager.equipCosmetic(cosType, item.id);
            this.showMessage(`\u{1F389} UNLOCKED & EQUIPPED: ${item.name}!`, "#facc15");
            soundFX.playUltimateActivation();
          } else {
            this.showMessage("\u274C INSUFFICIENT COINS! WIN MATCHES TO EARN MORE.", "#ef4444");
            soundFX.playBlock();
          }
        }
      }
    }
    showMessage(text, color) {
      this.message = text;
      this.messageColor = color;
      this.messageTimer = 180;
    }
    update() {
      this.animTimer++;
      if (this.animTimer % 8 === 0) {
        this.animFrame = (this.animFrame + 1) % 4;
      }
      if (this.messageTimer > 0) {
        this.messageTimer--;
      }
    }
    handleMouseClick(x, y, W, H) {
      if (x >= 16 && x <= 126 && y >= 12 && y <= 38) {
        soundFX.playMenuSelect();
        return { action: "back" };
      }
      const catTabW = 68;
      const catTabH = 18;
      const catTabY = 32;
      const catStartX = W / 2 - this.categories.length * catTabW / 2;
      for (let c = 0; c < this.categories.length; c++) {
        const cx = catStartX + c * catTabW;
        if (x >= cx + 2 && x <= cx + catTabW - 2 && y >= catTabY && y <= catTabY + catTabH) {
          this.currentCategoryIndex = c;
          this.selectedItemIndex = 0;
          soundFX.playWhoosh("light");
          return { action: "change_category" };
        }
      }
      if (this.currentCategory === "SKINS") {
        const mightyOpen = isMightyUnlocked();
        const availableFighters = this.fighters.filter((f) => f.id !== "mighty" || mightyOpen);
        const listY0 = 60;
        const itemH = 28;
        for (let i = 0; i < availableFighters.length; i++) {
          const iy = listY0 + i * itemH;
          if (x >= 20 && x <= 160 && y >= iy && y <= iy + itemH - 4) {
            this.selectedFighterIndex = i;
            this.selectedSkinIndex = 0;
            soundFX.playWhoosh("light");
            return { action: "select_fighter" };
          }
        }
      } else {
        const items = this.availableItems;
        const listY0 = 60;
        const itemH = 28;
        for (let i = 0; i < items.length; i++) {
          const iy = listY0 + i * itemH;
          if (x >= 20 && x <= 160 && y >= iy && y <= iy + itemH - 4) {
            this.selectedItemIndex = i;
            soundFX.playWhoosh("light");
            return { action: "select_item" };
          }
        }
      }
      if (x >= 180 && x <= 220 && y >= 150 && y <= 200) {
        const skins = this.availableSkins;
        this.selectedSkinIndex = (this.selectedSkinIndex - 1 + skins.length) % skins.length;
        soundFX.playWhoosh("light");
        return { action: "prev_skin" };
      }
      if (x >= 430 && x <= 470 && y >= 150 && y <= 200) {
        const skins = this.availableSkins;
        this.selectedSkinIndex = (this.selectedSkinIndex + 1) % skins.length;
        soundFX.playWhoosh("light");
        return { action: "next_skin" };
      }
      if (x >= 470 && x <= 620 && y >= 280 && y <= 325) {
        this.triggerSkinAction();
        return { action: "buy_equip" };
      }
      return null;
    }
    render(ctx, W, H) {
      this.update();
      ctx.fillStyle = "#08060a";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(234, 179, 8, 0.04)";
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 20) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 20) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "rgba(220, 38, 38, 0.8)");
      grad.addColorStop(0.5, "rgba(234, 179, 8, 0.9)");
      grad.addColorStop(1, "rgba(220, 38, 38, 0.8)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, 4);
      ctx.fillStyle = "#1e1b4b";
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 1.5;
      ctx.fillRect(16, 12, 100, 26);
      ctx.strokeRect(16, 12, 100, 26);
      ctx.fillStyle = "#c7d2fe";
      ctx.font = '8px "Press Start 2P"';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("\u25C0 [ESC] BACK", 66, 25);
      ctx.fillStyle = "#facc15";
      ctx.font = '12px "Press Start 2P"';
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(250, 204, 21, 0.6)";
      ctx.shadowBlur = 8;
      ctx.fillText("\u{1F6CD}\uFE0F CUSTOM SKIN ITEM SHOP", W / 2, 22);
      ctx.shadowBlur = 0;
      ctx.font = '6px "Press Start 2P"';
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("CHOOSE A FIGHTER \u2014 PREVIEW, UNLOCK & EQUIP BESPOKE PALETTES", W / 2, 36);
      const coins = EconomyManager.getCoins();
      ctx.fillStyle = "#18181b";
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 1.5;
      ctx.fillRect(W - 170, 12, 154, 26);
      ctx.strokeRect(W - 170, 12, 154, 26);
      ctx.fillStyle = "#fde047";
      ctx.font = '8px "Press Start 2P"';
      ctx.textAlign = "right";
      ctx.fillText(`\u{1FA99} ${coins.toLocaleString()} COINS`, W - 26, 25);
      const catTabW = 68;
      const catTabH = 18;
      const catTabY = 32;
      const catStartX = W / 2 - this.categories.length * catTabW / 2;
      for (let c = 0; c < this.categories.length; c++) {
        const catName = this.categories[c];
        const cx = catStartX + c * catTabW;
        const isCur = c === this.currentCategoryIndex;
        ctx.fillStyle = isCur ? "#eab308" : "#18181b";
        ctx.fillRect(cx + 2, catTabY, catTabW - 4, catTabH);
        ctx.strokeStyle = isCur ? "#fde047" : "#3f3f46";
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 2, catTabY, catTabW - 4, catTabH);
        ctx.fillStyle = isCur ? "#000000" : "#cbd5e1";
        ctx.font = '7px "Press Start 2P"';
        ctx.textAlign = "center";
        ctx.fillText(catName, cx + catTabW / 2, catTabY + 12);
      }
      const listX = 16;
      const listY = 56;
      const listW = 150;
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(listX, listY, listW, 268);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.strokeRect(listX, listY, listW, 268);
      ctx.fillStyle = "#64748b";
      ctx.font = '7px "Press Start 2P"';
      ctx.textAlign = "left";
      ctx.fillText(this.currentCategory === "SKINS" ? "ROSTER SELECT" : `${this.currentCategory} LIST`, listX + 8, listY + 14);
      const itemH = 26;
      if (this.currentCategory === "SKINS") {
        const mightyOpen = isMightyUnlocked();
        const availableFighters = this.fighters.filter((f) => f.id !== "mighty" || mightyOpen);
        for (let i = 0; i < availableFighters.length; i++) {
          const f = availableFighters[i];
          const isSelected = i === this.selectedFighterIndex;
          const iy = listY + 24 + i * itemH;
          if (isSelected) {
            ctx.fillStyle = "rgba(234, 179, 8, 0.2)";
            ctx.fillRect(listX + 4, iy, listW - 8, itemH - 4);
            ctx.strokeStyle = "#eab308";
            ctx.lineWidth = 1;
            ctx.strokeRect(listX + 4, iy, listW - 8, itemH - 4);
            ctx.fillStyle = "#fde047";
            ctx.font = '8px "Press Start 2P"';
            ctx.fillText(`\u25B6 ${f.name}`, listX + 12, iy + 14);
          } else {
            ctx.fillStyle = "#94a3b8";
            ctx.font = '7px "Press Start 2P"';
            ctx.fillText(`  ${f.name}`, listX + 12, iy + 14);
          }
          const eq = EconomyManager.getEquippedSkin(f.id);
          if (eq) {
            ctx.fillStyle = "#22c55e";
            ctx.beginPath();
            ctx.arc(listX + listW - 14, iy + 11, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        const items = this.availableItems;
        const cosType = this.currentCategory === "AURAS" ? "aura" : this.currentCategory === "SPARKS" ? "spark" : "title";
        const equippedCos = EconomyManager.getEquippedCosmetics();
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          const isSelected = i === this.selectedItemIndex;
          const iy = listY + 24 + i * itemH;
          if (isSelected) {
            ctx.fillStyle = "rgba(234, 179, 8, 0.2)";
            ctx.fillRect(listX + 4, iy, listW - 8, itemH - 4);
            ctx.strokeStyle = "#eab308";
            ctx.lineWidth = 1;
            ctx.strokeRect(listX + 4, iy, listW - 8, itemH - 4);
            ctx.fillStyle = "#fde047";
            ctx.font = '7px "Press Start 2P"';
            ctx.fillText(`\u25B6 ${it.name.substring(0, 11)}`, listX + 8, iy + 14);
          } else {
            ctx.fillStyle = "#94a3b8";
            ctx.font = '6.5px "Press Start 2P"';
            ctx.fillText(`  ${it.name.substring(0, 11)}`, listX + 8, iy + 14);
          }
          if (equippedCos[cosType] === it.id) {
            ctx.fillStyle = "#22c55e";
            ctx.beginPath();
            ctx.arc(listX + listW - 14, iy + 11, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      const centerStageX = 180;
      const centerStageY = 56;
      const centerStageW = 280;
      const centerStageH = 268;
      ctx.fillStyle = "#09090b";
      ctx.fillRect(centerStageX, centerStageY, centerStageW, centerStageH);
      ctx.strokeStyle = "#27272a";
      ctx.strokeRect(centerStageX, centerStageY, centerStageW, centerStageH);
      const spotGrad = ctx.createRadialGradient(
        centerStageX + centerStageW / 2,
        centerStageY + 210,
        10,
        centerStageX + centerStageW / 2,
        centerStageY + 210,
        120
      );
      const currentSkin = this.currentSkin;
      const currentItem = this.currentItem;
      const isSkinCat = this.currentCategory === "SKINS";
      const displayItem = isSkinCat ? currentSkin : currentItem;
      const auraColor = displayItem.tierColor || "#38bdf8";
      spotGrad.addColorStop(0, `${auraColor}33`);
      spotGrad.addColorStop(1, "transparent");
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.ellipse(centerStageX + centerStageW / 2, centerStageY + 215, 100, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      const fighter = this.currentFighter;
      const skinIdToLoad = currentSkin.isDefault ? null : currentSkin.id;
      const sprites = this.getPreviewSprite(fighter.id, skinIdToLoad);
      if (sprites && sprites.idle && sprites.idle.length > 0) {
        const frameIdx = this.animFrame % sprites.idle.length;
        const img = sprites.idle[frameIdx];
        if (img) {
          const scale = 2.4;
          const sw = 80 * scale;
          const sh = 90 * scale;
          const sx = centerStageX + (centerStageW - sw) / 2;
          const sy = centerStageY + 195 - sh;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, sx, sy, sw, sh);
        }
      }
      if (this.currentCategory === "AURAS" && currentItem.color !== "transparent") {
        const col = currentItem.color;
        for (let p = 0; p < 16; p++) {
          const px2 = centerStageX + centerStageW / 2 + Math.sin(this.animTimer * 0.1 + p * 1.3) * 35;
          const py = centerStageY + 180 - (this.animTimer * 2 + p * 18) % 120;
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.65;
          ctx.fillRect(px2, py, 3, 5);
        }
        ctx.globalAlpha = 1;
      } else if (this.currentCategory === "SPARKS") {
        const col = currentItem.color;
        for (let s = 0; s < 12; s++) {
          const ang = s * (Math.PI / 6) + this.animTimer * 0.05;
          const rad = 25 + Math.sin(this.animTimer * 0.2 + s) * 15;
          const sx = centerStageX + centerStageW / 2 + Math.cos(ang) * rad;
          const sy = centerStageY + 120 + Math.sin(ang) * rad;
          ctx.fillStyle = col;
          ctx.fillRect(sx, sy, 3, 3);
        }
      } else if (this.currentCategory === "TITLES") {
        ctx.fillStyle = "rgba(234, 179, 8, 0.25)";
        ctx.fillRect(centerStageX + 20, centerStageY + 20, centerStageW - 40, 24);
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 1;
        ctx.strokeRect(centerStageX + 20, centerStageY + 20, centerStageW - 40, 24);
        ctx.fillStyle = "#fde047";
        ctx.font = '7px "Press Start 2P"';
        ctx.textAlign = "center";
        ctx.fillText(`\u2605 ${currentItem.name} \u2605`, centerStageX + centerStageW / 2, centerStageY + 36);
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(centerStageX + 8, centerStageY + 110, 24, 34);
      ctx.fillStyle = "#facc15";
      ctx.font = '12px "Press Start 2P"';
      ctx.textAlign = "center";
      ctx.fillText("\u25C0", centerStageX + 20, centerStageY + 132);
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(centerStageX + centerStageW - 32, centerStageY + 110, 24, 34);
      ctx.fillStyle = "#facc15";
      ctx.fillText("\u25B6", centerStageX + centerStageW - 20, centerStageY + 132);
      const detailX = 472;
      const detailY = 56;
      const detailW = W - detailX - 16;
      const detailH = 268;
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(detailX, detailY, detailW, detailH);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.strokeRect(detailX, detailY, detailW, detailH);
      ctx.fillStyle = `${displayItem.tierColor || "#38bdf8"}22`;
      ctx.strokeStyle = displayItem.tierColor || "#38bdf8";
      ctx.lineWidth = 1;
      ctx.fillRect(detailX + 12, detailY + 14, 80, 16);
      ctx.strokeRect(detailX + 12, detailY + 14, 80, 16);
      ctx.fillStyle = displayItem.tierColor || "#38bdf8";
      ctx.font = '6px "Press Start 2P"';
      ctx.textAlign = "center";
      ctx.fillText(displayItem.tier || "COMMON", detailX + 52, detailY + 24);
      ctx.fillStyle = "#ffffff";
      ctx.font = '8px "Press Start 2P"';
      ctx.textAlign = "left";
      ctx.fillText(displayItem.name.substring(0, 14), detailX + 12, detailY + 46);
      ctx.fillStyle = "#94a3b8";
      ctx.font = '6px "Press Start 2P"';
      ctx.fillText(isSkinCat ? `FIGHTER: ${fighter.name}` : `CATEGORY: ${this.currentCategory}`, detailX + 12, detailY + 58);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.moveTo(detailX + 12, detailY + 68);
      ctx.lineTo(detailX + detailW - 12, detailY + 68);
      ctx.stroke();
      ctx.fillStyle = "#cbd5e1";
      ctx.font = '6px "Press Start 2P"';
      const words = (displayItem.desc || "").split(" ");
      let line = "";
      let textY = detailY + 84;
      for (const w of words) {
        const test = line + (line ? " " : "") + w;
        if (test.length > 20) {
          ctx.fillText(line, detailX + 12, textY);
          textY += 12;
          line = w;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, detailX + 12, textY);
      let isEquipped = false;
      let isOwned = false;
      if (isSkinCat) {
        const equippedSkinId = EconomyManager.getEquippedSkin(fighter.id);
        isEquipped = equippedSkinId === currentSkin.id || !equippedSkinId && currentSkin.isDefault;
        isOwned = currentSkin.isDefault || EconomyManager.isSkinOwned(currentSkin.id);
      } else {
        const cosType = this.currentCategory === "AURAS" ? "aura" : this.currentCategory === "SPARKS" ? "spark" : "title";
        const equippedCos = EconomyManager.getEquippedCosmetics();
        isEquipped = equippedCos[cosType] === currentItem.id;
        isOwned = currentItem.price === 0 || EconomyManager.isSkinOwned(currentItem.id);
      }
      const actionBoxY = detailY + 180;
      if (isEquipped) {
        ctx.fillStyle = "#14532d";
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 1.5;
        ctx.fillRect(detailX + 12, actionBoxY, detailW - 24, 36);
        ctx.strokeRect(detailX + 12, actionBoxY, detailW - 24, 36);
        ctx.fillStyle = "#4ade80";
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = "center";
        ctx.fillText("\u2714 CURRENTLY EQUIPPED", detailX + detailW / 2, actionBoxY + 18);
        ctx.font = '6px "Press Start 2P"';
        ctx.fillStyle = "#86efac";
        ctx.fillText("ACTIVE IN ALL FIGHTS", detailX + detailW / 2, actionBoxY + 28);
      } else if (isOwned) {
        ctx.fillStyle = "#1e3a8a";
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 1.5;
        ctx.fillRect(detailX + 12, actionBoxY, detailW - 24, 36);
        ctx.strokeRect(detailX + 12, actionBoxY, detailW - 24, 36);
        ctx.fillStyle = "#93c5fd";
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = "center";
        ctx.fillText("EQUIP ITEM", detailX + detailW / 2, actionBoxY + 18);
        ctx.font = '6px "Press Start 2P"';
        ctx.fillStyle = "#bfdbfe";
        ctx.fillText("[ENTER / SPACE]", detailX + detailW / 2, actionBoxY + 28);
      } else {
        const canAfford = coins >= displayItem.price;
        ctx.fillStyle = canAfford ? "#78350f" : "#3f3f46";
        ctx.strokeStyle = canAfford ? "#f59e0b" : "#71717a";
        ctx.lineWidth = 1.5;
        ctx.fillRect(detailX + 12, actionBoxY, detailW - 24, 36);
        ctx.strokeRect(detailX + 12, actionBoxY, detailW - 24, 36);
        ctx.fillStyle = canAfford ? "#fde047" : "#d4d4d8";
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = "center";
        ctx.fillText(`BUY: \u{1FA99} ${displayItem.price}`, detailX + detailW / 2, actionBoxY + 16);
        ctx.font = '6px "Press Start 2P"';
        ctx.fillStyle = canAfford ? "#fef08a" : "#ef4444";
        ctx.fillText(canAfford ? "[ENTER TO BUY]" : "NEED MORE COINS", detailX + detailW / 2, actionBoxY + 28);
      }
      if (this.messageTimer > 0 && this.message) {
        const msgW = 380;
        const msgH = 28;
        const msgX = (W - msgW) / 2;
        const msgY = H - 38;
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
        ctx.fillRect(msgX, msgY, msgW, msgH);
        ctx.strokeStyle = this.messageColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(msgX, msgY, msgW, msgH);
        ctx.fillStyle = this.messageColor;
        ctx.font = '7px "Press Start 2P"';
        ctx.textAlign = "center";
        ctx.fillText(this.message, W / 2, msgY + 16);
      } else {
        ctx.fillStyle = "#64748b";
        ctx.font = '6px "Press Start 2P"';
        ctx.textAlign = "center";
        ctx.fillText("[W/S] ROSTER  |  [A/D] SKINS  |  [ENTER] BUY/EQUIP  |  [ESC] MENU", W / 2, H - 12);
      }
    }
  };

  // src/ui/AdminModal.js
  var AdminModal = class {
    constructor(game) {
      this.game = game;
      this.isOpen = false;
      this.domModal = null;
      this.initDOM();
    }
    initDOM() {
      if (typeof document === "undefined") return;
      let modal = document.getElementById("adminModal");
      if (!modal) {
        modal = document.createElement("div");
        modal.id = "adminModal";
        modal.className = "modal-backdrop";
        modal.style.display = "none";
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100vw";
        modal.style.height = "100vh";
        modal.style.background = "rgba(5, 2, 8, 0.88)";
        modal.style.backdropFilter = "blur(6px)";
        modal.style.zIndex = "9999";
        modal.style.display = "none";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.style.padding = "16px";
        modal.style.boxSizing = "border-box";
        document.body.appendChild(modal);
      }
      this.domModal = modal;
      this.renderModalContent();
    }
    open() {
      this.isOpen = true;
      if (this.domModal) {
        this.domModal.style.display = "flex";
        this.renderModalContent();
        const pwdInput = document.getElementById("adminKeyInput");
        if (pwdInput) {
          setTimeout(() => pwdInput.focus(), 50);
        }
      }
      try {
        soundFX.playMenuSelect();
      } catch (e) {
      }
    }
    close() {
      this.isOpen = false;
      if (this.domModal) {
        this.domModal.style.display = "none";
      }
      try {
        soundFX.playWhoosh("light");
      } catch (e) {
      }
    }
    toggle() {
      if (this.isOpen) this.close();
      else this.open();
    }
    renderModalContent() {
      if (!this.domModal) return;
      const isAuthed = isAdminAuthenticated();
      if (!isAuthed) {
        this.renderLoginView();
      } else {
        this.renderDashboardView();
      }
    }
    renderLoginView() {
      this.domModal.innerHTML = `
      <div class="admin-card" style="
        background: #09090b;
        border: 2px solid #ef4444;
        box-shadow: 0 0 35px rgba(239, 68, 68, 0.4), inset 0 0 20px rgba(220, 38, 38, 0.1);
        width: 100%;
        max-width: 520px;
        border-radius: 8px;
        padding: 24px;
        color: #f8fafc;
        font-family: 'Press Start 2P', monospace;
        box-sizing: border-box;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #dc2626; padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <div style="color: #ef4444; font-size: 13px; font-weight: bold; letter-spacing: 1px;">\u26A1 ADMIN PORTAL</div>
            <div style="color: #94a3b8; font-size: 7px; margin-top: 4px;">CRYPTOGRAPHIC SECURITY CHECKPOINT</div>
          </div>
          <button id="adminCloseBtn" style="background: transparent; border: none; color: #ef4444; font-size: 16px; cursor: pointer; padding: 4px 8px;">\u2715</button>
        </div>

        <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 10px 12px; margin-bottom: 18px; font-size: 8px; line-height: 1.5; color: #fca5a5;">
          \u{1F512} RESTRICTED TERMINAL \u2014 ENTER ADMINISTRATOR MASTER SECURITY KEY TO PROCEED.
        </div>

        <div style="margin-bottom: 16px;">
          <label for="adminKeyInput" style="display: block; font-size: 8px; color: #fbbf24; margin-bottom: 8px;">SECURITY PASSWORD:</label>
          <div style="display: flex; gap: 8px;">
            <input type="password" id="adminKeyInput" placeholder="ENTER ADMIN KEY" autocomplete="off" style="
              flex: 1;
              background: #0f172a;
              border: 1px solid #ef4444;
              color: #fde047;
              padding: 10px 12px;
              font-family: monospace;
              font-size: 14px;
              border-radius: 4px;
              outline: none;
            ">
            <button id="adminToggleShowPwd" type="button" style="
              background: #1e293b;
              border: 1px solid #475569;
              color: #cbd5e1;
              padding: 0 10px;
              font-size: 12px;
              cursor: pointer;
              border-radius: 4px;
            ">\u{1F441}</button>
          </div>
        </div>

        <div id="adminLoginFeedback" style="min-height: 20px; font-size: 8px; margin-bottom: 14px; color: #ef4444;"></div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button id="adminCancelBtn" style="
            background: #27272a;
            border: 1px solid #52525b;
            color: #d4d4d8;
            padding: 10px 14px;
            font-size: 8px;
            font-family: inherit;
            cursor: pointer;
            border-radius: 4px;
          ">CANCEL</button>
          <button id="adminLoginSubmitBtn" style="
            background: #dc2626;
            border: 1px solid #ef4444;
            color: #ffffff;
            padding: 10px 18px;
            font-size: 8px;
            font-family: inherit;
            cursor: pointer;
            border-radius: 4px;
            font-weight: bold;
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
          ">AUTHENTICATE \u26A1</button>
        </div>
      </div>
    `;
      const closeBtn = document.getElementById("adminCloseBtn");
      const cancelBtn = document.getElementById("adminCancelBtn");
      const submitBtn = document.getElementById("adminLoginSubmitBtn");
      const pwdInput = document.getElementById("adminKeyInput");
      const togglePwdBtn = document.getElementById("adminToggleShowPwd");
      const feedback = document.getElementById("adminLoginFeedback");
      if (closeBtn) closeBtn.onclick = () => this.close();
      if (cancelBtn) cancelBtn.onclick = () => this.close();
      if (togglePwdBtn && pwdInput) {
        togglePwdBtn.onclick = () => {
          if (pwdInput.type === "password") {
            pwdInput.type = "text";
            togglePwdBtn.textContent = "\u{1F512}";
          } else {
            pwdInput.type = "password";
            togglePwdBtn.textContent = "\u{1F441}";
          }
        };
      }
      const doAuth = async () => {
        const val = pwdInput.value;
        if (!val) {
          feedback.style.color = "#ef4444";
          feedback.textContent = "\u274C PLEASE ENTER SECURITY KEY.";
          return;
        }
        feedback.style.color = "#38bdf8";
        feedback.textContent = "VERIFYING CREDENTIALS...";
        const valid = await verifyAdminPassword(val);
        if (valid) {
          setAdminAuthenticated(true);
          feedback.style.color = "#4ade80";
          feedback.textContent = "\u2705 ACCESS GRANTED. WELCOME ADMINISTRATOR.";
          try {
            soundFX.playUltimateActivation();
          } catch (e) {
          }
          setTimeout(() => this.renderDashboardView(), 400);
        } else {
          feedback.style.color = "#ef4444";
          feedback.textContent = "\u274C ACCESS DENIED: INVALID SECURITY KEY.";
          try {
            soundFX.playBlock();
          } catch (e) {
          }
        }
      };
      if (submitBtn) submitBtn.onclick = doAuth;
      if (pwdInput) {
        pwdInput.onkeydown = (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            doAuth();
          }
        };
      }
    }
    renderDashboardView() {
      const isMightyOpen = isMightyUnlocked();
      const coins = EconomyManager.getCoins();
      const cheats = getAdminCheats();
      const stealth = isStealthMode();
      this.domModal.innerHTML = `
      <div class="admin-card" style="
        background: #09090b;
        border: 2px solid #22c55e;
        box-shadow: 0 0 35px rgba(34, 197, 94, 0.35), inset 0 0 20px rgba(22, 101, 52, 0.15);
        width: 100%;
        max-width: 620px;
        max-height: 90vh;
        overflow-y: auto;
        border-radius: 8px;
        padding: 22px;
        color: #f8fafc;
        font-family: 'Press Start 2P', monospace;
        box-sizing: border-box;
      ">
        <!-- Dashboard Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #22c55e; padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <div style="color: #4ade80; font-size: 13px; font-weight: bold; letter-spacing: 1px;">\u26A1 ADMIN CONTROL CENTER</div>
            <div style="color: #86efac; font-size: 7px; margin-top: 4px;">\u{1F7E2} MASTER SESSION ACTIVE & VERIFIED</div>
          </div>
          <button id="adminCloseBtn" style="background: transparent; border: none; color: #4ade80; font-size: 16px; cursor: pointer; padding: 4px 8px;">\u2715</button>
        </div>

        <!-- Section 1: M1GHTY Secret Character Toggle -->
        <div style="background: #18181b; border: 1px solid ${isMightyOpen ? "#eab308" : "#3f3f46"}; border-radius: 6px; padding: 14px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 9px; color: #fbbf24; font-weight: bold;">\u{1F451} SECRET FIGHTER: M1GHTY</span>
            <span id="mightyStatusBadge" style="
              font-size: 7px;
              padding: 4px 8px;
              border-radius: 3px;
              background: ${isMightyOpen ? "#14532d" : "#450a0a"};
              color: ${isMightyOpen ? "#4ade80" : "#f87171"};
              border: 1px solid ${isMightyOpen ? "#22c55e" : "#dc2626"};
            ">${isMightyOpen ? "STATUS: UNLOCKED" : "STATUS: LOCKED"}</span>
          </div>
          <p style="font-size: 7px; color: #94a3b8; line-height: 1.5; margin-bottom: 10px;">
            M1GHTY is an exclusive divine admin character with 9999 one-hit KO power and celestial animations.
          </p>
          <div style="display: flex; gap: 8px;">
            <button id="toggleMightyBtn" style="
              background: ${isMightyOpen ? "#7f1d1d" : "#ca8a04"};
              border: 1px solid ${isMightyOpen ? "#dc2626" : "#eab308"};
              color: #ffffff;
              padding: 8px 14px;
              font-size: 8px;
              font-family: inherit;
              cursor: pointer;
              border-radius: 4px;
            ">${isMightyOpen ? "\u{1F512} LOCK M1GHTY (HIDE FROM ROSTER)" : "\u{1F513} UNLOCK M1GHTY FOR ROSTER"}</button>
          </div>
        </div>

        <!-- Section 2: Economy & Currency Treasury -->
        <div style="background: #18181b; border: 1px solid #3f3f46; border-radius: 6px; padding: 14px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 9px; color: #fde047; font-weight: bold;">\u{1FA99} TREASURY & TOURNAMENT COINS</span>
            <span id="adminCoinCount" style="font-size: 8px; color: #fde047;">${coins.toLocaleString()} COINS</span>
          </div>
          <p style="font-size: 7px; color: #94a3b8; line-height: 1.5; margin-bottom: 10px;">
            Adjust player coin wallet balance for testing shop purchases and unlock flows.
          </p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button id="add1kCoinsBtn" class="admin-action-btn" style="background: #1e293b; border: 1px solid #475569; color: #fde047; padding: 6px 10px; font-size: 7px; font-family: inherit; cursor: pointer; border-radius: 3px;">+1,000 COINS</button>
            <button id="add5kCoinsBtn" class="admin-action-btn" style="background: #1e293b; border: 1px solid #475569; color: #fde047; padding: 6px 10px; font-size: 7px; font-family: inherit; cursor: pointer; border-radius: 3px;">+5,000 COINS</button>
            <button id="add50kCoinsBtn" class="admin-action-btn" style="background: #1e293b; border: 1px solid #475569; color: #fde047; padding: 6px 10px; font-size: 7px; font-family: inherit; cursor: pointer; border-radius: 3px;">+50,000 COINS</button>
            <button id="resetCoinsBtn" class="admin-action-btn" style="background: #27272a; border: 1px solid #52525b; color: #cbd5e1; padding: 6px 10px; font-size: 7px; font-family: inherit; cursor: pointer; border-radius: 3px;">RESET (500)</button>
          </div>
        </div>

        <!-- Section 3: Skin Catalog Master Control -->
        <div style="background: #18181b; border: 1px solid #3f3f46; border-radius: 6px; padding: 14px; margin-bottom: 14px;">
          <div style="font-size: 9px; color: #c084fc; font-weight: bold; margin-bottom: 8px;">\u{1F6CD}\uFE0F SKIN CATALOG MASTER OVERRIDE</div>
          <p style="font-size: 7px; color: #94a3b8; line-height: 1.5; margin-bottom: 10px;">
            Instantly grant ownership of all roster skins or relock unpurchased cosmetics.
          </p>
          <div style="display: flex; gap: 8px;">
            <button id="unlockAllSkinsBtn" style="background: #581c87; border: 1px solid #a855f7; color: #f3e8ff; padding: 8px 12px; font-size: 7px; font-family: inherit; cursor: pointer; border-radius: 3px;">\u{1F451} UNLOCK ALL SKINS</button>
            <button id="resetSkinsBtn" style="background: #27272a; border: 1px solid #52525b; color: #cbd5e1; padding: 8px 12px; font-size: 7px; font-family: inherit; cursor: pointer; border-radius: 3px;">\u{1F512} RELOCK SKINS</button>
          </div>
        </div>

        <!-- Section 4: Combat Cheats & Dev Modifiers -->
        <div style="background: #18181b; border: 1px solid #3f3f46; border-radius: 6px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 9px; color: #38bdf8; font-weight: bold; margin-bottom: 8px;">\u{1F3AE} COMBAT TESTING CHEATS (OFFLINE/DEV)</div>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 7px; color: #cbd5e1;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="cheatGodMode" ${cheats.godMode ? "checked" : ""}>
              <span>\u{1F6E1}\uFE0F GOD MODE (P1 Takes 0 Damage)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="cheatInfiniteSuper" ${cheats.infiniteSuper ? "checked" : ""}>
              <span>\u26A1 INFINITE SUPER METER (Always 100%)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="cheatOneHitKO" ${cheats.oneHitKO ? "checked" : ""}>
              <span>\u{1F480} 1-HIT KO P1 ATTACKS (Instant Elimination)</span>
            </label>
          </div>
        </div>

        <!-- Section 5: Steam Retail Stealth Protection -->
        <div style="background: #18181b; border: 1px solid ${stealth ? "#22c55e" : "#f59e0b"}; border-radius: 6px; padding: 14px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 9px; color: ${stealth ? "#4ade80" : "#fbbf24"}; font-weight: bold;">\u{1F575}\uFE0F STEAM PRODUCTION STEALTH MODE</span>
            <span id="stealthStatusBadge" style="
              font-size: 7px;
              padding: 4px 8px;
              border-radius: 3px;
              background: ${stealth ? "#14532d" : "#713f12"};
              color: ${stealth ? "#86efac" : "#fef08a"};
              border: 1px solid ${stealth ? "#22c55e" : "#eab308"};
            ">${stealth ? "ACTIVE (100% INVISIBLE TO PLAYERS)" : "DEV MODE (BUTTONS VISIBLE)"}</span>
          </div>
          <p style="font-size: 7px; color: #94a3b8; line-height: 1.5; margin-bottom: 10px;">
            When active, all Admin buttons and mentions are wiped from topbars, settings, and character select. Steam players will never see any admin options. Only developer secret shortcut [Ctrl+Shift+Alt+A] opens this cryptographic gate.
          </p>
          <button id="toggleStealthBtn" style="
            background: ${stealth ? "#27272a" : "#15803d"};
            border: 1px solid ${stealth ? "#52525b" : "#22c55e"};
            color: #ffffff;
            padding: 8px 12px;
            font-size: 7px;
            font-family: inherit;
            cursor: pointer;
            border-radius: 3px;
          ">${stealth ? "\u{1F441}\uFE0F UNHIDE ADMIN BUTTONS (DEV TESTING)" : "\u{1F575}\uFE0F ENABLE STEALTH MODE (STEAM RETAIL)"}</button>
        </div>

        <!-- Status & Logout -->
        <div id="adminActionFeedback" style="min-height: 18px; font-size: 7px; margin-bottom: 12px; color: #4ade80;"></div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #27272a; padding-top: 12px;">
          <button id="adminLogoutBtn" style="
            background: #450a0a;
            border: 1px solid #dc2626;
            color: #fca5a5;
            padding: 8px 14px;
            font-size: 7px;
            font-family: inherit;
            cursor: pointer;
            border-radius: 4px;
          ">\u{1F6AA} LOGOUT ADMIN</button>
          <button id="adminCloseDashBtn" style="
            background: #15803d;
            border: 1px solid #22c55e;
            color: #ffffff;
            padding: 8px 16px;
            font-size: 8px;
            font-family: inherit;
            cursor: pointer;
            border-radius: 4px;
            font-weight: bold;
          ">DONE / RETURN [ESC]</button>
        </div>
      </div>
    `;
      const closeBtn = document.getElementById("adminCloseBtn");
      const closeDashBtn = document.getElementById("adminCloseDashBtn");
      const logoutBtn = document.getElementById("adminLogoutBtn");
      const toggleMightyBtn = document.getElementById("toggleMightyBtn");
      const add1kBtn = document.getElementById("add1kCoinsBtn");
      const add5kBtn = document.getElementById("add5kCoinsBtn");
      const add50kBtn = document.getElementById("add50kCoinsBtn");
      const resetCoinsBtn = document.getElementById("resetCoinsBtn");
      const unlockAllSkinsBtn = document.getElementById("unlockAllSkinsBtn");
      const resetSkinsBtn = document.getElementById("resetSkinsBtn");
      const cheatGod = document.getElementById("cheatGodMode");
      const cheatSuper = document.getElementById("cheatInfiniteSuper");
      const cheatKO = document.getElementById("cheatOneHitKO");
      const feedback = document.getElementById("adminActionFeedback");
      const showMsg = (msg, col = "#4ade80") => {
        if (feedback) {
          feedback.style.color = col;
          feedback.textContent = msg;
          setTimeout(() => {
            if (feedback) feedback.textContent = "";
          }, 2500);
        }
      };
      if (closeBtn) closeBtn.onclick = () => this.close();
      if (closeDashBtn) closeDashBtn.onclick = () => this.close();
      if (logoutBtn) {
        logoutBtn.onclick = () => {
          setAdminAuthenticated(false);
          try {
            soundFX.playBlock();
          } catch (e) {
          }
          this.renderLoginView();
        };
      }
      if (toggleMightyBtn) {
        toggleMightyBtn.onclick = () => {
          const currentlyUnlocked = isMightyUnlocked();
          const nextState = !currentlyUnlocked;
          setMightyUnlocked(nextState);
          try {
            if (nextState) soundFX.playUltimateActivation();
            else soundFX.playWhoosh("light");
          } catch (e) {
          }
          showMsg(nextState ? "\u2728 M1GHTY UNLOCKED & ADDED TO ROSTER!" : "\u{1F512} M1GHTY LOCKED & HIDDEN FROM ROSTER.");
          this.renderDashboardView();
        };
      }
      if (add1kBtn) {
        add1kBtn.onclick = () => {
          EconomyManager.addCoins(1e3);
          try {
            soundFX.playUltimateActivation();
          } catch (e) {
          }
          showMsg("\u{1FA99} +1,000 COINS GRANTED!");
          this.renderDashboardView();
        };
      }
      if (add5kBtn) {
        add5kBtn.onclick = () => {
          EconomyManager.addCoins(5e3);
          try {
            soundFX.playUltimateActivation();
          } catch (e) {
          }
          showMsg("\u{1FA99} +5,000 COINS GRANTED!");
          this.renderDashboardView();
        };
      }
      if (add50kBtn) {
        add50kBtn.onclick = () => {
          EconomyManager.addCoins(5e4);
          try {
            soundFX.playUltimateActivation();
          } catch (e) {
          }
          showMsg("\u{1FA99} +50,000 COINS GRANTED!");
          this.renderDashboardView();
        };
      }
      if (resetCoinsBtn) {
        resetCoinsBtn.onclick = () => {
          EconomyManager.setCoins(500);
          try {
            soundFX.playWhoosh("light");
          } catch (e) {
          }
          showMsg("\u{1FA99} WALLET RESET TO 500 COINS.");
          this.renderDashboardView();
        };
      }
      if (unlockAllSkinsBtn) {
        unlockAllSkinsBtn.onclick = () => {
          const count = EconomyManager.unlockAllSkins();
          try {
            soundFX.playUltimateActivation();
          } catch (e) {
          }
          showMsg(`\u{1F451} ALL ${count} SKINS UNLOCKED!`);
        };
      }
      if (resetSkinsBtn) {
        resetSkinsBtn.onclick = () => {
          EconomyManager.resetOwnedSkins();
          try {
            soundFX.playWhoosh("light");
          } catch (e) {
          }
          showMsg("\u{1F512} ALL PURCHASED SKINS RESET.");
        };
      }
      const updateCheats = () => {
        const updated = {
          godMode: !!(cheatGod && cheatGod.checked),
          infiniteSuper: !!(cheatSuper && cheatSuper.checked),
          oneHitKO: !!(cheatKO && cheatKO.checked)
        };
        setAdminCheats(updated);
        showMsg("\u2699\uFE0F COMBAT MODIFIERS UPDATED.");
      };
      if (cheatGod) cheatGod.onchange = updateCheats;
      if (cheatSuper) cheatSuper.onchange = updateCheats;
      if (cheatKO) cheatKO.onchange = updateCheats;
      const toggleStealthBtn = document.getElementById("toggleStealthBtn");
      if (toggleStealthBtn) {
        toggleStealthBtn.onclick = () => {
          const next = !isStealthMode();
          setStealthMode(next);
          if (this.game && typeof this.game.syncStealthUI === "function") {
            this.game.syncStealthUI();
          }
          try {
            soundFX.playMenuSelect();
          } catch (e) {
          }
          showMsg(next ? "\u{1F575}\uFE0F STEALTH ACTIVATED: ADMIN COMPLETELY HIDDEN ON STEAM" : "\u{1F441}\uFE0F DEV MODE: ADMIN BUTTONS ARE NOW VISIBLE");
          this.renderDashboardView();
        };
      }
    }
  };

  // src/elden/EldenRingMechanics.js
  var EldenRingManager = class {
    constructor() {
      this.youDiedActive = false;
      this.youDiedTimer = 0;
      this.felledBannerActive = false;
      this.felledBannerText = "GREAT ENEMY FELLED";
      this.felledBannerTimer = 0;
      this.graceActive = false;
      this.graceMenuIndex = 0;
      this.flaskCharges = 2;
      this.maxFlaskCharges = 2;
      this.upgrades = this.loadUpgrades();
    }
    loadUpgrades() {
      try {
        if (typeof localStorage !== "undefined") {
          const stored = localStorage.getItem("final_impact_elden_upgrades");
          if (stored) return JSON.parse(stored);
        }
      } catch (e) {
      }
      return { vigor: 0, strength: 0, dexterity: 0 };
    }
    saveUpgrades() {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("final_impact_elden_upgrades", JSON.stringify(this.upgrades));
        }
      } catch (e) {
      }
    }
    getUpgradeCost(stat) {
      const curLevel = this.upgrades[stat] || 0;
      return 200 + curLevel * 150;
    }
    triggerYouDied() {
      this.youDiedActive = true;
      this.youDiedTimer = 0;
      announcer.youDied();
      try {
        soundFX.playLowGong();
      } catch (e) {
      }
    }
    triggerFelledBanner(bossId) {
      this.felledBannerActive = true;
      this.felledBannerTimer = 0;
      if (bossId === "endless_dragon") {
        this.felledBannerText = "G O D   S L A I N";
        announcer.godSlain();
      } else if (bossId === "champion" || bossId === "urban_legend") {
        this.felledBannerText = "L E G E N D   F E L L E D";
        announcer.legendFelled();
      } else {
        this.felledBannerText = "G R E A T   E N E M Y   F E L L E D";
        announcer.greatEnemyFelled();
      }
      try {
        soundFX.playUltimateActivation();
      } catch (e) {
      }
    }
    // Applies Elden Ring stat upgrades to player fighter
    applyUpgradesToFighter(fighter) {
      if (!fighter) return;
      const bonusHp = (this.upgrades.vigor || 0) * 100;
      fighter.maxHealth += bonusHp;
      fighter.health = fighter.maxHealth;
      fighter.damageMultiplier = 1 + (this.upgrades.strength || 0) * 0.08;
      fighter.walkSpeed *= 1 + (this.upgrades.dexterity || 0) * 0.04;
    }
    // --- STANCE / POISE BREAK MECHANIC ---
    checkStanceBreak(target, damage) {
      if (!target) return false;
      if (target.poise === void 0) target.poise = 100;
      target.poise = Math.max(0, target.poise - damage * 0.35);
      if (target.poise <= 0 && !target.isStanceBroken) {
        target.isStanceBroken = true;
        target.stanceBreakTimer = 240;
        try {
          soundFX.playParryChime();
          soundFX.playUltimateActivation();
        } catch (e) {
        }
        return true;
      }
      return false;
    }
    updateStance(fighter) {
      if (!fighter) return;
      if (fighter.isStanceBroken) {
        fighter.stanceBreakTimer--;
        if (fighter.stanceBreakTimer <= 0) {
          fighter.isStanceBroken = false;
          fighter.poise = 100;
        }
      } else if (fighter.poise < 100) {
        fighter.poise = Math.min(100, fighter.poise + 0.15);
      }
    }
    update() {
      if (this.youDiedActive) {
        this.youDiedTimer++;
      }
      if (this.felledBannerActive) {
        this.felledBannerTimer++;
        if (this.felledBannerTimer > 300) {
          this.felledBannerActive = false;
        }
      }
    }
    // Render "YOU DIED" fullscreen cinematic overlay
    renderYouDied(ctx, W, H) {
      if (!this.youDiedActive) return;
      const t = this.youDiedTimer;
      const alpha = Math.min(0.92, t * 0.02);
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, 0, W, H);
      const barH = 50;
      ctx.fillStyle = "#1c0505";
      ctx.fillRect(0, 0, W, barH);
      ctx.fillRect(0, H - barH, W, barH);
      if (t > 20) {
        const textAlpha = Math.min(1, (t - 20) * 0.03);
        ctx.save();
        ctx.globalAlpha = textAlpha;
        ctx.textAlign = "center";
        ctx.fillStyle = "#b91c1c";
        ctx.shadowColor = "#dc2626";
        ctx.shadowBlur = 18;
        ctx.font = "900 36px serif";
        ctx.fillText("Y O U   D I E D", W / 2, H / 2 + 8);
        ctx.shadowBlur = 0;
        if (t > 80) {
          ctx.fillStyle = "#fca5a5";
          ctx.font = '8px "Press Start 2P", monospace';
          const pulse = Math.floor(t / 20) % 2 === 0 ? 1 : 0.6;
          ctx.globalAlpha = pulse;
          ctx.fillText("PRESS ANY KEY TO REVIVE AT SITE OF GRACE", W / 2, H / 2 + 54);
        }
        ctx.restore();
      }
    }
    // Render Golden "GREAT ENEMY FELLED / GOD SLAIN" banner
    renderFelledBanner(ctx, W, H) {
      if (!this.felledBannerActive) return;
      const t = this.felledBannerTimer;
      const alpha = t < 30 ? t / 30 : t > 250 ? Math.max(0, (300 - t) / 50) : 1;
      ctx.save();
      ctx.globalAlpha = alpha * 0.95;
      const bannerY = H * 0.35;
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W * 0.15, bannerY - 30);
      ctx.lineTo(W * 0.85, bannerY - 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W * 0.15, bannerY + 20);
      ctx.lineTo(W * 0.85, bannerY + 20);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = "#fef08a";
      ctx.shadowColor = "rgba(250, 204, 21, 0.8)";
      ctx.shadowBlur = 16;
      ctx.font = "900 24px serif";
      ctx.fillText(this.felledBannerText, W / 2, bannerY);
      ctx.shadowBlur = 0;
      for (let i = 0; i < 16; i++) {
        const px2 = (i * 47 + t * 2) % (W * 0.7) + W * 0.15;
        const py = bannerY - 24 + Math.sin(t * 0.05 + i) * 16;
        ctx.fillStyle = "#fde047";
        ctx.fillRect(px2, py, 2, 2);
      }
      ctx.restore();
    }
    // Render Site of Grace Rest Screen
    renderSiteOfGrace(ctx, W, H) {
      if (!this.graceActive) return;
      ctx.fillStyle = "#0a0808";
      ctx.fillRect(0, 0, W, H);
      const spireX = W / 2;
      const spireY = H - 80;
      const grad = ctx.createRadialGradient(spireX, spireY - 60, 5, spireX, spireY - 60, 140);
      grad.addColorStop(0, "rgba(250, 204, 21, 0.45)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(spireX, spireY - 60, 140, 100, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fde047";
      ctx.fillRect(spireX - 3, spireY - 120, 6, 120);
      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.arc(spireX, spireY, 14, 0, Math.PI * 2);
      ctx.fill();
      const time = Date.now() * 3e-3;
      for (let i = 0; i < 24; i++) {
        const a = i * 0.4 + time;
        const r = 20 + i % 6 * 12;
        const gx = spireX + Math.cos(a) * r;
        const gy = spireY - 60 + Math.sin(a) * (r * 0.6) - i % 8 * 8;
        ctx.fillStyle = i % 2 === 0 ? "#fef08a" : "#f59e0b";
        ctx.fillRect(gx, gy, 2.5, 2.5);
      }
      ctx.textAlign = "center";
      ctx.fillStyle = "#fde047";
      ctx.font = "900 16px serif";
      ctx.fillText("S I T E   O F   G R A C E", W / 2, 34);
      ctx.font = '7px "Press Start 2P"';
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("REST, LEVEL UP ATTRIBUTES, AND PREPARE FOR THE NEXT TRIAL", W / 2, 48);
      const coins = EconomyManager.getCoins();
      ctx.fillStyle = "#facc15";
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(`RUNES / COINS: \u{1FA99} ${coins.toLocaleString()}`, W / 2, 66);
      const options = [
        { id: "rest", label: `REST & REFILL FLASK (${this.flaskCharges}/${this.maxFlaskCharges} CHARGES)` },
        { id: "vigor", label: `LEVEL UP VIGOR (HP +100) \u2014 [\u{1FA99} ${this.getUpgradeCost("vigor")} COINS]` },
        { id: "strength", label: `LEVEL UP STRENGTH (DMG +8%) \u2014 [\u{1FA99} ${this.getUpgradeCost("strength")} COINS]` },
        { id: "venture", label: `VENTURE FORTH (ENTER NEXT ARENA)` }
      ];
      const menuY0 = 100;
      const itemH = 26;
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const isSel = i === this.graceMenuIndex;
        const iy = menuY0 + i * itemH;
        if (isSel) {
          ctx.fillStyle = "rgba(234, 179, 8, 0.25)";
          ctx.fillRect(W / 2 - 200, iy, 400, 20);
          ctx.strokeStyle = "#facc15";
          ctx.strokeRect(W / 2 - 200, iy, 400, 20);
          ctx.fillStyle = "#fde047";
          ctx.font = '8px "Press Start 2P"';
          ctx.fillText(`\u25B6 ${opt.label}`, W / 2, iy + 14);
        } else {
          ctx.fillStyle = "#cbd5e1";
          ctx.font = '7.5px "Press Start 2P"';
          ctx.fillText(`  ${opt.label}`, W / 2, iy + 14);
        }
      }
      ctx.fillStyle = "#64748b";
      ctx.font = '6px "Press Start 2P"';
      ctx.fillText("[W/S or UP/DOWN] SELECT  |  [ENTER/SPACE] CONFIRM", W / 2, H - 16);
    }
    handleGraceInput(inputState) {
      if (inputState.up) {
        this.graceMenuIndex = (this.graceMenuIndex - 1 + 4) % 4;
        soundFX.playWhoosh("light");
      } else if (inputState.down) {
        this.graceMenuIndex = (this.graceMenuIndex + 1) % 4;
        soundFX.playWhoosh("light");
      }
      if (inputState.confirm || inputState.lp) {
        return this.executeGraceSelection();
      }
      return null;
    }
    executeGraceSelection() {
      const idx = this.graceMenuIndex;
      if (idx === 0) {
        this.flaskCharges = this.maxFlaskCharges;
        try {
          soundFX.playUltimateActivation();
        } catch (e) {
        }
        return { action: "rest" };
      } else if (idx === 1) {
        const cost = this.getUpgradeCost("vigor");
        if (EconomyManager.spendCoins(cost)) {
          this.upgrades.vigor = (this.upgrades.vigor || 0) + 1;
          this.saveUpgrades();
          try {
            soundFX.playUltimateActivation();
          } catch (e) {
          }
          return { action: "level_vigor" };
        } else {
          try {
            soundFX.playBlock();
          } catch (e) {
          }
        }
      } else if (idx === 2) {
        const cost = this.getUpgradeCost("strength");
        if (EconomyManager.spendCoins(cost)) {
          this.upgrades.strength = (this.upgrades.strength || 0) + 1;
          this.saveUpgrades();
          try {
            soundFX.playUltimateActivation();
          } catch (e) {
          }
          return { action: "level_strength" };
        } else {
          try {
            soundFX.playBlock();
          } catch (e) {
          }
        }
      } else if (idx === 3) {
        this.graceActive = false;
        try {
          soundFX.playMenuSelect();
        } catch (e) {
        }
        return { action: "proceed" };
      }
      return null;
    }
  };
  var eldenManager = new EldenRingManager();

  // src/engine/Game.js
  var GAME_SCREENS = {
    TITLE: "TITLE",
    MODE_SELECT: "MODE_SELECT",
    ONLINE_LOBBY: "ONLINE_LOBBY",
    CHAR_SELECT: "CHAR_SELECT",
    STAGE_SELECT: "STAGE_SELECT",
    VERSUS: "VERSUS",
    FIGHT: "FIGHT",
    ROUND_OVER: "ROUND_OVER",
    VICTORY: "VICTORY",
    SHOP: "SHOP",
    SITE_OF_GRACE: "SITE_OF_GRACE"
  };
  var Game = class {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.ctx.imageSmoothingEnabled = false;
      this.screen = GAME_SCREENS.TITLE;
      this.titleScreen = new TitleScreen();
      this.modeSelect = new ModeSelect();
      this.charSelect = new CharacterSelect();
      this.shopScreen = new ShopScreen();
      this.adminModal = new AdminModal(this);
      this.charSelect.onOpenAdmin = () => this.adminModal.open();
      if (typeof window !== "undefined") {
        window.openAdminPortal = () => this.adminModal.open();
      }
      this.hud = new HUD();
      this.stageSelect = new StageSelect(STAGE_CATALOG);
      this.versus = new VersusScreen();
      this.finish = new FinishHim();
      this.elden = eldenManager;
      this.announcer = announcer;
      this.syncStealthUI();
      this.netplay = new Netplay();
      this.onlineLobby = new OnlineLobby(this.netplay, this);
      this.isOnline = false;
      this.onlineSyncTick = 0;
      this.victoryMenuIndex = 0;
      this.onlineRematchOption = 0;
      this.myRematchVote = null;
      this.oppRematchVote = null;
      this.rematchStatusMessage = "";
      this.rematchTimer = 0;
      this.netplay.onConnect((isHost) => {
        this.isOnline = true;
        const isCoop = this.onlineLobby && this.onlineLobby.matchMode === "coop_campaign";
        this.isCoopCampaign = isCoop;
        const modeToSet = isCoop ? "coop_campaign" : "online";
        this.charSelect.setMode(modeToSet, "normal", isHost ? 1 : 2);
        this.screen = GAME_SCREENS.CHAR_SELECT;
        soundFX.playMenuSelect();
      });
      this.netplay.onDisconnect(() => {
        if (this.isOnline) {
          this.isOnline = false;
          this.isCoopCampaign = false;
          soundFX.playBlock();
          if (this.screen === GAME_SCREENS.FIGHT || this.screen === GAME_SCREENS.CHAR_SELECT || this.screen === GAME_SCREENS.ROUND_OVER || this.screen === GAME_SCREENS.VERSUS || this.screen === GAME_SCREENS.STAGE_SELECT) {
            this.onlineLobby.reset();
            this.onlineLobby.subState = "MENU";
            this.onlineLobby.netplay.statusMessage = "CHALLENGER DISCONNECTED";
            this.screen = GAME_SCREENS.ONLINE_LOBBY;
          } else if (this.screen === GAME_SCREENS.VICTORY) {
            this.rematchStatusMessage = "OPPONENT DISCONNECTED. RETURNING TO LOBBY...";
            if (!this.rematchTimer) this.rematchTimer = 60;
          }
        }
      });
      this.netplay.onMessage((msg) => {
        if (msg.type === "CHAR_SYNC") {
          if (!this.netplay.isHost) {
            if (msg.p1Index !== void 0) this.charSelect.p1Index = msg.p1Index;
            if (msg.stageIndex !== void 0) this.charSelect.stageIndex = msg.stageIndex;
            if (msg.matchMode) {
              this.onlineLobby.matchMode = msg.matchMode;
              this.isCoopCampaign = msg.matchMode === "coop_campaign";
              this.charSelect.gameMode = msg.matchMode;
            }
          } else {
            if (msg.p2Index !== void 0) this.charSelect.p2Index = msg.p2Index;
          }
          if (msg.startMatch) {
            this.startMatch();
          }
        } else if (msg.type === "STAGE_SCREEN") {
          if (!this.netplay.isHost) {
            if (msg.p1Index !== void 0) this.charSelect.p1Index = msg.p1Index;
            if (msg.matchMode) {
              this.onlineLobby.matchMode = msg.matchMode;
              this.charSelect.gameMode = msg.matchMode;
            }
            this.goToStageSelect();
            if (msg.index !== void 0) this.stageSelect.setIndex(msg.index);
          }
        } else if (msg.type === "STAGE_NAV") {
          if (!this.netplay.isHost && this.screen === GAME_SCREENS.STAGE_SELECT) this.stageSelect.setIndex(msg.index);
        } else if (msg.type === "STAGE_BACK") {
          if (!this.netplay.isHost && this.screen === GAME_SCREENS.STAGE_SELECT) {
            this.screen = GAME_SCREENS.CHAR_SELECT;
            soundFX.playWhoosh("light");
          }
        } else if (msg.type === "CAMPAIGN_NEXT_STAGE") {
          this.bossIndex = msg.bossIndex;
          if (this.f1) this.f1.health = Math.min(this.f1.maxHealth, this.f1.health + 500);
          if (this.f3) this.f3.health = Math.min(this.f3.maxHealth, this.f3.health + 500);
          this.setupCampaignStage(this.f1 ? this.f1.id : "kazuki", false);
          this.slowMotion = false;
          this.beginVersus();
        } else if (msg.type === "CAMPAIGN_VICTORY") {
          if (typeof window !== "undefined" && window.localStorage) {
            try {
              window.localStorage.setItem("final_impact_unlocked_dragon", "true");
              window.localStorage.setItem("final_impact_beaten_dragon", "true");
            } catch (e) {
            }
          }
          if (this.charSelect) this.charSelect.unlockDragon();
          this.initVictoryScreen();
          this.winner = this.f1;
          soundFX.playAnnouncer("YOU_WIN");
        } else if (msg.type === "REMATCH_VOTE") {
          this.handleOpponentRematchVote(msg.vote);
        } else if (msg.type === "REMATCH") {
          this.startMatch();
        }
      });
      if (this.canvas && typeof this.canvas.addEventListener === "function") {
        this.canvas.addEventListener("click", (e) => {
          const rect = this.canvas.getBoundingClientRect ? this.canvas.getBoundingClientRect() : { left: 0, top: 0, width: this.canvas.width || 640, height: this.canvas.height || 360 };
          const scaleX = this.canvas.width / (rect.width || 1);
          const scaleY = this.canvas.height / (rect.height || 1);
          const x = (e.clientX - rect.left) * scaleX;
          const y = (e.clientY - rect.top) * scaleY;
          if (this.screen === GAME_SCREENS.MODE_SELECT) {
            this.modeSelect.handleClick(x, y, () => {
              this.screen = GAME_SCREENS.TITLE;
            }, () => {
              this.handleConfirmPress();
            }, this.canvas.width);
          } else if (this.screen === GAME_SCREENS.CHAR_SELECT) {
            this.charSelect.handleClick(x, y, () => {
              if (this.isOnline) {
                this.netplay.disconnect();
                this.isOnline = false;
                this.screen = GAME_SCREENS.ONLINE_LOBBY;
              } else {
                this.screen = GAME_SCREENS.MODE_SELECT;
              }
            }, () => {
              this.handleConfirmPress();
            }, this.canvas.width, this.canvas.height);
          } else if (this.screen === GAME_SCREENS.STAGE_SELECT) {
            this.stageSelect.handleClick(x, y, this.canvas.width, this.canvas.height, {
              onBack: () => this.handleBackPress(),
              onConfirm: () => this.handleConfirmPress()
            });
            if (this.isOnline && this.netplay.isHost && this.screen === GAME_SCREENS.STAGE_SELECT) {
              this.netplay.send({ type: "STAGE_NAV", index: this.stageSelect.index });
            }
          } else if (this.screen === GAME_SCREENS.SHOP) {
            const res = this.shopScreen.handleMouseClick(x, y, this.canvas.width, this.canvas.height);
            if (res && res.action === "back") {
              this.handleBackPress();
            }
          } else if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
            this.onlineLobby.handleClick(x, y);
          } else if (this.screen === GAME_SCREENS.VICTORY) {
            this.handleVictoryClick(x, y);
          } else if (this.screen === GAME_SCREENS.SITE_OF_GRACE) {
            const res = this.elden.executeGraceSelection();
            if (res && res.action === "proceed") {
              this.startNextCampaignStage();
            }
          }
        });
      }
      if (typeof window !== "undefined" && window.location && window.location.search) {
        try {
          const params = new URLSearchParams(window.location.search);
          const room = params.get("room");
          if (room) {
            this.onlineLobby.subState = "JOINING";
            this.onlineLobby.joinInputCode = room.toUpperCase();
            this.screen = GAME_SCREENS.ONLINE_LOBBY;
            setTimeout(() => {
              this.netplay.joinMatch(room);
            }, 600);
          }
        } catch (e) {
          console.warn("Failed to parse URL query params", e);
        }
      }
      this.ai = new AIController("normal");
      this.ai2 = new AIController("normal");
      this.ai3 = new AIController("normal");
      this.settingsManager = new SettingsManager(this);
      window.__GAME_SETTINGS = this.settingsManager;
      window.__GAME_INSTANCE = this;
      this.gameSpeedTick = 0;
      this.stage = new Stage("suzaku");
      this.f1 = null;
      this.f2 = null;
      this.f3 = null;
      this.f4 = null;
      this.allFighters = [];
      this.pickups = [];
      this.projectiles = [];
      this.cameraX = 0;
      this.round = 1;
      this.roundOverTimer = 0;
      this.slowMotion = false;
      this.slowMotionCounter = 0;
      this.winner = null;
      this.showHitboxes = false;
      this.isCampaign = false;
      this.isCoopCampaign = false;
      this.is2v2 = false;
      this.isTraining = false;
      this.bossQueue = ["riot_cop", "promoter", "bouncer_twins", "matriarch", "street_lord", "urban_legend", "champion", "endless_dragon"];
      this.bossIndex = 0;
      this.campaignStageWon = false;
      this.victoryQuotes = {
        ...ROSTER_QUOTES,
        kazuki: '"The true strength comes from mastering oneself in battle!"',
        raven: '"Mission accomplished. Standard tactical superiority."',
        kagura: '"You cannot strike what your eyes cannot follow."',
        riot_cop: '"Law and order will be maintained by any means necessary."',
        promoter: `"Everyone has a price. You just couldn't afford mine."`,
        boris: '"Hahaha! Weak bones break easily under Russian muscle!"',
        viktor: '"Speed and precision dismantle raw brute force every time."',
        matriarch: '"A predictable blade cuts only the fool who swings it."',
        street_lord: '"Flesh and bone are obsolete. Cybernetics are forever."',
        urban_legend: '"I am the reflection you cannot defeat."',
        champion: '"Tape your hands and step aside. You never stood a chance."',
        fang: '"Eight limbs of devastation. That is the art of Muay Thai."',
        zephyr: `"Can't hit what flows like the wind, my friend."`,
        colossus: '"Iron fists. Iron will. You never had a chance."',
        endless_dragon: '"Mortals cannot extinguish an eternal flame."',
        mighty: '"Absolute divinity. One hit is all reality allows."'
      };
      window.addEventListener("keydown", (e) => {
        if (this.settingsManager && this.settingsManager.isOpen) {
          if (this.settingsManager.isRebinding) {
            return;
          }
          if (e.code === "KeyP") {
            e.preventDefault();
            this.settingsManager.close();
            return;
          }
          if (e.code === "Escape") {
            e.preventDefault();
            return;
          }
          return;
        }
        if (this.screen === GAME_SCREENS.FIGHT && e.code === "Escape") {
          e.preventDefault();
          return;
        }
        if (e.code === "KeyH") {
          this.showHitboxes = !this.showHitboxes;
          window.__GAME_HITBOXES = this.showHitboxes;
        }
        if (e.code === "KeyT") {
          input.easyInputs = !input.easyInputs;
          window.__GAME_EASY = input.easyInputs;
        }
        if (e.code === "KeyM") {
          if (soundFX.musicPlaying) soundFX.stopMusic();
          else soundFX.startMusic("fight");
        }
        const isBackKey = e.code === "Escape" || e.code === "Tab" || e.code === "Backquote" || e.code === "KeyB" && this.screen !== GAME_SCREENS.FIGHT && (this.screen !== GAME_SCREENS.ONLINE_LOBBY || this.onlineLobby.subState !== "JOINING");
        if (isBackKey) {
          e.preventDefault();
          e.stopPropagation();
          this.handleBackPress();
        }
        if (e.code === "KeyP") {
          e.preventDefault();
          this.settingsManager.toggle();
        }
        if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
          if (e.code === "KeyC" && this.onlineLobby.subState === "HOSTING") {
            this.onlineLobby.handleInput({ copy: true });
          } else if (e.code === "KeyM" && (this.onlineLobby.subState === "MENU" || this.onlineLobby.subState === "HOSTING")) {
            this.onlineLobby.handleInput({ toggleMode: true });
          } else if (this.onlineLobby.subState === "JOINING" && e.code !== "Space" && e.code !== "Enter") {
            this.onlineLobby.handleInput({ key: e.key });
          }
        }
        if (e.ctrlKey && e.shiftKey && e.altKey && e.code === "KeyA") {
          e.preventDefault();
          this.adminModal.open();
          return;
        }
        if (e.code === "KeyA" && (!isStealthMode() || isAdminAuthenticated()) && (this.screen !== GAME_SCREENS.FIGHT || e.shiftKey)) {
          e.preventDefault();
          this.adminModal.toggle();
          return;
        }
        if (["Space", "Enter"].includes(e.code) && !this.settingsManager.isOpen) {
          this.handleConfirmPress();
        }
      });
    }
    syncStealthUI() {
      try {
        if (typeof document === "undefined") return;
        const stealth = isStealthMode();
        const topbarAdminBtn = document.getElementById("topbarAdminBtn");
        if (topbarAdminBtn) {
          topbarAdminBtn.style.display = stealth ? "none" : "inline-block";
        }
        const adminGroup = document.getElementById("adminPortalLauncherGroup");
        if (adminGroup) {
          adminGroup.style.display = stealth ? "none" : "block";
        }
      } catch (e) {
      }
    }
    handleConfirmPress() {
      soundFX.ensureContext();
      if (this.screen === GAME_SCREENS.TITLE) {
        soundFX.playGong();
        this.screen = GAME_SCREENS.MODE_SELECT;
        return;
      }
      if (this.screen === GAME_SCREENS.MODE_SELECT) {
        soundFX.playGong();
        if (this.modeSelect.selectedMode === "shop") {
          this.screen = GAME_SCREENS.SHOP;
          soundFX.playMenuSelect();
          return;
        }
        if (this.modeSelect.selectedMode === "coop_campaign") {
          this.onlineLobby.reset(true);
          this.onlineLobby.matchMode = "coop_campaign";
          this.isCoopCampaign = true;
          this.screen = GAME_SCREENS.ONLINE_LOBBY;
          return;
        }
        if (this.modeSelect.selectedMode === "online") {
          this.onlineLobby.reset(true);
          this.onlineLobby.matchMode = "versus";
          this.isCoopCampaign = false;
          this.screen = GAME_SCREENS.ONLINE_LOBBY;
          return;
        }
        this.charSelect.setMode(this.modeSelect.selectedMode, this.modeSelect.currentDifficulty);
        this.charSelect.refreshPreviews();
        this.screen = GAME_SCREENS.CHAR_SELECT;
        return;
      }
      if (this.screen === GAME_SCREENS.SITE_OF_GRACE) {
        const res = this.elden.executeGraceSelection();
        if (res && res.action === "proceed") {
          this.startNextCampaignStage();
        }
        return;
      }
      if (this.screen === GAME_SCREENS.SHOP) {
        this.shopScreen.triggerSkinAction();
        return;
      }
      if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
        this.onlineLobby.handleInput({ confirm: true });
        return;
      }
      if (this.screen === GAME_SCREENS.CHAR_SELECT) {
        const isP1 = !this.isOnline || this.netplay.isHost;
        if (this.charSelect.isCurrentSelectionLocked(isP1)) {
          try {
            soundFX.playBlock();
          } catch (e) {
          }
          this.charSelect.codeFeedback = "\u{1F512} M1GHTY RESTRICTED TO ADMINS! LOG IN VIA ADMIN PORTAL [A]";
          this.charSelect.codeFeedbackColor = "#fbbf24";
          this.adminModal.open();
          return;
        }
        if (this.isOnline) {
          if (this.netplay.isHost) {
            if (this.onlineLobby.matchMode === "coop_campaign") {
              this.netplay.send({
                type: "CHAR_SYNC",
                p1Index: this.charSelect.p1Index,
                stageIndex: this.charSelect.stageIndex,
                matchMode: this.onlineLobby.matchMode,
                startMatch: true
              });
              this.startMatch();
            } else {
              this.goToStageSelect();
              this.netplay.send({ type: "STAGE_SCREEN", p1Index: this.charSelect.p1Index, p2Index: this.charSelect.p2Index, matchMode: this.onlineLobby.matchMode, index: this.stageSelect.index });
            }
          } else {
            this.netplay.send({
              type: "CHAR_SYNC",
              p2Index: this.charSelect.p2Index,
              p2Ready: true
            });
            soundFX.playMenuSelect();
          }
          return;
        }
        if (["cpu", "2p", "2v2", "training"].includes(this.charSelect.gameMode)) {
          this.goToStageSelect();
          return;
        }
        this.startMatch();
        return;
      }
      if (this.screen === GAME_SCREENS.STAGE_SELECT) {
        this.confirmStage();
        return;
      }
      if (this.screen === GAME_SCREENS.VERSUS) {
        this.versus.skip();
        return;
      }
      if (this.screen === GAME_SCREENS.VICTORY) {
        if (this.isOnline) {
          if (this.myRematchVote === null) {
            this.voteRematch(this.onlineRematchOption === 0 ? "yes" : "no");
          }
          return;
        }
        if (this.victoryMenuIndex === 0) {
          soundFX.stopMusic();
          this.startMatch(true);
        } else if (this.victoryMenuIndex === 1) {
          soundFX.stopMusic();
          soundFX.playMenuSelect();
          this.bossIndex = 0;
          this.screen = GAME_SCREENS.CHAR_SELECT;
        } else {
          soundFX.stopMusic();
          soundFX.playMenuSelect();
          this.bossIndex = 0;
          this.screen = GAME_SCREENS.MODE_SELECT;
        }
      }
    }
    handleBackPress() {
      if (this.settingsManager && this.settingsManager.isOpen) {
        this.settingsManager.close();
        return;
      }
      if (this.screen === GAME_SCREENS.SHOP) {
        soundFX.playWhoosh("light");
        this.screen = GAME_SCREENS.MODE_SELECT;
        this.charSelect.refreshPreviews();
        return;
      }
      if (this.screen === GAME_SCREENS.MODE_SELECT) {
        soundFX.playWhoosh("light");
        this.screen = GAME_SCREENS.TITLE;
      } else if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
        if (this.onlineLobby.subState === "MENU") {
          soundFX.playWhoosh("light");
          this.screen = GAME_SCREENS.MODE_SELECT;
        } else {
          this.onlineLobby.handleInput({ back: true });
        }
      } else if (this.screen === GAME_SCREENS.CHAR_SELECT) {
        soundFX.playWhoosh("light");
        if (this.isOnline) {
          this.netplay.disconnect();
          this.isOnline = false;
          this.screen = GAME_SCREENS.ONLINE_LOBBY;
        } else {
          this.screen = GAME_SCREENS.MODE_SELECT;
        }
      } else if (this.screen === GAME_SCREENS.STAGE_SELECT) {
        if (this.isOnline && !this.netplay.isHost) return;
        soundFX.playWhoosh("light");
        this.screen = GAME_SCREENS.CHAR_SELECT;
        if (this.isOnline) this.netplay.send({ type: "STAGE_BACK" });
      } else if (this.screen === GAME_SCREENS.VICTORY) {
        soundFX.playWhoosh("light");
        if (this.isOnline) {
          this.voteRematch("no");
        } else {
          this.screen = GAME_SCREENS.MODE_SELECT;
        }
      } else if (this.screen === GAME_SCREENS.FIGHT || this.screen === GAME_SCREENS.ROUND_OVER) {
        this.settingsManager.toggle();
      }
    }
    initVictoryScreen() {
      if (this.finish) this.finish.reset();
      soundFX.stopMusic();
      this.screen = GAME_SCREENS.VICTORY;
      this.victoryMenuIndex = 0;
      this.onlineRematchOption = 0;
      this.myRematchVote = null;
      this.oppRematchVote = null;
      this.rematchStatusMessage = "";
      this.rematchTimer = 0;
    }
    voteRematch(vote) {
      if (this.myRematchVote !== null) return;
      this.myRematchVote = vote;
      if (this.netplay && this.netplay.isConnected) {
        this.netplay.sendRematchVote(vote);
      }
      if (vote === "yes") {
        soundFX.playMenuSelect();
        if (this.oppRematchVote === "yes") {
          this.rematchStatusMessage = "\u2694\uFE0F BOTH PLAYERS ACCEPTED! REMATCH STARTING... \u2694\uFE0F";
          this.rematchTimer = 60;
        } else {
          this.rematchStatusMessage = "YOU VOTED YES. WAITING FOR OPPONENT...";
        }
      } else {
        soundFX.playWhoosh("light");
        this.rematchStatusMessage = "YOU DECLINED REMATCH. RETURNING TO LOBBY...";
        this.rematchTimer = 75;
      }
    }
    handleOpponentRematchVote(vote) {
      this.oppRematchVote = vote;
      if (vote === "yes") {
        if (this.myRematchVote === "yes") {
          this.rematchStatusMessage = "\u2694\uFE0F BOTH PLAYERS ACCEPTED! REMATCH STARTING... \u2694\uFE0F";
          this.rematchTimer = 60;
        } else {
          this.rematchStatusMessage = "OPPONENT WANTS A REMATCH! (VOTE YES OR NO)";
        }
      } else if (vote === "no") {
        this.rematchStatusMessage = "OPPONENT DECLINED REMATCH. RETURNING TO LOBBY...";
        this.rematchTimer = 75;
      }
    }
    handleVictoryClick(x, y) {
      const W = this.canvas.width;
      if (x >= 12 && x <= 110 && y >= 10 && y <= 34) {
        if (this.isOnline) {
          this.voteRematch("no");
        } else {
          soundFX.stopMusic();
          soundFX.playWhoosh("light");
          this.bossIndex = 0;
          this.screen = GAME_SCREENS.MODE_SELECT;
        }
        return true;
      }
      if (this.isOnline) {
        if (this.myRematchVote === null) {
          if (x >= W / 2 - 195 && x <= W / 2 - 10 && y >= 262 && y <= 296) {
            this.onlineRematchOption = 0;
            this.voteRematch("yes");
            return true;
          }
          if (x >= W / 2 + 10 && x <= W / 2 + 195 && y >= 262 && y <= 296) {
            this.onlineRematchOption = 1;
            this.voteRematch("no");
            return true;
          }
        }
      } else {
        if (x >= W / 2 - 130 && x <= W / 2 + 130) {
          if (y >= 224 && y <= 248) {
            this.victoryMenuIndex = 0;
            this.handleConfirmPress();
            return true;
          } else if (y >= 254 && y <= 278) {
            this.victoryMenuIndex = 1;
            this.handleConfirmPress();
            return true;
          } else if (y >= 284 && y <= 308) {
            this.victoryMenuIndex = 2;
            this.handleConfirmPress();
            return true;
          }
        }
      }
      return false;
    }
    leaveGame(target = "MODE_SELECT") {
      if (this.settingsManager) {
        this.settingsManager.close();
      }
      try {
        soundFX.stopMusic();
        soundFX.playMenuSelect();
      } catch (e) {
      }
      if (this.isOnline) {
        try {
          if (this.netplay) {
            this.netplay.send({ type: "FORFEIT" });
            this.netplay.disconnect();
          }
        } catch (e) {
        }
        this.isOnline = false;
        if (this.onlineLobby) {
          this.onlineLobby.reset();
        }
      }
      this.f1 = null;
      this.f2 = null;
      this.f3 = null;
      this.f4 = null;
      this.allFighters = [];
      this.projectiles = [];
      this.pickups = [];
      this.isCampaign = false;
      this.isCoopCampaign = false;
      this.is2v2 = false;
      this.isTraining = false;
      this.bossIndex = 0;
      this.round = 1;
      this.slowMotion = false;
      this.winner = null;
      if (target === "CHAR_SELECT") {
        this.screen = GAME_SCREENS.CHAR_SELECT;
      } else {
        this.screen = GAME_SCREENS.MODE_SELECT;
      }
    }
    startMatch(isRematch = false) {
      soundFX.stopMusic();
      const p1Id = this.charSelect.characters[this.charSelect.p1Index].id;
      const stageId = this.charSelect.stages[this.charSelect.stageIndex].id;
      const mode = this.charSelect.gameMode;
      this.stage = new Stage(stageId);
      this.round = 1;
      this.projectiles.forEach((p) => {
        if (p && p.destroy) p.destroy();
      });
      this.projectiles = [];
      this.spawnDefaultPickups();
      this.isCoopCampaign = mode === "coop_campaign" || this.isOnline && this.onlineLobby?.matchMode === "coop_campaign";
      this.isCampaign = mode === "campaign" || this.isCoopCampaign;
      this.is2v2 = mode === "2v2";
      this.isTraining = mode === "training";
      this.isOnline = mode === "online" || this.isCoopCampaign || this.netplay && this.netplay.isConnected;
      if (this.isCampaign) {
        if (!isRematch || this.campaignStageWon) {
          this.bossIndex = 0;
        }
        this.setupCampaignStage(p1Id, true);
      } else if (this.is2v2) {
        const p1AllyId = p1Id === "kazuki" ? "raven" : p1Id === "raven" ? "kagura" : "kazuki";
        const enemy1Id = this.charSelect.characters[this.charSelect.p2Index].id;
        const enemy2Id = enemy1Id === "kagura" ? "raven" : "kagura";
        this.f1 = this.createFighter(p1Id, 180, true, 1, false);
        this.f3 = this.createFighter(p1AllyId, 100, true, 3, true);
        this.f2 = this.createFighter(enemy1Id, 720, false, 2, true);
        this.f4 = this.createFighter(enemy2Id, 810, false, 4, true);
        this.ai.setDifficulty("normal");
        this.ai2.setDifficulty("normal");
        this.ai3.setDifficulty("normal");
        this.allFighters = [this.f1, this.f2, this.f3, this.f4];
      } else {
        const p2Id = this.charSelect.characters[this.charSelect.p2Index].id;
        const isCpu = !this.isOnline && mode !== "2p";
        this.f1 = this.createFighter(p1Id, 220, true, 1, false);
        this.f2 = this.createFighter(p2Id, 700, false, 2, isCpu);
        this.f3 = null;
        this.f4 = null;
        this.allFighters = [this.f1, this.f2];
        if (this.isTraining) {
          this.ai.setDifficulty("easy");
        } else if (!this.isOnline) {
          this.ai.setDifficulty(this.charSelect.cpuDifficulty || "normal");
        }
      }
      this.hud.reset(this.round);
      this.hud.p1RedHealth = this.f1 ? this.f1.health : 1e3;
      this.hud.p2RedHealth = this.f2 ? this.f2.health : 1e3;
      this.beginVersus();
    }
    /** Shows the MK-style VS splash, then hands over to the fight. */
    beginVersus() {
      soundFX.stopMusic();
      this.finish.reset();
      const info = STAGE_CATALOG.find((s) => s.id === (this.stage && this.stage.stageId)) || {};
      let topLabel = "FIGHT";
      if (this.isCampaign) topLabel = "STAGE " + ((this.bossIndex || 0) + 1);
      else if (this.isCoopCampaign) topLabel = "2P RAID";
      else if (this.isTraining) topLabel = "TRAINING";
      this.versus.start({
        f1: this.f1,
        f2: this.f2,
        p1Label: "P1",
        p2Label: this.isOnline ? "P2" : this.isCampaign || this.isTraining ? "CPU" : this.charSelect.gameMode === "2p" ? "P2" : "CPU",
        stageName: info.name || "",
        stageLocation: info.location || "",
        topLabel,
        duration: this.isOnline ? 100 : 150
      });
      this.screen = GAME_SCREENS.VERSUS;
    }
    finishVersus() {
      this.screen = GAME_SCREENS.FIGHT;
      soundFX.startMusic("fight");
      soundFX.playAnnouncer("ROUND1");
      try {
        this.announcer.round1();
      } catch (e) {
      }
    }
    startNextCampaignStage() {
      this.bossIndex++;
      if (this.bossIndex < this.bossQueue.length) {
        this.f1.health = Math.min(this.f1.maxHealth, this.f1.health + 500);
        this.f1.stamina = this.f1.maxStamina;
        if (this.f3) {
          this.f3.health = Math.min(this.f3.maxHealth, this.f3.health + 500);
          this.f3.stamina = this.f3.maxStamina;
        }
        this.setupCampaignStage(this.f1.id, false);
        this.slowMotion = false;
        this.beginVersus();
      } else {
        EconomyManager.addCoins(1e3);
        this.initVictoryScreen();
        this.winner = this.f1;
        soundFX.playAnnouncer("YOU_WIN");
      }
    }
    goToStageSelect() {
      const gm = this.charSelect.gameMode;
      const p2Name = gm === "2p" ? "PLAYER 2" : gm === "training" ? "DUMMY" : this.isOnline ? "CHALLENGER" : "CPU";
      const names = this.charSelect.characters || [];
      const nm = (i) => names[i] && names[i].name ? names[i].name : "";
      this.stageSelect.setContext({ mode: gm, p1Name: nm(this.charSelect.p1Index), p2Name: gm === "2p" || this.isOnline ? nm(this.charSelect.p2Index) || p2Name : p2Name, canChoose: !this.isOnline || this.netplay.isHost });
      this.stageSelect.setIndex(this.charSelect.stageIndex || 0);
      this.screen = GAME_SCREENS.STAGE_SELECT;
      soundFX.playMenuSelect();
    }
    confirmStage() {
      if (this.isOnline && !this.netplay.isHost) return;
      this.charSelect.stageIndex = this.stageSelect.resolveSelection();
      soundFX.playGong();
      if (this.isOnline) {
        this.netplay.send({
          type: "CHAR_SYNC",
          p1Index: this.charSelect.p1Index,
          stageIndex: this.charSelect.stageIndex,
          matchMode: this.onlineLobby.matchMode,
          startMatch: true
        });
      }
      this.startMatch();
    }
    setupCampaignStage(p1Id, isFreshStart = false) {
      const currentBossId = this.bossQueue[this.bossIndex];
      const stageNum = this.bossIndex + 1;
      const isCoop = this.isCoopCampaign;
      this.projectiles.forEach((p) => {
        if (p && p.destroy) p.destroy();
      });
      this.projectiles = [];
      this.spawnDefaultPickups();
      const stageThemes = ["neo_tokyo", "suzaku", "thunder_dojo", "suzaku", "neo_tokyo", "thunder_dojo", "suzaku", "dragon_shrine"];
      const stageId = stageThemes[this.bossIndex] || "suzaku";
      this.stage = new Stage(stageId);
      this.ai.setDifficulty("campaign", stageNum);
      this.ai3.setDifficulty("campaign", stageNum);
      const p1StartX = currentBossId === "bouncer_twins" ? isCoop ? 160 : 200 : isCoop ? 180 : 220;
      const p3StartX = isCoop ? p1StartX - 90 : 100;
      if (!this.f1 || isFreshStart || this.bossIndex === 0 || !this.campaignStageWon || this.f1.health <= 0) {
        this.f1 = this.createFighter(p1Id, p1StartX, true, 1, false);
      } else {
        this.f1.x = p1StartX;
        this.f1.y = 300;
        this.f1.vx = 0;
        this.f1.vy = 0;
        this.f1.isGrounded = true;
        this.f1.isDead = false;
        this.f1.changeState(FIGHTER_STATE.IDLE);
      }
      if (isCoop) {
        const p2AllyId = this.charSelect.characters[this.charSelect.p2Index]?.id || "raven";
        if (!this.f3 || isFreshStart || this.bossIndex === 0 || !this.campaignStageWon || this.f3.health <= 0) {
          this.f3 = this.createFighter(p2AllyId, p3StartX, true, 3, false);
        } else {
          this.f3.x = p3StartX;
          this.f3.y = 300;
          this.f3.vx = 0;
          this.f3.vy = 0;
          this.f3.isGrounded = true;
          this.f3.isDead = false;
          this.f3.changeState(FIGHTER_STATE.IDLE);
        }
      } else {
        this.f3 = null;
      }
      const hpScale = isCoop ? 1.25 : 1;
      if (currentBossId === "bouncer_twins") {
        this.f2 = this.createFighter("boris", 680, false, 2, true);
        this.f4 = this.createFighter("viktor", 780, false, 4, true);
        this.allFighters = isCoop ? [this.f1, this.f3, this.f2, this.f4] : [this.f1, this.f2, this.f4];
      } else {
        this.f2 = this.createFighter(currentBossId, 700, false, 2, true);
        this.f4 = null;
        if (currentBossId === "riot_cop") {
          this.f2.maxHealth = Math.round(850 * hpScale);
          this.f2.health = this.f2.maxHealth;
        } else if (currentBossId === "promoter") {
          this.f2.maxHealth = Math.round(950 * hpScale);
          this.f2.health = this.f2.maxHealth;
          this.f2.walkSpeed = 4.4;
        } else if (currentBossId === "matriarch") {
          this.f2.maxHealth = Math.round(1050 * hpScale);
          this.f2.health = this.f2.maxHealth;
        } else if (currentBossId === "street_lord") {
          this.f2.maxHealth = Math.round(1250 * hpScale);
          this.f2.health = this.f2.maxHealth;
        } else if (currentBossId === "urban_legend") {
          this.f2.maxHealth = Math.round(1100 * hpScale);
          this.f2.health = this.f2.maxHealth;
          this.f2.walkSpeed = 4.4;
        } else if (currentBossId === "champion") {
          this.f2.maxHealth = Math.round(1e3 * hpScale);
          this.f2.health = this.f2.maxHealth;
        } else if (currentBossId === "endless_dragon") {
          this.f2.maxHealth = Math.round(2500 * hpScale);
          this.f2.health = this.f2.maxHealth;
        }
        this.allFighters = isCoop ? [this.f1, this.f3, this.f2] : [this.f1, this.f2];
      }
      if (this.f1) {
        if (isFreshStart || this.bossIndex === 0 || !this.campaignStageWon || this.f1.health <= 0) {
          this.f1.health = this.f1.maxHealth;
        } else {
          this.f1.health = Math.max(500, Math.min(this.f1.maxHealth, this.f1.health));
        }
        this.f1.stamina = this.f1.maxStamina;
        this.f1.isDead = false;
        this.f1.limbs = { leadArm: 100, rearArm: 100, leadLeg: 100, rearLeg: 100, torso: 100, head: 100 };
        this.f1.statusEffects = [];
        this.f1.heldPickup = null;
        this.f1.submissionStruggle = 0;
        this.f1.isRageMode = false;
        this.f1.isInvincible = false;
        this.f1.hitStun = 0;
        this.f1.blockStun = 0;
        this.f1.projectileCooldown = 0;
        this.f1.activeProjectileCount = 0;
      }
      if (this.f3) {
        if (isFreshStart || this.bossIndex === 0 || !this.campaignStageWon || this.f3.health <= 0) {
          this.f3.health = this.f3.maxHealth;
        } else {
          this.f3.health = Math.max(500, Math.min(this.f3.maxHealth, this.f3.health));
        }
        this.f3.stamina = this.f3.maxStamina;
        this.f3.isDead = false;
        this.f3.limbs = { leadArm: 100, rearArm: 100, leadLeg: 100, rearLeg: 100, torso: 100, head: 100 };
        this.f3.statusEffects = [];
        this.f3.heldPickup = null;
        this.f3.submissionStruggle = 0;
        this.f3.isRageMode = false;
        this.f3.isInvincible = false;
        this.f3.hitStun = 0;
        this.f3.blockStun = 0;
        this.f3.projectileCooldown = 0;
        this.f3.activeProjectileCount = 0;
      }
      this.projectiles = [];
      input.consumeBuffer(1);
      input.consumeBuffer(2);
      input.consumeBuffer(3);
      this.cameraX = 0;
      this.hud.reset(1);
      this.hud.p1RedHealth = this.f1 ? this.f1.health : 1e3;
      this.hud.p2RedHealth = this.f2 ? this.f2.health : 1e3;
      const raidTag = isCoop ? " [2P RAID]" : "";
      const bossName = currentBossId === "bouncer_twins" ? isCoop ? "THE BOUNCER TWINS (2v2)" : "THE BOUNCER TWINS (2v1)" : this.f2.name;
      this.hud.setAnnouncement(`STAGE ${stageNum}: ${bossName}${raidTag}`, 120);
    }
    spawnDefaultPickups() {
      this.pickups = [
        new AlleyPickup("bottle", 270),
        new AlleyPickup("brick", 670),
        new AlleyPickup("lumber", 470)
      ];
    }
    createFighter(id, x, facingRight, playerNum, isCpu, customSkinId = null) {
      const skinId = customSkinId || (playerNum === 1 ? EconomyManager.getEquippedSkin(id) : null);
      const opts = { x, facingRight, playerNum, isCpu, skinId };
      let fighter;
      if (id === "kazuki") fighter = new Kazuki(opts);
      else if (id === "raven") fighter = new Raven(opts);
      else if (id === "kagura") fighter = new Kagura(opts);
      else if (id === "fang") fighter = new Fang(opts);
      else if (id === "zephyr") fighter = new Zephyr(opts);
      else if (id === "colossus") fighter = new Colossus(opts);
      else if (id === "mighty") fighter = new Mighty(opts);
      else if (id === "riot_cop") fighter = new RiotCop(opts);
      else if (id === "promoter") fighter = new Promoter(opts);
      else if (id === "boris") fighter = new BorisBouncer(opts);
      else if (id === "viktor") fighter = new ViktorBouncer(opts);
      else if (id === "matriarch") fighter = new Matriarch(opts);
      else if (id === "street_lord") fighter = new StreetLord(opts);
      else if (id === "urban_legend") fighter = new UrbanLegend(opts);
      else if (id === "champion") fighter = new Champion(opts);
      else if (id === "endless_dragon") fighter = new EndlessDragon(opts);
      else if (ROSTER_CLASSES[id]) fighter = new ROSTER_CLASSES[id](opts);
      else fighter = new Kazuki(opts);
      fighter.team = playerNum === 1 || playerNum === 3 ? 1 : 2;
      fighter.spawnProjectile = (proj) => {
        this.projectiles.push(proj);
      };
      return fighter;
    }
    resetRound() {
      this.round++;
      this.allFighters.forEach((f) => {
        f.health = f.maxHealth;
        f.stamina = f.maxStamina;
        f.limbs = { leadArm: 100, rearArm: 100, leadLeg: 100, rearLeg: 100, torso: 100, head: 100 };
        f.statusEffects = [];
        f.heldPickup = null;
        f.vx = 0;
        f.vy = 0;
        f.y = 300;
        f.isGrounded = true;
        f.isDead = false;
        f.projectileCooldown = 0;
        f.activeProjectileCount = 0;
        f.changeState(FIGHTER_STATE.IDLE);
      });
      this.projectiles = [];
      input.consumeBuffer(1);
      input.consumeBuffer(2);
      if (this.is2v2) {
        this.f1.x = 180;
        this.f3.x = 100;
        this.f2.x = 720;
        this.f4.x = 810;
      } else if (this.isCoopCampaign) {
        this.f1.x = 180;
        if (this.f3) this.f3.x = 90;
        this.f2.x = 700;
        if (this.f4) this.f4.x = 790;
      } else if (this.isCampaign && this.bossQueue[this.bossIndex] === "bouncer_twins") {
        this.f1.x = 200;
        this.f2.x = 680;
        if (this.f4) this.f4.x = 780;
      } else {
        this.f1.x = 220;
        this.f2.x = 700;
      }
      this.projectiles = [];
      this.spawnDefaultPickups();
      this.hud.reset(this.round);
      this.slowMotion = false;
      this.screen = GAME_SCREENS.FIGHT;
      soundFX.playAnnouncer(this.round === 2 ? "ROUND2" : "FINALROUND");
    }
    getNearestOpponent(fighter) {
      let nearest = null;
      let minDist = Infinity;
      for (const other of this.allFighters) {
        if (other !== fighter && other.team !== fighter.team && !other.isDead) {
          const d = Math.abs(fighter.x - other.x);
          if (d < minDist) {
            minDist = d;
            nearest = other;
          }
        }
      }
      return nearest || (fighter.team === 1 ? this.f2 : this.f1);
    }
    update() {
      input.pollGamepads();
      if (this.settingsManager.isOpen) {
        if (typeof this.settingsManager.updateGamepad === "function") {
          this.settingsManager.updateGamepad();
        }
        input.endFrame();
        return;
      }
      const gp1 = input.getGamepadState(0);
      const gp2 = input.getGamepadState(1);
      if (gp1 && gp1.startJust || gp2 && gp2.startJust) {
        this.settingsManager.toggle();
        input.endFrame();
        return;
      }
      const menuNav = input.getAnyMenuNav();
      if (this.screen === GAME_SCREENS.TITLE) {
        if (menuNav && (menuNav.confirm || menuNav.start)) {
          this.handleConfirmPress();
        }
        input.endFrame();
        return;
      }
      if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
        const up = input.isJustPressed("KeyW") || input.isJustPressed("ArrowUp") || menuNav && menuNav.up;
        const down = input.isJustPressed("KeyS") || input.isJustPressed("ArrowDown") || menuNav && menuNav.down;
        if (up) {
          input.consumeKey("KeyW");
          input.consumeKey("ArrowUp");
          this.onlineLobby.handleInput({ up: true });
        } else if (down) {
          input.consumeKey("KeyS");
          input.consumeKey("ArrowDown");
          this.onlineLobby.handleInput({ down: true });
        }
        if (menuNav && menuNav.confirm) {
          this.handleConfirmPress();
        } else if (menuNav && menuNav.back) {
          this.handleBackPress();
        }
        input.endFrame();
        return;
      }
      if (this.screen === GAME_SCREENS.MODE_SELECT) {
        const up = input.isJustPressed("KeyW") || input.isJustPressed("ArrowUp") || menuNav && menuNav.up;
        const down = input.isJustPressed("KeyS") || input.isJustPressed("ArrowDown") || menuNav && menuNav.down;
        const left = input.isJustPressed("KeyA") || input.isJustPressed("ArrowLeft") || menuNav && menuNav.left;
        const right = input.isJustPressed("KeyD") || input.isJustPressed("ArrowRight") || menuNav && menuNav.right;
        if (up) {
          input.consumeKey("KeyW");
          input.consumeKey("ArrowUp");
          this.modeSelect.handleInput({ up: true });
        } else if (down) {
          input.consumeKey("KeyS");
          input.consumeKey("ArrowDown");
          this.modeSelect.handleInput({ down: true });
        }
        if (left) {
          input.consumeKey("KeyA");
          input.consumeKey("ArrowLeft");
          this.modeSelect.handleInput({ left: true });
        } else if (right) {
          input.consumeKey("KeyD");
          input.consumeKey("ArrowRight");
          this.modeSelect.handleInput({ right: true });
        }
        if (menuNav && menuNav.confirm) {
          this.handleConfirmPress();
        } else if (menuNav && menuNav.back) {
          this.handleBackPress();
        }
        input.endFrame();
        return;
      }
      if (this.screen === GAME_SCREENS.SHOP) {
        const up = input.isJustPressed("KeyW") || input.isJustPressed("ArrowUp") || menuNav && menuNav.up;
        const down = input.isJustPressed("KeyS") || input.isJustPressed("ArrowDown") || menuNav && menuNav.down;
        const left = input.isJustPressed("KeyA") || input.isJustPressed("ArrowLeft") || menuNav && menuNav.left;
        const right = input.isJustPressed("KeyD") || input.isJustPressed("ArrowRight") || menuNav && menuNav.right;
        if (up) {
          input.consumeKey("KeyW");
          input.consumeKey("ArrowUp");
          this.shopScreen.handleInput({ up: true });
        } else if (down) {
          input.consumeKey("KeyS");
          input.consumeKey("ArrowDown");
          this.shopScreen.handleInput({ down: true });
        }
        if (left) {
          input.consumeKey("KeyA");
          input.consumeKey("ArrowLeft");
          this.shopScreen.handleInput({ left: true });
        } else if (right) {
          input.consumeKey("KeyD");
          input.consumeKey("ArrowRight");
          this.shopScreen.handleInput({ right: true });
        }
        if (menuNav && menuNav.confirm) {
          this.handleConfirmPress();
        } else if (menuNav && menuNav.back) {
          this.handleBackPress();
        }
        input.endFrame();
        return;
      }
      if (this.screen === GAME_SCREENS.SITE_OF_GRACE) {
        const up = input.isJustPressed("KeyW") || input.isJustPressed("ArrowUp") || menuNav && menuNav.up;
        const down = input.isJustPressed("KeyS") || input.isJustPressed("ArrowDown") || menuNav && menuNav.down;
        if (up) {
          input.consumeKey("KeyW");
          input.consumeKey("ArrowUp");
          this.elden.handleGraceInput({ up: true });
        } else if (down) {
          input.consumeKey("KeyS");
          input.consumeKey("ArrowDown");
          this.elden.handleGraceInput({ down: true });
        }
        if (input.isJustPressed("Space") || input.isJustPressed("Enter") || menuNav && menuNav.confirm) {
          const res = this.elden.executeGraceSelection();
          if (res && res.action === "proceed") {
            this.startNextCampaignStage();
          }
        }
        input.endFrame();
        return;
      }
      if (this.screen === GAME_SCREENS.CHAR_SELECT) {
        const isHostOrLocal = !this.isOnline || this.netplay.isHost;
        const p1Nav = input.getMenuNav(0) || menuNav;
        const p2Nav = input.getMenuNav(1);
        const p1Left = input.isJustPressed("KeyA") || input.isJustPressed("ArrowLeft") || p1Nav && p1Nav.left;
        const p1Right = input.isJustPressed("KeyD") || input.isJustPressed("ArrowRight") || p1Nav && p1Nav.right;
        const p1Up = input.isJustPressed("KeyW") || input.isJustPressed("ArrowUp") || p1Nav && p1Nav.up;
        const p1Down = input.isJustPressed("KeyS") || input.isJustPressed("ArrowDown") || p1Nav && p1Nav.down;
        if (p1Left) {
          input.consumeKey("KeyA");
          input.consumeKey("ArrowLeft");
          this.charSelect.handleInput({ left: true }, isHostOrLocal);
          if (this.isOnline) this.syncCharSelect();
        } else if (p1Right) {
          input.consumeKey("KeyD");
          input.consumeKey("ArrowRight");
          this.charSelect.handleInput({ right: true }, isHostOrLocal);
          if (this.isOnline) this.syncCharSelect();
        }
        if (p1Up) {
          input.consumeKey("KeyW");
          input.consumeKey("ArrowUp");
          if (isHostOrLocal) {
            this.charSelect.handleInput({ up: true }, true);
            if (this.isOnline) this.syncCharSelect();
          }
        } else if (p1Down) {
          input.consumeKey("KeyS");
          input.consumeKey("ArrowDown");
          if (isHostOrLocal) {
            this.charSelect.handleInput({ down: true }, true);
            if (this.isOnline) this.syncCharSelect();
          }
        }
        if (this.charSelect.gameMode === "2p") {
          const p2Left = input.isJustPressed("Numpad4") || p2Nav && p2Nav.left;
          const p2Right = input.isJustPressed("Numpad6") || p2Nav && p2Nav.right;
          if (input.isJustPressed("Numpad8") || input.isJustPressed("Numpad5")) {
            const up8 = input.isJustPressed("Numpad8");
            input.consumeKey("Numpad8");
            input.consumeKey("Numpad5");
            this.charSelect.handleInput(up8 ? { up: true } : { down: true }, false);
          }
          if (p2Left) {
            input.consumeKey("Numpad4");
            this.charSelect.handleInput({ left: true }, false);
          } else if (p2Right) {
            input.consumeKey("Numpad6");
            this.charSelect.handleInput({ right: true }, false);
          }
        }
        if (p1Nav && p1Nav.extra) {
          if (!this.charSelect.showCodeModal) {
            this.charSelect.openCodeModal();
          }
        }
        if (p1Nav && p1Nav.confirm) {
          this.handleConfirmPress();
        } else if (p1Nav && p1Nav.back) {
          this.handleBackPress();
        }
        input.endFrame();
        return;
      }
      if (this.screen === GAME_SCREENS.STAGE_SELECT) {
        const nav = menuNav || {};
        const left = input.isJustPressed("KeyA") || input.isJustPressed("ArrowLeft") || input.isJustPressed("Numpad4") || nav.left;
        const right = input.isJustPressed("KeyD") || input.isJustPressed("ArrowRight") || input.isJustPressed("Numpad6") || nav.right;
        const up = input.isJustPressed("KeyW") || input.isJustPressed("ArrowUp") || nav.up;
        const down = input.isJustPressed("KeyS") || input.isJustPressed("ArrowDown") || nav.down;
        if (left || right || up || down) {
          ["KeyA", "ArrowLeft", "Numpad4", "KeyD", "ArrowRight", "Numpad6", "KeyW", "ArrowUp", "KeyS", "ArrowDown"].forEach((k) => input.consumeKey(k));
          if (!this.isOnline || this.netplay.isHost) {
            this.stageSelect.handleInput({ left, right, up, down });
            soundFX.playWhoosh("light");
            if (this.isOnline) this.netplay.send({ type: "STAGE_NAV", index: this.stageSelect.index });
          }
        }
        if (nav.confirm) this.handleConfirmPress();
        else if (nav.back) this.handleBackPress();
        this.stageSelect.update();
        input.endFrame();
        return;
      }
      if (this.screen === GAME_SCREENS.VERSUS) {
        if (menuNav && menuNav.confirm) this.versus.skip();
        if (this.stage) this.stage.update();
        if (this.versus.update()) this.finishVersus();
        input.endFrame();
        return;
      }
      if (this.screen === GAME_SCREENS.VICTORY) {
        this.updateVictoryScreen();
        input.endFrame();
        return;
      }
      this.gameSpeedTick++;
      const speed = this.settingsManager.settings.gameSpeed;
      if (speed === 50 && this.gameSpeedTick % 2 !== 0) return;
      if (speed === 75 && this.gameSpeedTick % 4 === 0) return;
      if (this.isTraining) {
        if (this.f1) {
          this.f1.health = this.f1.maxHealth;
          this.f1.stamina = this.f1.maxStamina;
          this.f1.superMeter = this.f1.maxSuperMeter;
        }
        if (this.f2) {
          this.f2.health = this.f2.maxHealth;
          this.f2.stamina = this.f2.maxStamina;
        }
      }
      if (!this.isOnline) {
        const cheats = getAdminCheats();
        if (cheats.godMode && this.f1) {
          this.f1.health = this.f1.maxHealth;
          this.f1.stamina = this.f1.maxStamina;
        }
        if (cheats.infiniteSuper && this.f1) {
          this.f1.superMeter = this.f1.maxSuperMeter;
        }
        if (cheats.oneHitKO && this.f1 && this.f1.hasHitThisAttack) {
          if (this.f2) {
            this.f2.health = 0;
            this.f2.isDead = true;
          }
          if (this.f4) {
            this.f4.health = 0;
            this.f4.isDead = true;
          }
        }
      }
      if (this.slowMotion) {
        this.slowMotionCounter++;
        if (this.slowMotionCounter % 3 !== 0) return;
      }
      input.update(this.f1.facingRight, this.f2 ? this.f2.facingRight : false);
      if (this.finish && this.finish.active) {
      } else if (this.isOnline) {
        this.updateOnlineMatch();
      } else {
        const p1Input = input.getState(1, this.f1.facingRight);
        const targetForP1 = this.getNearestOpponent(this.f1);
        this.f1.handleInput(p1Input, input, targetForP1);
        if (this.f1.state === FIGHTER_STATE.SUBMISSION_LOCK) {
          if (p1Input.lpJust || p1Input.hpJust || p1Input.lkJust || p1Input.hkJust || p1Input.dirtyJust) {
            this.f1.submissionStruggle = Math.min(100, (this.f1.submissionStruggle || 0) + 14);
            soundFX.playWhoosh("light");
          }
        }
        if (this.f2 && !this.f2.isDead) {
          let p2Input;
          const targetForF2 = this.getNearestOpponent(this.f2);
          if (this.f2.isCpu) {
            p2Input = this.ai.update(this.f2, targetForF2);
            if (this.f2.state === FIGHTER_STATE.SUBMISSION_LOCK) {
              this.f2.submissionStruggle = Math.min(100, (this.f2.submissionStruggle || 0) + 1.2);
            }
          } else {
            p2Input = input.getState(2, this.f2.facingRight);
            if (this.f2.state === FIGHTER_STATE.SUBMISSION_LOCK) {
              if (p2Input.lpJust || p2Input.hpJust || p2Input.lkJust || p2Input.hkJust || p2Input.dirtyJust) {
                this.f2.submissionStruggle = Math.min(100, (this.f2.submissionStruggle || 0) + 14);
                soundFX.playWhoosh("light");
              }
            }
          }
          this.f2.handleInput(p2Input, input, targetForF2);
        }
        if (this.f3 && !this.f3.isDead) {
          const targetForF3 = this.getNearestOpponent(this.f3);
          const f3Input = this.ai2.update(this.f3, targetForF3);
          this.f3.handleInput(f3Input, input, targetForF3);
        }
        if (this.f4 && !this.f4.isDead) {
          const targetForF4 = this.getNearestOpponent(this.f4);
          const f4Input = this.ai3.update(this.f4, targetForF4);
          this.f4.handleInput(f4Input, input, targetForF4);
        }
      }
      this.checkPickups();
      this.allFighters.forEach((f) => {
        if (!f.isDead || f.state === FIGHTER_STATE.KNOCKDOWN) {
          const opp = this.getNearestOpponent(f);
          f.update(opp, STAGE_WIDTH);
          this.checkCornerCrowdRebound(f);
        }
      });
      if (this.isCampaign && this.bossQueue[this.bossIndex] === "bouncer_twins") {
        if (this.f2 && this.f2.isDead && this.f4 && !this.f4.isDead && !this.f4.isBloodRage) {
          this.f4.isBloodRage = true;
          this.f4.walkSpeed = 5.2;
          this.f4.dashSpeed = 10.5;
          soundFX.playRageIgnite();
          this.hud.showDirtyBanner("VIKTOR ENTERED BLOOD RAGE!");
        } else if (this.f4 && this.f4.isDead && this.f2 && !this.f2.isDead && !this.f2.isBloodRage) {
          this.f2.isBloodRage = true;
          this.f2.walkSpeed = 3.6;
          this.f2.dashSpeed = 7.2;
          soundFX.playRageIgnite();
          this.hud.showDirtyBanner("BORIS ENTERED BLOOD RAGE!");
        }
      }
      for (let i = 0; i < this.allFighters.length; i++) {
        for (let j = i + 1; j < this.allFighters.length; j++) {
          const fa = this.allFighters[i];
          const fb = this.allFighters[j];
          if (!fa.isDead && !fb.isDead) {
            HitboxSystem.resolvePushboxes(fa, fb, 40, STAGE_WIDTH);
          }
        }
      }
      this.checkAttacks();
      this.updateProjectiles();
      this.updatePickups();
      this.updateCamera();
      this.stage.update();
      const primaryEnemy = this.f2 && !this.f2.isDead ? this.f2 : this.f4 || this.f2;
      this.hud.update(this.f1, primaryEnemy);
      this.checkMatchEnd();
      input.endFrame();
    }
    syncCharSelect() {
      if (!this.isOnline || !this.netplay.isConnected) return;
      if (this.netplay.isHost) {
        this.netplay.send({
          type: "CHAR_SYNC",
          p1Index: this.charSelect.p1Index,
          stageIndex: this.charSelect.stageIndex,
          matchMode: this.onlineLobby.matchMode
        });
      } else {
        this.netplay.send({
          type: "CHAR_SYNC",
          p2Index: this.charSelect.p2Index
        });
      }
    }
    updateOnlineMatch() {
      const isHost = this.netplay.isHost;
      if (this.isCoopCampaign) {
        const targetForP12 = this.getNearestOpponent(this.f1);
        const targetForF3 = this.f3 ? this.getNearestOpponent(this.f3) : targetForP12;
        if (isHost) {
          const localInput = input.getState(1, this.f1.facingRight);
          this.netplay.sendInput(localInput);
          this.f1.handleInput(localInput, input, targetForP12);
          if (this.f1.state === FIGHTER_STATE.SUBMISSION_LOCK) {
            if (localInput.lpJust || localInput.hpJust || localInput.lkJust || localInput.hkJust || localInput.dirtyJust) {
              this.f1.submissionStruggle = Math.min(100, (this.f1.submissionStruggle || 0) + 14);
              soundFX.playWhoosh("light");
            }
          }
          if (this.f3 && !this.f3.isDead) {
            const remoteInput = this.netplay.remoteInputState || {};
            if (remoteInput.ultimateJust) input.queueAction(3, "ULTIMATE");
            else if (remoteInput.dirtyJust) input.queueAction(3, "DIRTY");
            else if (remoteInput.sp3Just) input.queueAction(3, "SP3");
            else if (remoteInput.sp2Just) input.queueAction(3, "SP2");
            else if (remoteInput.sp1Just) input.queueAction(3, "SP1");
            else if (remoteInput.hpJust) input.queueAction(3, "HP");
            else if (remoteInput.hkJust) input.queueAction(3, "HK");
            else if (remoteInput.lpJust) input.queueAction(3, "LP");
            else if (remoteInput.lkJust) input.queueAction(3, "LK");
            this.f3.handleInput(remoteInput, input, targetForF3);
            remoteInput.lpJust = false;
            remoteInput.hpJust = false;
            remoteInput.lkJust = false;
            remoteInput.hkJust = false;
            remoteInput.sp1Just = false;
            remoteInput.sp2Just = false;
            remoteInput.sp3Just = false;
            remoteInput.dirtyJust = false;
            remoteInput.ultimateJust = false;
            if (this.f3.state === FIGHTER_STATE.SUBMISSION_LOCK) {
              if (remoteInput.lpJust || remoteInput.hpJust || remoteInput.lkJust || remoteInput.hkJust || remoteInput.dirtyJust) {
                this.f3.submissionStruggle = Math.min(100, (this.f3.submissionStruggle || 0) + 14);
                soundFX.playWhoosh("light");
              }
            }
          }
          if (this.f2 && !this.f2.isDead && this.f2.isCpu) {
            const targetForF22 = this.getNearestOpponent(this.f2);
            const f2Input = this.ai.update(this.f2, targetForF22);
            this.f2.handleInput(f2Input, input, targetForF22);
          }
          if (this.f4 && !this.f4.isDead && this.f4.isCpu) {
            const targetForF4 = this.getNearestOpponent(this.f4);
            const f4Input = this.ai3.update(this.f4, targetForF4);
            this.f4.handleInput(f4Input, input, targetForF4);
          }
          this.onlineSyncTick++;
          if (this.onlineSyncTick % 4 === 0) {
            this.netplay.sendSnapshot({
              isCoop: true,
              bossIndex: this.bossIndex,
              f1: {
                x: Math.round(this.f1.x),
                y: Math.round(this.f1.y),
                vx: this.f1.vx,
                vy: this.f1.vy,
                health: this.f1.health,
                stamina: this.f1.stamina,
                superMeter: this.f1.superMeter,
                state: this.f1.state,
                facingRight: this.f1.facingRight,
                isDead: this.f1.isDead
              },
              f3: this.f3 ? {
                x: Math.round(this.f3.x),
                y: Math.round(this.f3.y),
                vx: this.f3.vx,
                vy: this.f3.vy,
                health: this.f3.health,
                stamina: this.f3.stamina,
                superMeter: this.f3.superMeter,
                state: this.f3.state,
                facingRight: this.f3.facingRight,
                isDead: this.f3.isDead
              } : null,
              f2: this.f2 ? {
                x: Math.round(this.f2.x),
                y: Math.round(this.f2.y),
                vx: this.f2.vx,
                vy: this.f2.vy,
                health: this.f2.health,
                stamina: this.f2.stamina,
                superMeter: this.f2.superMeter,
                state: this.f2.state,
                facingRight: this.f2.facingRight,
                isDead: this.f2.isDead,
                phase: this.f2.phase,
                isFlying: this.f2.isFlying
              } : null,
              f4: this.f4 ? {
                x: Math.round(this.f4.x),
                y: Math.round(this.f4.y),
                vx: this.f4.vx,
                vy: this.f4.vy,
                health: this.f4.health,
                stamina: this.f4.stamina,
                superMeter: this.f4.superMeter,
                state: this.f4.state,
                facingRight: this.f4.facingRight,
                isDead: this.f4.isDead
              } : null,
              round: this.round,
              timer: this.hud.timer
            });
          }
        } else {
          if (this.f3 && !this.f3.isDead) {
            const localInput = input.getState(1, this.f3.facingRight);
            if (localInput.ultimateJust) input.queueAction(3, "ULTIMATE");
            else if (localInput.dirtyJust) input.queueAction(3, "DIRTY");
            else if (localInput.sp3Just) input.queueAction(3, "SP3");
            else if (localInput.sp2Just) input.queueAction(3, "SP2");
            else if (localInput.sp1Just) input.queueAction(3, "SP1");
            else if (localInput.hpJust) input.queueAction(3, "HP");
            else if (localInput.hkJust) input.queueAction(3, "HK");
            else if (localInput.lpJust) input.queueAction(3, "LP");
            else if (localInput.lkJust) input.queueAction(3, "LK");
            this.netplay.sendInput(localInput);
            this.f3.handleInput(localInput, input, targetForF3);
            if (this.f3.state === FIGHTER_STATE.SUBMISSION_LOCK) {
              if (localInput.lpJust || localInput.hpJust || localInput.lkJust || localInput.hkJust || localInput.dirtyJust) {
                this.f3.submissionStruggle = Math.min(100, (this.f3.submissionStruggle || 0) + 14);
                soundFX.playWhoosh("light");
              }
            }
          }
          const remoteInput = this.netplay.remoteInputState || {};
          if (this.f1 && !this.f1.isDead) {
            if (remoteInput.ultimateJust) input.queueAction(1, "ULTIMATE");
            else if (remoteInput.dirtyJust) input.queueAction(1, "DIRTY");
            else if (remoteInput.sp3Just) input.queueAction(1, "SP3");
            else if (remoteInput.sp2Just) input.queueAction(1, "SP2");
            else if (remoteInput.sp1Just) input.queueAction(1, "SP1");
            else if (remoteInput.hpJust) input.queueAction(1, "HP");
            else if (remoteInput.hkJust) input.queueAction(1, "HK");
            else if (remoteInput.lpJust) input.queueAction(1, "LP");
            else if (remoteInput.lkJust) input.queueAction(1, "LK");
            this.f1.handleInput(remoteInput, input, targetForP12);
            remoteInput.lpJust = false;
            remoteInput.hpJust = false;
            remoteInput.lkJust = false;
            remoteInput.hkJust = false;
            remoteInput.sp1Just = false;
            remoteInput.sp2Just = false;
            remoteInput.sp3Just = false;
            remoteInput.dirtyJust = false;
            remoteInput.ultimateJust = false;
          }
          if (this.netplay.latestSnapshot) {
            const snap = this.netplay.latestSnapshot;
            if (snap.bossIndex !== void 0 && snap.bossIndex !== this.bossIndex) {
              this.bossIndex = snap.bossIndex;
              this.setupCampaignStage(this.f1 ? this.f1.id : "kazuki", false);
            }
            if (snap.f1 && this.f1) {
              this.f1.health = snap.f1.health;
              this.f1.stamina = snap.f1.stamina;
              this.f1.superMeter = snap.f1.superMeter;
              this.f1.isDead = snap.f1.isDead;
              if (Math.abs(this.f1.x - snap.f1.x) > 40) this.f1.x = snap.f1.x;
              else this.f1.x += (snap.f1.x - this.f1.x) * 0.25;
              if (Math.abs(this.f1.y - snap.f1.y) > 40) this.f1.y = snap.f1.y;
              else this.f1.y += (snap.f1.y - this.f1.y) * 0.25;
            }
            if (snap.f3 && this.f3) {
              this.f3.health = snap.f3.health;
              this.f3.stamina = snap.f3.stamina;
              this.f3.superMeter = snap.f3.superMeter;
              this.f3.isDead = snap.f3.isDead;
              if (Math.abs(this.f3.x - snap.f3.x) > 50) this.f3.x = snap.f3.x;
              else this.f3.x += (snap.f3.x - this.f3.x) * 0.2;
              if (Math.abs(this.f3.y - snap.f3.y) > 50) this.f3.y = snap.f3.y;
              else this.f3.y += (snap.f3.y - this.f3.y) * 0.2;
            }
            if (snap.f2 && this.f2) {
              this.f2.health = snap.f2.health;
              this.f2.stamina = snap.f2.stamina;
              this.f2.superMeter = snap.f2.superMeter;
              this.f2.isDead = snap.f2.isDead;
              if (snap.f2.phase !== void 0) this.f2.phase = snap.f2.phase;
              if (snap.f2.isFlying !== void 0) this.f2.isFlying = snap.f2.isFlying;
              if (Math.abs(this.f2.x - snap.f2.x) > 50) this.f2.x = snap.f2.x;
              else this.f2.x += (snap.f2.x - this.f2.x) * 0.2;
              if (Math.abs(this.f2.y - snap.f2.y) > 50) this.f2.y = snap.f2.y;
              else this.f2.y += (snap.f2.y - this.f2.y) * 0.2;
            }
            if (snap.f4 && this.f4) {
              this.f4.health = snap.f4.health;
              this.f4.stamina = snap.f4.stamina;
              this.f4.isDead = snap.f4.isDead;
              if (Math.abs(this.f4.x - snap.f4.x) > 50) this.f4.x = snap.f4.x;
              else this.f4.x += (snap.f4.x - this.f4.x) * 0.2;
              if (Math.abs(this.f4.y - snap.f4.y) > 50) this.f4.y = snap.f4.y;
              else this.f4.y += (snap.f4.y - this.f4.y) * 0.2;
            }
            if (snap.timer !== void 0 && this.hud) {
              this.hud.timer = snap.timer;
            }
          }
        }
        return;
      }
      const targetForP1 = this.getNearestOpponent(this.f1);
      const targetForF2 = this.f2 ? this.getNearestOpponent(this.f2) : this.f1;
      if (isHost) {
        const localInput = input.getState(1, this.f1.facingRight);
        this.netplay.sendInput(localInput);
        this.f1.handleInput(localInput, input, targetForP1);
        if (this.f1.state === FIGHTER_STATE.SUBMISSION_LOCK) {
          if (localInput.lpJust || localInput.hpJust || localInput.lkJust || localInput.hkJust || localInput.dirtyJust) {
            this.f1.submissionStruggle = Math.min(100, (this.f1.submissionStruggle || 0) + 14);
            soundFX.playWhoosh("light");
          }
        }
        if (this.f2 && !this.f2.isDead) {
          const remoteInput = this.netplay.remoteInputState || {};
          if (remoteInput.ultimateJust) input.queueAction(2, "ULTIMATE");
          else if (remoteInput.dirtyJust) input.queueAction(2, "DIRTY");
          else if (remoteInput.sp3Just) input.queueAction(2, "SP3");
          else if (remoteInput.sp2Just) input.queueAction(2, "SP2");
          else if (remoteInput.sp1Just) input.queueAction(2, "SP1");
          else if (remoteInput.hpJust) input.queueAction(2, "HP");
          else if (remoteInput.hkJust) input.queueAction(2, "HK");
          else if (remoteInput.lpJust) input.queueAction(2, "LP");
          else if (remoteInput.lkJust) input.queueAction(2, "LK");
          this.f2.handleInput(remoteInput, input, targetForF2);
          remoteInput.lpJust = false;
          remoteInput.hpJust = false;
          remoteInput.lkJust = false;
          remoteInput.hkJust = false;
          remoteInput.sp1Just = false;
          remoteInput.sp2Just = false;
          remoteInput.sp3Just = false;
          remoteInput.dirtyJust = false;
          remoteInput.ultimateJust = false;
          if (this.f2.state === FIGHTER_STATE.SUBMISSION_LOCK) {
            if (remoteInput.lpJust || remoteInput.hpJust || remoteInput.lkJust || remoteInput.hkJust || remoteInput.dirtyJust) {
              this.f2.submissionStruggle = Math.min(100, (this.f2.submissionStruggle || 0) + 14);
              soundFX.playWhoosh("light");
            }
          }
        }
        this.onlineSyncTick++;
        if (this.onlineSyncTick % 4 === 0 && this.f2) {
          this.netplay.sendSnapshot({
            f1: {
              x: Math.round(this.f1.x),
              y: Math.round(this.f1.y),
              vx: this.f1.vx,
              vy: this.f1.vy,
              health: this.f1.health,
              stamina: this.f1.stamina,
              superMeter: this.f1.superMeter,
              state: this.f1.state,
              facingRight: this.f1.facingRight,
              roundsWon: this.f1.roundsWon
            },
            f2: {
              x: Math.round(this.f2.x),
              y: Math.round(this.f2.y),
              vx: this.f2.vx,
              vy: this.f2.vy,
              health: this.f2.health,
              stamina: this.f2.stamina,
              superMeter: this.f2.superMeter,
              state: this.f2.state,
              facingRight: this.f2.facingRight,
              roundsWon: this.f2.roundsWon
            },
            round: this.round,
            timer: this.hud.timer
          });
        }
      } else {
        if (this.f2 && !this.f2.isDead) {
          const localInput = input.getState(1, this.f2.facingRight);
          if (localInput.ultimateJust) input.queueAction(2, "ULTIMATE");
          else if (localInput.dirtyJust) input.queueAction(2, "DIRTY");
          else if (localInput.sp3Just) input.queueAction(2, "SP3");
          else if (localInput.sp2Just) input.queueAction(2, "SP2");
          else if (localInput.sp1Just) input.queueAction(2, "SP1");
          else if (localInput.hpJust) input.queueAction(2, "HP");
          else if (localInput.hkJust) input.queueAction(2, "HK");
          else if (localInput.lpJust) input.queueAction(2, "LP");
          else if (localInput.lkJust) input.queueAction(2, "LK");
          this.netplay.sendInput(localInput);
          this.f2.handleInput(localInput, input, targetForF2);
          if (this.f2.state === FIGHTER_STATE.SUBMISSION_LOCK) {
            if (localInput.lpJust || localInput.hpJust || localInput.lkJust || localInput.hkJust || localInput.dirtyJust) {
              this.f2.submissionStruggle = Math.min(100, (this.f2.submissionStruggle || 0) + 14);
              soundFX.playWhoosh("light");
            }
          }
        }
        const remoteInput = this.netplay.remoteInputState || {};
        if (remoteInput.ultimateJust) input.queueAction(1, "ULTIMATE");
        else if (remoteInput.dirtyJust) input.queueAction(1, "DIRTY");
        else if (remoteInput.sp3Just) input.queueAction(1, "SP3");
        else if (remoteInput.sp2Just) input.queueAction(1, "SP2");
        else if (remoteInput.sp1Just) input.queueAction(1, "SP1");
        else if (remoteInput.hpJust) input.queueAction(1, "HP");
        else if (remoteInput.hkJust) input.queueAction(1, "HK");
        else if (remoteInput.lpJust) input.queueAction(1, "LP");
        else if (remoteInput.lkJust) input.queueAction(1, "LK");
        this.f1.handleInput(remoteInput, input, targetForP1);
        remoteInput.lpJust = false;
        remoteInput.hpJust = false;
        remoteInput.lkJust = false;
        remoteInput.hkJust = false;
        remoteInput.sp1Just = false;
        remoteInput.sp2Just = false;
        remoteInput.sp3Just = false;
        remoteInput.dirtyJust = false;
        remoteInput.ultimateJust = false;
        if (this.netplay.latestSnapshot) {
          const snap = this.netplay.latestSnapshot;
          if (snap.f1 && this.f1) {
            this.f1.health = snap.f1.health;
            this.f1.stamina = snap.f1.stamina;
            this.f1.superMeter = snap.f1.superMeter;
            this.f1.roundsWon = snap.f1.roundsWon;
            if (Math.abs(this.f1.x - snap.f1.x) > 40) this.f1.x = snap.f1.x;
            else this.f1.x += (snap.f1.x - this.f1.x) * 0.25;
            if (Math.abs(this.f1.y - snap.f1.y) > 40) this.f1.y = snap.f1.y;
            else this.f1.y += (snap.f1.y - this.f1.y) * 0.25;
          }
          if (snap.f2 && this.f2) {
            this.f2.health = snap.f2.health;
            this.f2.stamina = snap.f2.stamina;
            this.f2.superMeter = snap.f2.superMeter;
            this.f2.roundsWon = snap.f2.roundsWon;
            if (Math.abs(this.f2.x - snap.f2.x) > 50) this.f2.x = snap.f2.x;
            else this.f2.x += (snap.f2.x - this.f2.x) * 0.2;
            if (Math.abs(this.f2.y - snap.f2.y) > 50) this.f2.y = snap.f2.y;
            else this.f2.y += (snap.f2.y - this.f2.y) * 0.2;
          }
          if (snap.timer !== void 0 && this.hud) {
            this.hud.timer = snap.timer;
          }
        }
      }
    }
    checkPickups() {
      this.allFighters.forEach((f) => {
        if (f.isDead || f.heldPickup) return;
        for (const p of this.pickups) {
          if (p.active && !p.isAirborne && Math.abs(f.x - p.x) < 45) {
            let wantsPickup = false;
            if (this.isOnline) {
              let isLocal = false;
              if (this.isCoopCampaign) {
                isLocal = this.netplay.isHost && f.playerNum === 1 || !this.netplay.isHost && f.playerNum === 3;
              } else {
                isLocal = this.netplay.isHost && f.playerNum === 1 || !this.netplay.isHost && f.playerNum === 2;
              }
              if (isLocal) {
                const fInput = input.getState(f.playerNum, f.facingRight);
                wantsPickup = input.isDown("KeyS") && input.isJustPressed("KeyC") || fInput.down && fInput.dirtyJust;
              } else {
                const remote = this.netplay.remoteInputState || {};
                wantsPickup = !!(remote.rawDown && remote.dirtyJust);
              }
            } else {
              const isP1 = f.playerNum === 1;
              const fInput = input.getState(f.playerNum, f.facingRight);
              wantsPickup = isP1 ? input.isDown("KeyS") && input.isJustPressed("KeyC") || fInput.down && fInput.dirtyJust : f.isCpu ? Math.random() < 0.04 : input.isDown("Numpad2") && input.isJustPressed("Numpad3") || fInput.down && fInput.dirtyJust;
            }
            if (wantsPickup) {
              f.heldPickup = p.type;
              p.active = false;
              soundFX.playWhoosh("light");
              this.hud.showDirtyBanner(`${f.name} ARMED: ${p.type.toUpperCase()}!`);
              break;
            }
          }
        }
      });
    }
    updatePickups() {
      for (const p of this.pickups) {
        if (!p.active) continue;
        p.update();
        if (p.isAirborne) {
          const pHit = p.getHitbox();
          for (const target of this.allFighters) {
            if (target !== p.owner && target.team !== p.owner?.team && !target.isDead) {
              for (const hurt of target.getGlobalHurtboxes()) {
                if (HitboxSystem.testOverlap(pHit, hurt)) {
                  p.active = false;
                  const attackData = {
                    damage: p.damage,
                    hitStun: 26,
                    blockStun: 14,
                    pushback: 6,
                    height: ATTACK_HEIGHT.MID,
                    hitType: HIT_TYPE.KNOCKDOWN,
                    chipDamage: 10
                  };
                  if (p.type === "bottle") {
                    attackData.hitType = HIT_TYPE.BLEED_SLASH;
                    target.applyStatusEffect(STATUS_EFFECT.BLEED, 180);
                    target.damageLimb(LIMB_ZONE.HEAD, 20);
                  } else if (p.type === "brick") {
                    target.damageLimb(LIMB_ZONE.HEAD, 35);
                  } else if (p.type === "lumber") {
                    target.damageLimb(LIMB_ZONE.TORSO, 30);
                  }
                  const hitType = target.takeHit(attackData, p.vx > 0 ? 1 : -1);
                  this.hud.addHitSpark(p.x, p.y, hitType === "blocked" ? "block" : "hit");
                  this.hud.triggerShake(7);
                  break;
                }
              }
            }
          }
        }
      }
    }
    checkCornerCrowdRebound(fighter) {
      if (fighter.isDead) return;
      const isLeftWall = fighter.x <= 55;
      const isRightWall = fighter.x >= 885;
      const inHitState = fighter.state === FIGHTER_STATE.KNOCKDOWN || fighter.state === FIGHTER_STATE.HIT || fighter.state === FIGHTER_STATE.HIT_AIR || fighter.state === FIGHTER_STATE.HIT_CROUCH;
      if ((isLeftWall || isRightWall) && inHitState && fighter.state !== FIGHTER_STATE.WALL_REBOUND) {
        if (isLeftWall && fighter.vx < -1 || isRightWall && fighter.vx > 1) {
          fighter.changeState(FIGHTER_STATE.WALL_REBOUND);
          fighter.isInvincible = false;
          fighter.isGrounded = false;
          fighter.vx = isLeftWall ? 6.5 : -6.5;
          fighter.vy = -5;
          this.hud.triggerShake(8);
          this.hud.addHitSpark(fighter.x + 40, fighter.y - 45, "hit");
          this.hud.showCrowdBanner("CROWD SHOVE!");
          soundFX.playCrowdCheer();
        }
      }
    }
    checkAttacks() {
      for (const attacker of this.allFighters) {
        if (attacker.activeHitbox && !attacker.hasHitThisAttack && !attacker.isDead) {
          for (const defender of this.allFighters) {
            if (defender !== attacker && defender.team !== attacker.team && !defender.isDead) {
              const hitResult = HitboxSystem.checkAttackHit(attacker, defender);
              if (hitResult) {
                attacker.hasHitThisAttack = true;
                const attackData = attacker.isRageMode ? { ...hitResult.attack, damage: Math.round(hitResult.attack.damage * 1.25) } : hitResult.attack;
                attacker.addSuper(attackData.damage * 0.08);
                const hitType = defender.takeHit(attackData, attacker.facingRight ? 1 : -1);
                if (attacker.state === FIGHTER_STATE.DIRTY_TACTIC || attackData.hitType === HIT_TYPE.DIRTY_STUN) {
                  this.hud.showDirtyBanner(attacker.name);
                }
                const isHeavy = attackData.hitType === HIT_TYPE.HEAVY || attackData.hitType === HIT_TYPE.KNOCKDOWN;
                attacker.hitStop = isHeavy ? 4 : 2;
                this.hud.addHitSpark(hitResult.hitX, hitResult.hitY, hitType === "blocked" ? "block" : "hit");
                if (hitType !== "blocked") {
                  this.hud.recordHit(attacker.playerNum);
                  const shakeMult = this.settingsManager.settings.screenShake === "off" ? 0 : this.settingsManager.settings.screenShake === "low" ? 0.4 : 1;
                  this.hud.triggerShake((attackData.damage > 80 ? 7 : 3) * shakeMult);
                }
                break;
              }
            }
          }
        }
      }
    }
    updateProjectiles() {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.update();
        if (!p.active) {
          this.projectiles.splice(i, 1);
          continue;
        }
        const pHit = p.getHitbox();
        for (const target of this.allFighters) {
          if (target !== p.owner && target.team !== p.owner?.team && !target.isDead) {
            const targetHurtboxes = target.getGlobalHurtboxes();
            let hitTarget = false;
            for (const hurt of targetHurtboxes) {
              if (HitboxSystem.testOverlap(pHit, hurt)) {
                hitTarget = true;
                p.destroy();
                const hitType = target.takeHit({
                  damage: p.damage,
                  hitStun: 22,
                  blockStun: 14,
                  pushback: 5,
                  height: p.attackHeight,
                  hitType: "HEAVY",
                  chipDamage: 12,
                  isProjectile: true
                }, p.vx > 0 ? 1 : -1);
                this.hud.addHitSpark(p.x + p.width / 2, p.y + p.height / 2, hitType === "blocked" ? "block" : "hit");
                this.hud.recordHit(p.owner.playerNum);
                this.hud.triggerShake(5);
                break;
              }
            }
            if (hitTarget) break;
          }
        }
        for (let j = 0; j < this.projectiles.length; j++) {
          const other = this.projectiles[j];
          if (p !== other && p.owner?.team !== other.owner?.team && p.active && other.active) {
            if (HitboxSystem.testOverlap(pHit, other.getHitbox())) {
              p.destroy();
              other.destroy();
              this.hud.addHitSpark((p.x + other.x) / 2, (p.y + other.y) / 2, "hit");
              soundFX.playNoiseCrack(0.2, 800, 0.4);
              break;
            }
          }
        }
      }
    }
    updateCamera() {
      const living = this.allFighters.filter((f) => !f.isDead);
      if (living.length === 0) return;
      const minX = Math.min(...living.map((f) => f.x));
      const maxX = Math.max(...living.map((f) => f.x));
      const midX = (minX + maxX) / 2;
      const targetCamX = Math.max(0, Math.min(STAGE_WIDTH - GAME_WIDTH, midX - GAME_WIDTH / 2));
      this.cameraX += (targetCamX - this.cameraX) * 0.15;
    }
    checkMatchEnd() {
      if (this.isCampaign) {
        const isBouncerStage = this.bossQueue[this.bossIndex] === "bouncer_twins";
        const isChampionStage = this.bossQueue[this.bossIndex] === "champion";
        const isDragonStage = this.bossQueue[this.bossIndex] === "endless_dragon";
        if ((isChampionStage || isDragonStage) && this.f2 && (this.f2.phase === 1 && this.f2.hasTransitioned || this.f2.transitionTimer > 0)) {
          return;
        }
        const bossDead = isBouncerStage ? this.f2.isDead && (!this.f4 || this.f4.isDead) : this.f2.isDead;
        const playerDead = this.isCoopCampaign ? this.f1.isDead && (!this.f3 || this.f3.isDead) : this.f1.isDead;
        const isTimeOver = this.hud.timer <= 0;
        let stageWon = false;
        let stageLost = false;
        if (bossDead) {
          stageWon = true;
        } else if (playerDead) {
          stageLost = true;
        } else if (isTimeOver) {
          const bossHealth = isBouncerStage ? this.f2.health + (this.f4 ? this.f4.health : 0) : this.f2.health;
          const playerHealth = this.isCoopCampaign ? this.f1.health + (this.f3 ? this.f3.health : 0) : this.f1.health;
          if (playerHealth > bossHealth) {
            stageWon = true;
          } else {
            stageLost = true;
          }
        }
        if ((stageWon || stageLost) && this.screen === GAME_SCREENS.FIGHT) {
          this.screen = GAME_SCREENS.ROUND_OVER;
          this.slowMotion = true;
          this.roundOverTimer = 160;
          this.campaignStageWon = stageWon;
          soundFX.stopMusic();
          if (stageWon && (isChampionStage || isDragonStage) && this.f2.phase === 2) {
            const vanquishMsg = isDragonStage ? this.isCoopCampaign ? "ANCIENT DRAGON SLAIN (2P RAID CLEAR!)" : "ANCIENT DRAGON VANQUISHED" : "LEGEND VANQUISHED";
            this.hud.setAnnouncement(vanquishMsg, 150);
          } else if (isTimeOver) {
            this.hud.setAnnouncement(stageWon ? "TIME OVER - STAGE CLEAR!" : "TIME OVER - DEFEAT", 130);
            soundFX.playAnnouncer("TIME_OVER");
          } else {
            this.hud.setAnnouncement(stageWon ? this.isCoopCampaign ? "STAGE CLEAR (DUO RAID)!" : "STAGE CLEAR!" : "DEFEAT", 120);
          }
          this.hud.triggerShake(14);
        }
        if (this.screen === GAME_SCREENS.ROUND_OVER) {
          this.roundOverTimer--;
          if (this.roundOverTimer <= 0) {
            if (this.campaignStageWon) {
              if (isDragonStage) {
                EconomyManager.addCoins(500);
                if (typeof window !== "undefined" && window.localStorage) {
                  try {
                    window.localStorage.setItem("final_impact_unlocked_dragon", "true");
                    window.localStorage.setItem("final_impact_beaten_dragon", "true");
                  } catch (e) {
                  }
                }
                if (this.charSelect) {
                  this.charSelect.unlockDragon();
                }
              } else {
                EconomyManager.addCoins(100);
              }
              this.bossIndex++;
              if (this.bossIndex < this.bossQueue.length) {
                this.f1.health = Math.min(this.f1.maxHealth, this.f1.health + 500);
                this.f1.stamina = this.f1.maxStamina;
                if (this.f3) {
                  this.f3.health = Math.min(this.f3.maxHealth, this.f3.health + 500);
                  this.f3.stamina = this.f3.maxStamina;
                }
                this.setupCampaignStage(this.f1.id, false);
                this.slowMotion = false;
                this.beginVersus();
                if (this.isCoopCampaign && this.netplay.isHost) {
                  this.netplay.send({
                    type: "CAMPAIGN_NEXT_STAGE",
                    bossIndex: this.bossIndex
                  });
                }
              } else {
                EconomyManager.addCoins(1e3);
                if (this.isCoopCampaign && this.netplay.isHost) {
                  this.netplay.send({
                    type: "CAMPAIGN_VICTORY"
                  });
                }
                this.initVictoryScreen();
                this.winner = this.f1;
                soundFX.playAnnouncer("YOU_WIN");
              }
            } else {
              this.initVictoryScreen();
              this.winner = this.f2;
            }
          }
        }
        return;
      }
      if (this.is2v2) {
        const team1Dead = this.f1.isDead && (!this.f3 || this.f3.isDead);
        const team2Dead = this.f2.isDead && (!this.f4 || this.f4.isDead);
        if ((team1Dead || team2Dead || this.hud.timer <= 0) && this.screen === GAME_SCREENS.FIGHT) {
          this.screen = GAME_SCREENS.ROUND_OVER;
          this.slowMotion = true;
          this.roundOverTimer = 160;
          this.hud.setAnnouncement("TEAM K.O.", 120);
          this.hud.triggerShake(14);
          this.winner = team2Dead ? this.f1 : this.f2;
          if (team2Dead) EconomyManager.addCoins(150);
          soundFX.stopMusic();
        }
        if (this.screen === GAME_SCREENS.ROUND_OVER) {
          this.roundOverTimer--;
          if (this.roundOverTimer <= 0) {
            this.initVictoryScreen();
            soundFX.playAnnouncer("YOU_WIN");
          }
        }
        return;
      }
      const isKO = this.f1.isDead || this.f2.isDead || this.hud.timer <= 0;
      if (isKO && this.screen === GAME_SCREENS.FIGHT) {
        this.screen = GAME_SCREENS.ROUND_OVER;
        this.slowMotion = true;
        this.roundOverTimer = 160;
        this.hud.setAnnouncement("K.O.", 120);
        this.hud.triggerShake(14);
        if (this.f1.health > this.f2.health) {
          this.f1.roundsWon++;
          this.f1.changeState(FIGHTER_STATE.VICTORY);
          EconomyManager.addCoins(50);
        } else if (this.f2.health > this.f1.health) {
          this.f2.roundsWon++;
          this.f2.changeState(FIGHTER_STATE.VICTORY);
        }
        if (this.f1.roundsWon >= 2 || this.f2.roundsWon >= 2) {
          soundFX.stopMusic();
          const w = this.f1.roundsWon >= 2 ? this.f1 : this.f2;
          this.koFlawless = w.health >= w.maxHealth;
          if (w === this.f1) {
            EconomyManager.addCoins(150 + (this.koFlawless ? 200 : 0));
          }
        }
      }
      if (this.screen === GAME_SCREENS.ROUND_OVER) {
        if (this.finish.active) {
          if (this.finish.update()) {
            this.initVictoryScreen();
            this.winner = this.f1.roundsWon >= 2 ? this.f1 : this.f2;
            soundFX.playAnnouncer("YOU_WIN");
          }
          return;
        }
        this.roundOverTimer--;
        if (this.roundOverTimer <= 0) {
          if (this.f1.roundsWon >= 2 || this.f2.roundsWon >= 2) {
            const fw = this.f1.roundsWon >= 2 ? this.f1 : this.f2;
            const fl = fw === this.f1 ? this.f2 : this.f1;
            if (!this.isOnline && !this.isTraining && !fw.isCpu && fl.isDead) {
              this.slowMotion = false;
              this.finish.start(fw, fl, this.hud, { flawless: !!this.koFlawless });
              return;
            }
            this.initVictoryScreen();
            this.winner = this.f1.roundsWon >= 2 ? this.f1 : this.f2;
            soundFX.playAnnouncer("YOU_WIN");
          } else {
            this.resetRound();
          }
        }
      }
    }
    updateVictoryScreen() {
      if (this.isOnline) {
        if (!this.netplay || !this.netplay.isConnected) {
          if (!this.rematchStatusMessage.includes("DISCONNECTED")) {
            this.rematchStatusMessage = "OPPONENT DISCONNECTED. RETURNING TO LOBBY...";
            if (!this.rematchTimer) this.rematchTimer = 60;
          }
        }
        if (this.rematchTimer > 0) {
          this.rematchTimer--;
          if (this.rematchTimer === 0) {
            if (this.myRematchVote === "yes" && this.oppRematchVote === "yes") {
              this.startMatch();
            } else {
              this.screen = GAME_SCREENS.ONLINE_LOBBY;
              this.onlineLobby.subState = "MENU";
              this.myRematchVote = null;
              this.oppRematchVote = null;
            }
          }
          return;
        }
        const menuNav2 = input.getAnyMenuNav();
        if (this.myRematchVote === null) {
          if (input.isJustPressed("KeyA") || input.isJustPressed("ArrowLeft") || input.isJustPressed("KeyW") || input.isJustPressed("ArrowUp") || menuNav2 && (menuNav2.left || menuNav2.up)) {
            input.consumeKey("KeyA");
            input.consumeKey("ArrowLeft");
            input.consumeKey("KeyW");
            input.consumeKey("ArrowUp");
            if (this.onlineRematchOption !== 0) {
              this.onlineRematchOption = 0;
              soundFX.playWhoosh("light");
            }
          } else if (input.isJustPressed("KeyD") || input.isJustPressed("ArrowRight") || input.isJustPressed("KeyS") || input.isJustPressed("ArrowDown") || menuNav2 && (menuNav2.right || menuNav2.down)) {
            input.consumeKey("KeyD");
            input.consumeKey("ArrowRight");
            input.consumeKey("KeyS");
            input.consumeKey("ArrowDown");
            if (this.onlineRematchOption !== 1) {
              this.onlineRematchOption = 1;
              soundFX.playWhoosh("light");
            }
          }
          if (menuNav2 && menuNav2.confirm) {
            this.voteRematch(this.onlineRematchOption === 0 ? "yes" : "no");
          } else if (menuNav2 && menuNav2.back) {
            this.voteRematch("no");
          }
          if (input.isJustPressed("KeyY")) {
            input.consumeKey("KeyY");
            this.voteRematch("yes");
          } else if (input.isJustPressed("KeyN")) {
            input.consumeKey("KeyN");
            this.voteRematch("no");
          }
        }
        return;
      }
      const menuNav = input.getAnyMenuNav();
      if (input.isJustPressed("KeyW") || input.isJustPressed("ArrowUp") || menuNav && menuNav.up) {
        input.consumeKey("KeyW");
        input.consumeKey("ArrowUp");
        this.victoryMenuIndex = (this.victoryMenuIndex - 1 + 3) % 3;
        soundFX.playWhoosh("light");
      } else if (input.isJustPressed("KeyS") || input.isJustPressed("ArrowDown") || menuNav && menuNav.down) {
        input.consumeKey("KeyS");
        input.consumeKey("ArrowDown");
        this.victoryMenuIndex = (this.victoryMenuIndex + 1) % 3;
        soundFX.playWhoosh("light");
      }
      if (menuNav && menuNav.confirm) {
        this.handleConfirmPress();
      } else if (menuNav && menuNav.back) {
        this.handleBackPress();
      }
    }
    render() {
      const { ctx } = this;
      const W = GAME_WIDTH;
      const H = GAME_HEIGHT;
      if (typeof document !== "undefined") {
        const coinEl = document.getElementById("topbarCoinVal");
        if (coinEl && this.gameSpeedTick % 30 === 0) {
          coinEl.textContent = EconomyManager.getCoins().toLocaleString();
        }
      }
      ctx.clearRect(0, 0, W, H);
      if (this.screen === GAME_SCREENS.TITLE) {
        this.titleScreen.render(ctx, W, H);
        return;
      }
      if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
        this.onlineLobby.render(ctx, W, H);
        return;
      }
      if (this.screen === GAME_SCREENS.SHOP) {
        this.shopScreen.render(ctx, W, H);
        return;
      }
      if (this.screen === GAME_SCREENS.MODE_SELECT) {
        this.modeSelect.render(ctx, W, H);
        return;
      }
      if (this.screen === GAME_SCREENS.CHAR_SELECT) {
        this.charSelect.render(ctx, W, H);
        return;
      }
      if (this.screen === GAME_SCREENS.STAGE_SELECT) {
        this.stageSelect.render(ctx, W, H);
        return;
      }
      if (this.screen === GAME_SCREENS.VERSUS) {
        this.versus.render(ctx, W, H, this.stage, this.cameraX);
        return;
      }
      if (this.screen === GAME_SCREENS.SITE_OF_GRACE) {
        this.elden.renderSiteOfGrace(ctx, W, H);
        return;
      }
      if (this.screen === GAME_SCREENS.VICTORY) {
        this.renderVictoryScreen();
        return;
      }
      ctx.save();
      const shake = this.hud.getShakeOffset();
      ctx.translate(shake.x, shake.y);
      this.stage.render(ctx, this.cameraX, W, H);
      ctx.save();
      ctx.translate(-this.cameraX, 0);
      this.pickups.forEach((p) => p.render(ctx));
      this.allFighters.forEach((f) => f.render(ctx));
      this.projectiles.forEach((p) => p.render(ctx));
      if (this.finish && this.finish.active) {
        this.finish.renderWorld(ctx);
      }
      if (this.showHitboxes) {
        this.renderHitboxDebug(ctx);
      }
      ctx.restore();
      const primaryEnemy = this.f2 && !this.f2.isDead ? this.f2 : this.f4 || this.f2;
      this.hud.render(ctx, this.f1, primaryEnemy, W, H, this.f3, this.f4);
      if (this.finish && this.finish.active) {
        this.finish.renderOverlay(ctx, W, H);
      }
      if (this.elden) {
        this.elden.update();
        this.elden.renderFelledBanner(ctx, W, H);
        this.elden.renderYouDied(ctx, W, H);
      }
      if (this.isOnline && this.netplay) {
        this.renderOnlineBadge(ctx, W, H);
      }
      ctx.restore();
    }
    renderOnlineBadge(ctx, W, H) {
      ctx.save();
      const ping = this.netplay.ping || 24;
      const isHost = this.netplay.isHost;
      const roleText = isHost ? "HOST" : "CLIENT";
      const pingColor = ping < 60 ? "#22c55e" : ping < 120 ? "#eab308" : "#ef4444";
      const badgeX = W / 2 - 70;
      const badgeY = 6;
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.fillRect(badgeX, badgeY, 140, 15);
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 1;
      ctx.strokeRect(badgeX, badgeY, 140, 15);
      ctx.fillStyle = pingColor;
      ctx.beginPath();
      ctx.arc(badgeX + 8, badgeY + 7.5, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`ONLINE [${roleText}] ${ping}ms`, badgeX + 16, badgeY + 11);
      ctx.restore();
    }
    renderHitboxDebug(ctx) {
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 1;
      this.allFighters.forEach((f) => {
        f.getGlobalHurtboxes().forEach((b) => {
          ctx.strokeRect(b.x, b.y, b.w, b.h);
        });
      });
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      this.allFighters.forEach((f) => {
        const hit = f.getGlobalHitbox();
        if (hit) ctx.strokeRect(hit.x, hit.y, hit.w, hit.h);
      });
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 1;
      this.allFighters.forEach((f) => {
        const p = f.getPushbox();
        ctx.strokeRect(p.x, p.y, p.w, p.h);
      });
    }
    renderVictoryScreen() {
      const { ctx } = this;
      const W = GAME_WIDTH;
      const H = GAME_HEIGHT;
      ctx.fillStyle = "#08051a";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#181232";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(30, 27, 75, 0.85)";
      ctx.fillRect(12, 10, 95, 22);
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 1;
      ctx.strokeRect(12, 10, 95, 22);
      ctx.fillStyle = "#fde047";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(this.isOnline ? "\u2B05\uFE0F LOBBY [B]" : "\u2B05\uFE0F MODES [B]", 60, 24);
      ctx.fillStyle = "#17113b";
      ctx.fillRect(0, 16, W, 46);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(0, 15, W, 2);
      ctx.fillRect(0, 62, W, 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fde047";
      ctx.font = "bold 18px monospace";
      if (this.isCampaign && this.winner === this.f1) {
        if (this.isCoopCampaign) {
          ctx.fillText("\u{1F409} DRAGON SLAYER DUO! \u{1F409}", W / 2, 38);
          ctx.fillStyle = "#c084fc";
          ctx.font = "bold 9px monospace";
          ctx.fillText("CO-OP RAID COMPLETE: THE ANCIENT VOID EMPEROR HAS FALLEN!", W / 2, 52);
        } else {
          ctx.fillText("\u{1F3C6} CAMPAIGN CONQUEROR! \u{1F3C6}", W / 2, 38);
          ctx.fillStyle = "#38bdf8";
          ctx.font = "9px monospace";
          ctx.fillText("ALL 8 BOSSES & THE ENDLESS DRAGON FELLED", W / 2, 52);
        }
      } else {
        ctx.fillText(`${this.winner ? this.winner.name : "PLAYER"} WINS!`, W / 2, 38);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "9px monospace";
        ctx.fillText("FINAL IMPACT CHAMPION", W / 2, 52);
      }
      if (this.winner) {
        const sprites = this.winner.sprites?.VICTORY || this.winner.sprites?.IDLE || [];
        const winImg = sprites[0];
        if (winImg) {
          ctx.drawImage(winImg, W / 2 - 45, 68, 90, 105);
        }
        const quote = this.victoryQuotes[this.winner.id] || '"Victory belongs to the swift and disciplined!"';
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "italic 10px monospace";
        ctx.fillText(quote, W / 2, 180);
        if (typeof localStorage !== "undefined" && localStorage.getItem("final_impact_beaten_dragon") === "true") {
          ctx.fillStyle = "#fde047";
          ctx.font = "bold 8.5px monospace";
          ctx.fillText("\u2728 UNLOCKED: PLAYABLE ENDLESS DRAGON & [\u{1F409} DRAGON SLAYER] TITLE \u2728", W / 2, 192);
        }
      }
      if (this.isOnline) {
        const cardW = 440;
        const cardH = 150;
        const cardX = (W - cardW) / 2;
        const cardY = 196;
        ctx.fillStyle = "rgba(15, 12, 32, 0.95)";
        ctx.fillRect(cardX, cardY, cardW, cardH);
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cardX, cardY, cardW, cardH);
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 12px monospace";
        ctx.fillText("\u2694\uFE0F ONLINE REMATCH VOTE \u2694\uFE0F", W / 2, cardY + 18);
        if (this.rematchStatusMessage) {
          let statusColor = "#38bdf8";
          if (this.rematchStatusMessage.includes("ACCEPTED")) statusColor = "#22c55e";
          else if (this.rematchStatusMessage.includes("DECLINED") || this.rematchStatusMessage.includes("DISCONNECTED")) statusColor = "#ef4444";
          else if (this.rematchStatusMessage.includes("WANTS A REMATCH")) statusColor = "#facc15";
          ctx.fillStyle = statusColor;
          ctx.font = "bold 11px monospace";
          ctx.fillText(this.rematchStatusMessage, W / 2, cardY + 36);
        } else {
          ctx.fillStyle = "#94a3b8";
          ctx.font = "10px monospace";
          ctx.fillText("WOULD YOU LIKE TO REMATCH YOUR OPPONENT?", W / 2, cardY + 36);
        }
        const btnW = 195;
        const btnH = 34;
        const btnY = cardY + 46;
        const yesX = W / 2 - btnW - 8;
        const noX = W / 2 + 8;
        const isYesHighlighted = this.onlineRematchOption === 0;
        const hasVotedYes = this.myRematchVote === "yes";
        ctx.fillStyle = hasVotedYes ? "rgba(22, 101, 52, 0.9)" : isYesHighlighted ? "rgba(30, 27, 75, 0.95)" : "rgba(15, 23, 42, 0.8)";
        ctx.fillRect(yesX, btnY, btnW, btnH);
        ctx.strokeStyle = isYesHighlighted ? "#fde047" : hasVotedYes ? "#22c55e" : "#15803d";
        ctx.lineWidth = isYesHighlighted ? 2 : 1;
        ctx.strokeRect(yesX, btnY, btnW, btnH);
        ctx.fillStyle = hasVotedYes ? "#4ade80" : isYesHighlighted ? "#ffffff" : "#cbd5e1";
        ctx.font = "bold 11px monospace";
        const yesPrefix = isYesHighlighted ? "\u25BA " : "";
        const yesSuffix = hasVotedYes ? " [\u2713 VOTED]" : "";
        ctx.fillText(`${yesPrefix}YES - REMATCH${yesSuffix}`, yesX + btnW / 2, btnY + 21);
        const isNoHighlighted = this.onlineRematchOption === 1;
        const hasVotedNo = this.myRematchVote === "no";
        ctx.fillStyle = hasVotedNo ? "rgba(153, 27, 27, 0.9)" : isNoHighlighted ? "rgba(30, 27, 75, 0.95)" : "rgba(15, 23, 42, 0.8)";
        ctx.fillRect(noX, btnY, btnW, btnH);
        ctx.strokeStyle = isNoHighlighted ? "#fde047" : hasVotedNo ? "#ef4444" : "#991b1b";
        ctx.lineWidth = isNoHighlighted ? 2 : 1;
        ctx.strokeRect(noX, btnY, btnW, btnH);
        ctx.fillStyle = hasVotedNo ? "#f87171" : isNoHighlighted ? "#ffffff" : "#cbd5e1";
        ctx.font = "bold 11px monospace";
        const noPrefix = isNoHighlighted ? "\u25BA " : "";
        const noSuffix = hasVotedNo ? " [\u2717 VOTED]" : "";
        ctx.fillText(`${noPrefix}NO - RETURN TO LOBBY${noSuffix}`, noX + btnW / 2, btnY + 21);
        const p1VoteText = this.myRematchVote ? this.myRematchVote === "yes" ? "READY (YES)" : "DECLINED (NO)" : "DECIDING...";
        const p2VoteText = this.oppRematchVote ? this.oppRematchVote === "yes" ? "READY (YES)" : "DECLINED (NO)" : "DECIDING...";
        const p1Color = this.myRematchVote === "yes" ? "#22c55e" : this.myRematchVote === "no" ? "#ef4444" : "#94a3b8";
        const p2Color = this.oppRematchVote === "yes" ? "#22c55e" : this.oppRematchVote === "no" ? "#ef4444" : "#94a3b8";
        ctx.font = "bold 10px monospace";
        ctx.fillStyle = p1Color;
        ctx.fillText(`YOU: [ ${p1VoteText} ]`, W / 2 - 105, cardY + 104);
        ctx.fillStyle = "#64748b";
        ctx.fillText("|", W / 2, cardY + 104);
        ctx.fillStyle = p2Color;
        ctx.fillText(`OPPONENT: [ ${p2VoteText} ]`, W / 2 + 105, cardY + 104);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "9px monospace";
        ctx.fillText("\u25C4/\u25BA [A/D] SELECT  |  [ENTER] VOTE  |  [Y] YES  |  [N / B / ESC] NO", W / 2, cardY + 130);
      } else {
        const menuOptions = [
          { label: "\u2694\uFE0F REMATCH", desc: "Restart match immediately" },
          { label: "\u{1F94B} CHARACTER SELECT", desc: "Return to character select" },
          { label: "\u{1F3C6} MAIN MENU", desc: "Return to Mode Select" }
        ];
        const btnW = 280;
        const btnH = 26;
        const startY = 208;
        const gapY = 32;
        menuOptions.forEach((opt, idx) => {
          const isSelected = this.victoryMenuIndex === idx;
          const y = startY + idx * gapY;
          const x = (W - btnW) / 2;
          ctx.fillStyle = isSelected ? "rgba(30, 27, 75, 0.95)" : "rgba(15, 23, 42, 0.75)";
          ctx.fillRect(x, y, btnW, btnH);
          ctx.strokeStyle = isSelected ? "#fde047" : "#334155";
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.strokeRect(x, y, btnW, btnH);
          ctx.fillStyle = isSelected ? "#ffffff" : "#94a3b8";
          ctx.font = isSelected ? "bold 12px monospace" : "11px monospace";
          const cursor = isSelected ? "\u25BA " : "";
          ctx.fillText(`${cursor}${opt.label}`, W / 2, y + 17);
        });
        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px monospace";
        ctx.fillText("\u25B2/\u25BC [W/S] SELECT  |  [ENTER / SPACE] CONFIRM  |  [B / ESC] BACK", W / 2, H - 12);
      }
      ctx.textAlign = "left";
    }
  };

  // src/main.js
  function initGame() {
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) return;
    if (window.__GAME_INSTANCE) return;
    const game = new Game(canvas);
    window.__GAME_INSTANCE = game;
    const unlockAudio = () => {
      soundFX.ensureContext();
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    let lastTime = performance.now();
    const targetFPS = 60;
    const tickInterval = 1e3 / targetFPS;
    let accumulator = 0;
    function loop(currentTime) {
      requestAnimationFrame(loop);
      try {
        let delta = currentTime - lastTime;
        lastTime = currentTime;
        if (delta > 66.6) delta = 66.6;
        if (delta < 0) delta = 0;
        accumulator += delta;
        let steps = 0;
        while (accumulator >= tickInterval && steps < 4) {
          game.update();
          accumulator -= tickInterval;
          steps++;
        }
        if (steps >= 4) {
          accumulator = 0;
        }
        game.render();
      } catch (err) {
        console.error("Handled game loop error:", err);
      }
    }
    requestAnimationFrame(loop);
  }
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initGame);
  } else {
    initGame();
  }
})();
