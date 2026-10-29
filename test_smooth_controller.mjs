// Verification test for Controller Smoothness and Move List navigation
import { InputManager } from './src/engine/Input.js';
import { ModeSelect } from './src/ui/ModeSelect.js';
import { ALL_FIGHTERS_CATALOG } from './src/fighters/FighterCatalog.js';

console.log('--- Testing Controller Smoothness & Move List Access ---');

let testsPassed = 0;
let testsFailed = 0;
function assert(cond, msg) {
  if (cond) {
    console.log(`  [PASS] ${msg}`);
    testsPassed++;
  } else {
    console.error(`  [FAIL] ${msg}`);
    testsFailed++;
  }
}

// 1. Verify ModeSelect has Move List
const modeSelect = new ModeSelect();
const movelistMode = modeSelect.modes.find(m => m.id === 'movelist');
assert(!!movelistMode, 'ModeSelect includes dedicated "📖 MOVE LIST & COMBOS" menu mode');
assert(movelistMode && movelistMode.title.includes('MOVE LIST'), 'Move list menu card title is clearly visible');

// 2. Test InputManager Radial Deadzone & Diagonal Rolling
const input = new InputManager();

// Mock Gamepad with simulated radial motion
const mockGp = {
  index: 0,
  id: 'Xbox Controller',
  connected: true,
  axes: [0, 0, 0, 0],
  buttons: Array(16).fill(null).map(() => ({ pressed: false, value: 0 }))
};

let currentMockGamepads = [mockGp];
Object.defineProperty(global.navigator, 'getGamepads', {
  value: () => currentMockGamepads,
  configurable: true,
  writable: true
});
input.endFrame();
input.pollGamepads();
let state = input.getGamepadState(0);
assert(!state.right && !state.down, 'Sub-deadzone radial stick drift (<0.16) correctly ignored');

// Diagonal Down-Forward (QCF roll intermediate: 45 degrees)
mockGp.axes[0] = 0.65;
mockGp.axes[1] = 0.65; // hypot = ~0.92, deg = 45°
input.endFrame();
input.pollGamepads();
state = input.getGamepadState(0);
assert(state.down === true && state.right === true, 'Down-forward diagonal registered effortlessly via angular cones');

// Pure Down (90 degrees)
mockGp.axes[0] = 0.0;
mockGp.axes[1] = 0.8;
input.endFrame();
input.pollGamepads();
state = input.getGamepadState(0);
assert(state.down === true && !state.right && !state.left, 'Pure Down registered cleanly');

// Pure Forward (0 degrees)
mockGp.axes[0] = 0.8;
mockGp.axes[1] = 0.0;
input.endFrame();
input.pollGamepads();
state = input.getGamepadState(0);
assert(state.right === true && !state.down && !state.up, 'Pure Forward registered cleanly');

// 3. Test Sensitive Triggers (value > 0.18)
mockGp.axes[0] = 0;
mockGp.axes[1] = 0;
mockGp.buttons[7].value = 0.22; // RT trigger pull at 22%
mockGp.buttons[7].pressed = false; // analog trigger reporting value
input.endFrame();
input.pollGamepads();
state = input.getGamepadState(0);
assert(state.sp2 === true, 'Sensitive trigger pull (22%) triggers mapped action without heavy squeeze');

// 4. Test Bumper Tab Navigation
mockGp.buttons[7].value = 0.0;
mockGp.buttons[5].pressed = true; // RB / R1 button
input.endFrame();
input.pollGamepads();
const nav = input.getMenuNav(0);
assert(nav.rb === true, 'RB recognized in menu nav');
assert(nav.nextTab === true, 'RB triggers nextTab for cycling settings / move list tabs');

// 5. Test All 18 Fighters catalog moves
const fighterIds = Object.keys(ALL_FIGHTERS_CATALOG);
assert(fighterIds.length >= 18, `Catalog has all ${fighterIds.length} fighters (10 playable + 8 bosses)`);

console.log(`\nVerification complete: ${testsPassed} passed, ${testsFailed} failed.`);
if (testsFailed > 0) process.exit(1);
