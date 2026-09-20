// Final Impact - Kagura (The Cyber Kunoichi)
import { Fighter } from './Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE } from '../engine/Constants.js';
import { Box } from '../engine/Hitbox.js';
import { Projectile } from '../engine/Projectiles.js';
import { soundFX } from '../audio/SoundFX.js';

export class Kagura extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'kagura',
      name: 'KAGURA'
    });
    this.walkSpeed = 4.2;
    this.dashSpeed = 9.2; // Extra fast ninja dash!
    this.jumpForce = -14.0;
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

    // 1. Naruto Shadow Clone Ultimate Check
    const canSuper = this.superMeter >= 100 || inputManager.easyInputs;
    const wantsUltimate = inputState.ultimateJust || inputManager.peekAction(pNum) === 'ULTIMATE';
    if (wantsUltimate && canSuper) {
      if (this.canCancelOnHit() || !this.isAttacking()) {
        inputManager.consumeBuffer(pNum);
        this.startUltimate(opponent);
        return;
      }
    }

    // Dirty Tactic: Caltrops & Smoke Powder (KeyC, Numpad3, or buffered DIRTY)
    const wantsDirty = inputState.dirtyJust || inputManager.peekAction(pNum) === 'DIRTY';
    if (wantsDirty && this.isGrounded && (!this.isAttacking() || this.canCancelOnHit())) {
      inputManager.consumeAction(pNum);
      this.startCaltrops();
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

    // 3. Attack State Protection
    if (this.isAttacking() && !this.canCancelOnHit()) {
      return;
    }

    // 4. Special Moves (Leading-edge and buffer only)
    // Crescent Gale
    const isCrescent = (inputManager.checkQCF(pNum) && (inputState.lkJust || inputState.hkJust)) || inputState.sp2Just || inputManager.peekAction(pNum) === 'SP2';
    if (isCrescent) {
      inputManager.consumeBuffer(pNum);
      this.startCrescentGale();
      return;
    }

    // Shadow Warp
    const isWarp = (inputManager.checkQCB(pNum) && (inputState.lpJust || inputState.hpJust)) || inputState.sp1Just || inputManager.peekAction(pNum) === 'SP1';
    if (isWarp) {
      inputManager.consumeBuffer(pNum);
      this.startShadowWarp(opponent);
      return;
    }

    // Ki Kunai
    const isKunai = (inputManager.checkQCF(pNum) && (inputState.lpJust || inputState.hpJust)) || inputState.sp3Just || inputManager.peekAction(pNum) === 'SP3';
    if (isKunai) {
      inputManager.consumeBuffer(pNum);
      this.startKunai();
      return;
    }

    // 5. Dash Execution (Ninja Flash Step)
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

    // 6. Normal Ground Attacks (Leading-edge and buffer only)
    const lpTrigger = inputState.lpJust || inputManager.peekAction(pNum) === 'LP';
    const hpTrigger = inputState.hpJust || inputManager.peekAction(pNum) === 'HP';
    const lkTrigger = inputState.lkJust || inputManager.peekAction(pNum) === 'LK';
    const hkTrigger = inputState.hkJust || inputManager.peekAction(pNum) === 'HK';

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
      if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 4.4;
      else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 4.4;
      return;
    }

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

  startShadowWarp(opponent) {
    this.changeState(FIGHTER_STATE.SPECIAL_1);
    soundFX.playShadowWarp();
    this.isInvincible = true;
    setTimeout(() => {
      if (opponent) {
        this.x = opponent.facingRight ? opponent.x - 70 : opponent.x + 70;
        this.facingRight = this.x < opponent.x;
      }
      this.isInvincible = false;
    }, 160);
  }

  startCrescentGale() {
    this.changeState(FIGHTER_STATE.SPECIAL_2);
    soundFX.playFlashKick();
    this.isInvincible = true;
    this.isGrounded = false;
    this.vy = -13.0;
    this.vx = (this.facingRight ? 1 : -1) * 3.4;
  }

  startKunai() {
    this.changeState(FIGHTER_STATE.SPECIAL_3);
    soundFX.playWhoosh('light');
  }

  // Dirty Tactic: Caltrops & Smoke Powder
  startCaltrops() {
    this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
    soundFX.playCaltrops();
    const originX = this.facingRight ? this.x + 40 : this.x + 10;
    // Metallic star caltrops
    for (let i = 0; i < 12; i++) {
      this.tacticalParticles.push({
        x: originX + (this.facingRight ? i * 6 : -i * 6),
        y: this.y - 10 + (Math.random() - 0.5) * 6,
        vx: (this.facingRight ? 1 : -1) * (2.0 + Math.random() * 3.5),
        vy: -Math.random() * 2.5,
        size: 3,
        alpha: 1.0,
        color: '#94a3b8'
      });
    }
    // Smoke powder puff
    for (let i = 0; i < 16; i++) {
      this.tacticalParticles.push({
        x: originX + (Math.random() - 0.5) * 20,
        y: this.y - 25 + (Math.random() - 0.5) * 15,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -(1.0 + Math.random() * 2.0),
        size: 4 + Math.random() * 6,
        alpha: 0.8,
        color: Math.random() < 0.5 ? '#cbd5e1' : '#64748b'
      });
    }
  }

  // Naruto-Style Shadow Clone Ultimate Jutsu (影分身・千夜蓮華)
  startUltimate(opponent) {
    this.superMeter = 0;
    this.changeState(FIGHTER_STATE.ULTIMATE);
    this.ultimateTarget = opponent;
    this.isInvincible = true;
    soundFX.playClonePoof();
    soundFX.playUltimateActivation();

    window.dispatchEvent(new CustomEvent('ultimate-activated', {
      detail: {
        fighter: this,
        name: 'SHADOW OUGI: THOUSAND NIGHTFALL CLONES',
        kanji: '影分身・千夜蓮華',
        subtitle: 'SECRET TECHNIQUE // SHADOW CLONE LOTUS'
      }
    }));
  }

  updateState(opponent) {
    this.animTimer++;
    const frames = this.sprites[this.state] || this.sprites.IDLE;

    switch (this.state) {
      case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 6) {
          this.animFrame = 1;
          this.activeHitbox = new Box(40, 24, 56, 18);
          this.currentAttackData = {
            damage: 38,
            hitStun: 13,
            blockStun: 9,
            pushback: 4,
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
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 8) this.animFrame = 1;
        else if (this.stateTimer <= 14) {
          this.animFrame = 2;
          this.activeHitbox = new Box(38, 20, 75, 24);
          this.currentAttackData = {
            damage: 92,
            hitStun: 22,
            blockStun: 15,
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
        else if (this.stateTimer <= 6) {
          this.animFrame = 1;
          this.activeHitbox = new Box(40, 44, 58, 20);
          this.currentAttackData = {
            damage: 40,
            hitStun: 13,
            blockStun: 9,
            pushback: 4,
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

      case FIGHTER_STATE.ATTACK_HEAVY_KICK:
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 9) this.animFrame = 1;
        else if (this.stateTimer <= 14) {
          this.animFrame = 2;
          this.activeHitbox = new Box(38, 14, 78, 28);
          this.currentAttackData = {
            damage: 100,
            hitStun: 24,
            blockStun: 15,
            pushback: 7,
            height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.HEAVY
          };
        } else if (this.stateTimer <= 21) {
          this.animFrame = 3;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.CROUCH_LIGHT_PUNCH:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 6) {
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
        } else if (this.stateTimer <= 10) {
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
        else if (this.stateTimer <= 6) {
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
        } else if (this.stateTimer <= 10) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.CROUCH);
        }
        break;

      case FIGHTER_STATE.CROUCH_HEAVY_KICK:
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 10) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 56, 88, 24);
          this.currentAttackData = {
            damage: 82,
            hitStun: 26,
            blockStun: 14,
            pushback: 6,
            height: ATTACK_HEIGHT.LOW,
            hitType: HIT_TYPE.KNOCKDOWN
          };
        } else if (this.stateTimer <= 19) {
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
        else if (this.stateTimer <= 15) this.animFrame = 2;
        else if (this.stateTimer <= 20) this.animFrame = 3;
        else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.SPECIAL_2:
        if (this.stateTimer <= 3) this.animFrame = 0;
        else if (this.stateTimer <= 8) {
          this.animFrame = 1;
          this.activeHitbox = new Box(25, -10, 75, 55);
          this.currentAttackData = {
            damage: 125,
            hitStun: 28,
            blockStun: 18,
            pushback: 6,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.KNOCKDOWN,
            chipDamage: 16
          };
        } else if (this.stateTimer <= 14) {
          this.animFrame = 2;
          this.activeHitbox = new Box(25, -18, 75, 55);
        } else if (this.stateTimer <= 21) {
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
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 8) this.animFrame = 1;
        else if (this.stateTimer <= 14) {
          this.animFrame = 2;
          if (this.stateTimer === 10 && this.spawnProjectile) {
            const pX = this.facingRight ? this.x + 60 : this.x - 20;
            this.spawnProjectile(new Projectile({
              owner: this,
              type: 'ki_kunai',
              x: pX,
              y: this.y - 56,
              vx: (this.facingRight ? 1 : -1) * 9.8,
              damage: 70
            }));
          }
        } else if (this.stateTimer <= 21) {
          this.animFrame = 3;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      // ==========================================
      // NARUTO-STYLE SHADOW CLONE ULTIMATE (千夜蓮華)
      // ==========================================
      case FIGHTER_STATE.ULTIMATE:
        if (this.stateTimer <= 20) {
          this.animFrame = 0;
          this.vx = 0;
          // Spawn shadow clones afterimages around
          if (this.stateTimer % 4 === 0) {
            this.addAfterImage();
          }
        } else if (this.stateTimer <= 38) {
          this.animFrame = 1;
          this.vx = (this.facingRight ? 1 : -1) * 15;
          this.addAfterImage();
          this.activeHitbox = new Box(36, 10, 52, 44);
          this.currentAttackData = {
            damage: 360,
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
        // Startup (0 - 5): drops low to scatter
        if (this.stateTimer <= 5) {
          this.animFrame = 0;
        }
        // Active (6 - 15): unblockable caltrops hazard trip
        else if (this.stateTimer <= 15) {
          this.animFrame = 1;
          this.activeHitbox = new Box(32, 54, 88, 30);
          this.currentAttackData = {
            damage: 65,
            hitStun: 45,
            blockStun: 20,
            pushback: 5,
            height: ATTACK_HEIGHT.UNBLOCKABLE,
            hitType: HIT_TYPE.KNOCKDOWN
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
