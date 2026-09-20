// Final Impact - The Endless Dragon (Stage 8 Final Boss)
// 2-Phase Elden Ring Style Boss with Randomized Phase 2 Abilities
import { Fighter } from '../Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE } from '../../engine/Constants.js';
import { Box } from '../../engine/Hitbox.js';
import { soundFX } from '../../audio/SoundFX.js';

export class EndlessDragon extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'endless_dragon',
      name: 'THE ENDLESS DRAGON'
    });
    this.maxHealth = 2500;
    this.health = 2500;
    this.walkSpeed = 3.2;
    this.dashSpeed = 8.0;

    // Elden Ring 2-Phase Progression
    this.phase = 1;
    this.hasTransitioned = false;
    this.transitionTimer = 0;
    this.phase2FlameParticles = [];
    this.shockwaves = [];

    // Phase 2 Random Ability System
    this.randomAbilityTimer = 0;
    this.currentAbility = null;
    this.abilityTimer = 0;
    this.diveBombY = 0;
  }

  takeHit(attackData, fromDirection) {
    if (this.isInvincible && this.transitionTimer <= 0) return false;
    if (this.isDead) return false;

    // Phase 2: Hyper-Armor on light AND heavy hits
    if (this.phase === 2 && (attackData.hitType === HIT_TYPE.LIGHT || attackData.hitType === HIT_TYPE.HEAVY)) {
      soundFX.playBlock();
      this.health = Math.max(1, this.health - Math.floor(attackData.damage * 0.5));
      this.armorFlash = 5;
      // Still allow knockdowns to get through
      if (attackData.hitType === HIT_TYPE.KNOCKDOWN) {
        return super.takeHit(attackData, fromDirection);
      }
      return 'armored';
    }

    // Phase 1 -> Phase 2 Transition
    if (this.phase === 1 && !this.hasTransitioned && this.health - attackData.damage <= 0) {
      this.triggerPhase2Transition();
      return 'phase_transition';
    }

    const res = super.takeHit(attackData, fromDirection);

    // Phase 2 Defeat
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
    this.transitionTimer = 200;
    this.name = 'THE ENDLESS DRAGON, ASCENDED';
    this.maxHealth = 2000;
    this.health = 2000;
    this.walkSpeed = 4.5;
    this.dashSpeed = 10.0;
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

  update(opponent, stageWidth = 960) {
    // Phase 2 Cinematic Freeze
    if (this.transitionTimer > 0) {
      this.transitionTimer--;
      this.vx = 0;
      this.vy = 0;

      // Celestial flame eruption
      for (let i = 0; i < 5; i++) {
        this.phase2FlameParticles.push({
          x: this.x + 40 + (Math.random() - 0.5) * 50,
          y: this.y - Math.random() * 90,
          vx: (Math.random() - 0.5) * 4,
          vy: -(3 + Math.random() * 4),
          size: 5 + Math.random() * 6,
          alpha: 1.0,
          color: Math.random() < 0.4 ? '#a855f7' : (Math.random() < 0.5 ? '#ef4444' : '#fbbf24')
        });
      }

      if (this.transitionTimer <= 0) {
        this.isInvincible = false;
        this.randomAbilityTimer = 60;
      }
      return;
    }

    super.update(opponent, stageWidth);

    // Phase 2: Continuous Celestial Flame Aura
    if (this.phase === 2 && !this.isDead) {
      for (let i = 0; i < 3; i++) {
        this.phase2FlameParticles.push({
          x: this.x + 20 + Math.random() * 50,
          y: this.y - 10 - Math.random() * 80,
          vx: (Math.random() - 0.5) * 2.5,
          vy: -(2.5 + Math.random() * 3.5),
          size: 3 + Math.random() * 5,
          alpha: 1.0,
          color: Math.random() < 0.4 ? '#a855f7' : (Math.random() < 0.5 ? '#dc2626' : '#fbbf24')
        });
      }

      // Random Ability Timer
      if (!this.isAttacking() && this.state === FIGHTER_STATE.IDLE) {
        this.randomAbilityTimer--;
        if (this.randomAbilityTimer <= 0) {
          this.executeRandomAbility(opponent, stageWidth);
          this.randomAbilityTimer = 100 + Math.floor(Math.random() * 40);
        }
      }
    }

    // Update Flame Particles
    for (let i = this.phase2FlameParticles.length - 1; i >= 0; i--) {
      const p = this.phase2FlameParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;
      if (p.alpha <= 0) this.phase2FlameParticles.splice(i, 1);
    }
    // Cap particles
    if (this.phase2FlameParticles.length > 60) {
      this.phase2FlameParticles.splice(0, this.phase2FlameParticles.length - 60);
    }

    // Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.x += sw.vx;
      if (sw.vy !== undefined) sw.y = (sw.y || 0) + sw.vy;
      sw.life--;

      if (opponent && !opponent.isDead && sw.active) {
        const hitRange = sw.wide ? 50 : 36;
        if (Math.abs(sw.x - opponent.x) < hitRange && (!sw.isAerial || Math.abs((sw.y || 300) - opponent.y) < 60)) {
          sw.active = false;
          opponent.takeHit({
            damage: sw.damage || 65,
            hitStun: 26,
            blockStun: 14,
            pushback: 7,
            height: sw.height || ATTACK_HEIGHT.LOW,
            hitType: HIT_TYPE.KNOCKDOWN,
            chipDamage: 15
          }, sw.vx > 0 ? 1 : -1);
          soundFX.playHitHeavy();
        }
      }

      if (sw.life <= 0 || sw.x < -50 || sw.x > stageWidth + 50) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Process Dive Bomb landing
    if (this.currentAbility === 'dive_bomb' && this.abilityTimer > 0) {
      this.abilityTimer--;
      if (this.abilityTimer === 15) {
        // Slam down
        this.vy = 18;
        this.isGrounded = false;
      }
      if (this.abilityTimer <= 10 && this.isGrounded) {
        // AoE on landing
        if (this.abilityTimer === 10) {
          if (opponent && !opponent.isDead && Math.abs(this.x - opponent.x) < 100) {
            opponent.takeHit({
              damage: 110,
              hitStun: 30,
              blockStun: 16,
              pushback: 10,
              height: ATTACK_HEIGHT.MID,
              hitType: HIT_TYPE.KNOCKDOWN,
              chipDamage: 20
            }, this.facingRight ? 1 : -1);
            soundFX.playHitHeavy();
          }
          // Ground shockwaves on impact
          this.shockwaves.push(
            { x: this.x + 40, vx: 5, life: 40, active: true, damage: 50, wide: true },
            { x: this.x + 40, vx: -5, life: 40, active: true, damage: 50, wide: true }
          );
        }
        if (this.abilityTimer <= 0) {
          this.currentAbility = null;
          this.isInvincible = false;
        }
      }
    }
  }

  executeRandomAbility(opponent, stageWidth) {
    const abilities = ['dragon_roar', 'meteor_rain', 'teleport_blitz', 'draconic_beam', 'dive_bomb'];
    const choice = abilities[Math.floor(Math.random() * abilities.length)];
    this.currentAbility = choice;

    switch (choice) {
      case 'dragon_roar':
        // AoE shockwave around boss
        soundFX.playHadouken();
        if (opponent && !opponent.isDead && Math.abs(this.x - opponent.x) < 120) {
          opponent.takeHit({
            damage: 80, hitStun: 24, blockStun: 12, pushback: 8,
            height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.HEAVY, chipDamage: 12
          }, this.facingRight ? 1 : -1);
          soundFX.playHitHeavy();
        }
        // Visual shockwaves
        this.shockwaves.push(
          { x: this.x + 40, vx: 6, life: 30, active: true, damage: 40, wide: true },
          { x: this.x + 40, vx: -6, life: 30, active: true, damage: 40, wide: true }
        );
        this.currentAbility = null;
        break;

      case 'meteor_rain':
        // 3 meteors at random positions
        soundFX.playWhoosh('heavy');
        for (let i = 0; i < 3; i++) {
          const mx = 100 + Math.random() * (stageWidth - 200);
          this.shockwaves.push({
            x: mx, vx: 0, vy: 8, y: -50,
            life: 60, active: true, damage: 70,
            isAerial: true, height: ATTACK_HEIGHT.HIGH, wide: true
          });
        }
        this.currentAbility = null;
        break;

      case 'teleport_blitz':
        // Teleport behind opponent, then attack
        soundFX.playWhoosh('heavy');
        if (opponent && !opponent.isDead) {
          this.x = opponent.facingRight ? opponent.x - 70 : opponent.x + 70;
          this.facingRight = this.x < opponent.x;
          this.changeState(FIGHTER_STATE.SPECIAL_1);
        }
        this.currentAbility = null;
        break;

      case 'draconic_beam':
        // Horizontal beam
        soundFX.playHadouken();
        const dir = this.facingRight ? 1 : -1;
        this.shockwaves.push({
          x: this.x + (this.facingRight ? 80 : -20),
          vx: dir * 10, life: 60, active: true,
          damage: 100, height: ATTACK_HEIGHT.MID, wide: true
        });
        this.currentAbility = null;
        break;

      case 'dive_bomb':
        // Jump high then slam
        this.isInvincible = true;
        this.isGrounded = false;
        this.vy = -16;
        this.vx = 0;
        this.abilityTimer = 40;
        soundFX.playWhoosh('heavy');
        // Aim at opponent
        if (opponent && !opponent.isDead) {
          this.vx = (opponent.x - this.x) * 0.04;
        }
        break;
    }
  }

  updateState(opponent) {
    super.updateState(opponent);

    switch (this.state) {
      // SPECIAL 1: DRAGON CLAW SWIPE
      case FIGHTER_STATE.SPECIAL_1:
        if (this.stateTimer <= 5) this.animFrame = 0;
        else if (this.stateTimer <= 14) {
          this.animFrame = 1;
          this.activeHitbox = new Box(20, 20, 100, 45);
          this.currentAttackData = {
            damage: this.phase === 2 ? 140 : 120,
            hitStun: 30, blockStun: 16, pushback: 8,
            height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.KNOCKDOWN
          };
        } else if (this.stateTimer <= 24) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      // SPECIAL 2: TAIL SWEEP
      case FIGHTER_STATE.SPECIAL_2:
        if (this.stateTimer <= 6) this.animFrame = 0;
        else if (this.stateTimer <= 15) {
          this.animFrame = 1;
          this.activeHitbox = new Box(10, 55, 100, 25);
          this.currentAttackData = {
            damage: this.phase === 2 ? 110 : 95,
            hitStun: 26, blockStun: 14, pushback: 8,
            height: ATTACK_HEIGHT.LOW, hitType: HIT_TYPE.KNOCKDOWN
          };
        } else if (this.stateTimer <= 25) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      // SPECIAL 3: FLAME WAVE
      case FIGHTER_STATE.SPECIAL_3:
        if (this.stateTimer <= 8) this.animFrame = 0;
        else if (this.stateTimer <= 12) {
          this.animFrame = 1;
          if (this.stateTimer === 10) {
            soundFX.playHadouken();
            // Spawn flame wave shockwaves
            this.shockwaves.push(
              { x: this.x + 60, vx: 5.5, life: 50, active: true, damage: 65 },
              { x: this.x + 20, vx: -5.5, life: 50, active: true, damage: 65 }
            );
          }
        } else if (this.stateTimer <= 22) {
          this.animFrame = 2;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;
    }
  }

  render(ctx) {
    super.render(ctx);

    // Render Phase 2 Flame Particles
    for (const p of this.phase2FlameParticles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Render Shockwaves
    for (const sw of this.shockwaves) {
      if (!sw.active) continue;
      ctx.fillStyle = this.phase === 2 ? 'rgba(168, 85, 247, 0.7)' : 'rgba(239, 68, 68, 0.7)';
      const swY = sw.y !== undefined ? sw.y : 290;
      if (sw.isAerial) {
        // Meteor
        ctx.beginPath();
        ctx.arc(sw.x, swY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(sw.x, swY, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Ground wave
        ctx.fillRect(sw.x - 12, 285, 24, 12);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(sw.x - 6, 288, 12, 6);
      }
    }

    // Phase 2: Dark Energy Aura
    if (this.phase === 2 && !this.isDead) {
      ctx.globalAlpha = 0.15 + Math.sin(Date.now() * 0.003) * 0.08;
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      ctx.arc(this.x + 40, this.y - 40, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }
}
