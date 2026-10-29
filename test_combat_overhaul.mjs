// Test Suite: Combat Overhaul (combo scaling, counter hits, throws & tech, Combo Breaker,
// Dirty Tactic cooldown, block safety of specials, cinematic ultimates, CPU AI profiles)
import assert from 'assert';

// ---- Minimal browser mocks (canvas calls are swallowed by a recursive proxy) ----
const noop = () => {};
const ctxProxy = new Proxy(function () {}, {
  get: (t, k) => (k === 'canvas' ? {} : (k === 'measureText' ? () => ({ width: 10 }) : ctxProxy)),
  set: () => true,
  apply: () => ctxProxy
});
class MockStorage {
  constructor() { this.store = {}; }
  getItem(k) { return this.store[k] !== undefined ? this.store[k] : null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
}
globalThis.localStorage = new MockStorage();
const listeners = {};
globalThis.window = {
  addEventListener: (n, cb) => { (listeners[n] = listeners[n] || []).push(cb); },
  removeEventListener: noop,
  dispatchEvent: (e) => { (listeners[e.type] || []).forEach(cb => cb(e)); return true; }
};
globalThis.CustomEvent = class { constructor(type, opts = {}) { this.type = type; this.detail = opts.detail; } };
globalThis.document = {
  createElement: () => ({ width: 0, height: 0, getContext: () => ctxProxy, style: {} }),
  getElementById: () => null,
  addEventListener: noop,
  querySelector: () => null,
  querySelectorAll: () => [],
  readyState: 'complete'
};
if (typeof navigator === 'undefined') globalThis.navigator = { getGamepads: () => [] };

const { FIGHTER_STATE, HIT_TYPE, ATTACK_HEIGHT } = await import('./src/engine/Constants.js');
const { CombatDirector, COMBAT_TUNING } = await import('./src/combat/CombatSystem.js');
const { Kazuki } = await import('./src/fighters/Kazuki.js');
const { Raven } = await import('./src/fighters/Raven.js');
const { AIController } = await import('./src/engine/AI.js');

let passed = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); passed++; console.log(`  ✓ [PASS] ${msg}`); };

// A tiny fake "game" the director can talk to
function makeGame() {
  const game = {
    hud: { triggerShake: noop, setCombo: noop, showDirtyBanner: noop },
    settingsManager: { settings: { screenShake: 'full' } },
    achievements: { unlock: noop },
    triggerCameraZoom: noop,
    allFighters: [],
    getAIFor: () => ({ profile: { techChance: 0 } })
  };
  game.combat = new CombatDirector(game);
  return game;
}
function makePair() {
  const game = makeGame();
  const a = new Kazuki({ x: 300, facingRight: true, playerNum: 1 });
  const b = new Raven({ x: 360, facingRight: false, playerNum: 2, isCpu: true });
  a.damageMult = 1; b.damageMult = 1; // neutral tuning for exact numbers
  game.allFighters = [a, b];
  game.combat.resetRound();
  game.combat.introTimer = 0;
  [a, b].forEach(f => { f.combatHit = (t, d, p) => game.combat.applyHit(f, t, d, p || { x: 0, y: 0 }); });
  return { game, a, b };
}
const jab = () => ({ damage: 40, hitStun: 14, blockStun: 10, pushback: 4, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.LIGHT });

console.log('--- STARTING COMBAT OVERHAUL VERIFICATION ---\n');

// 1. Combo scaling + hit-stun decay
console.log('[SECTION 1] Combo damage scaling');
{
  const { game, a, b } = makePair();
  const hp0 = b.health;
  game.combat.applyHit(a, b, jab(), { x: 0, y: 0 });
  const first = hp0 - b.health;
  ok(first === 40, `First hit deals full damage (${first})`);
  let last = first;
  for (let i = 0; i < 9; i++) {
    const before = b.health;
    game.combat.applyHit(a, b, jab(), { x: 0, y: 0 });
    last = before - b.health;
  }
  ok(b.comboHits === 10, 'Combo counter tracks 10 consecutive hits');
  ok(last <= Math.ceil(40 * COMBAT_TUNING.scaleFloor) + 1 && last >= Math.floor(40 * COMBAT_TUNING.scaleFloor), `10th hit is scaled to the floor (${last} dmg)`);
  ok(b.hitStun < 14, `Hit-stun decays in long combos (${b.hitStun}f)`);
  ok(game.combat.freeze > 0, 'Hits trigger a screen-wide hit-stop');
}

// 2. Counter hits
console.log('\n[SECTION 2] Counter hits');
{
  const { game, a, b } = makePair();
  b.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH, true);
  b.stateTimer = 3; // in start-up
  const hp0 = b.health;
  game.combat.applyHit(a, b, jab(), { x: 0, y: 0 });
  ok(hp0 - b.health === 48, `Counter hit deals +20% (${hp0 - b.health})`);
}

