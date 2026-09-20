// Final Impact - The Corrupt Riot Cop (Sergeant Marcus Vance)
import { Fighter } from '../Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE, LIMB_ZONE } from '../../engine/Constants.js';
import { Box } from '../../engine/Hitbox.js';
import { soundFX } from '../../audio/SoundFX.js';

export class RiotCop extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'riot_cop',
      name: 'SGT. VANCE'
    });
    this.walkSpeed = 2.6;
    this.dashSpeed = 5.2;
    this.shieldRaised = true;
    this.shieldIntegrity = 250;
    this.maxShieldIntegrity = 250;
    this.shieldBrokenTimer = 0;
    this.isBatonElectrified = false;
  }

  takeHit(attackData, fromDirection) {
    if (this.isInvincible || this.isDead) return false;

    // Check if frontal attack hit the ballistic riot shield
    const hitFromFront = (this.facingRight && fromDirection > 0) || (!this.facingRight && fromDirection < 0);
    const isUnblockable = attackData.height === ATTACK_HEIGHT.UNBLOCKABLE;
    const isLowAnkle = attackData.height === ATTACK_HEIGHT.LOW;

    // 1. Perfect Guard Riot Shield Absorption
    if (this.shieldRaised && hitFromFront && !isUnblockable && !isLowAnkle && this.shieldBrokenTimer <= 0) {
      soundFX.playBlock();
      this.shieldIntegrity -= attackData.damage;
      this.vx = (this.facingRight ? -1 : 1) * 2.5;

      // Shield break check
      if (this.shieldIntegrity <= 0) {
        soundFX.playKO();
        this.shieldRaised = false;
        this.shieldBrokenTimer = 140; // Shield dropped for 140 frames!
        this.changeState(FIGHTER_STATE.HIT);
        return 'shield_broken';
      }

      // Frontal attacks bounce off with zero damage and heavy attacker recovery!
      return 'shield_blocked';
    }

    // 2. Dirty Tactic Bypass (e.g. Pocket Sand into visor slit)
    if (isUnblockable) {
      this.shieldRaised = false;
      this.shieldBrokenTimer = 90;
    }

    // 3. Standard Hit Resolution
    const result = super.takeHit(attackData, fromDirection);

    // Overcharge stun baton at HP <= 50%
    if (this.health <= this.maxHealth * 0.5 && !this.isBatonElectrified) {
      this.isBatonElectrified = true;
      soundFX.playTaserShock();
    }

    return result;
  }

  updateState(opponent) {
    this.animTimer++;
    const frames = this.sprites[this.state] || this.sprites.IDLE;

    // Shield recovery countdown
    if (this.shieldBrokenTimer > 0) {
      this.shieldBrokenTimer--;
      if (this.shieldBrokenTimer === 0) {
        this.shieldRaised = true;
        this.shieldIntegrity = this.maxShieldIntegrity;
      }
    }

    // Boss Combat AI state updates
    switch (this.state) {
      case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
        // Stun Baton Thrust
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 9) {
          this.animFrame = 1;
          this.activeHitbox = new Box(38, 26, 60, 20);
          this.currentAttackData = {
            damage: this.isBatonElectrified ? 55 : 40,
            hitStun: this.isBatonElectrified ? 24 : 14,
            blockStun: 12,
            pushback: 5,
            height: ATTACK_HEIGHT.MID,
            hitType: this.isBatonElectrified ? HIT_TYPE.DIRTY_STUN : HIT_TYPE.LIGHT,
            chipDamage: this.isBatonElectrified ? 8 : 0
          };
        } else if (this.stateTimer <= 14) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
        // Riot Shield Bash
        if (this.stateTimer <= 6) this.animFrame = 0;
        else if (this.stateTimer <= 13) {
          this.animFrame = 1;
          this.activeHitbox = new Box(35, 18, 55, 45);
          this.currentAttackData = {
            damage: 90,
            hitStun: 28,
            blockStun: 18,
            pushback: 8,
            height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.KNOCKDOWN,
            chipDamage: 12
          };
        } else if (this.stateTimer <= 22) {
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

    // Render Heavy Riot Shield on front
    if (this.shieldRaised && this.shieldBrokenTimer <= 0) {
      ctx.save();
      const sX = this.facingRight ? this.x + 48 : this.x + 12;
      const sY = this.y - 78;

      // Ballistic glass shield
      ctx.fillStyle = 'rgba(71, 85, 105, 0.75)';
      ctx.fillRect(sX, sY, 18, 64);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(sX, sY, 18, 64);

      // Vision slit
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(sX + 2, sY + 12, 14, 6);

      // Police stencil
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('POLICE', sX - 5, sY - 4);

      // Electrified baton spark
      if (this.isBatonElectrified && Math.random() < 0.4) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(sX + 12 + (Math.random() - 0.5) * 8, sY + 30 + (Math.random() - 0.5) * 8, 3, 3);
      }

      ctx.restore();
    }
  }
}
