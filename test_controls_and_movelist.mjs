// Test Suite: Beginner Controls Helper HUD & In-Fight Pause Move List
import assert from 'assert';
import { FIGHTER_CATALOG, getFighterCatalogEntry, UNIVERSAL_MECHANICS } from './src/fighters/FighterCatalog.js';
import { HUD } from './src/ui/HUD.js';
import { SettingsManager } from './src/ui/SettingsModal.js';

// Setup Mock DOM & LocalStorage Environment
class MockStorage {
  constructor() { this.store = {}; }
  getItem(key) { return this.store[key] !== undefined ? this.store[key] : null; }
  setItem(key, value) { this.store[key] = String(value); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}
globalThis.localStorage = new MockStorage();

class MockElement {
  constructor(id, tagName = 'div') {
    this.id = id;
    this.tagName = tagName.toUpperCase();
    this.style = {};
    this.classList = new Set();
    this.classList.add = (c) => this.addClass(c);
    this.classList.remove = (c) => this.classList.delete(c);
    this.classList.toggle = (c, force) => {
      if (force !== undefined) {
        if (force) this.addClass(c);
        else this.classList.delete(c);
      } else {
        if (this.classList.has(c)) this.classList.delete(c);
        else this.addClass(c);
      }
    };
    this.children = [];
    this._innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.options = [];
    this.listeners = {};
    this.checked = false;
    this.attrs = {};
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] !== undefined ? this.attrs[k] : null; }
  get innerHTML() { return this._innerHTML || ''; }
  set innerHTML(val) {
    this._innerHTML = val;
    if (val === '') this.children = [];
  }
  addClass(c) {
    Set.prototype.add.call(this.classList, c);
  }
  addEventListener(evt, fn) {
    if (!this.listeners[evt]) this.listeners[evt] = [];
    this.listeners[evt].push(fn);
  }
  dispatchEvent(evt) {
    const list = this.listeners[evt.type] || [];
    list.forEach(fn => fn(evt));
  }
  click() {
    const list = this.listeners['click'] || [];
    list.forEach(fn => fn({ type: 'click' }));
  }
  appendChild(child) {
    this.children.push(child);
    if (this.tagName === 'SELECT' && child.tagName === 'OPTION') {
      this.options.push(child);
    }
  }
  querySelector(sel) {
    if (sel.includes('h2')) return new MockElement('h2', 'h2');
    return null;
  }
  querySelectorAll() {
    return [];
  }
}

const mockDom = {};
const elemIds = [
  'settingsModal', 'tabGeneralBtn', 'tabControlsBtn', 'tabGamepadBtn', 'tabMoveListBtn',
  'tabGeneralContent', 'tabControlsContent', 'tabGamepadContent', 'tabMoveListContent',
  'moveListResumeBtn', 'moveListRestartBtn', 'moveListCharSelectBtn', 'moveListLeaveBtn',
  'mlTabP1Btn', 'mlTabP2Btn', 'moveListFighterSelect',
  'mlFighterBanner', 'mlSpecialsContainer', 'mlUltimatesContainer',
  'masterVol', 'musicVol', 'sfxVol', 'masterVolVal', 'musicVolVal', 'sfxVolVal',
  'gameSpeedSelect', 'aiDiffSelect', 'shakeSelect', 'easyInputsCheck', 'controlsHelperCheck',
  'screenScaleSelect', 'settingsFullscreenBtn', 'settingsCrtBtn', 'settingsHitboxBtn',
  'generalLeaveMatchBtn', 'generalCharSelectBtn', 'closeSettingsBtn', 'closeSettingsX'
];
elemIds.forEach(id => {
  mockDom[id] = new MockElement(id);
});

globalThis.document = {
  getElementById: (id) => mockDom[id] || null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => new MockElement('auto-' + Math.random(), tag),
  addEventListener: () => {}
};
globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {}
};

console.log('--- STARTING CONTROLS HUD & MOVE LIST VERIFICATION ---');

// 1. FIGHTER CATALOG INTEGRITY
console.log('\n[SECTION 1] Fighter Catalog & Universal Mechanics');
assert.ok(Array.isArray(FIGHTER_CATALOG), 'FIGHTER_CATALOG is an array');
assert.ok(FIGHTER_CATALOG.length >= 20, `Catalog has all fighters (count: ${FIGHTER_CATALOG.length})`);

const kazuki = getFighterCatalogEntry('kazuki');
assert.ok(kazuki, 'Kazuki found in catalog');
assert.strictEqual(kazuki.name, 'KAZUKI');
assert.strictEqual(kazuki.specials.length, 3, 'Kazuki has 3 specials');
assert.strictEqual(kazuki.specials[0].name, 'Hadouken');
assert.ok(kazuki.specials[0].cmdKeyboard.includes('Q'), 'Hadouken keyboard prompt includes Q');
assert.ok(kazuki.specials[0].cmdGamepad.includes('RB'), 'Hadouken gamepad prompt includes RB');
assert.ok(kazuki.ultimate, 'Kazuki has ultimate');
assert.ok(kazuki.fatality, 'Kazuki has fatality');

const raven = getFighterCatalogEntry('raven');
assert.ok(raven, 'Raven found in catalog');
assert.strictEqual(raven.specials[0].name, 'Sonic Blade');