// 3. Throws, throw tech, throw protection
console.log('\n[SECTION 3] Throws & tech');
{
  const { game, a, b } = makePair();
  b.x = a.x + 50;
  const res = game.combat.preInput(a, { lpJust: true, lk: true }, null, b);
  ok(res.consumed && a.state === FIGHTER_STATE.THROW && b.state === FIGHTER_STATE.THROWN, 'LP+LK up close starts a throw');
  const hp0 = b.health;
  for (let i = 0; i < 40; i++) game.combat.updateThrows();
  ok(b.health < hp0 && b.state === FIGHTER_STATE.KNOCKDOWN, `Throw lands and knocks down (${hp0 - b.health} dmg)`);
}
{
  const { game, a, b } = makePair();
  b.x = a.x + 50;
  game.combat.preInput(a, { lkJust: true, lp: true }, null, b);
  for (let i = 0; i < 3; i++) game.combat.updateThrows();
  const hp0 = b.health;
  game.combat.preInput(b, { lpJust: true, lk: true }, null, a);
  ok(b.health === hp0 && a.state !== FIGHTER_STATE.THROW && b.state !== FIGHTER_STATE.THROWN, 'Pressing LP+LK while grabbed techs the throw');
}
{
  const { game, a, b } = makePair();
  b.x = a.x + 200;
  const res = game.combat.preInput(a, { lpJust: true, lk: true }, null, b);
  ok(!res.consumed && a.state !== FIGHTER_STATE.THROW, 'Throw input out of range falls through to a normal attack');
  b.x = a.x + 50;
  b.blockStun = 8;
  const res2 = game.combat.preInput(a, { lpJust: true, lk: true }, null, b);
  ok(!res2.consumed, 'Opponents in block-stun cannot be thrown');
}

// 4. Combo Breaker
console.log('\n[SECTION 4] Combo Breaker');
{
  const { game, a, b } = makePair();
  game.combat.applyHit(a, b, jab(), { x: 0, y: 0 });
  game.combat.applyHit(a, b, jab(), { x: 0, y: 0 });
  b.superMeter = 60;
  const res = game.combat.preInput(b, { dirtyJust: true }, null, a);
  ok(res.consumed && b.superMeter === 10, 'Breaker spends 50% meter');
  ok(b.hitStun === 0 && b.isInvincible && a.hitStun > 0, 'Breaker frees the victim and staggers the attacker');
  const { game: g2, a: a2, b: b2 } = makePair();
  g2.combat.applyHit(a2, b2, jab(), { x: 0, y: 0 });
  b2.superMeter = 20;
  const res3 = g2.combat.preInput(b2, { dirtyJust: true }, null, a2);
  ok(!res3.consumed, 'Breaker needs at least 50% meter');
}

// 5. Dirty Tactic cooldown + stun cap
console.log('\n[SECTION 5] Dirty Tactic cooldown');
{
  const { game, a, b } = makePair();
  a.changeState(FIGHTER_STATE.DIRTY_TACTIC, true);
  game.combat.postUpdate();
  ok(a.dirtyCooldown >= COMBAT_TUNING.dirtyCooldown - 1, `Using it starts a ${COMBAT_TUNING.dirtyCooldown}f cooldown`);
  const res = game.combat.preInput(a, { dirtyJust: true, dirty: true }, null, b);
  ok(res.input.dirtyJust === false, 'Dirty input is stripped while recharging');
  game.combat.applyHit(a, b, { damage: 50, hitStun: 70, stunFrames: 70, height: ATTACK_HEIGHT.UNBLOCKABLE, hitType: HIT_TYPE.DIRTY_STUN }, { x: 0, y: 0 });
  ok(b.blindTimer <= COMBAT_TUNING.dirtyMaxStun, `Blind stun is capped at ${COMBAT_TUNING.dirtyMaxStun}f (${b.blindTimer})`);
}

// 6. Specials are punishable on block
console.log('\n[SECTION 6] Block safety');
{
  const { game, a, b } = makePair();
  b.isHoldingBack = true;
  a.changeState(FIGHTER_STATE.SPECIAL_2, true);
  a.isGrounded = false; a.vy = -10;
  const r = game.combat.applyHit(a, b, { damage: 130, hitStun: 30, blockStun: 18, pushback: 6, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.KNOCKDOWN }, { x: 0, y: 0 });
  ok(r === 'blocked' && b.blockStun <= 7, `Blocked rising uppercut leaves only ${b.blockStun}f block-stun (punishable)`);
}

