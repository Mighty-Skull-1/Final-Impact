// Final Impact - The Endless Dragon (Stage 8 Final Boss & Unlockable Conqueror)
// Features: 2-Phase Elden Ring Boss, Hyper-Armor, Aerial Flight State Machine & Player Controls
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
    this.maxHealth = 2600;
    this.health = 2600;
    this.walkSpeed = 3.4;
    this.dashSpeed = 8.5;
    this.jumpForce = -13.5;

    // Elden Ring 2-Phase Progression
    this.phase = 1;
    this.hasTransitioned = false;
    this.transitionTimer = 0;
    this.phase2FlameParticles = [];
    this.shockwaves = [];
    this.lightningBolts = [];

    // Flight Mechanics & Aerial Arsenal
    this.isFlying = false;
    this.flightTimer = 0;
    this.hoverY = 175;
    this.wingFlapAngle = 0;
    this.diveBombing = false;
    this.carpetBombing = false;
    this.carpetTimer = 0;

    // Phase 2 Random Ability System
    this.randomAbilityTimer = 90;
    this.currentAbility = null;
    this.abilityTimer = 0;
    this.flightCooldown = 120;
  }

  takeHit(attackData, fromDirection) {
    if (this.isInvincible && this.transitionTimer <= 0) return false;
    if (this.isDead) return false;

    // When flying, ground low attacks completely whiff
    if (this.isFlying && attackData.height === ATTACK_HEIGHT.LOW) {
      return false;
    }

    // Phase 2: Hyper-Armor on light hits
    if (this.phase === 2 && attackData.hitType === HIT_TYPE.LIGHT) {
      soundFX.playBlock();
      this.health = Math.max(1, this.health - Math.floor(attackData.damage * 0.45));
      this.armorFlash = 6;
      return 'armored';
    }

    // Phase 1 -> Phase 2 Transition
    if (this.phase === 1 && !this.hasTransitioned && this.health - attackData.damage <= 0) {
      this.triggerPhase2Transition();
      return 'phase_transition';
    }

    // Knocking dragon out of the sky with heavy anti-air or knockdown
    if (this.isFlying && (attackData.hitType === HIT_TYPE.KNOCKDOWN || attackData.hitType === HIT_TYPE.HEAVY)) {
      this.endFlight(true);
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
    this.transitionTimer = 220;
    this.name = 'THE ENDLESS DRAGON, ASCENDED';
    this.maxHealth = 2200;
    this.health = 2200;
    this.walkSpeed = 4.8;
    this.dashSpeed = 10.5;
    this.isInvincible = true;
    this.vx = 0;
    this.vy = 0;
    this.endFlight(false);
    this.changeState(FIGHTER_STATE.IDLE);

    soundFX.playKO();
    soundFX.playRageIgnite();
    soundFX.playGong();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('elden-ring-phase2', { detail: { boss: this } }));
    }
  }

  startFlight(duration = 420) {
    if (this.isFlying || this.isDead || this.state === FIGHTER_STATE.KNOCKDOWN) return;
    this.isFlying = true;
    this.flightTimer = duration;
    this.isGrounded = false;
    this.vy = -10;
    soundFX.playWhoosh('heavy');
    soundFX.playRageIgnite();
  }

  endFlight(crash = false) {
    this.isFlying = false;
    this.flightTimer = 0;
    this.diveBombing = false;
    this.carpetBombing = false;
    this.flightCooldown = 150;
    if (crash) {
      this.vy = 8;
      this.changeState(FIGHTER_STATE.KNOCKDOWN);
      soundFX.playHitHeavy();
    } else {
      this.vy = 4;
    }
  }

  handleInput(inputState, inputManager, opponent) {
    // If not controlled by human player, boss AI takes over
    if (this.isCpu) return;

    if (this.hitStun > 0 || this.blockStun > 0 || this.state === FIGHTER_STATE.KNOCKDOWN) return;

    const pNum = this.playerNum;
    this.isHoldingBack = !!inputState.back;
    this.isCrouching = !this.isFlying && !!inputState.down;

    // Flight Handling for Player
    if (this.isFlying) {
      // 3D Aerial Flight movement
      const flightSpeed = 5.2;
      if (inputState.fwd) this.vx = (this.facingRight ? 1 : -1) * flightSpeed;
      else if (inputState.back) this.vx = (this.facingRight ? -1 : 1) * flightSpeed;
      else this.vx *= 0.85;

      if (inputState.up) this.hoverY = Math.max(120, this.hoverY - 3);
      if (inputState.down) this.hoverY = Math.min(230, this.hoverY + 3);

      // Aerial Attack: Dive Bomb
      if (inputState.hkJust || inputState.lkJust) {
        this.startCataclysmicDivebomb(opponent);
        return;
      }

      // Aerial Attack: Fire Breath Wave
      if (inputState.hpJust || inputState.lpJust) {
        this.fireCarpetFlame();
        return;
      }

      // Land manually with SP3
      if (inputState.sp3Just) {
        this.endFlight(false);
        return;
      }
      return;
    }

    // Ground Attacks & Specials
    // 1. Ultimate: ANCIENT CATACLYSM
    const canSuper = this.superMeter >= 100 || (inputManager && inputManager.easyInputs);
    const wantsUltimate = inputState.ultimateJust || (inputManager && inputManager.peekAction(pNum) === 'ULTIMATE');
    if (wantsUltimate && canSuper && !this.isAttacking()) {
      if (inputManager) inputManager.consumeBuffer(pNum);
      this.startUltimate(opponent);
      return;
    }

    // 2. Dirty Tactic: DRACONIC ROAR
    const wantsDirty = inputState.dirtyJust || (inputManager && inputManager.peekAction(pNum) === 'DIRTY');
    if (wantsDirty && this.isGrounded && !this.isAttacking()) {
      if (inputManager) inputManager.consumeAction(pNum);
      this.startDraconicRoar();
      return;
    }

    // 3. SP3: ACTIVATE DRAGON FLIGHT
    const anyAttackJust = inputState.lpJust || inputState.hpJust || inputState.lkJust || inputState.hkJust;
    const isSP3 = inputState.sp3Just || (inputManager && inputManager.peekAction(pNum) === 'SP3');
    if (isSP3 && !this.isAttacking()) {
      if (inputManager) inputManager.consumeBuffer(pNum);
      this.startFlight(450);
      return;
    }

    // 4. SP1: DRAGON CLAW (QCF + P)
    const isSP1 = inputState.sp1Just || (inputManager && ((inputManager.checkQCF(pNum) && anyAttackJust) || inputManager.peekAction(pNum) === 'SP1'));
    if (isSP1 && !this.isAttacking()) {
      if (inputManager) inputManager.consumeBuffer(pNum);
      this.changeState(FIGHTER_STATE.SPECIAL_1);
      soundFX.playWhoosh('heavy');
      return;
    }

    // 5. SP2: TAIL SWEEP (DP + K or SP2)
    const isSP2 = inputState.sp2Just || (inputManager && ((inputManager.checkDP(pNum) && anyAttackJust) || inputManager.peekAction(pNum) === 'SP2'));
    if (isSP2 && !this.isAttacking()) {
      if (inputManager) inputManager.consumeBuffer(pNum);
      this.changeState(FIGHTER_STATE.SPECIAL_2);
      soundFX.playWhoosh('heavy');
      return;
    }

    // Normals
    const lpT = inputState.lpJust;
    const hpT = inputState.hpJust;
    const lkT = inputState.lkJust;
    const hkT = inputState.hkJust;

    if (!this.isAttacking()) {
      if (inputState.down) {
        if (lpT) { this.changeState(FIGHTER_STATE.CROUCH_LIGHT_PUNCH, true); soundFX.playWhoosh('light'); return; }
        if (hpT) { this.changeState(FIGHTER_STATE.CROUCH_HEAVY_PUNCH, true); soundFX.playWhoosh('heavy'); return; }
        if (lkT) { this.changeState(FIGHTER_STATE.CROUCH_LIGHT_KICK, true); soundFX.playWhoosh('light'); return; }
        if (hkT) { this.changeState(FIGHTER_STATE.CROUCH_HEAVY_KICK, true); soundFX.playWhoosh('heavy'); return; }
        this.changeState(FIGHTER_STATE.CROUCH);
        return;
      }

      if (lpT) { this.changeState(FIGHTER_STATE.ATTACK_LIGHT_PUNCH, true); soundFX.playWhoosh('light'); return; }
      if (hpT) { this.changeState(FIGHTER_STATE.ATTACK_HEAVY_PUNCH, true); soundFX.playWhoosh('heavy'); return; }
      if (lkT) { this.changeState(FIGHTER_STATE.ATTACK_LIGHT_KICK, true); soundFX.playWhoosh('light'); return; }
      if (hkT) { this.changeState(FIGHTER_STATE.ATTACK_HEAVY_KICK, true); soundFX.playWhoosh('heavy'); return; }

      if (inputState.up && this.isGrounded) {
        this.vy = this.jumpForce;
        this.isGrounded = false;
        this.changeState(FIGHTER_STATE.JUMP);
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
  }

  startDraconicRoar() {
    this.changeState(FIGHTER_STATE.DIRTY_TACTIC);
    soundFX.playHadouken();
    this.shockwaves.push(
      { x: this.x + 40, vx: 6.5, life: 35, active: true, damage: 85, wide: true },
      { x: this.x + 40, vx: -6.5, life: 35, active: true, damage: 85, wide: true }
    );
  }

  startUltimate(opponent) {
    this.superMeter = 0;
    this.changeState(FIGHTER_STATE.ULTIMATE);
    this.isInvincible = true;
    soundFX.playUltimateActivation();
    soundFX.playGong();

    // Trigger full screen ancient meteor tempest
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        if (!this.isDead) {
          const targetX = opponent ? opponent.x + (Math.random() - 0.5) * 120 : 300 + Math.random() * 360;
          this.shockwaves.push({
            x: targetX, vx: (Math.random() - 0.5) * 2, vy: 9, y: -60,
            life: 65, active: true, damage: 90, isAerial: true, wide: true
          });
          soundFX.playWhoosh('heavy');
        }
      }, i * 180);
    }
  }

  update(opponent, stageWidth = 960) {
    // Phase 2 Cinematic Freeze
    if (this.transitionTimer > 0) {
      this.transitionTimer--;
      this.vx = 0;
      this.vy = 0;

      // Celestial flame eruption
      for (let i = 0; i < 6; i++) {
        this.phase2FlameParticles.push({
          x: this.x + 40 + (Math.random() - 0.5) * 60,
          y: this.y - Math.random() * 95,
          vx: (Math.random() - 0.5) * 5,
          vy: -(3 + Math.random() * 5),
          size: 5 + Math.random() * 7,
          alpha: 1.0,
          color: Math.random() < 0.35 ? '#a855f7' : (Math.random() < 0.5 ? '#ef4444' : '#fbbf24')
        });
      }

      if (this.transitionTimer <= 0) {
        this.isInvincible = false;
        this.randomAbilityTimer = 40;
        this.startFlight(480);
      }
      return;
    }

    // Wing flap animation
    this.wingFlapAngle += this.isFlying ? 0.28 : 0.08;

    // Flight Physics
    if (this.isFlying && !this.diveBombing) {
      this.flightTimer--;
      this.isGrounded = false;

      // Smooth floating sine altitude
      const targetY = this.hoverY + Math.sin(Date.now() * 0.005) * 12;
      this.y += (targetY - this.y) * 0.12;

      // Flight particles
      this.phase2FlameParticles.push({
        x: this.x + 10 + Math.random() * 60,
        y: this.y + 5,
        vx: (Math.random() - 0.5) * 2,
        vy: 2 + Math.random() * 2,
        size: 3 + Math.random() * 4,
        alpha: 0.9,
        color: Math.random() < 0.5 ? '#7c3aed' : '#fbbf24'
      });

      // AI Flight Behavior
      if (this.isCpu && opponent && !opponent.isDead) {
        // Track opponent horizontally
        const dist = opponent.x - this.x;
        const flightDir = dist > 0 ? 1 : -1;
        this.vx = flightDir * (this.phase === 2 ? 4.8 : 3.5);
        this.facingRight = dist > 0;

        // Aerial Attacks during flight
        if (this.flightTimer % 80 === 0) {
          const aerialMoves = ['carpet', 'meteors', 'dive'];
          const move = aerialMoves[Math.floor(Math.random() * aerialMoves.length)];
          if (move === 'carpet') this.fireCarpetFlame();
          else if (move === 'meteors') this.executeMeteorSwarm(stageWidth);
          else if (move === 'dive') this.startCataclysmicDivebomb(opponent);
        }
      }

      if (this.flightTimer <= 0) {
        this.startCataclysmicDivebomb(opponent);
      }
    } else {
      if (this.flightCooldown > 0) this.flightCooldown--;
      super.update(opponent, stageWidth);
    }

    // Phase 2 Continuous Celestial Flame Aura
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

      // AI Ground Attack cycle
      if (this.isCpu && !this.isAttacking() && this.state === FIGHTER_STATE.IDLE && !this.isFlying) {
        this.randomAbilityTimer--;
        if (this.randomAbilityTimer <= 0) {
          if (this.flightCooldown <= 0 && Math.random() < 0.55) {
            this.startFlight(450);
          } else {
            this.executeRandomAbility(opponent, stageWidth);
          }
          this.randomAbilityTimer = this.phase === 2 ? 70 + Math.floor(Math.random() * 35) : 100 + Math.floor(Math.random() * 45);
        }
      }
    } else if (this.isCpu && !this.isAttacking() && this.state === FIGHTER_STATE.IDLE && !this.isFlying) {
      // Phase 1 Flight Trigger
      if (this.flightCooldown <= 0 && Math.random() < 0.35) {
        this.startFlight(360);
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
    if (this.phase2FlameParticles.length > 70) {
      this.phase2FlameParticles.splice(0, this.phase2FlameParticles.length - 70);
    }

    // Update Shockwaves & Meteors
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.x += sw.vx;
      if (sw.vy !== undefined) sw.y = (sw.y || 0) + sw.vy;
      sw.life--;

      if (opponent && !opponent.isDead && sw.active) {
        const hitRange = sw.wide ? 55 : 38;
        const swY = sw.y !== undefined ? sw.y : 300;
        const yDist = Math.abs(swY - opponent.y);

        if (Math.abs(sw.x - opponent.x) < hitRange && yDist < 65) {
          sw.active = false;
          opponent.takeHit({
            damage: sw.damage || 75,
            hitStun: 28,
            blockStun: 16,
            pushback: 8,
            height: sw.height || ATTACK_HEIGHT.LOW,
            hitType: HIT_TYPE.KNOCKDOWN,
            chipDamage: 18
          }, sw.vx > 0 ? 1 : -1);
          soundFX.playHitHeavy();
        }
      }

      if (sw.life <= 0 || sw.x < -60 || sw.x > stageWidth + 60 || (sw.y !== undefined && sw.y > 330)) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update Lightning Bolts
    for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
      const lb = this.lightningBolts[i];
      lb.life--;
      if (lb.active && lb.life <= 20) {
        // Strike hits
        if (opponent && !opponent.isDead && Math.abs(lb.x - opponent.x) < 45) {
          lb.active = false;
          opponent.takeHit({
            damage: 85, hitStun: 30, blockStun: 18, pushback: 6,
            height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.KNOCKDOWN, chipDamage: 16
          }, 1);
          soundFX.playHitHeavy();
        }
      }
      if (lb.life <= 0) this.lightningBolts.splice(i, 1);
    }

    // Process Cataclysmic Divebomb Slam
    if (this.diveBombing) {
      this.vy += 2.0;
      this.y += this.vy;
      this.x += this.vx;

      if (this.y >= 300) {
        this.y = 300;
        this.vy = 0;
        this.vx = 0;
        this.isGrounded = true;
        this.diveBombing = false;
        this.endFlight(false);

        // Ground Impact AoE & Massive Bi-directional Shockwaves
        soundFX.playKO();
        soundFX.playHitHeavy();

        if (opponent && !opponent.isDead && Math.abs(this.x - opponent.x) < 130) {
          opponent.takeHit({
            damage: this.phase === 2 ? 140 : 110,
            hitStun: 35, blockStun: 20, pushback: 12,
            height: ATTACK_HEIGHT.MID, hitType: HIT_TYPE.KNOCKDOWN, chipDamage: 25
          }, this.facingRight ? 1 : -1);
        }

        this.shockwaves.push(
          { x: this.x + 40, vx: 7.5, life: 45, active: true, damage: 70, wide: true },
          { x: this.x + 40, vx: -7.5, life: 45, active: true, damage: 70, wide: true }
        );
      }
    }
  }

  fireCarpetFlame() {
    soundFX.playHadouken();
    const dir = this.facingRight ? 1 : -1;
    // Rains flame carpet to the ground below
    for (let i = 0; i < 3; i++) {
      this.shockwaves.push({
        x: this.x + dir * (30 + i * 40),
        y: this.y + 20,
        vx: dir * (4 + i),
        vy: 5,
        life: 50,
        active: true,
        damage: 65,
        wide: true,
        height: ATTACK_HEIGHT.LOW
      });
    }
  }

  startCataclysmicDivebomb(opponent) {
    this.diveBombing = true;
    this.vy = 16;
    soundFX.playWhoosh('heavy');
    if (opponent && !opponent.isDead) {
      this.vx = (opponent.x - this.x) * 0.055;
    }
  }

  executeMeteorSwarm(stageWidth) {
    soundFX.playWhoosh('heavy');
    const count = this.phase === 2 ? 6 : 4;
    for (let i = 0; i < count; i++) {
      const mx = 80 + Math.random() * (stageWidth - 160);
      this.shockwaves.push({
        x: mx,
        vx: (Math.random() - 0.5) * 2,
        vy: 8 + Math.random() * 2,
        y: -40 - i * 30,
        life: 75,
        active: true,
        damage: 75,
        isAerial: true,
        wide: true
      });
    }
  }

  executeRandomAbility(opponent, stageWidth) {
    const abilities = ['dragon_roar', 'meteor_rain', 'teleport_blitz', 'void_lightning', 'dive_bomb'];
    const choice = abilities[Math.floor(Math.random() * abilities.length)];

    switch (choice) {
      case 'dragon_roar':
        this.startDraconicRoar();
        break;

      case 'meteor_rain':
        this.executeMeteorSwarm(stageWidth);
        break;

      case 'teleport_blitz':
        soundFX.playWhoosh('heavy');
        if (opponent && !opponent.isDead) {
          this.x = opponent.facingRight ? opponent.x - 75 : opponent.x + 75;
          this.facingRight = this.x < opponent.x;
          this.changeState(FIGHTER_STATE.SPECIAL_1);
        }
        break;

      case 'void_lightning':
        soundFX.playHadouken();
        for (let i = 0; i < 3; i++) {
          const lx = 120 + Math.random() * (stageWidth - 240);
          this.lightningBolts.push({ x: lx, life: 35, active: true });
        }
        break;

      case 'dive_bomb':
        this.startFlight(120);
        setTimeout(() => {
          if (this.isFlying) this.startCataclysmicDivebomb(opponent);
        }, 300);
        break;
    }
  }

  updateState(opponent) {
    this.animTimer++;
    const frames = this.sprites[this.state] || this.sprites.IDLE;

    switch (this.state) {
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

      case FIGHTER_STATE.SPECIAL_3:
        this.startFlight(420);
        this.changeState(FIGHTER_STATE.IDLE);
        break;

      case FIGHTER_STATE.DIRTY_TACTIC:
        if (this.stateTimer <= 6) {
          this.animFrame = 0;
        } else if (this.stateTimer <= 16) {
          this.animFrame = 1;
          this.activeHitbox = new Box(15, 15, 80, 50);
          this.currentAttackData = {
            damage: 80, hitStun: 50, blockStun: 18, pushback: 8,
            height: ATTACK_HEIGHT.UNBLOCKABLE, hitType: HIT_TYPE.DIRTY_STUN, stunFrames: 50
          };
        } else if (this.stateTimer <= 26) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.ULTIMATE:
        if (this.stateTimer <= 18) {
          this.animFrame = Math.floor(this.stateTimer / 5);
        } else if (this.stateTimer <= 75) {
          this.animFrame = 4 + (this.stateTimer % 4 < 2 ? 0 : 1);
        } else {
          this.isInvincible = false;
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

  render(ctx) {
    // Flight Ground Shadow
    if (this.isFlying) {
      ctx.save();
      const altitude = 300 - this.y;
      const shadowW = Math.max(16, 45 - altitude * 0.15);
      const shadowAlpha = Math.max(0.12, 0.45 - altitude * 0.0018);
      ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(this.x + 40, 298, shadowW, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    super.render(ctx);

    // Draconic Flight Wings Energy
    if (this.isFlying && !this.isDead) {
      ctx.save();
      ctx.fillStyle = this.phase === 2 ? 'rgba(192, 132, 252, 0.65)' : 'rgba(239, 68, 68, 0.55)';
      const flapY = Math.sin(this.wingFlapAngle) * 10;
      // Left Wing
      ctx.beginPath();
      ctx.moveTo(this.x + 10, this.y - 45);
      ctx.lineTo(this.x - 35, this.y - 75 + flapY);
      ctx.lineTo(this.x - 10, this.y - 30);
      ctx.fill();
      // Right Wing
      ctx.beginPath();
      ctx.moveTo(this.x + 60, this.y - 45);
      ctx.lineTo(this.x + 105, this.y - 75 + flapY);
      ctx.lineTo(this.x + 80, this.y - 30);
      ctx.fill();
      ctx.restore();
    }

    // Render Flame Particles
    for (const p of this.phase2FlameParticles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Render Shockwaves & Meteors
    for (const sw of this.shockwaves) {
      if (!sw.active) continue;
      ctx.fillStyle = this.phase === 2 ? 'rgba(168, 85, 247, 0.75)' : 'rgba(239, 68, 68, 0.75)';
      const swY = sw.y !== undefined ? sw.y : 290;
      if (sw.isAerial) {
        // Meteor with blazing trail
        ctx.beginPath();
        ctx.arc(sw.x, swY, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(sw.x, swY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sw.x, swY, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Ground wave
        ctx.fillRect(sw.x - 15, 285, 30, 14);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(sw.x - 8, 288, 16, 7);
      }
    }

    // Render Void Lightning Bolts
    for (const lb of this.lightningBolts) {
      if (!lb.active) continue;
      ctx.save();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lb.x, 0);
      ctx.lineTo(lb.x - 8, 100);
      ctx.lineTo(lb.x + 10, 200);
      ctx.lineTo(lb.x, 300);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Dark Energy Dragon Aura
    if ((this.phase === 2 || this.isFlying) && !this.isDead) {
      ctx.globalAlpha = 0.18 + Math.sin(Date.now() * 0.004) * 0.09;
      ctx.fillStyle = this.phase === 2 ? '#7c3aed' : '#dc2626';
      ctx.beginPath();
      ctx.arc(this.x + 38, this.y - 45, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }
}
