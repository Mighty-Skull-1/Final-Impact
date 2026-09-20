// Final Impact - Fang (The Lethal Striker)
// Style: Muay Thai / Lethwei
import { Fighter } from './Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE } from '../engine/Constants.js';
import { Box } from '../engine/Hitbox.js';
import { soundFX } from '../audio/SoundFX.js';

export class Fang extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'fang',
      name: 'FANG'
    });
    this.walkSpeed = 3.8;
    this.dashSpeed = 8.2;
    this.jumpForce = -13.0;
    this.ultimateTarget = null;
  }

  handleInput(inputState, inputManager, opponent) {
    if (this.hitStun > 0 || this.blockStun > 0 || this.state === FIGHTER_STATE.KNOCKDOWN) return;

    if (this.state === FIGHTER_STATE.SUBMISSION_LOCK) {
      if (inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputState.dirtyJust) {
        this.submissionStruggle = Math.min(100, (this.submissionStruggle || 0) + 14);
        soundFX.playWhoosh('light');
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

    // 1. Ultimate
    const canSuper = this.superMeter >= 100 || inputManager.easyInputs;
    const wantsUltimate = inputState.ultimateJust || inputManager.peekAction(pNum) === 'ULTIMATE';
    if (wantsUltimate && canSuper) {
      if (this.canCancelOnHit() || !this.isAttacking()) {
        inputManager.consumeBuffer(pNum);
        this.startUltimate(opponent);
        return;
      }
    }

    // Dirty Tactic
    const wantsDirty = inputState.dirtyJust || inputManager.peekAction(pNum) === 'DIRTY';
    if (wantsDirty && this.isGrounded && (!this.isAttacking() || this.canCancelOnHit())) {
      inputManager.consumeAction(pNum);
      this.startDirtyTactic();
      return;
    }

    // 2. Airborne
    if (!this.isGrounded) {
      if (this.state === FIGHTER_STATE.JUMP) {
        if (inputState.lpJust || inputState.hpJust || inputManager.peekAction(pNum) === 'LP' || inputManager.peekAction(pNum) === 'HP') {
          inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.JUMP_PUNCH);
          soundFX.playWhoosh('light');
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

    // 4. Specials (Leading-edge and buffer only)
    const anyAttackJust = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust;

    // Cyclone Elbow (DP motion or SP2 key)
    const isSP2 = (inputManager.checkDP(pNum) && anyAttackJust) || inputState.sp2Just || inputManager.peekAction(pNum) === 'SP2';
    if (isSP2) {
      inputManager.consumeBuffer(pNum);
      this.startCycloneElbow();
      return;
    }

    // Tiger Knee (QCF motion or SP1 key)
    const isSP1 = (inputManager.checkQCF(pNum) && anyAttackJust) || inputState.sp1Just || inputManager.peekAction(pNum) === 'SP1';
    if (isSP1) {
      inputManager.consumeBuffer(pNum);
      this.startTigerKnee();
      return;
    }

    // Iron Teep (QCB motion or SP3 key)
    const isSP3 = (inputManager.checkQCB(pNum) && anyAttackJust) || inputState.sp3Just || inputManager.peekAction(pNum) === 'SP3';
    if (isSP3) {
      inputManager.consumeBuffer(pNum);
      this.startIronTeep();
      return;
    }

    // 5. Dash
    if (!this.isAttacking()) {
      if (inputState.dashFwd) { this.startDash(true); return; }
      if (inputState.dashBack) { this.startDash(false); return; }
    }

    // 6. Normals
    const lpT = inputState.lpJust || inputManager.peekAction(pNum) === 'LP';
    const hpT = inputState.hpJust || inputManager.peekAction(pNum) === 'HP';
    const lkT = inputState.lkJust || inputManager.peekAction(pNum) === 'LK';
    const hkT = inputState.hkJust || inputManager.peekAction(pNum) === 'HK';

    if (inputState.down) {
      if (lpT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.CROUCH_LIGHT_PUNCH, true); soundFX.playWhoosh('light'); return; }
      if (hpT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.CROUCH_HEAVY_PUNCH, true); soundFX.playWhoosh('heavy'); return; }
      if (lkT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.CROUCH_LIGHT_KICK, true); soundFX.playWhoosh('light'); return; }
      if (hkT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.CROUCH_HEAVY_KICK, true); soundFX.playWhoosh('heavy'); return; }
      this.changeState(FIGHTER_STATE.CROUCH);
      return;
    }

    if (lpT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.ATTACK_LIGHT_PUNCH, true); soundFX.playWhoosh('light'); return; }
    if (hpT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH, true); soundFX.playWhoosh('heavy'); return; }
    if (lkT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.ATTACK_LIGHT_KICK, true); soundFX.playWhoosh('light'); return; }
    if (hkT) { inputManager.consumeAction(pNum); this.changeState(FIGHTER_STATE.ATTACK_HEAVY_KICK, true); soundFX.playWhoosh('heavy'); return; }

    // 7. Jump
    if (inputState.up) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.changeState(FIGHTER_STATE.JUMP);
      if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 3.8;
      else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 3.8;
      return;
    }

    // 8. Walk
    if (inputState.fwd) {
      this.vx = (this.facingRight ? 1 : -1) * this.walkSpeed;
      this.changeState(FIGHTER_STATE.WALK_FWD);
    } else if (inputState.back) {
      this.vx = (this.facingRight ? -1 : 1) * (this.walkSpeed * 0.75);
      this.changeState(FIGHTER_STATE.WALK_BACK);
    } else {
      this.changeState(FIGHTER_STATE.IDLE);
    }
  }

  startTigerKnee() {
    this.changeState(FIGHTER_STATE.SPECIAL_1);
    soundFX.playWhoosh('heavy');
    this.isGrounded = false;
    this.vy = -6;
    this.vx = (this.facingRight ? 1 : -1) * 7;
  }

  startCycloneElbow() {
    this.changeState(FIGHTER_STATE.SPECIAL_2);
    soundFX.playWhoosh('heavy');
    this.vx = (this.facingRight ? 1 : -1) * 3;
  }

  startIronTeep() {
    this.changeState(FIGHTER_STATE.SPECIAL_3);
    soundFX.playWhoosh('light');
  }

  startDirtyTactic() {
    this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
    soundFX.playPocketSand();
    const originX = this.facingRight ? this.x + 50 : this.x + 10;
    for (let i = 0; i < 18; i++) {
      this.tacticalParticles.push({
        x: originX,
        y: this.y - 65 + (Math.random() - 0.5) * 18,
        vx: (this.facingRight ? 1 : -1) * (4 + Math.random() * 5),
        vy: (Math.random() - 0.5) * 3,
        size: 2 + Math.random() * 3,
        alpha: 1.0,
        color: Math.random() < 0.5 ? '#d97706' : '#fef3c7'
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
      detail: { fighter: this.id, playerNum: this.playerNum, name: this.name, ultimateName: 'ANCIENT TIGER WRATH' }
    }));
  }

  updateState(opponent) {
    this.animTimer++;
    const frames = this.sprites[this.state] || this.sprites.IDLE;

    switch (this.state) {
      case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 7) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 34, 48, 18);
          this.currentAttackData = { damage: 35, hitStun: 12, blockStun: 8, pushback: 3, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.LIGHT };
        } else if (this.stateTimer <= 12) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 12) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 30, 58, 22);
          this.currentAttackData = { damage: 70, hitStun: 22, blockStun: 12, pushback: 5, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY };
        } else if (this.stateTimer <= 20) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.ATTACK_LIGHT_KICK:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 8) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 50, 52, 20);
          this.currentAttackData = { damage: 40, hitStun: 14, blockStun: 8, pushback: 3, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
        } else if (this.stateTimer <= 14) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.ATTACK_HEAVY_KICK:
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 13) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 40, 70, 26);
          this.currentAttackData = { damage: 85, hitStun: 24, blockStun: 14, pushback: 6, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY };
        } else if (this.stateTimer <= 22) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.CROUCH_LIGHT_PUNCH:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 7) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 50, 46, 16);
          this.currentAttackData = { damage: 30, hitStun: 10, blockStun: 6, pushback: 2, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
        } else if (this.stateTimer <= 12) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.CROUCH_HEAVY_PUNCH:
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 11) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 44, 56, 20);
          this.currentAttackData = { damage: 65, hitStun: 20, blockStun: 12, pushback: 4, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
        } else if (this.stateTimer <= 18) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.CROUCH_LIGHT_KICK:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 8) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 58, 55, 18);
          this.currentAttackData = { damage: 35, hitStun: 12, blockStun: 6, pushback: 2, height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.LIGHT };
        } else if (this.stateTimer <= 14) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.CROUCH_HEAVY_KICK:
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 11) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 56, 80, 22);
          this.currentAttackData = { damage: 80, hitStun: 26, blockStun: 14, pushback: 5, height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.KNOCKDOWN };
        } else if (this.stateTimer <= 20) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.JUMP_PUNCH:
        this.animFrame = 1;
        this.activeHitbox = new Box(36, 32, 55, 28);
        this.currentAttackData = { damage: 70, hitStun: 18, blockStun: 14, pushback: 4, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
        break;

      case FIGHTER_STATE.JUMP_KICK:
        this.animFrame = 1;
        this.activeHitbox = new Box(36, 38, 62, 24);
        this.currentAttackData = { damage: 80, hitStun: 20, blockStun: 16, pushback: 5, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
        break;

      // SPECIAL 1: TIGER KNEE
      case FIGHTER_STATE.SPECIAL_1:
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 12) {
          this.animFrame = 1;
          this.activeHitbox = new Box(30, 20, 60, 40);
          this.currentAttackData = { damage: 100, hitStun: 26, blockStun: 14, pushback: 6, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
        } else if (this.stateTimer <= 20) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      // SPECIAL 2: CYCLONE ELBOW (2 hits)
      case FIGHTER_STATE.SPECIAL_2:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 8) {
          this.animFrame = 1;
          this.activeHitbox = new Box(32, 28, 55, 30);
          this.currentAttackData = { damage: 60, hitStun: 16, blockStun: 10, pushback: 3, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
        } else if (this.stateTimer <= 9) { this.animFrame = 2; this.activeHitbox = null; this.hasHitThisAttack = false; }
        else if (this.stateTimer <= 14) {
          this.animFrame = 3;
          this.activeHitbox = new Box(32, 24, 60, 34);
          this.currentAttackData = { damage: 70, hitStun: 24, blockStun: 14, pushback: 6, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
        } else if (this.stateTimer <= 22) { this.animFrame = 4; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      // SPECIAL 3: IRON TEEP
      case FIGHTER_STATE.SPECIAL_3:
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 10) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 40, 65, 24);
          this.currentAttackData = { damage: 65, hitStun: 20, blockStun: 12, pushback: 9, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
        } else if (this.stateTimer <= 18) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      // ULTIMATE: ANCIENT TIGER WRATH
      case FIGHTER_STATE.ULTIMATE:
        if (this.stateTimer <= 18) {
          this.animFrame = Math.floor(this.stateTimer / 5);
          this.vx = 0;
        } else if (this.stateTimer === 20 && this.ultimateTarget) {
          const dist = Math.abs(this.x - this.ultimateTarget.x);
          if (dist < 200) {
            this.x = this.ultimateTarget.x + (this.facingRight ? -60 : 60);
          }
        } else if (this.stateTimer >= 25 && this.stateTimer <= 55) {
          this.animFrame = 4 + (this.stateTimer % 4 < 2 ? 0 : 1);
          if (this.stateTimer % 8 === 0 && this.ultimateTarget && !this.ultimateTarget.isDead) {
            this.ultimateTarget.takeHit({ damage: 80, hitStun: 8, blockStun: 6, pushback: 2, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY }, this.facingRight ? 1 : -1);
            soundFX.playHitHeavy();
          }
        } else if (this.stateTimer === 60 && this.ultimateTarget && !this.ultimateTarget.isDead) {
          this.animFrame = 6;
          this.ultimateTarget.takeHit({ damage: 150, hitStun: 35, blockStun: 20, pushback: 10, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.KNOCKDOWN }, this.facingRight ? 1 : -1);
          soundFX.playHitHeavy();
          soundFX.playKO();
        } else if (this.stateTimer >= 65 && this.stateTimer <= 80) {
          this.animFrame = 7;
        } else if (this.stateTimer > 80) {
          this.isInvincible = false;
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.DIRTY_TACTIC:
        if (this.stateTimer <= 6) {
          this.animFrame = 0;
        } else if (this.stateTimer <= 15) {
          this.animFrame = 1;
          this.activeHitbox = new Box(38, 18, 70, 38);
          this.currentAttackData = {
            damage: 50,
            hitStun: 70,
            blockStun: 20,
            pushback: 4,
            height: ATTACK_HEIGHT.UNBLOCKABLE,
            hitType: HIT_TYPE.DIRTY_STUN,
            stunFrames: 70
          };
        } else if (this.stateTimer <= 25) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
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
