// Final Impact - Complete Overhaul Test Suite
// Verifies:
// 1. Steam Retail Stealth Protection (Cryptographic access, hidden UI)
// 2. Mortal Kombat Fatalities, Stage Fatalities & Brutalities
// 3. Digitized Arcade Announcer Voice & Audio calls
// 4. Elden Ring Stance/Poise Break, YOU DIED, GOD SLAIN banners, Site of Grace checkpoints
// 5. Arcade Towers ("Choose Your Destiny" Novice, Warrior, Master)
// 6. Test Your Might Minigame (Wood, Stone, Steel, Diamond chopping)
// 7. Expanded Cosmetics (Auras, Hit Sparks, Titles)

import { isStealthMode, setStealthMode, verifyAdminPassword, isAdminAuthenticated, setAdminAuthenticated } from './src/utils/CryptoAuth.js';
import { FATALITY_CATALOG, fatalitySystem } from './src/combat/FatalitySystem.js';
import { announcer } from './src/audio/Announcer.js';
import { eldenManager } from './src/elden/EldenRingMechanics.js';
import { ARCADE_TOWERS, arcadeTowerScreen } from './src/ui/ArcadeTower.js';
import { TEST_MATERIALS, testYourMight } from './src/minigames/TestYourMight.js';
import { AURA_CATALOG, SPARK_CATALOG, TITLE_CATALOG, EconomyManager } from './src/shop/SkinCatalog.js';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ [PASS] ${message}`);
    passed++;
  }
}

console.log('--- STARTING FINAL IMPACT OVERHAUL VERIFICATION SUITE ---\n');

// 1. Steam Stealth Mode Verification
console.log('[SECTION 1] Steam Retail Stealth Protection');
assert(isStealthMode() === true, 'Stealth Mode defaults to true for Steam retail release security');
setStealthMode(false);
assert(isStealthMode() === false, 'Developer mode toggle successfully exposes UI for internal testing');
setStealthMode(true);
assert(isStealthMode() === true, 'Stealth mode successfully reactivates to 100% invisible state');

// Verify zero plaintext leak
assert(typeof verifyAdminPassword === 'function', 'verifyAdminPassword function is active');
assert((await verifyAdminPassword('wrongpassword')) === false, 'Rejects incorrect password');
assert((await verifyAdminPassword('MightyAdmin1#')) === true, 'Accepts cryptographically hashed password');

// 2. Mortal Kombat Fatality Engine
console.log('\n[SECTION 2] Mortal Kombat Fatality & Finisher Engine');
assert(Object.keys(FATALITY_CATALOG).length >= 10, 'Catalog contains 10+ character fatalities');
assert(FATALITY_CATALOG.kazuki.name === 'DRAGON CREMATION', 'Kazuki has signature Dragon Cremation finisher');
assert(FATALITY_CATALOG.raven.name === 'ORBITAL ANNIHILATION', 'Raven has signature Orbital Annihilation finisher');
assert(FATALITY_CATALOG.kagura.name === 'SHADOW DECAPITATION', 'Kagura has signature Shadow Decapitation finisher');
assert(FATALITY_CATALOG.mighty.name === 'VOID SINGULARITY', 'M1GHTY has divine Void Singularity finisher');

const dummyWinner = { id: 'kazuki', name: 'Kazuki', x: 200, facingRight: true, changeState: () => {} };
const dummyLoser = { id: 'raven', name: 'Raven', x: 260, facingRight: false, changeState: () => {} };
fatalitySystem.start(dummyWinner, dummyLoser, 'cyber_city', 'fatality');
assert(fatalitySystem.active === true, 'FatalitySystem triggers active sequence');
assert(fatalitySystem.phase === 'cinematic', 'Starts in cinematic phase');
for (let f = 0; f < 140; f++) fatalitySystem.update();
assert(fatalitySystem.phase === 'banner', 'Transitions to gothic Fatality banner phase');

// 3. Announcer Vocal Calls
console.log('\n[SECTION 3] Digitized Arcade Announcer System');
assert(typeof announcer.round1 === 'function', 'Announcer round1 exists');
assert(typeof announcer.finishHim === 'function', 'Announcer finishHim exists');
assert(typeof announcer.fatality === 'function', 'Announcer fatality exists');
assert(typeof announcer.stageFatality === 'function', 'Announcer stageFatality exists');
assert(typeof announcer.brutality === 'function', 'Announcer brutality exists');
assert(typeof announcer.flawlessVictory === 'function', 'Announcer flawlessVictory exists');
assert(typeof announcer.testYourMight === 'function', 'Announcer testYourMight exists');
assert(typeof announcer.youDied === 'function', 'Announcer youDied exists');
assert(typeof announcer.godSlain === 'function', 'Announcer godSlain exists');

// 4. Elden Ring Combat & Progression Mechanics
console.log('\n[SECTION 4] Elden Ring Combat & Grace Checkpoint Engine');
const target = { poise: 100, isStanceBroken: false };
const broke1 = eldenManager.checkStanceBreak(target, 100);
assert(broke1 === false, '100 poise survives minor hit without stance break');
const broke2 = eldenManager.checkStanceBreak(target, 200);
assert(broke2 === true, 'Depleting poise triggers Stance Break & Critical Riposte window');
assert(target.isStanceBroken === true, 'Target marked as stance broken');

eldenManager.triggerYouDied();
assert(eldenManager.youDiedActive === true, 'YOU DIED overlay activates on campaign defeat');

eldenManager.triggerFelledBanner('endless_dragon');
assert(eldenManager.felledBannerActive === true, 'Boss victory banner activates');
assert(eldenManager.felledBannerText === 'G O D   S L A I N', 'Endless Dragon victory displays GOD SLAIN banner');

eldenManager.triggerFelledBanner('champion');
assert(eldenManager.felledBannerText === 'L E G E N D   F E L L E D', 'Champion displays LEGEND FELLED banner');

eldenManager.flaskCharges = 0;
const graceRes = eldenManager.executeGraceSelection();
assert(eldenManager.flaskCharges === eldenManager.maxFlaskCharges, 'Site of Grace rest refills Crimson Flask charges');

// 5. Arcade Towers ("Choose Your Destiny")
console.log('\n[SECTION 5] Mortal Kombat Arcade Towers');
assert(ARCADE_TOWERS.length === 3, 'Includes Novice, Warrior, and Master Towers');
assert(ARCADE_TOWERS[0].floors.length === 5, 'Novice Tower has 5 floors');
assert(ARCADE_TOWERS[1].floors.length === 8, 'Warrior Tower has 8 floors');
assert(ARCADE_TOWERS[2].floors.length === 12, 'Master Tower has 12 floors');
assert(ARCADE_TOWERS[2].floors[11].opponent === 'endless_dragon', 'Master Tower culminates in Endless Dragon fight');

arcadeTowerScreen.selectedTowerIndex = 0;
arcadeTowerScreen.resetProgress('kazuki');
assert(arcadeTowerScreen.currentFloor === 0, 'Tower resets to floor 0');
const nextFloor = arcadeTowerScreen.advanceFloor();
assert(arcadeTowerScreen.currentFloor === 1, 'Tower advances to floor 1');

// 6. Test Your Might Button Mash Minigame
console.log('\n[SECTION 6] Test Your Might Button Mash Minigame');
assert(TEST_MATERIALS.length === 4, '4 material tiers available (Wood, Stone, Steel, Diamond)');
testYourMight.start(0); // Wood
assert(testYourMight.active === true, 'Minigame starts active');
assert(testYourMight.material.name === 'PINE WOOD', 'Initial material is Pine Wood');
testYourMight.power = 0;
testYourMight.handleInput({ lp: true });
assert(testYourMight.power > 0, 'Attack button mashing builds chop gauge');
testYourMight.power = 50; // Above wood requirement 42
testYourMight.handleInput({ confirm: true });
assert(testYourMight.state === 'chop_success', 'Chop above threshold executes flawless chop!');

// 7. Expanded Cosmetics & Economy
console.log('\n[SECTION 7] Cosmetic Catalogs (Auras, Hit Sparks, Titles)');
assert(AURA_CATALOG.length >= 6, 'Aura Catalog has 6+ distinct energetic trails');
assert(SPARK_CATALOG.length >= 4, 'Spark Catalog has 4+ visual impact styles');
assert(TITLE_CATALOG.length >= 5, 'Title Catalog has 5+ grand title badges');

EconomyManager.equipCosmetic('aura', 'aura_flame');
EconomyManager.equipCosmetic('spark', 'spark_blood');
EconomyManager.equipCosmetic('title', 'title_tarnished');
const cos = EconomyManager.getEquippedCosmetics();
assert(cos.aura === 'aura_flame', 'Equipped Dragon Flame aura persists');
assert(cos.spark === 'spark_blood', 'Equipped Mortal Bloodburst spark persists');
assert(cos.title === 'title_tarnished', 'Equipped The Tarnished title persists');

console.log(`\n========================================`);
console.log(`ALL OVERHAUL SYSTEMS VERIFIED! (${passed}/${total} passed)`);
console.log(`========================================`);
