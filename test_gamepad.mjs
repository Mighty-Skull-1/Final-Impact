// Final Impact - Gamepad API Integration Test Suite
import { InputManager } from './src/engine/Input.js';

console.log('--- Starting Gamepad API Integration Verification ---');

// Mock browser globals
let simulatedGamepads = [];
if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'getGamepads', {
    value: () => simulatedGamepads,
    configurable: true,
    writable: true
  });
} else {
  global.navigator = {
    getGamepads: () => simulatedGamepads
  };
}

let eventListeners = {};
global.window = {
  addEventListener: (name, cb) => {
    if (!eventListeners[name]) eventListeners[name] = [];
    eventListeners[name].push(cb);
  },
  removeEventListener: (name, cb) => {},
  dispatchEvent: (e) => {
    if (eventListeners[e.type]) {
      eventListeners[e.type].forEach(cb => cb(e));
    }
  }
};
global.CustomEvent = class CustomEvent {
  constructor(type, detail = {}) {
    this.type = type;
    this.detail = detail.detail || {};
  }
};
global.performance = {
  now: () => Date.now()
};

function createMockGamepad(index = 0, id = 'Xbox Wireless Controller (STANDARD GAMEPAD)') {
  const buttons = [];
  for (let i = 0; i < 16; i++) {
    buttons.push({ pressed: false, value: 0.0 });
  }
  return {
    index,
    id,
    connected: true,
    mapping: 'standard',
    axes: [0.0, 0.0, 0.0, 0.0],
    buttons
  };
}

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    testsFailed++;
  }
}

const input = new InputManager();

// Test 1: No gamepads initially
assert(!input.hasGamepadConnected(), 'Initial state has no gamepad connected');
assert(input.getConnectedGamepads().length === 0, 'Initial connected gamepads list is empty');

// Test 2: Hot-plug Gamepad 0 (Player 1)
const gp0 = createMockGamepad(0, 'Xbox 360 Controller');
simulatedGamepads = [gp0, null];
input.pollGamepads();

assert(input.hasGamepadConnected(), 'Detects hot-plugged Gamepad 0');
assert(input.getConnectedGamepads().length === 1, 'Connected gamepads returns 1 controller');
assert(input.getConnectedGamepads()[0].id.includes('Xbox'), 'Identifies controller model name');

// Test 3: Standard Attack Button Mapping and Single-frame Edge Detection
// Press Button 2 (X / Square -> Light Punch)
gp0.buttons[2].pressed = true;
gp0.buttons[2].value = 1.0;
input.update();

let s1 = input.getState(1, true);
assert(s1.lp === true, 'Player 1 LP is pressed via Gamepad button 2 (X/Square)');
assert(s1.lpJust === true, 'Player 1 lpJust is true on initial press frame');
assert(input.peekAction(1) === 'LP', 'Action queue buffered LP attack command');

// Second frame: hold button down
input.endFrame();
input.update();
s1 = input.getState(1, true);
assert(s1.lp === true, 'Player 1 LP remains pressed while holding');
assert(s1.lpJust === false, 'Player 1 lpJust resets to false on subsequent frame (no ghost loop)');

// Release button
gp0.buttons[2].pressed = false;
gp0.buttons[2].value = 0.0;
input.endFrame();
input.update();
s1 = input.getState(1, true);
assert(s1.lp === false, 'Player 1 LP resets to unpressed on release');

// Test 4: Heavy Punch, Light Kick, Heavy Kick
gp0.buttons[3].pressed = true; // Y / Triangle -> HP
gp0.buttons[0].pressed = true; // A / Cross -> LK
gp0.buttons[1].pressed = true; // B / Circle -> HK
input.endFrame();
input.update();
s1 = input.getState(1, true);
assert(s1.hpJust === true, 'Button 3 (Y/Triangle) triggers HP');
assert(s1.lkJust === true, 'Button 0 (A/Cross) triggers LK');
assert(s1.hkJust === true, 'Button 1 (B/Circle) triggers HK');

// Release buttons
gp0.buttons[3].pressed = false;
gp0.buttons[0].pressed = false;
gp0.buttons[1].pressed = false;
input.endFrame();
input.update();

