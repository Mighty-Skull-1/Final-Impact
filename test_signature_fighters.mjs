// Test Suite: Signature fighters (ECHO, GLITCH, TEMPO, ATLAS) and the buildable arena
import assert from 'assert';

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

const { FIGHTER_STATE: S, ATTACK_HEIGHT, HIT_TYPE, GROUND_Y } = await import('./src/engine/Constants.js');
const { CombatDirector, scrambleInput } = await import('./src/combat/CombatSystem.js');
const { HitboxSystem } = await import('./src/engine/Hitbox.js');
const { arena } = await import('./src/engine/Arena.js');
const { Kazuki } = await import('./src/fighters/Kazuki.js');
const { Raven } = await import('./src/fighters/Raven.js');
const { Kagura } = await import('./src/fighters/Kagura.js');
const { Fang } = await import('./src/fighters/Fang.js');
const { Zephyr } = await import('./src/fighters/Zephyr.js');
const { Colossus } = await import('./src/fighters/Colossus.js');
const { ROSTER_CLASSES } = await import('./src/fighters/RosterFighters.js');
const { Echo, Glitch, Tempo, Atlas, BEAT_FRAMES, SIGNATURE_CLASSES } = await import('./src/fighters/Signature.js');
const { FIGHTER_CATALOG } = await import('./src/fighters/FighterCatalog.js');
const { FIGHTER_DESIGNS } = await import('./src/graphics/FighterDesigns.js');
const { ENDINGS } = await import('./src/modes/Endings.js');
const { AIController } = await import('./src/engine/AI.js');

let passed = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); passed++; console.log(`  ✓ [PASS] ${msg}`); };

const IM = {
  peekAction: () => null, consumeAction: noop, consumeBuffer: noop,
  checkDP: () => false, checkQCF: () => false, checkQCB: () => false,
  checkChargeBackFwd: () => false, checkChargeDownUp: () => false, easyInputs: false
};
const blank = () => ({
  up: false, down: false, left: false, right: false, fwd: false, back: false, dashFwd: false, dashBack: false,
  lp: false, hp: false, lk: false, hk: false, sp1: false, sp2: false, sp3: false, dirty: false,
  lpJust: false, hpJust: false, lkJust: false, hkJust: false, sp1Just: false, sp2Just: false, sp3Just: false,
  dirtyJust: false, ultimateJust: false, throwJust: false
});
const press = (k) => { const s = blank(); s[k] = true; s[k + 'Just'] = true; if (k === 'ultimate') s.ultimateJust = true; return s; };

function makeGame(A, B, ax = 300, bx = 380) {
  const game = {
    hud: { triggerShake: noop, setCombo: noop, showDirtyBanner: noop },
    settingsManager: { settings: { screenShake: 'full' } },
    achievements: { unlock: noop },
    triggerCameraZoom: noop,
    allFighters: [],
    projectiles: [],
    getAIFor: () => ({ profile: { techChance: 0 } })
  };
  game.combat = new CombatDirector(game);
  const a = new A({ x: ax, facingRight: true, playerNum: 1 });
  const b = new B({ x: bx, facingRight: false, playerNum: 2, isCpu: true });
  for (const f of [a, b]) {
    f.team = f.playerNum === 1 ? 1 : 2;
    f.spawnProjectile = (p) => game.projectiles.push(p);
    f.combatHit = (t, d, p) => game.combat.applyHit(f, t, d, p || { x: t.x + 40, y: t.y - 48 });
    f.combatHitOpts = (t, d, p, o) => game.combat.applyHit(f, t, d, p || { x: t.x + 40, y: t.y - 48 }, o || {});
    const own = f.handleInput.bind(f);
    f.handleInput = (st, im, opp) => {
      const res = game.combat.preInput(f, st, im, opp);
      if (res.consumed) return;
      own(res.input, res.manager || im, opp);
    };
  }
  game.allFighters = [a, b];
  arena.clear();
  arena.game = game;
  game.combat.resetRound();
  game.combat.introTimer = 0;
  return { game, a, b };
}

