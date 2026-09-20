// Final Impact - Kazuki (The Dragon Striker)
import { Fighter } from './Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE } from '../engine/Constants.js';
import { Box } from '../engine/Hitbox.js';
import { Projectile } from '../engine/Projectiles.js';
import { soundFX } from '../audio/SoundFX.js';

export class Kazuki extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'kazuki',
      name: 'KAZUKI'
    });
    this.spawnProjectile = null;
    this.ultimateTarget = null;
  }

  handleInput(inputState, inputManager, opponent) {
    if (this.hitStun > 0 || this.blockStun > 0 || this.state === FIGHTER_STATE.KNOCKDOWN) {
      return;
    }

    if (this.state === FIGHTER_STATE.SUBMISSION_LOCK) {
      if (inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputState.dirtyJust) {
        this.submissionStruggle = Math.min(100, (this.submissionStruggle || 0) + 14);
        soundFX.playWhoosh('light');
      }
      return;
    }

    const pNum = this.playerNum;

    // Environmental Weapon Pickup Attack
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

    // 1. Naruto-Style Ultimate Jutsu Check (Spacebar, HP+HK, or buffered action)
    const canSuper = this.superMeter >= 100 || inputManager.easyInputs;
    const wantsUltimate = inputState.ultimateJust || inputManager.peekAction(pNum) === 'ULTIMATE';
    if (wantsUltimate && canSuper) {
      if (this.canCancelOnHit() || !this.isAttacking()) {
        inputManager.consumeBuffer(pNum);
        this.startUltimate(opponent);
        return;
      }
    }

    // Dirty Tactic: Pocket Gravel / Sand Blind (KeyC, Numpad3, or buffered DIRTY)
    const wantsDirty = inputState.dirtyJust || inputManager.peekAction(pNum) === 'DIRTY';
    if (wantsDirty && this.isGrounded && (!this.isAttacking() || this.canCancelOnHit())) {
      inputManager.consumeAction(pNum);
      this.startPocketSand();
      return;
    }

    // 2. Airborne moves
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

    // 3. Attack State Protection: If currently attacking, cannot be interrupted by movement unless cancelled on hit!
    if (this.isAttacking() && !this.canCancelOnHit()) {
      return;
    }

    // 4. Ground Special Moves Check
    // Shoryuken (Dragon Uppercut)
    const isDP = (inputManager.checkDP(pNum) && (inputState.lpJust || inputState.hpJust || inputState.lp || inputState.hp)) || inputState.sp2Just || inputState.sp2 || inputManager.peekAction(pNum) === 'SP2';
    if (isDP) {
      inputManager.consumeBuffer(pNum);
      this.startShoryuken();
      return;
    }

    // Hadouken (Ki Fireball)
    const isQCF = (inputManager.checkQCF(pNum) && (inputState.lpJust || inputState.hpJust || inputState.lp || inputState.hp)) || inputState.sp1Just || inputState.sp1 || inputManager.peekAction(pNum) === 'SP1';
    if (isQCF) {
      inputManager.consumeBuffer(pNum);
      this.startHadouken();
      return;
    }

    // Tatsumaki Senpuukyaku (Hurricane Kick)
    const isQCB = (inputManager.checkQCB(pNum) && (inputState.lkJust || inputState.hkJust || inputState.lk || inputState.hk)) || inputState.sp3Just || inputState.sp3 || inputManager.peekAction(pNum) === 'SP3';
    if (isQCB) {
      inputManager.consumeBuffer(pNum);
      this.startTatsumaki();
      return;
    }

    // 5. Dash Execution
    if (!this.isAttacking()) {
      if (inputState.dashFwd) {
        this.startDash(true);
        return;
      }
      if (inputState.dashBack) {
        this.startDash(false);
        return;
      }
    }

    // 6. Normal Ground Attacks
    const lpTrigger = inputState.lpJust || inputState.lp || inputManager.peekAction(pNum) === 'LP';
    const hpTrigger = inputState.hpJust || inputState.hp || inputManager.peekAction(pNum) === 'HP';
    const lkTrigger = inputState.lkJust || inputState.lk || inputManager.peekAction(pNum) === 'LK';
    const hkTrigger = inputState.hkJust || inputState.hk || inputManager.peekAction(pNum) === 'HK';

    if (inputState.down) {
      if (lpTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.CROUCH_LIGHT_PUNCH, true);
        soundFX.playWhoosh('light');
        return;
      }
      if (hpTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.CROUCH_HEAVY_PUNCH, true);
        soundFX.playWhoosh('heavy');
        return;
      }
      if (lkTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.CROUCH_LIGHT_KICK, true);
        soundFX.playWhoosh('light');
        return;
      }
      if (hkTrigger) {
        inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.CROUCH_HEAVY_KICK, true);
        soundFX.playWhoosh('heavy');
        return;
      }
      if (!this.isAttacking()) {
        this.changeState(FIGHTER_STATE.CROUCH);
      }
      return;
    }

    if (lpTrigger) {
      inputManager.consumeAction(pNum);
      this.changeState(FIGHTER_STATE.ATTACK_LIGHT_PUNCH, true);
      soundFX.playWhoosh('light');
      return;
    }
    if (hpTrigger) {
      inputManager.consumeAction(pNum);
      this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH, true);
      soundFX.playWhoosh('heavy');
      return;
    }
    if (lkTrigger) {
      inputManager.consumeAction(pNum);
      this.changeState(FIGHTER_STATE.ATTACK_LIGHT_KICK, true);
      soundFX.playWhoosh('light');
      return;
    }
    if (hkTrigger) {
      inputManager.consumeAction(pNum);
      this.changeState(FIGHTER_STATE.ATTACK_HEAVY_KICK, true);
      soundFX.playWhoosh('heavy');
      return;
    }

    // 7. Movement (only if not attacking or dashing)
    if (this.isAttacking() || this.state === FIGHTER_STATE.DASH_FWD || this.state === FIGHTER_STATE.DASH_BACK) {
      return;
    }

    if (inputState.up) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.changeState(FIGHTER_STATE.JUMP);
      if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 3.8;
      else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 3.8;
      return;
    }

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

  startHadouken() {
    this.changeState(FIGHTER_STATE.SPECIAL_1);
    soundFX.playHadouken();
  }

  startShoryuken() {
    this.changeState(FIGHTER_STATE.SPECIAL_2);
    soundFX.playShoryuken();
    this.isInvincible = true;
    this.isGrounded = false;
    this.vy = -12.5;
    this.vx = (this.facingRight ? 1 : -1) * 3.8;
  }

  startTatsumaki() {
    this.changeState(FIGHTER_STATE.SPECIAL_3);
    soundFX.playWhoosh('heavy');
    this.isGrounded = false;
    this.vy = -3;
    this.vx = (this.facingRight ? 1 : -1) * 5.2;
  }

  // Dirty Tactic: Pocket Gravel / Sand Toss
  startPocketSand() {
    this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
    soundFX.playPocketSand();
    const originX = this.facingRight ? this.x + 50 : this.x + 10;
    for (let i = 0; i < 22; i++) {
      this.tacticalParticles.push({
        x: originX,
        y: this.y - 65 + (Math.random() - 0.5) * 18,
        vx: (this.facingRight ? 1 : -1) * (4.5 + Math.random() * 5.5),
        vy: (Math.random() - 0.5) * 3.5,
        size: 2 + Math.random() * 3,
        alpha: 1.0,
        color: Math.random() < 0.6 ? '#d97706' : (Math.random() < 0.5 ? '#b45309' : '#fef3c7')
      });
    }
  }

  // Naruto-Style Ultimate Jutsu: DRAGON GOD ROAR (竜神轟天破)
  startUltimate(opponent) {
    this.superMeter = 0;
    this.changeState(FIGHTER_STATE.ULTIMATE);
    this.ultimateTarget = opponent;
    this.isInvincible = true;
    soundFX.playUltimateActivation();
    // Dispatch global anime super freeze event
    window.dispatchEvent(new CustomEvent('ultimate-activated', {
      detail: {
        fighter: this,
        name: 'DRAGON GOD OUGI: RYUJIN GOTENHA',
        kanji: '竜神轟天破',
        subtitle: 'SECRET TECHNIQUE // DRAGON GOD ROAR'
      }
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
          this.activeHitbox = new Box(40, 24, 56, 18);
          this.currentAttackData = {
            damage: 40,
            hitStun: 14,
            blockStun: 10,
            pushback: 4,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.LIGHT
          };
        } else if (this.stateTimer <= 11) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 9) this.animFrame = 1;
        else if (this.stateTimer <= 15) {
          this.animFrame = 2;
          this.activeHitbox = new Box(38, 20, 75, 24);
          this.currentAttackData = {
            damage: 95,
            hitStun: 22,
            blockStun: 16,
            pushback: 7,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.HEAVY
          };
        } else if (this.stateTimer <= 20) {
          this.animFrame = 3;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.ATTACK_LIGHT_KICK:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 7) {
          this.animFrame = 1;
          this.activeHitbox = new Box(40, 44, 58, 20);
          this.currentAttackData = {
            damage: 45,
            hitStun: 14,
            blockStun: 10,
            pushback: 4,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.LIGHT
          };
        } else if (this.stateTimer <= 12) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.ATTACK_HEAVY_KICK:
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 10) this.animFrame = 1;
        else if (this.stateTimer <= 15) {
          this.animFrame = 2;
          this.activeHitbox = new Box(38, 14, 78, 28);
          this.currentAttackData = {
            damage: 105,
            hitStun: 24,
            blockStun: 16,
            pushback: 8,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.HEAVY
          };
        } else if (this.stateTimer <= 22) {
          this.animFrame = 3;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.CROUCH_LIGHT_PUNCH:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 7) {
          this.animFrame = 1;
          this.activeHitbox = new Box(38, 38, 54, 18);
          this.currentAttackData = {
            damage: 35,
            hitStun: 12,
            blockStun: 9,
            pushback: 3,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.LIGHT
          };
        } else if (this.stateTimer <= 11) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.CROUCH);
        }
        break;

      case FIGHTER_STATE.CROUCH_HEAVY_PUNCH:
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 13) {
          this.animFrame = 1;
          this.activeHitbox = new Box(38, 16, 62, 36);
          this.currentAttackData = {
            damage: 90,
            hitStun: 24,
            blockStun: 14,
            pushback: 6,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.KNOCKDOWN
          };
        } else if (this.stateTimer <= 20) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.CROUCH);
        }
        break;

      case FIGHTER_STATE.CROUCH_LIGHT_KICK:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 7) {
          this.animFrame = 1;
          this.activeHitbox = new Box(38, 58, 56, 18);
          this.currentAttackData = {
            damage: 38,
            hitStun: 12,
            blockStun: 9,
            pushback: 4,
            height: ATTACK_HEIGHT.LOW,
            hitType: HIT_TYPE.LIGHT
          };
        } else if (this.stateTimer <= 11) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.CROUCH);
        }
        break;

      case FIGHTER_STATE.CROUCH_HEAVY_KICK:
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 11) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 56, 88, 24);
          this.currentAttackData = {
            damage: 85,
            hitStun: 28,
            blockStun: 14,
            pushback: 6,
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

      case FIGHTER_STATE.JUMP_PUNCH:
        this.animFrame = 1;
        this.activeHitbox = new Box(36, 32, 58, 30);
        this.currentAttackData = {
          damage: 75,
          hitStun: 18,
          blockStun: 14,
          pushback: 4,
          height: ATTACK_HEIGHT.MID,
          hitType: HIT_TYPE.HEAVY
        };
        break;

      case FIGHTER_STATE.JUMP_KICK:
        this.animFrame = 1;
        this.activeHitbox = new Box(36, 38, 65, 26);
        this.currentAttackData = {
          damage: 85,
          hitStun: 20,
          blockStun: 16,
          pushback: 5,
          height: ATTACK_HEIGHT.MID,
          hitType: HIT_TYPE.HEAVY
        };
        break;

      case FIGHTER_STATE.SPECIAL_1:
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 10) this.animFrame = 1;
        else if (this.stateTimer <= 16) {
          this.animFrame = 2;
          if (this.stateTimer === 11 && this.spawnProjectile) {
            const pX = this.facingRight ? this.x + 65 : this.x - 20;
            this.spawnProjectile(new Projectile({
              owner: this,
              type: 'hadouken',
              x: pX,
              y: this.y - 60,
              vx: (this.facingRight ? 1 : -1) * 8.0,
              damage: 75
            }));
          }
        } else if (this.stateTimer <= 25) {
          this.animFrame = 3;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.SPECIAL_2:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 8) {
          this.animFrame = 1;
          this.activeHitbox = new Box(28, -15, 70, 60);
          this.currentAttackData = {
            damage: 130,
            hitStun: 30,
            blockStun: 18,
            pushback: 6,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.KNOCKDOWN,
            chipDamage: 15
          };
        } else if (this.stateTimer <= 15) {
          this.animFrame = 2;
          this.activeHitbox = new Box(28, -25, 70, 60);
        } else if (this.stateTimer <= 22) {
          this.animFrame = 3;
          this.activeHitbox = null;
          this.isInvincible = false;
        } else if (this.stateTimer <= 32) {
          this.animFrame = 4;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.SPECIAL_3:
        this.animFrame = (Math.floor(this.stateTimer / 4)) % 4;
        this.activeHitbox = new Box(10, 26, 85, 26);
        this.currentAttackData = {
          damage: 40,
          hitStun: 16,
          blockStun: 12,
          pushback: 4,
          height: ATTACK_HEIGHT.HIGH,
          hitType: HIT_TYPE.LIGHT
        };
        // Reset hit registration on frame 12 so Tatsumaki can land 2 hits!
        if (this.stateTimer === 12) {
          this.hasHitThisAttack = false;
        }
        if (this.stateTimer > 26) {
          this.activeHitbox = null;
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      // ==========================================
      // NARUTO-STYLE CINEMATIC ULTIMATE: RYUJIN GOTENHA
      // ==========================================
      case FIGHTER_STATE.ULTIMATE:
        // Phase 1: Ki Gathering Stance (Frames 0 - 20)
        if (this.stateTimer <= 20) {
          this.animFrame = 0;
          this.vx = 0;
          this.addAfterImage();
        } 
        // Phase 2: Supersonic Lightning Rush (Frames 21 - 36)
        else if (this.stateTimer <= 36) {
          this.animFrame = 1;
          this.vx = (this.facingRight ? 1 : -1) * 13.5;
          this.addAfterImage();
          this.activeHitbox = new Box(40, 20, 48, 40);
          this.currentAttackData = {
            damage: 340,
            hitStun: 60,
            blockStun: 25,
            pushback: 10,
            height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.KNOCKDOWN,
            chipDamage: 50
          };
        } 
        // Phase 3: Soaring Dragon Blast Detonation (Frames 37 - 65)
        else if (this.stateTimer <= 65) {
          this.animFrame = 2;
          this.activeHitbox = null;
          this.vx *= 0.85;
          if (this.stateTimer === 38) {
            soundFX.playUltimateFinisher();
          }
        } 
        // Phase 4: Cool Victory Landing (Frames 66 - 85)
        else if (this.stateTimer <= 85) {
          this.animFrame = 3;
          this.isInvincible = false;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.DIRTY_TACTIC:
        // Startup (0 - 6): reaches low into sash
        if (this.stateTimer <= 6) {
          this.animFrame = 0;
        } 
        // Active (7 - 15): throws blinding pocket gravel forward
        else if (this.stateTimer <= 15) {
          this.animFrame = 1;
          this.activeHitbox = new Box(38, 18, 72, 40);
          this.currentAttackData = {
            damage: 50,
            hitStun: 70,
            blockStun: 20,
            pushback: 4,
            height: ATTACK_HEIGHT.UNBLOCKABLE,
            hitType: HIT_TYPE.DIRTY_STUN,
            stunFrames: 70
          };
        } 
        // Recovery (16 - 25)
        else if (this.stateTimer <= 25) {
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