// Test 5: Specials and Desperation Dirty Tactic
gp0.buttons[5].pressed = true; // RB / R1 -> SP1
gp0.buttons[7].pressed = true; // RT / R2 -> SP2
gp0.buttons[4].pressed = true; // LB / L1 -> SP3
gp0.buttons[6].value = 0.9;    // LT / L2 analog trigger -> DIRTY
input.endFrame();
input.update();
s1 = input.getState(1, true);
assert(s1.sp1Just === true, 'RB (Button 5) triggers Special 1');
assert(s1.sp2Just === true, 'RT (Button 7) triggers Special 2');
assert(s1.sp3Just === true, 'LB (Button 4) triggers Special 3');
assert(s1.dirtyJust === true, 'LT Analog (Button 6) triggers Dirty Tactic');

// Release
gp0.buttons[5].pressed = false;
gp0.buttons[7].pressed = false;
gp0.buttons[4].pressed = false;
gp0.buttons[6].value = 0.0;
input.endFrame();
input.update();

// Test 6: Naruto Ultimate Jutsu Trigger (R3 stick click button 11)
gp0.buttons[11].pressed = true; // R3
input.endFrame();
input.update();
s1 = input.getState(1, true);
assert(s1.ultimateJust === true, 'R3 stick click (Button 11) triggers Naruto Ultimate');
assert(input.peekAction(1) === 'ULTIMATE', 'Naruto Ultimate queued into action buffer');
gp0.buttons[11].pressed = false;
input.endFrame();
input.update();

// Test 7: Analog Left Stick Deadzone & Direction
gp0.axes[0] = 0.12; // Small stick drift below 0.28 deadzone
input.endFrame();
input.update();
s1 = input.getState(1, true);
assert(s1.right === false && s1.left === false, 'Analog stick drift below deadzone (0.12) is filtered out');

gp0.axes[0] = 0.75; // Stick pushed right
input.endFrame();
input.update();
s1 = input.getState(1, true);
assert(s1.right === true, 'Analog stick pushed right (0.75) registers right');
assert(s1.rightJust === true, 'Analog stick initial right tilt triggers rightJust');

gp0.axes[0] = 0.0;
gp0.axes[1] = 0.85; // Stick pushed down (crouch)
input.endFrame();
input.update();
s1 = input.getState(1, true);
assert(s1.down === true, 'Analog stick pushed down registers crouch');
assert(s1.dir === 2, 'Directional notation equals 2 (down crouch)');

gp0.axes[1] = 0.0;
input.endFrame();
input.update();

// Test 8: Menu Navigation Helper
gp0.buttons[0].pressed = true; // A button
input.pollGamepads();
let nav = input.getMenuNav(0);
assert(nav.confirm === true, 'Menu navigation recognizes A button as confirm');
gp0.buttons[0].pressed = false;

gp0.buttons[1].pressed = true; // B button
input.pollGamepads();
nav = input.getMenuNav(0);
assert(nav.back === true, 'Menu navigation recognizes B button as cancel / back');
gp0.buttons[1].pressed = false;

gp0.buttons[9].pressed = true; // Start button
input.pollGamepads();
nav = input.getMenuNav(0);
assert(nav.start === true, 'Menu navigation recognizes Start button');
gp0.buttons[9].pressed = false;

// Test 9: Player 2 Gamepad (Local 2-Player mode)
const gp1 = createMockGamepad(1, 'DualShock 4 USB Controller');
simulatedGamepads = [gp0, gp1];
input.pollGamepads();

assert(input.getConnectedGamepads().length === 2, 'Two gamepads detected simultaneously');

// P2 presses Button 2 (LP on Gamepad 1)
gp1.buttons[2].pressed = true;
input.endFrame();
input.update();
let s2 = input.getState(2, true);
s1 = input.getState(1, true);

assert(s2.lp === true && s2.lpJust === true, 'Gamepad 1 controls Player 2 LP');
assert(s1.lp === false, 'Gamepad 1 input does not bleed into Player 1');

console.log(`\nResults: ${testsPassed} passed, ${testsFailed} failed.`);
if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('All Gamepad tests passed with 100% success!');
}
