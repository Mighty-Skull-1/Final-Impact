// Automated Verification Suite for Campaign Dialogue & Steam Achievements Engine
import assert from 'assert';

// Mock browser globals
const storage = {};
global.localStorage = {
  getItem: (k) => (k in storage ? storage[k] : null),
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { for (const k in storage) delete storage[k]; }
};
global.window = {
  addEventListener: () => {},
  removeEventListener: () => {}
};

import { CAMPAIGN_SCRIPTS, CampaignDialogue } from './src/combat/CampaignDialogue.js';
import { ACHIEVEMENTS, achievements, Achievements } from './src/engine/Achievements.js';

console.log('--- STARTING CAMPAIGN DIALOGUE & ACHIEVEMENTS VERIFICATION ---');

// Test 1: Campaign Boss Dialogue Catalog
console.log('\n[SECTION 1] Campaign Dialogue & Boss Banter');
const expectedBosses = [
  'riot_cop',
  'promoter',
  'bouncer_twins',
  'matriarch',
  'street_lord',
  'urban_legend',
  'champion',
  'endless_dragon'
];

expectedBosses.forEach(bossKey => {
  const script = CAMPAIGN_SCRIPTS[bossKey];
  assert.ok(script, `Script must exist for boss: ${bossKey}`);
  assert.ok(script.stageTitle, `Boss ${bossKey} must have stageTitle`);
  assert.ok(script.bossName, `Boss ${bossKey} must have bossName`);
  assert.ok(Array.isArray(script.lines) && script.lines.length >= 2, `Boss ${bossKey} must have at least 2 dialogue lines`);
  console.log(`  ✓ [PASS] Boss ${script.bossName} (${bossKey}) has valid script with ${script.lines.length} lines`);
});

// Test 2: Dialogue State Machine Execution
console.log('\n[SECTION 2] Campaign Dialogue Execution & Skip');
const dialogue = new CampaignDialogue();
let completed = false;

dialogue.start('champion', { name: 'Kazuki' }, { name: 'Rex Gannon' }, () => {
  completed = true;
});

assert.strictEqual(dialogue.active, true, 'Dialogue should be active after start');
assert.strictEqual(dialogue.stageKey, 'champion', 'Dialogue should target champion');
assert.strictEqual(dialogue.currentLineIndex, 0, 'Should start at line 0');

// Step through dialogue using advanceOrComplete
dialogue.advanceOrComplete(); // Finishes typing line 0
assert.strictEqual(dialogue.charIndex, dialogue.script.lines[0].text.length, 'advanceOrComplete should complete typewriter text');

dialogue.advanceOrComplete(); // Advances to line 1
assert.strictEqual(dialogue.currentLineIndex, 1, 'advanceOrComplete should advance to line 1');

// Test direct skip()
let skipped = false;
dialogue.start('riot_cop', { name: 'Kazuki' }, { name: 'SGT. Vance' }, () => {
  skipped = true;
});
dialogue.skip();
assert.strictEqual(dialogue.active, false, 'skip() should immediately finish dialogue');
assert.strictEqual(skipped, true, 'onComplete callback should be called on skip()');

// Test handleClick for skip area (bottom-right)
let mouseSkipped = false;
dialogue.start('riot_cop', { name: 'Kazuki' }, { name: 'SGT. Vance' }, () => {
  mouseSkipped = true;
});
// Box is located at W=960, H=540: boxX=24, boxY=440, boxW=912, boxH=76
// Click bottom-right skip area
dialogue.handleClick(900, 500, 960, 540);
assert.strictEqual(dialogue.active, false, 'handleClick in skip region should trigger skip()');
assert.strictEqual(mouseSkipped, true, 'onComplete callback should fire on mouse skip');

// Test handleClick outside skip area (advances text)
dialogue.start('riot_cop', { name: 'Kazuki' }, { name: 'SGT. Vance' }, () => {});
dialogue.handleClick(100, 200, 960, 540);
assert.strictEqual(dialogue.charIndex, dialogue.script.lines[0].text.length, 'handleClick on screen body should advance typewriter');

console.log('  ✓ [PASS] Dialogue state transitions, typewriter display, direct skip(), and mouse handleClick confirmed');

// Test 3: Steam Achievements Engine Catalog
console.log('\n[SECTION 3] Steam Achievements Catalog');
assert.ok(ACHIEVEMENTS.length >= 10, 'Must have at least 10 achievements');
const expectedAchievements = [
  'FIRST_BLOOD',
  'STANCE_BREAKER',
  'CRITICAL_RIPOSTE',
  'ULTIMATE_JUTSU',
  'FATALITY_EXECUTOR',
  'PERFECT_ROUND',
  'FASHION_ICON',
  'BIG_SPENDER',
  'DRAGON_SLAYER',
  'VOID_AWAKENING',
  'CAMPAIGN_CHAMPION'
];

expectedAchievements.forEach(id => {
  const ach = ACHIEVEMENTS.find(a => a.id === id);
  assert.ok(ach, `Achievement ${id} must exist`);
  assert.ok(ach.title, `Achievement ${id} must have title`);
  assert.ok(ach.desc, `Achievement ${id} must have description`);
  assert.ok(ach.icon, `Achievement ${id} must have icon`);
  console.log(`  ✓ [PASS] Achievement "${ach.title}" (${id}) verified: ${ach.desc}`);
});

// Test 4: Achievement Unlock & Toast Animation
console.log('\n[SECTION 4] Achievement Unlocks & Sliding Toast Notification');
const achEngine = new Achievements();
assert.strictEqual(achEngine.isUnlocked('FIRST_BLOOD'), false, 'Initial state should be locked');

const unlocked = achEngine.unlock('FIRST_BLOOD');
assert.strictEqual(unlocked, true, 'Unlock should return true for new achievement');
assert.strictEqual(achEngine.isUnlocked('FIRST_BLOOD'), true, 'Should now be marked unlocked');
assert.strictEqual(achEngine.toastQueue.length, 1, 'Should queue toast notification');

const duplicate = achEngine.unlock('FIRST_BLOOD');
assert.strictEqual(duplicate, false, 'Duplicate unlock must return false');
assert.strictEqual(achEngine.toastQueue.length, 1, 'No duplicate toast should be queued');

// Process toast in update
achEngine.update();
assert.ok(achEngine.activeToast, 'Active toast should be set after update');
assert.strictEqual(achEngine.activeToast.id, 'FIRST_BLOOD', 'Active toast should match unlocked achievement');
assert.ok(achEngine.toastSlide >= 0, 'Toast slide animation initialized');

console.log('  ✓ [PASS] Achievement unlocking, deduplication, and toast lifecycle passed');

console.log('\n==============================================');
console.log('ALL DIALOGUE & ACHIEVEMENT SYSTEMS VERIFIED!');
console.log('==============================================');
