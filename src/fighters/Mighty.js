// Final Impact - M1GHTY (Secret Divine God Character)
// Style: Omnipotent Striker / One-Hit Extinction
import { Fighter } from './Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE } from '../engine/Constants.js';
import { Box } from '../engine/Hitbox.js';
import { Projectile } from '../engine/Projectiles.js';
import { soundFX } from '../audio/SoundFX.js';

export class Mighty extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'mighty',
      name: 'M1GHTY'
    });
    this.walkSpeed = 4.5;
    this.dashSpeed = 11.0;
    this.jumpForce = -13.8;
    this.maxHealth = 2500;
    this.health = 2500;
    this.ultimateTarget = null;
  }

  handleInput(inputState, inputManager, opponent) {
    if (this.hitStun > 0 || this.blockStun > 0 || this.state === FIGHTER_STATE.KNOCKDOWN) return;

    if (this.state === FIGHTER_STATE.SUBMISSION_LOCK) {
      if (inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputState.dirtyJust) {
        this.submissionStruggle = Math.min(100, (this.submissionStruggle || 0) + 25);
        soundFX.playWhoosh('heavy');
      }
      return;
    }

    const pNum = this.playerNum;

    if (this.heldPickup) {
      const wantsAttack = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || (inputManager && (inputManager.peekAction(pNum) === 'LP' || inputManager.peekAction(pNum) === 'HP'));
      if (wantsAttack && !this.isAttacking()) {
        if (inputManager) inputManager.consumeAction(pNum);
        this.executePickupAttack(this.heldPickup, opponent);
        return;
      }
    }

    this.isHoldingBack = !!inputState.back;
    this.isCrouching = !!inputState.down;

    // 1. Ultimate: M1GHTY APEX EXTINCTION (Instant Super)
    const canSuper = this.superMeter >= 100 || inputManager.easyInputs;
    const wantsUltimate = inputState.ultimateJust || inputManager.peekAction(pNum) === 'ULTIMATE';
    if (wantsUltimate && canSuper) {
      if (this.canCancelOnHit() || !this.isAttacking()) {
        inputManager.consumeBuffer(pNum);
        this.startUltimate(opponent);
        return;
      }
    }

    // Dirty Tactic: DIVINE SMITE
    const wantsDirty = inputState.dirtyJust || inputManager.peekAction(pNum) === 'DIRTY';
    if (wantsDirty && this.isGrounded && (!this.isAttacking() || this.canCancelOnHit())) {
      inputManager.consumeAction(pNum);
      this.startDivineSmite();
      return;
    }

    // 2. Airborne Attacks
    if (!this.isGrounded) {
      if (this.state === FIGHTER_STATE.JUMP) {
        if (inputState.lpJust || inputState.hpJust || inputManager.peekAction(pNum) === 'LP' || inputManager.peekAction(pNum) === 'HP') {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.JUMP_PUNCH);
          soundFX.playWhoosh('heavy');
        } else if (inputState.lkJust || inputState.hkJust || inputManager.peekAction(pNum) === 'LK' || inputManager.peekAction(pNum) === 'HK') {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.JUMP_KICK);
          soundFX.playWhoosh('heavy');
        }
      }
      return;
    }

    // 3. Attack Protection
    if (this.isAttacking() && !this.canCancelOnHit()) return;

    // 4. Specials (God Palm, Apex Shatter, Void Tremor)
    const anyAttackJust = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust;

    // Void Tremor (SP3)
    const isSP3 = (inputManager.checkQCB(pNum) && anyAttackJust) || inputState.sp3Just || inputManager.peekAction(pNum) === 'SP3';
    if (isSP3) {
      inputManager.consumeBuffer(pNum);
      this.startVoidTremor(opponent);
      return;
    }

    // Apex Shatter Uppercut (SP2)
    const isSP2 = (inputManager.checkDP(pNum) && anyAttackJust) || inputState.sp2Just || inputManager.peekAction(pNum) === 'SP2';
    if (isSP2) {
      inputManager.consumeBuffer(pNum);
      this.startApexShatter();
      return;
    }

    // God Palm (SP1)
    const isSP1 = (inputManager.checkQCF(pNum) && anyAttackJust) || inputState.sp1Just || inputManager.peekAction(pNum) === 'SP1';
    if (isSP1) {
      inputManager.consumeBuffer(pNum);
      this.startGodPalm();
      return;
    }

    // 5. Dash
    if (!this.isAttacking()) {
      if (inputState.dashFwd) { this.startDash(true); return; }
      if (inputState.dashBack) { this.startDash(false); return; }
    }

    // 6. Normals (All 9999 One-Hit KO)
    const lpT = inputState.lpJust || inputManager.peekAction(pNum) === 'LP';
    const hpT = inputState.hpJust || inputManager.peekAction(pNum) === 'HP';
    const lkT = inputState.lkJust || inputManager.peekAction(pNum) === 'LK';
    const hkT = inputState.hkJust || inputManager.peekAction(pNum) === 'HK';

    if (inputState.down) {
      if (lpT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.CROUCH_LIGHT_PUNCH, true); soundFX.playWhoosh('heavy'); return; }
      if (hpT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.CROUCH_HEAVY_PUNCH, true); soundFX.playWhoosh('heavy'); return; }
      if (lkT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.CROUCH_LIGHT_KICK, true); soundFX.playWhoosh('heavy'); return; }
      if (hkT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.CROUCH_HEAVY_KICK, true); soundFX.playWhoosh('heavy'); return; }
      this.changeState(FIGHTER_STATE.CROUCH);
      return;
    }

    if (lpT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.ATTACK_LIGHT_PUNCH, true); soundFX.playWhoosh('heavy'); return; }
    if (hpT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH, true); soundFX.playWhoosh('heavy'); return; }
    if (lkT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.ATTACK_LIGHT_KICK, true); soundFX.playWhoosh('heavy'); return; }
    if (hkT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.ATTACK_HEAVY_KICK, true); soundFX.playWhoosh('heavy'); return; }

    // 7. Jump
    if (inputState.up) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.changeState(FIGHTER_STATE.JUMP);
      if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 4.2;
      else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 4.2;
      return;
    }

    // 8. Walk
    if (inputState.fwd) {
      this.vx = (this.facingRight ? 1 : -1) * this.walkSpeed;
      this.changeState(FIGHTER_STATE.WALK_FWD);
    } else if (inputState.back) {
      this.vx = (this.facingRight ? -1 : 1) * (this.walkSpeed * 0.8);
      this.changeState(FIGHTER_STATE.WALK_BACK);
    } else {
      this.changeState(FIGHTER_STATE.IDLE);
    }
  }

  startGodPalm() {
    this.changeState(FIGHTER_STATE.SPECIAL_1);
    soundFX.playHadouken();
  }

  startApexShatter() {
    this.changeState(FIGHTER_STATE.SPECIAL_2);
    soundFX.playShoryuken();
    this.isInvincible = true;
    this.isGrounded = false;
    this.vy = -13;
    this.vx = (this.facingRight ? 1 : -1) * 5;
  }

  startVoidTremor(opponent) {
    this.changeState(FIGHTER_STATE.SPECIAL_3);
    soundFX.playWhoosh('heavy');
    if (opponent) {
      // Instant flash step behind opponent
      this.x = opponent.x + (opponent.facingRight ? -60 : 60);
      this.facingRight = !opponent.facingRight;
    }
  }

  startDivineSmite() {
    this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
    soundFX.playUltimateActivation();
    const originX = this.facingRight ? this.x + 50 : this.x + 10;
    for (let i = 0; i < 28; i++) {
      this.tacticalParticles.push({
        x: originX,
        y: this.y - 65 + (Math.random() - 0.5) * 25,
        vx: (this.facingRight ? 1 : -1) * (5 + Math.random() * 6),
        vy: (Math.random() - 0.5) * 4,
        size: 3 + Math.random() * 4,
        alpha: 1.0,
        color: Math.random() < 0.5 ? '#facc15' : '#38bdf8'
      });
    }
  }

  startUltimate(opponent) {
    this.superMeter = 0;
    this.changeState(FIGHTER_STATE.ULTIMATE);
    this.ultimateTarget = opponent;
    this.isInvincible = true;
    soundFX.playUltimateActivation();
    window.dispatchEvent(new CustomEvent('ultimate-activated', {
      detail: {
        fighter: this.id,
        playerNum: this.playerNum,
        name: this.name,
        ultimateName: 'M1GHTY APEX EXTINCTION',
        kanji: '神滅',
        subtitle: 'ONE HIT EXTINCTION // DIVINE WILL'
      }
    }));
  }

  updateState(opponent) {
    this.animTimer++;
    const frames = this.sprites[this.state] || this.sprites.IDLE;

    // Helper for 9999 one-hit KO attack data
    const godAttackData = (h = ATTACK_HEIGHT.UNBLOCKABLE) => ({
      damage: 9999,
      chipDamage: 9999,
      hitStun: 99,
      blockStun: 99,
      pushback: 14,
      height: h,
      hitType: HIT_TYPE.KNOCKDOWN
    });

    switch (this.state) {
      case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
        if (this.stateTimer <= 2) this.animFrame = 0;
        else if (this.stateTimer <= 7) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 28, 55, 24);
          this.currentAttackData = godAttackData();
        } else if (this.stateTimer <= 11) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 10) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 22, 65, 30);
          this.currentAttackData = godAttackData();
        } else if (this.stateTimer <= 16) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.ATTACK_LIGHT_KICK:
        if (this.stateTimer <= 2) this.animFrame = 0;
        else if (this.stateTimer <= 7) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 44, 58, 22);
          this.currentAttackData = godAttackData();
        } else if (this.stateTimer <= 12) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.ATTACK_HEAVY_KICK:
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 12) {
          this.animFrame = 1;
          this.activeHitbox = new Box(34, 34, 75, 30);
          this.currentAttackData = godAttackData();
        } else if (this.stateTimer <= 18) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.CROUCH_LIGHT_PUNCH:
        if (this.stateTimer <= 2) this.animFrame = 0;
        else if (this.stateTimer <= 6) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 48, 50, 20);
          this.currentAttackData = godAttackData();
        } else if (this.stateTimer <= 10) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.CROUCH_HEAVY_PUNCH:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 9) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 40, 62, 26);
          this.currentAttackData = godAttackData();
        } else if (this.stateTimer <= 15) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.CROUCH_LIGHT_KICK:
        if (this.stateTimer <= 2) this.animFrame = 0;
        else if (this.stateTimer <= 7) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 56, 58, 20);
          this.currentAttackData = godAttackData();
        } else if (this.stateTimer <= 11) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.CROUCH_HEAVY_KICK:
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 11) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 54, 85, 26);
          this.currentAttackData = godAttackData();
        } else if (this.stateTimer <= 17) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.JUMP_PUNCH:
        this.animFrame = 1;
        this.activeHitbox = new Box(36, 30, 62, 32);
        this.currentAttackData = godAttackData();
        break;

      case FIGHTER_STATE.JUMP_KICK:
        this.animFrame = 1;
        this.activeHitbox = new Box(36, 34, 70, 28);
        this.currentAttackData = godAttackData();
        break;

      // SPECIAL 1: GOD PALM (One-Hit KO Projectile)
      case FIGHTER_STATE.SPECIAL_1:
        if (this.stateTimer <= 4) {
          this.animFrame = 0;
        } else if (this.stateTimer === 5) {
          this.animFrame = 1;
          if (this.spawnProjectile) {
            const p = new Projectile({
              owner: this,
              type: 'god_palm',
              x: this.facingRight ? this.x + 55 : this.x - 45,
              y: this.y - 65,
              vx: (this.facingRight ? 1 : -1) * 12,
              width: 46,
              height: 38,
              damage: 9999,
              color: '#fbbf24'
            });
            p.attackHeight = ATTACK_HEIGHT.UNBLOCKABLE;
            this.spawnProjectile(p);
          }
          this.activeHitbox = new Box(36, 25, 55, 30);
          this.currentAttackData = godAttackData();
        } else if (this.stateTimer <= 15) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      // SPECIAL 2: APEX SHATTER (Invincible Rising Golden Strike)
      case FIGHTER_STATE.SPECIAL_2:
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 14) {
          this.animFrame = 1;
          this.activeHitbox = new Box(30, 0, 65, 55);
          this.currentAttackData = godAttackData();
        } else if (this.stateTimer <= 22) {
          this.animFrame = 2;
          this.activeHitbox = null;
          this.isInvincible = false;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      // SPECIAL 3: VOID TREMOR (Flash Step Strike)
      case FIGHTER_STATE.SPECIAL_3:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 10) {
          this.animFrame = 1;
          this.activeHitbox = new Box(34, 30, 68, 30);
          this.currentAttackData = godAttackData();
        } else if (this.stateTimer <= 18) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      // DIRTY TACTIC: DIVINE SMITE
      case FIGHTER_STATE.DIRTY_TACTIC:
        if (this.stateTimer <= 4) {
          this.animFrame = 0;
        } else if (this.stateTimer <= 12) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 15, 75, 45);
          this.currentAttackData = godAttackData();
        } else if (this.stateTimer <= 20) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      // ULTIMATE: M1GHTY APEX EXTINCTION (Screen-shaking One-Hit KO Cinematic)
      case FIGHTER_STATE.ULTIMATE:
        if (this.stateTimer <= 15) {
          this.animFrame = Math.floor(this.stateTimer / 4);
          this.vx = 0;
        } else if (this.stateTimer === 18 && this.ultimateTarget) {
          this.x = this.ultimateTarget.x + (this.facingRight ? -50 : 50);
        } else if (this.stateTimer >= 22 && this.stateTimer <= 50) {
          this.animFrame = 4 + (this.stateTimer % 4 < 2 ? 0 : 1);
          if (this.stateTimer === 30 && this.ultimateTarget && !this.ultimateTarget.isDead) {
            this.ultimateTarget.takeHit({
              damage: 9999,
              chipDamage: 9999,
              hitStun: 99,
              blockStun: 99,
              pushback: 18,
              height: ATTACK_HEIGHT.UNBLOCKABLE,
              hitType: HIT_TYPE.KNOCKDOWN
            }, this.facingRight ? 1 : -1);
            soundFX.playKO();
          }
        } else if (this.stateTimer >= 55 && this.stateTimer <= 75) {
          this.animFrame = 7;
        } else if (this.stateTimer > 75) {
          this.isInvincible = false;
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      default:
        if (frames && frames.length > 0 && this.animTimer >= this.animSpeed) {
          this.animTimer = 0;
          this.animFrame = (this.animFrame + 1) % frames.length;
        }
        break;
    }
  }
}
