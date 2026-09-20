// Final Impact - Enhanced Base Fighter Engine
// Features attack state protection, combo chaining on hit, hitstop micro-freeze, and dashing

import { FIGHTER_STATE, GROUND_Y, ATTACK_HEIGHT, HIT_TYPE } from '../engine/Constants.js';
import { Box } from '../engine/Hitbox.js';
import { spriteGenerator } from '../graphics/SpriteGenerator.js';
import { soundFX } from '../audio/SoundFX.js';

export class Fighter {
  constructor({
    id,
    name,
    x,
    facingRight = true,
    playerNum = 1,
    isCpu = false
  }) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = GROUND_Y;
    this.vx = 0;
    this.vy = 0;
    this.facingRight = facingRight;
    this.playerNum = playerNum;
    this.isCpu = isCpu;

    // Combat Stats
    this.maxHealth = 1000;
    this.health = 1000;
    this.superMeter = 0;
    this.maxSuperMeter = 100;
    this.roundsWon = 0;

    // State Machine
    this.state = FIGHTER_STATE.IDLE;
    this.stateTimer = 0;
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = 5;
    this.isGrounded = true;
    this.isInvincible = false;
    this.isDead = false;

    // Micro-Freeze Hitstop & Stun
    this.hitStop = 0;
    this.hitStun = 0;
    this.blockStun = 0;
    this.knockdownTimer = 0;
    this.hasHitThisAttack = false;

    // Motion Afterimages (for dash & ultimate)
    this.afterImages = [];

    // Hitbox / Hurtbox
    this.activeHitbox = null;
    this.currentAttackData = null;

    // Physics Attributes
    this.walkSpeed = 3.6;
    this.dashSpeed = 7.8;
    this.jumpForce = -13.5;
    this.gravity = 0.65;

