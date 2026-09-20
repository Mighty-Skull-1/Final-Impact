// Final Impact - Raven (The Tactical Commando)
import { Fighter } from './Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE } from '../engine/Constants.js';
import { Box } from '../engine/Hitbox.js';
import { Projectile } from '../engine/Projectiles.js';
import { soundFX } from '../audio/SoundFX.js';

export class Raven extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'raven',
      name: 'RAVEN'
    });
    this.walkSpeed = 3.4;
    this.dashSpeed = 7.5;
    this.jumpForce = -13.0;
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

    // 1. Naruto-Style Ultimate Jutsu Check
    const canSuper = this.superMeter >= 100 || inputManager.easyInputs;
    const wantsUltimate = inputState.ultimateJust || inputManager.peekAction(pNum) === 'ULTIMATE';
    if (wantsUltimate && canSuper) {
      if (this.canCancelOnHit() || !this.isAttacking()) {
        inputManager.consumeBuffer(pNum);
        this.startUltimate(opponent);
        return;
      }
    }

    // Dirty Tactic: Concealed Taser Shock (KeyC, Numpad3, or buffered DIRTY)
    const wantsDirty = inputState.dirtyJust || inputManager.peekAction(pNum) === 'DIRTY';
    if (wantsDirty && this.isGrounded && (!this.isAttacking() || this.canCancelOnHit())) {
      inputManager.consumeAction(pNum);
      this.startTaserShock();
      return;
    }

    // 2. Airborne state checks
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

    // 3. Attack State Protection
    if (this.isAttacking() && !this.canCancelOnHit()) {
      return;
    }

    // 4. Special Moves
    // Flash Somersault (Anti-air kick)
    const isSomersault = ((inputManager.checkChargeDownUp(pNum) || inputManager.checkDP(pNum)) && (inputState.lkJust || inputState.hkJust || inputState.lk || inputState.hk)) || inputState.sp2Just || inputState.sp2 || inputManager.peekAction(pNum) === 'SP2';
    if (isSomersault) {
      inputManager.consumeBuffer(pNum);
      this.startFlashKick();
      return;
    }

    // Sonic Blade (Golden razor projectile)
    const isSonicBlade = ((inputManager.checkChargeBackFwd(pNum) || inputManager.checkQCF(pNum)) && (inputState.lpJust || inputState.hpJust || inputState.lp || inputState.hp)) || inputState.sp1Just || inputState.sp1 || inputManager.peekAction(pNum) === 'SP1';
    if (isSonicBlade) {
      inputManager.consumeBuffer(pNum);
      this.startSonicBlade();
      return;
    }

    // Blitz Knuckle
    const isBlitz = (inputManager.checkQCB(pNum) && (inputState.lpJust || inputState.hpJust || inputState.lp || inputState.hp)) || inputState.sp3Just || inputState.sp3 || inputManager.peekAction(pNum) === 'SP3';
    if (isBlitz) {
      inputManager.consumeBuffer(pNum);
      this.startBlitzKnuckle();
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

    // 7. Movement
    if (this.isAttacking() || this.state === FIGHTER_STATE.DASH_FWD || this.state === FIGHTER_STATE.DASH_BACK) {
      return;
    }

    if (inputState.up) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.changeState(FIGHTER_STATE.JUMP);
      if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 3.5;
      else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 3.5;
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

  startSonicBlade() {
    this.changeState(FIGHTER_STATE.SPECIAL_1);
    soundFX.playSonicBlade();
  }

  startFlashKick() {
    this.changeState(FIGHTER_STATE.SPECIAL_2);
    soundFX.playFlashKick();
    this.isInvincible = true;
    this.isGrounded = false;
    this.vy = -12.5;
    this.vx = (this.facingRight ? 1 : -1) * 1.6;
  }

  startBlitzKnuckle() {
    this.changeState(FIGHTER_STATE.SPECIAL_3);
    soundFX.playWhoosh('heavy');
    this.vx = (this.facingRight ? 1 : -1) * 8.0;
  }

  // Dirty Tactic: Concealed Taser Shock
  startTaserShock() {
    this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
    soundFX.playTaserShock();
    const originX = this.facingRight ? this.x + 52 : this.x + 8;
    for (let i = 0; i < 18; i++) {
      this.tacticalParticles.push({
        x: originX + (Math.random() - 0.5) * 10,
        y: this.y - 50 + (Math.random() - 0.5) * 16,
        vx: (this.facingRight ? 1 : -1) * (3.0 + Math.random() * 4.0),
        vy: (Math.random() - 0.5) * 3.0,
        size: 2 + Math.random() * 3,
        alpha: 1.0,
        color: Math.random() < 0.7 ? '#38bdf8' : '#ffffff'
      });
    }
  }

  // Naruto-Style Ultimate Jutsu: TACTICAL OVERDRIVE (超戦術・雷光撃)
  startUltimate(opponent) {
    this.superMeter = 0;
    this.changeState(FIGHTER_STATE.ULTIMATE);
    this.ultimateTarget = opponent;
    this.isInvincible = true;
    soundFX.playUltimateActivation();
    window.dispatchEvent(new CustomEvent('ultimate-activated', {
      detail: {
        fighter: this,
        name: 'TACTICAL OVERDRIVE: APEX STRIKE',
        kanji: '超戦術・雷光撃',
        subtitle: 'SECRET TECHNIQUE // APEX BOMBARDMENT'
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
            damage: 42,
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
            damage: 100,
            hitStun: 22,
            blockStun: 16,
            pushback: 8,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.HEAVY
          };
        } else if (this.stateTimer <= 21) {
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
            damage: 42,
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

      case FIGHTER_STATE.ATTACK_HEAVY_KICK:
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 10) this.animFrame = 1;
        else if (this.stateTimer <= 15) {
          this.animFrame = 2;
          this.activeHitbox = new Box(38, 14, 78, 28);
          this.currentAttackData = {
            damage: 110,
            hitStun: 24,
            blockStun: 16,
            pushback: 8,
            height: ATTACK_HEIGHT.MID,
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
            damage: 38,
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
            damage: 95,
            hitStun: 24,
            blockStun: 14,
            pushback: 7,
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
            damage: 40,
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
            damage: 90,
            hitStun: 28,
            blockStun: 14,
            pushback: 6,
            height: ATTACK_HEIGHT.LOW,
            hitType: HIT_TYPE.KNOCKDOWN
          };
        } else if (this.stateTimer <= 21) {
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
          damage: 80,
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
          damage: 90,
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
              type: 'sonic_blade',
              x: pX,
              y: this.y - 58,
              vx: (this.facingRight ? 1 : -1) * 8.8,
              damage: 80
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
          this.activeHitbox = new Box(20, -18, 72, 62);
          this.currentAttackData = {
            damage: 135,
            hitStun: 30,
            blockStun: 18,
            pushback: 6,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.KNOCKDOWN,
            chipDamage: 18
          };
        } else if (this.stateTimer <= 14) {
          this.animFrame = 2;
          this.activeHitbox = new Box(20, -26, 72, 62);
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
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 16) {
          this.animFrame = 2;
          this.activeHitbox = new Box(35, 20, 80, 30);
          this.currentAttackData = {
            damage: 105,
            hitStun: 24,
            blockStun: 14,
            pushback: 8,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.KNOCKDOWN
          };
        } else if (this.stateTimer <= 23) {
          this.animFrame = 3;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      // ==========================================
      // NARUTO-STYLE CINEMATIC ULTIMATE: APEX STRIKE
      // ==========================================
      case FIGHTER_STATE.ULTIMATE:
        if (this.stateTimer <= 20) {
          this.animFrame = 0;
          this.vx = 0;
          this.addAfterImage();
        } else if (this.stateTimer <= 36) {
          this.animFrame = 1;
          this.vx = (this.facingRight ? 1 : -1) * 14;
          this.addAfterImage();
          this.activeHitbox = new Box(40, 16, 50, 44);
          this.currentAttackData = {
            damage: 350,
            hitStun: 60,
            blockStun: 25,
            pushback: 10,
            height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.KNOCKDOWN,
            chipDamage: 50
          };
        } else if (this.stateTimer <= 65) {
          this.animFrame = 2;
          this.activeHitbox = null;
          this.vx *= 0.85;
          if (this.stateTimer === 38) {
            soundFX.playUltimateFinisher();
          }
        } else if (this.stateTimer <= 85) {
          this.animFrame = 3;
          this.isInvincible = false;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.DIRTY_TACTIC:
        // Startup (0 - 5): concealed draw
        if (this.stateTimer <= 5) {
          this.animFrame = 0;
        }
        // Active (6 - 15): electric taser shock thrust
        else if (this.stateTimer <= 15) {
          this.animFrame = 1;
          this.activeHitbox = new Box(40, 22, 65, 35);
          this.currentAttackData = {
            damage: 55,
            hitStun: 60,
            blockStun: 18,
            pushback: 4,
            height: ATTACK_HEIGHT.UNBLOCKABLE,
            hitType: HIT_TYPE.DIRTY_STUN,
            stunFrames: 60
          };
        }
        // Recovery (16 - 24)
        else if (this.stateTimer <= 24) {
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