function step(game) {
  if (game.combat.isFrozen()) { game.combat.tickFreeze(); return; }
  arena.update();
  const [a, b] = game.allFighters;
  for (const f of game.allFighters) {
    if (!f.isDead || f.state === S.KNOCKDOWN) { f.update(f === a ? b : a, 960); arena.resolveWalls(f); }
  }
  for (const att of game.allFighters) {
    if (att.activeHitbox && !att.hasHitThisAttack && !att.isDead) {
      const def = att === a ? b : a;
      if (def.isDead) continue;
      const hr = HitboxSystem.checkAttackHit(att, def);
      if (hr) { att.hasHitThisAttack = true; game.combat.resolveMelee(att, def, hr); }
    }
  }
  game.combat.postUpdate();
  for (let i = game.projectiles.length - 1; i >= 0; i--) {
    const p = game.projectiles[i];
    p.update();
    if (p.active && arena.blockProjectile(p)) p.destroy();
    if (!p.active) { game.projectiles.splice(i, 1); continue; }
    const tgt = p.owner === a ? b : a;
    if (p.hitTargets && p.hitTargets.has(tgt)) continue;
    if (tgt.getGlobalHurtboxes().some(h => HitboxSystem.testOverlap(p.getHitbox(), h))) {
      if (p.pierce) { p.hitTargets = p.hitTargets || new Set(); p.hitTargets.add(tgt); } else p.destroy();
      game.combat.resolveProjectile(p, tgt);
    }
  }
}
const run = (game, n) => { for (let i = 0; i < n; i++) step(game); };
const settle = (game, f, max = 240) => { for (let i = 0; i < max && f.state !== S.IDLE; i++) step(game); };
function act(game, f, key) {
  const [a, b] = game.allFighters;
  f.handleInput(press(key), IM, f === a ? b : a);
}
function idle(f) { f.changeState(S.IDLE, true); f.hitStun = 0; f.blockStun = 0; f.isInvincible = false; f.vx = 0; f.vy = 0; f.y = GROUND_Y; f.isGrounded = true; }

console.log('--- STARTING SIGNATURE FIGHTER VERIFICATION ---\n');

console.log('[SECTION 1] Roster wiring');
{
  for (const id of ['echo', 'glitch', 'tempo', 'atlas']) {
    ok(!!SIGNATURE_CLASSES[id] && !!FIGHTER_DESIGNS[id] && !!ENDINGS[id] && FIGHTER_CATALOG.some(c => c.id === id), `${id.toUpperCase()} has a class, design, ending and move list entry`);
  }
  const ids = FIGHTER_CATALOG.map(c => c.id);
  ok(ids[ids.length - 2] === 'mighty' && ids[ids.length - 1] === 'endless_dragon', 'M1GHTY and the Dragon stay at the end of the roster');
}

console.log('\n[SECTION 2] Every special and ultimate runs and recovers');
{
  for (const C of [Echo, Glitch, Tempo, Atlas]) {
    for (const key of ['sp1', 'sp2', 'sp3', 'ultimate']) {
      const { game, a, b } = makeGame(C, Kazuki, 300, 420);
      b.health = b.maxHealth = 100000;
      run(game, 130); // build some history for ECHO
      a.superMeter = 100;
      idle(a);
      act(game, a, key);
      const started = a.state !== S.IDLE || key === 'sp1';
      run(game, 260);
      settle(game, a, 400);
      ok(started && a.state === S.IDLE && Number.isFinite(a.x) && !a.isInvincible, `${a.name} ${key.toUpperCase()} starts and returns to neutral`);
    }
  }
}

console.log('\n[SECTION 3] ECHO');
{
  const { game, a, b } = makeGame(Echo, Raven, 300, 360);
  b.health = b.maxHealth = 100000;
  b.isHoldingBack = false;
  act(game, a, 'hp');
  run(game, 40);
  const afterHp = b.health;
  ok(afterHp < 100000, `Heavy punch lands (${100000 - afterHp})`);
  idle(a); idle(b);
  a.x = 300; b.x = 360;
  run(game, 30);
  a.echoCd = 0;
  act(game, a, 'sp1');
  ok(!!a.ghost && a.state === S.SPECIAL_1, 'Echo Step spawns a ghost replaying her last 2 seconds');
  const hp0 = b.health;
  run(game, 130);
  ok(b.health < hp0, `The ghost re-lands her earlier hit (${hp0 - b.health} damage)`);
  ok(a.ghost === null && a.echoCd > 0, 'Ghost expires and Echo Step recharges');

  // Déjà Vu repeats
  idle(a); idle(b); a.x = 300; b.x = 350; run(game, 60);
  const h1 = b.health;
  act(game, a, 'sp2');
  run(game, 20);
  const firstHit = h1 - b.health;
  run(game, 160);
  ok(firstHit > 0 && (h1 - b.health) > firstHit, `Déjà Vu hits, then the hit echoes (${firstHit} → ${h1 - b.health})`);

  // Time Collapse replays dealt damage and restores health
  idle(a); idle(b); run(game, 200);
  a.health = 900; run(game, 5);
  a.dealtLog = [{ f: a.clock - 10, dmg: 120 }, { f: a.clock - 5, dmg: 80 }];
  a.health = 600;
  a.superMeter = 100;
  const h2 = b.health;
  idle(b);
  act(game, a, 'ultimate');
  run(game, 80); settle(game, a);
  ok(h2 - b.health >= 140, `Time Collapse replays her recent hits (${h2 - b.health} damage)`);
  ok(a.health > 600, `Time Collapse rewinds lost health (${a.health})`);
}