    // Sprites
    this.sprites = spriteGenerator.generateFighterSprites(this.id);
  }

  isAttacking() {
    return (
      this.state.startsWith('ATTACK_') ||
      this.state.startsWith('CROUCH_LP') ||
      this.state.startsWith('CROUCH_HP') ||
      this.state.startsWith('CROUCH_LK') ||
      this.state.startsWith('CROUCH_HK') ||
      this.state.startsWith('JUMP_PUNCH') ||
      this.state.startsWith('JUMP_KICK') ||
      this.state.startsWith('SPECIAL_') ||
      this.state === FIGHTER_STATE.ULTIMATE
    );
  }

  canCancelOnHit() {
    return this.hasHitThisAttack && (
      this.state === FIGHTER_STATE.ATTACK_LIGHT_PUNCH ||
      this.state === FIGHTER_STATE.ATTACK_LIGHT_KICK ||
      this.state === FIGHTER_STATE.CROUCH_LIGHT_PUNCH ||
      this.state === FIGHTER_STATE.CROUCH_LIGHT_KICK ||
      this.state === FIGHTER_STATE.ATTACK_HEAVY_PUNCH ||
      this.state === FIGHTER_STATE.ATTACK_HEAVY_KICK
    );
  }

  // Bounding Boxes
  getPushbox() {
    return new Box(this.x + 28, this.y - 74, 24, 74);
  }

  getGlobalHurtboxes() {
    const isCrouching = this.state === FIGHTER_STATE.CROUCH || 
                        this.state === FIGHTER_STATE.CROUCH_BLOCK ||
                        this.state.startsWith('CROUCH_');
    
    if (isCrouching) {
      return [
        new Box(this.x + 20, this.y - 48, 40, 48)
      ];
    }

    if (!this.isGrounded) {
      return [
        new Box(this.x + 22, this.y - 70, 36, 55)
      ];
    }

    return [
      new Box(this.x + 26, this.y - 82, 28, 22),
      new Box(this.x + 22, this.y - 60, 36, 30),
      new Box(this.x + 24, this.y - 30, 32, 30)
    ];
  }

  getGlobalHitbox() {
    if (!this.activeHitbox) return null;
    const offset = this.facingRight ? this.activeHitbox.x : (80 - this.activeHitbox.x - this.activeHitbox.w);
    return new Box(
      this.x + offset,
      this.y - 90 + this.activeHitbox.y,
      this.activeHitbox.w,
      this.activeHitbox.h
    );
  }

  changeState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    this.stateTimer = 0;
    this.animFrame = 0;
    this.animTimer = 0;
    this.activeHitbox = null;
    this.hasHitThisAttack = false;
    if (newState === FIGHTER_STATE.IDLE) {
      this.isInvincible = false;
    }
  }

  // Double-tap Dashing
  startDash(forward = true) {
    if (this.isAttacking() || !this.isGrounded || this.hitStun > 0 || this.blockStun > 0) return;
    soundFX.playDash();
    this.changeState(forward ? FIGHTER_STATE.DASH_FWD : FIGHTER_STATE.DASH_BACK);
    const dir = this.facingRight ? (forward ? 1 : -1) : (forward ? -1 : 1);
    this.vx = dir * (forward ? this.dashSpeed : this.dashSpeed * 0.7);
  }

  update(opponent, stageWidth = 960) {
    // 1. Hitstop Micro-freeze: impact freeze frame
    if (this.hitStop > 0) {
      this.hitStop--;
      return;
    }

    this.stateTimer++;

    // 2. Face opponent when neutral
    if (this.canTurnAround() && opponent) {
      this.facingRight = this.x < opponent.x;
    }

    // 3. Dash Handling
    if (this.state === FIGHTER_STATE.DASH_FWD || this.state === FIGHTER_STATE.DASH_BACK) {
      this.x += this.vx;
      this.vx *= 0.92;
      // Spawn afterimages
      if (this.stateTimer % 2 === 0) {
        this.addAfterImage();
      }
      if (this.stateTimer >= 14) {
        this.changeState(FIGHTER_STATE.IDLE);
      }
    } else if (!this.isGrounded) {
      // Airborne Physics
      this.vy += this.gravity;
      this.y += this.vy;
      this.x += this.vx;

      if (this.y >= GROUND_Y) {
        this.y = GROUND_Y;
        this.vy = 0;
        this.vx = 0;
        this.isGrounded = true;
        if (this.state !== FIGHTER_STATE.KNOCKDOWN) {
          this.changeState(FIGHTER_STATE.IDLE);
        }
      }
    } else {
      // Ground Friction
      this.x += this.vx;
      this.vx *= 0.8;
    }

    // Enforce Boundaries
    this.x = Math.max(30, Math.min(stageWidth - 110, this.x));

    // Update Afterimages
    for (let i = this.afterImages.length - 1; i >= 0; i--) {
      this.afterImages[i].alpha -= 0.12;
      if (this.afterImages[i].alpha <= 0) {
        this.afterImages.splice(i, 1);
      }
    }

    // Handle Stun
    if (this.hitStun > 0) {
      this.hitStun--;
      if (this.hitStun === 0) {
        this.changeState(FIGHTER_STATE.IDLE);
      }
      return;
    }

    if (this.blockStun > 0) {
      this.blockStun--;
      if (this.blockStun === 0) {
        this.changeState(FIGHTER_STATE.IDLE);
      }
      return;
    }

    // Handle Knockdown
    if (this.state === FIGHTER_STATE.KNOCKDOWN) {
      this.knockdownTimer--;
      if (this.knockdownTimer <= 0) {
        this.isInvincible = false;
        this.changeState(FIGHTER_STATE.IDLE);
      }
      return;
    }

    // State Updates
    this.updateState(opponent);
  }

  canTurnAround() {
    return [
      FIGHTER_STATE.IDLE,
      FIGHTER_STATE.WALK_FWD,
      FIGHTER_STATE.WALK_BACK,
      FIGHTER_STATE.CROUCH
    ].includes(this.state);
  }

  addAfterImage() {
    const frames = this.sprites[this.state] || this.sprites.IDLE;
    const img = frames[Math.min(this.animFrame, frames.length - 1)];
    if (img) {
      this.afterImages.push({
        x: this.x,
        y: this.y,
        facingRight: this.facingRight,
        img,
        alpha: 0.6
      });
    }
  }

  takeHit(attackData, fromDirection) {
    if (this.isInvincible || this.isDead) return false;

    // Micro-freeze hitstop for impact crunch
    const isHeavy = attackData.hitType === HIT_TYPE.HEAVY || attackData.hitType === HIT_TYPE.KNOCKDOWN;
    this.hitStop = isHeavy ? 4 : 2;

    const isHoldingBack = (this.facingRight && fromDirection > 0) || (!this.facingRight && fromDirection < 0);
    const isCrouching = this.state === FIGHTER_STATE.CROUCH || this.state === FIGHTER_STATE.CROUCH_BLOCK;

    let blocked = false;
    if (isHoldingBack) {
      if (attackData.height === ATTACK_HEIGHT.HIGH) {
        blocked = true;
      } else if (attackData.height === ATTACK_HEIGHT.MID) {
        blocked = !isCrouching;
      } else if (attackData.height === ATTACK_HEIGHT.LOW) {
        blocked = isCrouching;
      }
    }

    if (blocked) {
      soundFX.playBlock();
      const chip = attackData.chipDamage || 0;
      this.health = Math.max(1, this.health - chip);
      this.blockStun = attackData.blockStun || 12;
      this.vx = (this.facingRight ? -1 : 1) * (attackData.pushback * 0.7);
      this.changeState(isCrouching ? FIGHTER_STATE.CROUCH_BLOCK : FIGHTER_STATE.BLOCK);
      return 'blocked';
    }

    if (isHeavy) soundFX.playHitHeavy();
    else soundFX.playHitLight();

    this.health = Math.max(0, this.health - attackData.damage);
    this.addSuper(attackData.damage * 0.08);

    if (this.health <= 0) {
      this.die();
      return 'ko';
    }

    if (attackData.hitType === HIT_TYPE.KNOCKDOWN || !this.isGrounded) {
      soundFX.playKnockdown();
      this.isInvincible = true;
      this.knockdownTimer = 50;
      this.vx = (this.facingRight ? -1 : 1) * 6.5;
      this.vy = -7.5;
      this.isGrounded = false;
      this.changeState(FIGHTER_STATE.KNOCKDOWN);
      return 'knockdown';
    }

    this.hitStun = attackData.hitStun || 16;
    this.vx = (this.facingRight ? -1 : 1) * attackData.pushback;
    this.changeState(isCrouching ? FIGHTER_STATE.HIT_CROUCH : FIGHTER_STATE.HIT);
    return 'hit';
  }

  addSuper(amount) {
    this.superMeter = Math.min(this.maxSuperMeter, this.superMeter + amount);
    if (this.superMeter >= this.maxSuperMeter) {
      soundFX.playSuperReady();
    }
  }

  die() {
    this.isDead = true;
    soundFX.playAnnouncer('KO');
    this.vx = (this.facingRight ? -1 : 1) * 7.5;
    this.vy = -8.5;
    this.isGrounded = false;
    this.isInvincible = true;
    this.changeState(FIGHTER_STATE.KNOCKDOWN);
  }

  render(ctx) {
    // 1. Render Dash / Ultimate Afterimages
    this.afterImages.forEach(ghost => {
      ctx.save();
      ctx.globalAlpha = ghost.alpha;
      if (!ghost.facingRight) {
        ctx.translate(ghost.x + 80, ghost.y - 90);
        ctx.scale(-1, 1);
        ctx.drawImage(ghost.img, 0, 0);
      } else {
        ctx.drawImage(ghost.img, ghost.x, ghost.y - 90);
      }
      ctx.restore();
    });

    // 2. Render Main Sprite
    const frames = this.sprites[this.state] || this.sprites.IDLE;
    const currentImg = frames[Math.min(this.animFrame, frames.length - 1)];

    if (!currentImg) return;

    ctx.save();
    if (!this.facingRight) {
      ctx.translate(this.x + 80, this.y - 90);
      ctx.scale(-1, 1);
      ctx.drawImage(currentImg, 0, 0);
    } else {
      ctx.drawImage(currentImg, this.x, this.y - 90);
    }
    ctx.restore();
  }
}