const riotCop = getFighterCatalogEntry('riot_cop');
assert.ok(riotCop, 'Boss Sgt. Vance found in catalog');
assert.strictEqual(riotCop.isBoss, true, 'Sgt. Vance is recognized as a boss');
assert.strictEqual(riotCop.specials.length, 3, 'Sgt. Vance has 3 special moves');

const champion = getFighterCatalogEntry('champion');
assert.ok(champion, 'Champion Rex Gannon found in catalog');
assert.strictEqual(champion.isBoss, true, 'Rex Gannon is recognized as a boss');

assert.ok(UNIVERSAL_MECHANICS.movement.length >= 4, 'Universal movement mechanics defined');
assert.ok(UNIVERSAL_MECHANICS.normals.length >= 4, 'Universal attack normals defined');
assert.ok(UNIVERSAL_MECHANICS.defense.length >= 4, 'Universal defense mechanics defined');
console.log('  ✓ [PASS] Catalog entries and universal mechanics integrity verified');

// 2. HUD BEGINNER CONTROLS HELPER TOGGLE
console.log('\n[SECTION 2] HUD Beginner Controls Helper Overlay');
globalThis.localStorage.clear();
const hud = new HUD();
assert.strictEqual(hud.showControlsHelper, true, 'Controls helper defaults to true for beginners');

hud.toggleControlsHelper();
assert.strictEqual(hud.showControlsHelper, false, 'toggleControlsHelper toggles to false');
assert.strictEqual(globalThis.localStorage.getItem('final_impact_controls_helper'), 'false', 'Persistence to localStorage verified');

hud.toggleControlsHelper();
assert.strictEqual(hud.showControlsHelper, true, 'toggleControlsHelper toggles back to true');
assert.strictEqual(globalThis.localStorage.getItem('final_impact_controls_helper'), 'true', 'Persistence updated in localStorage');
console.log('  ✓ [PASS] Controls helper default, toggle, and persistence verified');

// 3. SETTINGS MODAL & MOVE LIST
console.log('\n[SECTION 3] Settings Modal Pause & Move List');
let restartCalled = false;
let leaveTarget = null;

const mockGame = {
  screen: 'FIGHT',
  f1: { id: 'kazuki', name: 'KAZUKI' },
  f2: { id: 'raven', name: 'RAVEN' },
  hud: hud,
  startMatch: (isRematch) => { if (isRematch) restartCalled = true; },
  leaveGame: (target) => { leaveTarget = target; }
};

const settings = new SettingsManager(mockGame);
settings.initDomListeners();

// Test: open in fight automatically opens movelist
settings.open();
assert.strictEqual(settings.isOpen, true, 'Settings modal is open');
assert.strictEqual(settings.currentTab, 'movelist', 'Automatically defaulted to movelist tab during FIGHT');

// Verify Move List rendered for Kazuki
const specialsContainer = mockDom['mlSpecialsContainer'];
assert.ok(specialsContainer.children.length === 3, 'Specials container populated with 3 moves for Kazuki');

// Switch slot to P2 (Raven)
settings.selectMoveListSlot(2);
assert.strictEqual(settings.moveListPlayerSlot, 2, 'Switched to slot 2');
assert.ok(specialsContainer.children.length === 3, 'Specials container populated with 3 moves for Raven');

// Test selecting a campaign boss (Sgt. Vance)
settings.selectMoveListFighter('riot_cop');
assert.strictEqual(settings.moveListPlayerSlot, 0, 'Custom slot selection set to 0');
assert.strictEqual(settings.moveListFighterId, 'riot_cop', 'Fighter ID set to riot_cop');
assert.ok(specialsContainer.children.length === 3, 'Specials container populated with 3 moves for Sgt. Vance');

// Test: Resume button closes modal
const resumeBtn = mockDom['moveListResumeBtn'];
resumeBtn.click();
assert.strictEqual(settings.isOpen, false, 'Resume button closes the modal');

// Test: Restart button restarts match
settings.open();
const restartBtn = mockDom['moveListRestartBtn'];
restartBtn.click();
assert.strictEqual(settings.isOpen, false, 'Restart button closes the modal');
assert.strictEqual(restartCalled, true, 'Restart button triggered game.startMatch(true)');

// Test: Fighter select leaves to character select
settings.open();
const csBtn = mockDom['moveListCharSelectBtn'];
csBtn.click();
assert.strictEqual(leaveTarget, 'CHAR_SELECT', 'Char select button triggered leaveGame("CHAR_SELECT")');

// Test: Controls helper checkbox sync
const helperCheck = mockDom['controlsHelperCheck'];
helperCheck.checked = false;
helperCheck.dispatchEvent({ type: 'change' });
assert.strictEqual(settings.settings.controlsHelper, false, 'controlsHelper setting updated to false');
assert.strictEqual(hud.showControlsHelper, false, 'hud.showControlsHelper updated to false');

console.log('  ✓ [PASS] Pause Move List tab, resume, restart, and controls helper sync verified');

console.log('\n==============================================');
console.log('ALL CONTROLS HUD & MOVE LIST TESTS PASSED! (3/3)');
console.log('==============================================');
