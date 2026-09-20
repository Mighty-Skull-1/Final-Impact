// Final Impact - The Cyber-Enhanced Street Lord (Kruger / "Iron Lung")
import { Fighter } from '../Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE } from '../../engine/Constants.js';
import { Box } from '../../engine/Hitbox.js';
import { soundFX } from '../../audio/SoundFX.js';

export class StreetLord extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'street_lord',
      name: 'KRUGER'
    });
    this.maxHealth = 1200;
    this.health = 1200;
    this.walkSpeed = 2.4;
    this.dashSpeed = 5.0;
    this.isArmorPhase = false;
    this.overheatStunTimer = 0;
    this.steamVentTimer = 0;
  }

  takeHit(attackData, fromDirection) {
    if (this.isInvincible || this.isDead) return false;

    // Overheat Stun: takes 200% critical damage!
    if (this.state === FIGHTER_STATE.OVERHEAT_STUN) {
      soundFX.playHitHeavy();
      const critDamage = Math.floor(attackData.damage * 2.0);
      this.health = Math.max(0, this.health - critDamage);
      this.armorFlash = 6;
      if (this.health <= 0) this.die();
      return 'crit_hit';
    }

    // Stamina-Proof Armor Phase (HP <= 40%)
    if (this.isArmorPhase) {
      if (attackData.height === ATTACK_HEIGHT.UNBLOCKABLE || attackData.hitType === HIT_TYPE.DIRTY_STUN) {
        this.triggerOverheatShutdown();
        return 'overheat_break';
      }
      soundFX.playBlock();
      // Absorbs damage with zero flinch/knockback
      this.health = Math.max(1, this.health - Math.floor(attackData.damage * 0.7));
      this.armorFlash = 6;
      if (this.health <= 0) this.die();
      return 'armored';
    }

    const res = super.takeHit(attackData, fromDirection);

    // Trigger Armor Phase at HP <= 40%
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
    this.overheatStunTimer = 120; // 2 full seconds of vulnerable critical shutdown!
    soundFX.playKO();
    soundFX.playNoiseCrack(0.5, 900, 0.7);
  }

  update(opponent, stageWidth = 960) {
    super.update(opponent, stageWidth);

    // Handle Overheat Stun countdown
    if (this.state === FIGHTER_STATE.OVERHEAT_STUN) {
      this.overheatStunTimer--;
      this.vx *= 0.85;
      // Billowing steam exhaust particles
      if (this.stateTimer % 6 === 0) {
        this.tacticalParticles.push({
          x: this.x + 35 + (Math.random() - 0.5) * 20,
          y: this.y - 70,
          vx: (Math.random() - 0.5) * 2,
          vy: -2.5,
          size: 5,
          alpha: 0.8,
          color: '#e2e8f0'
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
        // Pneumatic Piston Jab
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
        // Hydraulic Pile-Driver Slam
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
        if (this.animTimer >= this.animSpeed) {
          this.animTimer = 0;
          this.animFrame = (this.animFrame + 1) % frames.length;
        }
        break;
    }
  }

  render(ctx) {
    super.render(ctx);

    // Glowing orange hydraulic heat during Armor Phase
    if (this.isArmorPhase) {
      ctx.save();
      const pX = this.facingRight ? this.x + 45 : this.x + 15;
      const pY = this.y - 50;
      ctx.fillStyle = Math.floor(Date.now() / 60) % 2 === 0 ? '#ea580c' : '#f97316';
      ctx.fillRect(pX, pY, 14, 22); // Glowing reactor core
      ctx.restore();
    }
  }
}
