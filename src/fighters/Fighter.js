import { FIGHTER_STATE, GROUND_Y, ATTACK_HEIGHT, HIT_TYPE, LIMB_ZONE, STATUS_EFFECT, PICKUP_TYPE } from '../engine/Constants.js';
import { Box } from '../engine/Hitbox.js';
import { spriteGenerator } from '../graphics/SpriteGenerator.js';
import { soundFX } from '../audio/SoundFX.js';
import { AlleyPickup } from '../engine/Projectiles.js';

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
    this.team = (playerNum === 1 || playerNum === 3) ? 1 : 2;

    // Combat Stats & Vitality
    this.maxHealth = 1000;
    this.health = 1000;
    this.superMeter = 0;
    this.maxSuperMeter = 100;
    this.roundsWon = 0;

    // Stamina & Limb Fatigue System
    this.maxStamina = 100;
    this.stamina = 100;
    this.staminaRegenRate = 0.32;
    this.windedTimer = 0;
    this.limbs = {
      leadArm: 100,
      rearArm: 100,
      leadLeg: 100,
      rearLeg: 100,
      torso: 100,
      head: 100
    };
    this.statusEffects = [];
    this.heldPickup = null;
    this.submissionStruggle = 0;

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

    // Projectile Cooldown & Active Tracking (Anti-Corner Spamming)
    this.projectileCooldown = 0;
    this.activeProjectileCount = 0;

    // Sprites
    this.sprites = spriteGenerator.generateFighterSprites(this.id);
  }

  consumeStamina(amount) {
    this.stamina = Math.max(0, this.stamina - amount);
    if (this.stamina <= 0 && this.state !== FIGHTER_STATE.WINDED && this.isGrounded && !this.isDead) {
      this.changeState(FIGHTER_STATE.WINDED);
      this.windedTimer = 65;
    }
  }

  canFireProjectile(staminaCost = 25) {
    if (this.stamina < staminaCost) return false;
    if (this.projectileCooldown > 0) return false;
    if (this.activeProjectileCount >= 1) return false;
    return true;
  }

  onFireProjectile(staminaCost = 25, cooldown = 50) {
    this.consumeStamina(staminaCost);
    this.projectileCooldown = cooldown;
    this.activeProjectileCount++;
  }

  onProjectileDestroyed() {
    if (this.activeProjectileCount > 0) {
      this.activeProjectileCount--;
    }
  }

  damageLimb(zone, amount) {
    if (this.limbs[zone] === undefined) return;
    const oldVal = this.limbs[zone];
    this.limbs[zone] = Math.max(0, this.limbs[zone] - amount);
    if (oldVal > 0 && this.limbs[zone] === 0) {
      soundFX.playKnockdown();
    }
  }

  applyStatusEffect(effect, duration) {
    this.statusEffects.push({ effect, duration });
  }

  hasStatusEffect(effect) {
    return this.statusEffects.some(s => s.effect === effect && s.duration > 0);
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
    if (this.isAttacking() || !this.isGrounded || this.hitStun > 0 || this.blockStun > 0 || this.stamina < 8 || this.state === FIGHTER_STATE.WINDED) return;
    this.consumeStamina(12);
    soundFX.playDash();
    this.changeState(forward ? FIGHTER_STATE.DASH_FWD : FIGHTER_STATE.DASH_BACK);
    let speed = forward ? this.dashSpeed : this.dashSpeed * 0.7;
    if (this.limbs.leadLeg <= 0) {
      speed *= 0.52; // Broken lead leg slows dash to a staggering limp
    }
    const dir = this.facingRight ? (forward ? 1 : -1) : (forward ? -1 : 1);
    this.vx = dir * speed;
  }

  update(opponent, stageWidth = 960) {
    // 1. Hitstop Micro-freeze: impact freeze frame
    if (this.hitStop > 0) {
      this.hitStop--;
      return;
    }

    this.stateTimer++;
    if (this.armorFlash > 0) this.armorFlash--;
    if (this.projectileCooldown > 0) this.projectileCooldown--;

    // Handle Winded state (0 Stamina exhaustion)
    if (this.state === FIGHTER_STATE.WINDED) {
      this.windedTimer--;
      this.vx *= 0.8;
      if (this.stateTimer % 10 === 0) {
        this.sweatParticles.push({
          x: this.x + 40 + (Math.random() - 0.5) * 12,
          y: this.y - 75,
          vy: 1.5,
          alpha: 1.0
        });
      }
      if (this.windedTimer <= 0) {
        this.stamina = 35;
        this.changeState(FIGHTER_STATE.IDLE);
      }
      return;
    }

    // Passive Stamina Regeneration
    if (!this.isAttacking() && this.state !== FIGHTER_STATE.BLOCK && this.state !== FIGHTER_STATE.CROUCH_BLOCK && !this.isDead) {
      const torsoMult = this.limbs.torso <= 30 ? 0.5 : 1.0;
      this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate * torsoMult);
    }

    // Status Effects (Bleed, Paralysis)
    for (let i = this.statusEffects.length - 1; i >= 0; i--) {
      const se = this.statusEffects[i];
      se.duration--;
      if (se.effect === STATUS_EFFECT.BLEED) {
        if (se.duration % 30 === 0 && !this.isDead) {
          this.health = Math.max(1, this.health - 6);
          this.tacticalParticles.push({
            x: this.x + 40 + (Math.random() - 0.5) * 12,
            y: this.y - 50 + (Math.random() - 0.5) * 15,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 1.5,
            size: 3,
            alpha: 1.0,
            color: '#b71c1c'
          });
        }
      }
      if (se.duration <= 0) {
        this.statusEffects.splice(i, 1);
      }
    }

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
        if (this.state !== FIGHTER_STATE.KNOCKDOWN && !this.isDead) {
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
      if (this.isDead) return; // Defeated fighters remain down
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

  executePickupAttack(type, opponent) {
    const item = this.heldPickup;
    this.heldPickup = null;
    this.consumeStamina(10);

    if (item === 'brick' || item === 'bottle') {
      if (this.spawnProjectile) {
        const p = new AlleyPickup(item, this.x, this.y - 45);
        p.throw(this, this.facingRight);
        this.spawnProjectile(p);
      }
      soundFX.playWhoosh('heavy');
      this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH);
    } else if (item === 'lumber') {
      soundFX.playWhoosh('heavy');
      this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH);
      this.activeHitbox = new Box(35, 15, 75, 55);
      this.currentAttackData = {
        damage: 85,
        hitStun: 30,
        blockStun: 18,
        pushback: 8,
        height: ATTACK_HEIGHT.MID,
        hitType: HIT_TYPE.KNOCKDOWN,
        chipDamage: 15
      };
    }
  }

  handleInput(inputState, inputManager, opponent) {
    if (this.hitStun > 0 || this.blockStun > 0 || this.state === FIGHTER_STATE.KNOCKDOWN || this.state === FIGHTER_STATE.BLIND_STUN || this.state === FIGHTER_STATE.WINDED || this.state === FIGHTER_STATE.OVERHEAT_STUN) {
      return;
    }

    if (this.state === FIGHTER_STATE.SUBMISSION_LOCK) {
      if (inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputState.dirtyJust || inputState.lp || inputState.hp) {
        this.submissionStruggle = Math.min(100, (this.submissionStruggle || 0) + 14);
        soundFX.playWhoosh('light');
      }
      return;
    }

    this.isHoldingBack = !!inputState.back;
    this.isCrouching = !!inputState.down;

    const pNum = this.playerNum;

    // Environmental Weapon Pickup Attack
    if (this.heldPickup) {
      const wantsAttack = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust || inputState.dirtyJust || (inputManager && (inputManager.peekAction(pNum) === 'LP' || inputManager.peekAction(pNum) === 'HP' || inputManager.peekAction(pNum) === 'DIRTY'));
      if (wantsAttack && !this.isAttacking()) {
        if (inputManager) inputManager.consumeAction(pNum);
        this.executePickupAttack(this.heldPickup, opponent);
        return;
      }
    }

    // Normal Attacks: Only trigger on leading-edge press or buffered intent (prevents sticky attack loops)
    const lpTrigger = inputState.lpJust || (inputManager && inputManager.peekAction(pNum) === 'LP');
    const hpTrigger = inputState.hpJust || (inputManager && inputManager.peekAction(pNum) === 'HP');
    const lkTrigger = inputState.lkJust || (inputManager && inputManager.peekAction(pNum) === 'LK');
    const hkTrigger = inputState.hkJust || (inputManager && inputManager.peekAction(pNum) === 'HK');
    const sp1Trigger = inputState.sp1Just || (inputManager && inputManager.peekAction(pNum) === 'SP1');
    const sp2Trigger = inputState.sp2Just || (inputManager && inputManager.peekAction(pNum) === 'SP2');

    if (!this.isGrounded) {
      if (this.state === FIGHTER_STATE.JUMP) {
        if (lpTrigger || hpTrigger) {
          if (inputManager) inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.JUMP_PUNCH);
          soundFX.playWhoosh('light');
        } else if (lkTrigger || hkTrigger) {
          if (inputManager) inputManager.consumeAction(pNum);
          this.changeState(FIGHTER_STATE.JUMP_KICK);
          soundFX.playWhoosh('heavy');
        }
      }
      return;
    }

    if (this.isAttacking() && !this.canCancelOnHit()) {
      return;
    }

    if (sp1Trigger) {
      if (inputManager) inputManager.consumeAction(pNum);
      this.changeState(FIGHTER_STATE.SPECIAL_1);
      soundFX.playWhoosh('heavy');
      return;
    }

    if (sp2Trigger) {
      if (inputManager) inputManager.consumeAction(pNum);
      this.changeState(FIGHTER_STATE.SPECIAL_2);
      soundFX.playWhoosh('heavy');
      return;
    }

    if (inputState.down) {
      if (lpTrigger) {
        if (inputManager) inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.CROUCH_LIGHT_PUNCH, true);
        soundFX.playWhoosh('light');
        return;
      }
      if (hpTrigger) {
        if (inputManager) inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.CROUCH_HEAVY_PUNCH, true);
        soundFX.playWhoosh('heavy');
        return;
      }
      if (lkTrigger) {
        if (inputManager) inputManager.consumeAction(pNum);
        this.changeState(FIGHTER_STATE.CROUCH_LIGHT_KICK, true);
        soundFX.playWhoosh('light');
        return;
      }
      if (hkTrigger) {
        if (inputManager) inputManager.consumeAction(pNum);
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
      if (inputManager) inputManager.consumeAction(pNum);
      this.changeState(FIGHTER_STATE.ATTACK_LIGHT_PUNCH, true);
      soundFX.playWhoosh('light');
      return;
    }
    if (hpTrigger) {
      if (inputManager) inputManager.consumeAction(pNum);
      this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH, true);
      soundFX.playWhoosh('heavy');
      return;
    }
    if (lkTrigger) {
      if (inputManager) inputManager.consumeAction(pNum);
      this.changeState(FIGHTER_STATE.ATTACK_LIGHT_KICK, true);
      soundFX.playWhoosh('light');
      return;
    }
    if (hkTrigger) {
      if (inputManager) inputManager.consumeAction(pNum);
      this.changeState(FIGHTER_STATE.ATTACK_HEAVY_KICK, true);
      soundFX.playWhoosh('heavy');
      return;
    }

    // Movement
    if (this.isAttacking() || this.state === FIGHTER_STATE.DASH_FWD || this.state === FIGHTER_STATE.DASH_BACK) {
      return;
    }

    if (inputState.dashFwd) {
      this.startDash(true);
      return;
    }
    if (inputState.dashBack) {
      this.startDash(false);
      return;
    }

    if (inputState.up) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.changeState(FIGHTER_STATE.JUMP);
      if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * 3.8;
      else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * 3.8;
      soundFX.playJump();
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

  updateState(opponent) {
    this.animTimer++;
    const frames = this.sprites[this.state] || this.sprites.IDLE;

    if (this.isAttacking()) {
      if (this.stateTimer <= 4) {
        this.animFrame = 0;
      } else if (this.stateTimer <= 13) {
        this.animFrame = 1;
        if (!this.activeHitbox) {
          const isCrouch = this.state.startsWith('CROUCH_');
          const isHeavy = this.state.includes('HEAVY') || this.state.includes('HK') || this.state.includes('HP');
          this.activeHitbox = new Box(36, isCrouch ? 48 : 22, 58, 28);
          this.currentAttackData = {
            damage: isHeavy ? 80 : 45,
            hitStun: isHeavy ? 24 : 14,
            blockStun: isHeavy ? 16 : 10,
            pushback: isHeavy ? 6 : 4,
            height: isCrouch ? ATTACK_HEIGHT.LOW : (isHeavy ? ATTACK_HEIGHT.MID : ATTACK_HEIGHT.HIGH),
            hitType: isHeavy ? HIT_TYPE.HEAVY : HIT_TYPE.LIGHT
          };
        }
      } else if (this.stateTimer <= 19) {
        this.animFrame = 2;
        this.activeHitbox = null;
      } else {
        this.activeHitbox = null;
        this.changeState(this.isCrouching ? FIGHTER_STATE.CROUCH : FIGHTER_STATE.IDLE);
      }
      return;
    }

    if (this.animTimer >= this.animSpeed) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % (frames ? frames.length : 1);
    }
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
      this.consumeStamina(attackData.damage * 0.15);
      this.damageLimb(LIMB_ZONE.LEAD_ARM, attackData.damage * 0.18);
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

    // Apply Arterial Bleed
    if (attackData.hitType === HIT_TYPE.BLEED_SLASH) {
      this.applyStatusEffect(STATUS_EFFECT.BLEED, 240);
    }

    // Limb fatigue distribution
    if (attackData.height === ATTACK_HEIGHT.LOW) {
      this.damageLimb(LIMB_ZONE.LEAD_LEG, attackData.damage * 0.35);
    } else if (attackData.height === ATTACK_HEIGHT.MID) {
      this.damageLimb(LIMB_ZONE.TORSO, attackData.damage * 0.22);
      this.damageLimb(LIMB_ZONE.LEAD_ARM, attackData.damage * 0.15);
    } else if (attackData.height === ATTACK_HEIGHT.HIGH) {
      this.damageLimb(LIMB_ZONE.HEAD, attackData.damage * 0.30);
      this.damageLimb(LIMB_ZONE.LEAD_ARM, attackData.damage * 0.15);
    }

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

    let stunVal = attackData.hitStun || 16;
    if (this.limbs.head <= 30) {
      stunVal += 3; // Concussed head extends flinch
    }
    this.hitStun = stunVal;
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

    // 5. 2V2 Cel-Shaded Team Ground Indicator
    ctx.save();
    ctx.fillStyle = this.team === 1 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(244, 63, 94, 0.45)';
    ctx.beginPath();
    ctx.ellipse(this.x + 40, this.y, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. Held Environmental Weapon Pickup
    if (this.heldPickup) {
      ctx.save();
      const pickX = this.facingRight ? this.x + 55 : this.x + 10;
      const pickY = this.y - 45;
      if (this.heldPickup === 'bottle') {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(pickX, pickY, 5, 12);
        ctx.fillStyle = '#6ee7b7';
        ctx.fillRect(pickX + 1, pickY - 4, 3, 4);
      } else if (this.heldPickup === 'brick') {
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(pickX, pickY, 10, 7);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(pickX + 1, pickY + 1, 7, 4);
      } else if (this.heldPickup === 'lumber') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(pickX - 4, pickY - 18, 7, 36);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(pickX - 2, pickY - 16, 3, 32);
      }
      ctx.restore();
    }
  }
}