console.log('\n[SECTION 4] GLITCH');
{
  const { game, a, b } = makeGame(Glitch, Kazuki, 300, 400);
  b.health = b.maxHealth = 100000;
  // Kazuki throws a Hadouken
  idle(b);
  b.handleInput(press('sp1'), IM, a);
  ok(b.lastSpecialSlot === 0 || b.state === S.SPECIAL_1, 'Opponent uses a special');
  run(game, 4);
  ok(b.lastSpecialSlot === 1, 'The combat director remembers the opponent\'s last special');
  run(game, 60); game.projectiles.length = 0; idle(a); idle(b); a.x = 300; b.x = 400;
  a.health = a.maxHealth;
  act(game, a, 'sp2');
  run(game, 30);
  ok(a.stolen && a.stolen.cls === Kazuki && a.stolen.slot === 1, `Ctrl+C copies "${a.stolen && a.stolen.name}"`);
  settle(game, a); idle(b);
  act(game, a, 'sp3');
  ok(a.state === S.SPECIAL_1 && !!a.stolenRun, 'Ctrl+V runs the copied move');
  run(game, 14);
  ok(game.projectiles.some(p => p.owner === a && p.type === 'hadouken'), 'GLITCH fires a Hadouken of his own');
  settle(game, a);
  ok(!a.stolenRun && !Object.prototype.hasOwnProperty.call(a, 'updateState'), 'After the move GLITCH is fully himself again');
  ok(!!a.stolen, 'The copy is kept for reuse');
  // Getting hit wipes the copy
  a.takeHit({ damage: 10, hitStun: 10, blockStun: 5, pushback: 1, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.LIGHT }, 1);
  ok(a.stolen === null, 'Taking a hit wipes the copied move');

  // Steal + paste from every fighter on the roster
  const all = { kazuki: Kazuki, raven: Raven, kagura: Kagura, fang: Fang, zephyr: Zephyr, colossus: Colossus, ...ROSTER_CLASSES, echo: Echo, tempo: Tempo, atlas: Atlas };
  let okCount = 0; const fails = [];
  for (const [id, C] of Object.entries(all)) {
    for (const slot of [1, 2, 3]) {
      const g2 = makeGame(Glitch, C, 300, 400);
      g2.b.health = g2.b.maxHealth = 100000;
      g2.a.health = g2.a.maxHealth = 100000;
      run(g2.game, 140);
      g2.b.lastSpecialSlot = slot;
      g2.a.stealFrom(g2.b);
      idle(g2.a);
      try {
        g2.a.pasteStolen(g2.b);
        run(g2.game, 240); settle(g2.game, g2.a, 300);
        const clean = !g2.a.stolenRun && !Object.prototype.hasOwnProperty.call(g2.a, 'updateState') && Number.isFinite(g2.a.reachBonus || 0);
        if (clean && g2.a.state === S.IDLE) okCount++; else fails.push(`${id}:${slot}(${g2.a.state})`);
      } catch (e) { fails.push(`${id}:${slot} threw ${e.message}`); }
    }
  }
  ok(fails.length === 0, `Copy/paste works for every special of every fighter (${okCount} moves)${fails.length ? ' FAILS: ' + fails.join(', ') : ''}`);

  // Blue Screen scrambles controls
  const st = blank(); st.fwd = true; st.lpJust = true; st.lp = true; st.sp1Just = true;
  const sc = scrambleInput(st);
  ok(sc.back && !sc.fwd && sc.lkJust && !sc.lpJust && sc.sp3Just && !sc.sp1Just, 'Scrambled input swaps directions, punches/kicks and SP1/SP3');
  const g3 = makeGame(Glitch, Raven, 300, 380);
  g3.b.health = 100000;
  g3.a.superMeter = 100;
  act(g3.game, g3.a, 'ultimate');
  run(g3.game, 160);
  ok(g3.b.scrambleTimer > 0, `Blue Screen scrambles the victim's controls (${g3.b.scrambleTimer} frames left)`);
}