// 7. Cinematic ultimate
console.log('\n[SECTION 7] Cinematic ultimate');
{
  const { game, a, b } = makePair();
  b.x = a.x + 60;
  a.superMeter = 100;
  a.startUltimate(b);
  const hp0 = b.health;
  let locked = false;
  for (let i = 0; i < 200 && a.state === FIGHTER_STATE.ULTIMATE; i++) {
    a.update(b, 960);
    b.update(a, 960);
    if (a.activeHitbox && !a.hasHitThisAttack) {
      const hb = a.getGlobalHitbox();
      const hurt = b.getGlobalHurtboxes();
      if (hurt.some(h => hb.x < h.x + h.w && hb.x + hb.w > h.x && hb.y < h.y + h.h && hb.y + hb.h > h.y)) {
        a.hasHitThisAttack = true;
        game.combat.applyHit(a, b, a.currentAttackData, { x: 0, y: 0 });
      }
    }
    if (a.ult && a.ult.phase === 'lock') locked = true;
    if (game.combat.freeze > 0) game.combat.freeze = 0;
  }
  ok(locked, 'Ultimate lunge locks the opponent into the cinematic flurry');
  ok(hp0 - b.health >= 280 && hp0 - b.health <= 380, `Ultimate deals heavy but scaled damage (${hp0 - b.health})`);
  ok(a.state === FIGHTER_STATE.IDLE && !a.isInvincible, 'Fighter recovers to neutral after the ultimate');
}

// 8. AI profiles
console.log('\n[SECTION 8] CPU AI');
{
  const ai = new AIController('nightmare');
  const easy = new AIController('easy');
  ok(ai.profile.block > easy.profile.block && ai.profile.reaction < easy.profile.reaction, 'Nightmare blocks more and reacts faster than Easy');
  const camp1 = new AIController('normal'); camp1.setDifficulty('campaign', 1);
  const camp8 = new AIController('normal'); camp8.setDifficulty('campaign', 8);
  ok(camp8.profile.block > camp1.profile.block, 'Campaign AI ramps up stage by stage');
  const dummy = new AIController('normal'); dummy.setDifficulty('dummy');
  const { a, b } = makePair();
  const st = dummy.update(b, a);
  ok(!st.lpJust && !st.hpJust && !st.fwd && !st.back, 'Training dummy stays passive');
  const s2 = ai.update(b, a);
  ok(typeof s2 === 'object' && 'throwJust' in s2 && 'ultimateJust' in s2, 'AI emits a complete input state');
}

// 9. Roster kits
console.log('\n[SECTION 9] Unique roster kits');
{
  const { ROSTER_CLASSES, ROSTER_KITS } = await import('./src/fighters/RosterFighters.js');
  ok(Object.keys(ROSTER_KITS).length === 12, 'All 12 roster fighters have a unique kit');
  const game = makeGame();
  const glacier = new ROSTER_CLASSES.glacier({ x: 300, facingRight: true, playerNum: 1 });
  const b = new Raven({ x: 360, facingRight: false, playerNum: 2, isCpu: true });
  game.allFighters = [glacier, b]; game.combat.resetRound();
  game.combat.applyHit(glacier, b, { damage: 60, hitStun: 20, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY, effect: 'chill' }, { x: 0, y: 0 });
  game.combat.postUpdate();
  ok(b.chillTimer > 0 && b.walkSpeed < b._baseWalk, 'Chill slows the victim');
  const warden = new ROSTER_CLASSES.warden({ x: 300, facingRight: true, playerNum: 2 });
  ok(warden.damageTakenMult === 0.9 && warden.chipTakenMult === 0, 'Warden passive: damage reduction & no chip');
  const convict = new ROSTER_CLASSES.convict({ x: 300, facingRight: true, playerNum: 1 });
  convict.changeState(FIGHTER_STATE.SPECIAL_3, true);
  convict.stateTimer = 2;
  ok(convict.takeHit(jab(), 1) === 'armored', 'Convict Cell Rush absorbs a hit with armour');
}

// 10. Daily challenges
console.log('\n[SECTION 10] Daily challenges');
{
  const { DailyChallenges, CHALLENGE_TEMPLATES } = await import('./src/modes/Challenges.js');
  const { EconomyManager } = await import('./src/shop/SkinCatalog.js');
  const dc = new DailyChallenges();
  const list = dc.getList();
  ok(list.length === 3 && new Set(list.map(c => c.id)).size === 3, 'Three distinct challenges are rolled for today');
  const again = new DailyChallenges().getList().map(c => c.id).join();
  ok(again === list.map(c => c.id).join(), 'Same challenges for the whole day (seeded by date)');
  const c = list[0];
  const coins0 = EconomyManager.getCoins();
  for (let i = 0; i < c.target; i++) dc.record(c.event, { fighter: c.fighter });
  ok(dc.getList()[0].done && EconomyManager.getCoins() === coins0 + c.reward, `Completing "${c.text}" pays ${c.reward} coins`);
  ok(CHALLENGE_TEMPLATES.length >= 10, 'Challenge pool has 10+ templates');
}

console.log(`\n==============================================\nALL COMBAT OVERHAUL TESTS PASSED! (${passed})\n==============================================`);
