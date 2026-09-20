// Final Impact - Colossus (The Iron Wall)
// Style: Heavyweight Boxing Juggernaut
import { Fighter } from './Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE } from '../engine/Constants.js';
import { Box } from '../engine/Hitbox.js';
import { soundFX } from '../audio/SoundFX.js';

export class Colossus extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'colossus',
      name: 'COLOSSUS'
    });
    this.walkSpeed = 2.8;
    this.dashSpeed = 6.5;
    this.jumpForce = -11.5;
    this.superArmorActive = false;
    this.ultimateTarget = null;
  }

  takeHit(attackData, fromDirection) {
    // Super Armor: absorb light hits during startup without flinching
    if (this.superArmorActive && attackData.hitType === HIT_TYPE.LIGHT) {
      soundFX.playBlock();
      this.health = Math.max(1, this.health - Math.floor(attackData.damage * 0.5));
      this.armorFlash = 5;
      return 'armored';
    }
    return super.takeHit(attackData, fromDirection);
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

    // 4. Specials (Leading-edge and buffer only)
    const anyAttackJust = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust;

    // Corkscrew Uppercut (DP motion or SP2 key - check DP first)
    const isSP2 = (inputManager.checkDP(pNum) && anyAttackJust) || inputState.sp2Just || inputManager.peekAction(pNum) === 'SP2';
    if (isSP2) { inputManager.consumeBuffer(pNum); this.startCorkscrewUppercut(); return; }

    // Dempsey Blow (QCF motion or SP1 key)
    const isSP1 = (inputManager.checkQCF(pNum) && anyAttackJust) || inputState.sp1Just || inputManager.peekAction(pNum) === 'SP1';
    if (isSP1) { inputManager.consumeBuffer(pNum); this.startDempseyBlow(); return; }

    // Gazelle Punch (QCB motion or SP3 key)
    const isSP3 = (inputManager.checkQCB(pNum) && anyAttackJust) || inputState.sp3Just || inputManager.peekAction(pNum) === 'SP3';
    if (isSP3) { inputManager.consumeBuffer(pNum); this.startGazellePunch(); return; }

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
      if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 2.8;
      else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 2.8;
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

  startDempseyBlow() {
    this.changeState(FIGHTER_STATE.SPECIAL_1);
    soundFX.playWhoosh('heavy');
    this.superArmorActive = true;
  }

  startCorkscrewUppercut() {
    this.changeState(FIGHTER_STATE.SPECIAL_2);
    soundFX.playShoryuken();
    this.isInvincible = true;
    this.isGrounded = false;
    this.vy = -10;
    this.vx = (this.facingRight ? 1 : -1) * 3;
  }

  startGazellePunch() {
    this.changeState(FIGHTER_STATE.SPECIAL_3);
    soundFX.playWhoosh('heavy');
    this.vx = (this.facingRight ? 1 : -1) * 6;
  }

  startDirtyTactic() {
    this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
    soundFX.playPocketSand();
    const originX = this.facingRight ? this.x + 55 : this.x + 5;
    for (let i = 0; i < 20; i++) {
      this.tacticalParticles.push({
        x: originX,
        y: this.y - 60 + (Math.random() - 0.5) * 20,
        vx: (this.facingRight ? 1 : -1) * (4 + Math.random() * 5),
        vy: (Math.random() - 0.5) * 3.5,
        size: 2 + Math.random() * 3,
        alpha: 1.0,
        color: Math.random() < 0.5 ? '#b91c1c' : '#fbbf24'
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
      detail: { fighter: this.id, playerNum: this.playerNum, name: this.name, ultimateName: 'DEMPSEY ROLL' }
    }));
  }

  updateState(opponent) {
    this.animTimer++;
    const frames = this.sprites[this.state] || this.sprites.IDLE;

    switch (this.state) {
      case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 9) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 32, 52, 20);
          this.currentAttackData = { damage: 45, hitStun: 14, blockStun: 8, pushback: 4, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.LIGHT };
        } else if (this.stateTimer <= 14) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
        if (this.stateTimer <= 7) this.animFrame = 0;
        else if (this.stateTimer <= 15) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 28, 62, 26);
          this.currentAttackData = { damage: 90, hitStun: 26, blockStun: 16, pushback: 7, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY };
        } else if (this.stateTimer <= 24) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.ATTACK_LIGHT_KICK:
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 10) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 50, 54, 22);
          this.currentAttackData = { damage: 40, hitStun: 14, blockStun: 8, pushback: 4, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
        } else if (this.stateTimer <= 15) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.ATTACK_HEAVY_KICK:
        if (this.stateTimer <= 7) this.animFrame = 0;
        else if (this.stateTimer <= 16) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 40, 72, 28);
          this.currentAttackData = { damage: 95, hitStun: 28, blockStun: 16, pushback: 8, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.KNOCKDOWN };
        } else if (this.stateTimer <= 26) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.CROUCH_LIGHT_PUNCH:
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 9) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 50, 50, 18);
          this.currentAttackData = { damage: 40, hitStun: 12, blockStun: 7, pushback: 3, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.LIGHT };
        } else if (this.stateTimer <= 14) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.CROUCH_HEAVY_PUNCH:
        if (this.stateTimer <= 6) this.animFrame = 0;
        else if (this.stateTimer <= 14) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 42, 58, 22);
          this.currentAttackData = { damage: 85, hitStun: 24, blockStun: 14, pushback: 6, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
        } else if (this.stateTimer <= 22) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.CROUCH_LIGHT_KICK:
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 10) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 58, 58, 18);
          this.currentAttackData = { damage: 35, hitStun: 12, blockStun: 6, pushback: 3, height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.LIGHT };
        } else if (this.stateTimer <= 15) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.CROUCH_HEAVY_KICK:
        if (this.stateTimer <= 6) this.animFrame = 0;
        else if (this.stateTimer <= 14) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 56, 85, 24);
          this.currentAttackData = { damage: 90, hitStun: 28, blockStun: 16, pushback: 7, height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.KNOCKDOWN };
        } else if (this.stateTimer <= 24) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.CROUCH);
        break;

      case FIGHTER_STATE.JUMP_PUNCH:
        this.animFrame = 1;
        this.activeHitbox = new Box(36, 28, 58, 30);
        this.currentAttackData = { damage: 80, hitStun: 20, blockStun: 16, pushback: 5, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
        break;

      case FIGHTER_STATE.JUMP_KICK:
        this.animFrame = 1;
        this.activeHitbox = new Box(36, 36, 60, 26);
        this.currentAttackData = { damage: 85, hitStun: 22, blockStun: 16, pushback: 6, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
        break;

      // SPECIAL 1: DEMPSEY BODY BLOW (Super Armor during startup)
      case FIGHTER_STATE.SPECIAL_1:
        if (this.stateTimer <= 8) {
          this.animFrame = 0;
          this.superArmorActive = true;
        } else if (this.stateTimer <= 16) {
          this.animFrame = 1;
          this.superArmorActive = false;
          this.activeHitbox = new Box(36, 34, 65, 30);
          this.currentAttackData = { damage: 140, hitStun: 32, blockStun: 18, pushback: 8, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
        } else if (this.stateTimer <= 26) { this.animFrame = 2; this.activeHitbox = null; }
        else { this.superArmorActive = false; this.changeState(FIGHTER_STATE.IDLE); }
        break;

      // SPECIAL 2: CORKSCREW UPPERCUT
      case FIGHTER_STATE.SPECIAL_2:
        if (this.stateTimer <= 5) {
          this.animFrame = 0;
        } else if (this.stateTimer <= 12) {
          this.animFrame = 1;
          this.activeHitbox = new Box(28, -10, 65, 55);
          this.currentAttackData = { damage: 120, hitStun: 30, blockStun: 16, pushback: 6, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.HEAVY };
        } else if (this.stateTimer <= 20) {
          this.animFrame = 2;
          this.activeHitbox = null;
          this.isInvincible = false;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      // SPECIAL 3: GAZELLE PUNCH
      case FIGHTER_STATE.SPECIAL_3:
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 12) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 28, 60, 32);
          this.currentAttackData = { damage: 100, hitStun: 26, blockStun: 14, pushback: 7, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY };
        } else if (this.stateTimer <= 20) { this.animFrame = 2; this.activeHitbox = null; }
        else this.changeState(FIGHTER_STATE.IDLE);
        break;

      // ULTIMATE: DEMPSEY ROLL
      case FIGHTER_STATE.ULTIMATE:
        if (this.stateTimer <= 18) {
          this.animFrame = Math.floor(this.stateTimer / 5);
          this.vx = 0;
        } else if (this.stateTimer === 20 && this.ultimateTarget) {
          const dist = Math.abs(this.x - this.ultimateTarget.x);
          if (dist < 200) {
            this.x = this.ultimateTarget.x + (this.facingRight ? -60 : 60);
          }
        } else if (this.stateTimer >= 25 && this.stateTimer <= 65) {
          this.animFrame = 4 + (this.stateTimer % 4 < 2 ? 0 : 1);
          if (this.stateTimer % 7 === 0 && this.ultimateTarget && !this.ultimateTarget.isDead) {
            this.ultimateTarget.takeHit({ damage: 70, hitStun: 8, blockStun: 6, pushback: 1, height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY }, this.facingRight ? 1 : -1);
            soundFX.playHitHeavy();
          }
        } else if (this.stateTimer === 70 && this.ultimateTarget && !this.ultimateTarget.isDead) {
          this.animFrame = 6;
          this.ultimateTarget.takeHit({ damage: 180, hitStun: 40, blockStun: 22, pushback: 12, height: ATTACK_HEIGHT.HIGH, hitType: HIT_TYPE.KNOCKDOWN }, this.facingRight ? 1 : -1);
          soundFX.playHitHeavy();
          soundFX.playKO();
        } else if (this.stateTimer >= 75 && this.stateTimer <= 90) {
          this.animFrame = 7;
        } else if (this.stateTimer > 90) {
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
