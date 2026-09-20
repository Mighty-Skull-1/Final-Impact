// Final Impact - Zephyr (The Wind Dancer)
// Style: Capoeira / Breakdance Acrobat
import { Fighter } from './Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE } from '../engine/Constants.js';
import { Box } from '../engine/Hitbox.js';
import { soundFX } from '../audio/SoundFX.js';

export class Zephyr extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'zephyr',
      name: 'ZEPHYR'
    });
    this.walkSpeed = 4.5;
    this.dashSpeed = 9.5;
    this.jumpForce = -15.0;
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

    // 4. Specials
    const isSP1 = (inputManager.checkQCF(pNum) && (inputState.lkJust || inputState.hkJust)) || inputState.sp1Just || inputManager.peekAction(pNum) === 'SP1';
    if (isSP1) { inputManager.consumeBuffer(pNum); this.startWindmillKick(); return; }

    const isSP2 = (inputManager.checkDP(pNum) && (inputState.lpJust || inputState.hpJust)) || inputState.sp2Just || inputManager.peekAction(pNum) === 'SP2';
    if (isSP2) { inputManager.consumeBuffer(pNum); this.startHandstandAxe(); return; }

    const isSP3 = (inputManager.checkQCB(pNum) && (inputState.lkJust || inputState.hkJust)) || inputState.sp3Just || inputManager.peekAction(pNum) === 'SP3';
    if (isSP3) { inputManager.consumeBuffer(pNum); this.startFlareSlide(); return; }

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
      if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 4.2;
      else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 4.2;
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

  startWindmillKick() {
    this.changeState(FIGHTER_STATE.SPECIAL_1);
    soundFX.playWhoosh('heavy');
    this.isInvincible = true;
    setTimeout(() => { this.isInvincible = false; }, 66);
    this.vx = (this.facingRight ? 1 : -1) * 3;
  }

  startHandstandAxe() {
    this.changeState(FIGHTER_STATE.SPECIAL_2);
    soundFX.playWhoosh('heavy');
  }

  startFlareSlide() {
    this.changeState(FIGHTER_STATE.SPECIAL_3);
    soundFX.playWhoosh('heavy');
    this.vx = (this.facingRight ? 1 : -1) * 6;
  }

  startDirtyTactic() {
    this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
    soundFX.playPocketSand();
    const originX = this.facingRight ? this.x + 50 : this.x + 10;
    for (let i = 0; i < 16; i++) {
      this.tacticalParticles.push({
        x: originX,
        y: this.y - 60 + (Math.random() - 0.5) * 20,
        vx: (this.facingRight ? 1 : -1) * (3.5 + Math.random() * 5),
        vy: (Math.random() - 0.5) * 4,
        size: 2 + Math.random() * 3,
        alpha: 1.0,
        color: Math.random() < 0.5 ? '#22c55e' : '#4ade80'
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
      detail: { fighter: this.id, playerNum: this.playerNum, name: this.name, ultimateName: 'RHYTHM OF THE TEMPEST' }
    }));
  }

  updateState(opponent) {
    super.updateState(opponent);

    switch (this.state) {
      case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
        if (this.stateTimer <= 2) this.animFrame = 0;
        else if (this.stateTimer <= 6) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 34, 46, 16);
          this.currentAttackData = { damage: 30, hitStun: 10, blockStun: 6, pushback: 2, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.LIGHT };
        } else if (this.stateTimer <= 10) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 10) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 30, 54, 20);
          this.currentAttackData = { damage: 65, hitStun: 20, blockStun: 12, pushback: 5, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY };
        } else if (this.stateTimer <= 18) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.ATTACK_LIGHT_KICK:
        if (this.stateTimer <= 2) this.animFrame = 0;
        else if (this.stateTimer <= 7) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 48, 50, 18);
          this.currentAttackData = { damage: 35, hitStun: 12, blockStun: 7, pushback: 3, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
        } else if (this.stateTimer <= 11) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.ATTACK_HEAVY_KICK:
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 12) {
          this.animFrame = 1;
          this.activeHitbox = new Box(32, 38, 68, 24);
          this.currentAttackData = { damage: 80, hitStun: 22, blockStun: 14, pushback: 6, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY };
        } else if (this.stateTimer <= 21) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.CROUCH_LIGHT_PUNCH:
        if (this.stateTimer <= 2) this.animFrame = 0;
        else if (this.stateTimer <= 6) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 50, 44, 14);
          this.currentAttackData = { damage: 25, hitStun: 8, blockStun: 5, pushback: 2, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
        } else if (this.stateTimer <= 10) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.CROUCH_HEAVY_PUNCH:
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 10) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 44, 52, 18);
          this.currentAttackData = { damage: 60, hitStun: 18, blockStun: 10, pushback: 4, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
        } else if (this.stateTimer <= 16) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.CROUCH_LIGHT_KICK:
        if (this.stateTimer <= 2) this.animFrame = 0;
        else if (this.stateTimer <= 7) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 58, 52, 16);
          this.currentAttackData = { damage: 30, hitStun: 10, blockStun: 5, pushback: 2, height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.LIGHT };
        } else if (this.stateTimer <= 11) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.CROUCH_HEAVY_KICK:
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 10) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 56, 78, 20);
          this.currentAttackData = { damage: 75, hitStun: 24, blockStun: 12, pushback: 5, height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.KNOCKDOWN };
        } else if (this.stateTimer <= 18) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.JUMP_PUNCH:
        this.animFrame = 1;
        this.activeHitbox = new Box(36, 30, 50, 26);
        this.currentAttackData = { damage: 60, hitStun: 16, blockStun: 12, pushback: 3, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
        break;

      case FIGHTER_STATE.JUMP_KICK:
        this.animFrame = 1;
        this.activeHitbox = new Box(30, 36, 60, 22);
        this.currentAttackData = { damage: 70, hitStun: 18, blockStun: 14, pushback: 4, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
        break;

      // SPECIAL 1: WINDMILL KICK
      case FIGHTER_STATE.SPECIAL_1:
        if (this.stateTimer <= 4) { this.animFrame = 0; }
        else if (this.stateTimer <= 15) {
          this.animFrame = 1 + (this.stateTimer % 3);
          this.activeHitbox = new Box(24, 28, 90, 36);
          this.currentAttackData = { damage: 90, hitStun: 24, blockStun: 14, pushback: 6, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
        } else if (this.stateTimer <= 22) { this.animFrame = 4; this.activeHitbox = null; }
        else { this.isInvincible = false; this.changeState(FIGHTER_STATE.IDLE); }
        break;

      // SPECIAL 2: HANDSTAND AXE HEEL
      case FIGHTER_STATE.SPECIAL_2:
        if (this.stateTimer <= 6) this.animFrame = 0;
        else if (this.stateTimer <= 14) {
          this.animFrame = 1;
          this.activeHitbox = new Box(30, 10, 55, 50);
          this.currentAttackData = { damage: 95, hitStun: 28, blockStun: 16, pushback: 5, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY };
        } else if (this.stateTimer <= 24) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      // SPECIAL 3: BBOY FLARE SLIDE
      case FIGHTER_STATE.SPECIAL_3:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 12) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 58, 75, 20);
          this.currentAttackData = { damage: 70, hitStun: 22, blockStun: 12, pushback: 7, height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.KNOCKDOWN };
        } else if (this.stateTimer <= 20) { this.animFrame = 2; this.activeHitbox = null; this.vx *= 0.5; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      // ULTIMATE: RHYTHM OF THE TEMPEST
      case FIGHTER_STATE.ULTIMATE:
        if (this.stateTimer <= 18) {
          this.animFrame = Math.floor(this.stateTimer / 5);
          this.vx = 0;
        } else if (this.stateTimer === 20 && this.ultimateTarget) {
          const dist = Math.abs(this.x - this.ultimateTarget.x);
          if (dist < 200) {
            this.x = this.ultimateTarget.x + (this.facingRight ? -60 : 60);
          }
        } else if (this.stateTimer >= 25 && this.stateTimer <= 60) {
          this.animFrame = 4 + (this.stateTimer % 4 < 2 ? 0 : 1);
          if (this.stateTimer % 7 === 0 && this.ultimateTarget && !this.ultimateTarget.isDead) {
            this.ultimateTarget.takeHit({ damage: 65, hitStun: 8, blockStun: 6, pushback: 2, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY }, this.facingRight ? 1 : -1);
            soundFX.playHitHeavy();
          }
        } else if (this.stateTimer === 65 && this.ultimateTarget && !this.ultimateTarget.isDead) {
          this.animFrame = 6;
          this.ultimateTarget.takeHit({ damage: 130, hitStun: 35, blockStun: 20, pushback: 10, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.KNOCKDOWN }, this.facingRight ? 1 : -1);
          soundFX.playHitHeavy();
          soundFX.playKO();
        } else if (this.stateTimer >= 70 && this.stateTimer <= 85) {
          this.animFrame = 7;
        } else if (this.stateTimer > 85) {
          this.isInvincible = false;
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;
    }
  }
}