console.log('\n[SECTION 5] TEMPO');
{
  const { game, a, b } = makeGame(Tempo, Raven, 300, 360);
  b.health = b.maxHealth = 100000;
  while (Tempo.beatOffset() !== 0) step(game);
  idle(b);
  act(game, a, 'hp');
  ok(a.onBeatMove && a.judge && a.judge.text === 'PERFECT', 'A move started on the beat is judged PERFECT');
  run(game, 30);
  ok(a.level === 2, `On-beat hit raises the multiplier to x${a.level}`);
  settle(game, a); idle(b); a.x = 300; b.x = 360;
  while (Tempo.beatOffset() !== 12) step(game);
  act(game, a, 'lp');
  ok(!a.onBeatMove && a.level === 1, 'An off-beat move resets the multiplier');
  // Build to x4 and check the damage bonus
  a.level = 4; run(game, 1);
  ok(Math.abs(a.damageMult - a.baseDamage * 1.36) < 0.001, `x4 multiplier = +36% damage (${a.damageMult.toFixed(2)})`);
  a.takeHit({ damage: 20, hitStun: 10, blockStun: 5, pushback: 1, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.LIGHT }, 1);
  ok(a.level === 1, 'Getting hit drops the beat');
  const ai = new AIController('hard');
  ok(ai.holdForBeat(a, ['hp'], {}) !== undefined, 'CPU can wait for the beat before attacking');
}

console.log('\n[SECTION 6] ATLAS & the buildable arena');
{
  const { game, a, b } = makeGame(Atlas, Kazuki, 300, 600);
  act(game, a, 'sp1');
  run(game, 20);
  const wall = arena.walls[0];
  ok(!!wall && wall.owner === a, 'Raise Wall builds a wall in front of ATLAS');
  // Kazuki walks into the wall and stops
  idle(b); b.x = 480;
  for (let i = 0; i < 40; i++) { const s = blank(); s.fwd = true; b.handleInput(s, IM, a); step(game); }
  ok(b.x + 28 >= wall.x + wall.w - 1, `Walls block movement (Kazuki stopped at x=${Math.round(b.x)})`);
  // Projectiles break on it
  idle(b); b.projectileCooldown = 0; b.activeProjectileCount = 0;
  b.handleInput(press('sp1'), IM, a);
  run(game, 40);
  ok(wall.hp < 3 && game.projectiles.length === 0, 'Projectiles are stopped by the wall');
  // Platform: build one and land on it
  const g2 = makeGame(Atlas, Kazuki, 300, 700);
  act(g2.game, g2.a, 'sp2');
  run(g2.game, 12);
  const plat = arena.platforms[0];
  ok(!!plat, `Scaffold builds a platform (top y=${plat && plat.top})`);
  settle(g2.game, g2.a);
  g2.a.x = plat.x + plat.w / 2 - 40;
  const j = blank(); j.up = true;
  g2.a.handleInput(j, IM, g2.b);
  run(g2.game, 60);
  ok(Math.abs(g2.a.y - plat.top) < 1 && g2.a.isGrounded, `Fighters can land and stand on platforms (y=${Math.round(g2.a.y)})`);
  // Hold down to drop through
  for (let i = 0; i < 40; i++) { const d = blank(); d.down = true; g2.a.handleInput(d, IM, g2.b); step(g2.game); }
  ok(g2.a.y === GROUND_Y, 'Holding DOWN drops through the platform');
  // Wall splat
  const g3 = makeGame(Atlas, Raven, 300, 380);
  g3.b.health = g3.b.maxHealth = 100000;
  arena.addWall(g3.a, 480); arena.walls[0].rise = 1;
  idle(g3.b);
  act(g3.game, g3.a, 'sp3');
  run(g3.game, 30);
  ok(arena.walls.length === 0 && 100000 - g3.b.health >= 150, `Wrecking Swing into a wall: WALL SPLAT (${100000 - g3.b.health} damage, wall shattered)`);
  // Ceiling drop
  const g4 = makeGame(Atlas, Raven, 300, 500);
  g4.b.health = g4.b.maxHealth = 100000;
  g4.a.superMeter = 100;
  act(g4.game, g4.a, 'ultimate');
  run(g4.game, 120);
  ok(100000 - g4.b.health >= 200, `Ceiling Drop crushes a foe who stays under it (${100000 - g4.b.health} damage)`);
}

console.log('\n==============================================');
console.log(`ALL SIGNATURE FIGHTER TESTS PASSED! (${passed})`);
console.log('==============================================');
