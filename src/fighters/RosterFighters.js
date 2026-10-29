// Final Impact - Extended roster
// Each roster fighter is built on one of the six core move-sets, but now has a UNIQUE KIT:
// their own projectile behaviour, on-hit effects (burn, chill, bleed, blind, pull, wall splat...),
// armour windows, overheads and passives — so picking Cinder plays nothing like picking Kagura.
import { Kazuki } from './Kazuki.js';
import { Raven } from './Raven.js';
import { Kagura } from './Kagura.js';
import { Fang } from './Fang.js';
import { Zephyr } from './Zephyr.js';
import { Colossus } from './Colossus.js';
import { spriteGenerator } from '../graphics/SpriteGenerator.js';
import { Projectile } from '../engine/Projectiles.js';
import { FIGHTER_STATE, ATTACK_HEIGHT } from '../engine/Constants.js';
import { soundFX } from '../audio/SoundFX.js';
import { vfx } from '../graphics/VFX.js';

const S1 = FIGHTER_STATE.SPECIAL_1;
const S2 = FIGHTER_STATE.SPECIAL_2;
const S3 = FIGHTER_STATE.SPECIAL_3;

// ---------------------------------------------------------------------------
// Kits. Keys per special state:
//   hit:        fields merged into the move's attack data (effect, height, guardCrush...)
//   dmg:        damage multiplier for that special
//   reach:      extra hitbox reach in px
//   armor:      absorbs one hit during the first N frames
//   projInvuln: passes through projectiles
// projectile: changes applied to any projectile this fighter fires
// passive:    damageTakenMult, chipTakenMult, rageThreshold, rageMult, walkMult
// ---------------------------------------------------------------------------
export const ROSTER_KITS = {
  cinder: {
    tagline: 'Burns everything she touches — fire kunai, ember kicks and an explosive warp.',
    projectile: { shape: 'flame', effect: 'burn', dmg: 0.85 },
    [S2]: { hit: { effect: 'burn' } },
    warpBurst: true
  },
  glacier: {
    tagline: 'Slows foes with ice shards and freezes jumpers solid.',
    projectile: { shape: 'shard', effect: 'chill', speed: 0.85 },
    [S3]: { hit: { effect: 'freeze' } }
  },
  oracle: {
    tagline: 'Homing star darts and a comet that falls after her rising strike.',
    projectile: { shape: 'dart', homing: true, speed: 0.75, dmg: 0.8 },
    [S2]: { comet: true }
  },
  bandit: {
    tagline: 'Arcing cleavers that bleed, and brass knuckles that crush guards.',
    projectile: { shape: 'cleaver', gravity: 0.2, vy: -4.2, speed: 0.8, effect: 'bleed' },
    [S2]: { hit: { effect: 'bleed' } },
    [S3]: { hit: { guardCrush: 35 } }
  },
  confessor: {
    tagline: 'Shatters posture and pins sinners to the wall.',
    [S2]: { hit: { effect: 'poise' } },
    [S3]: { hit: { effect: 'wallSplat' } }
  },
  valka: {
    tagline: 'A war cry that stuns across the screen and a launcher that sends foes skyward.',
    projectile: { shape: 'shock', grow: 0.55, speed: 0.6, durability: 2, effect: 'daze', dmg: 0.75 },
    [S2]: { hit: { effect: 'launch' }, dmg: 1.15 }
  },
  convict: {
    tagline: 'A long chain hook that drags you in, and an unstoppable cell rush.',
    [S1]: { reach: 38, hit: { effect: 'pull' } },
    [S3]: { armor: 10 },
    passive: { walkMult: 0.95 }
  },
  prophet: {
    tagline: 'True overheads and a blinding dust slide.',
    [S2]: { hit: { height: ATTACK_HEIGHT.MID } },
    [S3]: { hit: { effect: 'blind' } }
  },
  ronin: {
    tagline: 'A low ground-wave that must be crouch-blocked, and a bleeding iaido draw.',
    projectile: { shape: 'wave', ground: true, height: ATTACK_HEIGHT.LOW, speed: 1.15, dmg: 0.85 },
    [S2]: { hit: { effect: 'bleed' } }
  },
  vagabond: {
    tagline: 'A greatsword shockwave that beats other projectiles, and an armoured shield ram.',
    projectile: { shape: 'wave', durability: 2, big: true, speed: 0.75, dmg: 1.15 },
    [S3]: { armor: 12 }
  },
  warden: {
    tagline: 'A walking fortress: takes less damage, ignores chip, armoured knee.',
    [S1]: { armor: 8 },
    [S2]: { hit: { effect: 'poise' } },
    passive: { damageTakenMult: 0.9, chipTakenMult: 0 }
  },
  wretch: {
    tagline: 'Gets deadlier when cornered: earlier, stronger rage; slides under projectiles.',
    [S2]: { hit: { height: ATTACK_HEIGHT.MID } },
    [S3]: { projInvuln: true },
    passive: { rageThreshold: 0.4, rageMult: 1.35 }
  }
};

