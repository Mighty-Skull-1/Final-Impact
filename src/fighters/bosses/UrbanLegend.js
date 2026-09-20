// Final Impact - The Urban Legend ("The Shade")
import { Fighter } from '../Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE } from '../../engine/Constants.js';
import { Box } from '../../engine/Hitbox.js';
import { soundFX } from '../../audio/SoundFX.js';

export class UrbanLegend extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'urban_legend',
      name: 'THE SHADE'
    });
    this.walkSpeed = 4.0;
    this.dashSpeed = 8.8;
    this.isShadowGlitch = false;
  }

  takeHit(attackData, fromDirection) {
    // Susceptible to chaotic street Dirty Tactics and weapon throws
    if (attackData.height === ATTACK_HEIGHT.UNBLOCKABLE) {
      this.isShadowGlitch = true;
      setTimeout(() => { this.isShadowGlitch = false; }, 800);
    }
    return super.takeHit(attackData, fromDirection);
  }

  updateState(opponent) {
    this.animTimer++;
    const frames = this.sprites[this.state] || this.sprites.IDLE;

    switch (this.state) {
      case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
        // Perfect Frame-data Jab
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 6) {
          this.animFrame = 1;
          this.activeHitbox = new Box(40, 24, 60, 20);
          this.currentAttackData = {
            damage: 45,
            hitStun: 16,
            blockStun: 12,
            pushback: 3,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.LIGHT
          };
        } else if (this.stateTimer <= 10) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
        // Optimal Frame-trap Heavy Punch
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 12) {
          this.animFrame = 1;
          this.activeHitbox = new Box(38, 20, 70, 36);
          this.currentAttackData = {
            damage: 90,
            hitStun: 26,
            blockStun: 18,
            pushback: 5,
            height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.HEAVY
          };
        } else if (this.stateTimer <= 19) {
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

  render(ctx) {
    // Render with eerie shadow / static silhouette
    ctx.save();
    ctx.filter = this.isShadowGlitch ? 'invert(1) drop-shadow(0 0 10px red)' : 'brightness(0.2) drop-shadow(0 0 6px cyan)';
    super.render(ctx);
    ctx.restore();
  }
}
