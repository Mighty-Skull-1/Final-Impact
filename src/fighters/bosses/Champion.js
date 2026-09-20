// Final Impact - The Corrupted Champion (Rex "The Apex" Gannon)
// Features 2-Phase Elden Ring Style Boss Progression!
import { Fighter } from '../Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE, LIMB_ZONE } from '../../engine/Constants.js';
import { Box } from '../../engine/Hitbox.js';
import { soundFX } from '../../audio/SoundFX.js';

export class Champion extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'champion',
      name: 'REX GANNON'
    });
    this.walkSpeed = 3.6;
    this.dashSpeed = 7.6;
    this.isApplyingSubmission = false;
    this.submissionTimer = 0;
    this.targetSubmissionLimb = LIMB_ZONE.LEAD_ARM;

    // Elden Ring 2-Phase Progression State
    this.phase = 1;
    this.hasTransitioned = false;
    this.transitionTimer = 0;
    this.phase2FlameParticles = [];
    this.shockwaves = [];
  }

  takeHit(attackData, fromDirection) {
    if (this.isInvincible && this.transitionTimer <= 0) return false;
    if (this.isDead) return false;

    // Phase 2 Hyper-Armor against light hits
    if (this.phase === 2 && attackData.hitType === HIT_TYPE.LIGHT) {
      soundFX.playBlock();
      this.health = Math.max(1, this.health - Math.floor(attackData.damage * 0.5));
      this.armorFlash = 5;
      return 'armored';
    }

    // Elden Ring Phase Transition Trigger when Phase 1 HP reaches 0!
    if (this.phase === 1 && !this.hasTransitioned && this.health - attackData.damage <= 0) {
      this.triggerPhase2Transition();
      return 'phase_transition';
    }

    const res = super.takeHit(attackData, fromDirection);

    // Phase 2 Defeat Check
    if (this.phase === 2 && this.health <= 0) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('legend-vanquished', { detail: { boss: this } }));
      }
    }

    return res;
  }

  triggerPhase2Transition() {
    this.phase = 2;
    this.hasTransitioned = true;
    this.transitionTimer = 160; // 2.6 seconds dramatic freeze
    this.name = 'REX GANNON, PRIMEVAL APEX';
    this.maxHealth = 1200;
    this.health = 1200;
    this.walkSpeed = 4.8;
    this.dashSpeed = 9.4;
    this.isInvincible = true;
    this.vx = 0;
    this.vy = 0;
    this.changeState(FIGHTER_STATE.IDLE);

    soundFX.playKO();
    soundFX.playRageIgnite();
    soundFX.playGong();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('elden-ring-phase2', { detail: { boss: this } }));
    }
  }

  attemptShootTakedown(opponent) {
    this.changeState(FIGHTER_STATE.SPECIAL_1);
    soundFX.playWhoosh('heavy');
    this.vx = (this.facingRight ? 1 : -1) * (this.phase === 2 ? 10.5 : 8.5);
  }

  startSubmissionLock(opponent, limbZone = LIMB_ZONE.LEAD_ARM) {
    this.isApplyingSubmission = true;
    this.submissionTimer = this.phase === 2 ? 130 : 160;
    this.targetSubmissionLimb = limbZone;
    opponent.changeState(FIGHTER_STATE.SUBMISSION_LOCK);
    opponent.submissionStruggle = 0;
    soundFX.playKnockdown();
  }

  update(opponent, stageWidth = 960) {
    // Handle Phase 2 Cinematic Freeze Transition
    if (this.transitionTimer > 0) {
      this.transitionTimer--;
      this.vx = 0;
      this.vy = 0;

      // Erupting dark flame sparks
      for (let i = 0; i < 4; i++) {
        this.phase2FlameParticles.push({
          x: this.x + 40 + (Math.random() - 0.5) * 45,
          y: this.y - Math.random() * 85,
          vx: (Math.random() - 0.5) * 3,
          vy: -(2.5 + Math.random() * 3.5),
          size: 4 + Math.random() * 5,
          alpha: 1.0,
          color: Math.random() < 0.6 ? '#dc2626' : (Math.random() < 0.5 ? '#7c3aed' : '#fbbf24')
        });
      }

      if (this.transitionTimer <= 0) {
        this.isInvincible = false;
      }
      return;
    }

    super.update(opponent, stageWidth);

    // Phase 2 Continuous Primordial Blood Flame Aura
    if (this.phase === 2 && !this.isDead) {
      for (let i = 0; i < 3; i++) {
        this.phase2FlameParticles.push({
          x: this.x + 20 + Math.random() * 45,
          y: this.y - 10 - Math.random() * 75,
          vx: (Math.random() - 0.5) * 2.2,
          vy: -(2.2 + Math.random() * 3.2),
          size: 3 + Math.random() * 5,
          alpha: 1.0,
          color: Math.random() < 0.6 ? '#dc2626' : (Math.random() < 0.5 ? '#9333ea' : '#f59e0b')
        });
      }
    }

    // Update Phase 2 Particles
    for (let i = this.phase2FlameParticles.length - 1; i >= 0; i--) {
      const p = this.phase2FlameParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.04;
      if (p.alpha <= 0) this.phase2FlameParticles.splice(i, 1);
    }

    // Update Earth Shatter Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.x += sw.vx;
      sw.life--;

      if (opponent && !opponent.isDead && sw.active && opponent.isGrounded) {
        if (Math.abs(sw.x - opponent.x) < 36) {
          sw.active = false;
          opponent.takeHit({
            damage: 65,
            hitStun: 26,
            blockStun: 14,
            pushback: 7,
            height: ATTACK_HEIGHT.LOW,
            hitType: HIT_TYPE.KNOCKDOWN,
            chipDamage: 12
          }, sw.vx > 0 ? 1 : -1);
          soundFX.playHitHeavy();
        }
      }

      if (sw.life <= 0 || sw.x < 0 || sw.x > stageWidth) {
        this.shockwaves.splice(i, 1);
      }
    }

    // If opponent is knocked down and close, transition into Submission Lock
    if (opponent && opponent.state === FIGHTER_STATE.KNOCKDOWN && !this.isApplyingSubmission && Math.abs(this.x - opponent.x) < 70) {
      this.startSubmissionLock(opponent, Math.random() < 0.5 ? LIMB_ZONE.LEAD_ARM : LIMB_ZONE.LEAD_LEG);
    }

    // Process active submission hold
    if (this.isApplyingSubmission) {
      this.submissionTimer--;
      this.vx = 0;
      if (opponent) {
        opponent.vx = 0;
        // Escape check: if player mashed struggle meter to 100
        if (opponent.submissionStruggle >= 100) {
          this.isApplyingSubmission = false;
          soundFX.playWhoosh('light');
          opponent.changeState(FIGHTER_STATE.IDLE);
          this.changeState(FIGHTER_STATE.HIT);
          return;
        }
      }

      // Time expired: joint rupture!
      if (this.submissionTimer <= 0) {
        this.isApplyingSubmission = false;
        soundFX.playKO();
        if (opponent) {
          opponent.damageLimb(this.targetSubmissionLimb, 100); // 100% Limb Destruction!
          opponent.health = Math.max(1, opponent.health - (this.phase === 2 ? 140 : 90));
          opponent.changeState(FIGHTER_STATE.KNOCKDOWN);
        }
        this.changeState(FIGHTER_STATE.IDLE);
      }
    }
  }

  updateState(opponent) {
    this.animTimer++;
    const frames = this.sprites[this.state] || this.sprites.IDLE;

    switch (this.state) {
      case FIGHTER_STATE.SPECIAL_1:
        // Fast Double-Leg Shoot Takedown / Primeval Dash
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 14) {
          this.animFrame = 1;
          this.activeHitbox = new Box(32, 45, 65, 30);
          this.currentAttackData = {
            damage: this.phase === 2 ? 95 : 70,
            hitStun: 30,
            blockStun: 14,
            pushback: 6,
            height: ATTACK_HEIGHT.LOW,
            hitType: HIT_TYPE.KNOCKDOWN
          };
        } else if (this.stateTimer <= 22) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.SPECIAL_2:
        // Phase 2 Signature: Primeval Earth Shatter Stomp Shockwave
        if (this.stateTimer <= 6) {
          this.animFrame = 0;
          this.vy = -4.5;
        } else if (this.stateTimer === 12) {
          this.animFrame = 1;
          soundFX.playKnockdown();
          soundFX.playHitHeavy();
          // Spawn horizontal ground wave
          this.shockwaves.push({
            x: this.x + (this.facingRight ? 45 : 15),
            y: 295,
            vx: (this.facingRight ? 1 : -1) * 8.2,
            life: 65,
            active: true
          });
        } else if (this.stateTimer <= 22) {
          this.animFrame = 2;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.SPECIAL_3:
        // Phase 2 Signature: Blood Frenzy 4-Hit Fatal Rush
        if (this.stateTimer <= 4) {
          this.animFrame = 0;
          this.vx = (this.facingRight ? 1 : -1) * 5.5;
        } else if (this.stateTimer <= 16) {
          this.animFrame = 1;
          this.activeHitbox = new Box(38, 20, 70, 35);
          this.currentAttackData = {
            damage: 110,
            hitStun: 35,
            blockStun: 20,
            pushback: 8,
            height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.KNOCKDOWN,
            chipDamage: 20
          };
        } else if (this.stateTimer <= 25) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
        // Stiff Lead Jab
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 9) {
          this.animFrame = 1;
          this.activeHitbox = new Box(38, 22, 58, 22);
          this.currentAttackData = {
            damage: this.phase === 2 ? 65 : 50,
            hitStun: 18,
            blockStun: 12,
            pushback: 4,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.LIGHT
          };
        } else if (this.stateTimer <= 14) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.ATTACK_HEAVY_PUNCH:
        // Brutal Overhand Right
        if (this.stateTimer <= 6) this.animFrame = 0;
        else if (this.stateTimer <= 15) {
          this.animFrame = 1;
          this.activeHitbox = new Box(36, 18, 65, 40);
          this.currentAttackData = {
            damage: this.phase === 2 ? 120 : 95,
            hitStun: 30,
            blockStun: 18,
            pushback: 8,
            height: ATTACK_HEIGHT.MID,
            hitType: HIT_TYPE.HEAVY
          };
        } else if (this.stateTimer <= 23) {
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

  render(ctx) {
    // 1. Render Earth Shatter Shockwaves
    this.shockwaves.forEach(sw => {
      ctx.save();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(sw.x - 8, 280, 16, 20);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(sw.x - 5, 275, 10, 25);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(sw.x - 2, 270, 4, 30);
      ctx.restore();
    });

    // 2. Render Primordial Flame Aura Particles
    if (this.phase2FlameParticles.length > 0) {
      ctx.save();
      for (const p of this.phase2FlameParticles) {
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.restore();
    }

    // 3. Render Fighter Sprite with Phase 2 Red Eye Flare
    ctx.save();
    if (this.phase === 2) {
      ctx.filter = 'drop-shadow(0 0 10px #dc2626)';
    }
    super.render(ctx);
    ctx.restore();

    // Red Glowing Eyes in Phase 2
    if (this.phase === 2 && !this.isDead) {
      ctx.save();
      const eyeX = this.facingRight ? this.x + 50 : this.x + 28;
      const eyeY = this.y - 78;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(eyeX, eyeY, 4, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(eyeX + 1, eyeY + 1, 2, 1);
      ctx.restore();
    }
  }
}