function makeRosterFighter(Base, id, name, tune = {}) {
  const kit = ROSTER_KITS[id] || {};
  return class extends Base {
    constructor(options) {
      super(options);
      this.id = id;
      this.name = name;
      this.kit = kit;
      this.skinId = options.skinId || null;
      this.sprites = spriteGenerator.generateFighterSprites(id, this.skinId);
      const hp = tune.hp || 1;
      this.maxHealth = Math.round(this.maxHealth * hp);
      this.health = this.maxHealth;
      if (tune.walk) this.walkSpeed *= tune.walk;
      if (tune.dash) this.dashSpeed *= tune.dash;
      if (tune.jump) this.jumpForce *= tune.jump;
      this.baseReach = this.reachBonus || 0;
      const p = kit.passive || {};
      if (p.damageTakenMult) this.damageTakenMult = p.damageTakenMult;
      if (p.chipTakenMult !== undefined) this.chipTakenMult = p.chipTakenMult;
      if (p.rageThreshold) this.rageThreshold = p.rageThreshold;
      if (p.rageMult) this.rageMult = p.rageMult;
      if (p.walkMult) this.walkSpeed *= p.walkMult;
      if (kit.warpBurst) this.onWarpArrive = () => this.spawnWarpBurst();
    }

    // Every projectile this fighter fires passes through the kit first
    set spawnProjectile(fn) { this._spawnProjectileFn = fn; }
    get spawnProjectile() {
      if (!this._spawnProjectileFn) return null;
      return (proj) => {
        if (proj instanceof Projectile && !proj._kitApplied) this.applyProjectileKit(proj);
        this._spawnProjectileFn(proj);
      };
    }

    applyProjectileKit(proj) {
      proj._kitApplied = true;
      const k = kit.projectile;
      if (!k) return;
      if (k.shape) proj.shape = k.shape;
      if (k.speed) proj.vx *= k.speed;
      if (k.dmg) proj.damage = Math.round(proj.damage * k.dmg);
      if (k.effect) proj.effect = k.effect;
      if (k.gravity) { proj.gravity = k.gravity; proj.vy = k.vy || -4; }
      if (k.homing) { proj.homing = true; proj.target = this._lastOpponent || null; proj.homingFrames = 50; }
      if (k.durability) proj.durability = k.durability;
      if (k.grow) proj.grow = k.grow;
      if (k.height) proj.attackHeight = k.height;
      if (k.ground) { proj.height = 24; proj.y = 300 - 30; proj.width = 26; }
      if (k.big) { proj.width = 40; proj.height = 46; proj.y = this.y - 70; }
    }

    updateState(opponent) {
      if (opponent) this._lastOpponent = opponent;
      super.updateState(opponent);
      const spec = kit[this.state];
      this.reachBonus = this.baseReach + (spec && spec.reach ? spec.reach : 0);
      if (spec && this.activeHitbox && this.currentAttackData && this.currentAttackData !== this._patchedData) {
        const base = this.currentAttackData;
        this.currentAttackData = { ...base, ...(spec.hit || {}) };
        if (spec.dmg) this.currentAttackData.damage = Math.round((base.damage || 0) * spec.dmg);
        this._patchedData = this.currentAttackData;
      }
    }

    takeHit(attackData, fromDirection) {
      const spec = kit[this.state];
      if (spec && spec.armor && this.stateTimer <= spec.armor && this._armorUsedSerial !== this._stateSerial &&
          attackData.height !== ATTACK_HEIGHT.UNBLOCKABLE && !this.isDead) {
        // The first hit during this move's armour window is absorbed
        this._armorUsedSerial = this._stateSerial;
        soundFX.playBlock();
        this.health = Math.max(1, this.health - Math.floor((attackData.damage || 0) * 0.5));
        this.armorFlash = 6;
        return 'armored';
      }
      return super.takeHit(attackData, fromDirection);
    }

    isProjectileInvulnerable() {
      const spec = kit[this.state];
      return !!(spec && spec.projInvuln);
    }

    // Called by the combat director after one of this fighter's hits connects
    onSpecialHit(target, result) {
      const spec = kit[this.state];
      if (spec && spec.comet && result !== 'blocked' && target && this._spawnProjectileFn && !this._cometThisMove) {
        this._cometThisMove = true;
        const p = new Projectile({ owner: this, type: 'comet', x: target.x + 20, y: 40, vx: (this.facingRight ? 1 : -1) * 0.6, vy: 6.5, damage: 50, width: 26, height: 26 });
        p.shape = 'comet';
        p.attackHeight = ATTACK_HEIGHT.MID;
        p._kitApplied = true;
        this.activeProjectileCount++;
        this._spawnProjectileFn(p);
      }
    }

    changeState(newState, force) {
      if (newState !== this.state || force) {
        this._cometThisMove = false;
        this._stateSerial = (this._stateSerial || 0) + 1;
      }
      return super.changeState(newState, force);
    }

    // Cinder: her warp arrives in an explosion of embers
    spawnWarpBurst() {
      if (!this._spawnProjectileFn) return;
      const p = new Projectile({ owner: this, type: 'burst', x: this.x - 30, y: this.y - 72, vx: 0, damage: 55, width: 140, height: 64 });
      p.shape = 'flame';
      p.effect = 'burn';
      p.pierce = true;
      p.lifetime = 8;
      p._kitApplied = true;
      p.attackHeight = ATTACK_HEIGHT.MID;
      this.activeProjectileCount++;
      this._spawnProjectileFn(p);
      vfx.burst(this.x + 40, this.y - 45, { color: '#ff8a3d', count: 24, speed: 6 });
      vfx.push({ kind: 'ring', x: this.x + 40, y: this.y - 45, r: 8, vr: 4, life: 14, color: '#ffb347', w: 3 });
    }
  };
}

