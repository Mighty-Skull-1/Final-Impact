// Final Impact - The Corrupted Champion (Rex "The Apex" Gannon)
import { Fighter } from '../Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE, LIMB_ZONE } from '../../engine/Constants.js';
import { Box } from '../../engine/Hitbox.js';
import { soundFX } from '../../audio/SoundFX.js';

export class Champion extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'champion',
      name: 'REX GANNON'
    });
    this.walkSpeed = 3.6;
    this.dashSpeed = 7.6;
    this.isApplyingSubmission = false;
    this.submissionTimer = 0;
    this.targetSubmissionLimb = LIMB_ZONE.LEAD_ARM;
  }

  attemptShootTakedown(opponent) {
    this.changeState(FIGHTER_STATE.SPECIAL_1);
    soundFX.playWhoosh('heavy');
    this.vx = (this.facingRight ? 1 : -1) * 8.5;
  }

  startSubmissionLock(opponent, limbZone = LIMB_ZONE.LEAD_ARM) {
    this.isApplyingSubmission = true;
    this.submissionTimer = 150; // 2.5 seconds to escape
    this.targetSubmissionLimb = limbZone;
    opponent.changeState(FIGHTER_STATE.SUBMISSION_LOCK);
    opponent.submissionStruggle = 0;
    soundFX.playKnockdown();
  }

  update(opponent, stageWidth = 960) {
    super.update(opponent, stageWidth);

    // If opponent is knocked down and close, transition into Submission Lock
    if (opponent && opponent.state === FIGHTER_STATE.KNOCKDOWN && !this.isApplyingSubmission && Math.abs(this.x - opponent.x) < 70) {
      this.startSubmissionLock(opponent, Math.random() < 0.5 ? LIMB_ZONE.LEAD_ARM : LIMB_ZONE.LEAD_LEG);
    }

    // Process active submission hold
    if (this.isApplyingSubmission) {
      this.submissionTimer--;
      this.vx = 0;
      if (opponent) {
        opponent.vx = 0;
        // Escape check: if player mashed struggle meter to 100
        if (opponent.submissionStruggle >= 100) {
          this.isApplyingSubmission = false;
          soundFX.playWhoosh('light');
          opponent.changeState(FIGHTER_STATE.IDLE);
          this.changeState(FIGHTER_STATE.HIT);
          return;
        }
      }

      // Time expired: joint rupture!
      if (this.submissionTimer <= 0) {
        this.isApplyingSubmission = false;
        soundFX.playKO();
        if (opponent) {
          opponent.damageLimb(this.targetSubmissionLimb, 100); // 100% Limb Destruction!
          opponent.health = Math.max(1, opponent.health - 90);
          opponent.changeState(FIGHTER_STATE.KNOCKDOWN);
        }
        this.changeState(FIGHTER_STATE.IDLE);
      }
    }
  }

  updateState(opponent) {
    this.animTimer++;
    const frames = this.sprites[this.state] || this.sprites.IDLE;

    switch (this.state) {
      case FIGHTER_STATE.SPECIAL_1:
        // Fast Double-Leg Shoot Takedown
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 14) {
          this.animFrame = 1;
          this.activeHitbox = new Box(32, 45, 65, 30);
          this.currentAttackData = {
            damage: 70,
            hitStun: 30,
            blockStun: 14,
            pushback: 5,
            height: ATTACK_HEIGHT.LOW,
            hitType: HIT_TYPE.KNOCKDOWN
          };
        } else if (this.stateTimer <= 22) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
        // Stiff Lead Jab
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 9) {
          this.animFrame = 1;
          this.activeHitbox = new Box(38, 22, 58, 22);
          this.currentAttackData = {
            damage: 50,
            hitStun: 16,
            blockStun: 12,
            pushback: 4,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.LIGHT
          };
        } else if (this.stateTimer <= 14) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
        // Brutal Overhand Right
        if (this.stateTimer <= 6) this.animFrame = 0;
        else if (this.stateTimer <= 15) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 18, 65, 40);
          this.currentAttackData = {
            damage: 95,
            hitStun: 28,
            blockStun: 18,
            pushback: 7,
            height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.HEAVY
          };
        } else if (this.stateTimer <= 23) {
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
}
