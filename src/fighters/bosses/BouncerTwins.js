// Final Impact - The Bouncer Twins (Boris & Viktor - 2v1 Boss Encounter)
import { Fighter } from '../Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE, LIMB_ZONE } from '../../engine/Constants.js';
import { Box } from '../../engine/Hitbox.js';
import { soundFX } from '../../audio/SoundFX.js';

export class BorisBouncer extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'boris',
      name: 'BORIS'
    });
    this.maxHealth = 850;
    this.health = 850;
    this.walkSpeed = 2.2;
    this.dashSpeed = 4.8;
    this.isGrappling = false;
    this.isBloodRage = false;
  }

  takeHit(attackData, fromDirection) {
    // Hyper-armor during command grab startup
    if (this.state === FIGHTER_STATE.SPECIAL_1 && !attackData.height === ATTACK_HEIGHT.UNBLOCKABLE) {
      soundFX.playBlock();
      this.health = Math.max(1, this.health - Math.floor(attackData.damage * 0.5));
      this.armorFlash = 6;
      return 'armored';
    }
    return super.takeHit(attackData, fromDirection);
  }

  updateState(opponent) {
    this.animTimer++;
    const frames = this.sprites[this.state] || this.sprites.IDLE;

    switch (this.state) {
      case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
        // Crushing Overhead Haymaker
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
        // Bear Hug Command Grab
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
}

export class ViktorBouncer extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'viktor',
      name: 'VIKTOR'
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
        // Long-range Whip Roundhouse Kick
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
        // Sliding Shin Sweep
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
}