export const ROSTER_CLASSES = {
  cinder: makeRosterFighter(Kagura, 'cinder', 'CINDER', { hp: 0.94, walk: 1.06, dash: 1.05 }),
  glacier: makeRosterFighter(Kazuki, 'glacier', 'GLACIER', { hp: 1.0, walk: 0.97 }),
  oracle: makeRosterFighter(Kagura, 'oracle', 'ORACLE', { hp: 0.9, jump: 1.04 }),
  bandit: makeRosterFighter(Raven, 'bandit', 'BANDIT', { hp: 1.0, walk: 1.05 }),
  confessor: makeRosterFighter(Fang, 'confessor', 'CONFESSOR', { hp: 1.03, walk: 0.98 }),
  valka: makeRosterFighter(Kazuki, 'valka', 'VALKA', { hp: 0.96, walk: 1.08, jump: 1.05 }),
  convict: makeRosterFighter(Colossus, 'convict', 'CONVICT', { hp: 1.12, walk: 0.92, dash: 0.95 }),
  prophet: makeRosterFighter(Zephyr, 'prophet', 'PROPHET', { hp: 0.95, walk: 1.04 }),
  ronin: makeRosterFighter(Kazuki, 'ronin', 'RONIN', { hp: 1.0, dash: 1.08 }),
  vagabond: makeRosterFighter(Raven, 'vagabond', 'VAGABOND', { hp: 1.1, walk: 0.93 }),
  warden: makeRosterFighter(Fang, 'warden', 'WARDEN', { hp: 1.06, walk: 0.96 }),
  wretch: makeRosterFighter(Zephyr, 'wretch', 'WRETCH', { hp: 0.88, walk: 1.12, dash: 1.1, jump: 1.08 })
};

export const ROSTER_QUOTES = {
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
