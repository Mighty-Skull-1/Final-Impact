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
    this.isHoldingBack = false;
    this.isCrouching = false;

    // Micro-Freeze Hitstop & Stun
    this.hitStop = 0;
    this.hitStun = 0;
    this.blockStun = 0;
    this.knockdownTimer = 0;
    this.hasHitThisAttack = false;

    // Motion Afterimages (for dash & ultimate)
    this.afterImages = [];

    // Adrenaline & Tactical State
    this.isRageMode = false;
    this.armorDepleted = false;
    this.armorFlash = 0;
    this.blindTimer = 0;
    this.rageParticles = [];
    this.sweatParticles = [];
    this.tacticalParticles = [];

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
      this.state === FIGHTER_STATE.ULTIMATE ||
      this.state === FIGHTER_STATE.DIRTY_TACTIC
    );
  }

  canCancelOnHit() {
    return this.hasHitThisAttack && (
      this.state === FIGHTER_STATE.ATTACK_LIGHT_PUNCH ||
      this.state === FIGHTER_STATE.ATTACK_LIGHT_KICK ||
      this.state === FIGHTER_STATE.CROUCH_LIGHT_PUNCH ||
      this.state === FIGHTER_STATE.CROUCH_LIGHT_KICK ||
      this.state === FIGHTER_STATE.ATTACK_HEAVY_PUNCH ||
      this.state === FIGHTER_STATE.ATTACK_HEAVY_KICK ||
      this.state === FIGHTER_STATE.CROUCH_HEAVY_PUNCH ||
      this.state === FIGHTER_STATE.CROUCH_HEAVY_KICK
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
        new Box(this.x + 14, this.y - 56, 52, 56)
      ];
    }

    if (!this.isGrounded) {
      return [
        new Box(this.x + 16, this.y - 74, 48, 60)
      ];
    }

    return [
      new Box(this.x + 18, this.y - 88, 44, 26),
      new Box(this.x + 14, this.y - 64, 52, 36),
      new Box(this.x + 18, this.y - 28, 44, 28)
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

  changeState(newState, force = false) {
    if (this.state === newState && !force) {
      // Allow re-chaining an attack if currently attacking
      if (this.isAttacking() && this.canCancelOnHit()) {
        this.stateTimer = 0;
        this.animFrame = 0;
        this.animTimer = 0;
        this.activeHitbox = null;
        this.hasHitThisAttack = false;
      }
      return;
    }
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
    if (this.armorFlash > 0) this.armorFlash--;

    // 2. Adrenaline & Rage Threshold Check (HP <= 30%)
    if (!this.isRageMode && this.health <= this.maxHealth * 0.30 && !this.isDead) {
      this.isRageMode = true;
      soundFX.playRageIgnite();
      window.dispatchEvent(new CustomEvent('rage-ignited', { detail: { fighter: this } }));
    }

    // Replenish 1-hit super armor when back in neutral state
    if (this.canTurnAround()) {
      this.armorDepleted = false;
    }

    // 3. Face opponent when neutral
    if (this.canTurnAround() && opponent) {
      this.facingRight = this.x < opponent.x;
    }

    // 4. Particle Generation & Updates
    if (this.isRageMode && !this.isDead) {
      for (let i = 0; i < 2; i++) {
        this.rageParticles.push({
          x: this.x + 18 + Math.random() * 44,
          y: this.y - 12 - Math.random() * 68,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -(1.8 + Math.random() * 2.2),
          size: 3 + Math.random() * 4,
          alpha: 1.0,
          color: Math.random() < 0.6 ? '#ff3d00' : (Math.random() < 0.5 ? '#ff9100' : '#ffea00')
        });
      }
    }

    // Low HP exhaustion sweat drops in IDLE
    if (this.health <= this.maxHealth * 0.35 && this.state === FIGHTER_STATE.IDLE && !this.isDead && Math.random() < 0.12) {
      this.sweatParticles.push({
        x: this.x + (this.facingRight ? 54 : 26) + (Math.random() - 0.5) * 6,
        y: this.y - 75,
        vy: 1.5 + Math.random() * 1.5,
        alpha: 1.0
      });
    }

    // Update Particles
    for (let i = this.rageParticles.length - 1; i >= 0; i--) {
      const p = this.rageParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.05;
      if (p.alpha <= 0) this.rageParticles.splice(i, 1);
    }
    for (let i = this.sweatParticles.length - 1; i >= 0; i--) {
      const s = this.sweatParticles[i];
      s.y += s.vy;
      s.alpha -= 0.04;
      if (s.alpha <= 0) this.sweatParticles.splice(i, 1);
    }
    for (let i = this.tacticalParticles.length - 1; i >= 0; i--) {
      const tp = this.tacticalParticles[i];
      tp.x += tp.vx;
      tp.y += tp.vy;
      tp.alpha -= 0.045;
      if (tp.alpha <= 0) this.tacticalParticles.splice(i, 1);
    }

    // 5. Handle Blind / Electric Stun State
    if (this.state === FIGHTER_STATE.BLIND_STUN) {
      this.blindTimer--;
      this.vx *= 0.85;
      if (this.blindTimer <= 0) {
        this.changeState(FIGHTER_STATE.IDLE);
      }
      return;
    }

    // 6. Handle Wall Rebound (Crowd Shove Bounce)
    if (this.state === FIGHTER_STATE.WALL_REBOUND) {
      this.vy += this.gravity * 0.75;
      this.y += this.vy;
      this.x += this.vx;
      if (this.y >= GROUND_Y) {
        this.y = GROUND_Y;
        this.vy = 0;
        this.vx = 0;
        this.isGrounded = true;
        this.changeState(FIGHTER_STATE.IDLE);
      }
      return;
    }

    // 7. Dash Handling
    if (this.state === FIGHTER_STATE.DASH_FWD || this.state === FIGHTER_STATE.DASH_BACK) {
      this.x += this.vx;
      this.vx *= 0.92;
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

    const isUnblockable = attackData.height === ATTACK_HEIGHT.UNBLOCKABLE;

    // Super Armor: In Rage Mode, absorb 1 hit during heavy attack startup
    const isHeavyStartup = (
      this.state === FIGHTER_STATE.ATTACK_HEAVY_PUNCH ||
      this.state === FIGHTER_STATE.ATTACK_HEAVY_KICK ||
      this.state === FIGHTER_STATE.CROUCH_HEAVY_PUNCH ||
      this.state === FIGHTER_STATE.CROUCH_HEAVY_KICK
    ) && this.animFrame <= 1;

    if (this.isRageMode && !this.armorDepleted && isHeavyStartup && !isUnblockable) {
      this.armorDepleted = true;
      soundFX.playBlock();
      this.health = Math.max(1, this.health - Math.floor(attackData.damage * 0.5));
      this.addSuper(attackData.damage * 0.12);
      this.armorFlash = 8;
      return 'armored';
    }

    // Defender can block if grounded, not currently attacking, and actively guarding (unless unblockable!)
    const canBlock = this.isGrounded && !this.isAttacking() && !isUnblockable && (
      this.isHoldingBack || 
      this.state === FIGHTER_STATE.BLOCK || 
      this.state === FIGHTER_STATE.CROUCH_BLOCK ||
      this.state === FIGHTER_STATE.WALK_BACK
    );

    let blocked = false;
    if (canBlock) {
      const isCrouching = this.state === FIGHTER_STATE.CROUCH || 
                          this.state === FIGHTER_STATE.CROUCH_BLOCK ||
                          this.isCrouching;

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
      const isCrouching = this.state === FIGHTER_STATE.CROUCH || this.isCrouching;
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

    // Dirty Tactic Stun handling (Kazuki Sand Blind / Raven Taser)
    if (attackData.hitType === HIT_TYPE.DIRTY_STUN) {
      this.blindTimer = attackData.stunFrames || 65;
      this.vx = (this.facingRight ? -1 : 1) * 2.5;
      this.changeState(FIGHTER_STATE.BLIND_STUN);
      return 'stun';
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
    const isCrouching = this.state === FIGHTER_STATE.CROUCH || this.isCrouching;
    this.changeState(isCrouching ? FIGHTER_STATE.HIT_CROUCH : FIGHTER_STATE.HIT);
    return 'hit';
  }

  addSuper(amount) {
    const mult = this.isRageMode ? 1.5 : 1.0;
    this.superMeter = Math.min(this.maxSuperMeter, this.superMeter + amount * mult);
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

  renderBattleDamage(ctx) {
    if (this.isDead) return;

    // Level 1 Visual Damage (HP <= 65%)
    if (this.health <= this.maxHealth * 0.65) {
      ctx.save();
      // Cheek scrape & purple bruise
      ctx.fillStyle = 'rgba(180, 40, 60, 0.75)';
      ctx.fillRect(44, 23, 6, 2);
      ctx.fillStyle = 'rgba(100, 30, 90, 0.6)';
      ctx.fillRect(42, 19, 5, 3);

      // Torn fabric / scrapes on torso
      ctx.strokeStyle = 'rgba(220, 50, 50, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(32, 46);
      ctx.lineTo(44, 52);
      ctx.stroke();

      // Dirt & knee scrapes
      ctx.fillStyle = 'rgba(120, 50, 40, 0.7)';
      ctx.fillRect(36, 72, 7, 3);
      ctx.restore();
    }

    // Level 2 Visual Damage (HP <= 35%)
    if (this.health <= this.maxHealth * 0.35) {
      ctx.save();
      // Swollen black eye
      ctx.fillStyle = 'rgba(50, 15, 70, 0.85)';
      ctx.fillRect(46, 17, 7, 5);

      // Blood drip from lip/chin
      ctx.fillStyle = '#b71c1c';
      ctx.fillRect(44, 26, 2, 5);
      ctx.fillStyle = '#e53935';
      ctx.fillRect(45, 29, 2, 3);

      // Deep chest slashing cuts
      ctx.strokeStyle = '#c62828';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(28, 38);
      ctx.lineTo(52, 48);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(34, 34);
      ctx.lineTo(46, 54);
      ctx.stroke();

      // Thigh slash & blood trail
      ctx.strokeStyle = '#b71c1c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(34, 65);
      ctx.lineTo(48, 69);
      ctx.stroke();
      ctx.restore();
    }
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

    // 2. Render World-Space Particles
    // Rage Aura
    if (this.rageParticles.length > 0) {
      ctx.save();
      for (const p of this.rageParticles) {
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.restore();
    }

    // Sweat Drops
    if (this.sweatParticles.length > 0) {
      ctx.save();
      for (const s of this.sweatParticles) {
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.fillStyle = '#67e8f9';
        ctx.fillRect(s.x, s.y, 2, 4);
      }
      ctx.restore();
    }

    // Tactical Move Particles
    if (this.tacticalParticles.length > 0) {
      ctx.save();
      for (const tp of this.tacticalParticles) {
        ctx.globalAlpha = Math.max(0, tp.alpha);
        ctx.fillStyle = tp.color;
        ctx.fillRect(tp.x, tp.y, tp.size, tp.size);
      }
      ctx.restore();
    }

    // 3. Render Main Sprite with Heavy Panting Heave & Visual Damage
    const frames = this.sprites[this.state] || 
                   (this.state === FIGHTER_STATE.CROUCH_HEAVY_PUNCH ? this.sprites.CROUCH_LP : null) || 
                   (this.state === FIGHTER_STATE.DIRTY_TACTIC ? (this.sprites.ATTACK_HP || this.sprites.IDLE) : null) ||
                   (this.state === FIGHTER_STATE.BLIND_STUN ? (this.sprites.HIT || this.sprites.IDLE) : null) ||
                   (this.state === FIGHTER_STATE.WALL_REBOUND ? (this.sprites.JUMP || this.sprites.IDLE) : null) ||
                   this.sprites.IDLE;
    const currentImg = frames[Math.min(this.animFrame, frames.length - 1)];

    if (!currentImg) return;

    ctx.save();
    let drawY = this.y - 90;
    // Low HP heavy breathing / panting chest heave in IDLE
    if (this.health <= this.maxHealth * 0.35 && this.state === FIGHTER_STATE.IDLE && !this.isDead) {
      drawY += Math.sin(Date.now() / 140) * 2;
    }

    if (!this.facingRight) {
      ctx.translate(this.x + 80, drawY);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(this.x, drawY);
    }

    if (this.armorFlash > 0) {
      ctx.filter = 'brightness(2.5)';
    }

    ctx.drawImage(currentImg, 0, 0);

    ctx.filter = 'none';

    // Draw Battle Damage Overlay
    this.renderBattleDamage(ctx);

    ctx.restore();

    // 4. Dizzy Circling Stars (BLIND_STUN state)
    if (this.state === FIGHTER_STATE.BLIND_STUN) {
      const starTime = Date.now() / 180;
      const headX = this.x + 40;
      const headY = this.y - 96;
      ctx.save();
      for (let i = 0; i < 3; i++) {
        const a = starTime + (i * (Math.PI * 2 / 3));
        const sx = headX + Math.cos(a) * 20;
        const sy = headY + Math.sin(a) * 6;
        ctx.fillStyle = '#fde047';
        ctx.fillRect(sx - 3, sy - 1, 6, 2);
        ctx.fillRect(sx - 1, sy - 3, 2, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx - 1, sy - 1, 2, 2);
      }
      ctx.restore();
    }
  }
}
