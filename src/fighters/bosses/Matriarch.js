// Final Impact - The Syndicate Matriarch (Madam Chen)
import { Fighter } from '../Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE, STATUS_EFFECT, LIMB_ZONE } from '../../engine/Constants.js';
import { Box } from '../../engine/Hitbox.js';
import { soundFX } from '../../audio/SoundFX.js';

export class Matriarch extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'matriarch',
      name: 'MADAM CHEN'
    });
    this.walkSpeed = 3.8;
    this.dashSpeed = 8.5;
    this.isSwordDrawn = false;
    this.reversalCooldown = 0;
  }

  takeHit(attackData, fromDirection) {
    if (this.isInvincible || this.isDead) return false;

    // 1. Mirror Reversal: Instant counter-parry against predictable normal attacks when in IDLE
    const isNormal = attackData.hitType === HIT_TYPE.LIGHT || attackData.hitType === HIT_TYPE.HEAVY;
    const isUnblockable = attackData.height === ATTACK_HEIGHT.UNBLOCKABLE;

    if (this.state === FIGHTER_STATE.IDLE && isNormal && !isUnblockable && this.reversalCooldown <= 0 && Math.random() < 0.65) {
      this.reversalCooldown = 90;
      soundFX.playBlock();
      // Counter-Throw animation
      this.changeState(FIGHTER_STATE.SPECIAL_2);
      this.activeHitbox = new Box(32, 22, 55, 35);
      this.currentAttackData = {
        damage: 85,
        hitStun: 35,
        blockStun: 20,
        pushback: 6,
        height: ATTACK_HEIGHT.MID,
        hitType: HIT_TYPE.KNOCKDOWN
      };
      return 'countered';
    }

    // 2. Standard Hit Resolution
    const res = super.takeHit(attackData, fromDirection);

    // Phase 2: Unsheathe cane-sword at HP <= 50%
    if (this.health <= this.maxHealth * 0.5 && !this.isSwordDrawn) {
      this.isSwordDrawn = true;
      soundFX.playFlashKick();
    }

    return res;
  }

  update(opponent, stageWidth = 960) {
    super.update(opponent, stageWidth);
    if (this.reversalCooldown > 0) this.reversalCooldown--;
  }

  updateState(opponent) {
    this.animTimer++;
    const frames = this.sprites[this.state] || this.sprites.IDLE;

    switch (this.state) {
      case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
        // Palm Strike or Cane-Sword Quick Slash
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 9) {
          this.animFrame = 1;
          this.activeHitbox = new Box(38, 22, 60, 22);
          this.currentAttackData = {
            damage: this.isSwordDrawn ? 60 : 45,
            hitStun: 18,
            blockStun: 12,
            pushback: 4,
            height: ATTACK_HEIGHT.HIGH,
            hitType: this.isSwordDrawn ? HIT_TYPE.BLEED_SLASH : HIT_TYPE.LIGHT,
            chipDamage: this.isSwordDrawn ? 10 : 0
          };
        } else if (this.stateTimer <= 14) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
        // Cane-Sword Arterial Laceration Slash
        if (this.stateTimer <= 6) this.animFrame = 0;
        else if (this.stateTimer <= 14) {
          this.animFrame = 1;
          this.activeHitbox = new Box(35, 18, 70, 36);
          this.currentAttackData = {
            damage: this.isSwordDrawn ? 105 : 75,
            hitStun: 28,
            blockStun: 18,
            pushback: 6,
            height: ATTACK_HEIGHT.MID,
            hitType: this.isSwordDrawn ? HIT_TYPE.BLEED_SLASH : HIT_TYPE.HEAVY,
            chipDamage: this.isSwordDrawn ? 18 : 0
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

    // Draw silver blade gleam in Phase 2
    if (this.isSwordDrawn) {
      ctx.save();
      const sX = this.facingRight ? this.x + 55 : this.x + 8;
      const sY = this.y - 55;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sX, sY);
      ctx.lineTo(sX + (this.facingRight ? 24 : -24), sY + 18);
      ctx.stroke();

      // Gleam spark
      if (Math.random() < 0.3) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sX + (this.facingRight ? 12 : -12), sY + 9, 3, 3);
      }
      ctx.restore();
    }
  }
}
